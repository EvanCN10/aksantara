import type { InferenceSession, Tensor } from 'onnxruntime-web';

import {
  CLASSIFICATION_ACCEPTANCE_THRESHOLD,
  getBaseConsonantSourceLabel,
  getClassifierTarget,
  getPredictionDisplayName,
} from './onnx-classifier';
import type { GlyphInferenceInput, GlyphInferenceOutput } from './onnx-classifier';
import { preprocessImageData } from './preprocess-canvas';
import { getSession } from './session-manager';
import type { SessionEntry } from './session-manager';

type AksaraId = GlyphInferenceInput['aksaraId'];
const INPUT_SIZE = 128;
const TOP_K = 3;
const UNSUPPORTED_TARGET = 'Karakter ini tidak tersedia dalam model latihan.';

function computeSoftmax(values: Float32Array, classCount: number, maskIndex = -1): Float64Array {
  let maxLogit = -Infinity;
  for (let i = 0; i < classCount; i++) {
    if (i === maskIndex) continue;
    const value = values[i];
    if (!Number.isFinite(value)) {
      throw new Error('Model menghasilkan logits yang tidak valid.');
    }
    if (value > maxLogit) maxLogit = value;
  }
  const probabilities = new Float64Array(classCount);
  let sum = 0;
  for (let i = 0; i < classCount; i++) {
    if (i === maskIndex) {
      probabilities[i] = 0;
      continue;
    }
    const exp = Math.exp(values[i] - maxLogit);
    probabilities[i] = exp;
    sum += exp;
  }
  if (sum > 0) {
    for (let i = 0; i < classCount; i++) probabilities[i] /= sum;
  }
  return probabilities;
}

async function inferLogits(entry: SessionEntry, pixels: Float32Array): Promise<Float32Array> {
  // Load Tensor lazily at the browser-only inference boundary, never during SSR.
  const ort = await import('onnxruntime-web/wasm');
  const input = new ort.Tensor('float32', pixels, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  let outputs: InferenceSession.ReturnType | undefined;
  try {
    outputs = await entry.session.run({ input });
    const logits = outputs.logits;
    if (!logits || logits.type !== 'float32' || logits.dims.length !== 2
      || logits.dims[0] !== 1 || logits.dims[1] !== entry.labels.length
      || !(logits.data instanceof Float32Array) || logits.data.length !== entry.labels.length) {
      throw new Error('ONNX logits contract mismatch');
    }
    return new Float32Array(logits.data);
  } finally {
    try {
      if (outputs) {
        for (const tensor of Object.values(outputs)) tensor.dispose();
      }
    } finally {
      input.dispose();
    }
  }
}

function classificationSummary(
  aksaraId: AksaraId,
  topLabel: string,
  targetLabel: string,
  confidence: number,
  accepted: boolean,
  diacriticMissing = false,
  baseLabel: string | null = null,
): string {
  const displayName = getPredictionDisplayName(aksaraId, topLabel);
  const targetName = getPredictionDisplayName(aksaraId, targetLabel);
  if (accepted) {
    const percentage = (confidence * 100).toFixed(1).replace('.', ',');
    return `Tulisan ${displayName} terdeteksi dengan keyakinan ${percentage}%.`;
  }
  if (diacriticMissing && baseLabel) {
    const baseName = getPredictionDisplayName(aksaraId, baseLabel);
    return `Bentuk konsonan dasar ${baseName} sudah terbaca dengan baik, namun tanda diakritik vokal untuk ${targetName} belum terdeteksi. Tambahkan tanda titik/imbuhan vokal yang sesuai!`;
  }
  if (topLabel !== targetLabel) {
    return `Tulisan terbaca sebagai ${displayName}, bukan ${targetName}. Coba perbaiki bentuknya.`;
  }
  return `Tulisan terbaca sebagai ${displayName}, tetapi model belum cukup yakin. Coba perjelas bentuknya.`;
}

function buildResult(
  aksaraId: AksaraId,
  entry: SessionEntry,
  probabilities: Float64Array,
  targetIndex: number,
  startMs: number,
  diacriticMissing = false,
  baseLabel: string | null = null,
): GlyphInferenceOutput {
  const ranked = Array.from(probabilities.keys()).sort((a, b) => probabilities[b] - probabilities[a]);
  const topIndex = ranked[0];
  const confidence = probabilities[topIndex];
  const accepted = topIndex === targetIndex && probabilities[targetIndex] >= CLASSIFICATION_ACCEPTANCE_THRESHOLD;
  const topLabel = entry.labels[topIndex].source_label;
  return {
    score: probabilities[targetIndex] * 100,
    status: accepted ? 'benar' : 'perlu_review',
    predictedSymbol: topLabel,
    confidence,
    latencyMs: performance.now() - startMs,
    ringkasan: classificationSummary(
      aksaraId,
      topLabel,
      entry.labels[targetIndex].source_label,
      confidence,
      accepted,
      diacriticMissing,
      baseLabel,
    ),
    kriteria: [],
    modelSource: 'onnx_web',
    targetSupported: true,
    probabilitiesCalibrated: false,
    mappingVerified: false,
    modelId: entry.modelId,
    top3: ranked.slice(0, TOP_K).map((index) => ({
      labelId: entry.labels[index].id,
      sourceLabel: entry.labels[index].source_label,
      probability: probabilities[index],
    })),
  };
}

export async function classifyInBrowser(
  aksaraId: AksaraId,
  karakterSlug: string,
  imageData: ImageData,
): Promise<GlyphInferenceOutput> {
  const startMs = performance.now();
  const targetLabel = getClassifierTarget(aksaraId, karakterSlug);
  if (typeof targetLabel !== 'string' || !targetLabel) throw new Error(UNSUPPORTED_TARGET);
  const preprocessed = preprocessImageData(imageData, INPUT_SIZE);
  if (preprocessed.status === 'empty') {
    throw new Error('Canvas kosong — tidak ada goresan yang dapat dievaluasi.');
  }
  const entry = await getSession(aksaraId);
  const targetIndex = entry.labels.findIndex((label) => label.source_label === targetLabel);
  if (targetIndex < 0) throw new Error(UNSUPPORTED_TARGET);
  const rawLogits = await inferLogits(entry, preprocessed.tensor);
  const rawProbabilities = computeSoftmax(rawLogits, entry.labels.length);

  const baseConsonant = getBaseConsonantSourceLabel(aksaraId, targetLabel);
  const baseIndex = baseConsonant ? entry.labels.findIndex((label) => label.source_label === baseConsonant) : -1;

  const probabilities = baseIndex >= 0
    ? computeSoftmax(rawLogits, entry.labels.length, baseIndex)
    : rawProbabilities;

  const ranked = Array.from(probabilities.keys()).sort((a, b) => probabilities[b] - probabilities[a]);
  const topIndex = ranked[0];
  const accepted = topIndex === targetIndex && probabilities[targetIndex] >= CLASSIFICATION_ACCEPTANCE_THRESHOLD;

  let rawTopIndex = 0;
  for (let i = 1; i < entry.labels.length; i++) {
    if (rawProbabilities[i] > rawProbabilities[rawTopIndex]) {
      rawTopIndex = i;
    }
  }
  const rawTopLabel = entry.labels[rawTopIndex].source_label;
  const rawTopConfidence = rawProbabilities[rawTopIndex];

  const diacriticMissing = !accepted
    && Boolean(baseConsonant)
    && rawTopLabel === baseConsonant
    && rawTopConfidence >= 0.5;

  return buildResult(
    aksaraId,
    entry,
    probabilities,
    targetIndex,
    startMs,
    diacriticMissing,
    baseConsonant,
  );
}
