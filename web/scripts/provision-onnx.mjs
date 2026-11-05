import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = path.join(webRoot, 'public');

// Models and WASM are committed canonically in web/public
await mkdir(path.join(publicRoot, 'models/bali'), { recursive: true });
await mkdir(path.join(publicRoot, 'wasm'), { recursive: true });

console.log('ONNX models and WASM runtime ready in web/public.');
