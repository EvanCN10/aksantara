"""Retrieve reviewed source versions explicitly; never reupload source images as outputs."""
from __future__ import annotations

import hashlib
import json
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from urllib.parse import urlparse


def prepare_input(source: dict | None, mounted: Path) -> Path:
    if source is None:
        return mounted
    if source.get('training') != 'allowed' or not isinstance(source.get('version'), int):
        raise ValueError('Pinned source input requires documented training permission and version')
    reference = source['dataset_ref']
    if len(reference.split('/')) != 2 or any(part in ('', '.', '..') for part in reference.split('/')):
        raise ValueError(f'Invalid source dataset reference: {reference}')
    root = Path(tempfile.mkdtemp(prefix='aksantara-input-'))
    if mounted.is_dir():
        for index, child in enumerate(mounted.iterdir()):
            (root / f'mounted-{index}').symlink_to(child, target_is_directory=child.is_dir())
    archive = root / 'source.zip'
    url = f'https://www.kaggle.com/api/v1/datasets/download/{reference}?datasetVersionNumber={source["version"]}'
    print(f'Retrieving reviewed source {reference} version {source["version"]}', flush=True)
    urllib.request.urlretrieve(url, archive)
    extract_source(archive, root / 'source')
    archive.unlink()
    return root


def extract_source(archive: Path, destination: Path) -> None:
    with zipfile.ZipFile(archive) as source:
        for entry in source.infolist():
            if not (destination / entry.filename).resolve().is_relative_to(destination.resolve()):
                raise ValueError(f'Unsafe source archive member: {entry.filename}')
            if (entry.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError(f'Source archive symlink not supported: {entry.filename}')
        source.extractall(destination)


def prepare_artifacts(records: list[dict]) -> None:
    for record in records:
        destination = Path(record['destination']).resolve()
        if not destination.is_relative_to(Path('/kaggle/working/input-artifacts').resolve()):
            raise ValueError('Artifact destination must stay within /kaggle/working/input-artifacts')
        url = urlparse(record['url'])
        if url.scheme != 'https' or url.hostname != 'www.kaggleusercontent.com':
            raise ValueError('Artifact URL must be a signed Kaggle output URL')
        if not record.get('notebook_ref') or not isinstance(record.get('version'), int):
            raise ValueError('Artifact provenance requires actual notebook reference and version')
        with tempfile.TemporaryDirectory(prefix='aksantara-artifact-') as temporary:
            archive = Path(temporary) / 'artifacts.zip'
            urllib.request.urlretrieve(record['url'], archive)
            if hashlib.sha256(archive.read_bytes()).hexdigest() != record['sha256']:
                raise ValueError('Downloaded artifact bundle checksum mismatch')
            name = record.get('file_name')
            if name is None:
                extract_source(archive, destination)
            else:
                if not isinstance(name, str) or name in ('', '.', '..') or '/' in name or '\\' in name:
                    raise ValueError('Artifact file name must be a single path component')
                destination.mkdir(parents=True, exist_ok=True)
                import shutil
                shutil.copyfile(archive, destination / name)
        print(f'Verified artifact input: {record["notebook_ref"]} version {record["version"]}', flush=True)


def bundle_run(directory: Path) -> Path:
    manifest = json.loads((directory / 'manifest.json').read_text())
    archive = directory / 'input-bundle.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as output:
        for name, expected in manifest['artifact_hashes'].items():
            if Path(name).name != name or hashlib.sha256((directory / name).read_bytes()).hexdigest() != expected:
                raise ValueError(f'Run artifact checksum mismatch: {name}')
            output.write(directory / name, name)
        output.write(directory / 'manifest.json', 'manifest.json')
    return archive
