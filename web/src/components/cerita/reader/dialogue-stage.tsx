'use client';

import React from 'react';
import type { StoryBeat } from '@/data/cerita/skenario';
import type { KarakterCompanion } from '@/data/cerita/karakter';

interface DialogueStageProps {
  beat: StoryBeat;
  companion?: KarakterCompanion;
}

export function DialogueStage({ beat, companion }: DialogueStageProps) {
  const isNarration = beat.tipe === 'narasi';
  const speakerName = beat.pembicaraNama || companion?.nama || 'Narator';

  return (
    <div key={beat.id} className="w-full flex flex-col gap-4 animate-emerge-up" style={{ animationDuration: '0.35s' }}>
      {/* 1. Character Avatar & Dialogue View */}
      {!isNarration && companion ? (
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar Icon with Living Companion Breath */}
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl border border-white/20 shrink-0 relative overflow-hidden animate-companion-idle"
            style={{
              backgroundColor: `${companion.warnaAksen}25`,
              boxShadow: `0 0 24px ${companion.warnaAksen}35`,
            }}
          >
            {companion.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={companion.avatarUrl}
                alt={companion.nama}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="select-none">{companion.avatar}</span>
            )}
          </div>

          {/* Speech Bubble */}
          <div className="flex-1 relative">
            {/* Speaker Tag */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-sm font-bold text-white tracking-wide"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                {speakerName}
              </span>
              <span className="text-[10px] font-medium text-[#ffd261] px-2 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25">
                {companion.gelar}
              </span>
            </div>

            {/* Bubble Box */}
            <div className="relative rounded-2xl bg-[#141e2e]/90 border border-white/15 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sheen-sweep">
              {/* Speech bubble arrow pointer */}
              <div className="absolute top-4 -left-2 w-4 h-4 bg-[#141e2e]/90 border-l border-b border-white/15 rotate-45 hidden sm:block" />
              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                {beat.teks}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Pure Narration Stage (Atmospheric text box) */
        <div className="rounded-2xl bg-gradient-to-r from-[#141722]/90 via-[#0e121a]/95 to-[#141722]/90 border border-white/15 p-5 sm:p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] sheen-sweep">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffd261]/70 block mb-2">
            - Catatan Adegan Epos -
          </span>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed italic max-w-2xl mx-auto font-light">
            {beat.teks}
          </p>
        </div>
      )}

      {/* 3. Interactive Script Highlight (if beat highlights an ancient glyph) */}
      {beat.aksaraHighlight && (
        <div className="rounded-2xl border border-[#ffd261]/35 bg-gradient-to-r from-[#ffd261]/10 via-white/[0.03] to-transparent p-4 flex items-center gap-4 shadow-[0_4px_24px_rgba(255,210,97,0.12)] sheen-sweep">
          <div className="w-14 h-14 rounded-xl bg-black/40 border border-[#ffd261]/40 flex items-center justify-center shrink-0">
            <span
              className="text-3xl text-[#ffd261] font-normal leading-none inline-block animate-sacred-breath"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {beat.aksaraHighlight.simbol}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold text-white"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                Aksara: {beat.aksaraHighlight.label} ({beat.aksaraHighlight.simbol})
              </span>
              <span className="text-[10px] font-mono text-[#ffd261] bg-[#ffd261]/10 px-2 py-0.5 rounded-full border border-[#ffd261]/25">
                Glif Pusaka
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1 leading-snug font-light">
              {beat.aksaraHighlight.makna}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
