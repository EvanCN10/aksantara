'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSkenarioBab, type StoryBeat } from '@/data/cerita/skenario';
import { getKarakterById } from '@/data/cerita/karakter';
import { StoryProgressBar } from '@/components/cerita/reader/story-progress-bar';
import { DialogueStage } from '@/components/cerita/reader/dialogue-stage';
import { ChallengeQuiz } from '@/components/cerita/reader/challenge-quiz';
import { ChallengeCanvasMini } from '@/components/cerita/reader/challenge-canvas-mini';
import { ChapterCompleteModal } from '@/components/cerita/reader/chapter-complete-modal';
import { ShinyButton } from '@/components/ui/shiny-button';
import { playWoodTap } from '@/lib/audio/sound-effects';

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

  // Player State Machine per beat
  interface BeatChallengeState {
    wrongAttempts: number;
    assisted: boolean;
    passed: boolean;
  }

  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [challengeStates, setChallengeStates] = useState<Record<string, BeatChallengeState>>({});
  const [replayGen, setReplayGen] = useState(0);
  const [isChapterFinished, setIsChapterFinished] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [assistanceDialog, setAssistanceDialog] = useState<{
    beatId: string;
    speakerName: string;
    text: string;
    source: 'gemini_ai' | 'deterministic_lore';
  } | null>(null);

  // Reset all state on route changes
  useEffect(() => {
    setCurrentBeatIndex(0);
    setChallengeStates({});
    setReplayGen((g) => g + 1);
    setIsChapterFinished(false);
    setRecoveryMessage(null);
    setAssistanceDialog(null);
  }, [rawJudul, babNomor]);

  const currentBeat: StoryBeat = skenario.beats[currentBeatIndex] || skenario.beats[0];
  const companion = currentBeat.karakterId ? getKarakterById(currentBeat.karakterId) : undefined;

  const totalBeats = skenario.beats.length;
  const isLastBeat = currentBeatIndex === totalBeats - 1;

  const currentBeatState: BeatChallengeState = challengeStates[currentBeat.id] ?? {
    wrongAttempts: 0,
    assisted: false,
    passed: false,
  };

  // Validation if user can proceed to next beat
  const canProceed = useMemo(() => {
    if (currentBeat.tipe === 'pilihan' || currentBeat.tipe === 'kanvas') {
      return currentBeatState.passed;
    }
    return true;
  }, [currentBeat, currentBeatState.passed]);

  const isChapterAssisted = useMemo(() => {
    return Object.values(challengeStates).some((s) => s.assisted);
  }, [challengeStates]);

  // Audio Cue on Beat Step - subtle acoustic wood tap
  const playStepSound = () => {
    playWoodTap();
  };

  const handleNextBeat = () => {
    if (!canProceed) return;

    if (isLastBeat) {
      setIsChapterFinished(true);
      return;
    }

    playStepSound();
    setRecoveryMessage(null);
    setCurrentBeatIndex((prev) => Math.min(prev + 1, totalBeats - 1));
  };

  const handlePrevBeat = () => {
    if (currentBeatIndex > 0) {
      setRecoveryMessage(null);
      setCurrentBeatIndex((prev) => prev - 1);
    }
  };

  const requestAssistance = (beat: StoryBeat, wrongContext: string) => {
    const fallbackText = beat.petunjukBantuan || beat.targetGlif?.petunjuk || beat.teks;
    const speaker = companion?.nama || beat.pembicaraNama || 'Pendamping';

    // Set local assistance immediately without locking navigation
    setAssistanceDialog({
      beatId: beat.id,
      speakerName: speaker,
      text: fallbackText,
      source: 'deterministic_lore',
    });

    // Call background AI enrichment
    fetch('/api/ai/story-enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        karakterId: beat.karakterId || 'sawerigading',
        pembicaraNama: speaker,
        konteksCerita: `${beat.pertanyaan || beat.teks}. ${wrongContext}. Petunjuk: ${fallbackText}`,
        aksaraId: skenario.aksaraId,
        glifTarget: beat.targetGlif?.label || beat.aksaraHighlight?.label,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          (data as { success: boolean }).success &&
          'dialog' in data &&
          typeof (data as { dialog: string }).dialog === 'string' &&
          (data as { dialog: string }).dialog.trim().length > 0
        ) {
          const enrichedText = (data as { dialog: string }).dialog.trim();
          const source = (data as { source?: string }).source === 'gemini_ai' ? 'gemini_ai' : 'deterministic_lore';
          setAssistanceDialog((prev) =>
            prev && prev.beatId === beat.id
              ? {
                  beatId: beat.id,
                  speakerName: speaker,
                  text: enrichedText,
                  source,
                }
              : prev
          );
        }
      })
      .catch(() => {
        // Fallback remains in place
      });
  };

  const handleQuizAttempt = (optionId: string, correct: boolean) => {
    if (currentBeatState.passed) return;

    if (correct) {
      const assisted = currentBeatState.assisted;
      setChallengeStates((prev) => ({
        ...prev,
        [currentBeat.id]: {
          wrongAttempts: currentBeatState.wrongAttempts,
          assisted,
          passed: true,
        },
      }));
      if (assisted) {
        setRecoveryMessage('Kamu menyelesaikan tantangan dengan bantuan.');
      } else {
        setRecoveryMessage(null);
      }
    } else {
      const nextWrong = currentBeatState.wrongAttempts + 1;
      const nextAssisted = nextWrong >= 2 || currentBeatState.assisted;
      setChallengeStates((prev) => ({
        ...prev,
        [currentBeat.id]: {
          wrongAttempts: nextWrong,
          assisted: nextAssisted,
          passed: false,
        },
      }));

      if (nextWrong === 1) {
        setRecoveryMessage('Belum tepat. Mari perhatikan petunjuknya.');
      } else if (nextWrong === 2) {
        const selectedOpt = currentBeat.opsiJawaban?.find((o) => o.id === optionId);
        requestAssistance(currentBeat, `Jawaban salah yang dipilih: ${selectedOpt?.teks || optionId}`);
      }
    }
  };

  const handleCanvasEvaluation = (result: import('@/lib/onnx/onnx-classifier').GlyphInferenceOutput) => {
    if (currentBeatState.passed) return;

    if (result.status === 'benar') {
      const assisted = currentBeatState.assisted;
      setChallengeStates((prev) => ({
        ...prev,
        [currentBeat.id]: {
          wrongAttempts: currentBeatState.wrongAttempts,
          assisted,
          passed: true,
        },
      }));
      if (assisted) {
        setRecoveryMessage('Kamu menyelesaikan tantangan dengan bantuan.');
      } else {
        setRecoveryMessage(null);
      }
    } else if (result.targetSupported && result.status === 'perlu_review') {
      // Mismatch / low probability counts as attempt
      const nextWrong = currentBeatState.wrongAttempts + 1;
      const nextAssisted = nextWrong >= 2 || currentBeatState.assisted;
      setChallengeStates((prev) => ({
        ...prev,
        [currentBeat.id]: {
          wrongAttempts: nextWrong,
          assisted: nextAssisted,
          passed: false,
        },
      }));

      if (nextWrong === 1) {
        setRecoveryMessage(null);
      } else if (nextWrong === 2) {
        requestAssistance(
          currentBeat,
          `Goresan kanvas diprediksi sebagai '${result.predictedSymbol}' (skor: ${result.score.toFixed(1)}%)`
        );
      }
    }
  };

  const handleReplayChapter = () => {
    setCurrentBeatIndex(0);
    setChallengeStates({});
    setReplayGen((g) => g + 1);
    setRecoveryMessage(null);
    setAssistanceDialog(null);
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
    <main className="relative min-h-screen text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Dynamic Thematic Chapter Scene Background */}
      {skenario.sceneBg && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
          <Image
            src={skenario.sceneBg}
            alt={skenario.judulBab}
            fill
            priority={true}
            quality={90}
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.75] contrast-[1.05] saturate-[1.10] transition-all duration-1000"
          />
          {/* Multi-layered cinematic vignette & contrast control */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2c] via-[#0c1a2c]/35 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(12,26,44,0.65)_100%)]" />
        </div>
      )}

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
        <div className="text-center animate-emerge-up" style={{ animationDelay: '100ms' }}>
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
        <div className="w-full flex flex-col gap-4 animate-emerge-up" style={{ animationDelay: '180ms' }}>
          {currentBeat.tipe === 'dialog' || currentBeat.tipe === 'narasi' ? (
            <DialogueStage beat={currentBeat} companion={companion} />
          ) : currentBeat.tipe === 'pilihan' ? (
            <div className="space-y-4">
              <ChallengeQuiz
                key={`${currentBeat.id}-${replayGen}`}
                pertanyaan={currentBeat.pertanyaan || currentBeat.teks}
                opsiJawaban={currentBeat.opsiJawaban || []}
                passed={currentBeatState.passed}
                onAttempt={handleQuizAttempt}
              />
              {recoveryMessage && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 animate-emerge-up">
                  <p className="font-medium">{recoveryMessage}</p>
                </div>
              )}
              {assistanceDialog && assistanceDialog.beatId === currentBeat.id && (
                <div className="pt-2 animate-emerge-up">
                  <DialogueStage
                    beat={{
                      id: `assist-${currentBeat.id}`,
                      tipe: 'dialog',
                      karakterId: currentBeat.karakterId,
                      pembicaraNama: assistanceDialog.speakerName,
                      teks: assistanceDialog.text,
                    }}
                    companion={companion}
                    source={assistanceDialog.source}
                  />
                </div>
              )}
            </div>
          ) : currentBeat.tipe === 'kanvas' && currentBeat.targetGlif ? (
            <div className="space-y-4">
              <ChallengeCanvasMini
                key={`${currentBeat.id}-${replayGen}`}
                aksaraId={skenario.aksaraId}
                targetGlif={currentBeat.targetGlif}
                passed={currentBeatState.passed}
                onEvaluation={handleCanvasEvaluation}
              />
              {recoveryMessage && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 animate-emerge-up">
                  <p className="font-medium">{recoveryMessage}</p>
                </div>
              )}
              {assistanceDialog && assistanceDialog.beatId === currentBeat.id && (
                <div className="pt-2 animate-emerge-up">
                  <DialogueStage
                    beat={{
                      id: `assist-${currentBeat.id}`,
                      tipe: 'dialog',
                      karakterId: currentBeat.karakterId,
                      pembicaraNama: assistanceDialog.speakerName,
                      teks: assistanceDialog.text,
                    }}
                    companion={companion}
                    source={assistanceDialog.source}
                  />
                </div>
              )}
            </div>
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

          {/* Primary Next Action Button with Beacon Pulse */}
          <div className={canProceed ? 'animate-beacon-pulse rounded-full' : ''}>
            {isLastBeat ? (
              <ShinyButton
                label="Tuntaskan Bab (Selesai) ✓"
                onClick={handleNextBeat}
                className={`py-2.5 px-5 text-xs sm:text-sm font-bold ${
                  canProceed
                    ? 'cursor-pointer shadow-[0_0_20px_rgba(255,210,97,0.35)] hover:scale-[1.01]'
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
                    ? 'cursor-pointer shadow-[0_0_20px_rgba(255,210,97,0.35)] hover:scale-[1.01]'
                    : 'opacity-40 cursor-not-allowed pointer-events-none'
                }`}
              />
            )}
          </div>
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
          assisted={isChapterAssisted}
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
