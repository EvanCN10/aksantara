'use client';

import React from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';
import type { GlyphInferenceOutput } from '@/lib/onnx/onnx-classifier';
import type { GlifData, AksaraDetail } from '@/data/aksara/trinitas';


interface AiEvaluationPanelProps {
  aksara: AksaraDetail;
  glif: GlifData;
  nextGlif?: GlifData;
  strokeCount: number;
  isEvaluating: boolean;
  evaluationResult: GlyphInferenceOutput | null;
  evaluationError: string | null;
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
            1. TOP ROW: CATEGORY, EXPERIMENT & TARGET GLIF CARD
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
            <span>Eksperimen</span>
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
                  className="p-1 rounded-full bg-white/5 hover:bg-[#ffd261]/20 text-[#ffd261] border border-white/10 hover:border-[#ffd261]/40 transition-all cursor-pointer"
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
              <span>Klasifikasi AI Eksperimental</span>
            </div>
            {evaluationResult && (
              <span className="rounded-full border border-[#D4A373]/30 bg-[#D4A373]/15 px-2 py-0.5 font-mono text-[10px] text-[#D4A373]">
                Perlu review
              </span>
            )}
          </div>

          {evaluationError && (
            <p role="alert" className="rounded-xl border border-[#E76F51]/40 bg-[#E76F51]/10 p-3 text-xs text-[#F6F2E9]">
              {evaluationError}
            </p>
          )}

          {/* STATE A: EVALUATION RESULT VIEW */}
          {evaluationResult ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div role="status" aria-live="polite" className="space-y-3 rounded-xl border border-[#D4A373]/30 bg-white/[0.03] p-4">
                <div>
                  <span className="block text-xs text-white/70">Label sumber teratas (bukan Unicode terverifikasi)</span>
                  <strong className="break-all font-mono text-xl text-[#D4A373]">{evaluationResult.predictedSymbol}</strong>
                  <p className="text-sm text-[#F6F2E9]">
                    Probabilitas kelas: {(evaluationResult.confidence * 100).toFixed(2)}%
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-white/80">{evaluationResult.ringkasan}</p>
                <p className="text-xs leading-relaxed text-[#D4A373]">
                  {evaluationResult.targetSupported
                    ? `Probabilitas label target ${glif.slug}: ${evaluationResult.score.toFixed(2)}%. Kecocokan label sumber saja, bukan validasi bentuk.`
                    : `Target ${glif.slug} tidak memiliki label sumber unik yang cocok. Persentase yang ditampilkan adalah probabilitas kelas teratas, bukan target.`}
                </p>
                <ol aria-label="Tiga probabilitas label sumber teratas" className="space-y-2">
                  {evaluationResult.top3.map((item) => (
                    <li key={item.labelId} className="flex justify-between gap-3 border-t border-white/10 pt-2 text-xs">
                      <span className="break-all font-mono text-[#F6F2E9]">{item.sourceLabel}</span>
                      <span className="shrink-0 font-mono text-[#D4A373]">{(item.probability * 100).toFixed(2)}%</span>
                    </li>
                  ))}
                </ol>
                <p className="text-xs leading-relaxed text-white/80">
                  Probabilitas belum terkalibrasi; mapping Unicode belum terverifikasi. Hasil perlu review manusia, bukan skor kualitas tulisan atau pemeriksaan diakritik. Tidak menambah XP, penguasaan, atau progres.
                </p>
                <p className="text-xs text-white/70">ONNX backend · Latensi layanan aktual: {evaluationResult.latencyMs.toFixed(1)} ms</p>
                <details className="text-xs text-white/70">
                  <summary className="cursor-pointer">Identitas model SHA256</summary>
                  <p className="mt-1 break-all font-mono">{evaluationResult.modelId}</p>
                </details>
              </div>

              {/* Action Buttons: Next Character or Retry */}
              <div className="flex flex-col gap-2 pt-2">
                {nextGlif ? (
                  <Link
                    href={`/latihan/web/${aksara.id}/${nextGlif.slug}`}
                    className="w-full"
                  >
                    <ShinyButton
                      label={`Buka Karakter ${nextGlif.label} (${nextGlif.simbol}) →`}
                      className="w-full py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01] transition-all"
                    />
                  </Link>
                ) : (
                  <Link href={`/latihan/web/hasil?aksara=${aksara.id}`} className="w-full">
                    <ShinyButton
                      label="Akhiri Sesi Eksperimen →"
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
                  ? 'Goreskan karakter pada kanvas, lalu periksa prediksi label sumber. Probabilitas kelas bukan skor kualitas tulisan.'
                  : `Tercatat ${strokeCount} goresan. Kanvas siap dievaluasi oleh sistem pengenal AI.`}
              </p>

              {/* Primary Evaluate Trigger */}
              <ShinyButton
                label={
                  isEvaluating
                    ? 'Mengklasifikasi Citra...'
                    : strokeCount === 0
                    ? 'Buat Goresan Terlebih Dahulu'
                    : 'Periksa Klasifikasi AI'
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
                  href={`/latihan/web/hasil?aksara=${aksara.id}`}
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
