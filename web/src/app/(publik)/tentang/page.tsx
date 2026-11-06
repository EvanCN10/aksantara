'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles as SparklesIcon,
  BookOpen as BookOpenIcon,
  ScrollText as ScrollTextIcon,
  Layers as LayersIcon,
  PenTool as PenToolIcon,
  Cpu as CpuIcon,
  Award as AwardIcon,
  BookMarked as BookMarkedIcon,
  Brain as BrainIcon,
  Eye as EyeIcon,
  Laptop as LaptopIcon,
} from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';

const PILAR = [
  {
    icon: PenToolIcon,
    nomor: 'Pilar 1',
    kategori: 'Presisi AI',
    judul: 'Latihan Menulis Kanvas Digital',
    teks:
      'Siswa berlatih menulis aksara Bali di kanvas digital dengan umpan balik bentuk secara instan. Model AI mengevaluasi citra bentuk akhir goresan tanpa membatasi arah tarikan garis.',
  },
  {
    icon: LayersIcon,
    nomor: 'Pilar 2',
    kategori: 'Kurikulum Budaya',
    judul: 'Kurikulum Aksara Bali Lengkap',
    teks:
      'Siswa mempelajari anatomi 18 aksara wianjana, 12 swalalita, serta pengenalan sistem gantungan, gempelan, dan tanda vokalisasi pangangge.',
  },
  {
    icon: BookMarkedIcon,
    nomor: 'Pilar 3',
    kategori: 'Naratif Budaya',
    judul: 'Petualangan Sastra Calon Arang',
    teks:
      'Siswa mengikuti alur cerita epos Bali klasik Calon Arang dan Prabu Airlangga yang dipadu kuis dan tantangan menulis aksara interaktif.',
  },
  {
    icon: ScrollTextIcon,
    nomor: 'Pilar 4',
    kategori: 'Pelestarian Budaya',
    judul: 'Transliterasi Naskah & Review Guru',
    teks:
      'Siswa membaca foto fragmen naskah lontar kuno dan mengirimkan usulan transliterasi untuk ditinjau oleh guru atau ahli aksara Bali.',
  },
];

const METRIK = [
  { nilai: 'Aksara Bali', label: '18 Wianjana & 12 Swalalita' },
  { nilai: 'Kanvas Digital', label: 'Pointer Events Multi-Device' },
  { nilai: 'In-Browser AI', label: 'Inferensi Cepat ONNX Runtime Web' },
  { nilai: 'Review Manusia', label: 'Kurasi Transliterasi Guru' },
];

export default function TentangKamiPage() {
  return (
    <main className="relative min-h-dvh text-[#F6F2E9] overflow-x-hidden selection:bg-[#ffd261]/20 selection:text-[#ffd261]">
      {/* Visual Thematic Background — Editorial Atmospheric Sky & Horizon */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-tentang.webp"
          alt=""
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.55] contrast-[1.05] saturate-[1.05] animate-bg-zoom-in"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d16]/60 via-[#0c1a2c]/70 to-[#060d16]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.8)_100%)]" />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255, 210, 97, 0.08) 0%, rgba(207, 86, 0, 0.04) 40%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* =========================================
            1. HERO SECTION
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pt-28 md:pt-36 pb-12 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/90 text-[#D4A373] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <SparklesIcon className="h-3.5 w-3.5 text-[#ffd261] animate-pulse" />
            Visi &amp; Arsitektur Aksantara
          </div>

          <h1
            className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-t from-[#ffd261] via-[#FFF2D6] to-[#FFFFFF] bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-philosopher), serif',
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85))',
            }}
          >
            Menjaga Aksara Bali Hidup di Era Digital
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm md:text-base text-[#F6F2E9]/80 leading-relaxed font-light">
            Aksantara memadukan kecerdasan buatan evaluasi bentuk dengan pembelajaran interaktif berbasis kurikulum
            muatan lokal untuk melestarikan warisan adiluhung budaya Bali.
          </p>
        </section>

        {/* =========================================
            2. MASALAH & ANALISIS
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="rounded-3xl border border-[#D4A373]/25 bg-[rgba(16,24,39,0.85)] p-6 sm:p-10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <h2
              className="text-2xl md:text-3xl font-bold text-center text-[#F6F2E9] mb-4"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              Tantangan Nyata Literasi Aksara Bali
            </h2>
            <p className="mx-auto max-w-2xl text-center text-sm text-[#F6F2E9]/75 mb-10 font-light leading-relaxed">
              Meskipun aksara Bali hadir di ruang publik dan kurikulum sekolah, generasi muda menghadapi hambatan metode pembelajaran konvensional.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ffd261]">
                  <BrainIcon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-[#ffd261]">
                  Kekakuan Penilaian Algoritma
                </h3>
                <p className="text-xs text-[#F6F2E9]/70 leading-relaxed">
                  Metode stroke-tracking konvensional sering menghukum urutan goresan pena, padahal penulisan aksara Bali memberi ruang kebebasan gaya tangan selama bentuk fonetisnya utuh.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <EyeIcon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-orange-300">
                  Keterbatasan Buku Konvensional
                </h3>
                <p className="text-xs text-[#F6F2E9]/70 leading-relaxed">
                  Buku teks cetak tidak memberikan umpan balik langsung terhadap goresan siswa, sehingga kesalahan bentuk sulit dikoreksi secara mandiri di rumah.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <LaptopIcon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-emerald-300">
                  Minimnya Alat Latih Aktif
                </h3>
                <p className="text-xs text-[#F6F2E9]/70 leading-relaxed">
                  Kebanyakan aplikasi yang ada hanya transliterasi teks Latin ke Aksara Bali secara pasif tanpa melatih motorik menulis anak.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            3. DUA MODALITAS BELAJAR
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="text-center mb-8">
            <h2
              className="text-2xl md:text-3xl font-bold text-[#F6F2E9]"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              Pendekatan Pembelajaran Terintegrasi
            </h2>
            <p className="text-sm text-[#F6F2E9]/65 mt-2 font-light">
              Kombinasi latihan kanvas presisi dan petualangan sastra daerah
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A373]/35 bg-black/40 text-[#ffd261]">
                  <LaptopIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3
                    className="text-lg font-bold text-[#F6F2E9]"
                    style={{ fontFamily: 'var(--font-philosopher), serif' }}
                  >
                    Universal Web Canvas
                  </h3>
                  <span className="text-[11px] text-[#D4A373] font-mono">
                    Latihan Mandiri On-Screen
                  </span>
                </div>
              </div>
              <ul className="space-y-3.5 text-sm text-[#F6F2E9]/75">
                <li className="border-l-2 border-[#cf5600] pl-4 leading-relaxed">
                  Mendukung stylus pen tablet, touchscreen gawai, serta mouse komputer via PointerEvent API terpadu.
                </li>
                <li className="border-l-2 border-[#cf5600] pl-4 leading-relaxed">
                  Inferensi ONNX Runtime Web langsung di browser klien, menjamin privasi dan latensi cepat tanpa mengirim citra mentah ke server eksternal.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A373]/35 bg-black/40 text-[#ffd261]">
                  <BookMarkedIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3
                    className="text-lg font-bold text-[#F6F2E9]"
                    style={{ fontFamily: 'var(--font-philosopher), serif' }}
                  >
                    Narrative Story Mode
                  </h3>
                  <span className="text-[11px] text-[#D4A373] font-mono">
                    Petualangan Calon Arang
                  </span>
                </div>
              </div>
              <ul className="space-y-3.5 text-sm text-[#F6F2E9]/75">
                <li className="border-l-2 border-[#ffd261] pl-4 leading-relaxed">
                  Menghubungkan pembelajaran aksara dengan cerita rakyat klasik Bali melalui state machine cerita deterministik.
                </li>
                <li className="border-l-2 border-[#ffd261] pl-4 leading-relaxed">
                  Tantangan menulis aksara di sela-sela babak cerita untuk menguji pemahaman konteks dan memotivasi siswa.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================
            4. EMPAT PILAR SISTEM
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center text-[#F6F2E9] mb-10"
            style={{ fontFamily: 'var(--font-philosopher), serif' }}
          >
            Empat Pilar Solusi Aksantara
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PILAR.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.nomor}
                  className="rounded-2xl border border-white/10 bg-[rgba(16,24,39,0.85)] p-5 backdrop-blur-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-[#ffd261] px-2 py-0.5 rounded bg-[#ffd261]/10 border border-[#ffd261]/20">
                        {p.nomor}
                      </span>
                      <Icon className="h-4 w-4 text-[#ffd261]" />
                    </div>
                    <h3 className="text-base font-bold text-white">{p.judul}</h3>
                    <p className="text-xs text-[#F6F2E9]/70 leading-relaxed font-light">{p.teks}</p>
                  </div>
                  <span className="text-[11px] text-[#D4A373] block mt-4 pt-3 border-t border-white/10 font-mono">
                    {p.kategori}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================
            5. METRIK RINGKAS
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METRIK.map((m) => (
              <div key={m.label} className="p-5 rounded-2xl bg-black/40 border border-[#D4A373]/20 text-center">
                <span className="text-lg sm:text-xl font-bold text-[#ffd261] block" style={{ fontFamily: 'var(--font-philosopher), serif' }}>
                  {m.nilai}
                </span>
                <span className="text-xs text-[#F6F2E9]/70 block mt-1">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================
            6. PERNYATAAN TIM
            ========================================= */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AwardIcon className="h-5 w-5 text-[#ffd261]" />
              <h2
                className="text-xl font-bold text-[#F6F2E9]"
                style={{ fontFamily: 'var(--font-philosopher), serif' }}
              >
                Komitmen Bali DigiFest 2026
              </h2>
            </div>
            <p className="text-sm text-[#F6F2E9]/75 leading-relaxed font-light max-w-2xl mx-auto">
              Aksantara dikembangkan untuk kompetisi Bali DigiFest 2026 — AI Web Innovation Challenge
              (&quot;Build With AI, Solve For Bali&quot;) guna memajukan literasi dan pelestarian Aksara Bali
              di kalangan pelajar, pengajar muatan lokal, dan masyarakat umum secara berdaya guna dan menyenangkan.
            </p>
          </div>
        </section>

        {/* =========================================
            7. CALL TO ACTION (CTA)
            ========================================= */}
        <section className="mx-auto max-w-3xl px-6 pb-28 text-center">
          <p className="text-sm text-[#F6F2E9]/70 mb-6 font-light">
            Mulai petualangan belajar aksara Bali Anda sekarang.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ShinyButton
              label="Eksplorasi Aksara Bali"
              href="/aksara-bali"
              fillColor="rgba(13, 14, 18, 0.75)"
              labelColor="#F6F2E9"
              accentColor="#ffd261"
              accentSoftColor="#ffe8a3"
              cornerRadius={9999}
              className="text-xs sm:text-sm tracking-wide font-medium shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(255,210,97,0.18)] hover:scale-105 active:scale-95 transition-transform duration-300 px-6 py-3"
            />
            <Link
              href="/mulai"
              className="inline-flex items-center justify-center min-h-11 gap-2 text-xs sm:text-sm font-semibold text-[#D4A373] hover:text-[#ffd261] transition-colors px-6 py-3 rounded-full border border-[#D4A373]/40 bg-[#0D0E12]/85 hover:bg-white/[0.08] shadow-md hover:scale-105 active:scale-95 duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
            >
              <BookOpenIcon aria-hidden="true" className="h-4 w-4" />
              Mulai Latihan Kanvas
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
