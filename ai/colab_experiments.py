"""Resumable, single-worker Colab study of three specialists and one 174-way model."""
from __future__ import annotations

import argparse
from contextlib import contextmanager
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import uuid

import numpy as np

if os.name == "nt":
    import msvcrt
else:
    import fcntl


from ai.train import (context, file_hash, load_checkpoint, partition_rows, permission,
                      read_json, save_json, validate_resume)


WORK = Path(__file__).resolve().parents[1]
LOCAL = WORK / "ai/runs/four-models"
TARGETS = ("sunda", "lontara", "bali", "combined")
LOSSES = {"sunda": ("ordinary",), "lontara": ("ordinary", "weighted"),
          "bali": ("ordinary", "weighted"), "combined": ("ordinary", "weighted")}
SOURCE_HASHES = {"dataset_hash": "07a8f1fa177fa7f71be0fb54a48cdaf4e3d9f6f29a5cdde9fd88219568b222a2",
                 "label_hash": "44b43e62b88ccd231b8d58f1c3230bb5afd2182be1c857787a0ebdd4ebb31b07",
                 "split_hash": "b285532165a7b9388c3a4e7f1635952ae2bcc88368ca22ba8ac55cceb4dfae2b"}
EXPECTED_TRAIN = {"sunda": 1259, "lontara": 6967, "bali": 1180, "combined": 9406}
EXPECTED_PARTITIONS = {"train": 9406, "selection": 1337, "calibration": 678, "test": 2021}
EPOCH = re.compile(r"^(transfer|finetune) epoch=(\d+) loss=[^ ]+ selection_macro_f1=([0-9.]+)$")


def _contexts(data_root: Path) -> dict[str, dict]:
    args = argparse.Namespace(config=WORK / "ai/configs/training.json", audit=WORK / "ai/runs/audit",
                              splits=WORK / "ai/runs/splits", size=128, data_root=data_root)
    result = {}
    for target in TARGETS:
        args.script = target
        result[target] = context(args)
    return result


def preflight(data_root: Path) -> dict:
    """Verify the frozen metadata, permission and every original image's bytes, not pixels."""
    contexts = _contexts(Path(data_root))
    combined = contexts["combined"]
    for key, value in SOURCE_HASHES.items():
        if combined["hashes"][key] != value:
            raise ValueError(f"Frozen {key} differs from the planned study")
    counts = {}
    for target, ctx in contexts.items():
        permission(ctx, target, "training", ctx["samples"])
        rows = partition_rows(ctx, "train")
        classes = np.bincount([row["class_id"] for row in rows], minlength=len(ctx["labels"]))
        if len(rows) != EXPECTED_TRAIN[target] or not classes.all():
            raise ValueError(f"{target} train class coverage/count differs from frozen plan")
        counts[target] = {"classes": len(ctx["labels"]), "train": len(rows),
                          "max_min_ratio": round(float(classes.max() / classes.min()), 4),
                          "partitions": {name: len(partition_rows(ctx, name)) for name in EXPECTED_PARTITIONS}}
        if (target == "sunda") != (classes.max() / classes.min() <= 1.5):
            raise ValueError(f"{target} treatment imbalance differs from frozen plan")
    if counts["combined"]["partitions"] != EXPECTED_PARTITIONS or counts["combined"]["classes"] != 174:
        raise ValueError("Combined class/partition counts differ from frozen plan")
    for row in combined["samples"]:
        path = Path(data_root) / row["path"]
        if not row.get("byte_sha256") or file_hash(path) != row["byte_sha256"]:
            raise ValueError(f"Audited source byte hash mismatch: {path}")
    return {"hashes": combined["hashes"], "source_counts": counts,
            "treatments": [{"target": target, "loss": loss} for target in TARGETS for loss in LOSSES[target]],
            "verified_source_rows": len(combined["samples"])}


def _identity(info: dict, runtime_sha256: str) -> dict:
    if not re.fullmatch(r"[0-9a-f]{64}", runtime_sha256):
        raise ValueError("runtime_sha256 must be a lowercase SHA256 digest")
    return {"runtime_sha256": runtime_sha256, "hashes": info["hashes"],
            "recipe": read_json(WORK / "ai/configs/training.json")["training"],
            "targets": list(TARGETS), "treatments": info["treatments"]}


@contextmanager
def _locked(save_root: Path):
    save_root.mkdir(parents=True, exist_ok=True)
    with (save_root / "experiment.lock").open("a+b") as stream:
        if os.name == "nt":
            if not stream.tell() and not stream.read(1):
                stream.write(b"0")
                stream.flush()
            stream.seek(0)
            msvcrt.locking(stream.fileno(), msvcrt.LK_LOCK, 1)
        else:
            fcntl.flock(stream, fcntl.LOCK_EX)
        try:
            yield
        finally:
            if os.name == "nt":
                stream.seek(0)
                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(stream, fcntl.LOCK_UN)


def _pid_state(pid: int, save_root: Path) -> str:
    """Distinguish dead PIDs from our exact worker and unrelated PID reuse."""
    proc = Path(f"/proc/{pid}/cmdline")
    try:
        command = [item.decode() for item in proc.read_bytes().split(b"\0") if item]
    except (FileNotFoundError, ProcessLookupError):
        return "dead"
    except PermissionError as error:
        raise RuntimeError(f"Cannot inspect controller PID {pid}") from error
    if not command:
        try:
            if Path(f"/proc/{pid}/stat").read_text().split()[2] == "Z":
                return "dead"
        except FileNotFoundError:
            return "dead"
    expected = ("-m", "ai.colab_experiments", "run")
    if (len(command) < 4 or tuple(command[1:4]) != expected
            or "--save-root" not in command
            or command.index("--save-root") + 1 == len(command)
            or Path(command[command.index("--save-root") + 1]).resolve() != save_root.resolve()):
        raise RuntimeError(f"PID {pid} belongs to a foreign process; refusing a second worker")
    return "active"


def status(save_root: Path) -> dict:
    path = Path(save_root) / "experiment.json"
    if not path.is_file():
        return {"status": "not_started"}
    state = read_json(path)
    result = {key: state.get(key) for key in ("status", "pid", "log", "current_target", "current_loss",
                                               "phase", "epoch", "selection_macro_f1", "error",
                                               "loss_decisions", "final_paths", "final_metrics", "comparison_path")}
    result["cases"] = {name: {key: case.get(key) for key in ("status", "epoch", "latest_saved_attempt")}
                       for name, case in state.get("cases", {}).items()}
    if result["error"]:
        result["error"] = str(result["error"])[:1024]
    if result["status"] == "running" and result["pid"]:
        result["worker"] = _pid_state(result["pid"], Path(save_root))
    encoded = json.dumps(result, ensure_ascii=False, default=str)
    if len(encoded.encode("utf-8")) > 8192:
        raise ValueError("Progress status exceeds 8KiB")
    return result


def launch(data_root: Path, save_root: Path, runtime_sha256: str) -> dict:
    data_root, save_root = Path(data_root).resolve(), Path(save_root).resolve()
    with _locked(save_root):
        info = preflight(data_root)
        identity = _identity(info, runtime_sha256)
        path = save_root / "experiment.json"
        if path.is_file():
            state = read_json(path)
            if state["identity"] != identity:
                raise ValueError("Existing experiment identity is incompatible; choose a new save root")
            if state["status"] == "completed":
                _verify_completed(save_root, state, _contexts(data_root))
                return status(save_root)
            if state.get("pid") and _pid_state(state["pid"], save_root) == "active":
                if state["data_root"] != str(data_root):
                    raise ValueError("Active worker uses a different data root; refusing a duplicate worker")
                return status(save_root)
            if any(case.get("status") == "failed" for case in state["cases"].values()):
                raise RuntimeError("A treatment failed; refusing automatic retry in this study")
            state["data_root"] = str(data_root)
        else:
            state = {"identity": identity, "data_root": str(data_root), "status": "pending", "pid": None,
                     "cases": {}, "loss_decisions": {}, "final_paths": {}, "final_metrics": {},
                     "comparison_path": None, "comparison_sha256": None, "current_target": None,
                     "current_loss": None, "phase": None, "epoch": 0,
                     "selection_macro_f1": None, "error": None}
        LOCAL.mkdir(parents=True, exist_ok=True)
        log = LOCAL / "controller.log"
        command = [sys.executable, "-m", "ai.colab_experiments", "run", "--data-root", str(data_root),
                   "--save-root", str(save_root), "--runtime-sha256", runtime_sha256]
        with log.open("a", encoding="utf-8") as output:
            worker = subprocess.Popen(command, cwd=WORK, stdout=output, stderr=subprocess.STDOUT,
                                      start_new_session=True)
        state.update(status="running", pid=worker.pid, log=str(log), error=None)
        save_json(path, state)
        return status(save_root)


def _verify_case(directory: Path, ctx: dict, target: str, loss: str, *, allow_failed: bool = False) -> dict:
    manifest = read_json(directory / "manifest.json")
    identity = manifest["identity"]
    expected = {"script": target, "model": "mobile", "seed": 42, "size": 128,
                "stage": "supervised", "loss": loss, "smoke": False, "initialize_hash": None,
                "hashes": ctx["hashes"]}
    for key, value in expected.items():
        if identity.get(key) != value:
            raise ValueError(f"Incompatible {target}/{loss} case identity: {key}")
    if (identity.get("train_ids_hash") != _ids_hash(ctx, "train")
            or identity.get("selection_ids_hash") != _ids_hash(ctx, "selection")
            or manifest["config"]["training"] != ctx["config"]["training"]
            or manifest.get("pilot") != (target != "sunda")):
        raise ValueError(f"Incompatible {target}/{loss} training recipe, samples or pilot status")
    if manifest["status"] not in (("partial", "complete", "failed", "running") if allow_failed else ("partial", "complete")):
        raise ValueError(f"{target}/{loss} is {manifest['status']}, not resumable or selectable")
    hashes = manifest.get("artifact_hashes", {})
    for name, expected_hash in hashes.items():
        if Path(name).name != name or file_hash(directory / name) != expected_hash:
            raise ValueError(f"Corrupt case artifact: {directory / name}")
    if manifest["status"] in ("failed", "running"):
        return manifest
    if not hashes or hashes.get("last.pt") != file_hash(directory / "last.pt"):
        raise ValueError(f"Missing verified last checkpoint for {target}/{loss}")
    validate_resume(directory / "last.pt", load_checkpoint(directory / "last.pt"), identity)
    if manifest["status"] == "complete":
        if not manifest.get("best") or hashes.get("best.pt") != file_hash(directory / "best.pt"):
            raise ValueError(f"Completed case lacks a verified winner: {target}/{loss}")
        if load_checkpoint(directory / "best.pt")["identity"] != identity:
            raise ValueError(f"Winner checkpoint identity differs: {target}/{loss}")
        for name in ("selection.json", "selection.npz"):
            if hashes.get(name) != file_hash(directory / name):
                raise ValueError(f"Completed case lacks verified {name}")
    return manifest


def _ids_hash(ctx: dict, partition: str) -> str:
    from ai.train import digest
    return digest([row["sample_id"] for row in partition_rows(ctx, partition)])


def _publish(directory: Path, save_root: Path, target: str, loss: str, state: dict, ctx: dict) -> Path:
    manifest = _verify_case(directory, ctx, target, loss, allow_failed=True)
    case = state["cases"][f"{target}/{loss}"]
    folder = save_root / target / loss
    folder.mkdir(parents=True, exist_ok=True)
    number = 1 + max((int(path.name.removeprefix("attempt-")) for path in folder.iterdir()
                      if re.fullmatch(r"attempt-\d+", path.name)), default=0)
    destination = folder / f"attempt-{number:04d}"
    if destination.exists():
        raise FileExistsError(f"Published attempt already exists: {destination}")
    staging = folder / f".attempt-{number:04d}-{uuid.uuid4().hex}"
    try:
        staging.mkdir()
        for source in directory.iterdir():
            if source.is_file() and source.name != "manifest.json":
                shutil.copy2(source, staging / source.name)
                if file_hash(source) != file_hash(staging / source.name):
                    raise IOError(f"Drive copy checksum mismatch: {source.name}")
        shutil.copy2(directory / "manifest.json", staging / "manifest.json")
        if file_hash(directory / "manifest.json") != file_hash(staging / "manifest.json"):
            raise IOError("Drive copy manifest checksum mismatch")
        _verify_case(staging, ctx, target, loss, allow_failed=True)
        staging.rename(destination)
    except Exception:
        shutil.rmtree(staging, ignore_errors=True)
        raise
    case["attempts"].append(str(destination))
    case["latest_saved_attempt"] = str(destination)
    case["status"] = manifest["status"]
    case["epoch"] = manifest["epochs_completed"]
    save_json(save_root / "experiment.json", state)
    return destination


def _verify_completed(save_root: Path, state: dict, contexts: dict[str, dict]) -> None:
    if set(state["final_paths"]) != set(TARGETS):
        raise ValueError("Completed study has fewer than four final models")
    for target in TARGETS:
        loss = state["loss_decisions"][target]
        path = Path(state["final_paths"][target])
        case = state["cases"][f"{target}/{loss}"]
        if path != Path(case["latest_saved_attempt"]) / "best.pt" or path.parent.parent != save_root / target / loss:
            raise ValueError(f"Final checkpoint is not the published winner for {target}")
        if _verify_case(path.parent, contexts[target], target, loss)["status"] != "complete":
            raise ValueError(f"Final checkpoint is incomplete: {target}")
    comparison = Path(state["comparison_path"])
    if comparison != save_root / "comparison.json" or file_hash(comparison) != state["comparison_sha256"]:
        raise ValueError("Published comparison checksum differs")


def _restore(case: dict, local: Path, ctx: dict, target: str, loss: str) -> None:
    for recorded in reversed(case["attempts"]):
        source = Path(recorded)
        try:
            manifest = _verify_case(source, ctx, target, loss)
        except (ValueError, OSError, KeyError):
            continue
        if local.exists():
            if (local / "manifest.json").is_file():
                local.rename(local.with_name(f"{local.name}.interrupted-{uuid.uuid4().hex}"))
            elif any(local.iterdir()):
                raise ValueError(f"Unverified local case blocks restoration: {local}")
        shutil.copytree(source, local, dirs_exist_ok=True)
        _verify_case(local, ctx, target, loss)
        case.update(latest_saved_attempt=str(source), status=manifest["status"],
                    epoch=manifest["epochs_completed"])
        return
    raise ValueError(f"No valid published resumable attempt for {target}/{loss}")


def _run_case(data_root: Path, save_root: Path, state: dict, ctx: dict, target: str, loss: str) -> Path:
    name = f"{target}/{loss}"
    case = state["cases"].setdefault(name, {"attempts": [], "latest_saved_attempt": None,
                                              "status": "pending", "epoch": 0})
    local = LOCAL / target / loss
    if any(Path(recorded).parent != save_root / target / loss for recorded in case["attempts"]):
        raise ValueError(f"{name} saved attempt is outside its study directory")
    if case["attempts"] and not (local / "manifest.json").is_file():
        _restore(case, local, ctx, target, loss)
        save_json(save_root / "experiment.json", state)
    if (local / "manifest.json").is_file():
        try:
            manifest = _verify_case(local, ctx, target, loss)
        except ValueError:
            if read_json(local / "manifest.json").get("status") == "failed":
                raise RuntimeError(f"Failed {name} cannot be retried automatically")
            if not case["attempts"]:
                raise
            _restore(case, local, ctx, target, loss)
            save_json(save_root / "experiment.json", state)
            manifest = _verify_case(local, ctx, target, loss)
        if case["attempts"] and (manifest["epochs_completed"] < case["epoch"]
                                 or (case["status"] == "complete" and manifest["status"] != "complete")):
            _restore(case, local, ctx, target, loss)
            save_json(save_root / "experiment.json", state)
            manifest = _verify_case(local, ctx, target, loss)
    else:
        manifest = None
        if local.exists() and any(local.iterdir()):
            raise ValueError(f"Local case has artifacts without manifest: {local}")
    while manifest is None or manifest["status"] == "partial":
        before = manifest["epochs_completed"] if manifest else 0
        state.update(current_target=target, current_loss=loss, epoch=before, phase=None,
                     selection_macro_f1=None)
        case["status"] = "running"
        save_json(save_root / "experiment.json", state)
        command = [sys.executable, "ai/runner.py", "train", "--script", target, "--model", "mobile",
                   "--seed", "42", "--size", "128", "--stage", "supervised", "--loss", loss,
                   "--data-root", str(data_root), "--out", str(local)]
        if target != "sunda":
            command.append("--pilot")
        if manifest is not None:
            command.extend(("--resume", str(local / "last.pt")))
        LOCAL.mkdir(parents=True, exist_ok=True)
        with (LOCAL / "controller.log").open("a", encoding="utf-8") as output:
            output.write(f"\nStarting {name} at epoch {before}\n")
            output.flush()
            with subprocess.Popen(command, cwd=WORK, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                  text=True, bufsize=1) as process:
                assert process.stdout is not None
                for line in process.stdout:
                    output.write(line)
                    match = EPOCH.match(line.rstrip("\n"))
                    if match:
                        state.update(phase=match[1], epoch=int(match[2]), selection_macro_f1=float(match[3]))
                        save_json(save_root / "experiment.json", state)
                result = process.wait()
        error = f"Trainer exit code {result} for {name}" if result else None
        if not (local / "manifest.json").is_file():
            case["status"] = "failed"
            save_json(save_root / "experiment.json", state)
            raise RuntimeError(error or f"Trainer {name} did not write a manifest")
        current = read_json(local / "manifest.json")
        if current["status"] not in ("partial", "complete"):
            case["status"] = "failed"
            save_json(save_root / "experiment.json", state)
        try:
            if current["status"] in ("partial", "complete"):
                manifest = _verify_case(local, ctx, target, loss)
            _publish(local, save_root, target, loss, state, ctx)
        except Exception as publish_error:
            if error:
                raise RuntimeError(f"{error}; artifact publication/validation failed: {publish_error}") from publish_error
            raise RuntimeError(f"Artifact publication/validation failed for {name}: {publish_error}") from publish_error
        if current["status"] not in ("partial", "complete"):
            case["status"] = "failed"
            save_json(save_root / "experiment.json", state)
            raise RuntimeError(f"Trainer {name} ended with manifest status {current['status']}: {current.get('error', error)}")
        if error:
            case["status"] = "failed"
            save_json(save_root / "experiment.json", state)
            raise RuntimeError(error)
        if manifest["status"] == "partial" and manifest["epochs_completed"] <= before:
            case["status"] = "failed"
            save_json(save_root / "experiment.json", state)
            raise RuntimeError(f"Partial {name} made no epoch progress ({before}); stopping rather than retrying")
    if case["latest_saved_attempt"] is None or case["epoch"] != manifest["epochs_completed"]:
        _publish(local, save_root, target, loss, state, ctx)
    return Path(case["latest_saved_attempt"])


def _worker(data_root: Path, save_root: Path, runtime_sha256: str) -> None:
    with _locked(save_root):
        state = read_json(save_root / "experiment.json")
        if state["pid"] != os.getpid():
            raise ValueError("Worker PID differs from experiment state")
    try:
        if state["identity"] != _identity(preflight(data_root), runtime_sha256):
            raise ValueError("Worker immutable experiment identity differs")
        contexts = _contexts(data_root)
        for target in TARGETS:
            paths = {loss: _run_case(data_root, save_root, state, contexts[target], target, loss)
                     for loss in LOSSES[target]}
            if target == "sunda":
                winner = "ordinary"
            else:
                from ai.evaluate import select_pilot_loss
                winner = select_pilot_loss([paths["ordinary"], paths["weighted"]], contexts[target])
            chosen = paths[winner]
            _verify_case(chosen, contexts[target], target, winner)
            state["loss_decisions"][target] = winner
            state["final_paths"][target] = str(chosen / "best.pt")
            save_json(save_root / "experiment.json", state)
        if set(state["final_paths"]) != set(TARGETS):
            raise RuntimeError("Cannot compare before all four completed winners are verified")
        from ai.evaluate import compare_specialists
        selected = {target: Path(state["final_paths"][target]).parent for target in TARGETS}
        comparison = compare_specialists({key: selected[key] for key in TARGETS if key != "combined"},
                                         selected["combined"], contexts["combined"])
        comparison_path = save_root / "comparison.json"
        save_json(comparison_path, comparison)
        scalar_keys = ("macro_f1", "top1", "balanced_accuracy", "min_recall")
        final_metrics = {}
        for name in ("specialists", "combined"):
            metrics = comparison[name]["metrics"]
            overall = metrics.get("overall", metrics)
            final_metrics[name] = {key: overall.get(key) for key in scalar_keys}
            final_metrics[name]["equal_script_mean_macro_f1"] = metrics.get("equal_script_mean_macro_f1")
            final_metrics[name]["equal_script_mean_top1"] = metrics.get("equal_script_mean_top1")
        state.update(status="completed", current_target=None, current_loss=None,
                     comparison_path=str(comparison_path), comparison_sha256=file_hash(comparison_path),
                     final_metrics=final_metrics, error=None)
        save_json(save_root / "experiment.json", state)
    except Exception as error:
        state.update(status="failed", error=f"{type(error).__name__}: {error}")
        save_json(save_root / "experiment.json", state)
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    worker = commands.add_parser("run")
    worker.add_argument("--data-root", required=True, type=Path)
    worker.add_argument("--save-root", required=True, type=Path)
    worker.add_argument("--runtime-sha256", required=True)
    args = parser.parse_args()
    _worker(args.data_root, args.save_root, args.runtime_sha256)


if __name__ == "__main__":
    main()
