# AKSANTARA - Panduan Integrasi Teknis AI, IoT & Database
### Handover Guide untuk AI Engineer & Embedded Hardware Engineer
> **Kompetisi:** Hackathon JOINTS UGM 2026 - Tema: Education  
> **Target:** Grand Final FMIPA UGM (1 November 2026)  
> **Status AI Canvas:** Eksperimen privat dengan specialist FP32 ONNX lokal; perlu review manusia, bukan penilaian kualitas tulisan atau kesiapan produksi.

---

## 1. Ringkasan Eksekutif & Struktur Sistem

Aksantara dibangun di atas arsitektur **4 Pilar AI** dan **2 Mode Penggunaan (Web & Hardware)** yang berfokus pada **Trinitas Aksara Nusantara (Lontara, Sunda, Bali)**:

1. **Pilar 1 - Precision AI Writing Coach (Web Mode):** Evaluasi goresan tulisan tangan siswa pada *Universal Web Canvas* berbasis model klasifikasi bentuk (*Shape & Diacritic Topology Classifier*).
2. **Pilar 2 - Trinitas Aksara Nusantara (Katalog & Standar):** Kurikulum terstruktur paleografi aksara Lontara (sudut geometris), Sunda (modular ngalagena), dan Bali (kurvalinier).
3. **Pilar 3 - Gamified Phygital & Narrative Layer:**
   - **Hardware Mode:** Mini-game kinestetik (*Ramu Mantra* & *Speed Match*) menggunakan konsol fisik *Aksantara Tactile Pad* (ESP32 + RFID Reader via Web Serial API).
   - **Narrative Story Mode:** Petualangan cerita rakyat lokal (*Sawerigading*, *Lutung Kasarung*, *Calon Arang*) dengan dialog diperkaya LLM (*Gemini AI*).
4. **Pilar 4 - Preservasi Manuskrip Kuno:** Human-in-the-loop OCR transliterasi naskah lontar bersejarah.

---

## 2. Cara Menjalankan Aplikasi Web Lokal

```bash
# 1. Masuk ke folder web
cd web

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembang
npm run dev

# 4. Buka di peramban
http://localhost:3000
```

> **Catatan Autentikasi Demo:** Pada halaman `/auth`, Anda dapat mengklik tombol **"Demo Cepat (Tamu)"** untuk masuk instan dengan sesi 7 hari tanpa harus menunggu koneksi live internet/database.

---

## 3. PANDUAN UNTUK AI ENGINEER

Seluruh kontrak interface dan endpoint AI telah disiapkan di lapisan Next.js. Anda tidak perlu mengubah komponen UI halaman.

### A. Pilar 1: Model Klasifikasi Goresan Kanvas (ONNX Web / API)

#### Opsi 1: On-Device ONNX Web (Rekomendasi Utama — Zero Latency <50ms & Bebas Kuota API)
1. Export model CNN / MobileNet / ResNet fine-tuned NusaAksara Anda ke format ONNX:
   - Format file: `nusaaksara_trinitas.onnx`
   - Letakkan di: `web/public/models/nusaaksara_trinitas.onnx`
   - Letakkan file mapping kelas di: `web/public/models/labels.json`
2. **Spesifikasi Input Model:**
   - Dimensi: `[1, 1, 64, 64]` (Grayscale) atau `[1, 3, 224, 224]` (RGB).
   - Normalisasi: `0.0` (background) hingga `1.0` (tinta goresan).
   - Helper preprocessing dari canvas HTML ke Float32Array tensor sudah tersedia di:
     `web/src/lib/onnx/onnx-classifier.ts` → fungsi `preprocessCanvasForOnnx(canvas, 64, true)`.

#### Opsi 2: Backend API Eksternal (FastAPI / PyTorch Server)
Jika model dijalankan pada server microservice Python:
1. Tambahkan URL server Anda di `web/.env.local`:
   ```env
   AI_CLASSIFIER_URL=http://127.0.0.1:8000
   ```
   Jangan memakai `NEXT_PUBLIC_AI_CLASSIFIER_URL`; browser tidak berkomunikasi langsung dengan Python.
3. `evaluateGlyph` memanggil POST `/api/ai/classify`. Next.js memvalidasi JSON dan PNG lalu meneruskan POST `/predict`. Batas waktu layanan 30 detik memungkinkan pemuatan model dingin; bukan klaim latensi tercapai.
4. Model tetap di server lokal, bukan `web/public/models`. Tanpa internet, layanan lokal dan aset yang tersedia dapat digunakan. Jika layanan/aset tidak tersedia, UI menampilkan error; tidak ada skor acak, heuristic, atau keberhasilan palsu.

   Jalankan dari root repositori (bukan folder `web/`):
   ```bash
   python -m pip install -r ai/deployment/requirements.txt
   python -m uvicorn ai.deployment.server:app --host 127.0.0.1 --port 8000
   ```
   GET `http://127.0.0.1:8000/health` mengembalikan 200 hanya setelah aset ketiga specialist tervalidasi dan graph CPU siap; jika tidak, readiness 503. Jalankan Next.js di terminal terpisah.

#### Citra & Tensor

- Snapshot hanya memuat tinta kanvas, tanpa overlay referensi/grid dari DOM. Ekspor menghasilkan tinta hitam di atas putih, mempertahankan siluet alpha dan rasio aspek; sisi maksimum 1024 piksel untuk membatasi snapshot HiDPI.
- Python memakai **`ai/preprocess.py` → `preprocess_image(image, 128)`**: crop seluruh komponen foreground (bukan komponen terbesar saja), grayscale 128 dan tensor float32 CHW; hasil kosong ditolak. Tidak ada preprocessing tensor alternatif di browser.
- Tensor ONNX **NCHW `[1, 3, 128, 128]`**, input `input`, output `logits`. Normalisasi ImageNet per kanal: mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`, setelah pembagian intensitas dengan 255.
- Urutan goresan diabaikan. Ini classifier karakter; benchmark baris NusaAksara bukan mapping karakter otomatis, dan classifier ini bukan validator topologi.

#### Request POST `/api/ai/classify` → Python `/predict`

```typescript
{
  aksaraId: 'sunda' | 'lontara' | 'bali';
  karakterSlug: string; // 1–128 karakter; pencocokan label persis, case-insensitive
  image: string; // PNG data URL, maks. 4 MiB decoded
  strokes?: unknown; // Diabaikan; tidak memengaruhi prediksi
  canvasWidth?: number; // Jika ada: finite, positif, <=2048
  canvasHeight?: number;
}
```

Batas PNG: data URL maksimal 5.592.430 karakter, setiap sisi maksimal 2048, maksimal 1.048.576 piksel. Proxy membatasi request JSON 6 MiB dan response JSON layanan 64 KiB. PNG rusak atau kanvas kosong menghasilkan HTTP 400; request tidak valid 422; aset/layanan tidak tersedia atau response backend tidak sesuai kontrak 503. Semua error memakai `{ error: string }` dan terlihat di UI.

#### Response Klasifikasi (Bukan Nilai Tulisan)

```typescript
{
  score: number;
  status: 'perlu_review';
  predictedSymbol: string; // source_label mentah, bukan Unicode terverifikasi
  confidence: number; // probabilitas softmax top-1, 0..1
  latencyMs: number; // latensi aktual layanan Python, bukan end-to-end browser
  ringkasan: string; // penjelasan klasifikasi dalam bahasa Indonesia
  kriteria: []; // Tidak ada klaim geometri atau diakritik
  modelSource: 'onnx_backend';
  targetSupported: boolean;
  probabilitiesCalibrated: false;
  mappingVerified: false;
  modelId: string; // SHA256 model
  top3: Array<{ labelId: string; sourceLabel: string; probability: number }>;
}
```

`score` adalah persentase probabilitas label target **hanya jika ada satu label sumber yang sama persis secara case-insensitive** dengan slug. Jika target tidak didukung/ambigu, `score` adalah persentase probabilitas top-1 dan `targetSupported: false`; klasifikasi tetap nyata, tanpa mapping rekaan. Label seperti `Ke` dan `Ke_` tidak disamakan. UI memperlihatkan top-3 label sumber mentah, probabilitas, status perlu review, dan peringatan target tidak didukung. Hasil ini **tidak disimpan sebagai mastery, XP, atau keberhasilan progres latihan**. Probabilitas belum terkalibrasi, mapping Unicode belum terverifikasi, izin rilis publik belum diselesaikan; tidak mengklaim kualitas tulisan, validasi diakritik, kesiapan produksi, atau target latensi tercapai.

### B. Pilar 3: Variasi Dialog Cerita Berbasis Persona LLM (Gemini API)
1. Endpoint: `web/src/app/api/ai/story-enrich/route.ts`
2. Kredensial: Otomatis membaca `GEMINI_API_KEY` dari `web/.env.local`.
3. Endpoint ini menerima POST `{ karakterId, pembicaraNama, konteksCerita, aksaraId, glifTarget }` dan mengembalikan respon dialog bijaksana berkarakter lokal. Jika offline, otomatis beralih ke kutipan filosofis sastra kuno lokal tanpa melempar error.

### C. Pilar 4: Transliterasi Naskah Kuno Manuskrip
1. Endpoint: `web/src/app/api/ai/transcribe-manuscript/route.ts`
2. Menerima POST `{ manuscriptId, aksaraType, imageBase64 }` dan mengembalikan teks aksara asli, transliterasi Latin, dan terjemahan bahasa Indonesia.

---

## 4. PANDUAN UNTUK EMBEDDED / IOT HARDWARE ENGINEER

Komunikasi antara browser dan hardware menggunakan **Web Serial API** (koneksi langsung kabel USB Type-C / UART). Zero latency, bebas dependensi WiFi panggung, dan tanpa instalasi driver khusus pada Chromium browser (Chrome / Edge).

### A. Konfigurasi Serial Port
- **Baud Rate**: `115200`
- **Data Bits**: `8`
- **Parity**: `None`
- **Stop Bits**: `1`
- **Line Ending**: `\n` (Newline)

### B. Format Data Serial (ESP32 → Web Browser)
Mikrokontroler ESP32 mengirim data pembacaan tag RFID melalui serial print dalam dua opsi format:

#### Opsi 1: Format JSON (Rekomendasi Utama)
```json
{"slot": 1, "uid": "SD-KA-01", "aksara": "sunda", "tipe": "konsonan"}
```
Untuk pelepasan kartu:
```json
{"slot": 1, "event": "tag_removed"}
```

#### Opsi 2: Format UID Sederhana (String Polos per Baris)
ESP32 cukup mencetak UID kartu diikuti baris baru:
```text
SD-KA-01\n
```
Frontend Web Serial stream reader di `web/src/lib/serial/use-tactile-serial.ts` telah dilengkapi auto-parser yang otomatis memetakan string UID tersebut ke kartu Trinitas Aksara.

### C. Daftar 30 Preset UID Kartu Fisik RFID (Bawaan Konsol)

| UID Tag | Aksara | Kategori | Glif | Label Latin | Bunyi Fonetik |
|---|---|---|:---:|---|---|
| `SD-KA-01` | Sunda | Konsonan | ᮊ | Ka | /ka/ |
| `SD-GA-02` | Sunda | Konsonan | ᮌ | Ga | /ga/ |
| `SD-TA-03` | Sunda | Konsonan | ᮒ | Ta | /ta/ |
| `SD-BA-04` | Sunda | Konsonan | ᮘ | Ba | /ba/ |
| `SD-PANGHULU-05` | Sunda | Diakritik | ᮤ | Panghulu (i) | /i/ |
| `SD-PANYUKU-06` | Sunda | Diakritik | ᮥ | Panyuku (u) | /u/ |
| `LT-KA-07` | Lontara | Konsonan | ᨀ | Ka | /ka/ |
| `LT-GA-08` | Lontara | Konsonan | ᨁ | Ga | /ga/ |
| `LT-TA-09` | Lontara | Konsonan | ᨈ | Ta | /ta/ |
| `LT-TETTA-10` | Lontara | Diakritik | ᨗ | Tetta (i) | /i/ |
| `LT-TUKKI-11` | Lontara | Diakritik | ᨘ | Tukki (u) | /u/ |
| `BL-KA-12` | Bali | Konsonan | ᬓ | Ka | /ka/ |
| `BL-GA-13` | Bali | Konsonan | ᬕ | Ga | /ga/ |
| `BL-TA-14` | Bali | Konsonan | ᬢ | Ta | /ta/ |
| `BL-ULU-15` | Bali | Diakritik | ᬶ | Ulu (i) | /i/ |
| `BL-SUKU-16` | Bali | Diakritik | ᬸ | Suku (u) | /u/ |

*(Daftar lengkap 30 kartu dapat dilihat di `web/src/lib/serial/tactile-serial-types.ts`).*

### D. Contoh Kode Singkat Firmware Arduino / ESP32 (MFRC522)

```cpp
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("{\"event\":\"READY\",\"firmware\":\"Aksantara-Tactile-Pad-v2.4\",\"status\":\"OK\"}");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  String uidStr = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uidStr += String(rfid.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();

  // Kirim data JSON ke Web Browser
  Serial.print("{\"slot\":1,\"uid\":\"");
  Serial.print(uidStr);
  Serial.println("\"}");

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(500);
}
```

---

## 5. PANDUAN DATABASE (SUPABASE)

1. **Skema Database:**
   File `supabase/schema.sql` memuat seluruh DDL PostgreSQL (9 tabel, trigger otomatis pembuatan profil saat registrasi, dan kebijakan RLS).
2. **Layanan Sinkronisasi Progres:**
   File `web/src/lib/supabase/progress-service.ts` telah menyediakan fungsi siap pakai:
   - `saveGlyphPractice(userId, payload)`
   - `saveStoryCompletion(userId, payload)`
   - `saveManuscriptSubmission(userId, payload)`
3. **Konfigurasi Lingkungan (`.env.local`):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
   DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
   GEMINI_API_KEY=AIzaSy...
   ```

---

## 6. Checklist Kesiapan Sebelum Pitching Grand Final

- [x] Rute 16 halaman web lulus kompilasi 100% tanpa error TypeScript (`next build` sukses).
- [x] Seluruh alur 3 Epos Cerita Rakyat (*Sawerigading*, *Lutung Kasarung*, *Calon Arang*) dapat dimainkan hingga selesai.
- [x] Web Serial reader aktif membaca port USB pada 115200 baud.
- [ ] Verifikasi classifier privat `/api/ai/classify` dengan ketiga specialist, kasus target tidak didukung, PNG kosong/rusak, dan layanan dimatikan; UI harus menampilkan perlu review atau error, tanpa keberhasilan palsu.
- [x] Mode simulasi hardware dan alur cerita lokal tetap terpisah dari classifier. AI canvas memerlukan layanan lokal aktif dan tidak mempunyai fallback penilaian.
