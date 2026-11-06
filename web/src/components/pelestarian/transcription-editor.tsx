'use client';

import React, { useState, useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, AlertCircle } from 'lucide-react';
import type { ManuskripItem } from '@/data/pelestarian/manuskrip-data';
import { submitTransliteration } from '@/lib/actions/pelestarian-actions';
import type { TransliterationSubmissionResult, KurasiStatusItem } from '@/types/pelestarian';
import { playSuccessGamelan } from '@/lib/audio/sound-effects';
import { useAuth } from '@/context/auth-context';

interface TranscriptionEditorProps {
  manuskrip: ManuskripItem;
  isAuthenticated: boolean;
  draftText: string;
  onDraftChange: (text: string) => void;
  onSubmissionSuccess: () => void;
}

const GUEST_PELESTARIAN_KEY = 'aksantara_pelestarian_guest';

export function TranscriptionEditor({
  manuskrip,
  isAuthenticated,
  draftText,
  onDraftChange,
  onSubmissionSuccess,
}: TranscriptionEditorProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [submissionId, setSubmissionId] = useState<string>(() => crypto.randomUUID());
  const [guestFeedback, setGuestFeedback] = useState<{ success: boolean; error?: string } | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (
      _prevState: TransliterationSubmissionResult | null,
      formData: FormData
    ): Promise<TransliterationSubmissionResult> => {
      const text = formData.get('proposedTranscription');
      const result = await submitTransliteration({
        submissionId,
        manuscriptId: manuskrip.id,
        proposedTranscription: text,
      });

      if (result.success) {
        playSuccessGamelan();
        setSubmissionId(crypto.randomUUID());
        onSubmissionSuccess();
      }
      return result;
    },
    null
  );

  const handleSwitchAccount = async () => {
    await logout();
    router.push('/auth?redirect=/pelestarian');
  };

  const handleGuestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = draftText.trim();
    if (trimmed.length < 3) {
      setGuestFeedback({
        success: false,
        error: 'Tuliskan minimal 3 karakter transliterasi Latin sebelum menyimpan.',
      });
      return;
    }

    try {
      const raw = localStorage.getItem(GUEST_PELESTARIAN_KEY);
      const parsed: KurasiStatusItem[] = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];

      const newItem: KurasiStatusItem = {
        id: submissionId,
        kodeArsip: manuskrip.kodeArsip,
        judulNaskah: manuskrip.judul,
        aksaraId: manuskrip.aksaraId,
        pengusulNama: user?.nama || 'Siswa (Mode Tamu)',
        submittedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        proposedTranscription: trimmed,
        status: 'menunggu',
        catatanFilolog: null,
        reviewerNama: null,
        reviewedAt: null,
        canReview: false,
      };

      localStorage.setItem(GUEST_PELESTARIAN_KEY, JSON.stringify([newItem, ...list].slice(0, 50)));
      playSuccessGamelan();
      setSubmissionId(crypto.randomUUID());
      setGuestFeedback({ success: true });
      onSubmissionSuccess();
    } catch {
      setGuestFeedback({
        success: false,
        error: 'Gagal menyimpan usulan lokal pada peramban ini.',
      });
    }
  };

  const activeSuccess = isAuthenticated ? state?.success : guestFeedback?.success;
  const activeError = isAuthenticated
    ? state && !state.success
      ? state.error
      : null
    : guestFeedback && !guestFeedback.success
    ? guestFeedback.error
    : null;

  return (
    <div className="w-full rounded-3xl bg-[#141e2e]/90 border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* 1. Editor Guidelines Header */}
      <div className="mb-4">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#ffd261] block mb-1">
          Transliterasi Manual Siswa
        </span>
        <h2
          className="text-base sm:text-lg font-bold text-white tracking-wide"
          style={{ fontFamily: 'var(--font-philosopher)' }}
        >
          {manuskrip.judul}
        </h2>
        <p className="text-xs text-white/75 leading-relaxed mt-1">
          Baca karakter {manuskrip.aksaraNama} pada foto naskah di samping, lalu tuliskan alih aksara Latin sesuai pembacaanmu (tanpa OCR otomatis).
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="leading-relaxed">
            <strong className="text-[#ffd261]">Mode Simulasi Tamu:</strong> Usulan disimpan lokal di perangkat ini. Masuk akun terdaftar untuk mengirim ke kurasi publik.
          </span>
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="min-h-11 px-3 py-2 rounded-lg bg-[#ffd261]/15 hover:bg-[#ffd261]/25 border border-[#ffd261]/35 text-[#ffd261] font-bold whitespace-nowrap transition-colors cursor-pointer self-start sm:self-auto"
          >
            Masuk Akun Terdaftar →
          </button>
        </div>
      )}

      {/* 2. Manual Transliteration Form */}
      <form
        action={isAuthenticated ? formAction : undefined}
        onSubmit={isAuthenticated ? undefined : handleGuestSubmit}
        className="flex flex-col gap-3.5"
      >
        <label htmlFor="proposedTranscription" className="text-xs font-bold text-white tracking-wide">
          Usulan Transliterasi Latin:
        </label>

        <textarea
          id="proposedTranscription"
          name="proposedTranscription"
          value={draftText}
          onChange={(e) => {
            if (guestFeedback) setGuestFeedback(null);
            onDraftChange(e.target.value);
          }}
          rows={4}
          disabled={isPending}
          className="w-full rounded-2xl bg-black/50 border border-white/15 p-3.5 text-xs sm:text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-[#ffd261] focus:ring-1 focus:ring-[#ffd261] transition-colors resize-none disabled:opacity-50"
          placeholder="Contoh: om awighnam astu nama siddham..."
        />

        {/* Feedback Live Region */}
        <div aria-live="polite">
          {activeSuccess && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3.5 flex items-center justify-between gap-2 text-xs text-emerald-200 animate-emerge-up">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>
                  {isAuthenticated
                    ? 'Usulan transliterasi terkirim ke antrean kurator!'
                    : 'Usulan simulasi tamu tersimpan di perangkat ini!'}
                </span>
              </span>
              <Link
                href="/pelestarian/status"
                className="min-h-11 inline-flex items-center px-2 text-xs font-bold text-[#ffd261] underline hover:text-white shrink-0"
              >
                Lihat Status →
              </Link>
            </div>
          )}

          {activeError && (
            <div
              role="alert"
              className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-200 flex items-center gap-2 animate-emerge-up"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
              <span>{activeError}</span>
            </div>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isPending || draftText.trim().length === 0}
            className="w-full min-h-11 py-3 px-5 rounded-xl bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(255,210,97,0.3)] hover:opacity-95 transition-all cursor-pointer text-center disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {isPending
              ? 'Mengirimkan ke Basis Data...'
              : isAuthenticated
              ? 'Kirim Usulan Transliterasi'
              : 'Simpan Usulan (Mode Tamu)'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TranscriptionEditor;
