# Setup

How to run Aksantara locally and what each service needs. Scope and rules: [`CONTEXT.md`](CONTEXT.md). Classifier contract: [`AI_MODEL.md`](AI_MODEL.md).

## 1. Run the web app

```bash
cd web
npm ci
npm run dev        # http://localhost:3000
```

Checks: `npx tsc --noEmit` (there is no lint script) and `npm run build`.

Copy `web/.env.example` to `web/.env.local` and fill the variables (section 3). Never commit `.env.local`.

### Model and WASM runtime
The practice studio runs the Bali classifier in the browser with ONNX Runtime Web 1.22.0 (single-thread WASM). Assets are served from `web/public/`:
- `models/bali/` — `model.onnx`, `labels.json`, `manifest.json`
- `wasm/` — ONNX Runtime Web runtime files

No Python process is needed for this path. The model loads lazily on the first evaluation.

## 2. Database (Supabase)
- `supabase/schema.sql` — full PostgreSQL schema: enums, tables, profile-protection trigger, RLS policies.
- `supabase/migrations/20261016_manual_transliteration.sql` — incremental migration: role-escalation lock, manuscript review fields, immutability trigger for transliteration proposals.

Access rules for manuscript transliteration:
1. New sign-ups always get role `siswa`. `guru`, `filolog` and `admin` can only be assigned by the database administrator.
2. A student reads only their own proposals and can submit only proposals with status `menunggu`.
3. Reviewers (`is_reviewer`) read the whole queue and set status `terverifikasi` or `tinjauan` with a mandatory note (max 4000 characters).
4. A reviewer cannot review their own proposal; a review is immutable.

## 3. Environment variables (`web/.env.local`)
| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth and data | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin scripts only | Optional, server-only, never exposed to the browser |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Story narrator dialog | Optional. Default model `gemini-2.5-flash` |

## 4. Story dialog enrichment
- Endpoint: `web/src/app/api/ai/story-enrich/route.ts`, model from `GEMINI_MODEL`.
- Fallback: if the key is missing, quota is exhausted or the call exceeds 8 seconds, the endpoint returns curated local text with `source: "deterministic_lore"`. The UI must show which source produced the text.

## 5. Interim: Python classifier proxy
Mini-canvas challenges inside Story Mode still call `/api/ai/classify`, which proxies to a Python FastAPI service. This path is scheduled for removal once the browser classifier covers it (see [`MIGRATION.md`](MIGRATION.md)). Until then:

```bash
python -m pip install -r ai/deployment/requirements.txt
python -m uvicorn ai.deployment.server:app --host 127.0.0.1 --port 8000   # from repo root
```

Set `AI_CLASSIFIER_URL=http://127.0.0.1:8000` (server-only; never prefix with `NEXT_PUBLIC_`). `GET /health` returns 200 when the model is ready.
