# AI Model — Aksara Bali classifier

**Status:** experimental classifier, integrated into the browser practice studio (ONNX Runtime Web). It classifies the final shape of a drawn character. It is **not** a handwriting-quality scorer, stroke-order checker or diacritic verifier.

## 1. Active model

| Item | Value |
|---|---|
| Task | 30-class image classification of a single Aksara Bali character |
| Architecture | EfficientNet-B0 (pretrained ImageNet, fine-tuned), exported to ONNX |
| Format | **FP32** (`16,173,918` bytes ≈ 15.42 MiB, SHA-256 `39a0f325d5549a2d3906a75a10d1ff54ef83f2a772295b2d9f3c0282f7d81adc`) |
| Input / output | float32 NCHW `[1, 3, 128, 128]` named `input` → `logits` |
| Classes | 18 *wyajana* + 12 *swalalita* (`labels.json`). No standalone *pangangge* (vowel/sign) classes. |
| Release status | `private-experiment` (see §6) |

> [!WARNING]
> **Do not use the INT8 export.** Measured in the browser on the selection set, INT8 Bali accuracy collapsed from 99.40% to 16.17% (140 disagreements of 167). FP32 only.

## 2. Evaluation (selection partition, not a frozen test)

Source: `evaluation.json` next to the model. Run `seed42-1791978654289139796`; max 50 epochs, early stopping patience 7, selection metric Macro-F1, best checkpoint restored.

| Metric | Value |
|---|---|
| Selection samples | 167 (about 5 per class) |
| Macro-F1 / Top-1 / Top-3 | 99.37% / 99.40% / 99.40% |
| Lowest class recall | 80% (`aksara swalalita khakantia`, support 5) |
| Mean confidence when correct / wrong | 0.996 / 0.992 → **probabilities are not calibrated** |

Candidates compared in the same tournament (Macro-F1): EfficientNet-B0 0.9937, ResNet-18 0.9819, MobileNetV3-Small 0.9404, Custom CNN-4Layer 0.2914.

Browser measurement recorded on 16 Oct 2026 (Chromium 155, Intel i7-8565U, ONNX Runtime Web 1.22.0, 1 WASM thread, the 167 selection samples): FP32 p95 ≈ 42.8 ms. This is the one browser figure on record. It is not an end-to-end app latency and was not re-measured for DigiFest.

> The metrics above say nothing about generalisation to new writers or to canvas drawings. A canvas test set is planned (see `MIGRATION.md`). Do not quote "99%" without this context.

## 3. Artifacts

| File | Purpose |
|---|---|
| `model.onnx` | FP32 weights loaded by the browser |
| `labels.json` | Output index → label id / source label. `unicode_sequence` is `null` and `mapping_status` is `unverified` for every class. |
| `manifest.json` | Architecture, class count, byte size, SHA-256, preprocessing contract, training identity, release status |
| `evaluation.json` | Champion, leaderboard, epochs, metrics, export benchmark, critical classes |

The browser validates label order and identity, model size and SHA-256, input/output names and logits shape. **Replacing the model requires matching labels, manifest and evaluation**, not just overwriting `model.onnx`.

## 4. Inference contract

Flow: canvas strokes (black on white) → `ImageData` → TypeScript preprocessing → ONNX Runtime Web session → top-3.

- Preprocessing (identical in `ai/preprocess.py` and `web/src/lib/onnx/preprocess-canvas.ts`): crop all foreground components, resize to 128×128, grayscale replicated to 3 channels, divide by 255, ImageNet normalisation (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`). Otsu is used only for foreground/crop. Stroke order is not used. Do not add another preprocessing variant.
- The session is created lazily on first evaluation and reused for the tab. The runtime is single-thread WASM and needs no COOP/COEP headers. Errors are shown to the user; there is no fabricated score and no silent fallback.
- Code: [`onnx-classifier.ts`](../web/src/lib/onnx/onnx-classifier.ts), [`browser-classifier.ts`](../web/src/lib/onnx/browser-classifier.ts), [`session-manager.ts`](../web/src/lib/onnx/session-manager.ts), [`preprocess-canvas.ts`](../web/src/lib/onnx/preprocess-canvas.ts), [`model-catalog.ts`](../web/src/data/aksara/model-catalog.ts).

### Result fields
| Field | Meaning / limit |
|---|---|
| `predictedSymbol` | Raw source label, not a verified Unicode symbol |
| `confidence` | Top-1 softmax probability, 0–1, uncalibrated |
| `top3` | Three entries `{labelId, sourceLabel, probability}` |
| `score` | Percentage probability of the target class if supported, else of top-1. **Not a quality score.** |
| `targetSupported` | Whether the curriculum slug maps to a model class |
| `status` | `benar` if the target is supported, top-1 equals the target and target probability ≥ 0.85; otherwise `perlu_review`. The 0.85 threshold is a provisional product choice, not an experimental result. |
| `modelSource` / `modelId` | `onnx_web` / model SHA-256 |
| `latencyMs` | Preprocessing, first-time model load if needed, and inference. Not a p95 benchmark. |
| `mappingVerified` / `probabilitiesCalibrated` | Both `false` |

Results must not automatically become mastery or XP, and must not be presented as diacritic validation.

## 5. Class catalogue and Unicode evidence

`getModelTrainingCatalog('bali')` returns exactly the 30 model classes in `class_id` order and throws on missing, duplicate or extra mappings. Existing slugs `kha` and `gha` are used for *khakantia* and *gagora*; other new classes use `kelas-<class_id>`.

Swalalita code points read from the Unicode Balinese chart (U+1B00–1B7F). This was an **AI inspection of sample images, not expert paleographic verification**:

| Class | U+ | Class | U+ |
|---|---|---|---|
| ba kembang | 1B2A | narambat | 1B21 |
| calaca | 1B19 | phakapal | 1B28 |
| damadu | 1B25 | sasaga | 1B30 |
| gagora | 1B16 | sasapa | 1B31 |
| jhajera | 1B1B | talatik | 1B1D |
| khakantia | 1B14 | tatawa | 1B23 |

## 6. Training provenance and licence

| Item | Value |
|---|---|
| Dataset | Kaggle `wildanfatahh22/aksara-bali` v3 (attribution: Wildan Fatahillah Akbar), local copy under git-ignored `datasets/` |
| Dataset licence | **Unknown** (description empty). Training was decided by the team; this is not a licence grant. Release rights are unresolved. |
| Other sources | NusaAksara (ACL 2025) is a line-image/OCR benchmark and is not a pretrained checkpoint or character dataset for this model |
| Notes | Provenance and licence evidence: `ai/configs/provenance.json` |

## 7. Limits and open validation

- Selection Macro-F1 ≠ frozen-test accuracy ≠ accuracy on student handwriting.
- Classifier only. No stroke-order, geometry or diacritic-position check.
- Unicode mapping, probability calibration and real-canvas evaluation are not done.
- Dataset/model publication rights are unresolved; the manifest says `private-experiment`. Having the file in Git is not a release permission.
- The saved latency and size numbers are not proof of an end-to-end target.
- Manuscript preservation is manual transliteration plus review. There is no OCR/AI transliteration (team decision, 16 Oct 2026).
