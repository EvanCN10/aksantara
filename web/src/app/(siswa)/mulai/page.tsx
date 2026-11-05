'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

type AksaraId = 'bali';
type JalurId = 'web' | 'cerita';

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
    id: 'bali',
    nama: 'Aksara Bali',
    aksaraAsli: 'ᬅᬓ᭄ᬱᬭ ᬩᬮᬶ',
    glifUtama: 'ᬓ',
    asal: 'Bali & Lombok',
    wilayah: 'Bali Dwipa',
    karakter: 'Guratan lengkung sulur daun lontar sarat nilai spiritual dan tradisi sastra dewata.',
    glifCount: '30 Glif Model AI',
  },
];

const JALUR_LIST: JalurOption[] = [
  {
    id: 'web',
    title: 'Kanvas AI Digital',
    badge: 'Latihan Mandiri',
    deskripsi: 'Latihan menulis aksara di kanvas dengan evaluasi goresan AI on-device langsung di browser.',
    icon: CanvasIcon,
  },
  {
    id: 'cerita',
    title: 'Cerita Calon Arang',
    badge: 'Petualangan Naratif',
    deskripsi: 'Eksplorasi kisah epos klasik Bali dipadu tantangan aksara interaktif berbasis alur cerita.',
    icon: BookIcon,
  },
];

export default function MulaiPage() {
  const router = useRouter();
  const [selectedAksara, setSelectedAksara] = useState<AksaraId | null>('bali');
  const [selectedJalur, setSelectedJalur] = useState<JalurId | null>(null);

  const canProceed = Boolean(selectedAksara && selectedJalur);

  const handleMulai = () => {
    if (!selectedAksara || !selectedJalur) return;

    if (selectedJalur === 'web') {
      router.push(`/latihan/web/${selectedAksara}`);
    } else if (selectedJalur === 'cerita') {
      router.push('/cerita');
    }
  };

  const getCtaLabel = () => {
    if (!selectedJalur) return 'Pilih Jalur Belajar untuk Melanjutkan';
    return 'Mulai Petualangan Aksara Bali →';
  };

  const getRouteHint = () => {
    if (!selectedJalur) return 'Pilih salah satu cara belajar di bawah untuk memulai';
    if (selectedJalur === 'web') return 'Buka studio latihan kanvas digital Aksara Bali';
    return 'Buka petualangan cerita interaktif Calon Arang';
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

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-between gap-6">
        {/* HEADER */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Kembali ke Beranda"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all text-xs font-medium cursor-pointer"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>

            <span className="text-xs text-[#ffd261] font-mono font-medium">
              Bali DigiFest 2026 Edition
            </span>
          </div>

          <div className="text-center max-w-xl mx-auto mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261] text-xs font-medium mb-2 shadow-[0_0_12px_rgba(255,210,97,0.15)]">
              <SparklesIcon className="w-3.5 h-3.5 animate-pulse" />
              <span>Portal Belajar Aksara Bali</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight bg-gradient-to-r from-[#ffd261] via-[#F6F2E9] to-[#D4A373] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              Mulai Perjalanan Aksara Bali
            </h1>
            <p className="text-xs sm:text-sm text-white/65 mt-1.5">
              Pelajari warisan sastra naskah lontar Bali melalui latihan kanvas AI interaktif atau petualangan naratif.
            </p>
          </div>
        </header>

        {/* FOCUSED SCRIPT CARD */}
        <section aria-labelledby="section-aksara">
          <h2 id="section-aksara" className="sr-only">
            Fokus Aksara Bali
          </h2>
          <div className="max-w-lg mx-auto w-full">
            {AKSARA_LIST.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAksara(item.id)}
                className="group relative rounded-2xl cursor-pointer transition-all duration-300 text-left shadow-[0_0_32px_rgba(255,210,97,0.2)] ring-2 ring-[#ffd261]/80"
              >
                <OrnateFrame className="rounded-2xl bg-gradient-to-b from-[#ffd261]/15 via-[#0c1a2c]/85 to-[#0A0C12]/95">
                  <div className="p-5 flex flex-col justify-between h-full relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25">
                        {item.glifCount}
                      </span>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#ffd261] text-[#0c1a2c] shadow-[0_0_10px_#ffd261]">
                        ✓
                      </div>
                    </div>

                    <div className="my-3 text-center">
                      <div className="text-4xl sm:text-5xl font-serif text-[#ffd261] drop-shadow-[0_4px_16px_rgba(255,210,97,0.5)]">
                        {item.aksaraAsli}
                      </div>
                      <div
                        className="mt-2 text-xl font-bold text-[#F6F2E9]"
                        style={{ fontFamily: 'var(--font-philosopher), serif' }}
                      >
                        {item.nama}
                      </div>
                      <div className="text-xs text-[#D4A373] font-medium mt-0.5">
                        {item.asal} • {item.wilayah}
                      </div>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed text-center">
                      {item.karakter}
                    </p>
                  </div>
                </OrnateFrame>
              </div>
            ))}
          </div>
        </section>

        {/* JALUR PEMBELAJARAN */}
        <section aria-labelledby="section-jalur">
          <div className="flex items-center justify-between mb-3 max-w-lg mx-auto">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
              Pilih Cara Belajar:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto w-full">
            {JALUR_LIST.map((jalur) => {
              const isSelected = selectedJalur === jalur.id;
              const Icon = jalur.icon;
              return (
                <button
                  key={jalur.id}
                  type="button"
                  onClick={() => setSelectedJalur(jalur.id)}
                  className={`relative p-4 rounded-xl text-left border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#ffd261]/20 border-[#ffd261] shadow-[0_0_24px_rgba(255,210,97,0.25)] ring-1 ring-[#ffd261] scale-[1.01]'
                      : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg transition-colors duration-300 ${
                          isSelected ? 'bg-[#ffd261]/25 text-[#ffd261]' : 'bg-white/10 text-white/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {jalur.title}
                        </div>
                        <div className="text-[10px] text-[#ffd261] font-medium">
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
                  <p className="text-xs text-white/60 leading-relaxed">
                    {jalur.deskripsi}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* BOTTOM ACTION */}
        <footer className="flex flex-col items-center justify-center gap-2 pb-2">
          <div className="w-full max-w-md">
            <ShinyButton
              label={getCtaLabel()}
              onClick={handleMulai}
              className={`w-full py-3.5 text-sm font-semibold transition-all duration-300 ${
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
