'use client';

import React from 'react';
import { Zap, BookOpen, PenTool, CheckCircle2, Star } from 'lucide-react';
import type { SiswaProfile } from '@/data/profil/profil-data';

interface ProfileStatsStripProps {
  profile: SiswaProfile;
}

export function ProfileStatsStrip({ profile }: ProfileStatsStripProps) {
  const stats = [
    {
      label: 'Total Pengalaman',
      value: `${profile.totalXp.toLocaleString('id-ID')} XP`,
      icon: Zap,
      sub: 'Dari Latihan & Story Mode Nyata',
      warna: '#ffd261',
    },
    {
      label: 'Bintang Cerita Epos',
      value: `${profile.totalBintangCerita} / 9`,
      hasStar: true,
      icon: BookOpen,
      sub: `${profile.babCeritaSelesai} dari 3 Bab Calon Arang`,
      warna: '#38bdf8',
    },
    {
      label: 'Glif Dikuasai',
      value: `${profile.totalGlifDikuasai} / 30`,
      icon: PenTool,
      sub: '18 Wianjana & 12 Swalalita',
      warna: '#4ade80',
    },
    {
      label: 'Evaluasi Kanvas',
      value: `${profile.totalEvaluasiKanvas}x`,
      icon: CheckCircle2,
      sub: 'Total Pemeriksaan ONNX Web',
      warna: '#f97316',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-[#141e2e]/85 border border-white/10 p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-white/25 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">
                {item.label}
              </span>
              <IconComponent
                className="w-5 h-5 transition-transform group-hover:scale-110"
                style={{ color: item.warna }}
                aria-hidden="true"
              />
            </div>

            <div
              className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              <span>{item.value}</span>
              {item.hasStar && (
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" aria-hidden="true" />
              )}
            </div>

            <span className="text-[11px] font-mono text-white/65 mt-1 block truncate">
              {item.sub}
            </span>
          </div>
        );
      })}
    </div>
  );
}
