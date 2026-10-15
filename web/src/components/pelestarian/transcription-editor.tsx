'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Sparkles, ClipboardList } from 'lucide-react';
import type { ManuskripItem } from '@/data/pelestarian/manuskrip-data';
import { playSuccessGamelan } from '@/lib/audio/sound-effects';

interface TranscriptionEditorProps {
  manuskrip: ManuskripItem;
  onSubmitCorrection: (koreksiTeks: string) => void;
}

export function TranscriptionEditor({
  manuskrip,
  onSubmitCorrection,
}: TranscriptionEditorProps) {
  const [usulanTeks, setUsulanTeks] = useState(manuskrip.transliterasiBaku);
  const [submitted, setSubmitted] = useState(false);

  // Play acoustic gamelan chime on submission
  const playRewardSound = () => {
    playSuccessGamelan();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usulanTeks.trim()) return;

    playRewardSound();
    onSubmitCorrection(usulanTeks.trim());
    setSubmitted(true);
  };

  return (
    <div className="w-full rounded-3xl bg-[#141e2e]/90 border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* 1. AI OCR Pre-Prediction Card */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#ffd261]/80 block">
            Prediksi Awal Model AI (NusaAksara OCR)
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {manuskrip.confidenceScore}% Keyakinan
          </span>
        </div>

        <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
          <p className="text-xs sm:text-sm text-white/80 font-mono leading-relaxed italic">
            &quot;{manuskrip.prediksiOcrAi}&quot;
          </p>
          <span className="text-[10px] text-white/40 flex items-center gap-1.5 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Terdapat glif yang pudar atau terpotong noda usia naskah. Periksa dan sempurnakan pembacaannya di bawah.</span>
          </span>
        </div>
      </div>

      {/* 2. Human-in-the-Loop Correction Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <label htmlFor="koreksi-teks" className="text-xs font-bold text-white tracking-wide">
            Usulan Transliterasi Latin Siswa Mahir:
          </label>
          <span className="text-[10px] font-mono text-[#ffd261]">
            Hadiah Kontribusi: +75 XP
          </span>
        </div>

        <textarea
          id="koreksi-teks"
          value={usulanTeks}
          onChange={(e) => {
            setUsulanTeks(e.target.value);
            setSubmitted(false);
          }}
          rows={3}
          className="w-full rounded-2xl bg-black/50 border border-white/15 p-3.5 text-xs sm:text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-[#ffd261] focus:ring-1 focus:ring-[#ffd261] transition-colors resize-none"
          placeholder="Tuliskan pembacaan transliterasi Latin yang tepat di sini..."
        />

        {/* Success Confirmation Toast */}
        {submitted && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in duration-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Usulan berhasil dikirimkan ke antrean kurasi filolog! (+75 XP)</span>
            </span>
            <Link
              href="/pelestarian/status"
              className="text-[11px] font-bold underline hover:text-white ml-2 shrink-0"
            >
              Cek Status →
            </Link>
          </div>
        )}

        {/* Submit Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(255,210,97,0.3)] hover:opacity-95 transition-all cursor-pointer text-center"
          >
            Kirim Usulan Transliterasi →
          </button>

          <Link
            href="/pelestarian/status"
            className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Papan Kurasi</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
