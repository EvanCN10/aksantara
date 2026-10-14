'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SCRIPT_MASTERY_LIST,
  STORY_PROGRESS_LIST,
  HARDWARE_RECORD_LIST,
  CULTURAL_BADGE_LIST,
} from '@/data/profil/profil-data';

export function ProfileTabsContent() {
  const [activeTab, setActiveTab] = useState<'aksara' | 'cerita' | 'hardware' | 'lencana'>('aksara');

  const tabs = [
    { id: 'aksara', label: '1. Penguasaan Aksara (AI)', icon: '✍️' },
    { id: 'cerita', label: '2. Jejak Epos Cerita', icon: '📖' },
    { id: 'hardware', label: '3. Rekor Hardware Pad', icon: '🎛️' },
    { id: 'lencana', label: '4. Piagam & Lencana Budaya', icon: '🎖️' },
  ] as const;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Tab Switch Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] shadow-[0_0_16px_rgba(255,210,97,0.3)] font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PENGUASAAN AKSARA (AI CANVAS MASTERY) */}
      {activeTab === 'aksara' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {SCRIPT_MASTERY_LIST.map((item) => {
            const percent = Math.round((item.glifDikuasai / item.totalGlif) * 100);

            return (
              <div
                key={item.aksaraId}
                className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{
                        color: item.warnaTema,
                        backgroundColor: `${item.warnaTema}15`,
                        border: `1px solid ${item.warnaTema}30`,
                      }}
                    >
                      {item.namaAksara}
                    </span>
                    <span
                      className="text-2xl text-white/40"
                      style={{ fontFamily: 'var(--font-philosopher)' }}
                    >
                      {item.aksaraAsli}
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xl sm:text-2xl font-bold text-white">
                        {item.glifDikuasai} / {item.totalGlif}
                      </span>
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        {item.akurasiRataRata}% Akurasi AI
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: item.warnaTema,
                          boxShadow: `0 0 10px ${item.warnaTema}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Favorite Glyphs Tag Strip */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-mono text-white/40 uppercase block mb-1.5">
                      Glif Mahir Terverifikasi:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.glifFavorit.map((g) => (
                        <span
                          key={g.label}
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white flex items-center gap-1"
                        >
                          <span className="text-[#ffd261]">{g.simbol}</span>
                          <span className="text-[10px] text-white/50">{g.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/latihan/web/${item.aksaraId}`}
                  className="mt-5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold text-center transition-all cursor-pointer block"
                >
                  Latih di Kanvas AI →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: JEJAK EPOS CERITA (STORY CHAPTERS) */}
      {activeTab === 'cerita' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {STORY_PROGRESS_LIST.map((story) => (
            <div
              key={story.eposSlug}
              className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-5 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#ffd261] uppercase tracking-wider">
                    {story.aksaraNama}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#ffd261]">
                    <span>⭐</span>
                    <span className="font-bold text-white">
                      {story.bintangTerkumpul} / {story.maxBintang}
                    </span>
                  </div>
                </div>

                <h3
                  className="text-base font-bold text-white mb-2 leading-snug"
                  style={{ fontFamily: 'var(--font-philosopher)' }}
                >
                  {story.judul}
                </h3>

                <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                  <span className="text-lg">{story.karakterPendamping.avatar}</span>
                  <span>Pendamping: {story.karakterPendamping.nama}</span>
                </div>

                <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/40">Status Cerita:</span>
                  <span className="text-emerald-400 font-bold">
                    {story.babSelesai} dari {story.totalBab} Bab Tuntas
                  </span>
                </div>
              </div>

              <Link
                href="/cerita"
                className="mt-5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold text-center transition-all cursor-pointer block"
              >
                Buka Panggung Epos →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REKOR HARDWARE PAD (TACTILE ARENA) */}
      {activeTab === 'hardware' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
          {HARDWARE_RECORD_LIST.map((rec) => (
            <div
              key={rec.gameJenis}
              className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    {rec.icon}
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Akurasi {rec.akurasiRataRata}%
                  </span>
                </div>

                <h3
                  className="text-base sm:text-lg font-bold text-white mb-1"
                  style={{ fontFamily: 'var(--font-philosopher)' }}
                >
                  {rec.judul}
                </h3>
                <p className="text-xs text-white/60 mb-4">{rec.catatanKhusus}</p>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 block">Skor Tertinggi</span>
                    <span className="text-lg font-bold text-[#ffd261]">{rec.skorTertinggi}</span>
                  </div>
                  <div className="border-l border-white/10">
                    <span className="text-[10px] font-mono text-white/40 block">Total Sesi</span>
                    <span className="text-lg font-bold text-white">{rec.totalSesiDimainkan} Sesi</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/hardware/game/${rec.gameJenis}`}
                className="mt-5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold text-center transition-all cursor-pointer block"
              >
                Mainkan di Tactile Pad →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: PIAGAM & LENCANA BUDAYA */}
      {activeTab === 'lencana' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {CULTURAL_BADGE_LIST.map((badge) => (
            <div
              key={badge.id}
              className="rounded-2xl bg-[#141e2e]/90 border border-white/10 hover:border-[#ffd261]/40 p-5 text-center flex flex-col items-center justify-between shadow-lg transition-all"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffd261]/15 via-black/30 to-black/60 border border-[#ffd261]/35 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,210,97,0.15)] mb-3 mx-auto">
                  {badge.icon}
                </div>

                <span className="text-[10px] font-mono text-[#ffd261] uppercase tracking-wider block mb-1">
                  Tier {badge.tier} • {badge.kategori}
                </span>
                <h4
                  className="text-sm font-bold text-white mb-1.5"
                  style={{ fontFamily: 'var(--font-philosopher)' }}
                >
                  {badge.judul}
                </h4>
                <p className="text-xs text-white/60 leading-relaxed mb-3">
                  {badge.deskripsi}
                </p>
              </div>

              <span className="text-[10px] font-mono text-white/35 block pt-2 border-t border-white/5 w-full">
                Diperoleh: {badge.diperolehPada}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
