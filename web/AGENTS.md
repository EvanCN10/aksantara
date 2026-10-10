# AGENTS.md — Web Application Directives & Scope Boundaries

> **Lokasi File:** `web/AGENTS.md`  
> **Target Proyek:** Aksantara — Web Mode Platform (Hackathon JOINTS UGM 2026)  
> **Prioritas Aturan:** ATURAN DI BERKAS INI BERSIFAT MUTLAK UNTUK SELURUH SESI PEMROGRAMAN DI DALAM FOLDER `web/`.

---

## 🔒 1. Batasan Ruang Lingkup & Zona Akses (Scope & Permissions)

1. **Zona Kerja Aktif (`web/`):**
   - Agen AI berfokus melakukan penulisan kode, pengeditan berkas, instalasi dependensi (`npm`), dan eksekusi perintah terminal di dalam direktori `web/`.
2. **Zona Referensi Resmi yang WAJIB Dibaca:**
   - **Folder `.agent/`:** Seluruh aturan di dalam `.agent/rules/` (termasuk `ponytail.md`, `00-project-context.md`, `01-design-language.md`, dll) **WAJIB DIBACA & DIPATUHI** sebagai pedoman dasar perilaku dan standar kode.
   - **Folder `context/`:** Berkas spesifikasi resmi (khususnya `context/AKSANTARA-SSOT-v3.1.md`) dibaca sebagai Single Source of Truth kurikulum budaya, Trinitas Aksara, dan alur cerita.
3. **ZONA TERLARANG (JANGAN DILIHAT / DISENTUH KECUALI DIMINTA USER):**
   - ⛔ Folder `ai/` dan `iot/` **JANGAN DILIHAT ATAU DIMODIFIKASI KECUALI DIMINTA SENDIRI OLEH USER**, karena sesi chat ini difokuskan penuh untuk pengembangan web.

---

## ⚡ 2. Tech Stack Resmi

- **Framework:** **Next.js 16.x (App Router)**
- **Library Inti:** **React 19.x** (React Server Components, Actions, `useActionState`, `useOptimistic`)
- **Styling:** **Tailwind CSS v4.x** (Arsitektur CSS-first, konfigurasi token via `@theme`)
- **Bahasa:** **TypeScript 5.x Strict Mode** (Wajib tanpa `any`, gunakan `unknown` + type narrowing/Zod)
- **Komponen Ikon:** `lucide-react` (dengan stroke-width dan ukuran proporsional)
- **State Management:** URL search params (filter/navigasi) + local React state/refs (kanvas stroke & serial stream)
- **Database / Backend Client:** Supabase client (`@supabase/ssr` untuk Server Components, singleton untuk client)

---

## 🏛️ 3. Arsitektur Frontend Next.js 16 & React 19

1. **Server Components by Default:**
   - Seluruh halaman dan layout di `src/app/` adalah React Server Components (RSC) tanpa `'use client'`.
2. **Isolasi Client Components ke Daun Terluar (Leaf Nodes):**
   - Gunakan directive `'use client'` **hanya** pada boundary interaktif yang membutuhkan:
     - `PointerEvent` API / manipulasi `<canvas>` langsung.
     - Web Serial API (`navigator.serial`) / Web Audio API.
     - State form lokal / event listener interaktif.
3. **Next.js 16 Async Request Props:**
   - Props `params` dan `searchParams` adalah Promise wajib di-`await`:
     ```tsx
     export default async function Page({ params }: { params: Promise<{ script: string }> }) {
       const { script } = await params;
       return <View script={script} />;
     }
     ```
4. **Data Mutations:**
   - Gunakan **Server Actions** untuk logging kemajuan belajar dan submit skor.
   - Hindari membuat API Routes (`app/api/`) kecuali untuk streaming LLM atau endpoint webhook publik.

---

## 🎨 4. Bahasa Desain Etnik Modern (Awwwards-Level)

Desain Aksantara harus berakar pada warisan luhur budaya Nusantara namun terasa futuristik, mewah, dan presisi.

### A. Palet Warna Eksak (Exact Hex Tokens)
- **Primary Background (Warm Obsidian):** `#0D0E12` (gelap hangat, bukan hitam `#000` mati).
- **Surface Elevation (Card / Panel):** `#16181F` dengan border `rgba(255, 255, 255, 0.08)`.
- **Canvas Paper (Lontar Parchment):** `#F6F2E9` (tekstur daun lontar kuno untuk area menggambar).
- **Primary Accent (Heritage Ochre / Mas Kuno):** `#D4A373` (keemasan rempah budaya).
- **Action Accent (Terracotta):** `#C85A32` (merah bata tanah liat Nusantara).
- **Success State (Forest Jade):** `#2A9D8F` (indikator AI akurat & verifikasi sukses).
- **Error State (Crimson Sangkur):** `#E76F51` (evaluasi bentuk belum presisi).

### B. Tipografi
- **Headings & Display:** `Plus Jakarta Sans` atau `Outfit`.
- **Body & Controls:** `Inter` atau `Geist Sans`.
- **Aksara Fonts:** `Noto Sans Buginese`, `Noto Sans Sundanese`, `Noto Sans Balinese`.

### C. Motion & Layout
- **Spring Transition:** `cubic-bezier(0.16, 1, 0.3, 1)` (snappy, mewah).
- **Layout Rhythm:** Asymmetric Bento Grid (Universal Canvas berukuran ~65% layar, panel inspeksi AI ~35%).

---

## 🚫 5. Larangan Desain Generik (Anti-Slop AI)

Seluruh pola berikut **DILARANG KERAS** dihasilkan oleh agen AI:
- ❌ **Dilarang** gradient ungu-ke-biru generik (`from-purple-500 to-blue-500` atau `from-indigo-600 to-purple-600`).
- ❌ **Dilarang** card polos `bg-white shadow-lg rounded-xl` tanpa variasi border atau tekstur.
- ❌ **Dilarang** hero section klise (judul tengah raksasa + subjudul 2 baris + 2 tombol bersebelahan).
- ❌ **Dilarang** menaruh emoji (🚀, 💡, 🔥, ✨) di dalam tombol produksi (gunakan ikon SVG / Lucide ber-wrapper).
- ❌ **Dilarang** teks pengisi palsu (*Lorem ipsum*). Gunakan istilah paleografi nyata (*Lontara, Sunda, Bali, Ngalagena, Rarangken, Wianjana*).

---

## 🔌 6. Integrasi Hardware (Web Serial API) & AI Canvas

1. **Universal Web Canvas:**
   - Wajib menggunakan native `PointerEvent` API (`onPointerDown`, `onPointerMove`, `onPointerUp`).
   - Mencegah scroll default sentuhan: `touch-action: none`.
   - Mengambil snapshot canvas -> normalisasi bounding box -> resize 64x64 binarized tensor.
2. **Web Serial Hook (`useWebSerial`):**
   - Komunikasi USB direct via `navigator.serial` pada baud rate `115200`.
   - Zero-dependency pada WiFi lokal panggung demo.
   - Sediakan toggle **Simulasi Hardware (Mock Mode)** untuk pengujian tanpa perangkat fisik ESP32.
3. **Kontrak Data Event RFID Kartu:**
   ```json
   {
     "event": "CARD_DETECTED",
     "uid": "A1B2C3D4",
     "script": "sunda",
     "char": "ka",
     "type": "consonant",
     "timestamp": 1728590400000
   }
   ```

---

## 🚀 7. Anggaran Performa (Performance Budget)

- **Lazy Load Model AI:** Modul `onnxruntime-web` dan file model biner dilarang dimuat di landing page utama. Wajib dimuat secara asinkron (*dynamic import*) hanya saat pengguna membuka canvas latihan.
- **Core Web Vitals Target:** LCP `< 1.2 detik`, INP `< 50ms`, CLS `0`.
