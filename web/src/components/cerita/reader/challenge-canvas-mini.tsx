'use client';

import React, { useRef, useState, useEffect } from 'react';
import { DrawingCanvas, type DrawingCanvasRef } from '@/components/canvas/drawing-canvas';
import { evaluateGlyph, type GlyphInferenceOutput } from '@/lib/onnx/onnx-classifier';
import { ShinyButton } from '@/components/ui/shiny-button';
import { playSuccessGamelan } from '@/lib/audio/sound-effects';

interface ChallengeCanvasMiniProps {
  aksaraId: 'lontara' | 'sunda' | 'bali';
  targetGlif: {
    slug: string;
    simbol: string;
    label: string;
    petunjuk: string;
  };
  passed?: boolean;
  onEvaluation: (result: GlyphInferenceOutput) => void;
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
  aksaraId,
  targetGlif,
  passed = false,
  onEvaluation,
}: ChallengeCanvasMiniProps) {
  const canvasRef = useRef<DrawingCanvasRef | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<GlyphInferenceOutput | null>(null);
  const requestTokenRef = useRef(0);

  // Invalidate in-flight evaluation requests on unmount
  useEffect(() => {
    return () => {
      requestTokenRef.current += 1;
    };
  }, []);

  const handleStrokeChange = (count: number) => {
    setStrokeCount(count);
    if (!passed) {
      setEvaluationError(null);
      setEvaluationResult(null);
    }
  };

  const handleUndo = () => {
    if (isVerifying || passed) return;
    canvasRef.current?.undo();
    setEvaluationError(null);
    setEvaluationResult(null);
  };

  const handleClear = () => {
    if (isVerifying || passed) return;
    canvasRef.current?.clear();
    setStrokeCount(0);
    setEvaluationError(null);
    setEvaluationResult(null);
  };

  const handleVerify = async () => {
    if (strokeCount === 0 || isVerifying || passed) return;

    const token = ++requestTokenRef.current;
    setIsVerifying(true);
    setEvaluationError(null);
    setEvaluationResult(null);

    try {
      const image = canvasRef.current?.getCanvasBase64();
      if (!image || canvasRef.current?.isEmpty()) {
        throw new Error('Goreskan karakter pada kanvas sebelum meminta verifikasi.');
      }

      const result = await evaluateGlyph({
        aksaraId,
        karakterSlug: targetGlif.slug,
        image,
      });

      if (token !== requestTokenRef.current) return;

      setEvaluationResult(result);
      if (result.status === 'benar') {
        playSuccessGamelan();
      }
      onEvaluation(result);
    } catch (err: unknown) {
      if (token !== requestTokenRef.current) return;
      setEvaluationError(err instanceof Error ? err.message : 'Verifikasi kanvas gagal.');
    } finally {
      if (token === requestTokenRef.current) {
        setIsVerifying(false);
      }
    }
  };

  const isPassed = passed || evaluationResult?.status === 'benar';

  return (
    <div className="w-full space-y-3 rounded-2xl bg-[#0c1a2c]/95 border border-[#ffd261]/30 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30">
            Tantangan Goresan In-Story
          </span>
          <span className="text-xs text-white/60 font-medium">
            Pulihkan Aksara: {targetGlif.label} ({targetGlif.simbol})
          </span>
        </div>

        {isPassed && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-emerge-scale">
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Tulisan benar menurut model</span>
          </span>
        )}
      </div>

      {/* Target Glyph Reference Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-black/40 border border-[#ffd261]/30 flex items-center justify-center text-3xl text-[#ffd261] shrink-0 font-normal shadow-[0_0_12px_rgba(255,210,97,0.25)]">
            {targetGlif.simbol}
          </div>
          <div>
            <span className="font-bold text-sm text-white block">
              Aksara {targetGlif.label}
            </span>
            <p className="text-[11px] text-white/65 leading-tight mt-0.5">
              {targetGlif.petunjuk}
            </p>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[300px] rounded-xl overflow-hidden border border-white/20 bg-[#060d16] shadow-inner">
        <DrawingCanvas
          ref={canvasRef}
          aksaraId={aksaraId}
          targetSymbol={targetGlif.simbol}
          targetLabel={targetGlif.label}
          showGhostGuide={true}
          showGrid={false}
          onStrokeChange={handleStrokeChange}
          isEvaluating={isVerifying || isPassed}
        />
      </div>

      {/* Toolbar & Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokeCount === 0 || isVerifying || isPassed}
            title="Urungkan goresan terakhir"
            className="p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <UndoIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={strokeCount === 0 || isVerifying || isPassed}
            title="Bersihkan kanvas"
            className="p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-rose-500/20 active:scale-95 text-white/70 hover:text-rose-300 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-white/40 ml-1">
            {strokeCount} goresan
          </span>
        </div>

        <div>
          {!isPassed ? (
            <ShinyButton
              label={
                isVerifying
                  ? 'Memeriksa AI...'
                  : strokeCount === 0
                  ? 'Goreskan Dulu'
                  : 'Verifikasi Goresan AI'
              }
              onClick={handleVerify}
              className={`py-2 px-4 text-xs font-semibold ${
                strokeCount > 0 && !isVerifying
                  ? 'cursor-pointer shadow-[0_0_20px_rgba(255,210,97,0.3)] hover:scale-[1.01]'
                  : 'opacity-40 cursor-not-allowed pointer-events-none'
              }`}
            />
          ) : (
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-400 block">
                Tulisan benar menurut model
              </span>
              <span className="text-[10px] text-white/50 block">
                Model eksperimen; probabilitas belum dikalibrasi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error / Feedback Notice */}
      {evaluationError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 animate-emerge-up">
          {evaluationError}
        </div>
      )}

      {evaluationResult && !isPassed && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 animate-emerge-up">
          <p className="font-semibold mb-0.5">Perlu ditinjau:</p>
          <p className="text-white/80">{evaluationResult.ringkasan}</p>
        </div>
      )}
    </div>
  );
}

export default ChallengeCanvasMini;
