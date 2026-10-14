'use client';

import React, { use, useState, useEffect, useMemo, useCallback } from 'react';
import { useTactileSerial } from '@/lib/serial/use-tactile-serial';
import { RAMU_MANTRA_QUESTS, SPEED_MATCH_QUESTS } from '@/data/hardware/game-quests';
import { GameHeaderBar } from '@/components/hardware/game/game-header-bar';
import { TargetQuestCard } from '@/components/hardware/game/target-quest-card';
import { TactilePadVisualizer } from '@/components/hardware/tactile-pad-visualizer';
import { VirtualCardRack } from '@/components/hardware/virtual-card-rack';
import { GameVictoryModal } from '@/components/hardware/game/game-victory-modal';

interface HardwareGamePageProps {
  params: Promise<{ jenis: string }>;
}

export default function HardwareGamePage({ params }: HardwareGamePageProps) {
  const unwrappedParams = use(params);
  const jenis = unwrappedParams?.jenis?.toLowerCase() || 'ramu-mantra';
  const isSpeedMatch = jenis === 'speed-match';

  // Game Metadata
  const gameTitle = isSpeedMatch ? 'Aksara Cepat Tanggap' : 'Ramu Mantra';
  const quests = isSpeedMatch ? SPEED_MATCH_QUESTS : RAMU_MANTRA_QUESTS;
  const totalRounds = quests.length;

  // Serial Hardware Controller
  const {
    status,
    slotKonsonan,
    slotDiakritik,
    sukuKataGabungan,
    latinGabungan,
    placeCard,
    clearSlot,
    clearBothSlots,
    activateSimulation,
  } = useTactileSerial();

  // Auto-activate simulation if not connected so user/judge can play right away
  useEffect(() => {
    if (status === 'disconnected') {
      activateSimulation();
    }
  }, [status, activateSimulation]);

  // Game Engine State
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);

  const currentQuest = quests[currentRoundIndex] || quests[0];

  // Advance to next round or finish
  const handleNextRound = useCallback(
    (isSuccess: boolean, bonusScore = 0) => {
      if (isSuccess) {
        setScore((prev) => prev + currentQuest.xpReward + bonusScore);
        setCorrectCount((prev) => prev + 1);
        setMatchStatus('success');
      } else {
        setMatchStatus('failed');
      }

      // Auto delay to let user see feedback before next round
      setTimeout(() => {
        clearBothSlots();
        setMatchStatus('idle');

        if (currentRoundIndex < totalRounds - 1) {
          setCurrentRoundIndex((prev) => prev + 1);
          setTimeLeft(15);
        } else {
          setIsGameOver(true);
        }
      }, 1400);
    },
    [currentQuest, currentRoundIndex, totalRounds, clearBothSlots]
  );

  // Timer loop for Speed Match
  useEffect(() => {
    if (!isSpeedMatch || isGameOver || matchStatus !== 'idle') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextRound(false, 0); // Timeout = round failed
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSpeedMatch, isGameOver, matchStatus, handleNextRound]);

  // Match validation effect
  useEffect(() => {
    if (isGameOver || matchStatus !== 'idle') return;

    if (!isSpeedMatch) {
      // 1. RAMU MANTRA LOGIC: Check both slot 1 and slot 2
      const ramuQuest = currentQuest as typeof RAMU_MANTRA_QUESTS[0];
      if (
        slotKonsonan?.simbol === ramuQuest.targetKonsonanSimbol &&
        slotDiakritik?.simbol === ramuQuest.targetDiakritikSimbol
      ) {
        handleNextRound(true, 0);
      }
    } else {
      // 2. SPEED MATCH LOGIC: Check target symbol in corresponding slot
      const speedQuest = currentQuest as typeof SPEED_MATCH_QUESTS[0];
      const isTargetMatched =
        speedQuest.tipe === 'konsonan'
          ? slotKonsonan?.simbol === speedQuest.targetSimbol
          : slotDiakritik?.simbol === speedQuest.targetSimbol;

      if (isTargetMatched) {
        // Speed bonus: +2 points per remaining second
        const speedBonus = timeLeft * 2;
        handleNextRound(true, speedBonus);
      }
    }
  }, [
    isSpeedMatch,
    currentQuest,
    slotKonsonan,
    slotDiakritik,
    isGameOver,
    matchStatus,
    timeLeft,
    handleNextRound,
  ]);

  const handleReplayGame = () => {
    setCurrentRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setMatchStatus('idle');
    setIsGameOver(false);
    setTimeLeft(15);
    clearBothSlots();
  };

  const otherGameHref = isSpeedMatch
    ? '/hardware/game/ramu-mantra'
    : '/hardware/game/speed-match';
  const otherGameTitle = isSpeedMatch
    ? 'Mini-Game: Ramu Mantra'
    : 'Mini-Game: Speed Match';

  return (
    <main className="relative min-h-screen bg-[#0c1a2c] text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/3 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.1),transparent_70%)] blur-3xl" />
        <div
          className={`absolute bottom-[-10%] right-1/4 w-[650px] h-[350px] blur-3xl transition-colors duration-700 ${
            isSpeedMatch
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)]'
              : 'bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.08),transparent_70%)]'
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* 1. Header Navigation Bar */}
      <GameHeaderBar
        gameTitle={gameTitle}
        currentRound={currentRoundIndex + 1}
        totalRounds={totalRounds}
        score={score}
        timeLeft={timeLeft}
        isSpeedMatch={isSpeedMatch}
        status={status}
      />

      {/* 2. Main Game Arena */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-7 flex-1 flex flex-col gap-6">
        {/* Active Target Quest Card */}
        <TargetQuestCard
          quest={currentQuest}
          isSpeedMatch={isSpeedMatch}
          matchStatus={matchStatus}
        />

        {/* Central Tactile Pad Visualizer */}
        <TactilePadVisualizer
          status={status}
          slotKonsonan={slotKonsonan}
          slotDiakritik={slotDiakritik}
          sukuKataGabungan={sukuKataGabungan}
          latinGabungan={latinGabungan}
          onClearSlot={clearSlot}
          onClearBoth={clearBothSlots}
        />

        {/* Virtual Card Rack (Clickable cards for zero-hardware play) */}
        <VirtualCardRack
          onSelectCard={placeCard}
          activeSlot1Uid={slotKonsonan?.uid}
          activeSlot2Uid={slotDiakritik?.uid}
        />
      </div>

      {/* 3. Victory Screen Modal on 5 Rounds Completed */}
      {isGameOver && (
        <GameVictoryModal
          gameTitle={gameTitle}
          totalScore={score}
          xpEarned={score}
          correctRounds={correctCount}
          totalRounds={totalRounds}
          onReplay={handleReplayGame}
          otherGameHref={otherGameHref}
          otherGameTitle={otherGameTitle}
        />
      )}

      {/* 4. Footer */}
      <footer className="w-full border-t border-white/10 py-3 px-6 text-center text-xs text-white/40">
        Aksantara Phygital Tactile Game Engine • FMIPA UGM 2026
      </footer>
    </main>
  );
}

// ============================================================================
// TODO: BACKEND INTEGRATION
//
// Endpoint target saat sesi mini-game selesai (isGameOver = true):
// POST /api/hardware/save-session
// Body Payload:
// {
//   userId: string,
//   gameJenis: "ramu-mantra" | "speed-match",
//   score: number,
//   correctRounds: number,
//   totalRounds: 5,
//   xpEarned: number
// }
// ============================================================================
