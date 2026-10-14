"""Reproducible, permission-gated image training with resumable epoch transactions."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import random
import time
from datetime import datetime, timezone

import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import torch
from torch import nn
from torch.nn import functional as F
from torch.utils.data import DataLoader, Dataset

from ai.models import PRETRAINED, build_model, freeze_backbone_statistics, parameter_groups
from ai.preprocess import canonical_gray, preprocess_image, preprocessing_contract


def digest(value: object) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def file_hash(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def read_json(path: Path) -> dict:
    if not path.is_file():
        raise FileNotFoundError(f"Required manifest missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False), encoding="utf-8")
    os.replace(temporary, path)


def save_checkpoint(path: Path, state: dict) -> None:
    temporary = path.with_suffix(".tmp")
    torch.save(state, temporary)
    os.replace(temporary, path)


def load_checkpoint(path: Path) -> dict:
    return torch.load(path, map_location="cpu", weights_only=False)


COMBINED_SCRIPTS = ("lontara", "sunda", "bali")
COMBINED_CLASS_COUNTS = (114, 30, 30)


def experiment_scripts(script: str) -> tuple[str, ...]:
    if script == "combined":
        return COMBINED_SCRIPTS
    if script in COMBINED_SCRIPTS:
        return (script,)
    raise ValueError(f"Unknown experiment script {script}")


def experiment_view(labels: dict, split_rows: list[dict], script: str) -> tuple[list[dict], list[dict]]:
    scripts = experiment_scripts(script)
    if script != "combined":
        return labels[script], [row for row in split_rows if row["script"] == script and row["status"] == "valid"]
    records, samples = [], []
    offsets = {}
    for source in scripts:
        if source not in labels or not labels[source]:
            raise ValueError(f"Combined label space missing {source}")
        source_records = labels[source]
        if [row.get("class_id") for row in source_records] != list(range(len(source_records))):
            raise ValueError(f"{source} label IDs must remain contiguous and frozen")
        offsets[source] = len(records)
        for row in source_records:
            records.append(dict(row, class_id=offsets[source] + row["class_id"],
                                script=source, source_class_id=row["class_id"],
                                namespaced_label=f"{source}:{row['source_label']}"))
    for row in split_rows:
        if row["status"] != "valid":
            continue
        source = row["script"]
        if source not in offsets:
            raise ValueError(f"Combined split contains unknown source {source}")
        source_id = row["class_id"]
        if (type(source_id) is not int or not 0 <= source_id < len(labels[source])
                or row["source_label"] != labels[source][source_id]["source_label"]):
            raise ValueError(f"Combined split class/label mismatch for {row['sample_id']}")
        samples.append(dict(row, source_class_id=source_id, class_id=offsets[source] + source_id))
    return records, samples


def validate_class_space(ctx: dict, identity: dict) -> None:
    if ctx["script"] == "combined":
        expected = ctx["hashes"]["class_space_hash"]
        if (identity.get("script") != "combined" or identity.get("hashes", {}).get("class_space_hash") != expected
                or ctx["class_space"].get("class_space_hash") != digest({key: value for key, value in ctx["class_space"].items()
                                                                            if key != "class_space_hash"})):
            raise ValueError("Combined class_space_hash mapping mismatch")
    elif identity.get("script") == "combined" or "class_space_hash" in identity.get("hashes", {}):
        raise ValueError("Specialist identity cannot use combined class space")


def context(args: argparse.Namespace) -> dict:
    scripts = experiment_scripts(args.script)
    config = read_json(Path(args.config))
    labels = read_json(Path(config.get("labels_path", "ai/configs/labels.json")))
    audit = read_json(Path(args.audit) / "manifest.json")
    splits = read_json(Path(args.splits) / "manifest.json")
    if splits.get("split_hash") != digest({k: v for k, v in splits.items() if k != "split_hash"}):
        raise ValueError("Immutable split hash is invalid")
    audited_samples = read_json(Path(args.audit) / "samples.json")["samples"]
    audit_payload = {"samples": audited_samples, "label_hash": audit["label_hash"], "version": audit["audit_version"]}
    if digest(audit_payload) != audit["dataset_hash"]:
        raise ValueError("Audited samples hash is invalid")
    for key in ("dataset_hash", "label_hash"):
        if audit.get(key) != splits.get(key) or not splits.get(key):
            raise ValueError(f"{key} mismatch between {args.audit} and {args.splits}")
    if digest(labels) != splits["label_hash"] or digest(audit["labels"]) != splits["label_hash"]:
        raise ValueError("Frozen label hash differs from configured/audited labels")
    audited_by_id = {row["sample_id"]: row for row in audited_samples}
    if len(audited_by_id) != len(audited_samples):
        raise ValueError("Duplicate audited sample IDs")
    split_ids = set()
    for row in splits["samples"]:
        sample_id = row["sample_id"]
        if sample_id in split_ids:
            raise ValueError(f"Duplicate split sample ID {sample_id}")
        split_ids.add(sample_id)
        original = audited_by_id.get(sample_id)
        if original != {k: v for k, v in row.items() if k != "partition"}:
            raise ValueError(f"Split sample differs from audited metadata: {sample_id}")
    for script in scripts:
        if script not in splits.get("ready_scripts", []):
            raise ValueError(f"{script} split is blocked: {splits.get('blocked_scripts', {}).get(script)}")
        if script not in labels or not labels[script]:
            raise ValueError(f"Missing frozen {script} labels")
        records = labels[script]
        if [row.get("class_id") for row in records] != list(range(len(records))):
            raise ValueError(f"{script} label IDs must remain contiguous and frozen")
    if args.script == "combined" and tuple(len(labels[script]) for script in scripts) != COMBINED_CLASS_COUNTS:
        raise ValueError("Combined classifier requires frozen 114/30/30 classes (174 total)")
    if args.script == "combined":
        expected_ids = {row["sample_id"] for row in audited_samples if row["status"] == "valid"}
        if split_ids != expected_ids:
            raise ValueError("Combined split does not cover every valid audited source sample")
    records, samples = experiment_view(labels, splits["samples"], args.script)
    validate_partitions(samples, len(records))
    size = int(getattr(args, "size", None) or config["preprocessing"]["size"])
    if size not in (128, 224):
        raise ValueError("Only planned 128/224 input resolutions are permitted")
    contract = preprocessing_contract(size)
    hashes = {key: splits[key] for key in ("dataset_hash", "label_hash", "split_hash")}
    hashes.update(config_hash=digest(config), preprocessing_hash=digest(contract))
    ctx = {"script": args.script, "config": config, "labels": records, "samples": samples, "hashes": hashes,
           "size": size, "preprocessing": contract, "data_root": Path(args.data_root)}
    if args.script == "combined":
        class_space = {"version": "script-union-v1", "scripts": list(scripts), "labels": records}
        class_space["class_space_hash"] = digest(class_space)
        ctx["class_space"] = class_space
        hashes["class_space_hash"] = class_space["class_space_hash"]
    return ctx


def validate_partitions(samples: list[dict], classes: int) -> None:
    if not samples:
        raise ValueError("No valid samples for requested script")
    groups: dict[str, str] = {}
    ids: set[str] = set()
    writers: dict[str, str] = {}
    for row in samples:
        if row["sample_id"] in ids:
            raise ValueError(f"Duplicate sample ID {row['sample_id']}")
        ids.add(row["sample_id"])
        if not 0 <= row["class_id"] < classes:
            raise ValueError("Split sample class ID outside frozen label space")
        partition = row["partition"].removeprefix("canvas-")
        if partition not in ("train", "selection", "calibration", "test"):
            raise ValueError(f"Unexpected partition {partition}")
        prior = groups.setdefault(row["group_id"], partition)
        if prior != partition:
            raise ValueError(f"Leakage group {row['group_id']} crosses partitions")
        if row.get("writer_id"):
            previous = writers.setdefault(row["writer_id"], partition)
            if previous != partition:
                raise ValueError(f"Verified writer {row['writer_id']} crosses partitions")
    for partition in ("train", "selection", "calibration", "test"):
        present = {r["class_id"] for r in samples if r["partition"].removeprefix("canvas-") == partition}
        missing = set(range(classes)) - present
        if missing:
            raise ValueError(f"{partition} missing class coverage {sorted(missing)}")


def permission(ctx: dict, script: str, action: str, samples: list[dict]) -> dict:
    if script == "combined":
        return {source: permission(ctx, source, action, [row for row in samples if row["script"] == source])
                for source in experiment_scripts(script)}
    provenance = read_json(Path(ctx["config"].get("provenance_path", "ai/configs/provenance.json")))
    record = provenance.get(script, {})
    if any(sample.get("source") != "canvas" for sample in samples):
        if record.get(action) != "allowed" or not record.get("evidence"):
            raise PermissionError(f"{script} {action} is not allowed with documented source evidence")
    own = record.get("own_data", record.get("groups", {}).get("canvas-consented", {}))
    for sample in samples:
        if sample.get("source") == "canvas":
            if own.get(action) != "allowed" or not own.get("evidence") or not own.get("scope"):
                raise PermissionError(f"{script} own handwriting needs documented {action} provenance and scope")
            consent = sample.get("consent", {})
            if consent.get(action) not in (True, "allowed"):
                raise PermissionError(f"Canvas {sample['sample_id']} lacks {action} consent")
        elif sample.get("provenance_group") not in (None, f"kaggle:{script}"):
            group = record.get("groups", {}).get(sample["provenance_group"], {})
            if group.get(action) != "allowed" or not group.get("evidence"):
                raise PermissionError(f"Unresolved source group {sample['provenance_group']}")
    return record


def partition_rows(ctx: dict, partition: str) -> list[dict]:
    canvas = partition.startswith("canvas-")
    base = partition.removeprefix("canvas-")
    rows = [r for r in ctx["samples"] if r["partition"].removeprefix("canvas-") == base
            and (r.get("source") == "canvas") == canvas]
    if not rows and not canvas and all(r.get("source") == "canvas" for r in ctx["samples"]):
        rows = [r for r in ctx["samples"] if r["partition"].removeprefix("canvas-") == base]
    if not rows:
        raise ValueError(f"No real {partition} samples; human collection may be required")
    return rows


def augment(image: Image.Image) -> Image.Image:
    # Pad before affine and recrop with canonical preprocessing; detached marks are retained.
    image = Image.fromarray(canonical_gray(image)).convert("RGB")
    margin = max(image.size) // 4 + 2
    image = ImageOps.expand(image, margin, "white")
    angle, scale = random.uniform(-5, 5), random.uniform(0.9, 1.1)
    translation = (random.uniform(-0.05, 0.05) * image.width, random.uniform(-0.05, 0.05) * image.height)
    width, height = image.size
    scaled = image.resize((round(width * scale), round(height * scale)), Image.Resampling.BILINEAR)
    canvas = Image.new("RGB", (width, height), "white")
    canvas.paste(scaled, ((width - scaled.width) // 2, (height - scaled.height) // 2))
    image = canvas.rotate(angle, Image.Resampling.BILINEAR, translate=translation, fillcolor="white")
    return ImageEnhance.Contrast(image).enhance(random.uniform(0.8, 1.2))


class Images(Dataset):
    def __init__(self, rows: list[dict], root: Path, size: int, training: bool = False) -> None:
        self.rows, self.root, self.size, self.training = rows, root, size, training

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, int, str]:
        row = self.rows[index]
        path = self.root / row["path"]
        if row.get("byte_sha256") and file_hash(path) != row["byte_sha256"]:
            raise ValueError(f"Audited sample changed: {path}")
        with Image.open(path) as image:
            result = preprocess_image(augment(image) if self.training else image, self.size)
        if result["status"] != "ok":
            raise ValueError(f"Empty foreground in audited sample {row['sample_id']}: {path}")
        return torch.from_numpy(result["tensor"]), int(row["class_id"]), row["sample_id"]


def seed_all(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True


def rng_state() -> dict:
    return {"python": random.getstate(), "numpy": np.random.get_state(), "torch": torch.get_rng_state(),
            "cuda": torch.cuda.get_rng_state_all() if torch.cuda.is_available() else None}


def restore_rng(state: dict) -> None:
    random.setstate(state["python"])
    np.random.set_state(state["numpy"])
    torch.set_rng_state(state["torch"])
    if state["cuda"] is not None and torch.cuda.is_available():
        torch.cuda.set_rng_state_all(state["cuda"])


def environment() -> dict:
    import platform
    import torchvision
    return {"python": platform.python_version(), "torch": torch.__version__, "torchvision": torchvision.__version__,
            "numpy": np.__version__, "cuda": torch.version.cuda,
            "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu",
            "determinism": "Seeded RNG and deterministic cuDNN; cross-device/version bit parity not guaranteed"}


def loss_weights(rows: list[dict], classes: int, loss: str, device: torch.device) -> torch.Tensor | None:
    counts = np.bincount([r["class_id"] for r in rows], minlength=classes)
    if not counts.all():
        raise ValueError("Training class coverage is incomplete")
    if loss == "ordinary":
        return None
    if loss != "weighted":
        raise ValueError("Loss must be ordinary or weighted")
    weights = np.clip(np.sqrt(np.median(counts) / counts), 0.25, 4)
    return torch.tensor(weights / weights.mean(), dtype=torch.float32, device=device)


def choose_loss(args: argparse.Namespace, ctx: dict, rows: list[dict]) -> str:
    counts = np.bincount([r["class_id"] for r in rows], minlength=len(ctx["labels"]))
    ratio = counts.max() / counts.min()
    requested = getattr(args, "loss", None)
    if ratio <= 1.5:
        if requested not in (None, "ordinary"):
            raise ValueError("Weighted loss is not planned for balanced data")
        return "ordinary"
    if getattr(args, "smoke", False) and not getattr(args, "pilot", False):
        if requested not in (None, "ordinary"):
            raise ValueError("Non-pilot infrastructure smoke uses ordinary CE")
        return "ordinary"
    if getattr(args, "pilot", False):
        if args.model != "mobile" or args.seed != 42 or requested not in ("ordinary", "weighted"):
            raise ValueError("Loss pilot requires mobile seed42 and explicit loss")
        if ctx["size"] != 128 or getattr(args, "stage", "supervised") != "supervised":
            raise ValueError("Loss pilot requires the original supervised128 recipe")
        if (getattr(args, "initialize", None) or getattr(args, "checkpoint", None)
                or getattr(args, "include_canvas", False)):
            raise ValueError("Loss pilot cannot initialize from a checkpoint or include canvas treatment")
        return requested
    decision = ctx["config"].get("loss_choice", {}).get(args.script)
    if not decision:
        raise ValueError("Imbalance >1.5 requires completed ordinary/weighted mobile seed42 loss pilot")
    from ai.evaluate import select_pilot_loss
    selected = select_pilot_loss([Path(path) for path in decision["pilots"]], ctx)
    if selected != decision["loss"] or requested not in (None, selected):
        raise ValueError("Configured loss choice is incompatible with pilot selection")
    return selected


def phases(args: argparse.Namespace, recipe: dict) -> list[dict]:
    stage = getattr(args, "stage", "supervised")
    if stage in ("canvas", "distill"):
        return [{"name": stage, "epochs": 15 if stage == "canvas" else 20, "backbone_lr": 3e-5,
                 "head_lr": 1e-4, "frozen": False, "patience": 5}]
    if args.model in PRETRAINED:
        return [{"name": "transfer", "epochs": recipe["transfer_epochs"], "backbone_lr": 0,
                 "head_lr": 1e-3, "frozen": True, "patience": None},
                {"name": "finetune", "epochs": recipe["finetune_epochs"], "backbone_lr": 1e-4,
                 "head_lr": 3e-4, "frozen": False, "patience": recipe["patience"]}]
    return [{"name": "scratch", "epochs": recipe["scratch_epochs"], "backbone_lr": 1e-3,
             "head_lr": 1e-3, "frozen": False, "patience": recipe["patience"]}]


def predict(model: nn.Module, dataset: Images, device: torch.device, batch: int = 64,
            deadline: float | None = None) -> tuple[np.ndarray, np.ndarray, list[str]]:
    logits, labels, ids = [], [], []
    model.eval()
    with torch.inference_mode():
        for image, target, sample_ids in DataLoader(dataset, batch_size=batch, shuffle=False, num_workers=0):
            if deadline is not None and time.monotonic() >= deadline:
                raise TimeoutError("Training deadline reached during selection inference")
            logits.append(model(image.to(device)).float().cpu().numpy())
            labels.append(target.numpy())
            ids.extend(sample_ids)
    return np.concatenate(logits), np.concatenate(labels), ids


def teacher_probabilities(teacher: nn.Module, image: torch.Tensor, temperature: float = 4) -> torch.Tensor:
    from ai.models import SoftVote
    with torch.no_grad():
        if isinstance(teacher, SoftVote):
            predictions = [torch.softmax(member(image).float() / temperature, -1) for member in teacher.members]
            return sum(weight * probability for weight, probability in zip(teacher.weights, predictions))
        return torch.softmax(teacher(image).float() / temperature, -1)


def accumulated_backward(model: nn.Module, images: torch.Tensor, targets: torch.Tensor,
                         device: torch.device, batch: int, weights: torch.Tensor | None,
                         teacher: nn.Module | None, scaler: object, deadline: float) -> float:
    denominator = float(weights[targets.to(device)].sum()) if weights is not None else len(targets)
    group_loss = 0.0
    for start in range(0, len(targets), batch):
        if time.monotonic() >= deadline:
            raise TimeoutError("55-minute deadline reached inside epoch")
        image, target = images[start:start + batch].to(device), targets[start:start + batch].to(device)
        with torch.autocast(device_type=device.type, enabled=device.type == "cuda"):
            logits = model(image)
            loss = F.cross_entropy(logits, target, weight=weights, reduction="sum") / denominator
            if teacher is not None:
                soft = teacher_probabilities(teacher, image)
                kl = F.kl_div(F.log_softmax(logits.float() / 4, -1), soft, reduction="sum") / len(targets)
                loss = 0.5 * loss + 0.5 * 16 * kl
        if not torch.isfinite(loss):
            raise FloatingPointError("Nonfinite training loss")
        scaler.scale(loss).backward()
        group_loss += float(loss.detach())
    return group_loss


def training_epoch(model: nn.Module, dataset: Images, optimizer: torch.optim.Optimizer, scaler: torch.amp.GradScaler,
                   device: torch.device, batch: int, recipe: dict, weights: torch.Tensor | None,
                   frozen: bool, name: str, teacher: nn.Module | None, deadline: float) -> dict:
    model.train()
    if frozen:
        freeze_backbone_statistics(model, name)
    loader = DataLoader(dataset, batch_size=64, shuffle=True, num_workers=0)
    optimizer.zero_grad(set_to_none=True)
    total_loss, seen, gradient_nonzero = 0.0, 0, False
    for image, target, _ in loader:
        group_loss = accumulated_backward(model, image, target, device, batch, weights, teacher, scaler, deadline)
        total_loss += group_loss * len(target)
        seen += len(target)
        scaler.unscale_(optimizer)
        norm = nn.utils.clip_grad_norm_(model.parameters(), recipe["gradient_clip"])
        finite = bool(torch.isfinite(norm))
        if not finite and not scaler.is_enabled():
            raise FloatingPointError("Nonfinite gradient norm")
        # AMP overflow is handled by scaler.step (skip) and update (reduce scale).
        gradient_nonzero |= finite and float(norm) > 0
        scaler.step(optimizer)
        scaler.update()
        optimizer.zero_grad(set_to_none=True)
    if not gradient_nonzero:
        raise FloatingPointError("No nonzero gradient observed in real training epoch")
    return {"loss": total_loss / seen, "gradient_nonzero": gradient_nonzero, "samples": seen}


def better(metric: dict, best: dict | None, delta: float) -> bool:
    if best is None:
        return True
    improvement = metric["macro_f1"] - best["macro_f1"]
    return improvement > delta or (abs(improvement) <= 1e-12 and metric["loss"] < best["loss"])


def checkpoint_state(model: nn.Module, optimizer: torch.optim.Optimizer, scheduler: object,
                     scaler: object, state: dict) -> dict:
    result = dict(state)
    result.update(model_state=model.state_dict(), optimizer_state=optimizer.state_dict(),
                  scheduler_state=scheduler.state_dict(), scaler_state=scaler.state_dict(), rng_state=rng_state())
    return result


def cpu_snapshot(value: object) -> object:
    if isinstance(value, torch.Tensor):
        return value.detach().cpu().clone()
    if isinstance(value, dict):
        return {key: cpu_snapshot(item) for key, item in value.items()}
    if isinstance(value, list):
        return [cpu_snapshot(item) for item in value]
    if isinstance(value, tuple):
        return tuple(cpu_snapshot(item) for item in value)
    return copy.deepcopy(value)


def execute(args: argparse.Namespace, ctx: dict, out: Path, model: nn.Module, dataset: Images,
            selection: Images, teacher: nn.Module | None, identity: dict, resume: dict | None) -> dict:
    from ai.evaluate import classification_metrics
    recipe = ctx["config"]["training"]
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    weights = loss_weights(dataset.rows, len(ctx["labels"]), identity["loss"], device)
    plan = phases(args, recipe)
    ceiling = int(args.epochs) if getattr(args, "epochs", None) else sum(p["epochs"] for p in plan)
    if ceiling <= 0 or (not getattr(args, "smoke", False) and ceiling != sum(p["epochs"] for p in plan)):
        raise ValueError("Full runs use the complete planned recipe; custom epoch ceiling requires --smoke")
    state = resume or {"identity": identity, "phase_index": 0, "phase_epoch": 0, "epoch": 0,
                       "best": None, "global_best": None, "patience": 0, "batch_size": 64, "history": []}
    deadline = ctx["deadline"]
    for phase_index in range(state["phase_index"], len(plan)):
        phase = plan[phase_index]
        optimizer = torch.optim.AdamW(parameter_groups(model, args.model, phase["backbone_lr"], phase["head_lr"], phase["frozen"]),
                                      weight_decay=recipe["weight_decay"])
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=phase["epochs"])
        scaler = torch.amp.GradScaler("cuda", enabled=device.type == "cuda")
        continuing = resume is not None and phase_index == resume["phase_index"]
        if continuing:
            optimizer.load_state_dict(resume["optimizer_state"])
            scheduler.load_state_dict(resume["scheduler_state"])
            scaler.load_state_dict(resume["scaler_state"])
            restore_rng(resume["rng_state"])
        else:
            state.update(phase_index=phase_index, phase_epoch=0, best=None, patience=0)
        for phase_epoch in range(state["phase_epoch"], phase["epochs"]):
            if state["epoch"] >= ceiling:
                return finish_run(out, state, "smoke" if args.smoke else "complete")
            boundary = cpu_snapshot(checkpoint_state(model, optimizer, scheduler, scaler, state))
            try:
                training = train_with_oom(model, dataset, optimizer, scheduler, scaler, device, state, boundary,
                                          recipe, weights, phase, args.model, teacher, deadline)
                logits, labels, ids = predict(model, selection, device, state["batch_size"], deadline)
            except TimeoutError:
                model.load_state_dict(boundary["model_state"])
                restore_rng(boundary["rng_state"])
                save_checkpoint(out / "last.pt", boundary)
                return finish_run(out, state, "partial")
            metric = classification_metrics(logits, labels, len(ctx["labels"]))
            metric.update(epoch=state["epoch"] + 1, phase=phase["name"], training=training)
            scheduler.step()
            improved = state["best"] is None or metric["macro_f1"] > state["best"]["macro_f1"] + recipe["min_delta"]
            phase_improved = better(metric, state["best"], 0)
            global_improved = better(metric, state.get("global_best"), 0)
            state.update(epoch=state["epoch"] + 1, phase_epoch=phase_epoch + 1,
                         patience=0 if improved else state["patience"] + 1)
            state["history"].append(metric)
            if phase_improved:
                state["best"] = metric
            if global_improved:
                state["global_best"] = metric
            saved = checkpoint_state(model, optimizer, scheduler, scaler, state)
            save_checkpoint(out / "last.pt", saved)
            if phase_improved:
                save_checkpoint(out / f"{phase['name']}-best.pt", saved)
            if global_improved:
                save_checkpoint(out / "best.pt", saved)
                persist_predictions(out, logits, labels, ids, selection.rows, ctx, identity)
            save_json(out / "metrics.json", state["history"])
            save_json(out / "stdout-log.json", [{"epoch": row["epoch"], "phase": row["phase"],
                                               "loss": row["training"]["loss"], "selection_macro_f1": row["macro_f1"]}
                                              for row in state["history"]])
            print(f"{phase['name']} epoch={state['epoch']} loss={training['loss']:.6f} selection_macro_f1={metric['macro_f1']:.6f}", flush=True)
            if phase["patience"] and state["patience"] >= phase["patience"]:
                state["phase_epoch"] = phase["epochs"]
                save_checkpoint(out / "last.pt", checkpoint_state(model, optimizer, scheduler, scaler, state))
                break
        model.load_state_dict(load_checkpoint(out / f"{phase['name']}-best.pt")["model_state"])
        resume = None
    return finish_run(out, state, "smoke" if args.smoke else "complete")


def train_with_oom(model: nn.Module, dataset: Images, optimizer: object, scheduler: object, scaler: object,
                   device: torch.device, state: dict, boundary: dict, recipe: dict, weights: torch.Tensor | None,
                   phase: dict, name: str, teacher: nn.Module | None, deadline: float) -> dict:
    while True:
        try:
            return training_epoch(model, dataset, optimizer, scaler, device, state["batch_size"], recipe,
                                  weights, phase["frozen"], name, teacher, deadline)
        except torch.cuda.OutOfMemoryError:
            model.load_state_dict(boundary["model_state"])
            optimizer.load_state_dict(boundary["optimizer_state"])
            scheduler.load_state_dict(boundary["scheduler_state"])
            scaler.load_state_dict(boundary["scaler_state"])
            restore_rng(boundary["rng_state"])
            optimizer.zero_grad(set_to_none=True)
            torch.cuda.empty_cache()
            if state["batch_size"] <= 16:
                raise RuntimeError("CUDA OOM persists at microbatch16/effective batch64; candidate stopped")
            state["batch_size"] //= 2


def persist_predictions(out: Path, logits: np.ndarray, labels: np.ndarray, ids: list[str],
                        rows: list[dict], ctx: dict, identity: dict) -> None:
    np.savez_compressed(out / "selection.npz", logits=logits, labels=labels, sample_ids=np.array(ids))
    metadata = {"identity": identity, "hashes": ctx["hashes"],
                "rows": rows, "num_classes": len(ctx["labels"]), "size": ctx["size"]}
    if ctx["script"] == "combined":
        metadata["class_space"] = ctx["class_space"]
    save_json(out / "selection.json", metadata)
    import csv
    from ai.evaluate import classification_metrics
    metric = classification_metrics(logits, labels, len(ctx["labels"]))
    save_json(out / "confusion.json", metric["confusion_matrix"])
    with (out / "per-class.csv").open("w", newline="", encoding="utf-8") as stream:
        fields = ("class_id", "source_label", "support", "recall")
        if ctx["script"] == "combined":
            fields += ("script", "source_class_id", "namespaced_label")
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        for row in metric["per_class"]:
            writer.writerow(dict(row, **{field: ctx["labels"][row["class_id"]][field] for field in fields
                                         if field not in row}))


def finish_run(out: Path, state: dict, status: str) -> dict:
    manifest = read_json(out / "manifest.json")
    manifest.update(status=status, epochs_completed=state["epoch"], best=state.get("global_best") or state["best"],
                    finished_at=datetime.now(timezone.utc).isoformat(), history=state["history"],
                    effective_batch_size=64, microbatch_size=state["batch_size"],
                    artifact_hashes={path.name: file_hash(path) for path in out.iterdir()
                                     if path.is_file() and path.name != "manifest.json" and path.suffix in (".pt", ".npz", ".csv", ".json", ".png")})
    save_json(out / "manifest.json", manifest)
    return manifest


def validate_resume(path: Path, checkpoint: dict, identity: dict) -> None:
    previous = read_json(path.parent / "manifest.json")
    if previous["identity"] != identity or checkpoint["identity"] != identity:
        raise ValueError("Resume manifest/checkpoint/current immutable identities differ")
    expected = previous.get("artifact_hashes", {}).get(path.name)
    if not expected or file_hash(path) != expected:
        raise ValueError("Resume checkpoint checksum evidence missing or mismatched")
    if checkpoint["epoch"] != previous.get("epochs_completed"):
        raise ValueError("Resume must use last committed epoch, not an earlier best checkpoint")
    for name, expected_hash in previous["artifact_hashes"].items():
        if file_hash(path.parent / name) != expected_hash:
            raise ValueError(f"Resume artifact checksum changed: {name}")
    for asset in path.parent.glob("*best.pt"):
        if previous["artifact_hashes"].get(asset.name) != file_hash(asset):
            raise ValueError(f"Resume best checkpoint changed: {asset}")
        if load_checkpoint(asset)["identity"] != identity:
            raise ValueError(f"Resume best checkpoint identity differs: {asset}")


def contact_sheet(rows: list[dict], ctx: dict, out: Path) -> None:
    from PIL import ImageDraw
    saved_rng = rng_state()
    sheet = Image.new("RGB", (1280, 1500), "white")
    draw = ImageDraw.Draw(sheet)
    selected = []
    try:
        indices = np.random.default_rng(42).choice(len(rows), 100, replace=len(rows) < 100)
        for index, sample_index in enumerate(indices):
            row = rows[int(sample_index)]
            with Image.open(ctx["data_root"] / row["path"]) as image:
                result = preprocess_image(augment(image), 128)
            if result["status"] != "ok":
                raise ValueError(f"Empty augmented training image {row['sample_id']}")
            tile = Image.fromarray(np.rint(result["gray"] * 255).astype(np.uint8)).convert("RGB")
            x, y = (index % 10) * 128, (index // 10) * 150
            sheet.paste(tile, (x, y))
            draw.text((x + 2, y + 129), f"class {row['class_id']}", fill="black")
            selected.append({"sample_id": row["sample_id"], "class_id": row["class_id"]})
        sheet.save(out / "augmentation-contact-sheet.png")
        save_json(out / "augmentation-review.json", {"status": "human-review-required", "samples": selected,
                                                    "sha256": file_hash(out / "augmentation-contact-sheet.png")})
    finally:
        restore_rng(saved_rng)


def run(args: argparse.Namespace) -> dict:
    ctx = context(args)
    stage = getattr(args, "stage", "supervised")
    if args.script == "combined" and (stage != "supervised" or getattr(args, "include_canvas", False)
                                       or getattr(args, "initialize", None) or getattr(args, "checkpoint", None)
                                       or getattr(args, "teacher", None)):
        raise ValueError("Combined training is supervised source-only; no canvas/distill/initialize treatment")
    ctx["deadline"] = time.monotonic() + min(3300, int(ctx["config"]["training"]["deadline_seconds"]))
    permission(ctx, args.script, "training", ctx["samples"])
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if stage not in ("supervised", "canvas", "distill"):
        raise ValueError("Training stage must be supervised|canvas|distill")
    rows = partition_rows(ctx, "train")
    selection_rows = partition_rows(ctx, "selection")
    teacher_canvas = False
    if stage == "distill" and getattr(args, "teacher", None):
        teacher_manifest = read_json(Path(args.teacher))
        trial = teacher_manifest["teacher"] if teacher_manifest.get("deployment") == "teacher" else teacher_manifest["winner"]
        teacher_canvas = any(teacher_manifest["members"][index]["identity"]["stage"] == "canvas"
                             for index, weight in zip(trial["indices"], trial["weights"]) if weight > 0)
    if stage == "canvas" or getattr(args, "include_canvas", False) or teacher_canvas:
        rows = list({r["sample_id"]: r for r in rows + partition_rows(ctx, "canvas-train")}.values())
        selection_rows = partition_rows(ctx, "canvas-selection")
    provenance = permission(ctx, args.script, "training", rows)
    for row in rows + selection_rows:
        path = ctx["data_root"] / row["path"]
        if not row.get("byte_sha256") or file_hash(path) != row["byte_sha256"]:
            raise ValueError(f"Audited training/selection byte hash mismatch: {path}")
    loss = choose_loss(args, ctx, partition_rows(ctx, "train"))
    seed_all(args.seed)
    identity = {"script": args.script, "model": args.model, "seed": args.seed, "stage": stage,
                "loss": loss, "size": ctx["size"], "hashes": ctx["hashes"],
                "train_ids_hash": digest([r["sample_id"] for r in rows]),
                "selection_ids_hash": digest([r["sample_id"] for r in selection_rows]),
                "smoke": bool(args.smoke)}
    resume = load_checkpoint(Path(args.resume)) if getattr(args, "resume", None) else None
    teacher = None
    if stage == "distill":
        if args.model != "mobile" or ctx["size"] != 128 or args.seed != 42:
            raise ValueError("Distillation must use mobile128 seed42")
        if not getattr(args, "teacher", None):
            raise ValueError("Distillation requires an actual frozen ensemble teacher manifest")
        from ai.ensemble import load_teacher
        teacher, teacher_manifest = load_teacher(Path(args.teacher), ctx)
        teacher.to("cuda" if torch.cuda.is_available() else "cpu").eval().requires_grad_(False)
        identity["teacher_hash"] = digest(teacher_manifest)
    initialize = getattr(args, "initialize", None) or getattr(args, "checkpoint", None)
    if stage in ("canvas", "distill") and not initialize and not resume:
        raise ValueError(f"{stage} requires a real best supervised checkpoint via --initialize")
    identity["initialize_hash"] = file_hash(Path(initialize)) if initialize else (resume["identity"].get("initialize_hash") if resume else None)
    if resume and resume["identity"] != identity:
        raise ValueError("Resume identity/config/data/labels/preprocessing/loss/stage mismatch")
    if resume:
        validate_class_space(ctx, resume["identity"])
    if resume:
        validate_resume(Path(args.resume), resume, identity)
    elif (out / "last.pt").exists() or (out / "best.pt").exists():
        raise FileExistsError(f"{out} already contains weights; use a unique output or explicit resume")
    if resume and args.smoke and (not args.epochs or args.epochs <= resume["epoch"]):
        raise ValueError("Smoke resume requires an explicitly larger --epochs total ceiling")
    if resume and Path(args.resume).parent.resolve() != out.resolve():
        import shutil
        source_root = Path(args.resume).parent
        sources = list(source_root.glob("*best.pt"))
        sources += [source_root / name for name in ("selection.json", "selection.npz", "per-class.csv", "confusion.json",
                                                  "augmentation-review.json", "augmentation-contact-sheet.png",
                                                  "class-space.json")
                    if (source_root / name).is_file()]
        for source in sources:
            shutil.copy2(source, out / source.name)
        save_json(out / "metrics.json", resume["history"])
    model = build_model(args.model, len(ctx["labels"]), pretrained=resume is None and not initialize)
    if resume:
        model.load_state_dict(resume["model_state"])
    elif initialize:
        checkpoint = load_checkpoint(Path(initialize))
        validate_class_space(ctx, checkpoint["identity"])
        validate_initialization(checkpoint["identity"], identity)
        model.load_state_dict(checkpoint["model_state"])
    if resume and not (out / "last.pt").exists():
        save_checkpoint(out / "last.pt", resume)
    if args.script == "combined":
        save_json(out / "class-space.json", ctx["class_space"])
    save_json(out / "manifest.json", {"identity": identity, "status": "running", "pilot": bool(getattr(args, "pilot", False)), "provenance": provenance,
                                      "environment": environment(), "preprocessing": ctx["preprocessing"],
                                      "config": ctx["config"], "phases": phases(args, ctx["config"]["training"]),
                                      "train_class_counts": np.bincount([r["class_id"] for r in rows], minlength=len(ctx["labels"])).tolist(),
                                      "started_at": datetime.now(timezone.utc).isoformat()})
    try:
        if not resume:
            contact_sheet(rows, ctx, out)
        return execute(args, ctx, out, model, Images(rows, ctx["data_root"], ctx["size"], True),
                       Images(selection_rows, ctx["data_root"], ctx["size"]), teacher, identity, resume)
    except Exception as error:
        manifest = read_json(out / "manifest.json")
        manifest.update(status="failed", error=f"{type(error).__name__}: {error}")
        save_json(out / "manifest.json", manifest)
        if (out / "last.pt").is_file():
            committed = load_checkpoint(out / "last.pt")
            if committed["identity"] == identity:
                finish_run(out, committed, "failed")
        raise


def validate_initialization(previous: dict, current: dict) -> None:
    for key in ("script", "model", "size", "loss"):
        if previous[key] != current[key]:
            raise ValueError(f"Initialization checkpoint {key} mismatch")
    if previous.get("script") == "combined" or current.get("script") == "combined":
        if previous.get("hashes", {}).get("class_space_hash") != current.get("hashes", {}).get("class_space_hash") or not current.get("hashes", {}).get("class_space_hash"):
            raise ValueError("Initialization checkpoint class_space_hash mismatch")
    for key in ("dataset_hash", "split_hash", "label_hash", "preprocessing_hash"):
        if previous["hashes"][key] != current["hashes"][key]:
            raise ValueError(f"Initialization checkpoint {key} mismatch")
    if previous.get("smoke"):
        raise ValueError("Smoke checkpoint cannot initialize finalist training")
