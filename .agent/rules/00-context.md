---
description: "Konteks proyek Aksantara untuk Bali DigiFest 2026: scope dan aturan klaim. Detail ada di docs/CONTEXT.md."
globs: ["**/*"]
alwaysApply: true
---

# 00 — Context

Konteks lengkap: [`docs/CONTEXT.md`](../../docs/CONTEXT.md). File ini hanya memuat aturan yang tidak boleh dilanggar.

## Scope
- **Aksantara**: pelatih menulis **Aksara Bali** berbasis AI, **web saja**, untuk Bali DigiFest 2026 (AI Web Innovation Challenge).
- Tidak ada aksara lain dan tidak ada hardware di repo ini.

## Aturan klaim (pelanggaran = risiko diskualifikasi)
- Jangan menulis angka akurasi/latensi tanpa menyebut sumber dan kondisinya. Angka model saat ini berasal dari *selection set*, bukan tulisan canvas nyata.
- Skor = probabilitas kelas, bukan nilai kualitas tulisan. Model tidak memeriksa urutan goresan atau posisi diakritik.
- Jangan menampilkan data contoh/mock sebagai data nyata. Beri label jelas atau hapus.
- Klaim "berjalan di browser / data tidak keluar perangkat" hanya untuk jalur yang memang berjalan di browser.

## Stack
Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript strict, Supabase, ONNX Runtime Web, Gemini API (opsional, dengan fallback).
