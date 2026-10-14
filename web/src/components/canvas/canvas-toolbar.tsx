'use client';

import React from 'react';
import type { BrushSize } from './drawing-canvas';

interface CanvasToolbarProps {
  strokeCount: number;
  brushSize: BrushSize;
  onBrushSizeChange: (size: BrushSize) => void;
  showGhostGuide: boolean;
  onToggleGhostGuide: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onUndo: () => void;
  onClear: () => void;
  disabled?: boolean;
}

function UndoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function EyeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GridIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}

function PenToolIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

export function CanvasToolbar({
  strokeCount,
  brushSize,
  onBrushSizeChange,
  showGhostGuide,
  onToggleGhostGuide,
  showGrid,
  onToggleGrid,
  onUndo,
  onClear,
  disabled = false,
}: CanvasToolbarProps) {
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl bg-[#0c1a2c]/90 border border-white/10 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      {/* Left Group: Undo & Clear with Stroke Counter */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={disabled || strokeCount === 0}
          title="Urungkan goresan terakhir (Ctrl+Z)"
          aria-label="Urungkan goresan terakhir"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 active:scale-95"
        >
          <UndoIcon className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Urungkan</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={disabled || strokeCount === 0}
          title="Bersihkan seluruh goresan kanvas"
          aria-label="Bersihkan seluruh goresan kanvas"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-rose-500/20 text-white/80 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 active:scale-95"
        >
          <TrashIcon className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Bersihkan</span>
        </button>

        <div className="h-4 w-px bg-white/15 mx-1" />

        {/* Live stroke badge */}
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/60">
          {strokeCount} {strokeCount === 1 ? 'Goresan' : 'Goresan'}
        </span>
      </div>

      {/* Right Group: Guides toggle & Brush Size Selector */}
      <div className="flex items-center gap-2">
        {/* Toggle Ghost Watermark Guide */}
        <button
          type="button"
          onClick={onToggleGhostGuide}
          disabled={disabled}
          title={showGhostGuide ? 'Sembunyikan watermark panduan' : 'Tampilkan watermark panduan'}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            showGhostGuide
              ? 'bg-[#ffd261]/20 text-[#ffd261] border-[#ffd261]/40 shadow-[0_0_10px_rgba(255,210,97,0.2)]'
              : 'bg-white/5 text-white/50 border-white/10 hover:text-white/80'
          }`}
        >
          <EyeIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Panduan</span>
        </button>

        {/* Toggle Grid Lines */}
        <button
          type="button"
          onClick={onToggleGrid}
          disabled={disabled}
          title={showGrid ? 'Sembunyikan garis proporsi' : 'Tampilkan garis proporsi'}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            showGrid
              ? 'bg-[#D4A373]/20 text-[#D4A373] border-[#D4A373]/40'
              : 'bg-white/5 text-white/50 border-white/10 hover:text-white/80'
          }`}
        >
          <GridIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Grid</span>
        </button>

        <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block" />

        {/* Brush Size Selector Pill */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/40 border border-white/10">
          {(
            [
              { id: 'halus', label: 'Tipis', dotSize: 'w-1.5 h-1.5' },
              { id: 'sedang', label: 'Sedang', dotSize: 'w-2.5 h-2.5' },
              { id: 'tebal', label: 'Tebal', dotSize: 'w-3.5 h-3.5' },
            ] as const
          ).map((item) => {
            const isActive = brushSize === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onBrushSizeChange(item.id)}
                title={`Kuas ${item.label}`}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ffd261] text-[#0c1a2c] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`rounded-full bg-current ${item.dotSize}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
