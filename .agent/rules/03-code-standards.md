---
description: "Standar kode TypeScript strict, penamaan berkas, konvensi import, dan kualitas clean code di Aksantara."
globs: ["web/**/*", "**/*.ts", "**/*.tsx"]
alwaysApply: true
---

# 03 — Code Standards: TypeScript & Clean Architecture

## 1. Strict TypeScript (No `any`)
- Wajib TypeScript Strict Mode (`strict: true`, `noImplicitAny: true`).
- ❌ **Dilarang keras memakai tipe `any`**.
- ✅ **Gunakan `unknown`** untuk data dinamis dari luar (seperti response Web Serial API atau raw model output), lalu validasi menggunakan **Zod** atau custom type guard.
- Wajib mendefinisikan interface/type eksplisit untuk data domain (Aksara, StrokePoint, HardwareEvent, StoryNode).

## 2. Struktur Fungsi & Clean Code
- **Maksimal Panjang Fungsi:** ~25–30 baris. Jika fungsi lebih panjang, ekstrak sub-logika ke helper function atau custom hook.
- **Single Responsibility:** 1 fungsi / komponen hanya melakukan 1 tugas yang jelas.
- **Konstanta di Atas *Magic Numbers*:**
  - ❌ `if (score > 0.85)`
  - ✅ `const MIN_ACCURACY_THRESHOLD = 0.85; if (score > MIN_ACCURACY_THRESHOLD)`
- **Komentar Efisien:** Jangan jelaskan apa yang dilakukan kode (`// menambah 1`). Jelaskan **alasan/WHY** jika terdapat logika non-trivial atau batas toleransi browser.

## 3. Konvensi Penamaan (Naming Conventions)
- **Komponen & Type/Interface:** `PascalCase` (contoh: `UniversalCanvas`, `AksaraCard`, `HardwareEvent`).
- **Fungsi, Hooks, Variabel:** `camelCase` (contoh: `useWebSerial`, `evaluateStroke`, `activeScript`).
- **File & Direktori:** `kebab-case` (contoh: `universal-canvas.tsx`, `use-web-serial.ts`, `story-engine/`).
- **Konstanta Global / Enum:** `UPPER_SNAKE_CASE` (contoh: `DEFAULT_BAUD_RATE`, `SCRIPTS_TRINITY`).

## 4. Urutan Import (Import Order)
Kelompokkan import dengan 1 baris kosong pemisah:
1. React & Next.js core (`react`, `next/navigation`, `next/image`).
2. Library pihak ketiga (`lucide-react`, `onnxruntime-web`, `zod`).
3. Internal alias path:
   - `@/components/*`
   - `@/hooks/*`
   - `@/lib/*`
   - `@/types/*`
   - `@/data/*`
4. Relative imports (`./sub-component`).
5. Styles (`./canvas.css`).

## 5. Validasi di Batas Kepercayaan (Trust Boundaries)
Setiap data yang masuk dari perangkat keras fisik (Web Serial API), input sentuhan canvas, atau API eksternal harus divalidasi dan memiliki penanganan error yang tidak menyebabkan UI crash.
