import { DrawingCanvas } from './drawing.js';
import { LocalClassifier, localFetch, sha256 } from './inference.js';
import { checkParity } from './preprocess.js';
import { benchmark } from './benchmark.js';

const element = (id) => document.getElementById(id);
const classifier = new LocalClassifier();
let labels, busy = false, benchmarkEvidence, parityEvidence;
const downloadURLs = [];
const drawing = new DrawingCanvas(element('canvas'), (message) => status(message, true));

function status(message, error = false) {
  element('status').textContent = message;
  element('status').dataset.error = String(error);
}

function renderResult(result) {
  element('result').textContent = JSON.stringify(result, null, 2);
}

function clearDownloads() {
  for (const url of downloadURLs.splice(0)) URL.revokeObjectURL(url);
  element('downloads').replaceChildren();
}

function downloadLink(blob, filename, text) {
  const url = URL.createObjectURL(blob); downloadURLs.push(url);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.textContent = text;
  return link;
}

function downloadJSON(value, filename) {
  const link = downloadLink(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }), filename, filename);
  link.click();
}

function showLabels() {
  const script = element('script').value;
  const records = labels[script];
  if (!Array.isArray(records) || !records.length) throw new Error(`No local labels for ${script}`);
  element('label').replaceChildren(...records.map((record) => {
    const option = document.createElement('option'); option.value = String(record.class_id);
    option.textContent = `${record.source_label} [${record.class_id}]`; return option;
  }));
  updateTarget();
}

function updateTarget() {
  element('target-description').textContent = `Target sumber: ${element('script').value} / ${element('label').selectedOptions[0]?.textContent ?? 'tidak tersedia'}. Mapping Unicode belum terverifikasi.`;
}

function identifier(id) {
  const value = element(id).value.trim();
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(value)) throw new Error(`${id}: use a pseudonymous ID of 1–64 letters, digits, '-' or '_'.`);
  return value;
}

function captureMetadata() {
  if (element('mode').value !== 'collection') throw new Error('Collection exports require collection mode without model scores.');
  if (!drawing.strokes.length || !drawing.inputMode) throw new Error('Write a real sample before export.');
  if (!element('consent-training').checked || !element('consent-research').checked) throw new Error('Explicit training and research consent is required.');
  const script = element('script').value;
  const label = labels[script][Number(element('label').value)];
  return { script, source_label: label.source_label, class_id: label.class_id,
    writer_id: identifier('writer'), session_id: identifier('session'), device_id: identifier('device'),
    input_mode: drawing.inputMode, partition: element('partition').value,
    consent: { training: true, research: true, private_upload: element('consent-upload').checked },
    captured_at: new Date().toISOString(), width: 512, height: 512, stroke_width_css: 6,
    dpr: devicePixelRatio || 1, css_canvas_width: element('canvas').getBoundingClientRect().width,
    collection_tool: 'aksantara-local-harness-v1', reference_rendering: false };
}

function rememberWriter(metadata) {
  const key = 'aksantara-capture-writer-partitions-v1';
  const registry = Object.assign(Object.create(null), JSON.parse(localStorage.getItem(key) ?? '{}'));
  const previous = Object.hasOwn(registry, metadata.writer_id) ? registry[metadata.writer_id] : null;
  if (previous && previous !== metadata.partition) throw new Error(`Writer ${metadata.writer_id} belongs to ${previous}, not ${metadata.partition}. Use the original partition.`);
  registry[metadata.writer_id] = metadata.partition;
  localStorage.setItem(key, JSON.stringify(registry));
}

async function exportCapture() {
  const metadata = captureMetadata();
  const { canvas } = drawing.snapshot();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG encoding failed');
  metadata.image_sha256 = await sha256(await blob.arrayBuffer());
  rememberWriter(metadata);
  const filename = `${metadata.script}-${metadata.writer_id}-${metadata.session_id}-${crypto.randomUUID()}`;
  clearDownloads();
  element('downloads').append(downloadLink(blob, `${filename}.png`, 'Unduh PNG'),
    downloadLink(new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' }), `${filename}.json`, 'Unduh JSON'));
  status('PNG dan metadata siap. Unduh kedua berkas; satu export bukan bukti koleksi lengkap.');
}

async function loadModel() {
  const script = element('script').value;
  status(`Loading verified local ${script} model…`);
  await classifier.load(script, element('package').value);
  status(`Loaded ${script}: ${classifier.labels.length} source labels, ${classifier.modelBytes} bytes. Calibrated probability is not handwriting accuracy.`);
}

async function changeMode() {
  const inferenceMode = element('mode').value === 'inference';
  element('collection').hidden = inferenceMode; element('inference').hidden = !inferenceMode;
  element('check').hidden = !inferenceMode; element('result').textContent = '';
  drawing.clear(); clearDownloads(); benchmarkEvidence = null;
  element('download-benchmark').disabled = true;
  if (inferenceMode) await loadModel();
  else {
    classifier.ready = false;
    if (classifier.session) { await classifier.session.release(); classifier.session = undefined; }
    status('Collection mode: no model or predictions.');
  }
}

async function changeScript() {
  showLabels(); drawing.clear(); clearDownloads();
  const script = element('script').value;
  element('package').value = `/artifacts/release/${script}/`;
  element('fixture').value = `/artifacts/release/${script}/benchmark-fixture.json`;
  benchmarkEvidence = null; element('download-benchmark').disabled = true;
  if (element('mode').value === 'inference') await loadModel();
  else status('Collection mode: no model or predictions.');
}

async function runAction(action) {
  if (busy) return;
  busy = true; drawing.disabled = true;
  const controls = [...document.querySelectorAll('button, select, input')];
  const disabled = controls.map((control) => control.disabled);
  controls.forEach((control) => { control.disabled = true; });
  try { await action(); }
  catch (error) { renderResult({ status: 'error', error: error.message }); status(error.message, true); }
  finally {
    controls.forEach((control, index) => { control.disabled = disabled[index]; });
    element('download-benchmark').disabled = !benchmarkEvidence;
    element('download-parity').disabled = !parityEvidence;
    busy = false; drawing.disabled = false;
  }
}

async function checkModel() {
  const start = performance.now();
  const result = await classifier.classify(drawing.snapshot().imageData);
  renderResult(result);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  status(result.status === 'empty' ? 'Empty canvas: no inference executed.' : `Actual local inference; click-to-visible ${ (performance.now() - start).toFixed(2) } ms. Probability is not a quality grade.`);
}

async function runBenchmark() {
  status('Benchmark running: 20 warmups + 200 measurements; keep tab foreground.');
  if (document.visibilityState !== 'visible') throw new Error('Benchmark requires a visible foreground tab.');
  benchmarkEvidence = null;
  benchmarkEvidence = await benchmark(classifier, element('fixture').value, renderResult,
    { os: element('os').value, cpu: element('cpu').value, ram: element('ram').value }, element('offline').checked,
    element('fp32-reference').value.trim());
  renderResult(benchmarkEvidence); status('Benchmark measured. Download evidence; gates are reported, never assumed.');
}

function bind() {
  element('undo').onclick = () => { drawing.undo(); clearDownloads(); element('result').textContent = ''; };
  element('clear').onclick = () => { drawing.clear(); clearDownloads(); element('result').textContent = ''; status('Canvas cleared; no predictions.'); };
  element('mode').onchange = () => runAction(changeMode);
  element('script').onchange = () => runAction(changeScript);
  element('label').onchange = () => { updateTarget(); drawing.clear(); clearDownloads(); };
  element('export').onclick = () => runAction(exportCapture);
  element('load').onclick = () => runAction(loadModel);
  element('check').onclick = () => runAction(checkModel);
  element('benchmark').onclick = () => runAction(runBenchmark);
  element('download-benchmark').onclick = () => downloadJSON(benchmarkEvidence, `browser-benchmark-${classifier.manifest.script}.json`);
  element('parity').onclick = () => runAction(async () => {
    parityEvidence = null; parityEvidence = await checkParity(element('parity-path').value, Number(element('parity-size').value));
    renderResult(parityEvidence); status('Python/JS fixture parity passed; no model inference implied.');
  });
  element('download-parity').onclick = () => downloadJSON(parityEvidence, `preprocess-browser-parity-${parityEvidence.input_size}.json`);
}

async function initialize() {
  element('session').value = `session-${crypto.randomUUID()}`;
  labels = await (await localFetch('/configs/labels.json')).json();
  showLabels(); element('package').value = '/artifacts/release/lontara/';
  element('fixture').value = '/artifacts/release/lontara/benchmark-fixture.json';
  bind(); status('Collection mode ready: no model loaded and no scores displayed.');
}

runAction(initialize);
