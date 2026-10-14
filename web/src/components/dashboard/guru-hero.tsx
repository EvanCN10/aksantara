'use client';

import React from 'react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { GuruClassProfile } from '@/data/guru/guru-data';

interface GuruHeroProps {
  profile: GuruClassProfile;
  selectedPeriode: string;
  onPeriodeChange: (periode: string) => void;
  onExportCsv: () => void;
  onTugaskanLatihan: () => void;
}

export const GuruHero: React.FC<GuruHeroProps> = ({
  profile,
  selectedPeriode,
  onPeriodeChange,
  onExportCsv,
  onTugaskanLatihan,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <OrnateFrame className="bg-[#0c1a2c]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-[#ffd261]/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#ffd261]/20 to-[#D4A373]/10 border-2 border-[#ffd261]/60 flex items-center justify-center text-3xl md:text-4xl shadow-inner shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ffd261]/15 text-[#ffd261] border border-[#ffd261]/30">
                  {profile.jabatan}
                </span>
                <span className="text-xs text-white/50">NIP: {profile.nip}</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">
                {profile.namaGuru}, <span className="text-[#ffd261]">{profile.gelarAkademik}</span>
              </h1>
              <p className="text-sm md:text-base text-white/70 mt-1 flex flex-wrap items-center gap-2">
                <span>🏫 {profile.institusi}</span>
                <span className="text-white/30">•</span>
                <span className="text-[#ffd261]/90 font-medium">📜 {profile.namaKelas}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <select
              value={selectedPeriode}
              onChange={(e) => onPeriodeChange(e.target.value)}
              className="bg-[#060d16] text-white/90 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffd261] transition"
            >
              <option value="semester">Semester Genap 2025/2026</option>
              <option value="bulan">Bulan Oktober 2026</option>
              <option value="minggu">7 Hari Terakhir</option>
            </select>

            <button
              onClick={onExportCsv}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>📥</span>
              <span>Ekspor Rekap (CSV)</span>
            </button>

            <button
              onClick={onTugaskanLatihan}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#0c1a2c] bg-gradient-to-r from-[#ffd261] to-[#D4A373] hover:brightness-110 shadow-lg shadow-[#ffd261]/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>✍️</span>
              <span>Tugaskan Latihan</span>
            </button>
          </div>
        </div>
      </OrnateFrame>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Partisipasi Siswa</span>
            <span className="text-xl p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">👥</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {profile.siswaAktif} <span className="text-base text-white/50 font-normal">/ {profile.totalSiswa}</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>●</span> 94.1% Siswa Aktif Pekan Ini
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Akurasi Menulis AI</span>
            <span className="text-xl p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">🎯</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-[#ffd261]">
              {profile.rataRataAkurasi}%
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>▲</span> +3.4% dari bulan lalu (Evaluasi CNN)
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Sesi Hardware IoT</span>
            <span className="text-xl p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">⚡</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {profile.totalSesiHardware} <span className="text-base text-white/50 font-normal">Sesi</span>
            </div>
            <p className="text-xs text-purple-300 mt-1 flex items-center gap-1">
              <span>🎛️</span> 14.2 Jam Sesi Tactile Pad
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Preservasi Manuskrip</span>
            <span className="text-xl p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📜</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {profile.totalPreservasi} <span className="text-base text-white/50 font-normal">Usulan</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>✓</span> 38 Lembar Terverifikasi Filolog
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
