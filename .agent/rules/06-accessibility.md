---
description: "Pedoman aksesibilitas (WCAG 2.1 AA), keyboard navigation, dan aria-label status hardware di Aksantara."
globs: ["web/**/*", "**/*.tsx"]
alwaysApply: false
---

# 06 — Accessibility (A11y) & Inclusive Interaction

## 1. Standar Rasio Kontras (WCAG 2.1 AA)
- **Teks Normal:** Rasio kontras minimal `4.5:1` terhadap latar belakang.
- **Teks Besar & Komponen Grafis Penting:** Rasio kontras minimal `3:1`.
- Pastikan teks aksara di atas latar kertas lontar (`#F6F2E9`) menggunakan tinta gelap kontras tinggi (minimal `#1C1917` atau `#000000`).

## 2. Universal Web Canvas Accessibility
- **Input Multi-Modal:** Kanvas wajib mendukung `PointerEvent` terpadu:
  - Stylus pen (dengan dukungan pressure/kemiringan jika tersedia).
  - Sentuhan jari (touchscreen tablet & smartphone) dengan pencegahan scroll tidak sengaja (`touch-action: none`).
  - Mouse standar laptop/desktop.
- **Alternatif Non-Visual:**
  Sediakan tombol dan teks tersembunyi (*visually hidden*) yang menjelaskan karakter aksara yang sedang ditampilkan dan dilatih, sehingga pengguna pembaca layar (*screen reader*) mengetahui target aksara tersebut.

## 3. Web Serial API & Hardware Live Regions
Status perangkat keras fisik (*Tactile Pad*) berubah secara asinkron saat kabel dicolok atau kartu ditempelkan:
- **ARIA Live Regions:**
  Gunakan `aria-live="polite"` dan `role="status"` untuk mengumumkan perubahan koneksi hardware:
  ```tsx
  <div aria-live="polite" className="sr-only">
    {hardwareConnected 
      ? "Konsol Aksantara Tactile Pad terhubung via USB Serial" 
      : "Konsol fisik belum tersambung"}
  </div>
  ```
- **Feedback Kartu Terdeteksi:** Berikan notifikasi suara pelafalan (*audio cue*) dan label deskriptif saat kartu RFID terdeteksi (contoh: *"Kartu Aksara Lontara Ka terdeteksi"*).

## 4. Navigasi Keyboard & Target Sentuh (Tap Targets)
- Semua tombol navigasi, pilihan mode, dan kontrol canvas harus dapat diakses penuh via tombol `Tab` dan `Enter/Space`.
- Indikator fokus jelas: `focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none`.
- **Ukuran Target Sentuh:** Minimal `44px × 44px` untuk semua tombol interaktif pada perangkat sentuh siswa SD/SMP.
