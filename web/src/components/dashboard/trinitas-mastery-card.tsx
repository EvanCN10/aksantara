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
      id: 'lontara',
      nama: 'Lontara Bugis (Sulapa Eppa)',
      persen: 86.4,
      totalSiswa: 32,
      warna: 'from-amber-500 to-yellow-600',
      aksen: 'text-amber-400',
      simbol: 'ᨒᨚᨈᨑ',
    },
    {
      id: 'sunda',
      nama: 'Sunda Parahyangan (Kaganga)',
      persen: 91.8,
      totalSiswa: 34,
      warna: 'from-emerald-500 to-teal-600',
      aksen: 'text-emerald-400',
      simbol: 'ᮞᮥᮔ᮪ᮓ',
    },
    {
      id: 'bali',
      nama: 'Bali Dwipa (Wianjana)',
      persen: 88.5,
      totalSiswa: 31,
      warna: 'from-rose-500 to-red-600',
      aksen: 'text-rose-400',
      simbol: 'ᬩᬮᬶ',
    },
  ];

  return (
    <OrnateFrame className="bg-[#0c1a2c]/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#ffd261] font-semibold">
            Pilar 2: Diagnostik Kohor
          </span>
          <h2 className="text-xl font-serif font-bold text-white mt-0.5">
            Peta Kemahiran Trinitas Aksara Nusantara
          </h2>
        </div>
        <span className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10 self-start sm:self-auto">
          Evaluasi NusaAksara CNN & ViT
        </span>
      </div>

      {/* 3 Bars Kemahiran Aksara with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aksaraMastery.map((aksara, idx) => (
          <div
            key={aksara.id}
            className="bg-[#060d16]/80 rounded-xl p-4 border border-white/10 flex flex-col justify-between relative overflow-hidden animate-cascade-fade-up hover:border-white/20 transition-all duration-300 hover:scale-[1.01]"
            style={{ animationDelay: `${idx * 90}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-white/60 font-medium">{aksara.nama}</p>
                <p className="text-lg font-serif text-white/90 font-bold mt-0.5">{aksara.simbol}</p>
              </div>
              <span className={`text-2xl font-bold font-mono ${aksara.aksen}`}>
                {aksara.persen}%
              </span>
            </div>

            {/* Progress Bar with Ease-Out Animation */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${aksara.warna} transition-all duration-1000 ease-out`}
                style={{ width: `${aksara.persen}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>{aksara.totalSiswa} Siswa Teruji</span>
              <span className="text-emerald-400 font-medium">Target Kohor Tercapai</span>
            </div>
          </div>
        ))}
      </div>

      {/* Glif Kritis / Hotspot Kesalahan Penulisan */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Hotspot Glif Kritis: Area Memerlukan Penguatan Pembelajaran
            </h3>
          </div>
          <span className="text-xs text-white/50">3 Glif Tertinggi Tingkat Deviasi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {glifKritisList.map((item, idx) => (
            <div
              key={item.glif}
              className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 hover:border-amber-400/60 transition-all duration-300 hover:scale-[1.01] group flex flex-col justify-between animate-cascade-fade-up"
              style={{ animationDelay: `${180 + idx * 80}ms` }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl font-serif text-[#ffd261] ${idx === 0 ? 'animate-beacon-alert' : ''}`}>
                      {item.glif}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.namaGlif}</h4>
                      <p className="text-[11px] text-amber-300/80">{item.aksaraNama}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {item.tingkatKesalahan}% Error
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-3">
                  {item.kendalaUmum}
                </p>
              </div>

              <button
                onClick={() => onTugaskanGlif(item.namaGlif)}
                className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Tugaskan Remedi Glif Ini</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </OrnateFrame>
  );
};
