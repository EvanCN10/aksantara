---
description: "Standar kode TypeScript strict dan arsitektur Next.js 16 / React 19 / Supabase untuk Aksantara."
globs: ["web/**/*", "**/*.ts", "**/*.tsx"]
alwaysApply: true
---

# 02 — Code & Architecture

## TypeScript
- `strict: true`. **Tanpa `any`**: pakai `unknown` untuk data luar (respons API, output model) lalu validasi dengan Zod atau type guard.
- Definisikan type eksplisit untuk domain (Aksara, StrokePoint, StoryNode).
- Validasi di batas kepercayaan: input canvas, body API, respons Gemini/model. Error tidak boleh menjatuhkan UI.

## Gaya
- Fungsi ≤ ~30 baris, satu tanggung jawab. Konstanta bernama, bukan angka ajaib (`MIN_ACCURACY_THRESHOLD`).
- Komentar menjelaskan **mengapa**, bukan apa.
- Penamaan: `PascalCase` komponen/type, `camelCase` fungsi/hook/variabel, `kebab-case` berkas dan folder, `UPPER_SNAKE_CASE` konstanta.
- Urutan import (dipisah baris kosong): React/Next → pihak ketiga → alias internal (`@/components`, `@/lib`, `@/types`, `@/data`) → relatif → style.

## Next.js 16 & React 19
- Server Component secara default; `'use client'` hanya di daun yang butuh `PointerEvent`/canvas, state lokal, atau efek.
- `params` dan `searchParams` adalah Promise: `const { x } = await params`.
- Mutasi (progres, transliterasi) lewat Server Actions (`useActionState`, `useOptimistic` bila perlu). `app/api/` hanya untuk streaming LLM atau endpoint yang memang perlu.
- State: URL query untuk pilihan yang dibagikan; state/ref lokal untuk goresan dan hasil evaluasi.
- Supabase: `@supabase/ssr` di server; client singleton hanya di Client Component yang memerlukannya.

## Dependensi
- npm saja (`package-lock.json`). Jangan tambah dependensi untuk tugas yang cukup 10 baris native; jangan bundle pustaka chart berat bila SVG/Tailwind cukup.
