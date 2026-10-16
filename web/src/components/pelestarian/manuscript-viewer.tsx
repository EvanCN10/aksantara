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

        {/* Viewer Tools */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.75}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer flex items-center justify-center"
            title="Perkecil Citra"
          >
            -
          </button>
          <span className="text-xs font-mono text-white/60 px-2 min-w-[48px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.0}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer flex items-center justify-center"
            title="Perbesar Citra"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[11px] font-mono transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            ↺
          </button>
        </div>
      </div>

      {/* 2. Interactive Antique Leaf Visualizer Stage */}
      <div className="w-full aspect-[16/7] rounded-2xl bg-[#0a0f18] border border-white/10 overflow-hidden relative flex items-center justify-center p-4">
        {/* Lontar / Dluwang Parchment Leaf Ribbon */}
        <div
          className="w-full max-w-xl h-28 sm:h-36 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.9)] relative flex items-center justify-center px-6 transition-transform duration-300 border border-amber-900/60 overflow-hidden"
          style={{
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* Authentic Manuscript Photo Background */}
          {manuskrip.imageUrl ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={manuskrip.imageUrl}
                alt={manuskrip.judul}
                fill
                sizes="(max-width: 640px) calc(100vw - 64px), 576px"
                className="object-cover object-center filter contrast-110 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  manuskrip.aksaraId === 'bali'
                    ? 'linear-gradient(90deg, #3d2817 0%, #523820 25%, #634529 50%, #523820 75%, #3d2817 100%)'
                    : manuskrip.aksaraId === 'sunda'
                    ? 'linear-gradient(90deg, #2b2216 0%, #473824 25%, #59472e 50%, #473824 75%, #2b2216 100%)'
                    : 'linear-gradient(90deg, #261f1a 0%, #3d3128 25%, #4f4035 50%, #3d3128 75%, #261f1a 100%)',
              }}
            />
          )}

          {/* Faint Horizontal String Hole / Tali Pengikat Naskah Rontal */}
          <div className="absolute left-6 w-3 h-3 rounded-full bg-black/80 border border-amber-800/80 shadow-inner z-10" />
          <div className="absolute right-6 w-3 h-3 rounded-full bg-black/80 border border-amber-800/80 shadow-inner z-10" />

          {/* Fallback Script Carving when no image */}
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

      {/* 3. Archival Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span className="text-[#ffd261] font-mono uppercase text-[10px]">Koleksi:</span>
          <span className="text-white/80 font-medium">{manuskrip.asalKoleksi}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#ffd261] font-mono uppercase text-[10px]">Media:</span>
          <span className="text-white/80 font-medium">{manuskrip.mediaNaskah}</span>
        </div>
      </div>
    </div>
  );
}
