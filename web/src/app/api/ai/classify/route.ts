import { NextResponse } from 'next/server';

import {
  classifierErrorMessage,
  isGlyphInferenceOutput,
  isGlyphRequest,
  isPngDataUrl,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_PIXELS,
  MAX_PNG_BYTES,
  PNG_DATA_URL_PREFIX,
  type GlyphInferenceInput,
} from '@/lib/onnx/onnx-classifier';

export const runtime = 'nodejs';

const MAX_REQUEST_BYTES = 6 * 1024 * 1024;
const MAX_RESPONSE_BYTES = 64 * 1024;
const CLASSIFIER_TIMEOUT_MS = 30_000;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

async function readBoundedJson(message: Request | Response, maxBytes: number): Promise<unknown> {
  if (!message.body || Number(message.headers.get('content-length')) > maxBytes) {
    throw new Error('Payload JSON kosong atau melebihi batas ukuran.');
  }
  const reader = message.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        throw new Error('Payload JSON melebihi batas ukuran.');
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } finally {
    reader.releaseLock();
  }
}

function isBoundedPng(image: string): boolean {
  if (!isPngDataUrl(image)) return false;
  const bytes = Buffer.from(image.slice(PNG_DATA_URL_PREFIX.length), 'base64');
  if (bytes.length < 33 || bytes.length > MAX_PNG_BYTES || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return false;
  if (bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') return false;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  return width > 0 && height > 0 && width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION
    && width * height <= MAX_IMAGE_PIXELS;
}

async function proxyPrediction(body: GlyphInferenceInput) {
  try {
    const baseUrl = process.env.AI_CLASSIFIER_URL ?? 'http://127.0.0.1:8000';
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/predict`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Invalid classifier URL');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(CLASSIFIER_TIMEOUT_MS),
    });
    const data = await readBoundedJson(response, MAX_RESPONSE_BYTES);
    if (!response.ok) {
      const status = [400, 422, 503].includes(response.status) ? response.status : 503;
      return NextResponse.json({ error: classifierErrorMessage(data, 'Layanan klasifikasi gagal memproses kanvas.') }, { status });
    }
    if (!isGlyphInferenceOutput(data)) throw new Error('Invalid classifier response');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Layanan klasifikasi lokal tidak tersedia atau responsnya tidak valid. Tidak ada hasil penilaian.' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await readBoundedJson(req, MAX_REQUEST_BYTES);
  } catch {
    return NextResponse.json({ error: 'Request harus berupa JSON valid berukuran maksimal 6 MiB.' }, { status: 422 });
  }
  if (!isGlyphRequest(body)) {
    return NextResponse.json({ error: 'aksaraId harus sunda/lontara/bali, karakterSlug 1–128 karakter, image string PNG, dan dimensi opsional positif hingga 2048.' }, { status: 422 });
  }
  if (!isBoundedPng(body.image)) {
    return NextResponse.json({ error: 'Citra harus PNG data URL valid, maksimal 4 MiB, sisi 2048 dan 1.048.576 piksel.' }, { status: 400 });
  }
  return proxyPrediction(body);
}
