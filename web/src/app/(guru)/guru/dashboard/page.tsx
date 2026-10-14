'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GURU_PROFILE,
  GLIF_KRITIS_DATA,
  DAFTAR_SISWA_ROSTER,
  AKTIVITAS_KELAS_TERBARU,
} from '@/data/guru/guru-data';
import { GuruHero } from '@/components/dashboard/guru-hero';
import { TrinitasMasteryCard } from '@/components/dashboard/trinitas-mastery-card';
import { RemedialAlertPanel } from '@/components/dashboard/remedial-alert-panel';
import { StudentRosterTable } from '@/components/dashboard/student-roster-table';

export default function GuruDashboardPage() {
  const [selectedPeriode, setSelectedPeriode] = useState('semester');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Action handlers
  const handleExportCsv = () => {
    // TODO: BACKEND INTEGRATION - Connect to Supabase to export real gradebook CSV
    const csvContent =
      'data:text/csv;charset=utf-8,ID,NISN,Nama,Gelar,Akurasi_AI,Sesi_Hardware,Epos_Bintang,Preservasi,Status\n' +
      DAFTAR_SISWA_ROSTER.map(
        (s) =>
          `${s.id},${s.nisn},"${s.nama}","${s.gelarBudaya}",${s.akurasiMenulis}%,${s.sesiHardware},${s.eposBintang}/9,${s.usulanPreservasi},"${s.statusAktivitas}"`
      ).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Aksantara_${GURU_PROFILE.namaKelas.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('Rekap Nilai Siswa (.CSV) berhasil diunduh ke perangkat Anda!');
  };

  const handleTugaskanLatihan = () => {
    triggerToast('Modul latihan kurikulum baru berhasil dibagikan ke seluruh 32 siswa aktif!');
  };

  const handleTugaskanGlif = (glifNama: string) => {
    triggerToast(`Modul penguatan khusus untuk karakter [${glifNama}] telah dijadwalkan ke kelas!`);
  };

  const handleKirimLatihan = (siswaNama: string, glifInfo: string) => {
    triggerToast(`Latihan remedial aksara ${glifInfo} telah dikirimkan ke akun ${siswaNama}!`);
  };

  return (
    <div className="min-h-screen bg-[#060d16] text-white flex flex-col selection:bg-[#ffd261] selection:text-[#0c1a2c]">
      {/* Top Navbar Header */}
      <header className="border-b border-white/10 bg-[#0c1a2c]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/mulai"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Portal Aksantara</span>
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <span className="font-serif font-bold text-sm md:text-base text-white tracking-wide">
                Pusat Kendali Pengampu & Analitik Budaya
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pelestarian"
              className="text-xs font-medium text-white/70 hover:text-white transition hidden sm:inline"
            >
              Studio Preservasi
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
        {/* Toast Floating Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="bg-[#0c1a2c] text-[#ffd261] border-2 border-[#ffd261]/80 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <span className="text-xl">✨</span>
              <span className="text-sm font-semibold text-white">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 1. Hero Pengampu & 4 KPI Cards */}
        <GuruHero
          profile={GURU_PROFILE}
          selectedPeriode={selectedPeriode}
          onPeriodeChange={setSelectedPeriode}
          onExportCsv={handleExportCsv}
          onTugaskanLatihan={handleTugaskanLatihan}
        />

        {/* 2. Peta Kemahiran Trinitas Aksara & Glif Kritis */}
        <TrinitasMasteryCard
          glifKritisList={GLIF_KRITIS_DATA}
          onTugaskanGlif={handleTugaskanGlif}
        />

        {/* 3. Panel Remedi AI & Linimasa Aktivitas Terkini */}
        <RemedialAlertPanel
          siswaRemediList={DAFTAR_SISWA_ROSTER.filter((s) => s.perluRemedi)}
          aktivitasList={AKTIVITAS_KELAS_TERBARU}
          onKirimLatihan={handleKirimLatihan}
        />

        {/* 4. Roster Siswa & Tabel Rekap 4 Pilar */}
        <StudentRosterTable daftarSiswa={DAFTAR_SISWA_ROSTER} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060d16] py-6 text-center text-xs text-white/40">
        <p>Aksantara Trinitas © 2026 — Sistem Evaluasi & Analitik Terpadu Guru Kebudayaan Nusantara</p>
      </footer>
    </div>
  );
}
