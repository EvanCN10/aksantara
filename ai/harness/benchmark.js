import { localFetch, sha256, RUNTIME_VERSION } from './inference.js';

const WARMUPS = 20;
const RUNS = 200;
const MAX_BYTES = 15 * 1024 * 1024;

function percentiles(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (p) => sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)];
  return { p50_ms: percentile(0.5), p95_ms: percentile(0.95), min_ms: sorted[0], max_ms: sorted.at(-1) };
}

async function fixtureImage(manifestURL, script) {
  const url = new URL(manifestURL, location.origin);
  const fixture = await (await localFetch(url)).json();
  if (fixture.script !== script || !['selection', 'calibration', 'test'].includes(fixture.partition)
      || !['real-source', 'real-canvas'].includes(fixture.kind) || !fixture.sample_id
      || (fixture.partition === 'test' && fixture.test_frozen !== true)) throw new Error('Benchmark requires a documented held-out real image (test must be frozen).');
  const bytes = await (await localFetch(new URL(fixture.image, url))).arrayBuffer();
  if (await sha256(bytes) !== fixture.image_sha256) throw new Error('Benchmark fixture image hash mismatch');
  const bitmap = await createImageBitmap(new Blob([bytes]), { imageOrientation: 'from-image', premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width; canvas.height = bitmap.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('No benchmark canvas context');
  context.drawImage(bitmap, 0, 0); bitmap.close();
  return { fixture, canvas, context };
}

function verifyLogits(result, fixture) {
  if (!fixture.logits) return { status: 'not-provided' };
  if (fixture.logits.length !== result.logits.length) throw new Error('Browser logit parity shape mismatch');
  let error = 0;
  for (let i = 0; i < fixture.logits.length; i++) error = Math.max(error, Math.abs(fixture.logits[i] - result.logits[i]));
  const top1 = (logits) => logits.indexOf(Math.max(...logits));
  const agreement = top1(fixture.logits) === top1(result.logits);
  const tolerance = fixture.logit_tolerance ?? 1e-4;
  if (!Number.isFinite(error) || error > tolerance || !agreement) throw new Error(`Browser logit parity failed: max error ${error}, top1 agreement ${agreement}`);
  return { status: 'passed', max_absolute_error: error, tolerance, top1_agreement: agreement };
}

async function fp32Reference(url, classifier, environment, fixture) {
  if (!url) return null;
  const bytes = await (await localFetch(url)).arrayBuffer();
  const reference = JSON.parse(new TextDecoder().decode(bytes));
  if (reference.status !== 'measured' || reference.precision !== 'fp32'
      || reference.warmups < WARMUPS || reference.runs < RUNS || reference.batch !== 1
      || reference.runtime_version !== RUNTIME_VERSION || reference.execution_provider !== 'wasm' || reference.num_threads !== 1
      || reference.script !== classifier.manifest.script || reference.label_hash !== classifier.manifest.label_hash
      || reference.preprocessing_hash !== classifier.manifest.preprocessing_hash
      || reference.fixture?.image_sha256 !== fixture.image_sha256
      || !Number.isFinite(reference.end_to_end?.p95_ms) || reference.end_to_end.p95_ms <= 0
      || !Number.isInteger(reference.model_bytes) || reference.model_bytes <= 0
      || !/^[a-f0-9]{64}$/.test(reference.model_sha256)
      || reference.model_sha256 === classifier.manifest.files.model.sha256) throw new Error('Invalid or incompatible measured FP32 reference evidence.');
  for (const field of ['os', 'cpu', 'ram']) {
    if (reference.environment?.[field] !== environment[field]) throw new Error(`FP32 reference workstation ${field} mismatch`);
  }
  if (reference.environment.user_agent !== navigator.userAgent) throw new Error('FP32 reference browser mismatch');
  return { model_sha256: reference.model_sha256, bytes: reference.model_bytes,
    end_to_end: { p95_ms: reference.end_to_end.p95_ms }, evidence_sha256: await sha256(bytes),
    evidence_url: new URL(url, location.origin).pathname, warmups: reference.warmups, runs: reference.runs };
}

export async function benchmark(classifier, fixtureURL, renderResult, environment, offlineConfirmed, referenceURL = '') {
  if (!classifier.ready) throw new Error('Load a real verified ONNX model before benchmarking.');
  if (!environment.os.trim() || !environment.cpu.trim() || !environment.ram.trim()) throw new Error('Record actual workstation OS, CPU and RAM before benchmarking.');
  const { fixture, canvas, context } = await fixtureImage(fixtureURL, classifier.manifest.script);
  const reference = await fp32Reference(referenceURL, classifier, environment, fixture);
  const preprocessing = [], inference = [], totals = [];
  let last, parity;
  for (let iteration = 0; iteration < WARMUPS + RUNS; iteration++) {
    if (document.visibilityState !== 'visible') throw new Error('Benchmark interrupted: keep the tab foreground for all measurements.');
    const start = performance.now();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    last = await classifier.classify(pixels);
    if (last.status !== 'ok') throw new Error('Held-out benchmark fixture is empty; no inference measured.');
    if (iteration === 0) parity = verifyLogits(last, fixture);
    renderResult(last);
    // Two animation frames include the intervening paint, not just a DOM mutation.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (document.visibilityState !== 'visible') throw new Error('Benchmark interrupted while tab was hidden; no evidence produced.');
    const total = performance.now() - start;
    if (iteration >= WARMUPS) {
      preprocessing.push(last.preprocessing_ms); inference.push(last.inference_ms); totals.push(total);
    }
  }
  const endToEnd = percentiles(totals);
  return {
    status: 'measured', script: classifier.manifest.script,
    model_sha256: classifier.manifest.files.model.sha256,
    label_hash: classifier.manifest.label_hash, preprocessing_hash: classifier.manifest.preprocessing_hash,
    runtime_version: RUNTIME_VERSION, execution_provider: 'wasm', num_threads: 1,
    warmups: WARMUPS, runs: RUNS, batch: 1, input_size: classifier.manifest.input_size,
    precision: classifier.manifest.precision ?? 'unknown', fp32_reference: reference,
    preprocessing: percentiles(preprocessing), inference: percentiles(inference), end_to_end: endToEnd,
    cold_initialization_ms: classifier.coldInitializationMs, model_bytes: classifier.modelBytes,
    offline_verified: offlineConfirmed === true,
    offline_evidence: offlineConfirmed ? 'operator-confirmed-external-network-disabled; successful-local-assets-inference' : 'not-verified',
    latency_gate_passed: endToEnd.p95_ms < 50, size_gate_passed: classifier.modelBytes <= MAX_BYTES,
    release_runtime_gate_passed: endToEnd.p95_ms < 50 && classifier.modelBytes <= MAX_BYTES && offlineConfirmed === true,
    fixture: { ...fixture, logits: undefined }, browser_logit_parity: parity,
    environment: { ...environment, user_agent: navigator.userAgent, hardware_concurrency: navigator.hardwareConcurrency,
      device_memory_gib: navigator.deviceMemory ?? null, browser: navigator.userAgentData?.brands ?? null,
      platform: navigator.userAgentData?.platform ?? navigator.platform, dpr: devicePixelRatio },
    recorded_at: new Date().toISOString(), timing_definition: 'image-readback-through-model-output-through-intervening-animation-frame-paint',
    samples: { preprocessing_ms: preprocessing, inference_ms: inference, end_to_end_ms: totals },
  };
}
