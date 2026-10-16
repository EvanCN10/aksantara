'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Search, GraduationCap, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { DAFTAR_MANUSKRIP } from '@/data/pelestarian/manuskrip-data';
import { ManuscriptViewer } from '@/components/pelestarian/manuscript-viewer';
import { reviewTransliteration } from '@/lib/actions/pelestarian-actions';
import type { KurasiStatusItem, CurationStatus } from '@/types/pelestarian';

interface CurationTableProps {
  items: KurasiStatusItem[];
  canReview: boolean;
  userRole?: string;
}

export function CurationTable({ items, canReview }: CurationTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'semua' | CurationStatus>('semua');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [catatanDrafts, setCatatanDrafts] = useState<Record<string, string>>({});
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const filteredItems = items.filter((item) => {
    if (filter === 'semua') return true;
    return item.status === filter;
  });

  const totalCount = items.length;
  const verifiedCount = items.filter((i) => i.status === 'terverifikasi').length;
  const waitingCount = items.filter((i) => i.status === 'menunggu').length;

  const handleReviewSubmit = (submissionId: string, status: 'terverifikasi' | 'tinjauan') => {
    const catatan = (catatanDrafts[submissionId] || '').trim();
    if (!catatan) {
      setReviewErrors((prev) => ({
        ...prev,
        [submissionId]: 'Catatan peninjau wajib diisi sebelum menyimpan keputusan.',
      }));
      return;
    }

    setReviewErrors((prev) => {
      const copy = { ...prev };
      delete copy[submissionId];
      return copy;
    });

    startTransition(async () => {
      const result = await reviewTransliteration({
        submissionId,
        status,
        catatanFilolog: catatan,
      });

      if (result.success) {
        setActiveReviewId(null);
        router.refresh();
      } else {
        setReviewErrors((prev) => ({
          ...prev,
          [submissionId]: result.error,
        }));
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Preservation Metric Summary Cards (Data Nyata) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-4 sm:p-5 text-center animate-cascade-fade-up">
          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block mb-1">
            {canReview ? 'Total Antrean & Riwayat' : 'Total Usulan Anda'}
          </span>
          <span
            className="text-2xl sm:text-3xl font-bold text-white block"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {totalCount} Usulan
          </span>
          <span className="text-[11px] text-white/50 mt-1 block">
            Tercatat di Basis Data
          </span>
        </div>

        <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-4 sm:p-5 text-center animate-cascade-fade-up [animation-delay:80ms]">
          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block mb-1">
            Telah Disetujui
          </span>
          <span
            className="text-2xl sm:text-3xl font-bold text-emerald-400 block"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {verifiedCount} Usulan
          </span>
          <span className="text-[11px] text-white/50 mt-1 block">
            Divalidasi Kurator / Guru
          </span>
        </div>

        <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-4 sm:p-5 text-center animate-cascade-fade-up [animation-delay:160ms]">
          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block mb-1">
            Menunggu Tinjauan
          </span>
          <span
            className="text-2xl sm:text-3xl font-bold text-[#ffd261] block"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            {waitingCount} Usulan
          </span>
          <span className="text-[11px] text-white/50 mt-1 block">
            Dalam Antrean Verifikasi
          </span>
        </div>
      </div>

      {/* 2. Filter Status Switch */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto scrollbar-none self-start">
        {[
          { id: 'semua', label: `Semua (${items.length})` },
          { id: 'terverifikasi', label: `Terverifikasi (${verifiedCount})`, icon: CheckCircle2 },
          { id: 'menunggu', label: `Menunggu (${waitingCount})`, icon: Clock },
          { id: 'tinjauan', label: `Perlu Tinjauan (${items.filter((i) => i.status === 'tinjauan').length})`, icon: Search },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-[#ffd261] text-[#0c1a2c] font-bold shadow-[0_0_12px_rgba(255,210,97,0.35)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Curation Submission Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141e2e]/50 border border-white/10 text-center text-xs text-white/50">
          Belum ada rekaman usulan transliterasi untuk kategori status ini.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filteredItems.map((item: KurasiStatusItem, idx: number) => {
            const isReviewOpen = activeReviewId === item.id;
            const matchingManuscript = DAFTAR_MANUSKRIP.find(
              (m) => m.kodeArsip === item.kodeArsip || m.judul === item.judulNaskah
            );

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-[#141e2e]/85 border border-white/10 p-5 hover:border-white/25 transition-all shadow-lg flex flex-col gap-3 animate-cascade-fade-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Top Bar: Archive Code & Status Stamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white tracking-wide">
                      {item.kodeArsip}
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-xs text-white/80 font-medium">
                      {item.judulNaskah}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-mono px-3 py-0.5 rounded-full border self-start sm:self-auto inline-flex items-center gap-1.5 ${
                      item.status === 'terverifikasi'
                        ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                        : item.status === 'menunggu'
                        ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                        : 'text-sky-300 bg-sky-500/15 border-sky-500/30'
                    }`}
                  >
                    {item.status === 'terverifikasi' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terverifikasi Kurator</span>
                      </>
                    ) : item.status === 'menunggu' ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Menunggu Validasi</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Perlu Perbaikan</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Middle: Contributor & Suggested Transcription */}
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-white/50 mb-1">
                    <span>
                      Pengusul: <strong className="text-white/80">{item.pengusulNama}</strong>
                    </span>
                    <span>•</span>
                    <span>Diajukan: {item.submittedAt}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 font-mono bg-black/40 p-3 rounded-xl border border-white/5 leading-relaxed">
                    &quot;{item.proposedTranscription}&quot;
                  </p>
                </div>

                {/* Existing Philologist Notes if reviewed */}
                {item.catatanFilolog && (
                  <div className="pt-2 text-xs text-white/70 flex items-start gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <GraduationCap className="w-4 h-4 text-[#ffd261] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#ffd261] block mb-0.5">
                          Catatan Kurator ({item.reviewerNama || 'Ahli Filologi'}):
                        </span>
                        {item.reviewedAt && (
                          <span className="text-[10px] text-white/40 font-mono">
                            {item.reviewedAt}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/75 leading-relaxed italic">
                        {item.catatanFilolog}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reviewer Action Expandable Panel */}
                {item.canReview && (
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#ffd261] font-semibold">
                        Akses Peninjau: Anda berwenang mereview usulan ini
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveReviewId(isReviewOpen ? null : item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-[#ffd261]/15 hover:bg-[#ffd261]/25 text-[#ffd261] border border-[#ffd261]/30 transition-all cursor-pointer"
                      >
                        <span>{isReviewOpen ? 'Tutup Panel Review' : 'Tinjau Usulan'}</span>
                        {isReviewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isReviewOpen && (
                      <div className="mt-4 p-4 rounded-2xl bg-black/50 border border-[#ffd261]/25 flex flex-col gap-4 animate-emerge-up">
                        {/* Reference Manuscript Image Preview */}
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-2">
                            Citra Naskah Rujukan ({item.kodeArsip}):
                          </span>
                          {matchingManuscript?.imageUrl ? (
                            <ManuscriptViewer manuskrip={matchingManuscript} />
                          ) : (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/50">
                              Gambar naskah tidak tersedia dalam katalog aktif; peninjau tidak dapat memutuskan tanpa memeriksa foto naskah.
                            </div>
                          )}
                        </div>

                        {/* Reviewer Notes Form */}
                        <div className="space-y-2">
                          <label
                            htmlFor={`catatan-${item.id}`}
                            className="text-xs font-semibold text-white/90 block"
                          >
                            Catatan Kurator / Alasan Evaluasi (Wajib):
                          </label>
                          <textarea
                            id={`catatan-${item.id}`}
                            rows={3}
                            disabled={isPending || !matchingManuscript?.imageUrl}
                            value={catatanDrafts[item.id] || ''}
                            onChange={(e) =>
                              setCatatanDrafts((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Tuliskan evaluasi ketepatan pembacaan karakter, kesesuaian leksikon, atau saran koreksi..."
                            className="w-full rounded-xl bg-[#0c1a2c] border border-white/20 p-3 text-xs text-white font-mono focus:outline-none focus:border-[#ffd261] focus:ring-1 focus:ring-[#ffd261] transition-all resize-none disabled:opacity-50"
                          />
                        </div>

                        {/* Error Message if any */}
                        {reviewErrors[item.id] && (
                          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{reviewErrors[item.id]}</span>
                          </div>
                        )}

                        {/* Decision Buttons */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            disabled={isPending || !matchingManuscript?.imageUrl}
                            onClick={() => handleReviewSubmit(item.id, 'terverifikasi')}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isPending ? 'Menyimpan...' : '✓ Setujui (Terverifikasi)'}
                          </button>
                          <button
                            type="button"
                            disabled={isPending || !matchingManuscript?.imageUrl}
                            onClick={() => handleReviewSubmit(item.id, 'tinjauan')}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isPending ? 'Menyimpan...' : '⚠ Perlu Perbaikan'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CurationTable;
