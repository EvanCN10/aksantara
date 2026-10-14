'use client';

import React, { useState } from 'react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { SiswaDetailData } from '@/data/guru/guru-data';

interface SiswaPillarTabsProps {
  siswa: SiswaDetailData;
}

export const SiswaPillarTabs: React.FC<SiswaPillarTabsProps> = ({ siswa }) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'hardware' | 'cerita' | 'preservasi'>('canvas');

  return (
    <OrnateFrame className="bg-[#0c1a2c]/85 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
      {/* Tab Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'canvas'
              ? 'bg-[#ffd261] text-[#0c1a2c] shadow-lg shadow-[#ffd261]/20 font-bold'
              : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <span>✍️</span>
          <span>Pilar 1: AI Canvas ({siswa.riwayatCanvas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'hardware'
              ? 'bg-[#ffd261] text-[#0c1a2c] shadow-lg shadow-[#ffd261]/20 font-bold'
              : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <span>🎛️</span>
          <span>Pilar 3: Hardware Pad ({siswa.riwayatHardware.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cerita')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'cerita'
              ? 'bg-[#ffd261] text-[#0c1a2c] shadow-lg shadow-[#ffd261]/20 font-bold'
              : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <span>📖</span>
          <span>Pilar 3: Epos Cerita ({siswa.riwayatEpos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preservasi')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'preservasi'
              ? 'bg-[#ffd261] text-[#0c1a2c] shadow-lg shadow-[#ffd261]/20 font-bold'
              : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <span>📜</span>
          <span>Pilar 4: Preservasi ({siswa.riwayatPreservasi.length})</span>
        </button>
      </div>

      {/* Tab 1: AI Writing Canvas */}
      {activeTab === 'canvas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Riwayat Penulisan & Evaluasi Topologi NusaAksara CNN/ViT
            </h3>
            <span className="text-xs text-white/50">3 Parameter Penilaian</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {siswa.riwayatCanvas.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  item.status === 'remedi'
                    ? 'bg-red-950/20 border-red-500/30 hover:border-red-400/60'
                    : 'bg-[#060d16]/70 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Glyph & Name */}
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-serif text-[#ffd261]">
                      {item.glif}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{item.namaKarakter}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'sempurna'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'baik'
                            ? 'bg-[#ffd261]/15 text-[#ffd261] border border-[#ffd261]/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">{item.aksaraNama} • {item.tanggal}</p>
                    </div>
                  </div>

                  {/* 3 Parameter Breakdown */}
                  <div className="grid grid-cols-3 gap-3 w-full md:w-80">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                      <p className="text-[10px] text-white/50 uppercase">Urutan Goresan</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{item.strokeOrderScore}%</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                      <p className="text-[10px] text-white/50 uppercase">Rasio Proporsi</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{item.aspectRatioScore}%</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                      <p className="text-[10px] text-white/50 uppercase">Kelenturan</p>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{item.smoothnessScore}%</p>
                    </div>
                  </div>

                  {/* Overall Accuracy */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-white/50 block">Skor Akurasi</span>
                    <span className={`text-xl font-mono font-bold ${
                      item.skorAkurasi >= 90 ? 'text-emerald-400' : item.skorAkurasi >= 80 ? 'text-[#ffd261]' : 'text-red-400'
                    }`}>
                      {item.skorAkurasi}%
                    </span>
                  </div>
                </div>

                {/* AI Diagnostic Commentary */}
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/70 flex items-start gap-2">
                  <span className="text-[#ffd261] text-sm">🤖</span>
                  <p><span className="font-semibold text-white">Diagnosis AI:</span> {item.catatanAi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Hardware Tactile Pad */}
      {activeTab === 'hardware' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Log Interaksi Konsol Fisik IoT & Rekor Mini-Game
            </h3>
            <span className="text-xs text-purple-300">Web Serial API 115200 Baud</span>
          </div>

          <div className="space-y-3">
            {siswa.riwayatHardware.map((item) => (
              <div
                key={item.id}
                className="bg-[#060d16]/70 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-500/40 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl text-purple-300 shrink-0">
                    🎛️
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.gameNama}</h4>
                    <p className="text-xs text-white/50 mt-0.5">
                      Target: <span className="font-serif font-bold text-[#ffd261] text-sm">{item.targetSukuKata}</span> • {item.tanggal}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {item.kartuDigunakan.map((kartu, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-white/5 border border-white/10 text-white/80"
                        >
                          💳 {kartu}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-white/50 block">Waktu Selesai</span>
                    <span className="text-xs font-mono text-white/90">{item.durasiDetik} Detik</span>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-white/50 block">Skor Sesi</span>
                    <span className="text-base font-mono font-bold text-purple-300">
                      {item.skor} Pts
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Epos Cerita Rakyat */}
      {activeTab === 'cerita' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Progresi 3 Epos Cerita Budaya & Kuis Aksara
            </h3>
            <span className="text-xs text-amber-300">Total 9 Bab Literasi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {siswa.riwayatEpos.map((epos) => (
              <div
                key={epos.id}
                className="bg-[#060d16]/70 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-[#ffd261]/30 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                    <span>{epos.aksara}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      epos.status === 'Tamat' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-300'
                    }`}>
                      {epos.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-white text-base">{epos.eposJudul}</h4>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                    <span>Kemajuan Bab: {epos.babSelesai} / {epos.totalBab}</span>
                    <span className="text-amber-400 font-bold">★ {epos.bintang}/3</span>
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

      {/* Tab 4: Preservasi Manuskrip Kuno */}
      {activeTab === 'preservasi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              Kontribusi Digitalisasi & Transliterasi Naskah Sejarah
            </h3>
            <span className="text-xs text-emerald-400">British Library EAP & PNRI</span>
          </div>

          <div className="space-y-3">
            {siswa.riwayatPreservasi.map((item) => (
              <div
                key={item.id}
                className="bg-[#060d16]/70 border border-white/10 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#ffd261] bg-[#ffd261]/10 px-2 py-0.5 rounded border border-[#ffd261]/20">
                      {item.kodeArsip}
                    </span>
                    <h4 className="font-serif font-bold text-white text-sm mt-1">{item.judulNaskah}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.status === 'terverifikasi' ? 'Terverifikasi Kurator ✓' : 'Menunggu Validasi ⏳'}
                    </span>
                    <span className="text-xs text-[#ffd261] font-mono font-bold">+{item.xpDidapat} XP</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="text-white/80 italic">
                    <span className="text-white/50 not-italic font-semibold">Usulan Transliterasi:</span> &quot;{item.usulanTeks}&quot;
                  </p>
                  <p className="text-emerald-300/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
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
