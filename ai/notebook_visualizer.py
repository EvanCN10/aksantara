"""Visualization and diagnostic helpers for Aksantara modular classifier notebooks."""
from __future__ import annotations

import math
import time
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from PIL import Image

try:
    import torch
except ImportError:
    torch = None

try:
    import onnxruntime as ort
except ImportError:
    ort = None


def plot_glyph_grid(
    rows: list[dict[str, Any]],
    data_root: str | Path,
    labels: list[dict[str, Any]],
    num_samples: int = 24,
    cols: int = 6,
    figsize: tuple[float, float] | None = None,
) -> plt.Figure:
    """Renders a grid of sample script glyphs with their canonical labels."""
    root = Path(data_root)
    label_map = {item["id"]: item.get("label", item.get("name", str(item["id"]))) for item in labels}
    samples = rows[:num_samples]
    total = len(samples)
    if total == 0:
        fig, ax = plt.subplots(figsize=(4, 2))
        ax.text(0.5, 0.5, "No glyph samples available", ha="center", va="center")
        ax.axis("off")
        return fig

    rows_count = math.ceil(total / cols)
    if figsize is None:
        figsize = (cols * 2.2, rows_count * 2.4)
    fig, axes = plt.subplots(rows_count, cols, figsize=figsize)
    axes_flat = np.array(axes).reshape(-1)

    for idx, ax in enumerate(axes_flat):
        if idx < total:
            row = samples[idx]
            img_path = root / row["path"] if not Path(row["path"]).is_absolute() else Path(row["path"])
            label_name = label_map.get(row.get("label_id", -1), f"Class {row.get('label_id', '?')}")
            if img_path.is_file():
                try:
                    img = Image.open(img_path).convert("L")
                    ax.imshow(img, cmap="gray")
                except Exception:
                    ax.text(0.5, 0.5, "Error loading", ha="center", va="center", fontsize=8)
            else:
                ax.text(0.5, 0.5, "Missing file", ha="center", va="center", fontsize=8)
            ax.set_title(label_name, fontsize=9, pad=3)
            ax.axis("off")
        else:
            ax.axis("off")

    fig.tight_layout()
    return fig


def plot_class_distribution(
    rows: list[dict[str, Any]],
    labels: list[dict[str, Any]],
    title: str = "Class Sample Distribution",
    max_classes_full: int = 40,
    figsize: tuple[float, float] | None = None,
) -> plt.Figure:
    """Plots the sample distribution across classes, highlighting class imbalance."""
    counts: dict[int, int] = {}
    for r in rows:
        lid = r.get("label_id")
        if lid is not None:
            counts[lid] = counts.get(lid, 0) + 1

    label_names = {item["id"]: item.get("label", str(item["id"])) for item in labels}
    sorted_ids = sorted(labels, key=lambda x: counts.get(x["id"], 0), reverse=True)
    class_labels = [label_names.get(item["id"], str(item["id"])) for item in sorted_ids]
    sample_counts = [counts.get(item["id"], 0) for item in sorted_ids]

    num_classes = len(labels)
    if figsize is None:
        figsize = (12, 4.5) if num_classes <= max_classes_full else (14, 5)
    fig, ax = plt.subplots(figsize=figsize)

    if num_classes <= max_classes_full:
        bars = ax.bar(range(num_classes), sample_counts, color="#2563eb", alpha=0.85, edgecolor="#1d4ed8")
        ax.set_xticks(range(num_classes))
        ax.set_xticklabels(class_labels, rotation=60, ha="right", fontsize=8)
        for bar in bars:
            height = bar.get_height()
            if height > 0:
                ax.annotate(f"{height}", xy=(bar.get_x() + bar.get_width() / 2, height),
                            xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=7)
    else:
        # High class count: draw area/bar without overlapping ticks
        ax.bar(range(num_classes), sample_counts, color="#2563eb", width=0.8, alpha=0.85)
        ax.set_xlabel("Classes (Sorted by frequency)")
        # Show ticks at intervals
        step = max(1, num_classes // 10)
        tick_pos = list(range(0, num_classes, step))
        ax.set_xticks(tick_pos)
        ax.set_xticklabels([f"Rank {i+1}" for i in tick_pos], fontsize=8)

    min_count = min(sample_counts) if sample_counts else 0
    max_count = max(sample_counts) if sample_counts else 0
    mean_count = float(np.mean(sample_counts)) if sample_counts else 0.0
    imbalance = (max_count / min_count) if min_count > 0 else float("inf")

    ax.axhline(mean_count, color="#dc2626", linestyle="--", linewidth=1.2, label=f"Mean: {mean_count:.1f}")
    ax.set_ylabel("Number of Samples")
    ax.set_title(f"{title} (Total Classes: {num_classes}, Imbalance: {imbalance:.2f}x)", fontsize=11, fontweight="bold")
    ax.legend(loc="upper right")
    ax.grid(axis="y", linestyle=":", alpha=0.6)
    fig.tight_layout()
    return fig


def plot_training_curves(
    history: list[dict[str, Any]],
    figsize: tuple[float, float] = (12, 4.5),
) -> plt.Figure:
    """Plots training loss, selection loss, and selection Macro-F1 across epochs."""
    fig, (ax_loss, ax_f1) = plt.subplots(1, 2, figsize=figsize)
    if not history:
        ax_loss.text(0.5, 0.5, "No training history recorded", ha="center", va="center")
        ax_f1.text(0.5, 0.5, "No training history recorded", ha="center", va="center")
        return fig

    epochs = [h.get("epoch", idx + 1) for idx, h in enumerate(history)]
    train_loss = [h.get("train_loss", h.get("loss", None)) for h in history]
    val_loss = [h.get("val_loss", h.get("selection_loss", None)) for h in history]
    val_f1 = [h.get("val_macro_f1", h.get("selection_macro_f1", h.get("macro_f1", None))) for h in history]

    # Plot Loss
    if any(l is not None for l in train_loss):
        valid_epochs, valid_train = zip(*[(e, l) for e, l in zip(epochs, train_loss) if l is not None])
        ax_loss.plot(valid_epochs, valid_train, label="Train Loss", color="#2563eb", marker="o", markersize=3)
    if any(l is not None for l in val_loss):
        valid_epochs, valid_val = zip(*[(e, l) for e, l in zip(epochs, val_loss) if l is not None])
        ax_loss.plot(valid_epochs, valid_val, label="Selection Loss", color="#ea580c", marker="s", markersize=3)

    ax_loss.set_title("Training & Selection Loss", fontsize=11, fontweight="bold")
    ax_loss.set_xlabel("Epoch")
    ax_loss.set_ylabel("Cross Entropy Loss")
    ax_loss.grid(True, linestyle=":", alpha=0.6)
    ax_loss.legend(loc="upper right")

    # Plot Macro-F1
    if any(f is not None for f in val_f1):
        valid_epochs, valid_f1 = zip(*[(e, f) for e, f in zip(epochs, val_f1) if f is not None])
        ax_f1.plot(valid_epochs, [f * 100 if f <= 1.0 else f for f in valid_f1],
                   label="Selection Macro-F1 (%)", color="#16a34a", marker="^", markersize=4)
        best_f1 = max(valid_f1)
        best_pct = best_f1 * 100 if best_f1 <= 1.0 else best_f1
        ax_f1.axhline(best_pct, color="#ca8a04", linestyle="--", alpha=0.8, label=f"Peak: {best_pct:.2f}%")

    ax_f1.set_title("Selection Macro-F1", fontsize=11, fontweight="bold")
    ax_f1.set_xlabel("Epoch")
    ax_f1.set_ylabel("Macro-F1 (%)")
    ax_f1.grid(True, linestyle=":", alpha=0.6)
    ax_f1.legend(loc="lower right")

    fig.tight_layout()
    return fig


def plot_confusion_matrix(
    cm: list[list[int]] | np.ndarray,
    labels: list[dict[str, Any]],
    title: str = "Confusion Matrix",
    normalize: bool = True,
    figsize: tuple[float, float] | None = None,
) -> plt.Figure:
    """Renders a confusion matrix heatmap with normalized percentage color scaling."""
    cm_arr = np.array(cm, dtype=float)
    if normalize:
        row_sums = cm_arr.sum(axis=1, keepdims=True)
        cm_norm = np.divide(cm_arr, row_sums, out=np.zeros_like(cm_arr), where=row_sums != 0)
        display_data = cm_norm * 100.0
    else:
        display_data = cm_arr

    num_classes = len(labels)
    label_names = [item.get("label", str(item.get("id", idx))) for idx, item in enumerate(labels)]

    if figsize is None:
        figsize = (10, 8.5) if num_classes <= 35 else (14, 12)
    fig, ax = plt.subplots(figsize=figsize)

    show_annot = num_classes <= 32
    sns.heatmap(
        display_data,
        ax=ax,
        cmap="Blues",
        annot=show_annot,
        fmt=".1f" if normalize else "d",
        annot_kws={"size": 7 if num_classes > 20 else 8},
        cbar_kws={"label": "Percentage (%)" if normalize else "Count"},
        linewidths=0.5 if num_classes <= 35 else 0,
    )

    if num_classes <= 40:
        ax.set_xticks(np.arange(num_classes) + 0.5)
        ax.set_xticklabels(label_names, rotation=60, ha="right", fontsize=8)
        ax.set_yticks(np.arange(num_classes) + 0.5)
        ax.set_yticklabels(label_names, rotation=0, fontsize=8)
    else:
        step = max(1, num_classes // 15)
        indices = list(range(0, num_classes, step))
        ax.set_xticks(np.array(indices) + 0.5)
        ax.set_xticklabels([label_names[i] for i in indices], rotation=60, ha="right", fontsize=8)
        ax.set_yticks(np.array(indices) + 0.5)
        ax.set_yticklabels([label_names[i] for i in indices], rotation=0, fontsize=8)

    ax.set_xlabel("Predicted Label", fontweight="bold", labelpad=8)
    ax.set_ylabel("Ground Truth Label", fontweight="bold", labelpad=8)
    ax.set_title(title, fontsize=12, fontweight="bold", pad=12)
    fig.tight_layout()
    return fig


def plot_misclassified_gallery(
    predictions: list[int] | np.ndarray,
    ground_truth: list[int] | np.ndarray,
    rows: list[dict[str, Any]],
    data_root: str | Path,
    labels: list[dict[str, Any]],
    probabilities: np.ndarray | None = None,
    top_k: int = 12,
    cols: int = 4,
    figsize: tuple[float, float] | None = None,
) -> plt.Figure:
    """Displays a gallery of top misclassified glyphs for paleographic inspection."""
    preds = np.array(predictions)
    gts = np.array(ground_truth)
    root = Path(data_root)
    label_map = {item["id"]: item.get("label", str(item["id"])) for item in labels}

    err_indices = np.where(preds != gts)[0]
    if len(err_indices) == 0:
        fig, ax = plt.subplots(figsize=(6, 2))
        ax.text(0.5, 0.5, "100% Accuracy! No misclassified glyphs.", ha="center", va="center", color="#16a34a", fontsize=11)
        ax.axis("off")
        return fig

    # Sort errors by confidence if available
    if probabilities is not None and len(probabilities) == len(preds):
        err_confs = [probabilities[i][preds[i]] for i in err_indices]
        sorted_order = np.argsort(err_confs)[::-1]
        selected_err_indices = err_indices[sorted_order][:top_k]
    else:
        selected_err_indices = err_indices[:top_k]

    k = len(selected_err_indices)
    rows_count = math.ceil(k / cols)
    if figsize is None:
        figsize = (cols * 3.0, rows_count * 3.2)
    fig, axes = plt.subplots(rows_count, cols, figsize=figsize)
    axes_flat = np.array(axes).reshape(-1)

    for idx, ax in enumerate(axes_flat):
        if idx < k:
            sample_idx = selected_err_indices[idx]
            true_id = int(gts[sample_idx])
            pred_id = int(preds[sample_idx])
            row = rows[sample_idx]
            img_path = root / row["path"] if not Path(row["path"]).is_absolute() else Path(row["path"])

            if img_path.is_file():
                try:
                    img = Image.open(img_path).convert("L")
                    ax.imshow(img, cmap="gray")
                except Exception:
                    ax.text(0.5, 0.5, "Error loading", ha="center", va="center", fontsize=8)
            else:
                ax.text(0.5, 0.5, "Missing file", ha="center", va="center", fontsize=8)

            true_name = label_map.get(true_id, f"ID {true_id}")
            pred_name = label_map.get(pred_id, f"ID {pred_id}")
            conf_str = ""
            if probabilities is not None:
                conf = float(probabilities[sample_idx][pred_id]) * 100.0
                conf_str = f" ({conf:.1f}%)"

            ax.set_title(f"True: {true_name}\nPred: {pred_name}{conf_str}",
                         fontsize=8.5, color="#dc2626", fontweight="bold", pad=4)
            ax.axis("off")
        else:
            ax.axis("off")

    fig.suptitle("Paleographic Misclassification Gallery (False Positives)", fontsize=11, fontweight="bold", y=1.02)
    fig.tight_layout()
    return fig


def plot_cross_script_confusion(
    cm_3x3: list[list[int]] | np.ndarray,
    scripts: tuple[str, ...] = ("sunda", "lontara", "bali"),
    figsize: tuple[float, float] = (6, 5),
) -> plt.Figure:
    """Renders a 3x3 macro confusion matrix between the three core regional scripts."""
    cm_arr = np.array(cm_3x3, dtype=float)
    row_sums = cm_arr.sum(axis=1, keepdims=True)
    norm = np.divide(cm_arr, row_sums, out=np.zeros_like(cm_arr), where=row_sums != 0) * 100.0

    fig, ax = plt.subplots(figsize=figsize)
    script_names = [s.capitalize() for s in scripts]
    sns.heatmap(
        norm,
        ax=ax,
        cmap="YlGnBu",
        annot=True,
        fmt=".2f",
        xticklabels=script_names,
        yticklabels=script_names,
        cbar_kws={"label": "Agreement (%)"},
        linewidths=1.0,
    )
    ax.set_xlabel("Predicted Script", fontweight="bold", labelpad=8)
    ax.set_ylabel("True Script", fontweight="bold", labelpad=8)
    ax.set_title("3x3 Cross-Script Confusion Heatmap", fontsize=11, fontweight="bold", pad=10)
    fig.tight_layout()
    return fig


def benchmark_latency(
    model_or_session: Any,
    input_shape: tuple[int, ...] = (1, 3, 128, 128),
    n_warmup: int = 20,
    n_runs: int = 100,
    device: str = "cpu",
) -> dict[str, float]:
    """Measures single-image inference latency statistics in milliseconds."""
    is_ort = ort is not None and isinstance(model_or_session, ort.InferenceSession)
    is_torch = torch is not None and isinstance(model_or_session, torch.nn.Module)

    if not is_ort and not is_torch:
        raise ValueError("model_or_session must be a torch.nn.Module or an ort.InferenceSession")

    # Generate synthetic dummy tensor
    np_input = np.random.randn(*input_shape).astype(np.float32)

    if is_torch:
        model_or_session.eval()
        torch_device = torch.device(device)
        model_or_session.to(torch_device)
        t_input = torch.from_numpy(np_input).to(torch_device)

        # Warmup
        with torch.no_grad():
            for _ in range(n_warmup):
                _ = model_or_session(t_input)
                if device == "cuda" and torch.cuda.is_available():
                    torch.cuda.synchronize()

        timings: list[float] = []
        with torch.no_grad():
            for _ in range(n_runs):
                t0 = time.perf_counter()
                _ = model_or_session(t_input)
                if device == "cuda" and torch.cuda.is_available():
                    torch.cuda.synchronize()
                t1 = time.perf_counter()
                timings.append((t1 - t0) * 1000.0)

    else:
        input_name = model_or_session.get_inputs()[0].name
        # Warmup
        for _ in range(n_warmup):
            _ = model_or_session.run(None, {input_name: np_input})

        timings = []
        for _ in range(n_runs):
            t0 = time.perf_counter()
            _ = model_or_session.run(None, {input_name: np_input})
            t1 = time.perf_counter()
            timings.append((t1 - t0) * 1000.0)

    arr = np.array(timings)
    return {
        "mean_ms": float(np.mean(arr)),
        "std_ms": float(np.std(arr)),
        "min_ms": float(np.min(arr)),
        "max_ms": float(np.max(arr)),
        "p50_ms": float(np.percentile(arr, 50)),
        "p90_ms": float(np.percentile(arr, 90)),
        "p95_ms": float(np.percentile(arr, 95)),
        "n_runs": n_runs,
    }
def plot_multi_model_comparison(
    comparison_rows: list[dict[str, Any]],
    title: str = "Multi-Architecture Benchmark Tournament",
    figsize: tuple[float, float] = (14, 5),
) -> plt.Figure:
    """Renders a comparative dashboard comparing Macro-F1, Accuracy, Model Size, and Latency."""
    if not comparison_rows:
        fig, ax = plt.subplots(figsize=(6, 2))
        ax.text(0.5, 0.5, "No comparison data available", ha="center", va="center")
        ax.axis("off")
        return fig

    fig, (ax_perf, ax_cost) = plt.subplots(1, 2, figsize=figsize)

    models = [r.get("model", f"Model {i}") for i, r in enumerate(comparison_rows)]
    f1_scores = [r.get("macro_f1", 0.0) * (100.0 if r.get("macro_f1", 0.0) <= 1.0 else 1.0) for r in comparison_rows]
    accuracies = [r.get("top1_acc", r.get("accuracy", 0.0)) * (100.0 if r.get("top1_acc", r.get("accuracy", 0.0)) <= 1.0 else 1.0) for r in comparison_rows]
    has_top3 = any("top3_acc" in r for r in comparison_rows)
    top3_scores = [r.get("top3_acc", 0.0) * (100.0 if r.get("top3_acc", 0.0) <= 1.0 else 1.0) for r in comparison_rows]
    latencies = [r.get("latency_ms", 0.0) for r in comparison_rows]
    sizes = [r.get("size_mb", 0.0) for r in comparison_rows]

    x = np.arange(len(models))

    if has_top3:
        width = 0.25
        bars1 = ax_perf.bar(x - width, f1_scores, width, label="Macro-F1 (%)", color="#2563eb")
        bars2 = ax_perf.bar(x, accuracies, width, label="Top-1 Accuracy (%)", color="#10b981")
        bars3 = ax_perf.bar(x + width, top3_scores, width, label="Top-3 Pedagogical Hint (%)", color="#f59e0b")
        all_bars = [bars1, bars2, bars3]
    else:
        width = 0.35
        bars1 = ax_perf.bar(x - width / 2, f1_scores, width, label="Selection Macro-F1 (%)", color="#2563eb")
        bars2 = ax_perf.bar(x + width / 2, accuracies, width, label="Accuracy (%)", color="#10b981")
        all_bars = [bars1, bars2]

    ax_perf.set_xticks(x)
    ax_perf.set_xticklabels(models, rotation=25, ha="right", fontsize=9, fontweight="bold")
    ax_perf.set_ylabel("Score (%)")
    ax_perf.set_ylim(0, 108)
    ax_perf.set_title("Performance & Pedagogical Tolerance", fontsize=11, fontweight="bold")
    ax_perf.grid(axis="y", linestyle=":", alpha=0.6)
    ax_perf.legend(loc="lower right", fontsize=8)

    for bar_group in all_bars:
        for bar in bar_group:
            h = bar.get_height()
            ax_perf.annotate(f"{h:.1f}%", xy=(bar.get_x() + bar.get_width() / 2, h),
                             xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=7.5)
    # Panel 2: Deployment efficiency & latency
    bars3 = ax_cost.bar(x - width / 2, sizes, width, label="Model Size (MB)", color="#f59e0b")
    bars4 = ax_cost.bar(x + width / 2, latencies, width, label="Inference Latency (ms)", color="#8b5cf6")
    ax_cost.set_xticks(x)
    ax_cost.set_xticklabels(models, rotation=25, ha="right", fontsize=9, fontweight="bold")
    ax_cost.set_ylabel("Value (MB / ms)")
    ax_cost.set_title("Deployment Budget: Size (MB) vs Latency (ms)", fontsize=11, fontweight="bold")
    ax_cost.axhline(15.0, color="#dc2626", linestyle="--", linewidth=1.2, label="Budget Limit Size (15 MB)")
    ax_cost.axhline(50.0, color="#7c3aed", linestyle=":", linewidth=1.2, label="Budget Limit Latency (50 ms)")
    ax_cost.grid(axis="y", linestyle=":", alpha=0.6)
    ax_cost.legend(loc="upper left", fontsize=8)

    for bar in bars3:
        h = bar.get_height()
        ax_cost.annotate(f"{h:.1f}M", xy=(bar.get_x() + bar.get_width() / 2, h),
                         xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=8)
    for bar in bars4:
        h = bar.get_height()
        ax_cost.annotate(f"{h:.1f}ms", xy=(bar.get_x() + bar.get_width() / 2, h),
                         xytext=(0, 2), textcoords="offset points", ha="center", va="bottom", fontsize=8)

    fig.suptitle(title, fontsize=12, fontweight="bold", y=1.02)
    fig.tight_layout()
    return fig


def plot_multi_history_curves(
    histories: dict[str, list[dict[str, Any]]],
    figsize: tuple[float, float] = (13, 4.5),
) -> plt.Figure:
    """Renders convergence curves across multiple candidate architectures side-by-side."""
    fig, (ax_loss, ax_f1) = plt.subplots(1, 2, figsize=figsize)
    if not histories:
        ax_loss.text(0.5, 0.5, "No history available", ha="center", va="center")
        ax_f1.text(0.5, 0.5, "No history available", ha="center", va="center")
        return fig

    colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"]
    for idx, (model_name, records) in enumerate(histories.items()):
        color = colors[idx % len(colors)]
        epochs = [r.get("epoch", i + 1) for i, r in enumerate(records)]
        val_losses = [r.get("val_loss", r.get("selection_loss", None)) for r in records]
        val_f1s = [r.get("val_macro_f1", r.get("selection_macro_f1", None)) for r in records]

        if any(l is not None for l in val_losses):
            valid_ep, valid_l = zip(*[(e, l) for e, l in zip(epochs, val_losses) if l is not None])
            ax_loss.plot(valid_ep, valid_l, label=model_name, color=color, marker="o", markersize=3)

        if any(f is not None for f in val_f1s):
            valid_ep, valid_f = zip(*[(e, f) for e, f in zip(epochs, val_f1s) if f is not None])
            pct_f1 = [f * 100.0 if f <= 1.0 else f for f in valid_f]
            ax_f1.plot(valid_ep, pct_f1, label=model_name, color=color, marker="s", markersize=3)

    ax_loss.set_title("Validation Loss Progression", fontsize=11, fontweight="bold")
    ax_loss.set_xlabel("Epoch")
    ax_loss.set_ylabel("Loss")
    ax_loss.grid(True, linestyle=":", alpha=0.6)
    ax_loss.legend(loc="upper right")

    ax_f1.set_title("Selection Macro-F1 Progression", fontsize=11, fontweight="bold")
    ax_f1.set_xlabel("Epoch")
    ax_f1.set_ylabel("Macro-F1 (%)")
    ax_f1.grid(True, linestyle=":", alpha=0.6)
    ax_f1.legend(loc="lower right")

    fig.tight_layout()
    return fig
