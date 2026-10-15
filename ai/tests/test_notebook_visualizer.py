import unittest
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for testing
import matplotlib.pyplot as plt
import torch
import torch.nn as nn

from ai.notebook_visualizer import (
    plot_glyph_grid,
    plot_class_distribution,
    plot_training_curves,
    plot_confusion_matrix,
    plot_misclassified_gallery,
    plot_cross_script_confusion,
    benchmark_latency,
    plot_multi_model_comparison,
    plot_multi_history_curves,
)


class TestNotebookVisualizer(unittest.TestCase):
    def tearDown(self):
        plt.close("all")

    def test_plot_glyph_grid(self):
        rows = [{"path": "dummy/path.png", "label_id": 0}] * 10
        labels = [{"id": 0, "label": "ha"}]
        fig = plot_glyph_grid(rows, data_root=".", labels=labels, num_samples=6)
        self.assertIsInstance(fig, plt.Figure)

    def test_plot_class_distribution(self):
        rows = [{"path": "p.png", "label_id": i % 3} for i in range(15)]
        labels = [{"id": 0, "label": "ha"}, {"id": 1, "label": "na"}, {"id": 2, "label": "ca"}]
        fig = plot_class_distribution(rows, labels=labels, title="Test Dist")
        self.assertIsInstance(fig, plt.Figure)

    def test_plot_training_curves(self):
        history = [
            {"epoch": 1, "train_loss": 1.2, "val_loss": 1.1, "val_macro_f1": 0.4},
            {"epoch": 2, "train_loss": 0.8, "val_loss": 0.7, "val_macro_f1": 0.75},
        ]
        fig = plot_training_curves(history)
        self.assertIsInstance(fig, plt.Figure)

    def test_plot_confusion_matrix(self):
        cm = [[10, 2], [1, 15]]
        labels = [{"id": 0, "label": "ka"}, {"id": 1, "label": "ga"}]
        fig = plot_confusion_matrix(cm, labels=labels)
        self.assertIsInstance(fig, plt.Figure)

    def test_plot_misclassified_gallery(self):
        preds = np.array([0, 1, 0])
        gts = np.array([0, 0, 1])
        rows = [{"path": "a.png", "label_id": 0}, {"path": "b.png", "label_id": 0}, {"path": "c.png", "label_id": 1}]
        labels = [{"id": 0, "label": "ka"}, {"id": 1, "label": "ga"}]
        probs = np.array([[0.9, 0.1], [0.3, 0.7], [0.8, 0.2]])
        fig = plot_misclassified_gallery(preds, gts, rows, data_root=".", labels=labels, probabilities=probs, top_k=2)
        self.assertIsInstance(fig, plt.Figure)

    def test_plot_cross_script_confusion(self):
        cm_3x3 = [
            [95, 3, 2],
            [1, 98, 1],
            [4, 2, 94],
        ]
        fig = plot_cross_script_confusion(cm_3x3)
        self.assertIsInstance(fig, plt.Figure)

    def test_benchmark_latency_torch(self):
        model = nn.Sequential(nn.Conv2d(3, 16, 3, padding=1), nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(16, 5))
        stats = benchmark_latency(model, input_shape=(1, 3, 32, 32), n_warmup=2, n_runs=5, device="cpu")
        self.assertIn("p50_ms", stats)
        self.assertIn("p95_ms", stats)
        self.assertIn("mean_ms", stats)
        self.assertGreater(stats["mean_ms"], 0.0)
    def test_plot_multi_model_comparison(self):
        rows = [
            {"model": "CNN", "macro_f1": 0.85, "accuracy": 0.88, "latency_ms": 4.2, "size_mb": 4.8},
            {"model": "MobileNet", "macro_f1": 0.95, "accuracy": 0.96, "latency_ms": 6.8, "size_mb": 6.1},
        ]
        fig = plot_multi_model_comparison(rows)
        self.assertIsInstance(fig, plt.Figure)

    def test_plot_multi_history_curves(self):
        histories = {
            "CNN": [{"epoch": 1, "val_loss": 0.8, "val_macro_f1": 0.7}],
            "MobileNet": [{"epoch": 1, "val_loss": 0.4, "val_macro_f1": 0.9}],
        }
        fig = plot_multi_history_curves(histories)
        self.assertIsInstance(fig, plt.Figure)


if __name__ == "__main__":
    unittest.main()
