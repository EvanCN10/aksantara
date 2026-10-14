'use client';

import React from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { SiswaDetailData } from '@/data/guru/guru-data';

interface SiswaDetailHeroProps {
  siswa: SiswaDetailData;
  prevId: string | null;
  nextId: string | null;
  onCetakRapor: () => void;
}

export const SiswaDetailHero: React.FC<SiswaDetailHeroProps> = ({
  siswa,
  prevId,
  nextId,
  onCetakRapor,
}) => {
  return (
    <div className="space-y-6">
      {/* Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Link
            href="/guru/dashboard"
            className="hover:text-[#ffd261] transition flex items-center gap-1"
          >
            <span>←</span>
            <span>Dashboard Guru</span>
          </Link>
          <span className="text-white/30">/</span>
          <span>Roster Siswa</span>
          <span className="text-white/30">/</span>
          <span className="text-[#ffd261] font-semibold">{siswa.nama}</span>
        </div>

        {/* Action Buttons: Prev, Next, Print */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {prevId ? (
            <Link
              href={`/guru/siswa/${prevId}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1"
            >
              <span>‹</span>
              <span>Sebelumnya</span>
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/30 bg-white/[0.02] border border-white/5 cursor-not-allowed">
              ‹ Sebelumnya
            </span>
          )}

          {nextId ? (
            <Link
              href={`/guru/siswa/${nextId}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <span>›</span>
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/30 bg-white/[0.02] border border-white/5 cursor-not-allowed">
              Berikutnya ›
            </span>
          )}

          <button
            onClick={onCetakRapor}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#ffd261] bg-[#ffd261]/10 hover:bg-[#ffd261]/20 border border-[#ffd261]/30 transition flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <span>🖨️</span>
            <span>Cetak Rapor</span>
          </button>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <OrnateFrame className="bg-[#0c1a2c]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-[#ffd261]/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#ffd261]/20 to-[#D4A373]/10 border-2 border-[#ffd261]/60 flex items-center justify-center text-3xl md:text-4xl shadow-inner shrink-0">
              {siswa.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ffd261]/15 text-[#ffd261] border border-[#ffd261]/30">
                  {siswa.gelarBudaya}
                </span>
                <span className="text-xs text-white/50">NISN: {siswa.nisn}</span>
                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                  siswa.statusAktivitas === 'Aktif Hari Ini'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-white/5 text-white/60 border-white/10'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    siswa.statusAktivitas === 'Aktif Hari Ini' ? 'bg-emerald-400' : 'bg-white/40'
                  }`} />
                  {siswa.statusAktivitas}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">
                {siswa.nama}
              </h1>

              {siswa.perluRemedi && siswa.glifKendala && (
                <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2.5">
                  <span className="text-red-400 text-sm mt-0.5">⚠️</span>
                  <div>
                    <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                      Status Bimbingan: Perlu Remedi Goresan
                    </span>
                    <p className="text-xs text-white/80 mt-0.5">
                      Kendala utama pada glif <span className="font-bold text-[#ffd261]">{siswa.glifKendala.glif}</span> ({siswa.glifKendala.aksara}): {siswa.glifKendala.catatan}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </OrnateFrame>

      {/* 4 Pilar Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilar 1 */}
        <div className="bg-[#0c1a2c]/75 backdrop-blur-md rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60 uppercase tracking-wider font-medium">
            <span>Pilar 1: AI Writing</span>
            <span className="text-amber-400 text-base">🎯</span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl md:text-3xl font-bold font-mono ${
              siswa.akurasiMenulis >= 90 ? 'text-emerald-400' : siswa.akurasiMenulis >= 80 ? 'text-[#ffd261]' : 'text-red-400'
            }`}>
              {siswa.akurasiMenulis}%
            </div>
            <p className="text-xs text-white/50 mt-1">
              {siswa.akurasiMenulis >= 90 ? 'Kategori: Unggul & Presisi' : siswa.akurasiMenulis >= 80 ? 'Kategori: Kompeten' : 'Kategori: Memerlukan Penguatan'}
            </p>
          </div>
        </div>

        {/* Pilar 2 & 3: Hardware */}
        <div className="bg-[#0c1a2c]/75 backdrop-blur-md rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60 uppercase tracking-wider font-medium">
            <span>Pilar 3: Hardware Pad</span>
            <span className="text-purple-400 text-base">🎛️</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {siswa.sesiHardware} <span className="text-sm font-normal text-white/50">Sesi</span>
            </div>
            <p className="text-xs text-purple-300 mt-1">
              Ramu Mantra & Speed Match Aktif
            </p>
          </div>
        </div>

        {/* Pilar 3: Epos Cerita */}
        <div className="bg-[#0c1a2c]/75 backdrop-blur-md rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60 uppercase tracking-wider font-medium">
            <span>Pilar 3: Epos Cerita</span>
            <span className="text-amber-400 text-base">📖</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              ★ {siswa.eposBintang}/9 <span className="text-sm font-normal text-white/50">Bab</span>
            </div>
            <p className="text-xs text-amber-300 mt-1">
              3 Epos Daerah Terjelajahi
            </p>
          </div>
        </div>

        {/* Pilar 4: Preservasi */}
        <div className="bg-[#0c1a2c]/75 backdrop-blur-md rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60 uppercase tracking-wider font-medium">
            <span>Pilar 4: Preservasi</span>
            <span className="text-emerald-400 text-base">📜</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {siswa.usulanPreservasi} <span className="text-sm font-normal text-white/50">Naskah</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1">
              Kurasi Komunitas Aktif (+{siswa.usulanPreservasi * 75} XP)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
