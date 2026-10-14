"""Build the five-cell Colab notebook and its pinned, original-byte runtime ZIP."""
import hashlib
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'ai/notebooks/aksantara-colab.ipynb'
RUNTIME_ZIP = OUTPUT.with_name('aksantara-colab-runtime.zip')
RUNTIME_FILES = (
    'ai/__init__.py', 'ai/data.py', 'ai/ensemble.py', 'ai/evaluate.py',
    'ai/export.py', 'ai/kaggle_input.py', 'ai/models.py', 'ai/preprocess.py',
    'ai/runner.py', 'ai/train.py', 'ai/colab_experiments.py',
    'ai/notebook_visualizer.py',
    'ai/configs/labels.json', 'ai/configs/provenance.json',
    'ai/configs/training.json', 'ai/runs/audit/manifest.json',
    'ai/runs/audit/samples.json', 'ai/runs/splits/manifest.json',
)
MAX_CELL_SOURCE_BYTES = 16384
MAX_NOTEBOOK_SOURCE_BYTES = 32768


def build() -> Path:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(RUNTIME_ZIP, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name in RUNTIME_FILES:
            archive.write(ROOT / name, name)
    digest = hashlib.sha256(RUNTIME_ZIP.read_bytes()).hexdigest()
    cells = [('markdown', overview()), *[('code', source) for source in
             (configuration(digest), setup(digest), extraction(), preflight(), training())],
             ('code', progress())]
    sizes = [len(source.encode('utf-8')) for _, source in cells]
    if any(size > MAX_CELL_SOURCE_BYTES for size in sizes) or sum(sizes) > MAX_NOTEBOOK_SOURCE_BYTES:
        raise ValueError(f'Notebook cell source exceeds limits: {sizes}')
    notebook = {'nbformat': 4, 'nbformat_minor': 5,
                'metadata': {'accelerator': 'GPU', 'colab': {'name': OUTPUT.name},
                             'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'}},
                'cells': [({'id': f'aksantara-colab-{i}', 'cell_type': kind, 'metadata': {},
                            'source': source.splitlines(keepends=True),
                            **({'execution_count': None, 'outputs': []} if kind == 'code' else {})})
                          for i, (kind, source) in enumerate(cells)]}
    OUTPUT.write_text(json.dumps(notebook, ensure_ascii=False, indent=1), encoding='utf-8')
    return OUTPUT


def overview() -> str:
    return '''# Aksantara | Studi empat classifier

**Pertanyaan:** Tiga model spesialis yang menerima identitas aksara dibanding satu model gabungan 174 kelas yang harus mengenali aksara sendiri. Ini eksperimen citra dataset, bukan evaluasi tulisan tangan atau izin rilis.

| Langkah | Jalankan | Bukti yang dihasilkan |
|---|---|---|
| 1. Konfigurasi | Cell kode pertama | Path Drive, hash ZIP runtime, lokasi checkpoint |
| 2. Bootstrap | Cell kode kedua | GPU, mount Drive, verifikasi ZIP, kode/config/audit asli |
| 3. Dataset | Cell kode ketiga | Salinan ZIP dataset dan ekstraksi lokal yang baru |
| 4. Preflight | Cell kode keempat | Hash byte sumber, 114/30/30 kelas, empat partition |
| 5. Launch | Cell kode kelima **sekali** | PID worker; cell selesai bukan berarti training selesai |
| 6. Progress | Cell kode terakhir, jalankan ulang saat ingin melihat status | Target, loss, epoch, metrik selection dan path output |

Urutan worker: Sunda ordinary; Lontara ordinary/weighted; Bali ordinary/weighted; gabungan ordinary/weighted. Fase transfer maksimum 5 epoch, lalu fine-tune maksimum 30 dengan early stop. Satu worker GPU pada satu waktu. Epoch selection memilih kandidat; **test tidak dibuka**. Hasil provisional di `comparison.json` setelah status `completed`.

**Audit kode:** Setelah bootstrap, buka panel Files Colab dan cari folder `/content/aksantara-runtimes/<hash runtime>/ai/`. `train.py` memuat optimizer dan checkpoint, `colab_experiments.py` memuat jadwal/resume, `evaluate.py` memuat metrik. `configs/` dan `runs/audit|splits/` adalah metadata frozen asli. Hash runtime di cell konfigurasi mengikat file-file tersebut; ZIP memindahkan kode dari cell besar, bukan menyembunyikan kode. Tiap run menyimpan `manifest.json`, `metrics.json`, `stdout-log.json`, serta selection artifacts.

Progress tidak dipoll otomatis agar Colab dan browser tetap ringan. Klik Run pada cell Progress kapan pun perlu snapshot baru. `running` berarti proses terpisah masih aktif; `completed` mensyaratkan empat checkpoint terverifikasi. Log lengkap/metrics tiap run tetap dalam file, bukan output notebook.
'''


def progress() -> str:
    return '''from pathlib import Path
from IPython.display import Markdown, display
from ai.colab_experiments import status
from ai.train import read_json

progress = status(SAVE_ROOT)
lines = ['### Progress studi', f"**Status:** {progress['status']}"]
if progress.get('worker'):
    lines.append(f"**Worker:** {progress['worker']} (PID {progress['pid']})")
if progress.get('current_target'):
    lines.append(f"**Sedang diproses:** {progress['current_target']} / {progress['current_loss']} "
                 f"| {progress['phase'] or 'starting'} epoch {progress['epoch']} "
                 f"| selection macro-F1 {progress['selection_macro_f1']}")
if progress.get('error'):
    lines.append(f"**Error:** `{progress['error']}`")
lines.extend(['', '| Treatment | Status | Epoch | Snapshot Drive |',
              '|---|---|---:|---|'])
for name, case in progress.get('cases', {}).items():
    active = name == f"{progress.get('current_target')}/{progress.get('current_loss')}"
    epoch = progress['epoch'] if active and case['status'] == 'running' else case['epoch']
    lines.append(f"| {name} | {case['status']} | {epoch} | "
                 f"{case['latest_saved_attempt'] or '-'} |")
if progress.get('current_target'):
    key = progress['current_target']
    loss = progress['current_loss']
    history_file = WORK / 'ai/runs/four-models' / key / loss / 'stdout-log.json'
    if history_file.is_file():
        lines.extend(['', '**Epoch terakhir (selection, bukan test):**',
                      '| Epoch | Fase | Training loss | Macro-F1 |', '|---:|---|---:|---:|'])
        for row in read_json(history_file)[-8:]:
            lines.append(f"| {row['epoch']} | {row['phase']} | {row['loss']:.4f} | "
                         f"{row['selection_macro_f1']:.4f} |")
if progress.get('final_paths'):
    lines.extend(['', '**Checkpoint terpilih:**'])
    lines.extend(f"- {name}: `{path}`" for name, path in progress['final_paths'].items())
if progress.get('final_metrics'):
    lines.extend(['', '**Perbandingan selection provisional (bukan test):**',
                  '| Model | Global macro-F1 | Equal-script macro-F1 | Top-1 |',
                  '|---|---:|---:|---:|'])
    for name, metric in progress['final_metrics'].items():
        lines.append(f"| {name} | {metric['macro_f1']:.4f} | "
                     f"{metric['equal_script_mean_macro_f1']:.4f} | {metric['top1']:.4f} |")
if progress.get('comparison_path'):
    lines.append(f"**Perbandingan provisional:** `{progress['comparison_path']}`")
display(Markdown('\\n'.join(lines)))
'''


def configuration(runtime_sha256: str) -> str:
    return f'''from pathlib import Path
DRIVE_FOLDER = Path('/content/drive/MyDrive/Colab Notebooks/dataset-joints-1')
DATA_ZIP = DRIVE_FOLDER / 'canvas_classifier.zip'
RUNTIME_ZIP = DRIVE_FOLDER / 'aksantara-colab-runtime.zip'
SAVE_ROOT = DRIVE_FOLDER / 'aksantara-runs/four-models-mobile128-seed42'
RUNTIME_SHA256 = {runtime_sha256!r}
WORK = Path('/content/aksantara-runtimes') / RUNTIME_SHA256
LOCAL_RUNTIME_ZIP = Path('/content/aksantara-colab-runtime.zip')
DATA_LOCAL_PARENT = Path('/content')
'''


def setup(runtime_sha256: str) -> str:
    if not re.fullmatch(r'[0-9a-f]{64}', runtime_sha256):
        raise ValueError('Runtime SHA256 must be a 64-character hex digest')
    return f'''import hashlib, importlib.util, os, shutil, subprocess, sys, tempfile, zipfile
from pathlib import Path
EXPECTED_RUNTIME_SHA256 = {runtime_sha256!r}
RUNTIME_MEMBERS = {RUNTIME_FILES!r}
if RUNTIME_SHA256 != EXPECTED_RUNTIME_SHA256:
    raise ValueError('Notebook runtime digest config changed; rebuild notebook')
# Check the Colab CUDA installation before authorization, pip, or filesystem extraction.
import torch, torchvision
if not torch.cuda.is_available():
    raise RuntimeError('Select Runtime > Change runtime type > T4 GPU, then run again.')
print('GPU:', torch.cuda.get_device_name(0), 'torch:', torch.__version__, 'torchvision:', torchvision.__version__)
from google.colab import drive
try:
    drive.mount('/content/drive')
except Exception as exc:
    print(f'Drive mount failed at /content/drive: {{type(exc).__name__}}: {{exc}}; '
          f'MyDrive exists: {{Path("/content/drive/MyDrive").exists()}}', flush=True)
    raise
for source in (DATA_ZIP, RUNTIME_ZIP):
    if not source.is_file():
        raise FileNotFoundError(f'Required Drive ZIP not found: {{source}}')
# Copy to local disk; verify the exact byte stream before importing any runtime code.
local_runtime_zip = LOCAL_RUNTIME_ZIP
with RUNTIME_ZIP.open('rb') as source, local_runtime_zip.open('wb') as target:
    shutil.copyfileobj(source, target)
digest = hashlib.sha256()
with local_runtime_zip.open('rb') as source:
    for chunk in iter(lambda: source.read(1024 * 1024), b''):
        digest.update(chunk)
if digest.hexdigest() != RUNTIME_SHA256:
    raise ValueError('Runtime ZIP SHA256 mismatch; do not execute changed runtime contents')

# A live Python module cannot safely be switched to a different version of ai.*.
loaded_ai = [module for name, module in sys.modules.items() if name == 'ai' or name.startswith('ai.')]
if loaded_ai:
    if globals().get('_AKSANTARA_RUNTIME_SHA256') != RUNTIME_SHA256 or any(
        not Path(module.__file__).resolve().is_relative_to(WORK.resolve())
        for module in loaded_ai if getattr(module, '__file__', None)
    ):
        raise RuntimeError('Different or untracked ai modules are loaded; restart runtime, then rerun cells 1-2')

WORK.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(local_runtime_zip) as archive:
    infos = archive.infolist()
    names = [info.filename for info in infos]
    if len(names) != len(set(names)) or set(names) != set(RUNTIME_MEMBERS):
        raise ValueError('Runtime ZIP inventory differs from pinned exact inventory (or has duplicate members)')
    for info in infos:
        name = info.filename
        parts = name.split('/')
        mode = info.external_attr >> 16
        if (name.startswith('/') or '\\\\' in name or any(part in ('', '.', '..') for part in parts)
                or (mode & 0o170000) == 0o120000):
            raise ValueError(f'Unsafe runtime ZIP member: {{name}}')
    if WORK.exists():
        # Same digest reruns preserve worker checkpoints; never mix stale runtime files.
        for name in names:
            expected = hashlib.sha256()
            actual = hashlib.sha256()
            with archive.open(name) as source:
                for chunk in iter(lambda: source.read(1024 * 1024), b''):
                    expected.update(chunk)
            path = WORK / name
            if not path.is_file() or path.is_symlink():
                raise ValueError(f'Existing runtime file is missing or unsafe: {{path}}')
            with path.open('rb') as source:
                for chunk in iter(lambda: source.read(1024 * 1024), b''):
                    actual.update(chunk)
            if actual.digest() != expected.digest():
                raise ValueError(f'Existing runtime file differs from pinned ZIP: {{path}}')
    else:
        staging = Path(tempfile.mkdtemp(prefix='aksantara-runtime-', dir=WORK.parent))
        try:
            archive.extractall(staging)
            staging.rename(WORK)
        finally:
            if staging.exists():
                shutil.rmtree(staging)
# Keep Colab's compatible preinstalled torch/torchvision pair unchanged.
missing = [package for module, package in (('numpy', 'numpy'), ('PIL', 'Pillow'),
           ('scipy', 'scipy'), ('sklearn', 'scikit-learn')) if importlib.util.find_spec(module) is None]
if missing:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', *missing])
if str(WORK) not in sys.path:
    sys.path.insert(0, str(WORK))
os.chdir(WORK)
_AKSANTARA_RUNTIME_SHA256 = RUNTIME_SHA256
print('Verified runtime:', WORK, RUNTIME_SHA256)
'''


def extraction() -> str:
    return '''import shutil, tempfile
from pathlib import Path
from ai.kaggle_input import extract_source
# Each explicit rerun gets an independent dataset tree; keep any valid DATA_ROOT untouched on failure.
dataset_stage = Path(tempfile.mkdtemp(prefix='aksantara-dataset-', dir=DATA_LOCAL_PARENT))
try:
    local_data_zip = dataset_stage / DATA_ZIP.name
    shutil.copyfile(DATA_ZIP, local_data_zip)
    extracted = dataset_stage / 'extracted'
    extract_source(local_data_zip, extracted)
    roots = [root for root in (extracted, extracted / 'canvas_classifier',
             extracted / 'canva_classifier') if all((root / name).is_dir()
             for name in ('lontara', 'sunda', 'bali'))]
    if len(roots) != 1:
        raise ValueError(f'Expected exactly one direct or canvas_classifier/canva_classifier dataset root, found: {roots}')
    verified_data_root = roots[0]
except Exception:
    shutil.rmtree(dataset_stage)
    raise
DATA_ROOT = verified_data_root
print('Local dataset:', DATA_ROOT)
'''


def preflight() -> str:
    return '''import json
from ai.colab_experiments import preflight
PREFLIGHT = preflight(DATA_ROOT)
print('Four-target preflight:', json.dumps(PREFLIGHT, ensure_ascii=False, default=str))
'''


def training() -> str:
    return '''import json
from ai.colab_experiments import launch, status
LAUNCH = launch(DATA_ROOT, SAVE_ROOT, RUNTIME_SHA256)
print('Controller launch:', json.dumps(LAUNCH, ensure_ascii=False, default=str))
print('Controller status:', json.dumps(status(SAVE_ROOT), ensure_ascii=False, default=str))
'''


if __name__ == '__main__':
    print(build())
