'use client';

import React from 'react';
import Link from 'next/link';
import { Scroll, PenTool } from 'lucide-react';
import { OrnateFrame } from '@/components/ui/ornate-frame';

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-[#060d16] text-[#F6F2E9] flex flex-col items-center justify-center p-4 selection:bg-[#ffd261] selection:text-[#0c1a2c] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,115,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <OrnateFrame className="bg-[#0c1a2c]/90 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-[#ffd261]/30 shadow-2xl text-center space-y-6">
          {/* Cultural Icon */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#ffd261]/20 to-[#D4A373]/10 border-2 border-[#ffd261]/60 flex items-center justify-center shadow-inner">
            <Scroll className="w-10 h-10 text-[#ffd261]" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ffd261]/15 text-[#ffd261] border border-[#ffd261]/30">
              Galat 404 • Halaman Tak Ditemukan
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide pt-1">
              Aksara Hilang di Lembah Waktu
            </h1>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
              Lembaran lontar atau prasasti digital yang Anda cari tidak tercatat dalam arsip sejarah Aksantara.
            </p>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>←</span>
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/mulai"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#0c1a2c] bg-gradient-to-r from-[#ffd261] to-[#D4A373] hover:brightness-110 shadow-lg shadow-[#ffd261]/20 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PenTool className="w-4 h-4 text-[#0c1a2c]" />
              <span>Mulai Belajar Aksara</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-center gap-4">
            <Link href="/trinitas" className="hover:text-[#ffd261] transition">
              Katalog Trinitas
            </Link>
            <span>•</span>
            <Link href="/cerita" className="hover:text-[#ffd261] transition">
              Cerita Rakyat
            </Link>
            <span>•</span>
            <Link href="/guru/dashboard" className="hover:text-[#ffd261] transition">
              Portal Pengampu
            </Link>
          </div>
        </OrnateFrame>
      </div>
    </main>
  );
}
