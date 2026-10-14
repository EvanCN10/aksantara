'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DAFTAR_MANUSKRIP, type ManuskripItem } from '@/data/pelestarian/manuskrip-data';
import { ManuscriptViewer } from '@/components/pelestarian/manuscript-viewer';
import { TranscriptionEditor } from '@/components/pelestarian/transcription-editor';
import { OrnateFrame } from '@/components/ui/ornate-frame';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

export default function PelestarianPage() {
  const [selectedManuscriptIndex, setSelectedManuscriptIndex] = useState(0);
  const activeManuskrip: ManuskripItem = DAFTAR_MANUSKRIP[selectedManuscriptIndex];

  const handleCorrectionSubmit = (koreksiTeks: string) => {
    // ============================================================================
    // TODO: BACKEND INTEGRATION
    // Simpan usulan koreksi ke Active Learning Buffer di database Supabase:
    // POST /api/pelestarian/submit-correction
    // Body Payload:
    // {
    //   manuskripId: activeManuskrip.id,
    //   kodeArsip: activeManuskrip.kodeArsip,
    //   usulanTeks: koreksiTeks,
    //   userId: "current-user-id"
    // }
    // ============================================================================
    console.log('Koreksi terkirim untuk', activeManuskrip.id, ':', koreksiTeks);
  };

  return (
    <main className="relative min-h-screen bg-[#0c1a2c] text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/3 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.1),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-1/4 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/mulai"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Kembali ke Pilihan Jalur</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/pelestarian/status"
              className="text-xs font-semibold text-[#ffd261] bg-[#ffd261]/10 hover:bg-[#ffd261]/20 px-3.5 py-1.5 rounded-full border border-[#ffd261]/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>Papan Status Kurasi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Studio Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#ffd261] px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25 inline-block mb-2">
            Pilar 4: Human-in-the-Loop Preservasi & Digitalisasi
          </span>
          <h1
            className="text-2xl sm:text-4xl font-bold text-white tracking-wide mb-2.5"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Studio Transliterasi Manuskrip Kuno
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Bantu filolog menyempurnakan pembacaan naskah bersejarah Nusantara. Periksa prediksi awal AI dan sumbangkan usulan transliterasi Latin yang tepat.
          </p>
        </div>

        {/* 3. Manuscript Selector Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {DAFTAR_MANUSKRIP.map((ms, idx) => (
            <button
              key={ms.id}
              type="button"
              onClick={() => setSelectedManuscriptIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                selectedManuscriptIndex === idx
                  ? 'bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] border-[#ffd261] shadow-[0_0_16px_rgba(255,210,97,0.3)] font-bold'
                  : 'bg-[#141e2e]/90 text-white/70 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              📜 {ms.judul}
            </button>
          ))}
        </div>

        {/* 4. Split Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Manuscript Viewer (7 cols) */}
          <div className="lg:col-span-7">
            <OrnateFrame className="w-full">
              <ManuscriptViewer manuskrip={activeManuskrip} />
            </OrnateFrame>
          </div>

          {/* Right Column: AI Pre-Prediction & Human-in-the-Loop Editor (5 cols) */}
          <div className="lg:col-span-5">
            <TranscriptionEditor
              manuskrip={activeManuskrip}
              onSubmitCorrection={handleCorrectionSubmit}
            />
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-6 text-center text-xs text-white/40">
        Aksantara Manuskrip Digital • British Library EAP & PNRI Preservation • FMIPA UGM 2026
      </footer>
    </main>
  );
}
