---
description: "Aksesibilitas (WCAG 2.1 AA), input canvas multi-modal, keyboard, dan target sentuh."
globs: ["web/**/*", "**/*.tsx"]
alwaysApply: false
---

# 04 — Accessibility

- **Kontras:** teks normal ≥ 4.5:1, teks besar/grafis penting ≥ 3:1. Aksara di atas `#F6F2E9` memakai tinta ≥ `#1C1917`.
- **Canvas:** satu jalur `PointerEvent` untuk stylus, sentuh, dan mouse; `touch-action: none` agar tidak men-scroll saat menulis.
- **Screen reader:** teks `sr-only` yang menyebut karakter yang sedang dilatih; hasil evaluasi diumumkan lewat `aria-live="polite"`.
- **Keyboard:** semua kontrol dapat dijangkau dengan `Tab` dan `Enter/Space`; fokus terlihat: `focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none`.
- **Target sentuh:** minimal 44×44 px (pengguna siswa SD/SMP).
