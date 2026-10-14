'use client';

import React from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';
import type { CeritaEpos, BabCerita } from '@/data/cerita/epos';
import type { KarakterCompanion } from '@/data/cerita/karakter';

interface StoryCampaignCardProps {
  epos: CeritaEpos;
  companion?: KarakterCompanion;
}

function StarIcon({ className = 'w-3.5 h-3.5', filled = false }: { className?: string; filled?: boolean }) {
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

function LockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PlayIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export function StoryCampaignCard({ epos, companion }: StoryCampaignCardProps) {
  return (
    <OrnateFrame className="w-full bg-[#0c1a2c]/85 border border-[#D4A373]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="p-5 sm:p-6 lg:p-7 flex flex-col gap-6">
        
        {/* ================================================================
            1. CAMPAIGN HEADER: TITLE, NATIVE SCRIPT & COMPANION
            ================================================================ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            {/* Tagline & Origin */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className="font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border text-[10px]"
                style={{
                  color: epos.warnaTema,
                  backgroundColor: `${epos.warnaTema}15`,
                  borderColor: `${epos.warnaTema}30`,
                }}
              >
                {epos.aksaraNama}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/60 font-medium">{epos.wilayah}</span>
              <span className="text-white/40">•</span>
              <span className="text-[#D4A373] text-[11px] font-mono">{epos.eposAsli}</span>
            </div>

            {/* Title & Native Script */}
            <div className="flex flex-wrap items-baseline gap-2 pt-1">
              <h3
                className="text-xl sm:text-2xl font-bold text-white tracking-wide"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                {epos.judul}
              </h3>
              <span
                className="text-lg font-normal drop-shadow-[0_0_8px_rgba(255,210,97,0.4)]"
                style={{ color: epos.warnaTema }}
              >
                {epos.aksaraAsli}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
              {epos.ringkasan}
            </p>
          </div>

          {/* Companion Mini Badge & Star Rating */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
            {companion && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-xl select-none">{companion.avatar}</span>
                <div className="text-left">
                  <span className="text-[10px] text-white/50 block">Pemandu Kisah</span>
                  <span className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-philosopher)' }}>
                    {companion.nama}
                  </span>
                </div>
              </div>
            )}

            {/* Stars counter */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#ffd261] bg-[#ffd261]/10 px-3 py-1 rounded-full border border-[#ffd261]/25">
              <StarIcon filled className="w-3.5 h-3.5" />
              <span>{epos.totalBintang} / {epos.maxBintang} Bintang</span>
            </div>
          </div>
        </div>

        {/* ================================================================
            2. CHAPTER PROGRESSION TRACK (BAB 1, 2, 3)
            ================================================================ */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#ffd261] block">
            Alur Episode &amp; Tantangan Bab
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {epos.babList.map((bab: BabCerita) => {
              const isFinished = bab.status === 'selesai';
              const isOpen = bab.status === 'terbuka';
              const isLocked = bab.status === 'terkunci';

              return (
                <div
                  key={bab.n}
                  className={`relative rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ${
                    isFinished
                      ? 'bg-gradient-to-b from-emerald-500/[0.08] to-black/30 border-emerald-500/30 shadow-sm'
                      : isOpen
                      ? 'bg-gradient-to-b from-white/[0.06] to-black/30 border-[#ffd261]/40 shadow-[0_4px_20px_rgba(255,210,97,0.12)]'
                      : 'bg-white/[0.02] border-white/10 opacity-60'
                  }`}
                >
                  {/* Top: Chapter Number, Status & Stars */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                        Bab {bab.n}
                      </span>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-[#ffd261]">
                        <StarIcon filled={bab.bintang >= 1} />
                        <StarIcon filled={bab.bintang >= 2} />
                        <StarIcon filled={bab.bintang >= 3} />
                      </div>
                    </div>

                    <h4
                      className="text-sm sm:text-base font-bold text-white mb-1.5"
                      style={{ fontFamily: 'var(--font-philosopher)' }}
                    >
                      {bab.judul}
                    </h4>

                    <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
                      {bab.sinopsis}
                    </p>
                  </div>

                  {/* Middle: Focus Glyphs */}
                  <div className="my-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-white/45">Fokus Glif:</span>
                    <div className="flex items-center gap-1.5">
                      {bab.fokusGlif.map((g, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[#ffd261]"
                          title={g.label}
                        >
                          {g.simbol}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Action CTA */}
                  <div className="pt-2">
                    {isFinished ? (
                      <Link
                        href={`/cerita/${epos.slug}/bab/${bab.n}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>Selesai • Baca Ulang</span>
                      </Link>
                    ) : isOpen ? (
                      <Link
                        href={`/cerita/${epos.slug}/bab/${bab.n}`}
                        className="w-full block"
                      >
                        <ShinyButton
                          label={`Mulai Bab ${bab.n} (+${bab.xp} XP) →`}
                          className="w-full py-2.5 text-xs font-bold cursor-pointer shadow-[0_0_16px_rgba(255,210,97,0.3)] hover:scale-[1.01] transition-all"
                        />
                      </Link>
                    ) : (
                      <div className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/40 text-xs font-medium cursor-not-allowed">
                        <LockIcon className="w-3.5 h-3.5" />
                        <span>Terkunci (Selesaikan Bab {bab.n - 1})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </OrnateFrame>
  );
}
