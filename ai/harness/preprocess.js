export const VERSION = 'canvas-gray-v1';
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

export function preprocessingContract(size = 128) {
  if (![128, 224].includes(size)) throw new Error('Input size must be 128 or 224');
  return {
    preprocessing_version: VERSION, size, layout: 'NCHW', channels: 3, dtype: 'float32',
    mean: MEAN, std: STD, alpha: 'white-composite', luminance: 'integer-299-587-114-round-half-up',
    polarity: 'invert-if-perimeter-median-less-than-127.5',
    foreground: 'otsu-less-or-equal-first-maximum', padding_factor: 1.4,
    bbox: 'inclusive-all-components', square_side: 'ceil(1.4*max(bbox_width,bbox_height))',
    square_origin: '(min+max+1-side)/2', outside: 'white',
    resize: 'bilinear-half-pixel-square-clamp-white-source-neighbors',
    network_input: 'grayscale-not-binarized', uniform: 'empty',
  };
}

function perimeterMedian(gray, width, height) {
  const values = [];
  for (let x = 0; x < width; x++) values.push(gray[x]);
  if (height > 1) for (let x = 0; x < width; x++) values.push(gray[(height - 1) * width + x]);
  for (let y = 1; y < height - 1; y++) {
    values.push(gray[y * width]);
    if (width > 1) values.push(gray[y * width + width - 1]);
  }
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

function otsu(histogram, total) {
  let weightedTotal = 0;
  for (let i = 0; i < 256; i++) weightedTotal += i * histogram[i];
  let backgroundCount = 0, backgroundSum = 0, best = -1, threshold = 0;
  for (let i = 0; i < 256; i++) {
    backgroundCount += histogram[i];
    backgroundSum += i * histogram[i];
    const foregroundCount = total - backgroundCount;
    if (!backgroundCount || !foregroundCount) continue;
    const delta = backgroundSum / backgroundCount - (weightedTotal - backgroundSum) / foregroundCount;
    const score = backgroundCount * foregroundCount * delta * delta;
    if (score > best) { best = score; threshold = i; }
  }
  return threshold;
}

function geometry(gray, width, height) {
  const histogram = new Float64Array(256);
  let min = 255, max = 0;
  for (const value of gray) { histogram[value]++; min = Math.min(min, value); max = Math.max(max, value); }
  if (min === max) return { bbox: null, occupancy: 0, empty_reason: 'uniform' };
  const threshold = otsu(histogram, gray.length);
  let minX = width, minY = height, maxX = -1, maxY = -1, count = 0, contact = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (gray[y * width + x] > threshold) continue;
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); count++;
      contact ||= x === 0 || y === 0 || x === width - 1 || y === height - 1;
    }
  }
  if (!count) return { bbox: null, occupancy: 0, empty_reason: 'no-foreground' };
  const side = Math.ceil(1.4 * Math.max(maxX - minX + 1, maxY - minY + 1));
  return { otsu_threshold: threshold, bbox: [minX, minY, maxX, maxY], square_side: side,
    crop_origin: [(minX + maxX + 1 - side) / 2, (minY + maxY + 1 - side) / 2],
    occupancy: count / gray.length, border_contact: contact };
}

function resize(gray, width, height, metadata, size) {
  const tensor = new Float32Array(3 * size * size);
  const sample = (x, y) => x < 0 || y < 0 || x >= width || y >= height ? 255 : gray[y * width + x];
  const side = metadata.square_side;
  const offsets = new Float64Array(size);
  for (let i = 0; i < size; i++) offsets[i] = Math.max(0, Math.min(side - 1, (i + 0.5) * side / size - 0.5));
  for (let y = 0; y < size; y++) {
    const sy = offsets[y] + metadata.crop_origin[1], y0 = Math.floor(sy), wy = sy - y0;
    for (let x = 0; x < size; x++) {
      const sx = offsets[x] + metadata.crop_origin[0], x0 = Math.floor(sx), wx = sx - x0;
      const top = sample(x0, y0) * (1 - wx) + sample(x0 + 1, y0) * wx;
      const bottom = sample(x0, y0 + 1) * (1 - wx) + sample(x0 + 1, y0 + 1) * wx;
      const value = (top * (1 - wy) + bottom * wy) / 255;
      for (let c = 0; c < 3; c++) tensor[c * size * size + y * size + x] = (value - MEAN[c]) / STD[c];
    }
  }
  return tensor;
}

export function preprocessRGBA(data, width, height, size = 128) {
  preprocessingContract(size);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || data.length !== width * height * 4) {
    throw new Error('Invalid RGBA dimensions or buffer length');
  }
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const p = i * 4, alpha = data[p + 3];
    const luminance = 299 * data[p] + 587 * data[p + 1] + 114 * data[p + 2];
    gray[i] = Math.floor((luminance * alpha + 255000 * (255 - alpha) + 127500) / 255000);
  }
  const median = perimeterMedian(gray, width, height), inverted = median < 127.5;
  if (inverted) for (let i = 0; i < gray.length; i++) gray[i] = 255 - gray[i];
  const metadata = { preprocessing_version: VERSION, width, height, ...geometry(gray, width, height),
    size, inverted, perimeter_median: median, perimeter_ambiguous: median >= 112 && median <= 143 };
  if (!metadata.bbox) return { status: 'empty', tensor: null, metadata };
  return { status: 'ok', tensor: resize(gray, width, height, metadata, size), metadata };
}

export async function checkParity(base = '/runs/preprocess-check/', evidenceSize = 128) {
  preprocessingContract(evidenceSize);
  const get = async (path) => {
    const url = new URL(path, new URL(base, location.origin));
    if (url.origin !== location.origin) throw new Error('Parity fixtures must be local same-origin assets.');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Missing parity fixture ${path}: HTTP ${response.status}`);
    return response;
  };
  const manifest = await (await get('manifest.json')).json();
  if (!Array.isArray(manifest.fixtures) || !manifest.fixtures.length || manifest.tolerance !== 1e-5) throw new Error('Invalid or empty parity fixture manifest.');
  const results = [];
  for (const fixture of manifest.fixtures) {
    const rgba = new Uint8Array(await (await get(fixture.rgba)).arrayBuffer());
    const actual = preprocessRGBA(rgba, fixture.width, fixture.height, fixture.size);
    if (actual.status !== fixture.status) throw new Error(`Parity status mismatch: ${fixture.name}`);
    let maxAbsoluteDifference = 0;
    if (actual.tensor) {
      const expected = new Float32Array(await (await get(fixture.tensor)).arrayBuffer());
      if (expected.length !== actual.tensor.length) throw new Error(`Parity shape mismatch: ${fixture.name}`);
      for (let i = 0; i < expected.length; i++) maxAbsoluteDifference = Math.max(maxAbsoluteDifference, Math.abs(actual.tensor[i] - expected[i]));
      if (!Number.isFinite(maxAbsoluteDifference) || maxAbsoluteDifference > manifest.tolerance) throw new Error(`Parity failed: ${fixture.name}: ${maxAbsoluteDifference}`);
    }
    for (const key of Object.keys(fixture.metadata)) {
      if (JSON.stringify(actual.metadata[key]) !== JSON.stringify(fixture.metadata[key])) throw new Error(`Parity metadata mismatch: ${fixture.name}: ${key}`);
    }
    results.push({ name: fixture.name, size: fixture.size, status: actual.status, max_absolute_difference: maxAbsoluteDifference });
  }
  const { jsonHash } = await import('./inference.js');
  const perSize = [];
  for (const size of [128, 224]) {
    const matching = results.filter((result) => result.size === size);
    if (!matching.length) throw new Error(`No parity fixtures for size ${size}`);
    perSize.push({ status: 'passed', input_size: size, preprocessing_hash: await jsonHash(preprocessingContract(size)),
      max_absolute_tensor_difference: Math.max(...matching.map((result) => result.max_absolute_difference)) });
  }
  return { ...perSize.find((evidence) => evidence.input_size === evidenceSize), preprocessing_version: VERSION,
    tolerance: manifest.tolerance, fixtures: results, per_size_evidence: perSize, recorded_at: new Date().toISOString() };
}
