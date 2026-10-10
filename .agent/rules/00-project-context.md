---
description: "Konteks proyek Aksantara (JOINTS UGM 2026), Trinitas Aksara Nusantara, 4 Pilar x 2 Mode, dan arsitektur inti."
globs: ["**/*"]
alwaysApply: true
---

# 00 — Project Context: Aksantara

## Identitas Proyek & Kompetisi
- **Nama Proyek:** **Aksantara** *(Aksara Nusantara Berdaya di Era Digital & Fisik)*.
- **Kompetisi:** Hackathon JOINTS UGM 2026 — **Tema: Education**.
- **Deadline Pengumpulan:** **16 Oktober 2026, 23.59 WIB**.
- **Grand Final:** 1 November 2026, FMIPA Universitas Gadjah Mada (Luring).
- **Single Source of Truth (SSOT):** Seluruh rujukan teknis mendalam merujuk pada `context/AKSANTARA-SSOT-v3.1.md`.

## Masalah & Solusi Inti
- **Masalah:** Krisis literasi aksara daerah pada generasi muda karena metode ajar statis, minim alat peraga interaktif, dan kejenuhan layar (*screen fatigue*).
- **Solusi:** Platform edukasi multi-modal berbasis AI klasifikasi bentuk citra (*no stroke order penalty*) dan perangkat kinestetik fisik (*Phygital*) melalui **4 Pilar × 2 Mode Penggunaan**.

## Trinitas Aksara Nusantara (Scope Terkunci)
Platform difokuskan secara mendalam pada 3 aksara dengan karakter paleografi kontras:
1. **Lontara (Bugis-Makassar):** Karakter sudut tajam, geometris.
2. **Sunda:** Pola konsonan ngalagena modular dengan rarangken (atas, bawah, samping).
3. **Bali:** Kurvalinier dinamis, ligatur kompleks, gantungan (*adeg-adeg*).

## Dua Mode Penggunaan
1. **Web Mode (Digital AI):** Universal Web Canvas (PointerEvent API) + AI Shape/Topology Classifier fine-tuned dari benchmark akademis **NusaAksara (ACL 2025)** via ONNX Runtime Web / Edge API (<50ms feedback).
2. **Hardware Mode (Phygital IoT):** Konsol fisik *Aksantara Tactile Pad* (ESP32 + RC522 RFID Reader) terhubung via **Web Serial API (USB Plug-and-Play)** langsung ke browser untuk mini game susun aksara balok sensorik (bebas ketergantungan WiFi panggung).

## Tech Stack Resmi
- **Web Frontend:** Next.js 16.x (App Router), React 19.x, Tailwind CSS v4.x, Lucide Icons.
- **AI Engine:** NusaAksara ACL 2025 benchmark, CNN/MobileNet classifier, ONNX Runtime Web.
- **Hardware & IoT:** ESP32 / Arduino C++, RC522 RFID 13.56 MHz, Web Serial API.
- **Database & State:** Supabase (PostgreSQL), Deterministic JSON Story Graph.
