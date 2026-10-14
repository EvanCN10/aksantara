'use client';

import React from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

interface GameVictoryModalProps {
  gameTitle: string;
  totalScore: number;
  xpEarned: number;
  correctRounds: number;
  totalRounds: number;
  onReplay: () => void;
  otherGameHref: string;
  otherGameTitle: string;
}

export function GameVictoryModal({
  gameTitle,
  totalScore,
  xpEarned,
  correctRounds,
  totalRounds,
  onReplay,
  otherGameHref,
  otherGameTitle,
}: GameVictoryModalProps) {
  const accuracy = Math.round((correctRounds / totalRounds) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg">
        <OrnateFrame className="w-full bg-[#0c1a2c]/95 border border-[#ffd261]/40 shadow-[0_0_50px_rgba(255,210,97,0.25)]">
          <div className="p-6 sm:p-8 text-center flex flex-col items-center gap-5">
            {/* Crown / Trophy Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffd261]/25 to-transparent border border-[#ffd261]/50 flex items-center justify-center text-3xl shadow-[0_0_24px_rgba(255,210,97,0.3)] animate-bounce">
              🏆
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#ffd261]/80 block mb-1">
                Sesi Kinestetik Selesai
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white tracking-wide"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                Kemenangan Phygital!
              </h2>
              <p className="text-xs text-white/70 mt-1 max-w-xs mx-auto">
                Anda telah menyelesaikan seluruh 5 ronde tantangan {gameTitle}.
              </p>
            </div>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl text-[#ffd261]">
              <span className="drop-shadow-[0_0_12px_rgba(255,210,97,0.6)] animate-in zoom-in-50 delay-100">⭐</span>
              <span className="drop-shadow-[0_0_12px_rgba(255,210,97,0.6)] animate-in zoom-in-50 delay-200">⭐</span>
              <span className="drop-shadow-[0_0_12px_rgba(255,210,97,0.6)] animate-in zoom-in-50 delay-300">⭐</span>
            </div>

            {/* Stats Metric Grid */}
            <div className="w-full grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-center">
                <span className="text-[10px] font-mono text-white/45 block">Skor Akhir</span>
                <span className="text-base sm:text-lg font-bold text-white">{totalScore}</span>
              </div>
              <div className="text-center border-x border-white/10">
                <span className="text-[10px] font-mono text-white/45 block">XP Diperoleh</span>
                <span className="text-base sm:text-lg font-bold text-[#ffd261]">+{xpEarned}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-mono text-white/45 block">Akurasi</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400">{accuracy}%</span>
              </div>
            </div>

            {/* Actions Button Stack */}
            <div className="w-full flex flex-col gap-2.5 pt-2">
              <ShinyButton
                label="Mainkan Lagi Ronde Ini ↺"
                onClick={onReplay}
                className="w-full py-3 text-xs sm:text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)]"
              />

              <div className="flex items-center gap-2">
                <Link
                  href={otherGameHref}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium text-center transition-all cursor-pointer truncate"
                >
                  {otherGameTitle} →
                </Link>

                <Link
                  href="/hardware/koneksi"
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium text-center transition-all cursor-pointer"
                >
                  Status Hardware
                </Link>
              </div>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
}
