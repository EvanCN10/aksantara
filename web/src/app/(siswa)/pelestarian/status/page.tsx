'use client';

import React from 'react';
import Link from 'next/link';
import { CurationTable } from '@/components/pelestarian/curation-table';
import { OrnateFrame } from '@/components/ui/ornate-frame';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

export default function PelestarianStatusPage() {
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
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/pelestarian"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Kembali ke Studio Transliterasi</span>
          </Link>

          <span className="text-[11px] font-mono text-[#ffd261] bg-[#ffd261]/10 px-3 py-1 rounded-full border border-[#ffd261]/25">
            Papan Kurasi Filolog
          </span>
        </div>
      </header>

      {/* 2. Main Curation Content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#ffd261] px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25 inline-block mb-2">
            Verifikasi & Validasi Epigrafi
          </span>
          <h1
            className="text-2xl sm:text-4xl font-bold text-white tracking-wide mb-2.5"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Status Kurasi Manuskrip Komunitas
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Daftar usulan pembacaan naskah kuno oleh siswa mahir yang telah ditinjau dan divalidasi oleh filolog dan kurator ahli naskah Nusantara.
          </p>
        </div>

        {/* Curation Table and Metrics */}
        <OrnateFrame className="w-full">
          <div className="rounded-3xl bg-[#141e2e]/90 p-5 sm:p-7">
            <CurationTable />
          </div>
        </OrnateFrame>
      </div>

      {/* 3. Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-6 text-center text-xs text-white/40">
        Aksantara Epigrafi & Filologi • Validasi Komunitas Pelestarian Naskah Kuno 2026
      </footer>
    </main>
  );
}
