'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { OrnateFrame } from '@/components/ui/ornate-frame';

interface SiswaTeacherNotesProps {
  initialNotes: string;
  siswaNama: string;
  onSaveNotes: (notes: string) => void;
}

export const SiswaTeacherNotes: React.FC<SiswaTeacherNotesProps> = ({
  initialNotes,
  siswaNama,
  onSaveNotes,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  const presetTemplates = [
    'Latih kembali lengkungan ekor bawah aksara Nga (ᬗ) agar proporsinya seimbang.',
    'Pertahankan konsistensi bentuk siluet wianjana; keterbacaan karakter sangat baik.',
    'Perhatikan pembeda mahkota atas antara aksara Sa Saga (ᬰ) dan Sa Danti (ᬲ).',
    'Apresiasi tinggi atas ketelitian kontribusi transliterasi manual naskah lontar.',
  ];

  const handleAddPreset = (preset: string) => {
    setNotes((prev) => (prev ? `${prev}\n• ${preset}` : `• ${preset}`));
  };

  const handleSave = () => {
    onSaveNotes(notes);
  };

  return (
    <OrnateFrame className="bg-[#0c1a2c]/85 backdrop-blur-md p-6 rounded-2xl border border-[#ffd261]/30 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#ffd261] font-semibold">
            Bimbingan Pedagogis Aksara Bali
          </span>
          <h2 className="text-lg font-serif font-bold text-white mt-0.5">
            Catatan &amp; Rekomendasi Evaluasi Pengampu
          </h2>
        </div>
        <span className="text-xs text-amber-200 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/25 self-start sm:self-auto">
          Simulasi Catatan Sesi Ini
        </span>
      </div>

      {/* Preset Chips */}
      <div className="print:hidden">
        <span className="text-xs text-white/75 block mb-2 font-medium">
          Rekomendasi Cepat (Klik untuk menyisipkan):
        </span>
        <div className="flex flex-wrap gap-2">
          {presetTemplates.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="min-h-11 text-xs px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/85 border border-white/15 hover:border-[#ffd261]/40 transition text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261]"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area with Explicit Label */}
      <div>
        <label
          htmlFor="guru-evaluasi-notes"
          className="block text-xs font-semibold text-white/85 mb-2"
        >
          Catatan Evaluasi untuk {siswaNama}
        </label>
        <textarea
          id="guru-evaluasi-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Tuliskan catatan evaluasi dan bimbingan untuk ${siswaNama}...`}
          className="w-full bg-[#060d16] border border-white/25 rounded-xl p-4 text-xs md:text-sm text-white placeholder:text-white/55 focus-visible:outline-2 focus-visible:outline-[#ffd261] focus:border-[#ffd261] leading-relaxed transition"
        />
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
        <p className="text-xs text-white/70">
          Simulasi penyimpanan catatan bimbingan guru selama sesi peramban berlangsung.
        </p>

        <button
          type="button"
          onClick={handleSave}
          className="min-h-11 w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold text-[#0c1a2c] bg-gradient-to-r from-[#ffd261] to-[#D4A373] hover:brightness-110 shadow-lg shadow-[#ffd261]/20 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          <span>Simpan Catatan Simulasi</span>
        </button>
      </div>
    </OrnateFrame>
  );
};
