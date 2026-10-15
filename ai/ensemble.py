"""Selection-only simplex soft voting and frozen teacher construction."""
from __future__ import annotations

import argparse
from itertools import combinations, product
import os
from pathlib import Path

import numpy as np

from ai.evaluate import classification_metrics, load_candidate, softmax
from ai.models import SoftVote
from ai.train import choose_loss, context, digest, file_hash, partition_rows, read_json, save_json


def simplex_weights(members: int, step: float = 0.25) -> list[list[float]]:
    units = round(1 / step)
    if abs(units * step - 1) > 1e-12:
        raise ValueError("Simplex step must divide one")
    return [[part / units for part in parts] for parts in product(range(units + 1), repeat=members) if sum(parts) == units]


def load_selection(run: Path, ctx: dict) -> dict:
    manifest = read_json(run / "manifest.json")
    if manifest["status"] != "complete" or manifest["identity"]["smoke"]:
        raise ValueError(f"{run} is not a full completed candidate")
    metadata = read_json(run / "selection.json")
    identity = metadata["identity"]
    if identity["script"] != ctx["script"] or identity["size"] != 128:
        raise ValueError("Ensemble requires same-script resolution128 candidates")
    for key in ("dataset_hash", "split_hash", "label_hash", "preprocessing_hash"):
        if identity["hashes"][key] != ctx["hashes"][key]:
            raise ValueError(f"Ensemble candidate {key} mismatch")
    with np.load(run / "selection.npz", allow_pickle=False) as stored:
        arrays = {key: stored[key].copy() for key in ("logits", "labels", "sample_ids")}
    expected_rows = metadata["rows"]
    if arrays["sample_ids"].tolist() != [row["sample_id"] for row in expected_rows]:
        raise ValueError("Selection prediction IDs do not match frozen metadata order")
    if arrays["labels"].tolist() != [row["class_id"] for row in expected_rows]:
        raise ValueError("Selection prediction targets do not match frozen labels")
    allowed = {row["sample_id"]: row for row in ctx["samples"] if row["partition"] == "selection"}
    if any(allowed.get(row["sample_id"]) != row for row in expected_rows):
        raise ValueError("Selection metadata contains samples outside selection partition")
    if arrays["logits"].shape != (len(arrays["labels"]), len(ctx["labels"])):
        raise ValueError("Selection logits shape mismatch")
    if not np.isfinite(arrays["logits"]).all():
        raise ValueError("Nonfinite selection logits")
    return {"path": str(run.resolve()), "metadata": metadata, "manifest": manifest,
            "checkpoint_sha256": file_hash(run / "best.pt"), **arrays,
            "metrics": classification_metrics(arrays["logits"], arrays["labels"], len(ctx["labels"]))}


def rank(metrics: dict, members: int = 1) -> tuple[float, float, int]:
    return metrics["macro_f1"], metrics["min_recall"], -members


def family_reruns(runs: list[Path]) -> dict:
    families: dict[str, list[dict]] = {}
    for path in runs:
        run = read_json(path / "manifest.json")
        if run["status"] == "complete" and not run["identity"]["smoke"]:
            families.setdefault(run["identity"]["model"], []).append(run)
    result = {}
    for family, members in families.items():
        seeds = {m["identity"]["seed"] for m in members}
        scores = [m["best"]["macro_f1"] for m in members]
        result[family] = {"seeds": sorted(seeds), "complete_seed_reruns": {42, 43, 44}.issubset(seeds),
                          "macro_f1_mean": float(np.mean(scores)), "macro_f1_std": float(np.std(scores)),
                          "actual_checkpoints": [m["identity"] for m in members]}
    return result


def resolution_eligible(base: dict, ablation: dict) -> bool:
    if base["identity"]["size"] != 128 or ablation["identity"]["size"] != 224:
        raise ValueError("Resolution ablation must compare128 with224")
    for key in ("script", "model", "loss", "seed"):
        if base["identity"][key] != ablation["identity"][key]:
            raise ValueError(f"Resolution ablation {key} mismatch")
    if ablation["identity"]["seed"] != 42:
        raise ValueError("Resolution ablation requires seed42")
    return ablation["best"]["macro_f1"] - base["best"]["macro_f1"] >= 0.005


def compare_arrays(candidates: list[dict]) -> None:
    reference = candidates[0]
    losses = {candidate["metadata"]["identity"]["loss"] for candidate in candidates}
    if len(losses) != 1:
        raise ValueError("Ensemble candidates must use the same pilot-selected primary loss")
    for candidate in candidates[1:]:
        for field in ("sample_ids", "labels"):
            if not np.array_equal(reference[field], candidate[field]):
                raise ValueError(f"Ensemble {field} mismatch; no automatic reorder")
        if reference["metadata"]["rows"] != candidate["metadata"]["rows"]:
            raise ValueError("Selection sample metadata/order differs")


def score_vote(candidates: list[dict], indices: tuple[int, ...], weights: list[float], kind: str) -> dict:
    probabilities = sum(weight * softmax(candidates[index]["logits"]) for index, weight in zip(indices, weights))
    logits = np.log(np.maximum(probabilities, 1e-12))
    metrics = classification_metrics(logits, candidates[0]["labels"], probabilities.shape[1])
    active = [i for i, weight in zip(indices, weights) if weight > 0]
    return {"kind": kind, "indices": list(indices), "weights": weights, "active_members": len(active), "metrics": metrics}


def error_disagreement(candidates: list[dict]) -> list[dict]:
    result = []
    labels = candidates[0]["labels"]
    for first, second in combinations(range(len(candidates)), 2):
        a, b = candidates[first]["logits"].argmax(1), candidates[second]["logits"].argmax(1)
        result.append({"members": [first, second], "prediction_disagreement": float((a != b).mean()),
                       "error_disagreement": float(((a != labels) != (b != labels)).mean()),
                       "both_wrong": float(((a != labels) & (b != labels)).mean())})
    return result


def selection_paths(args: argparse.Namespace) -> list[Path]:
    members = getattr(args, "members", None)
    if members:
        return [Path(path) for path in members]
    root = Path(args.runs)
    return sorted(path.parent for path in root.rglob("manifest.json") if (path.parent / "selection.npz").is_file())


def run(args: argparse.Namespace) -> dict:
    ctx = context(args)
    ctx["script"] = args.script
    if ctx["size"] != 128:
        raise ValueError("224 candidates are standalone comparators, never ensemble members")
    candidates = []
    selected_loss = choose_loss(args, ctx, partition_rows(ctx, "train"))
    for path in selection_paths(args):
        manifest = read_json(path / "manifest.json")
        identity = manifest.get("identity", {})
        if identity.get("loss") != selected_loss or identity.get("stage") != getattr(args, "stage", "supervised"):
            continue
        if identity.get("script") == args.script and identity.get("size") == 128 and identity.get("stage") != "distill":
            if manifest["status"] == "complete" and not identity["smoke"]:
                candidates.append(load_selection(path, ctx))
    if len(candidates) < 2:
        raise ValueError("Ensemble experiment needs at least two completed model families")
    compare_arrays(candidates)
    all_run_paths = [Path(candidate["path"]) for candidate in candidates]
    # One actual validation-selected checkpoint per family, never cherry-pick using test.
    families: dict[str, dict] = {}
    for candidate in candidates:
        family = candidate["metadata"]["identity"]["model"]
        previous = families.get(family)
        if previous is None or rank(candidate["metrics"]) > rank(previous["metrics"]):
            families[family] = candidate
    candidates = sorted(families.values(), key=lambda candidate: rank(candidate["metrics"]), reverse=True)[:3]
    if len(candidates) < 2:
        raise ValueError("Ensembling multiple seeds of one family is outside the experiment contract")
    trials = [score_vote(candidates, (i,), [1.0], "single") for i in range(len(candidates))]
    for count in range(2, len(candidates) + 1):
        for indices in combinations(range(len(candidates)), count):
            trials.append(score_vote(candidates, indices, [1 / count] * count, "equal"))
            trials.extend(score_vote(candidates, indices, weights, "weighted") for weights in simplex_weights(count))
    winner = max(trials, key=lambda trial: rank(trial["metrics"], trial["active_members"]))
    best_single = max((trial for trial in trials if trial["kind"] == "single"), key=lambda trial: rank(trial["metrics"]))
    genuine = [trial for trial in trials if trial["active_members"] >= 2]
    teacher = max(genuine, key=lambda trial: rank(trial["metrics"], trial["active_members"])) if winner["active_members"] >= 2 else max(
        (trial for trial in genuine if trial["kind"] == "equal"), key=lambda trial: rank(trial["metrics"], trial["active_members"]))
    out = Path(args.out)
    member_records = [{"path": Path(os.path.relpath(candidate["path"], out.resolve())).as_posix(), "checkpoint_sha256": candidate["checkpoint_sha256"],
                       "identity": candidate["metadata"]["identity"], "metrics": candidate["metrics"]} for candidate in candidates]
    manifest = {"script": args.script, "size": 128, "hashes": ctx["hashes"], "members": member_records,
                "winner": winner, "teacher": teacher, "trials": trials,
                "gain_vs_best_single": winner["metrics"]["macro_f1"] - best_single["metrics"]["macro_f1"],
                "disagreement": error_disagreement(candidates), "support": len(candidates[0]["labels"]),
                "selection_ids_hash": digest(candidates[0]["sample_ids"].tolist()),
                "inference_cost": {"active_members": winner["active_members"],
                                   "aggregate_checkpoint_bytes": sum((Path(candidates[index]["path"]) / "best.pt").stat().st_size
                                                                      for index, weight in zip(winner["indices"], winner["weights"]) if weight > 0),
                                   "browser_latency_status": "measurement-required"},
                "family_reruns": family_reruns(all_run_paths)}
    save_json(out / "ensemble.json", manifest)
    save_json(out / "teacher.json", dict(manifest, deployment="teacher"))
    for name, trial in (("winner", winner), ("teacher", teacher)):
        probabilities = sum(weight * softmax(candidates[i]["logits"]) for i, weight in zip(trial["indices"], trial["weights"]))
        np.savez_compressed(out / f"{name}-selection.npz", logits=np.log(np.maximum(probabilities, 1e-12)),
                            labels=candidates[0]["labels"], sample_ids=candidates[0]["sample_ids"])
    return manifest


def load_teacher(path: Path, ctx: dict) -> tuple[SoftVote, dict]:
    manifest = read_json(path)
    if manifest["script"] != ctx["script"] or manifest["size"] != 128 or ctx["size"] != 128:
        raise ValueError("Teacher script/resolution mismatch")
    for key in ("dataset_hash", "split_hash", "label_hash", "preprocessing_hash"):
        if manifest["hashes"][key] != ctx["hashes"][key]:
            raise ValueError(f"Teacher {key} mismatch")
    trial = manifest["teacher"] if manifest.get("deployment") == "teacher" else manifest["winner"]
    members, weights, evidence = [], [], []
    for index, weight in zip(trial["indices"], trial["weights"]):
        if weight == 0:
            continue
        record = manifest["members"][index]
        checkpoint = path.parent / record["path"] / "best.pt"
        if file_hash(checkpoint) != record["checkpoint_sha256"]:
            raise ValueError(f"Teacher checkpoint changed: {checkpoint}")
        member, identity = load_candidate(checkpoint, ctx)
        members.append(member)
        weights.append(weight)
        evidence.append(identity)
    identity = {"model": "ensemble", "script": ctx["script"], "size": 128, "hashes": manifest["hashes"],
                "members": evidence, "weights": weights, "experiment_hash": digest(manifest)}
    return SoftVote(members, weights).eval(), identity
