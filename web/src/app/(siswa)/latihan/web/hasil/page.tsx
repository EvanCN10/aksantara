'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';
import {
  KATALOG_DATA,
  getAksaraData,
  type AksaraDetail,
} from '@/data/aksara/trinitas';
import { SessionMetricCard } from '@/components/canvas/session-metric-card';

// Icons
function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function TrophyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function ClockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TargetIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function ShareIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

// Inner Content Component (wrapped in Suspense for useSearchParams)
function HasilLatihanContent() {
  const searchParams = useSearchParams();
  const rawAksara = searchParams.get('aksara')?.toLowerCase() || 'lontara';
  const aksaraKey = rawAksara in KATALOG_DATA ? rawAksara : 'lontara';
  const dataAksara: AksaraDetail = getAksaraData(aksaraKey) || KATALOG_DATA['lontara'];

  const [copied, setCopied] = useState(false);


  const handleCopyCard = () => {
    const text = `Aksantara — Klasifikasi eksperimen ${dataAksara.nama}. Probabilitas label sumber perlu review manusia, bukan skor kualitas tulisan. Mapping Unicode belum terverifikasi dan probabilitas belum terkalibrasi; tidak ada XP atau penguasaan otomatis.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="relative min-h-screen bg-[#0c1a2c] text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/3 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,115,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col justify-between gap-6 sm:gap-8">
        
        {/* ====================================================================
            1. EXPERIMENT SESSION NOTICE
            ==================================================================== */}
        <header className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/35 text-[#ffd261] text-xs font-semibold mb-3 shadow-[0_0_16px_rgba(255,210,97,0.2)]">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Sesi Klasifikasi Eksperimental</span>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#ffd261] via-[#F6F2E9] to-[#D4A373] bg-clip-text text-transparent leading-tight"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Hasil Tetap Perlu Review
          </h1>

          <p className="mt-2 text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed">
            Klasifikasi kanvas untuk{' '}
            <strong className="text-[#ffd261] font-semibold">{dataAksara.nama}</strong> ({dataAksara.aksaraAsli})
            menampilkan label sumber dan probabilitas langsung di panel kanvas. Tidak ada penilaian kualitas tulisan, penguasaan, atau bonus sesi otomatis.
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-[#D4A373] font-mono">
            <span>{dataAksara.asal}</span>
            <span>•</span>
            <span>{dataAksara.wilayah}</span>
          </div>
        </header>

        {/* ====================================================================
            2. TOP METRICS ROW (4 KARTU STATISTIK KUNCI)
            ==================================================================== */}
        <section aria-labelledby="section-metrics">
          <h2 id="section-metrics" className="sr-only">
            Statistik Sesi Latihan
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <SessionMetricCard
              label="Status Klasifikasi"
              value="Perlu review"
              sublabel="Bukan kelulusan tulisan"
              icon={TargetIcon}
              highlight
            />

            <SessionMetricCard
              label="XP Eksperimen"
              value="Tidak diberikan"
              sublabel="Probabilitas bukan pencapaian"
              icon={SparklesIcon}
            />

            <SessionMetricCard
              label="Mapping Unicode"
              value="Belum diverifikasi"
              sublabel="Label sumber dipertahankan"
              icon={CheckCircleIcon}
            />

            <SessionMetricCard
              label="Kalibrasi Probabilitas"
              value="Belum tersedia"
              sublabel="Bukan ukuran kualitas"
              icon={ClockIcon}
            />
          </div>
        </section>

        {/* ====================================================================
            3. CLASSIFICATION REVIEW NOTICE
            ==================================================================== */}
        <section aria-labelledby="section-glif-review">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
                Review Klasifikasi
              </span>
            </div>

            <Link
              href={`/latihan/web/${aksaraKey}`}
              className="text-xs text-[#D4A373] hover:text-[#ffd261] transition-colors"
            >
              Lihat Seluruh Katalog Glif →
            </Link>
          </div>

          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/80">
            Hasil eksperimen tidak diakumulasi ke riwayat nilai latihan. Periksa top-3 label sumber mentah dan probabilitas di kanvas sebelum meninggalkan karakter. Target yang tidak cocok dengan label sumber unik ditandai tidak didukung, bukan dipetakan otomatis ke glif.
          </p>
        </section>

        {/* ====================================================================
            4. EXPERIMENT LIMITATIONS & HUMAN REVIEW
            ==================================================================== */}
        <section aria-labelledby="section-ai-insights">
          <OrnateFrame className="w-full bg-[#0c1a2c]/85 border border-[#D4A373]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#ffd261]/15 text-[#ffd261]">
                    <TrophyIcon className="w-4 h-4" />
                  </div>
                  <h3
                    className="text-base sm:text-lg font-bold text-white tracking-wide"
                    style={{ fontFamily: 'var(--font-philosopher)' }}
                  >
                    Batasan Eksperimen &amp; Review Manusia
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[#ffd261] font-semibold block mb-1">
                      Yang Diukur:
                    </span>
                    <p className="text-white/70">
                      Model mengklasifikasi citra akhir ke label sumber. Confidence kelas tidak membuktikan proporsi, kualitas tarikan, atau ketepatan posisi diakritik.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[#D4A373] font-semibold block mb-1">
                      Langkah Review:
                    </span>
                    <p className="text-white/70">
                      Bandingkan dengan referensi terkurasi bersama guru atau kurator. Probabilitas belum terkalibrasi dan mapping label ke Unicode belum diverifikasi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Share / Copy Result Mini Card */}
              <div className="w-full md:w-auto md:min-w-[200px] flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-b from-white/[0.04] to-black/30 border border-white/10 text-center">
                <span className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                  Catatan Eksperimen
                </span>
                <span
                  className="text-sm font-bold text-[#ffd261]"
                  style={{ fontFamily: 'var(--font-philosopher)' }}
                >
                  Klasifikasi {dataAksara.nama}
                </span>

                <button
                  type="button"
                  onClick={handleCopyCard}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer active:scale-95"
                >
                  <ShareIcon className="w-3.5 h-3.5 text-[#ffd261]" />
                  <span>{copied ? 'Tersalin!' : 'Bagikan Catatan'}</span>
                </button>
              </div>
            </div>
          </OrnateFrame>
        </section>

        {/* ====================================================================
            5. ACTION HUB (TOMBOL NAVIGASI UTAMA PASCA-LATIHAN)
            ==================================================================== */}
        <footer className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Primary CTA: Lanjut ke Aksara Lain */}
          <Link href="/mulai" className="w-full sm:w-auto sm:min-w-[220px]">
            <ShinyButton
              label="Latih Aksara Lain →"
              className="w-full py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.3)] hover:scale-[1.01] transition-all"
            />
          </Link>

          {/* Secondary CTA: Kembali ke Katalog Glif Aksara Ini */}
          <Link
            href={`/latihan/web/${aksaraKey}`}
            className="w-full sm:w-auto sm:min-w-[200px] py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white text-center text-sm font-medium transition-all cursor-pointer"
          >
            Latih Glif Tambahan
          </Link>

          {/* Tertiary CTA: Profil & Riwayat Belajar */}
          <Link
            href="/profil"
            className="w-full sm:w-auto sm:min-w-[160px] py-3 px-4 rounded-2xl bg-white/[0.02] hover:bg-white/5 border border-white/10 text-white/70 hover:text-white text-center text-sm font-medium transition-all cursor-pointer"
          >
            Lihat Profil
          </Link>
        </footer>

      </div>
    </main>
  );
}

// Default Export wrapped in Suspense for useSearchParams support
export default function HasilLatihanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c1a2c] flex items-center justify-center text-white/60">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd261] animate-ping" />
            <span>Memuat Ringkasan Sesi Latihan...</span>
          </div>
        </div>
      }
    >
      <HasilLatihanContent />
    </Suspense>
  );
}
