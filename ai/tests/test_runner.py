"""Resolve Kaggle mounts against real audited bytes in isolated temporary directories."""
from __future__ import annotations

import hashlib
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from ai import runner


class ResolveMountBehaviorTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.input_root = self.base / "input"
        self.input_root.mkdir()
        self.virtual = self.base / "working" / "datasets" / "canvas_classifier"
        self.contents = (b"audited Ka image bytes\x00\x01", b"audited Ga image bytes\x02\x03")
        paths = ("lontara/aksara-lontara-fix/Ka/first.png",
                 "lontara/aksara-lontara-fix/Ga/second.png")
        self.audit = {"samples": [
            {"script": "lontara", "source": "source", "path": path,
             "byte_sha256": hashlib.sha256(content).hexdigest()}
            for path, content in zip(paths, self.contents)
        ]}
        # Patch only the runner's constructor, never pathlib or the real Kaggle filesystem.
        path_patch = patch.object(runner, "Path", side_effect=self.isolated_path)
        path_patch.start()
        self.addCleanup(path_patch.stop)

    def isolated_path(self, path):
        if path == "/kaggle/working/datasets/canvas_classifier":
            return self.virtual
        return Path(path)

    def mount(self, wrapper: str) -> Path:
        root = self.input_root / wrapper / "lontara"
        for sample, content in zip(self.audit["samples"], self.contents):
            path = root / Path(sample["path"]).relative_to("lontara")
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
        return root

    def resolve(self) -> Path:
        return runner.resolve_mount(self.input_root, self.audit, "lontara")

    def test_nested_wrapper_mount_preserves_audited_bytes_and_hashes(self):
        root = self.mount("private-dataset/archive/wrapper")

        if os.name == "nt":
            # Directory junctions exercise real mounted reads without Windows symlink privilege.
            def junction(path, target, target_is_directory=False):
                subprocess.run(["cmd", "/c", "mklink", "/J", str(path), str(target)],
                               check=True, capture_output=True)
            with patch.object(Path, "symlink_to", junction):
                resolved = self.resolve()
        else:
            resolved = self.resolve()

        self.assertEqual(resolved, self.virtual)
        self.assertEqual((resolved / "lontara").resolve(), root.resolve())
        for sample, content in zip(self.audit["samples"], self.contents):
            with self.subTest(path=sample["path"]):
                mounted_bytes = (resolved / sample["path"]).read_bytes()
                self.assertEqual(mounted_bytes, content)
                self.assertEqual(hashlib.sha256(mounted_bytes).hexdigest(), sample["byte_sha256"])

    def test_missing_audited_file_reports_path_instead_of_accepting_partial_mount(self):
        root = self.mount("private-dataset/wrapper")
        missing = self.audit["samples"][1]["path"]
        (root / Path(missing).relative_to("lontara")).unlink()

        with self.assertRaisesRegex(ValueError, "(?i)missing.*path") as raised:
            self.resolve()

        self.assertIn(missing, str(raised.exception))
        self.assertFalse((self.virtual / "lontara").exists())

    def test_changed_bytes_reject_mount_even_when_all_paths_exist(self):
        root = self.mount("private-dataset/wrapper")
        changed = self.audit["samples"][1]["path"]
        (root / Path(changed).relative_to("lontara")).write_bytes(b"changed image bytes")

        with self.assertRaisesRegex(ValueError, "(?i)byte.*hash.*mismatch") as raised:
            self.resolve()

        self.assertIn(changed, str(raised.exception))
        self.assertFalse((self.virtual / "lontara").exists())

    def test_two_hash_verified_roots_are_ambiguous(self):
        first = self.mount("first-dataset/wrapper")
        second = self.mount("second-dataset/deeper/wrapper")

        with self.assertRaisesRegex(ValueError, "(?i)ambiguous.*mounts") as raised:
            self.resolve()

        self.assertIn(first.as_posix(), str(raised.exception).replace("\\", "/"))
        self.assertIn(second.as_posix(), str(raised.exception).replace("\\", "/"))
        self.assertFalse((self.virtual / "lontara").exists())

    def test_same_basename_without_relative_inventory_path_is_not_a_candidate(self):
        decoy = self.input_root / "wrong-wrapper" / "first.png"
        decoy.parent.mkdir()
        decoy.write_bytes(self.contents[0])

        with self.assertRaisesRegex(ValueError, "(?i)no.*relative.*candidate"):
            self.resolve()

        self.assertFalse((self.virtual / "lontara").exists())

    def test_empty_or_absent_input_reports_empty_mount(self):
        for input_root in (self.input_root, self.base / "absent-input"):
            with self.subTest(input_root=input_root):
                with self.assertRaisesRegex(ValueError, "(?i)empty.*mount") as raised:
                    runner.resolve_mount(input_root, self.audit, "lontara")
                self.assertIn(str(input_root), str(raised.exception))
                self.assertFalse((self.virtual / "lontara").exists())


class QueuePolicyTests(unittest.TestCase):
    def test_resolved_permission_unblocks_pending_work_without_losing_running_job(self):
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            provenance = base / "provenance.json"
            config = base / "training.json"
            splits, runs = base / "splits", base / "runs"
            runner.save(config, {"provenance_path": str(provenance)})
            runner.save(splits / "manifest.json", {"ready_scripts": list(runner.SCRIPTS)})
            records = {script: {"training": "unresolved", "release": "unresolved"}
                       for script in runner.SCRIPTS}
            runner.save(provenance, records)
            args = runner.parser().parse_args(["queue", "--config", str(config),
                                              "--splits", str(splits), "--runs", str(runs)])
            initial = runner.queue(args)
            active = next(row for row in initial["runs"] if row["script"] == "lontara"
                          and row["stage"] == "screening" and row["model"] == "mobile")
            active.update(status="running", slug="actual-notebook", version=1)
            runner.save(runs / "queue.json", initial)
            for record in records.values():
                record["training"] = "allowed"
            runner.save(provenance, records)
            updated = runner.queue(args)["runs"]
            self.assertEqual(next(row for row in updated if row["run_id"] == active["run_id"]), active)
            for row in updated:
                if row["script"] in ("sunda", "bali") and row["stage"] == "screening":
                    self.assertEqual(row["status"], "pending")
                    self.assertIsNone(row["reason"])
                if row["stage"] == "release":
                    self.assertEqual(row["status"], "blocked")


if __name__ == "__main__":
    unittest.main()
