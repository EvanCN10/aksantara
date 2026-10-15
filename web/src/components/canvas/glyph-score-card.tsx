'use client';

import React from 'react';
import Link from 'next/link';

interface GlyphScoreCardProps {
  aksaraId: string;
  slug: string;
  simbol: string;
  label: string;
  ipa: string;
  score: number;
  status: 'dikuasai' | 'latihan';
  catatan: string;
  index?: number;
}

function CheckCircleIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function GlyphScoreCard({
  aksaraId,
  slug,
  simbol,
  label,
  ipa,
  score,
  status,
  catatan,
  index = 0,
}: GlyphScoreCardProps) {
  const isMastered = status === 'dikuasai' || score >= 88;

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="relative rounded-2xl border border-white/10 hover:border-[#ffd261]/40 bg-[#0c1a2c]/80 hover:bg-[#0c1a2c] p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,210,97,0.12)] group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
    >
      {/* Top row: Status Badge & Score Percentage */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isMastered
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}
        >
          {isMastered && <CheckCircleIcon className="w-3 h-3" />}
          <span>{isMastered ? 'Dikuasai' : 'Perlu Latihan'}</span>
        </span>

        <span className="text-sm font-extrabold font-mono text-[#ffd261]">
          {score}%
        </span>
      </div>

      {/* Middle: Native Glyph Display & Pronunciation */}
      <div className="my-3 text-center flex flex-col items-center">
        <span
          className="text-5xl sm:text-6xl text-[#ffd261] font-normal leading-none drop-shadow-[0_2px_16px_rgba(255,210,97,0.35)] select-none transition-transform duration-300 group-hover:scale-110"
          style={{ fontFamily: 'var(--font-philosopher)' }}
        >
          {simbol}
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="text-base font-bold text-white group-hover:text-[#ffd261] transition-colors"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {label}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#D4A373] border border-white/10">
            {ipa}
          </span>
        </div>
      </div>

      {/* Bottom: AI Feedback Note & Practice Again Link */}
      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
        <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
          {catatan}
        </p>

        <Link
          href={`/latihan/web/${aksaraId}/${slug}`}
          className="w-full text-center py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[11px] font-medium transition-all cursor-pointer"
        >
          Latih Ulang Karakter Ini ↺
        </Link>
      </div>
    </div>
  );
}
