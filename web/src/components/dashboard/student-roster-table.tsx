'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { SiswaRosterItem } from '@/data/guru/guru-data';

interface StudentRosterTableProps {
  daftarSiswa: SiswaRosterItem[];
}

export const StudentRosterTable: React.FC<StudentRosterTableProps> = ({
  daftarSiswa,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'remedi' | 'unggul'>('all');

  const filteredList = useMemo(() => {
    return daftarSiswa.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery);

      if (!matchSearch) return false;

      if (filterTab === 'remedi') return s.perluRemedi;
      if (filterTab === 'unggul') return s.akurasiMenulis >= 90;
      return true;
    });
  }, [daftarSiswa, searchQuery, filterTab]);

  return (
    <OrnateFrame className="bg-[#0c1a2c]/85 backdrop-blur-md p-6 rounded-2xl border border-[#ffd261]/30 shadow-2xl space-y-6">
      {/* Table Toolbar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#ffd261] font-semibold">
            Roster Kohor Siswa
          </span>
          <h2 className="text-xl font-serif font-bold text-white mt-0.5">
            Daftar Capaian Siswa Lintas 4 Pilar Aksantara
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            Memantau perkembangan individual, akurasi kanvas, sesi konsol fisik, dan kurasi manuskrip.
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NISN..."
              className="bg-[#060d16] border border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#ffd261] w-full sm:w-56 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#060d16] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTab === 'all'
                  ? 'bg-[#ffd261] text-[#0c1a2c] font-bold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Semua ({daftarSiswa.length})
            </button>
            <button
              onClick={() => setFilterTab('remedi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTab === 'remedi'
                  ? 'bg-red-500 text-white font-bold shadow'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              Perlu Bimbingan ({daftarSiswa.filter((s) => s.perluRemedi).length})
            </button>
            <button
              onClick={() => setFilterTab('unggul')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTab === 'unggul'
                  ? 'bg-emerald-500 text-white font-bold shadow'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              Unggul (&gt;90%)
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-semibold text-white/50 uppercase tracking-wider bg-white/[0.02]">
              <th className="py-3 px-4">Profil Siswa</th>
              <th className="py-3 px-4">Pilar 1: AI Canvas</th>
              <th className="py-3 px-4">Pilar 3: Hardware</th>
              <th className="py-3 px-4">Pilar 3: Epos Cerita</th>
              <th className="py-3 px-4">Pilar 4: Preservasi</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Rapor & Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/50">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="font-medium text-white/70">Tidak ada siswa yang sesuai kriteria pencarian</p>
                  <p className="text-xs text-white/40 mt-1">Coba gunakan kata kunci lain atau ubah filter tab.</p>
                </td>
              </tr>
            ) : (
              filteredList.map((siswa) => (
                <tr
                  key={siswa.id}
                  className="hover:bg-white/[0.03] transition group"
                >
                  {/* Siswa */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                        {siswa.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white group-hover:text-[#ffd261] transition">
                            {siswa.nama}
                          </h4>
                          {siswa.perluRemedi && (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                              Remedi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/50 mt-0.5">
                          NISN: {siswa.nisn} • <span className="text-white/70">{siswa.gelarBudaya}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* AI Canvas */}
                  <td className="py-3.5 px-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-mono font-bold ${
                          siswa.akurasiMenulis >= 90
                            ? 'text-emerald-400'
                            : siswa.akurasiMenulis >= 80
                            ? 'text-[#ffd261]'
                            : 'text-red-400'
                        }`}>
                          {siswa.akurasiMenulis}%
                        </span>
                        <span className="text-[10px] text-white/40">NusaAksara</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            siswa.akurasiMenulis >= 90
                              ? 'bg-emerald-400'
                              : siswa.akurasiMenulis >= 80
                              ? 'bg-[#ffd261]'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${siswa.akurasiMenulis}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Hardware */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-white/90">
                      <span className="text-purple-400">🎛️</span>
                      <span className="font-mono">{siswa.sesiHardware}</span>
                      <span className="text-[10px] text-white/40">Sesi</span>
                    </div>
                  </td>

                  {/* Epos Cerita */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400">★</span>
                      <span className="font-mono text-white/90 font-medium">
                        {siswa.eposBintang}/9
                      </span>
                      <span className="text-[10px] text-white/40">Bab</span>
                    </div>
                  </td>

                  {/* Preservasi */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400">📜</span>
                      <span className="font-mono text-white/90 font-medium">
                        {siswa.usulanPreservasi}
                      </span>
                      <span className="text-[10px] text-white/40">Transliterasi</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border ${
                      siswa.statusAktivitas === 'Aktif Hari Ini'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        siswa.statusAktivitas === 'Aktif Hari Ini' ? 'bg-emerald-400' : 'bg-white/40'
                      }`} />
                      {siswa.statusAktivitas}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/guru/siswa/${siswa.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ffd261] bg-[#ffd261]/10 hover:bg-[#ffd261]/20 border border-[#ffd261]/30 transition hover:scale-105 active:scale-95"
                    >
                      <span>Lihat Rapor</span>
                      <span>→</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 border-t border-white/10 pt-4 gap-2">
        <span>Menampilkan {filteredList.length} dari {daftarSiswa.length} total siswa dalam kohor.</span>
        <span className="text-white/40">Data tersinkronisasi otomatis dari sesi latihan murid</span>
      </div>
    </OrnateFrame>
  );
};
