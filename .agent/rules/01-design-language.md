---
description: "Bahasa desain Awwwards-level untuk Aksantara: palet warna etnik modern, tipografi aksara, sistem spasi, kurva transisi, dan grid asimetris."
globs: ["web/**/*", "**/*.tsx", "**/*.css"]
alwaysApply: false
---

# 01 — Design Language: Etnik Modern & Awwwards-Level

## 1. Filosofi Visual & Mood
Desain Aksantara harus terasa **premium, berakar pada budaya Nusantara, namun mutakhir dan futuristik (Phygital Cultural Heritage)**. Menghindari tampilan template AI generik.
- **Referensi Estetika:** Editorial Awwwards (kombinasi tekstur kertas lontar kuno dengan UI digital presisi tinggi dan glassmorphism halus).

## 2. Palet Warna Presisi (Exact Hex Tokens)
Gunakan token warna spesifik berikut pada CSS tokens / Tailwind v4 `@theme`:
- **Pewter / Warm Obsidian (Primary Background):** `#0D0E12` (gelap pekat hangat, bukan hitam murni `#000`).
- **Surface Elevation (Card / Panel):** `#16181F` dengan border `rgba(255, 255, 255, 0.08)`.
- **Lontar Parchment (Light Neutral / Canvas Paper):** `#F6F2E9` (warna daun lontar kering untuk latar canvas latihan).
- **Heritage Ochre / Mas Kuno (Primary Accent):** `#D4A373` (keemasan rempah budaya).
- **Terracotta Sumpah Palapa (Action Accent):** `#C85A32` (merah bata tanah liat Nusantara).
- **Forest Jade / Jamrud Katulistiwa (Success State):** `#2A9D8F` (indikator AI akurat & verifikasi sukses).
- **Crimson Sangkur (Error / Remedial):** `#E76F51` (evaluasi belum presisi / koreksi).

## 3. Tipografi & Hierarki Font
- **Heading / Display:** `Plus Jakarta Sans` atau `Outfit` (font modern geometris berkarakter kontemporer Indonesia).
- **Body / Interface:** `Inter` atau `Geist Sans` (keterbacaan tinggi pada ukuran kecil dan panel data).
- **Font Aksara Daerah (Wajib):**
  - Aksara Lontara: `Noto Sans Buginese`
  - Aksara Sunda: `Noto Sans Sundanese`
  - Aksara Bali: `Noto Sans Balinese`
- **Scale Tipografi Kustom:**
  - `hero`: `clamp(2.75rem, 6vw, 4.5rem)` dengan `letter-spacing: -0.03em`, `line-height: 1.05`.
  - `section-title`: `clamp(1.75rem, 3.5vw, 2.75rem)` dengan `letter-spacing: -0.02em`.
  - `body-large`: `1.125rem` / `line-height: 1.6`.

## 4. Spacing System & Asymmetric Grid
- **Grid Layout:** Bento Grid asimetris untuk fitur utama (Universal Canvas berukuran 60-70% lebar viewport pada desktop, panel inspeksi AI di sisi kanan 30-40%).
- **Radius Token:** Sudut melengkung halus konsisten: `rounded-2xl` (16px) untuk card, `rounded-xl` (12px) untuk button/input.
- **Backdrop Blur:** Glassmorphism terkontrol: `backdrop-blur-md` dengan latar semi-transparan `rgba(22, 24, 31, 0.75)`.

## 5. Motion & Transition Language
- **Easing Curve Standar:** `cubic-bezier(0.16, 1, 0.3, 1)` (snappy spring out, terasa mewah dan responsif).
- **Durasi Mikro:**
  - Hover / Tap feedback: `150ms`.
  - Panel buka / tutup: `280ms`.
  - AI Evaluation result reveal: `400ms`.
- **Aturan Animasi:** Animasi harus melayani pemahaman pengguna (contoh: stroke penulisan beranimasi, kartu RFID terdeteksi dengan ripple halus), dilarang animasi hiasan lambat yang membuang waktu.
