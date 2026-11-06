'use client';

import React, { useState } from 'react';
import {
  PenTool,
  BookOpen,
  Scroll,
  Bot,
  Star,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { SiswaDetailData } from '@/data/guru/guru-data';

interface SiswaPillarTabsProps {
  siswa: SiswaDetailData;
}

export const SiswaPillarTabs: React.FC<SiswaPillarTabsProps> = ({ siswa }) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'cerita' | 'preservasi'>('canvas');

  return (
    <OrnateFrame className="bg-[#0c1a2c]/85 backdrop-blur-md p-6 rounded-2xl border border-white/15 shadow-xl space-y-6">
      <div className="border-b border-white/10 pb-4 space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#ffd261] font-semibold">
            Rincian Diagnostik Contoh
          </span>
          <h2 className="text-lg font-serif font-bold text-white mt-0.5">
            Riwayat Pembelajaran Lintas Pilar Aksara Bali
          </h2>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={activeTab === 'canvas'}
            onClick={() => setActiveTab('canvas')}
            className={`min-h-11 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261] ${
              activeTab === 'canvas'
                ? 'bg-[#ffd261] text-[#0c1a2c] shadow-lg shadow-[#ffd261]/20 font-bold'
                : 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            <PenTool className="w-4 h-4" aria-hidden="true" />
            <span>Pilar 1: Kanvas AI ({siswa.riwayatCanvas.length})</span>
          </button>

          <button
            type="button"
            aria-pressed={activeTab === 'cerita'}
            onClick={() => setActiveTab('cerita')}
            className={`min-h-11 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261] ${
              activeTab === 'cerita'
                ? 'bg-[#ffd261] text-[#0c1a2c] shadow-lg shadow-[#ffd261]/20 font-bold'
                : 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Pilar 2: Epos Bali ({siswa.riwayatEpos.length})</span>
          </button>

          <button
            type="button"
            aria-pressed={activeTab === 'preservasi'}
            onClick={() => setActiveTab('preservasi')}
            className={`min-h-11 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261] ${
              activeTab === 'preservasi'
                ? 'bg-[#ffd261] text-[#0c1a2c] shadow-lg shadow-[#ffd261]/20 font-bold'
                : 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Scroll className="w-4 h-4" aria-hidden="true" />
            <span>Pilar 3: Preservasi ({siswa.riwayatPreservasi.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Writing Canvas */}
      {activeTab === 'canvas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Riwayat Klasifikasi Bentuk Aksara Bali (EfficientNet-B0 ONNX — Contoh Data)
            </h3>
            <span className="text-xs text-white/70">Tanpa Penalti Urutan Goresan</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {siswa.riwayatCanvas.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  item.status === 'remedi'
                    ? 'bg-red-950/25 border-red-500/35 hover:border-red-400/60'
                    : 'bg-[#060d16]/75 border-white/15 hover:border-white/25'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Glyph & Name */}
                  <div className="flex items-center gap-3">
                    <span
                      lang="ban"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-2xl font-serif text-[#ffd261]"
                    >
                      {item.glif}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{item.namaKarakter}</h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'sempurna'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'baik'
                            ? 'bg-[#ffd261]/15 text-[#ffd261] border border-[#ffd261]/30'
                            : 'bg-red-500/15 text-red-300 border border-red-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/70">{item.aksaraNama} • {item.tanggal}</p>
                    </div>
                  </div>

                  {/* Honest ONNX Top-K Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-96">
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 text-center">
                      <p className="text-[11px] text-white/70 uppercase">Prediksi Top-1</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{item.prediksiTeratas}</p>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 text-center">
                      <p className="text-[11px] text-white/70 uppercase">Kandidat Ke-2</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{item.kandidatKedua}</p>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 text-center">
                      <p className="text-[11px] text-white/70 uppercase">Status Ambang</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{item.ambangKelulusan}</p>
                    </div>
                  </div>

                  {/* Probability */}
                  <div className="text-left md:text-right shrink-0">
                    <span className="text-xs text-white/70 block">Probabilitas Target</span>
                    <span className={`text-xl font-mono font-bold ${
                      item.skorAkurasi >= 90 ? 'text-emerald-300' : item.skorAkurasi >= 80 ? 'text-[#ffd261]' : 'text-red-300'
                    }`}>
                      {item.skorAkurasi}%
                    </span>
                  </div>
                </div>

                {/* Diagnostic Commentary */}
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/80 flex items-start gap-2">
                  <Bot className="w-4 h-4 text-[#ffd261] shrink-0 mt-0.5" aria-hidden="true" />
                  <p>
                    <span className="font-semibold text-white">Catatan Umpan Balik (Simulasi):</span> {item.catatanAi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Epos Cerita Rakyat Bali */}
      {activeTab === 'cerita' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Progresi Story Mode Aksara Bali (Calon Arang)
            </h3>
            <span className="text-xs text-amber-200">Total 3 Bab (Maks. 9 Bintang)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siswa.riwayatEpos.map((epos) => (
              <div
                key={epos.id}
                className="bg-[#060d16]/75 border border-white/15 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-[#ffd261]/30 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-white/75 mb-1">
                    <span>{epos.aksara}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      epos.status === 'Tamat' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'
                    }`}>
                      {epos.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-white text-base">{epos.eposJudul}</h4>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                    <span>Kemajuan Bab: {epos.babSelesai} / {epos.totalBab}</span>
                    <span className="text-amber-300 font-bold inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span>{epos.bintang}/9 Bintang</span>
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffd261] to-[#D4A373] rounded-full transition-all duration-500"
                      style={{ width: `${(epos.babSelesai / epos.totalBab) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Preservasi Manuskrip Kuno */}
      {activeTab === 'preservasi' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Kontribusi Transliterasi Manual Naskah Lontar (Contoh Data)
            </h3>
            <span className="text-xs text-emerald-300">Arsip Lontar Bali</span>
          </div>

          <div className="space-y-3">
            {siswa.riwayatPreservasi.map((item) => (
              <div
                key={item.id}
                className="bg-[#060d16]/75 border border-white/15 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#ffd261] bg-[#ffd261]/10 px-2 py-0.5 rounded border border-[#ffd261]/25">
                      {item.kodeArsip}
                    </span>
                    <h4 className="font-serif font-bold text-white text-sm mt-1">{item.judulNaskah}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 inline-flex items-center gap-1">
                      {item.status === 'terverifikasi' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Terverifikasi Kurator</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Menunggu Validasi</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs text-[#ffd261] font-mono font-bold">+{item.xpDidapat} XP</span>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <p className="text-white/90">
                    <span className="text-white/70 font-semibold">Teks Aksara Bali:</span>{' '}
                    <span lang="ban" className="font-serif text-sm text-[#ffd261]">{item.usulanTeks}</span>
                  </p>
                  <p className="text-white/85">
                    <span className="text-white/70 font-semibold">Transliterasi Latin:</span>{' '}
                    <span className="italic">&quot;{item.transliterasiLatin}&quot;</span>
                  </p>
                  <p className="text-emerald-200 bg-emerald-950/25 p-2.5 rounded-lg border border-emerald-500/25">
                    <span className="font-semibold text-emerald-300">Catatan Filolog:</span> {item.catatanFilolog}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </OrnateFrame>
  );
};
