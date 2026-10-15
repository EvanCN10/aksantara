'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DAFTAR_KARAKTER, getKarakterById } from '@/data/cerita/karakter';
import { DAFTAR_EPOS, type CeritaEpos } from '@/data/cerita/epos';
import { CharacterRoster } from '@/components/cerita/character-roster';
import { StoryCampaignCard } from '@/components/cerita/story-campaign-card';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

function StarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function FlameIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

type FilterAksara = 'semua' | 'lontara' | 'sunda' | 'bali';

export default function PilihCeritaPage() {
  const [selectedCharId, setSelectedCharId] = useState<string>('sawerigading');
  const [activeFilter, setActiveFilter] = useState<FilterAksara>('semua');

  // Handle character selection: also syncs story filter if character is region-specific
  const handleSelectCharacter = (id: string) => {
    setSelectedCharId(id);
    const char = getKarakterById(id);
    if (char && char.aksaraId !== 'umum') {
      setActiveFilter(char.aksaraId);
    } else {
      setActiveFilter('semua');
    }
  };

  // Filtered stories list
  const filteredStories: CeritaEpos[] = useMemo(() => {
    if (activeFilter === 'semua') return DAFTAR_EPOS;
    return DAFTAR_EPOS.filter((c) => c.aksaraId === activeFilter);
  }, [activeFilter]);

  // Total stats calculation
  const totalEarnedStars = useMemo(() => {
    return DAFTAR_EPOS.reduce((acc, curr) => acc + curr.totalBintang, 0);
  }, []);

  const totalMaxStars = useMemo(() => {
    return DAFTAR_EPOS.reduce((acc, curr) => acc + curr.maxBintang, 0);
  }, []);

  return (
    <main className="relative min-h-screen text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-katalog-cerita.webp"
          alt="Perpustakaan Epos Nusantara"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.45] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/4 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/2 right-[-10%] w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* ====================================================================
          1. STICKY GAMIFICATION APP BAR (Choreographed Entrance)
          ==================================================================== */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Back to Mulai */}
          <Link
            href="/mulai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-xs font-medium cursor-pointer animate-emerge-up"
            style={{ animationDelay: '60ms' }}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Menu Belajar</span>
          </Link>

          {/* Gamification Progress Counters */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            {/* Stars */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261] animate-emerge-scale"
              style={{ animationDelay: '100ms' }}
            >
              <StarIcon className="w-3.5 h-3.5 text-[#ffd261] animate-pulse" />
              <span className="font-bold">{totalEarnedStars}/{totalMaxStars}</span>
              <span className="hidden sm:inline text-[10px] text-white/50">Bintang</span>
            </div>

            {/* Narrative XP */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-emerge-scale"
              style={{ animationDelay: '180ms' }}
            >
              <SparklesIcon className="w-3.5 h-3.5 text-[#ffd261]" />
              <span className="font-bold">+450 XP</span>
            </div>

            {/* Streak */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 animate-emerge-scale"
              style={{ animationDelay: '260ms' }}
            >
              <FlameIcon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-bold">3 Hari</span>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. MAIN CONTENT AREA
          ==================================================================== */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col gap-8">
        
        {/* Page Title & Narrative Hook */}
        <div className="text-center max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261] text-xs font-semibold mb-2 shadow-[0_0_12px_rgba(255,210,97,0.15)] animate-emerge-up"
            style={{ animationDelay: '120ms' }}
          >
            <SparklesIcon className="w-3.5 h-3.5 text-[#ffd261] animate-pulse" />
            <span>Petualangan Epos &amp; Sastra Kuno</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#ffd261] via-[#F6F2E9] to-[#D4A373] bg-clip-text text-transparent leading-tight animate-emerge-up"
            style={{ fontFamily: 'var(--font-philosopher)', animationDelay: '200ms' }}
          >
            Jelajahi Epos &amp; Kisah Nusantara
          </h1>
          <p
            className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed animate-emerge-up"
            style={{ animationDelay: '280ms' }}
          >
            Setiap cerita rakyat menyimpan misteri dan keagungan aksara masa lampau. Pilih pemandu kisahmu, pecahkan tantangan menulis, dan tuntaskan setiap bab epos!
          </p>
        </div>

        {/* ================================================================
            3. COMPANION CHARACTER ROSTER & SPEECH BUBBLE
            ================================================================ */}
        <div className="animate-emerge-scale" style={{ animationDelay: '360ms' }}>
          <CharacterRoster
            characters={DAFTAR_KARAKTER}
            selectedCharacterId={selectedCharId}
            onSelectCharacter={handleSelectCharacter}
          />
        </div>

        {/* ================================================================
            4. SCRIPT FILTER TABS
            ================================================================ */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-b border-white/10 pb-3 animate-emerge-up"
          style={{ animationDelay: '460ms' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
              Daftar Petualangan Epos
            </span>
            <span className="text-xs text-white/50">
              ({filteredStories.length} Kisah Ditampilkan)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            {(
              [
                { id: 'semua', label: 'Semua Kisah' },
                { id: 'lontara', label: 'Lontara (Sulawesi)' },
                { id: 'sunda', label: 'Sunda (Pasundan)' },
                { id: 'bali', label: 'Bali (Rontal)' },
              ] as const
            ).map((tab) => {
              const isActive = activeFilter === tab.id;
              const count =
                tab.id === 'semua'
                  ? DAFTAR_EPOS.length
                  : DAFTAR_EPOS.filter((c) => c.aksaraId === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ffd261] text-[#0c1a2c] font-bold shadow-[0_0_12px_rgba(255,210,97,0.3)] scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-1 opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================
            5. STORY CAMPAIGN CARDS
            ================================================================ */}
        <section aria-labelledby="campaigns-list" className="space-y-6">
          <h2 id="campaigns-list" className="sr-only">
            Daftar Kampanye Cerita Epos
          </h2>

          {filteredStories.map((epos, idx) => {
            const companion = getKarakterById(epos.karakterId);
            return (
              <div
                key={epos.id}
                style={{ '--stagger': idx } as React.CSSProperties}
                className="stagger-item animate-emerge-up"
              >
                <StoryCampaignCard
                  epos={epos}
                  companion={companion}
                />
              </div>
            );
          })}
        </section>

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-white/40">
        <p>Aksantara Cerita • Gamifikasi Naratif &amp; Pelestarian Trinitas Aksara Nusantara</p>
      </footer>
    </main>
  );
}

// ============================================================================
// TODO: BACKEND INTEGRATION
//
// Endpoint target:
// 1. Ambil status pembacaan dan bintang pengguna dari Supabase:
// GET /api/cerita/progress/[userId]
// Response: {
//   earnedStars: number,
//   narrativeXp: number,
//   unlockedChapters: { [eposId: string]: number[] }, // array of unlocked chapter numbers
//   completedChapters: { [eposId: string]: number[] }
// }
//
// 2. Simpan hasil penyelesaian bab:
// POST /api/cerita/save-progress
// Body: { userId, eposSlug, chapterNumber, earnedStars, earnedXp }
// ============================================================================
