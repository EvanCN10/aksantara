'use client';

import React, { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSkenarioBab, type StoryBeat } from '@/data/cerita/skenario';
import { getKarakterById } from '@/data/cerita/karakter';
import { StoryProgressBar } from '@/components/cerita/reader/story-progress-bar';
import { DialogueStage } from '@/components/cerita/reader/dialogue-stage';
import { ChallengeQuiz } from '@/components/cerita/reader/challenge-quiz';
import { ChallengeCanvasMini } from '@/components/cerita/reader/challenge-canvas-mini';
import { ChapterCompleteModal } from '@/components/cerita/reader/chapter-complete-modal';
import { ShinyButton } from '@/components/ui/shiny-button';

interface StoryPlayerPageProps {
  params: Promise<{ judul: string; n: string }>;
}

function ArrowRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

export default function StoryPlayerPage({ params }: StoryPlayerPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);

  const rawJudul = unwrappedParams?.judul?.toLowerCase() || 'sawerigading';
  const babNomor = Number(unwrappedParams?.n) || 1;

  // Load Scenario Data
  const skenario = useMemo(() => {
    return getSkenarioBab(rawJudul, babNomor);
  }, [rawJudul, babNomor]);

  // Player State Machine
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [passedChallenges, setPassedChallenges] = useState<Record<string, boolean>>({});
  const [isChapterFinished, setIsChapterFinished] = useState(false);

  const currentBeat: StoryBeat = skenario.beats[currentBeatIndex] || skenario.beats[0];
  const companion = currentBeat.karakterId ? getKarakterById(currentBeat.karakterId) : undefined;

  const totalBeats = skenario.beats.length;
  const isLastBeat = currentBeatIndex === totalBeats - 1;

  // Validation if user can proceed to next beat
  const canProceed = useMemo(() => {
    if (currentBeat.tipe === 'pilihan') {
      return Boolean(passedChallenges[currentBeat.id]);
    }
    if (currentBeat.tipe === 'kanvas') {
      return Boolean(passedChallenges[currentBeat.id]);
    }
    return true;
  }, [currentBeat, passedChallenges]);

  // Audio Cue on Beat Step
  const playStepSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleNextBeat = () => {
    if (!canProceed) return;

    if (isLastBeat) {
      setIsChapterFinished(true);
      return;
    }

    playStepSound();
    setCurrentBeatIndex((prev) => Math.min(prev + 1, totalBeats - 1));
  };

  const handlePrevBeat = () => {
    if (currentBeatIndex > 0) {
      setCurrentBeatIndex((prev) => prev - 1);
    }
  };

  const handleChallengePassed = (beatId: string) => {
    setPassedChallenges((prev) => ({ ...prev, [beatId]: true }));
  };

  const handleReplayChapter = () => {
    setCurrentBeatIndex(0);
    setPassedChallenges({});
    setIsChapterFinished(false);
  };

  const ambientCultureColor = useMemo(() => {
    switch (skenario.aksaraId) {
      case 'sunda':
        return 'rgba(74,222,128,0.12)';
      case 'bali':
        return 'rgba(249,115,22,0.12)';
      case 'lontara':
      default:
        return 'rgba(56,189,248,0.08)';
    }
  }, [skenario.aksaraId]);

  return (
    <main className="relative min-h-screen bg-[#0c1a2c] text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/3 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.12),transparent_70%)] blur-3xl" />
        <div
          className="absolute bottom-[-10%] right-1/4 w-[650px] h-[350px] blur-3xl transition-colors duration-700"
          style={{
            background: `radial-gradient(ellipse at center, ${ambientCultureColor}, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* 1. Header with Segmented Story Progress Bar */}
      <StoryProgressBar
        totalBeats={totalBeats}
        currentBeatIndex={currentBeatIndex}
        xpReward={skenario.xpReward}
        onExitHref="/cerita"
      />

      {/* 2. Main Stage Center */}
      <div className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center gap-6">
        {/* Chapter Title Badge */}
        <div className="text-center">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#ffd261]/70 block mb-0.5">
            {skenario.eposJudul}
          </span>
          <h1
            className="text-lg sm:text-xl font-bold text-white tracking-wide"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Bab {skenario.babNomor}: {skenario.judulBab}
          </h1>
        </div>

        {/* Stage Content Based on Beat Type */}
        <div className="w-full">
          {currentBeat.tipe === 'dialog' || currentBeat.tipe === 'narasi' ? (
            <DialogueStage beat={currentBeat} companion={companion} />
          ) : currentBeat.tipe === 'pilihan' ? (
            <ChallengeQuiz
              pertanyaan={currentBeat.pertanyaan || currentBeat.teks}
              opsiJawaban={currentBeat.opsiJawaban || []}
              onCorrectAnswer={() => handleChallengePassed(currentBeat.id)}
            />
          ) : currentBeat.tipe === 'kanvas' && currentBeat.targetGlif ? (
            <ChallengeCanvasMini
              targetGlif={currentBeat.targetGlif}
              onCanvasCompleted={() => handleChallengePassed(currentBeat.id)}
            />
          ) : null}
        </div>
      </div>

      {/* 3. Bottom Navigation Bar */}
      <footer className="sticky bottom-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/90 border-t border-white/10 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Step Button */}
          <button
            type="button"
            onClick={handlePrevBeat}
            disabled={currentBeatIndex === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Step Indicator */}
          <span className="text-xs font-mono text-white/45">
            Adegan {currentBeatIndex + 1} dari {totalBeats}
          </span>

          {/* Primary Next Action Button */}
          {isLastBeat ? (
            <ShinyButton
              label="Tuntaskan Bab (Selesai) ✓"
              onClick={handleNextBeat}
              className={`py-2.5 px-5 text-xs sm:text-sm font-bold ${
                canProceed
                  ? 'cursor-pointer shadow-[0_0_20px_rgba(255,210,97,0.35)]'
                  : 'opacity-40 cursor-not-allowed pointer-events-none'
              }`}
            />
          ) : (
            <ShinyButton
              label={
                canProceed
                  ? 'Lanjutkan Cerita →'
                  : currentBeat.tipe === 'pilihan'
                  ? 'Pilih Jawaban Dulu'
                  : 'Selesaikan Goresan'
              }
              onClick={handleNextBeat}
              className={`py-2.5 px-5 text-xs sm:text-sm font-bold ${
                canProceed
                  ? 'cursor-pointer shadow-[0_0_20px_rgba(255,210,97,0.35)]'
                  : 'opacity-40 cursor-not-allowed pointer-events-none'
              }`}
            />
          )}
        </div>
      </footer>

      {/* 4. Chapter Complete Modal (Victory Screen) */}
      {isChapterFinished && (
        <ChapterCompleteModal
          eposJudul={skenario.eposJudul}
          babNomor={skenario.babNomor}
          judulBab={skenario.judulBab}
          xpReward={skenario.xpReward}
          eposSlug={skenario.eposSlug}
          hasNextChapter={skenario.babNomor < 3}
          onReplayChapter={handleReplayChapter}
        />
      )}
    </main>
  );
}

// ============================================================================
// TODO: BACKEND INTEGRATION
//
// Endpoint target saat bab dituntaskan (isChapterFinished = true):
// POST /api/cerita/save-progress
// Body Payload:
// {
//   userId: string,
//   eposSlug: string,       // e.g. "sawerigading"
//   babNomor: number,       // e.g. 1
//   starsEarned: number,    // e.g. 3
//   xpEarned: number        // e.g. 150
// }
// ============================================================================
