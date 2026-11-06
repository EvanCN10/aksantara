'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import type { SiswaProfile } from '@/data/profil/profil-data';

interface ProfileHeroCardProps {
  profile: SiswaProfile;
  onUpdateName: (newName: string) => void;
  onLogout: () => void;
}

export function ProfileHeroCard({ profile, onUpdateName, onLogout }: ProfileHeroCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.nama);

  useEffect(() => {
    setTempName(profile.nama);
  }, [profile.nama]);

  const xpProgressPercent = Math.min(
    Math.round((profile.totalXp / Math.max(profile.nextLevelXp, 1)) * 100),
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
    <OrnateFrame className="w-full rounded-3xl" innerClassName="rounded-3xl bg-[#141e2e]/90 p-5 sm:p-7 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div
        className="pointer-events-none absolute top-0 right-1/4 w-96 h-40 bg-[radial-gradient(ellipse_at_top,rgba(255,210,97,0.12),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      {/* 1. Left Avatar & Identity */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#ffd261]/20 via-[#101826] to-black border-2 border-[#ffd261]/50 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_30px_rgba(255,210,97,0.25)] overflow-hidden">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`Avatar ${profile.nama}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{profile.avatar}</span>
            )}
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
            <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2 mt-1 justify-center sm:justify-start">
              <label htmlFor="edit-profile-name" className="sr-only">
                Nama Tampilan
              </label>
              <input
                id="edit-profile-name"
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoComplete="name"
                className="min-h-11 px-3 py-2 rounded-xl bg-black/60 border border-[#ffd261]/50 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ffd261]"
                autoFocus
              />
              <button
                type="submit"
                className="min-h-11 px-4 py-2 rounded-xl bg-[#ffd261] text-[#0c1a2c] text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempName(profile.nama);
                  setIsEditing(false);
                }}
                className="min-h-11 px-3 py-2 rounded-xl bg-white/5 text-xs text-white/75 hover:text-white cursor-pointer"
              >
                Batal
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <h1
                className="text-xl sm:text-2xl font-bold text-white tracking-wide"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                {profile.nama}
              </h1>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Ubah nama tampilan"
                title="Ubah nama tampilan"
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl text-xs text-white/70 hover:text-[#ffd261] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs text-white/70 font-mono mt-1">
            <span>{profile.statusSesi}</span>
            <span aria-hidden="true">•</span>
            <span className="truncate">{profile.email}</span>
          </div>

          {/* Level XP Progress Bar */}
          <div className="mt-4 w-full max-w-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/75 mb-1">
              <span>Progres Menuju Level {profile.level + 1}</span>
              <span className="text-[#ffd261]">
                {profile.totalXp} / {profile.nextLevelXp} XP ({xpProgressPercent}%)
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Progres pengalaman menuju level berikutnya"
              aria-valuenow={profile.totalXp}
              aria-valuemin={0}
              aria-valuemax={profile.nextLevelXp}
              className="w-full h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden"
            >
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
          className="min-h-11 inline-flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] text-xs font-bold shadow-[0_0_16px_rgba(255,210,97,0.3)] hover:opacity-95 transition-all cursor-pointer"
        >
          Lanjut Belajar →
        </Link>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Keluar dari sesi akun"
          title="Keluar dari Akun"
          className="min-h-11 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/15 text-white/80 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
        >
          Keluar ⎋
        </button>
      </div>
    </OrnateFrame>
  );
}
