'use client';

import React from 'react';
import Link from 'next/link';
import { Printer, AlertTriangle, Target, BookOpen, Star, Scroll } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <nav aria-label="Breadcrumb siswa" className="flex items-center gap-2 text-xs text-white/75">
          <Link
            href="/guru/dashboard"
            className="min-h-11 inline-flex items-center gap-1 hover:text-[#ffd261] transition focus-visible:outline-2 focus-visible:outline-[#ffd261] rounded-lg px-1"
          >
            <span aria-hidden="true">←</span>
            <span>Dashboard Guru</span>
          </Link>
          <span className="text-white/40" aria-hidden="true">/</span>
          <span>Roster Contoh</span>
          <span className="text-white/40" aria-hidden="true">/</span>
          <span className="text-[#ffd261] font-semibold" aria-current="page">{siswa.nama}</span>
        </nav>

        {/* Action Buttons: Prev, Next, Print */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {prevId ? (
            <Link
              href={`/guru/siswa/${prevId}`}
              className="min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/85 bg-white/5 hover:bg-white/10 border border-white/15 transition inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              <span aria-hidden="true">‹</span>
              <span>Siswa Sebelumnya</span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/40 bg-white/[0.02] border border-white/10 inline-flex items-center cursor-not-allowed"
            >
              ‹ Siswa Sebelumnya
            </span>
          )}

          {nextId ? (
            <Link
              href={`/guru/siswa/${nextId}`}
              className="min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/85 bg-white/5 hover:bg-white/10 border border-white/15 transition inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              <span>Siswa Berikutnya</span>
              <span aria-hidden="true">›</span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/40 bg-white/[0.02] border border-white/10 inline-flex items-center cursor-not-allowed"
            >
              Siswa Berikutnya ›
            </span>
          )}

          <button
            type="button"
            onClick={onCetakRapor}
            className="min-h-11 px-4 py-2 rounded-xl text-xs font-semibold text-[#ffd261] bg-[#ffd261]/10 hover:bg-[#ffd261]/20 border border-[#ffd261]/35 transition inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261]"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Cetak Rapor</span>
          </button>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <OrnateFrame className="bg-[#0c1a2c]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-[#ffd261]/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#ffd261]/20 to-[#D4A373]/10 border-2 border-[#ffd261]/60 flex items-center justify-center font-bold text-xl md:text-2xl text-[#ffd261] shadow-inner shrink-0">
              {siswa.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ffd261]/15 text-[#ffd261] border border-[#ffd261]/30">
                  {siswa.gelarBudaya}
                </span>
                <span className="text-xs text-white/75">NISN Contoh: {siswa.nisn}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${
                  siswa.statusAktivitas === 'Aktif Hari Ini'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                    : 'bg-white/5 text-white/75 border-white/15'
                }`}>
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full ${
                      siswa.statusAktivitas === 'Aktif Hari Ini' ? 'bg-emerald-400' : 'bg-white/50'
                    }`}
                  />
                  {siswa.statusAktivitas}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">
                {siswa.nama}
              </h1>

              {siswa.perluRemedi && siswa.glifKendala && (
                <div className="mt-3 p-3.5 rounded-xl bg-red-950/35 border border-red-500/35 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-xs font-bold text-red-200 uppercase tracking-wider">
                      Status Bimbingan: Perlu Penguatan Bentuk Karakter
                    </span>
                    <p className="text-xs text-white/85 mt-0.5">
                      Kendala utama pada glif{' '}
                      <span lang="ban" className="font-bold text-[#ffd261]">
                        {siswa.glifKendala.glif}
                      </span>{' '}
                      ({siswa.glifKendala.aksara}): {siswa.glifKendala.catatan}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </OrnateFrame>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilar 1 */}
        <div className="bg-[#0c1a2c]/80 backdrop-blur-md rounded-xl p-5 border border-white/15">
          <div className="flex items-center justify-between text-xs text-white/75 uppercase tracking-wider font-medium">
            <span>Probabilitas Klasifikasi</span>
            <Target className="w-4 h-4 text-amber-300" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <div className={`text-2xl md:text-3xl font-bold font-mono ${
              siswa.akurasiMenulis >= 90 ? 'text-emerald-300' : siswa.akurasiMenulis >= 80 ? 'text-[#ffd261]' : 'text-red-300'
            }`}>
              {siswa.akurasiMenulis}%
            </div>
            <p className="text-xs text-white/70 mt-1">
              {siswa.akurasiMenulis >= 90 ? 'Rata-rata: Sangat Jelas' : siswa.akurasiMenulis >= 80 ? 'Rata-rata: Kompeten' : 'Rata-rata: Perlu Penguatan'}
            </p>
          </div>
        </div>

        {/* Glif Terlatih */}
        <div className="bg-[#0c1a2c]/80 backdrop-blur-md rounded-xl p-5 border border-white/15">
          <div className="flex items-center justify-between text-xs text-white/75 uppercase tracking-wider font-medium">
            <span>Glif Dikuasai</span>
            <Target className="w-4 h-4 text-amber-300" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {siswa.glifDikuasai} <span className="text-sm font-normal text-white/70">/ 30 Glif</span>
            </div>
            <p className="text-xs text-amber-200 mt-1">
              Model EfficientNet-B0 ONNX
            </p>
          </div>
        </div>

        {/* Pilar 2: Epos Cerita */}
        <div className="bg-[#0c1a2c]/80 backdrop-blur-md rounded-xl p-5 border border-white/15">
          <div className="flex items-center justify-between text-xs text-white/75 uppercase tracking-wider font-medium">
            <span>Pilar 2: Epos Bali</span>
            <BookOpen className="w-4 h-4 text-amber-300" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" aria-hidden="true" />
              <span>{siswa.eposBintang}/9</span>
              <span className="text-sm font-normal text-white/70">Bintang</span>
            </div>
            <p className="text-xs text-amber-200 mt-1">
              Calon Arang (3 Bab Cerita)
            </p>
          </div>
        </div>

        {/* Pilar 3: Preservasi */}
        <div className="bg-[#0c1a2c]/80 backdrop-blur-md rounded-xl p-5 border border-white/15">
          <div className="flex items-center justify-between text-xs text-white/75 uppercase tracking-wider font-medium">
            <span>Pilar 3: Preservasi</span>
            <Scroll className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {siswa.usulanPreservasi} <span className="text-sm font-normal text-white/70">Naskah</span>
            </div>
            <p className="text-xs text-emerald-300 mt-1">
              Transliterasi Manual (+{siswa.usulanPreservasi * 75} XP)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
