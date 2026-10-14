"""Exercise real GradScaler overflow recovery without requiring CUDA."""
import copy
import json
import tempfile
import time
import unittest
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch

import numpy as np
import torch
from torch import nn
from torch.utils.data import Dataset

from ai.runner import parser
from ai.train import (context, digest, experiment_scripts, permission, persist_predictions,
                      training_epoch, validate_class_space, validate_initialization)


class CombinedIdentityTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.audit = self.root / "audit"
        self.splits = self.root / "splits"
        self.audit.mkdir()
        self.splits.mkdir()
        self.labels = json.loads(Path("ai/configs/labels.json").read_text(encoding="utf-8"))
        self.samples = [
            {"sample_id": f"{script}:{index}:{partition}", "script": script, "class_id": index,
             "source_label": label["source_label"], "path": f"{script}/{index}/{partition}",
             "group_id": f"{script}:{index}:{partition}", "writer_id": None,
             "byte_sha256": f"{script}:{index}:{partition}", "status": "valid", "source": "source"}
            for script in experiment_scripts("combined")
            for index, label in enumerate(self.labels[script])
            for partition in ("train", "selection", "calibration", "test")]
        self.audit_manifest = {"labels": self.labels, "audit_version": "character-audit-v1",
                               "label_hash": digest(self.labels)}
        self.audit_manifest["dataset_hash"] = digest({"samples": self.samples, "label_hash": self.audit_manifest["label_hash"],
                                                       "version": self.audit_manifest["audit_version"]})
        self.split_manifest = {"samples": [dict(row, partition=row["sample_id"].rsplit(":", 1)[1]) for row in self.samples],
                               "ready_scripts": list(self.labels), "blocked_scripts": {},
                               "dataset_hash": self.audit_manifest["dataset_hash"],
                               "label_hash": self.audit_manifest["label_hash"]}
        self.config = {"labels_path": str(self.root / "labels.json"),
                       "provenance_path": str(self.root / "provenance.json"),
                       "preprocessing": {"size": 128}}
        self.args = Namespace(config=self.root / "config.json", audit=self.audit, splits=self.splits,
                              script="combined", size=128, data_root=self.root)
        self.persist()

    def persist(self):
        self.split_manifest["split_hash"] = digest({key: value for key, value in self.split_manifest.items()
                                                     if key != "split_hash"})
        for path, data in ((self.root / "labels.json", self.labels), (self.root / "config.json", self.config),
                           (self.audit / "manifest.json", self.audit_manifest),
                           (self.audit / "samples.json", {"samples": self.samples}),
                           (self.splits / "manifest.json", self.split_manifest)):
            path.write_text(json.dumps(data), encoding="utf-8")

    def test_context_union_preserves_original_hashes_and_guards_own_mapping(self):
        ctx = context(self.args)
        self.assertEqual([row["class_id"] for row in ctx["labels"]], list(range(174)))
        self.assertEqual(sorted(set(row["source_class_id"] for row in ctx["samples"])), list(range(114)))
        for key in ("dataset_hash", "label_hash", "split_hash"):
            self.assertEqual(ctx["hashes"][key], self.split_manifest[key])
        class_space = ctx["class_space"]
        self.assertEqual(class_space["class_space_hash"],
                         digest({key: value for key, value in class_space.items() if key != "class_space_hash"}))
        previous = {"script": "combined", "model": "mobile", "size": 128, "loss": "ordinary",
                    "hashes": dict(ctx["hashes"])}
        validate_class_space(ctx, previous)
        validate_initialization(previous, copy.deepcopy(previous))
        for identity in ({"script": "lontara", "hashes": dict(ctx["hashes"])},
                         {"script": "combined", "hashes": {key: value for key, value in ctx["hashes"].items()
                                                            if key != "class_space_hash"}},
                         {"script": "combined", "hashes": dict(ctx["hashes"], class_space_hash="wrong")}):
            with self.subTest(identity=identity), self.assertRaisesRegex(ValueError, "class_space_hash"):
                validate_class_space(ctx, identity)
        previous["hashes"]["class_space_hash"] = "wrong"
        with self.assertRaisesRegex(ValueError, "class_space_hash"):
            validate_initialization(previous, {"script": "combined", "model": "mobile", "size": 128,
                                                "loss": "ordinary", "hashes": ctx["hashes"]})

    def test_frozen_source_manifest_combined_contract(self):
        args = parser().parse_args(["train", "--script", "combined"])
        ctx = context(args)
        self.assertEqual(len(ctx["labels"]), 174)
        self.assertEqual(ctx["hashes"]["dataset_hash"], "07a8f1fa177fa7f71be0fb54a48cdaf4e3d9f6f29a5cdde9fd88219568b222a2")
        self.assertEqual(ctx["hashes"]["label_hash"], "44b43e62b88ccd231b8d58f1c3230bb5afd2182be1c857787a0ebdd4ebb31b07")
        self.assertEqual(ctx["hashes"]["split_hash"], "b285532165a7b9388c3a4e7f1635952ae2bcc88368ca22ba8ac55cceb4dfae2b")
        self.assertEqual({partition: sum(row["partition"] == partition for row in ctx["samples"])
                          for partition in ("train", "selection", "calibration", "test")},
                         {"train": 9406, "selection": 1337, "calibration": 678, "test": 2021})

    def test_invalid_original_hash_or_audit_correspondence_rejected_before_union(self):
        original_labels = copy.deepcopy(self.labels)
        original_audit = copy.deepcopy(self.audit_manifest)
        original_split = copy.deepcopy(self.split_manifest)
        mutations = (
            lambda: self.split_manifest.update(split_hash="tampered"),
            lambda: self.audit_manifest.update(dataset_hash="tampered"),
            lambda: self.labels["sunda"][0].update(source_label="changed"),
            lambda: self.split_manifest["samples"][0].update(source_label="changed"),
        )
        for mutate in mutations:
            with self.subTest(mutation=mutate):
                self.labels = copy.deepcopy(original_labels)
                self.audit_manifest = copy.deepcopy(original_audit)
                self.split_manifest = copy.deepcopy(original_split)
                mutate()
                if self.split_manifest.get("split_hash") != "tampered":
                    self.persist()
                else:
                    (self.splits / "manifest.json").write_text(json.dumps(self.split_manifest), encoding="utf-8")
                with patch("ai.train.experiment_view", side_effect=AssertionError("view ran before hash guards")):
                    with self.assertRaises(ValueError):
                        context(self.args)

    def test_combined_rejects_blocked_source_missing_sample_and_cross_partition_group(self):
        self.split_manifest["ready_scripts"].remove("bali")
        self.persist()
        with self.assertRaisesRegex(ValueError, "bali split is blocked"):
            context(self.args)
        self.split_manifest["ready_scripts"].append("bali")
        self.split_manifest["samples"].pop()
        self.persist()
        with self.assertRaisesRegex(ValueError, "does not cover every valid"):
            context(self.args)
        self.split_manifest["samples"].append(dict(self.samples[-1], partition="test"))
        for row in self.samples:
            if row["sample_id"] == "sunda:0:selection":
                row["group_id"] = self.samples[0]["group_id"]
        for row in self.split_manifest["samples"]:
            if row["sample_id"] == "sunda:0:selection":
                row["group_id"] = self.samples[0]["group_id"]
        self.audit_manifest["dataset_hash"] = digest({"samples": self.samples, "label_hash": self.audit_manifest["label_hash"],
                                                       "version": self.audit_manifest["audit_version"]})
        self.split_manifest["dataset_hash"] = self.audit_manifest["dataset_hash"]
        self.persist()
        with self.assertRaisesRegex(ValueError, "crosses partitions"):
            context(self.args)

    def test_permission_uses_three_original_sources_without_combined_record(self):
        self.config["provenance_path"] = str(self.root / "provenance.json")
        (self.root / "provenance.json").write_text(json.dumps(
            {script: {"training": "allowed", "evidence": "source record"} for script in self.labels}), encoding="utf-8")
        self.persist()
        ctx = context(self.args)
        self.assertEqual(set(permission(ctx, "combined", "training", ctx["samples"])), set(self.labels))
        (self.root / "provenance.json").write_text(json.dumps(
            {"lontara": {"training": "allowed", "evidence": "source record"}}), encoding="utf-8")
        with self.assertRaisesRegex(PermissionError, "sunda training"):
            permission(ctx, "combined", "training", ctx["samples"])

    def test_combined_selection_metadata_and_csv_include_source_fields(self):
        ctx = context(self.args)
        rows = [row for row in ctx["samples"] if row["partition"] == "selection"]
        logits = np.eye(174, dtype=np.float32)
        identity = {"script": "combined", "hashes": ctx["hashes"]}
        persist_predictions(self.root, logits, np.array([row["class_id"] for row in rows]),
                            [row["sample_id"] for row in rows], rows, ctx, identity)
        metadata = json.loads((self.root / "selection.json").read_text(encoding="utf-8"))
        self.assertEqual(metadata["class_space"], ctx["class_space"])
        with (self.root / "per-class.csv").open(encoding="utf-8") as stream:
            import csv
            records = list(csv.DictReader(stream))
        self.assertEqual([(row["script"], int(row["source_class_id"]), row["namespaced_label"]) for row in records],
                         [(label["script"], label["source_class_id"], label["namespaced_label"]) for label in ctx["labels"]])

    def test_specialist_selection_output_retains_original_columns(self):
        import csv

        args = Namespace(**dict(vars(self.args), script="sunda"))
        ctx = context(args)
        rows = [row for row in ctx["samples"] if row["partition"] == "selection"]
        logits = np.eye(len(ctx["labels"]), dtype=np.float32)
        persist_predictions(self.root, logits, np.array([row["class_id"] for row in rows]),
                            [row["sample_id"] for row in rows], rows, ctx,
                            {"script": "sunda", "hashes": ctx["hashes"]})
        metadata = json.loads((self.root / "selection.json").read_text(encoding="utf-8"))
        self.assertNotIn("class_space", metadata)
        self.assertNotIn("class_space_hash", metadata["hashes"])
        with (self.root / "per-class.csv").open(encoding="utf-8") as stream:
            self.assertEqual(next(csv.reader(stream)), ["class_id", "source_label", "support", "recall"])

    def test_combined_rejects_non_source_training_before_licensing_or_outputs(self):
        from ai.train import run

        args = Namespace(script="combined", stage="supervised", include_canvas=False, initialize=None,
                         checkpoint=None, teacher=None, out=self.root / "out")
        ctx = context(self.args)
        for override in ({"stage": "canvas"}, {"stage": "distill"}, {"include_canvas": True},
                         {"initialize": self.root / "best.pt"}, {"checkpoint": self.root / "best.pt"},
                         {"teacher": self.root / "teacher.json"}):
            with self.subTest(override=override), patch("ai.train.context", return_value=ctx), \
                    patch("ai.train.permission", side_effect=AssertionError("license accessed")):
                with self.assertRaisesRegex(ValueError, "source-only"):
                    run(Namespace(**dict(vars(args), **override)))
                self.assertFalse(args.out.exists())

    def test_runner_only_offers_combined_for_train_and_evaluate(self):
        cli = parser()
        self.assertEqual(cli.parse_args(["train", "--script", "combined"]).script, "combined")
        self.assertEqual(cli.parse_args(["evaluate", "--script", "combined"]).script, "combined")
        for command in ("ensemble", "export", "queue", "build-notebook"):
            with self.subTest(command=command), self.assertRaises(SystemExit):
                cli.parse_args([command, "--script", "combined"])




class OverflowImages(Dataset):
    def __len__(self):
        return 256

    def __getitem__(self, index):
        return torch.tensor([8.0]), torch.tensor(1), str(index)


class GradientOverflowTests(unittest.TestCase):
    def test_scaler_reduces_scale_and_real_optimizer_updates_after_overflow(self):
        model = nn.Linear(1, 2, bias=False)
        with torch.no_grad():
            model.weight.copy_(torch.tensor([[1.0], [-1.0]]))
        before = model.weight.detach().clone()
        initial_scale = 2.0 ** 126
        scaler = torch.amp.GradScaler('cpu', init_scale=initial_scale)
        optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
        result = training_epoch(model, OverflowImages(), optimizer, scaler,
                                torch.device('cpu'), 64, {'gradient_clip': 1.0},
                                None, False, 'cnn', None, time.monotonic() + 30)
        self.assertLess(scaler.get_scale(), initial_scale)
        self.assertFalse(torch.equal(model.weight, before))
        self.assertTrue(bool(torch.isfinite(model.weight).all()))
        self.assertTrue(result['gradient_nonzero'])

    def test_epoch_with_only_overflow_never_claims_successful_training(self):
        model = nn.Linear(1, 2, bias=False)
        with torch.no_grad():
            model.weight.copy_(torch.tensor([[1.0], [-1.0]]))
        before = model.weight.detach().clone()
        scaler = torch.amp.GradScaler('cpu', init_scale=2.0 ** 127)
        optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
        images = torch.utils.data.Subset(OverflowImages(), range(64))
        with self.assertRaisesRegex(FloatingPointError, 'No nonzero gradient'):
            training_epoch(model, images, optimizer, scaler, torch.device('cpu'),
                           64, {'gradient_clip': 1.0}, None, False, 'cnn', None,
                           time.monotonic() + 30)
        self.assertTrue(torch.equal(model.weight, before))


if __name__ == '__main__':
    unittest.main()
