export interface GlyphInferenceInput {
  aksaraId: 'lontara' | 'sunda' | 'bali';
  karakterSlug: string;
  image: string;
  strokes?: unknown;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface GlyphClassProbability {
  labelId: string;
  sourceLabel: string;
  probability: number;
}

export interface GlyphInferenceOutput {
  score: number; // Target-class probability percentage, or top-1 when unsupported; not writing quality.
  status: 'perlu_review';
  predictedSymbol: string; // Raw source_label, not a verified Unicode glyph.
  confidence: number;
  latencyMs: number;
  ringkasan: string;
  kriteria: [];
  modelSource: 'onnx_backend';
  targetSupported: boolean;
  probabilitiesCalibrated: false;
  mappingVerified: false;
  modelId: string;
  top3: GlyphClassProbability[];
}

export const PNG_DATA_URL_PREFIX = 'data:image/png;base64,';
export const MAX_PNG_BYTES = 4 * 1024 * 1024;
export const MAX_PNG_DATA_URL_LENGTH = 5_592_430;
export const MAX_IMAGE_DIMENSION = 2048;
export const MAX_IMAGE_PIXELS = 1_048_576;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoundedNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isNonemptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

export function isGlyphRequest(value: unknown): value is GlyphInferenceInput {
  if (!isRecord(value)) return false;
  return (value.aksaraId === 'lontara' || value.aksaraId === 'sunda' || value.aksaraId === 'bali')
    && isNonemptyString(value.karakterSlug, 128)
    && typeof value.image === 'string'
    && (value.canvasWidth === undefined || isBoundedNumber(value.canvasWidth, Number.MIN_VALUE, MAX_IMAGE_DIMENSION))
    && (value.canvasHeight === undefined || isBoundedNumber(value.canvasHeight, Number.MIN_VALUE, MAX_IMAGE_DIMENSION));
}

export function isPngDataUrl(image: string): boolean {
  if (!image.startsWith(PNG_DATA_URL_PREFIX) || image.length > MAX_PNG_DATA_URL_LENGTH) return false;
  const base64 = image.slice(PNG_DATA_URL_PREFIX.length);
  return base64.length > 0 && base64.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(base64);
}

function isClassProbability(value: unknown): value is GlyphClassProbability {
  return isRecord(value) && Object.keys(value).length === 3
    && isNonemptyString(value.labelId, 512)
    && isNonemptyString(value.sourceLabel, 512)
    && isBoundedNumber(value.probability, 0, 1);
}
export function isGlyphInferenceOutput(value: unknown): value is GlyphInferenceOutput {
  if (!isRecord(value) || Object.keys(value).length !== 13) return false;
  return isBoundedNumber(value.score, 0, 100)
    && value.status === 'perlu_review'
    && isNonemptyString(value.predictedSymbol, 512)
    && isBoundedNumber(value.confidence, 0, 1)
    && isBoundedNumber(value.latencyMs, 0, Number.MAX_SAFE_INTEGER)
    && isNonemptyString(value.ringkasan, 4096)
    && Array.isArray(value.kriteria) && value.kriteria.length === 0
    && value.modelSource === 'onnx_backend'
    && typeof value.targetSupported === 'boolean'
    && value.probabilitiesCalibrated === false && value.mappingVerified === false
    && typeof value.modelId === 'string' && /^[a-fA-F0-9]{64}$/.test(value.modelId)
    && Array.isArray(value.top3) && value.top3.length === 3 && value.top3.every(isClassProbability);
}

export function classifierErrorMessage(value: unknown, fallback: string): string {
  return isRecord(value) && isNonemptyString(value.error, 4096) ? value.error : fallback;
}

export async function evaluateGlyph(input: GlyphInferenceInput): Promise<GlyphInferenceOutput> {
  if (!isGlyphRequest(input) || !isPngDataUrl(input.image)) {
    throw new Error('Snapshot PNG kanvas dan parameter aksara yang valid wajib tersedia.');
  }
  let response: Response;
  try {
    response = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Layanan klasifikasi tidak dapat dihubungi. Goresan belum dinilai.');
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(classifierErrorMessage(data, 'Klasifikasi gagal; tidak ada hasil penilaian.'));
  if (!isGlyphInferenceOutput(data)) throw new Error('Respons layanan klasifikasi tidak sesuai kontrak eksperimen.');
  return data;
}
