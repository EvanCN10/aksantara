'use client';

import React from 'react';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { SiswaRosterItem, AktivitasKelasItem } from '@/data/guru/guru-data';
import { AlertTriangle, Mail, Zap } from 'lucide-react';

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
      {/* Kolom Kiri: Indikator Bimbingan & Intervensi Guru */}
      <OrnateFrame className="bg-[#0c1a2c]/85 backdrop-blur-md p-6 rounded-2xl border border-red-500/25 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-base">
                <AlertTriangle className="w-5 h-5 text-red-300" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-serif font-bold text-white">
                  Indikator Bimbingan Klasifikasi (Contoh Data)
                </h2>
                <p className="text-xs text-white/75">
                  Siswa contoh dengan rata-rata probabilitas klasifikasi di bawah 75%
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-red-300 bg-red-500/15 px-2.5 py-1 rounded-full border border-red-500/30">
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
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-sm font-bold text-red-200 shrink-0">
                    {siswa.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{siswa.nama}</h3>
                      <span className="text-xs font-mono font-bold text-red-300 bg-red-500/15 px-1.5 py-0.5 rounded">
                        {siswa.akurasiMenulis}%
                      </span>
                    </div>
                    <p className="text-xs text-white/70">{siswa.gelarBudaya}</p>
                    {siswa.glifKendala && (
                      <p className="text-xs text-amber-200 mt-1.5 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/25">
                        <span className="font-semibold text-[#ffd261]">Kendala:</span>{' '}
                        <span lang="ban">{siswa.glifKendala.glif}</span> ({siswa.glifKendala.aksara}) — {siswa.glifKendala.catatan}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onKirimLatihan(
                      siswa.nama,
                      siswa.glifKendala ? `${siswa.glifKendala.glif} (${siswa.glifKendala.aksara})` : 'Glif Dasar'
                    )
                  }
                  className="min-h-11 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600/35 hover:bg-red-600/55 border border-red-400/45 transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261]"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>Kirim Latihan Terarah</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/70 flex items-center justify-between">
          <span>Ilustrasi rekomendasi penguatan karakter Wianjana &amp; Swalalita Aksara Bali.</span>
        </div>
      </OrnateFrame>

      {/* Kolom Kanan: Aliran Aktivitas Contoh Kelas */}
      <OrnateFrame className="bg-[#0c1a2c]/85 backdrop-blur-md p-6 rounded-2xl border border-white/15 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#ffd261]/20 text-[#ffd261] border border-[#ffd261]/30 text-base">
                <Zap className="w-5 h-5 text-[#ffd261]" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-serif font-bold text-white">
                  Linimasa Aktivitas Kelas (Contoh Data)
                </h2>
                <p className="text-xs text-white/75">
                  Ilustrasi interaksi siswa pada kanvas AI, cerita lontar, dan preservasi
                </p>
              </div>
            </div>
            <span className="text-xs text-amber-200 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-400/25 font-medium">
              Contoh Linimasa
            </span>
          </div>

          <div className="space-y-3">
            {aktivitasList.map((item) => (
              <div
                key={item.id}
                className="bg-[#060d16]/75 border border-white/10 rounded-xl p-3.5 flex items-start gap-3 hover:border-white/20 transition"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-xs font-bold text-[#ffd261] shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-white truncate">{item.siswaNama}</h3>
                    <span className="text-[11px] text-white/70 shrink-0 font-mono">{item.waktu}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#ffd261] mt-0.5">{item.kegiatan}</p>
                  <p className="text-xs text-white/75 mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/70 flex items-center justify-between">
          <span>Menampilkan {aktivitasList.length} aktivitas contoh kohor kelas binaan.</span>
        </div>
      </OrnateFrame>
    </div>
  );
};
