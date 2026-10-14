"""Character inventory, conservative leakage groups, and frozen holdout manifests."""
from __future__ import annotations

import hashlib
import json
import math
import os
import random
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

import imagehash
import numpy as np
from PIL import Image, ImageOps

from ai.preprocess import canonical_gray, preprocess_image

ROOTS = {
    "lontara": ("lontara/aksara-lontara-fix",),
    "sunda": ("sunda/dataset_gabung_fix",),
    "bali": ("bali/AKSARA SWALALITA ALL", "bali/AKSARA WYAJANA ALL"),
}
BASELINE = {"lontara": (114, 11483), "sunda": (30, 1800), "bali": (30, 1691)}
PARTITIONS = ("train", "selection", "calibration", "test")
DEFAULT_RATIOS = dict(zip(PARTITIONS, (0.7, 0.1, 0.05, 0.15)))
NEAR_DISTANCE = 4
AUDIT_VERSION = "character-audit-v1"


def canonical_hash(value: object) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def _write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def _load_json(path: Path) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        raise ValueError(f"Cannot read JSON {path}: {error}") from error


def _labels(path: Path) -> dict:
    value = _load_json(path)
    if not isinstance(value, dict) or not value:
        raise ValueError(f"Invalid label mapping {path}: expected nonempty script object")
    for script, records in value.items():
        if not isinstance(records, list) or not records:
            raise ValueError(f"Empty label space for {script} in {path}")
        if not all(isinstance(record, dict) for record in records):
            raise ValueError(f"Invalid class records for {script} in {path}")
        ids = [record.get("class_id") for record in records]
        names = [record.get("source_label") for record in records]
        if not all(isinstance(name, str) and name for name in names):
            raise ValueError(f"Invalid exact source label for {script} in {path}")
        if ids != list(range(len(records))) or any(isinstance(i, bool) for i in ids) or len(set(names)) != len(names):
            raise ValueError(f"Noncontiguous IDs or duplicate labels for {script} in {path}")
        for record in records:
            leaf = record.get("relative_leaf_path")
            if not isinstance(leaf, str) or Path(leaf).is_absolute() or ".." in Path(leaf).parts:
                raise ValueError(f"Invalid relative leaf for {script} in {path}")
            if not isinstance(record.get("category"), str) or record.get("mapping_status") not in ("unverified", "verified"):
                raise ValueError(f"Invalid category/mapping status for {script} in {path}")
    return value


class _Union:
    def __init__(self, size: int):
        self.parent = list(range(size))

    def find(self, item: int) -> int:
        root = item
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[item] != item:
            parent = self.parent[item]
            self.parent[item] = root
            item = parent
        return root

    def join(self, left: int, right: int) -> None:
        left, right = self.find(left), self.find(right)
        self.parent[max(left, right)] = min(left, right)


class _HashTree:
    """BK tree visits only pHash ranges compatible with Hamming radius."""
    def __init__(self):
        self.nodes: list[tuple[int, dict[int, int]]] = []

    def query(self, value: int) -> Iterable[tuple[int, int]]:
        pending = [0] if self.nodes else []
        while pending:
            index = pending.pop()
            other, children = self.nodes[index]
            distance = (value ^ other).bit_count()
            if distance <= NEAR_DISTANCE:
                yield other, distance
            pending.extend(child for edge, child in children.items()
                           if distance - NEAR_DISTANCE <= edge <= distance + NEAR_DISTANCE)

    def add(self, value: int) -> None:
        if not self.nodes:
            self.nodes.append((value, {}))
            return
        index = 0
        while True:
            other, children = self.nodes[index]
            distance = (value ^ other).bit_count()
            if distance not in children:
                children[distance] = len(self.nodes)
                self.nodes.append((value, {}))
                return
            index = children[distance]


def _reason(sample: dict, reason: str) -> None:
    sample["status"] = "quarantine"
    sample.setdefault("quarantine_reasons", []).append(reason)


def _decode(path: Path, sample: dict) -> None:
    try:
        raw = path.read_bytes()
        sample.update(byte_size=len(raw), byte_sha256=hashlib.sha256(raw).hexdigest())
        with Image.open(path) as image:
            sample.update(format=image.format, mode=image.mode, width=image.width, height=image.height)
            image.load()
            rgba = ImageOps.exif_transpose(image).convert("RGBA")
            white = Image.new("RGBA", rgba.size, "white")
            rgb = Image.alpha_composite(white, rgba).convert("RGB")
            sample.update(oriented_width=rgb.width, oriented_height=rgb.height)
            sample["pixel_sha256"] = hashlib.sha256(
                str(rgb.size).encode() + b"\0RGB\0" + rgb.tobytes()).hexdigest()
            gray = canonical_gray(image)
            sample["phash"] = str(imagehash.phash(Image.fromarray(gray.astype(np.uint8)), hash_size=8))
            result = preprocess_image(image)
            sample["preprocessing"] = result["metadata"]
            sample["decode_status"] = "ok"
            if result["status"] == "empty":
                _reason(sample, "empty_foreground")
    except (OSError, ValueError, SyntaxError, Image.DecompressionBombError) as error:
        sample["decode_status"] = "error"
        _reason(sample, f"decode_error: {error}")


def _source_metadata(path: Path, sample: dict) -> None:
    sidecar = path.with_suffix(".json")
    if not sidecar.exists():
        return
    try:
        metadata = _load_json(sidecar)
        if not isinstance(metadata, dict):
            raise ValueError("metadata must be object")
        sample["source_metadata_sha256"] = canonical_hash(metadata)
        # Filenames and unverified claims are never proof of writer independence.
        if metadata.get("verified") is True and metadata.get("verification_source"):
            for key in ("writer_id", "page_id", "origin_id"):
                if isinstance(metadata.get(key), str) and metadata[key]:
                    sample[key] = metadata[key]
            sample["metadata_verification_source"] = metadata["verification_source"]
        sample["cohort"] = metadata.get("cohort")
        sample["captured_at"] = metadata.get("captured_at")
    except ValueError as error:
        _reason(sample, f"invalid_source_metadata: {error}")


def _sample(path: Path, data_root: Path, script: str, label: dict, source: str) -> dict:
    relative = Path(os.path.relpath(path.resolve(), data_root.resolve())).as_posix()
    return {"sample_id": hashlib.sha256(f"{script}\0{relative}".encode()).hexdigest(),
            "path": relative, "script": script, "class_id": label["class_id"],
            "source_label": label["source_label"], "category": label["category"],
            "source": source, "provenance_group": f"kaggle:{script}" if source == "source" else "canvas-consented",
            "writer_id": None, "status": "valid", "quarantine_reasons": []}


def _source_samples(data_root: Path, labels: dict) -> tuple[list[dict], dict, list[str]]:
    samples, inventory, errors = [], {}, []
    for script, records in labels.items():
        observed = set()
        wrappers = ROOTS.get(script, ())
        for wrapper in wrappers:
            base = data_root / wrapper
            if base.is_dir():
                observed.update(p.relative_to(data_root).as_posix() for p in base.iterdir() if p.is_dir())
        expected = {r["relative_leaf_path"] for r in records}
        if observed - expected:
            errors.append(f"{script}: unexpected leaves {sorted(observed-expected)}; frozen label mapping must be reviewed")
        count = 0
        for label in records:
            leaf = data_root / label["relative_leaf_path"]
            for path in sorted(leaf.rglob("*")) if leaf.is_dir() else []:
                if not path.is_file() or path.suffix.lower() == ".json":
                    continue
                sample = _sample(path, data_root, script, label, "source")
                _decode(path, sample)
                _source_metadata(path, sample)
                samples.append(sample)
                count += 1
        baseline = BASELINE.get(script)
        inventory[script] = {"classes": len(observed), "file_entries": count,
                             "missing_leaves": sorted(expected - observed),
                             "unexpected_leaves": sorted(observed - expected),
                             "baseline_classes": baseline[0] if baseline else None,
                             "baseline_file_entries": baseline[1] if baseline else None,
                             "baseline_matches": baseline == (len(observed), count)}
    return samples, inventory, errors


def _canvas_metadata(path: Path, sample: dict, labels: dict) -> None:
    metadata = _load_json(path.with_suffix(".json"))
    if not isinstance(metadata, dict):
        raise ValueError("canvas metadata must be object")
    consent = metadata.get("consent")
    if not isinstance(consent, dict) or consent.get("training") is not True or consent.get("research") is not True:
        raise ValueError("explicit training and research consent required")
    for key in ("writer_id", "session_id", "device_id", "captured_at"):
        if not isinstance(metadata.get(key), str) or not metadata[key].strip():
            raise ValueError(f"missing pseudonymous {key}")
    if metadata.get("partition") not in PARTITIONS:
        raise ValueError("partition must be train/selection/calibration/test")
    if metadata.get("input_mode") not in ("mouse", "touch", "stylus"):
        raise ValueError("input_mode must be mouse/touch/stylus")
    if metadata.get("script") != sample["script"] or metadata.get("source_label") != sample["source_label"]:
        raise ValueError("canvas metadata script/source_label mismatch")
    if metadata.get("image_sha256") and metadata["image_sha256"] != sample.get("byte_sha256"):
        raise ValueError("canvas PNG hash mismatch")
    for key in ("writer_id", "session_id", "device_id", "captured_at", "input_mode", "consent"):
        sample[key] = metadata[key]
    sample["partition_hint"] = metadata["partition"]
    sample["canvas_metadata_sha256"] = canonical_hash(metadata)


def _canvas_samples(canvas_root: Path, data_root: Path, labels: dict) -> tuple[list[dict], list[dict]]:
    samples, rejected = [], []
    lookup = {(script, r["source_label"]): r for script, records in labels.items() for r in records}
    if not canvas_root.is_dir():
        raise ValueError(f"Canvas root does not exist: {canvas_root}")
    for path in sorted(canvas_root.rglob("*.png")):
        try:
            metadata = _load_json(path.with_suffix(".json"))
            if not isinstance(metadata, dict):
                raise ValueError("canvas metadata must be object")
            key = (metadata.get("script"), metadata.get("source_label"))
            if key not in lookup:
                raise ValueError(f"unknown canvas label {key}")
            sample = _sample(path, data_root, key[0], lookup[key], "canvas")
            _decode(path, sample)
            try:
                _canvas_metadata(path, sample, labels)
            except ValueError as error:
                _reason(sample, f"invalid_canvas_metadata: {error}")
            samples.append(sample)
        except (ValueError, TypeError) as error:
            rejected.append({"path": str(path), "status": "quarantine", "reason": str(error)})
    return samples, rejected


def _derivative_stem(path: str) -> str:
    stem = Path(path).stem.casefold()
    previous = None
    while previous != stem:
        previous = stem
        stem = re.sub(r"\s*(?:\(\d+\)|(?:\s*-\s*)?copy(?:\s*\(\d+\)|\s*\d+)?)$", "", stem).strip()
    return stem


def _connect_buckets(buckets: dict, union: _Union) -> None:
    for members in buckets.values():
        for member in members[1:]:
            union.join(members[0], member)


def _exact_relations(samples: list[dict], union: _Union) -> list[dict]:
    buckets: dict = defaultdict(list)
    for index, sample in enumerate(samples):
        for field in ("byte_sha256", "pixel_sha256"):
            if sample.get(field):
                buckets[(field, sample[field])].append(index)
    exact_union = _Union(len(samples))
    _connect_buckets(buckets, exact_union)
    components: dict = defaultdict(list)
    for index in range(len(samples)):
        components[exact_union.find(index)].append(index)
    relations = []
    for members in components.values():
        if len(members) < 2:
            continue
        for member in members[1:]:
            union.join(members[0], member)
        classes = {(samples[i]["script"], samples[i]["class_id"]) for i in members}
        conflict = len(classes) > 1
        valid = [i for i in members if samples[i]["status"] == "valid"]
        representative = min(valid, key=lambda i: samples[i]["path"]) if valid else None
        for index in members:
            if conflict:
                _reason(samples[index], "cross_label_exact_duplicate")
            elif index != representative:
                _reason(samples[index], "same_label_exact_duplicate")
                samples[index]["duplicate_of"] = samples[representative]["sample_id"] if representative is not None else None
        relations.append({"sample_ids": [samples[i]["sample_id"] for i in members],
                          "cross_label": conflict, "representative": None if conflict or representative is None else samples[representative]["sample_id"]})
    return relations


def _near_relations(samples: list[dict], union: _Union) -> list[dict]:
    buckets: dict[int, list[int]] = defaultdict(list)
    for index, sample in enumerate(samples):
        if sample.get("phash"):
            buckets[int(sample["phash"], 16)].append(index)
    tree, relations = _HashTree(), []
    for value in sorted(buckets):
        members = buckets[value]
        matches = [(value, 0)] if len(members) > 1 else []
        matches.extend(tree.query(value))
        for other, distance in matches:
            right = buckets[other]
            all_members = sorted(set(members + right))
            for index in all_members[1:]:
                union.join(all_members[0], index)
            classes = {(samples[i]["script"], samples[i]["class_id"]) for i in all_members}
            # Bucket products represent every candidate without quadratic JSON duplication.
            relations.append({"left": [samples[i]["sample_id"] for i in members],
                              "right": [samples[i]["sample_id"] for i in right],
                              "distance": distance, "cross_label": len(classes) > 1,
                              "review_status": "unreviewed", "possible_false_grouping": True})
        tree.add(value)
    return relations


def _group(samples: list[dict]) -> tuple[list[dict], list[dict]]:
    union, ancestry = _Union(len(samples)), defaultdict(list)
    for index, sample in enumerate(samples):
        scope = sample["provenance_group"]
        for key in ("writer_id", "page_id", "origin_id"):
            if sample.get(key):
                ancestry[(scope, key, sample[key])].append(index)
        if sample["source"] == "source":
            ancestry[(scope, "derivative", str(Path(sample["path"]).parent), _derivative_stem(sample["path"]))].append(index)
    _connect_buckets(ancestry, union)
    exact = _exact_relations(samples, union)
    near = _near_relations(samples, union)
    components: dict = defaultdict(list)
    partition_hints: dict = defaultdict(set)
    for index, sample in enumerate(samples):
        root = union.find(index)
        components[root].append(sample["sample_id"])
        if sample.get("partition_hint"):
            partition_hints[root].add(sample["partition_hint"])
    for index, sample in enumerate(samples):
        root = union.find(index)
        sample["group_id"] = canonical_hash(sorted(components[root]))
        # A deduplicated capture still constrains its surviving ancestry group.
        sample["group_partition_hints"] = sorted(partition_hints[root])
    return exact, near


def _canvas_summary(samples: list[dict], labels: dict) -> dict:
    valid = [s for s in samples if s["source"] == "canvas" and s["status"] == "valid"]
    report = {}
    for script, records in labels.items():
        selected = [s for s in valid if s["script"] == script]
        writers = {s["writer_id"] for s in selected}
        counts = Counter((s["writer_id"], s["class_id"]) for s in selected)
        complete = [writer for writer in sorted(writers) if all(counts[writer, r["class_id"]] >= 2 for r in records)]
        by_partition = {p: sorted({s["writer_id"] for s in selected if s["partition_hint"] == p}) for p in PARTITIONS}
        modes = {p: sorted({s["input_mode"] for s in selected if s["partition_hint"] == p}) for p in PARTITIONS}
        targets = dict(zip(PARTITIONS, (4, 2, 2, 2)))
        enough = all(len(set(by_partition[p]) & set(complete)) >= targets[p] for p in PARTITIONS)
        disjoint = all(not set(by_partition[p]) & set(by_partition[q]) for i, p in enumerate(PARTITIONS) for q in PARTITIONS[i + 1:])
        report[script] = {"writers": len(writers), "complete_writers_two_per_class": complete,
                          "writers_by_partition": by_partition, "input_modes_by_partition": modes,
                          "collection_ready": enough and disjoint, "writer_partition_disjoint": disjoint,
                          "required_writers": targets, "status": "collected" if enough and disjoint else "human_collection_pending"}
    return report


def _class_summary(samples: list[dict], labels: dict) -> dict:
    buckets: dict = defaultdict(list)
    for sample in samples:
        buckets[(sample["script"], sample["class_id"])].append(sample)
    report = {}
    for script, records in labels.items():
        rows = []
        for record in records:
            selected = buckets[(script, record["class_id"])]
            valid = [s for s in selected if s["status"] == "valid"]
            rows.append({"class_id": record["class_id"], "source_label": record["source_label"],
                         "total": len(selected), "valid": len(valid), "quarantine": len(selected) - len(valid),
                         "independent_groups": len({s["group_id"] for s in valid}),
                         "verified_writer_samples": sum(s["writer_id"] is not None for s in valid)})
        report[script] = rows
    return report


def audit(data_root: Path, out: Path, canvas_root: Path | None = None,
          labels_path: Path = Path("ai/configs/labels.json")) -> dict:
    labels = _labels(labels_path)
    samples, inventory, errors = _source_samples(data_root, labels)
    rejected = []
    if canvas_root is not None:
        canvas, rejected = _canvas_samples(canvas_root, data_root, labels)
        samples.extend(canvas)
    samples.sort(key=lambda s: (s["script"], s["path"]))
    exact, near = _group(samples)
    empty_classes = [{"script": script, "class_id": r["class_id"], "source_label": r["source_label"]}
                     for script, records in labels.items() for r in records
                     if not any(s["script"] == script and s["class_id"] == r["class_id"] and s["status"] == "valid" for s in samples)]
    if empty_classes:
        errors.append(f"Classes with no valid images: {empty_classes}")
    label_hash = canonical_hash(labels)
    dataset_hash = canonical_hash({"samples": samples, "label_hash": label_hash, "version": AUDIT_VERSION})
    report = {"audit_version": AUDIT_VERSION, "dataset_hash": dataset_hash, "label_hash": label_hash,
              "class_counts": _class_summary(samples, labels),
              "data_root": str(data_root.resolve()), "labels": labels, "inventory": inventory,
              "counts": dict(Counter(s["status"] for s in samples)), "empty_classes": empty_classes,
              "errors": errors, "exact_duplicates": exact, "near_duplicates": near,
              "near_duplicate_policy": "64-bit canonical-polarity pHash, Hamming <=4; unreviewed conservative unions",
              "quarantine": [s for s in samples if s["status"] == "quarantine"] + rejected,
              "formats": dict(Counter(s.get("format", "undecodable") for s in samples)),
              "polarity_counts": dict(Counter("inverted" if s["preprocessing"]["inverted"] else "native"
                                            for s in samples if "preprocessing" in s)),
              "quality_slices": {key: [s["sample_id"] for s in samples if s.get("preprocessing", {}).get(key)]
                                 for key in ("perimeter_ambiguous", "border_contact")},
              "cohort_slices": {key: dict(Counter(str(s[key]) for s in samples if s.get(key)))
                               for key in ("cohort", "captured_at", "input_mode")},
              "native_32x32": [s["sample_id"] for s in samples if s.get("width") == 32 and s.get("height") == 32],
              "canvas": _canvas_summary(samples, labels),
              "mapping_unverified": [script for script, records in labels.items() if any(r["mapping_status"] != "verified" for r in records)],
              "benchmark_description": "duplicate/ancestry-group-held-out; writer-independent only where verified metadata permits",
              "provenance_decisions": "external provenance configuration required; audit grants no training/release rights"}
    _write_json(out / "samples.json", {"samples": samples})
    _write_json(out / "manifest.json", report)
    if errors:
        raise ValueError(f"Audit {out / 'manifest.json'} blocked: {'; '.join(errors)}")
    return report


def _split_config(config_path: Path) -> tuple[int, dict[str, float], str]:
    config = _load_json(config_path)
    setting = config.get("split", {})
    seed, ratios = setting.get("seed", 42), setting.get("ratios", DEFAULT_RATIOS)
    if not isinstance(seed, int) or isinstance(seed, bool):
        raise ValueError(f"Invalid split seed in {config_path}")
    if set(ratios) != set(PARTITIONS) or not all(isinstance(v, (int, float)) and math.isfinite(v) and v > 0 for v in ratios.values()):
        raise ValueError(f"Invalid positive four-partition ratios in {config_path}")
    if not math.isclose(sum(ratios.values()), 1.0, abs_tol=1e-9):
        raise ValueError(f"Split ratios must sum to one in {config_path}")
    return seed, ratios, canonical_hash({"seed": seed, "ratios": ratios})


def _group_counts(samples: list[dict]) -> tuple[dict, dict, dict]:
    members: dict = defaultdict(list)
    for sample in samples:
        members[sample["group_id"]].append(sample)
    counts = {group: Counter((s["script"], s["class_id"]) for s in records) for group, records in members.items()}
    hints = {group: set().union(*(set(s.get("group_partition_hints", [])) |
             ({s["partition_hint"]} if s.get("partition_hint") else set()) for s in records))
             for group, records in members.items()}
    return members, counts, hints


def _coverage_blockers(labels: dict, counts: dict, hints: dict) -> dict:
    blocked = {}
    for script, records in labels.items():
        failures = []
        for record in records:
            key = (script, record["class_id"])
            groups = [g for g, count in counts.items() if count[key]]
            free = [g for g in groups if not hints[g]]
            fixed = set().union(*(hints[g] for g in groups)) if groups else set()
            missing = [p for p in PARTITIONS if p not in fixed]
            conflicting = [g for g in groups if len(hints[g]) > 1]
            if len(free) < len(missing) or conflicting:
                failures.append({"class_id": record["class_id"], "source_label": record["source_label"],
                                 "groups": len(groups), "unassigned_groups": len(free),
                                 "fixed_partitions": sorted(fixed), "conflicting_groups": conflicting,
                                 "additional_groups_required": max(0, len(missing) - len(free))})
        if failures:
            blocked[script] = {"reason": "Independent four-partition coverage infeasible or canvas writer/group crosses fixed partitions", "classes": failures}
    return blocked


def _assign(counts: dict, hints: dict, ratios: dict, seed: int) -> dict:
    totals = sum(counts.values(), Counter())
    support = Counter(key for counter in counts.values() for key in counter)
    best, best_score = {}, float("inf")
    # Deterministic alternate tie orders avoid a single unlucky greedy coverage placement.
    for attempt in range(32):
        rng = random.Random(seed + attempt)
        tie = {g: rng.random() for g in sorted(counts)}
        order = sorted(counts, key=lambda g: (0 if hints[g] else 1,
                       min(support[k] for k in counts[g]), -sum(counts[g].values()), tie[g], g))
        assigned, current = {}, {p: Counter() for p in PARTITIONS}
        for group in order:
            options = sorted(hints[group]) if hints[group] else list(PARTITIONS)
            def cost(partition: str) -> tuple:
                gain = sum(current[partition][k] == 0 for k in counts[group])
                delta = sum(((current[partition][k] + n - totals[k] * ratios[partition]) ** 2
                             - (current[partition][k] - totals[k] * ratios[partition]) ** 2) / max(1, totals[k])
                            for k, n in counts[group].items())
                return (-gain, delta, PARTITIONS.index(partition))
            partition = min(options, key=cost)
            assigned[group] = partition
            current[partition].update(counts[group])
        missing = sum(current[p][key] == 0 for p in PARTITIONS for key in totals)
        deviation = sum((current[p][key] - totals[key] * ratios[p]) ** 2 / max(1, totals[key]) for p in PARTITIONS for key in totals)
        score = missing * 1e12 + deviation
        if score < best_score:
            best, best_score = assigned, score
    return best


def _result_coverage(labels: dict, samples: list[dict], assignments: dict) -> tuple[dict, dict]:
    coverage = Counter((s["script"], s["class_id"], assignments[s["group_id"]]) for s in samples)
    report, blocked = {}, {}
    for script, records in labels.items():
        rows = [{"class_id": r["class_id"], "source_label": r["source_label"],
                 "counts": {p: coverage[script, r["class_id"], p] for p in PARTITIONS}} for r in records]
        report[script] = rows
        failures = [r for r in rows if not all(r["counts"].values())]
        if failures:
            blocked[script] = {"reason": "Group-aware greedy assignment cannot cover every class; provide additional independent groups or review conservative near groups", "classes": failures}
    return report, blocked


def _raise_blocked(manifest: dict, path: Path) -> None:
    if manifest["blocked_scripts"]:
        raise ValueError(f"Split {path} has blocked scripts: {json.dumps(manifest['blocked_scripts'], ensure_ascii=False)}")


def split(audit_dir: Path, config_path: Path, out: Path) -> dict:
    audit_manifest = _load_json(audit_dir / "manifest.json")
    samples = _load_json(audit_dir / "samples.json")["samples"]
    labels = audit_manifest["labels"]
    label_hash = canonical_hash(labels)
    dataset_hash = canonical_hash({"samples": samples, "label_hash": label_hash, "version": audit_manifest["audit_version"]})
    if label_hash != audit_manifest["label_hash"] or dataset_hash != audit_manifest["dataset_hash"]:
        raise ValueError(f"Audit hash mismatch in {audit_dir}; rerun audit explicitly")
    seed, ratios, config_hash = _split_config(config_path)
    path = out / "manifest.json"
    if path.exists():
        existing = _load_json(path)
        expected = (dataset_hash, label_hash, config_hash)
        actual = tuple(existing.get(k) for k in ("dataset_hash", "label_hash", "config_hash"))
        if actual != expected or existing.get("split_hash") != canonical_hash({k: v for k, v in existing.items() if k != "split_hash"}):
            raise ValueError(f"Immutable split mismatch at {path}; choose a new output directory")
        _raise_blocked(existing, path)
        return existing
    valid = [s for s in samples if s["status"] == "valid"]
    members, counts, hints = _group_counts(valid)
    blocked = _coverage_blockers(labels, counts, hints)
    ready_labels = {s: records for s, records in labels.items() if s not in blocked}
    eligible = [s for s in valid if s["script"] in ready_labels]
    _, eligible_counts, eligible_hints = _group_counts(eligible)
    assignments = _assign(eligible_counts, eligible_hints, ratios, seed)
    coverage, assignment_blockers = _result_coverage(ready_labels, eligible, assignments)
    blocked.update(assignment_blockers)
    chosen = [dict(s, partition=assignments[s["group_id"]]) for s in eligible if s["script"] not in blocked]
    manifest = {"samples": chosen, "dataset_hash": dataset_hash, "label_hash": label_hash,
                "config_hash": config_hash, "data_root": audit_manifest["data_root"],
                "seed": seed, "ratios": ratios, "coverage": coverage,
                "ready_scripts": sorted(set(labels) - set(blocked)), "blocked_scripts": blocked,
                "benchmark_description": audit_manifest["benchmark_description"],
                "canvas": audit_manifest["canvas"], "audit_errors": audit_manifest.get("errors", [])}
    manifest["split_hash"] = canonical_hash(manifest)
    _write_json(path, manifest)
    _raise_blocked(manifest, path)
    return manifest
