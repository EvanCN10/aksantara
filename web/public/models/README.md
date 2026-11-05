# Model latihan NusaAksara di browser

Studio `/latihan/web/{lontara,sunda,bali}/{karakter}` memakai ONNX Runtime Web 1.22.0 (WASM, satu thread). Model dimuat saat evaluasi pertama, satu session per aksara per tab; tidak memerlukan FastAPI untuk studio.

## Menyiapkan aset

Dari `web/`:

```sh
npm install
npm run provision:onnx
npm run dev
```

Provisioning menyalin model dan labels dari `ai/deployment/models/{script}/` ke `public/models/{script}/`, serta runtime versi yang sama dari `ai/artifacts/runtime/` ke `public/wasm/`. Model ONNX dan WASM biner diabaikan Git. Jalankan provisioning juga sebelum build/deploy; checkout kode saja tidak menyediakan biner tersebut. Asset sumber harus tersedia di lingkungan build.

## Kontrak

- Input `input`: float32 `[1, 3, 128, 128]`, grayscale direplikasi ke RGB dan dinormalisasi ImageNet.
- Preprocessing `canvas-gray-v1`: alpha di atas putih, koreksi polaritas, bounding box Otsu seluruh komponen, padding 1.4×, bilinear; masukan jaringan tetap grayscale, bukan citra biner.
- Output `logits`: `[1, jumlah_kelas]`; stable softmax di browser.
- Label persis dan urutan `class_id` berasal dari `labels.json`; hash model diperiksa terhadap manifest deployment.
- Status sesuai target membutuhkan top-1 sama dengan target dan probabilitas target minimal 85%. Probabilitas kelas bukan penilaian kualitas paleografi.
- Evaluasi variasi vokal Lontara (suku kata) menerapkan Contextual Base-Consonant Prior Suppression: logit konsonan dasar induk dimasking ke $-\infty$ agar probabilitas tidak diserap bentuk dasar. Bila konsonan dasar terdeteksi tanpa tanda vokal, diagnostik cerdas memandu siswa menambahkan imbuhan diakritik yang sesuai.
- Single-tap dot pada kanvas dikalibrasi dengan radius minimal $\approx 12$–$14$ px agar tanda diakritik titik vokal (*titi' riaseq*, *ulu*, dsb.) bertahan padat pada tensor $128 \times 128$.
- Katalog latihan memakai seluruh kelas model dengan Unicode/font, bukan daftar diakritik pengajaran umum. Mapping terpusat di `shared/aksara-classifier.json` dan adaptor `model-catalog.ts`.

## Proxy pengembangan yang tetap tersedia

`evaluateGlyph(input)` tanpa ImageData tetap memakai `/api/ai/classify` dan FastAPI sesuai konfigurasi server yang sudah ada. Cerita mini canvas masih memakai jalur ini. Studio selalu meneruskan ImageData; kegagalan pemuatan browser ditampilkan sebagai error, bukan dialihkan diam-diam ke backend. Tidak ada fallback otomatis karena koneksi lambat.

Runtime dan model disajikan dari origin aplikasi; tidak memakai CDN atau header COOP/COEP. Model yang sudah dimuat dalam session tab aktif dapat dipakai tanpa jaringan. Cold start offline, reload offline dan cache permanen tidak dijamin; migrasi ini tidak memasang service worker.
