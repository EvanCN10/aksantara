'use client';

import React, { useState } from 'react';
import { KARTU_RFID_PRESET, type RfidCardData, type TipeSlot } from '@/lib/serial/tactile-serial-types';

interface VirtualCardRackProps {
  onSelectCard: (slot: TipeSlot, card: RfidCardData) => void;
  activeSlot1Uid?: string;
  activeSlot2Uid?: string;
}

export function VirtualCardRack({
  onSelectCard,
  activeSlot1Uid,
  activeSlot2Uid,
}: VirtualCardRackProps) {
  const [filterAksara, setFilterAksara] = useState<'semua' | 'sunda' | 'lontara' | 'bali'>('semua');

  const filteredCards = KARTU_RFID_PRESET.filter((card) => {
    if (filterAksara === 'semua') return true;
    return card.aksaraId === filterAksara;
  });

  return (
    <div className="w-full rounded-3xl bg-[#141e2e]/90 border border-white/10 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#ffd261]/80 block">
            Mode Uji Kinestetik
          </span>
          <h2
            className="text-base sm:text-lg font-bold text-white"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Rak Kartu Fisik Virtual (NFC 13.56 MHz)
          </h2>
        </div>

        {/* Script Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 shrink-0 overflow-x-auto">
          {(['semua', 'sunda', 'lontara', 'bali'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterAksara(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterAksara === tab
                  ? 'bg-[#ffd261] text-[#0c1a2c] font-bold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'semua' ? 'Semua Aksara' : tab}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/60 mb-4 leading-relaxed">
        Klik kartu di bawah ini untuk mensimulasikan penempelan tag fisik RFID pada permukaan sensor pad secara instan.
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {filteredCards.map((card) => {
          const isConsonant = card.tipe === 'konsonan';
          const isSlotActive = isConsonant
            ? activeSlot1Uid === card.uid
            : activeSlot2Uid === card.uid;

          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => onSelectCard(isConsonant ? 'konsonan' : 'diakritik', card)}
              className={`group relative rounded-2xl p-3 text-center border transition-all duration-200 cursor-pointer flex flex-col items-center justify-between aspect-square ${
                isSlotActive
                  ? isConsonant
                    ? 'bg-[#ffd261]/20 border-[#ffd261] shadow-[0_0_20px_rgba(255,210,97,0.35)] scale-[1.02]'
                    : 'bg-[#38bdf8]/20 border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.35)] scale-[1.02]'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/25'
              }`}
            >
              {/* Type Badge */}
              <span
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full block self-start ${
                  isConsonant
                    ? 'text-[#ffd261] bg-[#ffd261]/10'
                    : 'text-[#38bdf8] bg-[#38bdf8]/10'
                }`}
              >
                {isConsonant ? 'Kons' : 'Diak'}
              </span>

              {/* Glyph Symbol */}
              <span
                className={`text-2xl sm:text-3xl font-normal my-1 transition-transform group-hover:scale-110 ${
                  isConsonant ? 'text-[#ffd261]' : 'text-[#38bdf8]'
                }`}
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                {card.simbol}
              </span>

              {/* Label & Romanization */}
              <div className="w-full">
                <span className="text-[11px] font-bold text-white block truncate">
                  {card.label}
                </span>
                <span className="text-[9px] font-mono text-white/40 block">
                  {card.fonetik}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
