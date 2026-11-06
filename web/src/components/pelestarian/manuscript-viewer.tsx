'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ManuskripItem } from '@/data/pelestarian/manuskrip-data';

interface ManuscriptViewerProps {
  manuskrip: ManuskripItem;
}

export function ManuscriptViewer({ manuskrip }: ManuscriptViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const isZoomedIn = zoomLevel > 1;

  return (
    <div className="w-full rounded-3xl bg-[#141e2e]/90 border border-[#ffd261]/25 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
        <div>
          <span className="text-[10px] font-mono text-[#ffd261] uppercase tracking-wider block">
            {manuskrip.kodeArsip} • {manuskrip.abad}
          </span>
          <h2
            className="text-base sm:text-lg font-bold text-white tracking-wide"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {manuskrip.judul}
          </h2>
        </div>

        {/* Viewer Tools (44x44px accessible controls) */}
        <div role="group" aria-label="Kontrol perbesaran citra manuskrip" className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.75}
            aria-label="Perkecil citra manuskrip"
            title="Perkecil citra manuskrip"
            className="min-h-11 min-w-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/85 hover:text-white border border-white/10 text-sm font-bold transition-colors disabled:opacity-35 cursor-pointer flex items-center justify-center"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="text-xs font-mono text-white/80 px-2 min-w-[52px] text-center"
          >
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.0}
            aria-label="Perbesar citra manuskrip"
            title="Perbesar citra manuskrip"
            className="min-h-11 min-w-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/85 hover:text-white border border-white/10 text-sm font-bold transition-colors disabled:opacity-35 cursor-pointer flex items-center justify-center"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Atur ulang perbesaran ke 100 persen"
            title="Atur ulang perbesaran"
            className="min-h-11 min-w-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer flex items-center justify-center"
          >
            ↺
          </button>
        </div>
      </div>

      {/* 2. Scrollable / Pannable Antique Leaf Visualizer Stage */}
      <div
        className={`w-full aspect-[16/7] min-h-[190px] rounded-2xl bg-[#0a0f18] border border-white/10 relative p-4 ${
          isZoomedIn
            ? 'overflow-auto overscroll-contain flex items-start justify-start'
            : 'overflow-hidden flex items-center justify-center'
        }`}
      >
        <div
          className="rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.9)] relative flex items-center justify-center px-6 transition-all duration-200 border border-amber-900/60 overflow-hidden shrink-0 mx-auto my-auto"
          style={{
            width: `${Math.round(zoomLevel * 100)}%`,
            maxWidth: isZoomedIn ? 'none' : '36rem',
            height: `${Math.round(140 * zoomLevel)}px`,
          }}
        >
          {manuskrip.imageUrl ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={manuskrip.imageUrl}
                alt={`Foto lembaran naskah ${manuskrip.judul}`}
                fill
                sizes="(max-width: 640px) 100vw, 900px"
                className="object-cover object-center filter contrast-110 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, #3d2817 0%, #523820 25%, #634529 50%, #523820 75%, #3d2817 100%)',
              }}
            />
          )}

          {/* Traditional Lontar Binding Holes */}
          <div className="absolute left-6 w-3 h-3 rounded-full bg-black/80 border border-amber-800/80 shadow-inner z-10" aria-hidden="true" />
          <div className="absolute right-6 w-3 h-3 rounded-full bg-black/80 border border-amber-800/80 shadow-inner z-10" aria-hidden="true" />

          {!manuskrip.imageUrl && (
            <div className="relative z-10 w-full text-center">
              <span
                className="text-2xl sm:text-3xl tracking-widest text-[#f5deb3]/85 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                {manuskrip.simbolSampel}
              </span>
            </div>
          )}
        </div>
      </div>

      {isZoomedIn && (
        <p className="mt-2 text-[11px] text-[#ffd261]/80 font-mono">
          Geser area naskah ke kiri/kanan atau atas/bawah untuk mengamati detail ukiran aksara.
        </p>
      )}

      {/* 3. Archival Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <span className="text-[#ffd261] font-mono uppercase text-[10px]">Koleksi:</span>
          <span className="text-white/85 font-medium">{manuskrip.asalKoleksi}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#ffd261] font-mono uppercase text-[10px]">Media:</span>
          <span className="text-white/85 font-medium">{manuskrip.mediaNaskah}</span>
        </div>
      </div>
    </div>
  );
}
