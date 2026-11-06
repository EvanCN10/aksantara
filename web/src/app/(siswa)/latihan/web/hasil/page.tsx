'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';
import {
  KATALOG_DATA,
  getAksaraData,
  type AksaraDetail,
} from '@/data/aksara/trinitas';
import { getModelTrainingCatalog } from '@/data/aksara/model-catalog';
import {
  getSessionPracticeRecords,
  getGlyphPracticeRecords,
  type PracticeRecord,
} from '@/lib/supabase/progress-service';
import { SessionMetricCard } from '@/components/canvas/session-metric-card';
import { GlyphScoreCard } from '@/components/canvas/glyph-score-card';

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function TrophyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TargetIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShareIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function HasilLatihanContent() {
  const aksaraKey = 'bali';
  const dataAksara: AksaraDetail = getAksaraData(aksaraKey) || KATALOG_DATA['bali'];
  const catalog = getModelTrainingCatalog(aksaraKey);

  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sessionList = getSessionPracticeRecords(aksaraKey);
    const activeRecords = sessionList.length > 0 ? sessionList : getGlyphPracticeRecords(aksaraKey);
    setRecords(activeRecords);
    setHasLoaded(true);
  }, [aksaraKey]);

  const trainedGlifs = useMemo(() => {
    const latestBySlug = new Map<string, PracticeRecord>();
    for (const rec of records) {
      latestBySlug.set(rec.glifSlug, rec);
    }

    return Array.from(latestBySlug.values())
      .reverse()
      .map((rec) => {
        const glifMeta = catalog.find((g) => g.slug === rec.glifSlug);
        return {
          slug: rec.glifSlug,
          simbol: glifMeta?.simbol ?? rec.simbol,
          label: glifMeta?.label ?? rec.label ?? rec.glifSlug,
          ipa: glifMeta?.ipa ?? '',
          xp: glifMeta?.xp ?? 50,
          score: rec.score,
          status: (rec.status === 'sempurna' || rec.status === 'bagus' ? 'dikuasai' : 'latihan') as
            | 'dikuasai'
            | 'latihan',
          catatanAI:
            rec.ringkasan ||
            (rec.status === 'sempurna' || rec.status === 'bagus'
              ? 'Bentuk tulisan terklasifikasi sesuai kelas target model ONNX.'
              : 'Bentuk tulisan belum terklasifikasi sebagai kelas target. Coba perjelas proporsi lengkungan.'),
        };
      });
  }, [records, catalog]);

  const avgProbability = useMemo(() => {
    if (trainedGlifs.length === 0) return 0;
    const total = trainedGlifs.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((total / trainedGlifs.length) * 10) / 10;
  }, [trainedGlifs]);

  const masteredCount = useMemo(() => {
    return trainedGlifs.filter((g) => g.status === 'dikuasai').length;
  }, [trainedGlifs]);

  const avgLatencyLabel = useMemo(() => {
    const withLatency = records.filter((r) => typeof r.latencyMs === 'number' && r.latencyMs >= 0);
    if (withLatency.length === 0) return 'Di Browser';
    const sum = withLatency.reduce((acc, curr) => acc + (curr.latencyMs ?? 0), 0);
    return `${Math.round(sum / withLatency.length)} ms`;
  }, [records]);

  const handleCopyCard = () => {
    const text = `[Aksantara — Bali DigiFest 2026]\nSaya telah berlatih menulis ${trainedGlifs.length} karakter ${dataAksara.nama} (${dataAksara.aksaraAsli}) dengan ${masteredCount} karakter sesuai target model ONNX!\nMari pelajari Aksara Bali bersama Aksantara.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="relative min-h-dvh text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-studio-kanvas.webp"
          alt=""
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.4] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/75 to-[#060d16]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.8)_100%)]" />
      </div>

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/3 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,115,0.08),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 lg:py-10 flex-1 flex flex-col justify-between gap-6 sm:gap-8">
        {!hasLoaded ? (
          <div className="flex-1 flex items-center justify-center text-white/75">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffd261] animate-ping" aria-hidden="true" />
              <span>Memuat riwayat evaluasi sesi...</span>
            </div>
          </div>
        ) : trainedGlifs.length === 0 ? (
          /* HONEST EMPTY STATE WHEN NO GLYPHS HAVE BEEN EVALUATED YET */
          <div className="my-auto max-w-xl mx-auto w-full">
            <OrnateFrame
              className="w-full bg-[#0c1a2c]/85 backdrop-blur-xl border border-[#D4A373]/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-2xl"
              innerClassName="p-6 sm:p-8 text-center flex flex-col items-center gap-4"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/35 text-[#ffd261] text-xs font-semibold">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Ringkasan Sesi Nyata</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                Belum Ada Goresan pada Sesi Ini
              </h1>

              <p className="text-sm text-white/75 leading-relaxed">
                Halaman ini hanya menampilkan hasil evaluasi aktual dari tulisan tanganmu di kanvas. Silakan pilih karakter{' '}
                <strong className="text-[#ffd261]">Aksara Bali</strong>, goreskan di kanvas, dan tekan{' '}
                <strong className="text-white">Periksa AI</strong> terlebih dahulu.
              </p>

              <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <ShinyButton
                  href="/latihan/web/bali"
                  label="Mulai Latihan Aksara Bali →"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.3)]"
                />
                <Link
                  href="/mulai"
                  className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/85 hover:text-white text-sm font-medium transition-all"
                >
                  Kembali ke Menu Utama
                </Link>
              </div>
            </OrnateFrame>
          </div>
        ) : (
          <>
            {/* 1. HERO ACCOLADE BANNER */}
            <header className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/35 text-[#ffd261] text-xs font-semibold mb-3 shadow-[0_0_16px_rgba(255,210,97,0.2)]">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Ringkasan Evaluasi Sesi Nyata</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#ffd261] via-[#F6F2E9] to-[#D4A373] bg-clip-text text-transparent leading-tight"
                style={{ fontFamily: 'var(--font-philosopher)' }}
              >
                Catatan Latihan Menulis Aksara Bali
              </h1>

              <p className="mt-2 text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
                Berikut adalah hasil klasifikasi nyata dari goresanmu pada sesi latihan{' '}
                <strong className="text-[#ffd261] font-semibold">{dataAksara.nama}</strong> ({dataAksara.aksaraAsli}) menggunakan model ONNX Runtime Web di browser.
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-[#D4A373] font-mono">
                <span>{dataAksara.asal}</span>
                <span aria-hidden="true">•</span>
                <span>{dataAksara.wilayah}</span>
              </div>
            </header>

            {/* 2. TOP METRICS ROW */}
            <section aria-labelledby="section-metrics">
              <h2 id="section-metrics" className="sr-only">
                Statistik Sesi Latihan
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <SessionMetricCard
                  index={0}
                  label="Probabilitas Rata-rata"
                  value={`${avgProbability.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`}
                  sublabel="Skor Probabilitas Target ONNX"
                  badge="Data Nyata"
                  icon={TargetIcon}
                  highlight
                />

                <SessionMetricCard
                  index={1}
                  label="Sesuai Kelas Target"
                  value={`${masteredCount} / ${trainedGlifs.length}`}
                  sublabel="Glif Terklasifikasi Benar"
                  icon={CheckCircleIcon}
                />

                <SessionMetricCard
                  index={2}
                  label="Total Percobaan"
                  value={`${records.length}x`}
                  sublabel={`${trainedGlifs.length} Karakter Unik Dilatih`}
                  icon={SparklesIcon}
                />

                <SessionMetricCard
                  index={3}
                  label="Waktu Inferensi"
                  value={avgLatencyLabel}
                  sublabel="Rata-rata Klasifikasi ONNX"
                  icon={ClockIcon}
                />
              </div>
            </section>

            {/* 3. GLYPH PERFORMANCE REVIEW GRID */}
            <section aria-labelledby="section-glif-review">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2
                    id="section-glif-review"
                    className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]"
                  >
                    Rincian Evaluasi Karakter
                  </h2>
                  <span className="text-xs text-white/70">
                    ({trainedGlifs.length} Glif Terlatih)
                  </span>
                </div>

                <Link
                  href={`/latihan/web/${aksaraKey}`}
                  className="inline-flex items-center min-h-11 px-2 text-xs text-[#D4A373] hover:text-[#ffd261] transition-colors"
                >
                  Lihat Seluruh Katalog Glif →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {trainedGlifs.map((item, idx) => (
                  <GlyphScoreCard
                    key={item.slug}
                    index={idx}
                    aksaraId={aksaraKey}
                    slug={item.slug}
                    simbol={item.simbol}
                    label={item.label}
                    ipa={item.ipa}
                    score={item.score}
                    status={item.status}
                    catatan={item.catatanAI}
                  />
                ))}
              </div>
            </section>

            {/* 4. PALEOGRAPHY INSIGHTS & RECOMMENDATIONS CARD */}
            <section aria-labelledby="section-ai-insights">
              <OrnateFrame
                className="w-full bg-[#0c1a2c]/85 border border-[#D4A373]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl"
                innerClassName="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#ffd261]/15 text-[#ffd261]">
                      <TrophyIcon className="w-4 h-4" />
                    </div>
                    <h2
                      id="section-ai-insights"
                      className="text-base sm:text-lg font-bold text-white tracking-wide"
                      style={{ fontFamily: 'var(--font-philosopher)' }}
                    >
                      Catatan Model &amp; Langkah Berikutnya
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[#ffd261] font-semibold block mb-1">
                        ✦ Cara Membaca Skor:
                      </span>
                      <p className="text-white/75">
                        Angka persentase merupakan probabilitas kelas dari model spesialis 30 kelas Aksara Bali (18 Wianjana &amp; 12 Swalalita), bukan nilai kualitas kaligrafi atau urutan goresan.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[#D4A373] font-semibold block mb-1">
                        ✦ Rekomendasi Latihan Berikutnya:
                      </span>
                      <p className="text-white/75">
                        Lanjutkan berlatih huruf Wianjana dan Swalalita lainnya di katalog, atau uji penguasaanmu dalam alur cerita rakyat Bali <em>Calon Arang</em>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share / Copy Result Mini Card */}
                <div className="w-full md:w-auto md:min-w-[200px] flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-b from-white/[0.04] to-black/30 border border-white/10 text-center">
                  <span className="text-[10px] text-white/70 uppercase tracking-wider mb-1">
                    Catatan Sesi
                  </span>
                  <span
                    className="text-sm font-bold text-[#ffd261]"
                    style={{ fontFamily: 'var(--font-philosopher)' }}
                  >
                    Penoreh {dataAksara.nama}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyCard}
                    className="mt-3 min-h-11 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/85 hover:text-white text-xs font-medium transition-all cursor-pointer active:scale-95"
                  >
                    <ShareIcon className="w-3.5 h-3.5 text-[#ffd261]" />
                    <span aria-live="polite">{copied ? 'Tersalin!' : 'Salin Ringkasan'}</span>
                  </button>
                </div>
              </OrnateFrame>
            </section>

            {/* 5. ACTION HUB */}
            <footer className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <ShinyButton
                href="/cerita"
                label="Lanjut ke Story Mode Bali →"
                className="w-full sm:w-auto sm:min-w-[230px] py-3 text-sm font-semibold cursor-pointer shadow-[0_0_24px_rgba(255,210,97,0.3)] hover:scale-[1.01] transition-all"
              />

              <Link
                href={`/latihan/web/${aksaraKey}`}
                className="w-full sm:w-auto sm:min-w-[200px] min-h-11 inline-flex items-center justify-center py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white text-center text-sm font-medium transition-all cursor-pointer"
              >
                Kembali ke Katalog Glif
              </Link>

              <Link
                href="/profil"
                className="w-full sm:w-auto sm:min-w-[160px] min-h-11 inline-flex items-center justify-center py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-center text-sm font-medium transition-all cursor-pointer"
              >
                Lihat Profil
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

export default function HasilLatihanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#060d16] flex items-center justify-center text-white/75">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd261] animate-ping" aria-hidden="true" />
            <span>Memuat Ringkasan Sesi Latihan...</span>
          </div>
        </div>
      }
    >
      <HasilLatihanContent />
    </Suspense>
  );
}
