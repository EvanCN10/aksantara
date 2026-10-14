'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { getSiswaDetailById, getAdjacentSiswaIds } from '@/data/guru/guru-data';
import { SiswaDetailHero } from '@/components/dashboard/siswa-detail/siswa-detail-hero';
import { SiswaPillarTabs } from '@/components/dashboard/siswa-detail/siswa-pillar-tabs';
import { SiswaTeacherNotes } from '@/components/dashboard/siswa-detail/siswa-teacher-notes';
import { OrnateFrame } from '@/components/ui/ornate-frame';

interface DetailSiswaPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailSiswaPage({ params }: DetailSiswaPageProps) {
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id || '1';

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const siswa = getSiswaDetailById(id);
  const { prevId, nextId } = getAdjacentSiswaIds(id);

  // Audio chime feedback
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio not supported or blocked
    }
  };

  const triggerToast = (msg: string) => {
    playChime();
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

  const handleSaveNotes = (notes: string) => {
    // TODO: BACKEND INTEGRATION - Save teacher evaluation notes to Supabase `student_evaluations`
    console.log(`Menyimpan catatan untuk siswa ID ${id}:`, notes);
    triggerToast(`Catatan evaluasi untuk ${siswa?.nama || 'Siswa'} berhasil disimpan dan disinkronkan!`);
  };

  // Fallback if student not found
  if (!siswa) {
    return (
      <div className="min-h-screen bg-[#060d16] text-white flex flex-col items-center justify-center p-4">
        <OrnateFrame className="bg-[#0c1a2c]/90 p-8 rounded-2xl border border-white/20 text-center max-w-md space-y-4">
          <div className="text-4xl">📜</div>
          <h1 className="text-xl font-serif font-bold text-white">Siswa Tidak Ditemukan</h1>
          <p className="text-xs text-white/60">
            Data siswa dengan pengenal ID &quot;{id}&quot; tidak terdaftar dalam kohor kelas pengampu saat ini.
          </p>
          <div className="pt-2">
            <Link
              href="/guru/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-[#0c1a2c] bg-gradient-to-r from-[#ffd261] to-[#D4A373] hover:brightness-110 transition shadow-lg shadow-[#ffd261]/20"
            >
              <span>←</span>
              <span>Kembali ke Dashboard Guru</span>
            </Link>
          </div>
        </OrnateFrame>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d16] text-white flex flex-col selection:bg-[#ffd261] selection:text-[#0c1a2c] print:bg-white print:text-black">
      {/* Top Navbar Header (Hidden in Print) */}
      <header className="border-b border-white/10 bg-[#0c1a2c]/80 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/guru/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Dashboard Guru</span>
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <span className="font-serif font-bold text-sm md:text-base text-white tracking-wide">
                Rapor Literasi & Diagnostik Individual
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/guru/dashboard"
              className="text-xs font-medium text-white/70 hover:text-[#ffd261] transition hidden sm:inline"
            >
              Roster Kohor Kelas
            </Link>
            <span className="text-white/20 hidden sm:inline">•</span>
            <Link
              href="/profil"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#ffd261] bg-[#ffd261]/10 hover:bg-[#ffd261]/20 border border-[#ffd261]/30 transition flex items-center gap-1.5"
            >
              <span>👤</span>
              <span>Profil Pengampu</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Floating Toast Notification (Hidden in Print) */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce print:hidden">
            <div className="bg-[#0c1a2c] text-[#ffd261] border-2 border-[#ffd261]/80 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <span className="text-xl">✨</span>
              <span className="text-sm font-semibold text-white">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 1. Hero Siswa & 4 Pilar Summary */}
        <SiswaDetailHero
          siswa={siswa}
          prevId={prevId}
          nextId={nextId}
          onCetakRapor={handleCetakRapor}
        />

        {/* 2. Deep-Dive Diagnostic 4 Pillars Tab */}
        <SiswaPillarTabs siswa={siswa} />

        {/* 3. Panel Catatan & Rekomendasi Evaluasi Guru */}
        <SiswaTeacherNotes
          initialNotes={siswa.catatanGuruTerdahulu}
          siswaNama={siswa.nama}
          onSaveNotes={handleSaveNotes}
        />
      </main>

      {/* Footer (Hidden in Print) */}
      <footer className="border-t border-white/10 bg-[#060d16] py-6 text-center text-xs text-white/40 print:hidden">
        <p>Aksantara Trinitas © 2026 — Dokumen Resmi Evaluasi Literasi Siswa & Kepamongbudayaan</p>
      </footer>
    </div>
  );
}
