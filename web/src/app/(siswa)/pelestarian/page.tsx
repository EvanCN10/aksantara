import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PreservationStudio } from '@/components/pelestarian/preservation-studio';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

export default async function PelestarianPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="relative min-h-screen text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-studio-pelestarian.webp"
          alt="Studio Pelestarian & Digitalisasi Manuskrip"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.45] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/3 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.1),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-1/4 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/mulai"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Kembali ke Pilihan Jalur</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/pelestarian/status"
              className="text-xs font-semibold text-[#ffd261] bg-[#ffd261]/10 hover:bg-[#ffd261]/20 px-3.5 py-1.5 rounded-full border border-[#ffd261]/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Papan Status Kurasi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Studio Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#ffd261] px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25 inline-block mb-2">
            Pilar 4: Transliterasi Manual &amp; Review Manusia
          </span>
          <h1
            className="text-2xl sm:text-4xl font-bold text-white tracking-wide mb-2.5"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Studio Transliterasi Manuskrip Kuno
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Bantu filolog membaca naskah kuno Nusantara. Baca aksara pada foto manuskrip asli, lalu tuliskan transliterasi Latin untuk ditinjau oleh guru atau kurator ahli.
          </p>
        </div>

        {/* 3. Interactive Preservation Studio */}
        <PreservationStudio isAuthenticated={Boolean(user)} />
      </div>

      {/* 4. Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-6 text-center text-xs text-white/40">
        Aksantara Manuskrip Digital • British Library EAP &amp; PNRI • FMIPA UGM 2026
      </footer>
    </main>
  );
}
