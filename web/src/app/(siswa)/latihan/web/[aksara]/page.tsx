'use client';

import { use, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

import {
  KATALOG_DATA,
  type KategoriGlif,
  type StatusKuasai,
  type GlifData,
  type AksaraDetail,
} from '@/data/aksara/trinitas';
import { getClassifierTarget } from '@/lib/onnx/onnx-classifier';

// ============================================================================
// ICONS (INLINE SVG)
// ============================================================================

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
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

function StarIcon({ className = 'w-3.5 h-3.5', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? '0' : '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CompassIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

interface KatalogAksaraPageProps {
  params: Promise<{ aksara: string }>;
}

export default function KatalogAksaraPage({ params }: KatalogAksaraPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const rawKey = unwrappedParams?.aksara?.toLowerCase() || 'lontara';
  const aksaraKey = rawKey in KATALOG_DATA ? rawKey : 'lontara';

  const dataAksara = KATALOG_DATA[aksaraKey];

  // Only glifs that have a classifier target mapping are shown in the grid.
  // Characters can still be accessed directly via /latihan/web/[aksara]/[slug].
  const supportedGlifList = dataAksara.glifList.filter(
    (g) => getClassifierTarget(aksaraKey as 'lontara' | 'sunda' | 'bali', g.slug) !== null,
  );

  // State: selected Glif & active filter tab
  const [activeFilter, setActiveFilter] = useState<'semua' | KategoriGlif>('semua');
  const [selectedSlug, setSelectedSlug] = useState<string>(supportedGlifList[0]?.slug || 'ka');

  // TODO: ganti 'belum' / 'statusBawaan' dengan data dari API GET /api/progress/[userId]/[aksara]
  // Contoh hook nanti: const { data: userProgress } = useUserProgress(aksaraKey);
  const userProgress = useMemo<Record<string, StatusKuasai>>(() => {
    const map: Record<string, StatusKuasai> = {};
    dataAksara.glifList.forEach((g) => {
      map[g.slug] = g.statusBawaan || 'belum';
    });
    return map;
  }, [dataAksara]);

  // TODO: sort berdasarkan rekomendasi SRS (Spaced Repetition System) jika user memilih mode adaptif
  const filteredGlifList = useMemo(() => {
    if (activeFilter === 'semua') return supportedGlifList;
    return supportedGlifList.filter((g) => g.kategori === activeFilter);
  }, [supportedGlifList, activeFilter]);

  // Selected glif object (fallback to first filtered if current slug filtered out)
  const selectedGlif = useMemo(() => {
    const found = dataAksara.glifList.find((g) => g.slug === selectedSlug);
    if (found) return found;
    return supportedGlifList[0] ?? dataAksara.glifList[0];
  }, [dataAksara, supportedGlifList, selectedSlug]);

  // Progress metrics
  // TODO: ganti dengan data real-time dari API GET /api/progress/[userId]/[aksara]
  const totalGlif = supportedGlifList.length;
  const dikuasaiCount = useMemo(() => {
    return Object.values(userProgress).filter((st) => st === 'dikuasai').length;
  }, [userProgress]);
  const progressPercent = Math.round((dikuasaiCount / Math.max(totalGlif, 1)) * 100);

  const handleMulaiLatih = () => {
    if (!selectedGlif) return;
    router.push(`/latihan/web/${aksaraKey}/${selectedGlif.slug}`);
  };

  const getDifficultyLabel = (lvl: 1 | 2 | 3) => {
    if (lvl === 1) return 'Mudah (Dasar)';
    if (lvl === 2) return 'Menengah (Standar)';
    return 'Tantangan (Kompleks)';
  };

  return (
    <main className="relative min-h-screen text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-studio-kanvas.webp"
          alt="Studio Sanggar Aksara"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.45] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      {/* Background Ambience & Radial Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/4 w-[650px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/3 right-[-10%] w-[550px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,115,0.07),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* ====================================================================
          1. STICKY HEADER WITH BREADCRUMB & GOLD PROGRESS BAR
          ==================================================================== */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Back Link & Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/mulai"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-xs font-medium cursor-pointer"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Ganti Aksara</span>
            </Link>

            <div className="h-4 w-px bg-white/15 hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <h1
                className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                <span>{dataAksara.nama}</span>
                <span className="text-base text-[#ffd261] font-normal tracking-wide drop-shadow-[0_0_8px_rgba(255,210,97,0.4)]">
                  {dataAksara.aksaraAsli}
                </span>
              </h1>
              <span className="text-[11px] text-[#D4A373] hidden md:inline font-mono">
                • {dataAksara.asal}
              </span>
            </div>
          </div>

          {/* Right: Gold Progress Bar (API Backend Ready) */}
          <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[280px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-white/60 font-medium">Progres Kuasai:</span>
                <span className="text-[#ffd261] font-bold font-mono">
                  {dikuasaiCount} / {totalGlif} Glif ({progressPercent}%)
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5"
                title={`${dikuasaiCount} dari ${totalGlif} glif telah dikuasai`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#cf5600] via-[#ffd261] to-[#ffd261] transition-all duration-700 shadow-[0_0_12px_rgba(255,210,97,0.5)] animate-progress-shimmer"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-[#ffd261]/10 border border-[#ffd261]/25 text-[#ffd261] font-medium whitespace-nowrap">
              <SparklesIcon className="w-3 h-3 text-[#ffd261]" />
              <span>Kanvas AI Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. MAIN CONTENT (SPLIT-PANEL: GRID KIRI, STICKY DETAIL KANAN)
          ==================================================================== */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ================================================================
              PANEL KIRI (COL 7): FILTER TABS & CATALOG GRID GLIF
              ================================================================ */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
            {/* Filter Tabs Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
                  Katalog Glif
                </span>
                <span className="text-xs text-white/50">
                  ({filteredGlifList.length} Karakter)
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                {(
                  [
                    { id: 'semua', label: 'Semua' },
                    { id: 'konsonan', label: 'Konsonan' },
                    { id: 'vokal', label: 'Vokal' },
                    { id: 'diakritik', label: 'Diakritik' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeFilter === tab.id;
                  const count =
                    tab.id === 'semua'
                      ? supportedGlifList.length
                      : supportedGlifList.filter((g) => g.kategori === tab.id).length;
                  if (tab.id !== 'semua' && count === 0) return null;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#ffd261]/20 border border-[#ffd261] text-[#ffd261] shadow-[0_0_12px_rgba(255,210,97,0.25)] font-semibold'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-[#ffd261] text-[#0c1a2c] font-bold'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Glif Cards Grid (4 cols desktop, 3 tablet, 2 mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGlifList.map((glif, idx) => {
                const isSelected = selectedGlif?.slug === glif.slug;
                const isSupported = getClassifierTarget(aksaraKey as 'lontara' | 'sunda' | 'bali', glif.slug) !== null;
                const status = userProgress[glif.slug] || 'belum';

                return (
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(glif.slug)}
                    style={{ animationDelay: `${Math.min(idx * 28, 450)}ms` }}
                    className={`group relative p-3 sm:p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[125px] animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#ffd261]/15 via-white/[0.04] to-transparent border-[#ffd261] shadow-[0_0_24px_rgba(255,210,97,0.28)] scale-[1.02] ring-1 ring-[#ffd261]'
                        : 'bg-white/[0.03] border-white/10 hover:border-[#ffd261]/40 hover:bg-white/[0.06] hover:scale-[1.01]'
                    }`}
                  >
                    {/* Top Row: Difficulty Stars & Mastery Badge */}
                    <div className="flex items-center justify-between w-full">
                      {/* Difficulty stars */}
                      <div className="flex items-center gap-0.5 text-[#ffd261]">
                        <StarIcon filled={glif.kesulitan >= 1} />
                        <StarIcon filled={glif.kesulitan >= 2} />
                        <StarIcon filled={glif.kesulitan >= 3} />
                      </div>

                      {/* Status indicator badge */}
                      {!isSupported ? (
                        <span
                          className="text-[9px] font-medium text-white/50 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full"
                          title="Materi pengenalan (belum didukung evaluasi AI)"
                        >
                          Materi
                        </span>
                      ) : status === 'dikuasai' ? (
                        <span
                          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/35 px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                          title="Glif telah dikuasai"
                        >
                          <CheckCircleIcon className="w-2.5 h-2.5" />
                          <span>Kuasai</span>
                        </span>
                      ) : status === 'latihan' ? (
                        <span
                          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/35 px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                          title="Dalam proses latihan"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Latih</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-white/30 uppercase tracking-wider">
                          +{glif.xp}XP
                        </span>
                      )}
                    </div>

                    {/* Middle: Native Unicode Character (Large Display) */}
                    <div className="my-1.5 text-center">
                      <span className="text-3xl sm:text-4xl text-[#ffd261] font-normal leading-none block select-none drop-shadow-[0_2px_10px_rgba(255,210,97,0.3)] transition-transform duration-200 group-hover:scale-110">
                        {glif.simbol}
                      </span>
                    </div>

                    {/* Bottom: Label, IPA, Articulation */}
                    <div className="w-full text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ffd261] transition-colors"
                          style={{ fontFamily: 'var(--font-philosopher)' }}
                        >
                          {glif.label}
                        </span>
                        <span className="text-[10px] font-mono text-[#D4A373] bg-white/5 px-1 py-0.2 rounded border border-white/10">
                          {glif.ipa}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 truncate mt-0.5">
                        {glif.artikulasi}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Cultural Footnote Card */}
            <div className="mt-2 p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#ffd261]/10 text-[#ffd261] shrink-0 mt-0.5">
                <CompassIcon className="w-4 h-4" />
              </div>
              <div className="text-xs text-white/70 leading-relaxed">
                <span className="font-semibold text-[#ffd261] block mb-0.5">
                  Karakter Visual Paleografi:
                </span>
                {supportedGlifList.length} Setiap simbol dirancang presisi untuk evaluasi goresan kanvas AI tanpa bias urutan tarikan pena.
              </div>
            </div>
          </section>

          {/* ================================================================
              PANEL KANAN (COL 5): STICKY DETAIL HERO PANEL DENGAN ORNATE FRAME
              ================================================================ */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20">
            <OrnateFrame className="w-full bg-[#0c1a2c]/80 backdrop-blur-xl border border-[#D4A373]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="p-5 sm:p-6 flex flex-col gap-5">
                
                {/* Top Row: Category Tag & XP Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30">
                      {selectedGlif.kategori === 'konsonan'
                        ? 'Konsonan Inti'
                        : selectedGlif.kategori === 'vokal'
                        ? 'Vokal Swara'
                        : 'Tanda Diakritik'}
                    </span>
                    <span className="text-[10px] font-medium text-white/60">
                      • {dataAksara.nama}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <SparklesIcon className="w-3 h-3 text-[#ffd261]" />
                    <span>+{selectedGlif.xp} XP</span>
                  </div>
                </div>

                {/* Hero Glif Display (Big Amber Glyph With Glow) */}
                <div className="relative rounded-2xl border border-[#D4A373]/25 bg-gradient-to-b from-[#141721]/90 to-[#0A0C12]/95 p-6 sm:p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col items-center justify-center min-h-[190px]">
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 45%, rgba(255, 210, 97, 0.16) 0%, transparent 70%)',
                    }}
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-7xl sm:text-8xl md:text-9xl text-[#ffd261] font-normal leading-none drop-shadow-[0_4px_32px_rgba(255,210,97,0.5)] select-none transition-transform hover:scale-105 duration-300">
                      {selectedGlif.simbol}
                    </span>
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className="text-2xl font-bold text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-philosopher)' }}
                      >
                        {selectedGlif.label}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/25">
                        {selectedGlif.ipa}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linguistic & Cultural Notes */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] font-semibold text-[#D4A373] uppercase tracking-wider block mb-0.5">
                      Artikulasi Fonetik:
                    </span>
                    <p className="text-white/85 font-medium">
                      {selectedGlif.artikulasi}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-[#D4A373] uppercase tracking-wider block mb-0.5">
                      Catatan Paleografi &amp; Filosofi:
                    </span>
                    <p className="text-white/70 leading-relaxed">
                      {selectedGlif.catatan}
                    </p>
                  </div>

                  {/* Difficulty & Mastery State */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/50 block mb-1">
                        Tingkat Kesulitan:
                      </span>
                      <div className="flex items-center gap-1 text-[#ffd261]">
                        <StarIcon filled={selectedGlif.kesulitan >= 1} />
                        <StarIcon filled={selectedGlif.kesulitan >= 2} />
                        <StarIcon filled={selectedGlif.kesulitan >= 3} />
                        <span className="text-[11px] text-white/80 ml-1 font-medium">
                          {getDifficultyLabel(selectedGlif.kesulitan)}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/50 block mb-1">
                        Status Saat Ini:
                      </span>
                      <div className="flex items-center gap-1.5 font-medium text-[11px]">
                        {!getClassifierTarget(aksaraKey as 'lontara' | 'sunda' | 'bali', selectedGlif.slug) ? (
                          <span className="text-white/50 text-[11px]">
                            Belum didukung AI
                          </span>
                        ) : userProgress[selectedGlif.slug] === 'dikuasai' ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Dikuasai
                          </span>
                        ) : userProgress[selectedGlif.slug] === 'latihan' ? (
                          <span className="text-amber-300 flex items-center gap-1 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            Sedang Latihan
                          </span>
                        ) : (
                          <span className="text-white/60">
                            Belum Dilatih
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!getClassifierTarget(aksaraKey as 'lontara' | 'sunda' | 'bali', selectedGlif.slug) && (
                    <p className="text-[10px] text-white/50 pt-1 leading-relaxed">
                      Karakter ini dapat dipelajari dan digambar di kanvas, namun evaluasi klasifikasi AI belum didukung.
                    </p>
                  )}
                </div>

                {/* Primary Action Button: Mulai Latih Karakter */}
                <div className="pt-2">
                  <ShinyButton
                    label={`Latih Karakter ${selectedGlif.label} →`}
                    onClick={handleMulaiLatih}
                    className="w-full py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.35)] hover:scale-[1.01] transition-all"
                  />
                </div>
              </div>
            </OrnateFrame>
          </aside>

        </div>
      </div>
    </main>
  );
}
