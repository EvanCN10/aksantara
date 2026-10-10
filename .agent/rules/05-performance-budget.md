---
description: "Anggaran performa web, optimasi Core Web Vitals, dan aturan lazy loading model AI ONNX di Aksantara."
globs: ["web/**/*"]
alwaysApply: false
---

# 05 — Performance Budget & Resource Optimization

## 1. Target Core Web Vitals (Panggung Demo JOINTS)
- **Largest Contentful Paint (LCP):** `< 1.2 detik` pada koneksi 4G reguler.
- **Interaction to Next Paint (INP):** `< 50ms` (respons goresan canvas dan sentuhan kartu fisik harus terasa instan).
- **Cumulative Layout Shift (CLS):** `0` (tidak ada elemen yang melompat saat font aksara atau model dimuat).
- **Lighthouse Performance Score:** `≥ 90` pada Audit Produksi.

## 2. Aturan Pemuatan Model AI (ONNX Runtime Web)
Model klasifikasi citra NusaAksara memiliki ukuran tensor yang signifikan (~5MB - 15MB).
- ❌ **Dilarang keras:** Mengimpor `onnxruntime-web` atau memuat file `.onnx` di halaman utama (*landing page*) atau initial bundle.
- ✅ **Wajib Dynamic Import & Lazy Loading:**
  Muat modul inferensi hanya ketika pengguna membuka modul latihan menulis:
  ```tsx
  // ✅ Lazy load ONNX session
  const initModel = async () => {
    const ort = await import('onnxruntime-web');
    // Load model session asynchronously
  };
  ```
- **Web Worker Offloading:** Pemrosesan normalisasi citra canvas (crop 64x64, binarisasi, konversi float tensor) dan eksekusi inferensi disarankan berjalan di Web Worker agar antarmuka canvas tetap berjalan mulus di 60–120 FPS tanpa lag.

## 3. Optimasi Font & Aset Gambar
- **Font Aksara Daerah:** Muat font `Noto Sans Buginese`, `Noto Sans Sundanese`, dan `Noto Sans Balinese` menggunakan subsetting dan CSS `font-display: swap`.
- **Gambar & Ilustrasi Cerita:**
  - Wajib menggunakan komponen `next/image`.
  - Format prioritas: WebP / AVIF.
  - Berikan atribut `priority` hanya pada elemen LCP pertama. Seluruh ilustrasi bab cerita berikutnya wajib `loading="lazy"`.

## 4. Efisiensi Token Agent AI
- Agent tidak boleh menginstal dependensi berat untuk tugas yang dapat diselesaikan dengan 10 baris kode native JavaScript/TypeScript.
- Hindari menyalin (*bundle*) pustaka visualisasi grafik berat jika cukup menggunakan SVG native atau Tailwind CSS.
