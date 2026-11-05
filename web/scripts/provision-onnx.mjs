import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = fileURLToPath(new URL('../', import.meta.url));
const aiRoot = path.resolve(webRoot, '../ai');
const publicRoot = path.join(webRoot, 'public');

async function copyAssets(source, destination, files) {
  await mkdir(destination, { recursive: true });
  for (const file of files) await copyFile(path.join(source, file), path.join(destination, file));
}

await copyAssets(path.join(aiRoot, 'artifacts/runtime'), path.join(publicRoot, 'wasm'), [
  'ort.wasm.min.mjs', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm',
]);
for (const script of ['lontara', 'sunda', 'bali']) {
  await copyAssets(path.join(aiRoot, 'deployment/models', script), path.join(publicRoot, 'models', script), [
    'model.onnx', 'labels.json',
  ]);
}
console.log('Provisioned local ONNX models, labels and WASM runtime.');
