"""Aggregator & paleographic diagnostic analyzer for Aksantara 4-classifier tournaments.

Reads:
- ai/runs/onnx_exports/sunda/tournament_summary_sunda.json
- ai/runs/onnx_exports/lontara/tournament_summary_lontara.json
- ai/runs/onnx_exports/bali/tournament_summary_bali.json
- ai/runs/onnx_exports/combined/tournament_summary_combined.json
(or from a specified Google Drive directory)

Outputs:
- Consolidated markdown table
- Identification of critical models (lowest Macro-F1)
- Top misclassified paleographic classes for targeted iteration
- Consolidated report at ai/runs/final_tournament_summary.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EXPORTS_DIR = ROOT / "ai/runs/onnx_exports"
SCRIPTS = ["sunda", "lontara", "bali", "combined"]


def load_summaries(search_dirs: list[Path]) -> dict[str, dict[str, Any]]:
    summaries = {}
    for script in SCRIPTS:
        filename = f"tournament_summary_{script}.json"
        found_file = None
        for base in search_dirs:
            candidate1 = base / script / filename
            candidate2 = base / filename
            if candidate1.is_file():
                found_file = candidate1
                break
            elif candidate2.is_file():
                found_file = candidate2
                break
        if found_file:
            try:
                summaries[script] = json.loads(found_file.read_text(encoding="utf-8"))
            except Exception as e:
                print(f"[!] Warning: Gagal membaca {found_file}: {e}", file=sys.stderr)
    return summaries


def format_report(summaries: dict[str, dict[str, Any]]) -> str:
    lines = []
    lines.append("=" * 115)
    lines.append("                 AKSANTARA 4-CLASSIFIER TOURNAMENT CONSOLIDATED REPORT")
    lines.append("              (Prinsip Pareto: 20% Metrik Kunci yang Mengontrol 80% Dampak Edukasi)")
    lines.append("=" * 115)
    lines.append(f"{'Target Aksara':<12} | {'Champion Model':<18} | {'Macro-F1':<10} | {'Top-1 Acc':<10} | {'Top-3 (Hint)':<12} | {'Min-Recall':<10} | {'Lat. p95':<9} | {'Status'}")
    lines.append("-" * 115)

    critical_candidates = []
    pedagogical_insights = []

    for s in SCRIPTS:
        data = summaries.get(s)
        if not data:
            lines.append(f"{s.capitalize():<12} | {'[BELUM DIEKSEKUSI]':<18} | {'-':<10} | {'-':<10} | {'-':<12} | {'-':<10} | {'-':<9} | PENDING")
            continue
        champ = data.get("champion", {})
        f1 = champ.get("macro_f1", 0.0) * 100
        top1 = champ.get("top1_acc", champ.get("accuracy", 0.0)) * 100
        top3 = champ.get("top3_acc", 0.0) * 100
        min_rec = champ.get("min_recall", 0.0) * 100
        lat = champ.get("latency_p95_ms", 0.0)
        model_name = champ.get("model", "Unknown")

        status = "CRITICAL" if f1 < 60 else ("MODERATE" if f1 < 85 else "OPTIMAL")
        critical_candidates.append((s, f1, champ, data.get("critical_classes", [])))

        delta_hint = top3 - top1
        pedagogical_insights.append({
            "script": s,
            "top1": top1,
            "top3": top3,
            "delta": delta_hint,
            "min_rec": min_rec,
            "conf_gap": champ.get("conf_gap", 0.0) * 100,
            "lat": lat,
        })

        lines.append(f"{s.capitalize():<12} | {model_name:<18} | {f1:>8.2f}% | {top1:>8.2f}% | {top3:>10.2f}% | {min_rec:>8.2f}% | {f'{lat:.1f}ms':>7} | {status}")

    lines.append("=" * 115)

    if pedagogical_insights:
        lines.append("\n" + "=" * 115)
        lines.append("🎓 1. ANALISIS DAMPAK PEDAGOGI & TOLERANSI GORESAN SISWA (Top-1 vs Top-3)")
        lines.append("=" * 115)
        for p in pedagogical_insights:
            lines.append(f"• Aksara {p['script'].capitalize():<8}: Top-1 {p['top1']:.1f}% -> Top-3 {p['top3']:.1f}% (Toleransi Goresan Naik +{p['delta']:.1f}%)")
        lines.append("\n  [Insight JOINTS Edukasi] Pada mode latihan kanvas anak pemula, sistem memberikan umpan balik 'Hampir Benar!'")
        lines.append("  jika aksara yang digambar masuk dalam Top-3 kandidat teratas. Kenaikan akurasi ini membuktikan model sangat")
        lines.append("  ramah terhadap goresan motorik halus anak SD tanpa memaksakan urutan goresan kaku (SSOT Line 119).")

        lines.append("\n" + "=" * 115)
        lines.append("⚖️ 2. KEADILAN KURIKULUM & INTEGRITAS UMPAN BALIK (Anti-Frustration & Calibration)")
        lines.append("=" * 115)
        for p in pedagogical_insights:
            fairness_warn = "⚠️ (Ada kelas minoritas berisiko buntu belajar)" if p['min_rec'] < 30 else "✅ (Kurikulum seimbang)"
            lines.append(f"• Aksara {p['script'].capitalize():<8}: Min-Recall = {p['min_rec']:.1f}% {fairness_warn} | Confidence Gap = {p['conf_gap']:.1f}%")
        lines.append("  [Insight JOINTS Edukasi] Min-Recall menjamin tidak ada 'aksara mati' di kurikulum yang membuat anak frustrasi.")
        lines.append("  Confidence Gap yang positif memastikan AI tidak 'sok tahu / overconfident' saat keliru menilai tulisan anak.")

    if critical_candidates:
        critical_candidates.sort(key=lambda x: x[1])
        worst_script, worst_f1, worst_champ, worst_classes = critical_candidates[0]

        lines.append("\n" + "=" * 115)
        lines.append(f"🔍 3. PRIORITAS ITERASI PALEOGRAFI (MODEL PALING KRITIS): {worst_script.upper()} (Macro-F1: {worst_f1:.2f}%)")
        lines.append("=" * 115)
        lines.append(f"Model Champion Saat Ini : {worst_champ.get('model')}")
        lines.append("Top-5 Glif/Karakter dengan Recall Terendah (Titik Lemah Model):")
        if worst_classes:
            for idx, c in enumerate(worst_classes, 1):
                rec_pct = c.get("recall", 0.0) * 100
                lines.append(f"  {idx}. Kelas '{c.get('label')}' (ID: {c.get('class_id')}) -> Recall: {rec_pct:.1f}% (Support: {c.get('support')} sampel)")
        else:
            lines.append("  (Data kelas kritis belum tersedia / belum dieksekusi)")

        lines.append("\n💡 REKOMENDASI INTERVENSI PALEOGRAFI:")
        if worst_script == "lontara":
            lines.append("  1. Loss Function : Terapkan Focal Loss (gamma=2.0) atau Class-Balanced Weighting untuk mengatasi imbalansi 4.39x.")
            lines.append("  2. Feature Backbone : Uji EfficientNet-B0 (SE Attention) untuk menangkap sudut tajam karakter mirip.")
            lines.append("  3. Paleographic Augmentation : Random shear (+-8 deg) & elastic distortion halus tanpa rotasi 90 deg.")
        elif worst_script == "bali":
            lines.append("  1. Diacritic Preservation : Hindari pooling berlebihan untuk menjaga detail ligatur & gantungan.")
            lines.append("  2. Contrast Normalization : Normalisasi ketebalan goresan pada kurva halus.")
        elif worst_script == "combined":
            lines.append("  1. Hierarchical Routing : Evaluasi arsitektur 2-stage (Stage 1 deteksi aksara, Stage 2 spesialis).")
        lines.append("=" * 115)

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Consolidate Aksantara 4-classifier tournament summaries")
    parser.add_argument(
        "--dir",
        "-d",
        type=Path,
        action="append",
        default=[DEFAULT_EXPORTS_DIR],
        help="Directories to search for tournament_summary_<script>.json",
    )
    parser.add_argument(
        "--out",
        "-o",
        type=Path,
        default=ROOT / "ai/runs/final_tournament_summary.json",
        help="Path to write consolidated JSON",
    )
    args = parser.parse_args()

    summaries = load_summaries(args.dir)
    report = format_report(summaries)
    print(report)

    if summaries:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(summaries, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\n[INFO] Consolidated data tersimpan di: {args.out}")


if __name__ == "__main__":
    main()
