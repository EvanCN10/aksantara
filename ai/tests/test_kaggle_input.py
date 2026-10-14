import tempfile
import unittest
import zipfile
from pathlib import Path

from ai.kaggle_input import extract_source


class SourceArchiveTests(unittest.TestCase):
    def test_source_bytes_preserved_without_escaping_destination(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            archive = root / 'source.zip'
            with zipfile.ZipFile(archive, 'w') as source:
                source.writestr('wrapper/Ka/image.png', b'actual archived bytes')
            extract_source(archive, root / 'data')
            self.assertEqual((root / 'data/wrapper/Ka/image.png').read_bytes(), b'actual archived bytes')

    def test_unsafe_member_rejected_before_any_extraction(self):
        for member in ('../escaped.png', '/absolute.png'):
            with self.subTest(member=member), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                archive = root / 'source.zip'
                with zipfile.ZipFile(archive, 'w') as source:
                    source.writestr('valid.png', b'valid')
                    source.writestr(member, b'unsafe')
                with self.assertRaisesRegex(ValueError, 'Unsafe source archive member'):
                    extract_source(archive, root / 'data')
                self.assertFalse((root / 'data').exists())
