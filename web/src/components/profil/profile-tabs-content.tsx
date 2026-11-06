'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PenTool,
  BookOpen,
  Award,
  ScrollText,
  Compass,
  Sparkles,
  Star,
  Lock,
} from 'lucide-react';
import { CULTURAL_BADGE_LIST } from '@/data/profil/profil-data';

export interface ProfileRealPortfolioData {
  glifDikuasai: number;
  totalGlif: number;
  avgProbability: number | null;
  masteredGlyphBadges: { simbol: string; label: string }[];
  bintangTerkumpul: number;
  maxBintang: number;
  babSelesai: number;
  totalBab: number;
  hasPreservationSubmission: boolean;
}

function renderBadgeIcon(iconName: string) {
  switch (iconName) {
    case 'ScrollText':
      return <ScrollText className="w-7 h-7 stroke-[1.5]" aria-hidden="true" />;
    case 'Compass':
      return <Compass className="w-7 h-7 stroke-[1.5]" aria-hidden="true" />;
    case 'Sparkles':
    default:
      return <Sparkles className="w-7 h-7 stroke-[1.5]" aria-hidden="true" />;
  }
}

export function ProfileTabsContent({ data }: { data: ProfileRealPortfolioData }) {
  const [activeTab, setActiveTab] = useState<'aksara' | 'cerita' | 'lencana'>('aksara');

  const tabs = [
    { id: 'aksara', label: '1. Penguasaan Aksara Bali', Icon: PenTool },
    { id: 'cerita', label: '2. Jejak Epos Calon Arang', Icon: BookOpen },
    { id: 'lencana', label: '3. Piagam & Lencana Budaya', Icon: Award },
  ] as const;

  const percentMastery = Math.round((data.glifDikuasai / Math.max(data.totalGlif, 1)) * 100);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Tab Switch Navigation Bar */}
      <div
        role="group"
        aria-label="Kategori portofolio siswa"
        className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10"
      >
        {tabs.map((tab) => {
          const TabIcon = tab.Icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] shadow-[0_0_16px_rgba(255,210,97,0.3)] font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <TabIcon className="w-4 h-4 stroke-[1.8]" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PENGUASAAN AKSARA BALI */}
      {activeTab === 'aksara' && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
          <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md text-[#f97316] bg-[#f97316]/15 border border-[#f97316]/30">
                  Aksara Bali (30 Kelas Model ONNX)
                </span>
                <span
                  className="text-2xl text-[#ffd261]"
                  style={{ fontFamily: 'var(--font-philosopher)' }}
                >
                  ᬅᬓ᭄ᬱᬭ ᬩᬮᬶ
                </span>
              </div>

              <div className="my-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {data.glifDikuasai} / {data.totalGlif} Glif Sesuai Target
                  </h2>
                  <span className="text-xs font-mono font-semibold text-emerald-300">
                    {data.avgProbability !== null
                      ? `Rata-rata Probabilitas ONNX: ${data.avgProbability}%`
                      : 'Belum ada evaluasi kanvas'}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label="Progres penguasaan 30 glif Aksara Bali"
                  aria-valuenow={data.glifDikuasai}
                  aria-valuemin={0}
                  aria-valuemax={data.totalGlif}
                  className="w-full h-2.5 rounded-full bg-black/50 border border-white/10 overflow-hidden"
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-[#f97316] shadow-[0_0_10px_#f97316]"
                    style={{ width: `${percentMastery}%` }}
                  />
                </div>
              </div>

              {/* Mastered Glyphs Tag Strip */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <span className="text-[10px] font-mono text-white/70 uppercase block mb-2">
                  Glif Terklasifikasi Sesuai Target:
                </span>
                {data.masteredGlyphBadges.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {data.masteredGlyphBadges.map((g) => (
                      <span
                        key={g.label}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white flex items-center gap-1.5"
                      >
                        <span className="text-[#ffd261] text-sm">{g.simbol}</span>
                        <span className="text-[11px] text-white/75">{g.label}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/70">
                    Belum ada karakter yang dilatih pada sesi/perangkat ini. Mulai goreskan huruf Wianjana di Kanvas Belajar!
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/latihan/web/bali"
              className="mt-5 w-full min-h-11 inline-flex items-center justify-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/85 hover:text-white border border-white/10 text-xs font-semibold text-center transition-all cursor-pointer"
            >
              Latih Aksara Bali di Kanvas AI →
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: JEJAK EPOS CERITA */}
      {activeTab === 'cerita' && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
          <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#ffd261] uppercase tracking-wider">
                  Aksara Bali • Lontar Bali Dwipa
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#ffd261]">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" aria-hidden="true" />
                  <span className="font-bold text-white">
                    {data.bintangTerkumpul} / {data.maxBintang} Bintang
                  </span>
                </div>
              </div>

              <h2
                className="text-lg font-bold text-white mb-2 leading-snug"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                Misteri Mantra Calon Arang
              </h2>

              <div className="flex items-center gap-2.5 text-xs text-white/75 mb-3">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#ffd261]/30 shrink-0 bg-black/40 flex items-center justify-center">
                  <Image
                    src="/images/characters/char-mpu-bharadah.webp"
                    alt=""
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>Pendamping: Maharesi Mpu Bharadah &amp; Mpu Arya</span>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/70">Status Episode:</span>
                <span className="text-emerald-300 font-bold">
                  {data.babSelesai} dari {data.totalBab} Bab Tuntas
                </span>
              </div>
            </div>

            <Link
              href="/cerita"
              className="mt-5 w-full min-h-11 inline-flex items-center justify-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/85 hover:text-white border border-white/10 text-xs font-semibold text-center transition-all cursor-pointer"
            >
              Buka Panggung Story Mode →
            </Link>
          </div>
        </div>
      )}

      {/* TAB 3: PIAGAM & LENCANA BUDAYA */}
      {activeTab === 'lencana' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {CULTURAL_BADGE_LIST.map((badge) => {
            const isUnlocked =
              (badge.id === 'badge-1' && data.glifDikuasai >= 1) ||
              (badge.id === 'badge-2' && data.babSelesai >= 1) ||
              (badge.id === 'badge-3' && data.hasPreservationSubmission);

            const isGold = badge.tier === 'emas';

            const tierBadgeStyle = !isUnlocked
              ? 'border-white/15 bg-white/[0.03] text-white/40'
              : isGold
              ? 'border-[#ffd261]/60 bg-gradient-to-br from-[#ffd261]/25 via-[#1a1508] to-black shadow-[0_0_24px_rgba(255,210,97,0.3)] text-[#ffd261]'
              : 'border-slate-400/50 bg-gradient-to-br from-slate-300/20 via-[#0f141c] to-black shadow-[0_0_20px_rgba(148,163,184,0.25)] text-slate-200';

            return (
              <div
                key={badge.id}
                className={`rounded-2xl bg-[#141e2e]/90 border p-5 text-center flex flex-col items-center justify-between shadow-lg transition-all ${
                  isUnlocked ? 'border-[#ffd261]/35' : 'border-white/10 opacity-75'
                }`}
              >
                <div>
                  <div
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center mb-3 mx-auto relative overflow-hidden ${tierBadgeStyle}`}
                  >
                    {isUnlocked ? renderBadgeIcon(badge.icon) : <Lock className="w-6 h-6" aria-hidden="true" />}
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/75 inline-block mb-1.5">
                    {isUnlocked ? `Terbuka • Tier ${badge.tier}` : 'Belum Terbuka'}
                  </span>
                  <h3
                    className="text-sm font-bold text-white mb-1.5"
                    style={{ fontFamily: 'var(--font-philosopher)' }}
                  >
                    {badge.judul}
                  </h3>
                  <p className="text-xs text-white/75 leading-relaxed mb-3">
                    {badge.deskripsi}
                  </p>
                </div>

                <span
                  className={`text-[11px] font-mono block pt-2 border-t border-white/10 w-full ${
                    isUnlocked ? 'text-emerald-300 font-semibold' : 'text-white/60'
                  }`}
                >
                  {isUnlocked ? '✓ Tercapai dari progres nyata' : 'Selesaikan aktivitas untuk membuka'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
