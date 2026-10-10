---
description: "Daftar larangan pola generik AI (Anti-Slop) untuk menjaga kualitas visual dan keaslian platform Aksantara."
globs: ["web/**/*", "**/*.tsx", "**/*.jsx", "**/*.html"]
alwaysApply: true
---

# 02 — Anti-Slop Guidelines (Strictly Forbidden AI Patterns)

Agent AI memiliki kecenderungan default menghasilkan UI yang klise dan monoton. Seluruh pola berikut **DILARANG KERAS** pada repositori Aksantara:

## 1. Dilarang Gradient Ungu-ke-Biru Generik
- ❌ **Dilarang:** `bg-gradient-to-r from-purple-500 to-blue-500` atau `from-indigo-600 to-purple-600`. Ini adalah tanda paling kentara dari template AI murahan.
- ✅ **Gunakan:** Latar berkarakter hangat gelap `#0D0E12`, aksen emas rempah `#D4A373`, atau terracotta `#C85A32` dengan gradasi radial halus (glow spotlight).

## 2. Dilarang Card Monoton Tanpa Crafting
- ❌ **Dilarang:** Menumpuk card dengan `bg-white shadow-lg rounded-xl` polos tanpa border, kontras, atau tekstur.
- ✅ **Gunakan:** Card berlayer `bg-[#16181F]`, border subtle `border-white/10`, aksen highlight pada sudut, atau motif geometris etnik samar.

## 3. Dilarang Hero Section Klise
- ❌ **Dilarang:** Layout klise: Judul raksasa center-aligned + subjudul 2 baris + 2 tombol bersebelahan (Get Started / Learn More).
- ✅ **Gunakan:** Hero interaktif asimetris: preview langsung Universal Web Canvas yang bisa dicoba gores secara instan, atau split layout dengan demonstrasi kartu fisik Aksantara Tactile Pad.

## 4. Dilarang Ikon Lucide Mentah Tanpa Konteks
- ❌ **Dilarang:** Mengimpor `<Flame />` atau `<Sparkles />` ukuran 24px default abu-abu/biru tanpa styling.
- ✅ **Gunakan:** Ikon dengan ukuran proporsional (`w-4 h-4` atau `w-5 h-5`), stroke-width spesifik (`stroke-[1.5]`), dan ditempatkan dalam badge/container bertekstur.

## 5. Dilarang Layout Simetris Tengah (Center-Aligned) Seragam
- ❌ **Dilarang:** Menempatkan semua judul, teks deskripsi, dan tombol di posisi tengah (`text-center`) di setiap seksi halaman.
- ✅ **Gunakan:** Editorial alignment: judul tegas left-aligned dengan metadata/tag di atasnya, grid asimetris, dan ritme visual yang dinamis.

## 6. Dilarang Menggunakan Emoji Sebagai Ikon Produksi
- ❌ **Dilarang:** Menaruh emoji (misal: 🚀, 💡, 🔥, ✨) di dalam tombol atau kartu fitur sebagai pengganti ikon UI resmi.
- ✅ **Gunakan:** Ikon SVG resmi, glif aksara asli, atau ikon grafis custom bertema Nusantara.

## 7. Dilarang Teks Pengisi Palsu (Lorem Ipsum)
- ❌ **Dilarang:** Teks dummy yang tidak bermakna.
- ✅ **Gunakan:** Kosakata sastra lokal, nama naskah kuno (I La Galigo, Lutung Kasarung, Calon Arang), serta istilah fonetis resmi (Ngalagena, Rarangken, Wianjana, Pangangge).
