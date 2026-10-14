import hashlib
import importlib.util
import json
import os
import sys
import tempfile
import types
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

from ai import colab_notebook


class NotebookBundleTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        for index, name in enumerate(colab_notebook.RUNTIME_FILES):
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(bytes((index, 0, 255)) + name.encode())
        self.notebook = self.root / 'notebooks/notebook.ipynb'
        self.runtime = self.notebook.with_name('aksantara-colab-runtime.zip')

    def build_bundle(self):
        with patch.object(colab_notebook, 'ROOT', self.root), \
                patch.object(colab_notebook, 'OUTPUT', self.notebook), \
                patch.object(colab_notebook, 'RUNTIME_ZIP', self.runtime):
            self.assertEqual(colab_notebook.build(), self.notebook)
        return json.loads(self.notebook.read_text(encoding='utf-8'))

    def test_exact_original_byte_inventory_and_bounded_explained_cells(self):
        notebook = self.build_bundle()
        with zipfile.ZipFile(self.runtime) as archive:
            self.assertEqual(archive.namelist(), list(colab_notebook.RUNTIME_FILES))
            for name in colab_notebook.RUNTIME_FILES:
                self.assertEqual(archive.read(name), (self.root / name).read_bytes())
                self.assertEqual(archive.getinfo(name).compress_type, zipfile.ZIP_DEFLATED)
        cells = notebook['cells']
        self.assertEqual([cell['cell_type'] for cell in cells],
                         ['markdown', 'code', 'code', 'code', 'code', 'code', 'code'])
        self.assertTrue(all(cell['outputs'] == [] and cell['execution_count'] is None
                            for cell in cells if cell['cell_type'] == 'code'))
        sources = [''.join(cell['source']) for cell in cells]
        self.assertTrue(all(len(source.encode()) <= 16384 for source in sources))
        self.assertLessEqual(sum(len(source.encode()) for source in sources), 32768)

    def run_setup(self, archive, digest, work, *, cuda=True, mount=None, loaded_ai=False):
        local = self.root / 'local-runtime.zip'
        data = self.root / 'canva_classifier.zip'
        data.write_bytes(b'untouched Drive source')
        env = {'RUNTIME_SHA256': digest, 'RUNTIME_ZIP': archive, 'DATA_ZIP': data,
               'LOCAL_RUNTIME_ZIP': local, 'WORK': work}
        torch = types.ModuleType('torch')
        torch.__version__ = 'preinstalled'
        torch.cuda = types.SimpleNamespace(is_available=lambda: cuda, get_device_name=lambda _: 'T4')
        torchvision = types.ModuleType('torchvision')
        torchvision.__version__ = 'preinstalled'
        google = types.ModuleType('google')
        google.__path__ = []
        colab = types.ModuleType('google.colab')
        colab.__path__ = []
        colab.drive = types.SimpleNamespace(mount=mount or (lambda _: None))
        google.colab = colab
        previous_modules = {key: value for key, value in sys.modules.items()
                            if key == 'ai' or key.startswith('ai.')}
        previous_path = sys.path[:]
        previous_cwd = Path.cwd()
        try:
            for key in previous_modules:
                sys.modules.pop(key)
            if loaded_ai:
                old_module = types.ModuleType('ai.models')
                old_module.__file__ = str(self.root / 'old/ai/models.py')
                sys.modules['ai.models'] = old_module
            with patch.dict(sys.modules, {'torch': torch, 'torchvision': torchvision,
                                          'google': google, 'google.colab': colab}), \
                    patch.object(importlib.util, 'find_spec', return_value=object()):
                exec(colab_notebook.setup(digest), env)
        finally:
            os.chdir(previous_cwd)
            sys.path[:] = previous_path
            sys.modules.pop('ai.models', None)
            sys.modules.update(previous_modules)
        return env

    def test_cpu_rejected_before_drive_authorization(self):
        self.build_bundle()
        calls = []
        work = self.root / 'work'
        digest = hashlib.sha256(self.runtime.read_bytes()).hexdigest()
        with self.assertRaisesRegex(RuntimeError, 'Change runtime type > T4 GPU'):
            self.run_setup(self.runtime, digest, work, cuda=False, mount=calls.append)
        self.assertEqual(calls, [])
        self.assertFalse(work.exists())

    def test_old_imported_runtime_requires_restart(self):
        self.build_bundle()
        digest = hashlib.sha256(self.runtime.read_bytes()).hexdigest()
        work = self.root / 'work'
        with self.assertRaisesRegex(RuntimeError, 'restart runtime'):
            self.run_setup(self.runtime, digest, work, loaded_ai=True)
        self.assertFalse(work.exists())

    def test_tampered_runtime_refused_before_extraction(self):
        self.build_bundle()
        digest = hashlib.sha256(self.runtime.read_bytes()).hexdigest()
        with self.runtime.open('ab') as archive:
            archive.write(b'tampered')
        work = self.root / 'work'
        with self.assertRaisesRegex(ValueError, 'SHA256 mismatch'):
            self.run_setup(self.runtime, digest, work)
        self.assertFalse(work.exists())

    def test_duplicate_traversal_and_symlink_members_never_publish(self):
        for kind in ('duplicate', 'traversal', 'symlink'):
            with self.subTest(kind=kind):
                archive = self.root / f'{kind}.zip'
                with zipfile.ZipFile(archive, 'w') as output:
                    for name in colab_notebook.RUNTIME_FILES:
                        if kind == 'symlink' and name == 'ai/data.py':
                            info = zipfile.ZipInfo(name)
                            info.create_system = 3
                            info.external_attr = 0o120777 << 16
                            output.writestr(info, b'../outside')
                        else:
                            output.write(self.root / name, name)
                    if kind == 'duplicate':
                        output.writestr('ai/data.py', b'duplicate')
                    if kind == 'traversal':
                        output.writestr('../outside', b'escape')
                work = self.root / kind
                with self.assertRaises(ValueError):
                    self.run_setup(archive, hashlib.sha256(archive.read_bytes()).hexdigest(), work)
                self.assertFalse(work.exists())
                self.assertFalse((self.root / 'outside').exists())

    def test_repeated_bootstrap_does_not_merge_changed_or_missing_runtime_file(self):
        self.build_bundle()
        digest = hashlib.sha256(self.runtime.read_bytes()).hexdigest()
        work = self.root / 'work'
        self.run_setup(self.runtime, digest, work)
        self.assertEqual((work / 'ai/data.py').read_bytes(), (self.root / 'ai/data.py').read_bytes())
        (work / 'ai/data.py').unlink()
        with self.assertRaisesRegex(ValueError, 'missing or unsafe'):
            self.run_setup(self.runtime, digest, work)

    def test_fresh_dataset_extraction_preserves_previous_root_on_failure(self):
        # Run the actual generated extraction cell without Colab or a real Drive mount.
        archive = self.root / 'canva_classifier.zip'
        env = {'DATA_ZIP': archive, 'DATA_LOCAL_PARENT': self.root, 'DATA_ROOT': 'previous'}
        for name in ('first', 'second'):
            with zipfile.ZipFile(archive, 'w') as output:
                for script in ('lontara', 'sunda', 'bali'):
                    output.writestr(f'canvas_classifier/{script}/{name}.png', name)
            exec(colab_notebook.extraction(), env)
            root = env['DATA_ROOT']
            self.assertTrue((root / 'lontara' / f'{name}.png').exists())
            if name == 'second':
                self.assertFalse((root / 'lontara/first.png').exists())
        previous = env['DATA_ROOT']
        with zipfile.ZipFile(archive, 'w') as output:
            output.writestr('canvas_classifier/lontara/only.png', b'partial')
        with self.assertRaisesRegex(ValueError, 'Expected exactly one'):
            exec(colab_notebook.extraction(), env)
        self.assertEqual(env['DATA_ROOT'], previous)
        self.assertTrue((previous / 'lontara/second.png').exists())


if __name__ == '__main__':
    unittest.main()
