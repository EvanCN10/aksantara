# AI & Technology Disclosure (draft)

Draft of Lampiran C of the contest guidebook. Items marked `TODO` must be filled by the team before submission. Keep this file honest: it is what the juri compares against the repository.

## Pre-existing project statement
Aksantara was first built for another competition (Hackathon JOINTS UGM 2026, theme Education) and is therefore a **pre-existing project**.
- **Boundary:** git tag `joints-2026-final` (commit `17dbbb0`). Everything before this tag is pre-existing.
- **Developed for DigiFest** (after the tag): repository cleanup and Bali-only scope, removal of the hardware/IoT module, `TODO: list features as they are completed (browser inference hardening, real session results, error-aware tutor, canvas evaluation, calibration, documentation)`.
- Verify with `git diff joints-2026-final..HEAD --stat`.
- The product has not been commercialised.

## Disclosure table
| Component | Value |
|---|---|
| Product name | Aksantara |
| Framework / Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript |
| Backend / Runtime | Next.js route handlers and server actions. `TODO` confirm whether any Python service remains at submission. |
| Database / Storage | Supabase (PostgreSQL + Auth) |
| Hosting / Deployment | `TODO` |
| AI model / API / method | EfficientNet-B0 (ImageNet-pretrained, fine-tuned) exported to ONNX, 30 Aksara Bali classes, run in the browser with ONNX Runtime Web 1.22.0; Google Gemini API for story dialog (optional, with fixed-text fallback) |
| Role of AI in the product | Classifies the shape of a character drawn on the canvas; generates narrator dialog. `TODO` add the error-explanation tutor when built. |
| Dataset / data source | Kaggle `wildanfatahh22/aksara-bali` v3, licence **Unknown**. `TODO` add own consented canvas data when collected. See [`AI_MODEL.md`](AI_MODEL.md) §6. |
| Open-source libraries | See `web/package.json`, `ai/requirements.txt` |
| Template / boilerplate | `TODO` (e.g. `create-next-app`) |
| AI coding assistant | `TODO: list every tool used. Past usage is logged in docs/ai-usage-log.md` |
| Pre-existing components | See the statement above |
| Third-party assets / credits | Google Noto Sans Balinese; NusaAksara (ACL 2025, reference benchmark only); manuscript images from the British Library Endangered Archives Programme and PNRI (`TODO` confirm terms); image/audio assets `TODO` |

## Statement
We declare that the information above is true and complete, and we are responsible for the technology, source code, data, libraries, APIs, AI models and assets used in the product. `TODO: team sign-off`
