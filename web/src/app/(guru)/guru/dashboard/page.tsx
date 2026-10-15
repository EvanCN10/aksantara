'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Landmark, User, Sparkles } from 'lucide-react';
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
import { playSuccessGamelan } from '@/lib/audio/sound-effects';

export default function GuruDashboardPage() {
  const [selectedPeriode, setSelectedPeriode] = useState('semester');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Acoustic chime feedback
  const playChime = () => {
    playSuccessGamelan();
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
    try {
      const headers = [
        'ID',
        'NISN',
        'Nama Siswa',
        'Gelar Budaya',
        'Akurasi Menulis AI',
        'Sesi Hardware',
        'Epos Bintang',
        'Preservasi Manuskrip',
        'Status',
      ];
      const rows = DAFTAR_SISWA_ROSTER.map((s) => [
        s.id,
        s.nisn,
        `"${s.nama.replace(/"/g, '""')}"`,
        `"${s.gelarBudaya.replace(/"/g, '""')}"`,
        `"${s.akurasiMenulis}%"`,
        s.sesiHardware,
        `"${s.eposBintang}/9"`,
        s.usulanPreservasi,
        `"${s.statusAktivitas}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanClassName = GURU_PROFILE.namaKelas.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `Rekap_Nilai_Aksantara_${cleanClassName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      triggerToast('Rekap Nilai Siswa (.CSV) berhasil diunduh ke perangkat Anda!');
    } catch (err) {
      console.error('Gagal mengekspor CSV:', err);
      triggerToast('Gagal mengekspor rekap nilai. Silakan coba lagi.');
    }
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
    <div className="min-h-screen text-white flex flex-col selection:bg-[#ffd261] selection:text-[#0c1a2c] relative">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-dashboard-guru.webp"
          alt="Balairung Guru Pamomong"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.45] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/75 to-[#060d16]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

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
              <Landmark className="w-5 h-5 text-[#ffd261]" />
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
              <User className="w-4 h-4" />
              <span>Profil Pengampu</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Toast Floating Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-toast-slide-in">
            <div className="bg-[#0c1a2c]/95 text-[#ffd261] border border-[#ffd261]/80 px-5 py-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_24px_rgba(255,210,97,0.25)] flex items-center gap-3 backdrop-blur-xl">
              <Sparkles className="w-5 h-5 text-[#ffd261] shrink-0" />
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
        <p>Aksantara Trinitas © 2026 - Sistem Evaluasi & Analitik Terpadu Guru Kebudayaan Nusantara</p>
      </footer>
    </div>
  );
}
