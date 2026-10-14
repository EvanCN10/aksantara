'use client';

import React, { useState } from 'react';
import { DAFTAR_KURASI_STATUS, type KurasiStatusItem } from '@/data/pelestarian/manuskrip-data';

export function CurationTable() {
  const [filter, setFilter] = useState<'semua' | 'terverifikasi' | 'menunggu' | 'tinjauan'>('semua');

  const filteredItems = DAFTAR_KURASI_STATUS.filter((item) => {
    if (filter === 'semua') return true;
    return item.status === filter;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Preservation Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-4 sm:p-5 text-center">
          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block mb-1">
            Naskah Terarsip
          </span>
          <span
            className="text-2xl sm:text-3xl font-bold text-white block"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            42 Lembar
          </span>
          <span className="text-[11px] text-white/50 mt-1 block">
            British Library & PNRI
          </span>
        </div>

        <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-4 sm:p-5 text-center">
          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block mb-1">
            Kontribusi Komunitas
          </span>
          <span
            className="text-2xl sm:text-3xl font-bold text-[#ffd261] block"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            128 Usulan
          </span>
          <span className="text-[11px] text-white/50 mt-1 block">
            Human-in-the-Loop Active Learning
          </span>
        </div>

        <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-4 sm:p-5 text-center">
          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block mb-1">
            Tingkat Verifikasi
          </span>
          <span
            className="text-2xl sm:text-3xl font-bold text-emerald-400 block"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            85% Akurat
          </span>
          <span className="text-[11px] text-white/50 mt-1 block">
            Divalidasi Kurator Ahli
          </span>
        </div>
      </div>

      {/* 2. Filter Status Switch */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto scrollbar-none self-start">
        {[
          { id: 'semua', label: 'Semua Status' },
          { id: 'terverifikasi', label: 'Terverifikasi ✓' },
          { id: 'menunggu', label: 'Menunggu Validasi ⏳' },
          { id: 'tinjauan', label: 'Dalam Tinjauan 🔍' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#ffd261] text-[#0c1a2c] font-bold shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Curation Submission Cards Grid */}
      <div className="flex flex-col gap-3.5">
        {filteredItems.map((item: KurasiStatusItem) => (
          <div
            key={item.id}
            className="rounded-2xl bg-[#141e2e]/85 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg flex flex-col gap-3"
          >
            {/* Top Bar: Archive Code & Status Stamp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white tracking-wide">
                  {item.kodeArsip}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-xs text-white/80 font-medium">
                  {item.judulNaskah}
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[11px] font-mono px-3 py-0.5 rounded-full border self-start sm:self-auto ${
                  item.status === 'terverifikasi'
                    ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                    : item.status === 'menunggu'
                    ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                    : 'text-sky-300 bg-sky-500/15 border-sky-500/30'
                }`}
              >
                {item.status === 'terverifikasi'
                  ? 'Terverifikasi Kurator ✓'
                  : item.status === 'menunggu'
                  ? 'Menunggu Validasi ⏳'
                  : 'Dalam Tinjauan 🔍'}
              </span>
            </div>

            {/* Middle: Contributor & Suggested Transcription */}
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-white/50 mb-1">
                <span>Pengusul: <strong className="text-white/80">{item.pengusulNama}</strong></span>
                <span>•</span>
                <span>Diajukan: {item.tanggalUsulan}</span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 font-mono bg-black/40 p-3 rounded-xl border border-white/5 leading-relaxed">
                &quot;{item.usulanTeks}&quot;
              </p>
            </div>

            {/* Bottom: Philologist Notes & Curator Info */}
            {item.catatanFilolog && (
              <div className="pt-2 text-xs text-white/70 flex items-start gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-base shrink-0">🎓</span>
                <div>
                  <span className="font-bold text-[#ffd261] block mb-0.5">
                    Catatan Kurator ({item.kuratorNama}):
                  </span>
                  <p className="text-[11px] text-white/65 leading-relaxed italic">
                    {item.catatanFilolog}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
