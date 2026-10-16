"""Generator for the 4 modular interactive classifier notebooks in ai/notebooks/.

Creates:
- 01_sunda_classifier.ipynb (30 classes, balanced, Ngalagena & Rarangken)
- 02_lontara_classifier.ipynb (114 classes, imbalanced, geometric, loss weighting)
- 03_bali_classifier.ipynb (30 classes, curvilinear, ligatures, gantungan)
- 04_combined_174_classifier.ipynb (174 classes, universal, 3x3 cross-script analysis)

Each notebook includes an automated multi-architecture tournament, cross-model comparison dashboard,
deep paleographic error diagnostics (confusion matrix & misclassified gallery), and champion ONNX export.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOKS_DIR = ROOT / "ai/notebooks"


def make_notebook(cells: list[dict[str, Any]], title: str) -> dict[str, Any]:
    return {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {
            "accelerator": "GPU",
            "colab": {"name": title},
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3",
            },
            "language_info": {
                "name": "python",
                "version": "3.10.12",
            },
        },
        "cells": cells,
    }


def make_markdown_cell(cell_id: str, source: str) -> dict[str, Any]:
    return {
        "id": cell_id,
        "cell_type": "markdown",
        "metadata": {},
        "source": source.splitlines(keepends=True),
    }


def make_code_cell(cell_id: str, source: str) -> dict[str, Any]:
    return {
        "id": cell_id,
        "cell_type": "code",
        "metadata": {},
        "execution_count": None,
        "outputs": [],
        "source": source.splitlines(keepends=True),
    }


def generate_modular_notebook(
    script_key: str,
    title: str,
    paleo_summary: str,
    drive_checkpoint_rel: str,
    is_combined: bool = False,
) -> dict[str, Any]:
    cells = []

    # Header Markdown
    header_md = f"""# {title}
**JOINTS UGM 2026 — Theme: Education & Cultural Heritage**

{paleo_summary}

---
### 7 Tahapan Otomatis Turnamen Multi-Model (Universal Workflow):
1. **Stage 1:** Inisialisasi Lingkungan, GPU Detection, & Ekstraksi Dataset
2. **Stage 2:** Eksplorasi Visual Paleografi & Histogram Distribusi Sampel
3. **Stage 3:** Matriks Kandidat Multi-Arsitektur (`Custom-CNN`, `MobileNetV3`, `EfficientNet-B0`, `ResNet-18`)
4. **Stage 4:** Training Multi-Model (maksimum 50 epoch, early stopping patience 7, pemulihan checkpoint terbaik berdasarkan selection Macro-F1)
5. **Stage 5:** Dashboard Turnamen Komparasi Multi-Arsitektur (Leaderboard & Grafik Performa vs Budget)
6. **Stage 6:** Diagnostik Error Paleografi Mendalam pada Model Champion (Confusion Matrix & Galeri Misclassified)
7. **Stage 7:** Ekspor Champion ke ONNX Opset 17, Kuantisasi INT8 QDQ, & Latency Sandbox (<50ms Budget)
"""
    cells.append(make_markdown_cell(f"{script_key}-hdr", header_md))

    # Stage 1: Setup
    cells.append(make_markdown_cell(f"{script_key}-s1-hdr", "## Stage 1: Inisialisasi Lingkungan, GPU & Akses Data"))
    cells.append(make_code_cell(
        f"{script_key}-s1-code",
        f"""# Stage 1: Environment & Hardware Initialization
import os
import sys
import json
import time
import random
from pathlib import Path

import torch
import numpy as np

# Penguncian seed deterministik untuk benchmark ilmiah
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Device target: {{device}}")
if torch.cuda.is_available():
    print(f"GPU Akselerator: {{torch.cuda.get_device_name(0)}}")

# Deteksi Colab vs Workspace Lokal
IN_COLAB = "google.colab" in sys.modules
PROJECT_ROOT = Path(".").resolve()

if IN_COLAB:
    import subprocess
    import zipfile
    drive_root = Path("/content/drive/MyDrive/Colab Notebooks/dataset-joints-1")
    runtime_dir = Path("/content/aksantara-runtime")

    if not Path("/content/drive/MyDrive").is_dir():
        try:
            from google.colab import drive
            drive.mount("/content/drive")
        except Exception as e:
            print(f"[!] Warning: Google Drive mount dilewati atau tidak berhasil: {{e}}")

    try:
        import onnx
        import onnxruntime
        import onnxscript
    except ImportError:
        print("Menginstal dependensi ONNX & utilitas...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "onnx", "onnxruntime", "onnxscript", "imagehash"])
    # Auto-ekstrak package kode ai jika belum diekstrak
    runtime_zip_candidates = [
        drive_root / "aksantara-colab-runtime.zip",
        Path("/content/drive/MyDrive/Colab Notebooks/dataset-joints-1/aksantara-colab-runtime.zip"),
        Path("/content/aksantara-colab-runtime.zip"),
    ]
    for r_zip in runtime_zip_candidates:
        if r_zip.is_file() and not (runtime_dir / "ai").is_dir():
            print(f"Mengekstrak runtime package: {{r_zip}} -> {{runtime_dir}}...")
            runtime_dir.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(r_zip, "r") as z:
                z.extractall(runtime_dir)
            break

    if runtime_dir.is_dir():
        sys.path.insert(0, str(runtime_dir))
    PROJECT_ROOT = runtime_dir if (runtime_dir / "ai").is_dir() else Path("/content")
else:
    drive_root = PROJECT_ROOT
    sys.path.insert(0, str(PROJECT_ROOT))
print(f"Project root aktif: {{PROJECT_ROOT}}")
"""
    ))

    # Stage 2: Visual EDA
    filter_expr = f'all_labels' if is_combined else f'[l for l in all_labels if l.get("script") == "{script_key}"]'
    cells.append(make_markdown_cell(f"{script_key}-s2-hdr", "## Stage 2: Eksplorasi Data Paleografi (Visual EDA)"))
    cells.append(make_code_cell(
        f"{script_key}-s2-code",
        f"""# Stage 2: Data Loading & Visual Paleographic Inspection
import zipfile
import matplotlib.pyplot as plt

# Pemuatan dataset kanonis
if IN_COLAB:
    data_root = Path("/content/dataset")
    if not data_root.is_dir():
        colab_zips = [
            drive_root / "canvas_classifier.zip",
            Path("/content/drive/MyDrive/Colab Notebooks/dataset-joints-1/canvas_classifier.zip"),
            PROJECT_ROOT / "datasets/canvas_classifier.zip",
        ]
        for candidate in colab_zips:
            if candidate.is_file():
                print(f"Mengekstrak dataset: {{candidate}} -> {{data_root}}...")
                data_root.mkdir(parents=True, exist_ok=True)
                with zipfile.ZipFile(candidate, "r") as z:
                    z.extractall(data_root)
                break
    if (data_root / "canvas_classifier").is_dir():
        data_root = data_root / "canvas_classifier"
else:
    # Lokal: Utamakan direktori kanonis PROJECT_ROOT / "datasets/canvas_classifier"
    canonical_dir = PROJECT_ROOT / "datasets/canvas_classifier"
    if not canonical_dir.is_dir():
        dataset_zip_candidates = [
            PROJECT_ROOT / "datasets/canvas_classifier.zip",
            PROJECT_ROOT / "canvas_classifier.zip",
            Path("datasets/canvas_classifier.zip"),
        ]
        extracted_dest = PROJECT_ROOT / "datasets"
        for candidate in dataset_zip_candidates:
            if candidate.is_file():
                print(f"Mengekstrak dataset arsip: {{candidate}} -> {{extracted_dest}}...")
                extracted_dest.mkdir(parents=True, exist_ok=True)
                with zipfile.ZipFile(candidate, "r") as z:
                    z.extractall(extracted_dest)
                break

    data_root = canonical_dir
    if not data_root.is_dir():
        nested_candidate = PROJECT_ROOT / "datasets" / "canvas_classifier" / "canvas_classifier"
        if nested_candidate.is_dir():
            data_root = nested_candidate

if not data_root.is_dir():
    raise FileNotFoundError(f"Direktori dataset tidak ditemukan di {{data_root}}. Pastikan dataset tersedia di datasets/canvas_classifier.")

required_scripts = ["sunda", "lontara", "bali"]
missing_scripts = [s for s in required_scripts if not (data_root / s).is_dir()]
if missing_scripts:
    raise FileNotFoundError(f"Direktori aksara wajib tidak lengkap pada {{data_root}}. Kurang: {{missing_scripts}}")

print(f"Direktori data citra terverifikasi: {{data_root}}")
# Load manifest labels & split
from ai.data import load_labels, load_split_manifest
from ai.notebook_visualizer import plot_glyph_grid, plot_class_distribution

labels_path = PROJECT_ROOT / "ai/configs/labels.json"
splits_path = PROJECT_ROOT / "ai/runs/splits/manifest.json"

all_labels = load_labels(labels_path)
target_labels = {filter_expr}
target_label_ids = {{l["id"] for l in target_labels}}
NUM_CLASSES = len(target_labels)

print(f"Jumlah Target Kelas: {{NUM_CLASSES}}")

# Partisi train & selection
train_rows = load_split_manifest(splits_path, "train")
selection_rows = load_split_manifest(splits_path, "selection")

script_train = [r for r in train_rows if r.get("label_id") in target_label_ids]
script_selection = [r for r in selection_rows if r.get("label_id") in target_label_ids]

print(f"Jumlah Sampel Train: {{len(script_train)}}")
print(f"Jumlah Sampel Selection: {{len(script_selection)}}")

# 1. Visualisasi Galeri Glif Asli
fig_grid = plot_glyph_grid(script_train, data_root=data_root, labels=target_labels, num_samples=24, cols=6)
plt.show()

# 2. Histogram Distribusi Frekuensi & Rasio Ketimpangan
fig_dist = plot_class_distribution(script_train, labels=target_labels, title="Distribusi Frekuensi Kelas (Train)")
plt.show()
"""
    ))

    # Stage 3: Multi-Architecture Candidate Matrix
    cells.append(make_markdown_cell(f"{script_key}-s3-hdr", "## Stage 3: Matriks Kandidat Multi-Arsitektur"))
    cells.append(make_code_cell(
        f"{script_key}-s3-code",
        f"""# Stage 3: Multi-Architecture Candidate Specification
from ai.models import build_model

# Matriks 4 Arsitektur yang ditandingkan dalam turnamen:
CANDIDATE_CONFIGS = [
    {{"name": "cnn", "display": "Custom CNN-4Layer", "pretrained": False, "lr": 1e-3, "weight_decay": 1e-4, "desc": "Baseline murni from-scratch (tanpa ImageNet bias)"}},
    {{"name": "mobile", "display": "MobileNetV3-Small", "pretrained": True, "lr": 5e-4, "weight_decay": 1e-2, "desc": "Inverted residuals + hard-swish (SSOT Production Default)"}},
    {{"name": "efficient", "display": "EfficientNet-B0", "pretrained": True, "lr": 5e-4, "weight_decay": 1e-2, "desc": "Squeeze-and-Excitation channel attention (deteksi diakritik halus)"}},
    {{"name": "resnet18", "display": "ResNet-18", "pretrained": True, "lr": 3e-4, "weight_decay": 1e-2, "desc": "Residual skip-connections (deep capacity comparator)"}},
]

print("=" * 80)
print(f"{{'Model':<20}} | {{'Pretrained':<10}} | {{'Total Params':<14}} | {{'Est. FP32':<12}} | {{'Karakteristik':<30}}")
print("-" * 80)

model_instances = {{}}
for cfg in CANDIDATE_CONFIGS:
    m = build_model(cfg["name"], num_classes=NUM_CLASSES, pretrained=cfg["pretrained"])
    total_p = sum(p.numel() for p in m.parameters())
    fp32_mb = (total_p * 4) / (1024 * 1024)
    cfg["params"] = total_p
    cfg["size_mb"] = fp32_mb
    model_instances[cfg["name"]] = m
    print(f"{{cfg['display']:<20}} | {{str(cfg['pretrained']):<10}} | {{total_p:<14,}} | {{f'{{fp32_mb:.2f}} MB':<12}} | {{cfg['desc']:<30}}")
print("=" * 80)
"""
    ))

    # Stage 4: Automated Multi-Model Training & Benchmark Loop
    cells.append(make_markdown_cell(f"{script_key}-s4-hdr", "## Stage 4: Training Multi-Model — Maksimum 50 Epoch, Patience 7\n\nSemua kandidat dilatih ulang dengan seed 42. Checkpoint lama tidak ikut peringkat. Early stopping memakai selection Macro-F1; evaluasi dan ekspor memakai bobot epoch terbaik. Partisi test tidak digunakan untuk pemilihan model."))
    cells.append(make_code_cell(
        f"{script_key}-s4-code",
        f"""# Stage 4: Multi-Model Training with Early Stopping & Best-Checkpoint Evaluation
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from ai.preprocess import preprocess_image
from ai.notebook_visualizer import benchmark_latency
from sklearn.metrics import f1_score, accuracy_score

class ScriptDataset(Dataset):
    def __init__(self, rows, data_root, label_to_idx):
        self.rows = rows
        self.data_root = Path(data_root)
        self.label_to_idx = label_to_idx

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, idx):
        row = self.rows[idx]
        img_path = self.data_root / row["path"]
        img = Image.open(img_path).convert("L")
        res = preprocess_image(img)
        if res["tensor"] is None:
            raise ValueError(f"Empty glyph after preprocessing: {{img_path}}")
        tensor = torch.from_numpy(res["tensor"]).float()
        target = self.label_to_idx[row["label_id"]]
        return tensor, target

label_to_idx = {{l["id"]: i for i, l in enumerate(target_labels)}}
train_ds = ScriptDataset(script_train, data_root, label_to_idx)
val_ds = ScriptDataset(script_selection, data_root, label_to_idx)

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=32, shuffle=False)

# Checkpoint lama hanya dicatat sebagai baseline historis, tidak ikut turnamen baru.
historical_paths = [
    drive_root / "aksantara-runs/four-models-mobile128-seed42/{drive_checkpoint_rel}",
    PROJECT_ROOT / "ai/runs/four-models-mobile128-seed42/{drive_checkpoint_rel}",
]
print("Baseline historis dikecualikan:", [str(p) for p in historical_paths if p.is_file()])
MAX_EPOCHS = 50
EARLY_STOPPING_PATIENCE = 7
run_id = f"seed{{SEED}}-{{time.time_ns()}}"
checkpoint_root = (
    drive_root / "aksantara-runs/tournaments/{script_key}"
    if IN_COLAB and drive_root.is_dir()
    else PROJECT_ROOT / "ai/runs/tournaments/{script_key}"
) / run_id
checkpoint_root.mkdir(parents=True, exist_ok=True)
print(f"Checkpoint turnamen baru: {{checkpoint_root}}")

tournament_results = []
all_histories = {{}}
eval_predictions = {{}}

print("Memulai evaluasi komparatif turnamen multi-arsitektur...")

for cfg in CANDIDATE_CONFIGS:
    m_name = cfg["name"]
    display_name = cfg["display"]
    random.seed(SEED)
    np.random.seed(SEED)
    torch.manual_seed(SEED)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(SEED)
    # Sel dapat dijalankan ulang tanpa meneruskan bobot dari turnamen sebelumnya.
    model = build_model(m_name, num_classes=NUM_CLASSES, pretrained=cfg["pretrained"]).to(device)
    model_instances[m_name] = model
    print(f"\\n--- Menguji Arsitektur: {{display_name}} ---")

    history = []
    best_f1 = -1.0
    best_epoch = 0
    stale_epochs = 0
    candidate_dir = checkpoint_root / m_name
    candidate_dir.mkdir(parents=True, exist_ok=True)
    best_path = candidate_dir / "best.pt"
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg["lr"], weight_decay=cfg["weight_decay"])
    criterion = torch.nn.CrossEntropyLoss()
    print(f"Melatih {{display_name}}: maksimum {{MAX_EPOCHS}} epoch, patience {{EARLY_STOPPING_PATIENCE}}")

    for epoch in range(1, MAX_EPOCHS + 1):
        model.train()
        train_loss = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad(set_to_none=True)
            out = model(x)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(y)
        train_loss /= len(train_ds)

        model.eval()
        val_loss = 0.0
        val_preds, val_gts = [], []
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device), y.to(device)
                out = model(x)
                val_loss += criterion(out, y).item() * len(y)
                val_preds.extend(out.argmax(-1).cpu().numpy())
                val_gts.extend(y.cpu().numpy())
        val_loss /= len(val_ds)
        f1 = float(f1_score(val_gts, val_preds, labels=range(NUM_CLASSES), average="macro", zero_division=0))
        history.append({{"epoch": epoch, "train_loss": train_loss, "val_loss": val_loss, "val_macro_f1": f1}})
        if f1 > best_f1:
            best_f1, best_epoch, stale_epochs = f1, epoch, 0
            torch.save({{
                "model_state": model.state_dict(),
                "architecture": m_name,
                "num_classes": NUM_CLASSES,
                "label_ids": [label["id"] for label in target_labels],
                "seed": SEED,
                "epoch": best_epoch,
                "selection_macro_f1": best_f1,
            }}, best_path)
        else:
            stale_epochs += 1
        (candidate_dir / "history.json").write_text(json.dumps(history, indent=2), encoding="utf-8")
        print(f"  Epoch {{epoch}}/{{MAX_EPOCHS}} - Loss: {{val_loss:.4f}} - Macro-F1: {{f1*100:.2f}}% - Best: {{best_f1*100:.2f}}% (epoch {{best_epoch}})")
        if stale_epochs >= EARLY_STOPPING_PATIENCE:
            print(f"  Early stopping: {{EARLY_STOPPING_PATIENCE}} epoch tanpa peningkatan selection Macro-F1.")
            break

    best_checkpoint = torch.load(best_path, map_location=device, weights_only=True)
    model.load_state_dict(best_checkpoint["model_state"])
    print(f"Checkpoint terbaik dipulihkan: epoch {{best_epoch}}, {{best_path}}")

    all_histories[display_name] = history

    # Evaluasi final pada selection partition
    model.eval()
    all_preds, all_gts, all_probs = [], [], []
    with torch.no_grad():
        for x, y in val_loader:
            x, y = x.to(device), y.to(device)
            logits = model(x)
            probs = torch.softmax(logits, dim=-1).cpu().numpy()
            all_preds.extend(logits.argmax(-1).cpu().numpy())
            all_gts.extend(y.cpu().numpy())
            all_probs.extend(probs)
    all_preds_arr = np.array(all_preds)
    all_gts_arr = np.array(all_gts)
    all_probs_arr = np.array(all_probs)

    macro_f1 = float(f1_score(all_gts_arr, all_preds_arr, average="macro"))
    top1_acc = float(accuracy_score(all_gts_arr, all_preds_arr))

    # Top-3 Pedagogical Accuracy (Toleransi Goresan Siswa Pemula - SSOT Line 119)
    top3_k = min(3, NUM_CLASSES)
    top3_preds = np.argsort(all_probs_arr, axis=-1)[:, -top3_k:]
    top3_acc = float(np.mean([all_gts_arr[i] in top3_preds[i] for i in range(len(all_gts_arr))]))

    # Keadilan Kurikulum: Worst-Class Recall (Anti-Frustration Metric)
    recalls_per_class = []
    for c in range(NUM_CLASSES):
        c_mask = (all_gts_arr == c)
        if np.sum(c_mask) > 0:
            rec = np.sum((all_gts_arr == c) & (all_preds_arr == c)) / np.sum(c_mask)
            recalls_per_class.append(float(rec))
    min_recall = float(np.min(recalls_per_class)) if recalls_per_class else 0.0

    # Kalibrasi Kepercayaan (Confidence Reliability: Benar vs Salah)
    correct_mask = (all_preds_arr == all_gts_arr)
    max_conf = np.max(all_probs_arr, axis=-1)
    mean_conf_correct = float(np.mean(max_conf[correct_mask])) if np.any(correct_mask) else 0.0
    mean_conf_wrong = float(np.mean(max_conf[~correct_mask])) if np.any(~correct_mask) else 0.0
    conf_gap = float(mean_conf_correct - mean_conf_wrong)

    # Benchmark latensi inferensi CPU
    latency_stats = benchmark_latency(model, input_shape=(1, 3, 128, 128), n_warmup=15, n_runs=50, device="cpu")

    eval_predictions[m_name] = {{
        "preds": all_preds_arr,
        "gts": all_gts_arr,
        "probs": all_probs_arr,
        "macro_f1": macro_f1,
        "acc": top1_acc,
        "top1_acc": top1_acc,
        "top3_acc": top3_acc,
        "min_recall": min_recall,
        "conf_gap": conf_gap,
        "mean_conf_correct": mean_conf_correct,
        "mean_conf_wrong": mean_conf_wrong,
    }}

    tournament_results.append({{
        "model": display_name,
        "raw_name": m_name,
        "pretrained": cfg["pretrained"],
        "macro_f1": macro_f1,
        "accuracy": top1_acc,
        "top1_acc": top1_acc,
        "top3_acc": top3_acc,
        "min_recall": min_recall,
        "conf_gap": conf_gap,
        "mean_conf_correct": mean_conf_correct,
        "mean_conf_wrong": mean_conf_wrong,
        "params_m": cfg["params"] / 1e6,
        "size_mb": cfg["size_mb"],
        "latency_ms": latency_stats["p95_ms"],
        "best_epoch": best_epoch,
        "epochs_run": len(history),
        "checkpoint_path": str(best_path),
    }})
    print(f"Hasil Final: Macro-F1 = {{macro_f1*100:.2f}}% | Top-1 = {{top1_acc*100:.2f}}% | Top-3 (Hint) = {{top3_acc*100:.2f}}% | Min-Recall = {{min_recall*100:.2f}}% | Latensi p95 = {{latency_stats['p95_ms']:.2f}} ms")
"""
    ))

    # Stage 5: Multi-Model Tournament Dashboard
    cross_script_print = ""
    if is_combined:
        cross_script_print = """
# Perbandingan deskriptif Macro-F1, bukan estimasi hardcoded atau uji terkontrol.
from sklearn.metrics import f1_score

def load_specialist_summary(script):
    roots = [drive_root, PROJECT_ROOT / "ai/runs"]
    candidates = []
    for root in roots:
        for path in (root / f"tournament_summary_{script}.json",
                     root / "onnx_exports" / script / f"tournament_summary_{script}.json"):
            if path.is_file():
                summary = json.loads(path.read_text(encoding="utf-8"))
                if summary.get("script") != script:
                    raise ValueError(f"Ringkasan bukan untuk {script}: {path}")
                score = summary["champion"]["macro_f1"]
                if not isinstance(score, (int, float)) or not np.isfinite(score) or not 0 <= score <= 1:
                    raise ValueError(f"Macro-F1 ringkasan tidak valid: {path}")
                candidates.append((summary["timestamp"], path, summary))
    return max(candidates, key=lambda item: item[0]) if candidates else None

champ_eval = eval_predictions[CHAMPION_NAME]
gts, preds = champ_eval["gts"], champ_eval["preds"]
assert len(gts) == len(preds) == len(script_selection), "Prediksi dan selection tidak sejajar"
comparison_rows = []
print("\\nPERBANDINGAN DESKRIPTIF MACRO-F1: SPESIALIS vs COMBINED")
print(f"{'Aksara':<12} | {'N selection':<12} | {'Spesialis':<12} | {'Combined':<12} | {'Delta (pp)':<12}")
for script in ("sunda", "lontara", "bali"):
    class_indices = [i for i, label in enumerate(target_labels) if label["script"] == script]
    mask = np.isin(gts, class_indices)
    assert np.any(mask), f"Tidak ada sampel selection {script}"
    combined_f1 = float(f1_score(gts[mask], preds[mask], labels=class_indices,
                                average="macro", zero_division=0))
    artifact = load_specialist_summary(script)
    specialist_f1 = artifact[2]["champion"]["macro_f1"] if artifact else None
    specialist_text = f"{specialist_f1 * 100:.2f}%" if artifact else "Tidak tersedia"
    delta_text = f"{(combined_f1 - specialist_f1) * 100:+.2f}" if artifact else "N/A"
    print(f"{script.title():<12} | {int(mask.sum()):<12} | {specialist_text:<12} | {combined_f1 * 100:<11.2f}% | {delta_text:<12}")
    comparison_rows.append({"script": script, "samples": int(mask.sum()),
                            "specialist_macro_f1": specialist_f1, "combined_macro_f1": combined_f1})
    if artifact:
        summary = artifact[2]
        print(f"  Sumber spesialis: {artifact[1]} | timestamp={artifact[0]} | training={summary.get('training', 'tidak tercatat')}")
print("Delta = Combined minus spesialis, dalam percentage points.")
print("Macro-F1 Combined per aksara menghitung seluruh kelas aksara tersebut; salah lintas aksara tetap dihitung salah.")
print("Ringkasan spesialis belum membuktikan kesamaan split/preprocessing; beda protokol training bukan perbandingan terkontrol.")
"""

    cells.append(make_markdown_cell(f"{script_key}-s5-hdr", "## Stage 5: Dashboard Turnamen Komparasi Multi-Arsitektur"))
    cells.append(make_code_cell(
        f"{script_key}-s5-code",
        f"""# Stage 5: Comparative Leaderboard & Visualization Dashboard
from ai.notebook_visualizer import plot_multi_model_comparison, plot_multi_history_curves

# 1. Visualisasi Dashboard Komparasi Multi-Model
fig_comp = plot_multi_model_comparison(tournament_results, title="Turnamen Komparasi Multi-Arsitektur Aksantara")
plt.show()

# 2. Kurva Konvergensi Multi-Arsitektur
fig_hist = plot_multi_history_curves(all_histories)
plt.show()

# 3. Leaderboard Tabel Turnamen (Evaluasi Multi-Metrik Edukasi Aksantara)
sorted_results = sorted(tournament_results, key=lambda x: x["macro_f1"], reverse=True)
print("=" * 115)
print(f"{{'Peringkat':<10}} | {{'Model':<18}} | {{'Macro-F1':<10}} | {{'Top-1 Acc':<10}} | {{'Top-3 (Hint)':<13}} | {{'Min Recall':<11}} | {{'Lat. p95':<12}} | {{'Ukuran FP32':<11}}")
print("-" * 115)
for idx, r in enumerate(sorted_results, 1):
    medal = "🥇" if idx == 1 else ("🥈" if idx == 2 else ("🥉" if idx == 3 else f"#{{idx}}"))
    print(f"{{medal:<10}} | {{r['model']:<18}} | {{r['macro_f1']*100:<9.2f}}% | {{r['top1_acc']*100:<9.2f}}% | {{r['top3_acc']*100:<12.2f}}% | {{r['min_recall']*100:<10.2f}}% | {{f'{{r[\"latency_ms\"]:.2f}} ms':<12}} | {{f'{{r[\"size_mb\"]:.2f}} MB':<11}}")
print("=" * 115)
champion_row = sorted_results[0]
CHAMPION_NAME = champion_row["raw_name"]
champion_model = model_instances[CHAMPION_NAME]
print(f"\\n🏆 MODEL CHAMPION TERPILIH: {{champion_row['model'].upper()}} (Macro-F1: {{champion_row['macro_f1']*100:.2f}}%)")
{cross_script_print}
"""
    ))

    # Stage 6: Deep Diagnostics on Champion Model
    cross_script_calc = ""
    if is_combined:
        cross_script_calc = """
# Analisis 3x3 Cross-Script Confusion
from ai.notebook_visualizer import plot_cross_script_confusion

label_id_to_script = {l["id"]: l.get("script", "unknown") for l in target_labels}
script_map = {"sunda": 0, "lontara": 1, "bali": 2}
cm_3x3 = np.zeros((3, 3), dtype=int)

for r, pred_idx in zip(script_selection, champ_eval["preds"]):
    gt_script = label_id_to_script[r["label_id"]]
    pred_label_id = target_labels[pred_idx]["id"]
    pred_script = label_id_to_script[pred_label_id]
    if gt_script in script_map and pred_script in script_map:
        cm_3x3[script_map[gt_script]][script_map[pred_script]] += 1

fig_cross = plot_cross_script_confusion(cm_3x3, scripts=("sunda", "lontara", "bali"))
plt.show()
"""

    cells.append(make_markdown_cell(f"{script_key}-s6-hdr", "## Stage 6: Diagnostik Error Paleografi pada Model Champion"))
    cells.append(make_code_cell(
        f"{script_key}-s6-code",
        f"""# Stage 6: Deep Paleographic Diagnostics (Confusion Matrix & Misclassified Gallery)
from ai.notebook_visualizer import plot_confusion_matrix, plot_misclassified_gallery
from sklearn.metrics import confusion_matrix

champ_eval = eval_predictions[CHAMPION_NAME]
cm = confusion_matrix(champ_eval["gts"], champ_eval["preds"], labels=range(NUM_CLASSES))

# 1. Confusion Matrix Heatmap Resolusi Tinggi
fig_cm = plot_confusion_matrix(cm, labels=target_labels, title=f"Confusion Matrix Champion ({{champion_row['model']}})")
plt.show()

# 2. Galeri Visual Aksara yang Keliru Diprediksi (Top Misclassified Glyphs)
fig_err = plot_misclassified_gallery(
    predictions=champ_eval["preds"],
    ground_truth=champ_eval["gts"],
    rows=script_selection,
    data_root=data_root,
    labels=[{{"id": idx, "label": l.get("label", str(l["id"]))}} for idx, l in enumerate(target_labels)],
    probabilities=champ_eval["probs"],
    top_k=12,
    cols=4,
)
plt.show()
{cross_script_calc}
"""
    ))

    # Stage 7: ONNX Export, INT8 & Production Sandbox
    cells.append(make_markdown_cell(f"{script_key}-s7-hdr", "## Stage 7: Ekspor Champion ONNX, Kuantisasi INT8 & Latency Sandbox"))
    cells.append(make_code_cell(
        f"{script_key}-s7-code",
        f"""# Stage 7: Champion Export to ONNX, Static INT8 & Inference Sandbox
import importlib.util
import subprocess
import sys

# Runtime Colab dapat memakai salinan Stage 1 lama tanpa dependensi ekspor.
if IN_COLAB:
    missing_export_packages = [
        name for name in ("onnx", "onnxruntime")
        if importlib.util.find_spec(name) is None
    ]
    if missing_export_packages:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-q", *missing_export_packages
        ])
        importlib.invalidate_caches()

import onnx
import onnxruntime as ort
from onnxruntime.quantization import shape_inference, quantize_static, QuantFormat, QuantType, CalibrationDataReader

from ai import notebook_visualizer

# Stage 2 mungkin mengimpor visualizer ketika ONNX Runtime belum tersedia.
importlib.reload(notebook_visualizer)
benchmark_latency = notebook_visualizer.benchmark_latency

export_dir = PROJECT_ROOT / "ai/runs/onnx_exports/{script_key}"
export_dir.mkdir(parents=True, exist_ok=True)
onnx_fp32_path = export_dir / f"{script_key}-champion.onnx"
onnx_int8_path = export_dir / f"{script_key}-champion-int8.onnx"

print(f"Mengekspor model Champion ({{champion_row['model']}}) ke ONNX Opset 17: {{onnx_fp32_path}}...")
champion_model.eval()
champion_model.cpu()
# Contoh ekspor harus berasal dari domain preprocessing, bukan noise acak.
dummy_input = next(iter(val_loader))[0][:1].cpu()

import inspect
export_kwargs = {{
    "input_names": ["input"],
    "output_names": ["logits"],
    "dynamic_axes": {{"input": {{0: "batch"}}, "logits": {{0: "batch"}}}},
    "opset_version": 17,
    "do_constant_folding": True,
}}
if "dynamo" in inspect.signature(torch.onnx.export).parameters:
    export_kwargs["dynamo"] = False

torch.onnx.export(
    champion_model,
    dummy_input,
    str(onnx_fp32_path),
    **export_kwargs,
)
print("Ekspor ONNX FP32 berhasil!")

# 1. Uji parity FP32 pada seluruh selection partition dengan toleransi tetap.
ort_sess = ort.InferenceSession(str(onnx_fp32_path), providers=["CPUExecutionProvider"])
PARITY_MAX_ABS_ERROR = 0.05
max_diff = 0.0
matched_samples = 0
parity_samples = 0
with torch.no_grad():
    for batch_x, _ in val_loader:
        batch_x = batch_x.cpu()
        torch_out = champion_model(batch_x).numpy()
        ort_out = ort_sess.run(None, {{"input": batch_x.numpy()}})[0]
        assert ort_out.shape == torch_out.shape, "Bentuk output ONNX berbeda dari PyTorch"
        assert np.isfinite(ort_out).all() and np.isfinite(torch_out).all(), "Output parity tidak finite"
        max_diff = max(max_diff, float(np.max(np.abs(ort_out - torch_out))))
        matched_samples += int(np.sum(ort_out.argmax(axis=1) == torch_out.argmax(axis=1)))
        parity_samples += len(batch_x)
top1_match = parity_samples > 0 and matched_samples == parity_samples
print(f"Parity FP32 selection: {{parity_samples}} sampel | Selisih maksimum: {{max_diff:.6f}} (batas {{PARITY_MAX_ABS_ERROR}}) | Top-1 cocok: {{matched_samples}}/{{parity_samples}}")
assert max_diff < PARITY_MAX_ABS_ERROR and top1_match, f"Parity FP32 gagal: selisih {{max_diff}}, Top-1 {{matched_samples}}/{{parity_samples}}"

fp32_size_mb = onnx_fp32_path.stat().st_size / (1024 * 1024)
print(f"Ukuran Model ONNX FP32: {{fp32_size_mb:.2f}} MB")

# 2. Kuantisasi Statis INT8 QDQ (Rule 05 Performance Budget: <= 15 MB)
print(f"\\nMenjalankan Kuantisasi Statis INT8 QDQ untuk target produksi Aksantara...")
onnx_preproc_path = export_dir / f"{script_key}-champion-preproc.onnx"
shape_inference.quant_pre_process(str(onnx_fp32_path), str(onnx_preproc_path))

class DataLoaderCalibrationReader(CalibrationDataReader):
    def __init__(self, dataloader, input_name="input", max_samples=128):
        self.dataloader = dataloader
        self.input_name = input_name
        self.max_samples = max_samples
        self.iterator = iter(dataloader)
        self.count = 0

    def get_next(self):
        if self.count >= self.max_samples:
            return None
        try:
            batch_x, _ = next(self.iterator)
            arr = batch_x.numpy().astype(np.float32)
            self.count += len(arr)
            return {{self.input_name: arr}}
        except StopIteration:
            return None

calib_reader = DataLoaderCalibrationReader(train_loader, input_name="input", max_samples=128)
quantize_static(
    str(onnx_preproc_path),
    str(onnx_int8_path),
    calib_reader,
    quant_format=QuantFormat.QDQ,
    activation_type=QuantType.QInt8,
    weight_type=QuantType.QInt8,
    per_channel=True,
    op_types_to_quantize=["Conv", "Gemm", "MatMul"],
    extra_options={{"ActivationSymmetric": True, "WeightSymmetric": True}},
)
onnx_preproc_path.unlink(missing_ok=True)

int8_size_mb = onnx_int8_path.stat().st_size / (1024 * 1024)
compression_pct = ((fp32_size_mb - int8_size_mb) / fp32_size_mb) * 100
print(f"Kuantisasi INT8 Berhasil: {{onnx_int8_path}}")
print(f"Ukuran Model INT8: {{int8_size_mb:.2f}} MB (Kompresi {{compression_pct:.1f}}%)")
print(f"Status Budget Rule 05 (<= 15 MB): {{'MEMENUHI SYARAT (LOLOS)' if int8_size_mb <= 15 else 'MELEBIHI BUDGET'}}")

# 3. Benchmark Latensi ONNX Runtime CPU (FP32 vs INT8)
ort_int8_sess = ort.InferenceSession(str(onnx_int8_path), providers=["CPUExecutionProvider"])
stats_fp32 = benchmark_latency(ort_sess, input_shape=(1, 3, 128, 128), n_warmup=20, n_runs=100)
stats_int8 = benchmark_latency(ort_int8_sess, input_shape=(1, 3, 128, 128), n_warmup=20, n_runs=100)

print("\\n" + "=" * 60)
print("BENCHMARK KOMPARATIF LATENSI INFERENSI ONNX RUNTIME CPU")
print("=" * 60)
print(f"  Metrik Latensi   | FP32 (Base)   | INT8 (Kuantisasi)")
print("-" * 60)
print(f"  Rata-rata (Mean) : {{stats_fp32['mean_ms']:>8.2f}} ms | {{stats_int8['mean_ms']:>12.2f}} ms")
print(f"  Median (p50)     : {{stats_fp32['p50_ms']:>8.2f}} ms | {{stats_int8['p50_ms']:>12.2f}} ms")
print(f"  95th Percentile  : {{stats_fp32['p95_ms']:>8.2f}} ms | {{stats_int8['p95_ms']:>12.2f}} ms")
print(f"  Status Budget    : {{'LOLOS (<50ms)' if stats_int8['p95_ms'] < 50 else 'MELEBIHI BUDGET'}}")
print("=" * 60)

# 4. Uji Inferensi Sampel Interaktif (Top-5 Probabilitas INT8)
sample_row = script_selection[0]
img_path = data_root / sample_row["path"]
img = Image.open(img_path).convert("L")
res = preprocess_image(img)
t = res["tensor"] if res.get("tensor") is not None else np.zeros((3, 128, 128), dtype=np.float32)
inp = np.expand_dims(t, axis=0).astype(np.float32)
logits = ort_int8_sess.run(None, {{"input": inp}})[0][0]
probs = np.exp(logits - np.max(logits))
probs /= np.sum(probs)
top5_idx = np.argsort(probs)[::-1][:5]

fig, (ax_img, ax_bar) = plt.subplots(1, 2, figsize=(9, 3.5))
ax_img.imshow(img, cmap="gray")
true_label_name = target_labels[label_to_idx[sample_row['label_id']]]['label']
ax_img.set_title(f"Aksara Asli: {{true_label_name}}")
ax_img.axis("off")

top5_labels = [target_labels[i]["label"] for i in top5_idx]
top5_confs = [probs[i] * 100 for i in top5_idx]

ax_bar.barh(range(5)[::-1], top5_confs, color="#2563eb")
ax_bar.set_yticks(range(5)[::-1])
ax_bar.set_yticklabels(top5_labels)
ax_bar.set_xlabel("Confidence (%)")
ax_bar.set_title("Top-5 Prediksi Probabilitas (INT8)")
ax_bar.set_xlim(0, 100)

plt.tight_layout()
plt.show()

# 5. Analisis kelas kritis (top-5 recall terendah untuk bahan iterasi paleografi)
champ_eval = eval_predictions[CHAMPION_NAME]
critical_classes = []
for c_idx in range(NUM_CLASSES):
    total_true = int(np.sum(champ_eval["gts"] == c_idx))
    correct = int(np.sum((champ_eval["gts"] == c_idx) & (champ_eval["preds"] == c_idx)))
    rec = float(correct / total_true) if total_true > 0 else 0.0
    label_info = target_labels[c_idx]
    critical_classes.append({{
        "class_id": c_idx,
        "label": label_info.get("label", str(label_info.get("id"))),
        "recall": rec,
        "support": total_true,
    }})
critical_classes = sorted(critical_classes, key=lambda x: x["recall"])[:5]

summary_payload = {{
    "script": "{script_key}",
    "title": "{title}",
    "num_classes": NUM_CLASSES,
    "timestamp": time.time(),
    "training": {{
        "run_id": run_id,
        "max_epochs": MAX_EPOCHS,
        "patience": EARLY_STOPPING_PATIENCE,
        "selection_metric": "macro_f1",
        "historical_checkpoints_included": False,
    }},
    "champion": {{
        "model": champion_row["model"],
        "raw_name": champion_row["raw_name"],
        "macro_f1": float(champion_row["macro_f1"]),
        "top1_acc": float(champion_row["top1_acc"]),
        "top3_acc": float(champion_row["top3_acc"]),
        "min_recall": float(champion_row["min_recall"]),
        "conf_gap": float(champion_row["conf_gap"]),
        "mean_conf_correct": float(champion_row["mean_conf_correct"]),
        "mean_conf_wrong": float(champion_row["mean_conf_wrong"]),
        "accuracy": float(champion_row["top1_acc"]),
        "latency_p95_ms": float(stats_int8["p95_ms"]),
        "fp32_latency_p95_ms": float(stats_fp32["p95_ms"]),
        "size_mb": float(int8_size_mb),
        "fp32_size_mb": float(fp32_size_mb),
        "int8_size_mb": float(int8_size_mb),
    }},
    "leaderboard": [
        {{
            "model": r["model"],
            "raw_name": r["raw_name"],
            "pretrained": bool(r["pretrained"]),
            "macro_f1": float(r["macro_f1"]),
            "top1_acc": float(r["top1_acc"]),
            "top3_acc": float(r["top3_acc"]),
            "min_recall": float(r["min_recall"]),
            "conf_gap": float(r["conf_gap"]),
            "accuracy": float(r["accuracy"]),
            "params_m": float(r["params_m"]),
            "size_mb": float(r["size_mb"]),
            "latency_ms": float(r["latency_ms"]),
            "best_epoch": r["best_epoch"],
            "epochs_run": r["epochs_run"],
            "checkpoint_path": r["checkpoint_path"],
        }}
        for r in sorted_results
    ],
    "critical_classes": critical_classes,
    "onnx_path": str(onnx_fp32_path),
    "onnx_int8_path": str(onnx_int8_path),
}}
if "{script_key}" == "combined":
    summary_payload["selection_by_script"] = [
        {{"script": row["script"], "samples": row["samples"], "macro_f1": row["combined_macro_f1"]}}
        for row in comparison_rows
    ]

summary_local_path = export_dir / "tournament_summary_{script_key}.json"
with open(summary_local_path, "w", encoding="utf-8") as f:
    json.dump(summary_payload, f, indent=2)
print(f"\\n[SUMMARY] Ringkasan turnamen tersimpan lokal: {{summary_local_path}}")

if IN_COLAB and drive_root.is_dir():
    drive_summary_path = drive_root / "tournament_summary_{script_key}.json"
    with open(drive_summary_path, "w", encoding="utf-8") as f:
        json.dump(summary_payload, f, indent=2)
    print(f"[SUMMARY] Ringkasan turnamen tersimpan di Drive: {{drive_summary_path}}")
"""
    ))

    cells.append(make_markdown_cell(
        f"{script_key}-refresh-hdr",
        "## Refresh Perbandingan Tersimpan — Tanpa Training\n"
        "Sel mandiri ini hanya membaca ringkasan di Drive. Bisa dijalankan tanpa Stage 1–7; "
        "izinkan mount Drive bila runtime baru. Metrik per aksara Combined harus sudah tersimpan."
    ))
    cells.append(make_code_cell(
        f"{script_key}-refresh-code",
        """# Refresh saved results without loading models or rerunning training.
import json
import math
import sys
from pathlib import Path

if "google.colab" in sys.modules:
    if not Path("/content/drive/MyDrive").is_dir():
        from google.colab import drive
        drive.mount("/content/drive")
    refresh_root = Path("/content/drive/MyDrive/Colab Notebooks/dataset-joints-1")
else:
    refresh_root = Path("ai/runs")

def read_saved_summary(script):
    candidates = []
    for path in (refresh_root / f"tournament_summary_{script}.json",
                 refresh_root / "onnx_exports" / script / f"tournament_summary_{script}.json"):
        if path.is_file():
            payload = json.loads(path.read_text(encoding="utf-8"))
            if payload.get("script") != script:
                raise ValueError(f"Wrong script in {path}")
            score = payload["champion"]["macro_f1"]
            if not isinstance(score, (int, float)) or not math.isfinite(score) or not 0 <= score <= 1:
                raise ValueError(f"Invalid Macro-F1 in {path}")
            candidates.append((payload["timestamp"], path, payload))
    if not candidates:
        raise FileNotFoundError(f"No saved summary for {script} under {refresh_root}")
    return max(candidates, key=lambda entry: entry[0])

combined_saved = read_saved_summary("combined")
by_script = combined_saved[2].get("selection_by_script")
if not by_script:
    raise ValueError("Combined summary lacks per-script metrics; reevaluate its saved ONNX once, not training.")
print("SAVED SELECTION MACRO-F1 — SPECIALISTS vs COMBINED")
print(f"{'Script':<12} | {'Samples':<8} | {'Specialist':<12} | {'Combined':<12} | {'Delta (pp)':<12}")
for row in by_script:
    saved = read_saved_summary(row["script"])
    specialist_score = saved[2]["champion"]["macro_f1"]
    combined_score = row["macro_f1"]
    if not isinstance(combined_score, (int, float)) or not math.isfinite(combined_score) or not 0 <= combined_score <= 1:
        raise ValueError(f"Invalid Combined metric for {row['script']}")
    print(f"{row['script'].title():<12} | {row['samples']:<8} | {specialist_score * 100:<11.2f}% | {combined_score * 100:<11.2f}% | {(combined_score - specialist_score) * 100:+.2f}")
    print(f"  Specialist source: {saved[1]} | timestamp={saved[0]} | training={saved[2].get('training', 'not recorded')}")
print(f"Combined source: {combined_saved[1]} | run={combined_saved[2].get('training')}")
print("Delta = Combined minus specialist. Descriptive selection comparison, not test accuracy or controlled comparison.")
"""
    ))

    return make_notebook(cells, f"{script_key}_classifier.ipynb")


def build_all_notebooks() -> list[Path]:
    NOTEBOOKS_DIR.mkdir(parents=True, exist_ok=True)
    configs = [
        (
            "sunda",
            "Aksantara | Modul 01: Turnamen Multi-Arsitektur & Pengklasifikasi Aksara Sunda",
            """Modul interaktif ini berfokus pada **Turnamen Multi-Arsitektur Pengklasifikasi Aksara Sunda**:
- **Karakteristik Paleografi:** 30 kelas konsonan dasar (*Ngalagena*) dan tanda diakritik (*Rarangken*).
- **Karakteristik Dataset:** Distribusi seimbang (~41–42 sampel pelatihan per kelas; rasio ketimpangan $1.02\\times$).
- **Multi-Arsitektur:** Menguji Custom CNN, MobileNetV3-Small, EfficientNet-B0, dan ResNet-18 secara otomatis.""",
            "sunda/ordinary/attempt-0001/best.pt",
            False,
            "01_sunda_classifier.ipynb",
        ),
        (
            "lontara",
            "Aksantara | Modul 02: Turnamen Multi-Arsitektur & Pengklasifikasi Aksara Lontara",
            """Modul interaktif ini berfokus pada **Turnamen Multi-Arsitektur Pengklasifikasi Aksara Lontara (Bugis-Makassar)**:
- **Karakteristik Paleografi:** 114 kelas dengan goresan sudut tajam, pola geometris, dan variasi tanda bunyi (*Ana' Sureq*).
- **Karakteristik Dataset:** Ketimpangan kelas ekstrem (18 hingga 79 sampel per kelas; rasio ketimpangan **4.39×**).
- **Multi-Arsitektur:** Membandingkan ketahanan representasi Custom CNN, MobileNetV3-Small, EfficientNet-B0, dan ResNet-18 terhadap ketimpangan data.""",
            "lontara/weighted/attempt-0002/best.pt",
            False,
            "02_lontara_classifier.ipynb",
        ),
        (
            "bali",
            "Aksantara | Modul 03: Turnamen Multi-Arsitektur & Pengklasifikasi Aksara Bali",
            """Modul interaktif ini berfokus pada **Turnamen Multi-Arsitektur Pengklasifikasi Aksara Bali**:
- **Karakteristik Paleografi:** 30 kelas dengan goresan kurvalinier dinamis, ligatur bertumpuk, dan gantungan/adeg-adeg (*subscript consonants*).
- **Karakteristik Dataset:** Ketimpangan kelas moderat (31 hingga 51 sampel per kelas; rasio ketimpangan **1.65×**).
- **Multi-Arsitektur:** Membandingkan kemampuan pemisahan kurva lengkung dinamis antar 4 arsitektur kandidat.""",
            "bali/weighted/attempt-0001/best.pt",
            False,
            "03_bali_classifier.ipynb",
        ),
        (
            "combined",
            "Aksantara | Modul 04: Turnamen Multi-Arsitektur & Pengklasifikasi Gabungan 174 Kelas",
            """Modul interaktif ini berfokus pada **Turnamen Multi-Arsitektur Pengklasifikasi Universal 174 Kelas Trinitas Aksara**:
- **Karakteristik Paleografi:** 174 kelas gabungan (30 Sunda + 114 Lontara + 30 Bali) tanpa petunjuk aksara (*script-unknown 174-way classification*).
- **Karakteristik Dataset:** 9.406 sampel pelatihan, 1.337 sampel seleksi, 678 kalibrasi, 2.021 pengujian tertutup.
- **Analisis Kunci:** Heatmap 3×3 Cross-Script Confusion dan komparasi head-to-head 3 Spesialis vs 1 Model Universal.""",
            "combined/ordinary/attempt-0003/best.pt",
            True,
            "04_combined_174_classifier.ipynb",
        ),
    ]

    created = []
    for script_key, title, paleo_summary, drive_ckpt, is_comb, filename in configs:
        nb_dict = generate_modular_notebook(
            script_key=script_key,
            title=title,
            paleo_summary=paleo_summary,
            drive_checkpoint_rel=drive_ckpt,
            is_combined=is_comb,
        )
        out_path = NOTEBOOKS_DIR / filename
        out_path.write_text(json.dumps(nb_dict, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"Generated: {out_path} ({len(nb_dict['cells'])} cells)")
        created.append(out_path)
    return created


if __name__ == "__main__":
    build_all_notebooks()
