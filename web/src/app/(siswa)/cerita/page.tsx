'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DAFTAR_KARAKTER, getKarakterById } from '@/data/cerita/karakter';
import { DAFTAR_EPOS, type CeritaEpos, type StatusBab } from '@/data/cerita/epos';
import { CharacterRoster } from '@/components/cerita/character-roster';
import { StoryCampaignCard } from '@/components/cerita/story-campaign-card';
import { getStoryProgressMap, type StoryProgressMap } from '@/lib/supabase/progress-service';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

function StarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function BookOpenIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function PilihCeritaPage() {
  const [selectedCharId, setSelectedCharId] = useState<string>('calon-arang-arya');
  const [storyProgress, setStoryProgress] = useState<StoryProgressMap>({});

  useEffect(() => {
    setStoryProgress(getStoryProgressMap('calon-arang'));
  }, []);

  const hydratedStories: CeritaEpos[] = useMemo(() => {
    return DAFTAR_EPOS.map((epos) => {
      const updatedBabList = epos.babList.map((bab) => {
        const currentDone = storyProgress[bab.n];
        const prevDone = bab.n === 1 ? true : Boolean(storyProgress[bab.n - 1]);

        let status: StatusBab = 'terkunci';
        if (currentDone) {
          status = 'selesai';
        } else if (prevDone) {
          status = 'terbuka';
        }

        return {
          ...bab,
          bintang: currentDone?.bintang ?? 0,
          status,
        };
      });

      const totalBintang = updatedBabList.reduce((acc, b) => acc + b.bintang, 0);

      return {
        ...epos,
        totalBintang,
        babList: updatedBabList,
      };
    });
  }, [storyProgress]);

  const totalEarnedStars = useMemo(() => {
    return hydratedStories.reduce((acc, curr) => acc + curr.totalBintang, 0);
  }, [hydratedStories]);

  const totalMaxStars = useMemo(() => {
    return hydratedStories.reduce((acc, curr) => acc + curr.maxBintang, 0);
  }, [hydratedStories]);

  const completedChaptersCount = useMemo(() => {
    return Object.keys(storyProgress).length;
  }, [storyProgress]);

  const totalNarrativeXp = useMemo(() => {
    return Object.values(storyProgress).reduce((acc, item) => acc + (item.xpEarned || 0), 0);
  }, [storyProgress]);

  return (
    <main className="relative min-h-dvh text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Visual Thematic Background (Exclusive to /cerita) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-katalog-cerita.webp"
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

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/4 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/2 right-[-10%] w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)] blur-3xl" />
      </div>

      {/* 1. STICKY GAMIFICATION APP BAR */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <Link
            href="/mulai"
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all text-xs font-medium cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Menu Belajar</span>
          </Link>

          {/* Real Gamification Progress Counters */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261]">
              <StarIcon className="w-3.5 h-3.5 text-[#ffd261]" />
              <span className="font-bold">
                {totalEarnedStars}/{totalMaxStars}
              </span>
              <span className="hidden sm:inline text-[10px] text-white/75">Bintang</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <SparklesIcon className="w-3.5 h-3.5 text-[#ffd261]" />
              <span className="font-bold">+{totalNarrativeXp} XP</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white/85">
              <BookOpenIcon className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="font-bold">{completedChaptersCount}/3 Bab</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col gap-8">
        {/* Page Title & Narrative Hook */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261] text-xs font-semibold mb-2 shadow-[0_0_12px_rgba(255,210,97,0.15)]">
            <SparklesIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Story Mode Lontar Bali Dwipa</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#ffd261] via-[#F6F2E9] to-[#D4A373] bg-clip-text text-transparent leading-tight"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Petualangan Epos &amp; Sastra Bali Kuno
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed">
            Selami kisah klasik Lontar <em>Calon Arang</em>, pilih pendamping kisahmu, dan pecahkan tantangan menulis Aksara Bali dengan klasifikasi ONNX langsung di browser.
          </p>
        </div>

        {/* 3. COMPANION CHARACTER ROSTER */}
        <div>
          <CharacterRoster
            characters={DAFTAR_KARAKTER}
            selectedCharacterId={selectedCharId}
            onSelectCharacter={setSelectedCharId}
          />
        </div>

        {/* 4. STORY CAMPAIGN CARDS */}
        <section aria-labelledby="campaigns-list" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h2
                id="campaigns-list"
                className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]"
              >
                Kampanye Epos Rontal Bali
              </h2>
              <span className="text-xs text-white/70">
                (3 Episode Berurutan)
              </span>
            </div>
            <span className="text-xs text-white/70 font-mono hidden sm:inline">
              Bab berikutnya terbuka setelah bab sebelumnya dituntaskan
            </span>
          </div>

          {hydratedStories.map((epos, idx) => {
            const companion = getKarakterById(selectedCharId) || getKarakterById(epos.karakterId);
            return (
              <div key={epos.id}>
                <StoryCampaignCard
                  epos={epos}
                  companion={companion}
                  eagerBanner={idx === 0}
                />
              </div>
            );
          })}
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 py-6 text-center text-xs text-white/65">
        <p>Aksantara Story Mode • Pembelajaran Naratif Aksara Bali • Bali DigiFest 2026</p>
      </footer>
    </main>
  );
}
