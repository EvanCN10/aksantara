const EXPORT_SIZE = 512;
const STROKE_WIDTH_CSS = 6;

function paintStroke(context, stroke) {
  context.lineCap = 'round'; context.lineJoin = 'round'; context.strokeStyle = '#16181f';
  context.fillStyle = '#16181f'; context.lineWidth = stroke.width;
  const first = stroke.points[0];
  context.beginPath(); context.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2); context.fill();
  if (stroke.points.length < 2) return;
  context.beginPath(); context.moveTo(first.x, first.y);
  for (let index = 1; index < stroke.points.length; index++) {
    const point = stroke.points[index]; context.lineTo(point.x, point.y);
  }
  context.stroke();
}

export class DrawingCanvas {
  constructor(canvas, reportError) {
    this.canvas = canvas; this.reportError = reportError; this.strokes = []; this.active = null;
    this.context = canvas.getContext('2d');
    if (!this.context) throw new Error('Your browser does not provide a 2D canvas context.');
    canvas.addEventListener('pointerdown', (event) => this.start(event));
    canvas.addEventListener('pointermove', (event) => this.move(event));
    canvas.addEventListener('pointerup', (event) => this.end(event));
    canvas.addEventListener('pointercancel', (event) => this.cancel(event));
    canvas.addEventListener('lostpointercapture', (event) => this.cancel(event));
    new ResizeObserver(() => this.resize()).observe(canvas);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const pixels = Math.max(1, Math.round(rect.width * (devicePixelRatio || 1)));
    this.canvas.width = pixels; this.canvas.height = pixels;
    this.context.setTransform(pixels / EXPORT_SIZE, 0, 0, pixels / EXPORT_SIZE, 0, 0);
    this.redraw();
  }

  point(event) {
    const rect = this.canvas.getBoundingClientRect();
    if (![event.clientX, event.clientY, event.pressure, rect.width, rect.height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0) return null;
    return { x: Math.max(0, Math.min(EXPORT_SIZE, (event.clientX - rect.left) * EXPORT_SIZE / rect.width)),
      y: Math.max(0, Math.min(EXPORT_SIZE, (event.clientY - rect.top) * EXPORT_SIZE / rect.height)),
      pressure: Math.max(0, Math.min(1, event.pressure)), time: performance.now() };
  }

  start(event) {
    if (this.disabled || this.active || !event.isPrimary || event.button !== 0) return;
    const point = this.point(event);
    if (!point) return;
    const mode = event.pointerType === 'pen' ? 'stylus' : event.pointerType;
    if (!['mouse', 'touch', 'stylus'].includes(mode)) return;
    if (this.inputMode && this.inputMode !== mode) { this.reportError('One input mode per sample. Clear before changing mouse/touch/stylus.'); return; }
    event.preventDefault(); this.canvas.setPointerCapture(event.pointerId); this.inputMode = mode;
    this.active = { pointer: event.pointerId, points: [point], width: STROKE_WIDTH_CSS * EXPORT_SIZE / this.canvas.getBoundingClientRect().width };
    paintStroke(this.context, this.active);
  }

  move(event) {
    if (!this.active || this.active.pointer !== event.pointerId) return;
    event.preventDefault();
    const events = event.getCoalescedEvents?.() ?? [];
    for (const sample of events.length ? events : [event]) {
      const point = this.point(sample);
      if (!point) continue;
      const previous = this.active.points.at(-1);
      this.active.points.push(point);
      // Draw only the new segment; avoid repeatedly rasterizing earlier ink.
      this.context.lineCap = 'round'; this.context.lineJoin = 'round'; this.context.strokeStyle = '#16181f';
      this.context.lineWidth = this.active.width; this.context.beginPath();
      this.context.moveTo(previous.x, previous.y); this.context.lineTo(point.x, point.y); this.context.stroke();
    }
  }

  end(event) {
    if (!this.active || this.active.pointer !== event.pointerId) return;
    this.move(event); this.strokes.push(this.active); this.active = null;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
  }

  cancel(event) {
    if (!this.active || this.active.pointer !== event.pointerId) return;
    this.active = null; this.redraw();
    if (!this.strokes.length) this.inputMode = null;
  }

  redraw(context = this.context) {
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    for (const stroke of this.strokes) paintStroke(context, stroke);
    if (this.active) paintStroke(context, this.active);
  }

  clear() { this.active = null; this.strokes = []; this.inputMode = null; this.redraw(); }
  undo() { this.active = null; this.strokes.pop(); if (!this.strokes.length) this.inputMode = null; this.redraw(); }

  snapshot() {
    if (this.active) throw new Error('Finish the active stroke before exporting or checking.');
    const canvas = document.createElement('canvas'); canvas.width = EXPORT_SIZE; canvas.height = EXPORT_SIZE;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('No export canvas context');
    this.redraw(context);
    return { canvas, imageData: context.getImageData(0, 0, EXPORT_SIZE, EXPORT_SIZE) };
  }
}
