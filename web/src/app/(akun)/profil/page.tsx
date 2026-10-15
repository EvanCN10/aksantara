'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_SISWA_PROFILE, type SiswaProfile } from '@/data/profil/profil-data';
import { ProfileHeroCard } from '@/components/profil/profile-hero-card';
import { ProfileStatsStrip } from '@/components/profil/profile-stats-strip';
import { ProfileTabsContent } from '@/components/profil/profile-tabs-content';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<SiswaProfile>(DEFAULT_SISWA_PROFILE);

  const handleUpdateName = (newName: string) => {
    setProfile((prev) => ({
      ...prev,
      nama: newName,
    }));
  };

  return (
    <main className="relative min-h-screen text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-profil-siswa.webp"
          alt="Paviliun Ksatria Sastra"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.45] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/3 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.1),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-1/4 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/mulai"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Kembali ke Pilihan Jalur</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#ffd261] bg-[#ffd261]/10 px-3 py-1 rounded-full border border-[#ffd261]/25">
              Portofolio Kebudayaan Siswa
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Profile Content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* Profile Hero Card */}
        <ProfileHeroCard profile={profile} onUpdateName={handleUpdateName} />

        {/* 4 Core Stats Strip */}
        <ProfileStatsStrip profile={profile} />

        {/* 4-Tab Portfolio Content */}
        <div className="mt-2">
          <ProfileTabsContent />
        </div>
      </div>

      {/* 3. Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-6 text-center text-xs text-white/40">
        Aksantara Student Cultural Dashboard • Platform Phygital Aksara Nusantara 2026
      </footer>
    </main>
  );
}

// ============================================================================
// TODO: BACKEND INTEGRATION
//
// Endpoint target untuk mengambil dan memperbarui profil siswa:
// GET  /api/profile/me
// PATCH /api/profile/update-identity
// Body Payload:
// {
//   nama: string,
//   avatar: string,
//   gelarBudaya: string
// }
// ============================================================================
