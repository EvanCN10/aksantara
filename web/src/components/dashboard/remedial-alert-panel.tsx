'use client';

import React from 'react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { SiswaRosterItem, AktivitasKelasItem } from '@/data/guru/guru-data';

interface RemedialAlertPanelProps {
  siswaRemediList: SiswaRosterItem[];
  aktivitasList: AktivitasKelasItem[];
  onKirimLatihan: (siswaNama: string, glifInfo: string) => void;
}

export const RemedialAlertPanel: React.FC<RemedialAlertPanelProps> = ({
  siswaRemediList,
  aktivitasList,
  onKirimLatihan,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kolom Kiri: AI Early Warning & Intervensi Guru */}
      <OrnateFrame className="bg-[#0c1a2c]/80 backdrop-blur-md p-6 rounded-2xl border border-red-500/20 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-base">
                ⚠️
              </span>
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Peringatan Dini AI: Intervensi Siswa
                </h3>
                <p className="text-xs text-white/60">
                  Siswa dengan deviasi akurasi di bawah ambang batas 75%
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              {siswaRemediList.length} Perlu Bimbingan
            </span>
          </div>

          <div className="space-y-3">
            {siswaRemediList.map((siswa) => (
              <div
                key={siswa.id}
                className="bg-[#060d16]/90 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-400/60 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
                    {siswa.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{siswa.nama}</h4>
                      <span className="text-[11px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                        {siswa.akurasiMenulis}%
                      </span>
                    </div>
                    <p className="text-xs text-white/50">{siswa.gelarBudaya}</p>
                    {siswa.glifKendala && (
                      <p className="text-xs text-amber-300/90 mt-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <span className="font-semibold text-amber-300">Kendala:</span> {siswa.glifKendala.glif} ({siswa.glifKendala.aksara}) — {siswa.glifKendala.catatan}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    onKirimLatihan(
                      siswa.nama,
                      siswa.glifKendala ? `${siswa.glifKendala.glif} (${siswa.glifKendala.aksara})` : 'Glif Dasar'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 transition shrink-0 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>✉️</span>
                  <span>Kirim Latihan Terarah</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/50 flex items-center justify-between">
          <span>Sistem NusaAksara otomatis menyarankan modul remedial Sulapa Eppa & Wianjana.</span>
        </div>
      </OrnateFrame>

      {/* Kolom Kanan: Aliran Aktivitas Terkini Kelas */}
      <OrnateFrame className="bg-[#0c1a2c]/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#ffd261]/20 text-[#ffd261] border border-[#ffd261]/30 text-base">
                ⚡
              </span>
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Aliran Aktivitas Terkini Kelas
                </h3>
                <p className="text-xs text-white/60">
                  Linimasa interaksi siswa melintasi seluruh 4 Pilar
                </p>
              </div>
            </div>
            <span className="text-xs text-white/40 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          <div className="space-y-3">
            {aktivitasList.map((item) => (
              <div
                key={item.id}
                className="bg-[#060d16]/70 border border-white/10 rounded-xl p-3.5 flex items-start gap-3 hover:border-white/20 transition"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{item.siswaNama}</h4>
                    <span className="text-[10px] text-white/40 shrink-0 font-mono">{item.waktu}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#ffd261] mt-0.5">{item.kegiatan}</p>
                  <p className="text-[11px] text-white/60 truncate mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/50 flex items-center justify-between">
          <span>Menampilkan 4 pencapaian terbaru siswa kelas binaan.</span>
        </div>
      </OrnateFrame>
    </div>
  );
};
