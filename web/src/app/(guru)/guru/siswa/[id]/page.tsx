'use client';

import React, { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Info, LogOut, Scroll, Sparkles } from 'lucide-react';
import { getSiswaDetailById, getAdjacentSiswaIds } from '@/data/guru/guru-data';
import { SiswaDetailHero } from '@/components/dashboard/siswa-detail/siswa-detail-hero';
import { SiswaPillarTabs } from '@/components/dashboard/siswa-detail/siswa-pillar-tabs';
import { SiswaTeacherNotes } from '@/components/dashboard/siswa-detail/siswa-teacher-notes';
import { playSuccessGamelan } from '@/lib/audio/sound-effects';
import { useAuth } from '@/context/auth-context';

interface DetailSiswaPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailSiswaPage({ params }: DetailSiswaPageProps) {
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id || '';
  const { logout } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const siswa = getSiswaDetailById(id);
  if (!siswa) {
    notFound();
  }

  const { prevId, nextId } = getAdjacentSiswaIds(id);

  const triggerToast = (msg: string) => {
    playSuccessGamelan();
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCetakRapor = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleSaveNotes = () => {
    triggerToast(`Simulasi: Catatan evaluasi untuk ${siswa.nama} disimpan di sesi tampilan ini.`);
  };

  return (
    <div className="min-h-dvh bg-[#060d16] text-white flex flex-col selection:bg-[#ffd261] selection:text-[#0c1a2c] print:bg-white print:text-black relative">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16] print:hidden" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-dashboard-guru.webp"
          alt=""
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.42] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/78 to-[#060d16]/48" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      {/* Top Navbar Header (Hidden in Print) */}
      <header className="border-b border-white/10 bg-[#0c1a2c]/85 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/guru/dashboard"
              className="min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition inline-flex items-center gap-1.5 shrink-0 focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              <span aria-hidden="true">←</span>
              <span>Dashboard Guru</span>
            </Link>
            <span className="text-white/20 hidden sm:inline" aria-hidden="true">|</span>
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <Scroll className="w-5 h-5 text-[#ffd261] shrink-0" aria-hidden="true" />
              <span className="font-serif font-bold text-sm md:text-base text-white tracking-wide truncate">
                Contoh Rapor Literasi Aksara Bali
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/guru/dashboard"
              className="min-h-11 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-[#ffd261] hover:bg-white/5 transition hidden sm:inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              Roster Kohor Kelas
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8 relative z-10">
        {/* Explicit Transparency Banner */}
        <div
          role="note"
          aria-label="Pemberitahuan contoh data siswa"
          className="rounded-2xl border border-amber-400/50 bg-amber-950/75 backdrop-blur-md px-4 py-3.5 sm:px-5 flex items-start gap-3 shadow-lg print:hidden"
        >
          <Info className="w-5 h-5 text-[#ffd261] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            <strong className="font-bold text-[#ffd261]">
              Mode Simulasi Kelas — Contoh Data Pengampu (Bali DigiFest 2026):
            </strong>{' '}
            Profil diagnostik <strong>{siswa.nama}</strong> merupakan contoh data untuk mendemonstrasikan antarmuka pemantauan guru Aksara Bali.
          </p>
        </div>

        {/* Floating Toast Notification (Hidden in Print) */}
        {toastMessage && (
          <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 print:hidden">
            <div className="bg-[#0c1a2c] text-[#ffd261] border-2 border-[#ffd261]/80 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-[#ffd261]" aria-hidden="true" />
              <span className="text-sm font-semibold text-white">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 1. Hero Siswa & Summary */}
        <SiswaDetailHero
          siswa={siswa}
          prevId={prevId}
          nextId={nextId}
          onCetakRapor={handleCetakRapor}
        />

        {/* 2. Deep-Dive Diagnostic 3 Pillars Tab */}
        <SiswaPillarTabs siswa={siswa} />

        {/* 3. Panel Catatan & Rekomendasi Evaluasi Guru */}
        <SiswaTeacherNotes
          initialNotes={siswa.catatanGuruTerdahulu}
          siswaNama={siswa.nama}
          onSaveNotes={handleSaveNotes}
        />
      </main>

      {/* Footer (Hidden in Print) */}
      <footer className="border-t border-white/10 bg-[#060d16]/90 backdrop-blur-sm py-6 text-center text-xs text-white/70 print:hidden relative z-10">
        <p>Aksantara © 2026 — Contoh Rapor Literasi Siswa (Mode Simulasi Bali DigiFest 2026)</p>
      </footer>
    </div>
  );
}
