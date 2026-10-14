"""Private ONNX candidates, measured selection, immutable choices, gated releases."""
from __future__ import annotations

import argparse
import inspect
from pathlib import Path
import shutil

import numpy as np
import onnx
import onnxruntime as ort
from onnxruntime.quantization import CalibrationDataReader, QuantFormat, QuantType, quantize_static
from PIL import Image, ImageOps
import torch

from ai.evaluate import classification_metrics, load_candidate
from ai.train import (Images, context, digest, file_hash, partition_rows, permission,
                      read_json, save_json)

MAX_BYTES = 15 * 1024 * 1024


def file_record(path: Path) -> dict:
    return {"path": path.name, "sha256": file_hash(path), "bytes": path.stat().st_size}


def _opset17(graph: onnx.ModelProto) -> onnx.ModelProto:
    if next(op.version for op in graph.opset_import if op.domain == "") == 17:
        return graph
    from onnxscript.optimizer import optimize
    # Modern torch lowers reductions at opset18. Fold axes before the ONNX converter.
    graph = onnx.version_converter.convert_version(optimize(graph), 17)
    for node in graph.graph.node:
        if node.op_type == "ReduceMean" and node.domain == "":
            for attribute in list(node.attribute):
                if attribute.name == "noop_with_empty_axes":
                    if attribute.i != 0:
                        raise ValueError("Cannot lower no-op empty-axis ReduceMean to opset17")
                    # The converter retains this opset18 default; opset17 always reduces.
                    node.attribute.remove(attribute)
    return graph


def export_onnx(model: torch.nn.Module, example: torch.Tensor, destination: Path) -> None:
    model.cpu().eval()
    version = tuple(int(part) for part in torch.__version__.split("+")[0].split(".")[:2])
    options = {"opset_version": 18 if version >= (2, 6) else 17, "input_names": ["image"], "output_names": ["logits"],
               "dynamo": version >= (2, 6)}
    if "external_data" in inspect.signature(torch.onnx.export).parameters:
        options["external_data"] = False
    torch.onnx.export(model, example, str(destination), **options)
    graph = _opset17(onnx.load(str(destination)))
    # Legacy exporters cannot emit an external-data argument; consolidate explicitly.
    onnx.save_model(graph, str(destination), save_as_external_data=False)
    onnx.checker.check_model(str(destination))
    if next((op.version for op in graph.opset_import if op.domain == ""), None) != 17:
        raise ValueError("Exporter did not honor the required ONNX opset17")
    if any(tensor.data_location == onnx.TensorProto.EXTERNAL for tensor in graph.graph.initializer):
        raise RuntimeError("ONNX graph must be a single self-contained model file")
    shape = [dimension.dim_value for dimension in graph.graph.input[0].type.tensor_type.shape.dim]
    if shape != list(example.shape):
        raise ValueError(f"Export input must be static {list(example.shape)}, got {shape}")
    if graph.graph.input[0].name != "image" or graph.graph.output[0].name != "logits":
        raise ValueError("Export tensor-name contract differs")


def onnx_predictions(path: Path, dataset: Images) -> np.ndarray:
    session = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
    results = []
    for image, _, _ in dataset:
        prediction = session.run(["logits"], {"image": image.numpy()[None]})[0]
        if prediction.ndim != 2 or prediction.shape[0] != 1:
            raise ValueError("ONNX output must be [1,C]")
        results.append(prediction[0])
    result = np.stack(results)
    if not np.isfinite(result).all():
        raise FloatingPointError("Nonfinite ONNX logits")
    return result


def parity(model: torch.nn.Module, path: Path, dataset: Images) -> tuple[dict, np.ndarray]:
    session = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
    errors, agree, predictions = [], [], []
    model.cpu().eval()
    with torch.inference_mode():
        for image, _, _ in dataset:
            tensor = image[None]
            expected = model(tensor).float().numpy()
            actual = session.run(["logits"], {"image": tensor.numpy()})[0]
            if actual.shape != expected.shape or not np.isfinite(actual).all():
                raise ValueError("ONNX shape/nonfinite parity failure")
            errors.append(float(np.max(np.abs(expected - actual))))
            agree.append(int(expected.argmax(1)[0] == actual.argmax(1)[0]))
            predictions.append(actual[0])
    report = {"max_absolute_logit_error": max(errors), "top1_agreement": float(np.mean(agree)),
              "samples": len(errors), "passed": max(errors) <= 1e-3 and np.mean(agree) >= 0.999}
    if not report["passed"]:
        raise RuntimeError(f"Real selection PyTorch/ONNX parity failed: {report}")
    return report, np.stack(predictions)


def stratified_training(rows: list[dict], limit: int = 500, seed: int = 42) -> list[dict]:
    rng = np.random.default_rng(seed)
    classes = sorted({row["class_id"] for row in rows})
    buckets = {class_id: [row for row in rows if row["class_id"] == class_id] for class_id in classes}
    for bucket in buckets.values():
        rng.shuffle(bucket)
    selected = []
    while len(selected) < min(limit, len(rows)):
        for class_id in classes:
            if buckets[class_id] and len(selected) < limit:
                selected.append(buckets[class_id].pop())
    return selected


class ActivationReader(CalibrationDataReader):
    def __init__(self, dataset: Images) -> None:
        self.dataset, self.index = dataset, 0

    def get_next(self) -> dict | None:
        if self.index >= len(self.dataset):
            return None
        image, _, _ = self.dataset[self.index]
        self.index += 1
        return {"image": image.numpy()[None]}


def quantization_quality(reference: np.ndarray, actual: np.ndarray, labels: np.ndarray) -> dict:
    base = classification_metrics(reference, labels, reference.shape[1])
    candidate = classification_metrics(actual, labels, actual.shape[1])
    f1_drop = base["macro_f1"] - candidate["macro_f1"]
    recall_drop = max(a["recall"] - b["recall"] for a, b in zip(base["per_class"], candidate["per_class"]))
    return {"macro_f1_drop": f1_drop, "worst_class_recall_drop": recall_drop,
            "eligible": f1_drop <= 0.005 and recall_drop <= 0.02}


def quantize_candidate(source: Path, destination: Path, ctx: dict, selection: Images,
                       reference: np.ndarray, train_rows: list[dict]) -> dict:
    selected = stratified_training(train_rows)
    reader = ActivationReader(Images(selected, ctx["data_root"], ctx["size"]))
    quantize_static(str(source), str(destination), reader, quant_format=QuantFormat.QDQ,
                    activation_type=QuantType.QInt8, weight_type=QuantType.QInt8,
                    per_channel=True, op_types_to_quantize=["Conv", "Gemm", "MatMul"],
                    extra_options={"ActivationSymmetric": True, "WeightSymmetric": True})
    onnx.checker.check_model(str(destination))
    actual = onnx_predictions(destination, selection)
    labels = np.array([row["class_id"] for row in selection.rows])
    base = classification_metrics(reference, labels, len(ctx["labels"]))
    quantized = classification_metrics(actual, labels, len(ctx["labels"]))
    f1_drop = base["macro_f1"] - quantized["macro_f1"]
    recall_drop = max(a["recall"] - b["recall"] for a, b in zip(base["per_class"], quantized["per_class"]))
    domains = {}
    for name in ("source", "canvas"):
        indices = [i for i, row in enumerate(selection.rows) if (row.get("source") == "canvas") == (name == "canvas")]
        if indices:
            domains[name] = quantization_quality(reference[indices], actual[indices], labels[indices])
    return {"precision": "int8-qdq-s8s8-per-channel", "activation_partition": "training-only",
            "activation_support": len(selected), "activation_sample_ids_hash": digest([r["sample_id"] for r in selected]),
            "selection": quantized, "macro_f1_drop": f1_drop, "worst_class_recall_drop": recall_drop,
            "quality_eligible": all(domain["eligible"] for domain in domains.values()), "domains": domains,
            "browser_required": True, "release_eligible": False,
            "reference_sha256": file_hash(source), "reference_bytes": source.stat().st_size}


def candidate_paths(args: argparse.Namespace) -> list[Path]:
    explicit = getattr(args, "candidate", None) or getattr(args, "checkpoint", None)
    if explicit:
        return [Path(explicit)]
    root = Path(args.runs)
    if (root / "best.pt").exists() or (root / "ensemble.json").exists():
        return [root]
    paths = []
    for manifest_path in sorted(root.rglob("manifest.json")):
        if not (manifest_path.parent / "best.pt").exists():
            continue
        manifest = read_json(manifest_path)
        if manifest.get("identity", {}).get("script") == args.script and manifest.get("status") == "complete":
            paths.append(manifest_path.parent)
    paths.extend(path.parent for path in sorted(root.rglob("ensemble.json")) if read_json(path)["script"] == args.script)
    if not paths:
        raise ValueError("No completed real checkpoints or ensemble experiment found")
    return paths


def candidate_context(ctx: dict, path: Path) -> dict:
    updated = dict(ctx)
    checkpoint = path / "best.pt" if path.is_dir() else path
    if checkpoint.suffix == ".pt":
        from ai.train import load_checkpoint
        size = load_checkpoint(checkpoint)["identity"]["size"]
        if size != ctx["size"]:
            from ai.preprocess import preprocessing_contract
            updated["size"] = size
            updated["preprocessing"] = preprocessing_contract(size)
            updated["hashes"] = dict(ctx["hashes"], preprocessing_hash=digest(updated["preprocessing"]))
    return updated


def package_metadata(out: Path, ctx: dict, model_path: Path, candidate: dict, calibration: dict,
                     precision: str, report: dict) -> dict:
    labels_path = Path(ctx["config"].get("labels_path", "ai/configs/labels.json"))
    save_json(out / "labels.json", read_json(labels_path))
    save_json(out / "preprocessing.json", ctx["preprocessing"])
    save_json(out / "calibration.json", calibration)
    manifest = {"script": ctx["script"], "num_classes": len(ctx["labels"]), "input_size": ctx["size"],
                "input_name": "image", "output_name": "logits", "layout": "NCHW", "precision": precision,
                "label_hash": ctx["hashes"]["label_hash"], "preprocessing_hash": ctx["hashes"]["preprocessing_hash"],
                "hashes": ctx["hashes"], "candidate": candidate, "candidate_hash": digest(candidate),
                "calibration_folded": True, "status": "private-candidate", "report": report,
                "files": {"model": file_record(model_path), "labels": file_record(out / "labels.json"),
                          "preprocessing": file_record(out / "preprocessing.json"), "calibration": file_record(out / "calibration.json")}}
    if ctx["script"] == "combined":
        save_json(out / "class-space.json", ctx["class_space"])
        manifest["files"]["class_space"] = file_record(out / "class-space.json")
    save_json(out / "manifest.json", manifest)
    return manifest


def write_fixture(out: Path, dataset: Images, logits: np.ndarray, ctx: dict) -> None:
    index = next((i for i, row in enumerate(dataset.rows) if row.get("source") == "canvas"), 0)
    row = dataset.rows[index]
    image_path = out / "selection-fixture.png"
    with Image.open(ctx["data_root"] / row["path"]) as image:
        ImageOps.exif_transpose(image).convert("RGBA").save(image_path)
    fixture = {"script": ctx["script"], "partition": "selection", "sample_id": row["sample_id"],
               "kind": "real-canvas" if row.get("source") == "canvas" else "real-source",
               "image": image_path.name, "image_sha256": file_hash(image_path), "logits": logits[index].tolist()}
    save_json(out / "fixture.json", fixture)


def selection_data(ctx: dict) -> tuple[list[dict], list[dict], Images]:
    heldout = [r for r in ctx["samples"] if r["partition"] == "selection"]
    source = [r for r in heldout if r.get("source") != "canvas"]
    canvas = [r for r in heldout if r.get("source") == "canvas"]
    if not heldout:
        raise ValueError("No real selection data for export")
    return source, canvas, Images(source + canvas, ctx["data_root"], ctx["size"])


def resolution_evidence(args: argparse.Namespace, candidate: dict, current_path: Path) -> dict:
    if candidate["size"] == 128:
        return {"eligible": True, "resolution": 128}
    baseline = getattr(args, "ablation_baseline", None)
    if not baseline:
        return {"eligible": False, "reason": "224 requires the matching128 seed42 ablation baseline"}
    from ai.ensemble import resolution_eligible
    from ai.train import load_checkpoint
    checkpoint_path = Path(baseline)
    base = load_checkpoint(checkpoint_path / "best.pt" if checkpoint_path.is_dir() else checkpoint_path)
    current = load_checkpoint(current_path / "best.pt" if current_path.is_dir() else current_path)
    for key in ("dataset_hash", "split_hash", "label_hash"):
        if base["identity"]["hashes"][key] != current["identity"]["hashes"][key]:
            raise ValueError(f"Resolution ablation {key} mismatch")
    eligible = resolution_eligible(base, current)
    return {"eligible": eligible, "macro_f1_gain": current["best"]["macro_f1"] - base["best"]["macro_f1"],
            "baseline_sha256": file_hash(checkpoint_path / "best.pt" if checkpoint_path.is_dir() else checkpoint_path)}


def export_one(args: argparse.Namespace, ctx: dict, path: Path, out: Path, calibrated: bool = False) -> dict:
    if calibrated and path.is_dir() and (path / "manifest.json").is_file() and "files" in read_json(path / "manifest.json"):
        return calibrate_package(args, ctx, path, out)
    ctx = candidate_context(ctx, path)
    model, candidate = load_candidate(path, ctx)
    if candidate.get("smoke"):
        raise ValueError("Smoke checkpoints cannot enter deployment comparisons")
    calibration = {"temperature": 1.0, "accept_threshold": None, "candidate_hash": digest(candidate), "status": "raw-comparator"}
    if calibrated:
        raise ValueError("Calibrated export must consume the actual selected raw ONNX package")
    out.mkdir(parents=True, exist_ok=True)
    source_rows, canvas_rows, selection = selection_data(ctx)
    model_path = out / f"{ctx['script']}-classifier.onnx"
    image, _, _ = selection[0]
    export_onnx(model, image[None], model_path)
    parity_report, logits = parity(model, model_path, selection)
    source_labels = np.array([r["class_id"] for r in source_rows])
    report = {"parity": parity_report,
              "source_selection": classification_metrics(logits[:len(source_rows)], source_labels, len(ctx["labels"])) if source_rows else None,
              "canvas_selection": None, "browser_required": True, "calibrated": calibrated}
    report["resolution_ablation"] = resolution_evidence(args, candidate, path)
    if canvas_rows:
        report["canvas_selection"] = classification_metrics(logits[len(source_rows):], np.array([r["class_id"] for r in canvas_rows]), len(ctx["labels"]))
        report["canvas_selection_writers"] = sorted({r["writer_id"] for r in canvas_rows})
    manifest = package_metadata(out, ctx, model_path, candidate, calibration, "fp32", report)
    write_fixture(out, selection, logits, ctx)
    if candidate["model"] in ("cnn", "mobile", "efficient", "mobile-scratch"):
        train_rows = partition_rows(ctx, "train")
        if candidate.get("stage") in ("canvas", "distill"):
            train_rows += [r for r in ctx["samples"] if r.get("source") == "canvas" and r["partition"] == "train"]
        train_rows = list({r["sample_id"]: r for r in train_rows}.values())
        permission(ctx, ctx["script"], "training", train_rows)
        qout = out / "int8"
        qout.mkdir(exist_ok=True)
        quantized_path = qout / model_path.name
        try:
            qreport = quantize_candidate(model_path, quantized_path, ctx, selection, logits, train_rows)
            qlogits = onnx_predictions(quantized_path, selection)
            qreport["source_selection"] = classification_metrics(qlogits[:len(source_rows)], source_labels, len(ctx["labels"])) if source_rows else None
            qreport["canvas_selection"] = classification_metrics(qlogits[len(source_rows):], np.array([r["class_id"] for r in canvas_rows]), len(ctx["labels"])) if canvas_rows else None
            qreport["canvas_selection_writers"] = sorted({r["writer_id"] for r in canvas_rows}) if canvas_rows else []
            qreport["calibrated"] = calibrated
            qreport["resolution_ablation"] = report["resolution_ablation"]
            qreport["parity"] = {"passed": True, "kind": "quantized-quality-not-fp32-numerical-parity"}
            package_metadata(qout, ctx, quantized_path, candidate, calibration, "int8", qreport)
            write_fixture(qout, selection, qlogits, ctx)
            manifest["quantization"] = {"status": "candidate", "manifest": str(qout / "manifest.json"), "quality_eligible": qreport["quality_eligible"]}
        except (RuntimeError, ValueError, NotImplementedError, ort.capi.onnxruntime_pybind11_state.Fail, ort.capi.onnxruntime_pybind11_state.InvalidGraph) as error:
            manifest["quantization"] = {"status": "unsupported-or-failed", "reason": f"{type(error).__name__}: {error}", "fp32_preserved": True}
            save_json(qout / "failure.json", manifest["quantization"])
    save_json(out / "manifest.json", manifest)
    return manifest


def fold_temperature(source: Path, destination: Path, temperature: float) -> None:
    if not np.isfinite(temperature) or temperature <= 0:
        raise ValueError("Temperature must be finite and positive")
    graph = onnx.load(str(source))
    original = graph.graph.output[0].name
    intermediate = "aksantara_uncalibrated_logits"
    for node in graph.graph.node:
        for index, name in enumerate(node.output):
            if name == original:
                node.output[index] = intermediate
    scalar = onnx.numpy_helper.from_array(np.array(temperature, dtype=np.float32), "aksantara_temperature")
    graph.graph.initializer.append(scalar)
    graph.graph.node.append(onnx.helper.make_node("Div", [intermediate, scalar.name], [original]))
    onnx.checker.check_model(graph)
    onnx.save_model(graph, str(destination), save_as_external_data=False)


def calibrate_package(args: argparse.Namespace, ctx: dict, path: Path, out: Path,
                      calibration: dict | None = None) -> dict:
    raw = validate_package(path)
    if raw["report"].get("calibrated"):
        raise ValueError("Selected model is already calibrated")
    if raw["hashes"] != ctx["hashes"] or raw["script"] != ctx["script"]:
        raise ValueError("Calibration export context differs from selected package")
    reference_mode = calibration is not None
    calibration = calibration or read_json(Path(args.calibration))
    if calibration.get("candidate_hash") != raw["candidate_hash"] or calibration.get("hashes") != ctx["hashes"]:
        raise ValueError("Calibration belongs to a different frozen candidate/data contract")
    if not reference_mode and calibration.get("input_model_sha256") != raw["files"]["model"]["sha256"]:
        raise ValueError("Fit temperature on the actual selected raw ONNX precision graph first")
    if out.resolve() == path.resolve():
        raise ValueError("Calibrated output must not overwrite raw comparator evidence")
    out.mkdir(parents=True, exist_ok=True)
    source = path / raw["files"]["model"]["path"]
    destination = out / source.name
    fold_temperature(source, destination, float(calibration["temperature"]))
    source_rows, canvas_rows, selection = selection_data(ctx)
    expected = onnx_predictions(source, selection) / float(calibration["temperature"])
    actual = onnx_predictions(destination, selection)
    error = float(np.max(np.abs(expected - actual)))
    agreement = float((expected.argmax(1) == actual.argmax(1)).mean())
    if error > 1e-4 or agreement < 0.999:
        raise RuntimeError("Temperature-folded graph fails real ONNX parity")
    report = dict(raw["report"], calibrated=True, raw_model_sha256=raw["files"]["model"]["sha256"],
                  calibration_parity={"max_absolute_logit_error": error, "top1_agreement": agreement, "passed": True})
    labels = np.array([r["class_id"] for r in selection.rows])
    report["source_selection"] = classification_metrics(actual[:len(source_rows)], labels[:len(source_rows)], len(ctx["labels"])) if source_rows else None
    report["canvas_selection"] = classification_metrics(actual[len(source_rows):], labels[len(source_rows):], len(ctx["labels"])) if canvas_rows else None
    if raw["precision"] != "fp32":
        reference = calibrate_package(args, ctx, path.parent, out / "fp32-reference", calibration)
        report["reference_sha256"] = reference["files"]["model"]["sha256"]
        report["reference_bytes"] = reference["files"]["model"]["bytes"]
    manifest = package_metadata(out, ctx, destination, raw["candidate"], calibration, raw["precision"], report)
    write_fixture(out, selection, actual, ctx)
    return manifest


def validate_package(path: Path) -> dict:
    manifest = read_json(path / "manifest.json")
    for name, record in manifest["files"].items():
        asset = path / record["path"]
        if asset.resolve().parent != path.resolve() or file_hash(asset) != record["sha256"]:
            raise ValueError(f"Candidate {name} asset hash/path mismatch")
    if digest(read_json(path / manifest["files"]["labels"]["path"])) != manifest["label_hash"]:
        raise ValueError("Bundle label semantic hash mismatch")
    if digest(read_json(path / manifest["files"]["preprocessing"]["path"])) != manifest["preprocessing_hash"]:
        raise ValueError("Bundle preprocessing semantic hash mismatch")
    return manifest


def finite_measurement(value: object, name: str) -> float:
    measured = float(value)
    if not np.isfinite(measured) or measured < 0:
        raise ValueError(f"Invalid actual measurement: {name}")
    return measured


def browser_gate(manifest: dict, benchmark: dict, require_offline: bool = True) -> None:
    for key, expected in (("model_sha256", manifest["files"]["model"]["sha256"]),
                          ("label_hash", manifest["label_hash"]), ("preprocessing_hash", manifest["preprocessing_hash"]),
                          ("runtime_version", "1.22.0")):
        if benchmark.get(key) != expected:
            raise ValueError(f"Browser evidence {key} mismatch/missing")
    if benchmark.get("warmups", 0) < 20 or benchmark.get("runs", 0) < 200 or not benchmark.get("environment"):
        raise ValueError("Browser evidence requires20 warmups/200 runs and actual environment")
    if benchmark.get("execution_provider") != "wasm" or benchmark.get("num_threads") != 1:
        raise ValueError("Release baseline must use real WASM CPU numThreads1")
    browser_parity = benchmark.get("browser_logit_parity", {})
    if browser_parity.get("status") != "passed" or browser_parity.get("top1_agreement") is not True:
        raise ValueError("Actual browser logits parity evidence is missing")
    if finite_measurement(browser_parity["max_absolute_error"], "browser parity error") > 1e-4:
        raise ValueError("Browser logits differ from actual Python ONNX logits")
    if manifest["input_size"] == 224 and not manifest["report"].get("resolution_ablation", {}).get("eligible"):
        raise ValueError("224 resolution did not establish the planned>=0.005 ablation gain")
    if finite_measurement(benchmark["end_to_end"]["p95_ms"], "browser p95") >= 50 or manifest["files"]["model"]["bytes"] > MAX_BYTES:
        raise ValueError("Candidate fails measured p95<50ms or <=15MiB gate")
    if require_offline and benchmark.get("offline_verified") is not True:
        raise ValueError("Successful offline inference evidence is missing")
    if not manifest["report"]["parity"]["passed"]:
        raise ValueError("Candidate has no passed real Python export parity")
    if manifest["precision"] != "fp32":
        if not manifest["report"]["quality_eligible"]:
            raise ValueError("INT8 selection quality regression exceeds planned gate")
        reference = benchmark.get("fp32_reference", {})
        if reference.get("model_sha256") != manifest["report"]["reference_sha256"]:
            raise ValueError("INT8 needs measured matching FP32 reference")
        if finite_measurement(benchmark["end_to_end"]["p95_ms"], "INT8 p95") >= finite_measurement(reference["end_to_end"]["p95_ms"], "FP32 p95") or manifest["files"]["model"]["bytes"] >= reference["bytes"]:
            raise ValueError("INT8 must improve both real browser latency and model bytes")


def select_release(candidates: list[tuple[Path, dict, dict]]) -> tuple[Path, dict, dict]:
    eligible = []
    for path, manifest, benchmark in candidates:
        try:
            browser_gate(manifest, benchmark)
        except (ValueError, KeyError):
            continue
        canvas = manifest["report"].get("canvas_selection")
        if canvas and not canvas["missing_classes"]:
            eligible.append((path, manifest, benchmark))
    if not eligible:
        raise ValueError("No canvas-selection candidate meets measured browser/size/coverage gates; source-only results are provisional")
    highest = max(item[1]["report"]["canvas_selection"]["macro_f1"] for item in eligible)
    tied = [item for item in eligible if highest - item[1]["report"]["canvas_selection"]["macro_f1"] <= 0.002]
    return min(tied, key=lambda item: (item[2]["end_to_end"]["p95_ms"], item[1]["files"]["model"]["bytes"]))


def freeze_choice(args: argparse.Namespace, ctx: dict) -> dict:
    path = Path(getattr(args, "candidate", None) or args.runs)
    manifest = validate_package(path)
    calibration = read_json(path / manifest["files"]["calibration"]["path"])
    if not manifest["report"].get("calibrated") or calibration.get("status") == "raw-comparator":
        raise ValueError("Fit calibration and re-export/rebenchmark before freeze")
    benchmark = read_json(Path(args.benchmark))
    browser_gate(manifest, benchmark)
    evidence_path = getattr(args, "preprocess_evidence", None)
    if not evidence_path:
        raise ValueError("Freeze requires actual Python/JS preprocessing parity evidence")
    preprocess_evidence = read_json(Path(evidence_path))
    if preprocess_evidence.get("preprocessing_hash") != manifest["preprocessing_hash"] or preprocess_evidence.get("status") != "passed":
        raise ValueError("Preprocessing parity evidence differs from selected contract")
    if finite_measurement(preprocess_evidence["max_absolute_tensor_difference"], "preprocessing parity error") > 1e-5:
        raise ValueError("Preprocessing Python/JS tensor parity fails")
    if not manifest["report"].get("canvas_selection") or manifest["report"]["canvas_selection"]["missing_classes"]:
        raise ValueError("Canvas-selection coverage is required before release choice freeze")
    if manifest["hashes"] != ctx["hashes"]:
        raise ValueError("Freeze context hashes differ from package")
    freeze_path = Path(args.freeze) if getattr(args, "freeze", None) else Path(args.out) / "freeze.json"
    choice = {"candidate_hash": manifest["candidate_hash"], "calibration_hash": digest(calibration),
              "hashes": manifest["hashes"], "precision": manifest["precision"],
              "model_sha256": manifest["files"]["model"]["sha256"], "package": str(path.resolve()),
              "benchmark_hash": digest(benchmark), "architecture": manifest["candidate"],
              "temperature": calibration["temperature"], "accept_threshold": calibration["accept_threshold"],
              "preprocessing_evidence": preprocess_evidence}
    frozen = {"choice": choice, "choice_hash": digest(choice)}
    if freeze_path.exists():
        if read_json(freeze_path) != frozen:
            raise ValueError("Choice is already frozen; cannot retune after test access")
    else:
        save_json(freeze_path, frozen)
    return frozen


def publish(args: argparse.Namespace, ctx: dict) -> dict:
    if not getattr(args, "freeze", None):
        raise ValueError("Publication requires a frozen choice")
    frozen = read_json(Path(args.freeze))
    if frozen["choice_hash"] != digest(frozen["choice"]):
        raise ValueError("Freeze hash invalid")
    path = Path(frozen["choice"]["package"])
    manifest = validate_package(path)
    if manifest["script"] != ctx["script"] or manifest["hashes"] != ctx["hashes"]:
        raise ValueError("Release script/data/config hash mismatch")
    permission(ctx, ctx["script"], "release", ctx["samples"])
    if any(row["mapping_status"] != "verified" or not row.get("unicode_sequence") or not row.get("mapping_source") for row in ctx["labels"]):
        raise PermissionError("Public glyph mappings require authoritative curator evidence for every frozen class")
    benchmark = read_json(Path(args.benchmark))
    if digest(benchmark) != frozen["choice"]["benchmark_hash"]:
        raise ValueError("Release browser evidence differs from frozen choice")
    browser_gate(manifest, benchmark)
    if manifest["files"]["model"]["sha256"] != frozen["choice"]["model_sha256"]:
        raise ValueError("Frozen model changed")
    calibration = read_json(path / manifest["files"]["calibration"]["path"])
    if digest(calibration) != frozen["choice"]["calibration_hash"]:
        raise ValueError("Frozen calibration changed")
    evaluation_paths = [Path(p) for p in (getattr(args, "evaluations", None) or [])]
    evaluations = [read_json(path) for path in evaluation_paths]
    reports = {report["partition"]: report for report in evaluations}
    required = {"canvas-test"}
    if any(row.get("source") != "canvas" for row in ctx["samples"]):
        required.add("test")
    if not required.issubset(reports):
        raise ValueError(f"Release requires once-only heldout reports {sorted(required)}")
    ledger = read_json(Path(args.freeze).parent / "test-access.json")
    for partition in sorted(required):
        report = reports[partition]
        if report["candidate_hash"] != frozen["choice"]["candidate_hash"] or report["hashes"] != ctx["hashes"]:
            raise ValueError("Test report does not correspond to frozen candidate")
        if ledger.get(partition, {}).get("status") != "evaluated" or ledger[partition]["choice_hash"] != frozen["choice_hash"]:
            raise ValueError("Test report lacks once-only frozen access evidence")
        matching = next(path for path, value in zip(evaluation_paths, evaluations) if value["partition"] == partition)
        if file_hash(matching) != ledger[partition]["evaluation_sha256"] or report.get("model_sha256") != frozen["choice"]["model_sha256"]:
            raise ValueError("Frozen test report was changed or evaluated another ONNX graph")
        if report["metrics"]["missing_classes"]:
            raise ValueError("Final test class coverage incomplete")
    if not reports["canvas-test"]["quality_target_met"]:
        raise ValueError("Real-canvas test quality/writer-independence target not met; report gap, do not release-ready claim")
    canvas = [r for r in ctx["samples"] if r.get("source") == "canvas"]
    if len({r["writer_id"] for r in canvas}) < 10:
        raise ValueError("Release requires the planned10 independent consenting canvas writers")
    for partition, minimum in (("train", 4), ("selection", 2), ("calibration", 2), ("test", 2)):
        rows = [r for r in canvas if r["partition"] == partition]
        if len({r["writer_id"] for r in rows}) < minimum:
            raise ValueError(f"Canvas {partition} writer collection incomplete")
        for writer in {r["writer_id"] for r in rows}:
            counts = np.bincount([r["class_id"] for r in rows if r["writer_id"] == writer], minlength=len(ctx["labels"]))
            if counts.min() < 2:
                raise ValueError(f"Canvas writer {writer} lacks2 real examples per class")
    out = Path(args.out)
    if out.resolve() == path.resolve():
        raise ValueError("Release destination must differ from private candidate directory")
    out.mkdir(parents=True, exist_ok=True)
    for record in manifest["files"].values():
        shutil.copy2(path / record["path"], out / record["path"])
    save_json(out / "evaluation.json", reports)
    released = dict(manifest, status="release-ready", benchmark=benchmark, freeze=frozen, evaluation_sha256=file_hash(out / "evaluation.json"))
    save_json(out / "manifest.json", released)
    return released


def run(args: argparse.Namespace) -> dict:
    ctx = context(args)
    ctx["script"] = args.script
    stage = getattr(args, "stage", "candidates")
    if getattr(args, "publish", False) or stage == "publish":
        permission(ctx, ctx["script"], "release", ctx["samples"])
        return publish(args, ctx)
    if stage == "freeze":
        return freeze_choice(args, ctx)
    if stage == "select":
        candidates = []
        for manifest_path in sorted(Path(args.runs).rglob("manifest.json")):
            if (manifest_path.parent / "benchmark.json").exists():
                manifest = validate_package(manifest_path.parent)
                if manifest["script"] == args.script:
                    candidates.append((manifest_path.parent, manifest, read_json(manifest_path.parent / "benchmark.json")))
        path, manifest, benchmark = select_release(candidates)
        result = {"package": str(path), "candidate": manifest["candidate"], "benchmark": benchmark, "status": "selected-before-calibration"}
        save_json(Path(args.out) / "selection.json", result)
        return result
    if stage not in ("candidates", "supervised", "calibrated"):
        raise ValueError("Export stage must be candidates|select|calibrated|freeze|publish")
    paths = candidate_paths(args)
    if stage == "calibrated" and len(paths) != 1:
        raise ValueError("Calibrated export requires exactly one selected candidate")
    results = []
    for path in paths:
        destination = Path(args.out) if len(paths) == 1 else Path(args.out) / digest(str(path.resolve()))[:16]
        results.append(export_one(args, ctx, path, destination, stage == "calibrated"))
    return {"script": args.script, "status": "private-candidates", "candidates": results}
