'use client';

import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import type { RamuMantraQuest, SpeedMatchQuest } from '@/data/hardware/game-quests';

interface TargetQuestCardProps {
  quest: RamuMantraQuest | SpeedMatchQuest;
  isSpeedMatch?: boolean;
  matchStatus: 'idle' | 'success' | 'failed';
}

export function TargetQuestCard({
  quest,
  isSpeedMatch = false,
  matchStatus,
}: TargetQuestCardProps) {
  const isRamu = !isSpeedMatch;
  const ramuQuest = quest as RamuMantraQuest;
  const speedQuest = quest as SpeedMatchQuest;

  return (
    <div
      className={`w-full rounded-3xl p-5 sm:p-6 text-center border transition-all duration-300 relative overflow-hidden ${
        matchStatus === 'success'
          ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.3)]'
          : matchStatus === 'failed'
          ? 'bg-rose-500/15 border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.3)]'
          : 'bg-[#141e2e]/90 border-[#ffd261]/30 shadow-xl'
      }`}
    >
      {/* Background radial highlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,210,97,0.08),transparent_70%)]" />

      {/* Script & Category Tag */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25">
          {quest.aksaraNama}
        </span>
        <span className="text-[10px] font-mono text-white/40">
          +{quest.xpReward} XP
        </span>
      </div>

      {isRamu ? (
        /* 1. Ramu Mantra Goal */
        <div className="animate-in fade-in duration-300">
          <span className="text-xs text-white/60 block mb-1">
            Misi: Ramu Suku Kata
          </span>
          <div className="flex items-center justify-center gap-3 my-1">
            <span
              className="text-4xl sm:text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,210,97,0.4)]"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {ramuQuest.targetSukuKata}
            </span>
            <span className="text-lg sm:text-xl font-bold text-[#ffd261] px-3 py-1 rounded-xl bg-[#ffd261]/10 border border-[#ffd261]/20">
              &quot;{ramuQuest.targetLatin}&quot;
            </span>
          </div>

          <p className="text-xs text-white/70 max-w-lg mx-auto mt-2 leading-relaxed">
            {ramuQuest.petunjuk}
          </p>
        </div>
      ) : (
        /* 2. Speed Match Goal */
        <div className="animate-in fade-in duration-300">
          <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase block mb-1">
            Tantangan Refleks Cepat
          </span>
          <h2
            className="text-lg sm:text-2xl font-bold text-white max-w-xl mx-auto my-1.5 leading-snug"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {speedQuest.pertanyaan}
          </h2>

          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
            <span>Sasaran:</span>
            <span className="font-bold text-[#ffd261] text-sm">
              {speedQuest.targetLabel} ({speedQuest.targetSimbol})
            </span>
          </div>
        </div>
      )}

      {/* Match Status Banner Overlay */}
      {matchStatus === 'success' && (
        <div className="mt-3 pt-3 border-t border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm animate-score-pop drop-shadow-[0_0_12px_rgba(52,211,153,0.5)] flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sempurna! Suku Kata Cocok (+{quest.xpReward} XP)</span>
        </div>
      )}
      {matchStatus === 'failed' && (
        <div className="mt-3 pt-3 border-t border-rose-500/30 text-rose-300 font-bold text-xs sm:text-sm animate-shake-error flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Waktu Habis / Kartu Tidak Sesuai! Melanjutkan ke ronde berikutnya...</span>
        </div>
      )}
    </div>
  );
}
