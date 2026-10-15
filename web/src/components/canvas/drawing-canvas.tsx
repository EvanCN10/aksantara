'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type BrushSize = 'halus' | 'sedang' | 'tebal';

export interface DrawingCanvasRef {
  clear: () => void;
  undo: () => void;
  getCanvasBase64: () => string | null;
  getStrokes: () => Point[][];
  isEmpty: () => boolean;
}

interface DrawingCanvasProps {
  aksaraId: string;
  targetSymbol: string;
  targetLabel: string;
  brushSize?: BrushSize;
  showGhostGuide?: boolean;
  showGrid?: boolean;
  onStrokeChange?: (strokeCount: number) => void;
  isEvaluating?: boolean;
}

const BRUSH_WIDTHS: Record<BrushSize, number> = {
  halus: 4,
  sedang: 7,
  tebal: 11,
};

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      aksaraId,
      targetSymbol,
      targetLabel,
      brushSize = 'sedang',
      showGhostGuide = true,
      showGrid = true,
      onStrokeChange,
      isEvaluating = false,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Stroke history
    const [strokes, setStrokes] = useState<Point[][]>([]);
    const strokesRef = useRef<Point[][]>([]);
    strokesRef.current = strokes;

    const currentStrokeRef = useRef<Point[]>([]);
    const isDrawingRef = useRef(false);

    // Stroke width based on selection
    const baseLineWidth = BRUSH_WIDTHS[brushSize];

    // Redraw all strokes onto canvas
    const redrawStrokes = useCallback(
      (ctx: CanvasRenderingContext2D, strokeList: Point[][]) => {
        const dpr = window.devicePixelRatio || 1;
        const width = ctx.canvas.width / dpr;
        const height = ctx.canvas.height / dpr;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Styling for ink strokes (Luminous golden ink on dark obsidian)
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#ffd261';
        ctx.shadowColor = 'rgba(255, 210, 97, 0.45)';
        ctx.shadowBlur = 6;

        strokeList.forEach((stroke) => {
          if (stroke.length < 1) return;

          if (stroke.length === 1) {
            // Single tap dot
            const pt = stroke[0];
            const radius = (baseLineWidth * (pt.pressure || 0.6)) / 2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, Math.max(radius, 2), 0, Math.PI * 2);
            ctx.fillStyle = '#ffd261';
            ctx.fill();
            return;
          }

          // Smooth Bezier Curve interpolation
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);

          for (let i = 1; i < stroke.length - 1; i++) {
            const midX = (stroke[i].x + stroke[i + 1].x) / 2;
            const midY = (stroke[i].y + stroke[i + 1].y) / 2;
            ctx.lineWidth = baseLineWidth * (stroke[i].pressure || 1);
            ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, midX, midY);
          }

          const last = stroke[stroke.length - 1];
          const prev = stroke[stroke.length - 2];
          ctx.lineWidth = baseLineWidth * (last.pressure || 1);
          ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
          ctx.stroke();
        });
      },
      [baseLineWidth]
    );

    // Resize canvas according to container dimensions (with devicePixelRatio)
    // Isolated from strokes to prevent GPU texture reallocations during drawing
    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;

      // Set actual buffer size
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      // Scale context with setTransform for clean HiDPI rendering
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        redrawStrokes(ctx, strokesRef.current);
      }
    }, [redrawStrokes]);

    useEffect(() => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    // Update canvas whenever strokes or brush size changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) redrawStrokes(ctx, strokes);
      onStrokeChange?.(strokes.length);
    }, [strokes, redrawStrokes, onStrokeChange]);

    // Coordinate helper: translates pointer event to canvas local space
    const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const pressure = e.pressure && e.pressure > 0 ? Math.min(Math.max(e.pressure * 1.4, 0.4), 1.6) : 1;
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pressure,
      };
    };

    // Pointer Event Handlers
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isEvaluating) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // safe fallback
      }
      isDrawingRef.current = true;

      const pt = getCanvasCoordinates(e);
      currentStrokeRef.current = [pt];

      // Draw immediate dot
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.fillStyle = '#ffd261';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (baseLineWidth * (pt.pressure || 0.8)) / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || isEvaluating) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const pt = getCanvasCoordinates(e);
      const stroke = currentStrokeRef.current;
      if (stroke.length === 0) return;

      stroke.push(pt);

      // Incremental render of latest segment for responsive feedback
      const ctx = canvas.getContext('2d');
      if (ctx && stroke.length >= 2) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#ffd261';
        ctx.shadowColor = 'rgba(255, 210, 97, 0.45)';
        ctx.shadowBlur = 6;
        ctx.lineWidth = baseLineWidth * (pt.pressure || 1);

        const p1 = stroke[stroke.length - 2];
        const p2 = stroke[stroke.length - 1];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const canvas = canvasRef.current;
      if (canvas) {
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch {
          // ignore if pointer capture was already released
        }
      }

      if (currentStrokeRef.current.length > 0) {
        const completedStroke = [...currentStrokeRef.current];
        currentStrokeRef.current = [];
        setStrokes((prev) => [...prev, completedStroke]);
      }
    };

    const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = false;
      currentStrokeRef.current = [];
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch {
          // safe fallback
        }
      }
    };

    // Public API exposed via Ref
    useImperativeHandle(ref, () => ({
      clear: () => {
        isDrawingRef.current = false;
        currentStrokeRef.current = [];
        setStrokes([]);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
          }
        }
      },
      undo: () => {
        isDrawingRef.current = false;
        currentStrokeRef.current = [];
        setStrokes((prev) => (prev.length > 0 ? prev.slice(0, prev.length - 1) : []));
      },
      getCanvasBase64: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.toDataURL('image/png');
      },
      getStrokes: () => strokes,
      isEmpty: () => strokes.length === 0,
    }));

    return (
      <div
        ref={containerRef}
        className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#090d16] to-[#05070b] border border-[#D4A373]/30 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] select-none touch-none flex items-center justify-center"
      >
        {/* Subtle Manuscript Texture Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #ffd261 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Traditional Proportion Grid Guides */}
        {showGrid && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {/* Center Crosshair / Axis */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px border-b border-dashed border-[#D4A373]/20" />
            <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-px border-r border-dashed border-[#D4A373]/20" />

            {/* Proportion bounds box */}
            <div className="w-[70%] h-[70%] max-w-[340px] max-h-[340px] rounded-xl border border-[#D4A373]/15 pointer-events-none relative flex items-center justify-center">
              {/* Special Sulapa Eppa Diamond Guide for Lontara */}
              {aksaraId.toLowerCase() === 'lontara' && (
                <div className="w-[78%] h-[78%] border border-[#ffd261]/20 rotate-45 pointer-events-none" />
              )}
              {/* Meanline & Baseline indicators */}
              <div className="absolute top-[28%] inset-x-0 h-px border-b border-dotted border-[#D4A373]/10" />
              <div className="absolute bottom-[28%] inset-x-0 h-px border-b border-dotted border-[#D4A373]/10" />
            </div>
          </div>
        )}

        {/* Ghost Guide Overlay (Target Character Watermark) */}
        {showGhostGuide && (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-300"
            aria-hidden="true"
          >
            <span
              className="text-8xl sm:text-9xl md:text-[11rem] font-normal leading-none select-none text-[#ffd261]/[0.14] drop-shadow-[0_0_24px_rgba(255,210,97,0.1)] animate-ghost-breathe transition-transform"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {targetSymbol}
            </span>
            <span className="text-[11px] font-mono tracking-widest text-white/20 uppercase mt-2">
              Panduan Bentuk • {targetLabel}
            </span>
          </div>
        )}

        {/* AI Scanner Laser Line Animation (when evaluating) */}
        {isEvaluating && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-20" aria-hidden="true">
            <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-[#ffd261] to-transparent shadow-[0_0_16px_#ffd261] animate-scan-laser" />
            <div className="absolute inset-0 bg-[#ffd261]/[0.04] backdrop-blur-[1px] animate-pulse" />
          </div>
        )}

        {/* The Native Interactive Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerUp}
          className="relative z-10 w-full h-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* Empty Canvas Friendly Hint */}
        {strokes.length === 0 && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-15 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-white/45 text-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#ffd261] animate-ping" />
            <span>Gunakan mouse, stylus, atau sentuhan layar untuk mulai menulis</span>
          </div>
        )}
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
