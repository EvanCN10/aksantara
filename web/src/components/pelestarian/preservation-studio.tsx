'use client';

import React, { useState } from 'react';
import { Scroll } from 'lucide-react';
import { DAFTAR_MANUSKRIP, type ManuskripItem } from '@/data/pelestarian/manuskrip-data';
import { ManuscriptViewer } from '@/components/pelestarian/manuscript-viewer';
import { TranscriptionEditor } from '@/components/pelestarian/transcription-editor';
import { OrnateFrame } from '@/components/ui/ornate-frame';

interface PreservationStudioProps {
  isAuthenticated: boolean;
}

export function PreservationStudio({ isAuthenticated }: PreservationStudioProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const activeManuskrip: ManuskripItem = DAFTAR_MANUSKRIP[selectedIndex] || DAFTAR_MANUSKRIP[0];
  const currentDraft = drafts[activeManuskrip.id] ?? '';

  const handleDraftChange = (text: string) => {
    setDrafts((prev) => ({
      ...prev,
      [activeManuskrip.id]: text,
    }));
  };

  const handleSubmissionSuccess = () => {
    setDrafts((prev) => ({
      ...prev,
      [activeManuskrip.id]: '',
    }));
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      {/* 1. Manuscript Selector Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {DAFTAR_MANUSKRIP.map((ms, idx) => (
          <button
            key={ms.id}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border inline-flex items-center gap-1.5 ${
              selectedIndex === idx
                ? 'bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] border-[#ffd261] shadow-[0_0_16px_rgba(255,210,97,0.3)] font-bold'
                : 'bg-[#141e2e]/90 text-white/70 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>{ms.judul}</span>
          </button>
        ))}
      </div>

      {/* 2. Split Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Authentic Manuscript Visualizer (7 cols) */}
        <div className="lg:col-span-7">
          <OrnateFrame className="w-full">
            <ManuscriptViewer manuskrip={activeManuskrip} />
          </OrnateFrame>
        </div>

        {/* Right Column: Manual Transliteration Editor (5 cols) */}
        <div className="lg:col-span-5">
          <TranscriptionEditor
            manuskrip={activeManuskrip}
            isAuthenticated={isAuthenticated}
            draftText={currentDraft}
            onDraftChange={handleDraftChange}
            onSubmissionSuccess={handleSubmissionSuccess}
          />
        </div>
      </div>
    </div>
  );
}

export default PreservationStudio;
