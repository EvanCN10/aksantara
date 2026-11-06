'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, Scroll } from 'lucide-react';
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
            Roster Kohor Contoh
          </span>
          <h2 id="roster-table-heading" className="text-xl font-serif font-bold text-white mt-0.5">
            Daftar Contoh Capaian Siswa Aksara Bali
          </h2>
          <p className="text-xs text-white/75 mt-0.5">
            Ilustrasi pemantauan probabilitas kanvas AI, bintang cerita Calon Arang, dan transliterasi manuskrip.
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <label htmlFor="roster-search-input" className="sr-only">
              Cari nama siswa atau NISN
            </label>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
              <Search className="w-4 h-4" aria-hidden="true" />
            </span>
            <input
              id="roster-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NISN..."
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="min-h-11 bg-[#060d16] border border-white/25 rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm text-white placeholder:text-white/55 focus-visible:outline-2 focus-visible:outline-[#ffd261] focus:border-[#ffd261] w-full sm:w-56 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-[#060d16] p-1 rounded-xl border border-white/15 self-start sm:self-auto">
            <button
              type="button"
              aria-pressed={filterTab === 'all'}
              onClick={() => setFilterTab('all')}
              className={`min-h-11 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261] ${
                filterTab === 'all'
                  ? 'bg-[#ffd261] text-[#0c1a2c] font-bold shadow'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Semua ({daftarSiswa.length})
            </button>
            <button
              type="button"
              aria-pressed={filterTab === 'remedi'}
              onClick={() => setFilterTab('remedi')}
              className={`min-h-11 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261] ${
                filterTab === 'remedi'
                  ? 'bg-red-500 text-white font-bold shadow'
                  : 'text-red-300 hover:text-red-200'
              }`}
            >
              Perlu Bimbingan ({daftarSiswa.filter((s) => s.perluRemedi).length})
            </button>
            <button
              type="button"
              aria-pressed={filterTab === 'unggul'}
              onClick={() => setFilterTab('unggul')}
              className={`min-h-11 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ffd261] ${
                filterTab === 'unggul'
                  ? 'bg-emerald-500 text-[#060d16] font-bold shadow'
                  : 'text-emerald-300 hover:text-emerald-200'
              }`}
            >
              Unggul (≥90%)
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard-Scrollable Table Container */}
      <div
        tabIndex={0}
        role="region"
        aria-labelledby="roster-table-heading"
        className="overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-[#ffd261]"
      >
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">
            Daftar simulasi capaian siswa kelas Aksara Bali beserta tautan rapor individual
          </caption>
          <thead>
            <tr className="border-b border-white/15 text-xs font-semibold text-white/75 uppercase tracking-wider bg-white/[0.03]">
              <th scope="col" className="py-3 px-4">Profil Siswa</th>
              <th scope="col" className="py-3 px-4">Pilar 1: Kanvas AI</th>
              <th scope="col" className="py-3 px-4">Glif Dikuasai</th>
              <th scope="col" className="py-3 px-4">Pilar 2: Epos Bali</th>
              <th scope="col" className="py-3 px-4">Pilar 3: Preservasi</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4 text-right">Rapor &amp; Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-xs">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/70">
                  <Search className="w-8 h-8 text-white/50 mx-auto mb-2" aria-hidden="true" />
                  <p className="font-medium text-white/85">Tidak ada siswa yang sesuai kriteria pencarian</p>
                  <p className="text-xs text-white/65 mt-1">Coba gunakan kata kunci lain atau ubah filter di atas.</p>
                </td>
              </tr>
            ) : (
              filteredList.map((siswa) => (
                <tr
                  key={siswa.id}
                  className="hover:bg-white/[0.04] transition group"
                >
                  {/* Siswa Row Header */}
                  <th scope="row" className="py-3.5 px-4 font-normal text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center font-bold text-xs text-[#ffd261] shrink-0">
                        {siswa.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-[#ffd261] transition">
                            {siswa.nama}
                          </span>
                          {siswa.perluRemedi && (
                            <span className="text-[11px] font-bold text-red-300 bg-red-500/15 px-1.5 py-0.5 rounded border border-red-500/30">
                              Remedi
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/70 mt-0.5">
                          NISN: {siswa.nisn} • <span className="text-white/85">{siswa.gelarBudaya}</span>
                        </p>
                      </div>
                    </div>
                  </th>

                  {/* AI Canvas */}
                  <td className="py-3.5 px-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-mono font-bold ${
                          siswa.akurasiMenulis >= 90
                            ? 'text-emerald-300'
                            : siswa.akurasiMenulis >= 80
                            ? 'text-[#ffd261]'
                            : 'text-red-300'
                        }`}>
                          {siswa.akurasiMenulis}%
                        </span>
                        <span className="text-[11px] text-white/70">Prob. ONNX</span>
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

                  {/* Glif Dikuasai */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <span className="font-mono text-amber-300 font-bold">{siswa.glifDikuasai}</span>
                      <span className="text-xs text-white/70">/ 30 Glif</span>
                    </div>
                  </td>

                  {/* Epos Cerita */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                      <span className="font-mono text-white font-medium">
                        {siswa.eposBintang}/9
                      </span>
                      <span className="text-xs text-white/70">Bintang</span>
                    </div>
                  </td>

                  {/* Preservasi */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Scroll className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
                      <span className="font-mono text-white font-medium">
                        {siswa.usulanPreservasi}
                      </span>
                      <span className="text-xs text-white/70">Usulan</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                      siswa.statusAktivitas === 'Aktif Hari Ini'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                        : 'bg-white/5 text-white/75 border-white/15'
                    }`}>
                      <span
                        aria-hidden="true"
                        className={`w-1.5 h-1.5 rounded-full ${
                          siswa.statusAktivitas === 'Aktif Hari Ini' ? 'bg-emerald-400' : 'bg-white/50'
                        }`}
                      />
                      {siswa.statusAktivitas}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/guru/siswa/${siswa.id}`}
                      aria-label={`Lihat Rapor ${siswa.nama}`}
                      className="min-h-11 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#ffd261] bg-[#ffd261]/10 hover:bg-[#ffd261]/20 border border-[#ffd261]/35 transition whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#ffd261]"
                    >
                      <span>Lihat Rapor</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/75 border-t border-white/10 pt-4 gap-2">
        <span>Menampilkan {filteredList.length} dari {daftarSiswa.length} total siswa dalam kohor contoh.</span>
        <span className="text-amber-200/85">Contoh data simulasi kelas untuk demonstrasi antarmuka pengampu</span>
      </div>
    </OrnateFrame>
  );
};
