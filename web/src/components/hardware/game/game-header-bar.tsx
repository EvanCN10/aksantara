'use client';

import React from 'react';
import Link from 'next/link';

interface GameHeaderBarProps {
  gameTitle: string;
  currentRound: number;
  totalRounds: number;
  score: number;
  timeLeft?: number; // Khusus Speed Match
  isSpeedMatch?: boolean;
  status: string;
}

export function GameHeaderBar({
  gameTitle,
  currentRound,
  totalRounds,
  score,
  timeLeft,
  isSpeedMatch = false,
  status,
}: GameHeaderBarProps) {
  const isOnline = status === 'connected' || status === 'simulated';

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Exit button & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/hardware/koneksi"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer text-xs"
            title="Keluar dari Mini-Game"
          >
            ✕
          </Link>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#ffd261] uppercase block leading-none">
              Pilar 3: Phygital Arena
            </span>
            <span
              className="text-xs sm:text-sm font-bold text-white tracking-wide"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {gameTitle}
            </span>
          </div>
        </div>

        {/* Center: Round & Timer (Speed Match) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/80">
            Ronde <span className="font-bold text-white">{currentRound}</span>/{totalRounds}
          </div>

          {isSpeedMatch && typeof timeLeft === 'number' && (
            <div
              className={`px-3 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                timeLeft <= 5
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-[#ffd261]'
              }`}
            >
              <span>⏱️</span>
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Right: Score & Connection Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 py-1 rounded-xl bg-[#ffd261]/10 border border-[#ffd261]/25 text-xs font-mono text-[#ffd261]">
            Skor: <span className="font-bold text-white">{score}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono text-white/60">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400'
                  : isOnline
                  ? 'bg-sky-400'
                  : 'bg-rose-500'
              }`}
            />
            <span className="capitalize">{status}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
