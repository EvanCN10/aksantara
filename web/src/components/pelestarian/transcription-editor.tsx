'use client';

import React, { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, AlertCircle } from 'lucide-react';
import type { ManuskripItem } from '@/data/pelestarian/manuskrip-data';
import { submitTransliteration } from '@/lib/actions/pelestarian-actions';
import type { TransliterationSubmissionResult } from '@/types/pelestarian';
import { playSuccessGamelan } from '@/lib/audio/sound-effects';

interface TranscriptionEditorProps {
  manuskrip: ManuskripItem;
  isAuthenticated: boolean;
  draftText: string;
  onDraftChange: (text: string) => void;
  onSubmissionSuccess: () => void;
}

export function TranscriptionEditor({
  manuskrip,
  isAuthenticated,
  draftText,
  onDraftChange,
  onSubmissionSuccess,
}: TranscriptionEditorProps) {
  const [submissionId, setSubmissionId] = useState<string>(() => crypto.randomUUID());

  const [state, formAction, isPending] = useActionState(
    async (_prevState: TransliterationSubmissionResult | null, formData: FormData): Promise<TransliterationSubmissionResult> => {
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

  return (
    <div className="w-full rounded-3xl bg-[#141e2e]/90 border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* 1. Editor Guidelines Header */}
      <div className="mb-4">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#ffd261]/80 block mb-1">
          Transliterasi Mandiri Siswa
        </span>
        <h3
          className="text-base sm:text-lg font-bold text-white tracking-wide"
          style={{ fontFamily: 'var(--font-philosopher)' }}
        >
          {manuskrip.judul}
        </h3>
        <p className="text-xs text-white/60 leading-relaxed mt-1">
          Baca karakter aksara {manuskrip.aksaraNama} pada foto naskah di samping, lalu tuliskan alih aksara Latin sesuai pembacaanmu. Usulan akan ditinjau langsung oleh guru atau ahli filologi.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
          <span>Masuk ke akun Anda untuk mengirimkan usulan transliterasi ke kurator.</span>
          <Link
            href="/auth?redirect=/pelestarian"
            className="text-[#ffd261] underline font-bold whitespace-nowrap hover:text-white transition-colors"
          >
            Masuk Akun →
          </Link>
        </div>
      )}

      {/* 2. Manual Transliteration Form */}
      <form action={formAction} className="flex flex-col gap-3.5">
        <label htmlFor="proposedTranscription" className="text-xs font-bold text-white tracking-wide">
          Usulan Transliterasi Latin:
        </label>

        <textarea
          id="proposedTranscription"
          name="proposedTranscription"
          value={draftText}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={4}
          disabled={isPending}
          className="w-full rounded-2xl bg-black/50 border border-white/15 p-3.5 text-xs sm:text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-[#ffd261] focus:ring-1 focus:ring-[#ffd261] transition-colors resize-none disabled:opacity-50"
          placeholder="Tuliskan pembacaan transliterasi Latin yang tepat di sini..."
        />

        {/* Success Confirmation Toast */}
        {state && state.success && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3.5 flex items-center justify-between text-xs text-emerald-300 animate-emerge-up">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Usulan transliterasi berhasil dikirim dan masuk ke antrean peninjau!</span>
            </span>
            <Link
              href="/pelestarian/status"
              className="text-[11px] font-bold underline hover:text-white ml-2 shrink-0"
            >
              Lihat Status →
            </Link>
          </div>
        )}

        {/* Error Notice */}
        {state && !state.success && (
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-200 flex items-center gap-2 animate-emerge-up">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || draftText.trim().length === 0 || !isAuthenticated}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(255,210,97,0.3)] hover:opacity-95 transition-all cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isPending ? 'Mengirimkan ke Basis Data...' : 'Kirim Usulan Transliterasi'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TranscriptionEditor;
