'use client';

import React, { use, useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  KATALOG_DATA,
  getAksaraData,
  type AksaraDetail,
} from '@/data/aksara/trinitas';
import { getModelTrainingCatalog } from '@/data/aksara/model-catalog';
import {
  DrawingCanvas,
  type DrawingCanvasRef,
  type BrushSize,
} from '@/components/canvas/drawing-canvas';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { AiEvaluationPanel } from '@/components/canvas/ai-evaluation-panel';
import { evaluateGlyph, getClassifierTarget, type GlyphInferenceOutput } from '@/lib/onnx/onnx-classifier';
import { useAuth } from '@/context/auth-context';
import { saveGlyphPractice } from '@/lib/supabase/progress-service';

interface LatihanCanvasPageProps {
  params: Promise<{ aksara: string; karakter: string }>;
}

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

function ChevronLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CompassIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export default function LatihanCanvasPage({ params }: LatihanCanvasPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const unwrappedParams = use(params);

  const rawKarakter = unwrappedParams?.karakter?.toLowerCase() || 'ha';

  const aksaraKey = 'bali';
  const dataAksara: AksaraDetail = getAksaraData('bali') || KATALOG_DATA['bali'];

  const trainingCatalog = getModelTrainingCatalog('bali');
  const glif = trainingCatalog.find((entry) => entry.slug === rawKarakter);
  const currentIndex = trainingCatalog.findIndex((entry) => entry.slug === rawKarakter);
  const nextGlif = trainingCatalog[currentIndex + 1];
  const prevGlif = trainingCatalog[currentIndex - 1];

  const canvasRef = useRef<DrawingCanvasRef | null>(null);
  const [brushSize, setBrushSize] = useState<BrushSize>('sedang');
  const [showGhostGuide, setShowGhostGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<GlyphInferenceOutput | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const evaluationRequestRef = useRef(0);

  useEffect(() => {
    evaluationRequestRef.current += 1;
    setIsEvaluating(false);
    setEvaluationResult(null);
    setEvaluationError(null);
    setStrokeCount(0);
    canvasRef.current?.clear();
    return () => {
      evaluationRequestRef.current += 1;
    };
  }, [aksaraKey, rawKarakter]);

  const handleStrokeChange = useCallback((count: number) => {
    setStrokeCount(count);
  }, []);

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo();
    setEvaluationResult(null);
    setEvaluationError(null);
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setStrokeCount(0);
    setEvaluationResult(null);
    setEvaluationError(null);
  }, []);

  const handleToggleGhostGuide = useCallback(() => {
    setShowGhostGuide((prev) => !prev);
  }, []);

  const handleToggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  const handleEvaluate = async () => {
    if (!glif || strokeCount === 0 || isEvaluating) return;
    const isSupported = getClassifierTarget('bali', glif.slug) !== null;
    if (!isSupported) return;
    const requestId = ++evaluationRequestRef.current;
    setIsEvaluating(true);
    setEvaluationResult(null);
    setEvaluationError(null);
    try {
      const imageData = canvasRef.current?.getImageData();
      if (!imageData) throw new Error('Snapshot kanvas tidak tersedia. Silakan coba lagi.');
      const result = await evaluateGlyph(
        {
          aksaraId: 'bali',
          karakterSlug: glif.slug,
          image: '',
        },
        imageData
      );
      if (requestId === evaluationRequestRef.current) {
        setEvaluationResult(result);
        void saveGlyphPractice(user?.id ?? 'guest_local', {
          aksaraId: 'bali',
          glifSlug: glif.slug,
          simbol: glif.simbol,
          label: glif.label,
          score: result.score,
          status: result.status === 'benar' ? (result.score >= 85 ? 'sempurna' : 'bagus') : 'kurang',
          strokeCount,
          ringkasan: result.ringkasan,
          latencyMs: result.latencyMs,
        });
      }
    } catch (error: unknown) {
      if (requestId === evaluationRequestRef.current) {
        setEvaluationError(
          error instanceof Error ? error.message : 'Klasifikasi gagal. Tidak ada hasil penilaian.'
        );
      }
    } finally {
      if (requestId === evaluationRequestRef.current) setIsEvaluating(false);
    }
  };

  const handleResetEvaluation = () => {
    handleClear();
  };

  if (!glif) {
    return (
      <main className="relative min-h-dvh bg-[#060d16] p-8 text-[#F6F2E9] flex flex-col items-center justify-center text-center">
        <h1 className="text-xl font-semibold">Karakter ini tidak tersedia dalam model latihan.</h1>
        <Link
          href={`/latihan/web/${aksaraKey}`}
          className="mt-6 inline-flex items-center min-h-11 px-4 rounded-xl bg-white/5 border border-white/15 text-[#ffd261] hover:bg-white/10 transition-all"
        >
          Kembali ke katalog {dataAksara.nama}
        </Link>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-studio-kanvas.webp"
          alt=""
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.4] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/75 to-[#060d16]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.8)_100%)]" />
      </div>

      {/* Background Ambience & Radial Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/4 w-[650px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/3 right-[-10%] w-[550px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,115,0.07),transparent_70%)] blur-3xl" />
      </div>

      {/* 1. TOP APP BAR / STUDIO HEADER */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back to Catalog */}
          <div className="flex items-center gap-3">
            <Link
              href={`/latihan/web/${aksaraKey}`}
              className="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all text-xs font-medium cursor-pointer"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Katalog {dataAksara.nama}</span>
              <span className="xs:hidden">Katalog</span>
            </Link>

            <div className="h-4 w-px bg-white/15 hidden sm:block" />

            {/* Semantic H1 Target Character Indicator */}
            <h1
              className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              <span className="sr-only">Latih Karakter </span>
              <span>{glif.label}</span>
              <span className="text-xl text-[#ffd261] font-normal leading-none drop-shadow-[0_0_8px_rgba(255,210,97,0.4)]">
                {glif.simbol}
              </span>
              <span className="hidden md:inline text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#D4A373] border border-white/10">
                {glif.ipa}
              </span>
            </h1>
          </div>

          {/* Center: Previous / Next Character Stepper */}
          <nav aria-label="Navigasi antar karakter" className="flex items-center gap-1.5">
            {prevGlif && (
              <button
                type="button"
                onClick={() => router.push(`/latihan/web/${aksaraKey}/${prevGlif.slug}`)}
                aria-label={`Karakter sebelumnya: ${prevGlif.label}`}
                title={`Karakter sebelumnya: ${prevGlif.label}`}
                className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#ffd261] items-center gap-1">
              <span>{currentIndex + 1}/{trainingCatalog.length}</span>
              <span className="text-white/70">• {glif.label}</span>
            </div>

            {nextGlif && (
              <button
                type="button"
                onClick={() => router.push(`/latihan/web/${aksaraKey}/${nextGlif.slug}`)}
                aria-label={`Karakter berikutnya: ${nextGlif.label}`}
                title={`Karakter berikutnya: ${nextGlif.label}`}
                className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
          </nav>

          {/* Right: Finish session link */}
          <div className="flex items-center gap-2">
            <Link
              href={`/latihan/web/hasil?aksara=${aksaraKey}`}
              className="inline-flex items-center gap-1 min-h-11 px-3.5 py-2 rounded-full bg-[#ffd261]/10 hover:bg-[#ffd261]/20 border border-[#ffd261]/30 text-[#ffd261] transition-all text-xs font-semibold cursor-pointer"
            >
              <span>Ringkasan Sesi</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: 2-COLUMN SPLIT STUDIO */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 lg:py-6 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* KOLOM UTAMA (COL 7 / 8): INTERACTIVE DRAWING CANVAS & TOOLBAR */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3" aria-label="Area kanvas menulis">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
                  Kanvas Tulis Aksara
                </h2>
                <span className="text-xs text-white/70 hidden sm:inline">
                  • Area Goresan Stylus / Sentuh / Mouse
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/75">
                <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="text-[11px] font-mono">ONNX Runtime Web</span>
              </div>
            </div>

            <DrawingCanvas
              ref={canvasRef}
              aksaraId={aksaraKey}
              targetSymbol={glif.simbol}
              targetLabel={glif.label}
              brushSize={brushSize}
              showGhostGuide={showGhostGuide}
              showGrid={showGrid}
              onStrokeChange={handleStrokeChange}
              isEvaluating={isEvaluating}
            />

            <CanvasToolbar
              strokeCount={strokeCount}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              showGhostGuide={showGhostGuide}
              onToggleGhostGuide={handleToggleGhostGuide}
              showGrid={showGrid}
              onToggleGrid={handleToggleGrid}
              onUndo={handleUndo}
              onClear={handleClear}
              disabled={isEvaluating}
            />

            <div className="mt-1 p-3 rounded-xl border border-white/10 bg-white/[0.03] flex items-start gap-2.5 text-xs text-white/75 leading-relaxed">
              <div className="p-1.5 rounded-lg bg-[#ffd261]/10 text-[#ffd261] shrink-0 mt-0.5">
                <CompassIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-[#ffd261] font-semibold block mb-0.5">
                  Petunjuk Tarikan Tradisional:
                </strong>
                Aksara Bali dialirkan dengan lengkungan kurvalinier yang tenang layaknya menyurat di atas daun rontal. Model menilai bentuk akhir tulisan tanpa penalti urutan goresan.
              </div>
            </div>
          </section>

          {/* KOLOM KANAN (COL 5 / 4): DETAIL HERO & PANEL EVALUASI AI (BOUNDED <= 100dvh) */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20" aria-label="Panel evaluasi AI">
            <AiEvaluationPanel
              aksara={dataAksara}
              glif={glif}
              nextGlif={nextGlif}
              strokeCount={strokeCount}
              isEvaluating={isEvaluating}
              evaluationResult={evaluationResult}
              evaluationError={evaluationError}
              onEvaluate={handleEvaluate}
              onResetEvaluation={handleResetEvaluation}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
