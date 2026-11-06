'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Scroll, PenTool } from 'lucide-react';
import { OrnateFrame } from '@/components/ui/ornate-frame';

export default function NotFound() {
  return (
    <main className="min-h-dvh w-full bg-[#060d16] text-[#F6F2E9] flex flex-col items-center justify-center p-4 selection:bg-[#ffd261] selection:text-[#0c1a2c] relative overflow-hidden">
      {/* Subtle Thematic Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-not-found.webp"
          alt=""
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.55] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/80" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <OrnateFrame className="bg-[#0c1a2c]/90 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-[#ffd261]/30 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#ffd261]/20 to-[#D4A373]/10 border-2 border-[#ffd261]/60 flex items-center justify-center shadow-inner">
            <Scroll aria-hidden="true" className="w-10 h-10 text-[#ffd261]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ffd261]/15 text-[#ffd261] border border-[#ffd261]/30">
              Galat 404 • Halaman Tak Ditemukan
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide pt-1">
              Aksara Hilang di Lembah Waktu
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm mx-auto">
              Lembaran lontar atau halaman digital yang Anda cari tidak tercatat dalam arsip Aksantara.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/25 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
            >
              <span aria-hidden="true">←</span>
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/mulai"
              className="w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#0c1a2c] bg-gradient-to-r from-[#ffd261] to-[#D4A373] hover:brightness-110 shadow-lg shadow-[#ffd261]/20 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
            >
              <PenTool aria-hidden="true" className="w-4 h-4 text-[#0c1a2c]" />
              <span>Mulai Belajar Aksara</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-white/75 flex flex-wrap items-center justify-center gap-3">
            <Link href="/aksara-bali" className="min-h-11 inline-flex items-center px-2 hover:text-[#ffd261] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261] rounded">
              Katalog Aksara Bali
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/cerita" className="min-h-11 inline-flex items-center px-2 hover:text-[#ffd261] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261] rounded">
              Cerita Rakyat
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/tentang" className="min-h-11 inline-flex items-center px-2 hover:text-[#ffd261] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261] rounded">
              Tentang Aksantara
            </Link>
          </div>
        </OrnateFrame>
      </div>
    </main>
  );
}
