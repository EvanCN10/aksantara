'use client';

import React from 'react';
import type { KarakterCompanion } from '@/data/cerita/karakter';

interface CharacterRosterProps {
  characters: KarakterCompanion[];
  selectedCharacterId: string;
  onSelectCharacter: (id: string) => void;
}

export function CharacterRoster({
  characters,
  selectedCharacterId,
  onSelectCharacter,
}: CharacterRosterProps) {
  const activeChar =
    characters.find((c) => c.id === selectedCharacterId) || characters[0];

  return (
    <section aria-labelledby="companion-roster-title" className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#ffd261]">
            Karakter Pendamping Epos
          </span>
          <span className="text-xs text-white/50">
            (Pilih pemandu untuk berdialog)
          </span>
        </div>
      </div>

      {/* Roster Character Avatars Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {characters.map((char) => {
          const isSelected = char.id === selectedCharacterId;

          return (
            <button
              key={char.id}
              type="button"
              onClick={() => onSelectCharacter(char.id)}
              className={`relative p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.02] border-[#ffd261] shadow-[0_0_20px_rgba(255,210,97,0.22)] ring-1 ring-[#ffd261]'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06] opacity-80 hover:opacity-100'
              }`}
            >
              {/* Avatar Holder (Emoji or Custom Image) */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner relative overflow-hidden border border-white/15"
                style={{ backgroundColor: `${char.warnaAksen}20` }}
              >
                {char.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={char.avatarUrl}
                    alt={char.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="select-none transition-transform duration-200 hover:scale-110">
                    {char.avatar}
                  </span>
                )}
                {isSelected && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#ffd261] ring-2 ring-[#0c1a2c]" />
                )}
              </div>

              {/* Name & Region */}
              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                    isSelected ? 'text-[#ffd261]' : 'text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-philosopher)' }}
                >
                  {char.nama}
                </div>
                <div className="text-[10px] text-white/50 truncate mt-0.5">
                  {char.gelar}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Speech Bubble Display (Duolingo / RPG Visual Novel Style) */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141d2d]/90 via-[#0d1624]/95 to-[#141d2d]/90 border border-white/15 p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Animated Avatar Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20 shrink-0 relative"
            style={{
              backgroundColor: `${activeChar.warnaAksen}25`,
              boxShadow: `0 0 24px ${activeChar.warnaAksen}30`,
            }}
          >
            {activeChar.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeChar.avatarUrl}
                alt={activeChar.nama}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="animate-bounce select-none">{activeChar.avatar}</span>
            )}
          </div>

          <div className="sm:hidden">
            <span
              className="text-sm font-bold text-white block"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {activeChar.nama}
            </span>
            <span className="text-[11px] text-[#ffd261] font-medium">
              {activeChar.wilayah}
            </span>
          </div>
        </div>

        {/* Speech Bubble Text */}
        <div className="flex-1 space-y-1">
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="text-sm font-bold text-white"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              {activeChar.nama}
            </span>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-xs text-[#ffd261] font-medium">
              {activeChar.gelar} ({activeChar.wilayah})
            </span>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed italic bg-white/[0.03] p-3 rounded-xl border border-white/10">
            &ldquo;{activeChar.kutipanTeaser}&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
