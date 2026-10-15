'use client';

import React from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';
import type { GlifData, AksaraDetail } from '@/data/aksara/trinitas';
import type { GlyphInferenceOutput } from '@/lib/onnx/onnx-classifier';

export interface EvaluationResult {
  score: number;
  status: 'sempurna' | 'bagus' | 'kurang' | 'perlu_review';
  ringkasan: string;
  kriteria?: {
    label: string;
    lulus: boolean;
    catatan: string;
  }[];
  predictedSymbol?: string;
  confidence?: number;
  latencyMs?: number;
  modelSource?: string;
}

interface AiEvaluationPanelProps {
  aksara: AksaraDetail;
  glif: GlifData;
  nextGlif?: GlifData;
  strokeCount: number;
  isEvaluating: boolean;
  evaluationResult: EvaluationResult | GlyphInferenceOutput | null;
  evaluationError?: string | null;
  onEvaluate: () => void;
  onResetEvaluation: () => void;
  onPlayPronunciation?: () => void;
}

function VolumeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function CheckIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function StarIcon({ className = 'w-3.5 h-3.5', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? '0' : '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function AiEvaluationPanel({
  aksara,
  glif,
  nextGlif,
  strokeCount,
  isEvaluating,
  evaluationResult,
  evaluationError,
  onEvaluate,
  onResetEvaluation,
  onPlayPronunciation,
}: AiEvaluationPanelProps) {
  const canEvaluate = strokeCount > 0 && !isEvaluating;

  return (
    <OrnateFrame className="w-full bg-[#0c1a2c]/85 backdrop-blur-xl border border-[#D4A373]/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        {/* ================================================================
            1. TOP ROW: CATEGORY, XP & TARGET GLIF CARD
            ================================================================ */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30">
              {glif.kategori === 'konsonan'
                ? 'Konsonan Inti'
                : glif.kategori === 'vokal'
                ? 'Vokal Swara'
                : 'Diakritik'}
            </span>
            <span className="text-[10px] font-medium text-white/50">• {aksara.nama}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            <SparklesIcon className="w-3 h-3 text-[#ffd261]" />
            <span>+{glif.xp} XP</span>
          </div>
        </div>

        {/* Target Glyph Reference Display */}
        <div className="rounded-2xl border border-[#D4A373]/25 bg-gradient-to-b from-[#141721]/90 to-[#0A0C12]/95 p-4 text-center relative flex flex-col items-center justify-center">
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(255, 210, 97, 0.12) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center">
            <span
              className="text-6xl sm:text-7xl text-[#ffd261] font-normal leading-none drop-shadow-[0_4px_24px_rgba(255,210,97,0.45)] select-none transition-transform hover:scale-105 duration-200"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {glif.simbol}
            </span>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-philosopher)' }}>
                {glif.label}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/25">
                {glif.ipa}
              </span>

              {/* Pronunciation Sound Button */}
              {onPlayPronunciation && (
                <button
                  type="button"
                  onClick={onPlayPronunciation}
                  title={`Dengarkan pelafalan ${glif.label}`}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-[#ffd261]/20 active:scale-90 text-[#ffd261] border border-white/10 hover:border-[#ffd261]/40 transition-all cursor-pointer"
                >
                  <VolumeIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-white/60 mt-1">{glif.artikulasi}</p>
          </div>
        </div>

        {/* Linguistic Notes */}
        <p className="text-xs text-white/70 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/10">
          <strong className="text-[#ffd261] block mb-0.5">Catatan Paleografi:</strong>
          {glif.catatan}
        </p>

        {/* Difficulty & Strokes Tracker */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-white/50 block mb-0.5">Tingkat Kesulitan:</span>
            <div className="flex items-center gap-1 text-[#ffd261]">
              <StarIcon filled={glif.kesulitan >= 1} />
              <StarIcon filled={glif.kesulitan >= 2} />
              <StarIcon filled={glif.kesulitan >= 3} />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-white/50 block mb-0.5">Goresan Terdeteksi:</span>
            <span className="font-mono text-[#ffd261] font-bold text-sm">
              {strokeCount} {strokeCount === 1 ? 'stroke' : 'strokes'}
            </span>
          </div>
        </div>

        {/* ================================================================
            2. AI EVALUATION SECTION
        ================================================================ */}
        <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#ffd261]">
              <SparklesIcon className="w-3.5 h-3.5 text-[#ffd261]" />
              <span>Evaluasi AI Real-time</span>
            </div>
            {evaluationResult && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                AI Analisis Selesai
              </span>
            )}
          </div>

          {evaluationError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
              {evaluationError}
            </div>
          )}

          {/* STATE A: EVALUATION RESULT VIEW */}
          {evaluationResult ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-400">
              {/* Score Gauge Card */}
              <div className="rounded-xl border border-[#ffd261]/30 bg-gradient-to-r from-[#ffd261]/15 via-white/[0.03] to-transparent p-4 flex items-center justify-between shadow-[0_0_20px_rgba(255,210,97,0.15)]">
                <div>
                  <span className="text-[10px] font-medium text-white/60 block">Akurasi Bentuk Glif</span>
                  <div className="text-3xl font-extrabold text-[#ffd261] font-mono animate-score-pop">
                    {evaluationResult.score}%
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                    {evaluationResult.status === 'sempurna'
                      ? 'Goresan Sangat Akurat!'
                      : evaluationResult.status === 'bagus'
                      ? 'Bentuk Cukup Presisi'
                      : evaluationResult.status === 'kurang'
                      ? 'Perlu Sedikit Perbaikan'
                      : 'Perlu Ditinjau'}
                  </span>
                </div>

                <div className="text-right max-w-[150px]">
                  <p className="text-[11px] text-white/70 leading-tight">
                    {evaluationResult.ringkasan}
                  </p>
                </div>
              </div>

              {/* Top-3 predictions if available */}
              {'top3' in evaluationResult && Array.isArray(evaluationResult.top3) && evaluationResult.top3.length > 0 && (
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs space-y-1.5">
                  <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                    Prediksi Model Specialist:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluationResult.top3.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80 font-mono text-[11px]"
                      >
                        {item.sourceLabel}: {(item.probability * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Criteria Breakdown */}
              {evaluationResult.kriteria && evaluationResult.kriteria.length > 0 && (
                <div className="space-y-1.5">
                  {evaluationResult.kriteria.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs flex items-start gap-2"
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                          item.lulus ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.lulus ? '✓' : '•'}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-white/90">{item.label}</div>
                        <p className="text-[11px] text-white/60 mt-0.5">{item.catatan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons: Next Character or Retry */}
              <div className="flex flex-col gap-2 pt-2">
                {nextGlif ? (
                  <Link
                    href={`/latihan/web/${aksara.id}/${nextGlif.slug}`}
                    className="w-full"
                  >
                    <ShinyButton
                      label={`Lanjut ke Karakter ${nextGlif.label} (${nextGlif.simbol}) →`}
                      className="w-full py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01] transition-all"
                    />
                  </Link>
                ) : (
                  <Link href="/latihan/web/hasil" className="w-full">
                    <ShinyButton
                      label="Selesaikan Seluruh Sesi Latihan →"
                      className="w-full py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01] transition-all"
                    />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={onResetEvaluation}
                  className="w-full py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer"
                >
                  Ulangi Goresan (Coba Lagi)
                </button>
              </div>
            </div>
          ) : (
            /* STATE B: IDLE / READY TO EVALUATE VIEW */
            <div className="space-y-3">
              <p className="text-xs text-white/60 leading-relaxed">
                {strokeCount === 0
                  ? 'Goreskan karakter pada kanvas di samping, lalu tekan tombol periksa untuk menganalisis akurasi geometri goresanmu.'
                  : `Tercatat ${strokeCount} goresan. Kanvas siap dievaluasi oleh sistem pengenal AI.`}
              </p>

              {/* Primary Evaluate Trigger */}
              <ShinyButton
                label={
                  isEvaluating
                    ? 'Memindai Goresan AI...'
                    : strokeCount === 0
                    ? 'Buat Goresan Terlebih Dahulu'
                    : 'Periksa AI (Evaluasi)'
                }
                onClick={onEvaluate}
                className={`w-full py-3 text-sm font-semibold transition-all ${
                  canEvaluate
                    ? 'cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01]'
                    : 'opacity-40 cursor-not-allowed pointer-events-none'
                }`}
              />

              {/* Navigation to catalog or summary */}
              <div className="pt-2 flex items-center justify-between text-xs text-white/50 border-t border-white/10">
                <Link
                  href={`/latihan/web/${aksara.id}`}
                  className="hover:text-[#ffd261] transition-colors"
                >
                  ← Daftar Glif {aksara.nama}
                </Link>
                <Link
                  href="/latihan/web/hasil"
                  className="hover:text-[#ffd261] transition-colors"
                >
                  Selesaikan Sesi
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </OrnateFrame>
  );
}

// ============================================================================
// TODO: BACKEND / ONNX INTEGRATION
//
// Endpoint target:
// POST /api/evaluasi-goresan
// Body Payload:
// {
//   aksaraId: string;       // e.g. "lontara" | "sunda" | "bali"
//   karakterSlug: string;   // e.g. "ka"
//   imageBase64: string;    // Data URL PNG dari canvas.toDataURL()
//   strokes: { x: number; y: number; pressure?: number }[][];
// }
//
// Model On-Device (ONNX Runtime Web):
// import * as ort from 'onnxruntime-web';
// const session = await ort.InferenceSession.create('/models/aksara-lontara.onnx');
// const inputTensor = preprocessCanvas(canvas);
// const results = await session.run({ input: inputTensor });
// ============================================================================
