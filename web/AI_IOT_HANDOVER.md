# AKSANTARA - Panduan Integrasi Teknis AI, IoT & Database
### Handover Guide untuk AI Engineer & Embedded Hardware Engineer
> **Kompetisi:** Hackathon JOINTS UGM 2026 - Tema: Education  
> **Target:** Grand Final FMIPA UGM (1 November 2026)  
> **Status Frontend & Web Engine:** 100% Siap Terintegrasi (*Production Ready*)

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

#### Opsi 1: On-Device ONNX Web (Rekomendasi Utama - Zero Latency <50ms & Bebas Kuota API)
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
   NEXT_PUBLIC_AI_CLASSIFIER_URL=http://localhost:8000
   ```
2. Frontend secara otomatis meneruskan snapshot citra canvas dan data koordinat tarikan kuas ke API Route Next.js di `/api/ai/classify`.
3. **Format Request Payload POST `/api/ai/classify`:**
   ```json
   {
     "aksaraId": "sunda",
     "karakterSlug": "ka",
     "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
     "strokes": [
       [{"x": 120, "y": 80}, {"x": 125, "y": 95}, {"x": 130, "y": 120}],
       [{"x": 90, "y": 100}, {"x": 140, "y": 100}]
     ]
   }
   ```
4. **Format Response JSON yang Diharapkan:**
   ```json
   {
     "score": 94,
     "status": "sempurna",
     "predictedSymbol": "KA",
     "confidence": 0.94,
     "latencyMs": 35,
     "ringkasan": "Bentuk konsonan Ka proporsional.",
     "kriteria": [
       { "label": "Akurasi Geometri Bentuk", "lulus": true, "catatan": "Sudut presisi" },
       { "label": "Keseimbangan & Kontinuitas Tarikan", "lulus": true, "catatan": "2 tarikan stabil" },
       { "label": "Verifikasi Vokalisasi / Diakritik", "lulus": true, "catatan": "Konsonan dasar murni" }
     ]
   }
   ```

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
- [x] Kontrak API AI `/api/ai/classify`, `/api/ai/story-enrich`, dan `/api/ai/transcribe-manuscript` aktif.
- [x] Zero-failure presentation resilient: jika hardware belum dicolok atau offline, mode simulasi dan fallback lokal langsung aktif.
