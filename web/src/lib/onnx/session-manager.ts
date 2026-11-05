import type { InferenceSession } from 'onnxruntime-web';

import type { GlyphInferenceInput } from './onnx-classifier';
import baliManifest from '../../../public/models/bali/manifest.json';

type AksaraId = GlyphInferenceInput['aksaraId'];

export interface LabelEntry {
  class_id: number;
  source_label: string;
  id: string;
}

export interface SessionEntry {
  session: InferenceSession;
  labels: readonly LabelEntry[];
  modelId: string;
}

const MANIFESTS: Record<string, typeof baliManifest> = { bali: baliManifest };
const sessionCache = new Map<string, Promise<SessionEntry>>();
let ortEnvConfigured = false;

function parseLabels(value: unknown, aksaraId: string): LabelEntry[] {
  const manifest = MANIFESTS[aksaraId] ?? MANIFESTS['bali'];
  if (!Array.isArray(value) || value.length !== manifest.num_classes) {
    throw new Error('Jumlah label model latihan tidak sesuai.');
  }
  const sources = new Set<string>();
  const ids = new Set<string>();
  return value.map((entry: unknown, index: number) => {
    if (typeof entry !== 'object' || entry === null || !('class_id' in entry)
      || entry.class_id !== index || !('source_label' in entry)
      || typeof entry.source_label !== 'string' || !entry.source_label.trim()
      || !('id' in entry) || entry.id !== `${aksaraId}_${index}`
      || !('script' in entry) || entry.script !== aksaraId
      || sources.has(entry.source_label) || ids.has(entry.id)) {
      throw new Error('Urutan atau identitas label model latihan tidak sesuai.');
    }
    sources.add(entry.source_label);
    ids.add(entry.id);
    return { class_id: entry.class_id, source_label: entry.source_label, id: entry.id };
  });
}

async function fetchAsset(path: string): Promise<Response> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Aset model latihan gagal dimuat (HTTP ${response.status}).`);
  return response;
}

async function loadModel(aksaraId: string): Promise<{ buffer: ArrayBuffer; modelId: string }> {
  const buffer = await (await fetchAsset(`/models/${aksaraId}/model.onnx`)).arrayBuffer();
  const manifest = MANIFESTS[aksaraId] ?? MANIFESTS['bali'];
  if (buffer.byteLength !== manifest.model_bytes) throw new Error('Ukuran model latihan tidak sesuai.');
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
  const modelId = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
  if (modelId !== manifest.model_sha256) throw new Error('Identitas model latihan tidak sesuai.');
  return { buffer, modelId };
}

async function createSession(aksaraId: string): Promise<SessionEntry> {
  // Keep the browser-only WASM runtime out of SSR and the initial page bundle.
  const ort = await import('onnxruntime-web/wasm');
  if (!ortEnvConfigured) {
    ort.env.wasm.wasmPaths = '/wasm/';
    ort.env.wasm.numThreads = 1;
    ortEnvConfigured = true;
  }
  const rawLabels: unknown = await (await fetchAsset(`/models/${aksaraId}/labels.json`)).json();
  const labels = parseLabels(rawLabels, aksaraId);
  const { buffer, modelId } = await loadModel(aksaraId);
  const session = await ort.InferenceSession.create(buffer, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  });
  try {
    if (session.inputNames.length !== 1 || session.inputNames[0] !== 'input'
      || session.outputNames.length !== 1 || session.outputNames[0] !== 'logits') {
      throw new Error('ONNX graph contract mismatch');
    }
    return { session, labels, modelId };
  } catch (error) {
    await session.release();
    throw error;
  }
}

// Return the same promise to concurrent callers, including while the model is loading.
export function getSession(aksaraId: AksaraId = 'bali'): Promise<SessionEntry> {
  const scriptKey = 'bali';
  const cached = sessionCache.get(scriptKey);
  if (cached) return cached;
  const promise = createSession(scriptKey).catch((error: unknown) => {
    // A failed old load must not evict a newer load started after releaseAllSessions.
    if (sessionCache.get(scriptKey) === promise) sessionCache.delete(scriptKey);
    throw error;
  });
  sessionCache.set(scriptKey, promise);
  return promise;
}

// Call only when no classification is running; pending loads are also released.
export async function releaseAllSessions(): Promise<void> {
  const pending = Array.from(sessionCache.values());
  sessionCache.clear();
  const entries = await Promise.allSettled(pending);
  const releases = await Promise.allSettled(entries.map(async (entry) => {
    if (entry.status === 'fulfilled') await entry.value.session.release();
  }));
  const failed = releases.find((entry) => entry.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
}
