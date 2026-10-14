import { preprocessRGBA, preprocessingContract } from './preprocess.js';

export const RUNTIME_VERSION = '1.22.0';
const RUNTIME_BASE = '/artifacts/runtime/';
let runtimePromise;

export function canonicalJSON(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJSON(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export async function sha256(bytes) {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, '0')).join('');
}

export async function jsonHash(value) {
  return sha256(new TextEncoder().encode(canonicalJSON(value)));
}

export async function localFetch(url) {
  const resolved = new URL(url, location.origin);
  if (resolved.origin !== location.origin) throw new Error(`External assets forbidden: ${resolved}`);
  const response = await fetch(resolved, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Missing local asset ${resolved.pathname}: HTTP ${response.status}`);
  return response;
}

async function runtime() {
  if (!runtimePromise) runtimePromise = (async () => {
    const manifest = await (await localFetch(`${RUNTIME_BASE}manifest.json`)).json();
    if (manifest.version !== RUNTIME_VERSION) throw new Error(`Runtime manifest must pin ORT ${RUNTIME_VERSION}`);
    for (const name of ['ort.wasm.min.mjs', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
      await checkedFile(RUNTIME_BASE, { ...manifest.files?.[name], path: name }, 'runtime');
    }
    const ort = await import(`${RUNTIME_BASE}ort.wasm.min.mjs`);
    if (ort.env.versions?.web !== RUNTIME_VERSION) throw new Error(`ORT version mismatch; install ${RUNTIME_VERSION}`);
    ort.env.wasm.wasmPaths = RUNTIME_BASE;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    return ort;
  })().catch((error) => { runtimePromise = undefined; throw error; });
  return runtimePromise;
}

async function checkedFile(base, entry, kind) {
  if (!entry || !/^[a-f0-9]{64}$/.test(entry.sha256) || typeof entry.path !== 'string' || !/^[\w.-]+$/.test(entry.path)) {
    throw new Error(`Invalid ${kind} file manifest`);
  }
  const bytes = await (await localFetch(`${base}${entry.path}`)).arrayBuffer();
  if (await sha256(bytes) !== entry.sha256) throw new Error(`${kind} SHA256 mismatch: ${entry.path}`);
  if (entry.bytes !== undefined && bytes.byteLength !== entry.bytes) throw new Error(`${kind} size mismatch: ${entry.path}`);
  return bytes;
}

function readJSON(bytes) { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }

function validateManifest(manifest, script) {
  if (manifest.script !== script || !['lontara', 'sunda', 'bali'].includes(script)) throw new Error('Wrong script package');
  if (!Number.isInteger(manifest.num_classes) || manifest.num_classes < 2) throw new Error('Invalid class count');
  if (manifest.input_name !== 'image' || manifest.output_name !== 'logits' || manifest.layout !== 'NCHW') throw new Error('Incompatible ONNX tensor contract');
  preprocessingContract(manifest.input_size);
}

function validateLabels(labels, manifest) {
  if (!Array.isArray(labels) || labels.length !== manifest.num_classes) throw new Error('Label count mismatch');
  labels.forEach((label, index) => {
    if (label.class_id !== index || typeof label.source_label !== 'string') throw new Error('Invalid label ordering');
  });
}

export class LocalClassifier {
  async load(script, base = `/artifacts/release/${script}/`) {
    const start = performance.now();
    this.ready = false;
    if (this.session) { await this.session.release(); this.session = undefined; }
    const manifest = await (await localFetch(`${base}manifest.json`)).json();
    validateManifest(manifest, script);
    const assets = await Promise.all(['model', 'labels', 'preprocessing', 'calibration'].map((kind) => checkedFile(base, manifest.files?.[kind], kind)));
    const labelsDocument = readJSON(assets[1]);
    const labels = Array.isArray(labelsDocument) ? labelsDocument : labelsDocument[script];
    validateLabels(labels, manifest);
    // The frozen global label document can be bundled or a per-script array; hash the exact document.
    if (await jsonHash(labelsDocument) !== manifest.label_hash) throw new Error('Label semantic hash mismatch');
    const preprocessing = readJSON(assets[2]);
    if (await jsonHash(preprocessing) !== manifest.preprocessing_hash || canonicalJSON(preprocessing) !== canonicalJSON(preprocessingContract(manifest.input_size))) {
      throw new Error('Preprocessing contract/hash mismatch');
    }
    const calibration = readJSON(assets[3]);
    const threshold = calibration.accept_threshold;
    if (!Number.isFinite(calibration.temperature) || calibration.temperature <= 0 || !(threshold === null || (Number.isFinite(threshold) && threshold >= 0 && threshold <= 1))) {
      throw new Error('Invalid calibration metadata');
    }
    const ort = await runtime();
    const session = await ort.InferenceSession.create(assets[0], { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
    if (session.inputNames.length !== 1 || session.inputNames[0] !== 'image' || !session.outputNames.includes('logits')) {
      await session.release(); throw new Error('ONNX graph names incompatible');
    }
    Object.assign(this, { session, ort, manifest, labels, calibration, modelBytes: assets[0].byteLength,
      coldInitializationMs: performance.now() - start, ready: true });
    return this.manifest;
  }

  async infer(preprocessed) {
    if (!this.ready) throw new Error('No verified model loaded. Export a real ONNX package first.');
    if (preprocessed.status === 'empty') return { status: 'empty', top3: [], inference_ms: 0 };
    const size = this.manifest.input_size;
    if (preprocessed.tensor.length !== 3 * size * size) throw new Error('Input tensor shape mismatch');
    const input = new this.ort.Tensor('float32', preprocessed.tensor, [1, 3, size, size]);
    const start = performance.now();
    let output;
    try {
      output = (await this.session.run({ image: input })).logits;
      if (output.type !== 'float32' || output.dims.length !== 2 || output.dims[0] !== 1 || output.dims[1] !== this.labels.length) throw new Error('ONNX output shape/type mismatch');
      const logits = Array.from(output.data);
      if (!logits.every(Number.isFinite)) throw new Error('Nonfinite model output');
      const max = Math.max(...logits), exponentials = logits.map((value) => Math.exp(value - max));
      const denominator = exponentials.reduce((sum, value) => sum + value, 0);
      const top3 = exponentials.map((value, index) => ({ ...this.labels[index], probability: value / denominator }))
        .sort((a, b) => b.probability - a.probability).slice(0, 3);
      return { status: 'ok', top3, inference_ms: performance.now() - start,
        acceptance_eligible: this.calibration.accept_threshold !== null && top3[0].probability >= this.calibration.accept_threshold,
        calibrated: this.calibration.temperature !== 1, logits };
    } finally { input.dispose(); output?.dispose(); }
  }

  async classify(imageData) {
    if (!this.ready) throw new Error('No verified model loaded.');
    const start = performance.now();
    const preprocessed = preprocessRGBA(imageData.data, imageData.width, imageData.height, this.manifest.input_size);
    const preprocessingMs = performance.now() - start;
    return { ...await this.infer(preprocessed), preprocessing_ms: preprocessingMs,
      end_to_end_ms: performance.now() - start, metadata: preprocessed.metadata };
  }
}
