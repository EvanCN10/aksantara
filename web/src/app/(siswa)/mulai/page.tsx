'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

type AksaraId = 'lontara' | 'sunda' | 'bali';
type JalurId = 'web' | 'hardware' | 'cerita';

interface AksaraOption {
  id: AksaraId;
  nama: string;
  aksaraAsli: string;
  glifUtama: string;
  asal: string;
  wilayah: string;
  karakter: string;
  glifCount: string;
}

interface JalurOption {
  id: JalurId;
  title: string;
  badge: string;
  deskripsi: string;
  icon: React.ComponentType<{ className?: string }>;
}

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

function CanvasIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 15 3-3 4 4" />
      <path d="m14 10 .01-.011" />
      <path d="M7 21V3" />
    </svg>
  );
}

function ChipIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2M9 2v2M20 15h2M20 9h2M9 20v2M15 20v2M2 9h2M2 15h2" />
    </svg>
  );
}

function BookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

const AKSARA_LIST: AksaraOption[] = [
  {
    id: 'lontara',
    nama: 'Aksara Lontara',
    aksaraAsli: 'ᨒᨚᨈᨑ',
    glifUtama: 'ᨀ',
    asal: 'Bugis-Makassar',
    wilayah: 'Sulawesi Selatan',
    karakter: 'Pola geometris belah ketupat tegas, diilhami sulapa eppa & daun lontar.',
    glifCount: '23 Glif Inti',
  },
  {
    id: 'sunda',
    nama: 'Aksara Sunda',
    aksaraAsli: 'ᮃᮊ᮪ᮞᮛ',
    glifUtama: 'ᮊ',
    asal: 'Pasundan',
    wilayah: 'Jawa Barat',
    karakter: 'Bentuk modular ngalagena yang seragam, anggun di atas dluwang kuno.',
    glifCount: '32 Glif Ngalagena',
  },
  {
    id: 'bali',
    nama: 'Aksara Bali',
    aksaraAsli: 'ᬅᬓ᭄ᬱᬭ',
    glifUtama: 'ᬓ',
    asal: 'Bali & Lombok',
    wilayah: 'Sunda Kecil',
    karakter: 'Guratan lengkung sulur daun lontar sarat nilai spiritual dewata.',
    glifCount: '47 Glif Tradisi',
  },
];

const JALUR_LIST: JalurOption[] = [
  {
    id: 'web',
    title: 'Kanvas AI Digital',
    badge: 'Rekomendasi Pemula',
    deskripsi: 'Latihan mandiri di kanvas layar dengan evaluasi goresan AI on-device instan.',
    icon: CanvasIcon,
  },
  {
    id: 'hardware',
    title: 'Hardware Kinestetik',
    badge: 'Sensorik Hands-On',
    deskripsi: 'Rangkai kartu fisik RFID nyata pada Aksantara Tactile Pad via koneksi USB Serial.',
    icon: ChipIcon,
  },
  {
    id: 'cerita',
    title: 'Cerita Interaktif',
    badge: 'Petualangan Naratif',
    deskripsi: 'Eksplorasi kisah epos nusantara dipadu kuis aksara berbasis alur cerita kaya makna.',
    icon: BookIcon,
  },
];

export default function MulaiPage() {
  const router = useRouter();
  const [selectedAksara, setSelectedAksara] = useState<AksaraId | null>(null);
  const [selectedJalur, setSelectedJalur] = useState<JalurId | null>(null);

  const canProceed = Boolean(selectedAksara && selectedJalur);

  const handleMulai = () => {
    if (!selectedAksara || !selectedJalur) return;

    if (selectedJalur === 'web') {
      router.push(`/latihan/web/${selectedAksara}`);
    } else if (selectedJalur === 'hardware') {
      router.push('/hardware/koneksi');
    } else if (selectedJalur === 'cerita') {
      router.push('/cerita');
    }
  };

  const getCtaLabel = () => {
    if (!selectedAksara) return 'Pilih Aksara Terlebih Dahulu';
    if (!selectedJalur) return 'Pilih Jalur Belajar untuk Melanjutkan';
    const aksaraName = AKSARA_LIST.find((a) => a.id === selectedAksara)?.nama || '';
    return `Mulai Petualangan ${aksaraName} →`;
  };

  const getRouteHint = () => {
    if (!selectedAksara || !selectedJalur) {
      return 'Pilih 1 aksara dan 1 jalur belajar untuk mengaktifkan petualangan';
    }
    if (selectedJalur === 'web') return 'Buka latihan kanvas untuk aksara pilihanmu';
    if (selectedJalur === 'hardware') return 'Hubungkan perangkat kartu fisik';
    return 'Pilih cerita untuk mulai belajar';
  };

  return (
    <main className="relative min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden text-[#F6F2E9] flex flex-col justify-between selection:bg-[#ffd261]/20 selection:text-[#ffd261]">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-portal-mulai.webp"
          alt="Portal Gerbang Aksara"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.50] contrast-[1.05] saturate-[1.05] animate-bg-zoom-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[750px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,115,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex-1 flex flex-col justify-between gap-4">
        {/* =========================================
            HEADER & STEP INDICATOR (Choreographed Entrance)
            ========================================= */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Kembali ke Beranda"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-xs font-medium cursor-pointer animate-emerge-up"
              style={{ animationDelay: '80ms' }}
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>

            {/* Stepper indicator */}
            <div
              className="flex items-center gap-2 sm:gap-3 text-xs animate-emerge-up"
              style={{ animationDelay: '140ms' }}
            >
              <div
                className={`flex items-center gap-1.5 font-medium transition-colors ${
                  selectedAksara ? 'text-[#ffd261]' : 'text-white/80'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform duration-300 ${
                    selectedAksara
                      ? 'bg-[#ffd261] text-[#0c1a2c] scale-110 shadow-[0_0_12px_#ffd261]'
                      : 'bg-white/10 text-white/80 border border-white/20'
                  }`}
                >
                  {selectedAksara ? '✓' : '1'}
                </span>
                <span>Pilih Aksara</span>
              </div>
              <div
                className={`w-6 sm:w-10 h-0.5 rounded-full transition-colors duration-300 ${
                  selectedAksara ? 'bg-[#ffd261]/70' : 'bg-white/15'
                }`}
              />
              <div
                className={`flex items-center gap-1.5 font-medium transition-colors duration-300 ${
                  selectedJalur
                    ? 'text-[#ffd261]'
                    : selectedAksara
                    ? 'text-white/80'
                    : 'text-white/40'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform duration-300 ${
                    selectedJalur
                      ? 'bg-[#ffd261] text-[#0c1a2c] scale-110 shadow-[0_0_12px_#ffd261]'
                      : selectedAksara
                      ? 'bg-white/10 text-white/80 border border-white/20'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {selectedJalur ? '✓' : '2'}
                </span>
                <span>Jalur Belajar</span>
              </div>
            </div>
          </div>

          {/* Title and subtitle */}
          <div
            className="text-center max-w-2xl mx-auto mt-0.5 animate-emerge-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261] text-xs font-medium mb-1.5 shadow-[0_0_12px_rgba(255,210,97,0.15)]">
              <SparklesIcon className="w-3.5 h-3.5 animate-pulse" />
              <span>Mulai Perjalanan Aksara</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-[2rem] font-bold leading-tight tracking-tight bg-gradient-to-r from-[#ffd261] via-[#F6F2E9] to-[#D4A373] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              Pilih Aksara yang Ingin Kamu Kuasai
            </h1>
            <p className="text-xs sm:text-sm text-white/65 mt-1 line-clamp-1 sm:line-clamp-none">
              Setiap aksara Nusantara menyimpan filosofi, estetika, dan cerita peradaban yang unik.
            </p>
          </div>
        </header>

        {/* =========================================
            PHASE 1: PILIH AKSARA (3 ORNATE CARDS)
            ========================================= */}
        <section aria-labelledby="section-aksara">
          <h2 id="section-aksara" className="sr-only">
            Pilihan Aksara Nusantara
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {AKSARA_LIST.map((item, idx) => {
              const isSelected = selectedAksara === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAksara(item.id)}
                  style={{ '--stagger': idx } as React.CSSProperties}
                  className={`stagger-item animate-emerge-scale group relative rounded-2xl cursor-pointer transition-all duration-300 text-left sheen-sweep ${
                    isSelected
                      ? 'scale-[1.02] shadow-[0_0_32px_rgba(255,210,97,0.28)] ring-2 ring-[#ffd261]'
                      : 'hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,210,97,0.12)] opacity-85 hover:opacity-100'
                  }`}
                >
                  <OrnateFrame
                    className={`rounded-2xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#ffd261]/20 via-[#0c1a2c]/80 to-[#0A0C12]/95'
                        : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col justify-between h-full min-h-[175px] sm:min-h-[195px] relative">
                      {/* Top row: badge & checkmark */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-[#ffd261]/90 px-2 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25">
                          {item.glifCount}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                            isSelected
                              ? 'bg-[#ffd261] text-[#0c1a2c] shadow-[0_0_12px_#ffd261] scale-110'
                              : 'border border-white/20 text-transparent group-hover:border-white/40'
                          }`}
                        >
                          ✓
                        </div>
                      </div>

                      {/* Center: Unicode Script Display */}
                      <div className="my-1.5 sm:my-2 text-center">
                        <div
                          className={`text-3xl sm:text-4xl font-normal tracking-wide text-[#ffd261] transition-transform duration-300 ${
                            isSelected
                              ? 'scale-110 drop-shadow-[0_4px_16px_rgba(255,210,97,0.65)]'
                              : 'drop-shadow-[0_2px_10px_rgba(255,210,97,0.35)] group-hover:scale-105'
                          }`}
                        >
                          {item.aksaraAsli}
                        </div>
                        <div
                          className="mt-1 text-base sm:text-lg font-bold text-[#F6F2E9]"
                          style={{ fontFamily: 'var(--font-philosopher)' }}
                        >
                          {item.nama}
                        </div>
                        <div className="text-[11px] sm:text-xs text-[#D4A373] font-medium">
                          {item.asal} • {item.wilayah}
                        </div>
                      </div>

                      {/* Bottom: Karakter singkat */}
                      <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed text-center line-clamp-2">
                        {item.karakter}
                      </p>
                    </div>
                  </OrnateFrame>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================
            PHASE 2: PILIH JALUR PEMBELAJARAN
            ========================================= */}
        <section
          aria-labelledby="section-jalur"
          className={`transition-all duration-500 ${
            selectedAksara
              ? 'opacity-100 translate-y-0'
              : 'opacity-40 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
                2. Pilih Cara Belajar
              </span>
              {selectedAksara && (
                <span className="text-[11px] text-white/60 font-medium">
                  (untuk {AKSARA_LIST.find((a) => a.id === selectedAksara)?.nama})
                </span>
              )}
            </div>
            {!selectedAksara && (
              <span className="text-[11px] text-amber-200/60 italic">
                Pilih aksara di atas terlebih dahulu
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {JALUR_LIST.map((jalur, idx) => {
              const isSelected = selectedJalur === jalur.id;
              const Icon = jalur.icon;
              return (
                <button
                  key={jalur.id}
                  type="button"
                  disabled={!selectedAksara}
                  onClick={() => setSelectedJalur(jalur.id)}
                  style={{ '--stagger': idx } as React.CSSProperties}
                  className={`stagger-item animate-emerge-scale sheen-sweep relative p-3 sm:p-3.5 rounded-xl text-left border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#ffd261]/20 border-[#ffd261] shadow-[0_0_24px_rgba(255,210,97,0.25)] ring-1 ring-[#ffd261] scale-[1.01]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06] hover:scale-[1.005]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg transition-colors duration-300 ${
                          isSelected ? 'bg-[#ffd261]/25 text-[#ffd261]' : 'bg-white/5 text-white/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          {jalur.title}
                        </div>
                        <div className="text-[10px] text-[#ffd261]/90 font-medium">
                          {jalur.badge}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#ffd261] text-[#0c1a2c] scale-110 shadow-[0_0_8px_#ffd261]'
                          : 'border border-white/20 text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                  <p className="text-[11px] text-white/60 leading-snug line-clamp-2">
                    {jalur.deskripsi}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================
            BOTTOM ACTION: CTA BUTTON (Beacon Pulse)
            ========================================= */}
        <footer className="flex flex-col items-center justify-center gap-1.5 pt-1">
          <div className={`w-full max-w-md ${canProceed ? 'animate-beacon-pulse rounded-full' : ''}`}>
            <ShinyButton
              label={getCtaLabel()}
              onClick={handleMulai}
              className={`w-full py-3 text-sm font-semibold transition-all duration-300 ${
                canProceed
                  ? 'cursor-pointer shadow-[0_0_30px_rgba(255,210,97,0.35)] hover:scale-[1.02] active:scale-[0.98]'
                  : 'opacity-40 cursor-not-allowed pointer-events-none'
              }`}
            />
          </div>
          <p className="text-[11px] text-white/60 text-center">
            {getRouteHint()}
          </p>
        </footer>
      </div>
    </main>
  );
}
