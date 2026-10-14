# Dokumentasi Rencana & Arsitektur AI Aksantara

Folder ini mengonsolidasikan seluruh dokumen perencanaan, arsitektur, dan peta jalan riset klasifikasi Trinitas Aksara Nusantara (JOINTS UGM 2026):

| Berkas Dokumen | Judul & Cakupan | Status / Deliverable |
|---|---|---|
| [`01_aksantara_training_plan.md`](01_aksantara_training_plan.md) | **12-Stage Formal Training Architecture Plan:** Spesifikasi protokol data leakage, split deterministik, multi-family architectures (`cnn`, `mobile`, `efficient`, `hybrid`), serta evaluasi gated release. | Terlaksana (Fondasi Data & Baseline) |
| [`02_classifier_aksantara_plan.md`](02_classifier_aksantara_plan.md) | **Colab Classifier Study Plan (7 Treatments):** Eksekusi pelatihan 4 classifier di GPU Google Colab (L4/T4) mencakup perlakuan ordinary vs weighted loss pada Sunda, Lontara, Bali, dan Combined 174-kelas. | Terlaksana (7 Treatments Completed, Macro-F1 terkunci) |
| [`03_modular_classifier_notebooks_plan.md`](03_modular_classifier_notebooks_plan.md) | **Modular Interactive Notebooks & Architectural Exploration Plan:** Dekonstruksi pipeline worker background menjadi 4 notebook Jupyter modular interaktif dengan visualisasi diagnostik paleografi mendalam dan ekspor ONNX terverifikasi. | Terlaksana (4 Notebooks di `ai/notebooks/`) |

---
*Status eksekusi mutakhir dan artefak checkpoint selalu dicatat di [`PROGRESS_HANDOFF.md](../../PROGRESS_HANDOFF.md).*
