"""Behavioral fixtures only: these images are never real canvas collection data."""
from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image

from ai.data import AUDIT_VERSION, PARTITIONS, audit, canonical_hash, split


def _json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding="utf-8")


def _load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _label(script: str, name: str, identifier: int) -> dict:
    wrapper = {"sunda": "sunda/dataset_gabung_fix", "lontara": "lontara/aksara-lontara-fix"}[script]
    return {"class_id": identifier, "source_label": name, "category": "aksara",
            "display_name": name, "unicode_sequence": None, "mapping_status": "unverified",
            "mapping_source": None, "relative_leaf_path": f"{wrapper}/{name}"}


def _image(path: Path, seed: int, invert: bool = False, fmt: str = "PNG") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pixels = np.full((48, 48), 255, dtype=np.uint8)
    pixels[8:40, 8:40] = np.random.default_rng(seed).integers(0, 180, (32, 32), dtype=np.uint8)
    Image.fromarray(255 - pixels if invert else pixels).save(path, format=fmt)


class AuditBehaviorTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.root, self.out = self.base / "data", self.base / "audit"
        self.labels = self.base / "labels.json"

    def configure(self, script: str, names: list[str]) -> dict:
        labels = {script: [_label(script, name, i) for i, name in enumerate(names)]}
        _json(self.labels, labels)
        return labels

    def test_aliases_are_preserved_and_ids_never_inferred(self):
        for script, aliases in (("lontara", ["Ke", "Ke_"]), ("sunda", ["ae", "e"])):
            with self.subTest(script=script):
                labels = self.configure(script, aliases)
                for index, record in enumerate(labels[script]):
                    _image(self.root / record["relative_leaf_path"] / "example.png", index + 10)
                result = audit(self.root, self.out, labels_path=self.labels)
                samples = _load(self.out / "samples.json")["samples"]
                self.assertEqual({s["source_label"] for s in samples}, set(aliases))
                self.assertEqual({s["class_id"] for s in samples}, {0, 1})
                self.assertEqual(result["label_hash"], canonical_hash(labels))
                self.assertTrue(all(s["writer_id"] is None for s in samples))
                self.assertTrue(all(r["unicode_sequence"] is None for r in labels[script]))

    def test_pixel_conflicts_quarantine_every_label_not_majority_vote(self):
        labels = self.configure("sunda", ["ae", "e"])
        for index, record in enumerate(labels["sunda"]):
            leaf = self.root / record["relative_leaf_path"]
            _image(leaf / "valid.png", 100 + index)
            _image(leaf / "shared.png", 999)
        leaf = self.root / labels["sunda"][0]["relative_leaf_path"]
        _image(leaf / "shared-bmp.png", 999, fmt="BMP")
        result = audit(self.root, self.out, labels_path=self.labels)
        samples = _load(self.out / "samples.json")["samples"]
        conflict = [s for s in samples if "shared" in s["path"]]
        self.assertEqual(len(conflict), 3)
        self.assertTrue(all(s["status"] == "quarantine" for s in conflict))
        self.assertTrue(all("cross_label_exact_duplicate" in s["quarantine_reasons"] for s in conflict))
        self.assertEqual(len({s["group_id"] for s in conflict}), 1)
        self.assertTrue(any(r["cross_label"] for r in result["exact_duplicates"]))
        self.assertEqual(next(s for s in conflict if "bmp" in s["path"])["format"], "BMP")
        self.assertTrue(all((self.root / s["path"]).exists() for s in conflict))

    def test_same_class_representative_is_path_minimum_and_ancestry_retained(self):
        labels = self.configure("sunda", ["a"])
        leaf = self.root / labels["sunda"][0]["relative_leaf_path"]
        for name in ("z.png", "a.png", "b.png"):
            _image(leaf / name, 1)
        audit(self.root, self.out, labels_path=self.labels)
        samples = _load(self.out / "samples.json")["samples"]
        valid = [s for s in samples if s["status"] == "valid"]
        self.assertEqual(len(valid), 1)
        self.assertTrue(valid[0]["path"].endswith("/a.png"))
        self.assertEqual({s["duplicate_of"] for s in samples if s["status"] == "quarantine"}, {valid[0]["sample_id"]})
        self.assertEqual(len({s["group_id"] for s in samples}), 1)

    def test_opposite_polarity_near_conflicts_group_without_deleting(self):
        labels = self.configure("sunda", ["a", "i"])
        for index, record in enumerate(labels["sunda"]):
            _image(self.root / record["relative_leaf_path"] / "near.png", 9, invert=bool(index))
        result = audit(self.root, self.out, labels_path=self.labels)
        samples = _load(self.out / "samples.json")["samples"]
        self.assertTrue(all(s["status"] == "valid" for s in samples))
        self.assertEqual(len({s["group_id"] for s in samples}), 1)
        self.assertTrue(any(r["cross_label"] and r["distance"] <= 4 for r in result["near_duplicates"]))

    def test_derivative_name_and_verified_writer_connect_without_filename_writer_claim(self):
        labels = self.configure("sunda", ["a"])
        leaf = self.root / labels["sunda"][0]["relative_leaf_path"]
        for index, name in enumerate(("scan.png", "scan (1).png", "scan - Copy (2).png", "other.png")):
            _image(leaf / name, index + 21)
        _json(leaf / "scan.json", {"verified": True, "verification_source": "publisher manifest", "writer_id": "w1"})
        _json(leaf / "other.json", {"verified": True, "verification_source": "publisher manifest", "writer_id": "w1"})
        audit(self.root, self.out, labels_path=self.labels)
        samples = _load(self.out / "samples.json")["samples"]
        self.assertEqual(len({s["group_id"] for s in samples}), 1)
        self.assertTrue(all(s["writer_id"] is None for s in samples if "Copy" in s["path"] or "(1)" in s["path"]))

    def test_corrupt_and_empty_class_are_explicit_without_source_deletion(self):
        labels = self.configure("sunda", ["a", "i"])
        _image(self.root / labels["sunda"][0]["relative_leaf_path"] / "valid.png", 11)
        corrupt = self.root / labels["sunda"][1]["relative_leaf_path"] / "bad.png"
        corrupt.parent.mkdir(parents=True)
        corrupt.write_bytes(b"not an image")
        with self.assertRaisesRegex(ValueError, "no valid images"):
            audit(self.root, self.out, labels_path=self.labels)
        result = _load(self.out / "manifest.json")
        self.assertEqual(result["empty_classes"][0]["source_label"], "i")
        self.assertTrue(any("decode_error" in reason for s in result["quarantine"] for reason in s["quarantine_reasons"]))
        self.assertTrue(corrupt.exists())

    def test_missing_dataset_writes_every_empty_class_before_error(self):
        self.configure("sunda", ["ae", "e"])
        with self.assertRaises(ValueError):
            audit(self.root, self.out, labels_path=self.labels)
        result = _load(self.out / "manifest.json")
        self.assertEqual({c["source_label"] for c in result["empty_classes"]}, {"ae", "e"})
        self.assertEqual(result["counts"], {})

    def test_canvas_requires_consent_and_keeps_explicit_holdout_partition(self):
        labels = self.configure("sunda", ["a"])
        _image(self.root / labels["sunda"][0]["relative_leaf_path"] / "source.png", 31)
        canvas = self.base / "canvas"
        for index, consent in enumerate((True, False)):
            path = canvas / f"sample-{index}.png"
            _image(path, index + 81)
            _json(path.with_suffix(".json"), {"script": "sunda", "source_label": "a", "writer_id": f"writer-{index}",
                  "session_id": "session", "device_id": "device", "input_mode": "stylus", "captured_at": "2026-10-12",
                  "partition": "test", "consent": {"training": consent, "research": consent, "private_upload": False},
                  "image_sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
        result = audit(self.root, self.out, canvas, self.labels)
        captured = [s for s in _load(self.out / "samples.json")["samples"] if s["source"] == "canvas"]
        valid = next(s for s in captured if s["status"] == "valid")
        self.assertEqual(valid["partition_hint"], "test")
        self.assertEqual(valid["group_partition_hints"], ["test"])
        self.assertTrue(valid["path"].startswith("../canvas/"))
        self.assertEqual(sum(s["status"] == "quarantine" for s in captured), 1)
        self.assertFalse(result["canvas"]["sunda"]["collection_ready"])

    def test_deduplicated_canvas_writers_still_constrain_conflicting_group(self):
        labels = self.configure("sunda", ["a"])
        _image(self.root / labels["sunda"][0]["relative_leaf_path"] / "source.png", 31)
        canvas = self.base / "canvas"
        for index, partition in enumerate(("selection", "test")):
            path = canvas / f"sample-{index}.png"
            _image(path, 51)
            _json(path.with_suffix(".json"), {"script": "sunda", "source_label": "a", "writer_id": f"w-{index}",
                  "session_id": "s", "device_id": "d", "input_mode": "mouse", "captured_at": "2026-10-12",
                  "partition": partition, "consent": {"training": True, "research": True}})
        audit(self.root, self.out, canvas, self.labels)
        samples = _load(self.out / "samples.json")["samples"]
        captured = [s for s in samples if s["source"] == "canvas"]
        self.assertEqual(sum(s["status"] == "valid" for s in captured), 1)
        self.assertTrue(all(s["group_partition_hints"] == ["selection", "test"] for s in captured))

    def test_canvas_replacement_can_fill_original_label_space_without_source_images(self):
        self.configure("sunda", ["a"])
        canvas = self.base / "canvas"
        path = canvas / "own.png"
        _image(path, 57)
        _json(path.with_suffix(".json"), {"script": "sunda", "source_label": "a", "writer_id": "w",
              "session_id": "s", "device_id": "d", "input_mode": "touch", "captured_at": "2026-10-12",
              "partition": "train", "consent": {"training": True, "research": True}})
        result = audit(self.root, self.out, canvas, self.labels)
        self.assertEqual(result["empty_classes"], [])
        self.assertTrue(result["inventory"]["sunda"]["missing_leaves"])
        self.assertEqual(result["counts"]["valid"], 1)

    def test_frozen_production_labels_keep_original_aliases_and_all_classes(self):
        labels = _load(Path("ai/configs/labels.json"))
        self.assertEqual({s: len(rows) for s, rows in labels.items()}, {"lontara": 114, "sunda": 30, "bali": 30})
        self.assertTrue({"Ke", "Ke_"} <= {r["source_label"] for r in labels["lontara"]})
        self.assertTrue({"ae", "e"} <= {r["source_label"] for r in labels["sunda"]})
        for records in labels.values():
            self.assertEqual([r["class_id"] for r in records], list(range(len(records))))
            self.assertEqual([r["relative_leaf_path"] for r in records], sorted(r["relative_leaf_path"] for r in records))
            self.assertTrue(all(r["unicode_sequence"] is None and r["mapping_status"] == "unverified" for r in records))


class SplitBehaviorTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.audit_dir, self.out = self.base / "audit", self.base / "splits"
        self.config = self.base / "config.json"
        _json(self.config, {"split": {"seed": 42, "ratios": dict(zip(PARTITIONS, (.7, .1, .05, .15)))}})

    def fixture(self, groups_by_script: dict[str, int], paired: bool = False) -> list[dict]:
        labels = {script: [_label(script, "a", 0), _label(script, "i", 1)] for script in groups_by_script}
        samples = []
        for script, total in groups_by_script.items():
            for record in labels[script]:
                for index in range(total):
                    for derivative in range(2 if paired else 1):
                        identity = f"{script}:{record['class_id']}:{index}:{derivative}"
                        samples.append({"sample_id": identity, "path": identity + ".png", "script": script,
                                        "class_id": record["class_id"], "source_label": record["source_label"],
                                        "category": "aksara", "status": "valid", "source": "source", "writer_id": None,
                                        "group_id": f"{script}:{record['class_id']}:{index}", "group_partition_hints": []})
        self.persist(labels, samples)
        return samples

    def persist(self, labels: dict, samples: list[dict]):
        label_hash = canonical_hash(labels)
        dataset_hash = canonical_hash({"samples": samples, "label_hash": label_hash, "version": AUDIT_VERSION})
        _json(self.audit_dir / "samples.json", {"samples": samples})
        _json(self.audit_dir / "manifest.json", {"dataset_hash": dataset_hash, "label_hash": label_hash,
              "audit_version": AUDIT_VERSION, "labels": labels, "data_root": str(self.base), "canvas": {},
              "benchmark_description": "duplicate/ancestry-group-held-out"})

    def test_deterministic_immutable_split_has_no_ancestry_or_sample_leakage(self):
        self.fixture({"sunda": 20}, paired=True)
        first = split(self.audit_dir, self.config, self.out)
        second = split(self.audit_dir, self.config, self.base / "other-splits")
        self.assertEqual(first, second)
        self.assertEqual(split(self.audit_dir, self.config, self.out), first)
        groups = defaultdict(set)
        for sample in first["samples"]:
            groups[sample["group_id"]].add(sample["partition"])
        self.assertTrue(all(len(partitions) == 1 for partitions in groups.values()))
        self.assertEqual(len({s["sample_id"] for s in first["samples"]}), len(first["samples"]))
        self.assertTrue(all(all(row["counts"].values()) for row in first["coverage"]["sunda"]))
        self.assertEqual(first["ready_scripts"], ["sunda"])

    def test_infeasible_coverage_keeps_full_labels_and_lists_additional_groups(self):
        self.fixture({"sunda": 3})
        with self.assertRaisesRegex(ValueError, "blocked scripts"):
            split(self.audit_dir, self.config, self.out)
        result = _load(self.out / "manifest.json")
        failures = result["blocked_scripts"]["sunda"]["classes"]
        self.assertEqual({r["source_label"] for r in failures}, {"a", "i"})
        self.assertTrue(all(r["additional_groups_required"] == 1 for r in failures))
        self.assertEqual(result["samples"], [])
        self.assertEqual(result["ready_scripts"], [])

    def test_feasible_script_retained_when_another_is_blocked(self):
        self.fixture({"sunda": 20, "lontara": 2})
        with self.assertRaises(ValueError):
            split(self.audit_dir, self.config, self.out)
        result = _load(self.out / "manifest.json")
        self.assertEqual(result["ready_scripts"], ["sunda"])
        self.assertEqual(set(result["blocked_scripts"]), {"lontara"})
        self.assertEqual({s["script"] for s in result["samples"]}, {"sunda"})

    def test_canvas_fixed_partition_and_writer_group_conflict_never_reassigned(self):
        samples = self.fixture({"sunda": 20})
        samples[0].update(source="canvas", writer_id="w", partition_hint="test", group_partition_hints=["test"])
        manifest = _load(self.audit_dir / "manifest.json")
        self.persist(manifest["labels"], samples)
        result = split(self.audit_dir, self.config, self.out)
        self.assertEqual(next(s for s in result["samples"] if s["sample_id"] == samples[0]["sample_id"])["partition"], "test")
        samples[0]["group_partition_hints"] = ["selection", "test"]
        self.persist(manifest["labels"], samples)
        with self.assertRaises(ValueError):
            split(self.audit_dir, self.config, self.base / "conflict")
        failure = _load(self.base / "conflict" / "manifest.json")["blocked_scripts"]["sunda"]
        self.assertTrue(failure["classes"][0]["conflicting_groups"])

    def test_changed_seed_cannot_overwrite_frozen_manifest(self):
        self.fixture({"sunda": 20})
        split(self.audit_dir, self.config, self.out)
        before = (self.out / "manifest.json").read_bytes()
        _json(self.config, {"split": {"seed": 43}})
        with self.assertRaisesRegex(ValueError, "Immutable split mismatch"):
            split(self.audit_dir, self.config, self.out)
        self.assertEqual((self.out / "manifest.json").read_bytes(), before)

    def test_tampered_audit_or_split_manifest_is_rejected(self):
        self.fixture({"sunda": 20})
        split(self.audit_dir, self.config, self.out)
        frozen = _load(self.out / "manifest.json")
        frozen["samples"][0]["partition"] = "test"
        frozen["seed"] = 101
        _json(self.out / "manifest.json", frozen)
        with self.assertRaisesRegex(ValueError, "Immutable split mismatch"):
            split(self.audit_dir, self.config, self.out)
        samples = _load(self.audit_dir / "samples.json")
        samples["samples"][0]["path"] = "tampered.png"
        _json(self.audit_dir / "samples.json", samples)
        with self.assertRaisesRegex(ValueError, "Audit hash mismatch"):
            split(self.audit_dir, self.config, self.base / "new")

    def test_cross_script_near_ancestry_cannot_cross_partitions(self):
        samples = self.fixture({"sunda": 20, "lontara": 20})
        for sample in samples:
            if sample["class_id"] == 0 and sample["group_id"].endswith(":0"):
                sample["group_id"] = "shared-near-group"
        manifest = _load(self.audit_dir / "manifest.json")
        self.persist(manifest["labels"], samples)
        result = split(self.audit_dir, self.config, self.out)
        shared = [s for s in result["samples"] if s["group_id"] == "shared-near-group"]
        self.assertEqual(len({s["partition"] for s in shared}), 1)


class CombinedViewTests(unittest.TestCase):
    def test_174_class_union_preserves_original_ids_aliases_and_rows(self):
        from ai.train import experiment_scripts, experiment_view

        labels = _load(Path("ai/configs/labels.json"))
        original = json.dumps(labels, sort_keys=True)
        self.assertEqual(experiment_scripts("combined"), ("lontara", "sunda", "bali"))
        rows = [{"script": script, "class_id": index, "source_label": label["source_label"],
                 "sample_id": f"{script}:{index}", "partition": "selection", "group_id": f"group:{script}:{index}",
                 "path": f"{script}/{index}.png", "byte_sha256": f"hash:{script}:{index}", "writer_id": None,
                 "status": "valid"}
                for script, records in labels.items() for index, label in enumerate(records)]
        rows.append(dict(rows[0], status="quarantine", sample_id="quarantine"))
        saved = json.dumps(rows, sort_keys=True)
        union, chosen = experiment_view(dict(reversed(list(labels.items()))), rows, "combined")
        self.assertEqual(len(union), 174)
        self.assertEqual([label["class_id"] for label in union], list(range(174)))
        for script, offset, count in (("lontara", 0, 114), ("sunda", 114, 30), ("bali", 144, 30)):
            self.assertEqual([(record["source_class_id"], record["class_id"]) for record in union[offset:offset + count]],
                             [(index, offset + index) for index in range(count)])
            for row in chosen:
                if row["script"] == script:
                    source = next(sample for sample in rows if sample["sample_id"] == row["sample_id"])
                    self.assertEqual({key: value for key, value in row.items()
                                      if key not in ("class_id", "source_class_id")},
                                     {key: value for key, value in source.items() if key != "class_id"})
                    self.assertEqual(row["source_class_id"], source["class_id"])
                    self.assertEqual(row["class_id"], offset + source["class_id"])
        self.assertEqual(len(chosen), len(rows) - 1)
        self.assertEqual(len({"lontara:Ke", "lontara:Ke_"} &
                             {row["namespaced_label"] for row in union}), 2)
        self.assertEqual(len({"sunda:ae", "sunda:e"} &
                             {row["namespaced_label"] for row in union}), 2)
        self.assertEqual(json.dumps(labels, sort_keys=True), original)
        self.assertEqual(json.dumps(rows, sort_keys=True), saved)
        specialist, specialist_rows = experiment_view(labels, rows, "sunda")
        self.assertIs(specialist, labels["sunda"])
        self.assertEqual([row["class_id"] for row in specialist_rows], list(range(30)))
        self.assertTrue(all("source_class_id" not in row for row in specialist_rows))

    def test_union_rejects_invalid_local_id_or_mislabeled_sample(self):
        from ai.train import experiment_view

        labels = _load(Path("ai/configs/labels.json"))
        row = {"script": "sunda", "class_id": 30, "source_label": "ae",
               "status": "valid", "sample_id": "bad"}
        with self.assertRaisesRegex(ValueError, "class/label mismatch"):
            experiment_view(labels, [row], "combined")
        row["class_id"] = 1
        row["source_label"] = "e"
        with self.assertRaisesRegex(ValueError, "class/label mismatch"):
            experiment_view(labels, [row], "combined")


class PilotEvidenceTests(unittest.TestCase):
    def setUp(self):
        from ai.preprocess import preprocessing_contract
        from ai.train import digest

        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.rows = [{"sample_id": f"train-{i}", "partition": "train", "class_id": int(i == 3),
                      "source": "kaggle"} for i in range(4)]
        selection = [{"sample_id": f"selection-{i}", "partition": "selection", "class_id": i,
                      "source": "kaggle"} for i in range(2)]
        self.ctx = {"script": "lontara", "size": 128, "labels": [{}, {}],
                    "samples": self.rows + selection + [{"partition": "test", "source": "kaggle"}],
                    "config": {"training": {"transfer_epochs": 5, "finetune_epochs": 30}, "loss_choice": {}},
                    "hashes": {"dataset_hash": "dataset", "split_hash": "split", "label_hash": "labels",
                               "preprocessing_hash": digest(preprocessing_contract(128)), "config_hash": "before"}}
        self.paths = [self.base / f"{loss}.json" for loss in ("ordinary", "weighted")]
        self.pilots = [{"status": "complete", "config": {"training": dict(self.ctx["config"]["training"])},
                       "identity": {"script": "lontara", "model": "mobile", "seed": 42, "size": 128,
                                    "stage": "supervised", "initialize_hash": None, "smoke": False, "loss": loss,
                                    "hashes": dict(self.ctx["hashes"]),
                                    "train_ids_hash": digest([row["sample_id"] for row in self.rows]),
                                    "selection_ids_hash": digest([row["sample_id"] for row in selection])},
                       "best": {"macro_f1": 0.8, "min_recall": 0.6}} for loss in ("ordinary", "weighted")]

    def persist(self):
        for path, pilot in zip(self.paths, self.pilots):
            _json(path, pilot)

    def test_small_manifests_choose_selection_only_after_config_cutover_and_at_224(self):
        from argparse import Namespace
        from unittest.mock import patch

        from ai.evaluate import select_pilot_loss
        from ai.preprocess import preprocessing_contract
        from ai.train import choose_loss, digest, partition_rows

        self.pilots[1]["best"]["macro_f1"] = 0.9
        self.persist()
        self.ctx["config"]["loss_choice"]["lontara"] = {"loss": "weighted",
                                                        "pilots": [str(path) for path in self.paths]}
        self.ctx["hashes"]["config_hash"] = "after"
        self.ctx["size"] = 224
        self.ctx["hashes"]["preprocessing_hash"] = digest(preprocessing_contract(224))

        def source_only(ctx, partition):
            self.assertIn(partition, ("train", "selection"))
            return partition_rows(ctx, partition)

        with patch("ai.evaluate.partition_rows", side_effect=source_only), \
                patch("ai.evaluate.load_checkpoint", side_effect=AssertionError("No checkpoint access")), \
                patch("ai.evaluate.predict", side_effect=AssertionError("No image inference")):
            self.assertEqual(select_pilot_loss(self.paths, self.ctx), "weighted")
            self.assertEqual(choose_loss(Namespace(script="lontara", loss=None), self.ctx, self.rows), "weighted")
        self.assertEqual({path.name for path in self.base.iterdir()}, {"ordinary.json", "weighted.json"})

    def test_ties_use_minimum_recall_then_ordinary_independent_of_path_order(self):
        from ai.evaluate import select_pilot_loss

        self.pilots[1]["best"]["min_recall"] = 0.7
        self.persist()
        self.assertEqual(select_pilot_loss(self.paths, self.ctx), "weighted")
        self.pilots[1]["best"]["min_recall"] = 0.6
        self.persist()
        self.assertEqual(select_pilot_loss(list(reversed(self.paths)), self.ctx), "ordinary")

    def test_matching_but_wrong_partition_hashes_recipe_and_initialization_are_rejected(self):
        import copy

        from ai.evaluate import select_pilot_loss

        originals = copy.deepcopy(self.pilots)
        for field in ("train_ids_hash", "selection_ids_hash", "initialize_hash"):
            with self.subTest(field=field):
                self.pilots = copy.deepcopy(originals)
                for pilot in self.pilots:
                    pilot["identity"][field] = "same-but-incompatible"
                self.persist()
                with self.assertRaises(ValueError):
                    select_pilot_loss(self.paths, self.ctx)
        self.pilots = copy.deepcopy(originals)
        for pilot in self.pilots:
            pilot["config"]["training"]["transfer_epochs"] = 1
        self.persist()
        with self.assertRaisesRegex(ValueError, "current training recipe"):
            select_pilot_loss(self.paths, self.ctx)

    def test_incompatible_treatments_and_invalid_selection_scores_are_rejected(self):
        import copy

        from ai.evaluate import select_pilot_loss

        originals = copy.deepcopy(self.pilots)
        changes = [("model", "resnet"), ("seed", 43), ("size", 224), ("stage", "canvas"),
                   ("smoke", True), ("script", "sunda"), ("loss", "ordinary")]
        for field, value in changes:
            with self.subTest(field=field):
                self.pilots = copy.deepcopy(originals)
                self.pilots[1]["identity"][field] = value
                self.persist()
                with self.assertRaises(ValueError):
                    select_pilot_loss(self.paths, self.ctx)
        for key in ("dataset_hash", "split_hash", "label_hash", "preprocessing_hash"):
            with self.subTest(hash=key):
                self.pilots = copy.deepcopy(originals)
                self.pilots[1]["identity"]["hashes"][key] = "wrong"
                self.persist()
                with self.assertRaises(ValueError):
                    select_pilot_loss(self.paths, self.ctx)
        for value in (float("nan"), float("inf"), -0.1, 1.1, True, "0.9"):
            for metric in ("macro_f1", "min_recall"):
                with self.subTest(metric=metric, value=value):
                    self.pilots = copy.deepcopy(originals)
                    self.pilots[1]["best"][metric] = value
                    self.persist()
                    with self.assertRaisesRegex(ValueError, "must be finite"):
                        select_pilot_loss(self.paths, self.ctx)
        self.pilots = copy.deepcopy(originals)
        self.pilots[1]["status"] = "deadline"
        self.persist()
        with self.assertRaises(ValueError):
            select_pilot_loss(self.paths, self.ctx)

    def test_pilot_training_rejects_non_original_recipe_before_execution(self):
        from argparse import Namespace

        from ai.train import choose_loss

        for override in ({"stage": "canvas"}, {"initialize": "best.pt"}, {"checkpoint": "best.pt"},
                         {"include_canvas": True}):
            with self.subTest(override=override):
                args = Namespace(script="lontara", model="mobile", seed=42, pilot=True, loss="weighted", **override)
                with self.assertRaisesRegex(ValueError, "Loss pilot"):
                    choose_loss(args, self.ctx, self.rows)
        self.ctx["size"] = 224
        with self.assertRaisesRegex(ValueError, "supervised128"):
            choose_loss(Namespace(script="lontara", model="mobile", seed=42, pilot=True, loss="weighted"),
                        self.ctx, self.rows)


if __name__ == "__main__":
    unittest.main()
