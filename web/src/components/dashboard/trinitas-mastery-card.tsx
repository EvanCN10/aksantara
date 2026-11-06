'use client';

import React from 'react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { GlifKritisItem } from '@/data/guru/guru-data';
import { AlertTriangle, Target } from 'lucide-react';

interface TrinitasMasteryCardProps {
  glifKritisList: GlifKritisItem[];
  onTugaskanGlif: (glifNama: string) => void;
}

export const TrinitasMasteryCard: React.FC<TrinitasMasteryCardProps> = ({
  glifKritisList,
  onTugaskanGlif,
}) => {
  const aksaraMastery = [
    {
      id: 'wianjana',
      nama: 'Aksara Wianjana Dasar (18 Kelas)',
      persen: 91.2,
      totalSiswa: 32,
      warna: 'from-amber-500 to-yellow-600',
      aksen: 'text-amber-300',
      simbol: 'ᬳᬦᬘ',
    },
    {
      id: 'swalalita',
      nama: 'Aksara Swalalita (12 Kelas)',
      persen: 84.8,
      totalSiswa: 30,
      warna: 'from-orange-500 to-amber-600',
      aksen: 'text-orange-300',
      simbol: 'ᬔᬰᬱ',
    },
    {
      id: 'epos-bali',
      nama: 'Tantangan Epos Calon Arang (3 Bab)',
      persen: 88.0,
      totalSiswa: 31,
      warna: 'from-emerald-500 to-teal-600',
      aksen: 'text-emerald-300',
      simbol: 'ᬩᬮᬶ',
    },
  ];

  return (
    <OrnateFrame className="bg-[#0c1a2c]/85 backdrop-blur-md p-6 rounded-2xl border border-white/15 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#ffd261] font-semibold">
            Ilustrasi Diagnostik Kohor
          </span>
          <h2 className="text-xl font-serif font-bold text-white mt-0.5">
            Peta Kemahiran 30 Kelas Aksara Bali (Contoh Data)
          </h2>
        </div>
        <span className="text-xs text-white/75 bg-white/5 px-3 py-1.5 rounded-full border border-white/15 self-start sm:self-auto">
          Cakupan Model EfficientNet-B0 ONNX (Tanpa Pangangge)
        </span>
      </div>

      {/* 3 Bars Kemahiran Aksara with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aksaraMastery.map((aksara, idx) => (
          <div
            key={aksara.id}
            className="bg-[#060d16]/85 rounded-xl p-4 border border-white/15 flex flex-col justify-between relative overflow-hidden animate-cascade-fade-up hover:border-white/25 transition-all duration-300"
            style={{ animationDelay: `${idx * 90}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-white/75 font-medium">{aksara.nama}</p>
                <p className="text-lg font-serif text-white font-bold mt-0.5" lang="ban">
                  {aksara.simbol}
                </p>
              </div>
              <span className={`text-2xl font-bold font-mono ${aksara.aksen}`}>
                {aksara.persen}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${aksara.warna} transition-all duration-1000 ease-out`}
                style={{ width: `${aksara.persen}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/70">
              <span>{aksara.totalSiswa} Siswa Contoh</span>
              <span className="text-emerald-300 font-medium">Simulasi Kohor</span>
            </div>
          </div>
        ))}
      </div>

      {/* Glif Kritis / Hotspot Kesalahan Penulisan */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Hotspot Glif Kritis: Karakter Sering Tertukar (Contoh Data)
            </h3>
          </div>
          <span className="text-xs text-white/70">3 Glif Prioritas Penguatan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {glifKritisList.map((item, idx) => (
            <div
              key={item.glif}
              className="bg-amber-950/25 border border-amber-500/35 rounded-xl p-4 hover:border-amber-400/60 transition-all duration-300 group flex flex-col justify-between animate-cascade-fade-up"
              style={{ animationDelay: `${180 + idx * 80}ms` }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      lang="ban"
                      className={`w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl font-serif text-[#ffd261] ${idx === 0 ? 'animate-beacon-alert' : ''}`}
                    >
                      {item.glif}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.namaGlif}</h4>
                      <p className="text-xs text-amber-200/90">{item.aksaraNama}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    {item.tingkatKesalahan}% Meleset
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed mb-3">
                  {item.kendalaUmum}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onTugaskanGlif(item.namaGlif)}
                className="min-h-11 w-full text-xs font-semibold py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/35 transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261]"
              >
                <Target className="w-4 h-4" aria-hidden="true" />
                <span>Tugaskan Remedi Glif Ini</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </OrnateFrame>
  );
};
