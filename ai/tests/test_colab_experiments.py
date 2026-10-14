"""Controller state, immutable snapshots and bounded progress without a GPU/Drive."""
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from ai import colab_experiments as experiments
from ai.train import digest, file_hash, save_checkpoint, save_json


HASH = "a" * 64


class ControllerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.saved = self.root / "saved"
        self.local = self.root / "local"
        self.data = self.root / "data"
        self.data.mkdir()
        self.ctx = {"hashes": {"dataset_hash": "d", "split_hash": "s", "label_hash": "l",
                               "preprocessing_hash": "p", "config_hash": "c"},
                    "config": {"training": {"transfer_epochs": 5}},
                    "samples": [{"sample_id": "train-1", "partition": "train"},
                                {"sample_id": "select-1", "partition": "selection"}]}

    def case(self, directory, *, status="complete", epoch=1, loss="ordinary"):
        directory.mkdir(parents=True, exist_ok=True)
        identity = {"script": "sunda", "model": "mobile", "seed": 42, "size": 128,
                    "stage": "supervised", "loss": loss, "smoke": False, "initialize_hash": None,
                    "hashes": self.ctx["hashes"], "train_ids_hash": digest(["train-1"]),
                    "selection_ids_hash": digest(["select-1"])}
        save_checkpoint(directory / "last.pt", {"identity": identity, "epoch": epoch})
        if status == "complete":
            save_checkpoint(directory / "best.pt", {"identity": identity, "epoch": epoch})
            save_json(directory / "selection.json", {"rows": []})
            (directory / "selection.npz").write_bytes(b"fixture")
        hashes = {path.name: file_hash(path) for path in directory.iterdir() if path.is_file()}
        save_json(directory / "manifest.json", {"status": status, "identity": identity,
                                                "epochs_completed": epoch,
                                                "best": {"macro_f1": .8} if status == "complete" else None,
                                                "pilot": False, "config": self.ctx["config"],
                                                "artifact_hashes": hashes})

    def test_preflight_checks_real_bytes_and_seven_treatments(self):
        image = self.data / "glyph.bin"
        image.write_bytes(b"ink")
        original_hash = file_hash(image)
        ids = {"sunda": [0, 1], "lontara": [0, 0, 1],
               "bali": [0, 0, 1], "combined": [0, 0, *range(1, 174)]}
        contexts = {}
        for target, class_ids in ids.items():
            samples = [{"sample_id": f"{target}-train-{index}", "partition": "train",
                        "class_id": class_id, "path": "glyph.bin", "byte_sha256": original_hash}
                       for index, class_id in enumerate(class_ids)]
            samples.extend({"sample_id": f"{target}-{partition}", "partition": partition,
                            "class_id": 0, "path": "glyph.bin", "byte_sha256": original_hash}
                           for partition in ("selection", "calibration", "test"))
            contexts[target] = {"hashes": dict(experiments.SOURCE_HASHES),
                                "labels": list(range(174 if target == "combined" else 2)),
                                "samples": samples}

        with (patch.object(experiments, "_contexts", return_value=contexts),
              patch.object(experiments, "EXPECTED_TRAIN", {"sunda": 2, "lontara": 3,
                                                            "bali": 3, "combined": 175}),
              patch.object(experiments, "EXPECTED_PARTITIONS", {"train": 175, "selection": 1,
                                                                 "calibration": 1, "test": 1}),
              patch.object(experiments, "permission")):
            result = experiments.preflight(self.data)
            self.assertEqual(len(result["treatments"]), 7)
            self.assertEqual(result["verified_source_rows"], 178)
            image.write_bytes(b"changed")
            with self.assertRaisesRegex(ValueError, "byte hash mismatch"):
                experiments.preflight(self.data)

    def test_launch_reuses_only_own_active_pid_and_does_not_duplicate(self):
        info = {"hashes": self.ctx["hashes"], "treatments": [{"target": "sunda", "loss": "ordinary"}]}
        with (patch.object(experiments, "preflight", return_value=info),
              patch.object(experiments, "_pid_state", return_value="active"),
              patch.object(experiments, "LOCAL", self.local),
              patch.object(experiments.subprocess, "Popen") as spawn):
            spawn.return_value.pid = 123
            first = experiments.launch(self.data, self.saved, HASH)
            second = experiments.launch(self.data, self.saved, HASH)
            self.assertEqual(first["pid"], second["pid"])
            self.assertEqual(spawn.call_count, 1)
            self.assertTrue(spawn.call_args.kwargs["start_new_session"])
            with self.assertRaisesRegex(ValueError, "incompatible"):
                experiments.launch(self.data, self.saved, "b" * 64)
            new_data = self.root / "new-extraction"
            new_data.mkdir()
            with self.assertRaisesRegex(ValueError, "Active worker"):
                experiments.launch(new_data, self.saved, HASH)
            self.assertEqual(spawn.call_count, 1)

    def test_new_vm_data_path_reuses_identity_after_worker_exits(self):
        info = {"hashes": self.ctx["hashes"], "treatments": [{"target": "sunda", "loss": "ordinary"}]}
        new_data = self.root / "new-extraction"
        new_data.mkdir()
        with (patch.object(experiments, "preflight", return_value=info),
              patch.object(experiments, "_pid_state", return_value="dead"),
              patch.object(experiments, "LOCAL", self.local),
              patch.object(experiments.subprocess, "Popen") as spawn):
            spawn.return_value.pid = 123
            experiments.launch(self.data, self.saved, HASH)
            resumed = experiments.launch(new_data, self.saved, HASH)
            self.assertEqual(spawn.call_count, 2)
            self.assertEqual(experiments.status(self.saved)["status"], "running")
            self.assertEqual(resumed["log"], str(self.local / "controller.log"))
            self.assertEqual(experiments.read_json(self.saved / "experiment.json")["data_root"],
                             str(new_data.resolve()))

    def test_foreign_pid_is_not_a_dead_worker(self):
        with patch.object(Path, "read_bytes", return_value=b"python\0-m\0other.worker\0run\0"):
            with self.assertRaisesRegex(RuntimeError, "foreign process"):
                experiments._pid_state(123, self.saved)

    def test_pid_requires_exact_worker_command_and_save_root(self):
        command = b"python\0-m\0ai.colab_experiments\0run\0--save-root\0" + str(self.saved).encode() + b"\0"
        with patch.object(Path, "read_bytes", return_value=command):
            self.assertEqual(experiments._pid_state(123, self.saved), "active")
            with self.assertRaisesRegex(RuntimeError, "foreign process"):
                experiments._pid_state(123, self.root / "another-study")
        with patch.object(Path, "read_bytes", side_effect=FileNotFoundError):
            self.assertEqual(experiments._pid_state(123, self.saved), "dead")

    def test_publish_verifies_restored_artifacts_and_preserves_attempts(self):
        self.case(self.local)
        state = {"cases": {"sunda/ordinary": {"attempts": [], "latest_saved_attempt": None}}}
        first = experiments._publish(self.local, self.saved, "sunda", "ordinary", state, self.ctx)
        self.assertTrue((first / "manifest.json").is_file())
        second = experiments._publish(self.local, self.saved, "sunda", "ordinary", state, self.ctx)
        self.assertNotEqual(first, second)
        self.assertTrue((first / "best.pt").is_file())
        experiments._verify_case(first, self.ctx, "sunda", "ordinary")
        (second / "best.pt").write_bytes(b"corrupted")
        with self.assertRaisesRegex(ValueError, "Corrupt case artifact"):
            experiments._verify_case(second, self.ctx, "sunda", "ordinary")

    def test_failed_attempt_is_evidence_but_not_a_candidate(self):
        self.case(self.local, status="failed")
        state = {"cases": {"sunda/ordinary": {"attempts": [], "latest_saved_attempt": None}}}
        saved = experiments._publish(self.local, self.saved, "sunda", "ordinary", state, self.ctx)
        self.assertTrue((saved / "manifest.json").is_file())
        self.assertEqual(state["cases"]["sunda/ordinary"]["status"], "failed")
        with self.assertRaisesRegex(ValueError, "not resumable or selectable"):
            experiments._verify_case(saved, self.ctx, "sunda", "ordinary")

    def test_restore_chooses_latest_verified_attempt(self):
        self.case(self.local)
        state = {"cases": {"sunda/ordinary": {"attempts": [], "latest_saved_attempt": None}}}
        valid = experiments._publish(self.local, self.saved, "sunda", "ordinary", state, self.ctx)
        corrupted = experiments._publish(self.local, self.saved, "sunda", "ordinary", state, self.ctx)
        (corrupted / "last.pt").write_bytes(b"bad")
        import shutil
        shutil.rmtree(self.local)
        with patch.object(experiments, "LOCAL", self.local):
            selected = experiments._run_case(self.data, self.saved, state, self.ctx, "sunda", "ordinary")
        self.assertEqual(selected, valid)
        self.assertEqual(state["cases"]["sunda/ordinary"]["latest_saved_attempt"], str(valid))

    def test_partial_cannot_be_final_winner(self):
        self.case(self.local, status="partial", epoch=1)
        state = {"cases": {"sunda/ordinary": {"attempts": [], "latest_saved_attempt": None}}}
        published = experiments._publish(self.local, self.saved, "sunda", "ordinary", state, self.ctx)
        state["final_paths"] = {target: str(published / "best.pt") for target in experiments.TARGETS}
        state["loss_decisions"] = {"sunda": "ordinary"}
        with self.assertRaisesRegex(ValueError, "incomplete"):
            experiments._verify_completed(self.saved, state, {"sunda": self.ctx})


    def test_partial_with_no_progress_stops_without_winner(self):
        self.case(self.local / "sunda/ordinary", status="partial", epoch=0)
        state = {"status": "running", "cases": {}, "final_paths": {}}
        self.saved.mkdir()
        with (patch.object(experiments, "LOCAL", self.local),
              patch.object(experiments.subprocess, "Popen") as spawn):
            spawn.return_value.__enter__.return_value.stdout = io.StringIO("")
            spawn.return_value.__enter__.return_value.wait.return_value = 0
            with self.assertRaisesRegex(RuntimeError, "made no epoch progress"):
                experiments._run_case(self.data, self.saved, state, self.ctx, "sunda", "ordinary")
        self.assertEqual(state["final_paths"], {})
        self.assertEqual(state["cases"]["sunda/ordinary"]["status"], "failed")
        self.assertEqual(len(state["cases"]["sunda/ordinary"]["attempts"]), 1)

    def test_missing_local_restores_latest_verified_published_attempt(self):
        self.case(self.local / "sunda/ordinary", status="complete")
        state = {"status": "running", "cases": {"sunda/ordinary": {"attempts": [],
                 "latest_saved_attempt": None, "status": "complete", "epoch": 1}}}
        published = experiments._publish(self.local / "sunda/ordinary", self.saved,
                                         "sunda", "ordinary", state, self.ctx)
        import shutil
        shutil.rmtree(self.local)
        with (patch.object(experiments, "LOCAL", self.local),
              patch.object(experiments.subprocess, "Popen") as spawn):
            selected = experiments._run_case(self.data, self.saved, state, self.ctx, "sunda", "ordinary")
        self.assertEqual(selected, published)
        self.assertEqual(file_hash(self.local / "sunda/ordinary/best.pt"), file_hash(published / "best.pt"))
        spawn.assert_not_called()

    def test_status_is_small_and_never_returns_history(self):
        self.saved.mkdir()
        save_json(self.saved / "experiment.json", {"status": "failed", "pid": 5,
                  "error": "x" * 20000, "history": list(range(10000)),
                  "cases": {"sunda/ordinary": {"status": "partial", "epoch": 1,
                                                   "latest_saved_attempt": "attempt-0001"}}})
        summary = experiments.status(self.saved)
        self.assertLessEqual(len(str(summary).encode()), 8192)
        self.assertNotIn("history", summary)
        self.assertEqual(summary["cases"]["sunda/ordinary"]["status"], "partial")


if __name__ == "__main__":
    unittest.main()
