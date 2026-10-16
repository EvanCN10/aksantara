---
description: "Standar commit git konvensional dan kewajiban pencatatan log penggunaan AI sesuai guidebook JOINTS UGM."
globs: ["**/*"]
alwaysApply: true
---

# 08 — Git & AI Disclosure Standards

## 1. Konvensi Commit Git (Conventional Commits)
Setiap pesan commit wajib mengikuti format terstruktur:
`<type>(<scope>): <deskripsi singkat imperative>`

### Prefix Tipe yang Diizinkan:
- `feat:` Penambahan fitur baru (contoh: `feat(canvas): implement pointer-event stroke capture`).
- `fix:` Perbaikan bug (contoh: `fix(serial): handle reader lock release on unmount`).
- `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas.
- `perf:` Peningkatan performa (contoh: `perf(onnx): lazy load model session in web worker`).
- `docs:` Pembaruan dokumentasi atau SSOT.
- `chore:` Pemeliharaan dependensi, konfigurasi git, atau tooling.

## 2. Kewajiban Pengungkapan AI (JOINTS Guidebook Compliance)
Sesuai regulasi transparansi kompetisi Hackathon JOINTS UGM 2026:
- Tim wajib transparan mengenai pemanfaatan AI generative.
- **Log Penggunaan AI:** Setiap kali modul signifikan dibuat atau dirombak menggunakan AI Agent, catat ringkasannya ke berkas `docs/usage.md` dengan format tabel:

| Tanggal | Komponen / Modul | Peran AI Agent | Verifikasi & Validasi Tim Manusia |
|---|---|---|---|
| YYYY-MM-DD | `web/canvas` | Pembuatan fungsi normalisasi citra binarisasi | Uji manual bounding box dan validasi output tensor 64x64 |

## 3. Kebersihan Repositori (Zero Bloat)
- Jangan pernah melakukan commit untuk file model biner besar (`.onnx`, `.pth` >50MB) langsung ke Git. Gunakan link download rilis atau storage cloud (HuggingFace / Supabase Storage).
- Pastikan berkas sensitif (`.env.local`, credentials API) selalu berada di dalam `.gitignore`.
