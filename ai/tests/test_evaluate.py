"""Selection comparison checks actual predictions against frozen source memberships."""
import shutil
import tempfile
import unittest
from pathlib import Path

import numpy as np
import torch

from ai.evaluate import (classification_metrics, combined_metrics, compare_specialists,
                         load_candidate, prediction_metrics, select_pilot_loss)
from ai.preprocess import preprocessing_contract
from ai.train import digest, file_hash, permission, read_json, save_json


SCRIPTS = ("lontara", "sunda", "bali")
WIDTHS = (114, 30, 30)


def fixture_context():
    labels, rows = [], []
    for script, width in zip(SCRIPTS, WIDTHS):
        for source_id in range(width):
            global_id = len(labels)
            label = f"glyph{source_id}"
            labels.append({"script": script, "class_id": global_id, "source_class_id": source_id,
                           "source_label": label, "namespaced_label": f"{script}:{label}"})
            for partition in ("train", "selection"):
                rows.append({"script": script, "class_id": global_id, "source_class_id": source_id,
                             "sample_id": f"{script}-{source_id}-{partition}", "partition": partition,
                             "source": "source"})
    space = {"version": "script-union-v1", "scripts": list(SCRIPTS), "labels": labels}
    space["class_space_hash"] = digest(space)
    hashes = {key: f"source-{key}" for key in ("dataset_hash", "label_hash", "split_hash", "config_hash")}
    hashes["preprocessing_hash"] = digest(preprocessing_contract(128))
    hashes["class_space_hash"] = space["class_space_hash"]
    return {"script": "combined", "class_space": space, "labels": labels, "samples": rows,
            "hashes": hashes, "config": {"training": {"batch_size": 64}}}


def make_run(root, ctx, script, *, order=None, weak_lontara=False):
    run = root / script
    run.mkdir()
    combined = script == "combined"
    rows = [row for row in ctx["samples"] if row["partition"] == "selection" and (combined or row["script"] == script)]
    train = [row for row in ctx["samples"] if row["partition"] == "train" and (combined or row["script"] == script)]
    if order is not None:
        rows = [rows[i] for i in order]
    if not combined:
        rows = [dict({k: v for k, v in row.items() if k != "source_class_id"},
                     class_id=row["source_class_id"]) for row in rows]
    width = 174 if combined else WIDTHS[SCRIPTS.index(script)]
    logits = np.full((len(rows), width), -10.0)
    for index, row in enumerate(rows):
        winner = row["class_id"]
        if script == "lontara" and weak_lontara:
            winner = 0
        logits[index, winner] = 10.0
    labels = np.array([row["class_id"] for row in rows])
    identity = {"script": script, "model": "mobile", "seed": 42, "size": 128,
                "stage": "supervised", "initialize_hash": None, "smoke": False, "loss": "ordinary",
                "hashes": dict(ctx["hashes"]), "selection_ids_hash": digest([row["sample_id"] for row in
                  ctx["samples"] if row["partition"] == "selection" and (combined or row["script"] == script)]),
                "train_ids_hash": digest([row["sample_id"] for row in train])}
    if not combined:
        identity["hashes"].pop("class_space_hash")
    metadata = {"rows": rows, "num_classes": width, "size": 128,
                "identity": identity, "hashes": identity["hashes"]}
    if combined:
        metadata["class_space"] = ctx["class_space"]
    save_json(run / "selection.json", metadata)
    np.savez_compressed(run / "selection.npz", logits=logits, labels=labels,
                        sample_ids=np.array([row["sample_id"] for row in rows]))
    torch.save({"identity": identity, "epoch": 7}, run / "best.pt")
    metrics = prediction_metrics(labels, logits.argmax(1), width)
    best = {"epoch": 7, **{key: metrics[key] for key in ("macro_f1", "top1", "min_recall")}}
    save_json(run / "manifest.json", {"status": "complete", "identity": identity,
              "config": ctx["config"], "preprocessing": preprocessing_contract(128),
              "provenance": permission(ctx, script, "training", train),
              "history": [{"epoch": 7}], "best": best, "epochs_completed": 7,
              "artifact_hashes": {name: file_hash(run / name) for name in
                                  ("best.pt", "selection.json", "selection.npz")}})
    return run


class MetricTests(unittest.TestCase):
    def setUp(self):
        self.ctx = fixture_context()

    def test_all_sunda_classes_are_perfect_with_174_logit_output(self):
        labels = np.arange(114, 144)
        logits = np.full((30, 174), -5.0)
        logits[np.arange(30), labels] = 5.0
        scores = classification_metrics(logits, labels, 174, metric_class_ids=tuple(labels.tolist()))
        self.assertEqual(scores["macro_f1"], 1)
        self.assertEqual(scores["balanced_accuracy"], 1)
        self.assertEqual(scores["min_recall"], 1)
        self.assertEqual(scores["missing_classes"], [])
        self.assertEqual(scores["confusion_matrix"][114][114], 1)

    def test_sunda_subset_perfect_and_unmasked_cross_script_error(self):
        labels = np.array([114, 115])
        logits = np.full((2, 174), -5.0)
        logits[0, 114] = logits[1, 115] = 5.0
        scores = classification_metrics(logits, labels, 174, metric_class_ids=tuple(range(114, 144)))
        self.assertEqual(scores["macro_f1"], 2 / 30)
        self.assertEqual(scores["balanced_accuracy"], 1)
        self.assertEqual(scores["min_recall"], 0)
        self.assertEqual(scores["missing_classes"], list(range(116, 144)))
        rows = [row for row in self.ctx["samples"] if row["partition"] == "selection"]
        full = np.full((174, 174), -5.0)
        full[np.arange(174), np.arange(174)] = 5.0
        full[114, 0] = 10.0
        outcome = combined_metrics(full, np.arange(174), rows, self.ctx["class_space"])
        self.assertEqual(outcome["cross_script_confusion"], [[114, 0, 0], [1, 29, 0], [0, 0, 30]])
        self.assertEqual(outcome["cross_script_error_count"], 1)
        self.assertEqual(outcome["per_script"]["sunda"]["top1"], 29 / 30)
        self.assertEqual(outcome["per_script"]["sunda"]["confusion_matrix"][114][0], 1)

    def test_invalid_subset_and_nonfinite_inputs_rejected(self):
        labels = np.array([114])
        for subset in ((), (114, 114), (174,), (0,)):
            with self.subTest(subset=subset), self.assertRaises(ValueError):
                prediction_metrics(labels, np.array([114]), 174, metric_class_ids=subset)
        for logits, truth in ((np.zeros((0, 174)), np.array([], dtype=int)),
                              (np.full((1, 174), np.nan), labels),
                              (np.zeros((2, 174)), labels)):
            with self.assertRaises(ValueError):
                classification_metrics(logits, truth, 174)


class ComparisonTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ctx = fixture_context()
        provenance_path = self.root / "provenance.json"
        save_json(provenance_path, {script: {"training": "allowed", "evidence": ["fixture"]}
                                    for script in SCRIPTS})
        self.ctx["config"]["provenance_path"] = str(provenance_path)
        self.combined = make_run(self.root, self.ctx, "combined", order=list(reversed(range(174))))
        self.specialists = {script: make_run(self.root, self.ctx, script, order=list(reversed(range(width))),
                                             weak_lontara=True)
                            for script, width in zip(SCRIPTS, WIDTHS)}

    def rewrite_arrays(self, script, change):
        run = self.specialists[script]
        with np.load(run / "selection.npz") as stored:
            values = {key: stored[key].copy() for key in stored.files}
        change(values)
        np.savez_compressed(run / "selection.npz", **values)
        manifest = read_json(run / "manifest.json")
        manifest["artifact_hashes"]["selection.npz"] = file_hash(run / "selection.npz")
        save_json(run / "manifest.json", manifest)

    def test_join_by_id_and_global_vs_equal_script_metrics(self):
        result = compare_specialists(self.specialists, self.combined, self.ctx)
        self.assertTrue(result["provisional"])
        self.assertEqual(result["partition"], "selection")
        routing = result["specialists"]["metrics"]
        self.assertEqual(result["specialists"]["routing"], "script-known routing")
        self.assertEqual(result["combined"]["routing"], "script-unknown174")
        self.assertEqual(routing["cross_script_error_count"], 0)
        self.assertEqual(routing["per_script"]["sunda"]["top1"], 1)
        self.assertLess(routing["overall"]["macro_f1"], routing["equal_script_mean_macro_f1"])
        self.assertEqual(result["combined"]["metrics"]["overall"]["top1"], 1)
        self.assertEqual(routing["overall"]["support"], 174)

    def test_missing_duplicate_foreign_ids_and_wrong_labels_rejected(self):
        for mode in ("missing", "duplicate", "foreign", "labels"):
            with self.subTest(mode=mode):
                def change(values):
                    if mode == "labels":
                        values["labels"][0] = 99
                    elif mode == "missing":
                        values["sample_ids"] = values["sample_ids"][:-1]
                    elif mode == "duplicate":
                        values["sample_ids"][0] = values["sample_ids"][1]
                    else:
                        values["sample_ids"][0] = "foreign"
                self.rewrite_arrays("sunda", change)
                with self.assertRaises(ValueError):
                    compare_specialists(self.specialists, self.combined, self.ctx)
                # Recreate only the affected fixture before testing the next mutation.
                shutil.rmtree(self.specialists["sunda"])
                self.specialists["sunda"] = make_run(self.root, self.ctx, "sunda", order=list(reversed(range(30))))

    def test_checksum_recipe_mapping_and_checkpoint_identity_rejected(self):
        for field in ("checksum", "source_hash", "class_space", "recipe", "checkpoint_identity"):
            with self.subTest(field=field):
                if field == "checksum":
                    (self.combined / "best.pt").write_bytes(b"tampered")
                elif field in ("source_hash", "class_space"):
                    metadata = read_json(self.combined / "selection.json")
                    if field == "source_hash":
                        metadata["hashes"]["dataset_hash"] = "foreign"
                    else:
                        metadata["class_space"]["class_space_hash"] = "foreign"
                    save_json(self.combined / "selection.json", metadata)
                    manifest = read_json(self.combined / "manifest.json")
                    manifest["artifact_hashes"]["selection.json"] = file_hash(self.combined / "selection.json")
                    save_json(self.combined / "manifest.json", manifest)
                elif field == "recipe":
                    manifest = read_json(self.combined / "manifest.json")
                    manifest["config"]["training"]["batch_size"] = 99
                    save_json(self.combined / "manifest.json", manifest)
                else:
                    torch.save({"identity": {"script": "foreign"}, "epoch": 7}, self.combined / "best.pt")
                    manifest = read_json(self.combined / "manifest.json")
                    manifest["artifact_hashes"]["best.pt"] = file_hash(self.combined / "best.pt")
                    save_json(self.combined / "manifest.json", manifest)
                with self.assertRaises(ValueError):
                    compare_specialists(self.specialists, self.combined, self.ctx)
                shutil.rmtree(self.combined)
                self.combined = make_run(self.root, self.ctx, "combined", order=list(reversed(range(174))))

    def test_wrong_specialist_logit_width_rejected(self):
        self.rewrite_arrays("sunda", lambda values: values.update(logits=np.column_stack(
            (values["logits"], np.zeros(len(values["logits"]))))))
        with self.assertRaises(ValueError):
            compare_specialists(self.specialists, self.combined, self.ctx)

    def test_candidate_rejects_mismatched_combined_mapping(self):
        checkpoint = torch.load(self.combined / "best.pt", map_location="cpu", weights_only=False)
        checkpoint["identity"]["hashes"]["class_space_hash"] = "foreign"
        torch.save(checkpoint, self.combined / "best.pt")
        with self.assertRaises(ValueError):
            load_candidate(self.combined, self.ctx)

    def test_comparison_rejects_unapproved_provenance_record(self):
        manifest = read_json(self.specialists["bali"] / "manifest.json")
        manifest["provenance"]["training"] = "unresolved"
        save_json(self.specialists["bali"] / "manifest.json", manifest)
        with self.assertRaises(ValueError):
            compare_specialists(self.specialists, self.combined, self.ctx)

    def test_pilot_rejects_missing_combined_class_space_hash(self):
        pilot = read_json(self.combined / "manifest.json")
        pilot["identity"]["hashes"].pop("class_space_hash")
        save_json(self.combined / "manifest.json", pilot)
        with self.assertRaises(ValueError):
            select_pilot_loss([self.combined, self.combined], self.ctx)


if __name__ == "__main__":
    unittest.main()
