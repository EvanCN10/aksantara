# Panduan Penempatan Model AI (NusaAksara ONNX)

Folder ini disiapkan khusus untuk file model Machine Learning / Deep Learning yang akan di-serve langsung di sisi client (browser) menggunakan **ONNX Runtime Web**, ataupun referensi model serverless.

---

## 1. Lokasi File Model

Letakkan file model yang telah di-export ke format ONNX di folder ini:
```text
web/public/models/nusaaksara_trinitas.onnx
```

*(Opsional: Jika menggunakan per-aksara)*:
- `web/public/models/lontara_classifier.onnx`
- `web/public/models/sunda_classifier.onnx`
- `web/public/models/bali_classifier.onnx`

---

## 2. Spesifikasi Input & Output Model

### A. Input Tensor
- **Nama Input Layer**: `input` atau `pixel_values`
- **Dimensi Standar**:
  - **Opsi Grayscale (Rekomendasi NusaAksara ACL 2025)**: `[1, 1, 64, 64]` (B x C x H x W)
  - **Opsi RGB (ResNet-18 / MobileNetV3)**: `[1, 3, 224, 224]` (B x C x H x W)
- **Data Type**: `Float32`
- **Normalisasi**: Nilai piksel dalam rentang `[0.0, 1.0]`, di mana `1.0` mewakili tinta goresan (*stroke*) dan `0.0` mewakili latar belakang kanvas. Helper normalisasi otomatis telah tersedia di `web/src/lib/onnx/onnx-classifier.ts` (`preprocessCanvasForOnnx`).

### B. Output Tensor
- **Nama Output Layer**: `logits` atau `probabilities`
- **Dimensi**: `[1, NUM_CLASSES]`
- **Aktivasi**: Logits atau Softmax (rentang nilai 0.0 - 1.0 per kelas).

---

## 3. Pemetaan Label Kelas (`labels.json`)

Simpan daftar nama label kelas di:
```text
web/public/models/labels.json
```

Contoh format:
```json
[
  "ka", "ga", "nga", "pa", "ba", "ma", "ta", "da", "na",
  "ca", "ja", "nya", "ya", "ra", "la", "wa", "sa", "ha"
]
```

---

## 4. Opsi Alternatif: Microservice / API Eksternal

Jika Anda memilih menjalankan model via FastAPI / PyTorch di server terpisah daripada ONNX browser:
1. Jalankan server API Anda (misal di `http://localhost:8000`).
2. Masukkan URL endpoint di `web/.env.local`:
   ```env
   NEXT_PUBLIC_AI_CLASSIFIER_URL=http://localhost:8000
   ```
3. Endpoint `/api/ai/classify` pada Next.js akan otomatis meneruskan snapshot citra canvas ke server Anda.
