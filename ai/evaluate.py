"""Selection/calibration/test roles are separate; test requires an immutable choice."""
from __future__ import annotations

import argparse
import csv
import io
from pathlib import Path

import numpy as np
import torch
from scipy.optimize import minimize_scalar
from sklearn.metrics import confusion_matrix, f1_score

from ai.models import build_model
from ai.preprocess import preprocessing_contract
from ai.train import (Images, context, digest, file_hash, load_checkpoint, partition_rows,
                      permission, predict, read_json, save_json, validate_class_space)


def softmax(logits: np.ndarray) -> np.ndarray:
    shifted = np.asarray(logits, dtype=np.float64) - np.max(logits, axis=-1, keepdims=True)
    probabilities = np.exp(shifted)
    return probabilities / probabilities.sum(axis=-1, keepdims=True)


def calibration_metrics(probabilities: np.ndarray, labels: np.ndarray, bins: int = 15) -> dict:
    count, classes = probabilities.shape
    chosen = probabilities[np.arange(count), labels]
    predicted = probabilities.argmax(1)
    confidence = probabilities.max(1)
    correct = predicted == labels
    one_hot = np.eye(classes)[labels]
    reliability, ece = [], 0.0
    for index in range(bins):
        lower, upper = index / bins, (index + 1) / bins
        mask = (confidence >= lower) & ((confidence < upper) if index + 1 < bins else (confidence <= upper))
        support = int(mask.sum())
        accuracy = float(correct[mask].mean()) if support else None
        mean = float(confidence[mask].mean()) if support else None
        if support:
            ece += support / count * abs(accuracy - mean)
        reliability.append({"lower": lower, "upper": upper, "support": support, "accuracy": accuracy, "confidence": mean})
    return {"nll": float(-np.log(np.maximum(chosen, 1e-12)).mean()),
            "brier": float(np.square(probabilities - one_hot).sum(1).mean()), "ece15": ece,
            "reliability": reliability}


def prediction_metrics(labels: np.ndarray, predictions: np.ndarray, classes: int,
                       *, metric_class_ids: tuple[int, ...] | None = None) -> dict:
    labels, predictions = np.asarray(labels), np.asarray(predictions)
    if (classes <= 0 or labels.ndim != 1 or predictions.ndim != 1
            or predictions.shape != labels.shape or not labels.size
            or labels.dtype.kind not in "iu" or predictions.dtype.kind not in "iu"
            or np.any(labels < 0) or np.any(labels >= classes)
            or np.any(predictions < 0) or np.any(predictions >= classes)):
        raise ValueError("Invalid, empty or misaligned classification labels/predictions")
    selected = tuple(range(classes)) if metric_class_ids is None else metric_class_ids
    if (not selected or len(set(selected)) != len(selected)
            or any(type(index) is not int or not 0 <= index < classes for index in selected)):
        raise ValueError("Metric class IDs must be nonempty, unique and within the label space")
    if not np.isin(labels, selected).all():
        raise ValueError("True labels outside requested metric class IDs")
    matrix = confusion_matrix(labels, predictions, labels=np.arange(classes))
    support = matrix.sum(1)
    recall = np.divide(matrix.diagonal(), support, out=np.zeros(classes, dtype=float), where=support != 0)
    observed = recall[list(selected)][support[list(selected)] > 0]
    return {"macro_f1": float(f1_score(labels, predictions, labels=selected, average="macro", zero_division=0)),
            "balanced_accuracy": float(observed.mean()), "top1": float((labels == predictions).mean()),
            "min_recall": float(recall[list(selected)].min()), "support": len(labels),
            "confusion_matrix": matrix.tolist(),
            "missing_classes": [index for index in selected if support[index] == 0],
            "per_class": [{"class_id": index, "support": int(support[index]), "recall": float(recall[index])}
                          for index in selected]}


def classification_metrics(logits: np.ndarray, labels: np.ndarray, classes: int,
                           *, metric_class_ids: tuple[int, ...] | None = None) -> dict:
    logits = np.asarray(logits)
    labels = np.asarray(labels)
    if (logits.ndim != 2 or labels.ndim != 1 or logits.shape != (len(labels), classes)
            or not len(logits) or logits.dtype.kind not in "fi" or not np.isfinite(logits).all()):
        raise ValueError("Invalid/nonfinite real model logits")
    probabilities = softmax(logits)
    metrics = prediction_metrics(labels, probabilities.argmax(1), classes, metric_class_ids=metric_class_ids)
    metrics.update(calibration_metrics(probabilities, labels))
    metrics["loss"] = metrics["nll"]
    return metrics


def script_class_ids(class_space: dict) -> dict[str, tuple[int, ...]]:
    if (class_space.get("version") != "script-union-v1"
            or class_space.get("scripts") != ["lontara", "sunda", "bali"]
            or class_space.get("class_space_hash") != digest({k: v for k, v in class_space.items()
                                                               if k != "class_space_hash"})):
        raise ValueError("Invalid combined class space identity")
    labels = class_space["labels"]
    if len(labels) != 174 or [label["class_id"] for label in labels] != list(range(174)):
        raise ValueError("Combined labels must cover contiguous 174-class space")
    groups = {script: tuple(label["class_id"] for label in labels if label["script"] == script)
              for script in class_space["scripts"]}
    if [len(groups[script]) for script in class_space["scripts"]] != [114, 30, 30]:
        raise ValueError("Combined source class coverage mismatch")
    for script, ids in groups.items():
        if ([labels[index]["source_class_id"] for index in ids] != list(range(len(ids)))
                or any(labels[index]["namespaced_label"] != f"{script}:{labels[index]['source_label']}"
                       for index in ids)):
            raise ValueError("Combined source label mapping mismatch")
    return groups


def combined_prediction_metrics(labels: np.ndarray, predictions: np.ndarray, rows: list[dict],
                                class_space: dict) -> dict:
    groups = script_class_ids(class_space)
    scripts = class_space["scripts"]
    labels = np.asarray(labels)
    predictions = np.asarray(predictions)
    if labels.ndim != 1 or len(rows) != len(labels) or any(row["script"] not in groups for row in rows):
        raise ValueError("Combined sample metadata does not match prediction rows")
    if any(row["class_id"] != label or label not in groups[row["script"]]
           for row, label in zip(rows, labels)):
        raise ValueError("Combined sample labels do not match source class mapping")
    overall = prediction_metrics(labels, predictions, 174)
    per_script = {}
    for script in scripts:
        indices = [i for i, row in enumerate(rows) if row["script"] == script]
        if not indices:
            raise ValueError(f"Missing selection samples for {script}")
        per_script[script] = prediction_metrics(labels[indices], predictions[indices], 174,
                                                metric_class_ids=groups[script])
    owner = np.empty(174, dtype=np.int64)
    for index, script in enumerate(scripts):
        owner[list(groups[script])] = index
    cross = confusion_matrix(owner[labels], owner[predictions], labels=np.arange(3))
    errors = int(cross.sum() - cross.trace())
    return {"overall": overall, "per_script": per_script,
            "equal_script_mean_macro_f1": float(np.mean([per_script[s]["macro_f1"] for s in scripts])),
            "equal_script_mean_top1": float(np.mean([per_script[s]["top1"] for s in scripts])),
            "cross_script_confusion": cross.tolist(), "cross_script_error_count": errors,
            "cross_script_error_rate": errors / len(labels),
            "sample_counts": {script: per_script[script]["support"] for script in scripts},
            "class_counts": {script: len(groups[script]) for script in scripts}}


def combined_metrics(logits: np.ndarray, labels: np.ndarray, rows: list[dict], class_space: dict) -> dict:
    logits, labels = np.asarray(logits), np.asarray(labels)
    if (logits.ndim != 2 or labels.ndim != 1 or logits.shape != (len(labels), 174)
            or not len(logits) or logits.dtype.kind not in "fi" or not np.isfinite(logits).all()):
        raise ValueError("Combined metrics require finite, unmasked 174-class logits")
    result = combined_prediction_metrics(labels, logits.argmax(1), rows, class_space)
    result["overall"] = classification_metrics(logits, labels, 174)
    return result


def accept_threshold(probabilities: np.ndarray, labels: np.ndarray) -> dict:
    confidence = probabilities.max(1)
    correct = probabilities.argmax(1) == labels
    for threshold in np.unique(confidence):
        accepted = confidence >= threshold
        support = int(accepted.sum())
        precision = float(correct[accepted].mean())
        if support >= 30 and precision >= 0.95:
            return {"accept_threshold": float(threshold), "accepted": support, "empirical_precision": precision}
    return {"accept_threshold": None, "accepted": 0, "empirical_precision": None}


def fit_temperature(logits: np.ndarray, labels: np.ndarray) -> dict:
    def objective(log_temperature: float) -> float:
        probabilities = softmax(logits / np.exp(log_temperature))
        return float(-np.log(np.maximum(probabilities[np.arange(len(labels)), labels], 1e-12)).mean())
    optimized = minimize_scalar(objective, bounds=(-6, 6), method="bounded", options={"xatol": 1e-8})
    if not optimized.success:
        raise RuntimeError(f"Temperature optimization failed: {optimized.message}")
    temperature = float(np.exp(optimized.x))
    probabilities = softmax(logits / temperature)
    return {"temperature": temperature, **accept_threshold(probabilities, labels),
            "before": calibration_metrics(softmax(logits), labels),
            "after": calibration_metrics(probabilities, labels), "fit_support": len(labels),
            "limitations": "Empirical classification confidence; not OOD safety or writing quality."}


def bootstrap(logits: np.ndarray, labels: np.ndarray, rows: list[dict], repeats: int = 1000, seed: int = 42) -> dict:
    groups: dict[str, list[int]] = {}
    for index, row in enumerate(rows):
        # Verified writers take precedence; otherwise audited leakage groups.
        key = row.get("writer_id") or row["group_id"]
        groups.setdefault(key, []).append(index)
    keys = sorted(groups)
    rng = np.random.default_rng(seed)
    metrics = {"macro_f1": [], "balanced_accuracy": [], "top1": [], "min_recall": []}
    classes = logits.shape[1]
    predictions = logits.argmax(1)
    for _ in range(repeats):
        chosen = rng.integers(0, len(keys), len(keys))
        indices = np.concatenate([groups[keys[i]] for i in chosen])
        matrix = confusion_matrix(labels[indices], predictions[indices], labels=np.arange(classes))
        support = matrix.sum(1)
        recall = np.divide(matrix.diagonal(), support, out=np.zeros(classes, dtype=float), where=support != 0)
        metrics["macro_f1"].append(f1_score(labels[indices], predictions[indices], labels=np.arange(classes), average="macro", zero_division=0))
        metrics["balanced_accuracy"].append(float(recall[support > 0].mean()))
        metrics["top1"].append(float((labels[indices] == predictions[indices]).mean()))
        metrics["min_recall"].append(float(recall.min()))
    return {"repeats": repeats, "seed": seed, "groups": len(keys),
            "unit": "verified_writer" if all(r.get("writer_id") for r in rows) else "duplicate/ancestry-group or verified writer",
            "ci95": {key: np.quantile(values, [0.025, 0.975]).tolist() for key, values in metrics.items()},
            "missing_class_replicates": "Fixed frozen label space; absent class recall is zero."}


def slices(logits: np.ndarray, labels: np.ndarray, rows: list[dict]) -> dict:
    result = {}
    rows = [dict(row, native_resolution=f"{row.get('width')}x{row.get('height')}") for row in rows]
    for field in ("source", "provenance_group", "category", "device_id", "input_mode", "cohort", "native_resolution"):
        values = sorted({str(row.get(field)) for row in rows if row.get(field) is not None})
        for value in values:
            indices = [i for i, row in enumerate(rows) if str(row.get(field)) == value]
            result[f"{field}:{value}"] = classification_metrics(logits[indices], labels[indices], logits.shape[1])
    return result


def load_candidate(path: Path, ctx: dict) -> tuple[torch.nn.Module, dict]:
    if (path.is_dir() and (path / "ensemble.json").is_file()) or path.suffix == ".json":
        from ai.ensemble import load_teacher
        return load_teacher(path / "ensemble.json" if path.is_dir() else path, ctx)
    checkpoint_path = path / "best.pt" if path.is_dir() else path
    checkpoint = load_checkpoint(checkpoint_path)
    identity = checkpoint["identity"]
    for key in ("dataset_hash", "label_hash", "split_hash", "preprocessing_hash"):
        if identity["hashes"].get(key) != ctx["hashes"][key]:
            raise ValueError(f"Candidate {checkpoint_path} incompatible {key}")
    validate_class_space(ctx, identity)
    if ctx["script"] == "combined":
        script_class_ids(ctx["class_space"])
        if (ctx["labels"] != ctx["class_space"]["labels"]
                or ctx["hashes"]["class_space_hash"] != ctx["class_space"]["class_space_hash"]):
            raise ValueError("Candidate combined labels/hash disagree with class_space")
    if identity["script"] != ctx["script"] or identity["size"] != ctx["size"]:
        raise ValueError("Candidate script/input resolution mismatch")
    model = build_model(identity["model"], len(ctx["labels"]), pretrained=False)
    model.load_state_dict(checkpoint["model_state"])
    identity = dict(identity, checkpoint_sha256=file_hash(checkpoint_path))
    return model.eval(), identity


def select_pilot_loss(paths: list[Path], ctx: dict) -> str:
    """Choose from portable manifests using source selection only, never checkpoints or test."""
    if len(paths) != 2:
        raise ValueError("Exactly ordinary and weighted pilots required")
    pilots = [read_json(path / "manifest.json" if path.is_dir() else path) for path in paths]
    if any(pilot["config"]["training"] != ctx["config"]["training"] for pilot in pilots):
        raise ValueError("Loss pilots must use the current training recipe")
    expected_ids = {f"{partition}_ids_hash": digest([row["sample_id"] for row in partition_rows(ctx, partition)])
                    for partition in ("train", "selection")}
    for pilot in pilots:
        for field, expected in expected_ids.items():
            if pilot["identity"][field] != expected:
                raise ValueError(f"Loss pilot {field} mismatch with current source partition")
    if any(pilot["identity"]["size"] != 128 or pilot["identity"]["stage"] != "supervised"
           or pilot["identity"]["initialize_hash"] is not None for pilot in pilots):
        raise ValueError("Loss pilots must be supervised128 before screening without initialization")
    observed = {}
    for pilot in pilots:
        identity = pilot["identity"]
        if pilot["status"] != "complete" or identity["smoke"] or identity["model"] != "mobile" or identity["seed"] != 42:
            raise ValueError("Loss choice requires complete full mobile seed42 pilots")
        for key in ("dataset_hash", "split_hash", "label_hash", "preprocessing_hash"):
            expected = digest(preprocessing_contract(128)) if key == "preprocessing_hash" else ctx["hashes"][key]
            if identity["hashes"].get(key) != expected:
                raise ValueError(f"Loss pilot {key} mismatch")
        validate_class_space(ctx, identity)
        if ctx["script"] == "combined":
            script_class_ids(ctx["class_space"])
            if (ctx["labels"] != ctx["class_space"]["labels"]
                    or ctx["hashes"]["class_space_hash"] != ctx["class_space"]["class_space_hash"]):
                raise ValueError("Loss pilot combined labels/hash disagree with class_space")
        if identity["script"] != ctx["script"]:
            raise ValueError("Loss pilot script mismatch")
        best = pilot["best"]
        for field in ("macro_f1", "min_recall"):
            value = best[field]
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not np.isfinite(value) or not 0 <= value <= 1:
                raise ValueError(f"Loss pilot selection {field} must be finite and within [0, 1]")
        observed[identity["loss"]] = best
    if set(observed) != {"ordinary", "weighted"}:
        raise ValueError("Both loss treatments required")
    return max(observed, key=lambda loss: (observed[loss]["macro_f1"], observed[loss]["min_recall"], loss == "ordinary"))


def selection_artifact(run: Path, script: str, ctx: dict) -> dict:
    manifest = read_json(run / "manifest.json")
    metadata = read_json(run / "selection.json")
    identity = manifest["identity"]
    if (manifest["status"] != "complete" or identity.get("smoke") is not False
            or identity.get("script") != script or identity.get("model") != "mobile"
            or identity.get("seed") != 42 or identity.get("size") != 128
            or identity.get("stage") != "supervised" or identity.get("initialize_hash") is not None
            or identity.get("loss") not in ("ordinary", "weighted")):
        raise ValueError(f"{run} is not a complete full supervised mobile128 seed42 run")
    expected_hashes = dict(ctx["hashes"])
    if script != "combined":
        expected_hashes.pop("class_space_hash")
    if (identity.get("hashes") != expected_hashes or metadata.get("hashes") != expected_hashes
            or metadata.get("identity") != identity or manifest["config"] != ctx["config"]
            or manifest["preprocessing"] != preprocessing_contract(128)):
        raise ValueError(f"{run} recipe, source hashes or selection identity mismatch")
    if script == "combined" and metadata.get("class_space") != ctx["class_space"]:
        raise ValueError(f"{run} combined class_space mismatch")
    if script != "combined" and "class_space" in metadata:
        raise ValueError(f"{run} specialist selection cannot claim combined class space")
    expected_rows = [row for row in partition_rows(ctx, "selection") if script == "combined" or row["script"] == script]
    expected_train = [row for row in partition_rows(ctx, "train") if script == "combined" or row["script"] == script]
    if (identity.get("selection_ids_hash") != digest([row["sample_id"] for row in expected_rows])
            or identity.get("train_ids_hash") != digest([row["sample_id"] for row in expected_train])):
        raise ValueError(f"{run} frozen partition identity mismatch")
    if manifest.get("provenance") != permission(ctx, script, "training", expected_train):
        raise ValueError(f"{run} source training provenance mismatch")
    hashes = manifest.get("artifact_hashes", {})
    if not all(hashes.get(name) for name in ("best.pt", "selection.json", "selection.npz")):
        raise ValueError(f"{run} missing checkpoint or selection checksums")
    for name, checksum in hashes.items():
        if file_hash(run / name) != checksum:
            raise ValueError(f"{run} artifact checksum mismatch: {name}")
    checkpoint = load_checkpoint(run / "best.pt")
    if checkpoint.get("identity") != identity:
        raise ValueError(f"{run} best checkpoint identity mismatch")
    if (metadata.get("num_classes") != (174 if script == "combined" else len(script_class_ids(ctx["class_space"])[script]))
            or metadata.get("size") != 128):
        raise ValueError(f"{run} selection class width or size mismatch")
    with np.load(run / "selection.npz", allow_pickle=False) as stored:
        if set(stored.files) != {"logits", "labels", "sample_ids"}:
            raise ValueError(f"{run} selection arrays missing or unexpected")
        logits, labels, sample_ids = (stored[key].copy() for key in ("logits", "labels", "sample_ids"))
    if (labels.shape != (len(expected_rows),) or sample_ids.shape != (len(expected_rows),)
            or logits.shape != (len(expected_rows), metadata["num_classes"])
            or logits.dtype.kind not in "fi" or not np.isfinite(logits).all()
            or labels.dtype.kind not in "iu" or sample_ids.dtype.kind not in "US"
            or len(set(sample_ids.tolist())) != len(expected_rows)):
        raise ValueError(f"{run} invalid selection logits, IDs or labels")
    rows = metadata["rows"]
    if (len(rows) != len(expected_rows) or sample_ids.tolist() != [row["sample_id"] for row in rows]
            or set(sample_ids.tolist()) != {row["sample_id"] for row in expected_rows}):
        raise ValueError(f"{run} missing, duplicate or foreign selection samples")
    expected_by_id = {row["sample_id"]: row for row in expected_rows}
    for index, row in enumerate(rows):
        original = expected_by_id[row["sample_id"]]
        if script != "combined":
            original = {key: value for key, value in original.items() if key != "source_class_id"}
            original["class_id"] = expected_by_id[row["sample_id"]]["source_class_id"]
        if row != original or labels[index] != row["class_id"]:
            raise ValueError(f"{run} selection metadata/label mismatch: {row['sample_id']}")
    if script == "combined":
        script_class_ids(ctx["class_space"])
    best = manifest["best"]
    if (not isinstance(best.get("epoch"), int) or best["epoch"] < 1
            or best["epoch"] > manifest["epochs_completed"]
            or not any(entry.get("epoch") == best["epoch"] for entry in manifest["history"])):
        raise ValueError(f"{run} selected best epoch lacks training history")
    if checkpoint.get("epoch") != best["epoch"]:
        raise ValueError(f"{run} selected checkpoint epoch mismatch")
    observed = prediction_metrics(labels, logits.argmax(1), logits.shape[1])
    if any(not np.isclose(observed[key], best[key], atol=1e-12) for key in ("macro_f1", "min_recall", "top1")):
        raise ValueError(f"{run} selected checkpoint predictions disagree with manifest")
    return {"rows": rows, "logits": logits, "labels": labels, "ids": sample_ids.tolist(),
            "provenance": {"path": str(run.resolve()), "selected_loss": identity["loss"], "best_epoch": best["epoch"],
                           "checkpoint_sha256": hashes["best.pt"], "selection_sha256": hashes["selection.npz"],
                           "sample_count": len(rows), "class_count": logits.shape[1]}}


def compare_specialists(specialist_runs: dict[str, Path], combined_run: Path, combined_ctx: dict) -> dict:
    groups = script_class_ids(combined_ctx["class_space"])
    if combined_ctx["script"] != "combined" or combined_ctx["hashes"].get("class_space_hash") != combined_ctx["class_space"]["class_space_hash"]:
        raise ValueError("Comparison requires matching combined context and class_space_hash")
    if set(specialist_runs) != set(groups):
        raise ValueError("Comparison requires exactly three explicit specialists")
    combined = selection_artifact(combined_run, "combined", combined_ctx)
    runs = {script: selection_artifact(Path(specialist_runs[script]), script, combined_ctx) for script in groups}
    joined = {}
    for script, artifact in runs.items():
        for index, sample_id in enumerate(artifact["ids"]):
            joined[sample_id] = groups[script][int(artifact["logits"][index].argmax())]
    if set(joined) != set(combined["ids"]):
        raise ValueError("Specialists and combined do not cover identical selection sample IDs")
    predictions = np.array([joined[sample_id] for sample_id in combined["ids"]])
    specialist_metrics = combined_prediction_metrics(combined["labels"], predictions, combined["rows"],
                                                     combined_ctx["class_space"])
    return {"provisional": True, "partition": "selection", "hashes": combined_ctx["hashes"],
            "class_space": combined_ctx["class_space"],
            "specialists": {"routing": "script-known routing", "metrics": specialist_metrics,
                            "runs": {script: artifact["provenance"] for script, artifact in runs.items()}},
            "combined": {"routing": "script-unknown174",
                         "metrics": combined_metrics(combined["logits"], combined["labels"], combined["rows"],
                                                     combined_ctx["class_space"]),
                         "run": combined["provenance"]}}


def frozen_test_guard(out: Path, freeze_path: Path, partition: str, candidate: dict, calibration: dict, ctx: dict) -> dict:
    frozen = read_json(freeze_path)
    if frozen.get("choice_hash") != digest(frozen["choice"]):
        raise ValueError("Frozen choice hash is invalid")
    choice = frozen["choice"]
    if choice["candidate_hash"] != digest(candidate) or choice["calibration_hash"] != digest(calibration):
        raise ValueError("Test candidate/calibration differs from frozen deployment choice")
    if choice["hashes"] != ctx["hashes"]:
        raise ValueError("Test input hashes differ from frozen choice")
    package = read_json(Path(choice["package"]) / "manifest.json")
    if package["files"]["model"]["sha256"] != choice["model_sha256"]:
        raise ValueError("Frozen ONNX artifact differs from choice")
    ledger_path = freeze_path.parent / "test-access.json"
    ledger = read_json(ledger_path) if ledger_path.exists() else {}
    if partition in ledger:
        raise RuntimeError(f"{partition} was already opened; no repeated release-test evaluation")
    ledger[partition] = {"choice_hash": frozen["choice_hash"], "output": str(out.resolve()), "status": "opened"}
    save_json(ledger_path, ledger)
    return frozen


def unknown_prediction(session: object, path: Path, size: int, calibration: dict, folded: bool) -> dict:
    from PIL import Image
    from ai.preprocess import preprocess_image
    with Image.open(path) as image:
        prepared = preprocess_image(image, size)
    if prepared["status"] == "empty":
        return {"status": "empty", "inference_performed": False, "accepted": None}
    logits = session.run(["logits"], {"image": prepared["tensor"][None]})[0]
    if not np.isfinite(logits).all():
        raise FloatingPointError("Nonfinite unknown-input logits")
    probabilities = softmax(logits if folded else logits / float(calibration["temperature"]))[0]
    confidence = float(probabilities.max())
    threshold = calibration.get("accept_threshold")
    return {"status": "ok", "inference_performed": True, "predicted_class": int(probabilities.argmax()),
            "confidence": confidence, "accepted": confidence >= threshold if threshold is not None else None}


def unknown_diagnostics(args: argparse.Namespace, ctx: dict) -> dict:
    import onnxruntime as ort
    from ai.export import validate_package
    path = Path(getattr(args, "candidate", None) or args.runs)
    package = validate_package(path)
    if package["script"] != ctx["script"] or package["hashes"] != ctx["hashes"]:
        raise ValueError("Diagnostics package input contract mismatch")
    fixture_root = Path(args.fixtures)
    samples = read_json(fixture_root / "diagnostics.json")["samples"]
    if not samples or {row["kind"] for row in samples} != {"unknown-glyph", "scribble"}:
        raise ValueError("Real consented unknown glyph and scribble diagnostic samples are required")
    calibration = read_json(path / package["files"]["calibration"]["path"])
    session = ort.InferenceSession(str(path / package["files"]["model"]["path"]), providers=["CPUExecutionProvider"])
    records = []
    for row in samples:
        image_path = fixture_root / row["path"]
        if row.get("consent", {}).get("research") is not True or file_hash(image_path) != row.get("sha256"):
            raise ValueError(f"Diagnostic consent/checksum missing: {image_path}")
        record = unknown_prediction(session, image_path, ctx["size"], calibration, package["report"].get("calibrated", False))
        records.append(dict(record, sample_id=row["sample_id"], kind=row["kind"]))
    decisions = [row["accepted"] for row in records if row["accepted"] is not None]
    report = {"partition": "diagnostics", "model_sha256": package["files"]["model"]["sha256"], "records": records,
              "autoacceptance_rate_on_supplied_unknowns": float(np.mean(decisions)) if decisions else None,
              "limitations": "Diagnostics on supplied real unknowns only; no OOD or pedagogical safety guarantee."}
    save_json(Path(args.out) / "diagnostics.json", report)
    return report


def run(args: argparse.Namespace) -> dict:
    ctx = context(args)
    ctx["script"] = args.script
    out = Path(args.out)
    partition = args.partition
    if args.script == "combined" and partition not in ("selection", "calibration"):
        raise ValueError("Combined evaluation is limited to selection/calibration; release-test is frozen")
    if partition == "diagnostics":
        return unknown_diagnostics(args, ctx)
    if partition not in ("selection", "canvas-selection", "calibration", "canvas-calibration", "test", "canvas-test"):
        raise ValueError("Evaluation requires an explicit held-out role")
    if partition == "test" and all(row.get("source") == "canvas" for row in ctx["samples"]):
        raise ValueError("Own-handwriting-only data has no source test; evaluate canvas-test exactly once")
    if partition in ("selection", "calibration") and all(row.get("source") == "canvas" for row in ctx["samples"]):
        partition = f"canvas-{partition}"
    candidate_path = Path(getattr(args, "candidate", None) or getattr(args, "checkpoint", None) or args.runs)
    testing = partition in ("test", "canvas-test")
    if testing:
        if not getattr(args, "freeze", None):
            raise ValueError("Test requires an immutable pre-test deployment choice")
        candidate_path = Path(read_json(Path(args.freeze))["choice"]["package"])
    package_path = candidate_path / "manifest.json"
    package = read_json(package_path) if candidate_path.is_dir() and package_path.exists() else {}
    is_onnx = "files" in package and "model" in package["files"]
    model = None
    if is_onnx:
        from ai.export import validate_package
        package = validate_package(candidate_path)
        if package["script"] != args.script or package["hashes"] != ctx["hashes"]:
            raise ValueError("ONNX candidate input context differs")
        candidate = package["candidate"]
    else:
        model, candidate = load_candidate(candidate_path, ctx)
    calibration_path = getattr(args, "calibration", None)
    calibration = read_json(Path(calibration_path)) if calibration_path else (
        read_json(candidate_path / package["files"]["calibration"]["path"]) if is_onnx else {"temperature": 1.0, "accept_threshold": None})
    if testing:
        if not is_onnx or not package["report"].get("calibrated"):
            raise ValueError("Test must evaluate the actual calibrated frozen ONNX graph")
        frozen_test_guard(out, Path(args.freeze), partition, candidate, calibration, ctx)
    rows = partition_rows(ctx, partition)
    dataset = Images(rows, ctx["data_root"], ctx["size"])
    if is_onnx:
        from ai.export import onnx_predictions
        logits = onnx_predictions(candidate_path / package["files"]["model"]["path"], dataset)
        labels = np.array([row["class_id"] for row in rows])
        ids = [row["sample_id"] for row in rows]
    else:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logits, labels, ids = predict(model.to(device), dataset, device)
    report = {"partition": partition, "candidate": candidate, "candidate_hash": digest(candidate), "hashes": ctx["hashes"],
              "sample_ids_hash": digest(ids), "provisional": not partition.startswith("canvas-"),
              "writer_independent": all(row.get("writer_id") for row in rows)}
    if partition.endswith("calibration"):
        calibration = fit_temperature(logits, labels)
        if is_onnx and package["report"].get("calibrated"):
            raise ValueError("Calibration cannot be refitted on an already calibrated graph")
        calibration.update(candidate_hash=digest(candidate), hashes=ctx["hashes"], partition=partition, sample_ids_hash=digest(ids))
        if is_onnx:
            calibration["input_model_sha256"] = package["files"]["model"]["sha256"]
        save_json(out / "calibration.json", calibration)
    elif calibration_path and calibration.get("candidate_hash") != digest(candidate):
        raise ValueError("Calibration belongs to another candidate")
    folded = is_onnx and package["report"].get("calibrated")
    adjusted = logits if folded else logits / float(calibration["temperature"])
    report.update(metrics=classification_metrics(adjusted, labels, len(ctx["labels"])), calibration=calibration,
                  slices=slices(adjusted, labels, rows), bootstrap=bootstrap(adjusted, labels, rows))
    if args.script == "combined":
        report["class_space"] = ctx["class_space"]
        report["combined_metrics"] = combined_metrics(adjusted, labels, rows, ctx["class_space"])
    report["quality_target_met"] = (partition == "canvas-test" and report["metrics"]["macro_f1"] >= 0.95
                                    and report["metrics"]["min_recall"] >= 0.80 and report["writer_independent"])
    report["model_sha256"] = package["files"]["model"]["sha256"] if is_onnx else None
    save_json(out / "evaluation.json", report)
    np.savez_compressed(out / "predictions.npz", logits=logits, labels=labels, sample_ids=np.array(ids))
    prediction_metadata = {"rows": rows, "candidate": candidate, "hashes": ctx["hashes"]}
    if args.script == "combined":
        prediction_metadata["class_space"] = ctx["class_space"]
    save_json(out / "predictions.json", prediction_metadata)
    stream = io.StringIO()
    fields = ("class_id", "source_label", "support", "recall")
    if args.script == "combined":
        fields += ("script", "source_class_id", "namespaced_label")
    writer = csv.DictWriter(stream, fieldnames=fields)
    writer.writeheader()
    for row in report["metrics"]["per_class"]:
        label = ctx["labels"][row["class_id"]]
        writer.writerow(dict(row, **{key: label[key] for key in fields if key not in row}))
    (out / "per-class.csv").write_text(stream.getvalue(), encoding="utf-8")
    if partition in ("test", "canvas-test"):
        ledger_path = Path(args.freeze).parent / "test-access.json"
        ledger = read_json(ledger_path)
        ledger[partition]["status"] = "evaluated"
        ledger[partition]["evaluation_sha256"] = file_hash(out / "evaluation.json")
        save_json(ledger_path, ledger)
    return report
