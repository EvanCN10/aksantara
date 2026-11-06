'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_SISWA_PROFILE, type SiswaProfile } from '@/data/profil/profil-data';
import { ProfileHeroCard } from '@/components/profil/profile-hero-card';
import { ProfileStatsStrip } from '@/components/profil/profile-stats-strip';
import {
  ProfileTabsContent,
  type ProfileRealPortfolioData,
} from '@/components/profil/profile-tabs-content';
import { useAuth } from '@/context/auth-context';
import {
  getGlyphPracticeRecords,
  getStoryProgressMap,
  type PracticeRecord,
  type StoryProgressMap,
} from '@/lib/supabase/progress-service';
import { getModelTrainingCatalog } from '@/data/aksara/model-catalog';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

function ProfilContent() {
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get('unauthorized');
  const { user, logout, updateDisplayName } = useAuth();
  const catalog = getModelTrainingCatalog('bali');

  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);
  const [storyMap, setStoryMap] = useState<StoryProgressMap>({});
  const [hasPreservation, setHasPreservation] = useState(false);

  useEffect(() => {
    setPracticeRecords(getGlyphPracticeRecords('bali'));
    setStoryMap(getStoryProgressMap('calon-arang'));
    try {
      const raw = localStorage.getItem('aksantara_pelestarian_guest');
      const parsed = raw ? JSON.parse(raw) : [];
      setHasPreservation(Array.isArray(parsed) && parsed.length > 0);
    } catch {
      setHasPreservation(false);
    }
  }, []);

  const portfolioData = useMemo<ProfileRealPortfolioData>(() => {
    const masteredSlugs = new Set<string>();
    for (const rec of practiceRecords) {
      if (rec.status === 'sempurna' || rec.status === 'bagus') {
        masteredSlugs.add(rec.glifSlug);
      }
    }

    const masteredGlyphBadges = catalog
      .filter((g) => masteredSlugs.has(g.slug))
      .map((g) => ({ simbol: g.simbol, label: g.label }));

    const avgProbability =
      practiceRecords.length > 0
        ? Math.round(
            (practiceRecords.reduce((acc, r) => acc + r.score, 0) / practiceRecords.length) * 10
          ) / 10
        : null;

    const storyEntries = Object.values(storyMap);
    const bintangTerkumpul = storyEntries.reduce((acc, s) => acc + (s.bintang || 0), 0);
    const babSelesai = storyEntries.length;

    return {
      glifDikuasai: masteredSlugs.size,
      totalGlif: catalog.length,
      avgProbability,
      masteredGlyphBadges,
      bintangTerkumpul,
      maxBintang: 9,
      babSelesai,
      totalBab: 3,
      hasPreservationSubmission: hasPreservation,
    };
  }, [practiceRecords, storyMap, hasPreservation, catalog]);

  const computedProfile = useMemo<SiswaProfile>(() => {
    const glyphXp = portfolioData.glifDikuasai * 50;
    const storyXp = Object.values(storyMap).reduce((acc, s) => acc + (s.xpEarned || 0), 0);
    const totalXp = glyphXp + storyXp;
    const level = Math.floor(totalXp / 500) + 1;
    const nextLevelXp = level * 500;

    return {
      ...DEFAULT_SISWA_PROFILE,
      id: user?.id ?? 'guest_local',
      nama: user?.nama || DEFAULT_SISWA_PROFILE.nama,
      statusSesi: user?.isGuest ? 'Mode Simulasi Tamu' : 'Akun Terdaftar',
      email: user?.email || 'Progres tersimpan di perangkat ini',
      avatar: user?.avatar || DEFAULT_SISWA_PROFILE.avatar,
      gelarBudaya: user?.gelarBudaya || DEFAULT_SISWA_PROFILE.gelarBudaya,
      level,
      totalXp,
      nextLevelXp,
      totalEvaluasiKanvas: practiceRecords.length,
      totalGlifDikuasai: portfolioData.glifDikuasai,
      totalBintangCerita: portfolioData.bintangTerkumpul,
      babCeritaSelesai: portfolioData.babSelesai,
    };
  }, [user, portfolioData, storyMap, practiceRecords.length]);

  const handleUpdateName = (newName: string) => {
    updateDisplayName(newName);
  };

  return (
    <main className="relative min-h-dvh text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-profil-siswa.webp"
          alt=""
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
      </div>

      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 px-4 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/mulai"
            className="inline-flex items-center gap-2 min-h-11 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Kembali ke Pilihan Jalur</span>
          </Link>

          <span className="text-[11px] font-mono text-[#ffd261] bg-[#ffd261]/10 px-3 py-1 rounded-full border border-[#ffd261]/25">
            Portofolio Belajar Nyata
          </span>
        </div>
      </header>

      {/* 2. Main Profile Content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {unauthorized === 'guru_only' && (
          <div role="alert" className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Halaman Dashboard Pengampu khusus untuk peran <strong>Guru</strong>. Keluar terlebih dahulu jika Anda ingin mencoba mode Demo Guru.
            </span>
          </div>
        )}

        <ProfileHeroCard
          profile={computedProfile}
          onUpdateName={handleUpdateName}
          onLogout={() => {
            void logout();
          }}
        />

        <ProfileStatsStrip profile={computedProfile} />

        <div className="mt-1">
          <ProfileTabsContent data={portfolioData} />
        </div>
      </div>

      {/* 3. Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 py-4 px-6 text-center text-xs text-white/65">
        Aksantara Portofolio Siswa • Pembelajaran Aksara Bali • Bali DigiFest 2026
      </footer>
    </main>
  );
}

export default function ProfilPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#060d16] flex items-center justify-center text-white/75 text-xs font-mono">
          Memuat portofolio belajar...
        </div>
      }
    >
      <ProfilContent />
    </Suspense>
  );
}
