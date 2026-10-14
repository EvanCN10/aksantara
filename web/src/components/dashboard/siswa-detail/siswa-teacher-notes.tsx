'use client';

import React, { useState } from 'react';
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
    'Tingkatkan kelenturan garis belah ketupat Sulapa Eppa pada latihan kanvas.',
    'Pertahankan konsistensi ritme goresan; proporsi wianjana sangat harmonis.',
    'Sempurnakan vokalisasi sandhangan Panghulu dan Pamepet pada naskah Sunda.',
    'Apresiasi tinggi atas ketelitian kontribusi preservasi naskah kuno rontal.',
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
            Bimbingan Pedagogis Budaya
          </span>
          <h3 className="text-lg font-serif font-bold text-white mt-0.5">
            Catatan & Rekomendasi Evaluasi Pengampu
          </h3>
        </div>
        <span className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10 self-start sm:self-auto">
          Tersinkronisasi ke Profil Siswa
        </span>
      </div>

      {/* Preset Chips */}
      <div>
        <span className="text-xs text-white/60 block mb-2 font-medium">
          Rekomendasi Cepat (Klik untuk menyisipkan):
        </span>
        <div className="flex flex-wrap gap-2">
          {presetTemplates.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-[#ffd261]/40 transition text-left"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Tuliskan catatan evaluasi dan bimbingan untuk ${siswaNama}...`}
          className="w-full bg-[#060d16] border border-white/20 rounded-xl p-4 text-xs md:text-sm text-white focus:outline-none focus:border-[#ffd261] leading-relaxed transition"
        />
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-[11px] text-white/50">
          Catatan ini akan langsung terlihat oleh siswa pada kartu portofolio kebudayaan (/profil).
        </p>

        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold text-[#0c1a2c] bg-gradient-to-r from-[#ffd261] to-[#D4A373] hover:brightness-110 shadow-lg shadow-[#ffd261]/20 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>💾</span>
          <span>Simpan Evaluasi Guru</span>
        </button>
      </div>
    </OrnateFrame>
  );
};
