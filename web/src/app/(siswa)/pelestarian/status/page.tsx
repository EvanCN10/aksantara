import React from 'react';
import Link from 'next/link';
import { CurationTable } from '@/components/pelestarian/curation-table';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { createClient } from '@/lib/supabase/server';
import type { KurasiStatusItem } from '@/types/pelestarian';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

export default async function PelestarianStatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = 'tamu';
  let isReviewer = false;
  let items: KurasiStatusItem[] = [];
  let queryErrorNotice: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama, role')
      .eq('id', user.id)
      .single();

    userRole = profile?.role || 'siswa';
    isReviewer = ['guru', 'filolog', 'admin'].includes(userRole);

    const { data: submissions, error: queryError } = await supabase
      .from('manuscript_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (queryError) {
      queryErrorNotice = `Gagal memuat usulan transliterasi: ${queryError.message}`;
    } else if (submissions) {
      const allUuids = Array.from(
        new Set([
          ...submissions.map((s) => s.user_id as string),
          ...submissions.map((s) => s.verified_by as string).filter(Boolean),
        ])
      );

      const { data: profiles } =
        allUuids.length > 0
          ? await supabase.from('profiles').select('id, nama').in('id', allUuids)
          : { data: [] };

      const profileMap: Record<string, string> = {};
      for (const p of profiles || []) {
        if (p.id) profileMap[p.id] = p.nama as string;
      }

      items = submissions.map((row) => ({
        id: row.id,
        kodeArsip: row.kode_arsip,
        judulNaskah: row.judul_naskah,
        aksaraId: row.aksara_id,
        pengusulNama:
          profileMap[row.user_id] ||
          (row.user_id === user.id ? profile?.nama || 'Saya' : 'Siswa'),
        submittedAt: new Date(row.submitted_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        proposedTranscription: row.proposed_transcription,
        status: row.status,
        catatanFilolog: row.catatan_filolog,
        reviewerNama: row.verified_by ? profileMap[row.verified_by] || 'Kurator' : null,
        reviewedAt: row.reviewed_at
          ? new Date(row.reviewed_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : null,
        canReview: isReviewer && row.status === 'menunggu' && row.user_id !== user.id,
      }));
    }
  }

  return (
    <main className="relative min-h-screen bg-[#0c1a2c] text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/3 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.1),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-1/4 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/pelestarian"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Kembali ke Studio Transliterasi</span>
          </Link>

          <span className="text-[11px] font-mono text-[#ffd261] bg-[#ffd261]/10 px-3 py-1 rounded-full border border-[#ffd261]/25">
            {isReviewer ? 'Antrean Kurator / Guru' : 'Papan Status Usulan'}
          </span>
        </div>
      </header>

      {/* 2. Main Curation Content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#ffd261] px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25 inline-block mb-2">
            Verifikasi &amp; Validasi Ahli
          </span>
          <h1
            className="text-2xl sm:text-4xl font-bold text-white tracking-wide mb-2.5"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {isReviewer ? 'Antrean Peninjauan Transliterasi' : 'Status Usulan Transliterasi Anda'}
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            {isReviewer
              ? 'Tinjau usulan pembacaan naskah kuno dari siswa, periksa terhadap foto manuskrip rujukan, dan berikan catatan evaluasi.'
              : 'Daftar usulan pembacaan naskah kuno Anda yang tersimpan di basis data dan menunggu atau telah ditinjau oleh kurator.'}
          </p>
        </div>

        {/* Authentication Notice for Guests */}
        {!user ? (
          <div className="p-8 rounded-3xl bg-[#141e2e]/90 border border-white/10 text-center flex flex-col items-center gap-4 max-w-lg mx-auto">
            <span className="text-3xl">📜</span>
            <h2 className="text-lg font-bold text-white">Sesi Akun Diperlukan</h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Masuk ke akun Aksantara Anda untuk melihat riwayat usulan transliterasi pribadi atau mengakses antrean peninjauan bagi guru dan ahli.
            </p>
            <Link
              href="/auth?redirect=/pelestarian/status"
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] text-xs font-bold shadow-lg hover:scale-105 transition-all"
            >
              Masuk ke Akun Anda →
            </Link>
          </div>
        ) : queryErrorNotice ? (
          <div className="p-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 text-center">
            {queryErrorNotice}
          </div>
        ) : (
          /* Curation Table and Real Records */
          <OrnateFrame className="w-full">
            <div className="rounded-3xl bg-[#141e2e]/90 p-5 sm:p-7">
              <CurationTable items={items} canReview={isReviewer} userRole={userRole} />
            </div>
          </OrnateFrame>
        )}
      </div>

      {/* 3. Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-6 text-center text-xs text-white/40">
        Aksantara Epigrafi &amp; Filologi • Peninjauan Kurasi Naskah Kuno • FMIPA UGM 2026
      </footer>
    </main>
  );
}
