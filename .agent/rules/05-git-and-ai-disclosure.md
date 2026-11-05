---
description: "Conventional Commits, tag versi, dan pencatatan penggunaan AI untuk disclosure Bali DigiFest 2026."
globs: ["**/*"]
alwaysApply: true
---

# 05 — Git & AI Disclosure

## Commit
Format `<type>(<scope>): <deskripsi imperatif>`; type: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`. Contoh: `feat(canvas): add pointer-event stroke capture`.

## Tag versi
- `joints-2026-final`: batas kode *pre-existing* (sebelum pengembangan DigiFest).
- `v1.0-submission`: Tahap 1. `v2.0-final`: final. Perubahan setelah deadline bukan bagian versi yang dinilai.

## Pencatatan AI
Panduan lomba mewajibkan pengungkapan penggunaan AI coding assistant. Setiap modul signifikan yang dibuat/dirombak dengan bantuan AI dicatat di [`docs/ai-usage-log.md`](../../docs/ai-usage-log.md) (tanggal, modul, peran AI, verifikasi manusia). Jangan menulis "sudah diverifikasi" bila belum.

## Kebersihan repo
- Jangan commit secret (`.env*`, kunci API). Hanya `web/.env.example`.
- Berkas biner besar hanya bila memang dibutuhkan runtime (model Bali di `web/public/models/bali/`); tidak ada checkpoint training (`.pt`, `.pth`) atau dataset di Git.
