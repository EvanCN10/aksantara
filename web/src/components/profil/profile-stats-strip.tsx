'use client';

import React from 'react';
import type { SiswaProfile } from '@/data/profil/profil-data';

interface ProfileStatsStripProps {
  profile: SiswaProfile;
}

export function ProfileStatsStrip({ profile }: ProfileStatsStripProps) {
  const stats = [
    {
      label: 'Total Pengalaman',
      value: `${profile.totalXp.toLocaleString('id-ID')} XP`,
      icon: '⚡',
      sub: 'Akumulasi Semua Mode',
      warna: '#ffd261',
    },
    {
      label: 'Bintang Cerita Epos',
      value: `${profile.totalBintangCerita} / 27 ⭐`,
      icon: '📖',
      sub: '3 Epos Sastra Selesai',
      warna: '#38bdf8',
    },
    {
      label: 'Glif Dikuasai',
      value: `${profile.totalGlifDikuasai} Glif`,
      icon: '✍️',
      sub: 'Lontara, Sunda, Bali',
      warna: '#4ade80',
    },
    {
      label: 'Streak Belajar',
      value: `${profile.streakHari} Hari`,
      icon: '🔥',
      sub: 'Konsistensi Harian',
      warna: '#f97316',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-[#141e2e]/80 border border-white/10 p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-white/25 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
              {item.label}
            </span>
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
          </div>

          <div
            className="text-xl sm:text-2xl font-bold text-white tracking-wide"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {item.value}
          </div>

          <span className="text-[11px] font-mono text-white/40 mt-1 block truncate">
            {item.sub}
          </span>
        </div>
      ))}
    </div>
  );
}
