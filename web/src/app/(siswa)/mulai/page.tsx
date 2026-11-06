'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, ScrollText } from 'lucide-react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useAuth } from '@/context/auth-context';

type AksaraId = 'bali';
type JalurId = 'web' | 'cerita' | 'pelestarian';

interface AksaraOption {
  id: AksaraId;
  nama: string;
  aksaraAsli: string;
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
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function CanvasIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 15 3-3 4 4" />
      <path d="m14 10 .01-.011" />
      <path d="M7 21V3" />
    </svg>
  );
}

function BookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    asal: 'Bali & Lombok',
    wilayah: 'Bali Dwipa',
    karakter: 'Guratan lengkung sulur daun lontar sarat nilai spiritual dan tradisi sastra dewata.',
    glifCount: '30 Glif Model AI (18 Wianjana + 12 Swalalita)',
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
  {
    id: 'pelestarian',
    title: 'Pelestarian Lontar',
    badge: 'Transliterasi Naskah',
    deskripsi: 'Baca fragmen naskah lontar Bali dan kirim usulan transliterasi untuk dikurasi pengampu.',
    icon: ScrollText,
  },
];

export default function MulaiPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedJalur, setSelectedJalur] = useState<JalurId | null>('web');

  const canProceed = Boolean(selectedJalur);

  const handleMulai = () => {
    if (!selectedJalur) return;

    if (selectedJalur === 'web') {
      router.push('/latihan/web/bali');
    } else if (selectedJalur === 'cerita') {
      router.push('/cerita');
    } else {
      router.push('/pelestarian');
    }
  };

  const getCtaLabel = () => {
    if (!selectedJalur) return 'Pilih Jalur Belajar di Atas';
    if (selectedJalur === 'web') return 'Buka Studio Kanvas Aksara Bali →';
    if (selectedJalur === 'cerita') return 'Mulai Kisah Calon Arang →';
    return 'Buka Studio Pelestarian Lontar →';
  };

  const getRouteHint = () => {
    if (!selectedJalur) return 'Pilih salah satu jalur belajar di atas untuk memulai.';
    if (selectedJalur === 'web') return 'Menuju katalog 30 glif & studio latihan kanvas Aksara Bali.';
    if (selectedJalur === 'cerita') return 'Menuju petualangan cerita interaktif Calon Arang.';
    return 'Menuju ruang baca & transliterasi fragmen naskah lontar Bali.';
  };

  return (
    <main className="relative min-h-dvh text-[#F6F2E9] flex flex-col justify-between overflow-x-hidden selection:bg-[#ffd261]/20 selection:text-[#ffd261]">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-portal-mulai.webp"
          alt=""
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.50] contrast-[1.05] saturate-[1.05] animate-bg-zoom-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex-1 flex flex-col justify-between gap-4 sm:gap-5">
        {/* HEADER */}
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white/85 hover:text-white transition-all text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={user?.role === 'guru' ? '/guru/dashboard' : '/profil'}
                className="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-[#ffd261]/30 text-xs font-medium text-[#ffd261] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
              >
                <User aria-hidden="true" className="w-3.5 h-3.5" />
                <span>{user ? user.nama.split(' ')[0] : 'Profil'}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-white/80 hover:text-white transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
              >
                <LogOut aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          <div className="text-center max-w-xl mx-auto mt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261] text-xs font-medium mb-1.5 shadow-[0_0_12px_rgba(255,210,97,0.15)]">
              <SparklesIcon className="w-3.5 h-3.5 animate-pulse" />
              <span>Portal Belajar Aksara Bali</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight bg-gradient-to-r from-[#ffd261] via-[#F6F2E9] to-[#D4A373] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              Mulai Perjalanan Aksara Bali
            </h1>
            <p className="text-xs sm:text-sm text-white/75 mt-1">
              Pilih modalitas belajar Anda: kanvas AI on-device, petualangan cerita rakyat, atau transliterasi lontar.
            </p>
          </div>
        </header>

        {/* FOCUSED SCRIPT CARD */}
        <section aria-labelledby="section-aksara">
          <h2 id="section-aksara" className="sr-only">
            Fokus Aksara Bali
          </h2>
          <div className="max-w-xl mx-auto w-full">
            {AKSARA_LIST.map((item) => (
              <div
                key={item.id}
                className="relative rounded-2xl text-left shadow-[0_0_28px_rgba(255,210,97,0.16)] ring-1 ring-[#ffd261]/60"
              >
                <OrnateFrame className="rounded-2xl bg-gradient-to-b from-[#ffd261]/12 via-[#0c1a2c]/85 to-[#0A0C12]/95">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div lang="ban" className="text-3xl sm:text-4xl font-serif text-[#ffd261] drop-shadow-[0_4px_16px_rgba(255,210,97,0.5)] shrink-0">
                        {item.aksaraAsli}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-lg sm:text-xl font-bold text-[#F6F2E9]"
                            style={{ fontFamily: 'var(--font-philosopher), serif' }}
                          >
                            {item.nama}
                          </span>
                          <span className="text-[10px] tracking-wider uppercase font-semibold text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25">
                            {item.glifCount}
                          </span>
                        </div>
                        <p className="text-xs text-white/75 leading-relaxed mt-1">
                          {item.karakter}
                        </p>
                      </div>
                    </div>
                  </div>
                </OrnateFrame>
              </div>
            ))}
          </div>
        </section>

        {/* JALUR PEMBELAJARAN */}
        <section aria-labelledby="section-jalur">
          <div className="flex items-center justify-between mb-2.5 max-w-3xl mx-auto">
            <h2 id="section-jalur" className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
              Pilih Cara Belajar:
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto w-full">
            {JALUR_LIST.map((jalur) => {
              const isSelected = selectedJalur === jalur.id;
              const Icon = jalur.icon;
              return (
                <button
                  key={jalur.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedJalur(jalur.id)}
                  className={`relative p-4 rounded-xl text-left border transition-all duration-300 cursor-pointer flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261] ${
                    isSelected
                      ? 'bg-[#ffd261]/20 border-[#ffd261] shadow-[0_0_24px_rgba(255,210,97,0.25)] ring-1 ring-[#ffd261]'
                      : 'bg-white/[0.05] border-white/15 hover:border-white/30 hover:bg-white/[0.09]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-lg transition-colors duration-300 ${
                          isSelected ? 'bg-[#ffd261]/25 text-[#ffd261]' : 'bg-white/10 text-white/85'
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
                      aria-hidden="true"
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 shrink-0 ${
                        isSelected
                          ? 'bg-[#ffd261] text-[#0c1a2c] scale-110 shadow-[0_0_8px_#ffd261]'
                          : 'border border-white/25 text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {jalur.deskripsi}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* BOTTOM ACTION */}
        <footer className="flex flex-col items-center justify-center gap-2 pb-1">
          <div className="w-full max-w-md">
            <ShinyButton
              label={getCtaLabel()}
              disabled={!canProceed}
              onClick={handleMulai}
              className="w-full py-3 text-sm font-semibold shadow-[0_0_30px_rgba(255,210,97,0.28)]"
            />
          </div>
          <p className="text-[11px] text-white/75 text-center">
            {getRouteHint()}
          </p>
        </footer>
      </div>
    </main>
  );
}
