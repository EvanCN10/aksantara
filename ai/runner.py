"""Run from repository root: python ai/runner.py --help."""
from __future__ import annotations

import argparse
import functools
import hashlib
import http.server
import json
import platform
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
SCRIPTS = ('sunda', 'lontara', 'bali')
MODELS = ('mobile', 'cnn', 'efficient', 'hybrid', 'mobile-scratch', 'resnet18', 'resnet18-scratch')


def load(path: Path) -> dict:
    if not path.is_file():
        raise ValueError(f'Missing required file: {path}')
    return json.loads(path.read_text(encoding='utf-8'))


def save(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(path)


def digest(value: object) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def queue(args: argparse.Namespace) -> dict:
    config = load(args.config)
    provenance = load(Path(config['provenance_path']))
    split = load(args.splits / 'manifest.json') if (args.splits / 'manifest.json').exists() else {}
    identity = {k: split.get(k) for k in ('dataset_hash', 'label_hash', 'split_hash')}
    identity['config_hash'] = digest(config)
    entries = []
    for model in MODELS:
        for script in SCRIPTS:
            entries.append(queue_entry(script, 'screening', model, 42, identity, provenance, split))
    for script in SCRIPTS:
        for stage in ('loss-pilot', 'family-reruns', 'resolution224', 'canvas-finetune', 'ensemble', 'distill', 'calibration', 'export', 'browser-benchmark', 'freeze', 'test', 'release'):
            item = queue_entry(script, stage, None, None, identity, provenance, split)
            item['dependencies'] = [e['run_id'] for e in entries if e['script'] == script and e['stage'] == 'screening']
            if stage in ('canvas-finetune', 'test', 'release'):
                item['status'] = 'blocked'
                item['reason'] = 'Requires consented real-canvas writer-disjoint collection and curated mappings; no collection exists yet.'
            if stage == 'release' and provenance[script]['release'] != 'allowed':
                item['reason'] += ' Release permission unresolved.'
            entries.append(item)
    previous = load(args.runs / 'queue.json') if (args.runs / 'queue.json').exists() else {'runs': []}
    old = {e['run_id']: e for e in previous['runs']}
    # Recompute policy blockers; only preserve actual execution state.
    entries = [old[e['run_id']] if old.get(e['run_id'], {}).get('status') in
               ('queued', 'running', 'partial', 'complete', 'failed') else e for e in entries]
    result = {'identity': identity, 'runs': entries, 'policy': 'One active GPU job, free quota only; smoke never completes screening.'}
    save(args.runs / 'queue.json', result)
    return result


def queue_entry(script: str, stage: str, model: str | None, seed: int | None, identity: dict, provenance: dict, split: dict) -> dict:
    fields = {'script': script, 'stage': stage, 'model': model, 'seed': seed, **identity}
    reason = None
    if provenance[script]['training'] != 'allowed':
        reason = provenance[script].get('missing_prerequisite', 'Training permission unresolved')
    elif script not in split.get('ready_scripts', []):
        reason = f'Immutable covered split unavailable: {split.get("blocked_scripts", {}).get(script, "run split first")}'
    return {**fields, 'run_id': digest(fields)[:20], 'dependencies': [], 'status': 'blocked' if reason else 'pending', 'reason': reason, 'owner': None, 'slug': None, 'version': None}


def family_statistics(observed: list[dict]) -> list[dict]:
    import statistics
    families = {}
    for row in observed:
        manifest = row['manifest']
        identity = manifest.get('identity', {})
        metric = manifest.get('best')
        if manifest.get('status') != 'complete' or identity.get('smoke') or not metric:
            continue
        key = tuple(identity.get(k) for k in ('script', 'model', 'size', 'stage'))
        families.setdefault(key, []).append(row)
    results = []
    for key, rows in sorted(families.items()):
        seeds = [row['manifest']['identity']['seed'] for row in rows]
        if len(seeds) != len(set(seeds)):
            raise ValueError(f'Duplicate completed seed for family {key}; select attempts explicitly before comparison')
        scores = [row['manifest']['best']['macro_f1'] for row in rows]
        winner = min(rows, key=lambda r: (-r['manifest']['best']['macro_f1'], r['manifest']['best']['loss'], r['manifest']['best']['epoch']))
        results.append({'script': key[0], 'model': key[1], 'size': key[2], 'stage': key[3],
                        'seeds': sorted(seeds), 'macro_f1_mean': statistics.mean(scores),
                        'macro_f1_std': statistics.stdev(scores) if len(scores) > 1 else None,
                        'reruns_complete': set(seeds) == {42, 43, 44},
                        'selected_checkpoint': str(Path(winner['path']).parent / 'best.pt')})
    return results

def pilot_winners(args: argparse.Namespace) -> dict[str, Path]:
    from ai.evaluate import select_pilot_loss
    from ai.train import context
    winners = {}
    for script, decision in load(args.config).get('loss_choice', {}).items():
        script_args = argparse.Namespace(**{**vars(args), 'script': script, 'size': 128})
        paths = [Path(path) for path in decision['pilots']]
        selected = select_pilot_loss(paths, context(script_args))
        if selected != decision['loss']:
            raise ValueError(f'{script}: configured loss differs from verified pilot winner')
        manifests = [path / 'manifest.json' if path.is_dir() else path for path in paths]
        winners[script] = next(path.resolve() for path in manifests if load(path)['identity']['loss'] == selected)
    return winners


def report(args: argparse.Namespace) -> dict:
    matrix = queue(args)
    observed = []
    winners = pilot_winners(args)
    comparable = []
    for path in sorted(args.runs.rglob('metrics.json')):
        manifest_path = path.parent / 'manifest.json'
        manifest = load(manifest_path) if manifest_path.is_file() else {}
        observed.append({'path': path.as_posix(), 'metrics': load(path), 'manifest': manifest})
        identity = manifest.get('identity', {})
        reused_pilot = winners.get(identity.get('script')) == manifest_path.resolve()
        compatible = all(identity.get('hashes', {}).get(k) == matrix['identity'][k]
                         for k in ('dataset_hash', 'label_hash', 'split_hash'))
        compatible = compatible and (identity.get('hashes', {}).get('config_hash') == matrix['identity']['config_hash'] or reused_pilot)
        if manifest.get('pilot') and not reused_pilot:
            compatible = False
        if compatible and manifest.get('status') == 'complete' and not identity.get('smoke'):
            checkpoint = path.parent / 'best.pt'
            expected = manifest.get('artifact_hashes', {}).get('best.pt')
            if not checkpoint.is_file() or not expected or hashlib.sha256(checkpoint.read_bytes()).hexdigest() != expected:
                raise ValueError(f'Comparison checkpoint missing or checksum mismatch: {checkpoint}')
            comparable.append(observed[-1])
        for entry in matrix['runs']:
            matches = entry['stage'] == 'screening' and identity.get('stage') == 'supervised' and identity.get('size') == 128
            matches = matches and all(identity.get(k) == entry[k] for k in ('script', 'model', 'seed'))
            matches = matches and compatible
            if matches and not identity.get('smoke') and (path.parent / 'best.pt').is_file():
                entry.update(status=manifest.get('status', 'pending'), reason=manifest.get('error'), artifact=str(path.parent))
    save(args.runs / 'queue.json', matrix)
    releases = {s: (ROOT / 'ai/artifacts/release' / s / 'manifest.json').is_file() for s in SCRIPTS}
    result = {'queue': matrix, 'observed_runs': observed, 'release_packages_present': releases,
              'family_statistics': family_statistics(comparable),
              'release_ready': all(releases.values()) and all(e['status'] == 'complete' for e in matrix['runs']),
              'limitations': [e['reason'] for e in matrix['runs'] if e.get('reason')],
              'environment': {'python': sys.version, 'platform': platform.platform()}}
    save(args.out / 'comparison.json', result)
    rows = ['# Experiment evidence', '', '| Script | Stage | Model | Status | Reason |', '|---|---|---|---|---|']
    for item in matrix['runs']:
        rows.append('| ' + ' | '.join(str(item.get(k) or '-').replace('|', '/') for k in ('script', 'stage', 'model', 'status', 'reason')) + ' |')
    (args.out / 'comparison.md').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    return result


def notebook_sources(script: str, split: dict, provenance: dict) -> list[str]:
    rows = [s for s in split['samples'] if s['script'] == script]
    record = provenance[script]
    required = []
    if any(s.get('source', 'source') == 'source' for s in rows):
        required.append(record)
    captures = [s for s in rows if s.get('source') == 'canvas']
    if captures:
        if any(not s.get('consent', {}).get('private_upload') for s in captures):
            raise ValueError(f'{script}: every mounted capture needs private-upload consent')
        required.append(record.get('own_data', record.get('groups', {}).get('canvas-consented', {})))
    if not required:
        raise ValueError(f'{script}: no data to mount')
    for source in required:
        if source.get('training') != 'allowed' or not source.get('evidence') or not source.get('dataset_ref'):
            raise ValueError(f'{script}: notebook requires documented training permission and a permitted Kaggle dataset_ref')
    return [source['dataset_ref'] for source in required]


def _base_audit_row(row: dict, redecode: bool) -> dict:
    result = dict(row)
    for key in ('sample_id', 'group_id', 'group_partition_hints', 'duplicate_of'):
        result.pop(key, None)
    result['quarantine_reasons'] = [r for r in row['quarantine_reasons']
                                    if r not in ('same_label_exact_duplicate', 'cross_label_exact_duplicate')]
    result['status'] = 'quarantine' if result['quarantine_reasons'] else 'valid'
    if redecode:
        for key in ('byte_size', 'format', 'mode', 'width', 'height', 'oriented_width', 'oriented_height',
                    'pixel_sha256', 'phash', 'preprocessing', 'decode_status'):
            result.pop(key, None)
    return result


def _pack_metadata(embeds: dict, script: str) -> dict:
    metadata = dict(embeds)
    originals = metadata.pop('ai/runs/audit/samples.json')['samples']
    indices = {row['sample_id']: index for index, row in enumerate(originals)}
    split = dict(metadata['ai/runs/splits/manifest.json'])
    assignments = [[indices[row['sample_id']], row['partition']] for row in split.pop('samples')]
    metadata['ai/runs/splits/manifest.json'] = split
    audit = metadata['ai/runs/audit/manifest.json']
    metadata['ai/runs/audit/manifest.json'] = {key: audit[key] for key in
                                              ('audit_version', 'dataset_hash', 'label_hash', 'data_root', 'labels')}
    # Re-decode every source to avoid embedding unrelated scripts' pixel hashes.
    redecode = [index for index, row in enumerate(originals) if row.get('decode_status') == 'ok']
    selected = set(redecode)
    return {'metadata': metadata, 'script': script, 'assignments': assignments, 'redecode': redecode,
            'samples': [_base_audit_row(row, index in selected) for index, row in enumerate(originals)]}


def _restore_metadata(payload: dict, input_root: Path, data_root: Path | None = None) -> tuple[dict, Path]:
    from ai.data import _decode, _group
    samples = payload['samples']
    if data_root is None:
        root = resolve_mount(input_root, {'samples': samples}, payload['script'])
        for script in sorted({samples[index]['script'] for index in payload['redecode']} - {payload['script']}):
            resolve_mount(input_root, {'samples': samples}, script)
    else:
        root = data_root
    for row in samples:
        row['sample_id'] = hashlib.sha256((row['script'] + chr(0) + row['path']).encode()).hexdigest()
    for index in payload['redecode']:
        row = samples[index]
        expected = row['byte_sha256']
        _decode(root / row['path'], row)
        if row.get('byte_sha256') != expected or row.get('decode_status') != 'ok':
            raise ValueError(f'Notebook audited-image reconstruction failed: {row["path"]}')
    _group(samples)
    metadata = payload['metadata']
    audit = metadata['ai/runs/audit/manifest.json']
    if digest({'samples': samples, 'label_hash': audit['label_hash'], 'version': audit['audit_version']}) != audit['dataset_hash']:
        raise ValueError('Reconstructed notebook audit hash mismatch; check image decoder/environment')
    metadata['ai/runs/audit/samples.json'] = {'samples': samples}
    split = metadata['ai/runs/splits/manifest.json']
    split['samples'] = [dict(samples[index], partition=partition) for index, partition in payload['assignments']]
    if digest({k: v for k, v in split.items() if k != 'split_hash'}) != split['split_hash']:
        raise ValueError('Reconstructed notebook split hash mismatch')
    return metadata, root


def build_notebook(args: argparse.Namespace) -> dict:
    config = load(args.config)
    provenance = load(Path(config['provenance_path']))
    # Resolve permissions only for the sources actually included in the immutable split.
    split = load(args.splits / 'manifest.json')
    if args.script is None:
        raise ValueError('--script is required')
    if args.script not in split.get('ready_scripts', []):
        raise ValueError(f'{args.script}: immutable split not ready: {split.get("blocked_scripts")}')
    refs = list(dict.fromkeys(reference for script in split['ready_scripts']
                             for reference in notebook_sources(script, split, provenance)))
    modules = {p.relative_to(ROOT).as_posix(): p.read_text(encoding='utf-8') for p in (ROOT / 'ai').glob('*.py')}
    portable = {'config': args.config, 'labels': Path(config['labels_path']), 'provenance': Path(config['provenance_path'])}
    if any(p.is_absolute() or '..' in p.parts for p in portable.values()):
        raise ValueError('Notebook config/labels/provenance paths must be repository-relative without parent traversal')
    embeds = {args.config.as_posix(): config, portable['provenance'].as_posix(): provenance,
              portable['labels'].as_posix(): load(portable['labels']),
              'ai/runs/splits/manifest.json': split, 'ai/runs/audit/manifest.json': load(args.audit / 'manifest.json'),
              'ai/runs/audit/samples.json': load(args.audit / 'samples.json')}
    for decision in config.get('loss_choice', {}).values():
        for value in decision['pilots']:
            path = Path(value)
            path = path / 'manifest.json' if path.is_dir() else path
            if path.is_absolute() or '..' in path.parts:
                raise ValueError('Pilot evidence paths must be repository-relative for portable notebooks')
            pilot = load(path)
            identity = pilot['identity']
            embeds[path.as_posix()] = {'status': pilot['status'], 'config': {'training': pilot['config']['training']},
                                      'identity': {key: identity[key] for key in ('script', 'model', 'seed', 'size', 'stage', 'smoke',
                                                                               'initialize_hash', 'loss', 'train_ids_hash', 'selection_ids_hash', 'hashes')},
                                      'best': {key: pilot['best'][key] for key in ('macro_f1', 'min_recall')}}
    run_id = digest({'script': args.script, 'model': args.model, 'seed': args.seed, 'stage': args.stage,
                     'config': config, 'split': split.get('split_hash'), 'smoke': args.smoke,
                     'size': args.size, 'loss': args.loss, 'pilot': args.pilot,
                     'initialize': str(args.initialize) if args.initialize else None,
                     'teacher': str(args.teacher) if args.teacher else None,
                     'include_canvas': args.include_canvas})[:20]
    import base64
    import lzma
    packed = _pack_metadata(embeds, args.script)
    artifacts = load(args.input_artifacts) if args.input_artifacts else []
    bundle = json.dumps({'modules': modules, 'payload': packed, 'artifacts': artifacts}, ensure_ascii=False, separators=(',', ':')).encode()
    compressed = base64.b85encode(lzma.compress(bundle, filters=[{'id': lzma.FILTER_LZMA2,
                                                                'preset': 9 | lzma.PRESET_EXTREME, 'lc': 0, 'lp': 0, 'pb': 0}])).decode()
    setup = 'import json, pathlib, sys, subprocess, base64, lzma\n'
    setup += f'bundle = json.loads(lzma.decompress(base64.b85decode({compressed!r})))\n'
    setup += 'modules,payload=bundle["modules"],bundle["payload"]\n'
    setup += 'for name, source in modules.items():\n p=pathlib.Path(name); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(source,encoding="utf-8")\n'
    setup += 'subprocess.check_call([sys.executable,"-m","pip","install","ImageHash==4.3.2","Pillow==12.3.0","onnx","onnxruntime","onnxscript"])\n'
    setup += 'sys.path.insert(0,str(pathlib.Path.cwd()))\n'
    source_scripts = sorted({row['script'] for row in split['samples'] if row.get('source', 'source') == 'source'})
    preflight = 'import shutil\nfrom ai.runner import _restore_metadata\nfrom ai.kaggle_input import prepare_input, prepare_artifacts\n'
    preflight += 'prepare_artifacts(bundle["artifacts"])\n'
    preflight += 'input_root=pathlib.Path("/kaggle/working/reconstruction-input"); input_root.mkdir(exist_ok=True)\n'
    for script in source_scripts:
        source_expression = f'payload["metadata"][{portable["provenance"].as_posix()!r}][{script!r}]'
        preflight += f'source_root=prepare_input({source_expression},pathlib.Path("/kaggle/input"))\n'
        preflight += f'shutil.move(str(source_root),str(input_root/{script!r}))\n'
    preflight += 'metadata,root=_restore_metadata(payload,input_root)\n'
    preflight += 'for name, value in metadata.items():\n p=pathlib.Path(name); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(value,ensure_ascii=False),encoding="utf-8")\n'
    preflight += 'print("Verified dataset and split:",metadata["ai/runs/audit/manifest.json"]["dataset_hash"],metadata["ai/runs/splits/manifest.json"]["split_hash"])\n'
    cmd = ['train', '--config', args.config.as_posix(), '--script', args.script, '--model', args.model, '--seed', str(args.seed), '--stage', args.stage, '--size', str(args.size), '--out', f'/kaggle/working/runs/{run_id}']
    if args.loss:
        cmd += ['--loss', args.loss]
    if args.pilot:
        cmd += ['--pilot']
    if args.smoke:
        cmd += ['--smoke', '--epochs', str(args.epochs if args.epochs is not None else 2)]
    if args.resume:
        cmd += ['--resume', str(args.resume)]
    for flag in ('initialize', 'teacher'):
        if getattr(args, flag, None):
            cmd += ['--' + flag, str(getattr(args, flag))]
    if args.include_canvas:
        cmd += ['--include-canvas']
    configuration = f'RUN_ID={run_id!r}\nCOMMAND={cmd!r}\nprint("Experiment:",RUN_ID,COMMAND)\n'
    training = 'subprocess.check_call([sys.executable,"ai/runner.py"]+COMMAND+["--data-root",str(root)])\n'
    summary = 'run_dir=pathlib.Path("/kaggle/working/runs")/RUN_ID\n'
    summary += 'result=json.loads((run_dir/"manifest.json").read_text())\n'
    summary += 'print(json.dumps({"status":result["status"],"best":{k:result.get("best",{}).get(k) for k in ("macro_f1","min_recall","epoch")}},indent=2))\n'
    summary += 'from ai.kaggle_input import bundle_run\nprint("Verified output bundle:",bundle_run(run_dir))\n'
    cells = [configuration, setup, preflight, training, summary]
    source_bytes = sum(len(cell.encode()) for cell in cells)
    if source_bytes >= 1_000_000:
        raise ValueError(f'Kaggle notebook source exceeds safe 1MB boundary: {source_bytes} bytes')
    notebook = {'nbformat': 4, 'nbformat_minor': 5, 'metadata': {'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'}},
                'cells': [{'id': f'{run_id}-{index}', 'cell_type': 'code', 'metadata': {}, 'execution_count': None,
                           'outputs': [], 'source': cell.splitlines(keepends=True)} for index, cell in enumerate(cells)]}
    path = ROOT / 'ai/notebooks' / f'{run_id}.ipynb'
    save(path, notebook)
    return {'run_id': run_id, 'path': str(path), 'dataset_refs': refs, 'private': True}


def resolve_mount(input_root: Path, audit_samples: dict, script: str) -> Path:
    samples = [s for s in audit_samples['samples'] if s['script'] == script and s.get('source', 'source') == 'source']
    virtual = Path('/kaggle/working/datasets/canvas_classifier')
    virtual.mkdir(parents=True, exist_ok=True)
    if not samples:
        mount_captures(input_root, audit_samples, script, virtual)
        return virtual
    if not input_root.is_dir() or not any(input_root.iterdir()):
        raise ValueError(f'Empty dataset mount: {input_root}; verify notebook dataset attachments before training')
    relative = Path(samples[0]['path']).relative_to(script)
    candidates = set()
    for match in input_root.rglob(relative.name):
        for ancestor in match.parents:
            if (ancestor / relative).is_file() and (ancestor / relative).resolve() == match.resolve():
                candidates.add(ancestor)
    if not candidates:
        raise ValueError(f'No {script} relative-path candidate for {relative} under {input_root}')
    valid, failures = [], []
    for root in sorted(candidates):
        for sample in samples:
            path = root / Path(sample['path']).relative_to(script)
            if not path.is_file():
                failures.append(f'{root}: missing path {sample["path"]}')
                break
            if hashlib.sha256(path.read_bytes()).hexdigest() != sample['byte_sha256']:
                failures.append(f'{root}: byte hash mismatch {sample["path"]}')
                break
        else:
            valid.append(root)
    if not valid:
        raise ValueError(f'No inventory/hash-verified {script} mount: ' + '; '.join(failures))
    if len(valid) > 1:
        raise ValueError(f'Ambiguous inventory/hash-verified {script} mounts: {valid}')
    destination = virtual / script
    if destination.exists() and destination.resolve() != valid[0].resolve():
        raise ValueError(f'Conflicting data mount: {destination}')
    if not destination.exists():
        destination.symlink_to(valid[0], target_is_directory=True)
    mount_captures(input_root, audit_samples, script, virtual)
    return virtual


def mount_captures(input_root: Path, audit_samples: dict, script: str, virtual: Path) -> None:
    import os
    captures = [s for s in audit_samples['samples'] if s['script'] == script and s.get('source') == 'canvas']
    for sample in captures:
        if not sample.get('consent', {}).get('private_upload'):
            raise ValueError(f'Capture lacks private-upload consent: {sample["path"]}')
        matches = [p for p in input_root.rglob(Path(sample['path']).name)
                   if p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest() == sample['byte_sha256']]
        if len(matches) != 1:
            raise ValueError(f'Expected exactly one hash-verified capture mount: {sample["path"]}; found {len(matches)}')
        destination = Path(os.path.abspath(virtual / sample['path']))
        if not destination.is_relative_to(virtual.parent):
            raise ValueError(f'Capture path escapes dataset workspace: {sample["path"]}')
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists() and destination.resolve() != matches[0].resolve():
            raise ValueError(f'Conflicting capture mount: {destination}')
        if not destination.exists():
            destination.symlink_to(matches[0])


def setup_runtime(args: argparse.Namespace) -> dict:
    import io
    import tarfile
    version = '1.22.0'
    url = f'https://registry.npmjs.org/onnxruntime-web/-/onnxruntime-web-{version}.tgz'
    with urllib.request.urlopen(url, timeout=120) as response:
        payload = response.read()
    out = ROOT / 'ai/artifacts/runtime'
    out.mkdir(parents=True, exist_ok=True)
    names = ('ort.wasm.min.mjs', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm')
    files = {}
    with tarfile.open(fileobj=io.BytesIO(payload), mode='r:gz') as archive:
        for name in names:
            member = archive.extractfile(f'package/dist/{name}')
            if member is None:
                raise ValueError(f'Runtime asset missing: {name}')
            data = member.read()
            (out / name).write_bytes(data)
            files[name] = {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    result = {'version': version, 'source': url, 'files': files}
    save(out / 'manifest.json', result)
    return result


def serve(args: argparse.Namespace) -> None:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / 'ai'))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    print(f'Harness ready http://127.0.0.1:{args.port}/harness/', flush=True)
    server.serve_forever()


def parser() -> argparse.ArgumentParser:
    cli = argparse.ArgumentParser(description=__doc__)
    sub = cli.add_subparsers(dest='command', required=True)
    for command in ('audit', 'split', 'preprocess-check', 'train', 'ensemble', 'evaluate', 'export', 'queue', 'report', 'build-notebook', 'setup-runtime', 'serve'):
        item = sub.add_parser(command)
        item.add_argument('--config', type=Path, default=Path('ai/configs/training.json'))
        item.add_argument('--audit', type=Path, default=Path('ai/runs/audit'))
        item.add_argument('--splits', type=Path, default=Path('ai/runs/splits'))
        item.add_argument('--data-root', type=Path, default=Path('datasets/canvas_classifier'))
        item.add_argument('--canvas-root', type=Path)
        item.add_argument('--fixtures', type=Path, default=Path('ai/runs/audit'))
        item.add_argument('--runs', type=Path, default=Path('ai/runs'))
        item.add_argument('--out', type=Path, default=Path('ai/runs/splits' if command == 'split' else 'ai/runs/comparison' if command == 'report' else f'ai/runs/{command}'))
        item.add_argument('--resume', type=Path)
        item.add_argument('--input-artifacts', type=Path)
        item.add_argument('--script', choices=SCRIPTS + (('combined',) if command in ('train', 'evaluate') else ()))
        item.add_argument('--model', choices=MODELS, default='mobile')
        item.add_argument('--seed', type=int, default=42)
        item.add_argument('--epochs', type=int)
        item.add_argument('--smoke', action='store_true')
        item.add_argument('--stage', default='candidates' if command == 'export' else 'supervised')
        item.add_argument('--loss', choices=('ordinary', 'weighted'))
        item.add_argument('--pilot', action='store_true')
        item.add_argument('--partition', default='selection')
        item.add_argument('--checkpoint', type=Path)
        item.add_argument('--teacher', type=Path)
        item.add_argument('--freeze', type=Path)
        item.add_argument('--publish', action='store_true')
        item.add_argument('--size', type=int, choices=(128, 224), default=128)
        item.add_argument('--initialize', type=Path)
        item.add_argument('--include-canvas', action='store_true')
        item.add_argument('--candidate', type=Path)
        item.add_argument('--calibration', type=Path)
        item.add_argument('--members', type=Path, nargs='+')
        item.add_argument('--benchmark', type=Path)
        item.add_argument('--evaluations', type=Path, nargs='+')
        item.add_argument('--preprocess-evidence', type=Path)
        item.add_argument('--ablation-baseline', type=Path)
        item.add_argument('--port', type=int, default=8765)
    return cli


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == 'audit':
            from ai.data import audit
            result = audit(args.data_root, args.out, args.canvas_root, Path(load(args.config)['labels_path']))
        elif args.command == 'split':
            from ai.data import split
            result = split(args.audit, args.config, args.out)
        elif args.command == 'preprocess-check':
            from ai.preprocess import generate_checks
            result = generate_checks(args.fixtures, args.out)
        elif args.command in ('train', 'ensemble', 'evaluate', 'export'):
            if args.script is None:
                raise ValueError('--script is required')
            if args.script == 'combined':
                if args.command == 'train' and (args.stage != 'supervised' or args.include_canvas or args.initialize
                                                or args.checkpoint or args.teacher):
                    raise ValueError('Combined training is supervised source-only; no canvas/distill/initialize treatment')
                if args.command == 'evaluate' and args.partition not in ('selection', 'calibration'):
                    raise ValueError('Combined evaluation is limited to selection/calibration')
            import importlib
            result = importlib.import_module('ai.' + args.command).run(args)
        else:
            result = globals()[args.command.replace('-', '_')](args)
        if args.command in ('audit', 'split'):
            keys = ('dataset_hash', 'label_hash', 'split_hash', 'counts', 'inventory', 'ready_scripts', 'blocked_scripts', 'errors')
            result = {'out': str(args.out), **{key: result[key] for key in keys if key in result}}
        print(json.dumps(result, ensure_ascii=False, indent=2, default=str))
        return 0
    except (ValueError, OSError, RuntimeError, KeyError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
