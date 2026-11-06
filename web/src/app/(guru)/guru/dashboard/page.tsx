'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Info, Landmark, LogOut, Sparkles } from 'lucide-react';
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
import { useAuth } from '@/context/auth-context';

export default function GuruDashboardPage() {
  const { logout } = useAuth();
  const [selectedPeriode, setSelectedPeriode] = useState('semester');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    playSuccessGamelan();
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleExportCsv = () => {
    try {
      const headers = [
        'ID',
        'NISN',
        'Nama Siswa',
        'Gelar Budaya',
        'Rata-rata Probabilitas Klasifikasi (Simulasi)',
        'Glif Dikuasai (dari 30)',
        'Bintang Epos Calon Arang',
        'Preservasi Manuskrip',
        'Status',
      ];
      const rows = DAFTAR_SISWA_ROSTER.map((s) => [
        s.id,
        s.nisn,
        `"${s.nama.replace(/"/g, '""')}"`,
        `"${s.gelarBudaya.replace(/"/g, '""')}"`,
        `"${s.akurasiMenulis}%"`,
        s.glifDikuasai,
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
      link.setAttribute('download', `Contoh_Rekap_Simulasi_Aksantara_${cleanClassName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      triggerToast('Contoh rekap simulasi kelas (.CSV) berhasil diunduh ke perangkat Anda.');
    } catch (err) {
      console.error('Gagal mengekspor CSV:', err);
      triggerToast('Gagal mengekspor rekap nilai. Silakan coba lagi.');
    }
  };

  const handleTugaskanLatihan = () => {
    triggerToast('Simulasi: Modul latihan Aksara Bali dijadwalkan untuk kohor kelas contoh.');
  };

  const handleTugaskanGlif = (glifNama: string) => {
    triggerToast(`Simulasi: Modul penguatan untuk karakter [${glifNama}] dijadwalkan ke kelas.`);
  };

  const handleKirimLatihan = (siswaNama: string, glifInfo: string) => {
    triggerToast(`Simulasi: Latihan penguatan ${glifInfo} dikirimkan ke ${siswaNama}.`);
  };

  return (
    <div className="min-h-dvh text-white flex flex-col selection:bg-[#ffd261] selection:text-[#0c1a2c] relative">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-dashboard-guru.webp"
          alt=""
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
      <header className="border-b border-white/10 bg-[#0c1a2c]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/mulai"
              className="min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition inline-flex items-center gap-1.5 shrink-0 focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              <span aria-hidden="true">←</span>
              <span>Portal Aksantara</span>
            </Link>
            <span className="text-white/20 hidden sm:inline" aria-hidden="true">|</span>
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <Landmark className="w-5 h-5 text-[#ffd261] shrink-0" aria-hidden="true" />
              <span className="font-serif font-bold text-sm md:text-base text-white tracking-wide truncate">
                Ruang Pengampu Aksara Bali
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/latihan/web/bali"
              className="min-h-11 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition hidden md:inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              Katalog Latihan
            </Link>
            <Link
              href="/pelestarian"
              className="min-h-11 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition hidden sm:inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              Studio Preservasi
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
        {/* Explicit Transparency Banner (Bali DigiFest 2026 Anti-Disqualification Rule) */}
        <div
          role="note"
          aria-label="Pemberitahuan mode simulasi kelas"
          className="rounded-2xl border border-amber-400/50 bg-amber-950/75 backdrop-blur-md px-4 py-3.5 sm:px-5 flex items-start gap-3 shadow-lg"
        >
          <Info className="w-5 h-5 text-[#ffd261] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            <strong className="font-bold text-[#ffd261]">
              Mode Simulasi Kelas — Contoh Data Pengampu (Ilustrasi Analitik Kelas Bali DigiFest 2026):
            </strong>{' '}
            Angka kohor dan daftar siswa pada halaman ini adalah <strong>contoh data ilustrasi</strong> antarmuka guru. Untuk menguji klasifikasi AI nyata (EfficientNet-B0 ONNX di browser), silakan buka{' '}
            <Link href="/latihan/web/bali" className="underline font-semibold text-[#ffd261] hover:text-white">
              Katalog Latihan Aksara Bali
            </Link>{' '}
            atau{' '}
            <Link href="/cerita" className="underline font-semibold text-[#ffd261] hover:text-white">
              Story Mode Calon Arang
            </Link>
            .
          </div>
        </div>

        {/* Toast Floating Notification */}
        {toastMessage && (
          <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 animate-toast-slide-in">
            <div className="bg-[#0c1a2c]/95 text-[#ffd261] border border-[#ffd261]/80 px-5 py-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_24px_rgba(255,210,97,0.25)] flex items-center gap-3 backdrop-blur-xl">
              <Sparkles className="w-5 h-5 text-[#ffd261] shrink-0" aria-hidden="true" />
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

        {/* 2. Peta Kemahiran Aksara Bali & Glif Kritis */}
        <TrinitasMasteryCard
          glifKritisList={GLIF_KRITIS_DATA}
          onTugaskanGlif={handleTugaskanGlif}
        />

        {/* 3. Panel Bimbingan & Linimasa Aktivitas Contoh */}
        <RemedialAlertPanel
          siswaRemediList={DAFTAR_SISWA_ROSTER.filter((s) => s.perluRemedi)}
          aktivitasList={AKTIVITAS_KELAS_TERBARU}
          onKirimLatihan={handleKirimLatihan}
        />

        {/* 4. Roster Siswa Contoh */}
        <StudentRosterTable daftarSiswa={DAFTAR_SISWA_ROSTER} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060d16]/90 backdrop-blur-sm py-6 text-center text-xs text-white/70 relative z-10">
        <p>Aksantara © 2026 — Mode Simulasi Pengampu Aksara Bali (Bali DigiFest 2026)</p>
      </footer>
    </div>
  );
}
