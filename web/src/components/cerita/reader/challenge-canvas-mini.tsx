'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ShinyButton } from '@/components/ui/shiny-button';

interface ChallengeCanvasMiniProps {
  targetGlif: {
    simbol: string;
    label: string;
    petunjuk: string;
  };
  onCanvasCompleted: () => void;
}

interface Point {
  x: number;
  y: number;
}

function UndoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ChallengeCanvasMini({
  targetGlif,
  onCanvasCompleted,
}: ChallengeCanvasMiniProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [strokes, setStrokes] = useState<Point[][]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);

  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Redraw canvas
  const redraw = useCallback(
    (ctx: CanvasRenderingContext2D, strokeList: Point[][]) => {
      const dpr = window.devicePixelRatio || 1;
      const width = ctx.canvas.width / dpr;
      const height = ctx.canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffd261';
      ctx.lineWidth = 6;
      ctx.shadowColor = 'rgba(255, 210, 97, 0.45)';
      ctx.shadowBlur = 6;

      strokeList.forEach((stroke) => {
        if (stroke.length < 1) return;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      });
    },
    []
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      redraw(ctx, strokes);
    }
  }, [redraw, strokes]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) redraw(ctx, strokes);
  }, [strokes, redraw]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isVerified || isVerifying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasCoords(e);
    currentStrokeRef.current = [pt];

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffd261';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isVerified || isVerifying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pt = getCanvasCoords(e);
    currentStrokeRef.current.push(pt);

    const ctx = canvas.getContext('2d');
    const stroke = currentStrokeRef.current;
    if (ctx && stroke.length >= 2) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffd261';
      ctx.lineWidth = 6;
      ctx.shadowColor = 'rgba(255, 210, 97, 0.45)';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.moveTo(stroke[stroke.length - 2].x, stroke[stroke.length - 2].y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // release
    }

    if (currentStrokeRef.current.length > 0) {
      setStrokes((prev) => [...prev, [...currentStrokeRef.current]]);
      currentStrokeRef.current = [];
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => (prev.length > 0 ? prev.slice(0, prev.length - 1) : []));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  const handleVerify = () => {
    if (strokes.length === 0 || isVerified) return;

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      onCanvasCompleted();

      // Audio feedback
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {
        // audio fallback
      }
    }, 800);
  };

  return (
    <div className="w-full space-y-3 rounded-2xl bg-[#0c1a2c]/95 border border-[#ffd261]/30 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd261] px-2 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30">
            Tantangan Goresan In-Story
          </span>
          <span className="text-xs text-white/60 font-medium">
            Pulihkan Aksara: {targetGlif.label} ({targetGlif.simbol})
          </span>
        </div>

        {isVerified && (
          <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
            <CheckIcon className="w-3.5 h-3.5" />
            Terverifikasi!
          </span>
        )}
      </div>

      <p className="text-xs text-white/70">{targetGlif.petunjuk}</p>

      {/* Mini Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full h-[220px] sm:h-[260px] rounded-xl overflow-hidden bg-[#070b12] border border-white/15 select-none touch-none flex items-center justify-center"
      >
        {/* Ghost Guide */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span
            className="text-8xl sm:text-9xl font-normal leading-none text-[#ffd261]/[0.15] select-none"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {targetGlif.simbol}
          </span>
          <span className="text-[10px] font-mono text-white/20 mt-1 uppercase tracking-widest">
            Panduan Bentuk
          </span>
        </div>

        {/* The Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative z-10 w-full h-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* Empty Canvas Hint */}
        {strokes.length === 0 && !isVerified && (
          <div className="pointer-events-none absolute bottom-3 left-3 text-[11px] text-white/40 font-mono">
            Goreskan karakter pada layar...
          </div>
        )}
      </div>

      {/* Toolbar & Verify Trigger */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0 || isVerified}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Urungkan"
          >
            <UndoIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0 || isVerified}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-200 border border-white/10 transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Bersihkan"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {isVerified ? (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <CheckIcon className="w-4 h-4" />
            <span>Goresan Sukses Diakui!</span>
          </div>
        ) : (
          <ShinyButton
            label={isVerifying ? 'Memeriksa Goresan...' : 'Verifikasi Goresan ⚡'}
            onClick={handleVerify}
            className={`py-2 px-4 text-xs font-bold ${
              strokes.length > 0 && !isVerifying
                ? 'cursor-pointer shadow-[0_0_16px_rgba(255,210,97,0.3)]'
                : 'opacity-40 cursor-not-allowed pointer-events-none'
            }`}
          />
        )}
      </div>
    </div>
  );
}
