# Handoff AI — Model Terpilih, Evaluasi, dan Integrasi Canvas

**Diperbarui:** 16 Oktober 2026  
**Pembaca:** engineer frontend/backend dan AIoT Aksantara  
**Status:** classifier eksperimen privat sudah terintegrasi ke backend Python; bukan model produksi atau validator kualitas tulisan.

## 1. Ringkasan keputusan

- Backend menggunakan **tiga specialist ONNX FP32**, satu untuk setiap aksara yang dipilih siswa. Tidak perlu training ulang untuk menjalankan aplikasi lokal.
- Champion dipilih berdasarkan **selection Macro-F1** pada turnamen kandidat. Model terbaik dipulihkan sebelum evaluasi dan ekspor.
- Kandidat yang tercatat dalam leaderboard deployment: EfficientNet-B0, ResNet-18, MobileNetV3-Small, dan Custom CNN-4Layer. Hasil kandidat yang kalah tetap tersedia dalam `evaluation.json`.
- Model Combined 174 kelas dan ekspor INT8 merupakan artefak eksperimen, **bukan model yang sedang dipanggil backend**. Jangan mengganti specialist dengan artefak tersebut hanya berdasarkan nama file atau ukuran.
- Bentuk deployment yang tersedia saat ini adalah **ONNX Runtime CPU di Python**, bukan ONNX Runtime Web di browser. FP32 adalah format paket deployment yang dipilih; dokumen ini tidak mengklaim FP32 selalu lebih baik daripada INT8 atau specialist selalu lebih unggul daripada Combined.

## 2. Hasil model terpilih

Semua angka kualitas berikut berasal dari **selection partition**, bukan frozen test. Jumlah sampel merujuk pada ringkasan eksperimen di [README](../README.md#notebook-interaktif-modular-jupyter--colab); metrik dan epoch berasal dari evaluasi deployment masing-masing aksara.

| Aksara | Champion | Kelas | Sampel selection | Macro-F1 | Top-1 | Top-3 | Minimum recall kelas | Epoch terbaik / dijalankan |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Sunda | EfficientNet-B0 | 30 | 180 | 100,00% | 100,00% | 100,00% | 100,00% | 9 / 16 |
| Lontara | ResNet-18 | 114 | 990 | 99,82% | 99,80% | 99,80% | 90,00% | 11 / 18 |
| Bali | EfficientNet-B0 | 30 | 167 | 99,37% | 99,40% | 99,40% | 80,00% | 14 / 21 |

Training tercatat memakai maksimum 50 epoch, early stopping patience 7, dan selection metric `macro_f1`. Metadata menyatakan checkpoint historis tidak dimasukkan ke turnamen. Run yang dipakai:

| Aksara | Run ID | Sumber hasil |
|---|---|---|
| Sunda | `seed42-1791988951125369183` | [evaluation.json](../ai/deployment/models/sunda/evaluation.json) |
| Lontara | `seed42-1791972512454400349` | [evaluation.json](../ai/deployment/models/lontara/evaluation.json) |
| Bali | `seed42-1791978654289139796` | [evaluation.json](../ai/deployment/models/bali/evaluation.json) |

Contoh kelas dengan recall terendah yang tercatat: Lontara `Nya` dan `Su` masing-masing 0,9 dari support 10; Bali `aksara swalalita khakantia` 0,8 dari support 5. Support kecil perlu diperhatikan saat membaca persentase.

### Ukuran dan latensi ekspor

Angka berikut adalah **benchmark CPU tersimpan dari eksperimen ekspor**, bukan pengukuran ulang di laptop pembaca, bukan browser/WASM, dan bukan latensi end-to-end aplikasi.

| Aksara | Ukuran FP32 (MiB) | p95 FP32 (ms) | Ukuran INT8 (MiB) | p95 INT8 (ms) |
|---|---:|---:|---:|---:|
| Sunda | 15,42 | 5,75 | 4,61 | 25,10 |
| Lontara | 42,85 | 14,47 | 10,83 | 15,23 |
| Bali | 15,42 | 7,46 | 4,61 | 28,57 |

Dalam hasil tersimpan ini, INT8 lebih kecil tetapi tidak lebih cepat. Untuk FP32 gunakan field `fp32_size_mb` dan `fp32_latency_p95_ms`; field generik `size_mb` dan `latency_p95_ms` pada ketiga evaluasi tersebut memuat angka INT8. Walaupun field bernama `*_mb`, angka ukuran dilaporkan dalam MiB.

Ukuran FP32 tersebut belum memenuhi target ≤15 MiB per aksara untuk rancangan browser. Angka CPU di atas juga tidak membuktikan target warm end-to-end p95 <50 ms.

## 3. Sumber artefak yang harus digunakan

Paket aktif berada di `ai/deployment/models/<aksara>/`:

| Berkas | Fungsi |
|---|---|
| `model.onnx` | Bobot FP32 yang dimuat backend. |
| `manifest.json` | Arsitektur, jumlah kelas, ukuran byte, SHA-256, preprocessing, identitas training, dan status rilis. |
| `labels.json` | Mapping indeks output ke ID dan label sumber; bukan mapping Unicode yang sudah disahkan. |
| `evaluation.json` | Champion, leaderboard kandidat, epoch, metrik, benchmark ekspor, dan contoh kelas kritis. |

Manifest: [Sunda](../ai/deployment/models/sunda/manifest.json), [Lontara](../ai/deployment/models/lontara/manifest.json), [Bali](../ai/deployment/models/bali/manifest.json).

Backend memvalidasi metadata, ukuran/checksum model, kontrak preprocessing, dan bentuk input/output saat memuat aset. **Mengganti model wajib disertai label, manifest, dan evaluasi yang cocok**, bukan hanya menimpa `.onnx`.

Jangan memakai `ai/runs/final_tournament_summary.json` sebagai sumber terbaru: saat diperiksa, file lokal itu hanya memuat hasil Sunda lama dengan Macro-F1 99,44%. Dokumen `docs/plans/` dan log [usage.md](usage.md) juga mengandung hasil historis; gunakan paket deployment untuk menentukan model aktif. Path `/content/...` dalam evaluasi adalah lokasi eksperimen Colab, bukan path yang perlu dibuat ulang di laptop.

## 4. Kontrak inference yang aktif

Alur aplikasi: canvas PNG → `evaluateGlyph()` → Next.js `POST /api/ai/classify` → Python `POST /predict` → specialist sesuai `aksaraId`.

Rujukan implementasi:
- [Adapter frontend](../web/src/lib/onnx/onnx-classifier.ts).
- [Proxy Next.js](../web/src/app/api/ai/classify/route.ts).
- [Backend FastAPI](../ai/deployment/server.py).
- [Loader model](../ai/deployment/runtime.py).
- [Preprocessing canonical](../ai/preprocess.py).

### Citra dan tensor

- Frontend mengirim PNG data URL yang hanya berisi goresan, tanpa grid atau referensi DOM. Tinta hitam di atas latar putih.
- Python menjalankan `preprocess_image(image, 128)`: canonicalization, crop seluruh komponen foreground, lalu resize. Otsu dipakai untuk foreground/crop; input jaringan tetap grayscale, bukan citra biner.
- Tensor float32 NCHW **`[1, 3, 128, 128]`**, input `input`, output `logits`.
- Normalisasi ImageNet: mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]` setelah pembagian intensitas dengan 255. Detail lengkap terdapat di manifest dan `ai/preprocess.py`.
- Urutan goresan tidak dipakai untuk klasifikasi. Jangan menambahkan preprocessing 64×64 alternatif di browser.

### Request dari frontend

```typescript
interface ClassifyRequest {
  aksaraId: 'sunda' | 'lontara' | 'bali';
  karakterSlug: string; // 1–128 karakter
  image: string; // PNG data URL
  strokes?: unknown; // Diabaikan oleh classifier
  canvasWidth?: number;
  canvasHeight?: number;
}
```

Batas citra: maksimal 4 MiB decoded, sisi maksimal 2048 piksel, total maksimal 1.048.576 piksel. Dimensi opsional harus finite, positif, dan ≤2048. Proxy membatasi request JSON 6 MiB dan timeout layanan 30 detik; timeout ini bukan klaim latensi inference.

### Arti hasil untuk UI

| Field | Arti / batas penggunaan |
|---|---|
| `predictedSymbol` | Label sumber mentah, bukan simbol Unicode terverifikasi. |
| `confidence` | Probabilitas softmax top-1 pada rentang 0–1, belum terkalibrasi. |
| `top3` | Tiga objek berisi `labelId`, `sourceLabel`, dan `probability`. |
| `score` | Persentase probabilitas target jika satu label cocok persis secara case-insensitive; jika tidak, persentase probabilitas top-1. Bukan nilai kualitas tulisan. |
| `targetSupported` | Apakah target memiliki satu kecocokan label sumber. Jangan menafsirkan skor sebagai keberhasilan target jika `false`. |
| `status` | Selalu `perlu_review` pada kontrak eksperimen ini. |
| `modelSource` / `modelId` | `onnx_backend` / SHA-256 model. |
| `latencyMs` | Latensi layanan Python, bukan total browser/network/render. |
| `mappingVerified` / `probabilitiesCalibrated` | Keduanya `false`. |
| `kriteria` / `ringkasan` | Array kriteria kosong; ringkasan menjelaskan klasifikasi dan keterbatasannya. |

Target Bali `ka` belum otomatis cocok dengan `aksara wyajana ka`. Label seperti Lontara `Ke` dan `Ke_`, serta Sunda `ae` dan `e`, tidak boleh disamakan tanpa verifikasi. Inventaris model tidak mencakup seluruh karakter/diakritik yang dapat ditampilkan materi web.

Hasil eksperimen tidak boleh otomatis dijadikan mastery, XP, status tulisan benar, atau validasi topologi diakritik. Kanvas kosong/PNG rusak menghasilkan 400, request tidak valid 422, layanan/aset tidak tersedia atau respons tidak sesuai kontrak 503. Tampilkan error; jangan menggantinya dengan skor acak atau kelulusan otomatis.

## 5. Menjalankan lokal

Dari root repositori, terminal pertama:

```bash
python -m pip install -r ai/deployment/requirements.txt
python -m uvicorn ai.deployment.server:app --host 127.0.0.1 --port 8000
```

Terminal kedua:

```bash
npm --prefix web ci
npm --prefix web run dev
```

Konfigurasi opsional di `web/.env.local`:

```env
AI_CLASSIFIER_URL=http://127.0.0.1:8000
```

Variabel ini **server-only**, jangan gunakan awalan `NEXT_PUBLIC_`. Tanpa konfigurasi, proxy menggunakan alamat lokal tersebut. Periksa `GET http://127.0.0.1:8000/health`: 200 hanya jika ketiga specialist siap; jika tidak, readiness 503.

Jika Next.js di-host terpisah, `127.0.0.1` menunjuk host Next.js, bukan laptop AIoT engineer. Backend harus tersedia dari host Next.js dan `AI_CLASSIFIER_URL` diatur sesuai alamatnya. Ini kebutuhan konektivitas, bukan izin untuk memublikasikan bobot atau dataset.

### Bukti smoke saat audit 16 Oktober 2026

Aplikasi FastAPI dijalankan melalui `TestClient` dengan lifespan startup dan model ONNX lokal asli:
- `/health` mengembalikan 200; specialist Sunda, Lontara, dan Bali siap.
- `/predict` untuk Sunda dengan PNG goresan sintetis mengembalikan 200, `modelSource: onnx_backend`, top-3, dan `status: perlu_review`.

Smoke ini membuktikan pemuatan model dan inference backend, **bukan akurasi terhadap tulisan siswa**. Pada audit tersebut tidak dilakukan verifikasi ulang browser end-to-end atau perangkat IoT fisik. Bukti pengujian historis lain dicatat terpisah dalam [usage.md](usage.md).

## 6. Batas klaim dan pekerjaan yang masih memerlukan validasi

- Selection Macro-F1 tidak sama dengan akurasi frozen test, generalisasi ke penulis baru, atau kualitas tulisan tangan di aplikasi.
- Model ini classifier karakter, bukan pemeriksa stroke order, geometri, posisi diakritik, atau paleografi lengkap.
- Dataset classifier adalah `datasets/canvas_classifier/`. NusaAksara berisi citra baris naskah; jangan menyebutnya otomatis sebagai dataset kelas karakter atau checkpoint pretrained model ini.
- Mapping Unicode/target kurikulum, kalibrasi probabilitas, dan evaluasi tulisan canvas nyata masih memerlukan validasi.
- Izin publikasi dataset/model belum diselesaikan. Manifest menyatakan `private-experiment`; keberadaan file dalam Git tidak membuktikan izin rilis publik.
- Benchmark browser/WASM, batas ukuran, latency end-to-end, dan frozen test bukan gate yang sudah terbukti hanya karena ONNX berhasil diekspor atau backend berjalan.

## 7. Scope pelestarian dan pembagian pekerjaan

**Kesepakatan tim, 16 Oktober 2026:** pelestarian naskah memakai transliterasi manual oleh siswa, kemudian diperhatikan, ditinjau, dan dievaluasi guru/ahli aksara. **Tidak diperlukan OCR atau AI transliteration.**

TODO OCR pada `web/src/app/api/ai/transcribe-manuscript/route.ts` adalah sisa rancangan lama, bukan tanggungan model AIoT. Endpoint tersebut masih mengembalikan contoh hardcoded dan tidak memproses gambar; jangan menyajikannya sebagai OCR nyata. Pengumpulan jawaban dan review guru merupakan kebutuhan frontend/backend yang harus disesuaikan, bukan dinyatakan sudah selesai oleh dokumen ini.

Fokus AIoT engineer: classifier ONNX canvas dan integrasi ESP32/RFID/Web Serial. Dokumen ini tidak menyatakan integrasi hardware sudah selesai.

## 8. Catatan untuk penerima handoff

- Mulai dari dokumen ini dan paket `ai/deployment/models/`; tidak perlu menjalankan notebook training untuk integrasi web lokal.
- Bagian awal [AI_IOT_HANDOVER.md](../web/AI_IOT_HANDOVER.md) masih menyebut model browser di `public/models`, ukuran 64×64/224×224, dan helper `preprocessCanvasForOnnx()` yang tidak tersedia pada adapter aktif. Gunakan kontrak backend di atas untuk implementasi saat ini.
- TODO `/api/evaluasi-goresan` di panel evaluasi juga merupakan komentar lama; endpoint aktif adalah `/api/ai/classify`.
- Ringkasan ini ditambahkan sebagai dokumentasi, tanpa mengganti model, menjalankan ulang training, atau mengubah kode aplikasi. File baru perlu masuk commit dan push sebelum tersedia pada clone teman; pembuatan dokumen lokal tidak otomatis memublikasikannya.
