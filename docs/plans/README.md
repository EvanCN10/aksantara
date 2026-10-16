# Dokumentasi Rencana & Arsitektur AI Aksantara

Folder ini mengarsipkan rencana riset klasifikasi Trinitas Aksara Nusantara (JOINTS UGM 2026). Isi rencana, asumsi, nama tensor dan langkah yang belum dikerjakan pada saat penulisan adalah konteks historis, bukan kontrak runtime saat ini. Kontrak aktif: [AI_MODEL_HANDOFF.md](../AI_MODEL_HANDOFF.md); setup lintas modul: [INTEGRATION_HANDOFF.md](../INTEGRATION_HANDOFF.md). Studio kini memakai ONNX Runtime Web dengan input `input`; jangan menyalin kontrak input `image` dari rencana harness lama.

| Berkas Dokumen | Judul & Cakupan | Status / Deliverable |
|---|---|---|
| [`01_aksantara_training_plan.md`](01_aksantara_training_plan.md) | **12-Stage Formal Training Architecture Plan:** Spesifikasi protokol data leakage, split deterministik, multi-family architectures (`cnn`, `mobile`, `efficient`, `hybrid`), serta evaluasi gated release. | Terlaksana (Fondasi Data & Baseline) |
| [`02_classifier_aksantara_plan.md`](02_classifier_aksantara_plan.md) | **Colab Classifier Study Plan (7 Treatments):** Eksekusi pelatihan 4 classifier di GPU Google Colab (L4/T4) mencakup perlakuan ordinary vs weighted loss pada Sunda, Lontara, Bali, dan Combined 174-kelas. | Terlaksana (7 Treatments Completed, Macro-F1 terkunci) |
| [`03_modular_classifier_notebooks_plan.md`](03_modular_classifier_notebooks_plan.md) | **Modular Interactive Notebooks & Architectural Exploration Plan:** Dekonstruksi pipeline worker background menjadi 4 notebook Jupyter modular interaktif dengan visualisasi diagnostik paleografi mendalam dan ekspor ONNX terverifikasi. | Terlaksana (4 Notebooks di `ai/notebooks/`) |

---
Status model aktif dan bukti integrasi dicatat di [AI_MODEL_HANDOFF.md](../AI_MODEL_HANDOFF.md), artefak `ai/deployment/models/`, dan log historis [usage.md](../usage.md). Status deliverable di tabel ini tidak membuktikan gate release, kalibrasi, benchmark browser atau pengesahan paleografi.
