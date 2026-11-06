'use client';

import React from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';
import type { GlifData, AksaraDetail } from '@/data/aksara/trinitas';
import {
  type GlyphInferenceOutput,
  getClassifierTarget,
  getPredictionDisplayName,
} from '@/lib/onnx/onnx-classifier';

export interface EvaluationResult {
  score: number;
  status: 'benar' | 'perlu_review';
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
}

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function CheckIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      aria-hidden="true"
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
}: AiEvaluationPanelProps) {
  const isSupported = getClassifierTarget(aksara.id as 'bali', glif.slug) !== null;
  const canEvaluate = isSupported && strokeCount > 0 && !isEvaluating;

  return (
    <OrnateFrame
      className="w-full lg:max-h-[calc(100dvh-6rem)] flex flex-col rounded-2xl overflow-hidden bg-[#0c1a2c]/85 backdrop-blur-xl border border-[#D4A373]/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
      innerClassName="flex flex-col flex-1 min-h-0 p-4 sm:p-5"
    >
      {/* 1. PINNED TOP ROW: CATEGORY & XP */}
      <div className="shrink-0 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30">
            {glif.subkategori === 'swalalita' ? 'Aksara Swalalita' : 'Wianjana Dasar'}
          </span>
          <span className="text-[11px] font-medium text-white/70">• {aksara.nama}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full shrink-0">
          <SparklesIcon className="w-3 h-3 text-[#ffd261]" />
          <span>+{glif.xp} XP</span>
        </div>
      </div>

      {/* 2. SCROLLABLE BODY */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 space-y-3 pr-1">
        {/* Compact Target Glyph Reference Display */}
        <div className="rounded-2xl border border-[#D4A373]/25 bg-gradient-to-b from-[#141721]/90 to-[#0A0C12]/95 p-3.5 sm:p-4 text-center relative flex flex-col items-center justify-between min-h-[130px] xl:min-h-[150px]">
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(255, 210, 97, 0.12) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center justify-between w-full flex-1">
            <div className="flex-1 flex items-center justify-center py-1">
              <span className="text-5xl xl:text-6xl text-[#ffd261] font-normal leading-none drop-shadow-[0_4px_24px_rgba(255,210,97,0.45)] select-none">
                {glif.simbol}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-philosopher)' }}>
                {glif.label}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/25">
                {glif.ipa}
              </span>
            </div>

            <p className="text-[11px] text-white/75 mt-1">{glif.artikulasi}</p>
          </div>
        </div>

        {/* Linguistic Notes */}
        <p className="text-xs text-white/75 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/10">
          <strong className="text-[#ffd261] block mb-0.5">Catatan Paleografi:</strong>
          {glif.catatan}
        </p>

        {/* Difficulty & Strokes Tracker */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-white/70 block mb-0.5">Tingkat Kesulitan:</span>
            <div className="flex items-center gap-1 text-[#ffd261]">
              <StarIcon filled={glif.kesulitan >= 1} />
              <StarIcon filled={glif.kesulitan >= 2} />
              <StarIcon filled={glif.kesulitan >= 3} />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-white/70 block mb-0.5">Goresan Terdeteksi:</span>
            <span className="font-mono text-[#ffd261] font-bold text-sm">
              {strokeCount} goresan
            </span>
          </div>
        </div>

        {/* AI EVALUATION STATUS & RESULT */}
        <div className="border-t border-white/10 pt-3 flex flex-col gap-2.5" aria-live="polite">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#ffd261]">
              <SparklesIcon className="w-3.5 h-3.5 text-[#ffd261]" />
              <span>Evaluasi AI ONNX Web</span>
            </div>
            {evaluationResult && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                Analisis Selesai
              </span>
            )}
          </div>

          {evaluationError && (
            <div role="alert" className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
              {evaluationError}
            </div>
          )}

          {evaluationResult ? (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-xl border border-[#ffd261]/30 bg-gradient-to-r from-[#ffd261]/15 via-white/[0.03] to-transparent p-3.5 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(255,210,97,0.15)]">
                <div>
                  <span className="text-[10px] font-medium text-white/75 block">
                    {isSupported ? 'Probabilitas Target' : 'Probabilitas Prediksi'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#ffd261] font-mono">
                    {evaluationResult.score.toLocaleString('id-ID', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </div>
                  <span
                    className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${
                      evaluationResult.status === 'benar'
                        ? 'text-emerald-300'
                        : evaluationResult.score >= 50
                        ? 'text-rose-300'
                        : 'text-amber-300'
                    }`}
                  >
                    {evaluationResult.status === 'benar' ? (
                      <>
                        <CheckIcon className="w-3.5 h-3.5" />
                        Benar! Bentuk sesuai target.
                      </>
                    ) : isSupported ? (
                      evaluationResult.predictedSymbol !== getClassifierTarget(aksara.id as 'bali', glif.slug)
                        ? 'Belum sesuai target'
                        : 'Perkuat bentuk tulisan'
                    ) : (
                      'Karakter ini belum didukung evaluasi AI'
                    )}
                  </span>
                </div>

                <div className="text-right max-w-[155px]">
                  <p className="text-[11px] text-white/80 leading-snug">
                    {evaluationResult.ringkasan}
                  </p>
                </div>
              </div>

              {/* Top-3 predictions */}
              {'top3' in evaluationResult && Array.isArray(evaluationResult.top3) && evaluationResult.top3.length > 0 && (
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs space-y-1.5">
                  <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                    3 Prediksi Teratas Model:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluationResult.top3.map((item, idx) => {
                      const displayName = getPredictionDisplayName(aksara.id as 'bali', item.sourceLabel);
                      return (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/85 font-mono text-[11px]"
                        >
                          {displayName}:{' '}
                          {(item.probability * 100).toLocaleString('id-ID', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}
                          %
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-white/65 leading-snug">
                Umpan balik bersifat bantuan belajar berbasis probabilitas bentuk ONNX, bukan penilaian resmi kualitas kaligrafi.
              </p>
            </div>
          ) : !isSupported ? (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/75 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 inline-block">
                Belum Didukung Evaluasi AI
              </span>
              <p className="text-[11px] text-white/70 leading-relaxed pt-1">
                Karakter ini dapat digambar di kanvas, namun evaluasi klasifikasi otomatis belum didukung model saat ini.
              </p>
            </div>
          ) : (
            <p className="text-xs text-white/75 leading-relaxed">
              {strokeCount === 0
                ? 'Goreskan karakter pada kanvas di samping, lalu tekan tombol periksa untuk mengklasifikasi bentuk tulisanmu.'
                : `Tercatat ${strokeCount} goresan. Kanvas siap dievaluasi oleh model ONNX di browser.`}
            </p>
          )}
        </div>
      </div>

      {/* 3. PINNED BOTTOM ACTION BAR */}
      <div className="shrink-0 pt-3 border-t border-white/10 flex flex-col gap-2">
        {evaluationResult ? (
          <>
            {nextGlif ? (
              <ShinyButton
                href={`/latihan/web/${aksara.id}/${nextGlif.slug}`}
                label={`Lanjut ke ${nextGlif.label} (${nextGlif.simbol}) →`}
                className="w-full py-2.5 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01] transition-all"
              />
            ) : (
              <ShinyButton
                href="/latihan/web/hasil"
                label="Lihat Ringkasan Sesi Latihan →"
                className="w-full py-2.5 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01] transition-all"
              />
            )}

            <button
              type="button"
              onClick={onResetEvaluation}
              className="w-full min-h-11 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/85 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              Ulangi Goresan (Coba Lagi)
            </button>
          </>
        ) : (
          <>
            <ShinyButton
              disabled={!canEvaluate}
              label={
                !isSupported
                  ? 'Belum Didukung Evaluasi AI'
                  : isEvaluating
                  ? 'Memindai Goresan AI...'
                  : strokeCount === 0
                  ? 'Buat Goresan Terlebih Dahulu'
                  : 'Periksa AI (Evaluasi)'
              }
              onClick={onEvaluate}
              className={`w-full py-2.5 text-sm font-semibold transition-all ${
                canEvaluate
                  ? 'cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01]'
                  : 'opacity-45 cursor-not-allowed'
              }`}
            />

            <div className="flex items-center justify-between text-xs text-white/70">
              <Link
                href={`/latihan/web/${aksara.id}`}
                className="inline-flex items-center min-h-11 px-1 hover:text-[#ffd261] transition-colors"
              >
                ← Daftar Glif {aksara.nama}
              </Link>
              <Link
                href="/latihan/web/hasil"
                className="inline-flex items-center min-h-11 px-1 hover:text-[#ffd261] transition-colors"
              >
                Ringkasan Sesi →
              </Link>
            </div>
          </>
        )}
      </div>
    </OrnateFrame>
  );
}
