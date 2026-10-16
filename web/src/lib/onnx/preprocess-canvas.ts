const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
const GRAY_LEVELS = 256;
const WHITE = 255;
const POLARITY_THRESHOLD = 127.5;
const PADDING_FACTOR = 1.4;

export type PreprocessResult =
  | { status: 'ok'; tensor: Float32Array; width: number; height: number }
  | { status: 'empty' };

interface CropGeometry {
  bbox: [number, number, number, number];
  square_side: number;
  crop_origin: [number, number];
}

function perimeterMedian(gray: Uint8Array, width: number, height: number): number {
  const values: number[] = [];
  for (let x = 0; x < width; x++) values.push(gray[x]);
  if (height > 1) {
    for (let x = 0; x < width; x++) values.push(gray[(height - 1) * width + x]);
  }
  for (let y = 1; y < height - 1; y++) {
    values.push(gray[y * width]);
    if (width > 1) values.push(gray[y * width + width - 1]);
  }
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

function otsu(histogram: Float64Array, total: number): number {
  let weightedTotal = 0;
  for (let i = 0; i < GRAY_LEVELS; i++) weightedTotal += i * histogram[i];
  let backgroundCount = 0, backgroundSum = 0, best = -1, threshold = 0;
  for (let i = 0; i < GRAY_LEVELS; i++) {
    backgroundCount += histogram[i];
    backgroundSum += i * histogram[i];
    const foregroundCount = total - backgroundCount;
    if (!backgroundCount || !foregroundCount) continue;
    const delta = backgroundSum / backgroundCount - (weightedTotal - backgroundSum) / foregroundCount;
    const score = backgroundCount * foregroundCount * delta * delta;
    if (score > best) {
      best = score;
      threshold = i;
    }
  }
  return threshold;
}

function foregroundBounds(gray: Uint8Array, width: number, height: number, threshold: number) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (gray[y * width + x] > threshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY };
}

function geometry(gray: Uint8Array, width: number, height: number): CropGeometry | { bbox: null } {
  const histogram = new Float64Array(GRAY_LEVELS);
  let min = WHITE, max = 0;
  for (const value of gray) {
    histogram[value]++;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (min === max) return { bbox: null };
  const threshold = otsu(histogram, gray.length);
  const { minX, minY, maxX, maxY } = foregroundBounds(gray, width, height, threshold);
  if (maxX < 0) return { bbox: null };
  const side = Math.ceil(PADDING_FACTOR * Math.max(maxX - minX + 1, maxY - minY + 1));
  return {
    bbox: [minX, minY, maxX, maxY],
    square_side: side,
    crop_origin: [(minX + maxX + 1 - side) / 2, (minY + maxY + 1 - side) / 2],
  };
}

function resize(gray: Uint8Array, width: number, height: number, meta: CropGeometry, size: number): Float32Array {
  const tensor = new Float32Array(3 * size * size);
  const sample = (x: number, y: number) => x < 0 || y < 0 || x >= width || y >= height ? WHITE : gray[y * width + x];
  const side = meta.square_side;
  const offsets = new Float64Array(size);
  for (let i = 0; i < size; i++) offsets[i] = Math.max(0, Math.min(side - 1, (i + 0.5) * side / size - 0.5));
  for (let y = 0; y < size; y++) {
    const sy = offsets[y] + meta.crop_origin[1], y0 = Math.floor(sy), wy = sy - y0;
    for (let x = 0; x < size; x++) {
      const sx = offsets[x] + meta.crop_origin[0], x0 = Math.floor(sx), wx = sx - x0;
      const top = sample(x0, y0) * (1 - wx) + sample(x0 + 1, y0) * wx;
      const bottom = sample(x0, y0 + 1) * (1 - wx) + sample(x0 + 1, y0 + 1) * wx;
      const value = (top * (1 - wy) + bottom * wy) / WHITE;
      for (let c = 0; c < 3; c++) tensor[c * size * size + y * size + x] = (value - MEAN[c]) / STD[c];
    }
  }
  return tensor;
}

function compositeGrayscale(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const p = i * 4, alpha = data[p + 3];
    const luminance = 299 * data[p] + 587 * data[p + 1] + 114 * data[p + 2];
    // Preserve canvas-gray-v1 integer rounding and white alpha compositing.
    gray[i] = Math.floor((luminance * alpha + 255000 * (WHITE - alpha) + 127500) / 255000);
  }
  return gray;
}

// Port of ai/harness/preprocess.js; thresholding selects the crop, not the network pixels.
export function preprocessImageData(imageData: ImageData, size = 128): PreprocessResult {
  if (size !== 128 && size !== 224) throw new Error('Input size must be 128 or 224');
  const { data, width, height } = imageData;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0
    || !(data instanceof Uint8ClampedArray) || data.length !== width * height * 4) {
    throw new Error('Invalid RGBA dimensions or buffer length');
  }
  const gray = compositeGrayscale(data, width, height);
  if (perimeterMedian(gray, width, height) < POLARITY_THRESHOLD) {
    for (let i = 0; i < gray.length; i++) gray[i] = WHITE - gray[i];
  }
  const meta = geometry(gray, width, height);
  if (meta.bbox === null) return { status: 'empty' };
  return { status: 'ok', tensor: resize(gray, width, height, meta, size), width: size, height: size };
}
