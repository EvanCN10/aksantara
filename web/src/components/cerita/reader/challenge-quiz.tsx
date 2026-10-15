'use client';

import React, { useState } from 'react';
import type { OpsiJawaban } from '@/data/cerita/skenario';
import { playSuccessGamelan, playSoftMuted } from '@/lib/audio/sound-effects';

interface ChallengeQuizProps {
  pertanyaan: string;
  opsiJawaban: OpsiJawaban[];
  onCorrectAnswer: () => void;
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="6" />
    </svg>
  );
}

export function ChallengeQuiz({
  pertanyaan,
  opsiJawaban,
  onCorrectAnswer,
}: ChallengeQuizProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Play acoustic gamelan or soft muted feedback
  const playSound = (correct: boolean) => {
    if (correct) {
      playSuccessGamelan();
    } else {
      playSoftMuted();
    }
  };

  const handleSelectOption = (opt: OpsiJawaban) => {
    if (isCorrect) return; // Already passed

    setSelectedId(opt.id);
    setHasAnswered(true);

    if (opt.benar) {
      setIsCorrect(true);
      playSound(true);
      onCorrectAnswer();
    } else {
      setIsCorrect(false);
      playSound(false);
    }
  };

  const selectedOption = opsiJawaban.find((o) => o.id === selectedId);

  return (
    <div className="w-full space-y-4 rounded-2xl bg-[#0c1a2c]/95 border border-[#ffd261]/30 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header Tag */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd261] px-2.5 py-0.5 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/30">
          Tantangan Pemahaman Epos
        </span>
      </div>

      {/* Question */}
      <h3
        className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug"
        style={{ fontFamily: 'var(--font-philosopher)' }}
      >
        {pertanyaan}
      </h3>

      {/* Options List (Tactile Duolingo style 3D buttons) */}
      <div className="space-y-2.5 pt-1">
        {opsiJawaban.map((opt) => {
          const isSelected = selectedId === opt.id;
          let btnStyle =
            'bg-white/[0.04] border-white/15 hover:border-white/30 hover:bg-white/[0.08] text-white/85 hover:scale-[1.005]';

          if (isSelected) {
            if (opt.benar) {
              btnStyle =
                'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400 scale-[1.01]';
            } else {
              btnStyle =
                'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.3)] ring-1 ring-rose-400 animate-shake-error';
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(opt)}
              disabled={isCorrect}
              className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 active:translate-y-0.5 sheen-sweep ${btnStyle}`}
            >
              <span>{opt.teks}</span>
              {isSelected && (
                <span className="shrink-0 animate-emerge-scale">
                  {opt.benar ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-[#0c1a2c] flex items-center justify-center font-bold shadow-[0_0_10px_#10b981]">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold">
                      <XIcon className="w-3.5 h-3.5" />
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Explanation & Feedback */}
      {hasAnswered && selectedOption && (
        <div
          key={`${selectedId}-${isCorrect}`}
          className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all animate-emerge-up ${
            isCorrect
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          }`}
          style={{ animationDuration: '0.3s' }}
        >
          <strong className="block mb-0.5 text-sm">
            {isCorrect ? 'Jawaban Benar! ✦' : 'Kurang Tepat, Coba Lagi!'}
          </strong>
          <p className="font-light">
            {selectedOption.penjelasan ||
              (isCorrect
                ? 'Pilihanmu tepat sesuai filosofi naskah kuno!'
                : 'Pilih opsi yang lain untuk menemukan jawaban yang sesuai.')}
          </p>
        </div>
      )}
    </div>
  );
}
