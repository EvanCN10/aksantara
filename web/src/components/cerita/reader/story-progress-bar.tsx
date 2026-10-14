'use client';

import React from 'react';
import Link from 'next/link';

interface StoryProgressBarProps {
  totalBeats: number;
  currentBeatIndex: number;
  xpReward: number;
  onExitHref?: string;
}

function CloseIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="6" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

export function StoryProgressBar({
  totalBeats,
  currentBeatIndex,
  xpReward,
  onExitHref = '/cerita',
}: StoryProgressBarProps) {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/90 border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Exit Button */}
        <Link
          href={onExitHref}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer"
          title="Keluar dari Cerita"
          aria-label="Keluar dari Cerita"
        >
          <CloseIcon className="w-4 h-4" />
        </Link>

        {/* Segmented Story Progress Bar (Duolingo Style) */}
        <div className="flex-1 flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalBeats }).map((_, index) => {
            const isCompleted = index < currentBeatIndex;
            const isCurrent = index === currentBeatIndex;

            return (
              <div
                key={index}
                className="flex-1 h-2 rounded-full overflow-hidden bg-white/15 relative"
              >
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isCompleted
                      ? 'w-full bg-[#ffd261] shadow-[0_0_8px_rgba(255,210,97,0.6)]'
                      : isCurrent
                      ? 'w-full bg-[#ffd261] animate-pulse'
                      : 'w-0'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* XP Reward Badge */}
        <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full shrink-0">
          <SparklesIcon className="text-[#ffd261]" />
          <span>+{xpReward} XP</span>
        </div>
      </div>
    </header>
  );
}
