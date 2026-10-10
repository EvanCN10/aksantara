---
description: "Arsitektur frontend Next.js 16 (App Router), React 19 Server Components, pemisahan state, dan integrasi Supabase."
globs: ["web/**/*", "web/src/**/*"]
alwaysApply: true
---

# 04 — Frontend Architecture: Next.js 16 & React 19

## 1. Paradigma Server vs Client Components
- **Server Components (RSC) Sebagai Default:** Semua halaman dan layout di dalam `src/app/` harus berupa Server Components tanpa `'use client'`.
- **Dorong `'use client'` ke Daun Terluar (Leaf Nodes):**
  Gunakan `'use client'` hanya pada komponen yang secara langsung membutuhkan:
  1. API browser native (`window`, `navigator.serial`, `PointerEvent`).
  2. State interaktif lokal (`useState`, `useRef`, canvas buffer).
  3. Efek dan listener event (`useEffect`, audio playback).
- **Contoh Isolasi:** Halaman `/play/[script]` adalah Server Component yang mengambil data kurikulum, lalu membungkus `<UniversalCanvas />` dan `<HardwareListener />` sebagai Client Components terpisah.

## 2. Next.js 16 Standar Terkini
- **Async `params` & `searchParams`:**
  Pada Next.js 16, props `params` dan `searchParams` berupa Promise:
  ```tsx
  // ✅ Next.js 16 Pattern
  export default async function Page({
    params,
  }: {
    params: Promise<{ script: string }>;
  }) {
    const { script } = await params;
    return <PlayView script={script} />;
  }
  ```
- **React 19 Actions:** Gunakan `useActionState` dan `useOptimistic` untuk form submission dan feedback instan ke user.

## 3. Data Fetching & Mutasi
- **Server Actions:** Gunakan Server Actions untuk mutasi data progres belajar siswa, logging percobaan aksara, dan update preferensi pengguna.
- **Route Handlers (`app/api/`):** Gunakan hanya jika diperlukan endpoint webhook, streaming LLM dialog, atau integrasi pihak ketiga.

## 4. State Management Layer
1. **URL State (Utama):** Pilihan aksara aktif (`?script=lontara`), mode (`?mode=canvas`), atau bab cerita (`?chapter=1`) disimpan di query string agar link dapat dibagikan dan SEO-friendly.
2. **Ephemeral Canvas State:** Riwayat stroke goresan, koordinat titik x/y, dan status evaluasi AI ditampung di local React state / ref untuk menghindari re-render yang tidak perlu.
3. **Hardware Serial State:** Ditangani melalui custom hook `useWebSerial` dengan dispatcher event terpusat.

## 5. Konvensi Supabase Client
- **Server Context:** Gunakan `@supabase/ssr` (`createClient` untuk Server Components & Server Actions).
- **Browser Context:** Gunakan singleton browser client hanya pada Client Components yang membutuhkan subscription realtime.
