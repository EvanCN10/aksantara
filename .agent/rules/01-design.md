---
description: "Bahasa desain Aksantara: palet, tipografi, grid, motion, dan larangan pola generik AI (anti-slop)."
globs: ["web/**/*", "**/*.tsx", "**/*.css"]
alwaysApply: false
---

# 01 — Design

Premium, berakar pada budaya Bali/Nusantara, presisi. Hindari tampilan template AI generik. Referensi: editorial dengan tekstur kertas lontar dan UI digital yang bersih.

## Warna (token di Tailwind v4 `@theme`)
| Peran | Hex |
|---|---|
| Background utama (Warm Obsidian) | `#0D0E12` (bukan `#000`) |
| Surface (card/panel) | `#16181F`, border `rgba(255,255,255,0.08)` |
| Kertas canvas (Lontar Parchment) | `#F6F2E9` |
| Aksen utama (Heritage Ochre) | `#D4A373` |
| Aksen aksi (Terracotta) | `#C85A32` |
| Sukses (Forest Jade) | `#2A9D8F` |
| Error/remedial (Crimson) | `#E76F51` |

## Tipografi
- Heading/brand: `Philosopher`. Body/UI: `Inter` atau `Geist Sans`.
- Aksara Bali: `Noto Sans Balinese` (subset, `font-display: swap`).
- Skala: `hero` `clamp(2.75rem, 6vw, 4.5rem)` / ls `-0.03em` / lh `1.05`; `section-title` `clamp(1.75rem, 3.5vw, 2.75rem)` / ls `-0.02em`; `body-large` `1.125rem` / lh `1.6`.

## Layout & motion
- Bento asimetris: canvas 60–70% lebar desktop, panel hasil AI 30–40%.
- Radius: `rounded-2xl` card, `rounded-xl` tombol/input. Glass: `backdrop-blur-md` + `rgba(22,24,31,0.75)`.
- Easing `cubic-bezier(0.16, 1, 0.3, 1)`. Durasi: hover/tap 150ms, panel 280ms, reveal hasil AI 400ms. Animasi harus membantu pemahaman, bukan hiasan.

## Dilarang (anti-slop)
- Gradient ungu→biru generik (`from-purple-500 to-blue-500`, `from-indigo-600 to-purple-600`). Pakai glow radial halus dari `#D4A373`/`#C85A32`.
- Card polos `bg-white shadow-lg rounded-xl`. Pakai surface berlayer + border halus.
- Hero klise (judul tengah raksasa + subjudul + dua tombol). Pakai hero asimetris dengan canvas yang bisa langsung dicoba.
- Seluruh seksi `text-center`. Pakai penjajaran editorial (kiri, tag di atas judul).
- Ikon Lucide mentah 24px tanpa styling. Pakai `w-4`/`w-5`, `stroke-[1.5]`, di dalam badge/container.
- Emoji sebagai ikon produksi. Pakai SVG, glif aksara asli, atau ikon custom.
- Lorem ipsum. Pakai istilah nyata: *Calon Arang*, *wianjana*, *swalalita*, *pangangge*.
