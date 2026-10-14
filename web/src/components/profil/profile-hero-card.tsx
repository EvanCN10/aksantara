'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import type { SiswaProfile } from '@/data/profil/profil-data';

interface ProfileHeroCardProps {
  profile: SiswaProfile;
  onUpdateName: (newName: string) => void;
}

export function ProfileHeroCard({ profile, onUpdateName }: ProfileHeroCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.nama);

  const xpProgressPercent = Math.min(
    Math.round((profile.totalXp / profile.nextLevelXp) * 100),
    100
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
      setIsEditing(false);
    }
  };

  return (
    <OrnateFrame className="w-full">
      <div className="rounded-3xl bg-[#141e2e]/90 p-5 sm:p-7 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 right-1/4 w-96 h-40 bg-[radial-gradient(ellipse_at_top,rgba(255,210,97,0.12),transparent_70%)] blur-2xl" />

        {/* 1. Left Avatar & Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          {/* Avatar Container with Level Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#ffd261]/20 via-[#101826] to-black border-2 border-[#ffd261]/50 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_30px_rgba(255,210,97,0.25)]">
              {profile.avatar}
            </div>
            <span className="absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-full bg-[#ffd261] text-[#0c1a2c] text-[10px] font-mono font-bold shadow-md">
              LV {profile.level}
            </span>
          </div>

          {/* Name & Title */}
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <span className="text-[10px] font-mono tracking-widest text-[#ffd261] uppercase px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25">
                {profile.gelarBudaya}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/60 border border-[#ffd261]/50 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ffd261]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#ffd261] text-[#0c1a2c] text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1.5 text-xs text-white/50 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1
                  className="text-xl sm:text-2xl font-bold text-white tracking-wide"
                  style={{ fontFamily: 'var(--font-philosopher)' }}
                >
                  {profile.nama}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-white/40 hover:text-[#ffd261] transition-colors cursor-pointer"
                  title="Ubah Nama"
                >
                  ✎
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 justify-center sm:justify-start text-xs text-white/50 font-mono mt-1">
              <span>NISN: {profile.nisn}</span>
              <span>•</span>
              <span className="truncate">{profile.email}</span>
            </div>

            {/* Level XP Progress Bar */}
            <div className="mt-4 w-full max-w-sm">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-1">
                <span>Progres Menuju Level {profile.level + 1}</span>
                <span className="text-[#ffd261]">
                  {profile.totalXp} / {profile.nextLevelXp} XP ({xpProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffd261] to-[#D4A373] transition-all duration-700 shadow-[0_0_12px_rgba(255,210,97,0.5)]"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Right Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-center md:self-start">
          <Link
            href="/mulai"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] text-xs font-bold shadow-[0_0_16px_rgba(255,210,97,0.3)] hover:opacity-95 transition-all cursor-pointer"
          >
            Lanjut Belajar →
          </Link>

          <Link
            href="/auth"
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
            title="Keluar dari Akun"
          >
            Keluar ⎋
          </Link>
        </div>
      </div>
    </OrnateFrame>
  );
}
