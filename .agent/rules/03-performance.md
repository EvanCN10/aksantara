---
description: "Anggaran performa web dan aturan lazy loading ONNX Runtime Web."
globs: ["web/**/*"]
alwaysApply: false
---

# 03 — Performance

## Target (diukur, bukan ditebak)
LCP < 1.2 s (4G), INP < 50 ms, CLS 0, Lighthouse Performance ≥ 90 pada build produksi. Catat hasil ukur dan perangkatnya sebelum menuliskannya di proposal.

## Model ONNX
- Dilarang mengimpor `onnxruntime-web` atau memuat `.onnx` di landing page/initial bundle.
- Wajib `await import('onnxruntime-web')` dan fetch model hanya saat pengguna membuka latihan/tantangan menulis; tampilkan indikator loading dan cache model.
- Preprocessing + inferensi disarankan di Web Worker agar canvas tetap mulus.

## Aset
- Font aksara: subset + `font-display: swap`.
- Gambar lewat `next/image`, WebP/AVIF; `priority` hanya untuk elemen LCP, sisanya `loading="lazy"`.
- Periksa ukuran aset sebelum menambah (video/PNG besar di landing adalah kandidat optimasi).
