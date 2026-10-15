'use client';

import React from 'react';
import Link from 'next/link';
import { FlaskConical, Zap, CheckCircle2 } from 'lucide-react';

interface MiniGameLauncherCardProps {
  isOnline: boolean;
}

export function MiniGameLauncherCard({ isOnline }: MiniGameLauncherCardProps) {
  const games = [
    {
      id: 'ramu-mantra',
      judul: 'Ramu Mantra (Syllable Crafter)',
      deskripsi:
        'Susun kombinasi konsonan dan diakritik fisik pada slot pad untuk merapalkan suku kata sakral.',
      icon: FlaskConical,
      tag: 'Kombinasi Fonetik 2-Slot',
      waktu: '3-5 Menit',
      warna: '#4ade80',
      href: '/hardware/game/ramu-mantra',
    },
    {
      id: 'speed-match',
      judul: 'Aksara Cepat Tanggap (Speed Match)',
      deskripsi:
        'Tantangan refleks cepat: temukan dan tempelkan kartu RFID yang tepat sebelum waktu habis.',
      icon: Zap,
      tag: 'Ketangkasan & Refleks',
      waktu: '2-4 Menit',
      warna: '#38bdf8',
      href: '/hardware/game/speed-match',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3
          className="text-base font-bold text-white tracking-wide"
          style={{ fontFamily: 'var(--font-philosopher)' }}
        >
          Arena Mini-Game Kinestetik (Pilar 3)
        </h3>
        <span className="text-[10px] font-mono text-[#ffd261] bg-[#ffd261]/10 px-2 py-0.5 rounded-full border border-[#ffd261]/25 inline-flex items-center gap-1">
          {isOnline ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Siap Dimainkan</span>
            </>
          ) : (
            <span>Menunggu Koneksi</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {games.map((g) => {
          const GameIcon = g.icon;
          return (
            <div
              key={g.id}
              className="group relative rounded-2xl bg-[#141e2e]/90 border border-white/10 hover:border-white/25 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${g.warna}20`,
                      boxShadow: `0 0 16px ${g.warna}30`,
                    }}
                  >
                    <GameIcon className="w-5 h-5" style={{ color: g.warna }} />
                  </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-white/40 block">{g.waktu}</span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: g.warna }}
                  >
                    {g.tag}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#ffd261] transition-colors">
                {g.judul}
              </h4>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                {g.deskripsi}
              </p>
            </div>

            <Link
              href={g.href}
              className={`w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold tracking-wide transition-all block ${
                isOnline
                  ? 'bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] font-bold shadow-[0_0_16px_rgba(255,210,97,0.3)] hover:opacity-95 cursor-pointer'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 cursor-pointer'
              }`}
            >
              Mulai Mini-Game →
            </Link>
          </div>
          );
        })}
      </div>
    </div>
  );
}
