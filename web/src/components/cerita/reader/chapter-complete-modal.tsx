'use client';

import React from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

interface ChapterCompleteModalProps {
  eposJudul: string;
  babNomor: number;
  judulBab: string;
  xpReward: number;
  eposSlug: string;
  hasNextChapter?: boolean;
  onReplayChapter: () => void;
}

function StarIcon({ className = 'w-4 h-4', filled = false }: { className?: string; filled?: boolean }) {
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

function TrophyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export function ChapterCompleteModal({
  eposJudul,
  babNomor,
  judulBab,
  xpReward,
  eposSlug,
  hasNextChapter = true,
  onReplayChapter,
}: ChapterCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg">
        <OrnateFrame className="w-full bg-[#0c1a2c]/95 border border-[#ffd261]/40 shadow-[0_0_50px_rgba(255,210,97,0.25)]">
          <div className="p-6 sm:p-8 text-center flex flex-col items-center gap-5">
            {/* Trophy Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#ffd261]/15 border border-[#ffd261]/40 flex items-center justify-center text-[#ffd261] shadow-[0_0_24px_rgba(255,210,97,0.3)]">
              <TrophyIcon className="w-8 h-8" />
            </div>

            {/* Title */}
            <div>
              <span className="text-xs uppercase tracking-widest text-[#ffd261] font-semibold block mb-1">
                ✦ Episode Dituntaskan ✦
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                Bab {babNomor}: {judulBab}
              </h2>
              <p className="text-xs text-white/60 mt-1 font-medium">{eposJudul}</p>
            </div>

            {/* Stars Achievement */}
            <div className="flex items-center justify-center gap-2 text-2xl text-[#ffd261]">
              <StarIcon filled className="w-7 h-7 drop-shadow-[0_0_8px_rgba(255,210,97,0.6)]" />
              <StarIcon filled className="w-7 h-7 drop-shadow-[0_0_8px_rgba(255,210,97,0.6)]" />
              <StarIcon filled className="w-7 h-7 drop-shadow-[0_0_8px_rgba(255,210,97,0.6)]" />
            </div>

            {/* XP Gained Card */}
            <div className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/70 font-medium">Imbalan Penjelajah:</span>
              <span className="text-lg font-bold font-mono text-[#ffd261] bg-[#ffd261]/10 px-3 py-1 rounded-full border border-[#ffd261]/30">
                +{xpReward} XP
              </span>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2.5 pt-2">
              {hasNextChapter ? (
                <Link
                  href={`/cerita/${eposSlug}/bab/${babNomor + 1}`}
                  className="w-full block"
                >
                  <ShinyButton
                    label={`Lanjut ke Bab ${babNomor + 1} →`}
                    className="w-full py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)]"
                  />
                </Link>
              ) : (
                <Link href="/cerita" className="w-full block">
                  <ShinyButton
                    label="Kembali ke Pilihan Cerita →"
                    className="w-full py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)]"
                  />
                </Link>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onReplayChapter}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/75 hover:text-white border border-white/10 text-xs font-medium transition-all cursor-pointer"
                >
                  Baca Ulang Bab Ini ↺
                </button>

                <Link
                  href="/cerita"
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/75 hover:text-white border border-white/10 text-xs font-medium text-center transition-all cursor-pointer"
                >
                  Daftar Epos
                </Link>
              </div>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </div>
  );
}
