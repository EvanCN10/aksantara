'use client';

import React, { use, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTactileSerial } from '@/lib/serial/use-tactile-serial';
import {
  getGameQuests,
  type HardwareGameKind,
  type HardwareGameDeck,
} from '@/data/hardware/game-quests';
import { GameHeaderBar } from '@/components/hardware/game/game-header-bar';
import { TargetQuestCard } from '@/components/hardware/game/target-quest-card';
import { TactilePadVisualizer } from '@/components/hardware/tactile-pad-visualizer';
import { VirtualCardRack } from '@/components/hardware/virtual-card-rack';
import { GameVictoryModal } from '@/components/hardware/game/game-victory-modal';
import { playSuccessGamelan, playSoftMuted } from '@/lib/audio/sound-effects';
import { PlugZap, Gamepad2, AlertCircle } from 'lucide-react';

interface HardwareGamePageProps {
  params: Promise<{ jenis: string }>;
  searchParams?: Promise<{ deck?: string }>;
}

export default function HardwareGamePage({ params, searchParams }: HardwareGamePageProps) {
  const unwrappedParams = use(params);
  const unwrappedSearch = searchParams ? use(searchParams) : undefined;

  const rawJenis = unwrappedParams?.jenis?.toLowerCase();
  const jenis: HardwareGameKind = rawJenis === 'speed-match' ? 'speed-match' : 'ramu-mantra';
  const isSpeedMatch = jenis === 'speed-match';

  const rawDeck = unwrappedSearch?.deck?.toLowerCase();
  const deck: HardwareGameDeck = rawDeck === 'trinitas' ? 'trinitas' : 'sunda';

  // Game Metadata
  const gameTitle = isSpeedMatch ? 'Aksara Cepat Tanggap' : 'Ramu Mantra';
  const quests = useMemo(() => getGameQuests(jenis, deck), [jenis, deck]);
  const totalRounds = quests.length;

  // Serial Hardware Controller from shared context
  const {
    status,
    slotKonsonan,
    slotDiakritik,
    sukuKataGabungan,
    latinGabungan,
    lastIssue,
    cardRevision,
    placeCard,
    clearSlot,
    clearBothSlots,
    connectWebSerial,
    activateSimulation,
  } = useTactileSerial();

  // Game Engine State
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);

  const lastProcessedRevision = useRef<number>(-1);
  const currentQuest = quests[currentRoundIndex] || quests[0];

  // Advance to next round
  const handleNextRound = useCallback(
    (isSuccess: boolean, bonusScore = 0) => {
      if (isSuccess) {
        playSuccessGamelan();
        setScore((prev) => prev + currentQuest.xpReward + bonusScore);
        setCorrectCount((prev) => prev + 1);
        setMatchStatus('success');
      } else {
        playSoftMuted();
        setMatchStatus('failed');
      }

      setTimeout(() => {
        setMatchStatus('idle');

        if (currentRoundIndex < totalRounds - 1) {
          setCurrentRoundIndex((prev) => prev + 1);
          setTimeLeft(15);
        } else {
          setIsGameOver(true);
        }
      }, 1500);
    },
    [currentQuest, currentRoundIndex, totalRounds]
  );

  // Timer loop for Speed Match (pauses when disconnected or round not active)
  useEffect(() => {
    if (!isSpeedMatch || isGameOver || matchStatus !== 'idle') return;
    if (status !== 'connected' && status !== 'simulated') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextRound(false, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSpeedMatch, isGameOver, matchStatus, status, handleNextRound]);

  // Match validation effect triggered by card changes
  useEffect(() => {
    if (isGameOver || matchStatus !== 'idle') return;
    if (cardRevision === lastProcessedRevision.current) return;

    if (!isSpeedMatch) {
      // 1. RAMU MANTRA LOGIC: checks both slot 1 (consonant) and slot 2 (diacritic)
      const ramuQuest = currentQuest as Extract<typeof currentQuest, { kind: 'ramu-mantra' }>;
      if (
        slotKonsonan?.uid === ramuQuest.targetKonsonanId &&
        slotDiakritik?.uid === ramuQuest.targetDiakritikId
      ) {
        lastProcessedRevision.current = cardRevision;
        handleNextRound(true, 0);
      }
    } else {
      // 2. SPEED MATCH LOGIC: checks target card in corresponding slot
      const speedQuest = currentQuest as Extract<typeof currentQuest, { kind: 'speed-match' }>;
      const matchingCard = speedQuest.tipe === 'konsonan' ? slotKonsonan : slotDiakritik;

      if (matchingCard?.uid === speedQuest.targetId) {
        lastProcessedRevision.current = cardRevision;
        const speedBonus = timeLeft * 2;
        handleNextRound(true, speedBonus);
      }
    }
  }, [
    isSpeedMatch,
    currentQuest,
    slotKonsonan,
    slotDiakritik,
    cardRevision,
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
    lastProcessedRevision.current = -1;
    if (status === 'simulated') {
      clearBothSlots();
    }
  };

  const otherGameHref = isSpeedMatch
    ? `/hardware/game/ramu-mantra?deck=${deck}`
    : `/hardware/game/speed-match?deck=${deck}`;
  const otherGameTitle = isSpeedMatch ? 'Mini-Game: Ramu Mantra' : 'Mini-Game: Speed Match';

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
        {/* Connection Notice & Fast Connect Banner when not connected */}
        {status !== 'connected' && status !== 'simulated' && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-100">
                  Konsol Fisik Belum Terhubung
                </p>
                <p className="text-[11px] text-amber-200/70">
                  Hubungkan via USB untuk bermain dengan 4 kartu fisik Sunda, atau gunakan Mode Simulasi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={connectWebSerial}
                className="py-2 px-3.5 rounded-xl bg-[#ffd261] hover:bg-[#ffe08a] text-[#0c1a2c] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlugZap className="w-3.5 h-3.5" />
                <span>Hubungkan USB</span>
              </button>
              <button
                type="button"
                onClick={activateSimulation}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Simulasi</span>
              </button>
            </div>
          </div>
        )}

        {/* Issue Alert if card rejected/unassigned */}
        {lastIssue && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl bg-rose-500/15 border border-rose-500/30 px-4 py-3 text-xs text-rose-200 flex items-center gap-2.5 animate-pulse"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{lastIssue}</span>
          </div>
        )}

        {/* Deck Mode Toggle Badge */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-white/50 text-[11px]">
            Deck: <strong className="text-white capitalize">{deck}</strong> ({quests.length} ronde)
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/hardware/game/${jenis}?deck=sunda`}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                deck === 'sunda'
                  ? 'bg-[#ffd261]/20 text-[#ffd261] border border-[#ffd261]/40'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              4 Kartu Sunda (Fisik)
            </Link>
            <Link
              href={`/hardware/game/${jenis}?deck=trinitas`}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                deck === 'trinitas'
                  ? 'bg-[#ffd261]/20 text-[#ffd261] border border-[#ffd261]/40'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Trinitas (Simulasi)
            </Link>
          </div>
        </div>

        {/* Active Target Quest Card */}
        <TargetQuestCard quest={currentQuest} isSpeedMatch={isSpeedMatch} matchStatus={matchStatus} />

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

        {/* Virtual Card Rack: Visible in simulation mode */}
        {status === 'simulated' && (
          <VirtualCardRack
            onSelectCard={placeCard}
            activeSlot1Uid={slotKonsonan?.uid}
            activeSlot2Uid={slotDiakritik?.uid}
          />
        )}
      </div>

      {/* 3. Victory Screen Modal on Completion */}
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
