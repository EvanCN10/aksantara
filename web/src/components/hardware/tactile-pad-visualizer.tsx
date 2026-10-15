'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { SerialConnectionStatus, RfidCardData, TipeSlot } from '@/lib/serial/tactile-serial-types';

interface TactilePadVisualizerProps {
  status: SerialConnectionStatus;
  slotKonsonan: RfidCardData | null;
  slotDiakritik: RfidCardData | null;
  sukuKataGabungan: string;
  latinGabungan: string;
  onClearSlot: (slot: TipeSlot) => void;
  onClearBoth: () => void;
}

export function TactilePadVisualizer({
  status,
  slotKonsonan,
  slotDiakritik,
  sukuKataGabungan,
  latinGabungan,
  onClearSlot,
  onClearBoth,
}: TactilePadVisualizerProps) {
  const isConnected = status === 'connected';
  const isSimulated = status === 'simulated';
  const isOnline = isConnected || isSimulated;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-[#182335] via-[#101826] to-[#0a101a] border border-[#ffd261]/25 p-5 sm:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Decorative Traditional Corner Inlays */}
      <div className="pointer-events-none absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#ffd261]/40" />
      <div className="pointer-events-none absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#ffd261]/40" />
      <div className="pointer-events-none absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#ffd261]/40" />
      <div className="pointer-events-none absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#ffd261]/40" />

      {/* 1. Header Bar of the Pad */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          {/* Status LED Light */}
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                  : isSimulated
                  ? 'bg-sky-400 shadow-[0_0_12px_#38bdf8]'
                  : 'bg-rose-500/80 shadow-[0_0_10px_#f43f5e]'
              }`}
            />
            {isOnline && (
              <span
                className={`absolute w-5 h-5 rounded-full animate-ping opacity-75 ${
                  isConnected ? 'bg-emerald-400' : 'bg-sky-400'
                }`}
              />
            )}
          </div>

          <div>
            <span className="text-[11px] font-mono tracking-wider text-white/50 uppercase block leading-none">
              Konsol Sensorik
            </span>
            <span className="text-xs font-semibold text-white/90">
              {isConnected
                ? 'ESP32 Hardware Online'
                : isSimulated
                ? 'Mode Simulasi Virtual'
                : 'Perangkat Belum Terhubung'}
            </span>
          </div>
        </div>

        {/* Action Clear Button */}
        {(slotKonsonan || slotDiakritik) && (
          <button
            type="button"
            onClick={onClearBoth}
            className="text-[11px] font-medium text-white/60 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            Angkat Kartu ↺
          </button>
        )}
      </div>

      {/* 2. Physical 2-Slot Reader Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* SLOT 1: Konsonan Dasar */}
        <div className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-mono tracking-widest text-[#ffd261]/80 uppercase">
              Slot 1: Konsonan
            </span>
            {slotKonsonan && (
              <button
                type="button"
                onClick={() => onClearSlot('konsonan')}
                className="text-[10px] text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Lepas ✕
              </button>
            )}
          </div>

          <div
            className={`w-full aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-300 relative overflow-hidden ${
              slotKonsonan
                ? 'bg-gradient-to-br from-[#ffd261]/15 via-black/40 to-black/60 border-[#ffd261] shadow-[0_0_30px_rgba(255,210,97,0.2)]'
                : 'border-dashed border-white/20 bg-black/20 hover:border-white/35'
            }`}
          >
            {slotKonsonan ? (
              <>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-25 mix-blend-screen">
                  <Image
                    src="/images/hardware/card-acrylic-texture.webp"
                    alt="Tekstur Kartu Akrilik"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center relative z-10 animate-rfid-snap">
                  <span
                    className="text-5xl sm:text-6xl text-[#ffd261] drop-shadow-[0_0_16px_rgba(255,210,97,0.5)] block mb-1"
                    style={{ fontFamily: 'var(--font-philosopher)' }}
                  >
                    {slotKonsonan.simbol}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    {slotKonsonan.label} ({slotKonsonan.latin})
                  </span>
                  <span className="text-[10px] font-mono text-white/50 block mt-0.5">
                    UID: {slotKonsonan.uid}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-white/35">
                <div className="w-10 h-10 mx-auto rounded-xl border border-dashed border-white/25 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect width="16" height="20" x="4" y="2" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="18.01" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Tempelkan Kartu Konsonan</p>
                <p className="text-[10px] font-mono mt-0.5 opacity-60">(Ka, Ga, Ta, Ba)</p>
              </div>
            )}
          </div>
        </div>

        {/* SLOT 2: Diakritik / Vokal */}
        <div className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-mono tracking-widest text-[#38bdf8]/90 uppercase">
              Slot 2: Diakritik
            </span>
            {slotDiakritik && (
              <button
                type="button"
                onClick={() => onClearSlot('diakritik')}
                className="text-[10px] text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Lepas ✕
              </button>
            )}
          </div>

          <div
            className={`w-full aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-300 relative overflow-hidden ${
              slotDiakritik
                ? 'bg-gradient-to-br from-[#38bdf8]/15 via-black/40 to-black/60 border-[#38bdf8] shadow-[0_0_30px_rgba(56,189,248,0.2)]'
                : 'border-dashed border-white/20 bg-black/20 hover:border-white/35'
            }`}
          >
            {slotDiakritik ? (
              <>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-25 mix-blend-screen">
                  <Image
                    src="/images/hardware/card-acrylic-texture.webp"
                    alt="Tekstur Kartu Akrilik"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center relative z-10 animate-rfid-snap">
                  <span
                    className="text-5xl sm:text-6xl text-[#38bdf8] drop-shadow-[0_0_16px_rgba(56,189,248,0.5)] block mb-1"
                    style={{ fontFamily: 'var(--font-philosopher)' }}
                  >
                    {slotDiakritik.simbol}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    {slotDiakritik.label}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 block mt-0.5">
                    UID: {slotDiakritik.uid}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-white/35">
                <div className="w-10 h-10 mx-auto rounded-xl border border-dashed border-white/25 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Tempelkan Kartu Diakritik</p>
                <p className="text-[10px] font-mono mt-0.5 opacity-60">(Panghulu, Tetta, Ulu)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Combined Syllable Real-Time Display */}
      <div
        className={`rounded-2xl bg-black/50 border p-4 sm:p-5 flex items-center justify-between transition-all duration-300 ${
          slotKonsonan && slotDiakritik
            ? 'border-[#ffd261]/60 shadow-[0_0_28px_rgba(255,210,97,0.3)] animate-runic-synthesis'
            : 'border-white/10'
        }`}
      >
        <div>
          <span className="text-[10px] font-mono text-white/45 uppercase tracking-widest block mb-0.5">
            Suku Kata Terbentuk
          </span>
          <div className="flex items-baseline gap-2.5">
            <span
              className="text-2xl sm:text-3xl font-bold text-white"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {sukuKataGabungan ? sukuKataGabungan : '-'}
            </span>
            {latinGabungan && (
              <span className="text-sm font-semibold text-[#ffd261] px-2 py-0.5 rounded-md bg-[#ffd261]/10 border border-[#ffd261]/20">
                {latinGabungan}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-white/40 block">Status Fonetik</span>
          <span className="text-xs font-medium text-emerald-400">
            {slotKonsonan && slotDiakritik
              ? 'Tersusun Paripurna ✓'
              : slotKonsonan
              ? 'Konsonan Mandiri'
              : 'Menunggu Input'}
          </span>
        </div>
      </div>
    </div>
  );
}
