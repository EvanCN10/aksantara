# .agent — Direktori Konfigurasi Aturan AI Aksantara

Direktori ini memuat seluruh sistem aturan (*ruleset*) resmi untuk proyek **Aksantara** (Hackathon JOINTS UGM 2026). Aturan ini dirancang untuk menjaga kualitas kode, mencegah *over-engineering*, mengunci bahasa desain berkelas tinggi (Awwwards-level), dan memastikan kepatuhan teknis terhadap arsitektur multi-modal (Web Canvas + IoT Hardware).

---

## Indeks Aturan (Rules Index)

| Berkas | Fokus Utama |
|---|---|
| [ponytail.md](rules/ponytail.md) | **Lazy Senior Dev:** Mencegah over-engineering, YAGNI, utamakan kode minimal yang bekerja. |
| [00-project-context.md](rules/00-project-context.md) | **Konteks Inti:** 4 Pilar × 2 Mode, Trinitas Aksara (Lontara, Sunda, Bali), timeline lomba. |
| [01-design-language.md](rules/01-design-language.md) | **Bahasa Desain:** Palet warna etnik modern exact hex, tipografi, grid asimetris, kurva transisi. |
| [02-anti-slop.md](rules/02-anti-slop.md) | **Anti-Slop AI:** Larangan gradient ungu-biru, layout hero klise, card monoton, dan emoji UI. |
| [03-code-standards.md](rules/03-code-standards.md) | **Standar Kode:** Strict TypeScript (no `any`), Clean Code, konvensi import & penamaan. |
| [04-frontend-architecture.md](rules/04-frontend-architecture.md) | **Arsitektur Web:** Next.js 16 App Router, React 19 RSC, isolasi leaf client, Supabase client. |
| [05-performance-budget.md](rules/05-performance-budget.md) | **Performa:** Anggaran bundle, lazy loading model ONNX, Web Workers, LCP < 1.2s. |
| [06-accessibility.md](rules/06-accessibility.md) | **Aksesibilitas (A11y):** WCAG 2.1 AA, multi-modal PointerEvent canvas, live regions Web Serial. |
| [07-hardware-integration.md](rules/07-hardware-integration.md) | **IoT Hardware:** ESP32 + RFID RC522, protokol Web Serial USB, kontrak schema JSON event. |
| [08-git-and-ai-disclosure.md](rules/08-git-and-ai-disclosure.md) | **Git & Etika AI:** Conventional Commits dan pencatatan transparansi AI di `docs/usage.md`. |

---

## Cara Kerja
Setiap kali AI Agent memulai sesi pemrograman baru di repositori ini, file-file di atas otomatis menjadi landasan logika pengambilan keputusan, memastikan konsistensi hasil hingga hari pengumpulan **16 Oktober 2026**.
