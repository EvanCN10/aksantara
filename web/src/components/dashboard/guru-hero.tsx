'use client';

import React from 'react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { GuruClassProfile } from '@/data/guru/guru-data';
import {
  Landmark,
  School,
  Scroll,
  Download,
  PenTool,
  Users,
  Target,
  Zap,
  Sliders,
} from 'lucide-react';

interface GuruHeroProps {
  profile: GuruClassProfile;
  selectedPeriode: string;
  onPeriodeChange: (periode: string) => void;
  onExportCsv: () => void;
  onTugaskanLatihan: () => void;
}

function useCountUp(target: number, durationMs: number = 1000, decimals: number = 0) {
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easeProgress * target;

      setVal(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, durationMs, decimals]);

  return val;
}

export const GuruHero: React.FC<GuruHeroProps> = ({
  profile,
  selectedPeriode,
  onPeriodeChange,
  onExportCsv,
  onTugaskanLatihan,
}) => {
  const countSiswaAktif = useCountUp(profile.siswaAktif, 900);
  const countAkurasi = useCountUp(profile.rataRataAkurasi, 1100, 1);
  const countHardware = useCountUp(profile.totalSesiHardware, 1000);
  const countPreservasi = useCountUp(profile.totalPreservasi, 950);

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <OrnateFrame className="bg-[#0c1a2c]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-[#ffd261]/30 animate-cascade-fade-up">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#ffd261]/20 to-[#D4A373]/10 border-2 border-[#ffd261]/60 flex items-center justify-center shadow-inner shrink-0">
              <Landmark className="w-8 h-8 md:w-10 md:h-10 text-[#ffd261]" />
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
                <span className="inline-flex items-center gap-1.5"><School className="w-4 h-4 text-white/50 shrink-0" /> {profile.institusi}</span>
                <span className="text-white/30">•</span>
                <span className="inline-flex items-center gap-1.5 text-[#ffd261]/90 font-medium"><Scroll className="w-4 h-4 text-[#ffd261] shrink-0" /> {profile.namaKelas}</span>
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
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Rekap (CSV)</span>
            </button>

            <button
              onClick={onTugaskanLatihan}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#0c1a2c] bg-gradient-to-r from-[#ffd261] to-[#D4A373] hover:brightness-110 shadow-lg shadow-[#ffd261]/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Tugaskan Latihan</span>
            </button>
          </div>
        </div>
      </OrnateFrame>

      {/* 4 KPI Summary Cards with Staggered Count-Up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition-all duration-300 hover:scale-[1.02] group animate-cascade-fade-up">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Partisipasi Siswa</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20"><Users className="w-5 h-5 text-blue-400" /></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {countSiswaAktif} <span className="text-base text-white/50 font-normal font-sans">/ {profile.totalSiswa}</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>●</span> 94.1% Siswa Aktif Pekan Ini
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition-all duration-300 hover:scale-[1.02] group animate-cascade-fade-up [animation-delay:80ms]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Akurasi Menulis AI</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"><Target className="w-5 h-5 text-amber-400" /></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-[#ffd261] font-mono">
              {countAkurasi}%
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>▲</span> +3.4% dari bulan lalu (Evaluasi CNN)
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition-all duration-300 hover:scale-[1.02] group animate-cascade-fade-up [animation-delay:160ms]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Sesi Hardware IoT</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20"><Zap className="w-5 h-5 text-purple-400" /></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {countHardware} <span className="text-base text-white/50 font-normal font-sans">Sesi</span>
            </div>
            <p className="text-xs text-purple-300 mt-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>14.2 Jam Sesi Tactile Pad</span>
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#0c1a2c]/70 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-[#ffd261]/40 transition-all duration-300 hover:scale-[1.02] group animate-cascade-fade-up [animation-delay:240ms]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Preservasi Manuskrip</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Scroll className="w-5 h-5 text-emerald-400" /></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {countPreservasi} <span className="text-base text-white/50 font-normal font-sans">Usulan</span>
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
