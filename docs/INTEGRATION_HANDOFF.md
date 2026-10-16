# AKSANTARA — Panduan Integrasi Teknis Web, Hardware & Database
### Integration Handoff Guide

> **Kompetisi:** Hackathon JOINTS UGM 2026 — Tema: Education  
> **Target:** Grand Final FMIPA UGM (1 November 2026)  
> **Dokumen Terkait:** [Handoff Model AI](AI_MODEL_HANDOFF.md) • [Spesifikasi Sistem SSOT v3.1](../context/AKSANTARA-SSOT-v3.1.md)

---

## 1. Arsitektur Integrasi Sistem

Platform Aksantara terdiri dari 4 pilar edukasi dan 2 mode penggunaan:
1. **Pilar 1 — Latihan Kanvas Digital & AI Eksperimen:** Evaluasi visual karakter tulisan tangan siswa pada Web Canvas menggunakan adapter Next.js `/api/ai/classify` dan backend Python ONNX specialist. Rincian kontrak model dan preprocessing merujuk ke [AI_MODEL_HANDOFF.md](AI_MODEL_HANDOFF.md).
2. **Pilar 2 — Trinitas Aksara Nusantara:** Kurikulum pembelajaran tiga aksara (Lontara, Sunda, Bali) dengan karakteristik paleografi sudut, modular, dan kurvalinier.
3. **Pilar 3 — Gamifikasi Naratif & Hardware Phygital:**
   - **Mode Hardware:** Konsol fisik *Aksantara Tactile Pad* (ESP32 + RC522 RFID) terhubung via Web Serial API (USB Plug-and-Play).
   - **Mode Cerita:** Petualangan naratif interaktif (*Sawerigading*, *Lutung Kasarung*, *Calon Arang*) dengan bantuan kurasi lokal dan pengayaan dialog Gemini AI.
4. **Pilar 4 — Transliterasi Manual & Review Manusia:** Siswa membaca foto manuskrip kuno (koleksi British Library EAP dan PNRI) lalu menuliskan usulan transliterasi Latin yang ditinjau langsung oleh guru atau kurator ahli.

---

## 2. Quickstart Lingkungan Pengembangan

### A. Menjalankan Aplikasi Web (Next.js 16)
```bash
# Masuk ke direktori web
cd web

# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev
```
Akses di peramban: `http://localhost:3000`

### B. Menjalankan Backend Classifier AI (Python FastAPI)
Dari root repositori:
```bash
python -m pip install -r ai/deployment/requirements.txt
python -m uvicorn ai.deployment.server:app --host 127.0.0.1 --port 8000
```
Verifikasi status layanan: `GET http://127.0.0.1:8000/health` (mengembalikan HTTP 200 saat ketiga specialist siap).

Konfigurasi opsional di `web/.env.local`:
```env
AI_CLASSIFIER_URL=http://127.0.0.1:8000
```
*(Variabel ini server-only; jangan menggunakan awalan `NEXT_PUBLIC_`)*.

---

## 3. Integrasi Hardware IoT (Aksantara Tactile Pad)

Koneksi konsol fisik ke browser memanfaatkan **Web Serial API** langsung melalui kabel USB:
- Bebas dependensi jaringan WiFi panggung demo.
- Tidak memerlukan instalasi driver khusus pada peramban berbasis Chromium (Google Chrome, Microsoft Edge, Brave).

### A. Parameter Serial Port
- **Baud Rate:** `115200`
- **Data Bits:** `8`
- **Parity:** `None`
- **Stop Bits:** `1`
- **Line Ending:** `\n` (Newline)

### B. Format Payload Serial (ESP32 → Browser)
Konsol mikrokontroler mengirim data pembacaan tag RFID melalui serial print:

```json
{"slot": 1, "uid": "SD-KA-01", "aksara": "sunda", "tipe": "konsonan"}
```
Untuk pelepasan kartu:
```json
{"slot": 1, "event": "tag_removed"}
```

Frontend Web Serial stream reader di `web/src/lib/serial/use-tactile-serial.ts` juga mendukung string UID polos:
```text
SD-KA-01\n
```

### C. Daftar Preset UID Kartu Fisik RFID

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

*(Daftar 30 kartu lengkap terdapat pada `web/src/lib/serial/tactile-serial-types.ts`).*

---

## 4. Integrasi Basis Data (Supabase)

### A. DDL dan Migrasi
- `supabase/schema.sql`: Definisi basis data lengkap (DDL PostgreSQL, enum, tabel, trigger proteksi profil, dan kebijakan RLS).
- `supabase/migrations/20261016_manual_transliteration.sql`: Migrasi inkremental untuk penguncian eskalasi role, penambahan field review manuskrip, serta trigger imutabilitas usulan transliterasi.

### B. Hak Akses & Keamanan Transliterasi
1. Pendaftaran baru akun (`auth.signUp`) selalu menghasilkan role `siswa`. Role `guru`, `filolog`, dan `admin` hanya dapat ditetapkan oleh administrator basis data.
2. Siswa hanya dapat membaca usulan miliknya sendiri dan mengirim usulan berstatus `menunggu`.
3. Kurator / Guru (`is_reviewer`) dapat membaca seluruh antrean dan memberikan evaluasi status (`terverifikasi` atau `tinjauan`) beserta catatan evaluasi wajib (maksimal 4000 karakter).
4. Peninjau dilarang mereview usulan miliknya sendiri, dan hasil peninjauan bersifat immutable.

### C. Konfigurasi Lingkungan (`web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
```

---

## 5. Pengayaan Dialog Cerita (AI Story Enrichment)

1. **Endpoint:** `web/src/app/api/ai/story-enrich/route.ts`
2. **Model:** Google Gemini API melalui model yang ditentukan di `GEMINI_MODEL` (default: `gemini-2.5-flash`).
3. **Mekanisme Fallback:** Jika `GEMINI_API_KEY` tidak tersedia, kuota habis, atau waktu tunggu melebihi 8 detik, sistem mengembalikan petunjuk materi lokal terkurasi (`deterministic_lore`) dengan label "Petunjuk dari materi" agar alur pembelajaran cerita tidak terputus.
