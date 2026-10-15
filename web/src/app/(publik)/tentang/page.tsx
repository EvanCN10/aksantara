'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

function SparklesIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function CpuIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2M9 2v2M20 15h2M20 9h2M9 20v2M15 20v2M2 9h2M2 15h2" />
    </svg>
  );
}

function LayersIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5" />
      <path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5" />
    </svg>
  );
}

function Gamepad2Icon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="6" />
    </svg>
  );
}

function ScrollTextIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10a2 2 0 0 0-2 2Z" />
      <path d="M4 17a2 2 0 0 1 2-2h2v4a2 2 0 0 1-2 2H4Z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AwardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
    </svg>
  );
}

function LaptopIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.38 20H3.62a1 1 0 0 1-.9-1.45L4 16" />
    </svg>
  );
}

function RadioIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
  );
}

function HandIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

function BookOpenIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

const PILAR = [
  {
    icon: CpuIcon,
    nomor: 'Pilar 1',
    kategori: 'AI Computer Vision',
    judul: 'Precision AI Writing Coach',
    teks:
      'Evaluasi bentuk tulisan tangan dan verifikasi posisi diakritik secara on-device, menilai keutuhan fonetik tanpa bergantung pada koneksi server saat demo panggung.',
  },
  {
    icon: LayersIcon,
    nomor: 'Pilar 2',
    kategori: 'Paleografi Komparatif',
    judul: 'Trinitas Aksara Nusantara',
    teks:
      'Spesialisasi mendalam pada Lontara, Sunda, dan Bali sebagai representasi kontras geometri Nusantara: sudut maritim, modular ngalagena, dan kurvalinier naskah lontar.',
  },
  {
    icon: Gamepad2Icon,
    nomor: 'Pilar 3',
    kategori: 'Gamifikasi Naratif',
    judul: 'Gamified Engagement & Narrative Story',
    teks:
      'Petualangan cerita rakyat interaktif Sawerigading, Lutung Kasarung, dan Calon Arang, dengan branching aman yang menjaga demo tetap deterministik di panggung.',
  },
  {
    icon: ScrollTextIcon,
    nomor: 'Pilar 4',
    kategori: 'Preservasi Budaya',
    judul: 'Human-in-the-Loop Digitalisasi Manuskrip',
    teks:
      'Siswa tingkat mahir membantu verifikasi hasil OCR naskah kuno dari arsip British Library Endangered Archives Programme dan koleksi manuskrip lokal.',
  },
];

const METRIK = [
  { nilai: '<50ms', label: 'Latensi Inferensi Evaluasi Kanvas' },
  { nilai: 'ACL 2025', label: 'Fondasi Benchmark NusaAksara' },
  { nilai: 'Web Serial API', label: 'Komunikasi Hardware Zero-Driver' },
  { nilai: '100%', label: 'Unicode Compliant: Buginese, Sundanese, Balinese' },
];

export default function TentangKamiPage() {
  return (
    <main className="relative min-h-screen text-[#F6F2E9] overflow-x-hidden selection:bg-[#ffd261]/20 selection:text-[#ffd261]">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-katalog-cerita.webp"
          alt="Latar Belakang Aksantara"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.75] contrast-[1.05] saturate-[1.10] animate-bg-zoom-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2c] via-[#0c1a2c]/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(12,26,44,0.65)_100%)]" />
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
            1. HERO SECTION (Choreographed Entrance)
            ========================================= */}
        <section className="mx-auto max-w-4xl px-6 pt-28 md:pt-36 pb-16 text-center">
          <div
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/90 text-[#D4A373] shadow-[0_4px_16px_rgba(0,0,0,0.4)] animate-emerge-up"
            style={{ animationDelay: '80ms' }}
          >
            <SparklesIcon className="h-3.5 w-3.5 text-[#ffd261] animate-pulse" />
            Manifesto EdTech Nusantara
          </div>

          <h1
            className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-t from-[#ffd261] via-[#FFF2D6] to-[#FFFFFF] bg-clip-text text-transparent animate-emerge-up"
            style={{
              fontFamily: 'var(--font-philosopher), serif',
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85))',
              animationDelay: '180ms',
            }}
          >
            Menghidupkan Aksara, Menyentuh Tradisi
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-sm md:text-base text-[#F6F2E9]/80 leading-relaxed font-light animate-emerge-up"
            style={{ animationDelay: '280ms' }}
          >
            Aksantara melawan krisis literasi aksara daerah lewat perpaduan kecerdasan buatan
            presisi dan perangkat kinestetik fisik (Phygital), mengatasi kelelahan layar yang
            dialami anak sekolah saat belajar lewat aplikasi digital semata.
          </p>
        </section>

        {/* =========================================
            2. KONTEKS MASALAH & RISET UGM 2026
            ========================================= */}
        <section
          className="mx-auto max-w-5xl px-6 pb-16 animate-emerge-up"
          style={{ animationDelay: '360ms' }}
        >
          <div className="rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] sheen-sweep">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#D4A373] font-semibold mb-3">
                  Konteks Masalah
                </p>
                <p className="text-sm text-[#F6F2E9]/75 leading-relaxed">
                  Indonesia memiliki lebih dari 700 bahasa daerah dan puluhan aksara, namun
                  generasi muda mengalami krisis literasi aksara non-Latin. Aksara daerah kian
                  jarang dipakai di luar ruang kelas, menyisakan jarak antara kurikulum muatan
                  lokal dan praktik sehari-hari.
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                <p className="text-xs uppercase tracking-[0.2em] text-[#ffd261] font-semibold mb-3">
                  Temuan Riset UGM 2026
                </p>
                <p className="text-sm text-[#F6F2E9]/75 leading-relaxed">
                  Riset UGM (2026) menunjukkan metode konvensional cenderung membosankan,
                  sementara aplikasi digital yang ada, seperti Arutala atau aksarahub.id, sekadar
                  berfungsi sebagai kamus pasif yang memicu kelelahan layar tanpa melatih
                  motorik halus anak.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            3. PENDEKATAN PHYGITAL: ANTI-GIMIK IOT
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div
            className="flex items-center justify-center gap-2 mb-3 animate-emerge-up"
            style={{ animationDelay: '420ms' }}
          >
            <HandIcon className="h-5 w-5 text-[#ffd261]" />
            <h2
              className="text-2xl md:text-3xl font-bold text-center text-[#F6F2E9]"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              Pendekatan Phygital: Anti-Gimik IoT
            </h2>
          </div>
          <p
            className="mx-auto max-w-2xl text-center text-sm text-[#F6F2E9]/65 mb-10 font-light animate-emerge-up"
            style={{ animationDelay: '460ms' }}
          >
            Dua mode penggunaan yang saling melengkapi, bukan saling menggantikan
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Mode Digital: Web Canvas */}
            <div
              className="animate-emerge-scale sheen-sweep rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-[#ffd261]/50 hover:scale-[1.015]"
              style={{ animationDelay: '500ms' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A373]/35 bg-black/40 text-[#ffd261]">
                  <LaptopIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3
                    className="text-lg font-bold text-[#F6F2E9]"
                    style={{ fontFamily: 'var(--font-philosopher), serif' }}
                  >
                    Mode Web Canvas (Digital)
                  </h3>
                  <span className="text-[11px] text-[#D4A373] font-mono">
                    Latihan Presisi On-Screen
                  </span>
                </div>
              </div>
              <ul className="space-y-3.5 text-sm text-[#F6F2E9]/75">
                <li className="border-l-2 border-[#cf5600] pl-4 leading-relaxed">
                  Universal Canvas berbasis PointerEvent API, mendukung stylus, touchscreen
                  tablet, dan mouse laptop dengan latensi sub-50ms.
                </li>
                <li className="border-l-2 border-[#cf5600] pl-4 leading-relaxed">
                  Evaluasi bentuk akhir memakai Shape and Topology Classifier hasil fine-tuning
                  benchmark akademis NusaAksara (ACL 2025), tanpa penalti urutan goresan kaku.
                </li>
              </ul>
            </div>

            {/* Mode Fisik: Aksantara Tactile Pad */}
            <div
              className="animate-emerge-scale sheen-sweep rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-[#ffd261]/50 hover:scale-[1.015]"
              style={{ animationDelay: '560ms' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A373]/35 bg-black/40 text-[#ffd261]">
                  <RadioIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3
                    className="text-lg font-bold text-[#F6F2E9]"
                    style={{ fontFamily: 'var(--font-philosopher), serif' }}
                  >
                    Mode Aksantara Tactile Pad (Hardware)
                  </h3>
                  <span className="text-[11px] text-[#D4A373] font-mono">
                    Kinestetik Plug &amp; Play
                  </span>
                </div>
              </div>
              <ul className="space-y-3.5 text-sm text-[#F6F2E9]/75">
                <li className="border-l-2 border-[#ffd261] pl-4 leading-relaxed">
                  Konsol mikrokontroler ESP32 dengan modul RFID/NFC 13.56 MHz, terhubung langsung
                  ke browser laptop atau PC lewat Web Serial API: plug-and-play, zero-latency,
                  tanpa ketergantungan WiFi.
                </li>
                <li className="border-l-2 border-[#ffd261] pl-4 leading-relaxed">
                  30 kartu akrilik ber-RFID untuk menyusun suku kata, konsonan dan diakritik,
                  secara sensorik dan kinestetik di luar layar tanpa kelelahan mata.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================
            4. ARSITEKTUR EMPAT PILAR SOLUSI
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#F6F2E9] animate-emerge-up"
            style={{ fontFamily: 'var(--font-philosopher), serif', animationDelay: '600ms' }}
          >
            Arsitektur Empat Pilar Solusi
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {PILAR.map(({ icon: Icon, nomor, kategori, judul, teks }, idx) => (
              <div
                key={judul}
                style={{ '--stagger': idx } as React.CSSProperties}
                className="stagger-item animate-emerge-scale sheen-sweep rounded-2xl group transition-transform duration-300 hover:scale-[1.02]"
              >
                <OrnateFrame className="aspect-auto bg-[#0c1a2c]/60 backdrop-blur-xl h-full">
                  <div className="p-6 sm:p-7 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4A373]/35 bg-black/40 text-[#ffd261] group-hover:border-[#ffd261] transition-colors">
                            <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4A373] font-semibold">
                            {nomor}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-[#F6F2E9]/60">
                          {kategori}
                        </span>
                      </div>
                      <h3
                        className="mt-4 text-lg sm:text-xl font-bold text-[#F6F2E9] group-hover:text-[#ffd261] transition-colors"
                        style={{ fontFamily: 'var(--font-philosopher), serif' }}
                      >
                        {judul}
                      </h3>
                      <p className="mt-2 text-sm text-[#F6F2E9]/75 leading-relaxed font-light">
                        {teks}
                      </p>
                    </div>
                  </div>
                </OrnateFrame>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================
            5. SPESIFIKASI & STANDAR REKAYASA
            ========================================= */}
        <section
          className="mx-auto max-w-5xl px-6 pb-16 animate-emerge-up"
          style={{ animationDelay: '700ms' }}
        >
          <div className="rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] sheen-sweep">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheckIcon className="h-5 w-5 text-[#ffd261]" />
              <h2
                className="text-xl md:text-2xl font-bold text-[#F6F2E9]"
                style={{ fontFamily: 'var(--font-philosopher), serif' }}
              >
                Spesifikasi &amp; Standar Rekayasa
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {METRIK.map((m, idx) => (
                <div
                  key={m.label}
                  style={{ '--stagger': idx } as React.CSSProperties}
                  className="stagger-item animate-emerge-scale rounded-xl border border-white/5 bg-black/30 p-5 text-center transition-all duration-300 hover:border-[#ffd261]/40 hover:bg-white/[0.03] hover:scale-105"
                >
                  <p
                    className="text-2xl md:text-3xl font-bold text-[#ffd261] drop-shadow-[0_2px_12px_rgba(255,210,97,0.3)]"
                    style={{ fontFamily: 'var(--font-philosopher), serif' }}
                  >
                    {m.nilai}
                  </p>
                  <p className="mt-2 text-xs text-[#F6F2E9]/65 leading-relaxed font-light">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            6. ROADMAP & PERNYATAAN TIM
            ========================================= */}
        <section
          className="mx-auto max-w-4xl px-6 pb-16 animate-emerge-up"
          style={{ animationDelay: '780ms' }}
        >
          <div className="rounded-2xl backdrop-blur-xl bg-[rgba(20,23,33,0.92)] border border-[#D4A373]/25 p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] sheen-sweep">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AwardIcon className="h-5 w-5 text-[#ffd261]" />
              <h2
                className="text-xl font-bold text-[#F6F2E9]"
                style={{ fontFamily: 'var(--font-philosopher), serif' }}
              >
                Pernyataan Tim
              </h2>
            </div>
            <p className="text-sm text-[#F6F2E9]/75 leading-relaxed font-light max-w-2xl mx-auto">
              Aksantara dibuat dengan dedikasi penuh untuk memajukan Kurikulum Merdeka Muatan
              Lokal di jenjang sekolah dasar dan menengah. Platform ini siap diuji dan
              didemonstrasikan secara langsung di hadapan dewan juri Grand Final JOINTS UGM 2026,
              FMIPA, Universitas Gadjah Mada.
            </p>
          </div>
        </section>

        {/* =========================================
            7. CALL TO ACTION (CTA)
            ========================================= */}
        <section
          className="mx-auto max-w-3xl px-6 pb-28 text-center animate-emerge-up"
          style={{ animationDelay: '840ms' }}
        >
          <p className="text-sm text-[#F6F2E9]/70 mb-6 font-light">
            Eksplorasi ketiga aksara atau langsung uji coba model evaluasi kanvas kami.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ShinyButton
              label="Jelajahi Trinitas Aksara"
              href="/trinitas"
              fillColor="rgba(13, 14, 18, 0.75)"
              labelColor="#F6F2E9"
              accentColor="#ffd261"
              accentSoftColor="#ffe8a3"
              cornerRadius={9999}
              className="text-xs sm:text-sm tracking-wide font-medium shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(255,210,97,0.18)] hover:scale-105 active:scale-95 transition-transform duration-300 px-6 py-3"
            />
            <Link
              href="/mulai"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#D4A373] hover:text-[#ffd261] transition-colors px-6 py-3 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/80 hover:bg-white/[0.06] shadow-md hover:scale-105 active:scale-95 duration-300"
            >
              <BookOpenIcon className="h-4 w-4" />
              Mulai Belajar Sekarang
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
