# Rencana Migrasi Aksantara: JOINTS UGM → Bali DigiFest 2026

Konteks dan aturan klaim: [CONTEXT.md](CONTEXT.md)
Basis audit: tag `joints-2026-final` (commit `17dbbb0`) (`feat: merge web into main`), repo `EvanCN10/aksantara`.

> Jadwal DigiFest belum diumumkan di panduan, jadi rencana ini memakai **urutan prioritas**, bukan tanggal. Isi tanggal setelah jadwal resmi keluar.

---

## 0. Ringkasan Perubahan

| Aspek | JOINTS UGM (lama) | DigiFest (baru) |
|---|---|---|
| Tema | Education | Build With AI, Solve For Bali |
| Aksara | Trinitas: Lontara, Sunda, Bali | **Bali saja** (lainnya dibekukan) |
| Mode | Web + Hardware (Tactile Pad) | **Web saja** |
| Yang dinilai | Konsep + demo luring | **MVP web yang bisa diuji juri jarak jauh**, repo, disclosure, video |
| AI | Classifier + LLM narator | Classifier Bali + LLM narator + **Tutor kesalahan** |
| Bukti | Presentasi | Repo + URL aktif + verifikasi teknis (juri boleh mencoba input baru) |

---

## 1. Tahap P0 — Wajib sebelum submit Tahap 1

### P0.1 Baseline & versi
```bash
git tag -a joints-2026-final 52dc81d -m "Kode sebelum pengembangan DigiFest"
git push origin joints-2026-final
git checkout -b digifest
```
Tujuan: bukti pemisah bagian *pre-existing* vs *dikembangkan untuk lomba* (dicek saat Technical Verification).

### P0.2 Audit keamanan repo (sebelum repo dibuka ke juri)
- [ ] Cari secret di seluruh riwayat git (`git log -p -S "AIza"`, `-S "service_role"`, `-S "eyJ"`) atau gunakan tool pemindai secret.
- [ ] Jika ada kebocoran: rotasi kunci, jangan hanya menghapus file.
- [ ] Pastikan `.env.local` ada di `.gitignore` dan `web/.env.example` hanya berisi nama variabel.
- [ ] Hapus berkas besar/tidak perlu dari repo publik (mis. `Landing-Video.mp4` jika tidak dipakai).

### P0.3 Perbaiki konten palsu (**prioritas tertinggi**, risiko diskualifikasi)
| File | Masalah | Tindakan |
|---|---|---|
| `web/src/app/(siswa)/latihan/web/hasil/page.tsx` | Skor `[97,94,91,88]` dan catatan AI statis | Ganti dengan hasil nyata sesi (simpan hasil `evaluateGlyph` per karakter di state/Supabase). Jika belum sempat: hapus halaman dan arahkan "Selesaikan Sesi" ke ringkasan nyata. |
| `web/src/app/(guru)/guru/**` + `data/guru/guru-data.ts` | Data mock | Sambungkan ke Supabase **atau** sembunyikan dari navigasi |
| `web/src/app/(akun)/profil/page.tsx` + `data/profil/profil-data.ts` | Data mock | Sama seperti di atas |
| `web/src/data/aksara/trinitas.ts` | `TODO` status progres | Isi dari progres nyata atau hapus indikator status |

### P0.4 Persempit scope ke Bali
- [x] Landing, navbar, `/aksara-bali`, `/tentang`: ubah copy jadi "Aksantara — Aksara Bali". Hapus klaim "Trinitas", "Phygital", "zero-latency", "tanpa WiFi". (Selesai pada `digifest-cleanup`)
- [x] `/latihan/web/[aksara]`: hanya `bali` yang aktif. (Selesai pada `digifest-cleanup`)
- [x] Hapus modul `/hardware/*` dan `iot/` sepenuhnya sesuai keputusan user D2. (Selesai pada `digifest-cleanup`)
- [x] Story Mode: aktifkan hanya cerita Bali (*Misteri Mantra Calon Arang*). (Selesai pada `digifest-cleanup`)
- [ ] Pastikan semua slug Bali di katalog punya target di `shared/aksara-classifier.json`. Slug tanpa model → tandai "belum didukung" (jangan dilatih pura-pura).

### P0.5 Deploy AI yang stabil
**Keputusan: A (ONNX Runtime Web).** Opsi B hanya dipertahankan sebagai cadangan darurat.

**A. ONNX Runtime Web di browser**
- [ ] Hapus ketergantungan wajib pada `AI_CLASSIFIER_URL` di jalur produksi; route `/api/ai/classify` jadi opsional (dev/benchmark).
- [ ] Muat model lazy (hanya di halaman latihan/tantangan), cache lewat Cache API/service worker agar 15 MiB tidak diunduh ulang; tampilkan indikator loading.
- [ ] Set header `Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy` di `next.config.ts` bila memakai WASM multi-thread; jika tidak, pakai single-thread (cukup untuk model sekecil ini).
- [ ] Fallback jika WASM gagal dimuat: pesan error jelas, tanpa skor palsu.
- [ ] Salin `ai/deployment/models/bali/model.onnx` ke `web/public/models/` (mungkin perlu opsi riset ukuran 15,4 MiB; ada versi INT8 4,6 MiB di artefak eksperimen, **tapi INT8 lebih lambat di benchmark CPU tersimpan dan belum diverifikasi akurasinya**).
- [ ] Tambah `onnxruntime-web` ke `web/package.json`. File WASM sudah ada di `web/public/wasm/ort-wasm-simd-threaded.wasm`.
- [ ] Porting preprocessing mengikuti `ai/preprocess.py` (referensi: `ai/harness/preprocess.js`).
- [ ] **Uji parity**: untuk ≥ 30 gambar, bandingkan top-1 dan probabilitas Python vs browser; toleransi dicatat.
- [ ] Ukur latensi nyata (cold & warm, perangkat dicatat), baru boleh dituliskan di proposal.
- [ ] Ubah `evaluateGlyph()` agar memanggil sesi lokal; pertahankan antarmuka `GlyphInferenceOutput`.

**B. Backend FastAPI ter-host (cadangan)**
- [ ] Deploy `ai/deployment/server.py` ke host publik (Hugging Face Spaces / Render / Railway), set `AI_CLASSIFIER_URL` di hosting web.
- [ ] Hanya muat model Bali (hapus Lontara/Sunda dari image deploy; terkait lisensi).
- [ ] Atasi *cold start* (ping berkala atau tier tanpa tidur) dan pantau selama masa penjurian.
- [ ] Update disclosure: gambar kanvas dikirim ke server kami.

### P0.6 Dokumen wajib
- [ ] `README.md` ditulis ulang sesuai Lampiran B panduan (lihat §5).
- [ ] AI & Technology Disclosure sesuai Lampiran C (lihat §6).
- [ ] `web/.env.example` mutakhir (tanpa `NEXT_PUBLIC_AI_CLASSIFIER_URL` bila dipakai server-only).
- [ ] Akun demo juri (Supabase) dibuat; kredensial dikirim lewat form panitia, bukan repo.
- [ ] Proposal PDF ≤ 5 halaman isi: `AIWIC2026_NamaTim_Aksantara.pdf`.
- [ ] Tag `v1.0-submission` + catat commit hash.

---

## 2. Tahap P1 — Memperkuat AI & kejujuran evaluasi

### P1.1 Test set canvas Bali nyata
- Kumpulkan tulisan dari ≥ 10 penulis (consent tertulis), ≥ 2 tulisan per kelas × 30 kelas, **dipisah per penulis** (penulis di test tidak ada di train). Harness: `ai/harness/` (`python ai/runner.py serve --port 8765`, buka `/harness/`).
- Laporkan top-1, top-3, dan kelas terlemah. Taruh ringkasan di README dan proposal, tulis juga bila angkanya jelek.
- Jika akurasi canvas rendah → latih ulang/fine-tune dengan data ini (augmentasi goresan kanvas), lalu evaluasi ulang pada penulis yang tidak dipakai.

### P1.2 Kalibrasi confidence
- Gunakan partisi kalibrasi (atau data baru) untuk *temperature scaling*. Evaluasi ulang ambang `acceptanceThreshold` (saat ini 0,85) berdasarkan data, bukan tebakan.
- Setelah dikalibrasi, ubah flag `probabilitiesCalibrated` dengan jujur.

### P1.3 Progres belajar nyata
- Panggil `progress-service.ts` setelah tiap evaluasi (hasil, bukan XP dari probabilitas mentah; ikuti catatan handoff lama).
- Tampilkan riwayat siswa dari DB di profil dan hasil sesi.

### P1.4 Lisensi dataset
- Hubungi pemilik `wildanfatahh22/aksara-bali` (Kaggle) untuk izin penggunaan/publikasi bobot.
- Bila tidak ada jawaban: sebut di disclosure, dan siapkan rencana mengganti dengan data milik sendiri.

---

## 3. Tahap P2 — Pembeda (Fitur A3: Tutor Kesalahan)

**Tujuan:** AI tidak hanya memberi label, tetapi menjelaskan *mengapa* tulisan siswa dikira karakter lain.

**Rancangan:**
1. Input: karakter target, top-3 prediksi + probabilitas, (opsional) gambar kecil.
2. Basis pengetahuan **terkurasi manual**: `web/src/data/aksara/bali-glif-notes.ts` berisi ciri visual tiap 30 kelas, dan pasangan yang sering tertukar (mis. ditulis tim setelah melihat confusion matrix hasil P1.1).
3. Route baru `web/src/app/api/ai/tutor/route.ts` → Gemini dengan prompt terbatas pada data terkurasi (kurangi halusinasi).
4. UI: kartu "Saran Tutor" di `ai-evaluation-panel.tsx`; tampilkan `source` (`gemini_ai` / `rule_based`).
5. Fallback tanpa LLM: aturan dari tabel pasangan tertukar (tetap bermanfaat bila API gagal; menjawab pertanyaan juri soal *error handling*).
6. Disclaimer: bantuan belajar, bukan penilaian resmi. Validasi isi ciri visual dengan guru/penutur aksara Bali bila memungkinkan.

**Kriteria selesai:** untuk input salah yang disengaja, juri melihat penjelasan spesifik; untuk API mati, fallback tampil.

---

## 4. Tahap P3 — Opsional

- Foto papan nama beraksara Bali → transliterasi (butuh OCR baris; model sekarang **tidak** mampu). Kerjakan hanya jika P0–P2 selesai dan ada data baris.
- Sandangan/pangangge Bali (model baru).
- Aktifkan kembali Lontara/Sunda hanya setelah urusan lisensi jelas.

---

## 5. Kerangka README (Lampiran B)

```markdown
# Aksantara — Pelatih Menulis Aksara Bali Berbasis AI
## Description
## Problem & Target User
## Key Features        (hanya yang benar-benar berfungsi)
## Tech Stack
## AI Implementation   (EfficientNet-B0 ONNX 30 kelas; Gemini; input-output; batas)
## Architecture / Data Flow
## Installation / Run Instructions
## Deployment URL
## Demo Account        (tanpa password di repo publik)
## Known Limitations   (30 kelas, tanpa sandangan, evaluasi canvas, lisensi dataset, dll.)
## Third-party Resources / Credits
## Pre-existing Components   (JOINTS UGM; tag joints-2026-final)
## Team Members
```

## 6. Isi Awal AI & Technology Disclosure (Lampiran C)

| Komponen | Isi (koreksi bila ada perubahan) |
|---|---|
| Nama Produk | Aksantara |
| Framework / Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend / Runtime | Next.js route handlers; FastAPI + ONNX Runtime (jika opsi B); `TODO` |
| Database / Storage | Supabase (PostgreSQL + Auth) |
| Hosting / Deployment | `TODO` |
| AI Model / API / Method | EfficientNet-B0 (pretrained ImageNet, fine-tune, ONNX) 30 kelas; Gemini API |
| Peran AI dalam Produk | Klasifikasi tulisan aksara Bali dari kanvas; penjelasan kesalahan; dialog narator |
| Dataset / Data Source | Kaggle `wildanfatahh22/aksara-bali` (lisensi Unknown); data kanvas milik tim (`TODO`, setelah P1.1) |
| Open-source Libraries | Lihat `web/package.json`, `ai/requirements.txt` |
| Template / Boilerplate | `TODO` (mis. `create-next-app`) |
| AI Coding Assistant | `TODO: sebutkan semua tool yang dipakai` |
| Pre-existing Components | Seluruh basis kode di commit `52dc81d` (JOINTS UGM 2026). Baru untuk DigiFest: fokus Bali, perbaikan konten mock, deploy AI, tutor kesalahan, evaluasi canvas, kalibrasi, dokumentasi |
| Third-party Assets / Credits | Google Noto Sans Balinese; NusaAksara (rujukan); aset gambar/audio `TODO` |

---

## 7. Daftar Tugas Teknis (urut kerja)

| # | Tugas | Tahap | Perkiraan | Bergantung |
|---|---|---|---|---|
| 1 | Tag baseline + branch `digifest` | P0.1 | kecil | — |
| 2 | Audit secret riwayat git | P0.2 | kecil | — |
| 3 | Perbaiki / sembunyikan halaman mock | P0.3 | sedang | — |
| 4 | Persempit UI ke Bali, sembunyikan hardware | P0.4 | sedang | — |
| 5 | Deploy AI (A atau B) + uji parity/latensi | P0.5 | besar | — |
| 6 | Akun demo, `.env.example`, README, disclosure | P0.6 | sedang | 3–5 |
| 7 | Proposal PDF + tag `v1.0-submission` | P0.6 | sedang | 6 |
| 8 | Kumpulkan test set canvas + evaluasi jujur | P1.1 | besar | 4 |
| 9 | Kalibrasi confidence | P1.2 | sedang | 8 |
| 10 | Simpan progres ke Supabase | P1.3 | sedang | 3 |
| 11 | Tutor kesalahan (A3) | P2 | sedang | 8 (confusion matrix) |
| 12 | Izin dataset | P1.4 | paralel | — |
| 13 | Persiapan finalis: video demo, `v2.0-final` | Tahap 2 | sedang | semua |

> Estimasi "kecil/sedang/besar" bersifat kasar dan perlu disesuaikan dengan kapasitas tim serta tenggat resmi.

## 8. Checklist Verifikasi Teknis (latihan untuk finalis)

Juri dapat meminta (Panduan hal. 9). Siapkan jawaban:
- [ ] Tunjukkan kode yang memanggil AI → `web/src/lib/onnx/onnx-classifier.ts` + sesi ONNX.
- [ ] Mengapa EfficientNet-B0? → leaderboard di `ai/deployment/models/bali/evaluation.json` (Macro-F1 0,994 vs ResNet-18 0,982 vs MobileNetV3 0,940 vs CNN 0,291; seleksi, bukan test).
- [ ] Jalankan dengan input baru → latih dengan beberapa tulisan acak sebelum hari H.
- [ ] Jika API/AI gagal? → error 503 terlihat; Tutor fallback `rule_based`; narator fallback `deterministic_lore`.
- [ ] Data apa yang dikirim ke model & privasi → sesuai opsi deploy.
- [ ] Bagian lama vs baru → tag baseline, `git diff joints-2026-final..v2.0-final --stat`.

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Konten mock terdeteksi juri | P0.3 diselesaikan paling awal |
| Backend AI mati saat penjurian | Opsi A (tanpa server) atau B dengan pemantauan |
| Akurasi canvas rendah | P1.1 lebih awal, fine-tune dengan data canvas, laporkan jujur |
| Lisensi dataset | P1.4 + disclosure transparan |
| Kuota Gemini habis | Fallback tetap + batasi panggilan + simpan cache hasil |
| Secret bocor di riwayat git | P0.2 sebelum repo publik/dibagikan |
| Terlalu banyak scope | Ikuti pembekuan di Main Context §3 |

