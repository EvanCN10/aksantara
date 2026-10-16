"""Private FP32 specialists; class probabilities are not handwriting-quality scores."""
from __future__ import annotations

import hashlib
import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import numpy as np
import onnxruntime as ort
from pydantic import BaseModel, ConfigDict, Field, TypeAdapter

from ai.preprocess import preprocessing_contract

Script = Literal["sunda", "lontara", "bali"]
CLASS_COUNTS: dict[Script, int] = {"sunda": 30, "lontara": 114, "bali": 30}
MODEL_ROOT = Path(__file__).resolve().parent / "models"
INPUT_SIZE = 128
INPUT_NAME = "input"
OUTPUT_NAME = "logits"
LOGGER = logging.getLogger(__name__)
CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "shared" / "aksara-classifier.json"


def load_shared_config(path: Path = CONFIG_PATH) -> dict[str, object]:
    if not path.is_file():
        raise ModelUnavailable(f"Berkas pemetaan classifier tidak ditemukan: {path}")
    try:
        with path.open(encoding="utf-8") as source:
            data = json.load(source)
    except Exception as error:
        raise ModelUnavailable(f"Gagal membaca konfigurasi classifier: {error}") from error

    if not isinstance(data, dict):
        raise ModelUnavailable("Konfigurasi classifier harus berupa objek JSON.")

    threshold = data.get("acceptanceThreshold")
    if not isinstance(threshold, (int, float)) or not np.isfinite(threshold) or not (0.0 <= float(threshold) <= 1.0):
        raise ModelUnavailable("acceptanceThreshold harus berupa float berhingga antara 0 dan 1.")

    scripts = data.get("scripts")
    if not isinstance(scripts, dict) or set(scripts.keys()) != set(CLASS_COUNTS.keys()):
        raise ModelUnavailable("scripts dalam konfigurasi classifier harus mencakup lontara, sunda, dan bali.")

    for script_name, item in scripts.items():
        if not isinstance(item, dict) or "targets" not in item or "displayNames" not in item:
            raise ModelUnavailable(f"Konfigurasi script {script_name} harus memuat targets dan displayNames.")
        if not isinstance(item["targets"], dict) or not isinstance(item["displayNames"], dict):
            raise ModelUnavailable(f"targets dan displayNames untuk {script_name} harus berupa dict.")
        for k, v in item["targets"].items():
            if not isinstance(k, str) or not isinstance(v, str):
                raise ModelUnavailable(f"targets untuk {script_name} harus berupa string key dan value.")
        for k, v in item["displayNames"].items():
            if not isinstance(k, str) or not isinstance(v, str):
                raise ModelUnavailable(f"displayNames untuk {script_name} harus berupa string key dan value.")

    return data

class Manifest(BaseModel):
    model_config = ConfigDict(strict=True)

    schema_version: Literal[1]
    script: Script
    architecture: str = Field(min_length=1)
    format: Literal["fp32"]
    num_classes: int = Field(gt=0)
    input_name: Literal["input"]
    output_name: Literal["logits"]
    model_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    model_bytes: int = Field(gt=0)
    preprocessing: dict[str, object]
    labels_file: Literal["labels.json"]
    release_status: Literal["private-experiment"]
    probabilities_calibrated: Literal[False]
    unicode_mapping_verified: Literal[False]


class SourceLabel(BaseModel):
    model_config = ConfigDict(strict=True)

    class_id: int = Field(ge=0)
    source_label: str = Field(min_length=1)
    script: Script
    id: str = Field(min_length=1)
    mapping_status: Literal["unverified"]
    unicode_sequence: None


class Evaluation(BaseModel):
    model_config = ConfigDict(strict=True)

    script: Script
    num_classes: int = Field(gt=0)


class ModelUnavailable(RuntimeError):
    """Required assets or an ONNX execution contract are unavailable."""


def read_json(path: Path) -> object:
    with path.open(encoding="utf-8") as source:
        return json.load(source)


def validate_metadata(directory: Path, script: Script) -> tuple[Manifest, tuple[SourceLabel, ...]]:
    manifest = Manifest.model_validate(read_json(directory / "manifest.json"))
    labels = TypeAdapter(list[SourceLabel]).validate_python(read_json(directory / "labels.json"))
    evaluation = Evaluation.model_validate(read_json(directory / "evaluation.json"))
    if manifest.script != script or manifest.num_classes != CLASS_COUNTS[script]:
        raise ValueError("Manifest script/class count differs from specialist contract")
    if manifest.preprocessing != preprocessing_contract(INPUT_SIZE):
        raise ValueError("Manifest normalization/preprocessing contract differs from ai.preprocess")
    if evaluation.script != script or evaluation.num_classes != manifest.num_classes:
        raise ValueError("Evaluation script/class count differs from manifest")
    labels.sort(key=lambda label: label.class_id)
    if len(labels) != manifest.num_classes or [label.class_id for label in labels] != list(range(len(labels))):
        raise ValueError("Labels must cover every output class exactly once")
    if len({label.id for label in labels}) != len(labels) or any(label.script != script for label in labels):
        raise ValueError("Label IDs must be unique and belong to the requested script")
    return manifest, tuple(labels)


def validate_model_file(path: Path, manifest: Manifest) -> None:
    if path.stat().st_size != manifest.model_bytes:
        raise ValueError("Model byte count differs from manifest")
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    if digest.hexdigest() != manifest.model_sha256:
        raise ValueError("Model SHA256 differs from manifest")


def valid_batch_dimension(dimension: object) -> bool:
    return dimension is None or isinstance(dimension, str) or dimension == 1


def validate_session(session: ort.InferenceSession, class_count: int) -> None:
    inputs, outputs = session.get_inputs(), session.get_outputs()
    if len(inputs) != 1 or len(outputs) != 1:
        raise ValueError("Specialist must expose exactly one input and one output")
    source, result = inputs[0], outputs[0]
    if source.name != INPUT_NAME or source.type != "tensor(float)":
        raise ValueError("ONNX input must be FP32 'input'")
    if len(source.shape) != 4 or not valid_batch_dimension(source.shape[0]) or source.shape[1:] != [3, INPUT_SIZE, INPUT_SIZE]:
        raise ValueError("ONNX input must accept NCHW128 batch one")
    if result.name != OUTPUT_NAME or result.type != "tensor(float)":
        raise ValueError("ONNX output must be FP32 'logits'")
    if len(result.shape) != 2 or not valid_batch_dimension(result.shape[0]) or result.shape[1] != class_count:
        raise ValueError("ONNX output class count differs from labels")


def stable_softmax(logits: np.ndarray, class_count: int) -> np.ndarray:
    if logits.shape != (1, class_count) or logits.dtype != np.float32 or not np.isfinite(logits).all():
        raise ModelUnavailable("Model menghasilkan logits tidak valid.")
    values = logits[0].astype(np.float64)
    values -= values.max()
    np.exp(values, out=values)
    values /= values.sum()
    return values


@dataclass(frozen=True)
class Specialist:
    session: ort.InferenceSession
    manifest: Manifest
    labels: tuple[SourceLabel, ...]
    targets: dict[str, str]
    display_names: dict[str, str]
    target_indices: dict[str, int]

    def probabilities(self, tensor: np.ndarray) -> np.ndarray:
        try:
            logits = self.session.run([OUTPUT_NAME], {INPUT_NAME: tensor[None]})[0]
            return stable_softmax(logits, len(self.labels))
        except ModelUnavailable:
            raise
        except Exception as error:
            LOGGER.exception("Specialist ONNX inference failed")
            raise ModelUnavailable("Inferensi ONNX tidak tersedia.") from error

    def target_index(self, slug: str) -> int | None:
        return self.target_indices.get(slug)

def load_specialist(directory: Path, script: Script, config: dict[str, object] | None = None) -> Specialist:
    manifest, labels = validate_metadata(directory, script)
    model_path = directory / "model.onnx"
    validate_model_file(model_path, manifest)

    shared_config = load_shared_config() if config is None else config
    scripts_data = shared_config["scripts"]
    assert isinstance(scripts_data, dict)
    script_config = scripts_data[script]
    assert isinstance(script_config, dict)
    targets = dict(script_config["targets"])
    display_names = dict(script_config["displayNames"])

    source_to_class = {label.source_label: label.class_id for label in labels}
    target_indices: dict[str, int] = {}
    for slug, source_label in targets.items():
        if source_label not in source_to_class:
            raise ModelUnavailable(f"Target label '{source_label}' untuk slug '{slug}' tidak ditemukan pada labels model {script}.")
        target_indices[slug] = source_to_class[source_label]

    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
    options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    session = ort.InferenceSession(str(model_path), sess_options=options, providers=["CPUExecutionProvider"])
    validate_session(session, len(labels))
    specialist = Specialist(
        session=session,
        manifest=manifest,
        labels=labels,
        targets=targets,
        display_names=display_names,
        target_indices=target_indices,
    )
    # Warm once so health means the validated graph can actually execute.
    specialist.probabilities(np.zeros((3, INPUT_SIZE, INPUT_SIZE), dtype=np.float32))
    return specialist


class ModelRegistry:
    def __init__(self, root: Path = MODEL_ROOT):
        self.root = root
        self.models: dict[Script, Specialist] = {}
        self.errors: dict[Script, str] = {}

    def load(self) -> None:
        for script in CLASS_COUNTS:
            if script in self.models or script in self.errors:
                continue
            try:
                self.models[script] = load_specialist(self.root / script, script)
            except Exception:
                LOGGER.exception("Unable to load private specialist %s", script)
                self.errors[script] = f"Model {script} atau metadata wajib tidak tersedia/tidak valid."

    def get(self, script: Script) -> Specialist:
        if script not in self.models:
            raise ModelUnavailable(self.errors.get(script, f"Model {script} belum tersedia."))
        return self.models[script]

    def health(self) -> dict[str, object]:
        scripts: dict[str, object] = {}
        for script in CLASS_COUNTS:
            model = self.models.get(script)
            scripts[script] = (
                {"ready": True, "modelId": model.manifest.model_sha256, "classes": len(model.labels)}
                if model else {"ready": False, "error": self.errors.get(script, "Model belum dimuat.")}
            )
        return {"ready": len(self.models) == len(CLASS_COUNTS), "scripts": scripts}
