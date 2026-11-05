# Handoff AI — Model Terpilih, Evaluasi, dan Integrasi Canvas

**Diperbarui:** 16 Oktober 2026  
**Pembaca:** engineer frontend/backend dan AIoT Aksantara  
**Status:** classifier eksperimen privat terintegrasi ke studio browser (ONNX Runtime Web); proxy Python dipertahankan untuk cerita mini canvas. Bukan pengesahan produksi atau validator kualitas tulisan.

## 1. Ringkasan keputusan

- Konfigurasi spesialis aktif per 16 Oktober 2026: **Lontara INT8** (10,83 MiB / 11.360.235 bytes, ResNet-18) yang menghemat 74,7% ukuran unduhan browser tanpa perubahan akurasi Top-1 (99,80%), serta **Sunda FP32** (15,42 MiB, EfficientNet-B0) dan **Bali FP32** (15,42 MiB, EfficientNet-B0). Kuantisasi INT8 Sunda dan Bali dilarang digunakan karena mengalami degradasi akurasi berat (34% dan 16%).
- Champion dipilih berdasarkan **selection Macro-F1** pada turnamen kandidat. Model terbaik dipulihkan sebelum evaluasi dan ekspor.
- Kandidat yang tercatat dalam leaderboard deployment: EfficientNet-B0, ResNet-18, MobileNetV3-Small, dan Custom CNN-4Layer. Hasil kandidat yang kalah tetap tersedia dalam `evaluation.json`.
- Model Combined 174 kelas tetap menjadi artefak eksperimen, bukan model deployment aktif.
- Studio latihan memakai **ONNX Runtime Web 1.22.0 (WASM satu thread)**; FastAPI/ONNX Runtime CPU tetap tersedia untuk cerita mini canvas dan pemanggil tanpa ImageData.

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
| `model.onnx` | Bobot model aktif (Lontara: INT8 11.360.235 bytes; Sunda & Bali: FP32 16.173.918 bytes) untuk provisioning browser dan proxy. |
| `manifest.json` | Arsitektur, jumlah kelas, ukuran byte, SHA-256, preprocessing, identitas training, dan status rilis. |
| `labels.json` | Mapping indeks output ke ID dan label sumber; bukan mapping Unicode yang sudah disahkan. |
| `evaluation.json` | Champion, leaderboard kandidat, epoch, metrik, benchmark ekspor, dan contoh kelas kritis. |

Manifest: [Sunda](../ai/deployment/models/sunda/manifest.json), [Lontara](../ai/deployment/models/lontara/manifest.json), [Bali](../ai/deployment/models/bali/manifest.json).

Browser memvalidasi urutan/identitas label, ukuran/SHA-256 model, nama input/output dan bentuk logits. Backend juga memvalidasi metadata/preprocessing saat memuat aset. **Mengganti model wajib disertai label, manifest, dan evaluasi yang cocok**, bukan hanya menimpa `.onnx`. Perbarui mapping Unicode katalog agar tetap mencakup tepat seluruh kelas, lalu ulangi provisioning dan build karena label/manifest juga diimpor sebagai data build.

Jangan memakai `ai/runs/final_tournament_summary.json` sebagai sumber terbaru: saat diperiksa, file lokal itu hanya memuat hasil Sunda lama dengan Macro-F1 99,44%. Dokumen `docs/plans/` dan log [usage.md](usage.md) juga mengandung hasil historis; gunakan paket deployment untuk menentukan model aktif. Path `/content/...` dalam evaluasi adalah lokasi eksperimen Colab, bukan path yang perlu dibuat ulang di laptop.

## 4. Kontrak inference yang aktif

Alur studio: snapshot ImageData goresan hitam di atas putih → `evaluateGlyph(input, imageData)` → preprocessing TypeScript → session ONNX Runtime Web → specialist sesuai `aksaraId`. Runtime/model dimuat lazy dari origin aplikasi, tanpa FastAPI. Pemanggil tanpa ImageData (termasuk cerita mini canvas) tetap memakai PNG → proxy Next.js → Python `/predict`. Kontrak request di bawah berlaku untuk jalur proxy tersebut.

Rujukan implementasi:
- [Adapter frontend](../web/src/lib/onnx/onnx-classifier.ts).
- [Classifier browser](../web/src/lib/onnx/browser-classifier.ts), [session manager](../web/src/lib/onnx/session-manager.ts), dan [preprocessing TypeScript](../web/src/lib/onnx/preprocess-canvas.ts).
- [Adaptor katalog model](../web/src/data/aksara/model-catalog.ts) dan [provisioning aset](../web/scripts/provision-onnx.mjs).
- [Proxy Next.js](../web/src/app/api/ai/classify/route.ts).
- [Backend FastAPI](../ai/deployment/server.py).
- [Loader model](../ai/deployment/runtime.py).
- [Preprocessing canonical](../ai/preprocess.py).

### Citra dan tensor

- DrawingCanvas menyiapkan snapshot goresan hitam di atas putih, tanpa grid atau referensi DOM. Studio mengambil ImageData dari snapshot tersebut tanpa roundtrip PNG; sisi snapshot dibatasi 1024 piksel.
- Studio menjalankan `preprocessImageData(imageData, 128)`; jalur proxy mengirim PNG data URL lalu Python menjalankan `preprocess_image(image, 128)`. Keduanya menggunakan crop seluruh komponen foreground dan resize canonical. Otsu hanya untuk foreground/crop; input jaringan tetap grayscale.
- Tensor float32 NCHW **`[1, 3, 128, 128]`**, input `input`, output `logits`.
- Normalisasi ImageNet: mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]` setelah pembagian intensitas dengan 255. Detail lengkap terdapat di manifest dan `ai/preprocess.py`.
- Urutan goresan tidak dipakai untuk klasifikasi. Jangan menambahkan preprocessing 64×64 alternatif di browser.

### Request proxy dari frontend (bukan transport studio)

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
| `score` | Persentase probabilitas target jika didukung; jika tidak, persentase probabilitas top-1. Bukan nilai kualitas tulisan. |
| `targetSupported` | Apakah slug kurikulum terdaftar pada target classifier di `shared/aksara-classifier.json`. |
| `status` | `'benar'` jika targetSupported bernilai true, prediksi top-1 sesuai target, dan probabilitas target ≥ 0,85; jika tidak, `'perlu_review'`. |
| `modelSource` / `modelId` | `onnx_web` pada studio, `onnx_backend` pada proxy / SHA-256 model. |
| `latencyMs` | Browser: preprocessing, pemuatan pertama bila diperlukan dan inference sebelum render. Proxy: latensi layanan Python. Bukan benchmark p95. |
| `mappingVerified` / `probabilitiesCalibrated` | Keduanya `false`. |
| `kriteria` / `ringkasan` | Array kriteria kosong; browser memakai ringkasan singkat sesuai/mismatch/kurang yakin, tanpa disclaimer teknis panjang. |

Pemetaan target kurikulum ke label model dan display name siswa dikelola terpusat pada `shared/aksara-classifier.json`. Ambang batas penerimaan `0.85` berlaku sebagai kebijakan produk sementara, bukan klaim akurasi hasil eksperimen.

Hasil eksperimen tidak otomatis menjadi mastery, XP, atau validasi topologi diakritik. Error browser ditampilkan langsung tanpa hasil palsu atau fallback otomatis ke backend; kanvas kosong ditolak sebelum model dimuat. Pada jalur HTTP proxy, PNG kosong/rusak menghasilkan 400, request tidak valid 422, layanan/aset tidak tersedia atau respons tidak sesuai kontrak 503.
## 5. Menjalankan lokal

### Studio browser — tidak membutuhkan FastAPI

Jalankan dari root repositori:

```bash
npm --prefix web ci
npm --prefix web run provision:onnx
npm --prefix web run dev
```

Sumber aset harus tersedia di `ai/deployment/models/{lontara,sunda,bali}/` dan `ai/artifacts/runtime/`. Provisioning menyalinnya ke `web/public/models/{script}/` dan `web/public/wasm/`. Biner ignored tidak tersedia dari checkout Git saja; jalankan provisioning juga sebelum production build/deploy. Gunakan runtime/model versi yang cocok; versi npm dipatok 1.22.0. Lihat [panduan aset](../web/public/models/README.md).

Masuk atau gunakan Tamu Siswa, lalu buka `/latihan/web/{script}`. Katalog tidak memuat model biner; session dibuat lazy pada evaluasi pertama dan dipakai ulang selama tab aktif. Retry tersedia setelah pemuatan gagal. WASM satu thread tidak membutuhkan COOP/COEP. Model yang sudah termuat dapat dievaluasi tanpa jaringan; cold start offline dan cache lintas reload tidak dijamin.

### Cerita mini canvas / pemanggil tanpa ImageData — membutuhkan proxy Python

Di terminal tambahan:

```bash
python -m pip install -r ai/deployment/requirements.txt
python -m uvicorn ai.deployment.server:app --host 127.0.0.1 --port 8000
```

Konfigurasi opsional di `web/.env.local`:

```env
AI_CLASSIFIER_URL=http://127.0.0.1:8000
```

Variabel ini **server-only**, jangan gunakan awalan `NEXT_PUBLIC_`. Tanpa konfigurasi, proxy menggunakan alamat lokal tersebut. Periksa `GET http://127.0.0.1:8000/health`: 200 hanya jika ketiga specialist siap; jika tidak, readiness 503.

Jika jalur proxy dipakai saat Next.js di-host terpisah, `127.0.0.1` menunjuk host Next.js, bukan laptop AIoT engineer. Backend harus tersedia dari host Next.js dan `AI_CLASSIFIER_URL` diatur sesuai alamatnya. Studio browser tidak mempunyai kebutuhan konektivitas Python tersebut. Aset public tetap memerlukan audit izin publikasi; keberhasilan provisioning/inference bukan izin distribusi bobot atau dataset.

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
- Panduan integrasi web, Web Serial hardware, dan Supabase dirangkum pada [INTEGRATION_HANDOFF.md](INTEGRATION_HANDOFF.md).
- Seluruh kontrak model dan pemetaan target merujuk pada dokumen ini serta `shared/aksara-classifier.json`.

## 9. Katalog latihan berbatas label model — 16 Oktober 2026

`web/src/data/aksara/model-catalog.ts` mengimpor label dan manifest deployment saat build. Katalog mengikuti urutan `class_id` dan menolak mapping hilang, ganda, label di luar model, slug glif ganda, atau jumlah kelas yang tidak cocok. Grid, kategori, pilihan, panel detail, tombol mulai dan progres katalog memakai daftar yang sama; state pilihan/filter di-reset lewat keyed component saat aksara berganti. Studio memakai adaptor yang sama untuk akses langsung dan navigasi berikutnya.

| Aksara | Kelas menurut labels/manifest | Cakupan |
|---|---:|---|
| Lontara | 114 | Semua kelas aktual, termasuk Mi dan gabungan vokal; bukan hasil perkalian semua konsonan × vokal. |
| Sunda | 30 | 23 konsonan (termasuk fa/qa/va/xa/za) dan 7 swara; ae dan e tidak digabung. |
| Bali | 30 | 18 wyajana dan 12 swalalita; tidak menambahkan pangangge mandiri yang bukan kelas model. |

Slug target lama dipertahankan. Bali `kha` dan `gha` yang sudah ada pada metadata pengajaran dipakai untuk khakantia/gagora; kelas baru lain memakai `kelas-<class_id>`. Metadata tambahan berada pada `MODEL_GLIF_DATA` di `trinitas.ts`, tanpa menghapus materi diakritik pengajaran global. Gabungan Lontara ditampilkan sebagai **Suku Kata**, dengan urutan string Unicode **aksara induk lalu tanda vokal**, termasuk tanda e yang secara visual dirender di depan. `getModelTrainingCatalog()` mengembalikan `readonly GlifData[]`; jangan kembali ke daftar pengajaran penuh untuk fallback studio.

### Bukti pemetaan Unicode

Lokasi dataset ditelusuri dari `datasets/README.md`: root `datasets/canvas_classifier/`, ditambah `relative_leaf_path` pada masing-masing label deployment. Agent melihat dua contoh citra dari setiap kelas (114 + 30 + 30) sebagai contact sheet di memori; citra swalalita 32×32 diperbesar nearest-neighbor untuk melihat bentuknya. Tidak ada citra dataset atau contact sheet baru yang disalin ke aset publik. Ini inspeksi sampel oleh AI, **bukan pengesahan ahli/manusia, audit seluruh citra, atau bukti generalisasi model**.

Rujukan karakter yang dibaca: [Unicode Buginese U+1A00–1A1F](https://www.unicode.org/charts/PDF/U1A00.pdf), [Unicode Sundanese U+1B80–1BBF](https://www.unicode.org/charts/PDF/U1B80.pdf), [Unicode Balinese U+1B00–1B7F](https://www.unicode.org/charts/PDF/U1B00.pdf). Bentuk referensi Unicode tidak membatasi variasi tulisan tangan/font.

- Lontara: contoh setiap keluarga menunjukkan e di kiri (U+1A19), i di atas (U+1A17), o di kanan (U+1A1A), dan u di bawah (U+1A18). Ke_ menunjukkan tanda pepet di atas (U+1A1B), bukan Ke dengan tanda di kiri. E/I/O/U memakai pembawa vokal A (U+1A15) dengan tanda terkait. Nka memakai NGKA (U+1A03), Nca memakai NYCA (U+1A0F); ejaan label sumber tetap persis.
- Sunda: ae cocok dengan LETTER AE (U+1B86, ditampilkan É); e cocok dengan LETTER E (U+1B88, pepet); eu U+1B89. Konsonan tambahan fa/qa/va/xa/za masing-masing U+1B96/U+1B8B/U+1B97/U+1B9F/U+1B90.
- Bali swalalita: ba kembang U+1B2A, calaca U+1B19, damadu U+1B25, gagora U+1B16, jhajera U+1B1B, khakantia U+1B14, narambat U+1B21, phakapal U+1B28, sasaga U+1B30, sasapa U+1B31, talatik U+1B1D, tatawa U+1B23. Tidak menyamakan swalalita dengan wyajana yang bunyinya berdekatan.

Contoh yang membedakan mapping (path relatif terhadap `datasets/canvas_classifier/`; identitas kelas lengkap ada pada `labels.json`):

| Aksara / class_id / source_label | Contoh citra yang dilihat |
|---|---|
| lontara / 16 / `E` | `lontara/aksara-lontara-fix/E/1712520709905.jpg` |
| lontara / 34 / `Ke` | `lontara/aksara-lontara-fix/Ke/IMG_20240404_125004.jpg` |
| lontara / 35 / `Ke_` | `lontara/aksara-lontara-fix/Ke_/IMG_20240404_124156.jpg` |
| lontara / 46 / `Mi` | `lontara/aksara-lontara-fix/Mi/1711867953387.jpg` |
| lontara / 67 / `Nka` | `lontara/aksara-lontara-fix/Nka/_storage_emulated_0_Android_data_com.miui.gallery_cache_SecurityShare_1709973669915.jpg` |
| sunda / 1 / `ae` | `sunda/dataset_gabung_fix/ae/ae_ae_ (90).jpg` |
| sunda / 5 / `e` | `sunda/dataset_gabung_fix/e/e_e_ (95).jpg` |
| sunda / 6 / `eu` | `sunda/dataset_gabung_fix/eu/eu_eu_97.jpg` |
| sunda / 20 / `qa` | `sunda/dataset_gabung_fix/qa/qa_qa_99.jpg` |
| sunda / 27 / `xa` | `sunda/dataset_gabung_fix/xa/xa_xa_97.jpg` |
| bali / 0 / `aksara swalalita ba kembang` | `bali/AKSARA SWALALITA ALL/aksara swalalita ba kembang/835.jpg` |
| bali / 1 / `aksara swalalita calaca` | `bali/AKSARA SWALALITA ALL/aksara swalalita calaca/699.jpg` |
| bali / 2 / `aksara swalalita damadu` | `bali/AKSARA SWALALITA ALL/aksara swalalita damadu/650.jpg` |
| bali / 3 / `aksara swalalita gagora` | `bali/AKSARA SWALALITA ALL/aksara swalalita gagora/97.jpg` |
| bali / 4 / `aksara swalalita jhajera` | `bali/AKSARA SWALALITA ALL/aksara swalalita jhajera/924.jpg` |
| bali / 5 / `aksara swalalita khakantia` | `bali/AKSARA SWALALITA ALL/aksara swalalita khakantia/980.jpg` |
| bali / 6 / `aksara swalalita narambat` | `bali/AKSARA SWALALITA ALL/aksara swalalita narambat/996.jpg` |
| bali / 7 / `aksara swalalita phakapal` | `bali/AKSARA SWALALITA ALL/aksara swalalita phakapal/995.jpg` |
| bali / 8 / `aksara swalalita sasaga` | `bali/AKSARA SWALALITA ALL/aksara swalalita sasaga/900.jpg` |
| bali / 9 / `aksara swalalita sasapa` | `bali/AKSARA SWALALITA ALL/aksara swalalita sasapa/800.jpg` |
| bali / 10 / `aksara swalalita talatik` | `bali/AKSARA SWALALITA ALL/aksara swalalita talatik/923.jpg` |
| bali / 11 / `aksara swalalita tatawa` | `bali/AKSARA SWALALITA ALL/aksara swalalita tatawa/982.jpg` |

Tidak ada kelas yang terblokir karena contoh/rujukan Unicode tidak tersedia. Flag hasil `mappingVerified` tetap `false`: inspeksi AI ini tidak mengubah manifest model atau menggantikan pengesahan paleografi manusia.

### Bukti integrasi — 16 Oktober 2026

Agent menjalankan typecheck dan production build Next.js Turbopack: lulus. Konfigurasi Next.js yang ada sudah melayani WASM; tidak diperlukan aturan loader webpack/Turbopack tambahan maupun COOP/COEP. MCP Next.js melaporkan `configErrors: []`, `sessionErrors: []`.

Browser aktual: Pa → Pa 99,9%; Ma pada target Pa → probabilitas target 0,5%, top Ma 97,4%, teks “Tulisan terbaca sebagai Ma, bukan Pa”; Mi → Mi 99,8%; Sunda Ka dan Bali Ka masing-masing 100%. Input memakai citra dataset nyata yang dimasukkan ke canvas setelah goresan mouse untuk mengaktifkan evaluasi. Seluruh inference memakai aset WASM/model lokal tanpa request `/api/ai/classify` atau port 8000; dua evaluasi Pa dalam session yang sama hanya memuat model satu kali. Reset mengembalikan tombol ke keadaan belum ada goresan.

Tambahan smoke: Sunda/Bali pada target Ga dengan citra Ka menampilkan “Tulisan terbaca sebagai Ka, bukan Ga” dan probabilitas target 0,0%. Setelah model Bali termuat, evaluasi ulang juga berhasil saat browser disetel offline. Ini tidak menjamin cold start offline atau cache lintas reload.

Adaptor dieksekusi dan label/order dibandingkan persis dengan deployment: 114/30/30, tanpa diakritik mandiri. Seluruh 174 URL studio diperiksa melalui request browser dan render HTML; ketiga katalog diinspeksi langsung dengan screenshot. Filter Suku Kata → Mi → studio → Mo, perpindahan katalog dan refresh diperiksa. URL diakritik unsupported pada ketiga aksara menampilkan ketidaktersediaan, tautan katalog dan nol canvas. Unicode Mi terlihat dengan tanda i di atas.

Seluruh 16 fixture RGBA/tensor yang tersedia (128/224) cocok dengan preprocessing TypeScript, selisih maksimum 0 (toleransi 1e-5). Ini bukan benchmark akurasi pengguna, validasi paleografi manusia, audit izin publikasi, atau pengujian fallback FastAPI ulang. Petunjuk provisioning/release ada di `web/public/models/README.md`; biner ignored harus tersedia sebelum build/deploy.


## 10. Audit model Google Drive & komparasi FP32 vs INT8 — 16 Oktober 2026

Akses langsung ke Google Drive pengguna dilakukan melalui Colab MCP Bridge (`ai/harness/run_colab_bridge.py`) yang terhubung langsung ke runtime Google Colab aktif dengan Google Drive ter-mount di `/content/drive/MyDrive/Colab Notebooks/dataset-joints-1/`.

### Hasil audit hash Google Drive vs lokal

Seluruh model ONNX dan ringkasan turnamen pada Google Drive diperiksa byte size, mtime, dan SHA-256 secara langsung melalui runtime Colab:

| Berkas di Google Drive | Ukuran (Bytes) | SHA-256 Google Drive | Kecocokan Lokal | Timestamp Ekspor Drive |
|---|---:|---|:---:|---|
| `onnx_exports/lontara/lontara-champion-int8.onnx` | 11.360.235 | `d35759c468c8976055fdd057ecb68327d5f452516bc371d453fb63f90d22e942` | **Identik 100%** | 2026-10-14 11:27:14 UTC |
| `onnx_exports/lontara/lontara-champion.onnx` (FP32) | 44.930.486 | `ffb1f68297e16bab1071098e48d0b85af89f0de0c21c29c8eb9c5599b9286ac6` | **Identik 100%** | 2026-10-14 11:27:06 UTC |
| `onnx_exports/sunda/sunda-champion-int8.onnx` | 4.830.289 | `cfc96f11c515142cc4ecb9ae4d7e51c1d8408a3c6d19280120067e608ab1cc4c` | **Identik 100%** | 2026-10-14 14:59:35 UTC |
| `onnx_exports/sunda/sunda-champion.onnx` (FP32) | 16.173.918 | `b68a249fe3b0596a5982565a363a2529c522343701c25279ee1a0e475070a339` | **Identik 100%** | 2026-10-14 14:59:22 UTC |
| `onnx_exports/bali/bali-champion-int8.onnx` | 4.830.289 | `8d5c74da7db15dff6827e2541908ca69c66bde5f1f8bd2697e2e2cc16721d9b1` | **Identik 100%** | 2026-10-14 12:07:56 UTC |
| `onnx_exports/bali/bali-champion.onnx` (FP32) | 16.173.918 | `39a0f325d5549a2d3906a75a10d1ff54ef83f2a772295b2d9f3c0282f7d81adc` | **Identik 100%** | 2026-10-14 12:07:43 UTC |
| `onnx_exports/combined/combined-champion-int8.onnx` | 11.391.984 | `2ad5d160142ed2e208f830e1872c720d1c070f458d4075dc2158269c6e878a3f` | **Identik 100%** | 2026-10-14 14:21:36 UTC |
| `onnx_exports/combined/combined-champion.onnx` | 45.053.609 | `3f1dee59acd1a9bfa04abeda25bb265d7ca530c66a8c23318c9a694e3b8c1372` | **Identik 100%** | 2026-10-14 14:20:48 UTC |

Karena hash file Drive identik dengan file lokal, hasil benchmark browser WASM yang telah diukur mencerminkan persis artefak di Google Drive.

### Hasil komparasi peramban (WASM ONNX Runtime Web 1.22.0)

Pengukuran dilakukan pada peramban Chromium 155 (Intel Core i7-8565U, 1 thread WASM) menggunakan seluruh data uji *selection partition* (1.337 sampel terverifikasi hash):

| Aksara | Sampel | Ukuran FP32 → INT8 | Akurasi FP32 → INT8 | Macro-F1 FP32 → INT8 | Latensi p95 FP32 → INT8 | Disagreements |
|---|---:|---:|---:|---:|---:|---:|
| **Lontara** | 990 | 42,85 MiB → 10,83 MiB (-74,7%) | 99,80% → 99,80% | 0,9982 → 0,9982 | 77,7 ms → 70,8 ms | **0** (identik 100%) |
| **Sunda** | 180 | 15,42 MiB → 4,61 MiB (-70,1%) | 100,00% → **34,44%** | 1,0000 → **0,2748** | 38,6 ms → 46,0 ms | **118** (rusak berat) |
| **Bali** | 167 | 15,42 MiB → 4,61 MiB (-70,1%) | 99,40% → **16,17%** | 0,9937 → **0,0813** | 42,8 ms → 50,4 ms | **140** (rusak berat) |

### Rekomendasi teknis
1. **Lontara INT8:** Layak digunakan sebagai pengganti FP32 karena menghemat 32 MiB ukuran unduhan dan memiliki akurasi Top-1 identik (0 disagreement pada 990 sampel). Satu sampel (`Nka`) mengalami penurunan confidence dari 87,5% ke 75,7% (bacaan tetap benar namun berada di bawah ambang acceptance 85%).
2. **Sunda & Bali INT8:** **Dilarang digunakan pada produksi/web.** Kuantisasi statis QDQ yang tersimpan di Google Drive mengalami keruntuhan akurasi ekstrem pada kedua aksara ini (akurasi anjlok ke 34% dan 16%). Tetap gunakan FP32 untuk Sunda dan Bali.

### Pelaksanaan migrasi Lontara ke INT8 (16 Oktober 2026)
Sesuai hasil audit hash dan benchmark WASM di atas, berkas `ai/deployment/models/lontara/model.onnx` telah diperbarui ke versi INT8 (`11.360.235` bytes, SHA-256 `d35759c468c8976055fdd057ecb68327d5f452516bc371d453fb63f90d22e942`), manifest `format: int8`, dan aset telah direprovision ke `web/public/models/lontara/model.onnx`.

Uji smoke peramban setelah penggantian:
- Pa (input Pa): `99,9%` ("Benar! Bentuk sesuai target")
- Pa (input Ma): `0,4%` ("Tulisan terbaca sebagai Ma, bukan Pa. Coba perbaiki bentuknya.")
- Mi (suku kata gabungan): `99,8%` ("Benar! Bentuk sesuai target")
- Respons ukuran jaringan model Lontara: `11.360.235` bytes (berkurang dari `44.930.486` bytes).

## 11. Penyesuaian Inferensi Variasi Vokal: Contextual Base-Consonant Prior Suppression, Diacritic Diagnostic & Single-Tap Dot Calibration — 16 Oktober 2026

### 1. Masalah Bias Konsonan Dasar & Kehilangan Fitur Titik
Pada latihan glif variasi vokal Lontara (seperti *Bi* / `kelas-3` yang merupakan konsonan *Ba* dengan tanda diakritik titik atas *titi' riaseq*), model klasifikasi 114-kelas sebelumnya mengalami bias berat ke konsonan dasar induk (*Ba* diprediksi 99,4%, sedangkan *Bi* tertekan hingga 0,0%). Hal ini terjadi karena 90%+ area goresan variasi vokal didominasi oleh bentuk konsonan dasar.

Selain itu, goresan satu titik (*single-tap dot*) pada kuas kanvas sebelumnya hanya menghasilkan radius 2,1 px (diameter $\approx 4$ px) pada kanvas 600 px. Saat diproses ke tensor masukan $128 \times 128$, titik berdiameter 4 px tereduksi menjadi $<1$ px dan memudar akibat interpolasi bilinear, sehingga fitur konvolusional melewatkannya.

### 2. Solusi Rekayasa Inferensi & Praproses
1. **Pemetaan Deterministik Suku Kata (`LONTARA_SYLLABLE_BASE`):**
   Kamus 91 variasi vokal Lontara dipetakan secara deterministik ke 23 konsonan dasarnya pada `web/src/lib/onnx/onnx-classifier.ts` dan `ai/deployment/runtime.py`. Helper `getBaseConsonantSourceLabel(aksaraId, targetSourceLabel)` memastikan skrip non-Lontara (Sunda/Bali yang berbasis kelas mandiri) tidak terpengaruh (mengembalikan `null`).

2. **Contextual Base-Consonant Prior Suppression:**
   Saat target klasifikasi adalah variasi vokal (memiliki konsonan dasar induk), indeks konsonan dasar tersebut disaring dari persaingan probabilitas dengan menetapkan logitnya ke $-\infty$ (`maskIndex`) sebelum softmax:
   - Probabilitas konsonan dasar menjadi 0,0%.
   - Massa probabilitas teralokasi secara proporsional ke kandidat variasi vokal yang relevan (*Bi*, *Be*, *Bu*, dsb.).
   - Metrik `top3` dan `score` dihitung dari distribusi terkendala ini.
   - Ketika target adalah konsonan dasar itu sendiri (misal latihan *Ba*), tidak ada pemblokiran logit (`maskIndex = -1`).

3. **Diagnostik Pedagogis Cerdas untuk Diakritik Tertinggal:**
   Jika siswa menggambar konsonan dasar *Ba* tanpa tanda titik vokal *i* pada latihan *Bi*:
   - Terdeteksi saat probabilitas mentah model mengenali konsonan dasar dengan keyakinan $\ge 50\%$, namun distribusi terkendala target variasi vokal belum mencapai ambang batas acceptance $85\%$.
   - Sistem tidak menampilkan pesan kesalahan acak, melainkan memberikan bimbingan konstruktif:
     `"Bentuk konsonan dasar ${baseName} sudah terbaca dengan baik, namun tanda diakritik vokal untuk ${targetName} belum terdeteksi. Tambahkan tanda titik/imbuhan vokal yang sesuai!"`

4. **Kalibrasi Radius Single-Tap Dot pada Kanvas:**
   Pada `web/src/components/canvas/drawing-canvas.tsx`, rumus radius titik tunggal (`stroke.length === 1`) dan immediate dot diperbarui menjadi:
   `const radius = Math.max((baseLineWidth * (pt.pressure || 1.0)) * 0.75, baseLineWidth * 0.85);`
   Kuas standar (`baseLineWidth = 7`) kini menghasilkan diameter $\approx 11,9$–$14$ px pada kanvas, yang bertahan menjadi $3$–$4$ piksel padat pada tensor input $128 \times 128$.

### 3. Hasil Pengujian & Bukti Verifikasi
- **Typecheck TypeScript (`pnpm --filter web typecheck`):** Lolos 0 error.
- **Unit Test Server (`ai/deployment/test_server.py`):** 15 tests lolos (termasuk verifikasi masking variasi vokal, diagnostik diakritik tertinggal, dan non-regresi konsonan dasar).
- **Uji Inferensi Lontara Bi:**
  - Target *Bi* dengan goresan dasar *Ba* saja: diagnostik missing diacritic terpicu secara akurat.
  - Target *Bi* dengan tanda titik: berhasil lulus dengan status `benar` dan skor $\ge 85\%$.
  - Target *Ba*: konsonan dasar dievaluasi normal tanpa penekanan logit dengan skor $99,5\%$.
