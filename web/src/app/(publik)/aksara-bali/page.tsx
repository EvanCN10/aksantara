'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles as SparklesIcon,
  BookOpen as BookOpenIcon,
  ScrollText as ScrollTextIcon,
  CheckCircle2 as CheckCircle2Icon,
  HelpCircle as HelpCircleIcon,
  ArrowRight as ArrowRightIcon,
  Layers as LayersIcon,
} from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';

interface GlifPreview {
  simbol: string;
  label: string;
  ipa: string;
  artikulasi: string;
  catatan: string;
}

interface DiakritikInfo {
  nama: string;
  keterangan: string;
  contoh: string;
}

const BALI_DATA = {
  nama: 'Aksara Bali',
  aksaraAsli: 'ᬅᬓ᭄ᬱᬭ ᬩᬮᬶ',
  asalSingkat: 'Bali & Lombok Barat',
  asal: 'Bali dan Lombok, sastra naskah lontar rontal, Kakawin, dan tradisi kidung suci',
  karakterVisual:
    'Kurvalinier mengalir dinamis dengan tingkat kerumitan tinggi. Menggunakan sistem wianjana dasar, swalalita, pangangge vokal/tengenan, serta gantungan dan gempelan (adeg-adeg).',
  glif: [
    { simbol: 'ᬓ', label: 'Ka', ipa: '[ka]', artikulasi: 'Wianjana kanthya', catatan: 'Aksara wianjana pertama dengan lengkungan gelombang ganda harmonis.' },
    { simbol: 'ᬔ', label: 'Kha', ipa: '[kʰa]', artikulasi: 'Kanthya aspirat', catatan: 'Glif bernapas panjang dengan ornamen lingkar di puncak kurva.' },
    { simbol: 'ᬕ', label: 'Ga', ipa: '[ga]', artikulasi: 'Wianjana bersuara', catatan: 'Tarikan kontinu satu nafas melambangkan ketenangan sastra rontal.' },
    { simbol: 'ᬖ', label: 'Gha', ipa: '[ɡʱa]', artikulasi: 'Aspirat bersuara', catatan: 'Karakter swalalita dalam naskah Kawi dan Sansekerta kuno.' },
    { simbol: 'ᬗ', label: 'Nga', ipa: '[ŋa]', artikulasi: 'Anunasika kanthya', catatan: 'Lengkungan bawah fleksibel penanda resonansi rongga hidung.' },
    { simbol: 'ᬘ', label: 'Ca', ipa: '[t͡ʃa]', artikulasi: 'Wianjana talawya', catatan: 'Kurva lembut langit-langit mulut dengan simpul kanan khas.' },
    { simbol: 'ᬚ', label: 'Ja', ipa: '[d͡ʒa]', artikulasi: 'Talawya bersuara', catatan: 'Struktur kurva bertingkat yang memerlukan stabilitas tarikan tangan.' },
    { simbol: 'ᬢ', label: 'Ta', ipa: '[ta]', artikulasi: 'Wianjana dantya', catatan: 'Lekukan gigi dengan kelenturan kurva warisan aksara Brahmi.' },
    { simbol: 'ᬤ', label: 'Da', ipa: '[da]', artikulasi: 'Wianjana bersuara', catatan: 'Konsonan dental bersuara dengan kurva lengkung bawah.' },
    { simbol: 'ᬦ', label: 'Na', ipa: '[na]', artikulasi: 'Anunasika dantya', catatan: 'Nasal dental dengan tarikan melengkung anggun.' },
    { simbol: 'ᬧ', label: 'Pa', ipa: '[pa]', artikulasi: 'Wianjana osthya', catatan: 'Bentuk bilabial terbuka dengan proporsi kurva khas Bali.' },
    { simbol: 'ᬩ', label: 'Ba', ipa: '[ba]', artikulasi: 'Wianjana bersuara', catatan: 'Konsonan bilabial bersuara dengan lengkungan simetris.' },
    { simbol: 'ᬫ', label: 'Ma', ipa: '[ma]', artikulasi: 'Anunasika osthya', catatan: 'Nasal bilabial dengan lengkung dasar yang stabil.' },
    { simbol: 'ᬬ', label: 'Ya', ipa: '[ja]', artikulasi: 'Semivokal talawya', catatan: 'Semivokal palatal dengan gelombang goresan cair.' },
    { simbol: 'ᬭ', label: 'Ra', ipa: '[ra]', artikulasi: 'Liquida murdhanya', catatan: 'Getar lidah dengan ornamen vertikal yang tegas.' },
    { simbol: 'ᬮ', label: 'La', ipa: '[la]', artikulasi: 'Liquida dantya', catatan: 'Lateral dental dengan bukaan kurva lebar.' },
    { simbol: 'ᬯ', label: 'Wa', ipa: '[wa]', artikulasi: 'Semivokal dantosthya', catatan: 'Labiodental dengan kelokan kontinu.' },
    { simbol: 'ᬲ', label: 'Sa', ipa: '[sa]', artikulasi: 'Usma dantya', catatan: 'Desis gigi yang sering digunakan dalam kata umum.' },
    { simbol: 'ᬳ', label: 'Ha', ipa: '[ha]', artikulasi: 'Kanthya murni', catatan: 'Konsonan glotal / pembawa vokal awal dalam penulisan.' },
  ] as GlifPreview[],
  diakritik: [
    {
      nama: 'Pangangge Suara',
      keterangan: 'Tedung, Ulu, Suku, Taling, Taling Tedung',
      contoh: 'Mengubah bunyi vokal aksara induk menjadi /aː/, /i/, /u/, /e/, /o/',
    },
    {
      nama: 'Pangangge Tengenan',
      keterangan: 'Cecek (/ŋ/), Surang (/r/), Bisah (/h/), Adeg-adeg (Paten)',
      contoh: 'Penanda konsonan penutup suku kata dan pembunuh vokal',
    },
    {
      nama: 'Gantungan & Gempelan',
      keterangan: 'Bentuk sub-skrip konsonan tumpuk',
      contoh: 'Ditulis di bawah aksara utama saat merangkai gugus konsonan tanpa spasi',
    },
  ] as DiakritikInfo[],
  tantanganAI:
    'Aksara Bali memiliki kurvalinier dinamis, garis lengkung kontinu, dan variasi tarikan tangan yang kaya.',
  solusiModel:
    'Model AI EfficientNet-B0 mengklasifikasikan bentuk citra 30 kelas karakter (18 wianjana dan 12 swalalita) secara langsung di browser tanpa penalti urutan goresan.',
};

export default function AksaraBaliPage() {
  const [selectedGlifIndex, setSelectedGlifIndex] = useState<number>(0);
  const glifAktif = BALI_DATA.glif[selectedGlifIndex] || BALI_DATA.glif[0];

  return (
    <main className="relative min-h-screen text-[#F6F2E9] overflow-x-hidden selection:bg-[#ffd261]/20 selection:text-[#ffd261]">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-katalog-cerita.webp"
          alt="Latar Aksara Bali"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.75] contrast-[1.05] saturate-[1.10] animate-bg-zoom-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2c] via-[#0c1a2c]/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(12,26,44,0.65)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* =========================================
            1. HERO SECTION
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pt-28 md:pt-36 pb-12 text-center">
          <div
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/90 text-[#D4A373] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          >
            <SparklesIcon className="h-3.5 w-3.5 text-[#ffd261] animate-pulse" />
            Paleografi &amp; Pelestarian Budaya Bali
          </div>

          <h1
            className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-t from-[#ffd261] via-[#FFF2D6] to-[#FFFFFF] bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-philosopher), serif',
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85))',
            }}
          >
            Katalog Paleografi Aksara Bali
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm md:text-base text-[#F6F2E9]/80 leading-relaxed font-light">
            Warisan naskah lontar rontal dengan keindahan kurvalinier mengalir.
            Pelajari anatomi huruf wianjana, tanda pangangge, dan latih tarikan goresan
            dengan umpan balik cerdas berbasis AI.
          </p>
        </section>

        {/* =========================================
            2. ANATOMI AKSARA BALI
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 py-6">
          <div className="rounded-3xl border border-[#D4A373]/25 bg-[rgba(16,24,39,0.85)] p-6 sm:p-10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Sisi Kiri: Profil Aksara */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-serif text-[#ffd261]">
                    {BALI_DATA.aksaraAsli}
                  </span>
                  <div>
                    <h2
                      className="text-2xl sm:text-3xl font-bold text-[#F6F2E9]"
                      style={{ fontFamily: 'var(--font-philosopher), serif' }}
                    >
                      {BALI_DATA.nama}
                    </h2>
                    <p className="text-xs text-[#D4A373] tracking-wide">{BALI_DATA.asalSingkat}</p>
                  </div>
                </div>

                <p className="text-sm text-[#F6F2E9]/80 leading-relaxed font-light">
                  {BALI_DATA.asal}
                </p>

                <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-[#ffd261] uppercase tracking-wider block">
                    Karakter Visual
                  </span>
                  <p className="text-xs text-[#F6F2E9]/75 leading-relaxed">
                    {BALI_DATA.karakterVisual}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-[11px] text-white/50 block">Cakupan Evaluasi AI</span>
                    <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">
                      30 Kelas Terlatih
                    </span>
                    <span className="text-[11px] text-white/60">18 Wianjana + 12 Swalalita</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-[11px] text-white/50 block">Inferensi On-Device</span>
                    <span className="text-sm font-semibold text-[#ffd261] mt-0.5 block">
                      ONNX Runtime Web
                    </span>
                    <span className="text-[11px] text-white/60">Privasi terjaga di browser</span>
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Panel Detail Glif */}
              <div className="w-full lg:w-80 flex-none rounded-2xl border border-[#ffd261]/30 bg-black/40 p-6 flex flex-col items-center text-center">
                <span className="text-[10px] tracking-widest uppercase text-white/50 mb-2">
                  Inspeksi Karakter Terpilih
                </span>
                <div className="h-32 w-32 rounded-2xl bg-gradient-to-b from-[#ffd261]/10 to-transparent border border-[#ffd261]/20 flex items-center justify-center my-2 shadow-[inset_0_0_24px_rgba(255,210,97,0.1)]">
                  <span className="text-7xl font-serif text-[#ffd261] select-none">
                    {glifAktif.simbol}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-2">{glifAktif.label}</h3>
                <span className="text-xs font-mono text-[#ffd261]/90">{glifAktif.ipa}</span>
                <span className="text-[11px] text-white/60 mt-1">{glifAktif.artikulasi}</span>
                <p className="text-xs text-white/70 mt-3 leading-relaxed border-t border-white/10 pt-3">
                  {glifAktif.catatan}
                </p>
                <Link
                  href={`/latihan/web/bali/${glifAktif.label.toLowerCase()}`}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#cf5600] to-[#ea580c] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Latih Huruf Ini</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Grid Glif Wianjana */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#ffd261]">
                  Pilih Aksara Wianjana untuk Inspeksi:
                </span>
                <span className="text-xs text-white/50">{BALI_DATA.glif.length} Karakter</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                {BALI_DATA.glif.map((g, idx) => {
                  const isSelected = idx === selectedGlifIndex;
                  return (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setSelectedGlifIndex(idx)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ffd261] bg-[#ffd261]/20 text-[#ffd261] scale-105 shadow-md'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 text-white/85'
                      }`}
                    >
                      <span className="text-2xl font-serif block leading-none">{g.simbol}</span>
                      <span className="text-[10px] text-white/70 block mt-1">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            3. DIAKRITIK / PANGANGGE
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 py-6">
          <div className="rounded-3xl border border-white/10 bg-[rgba(16,24,39,0.7)] p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <LayersIcon className="w-5 h-5 text-[#ffd261]" />
              <h2
                className="text-xl sm:text-2xl font-bold text-[#F6F2E9]"
                style={{ fontFamily: 'var(--font-philosopher), serif' }}
              >
                Sistem Diakritik: Pangangge Aksara Bali
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BALI_DATA.diakritik.map((d) => (
                <div key={d.nama} className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                  <h3 className="text-sm font-semibold text-[#ffd261]">{d.nama}</h3>
                  <p className="text-xs text-white/80 font-medium">{d.keterangan}</p>
                  <p className="text-[11px] text-white/60 leading-relaxed">{d.contoh}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            4. KAJIAN PEDAGOGIS
            ========================================= */}
        <section className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-2xl border border-[#D4A373]/25 bg-[rgba(20,23,33,0.92)] p-8 sm:p-10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3 mb-5">
              <ScrollTextIcon className="h-5 w-5 text-[#ffd261]" />
              <h2
                className="text-xl sm:text-2xl font-bold text-[#F6F2E9]"
                style={{ fontFamily: 'var(--font-philosopher), serif' }}
              >
                Kajian Pedagogis: Mengapa Bukan Urutan Goresan?
              </h2>
            </div>
            <div className="space-y-4 text-sm text-[#F6F2E9]/75 leading-relaxed">
              <p>
                Berbeda dari Kanji atau Hanzi yang memiliki urutan goresan baku (Bishun), aksara
                Bali ditulis oleh pujangga lontar dan sanggar seni dengan kebebasan gaya tangan masing-masing.
                Kurikulum muatan lokal sekolah lebih menekankan keutuhan bentuk fonetis daripada
                arah penarikan pena.
              </p>
              <p>
                Oleh karena itu, Aksantara menggunakan model Convolutional Neural Network (EfficientNet-B0)
                yang mengevaluasi citra bentuk akhir goresan kanvas, bukan urutan titik waktu (DTW).
                Siswa bebas menarik garis dari atas atau bawah selama bentuk huruf terbaca proporsional.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            5. CALL TO ACTION (CTA)
            ========================================= */}
        <section className="mx-auto max-w-3xl px-6 pt-6 pb-28 text-center">
          <p className="text-sm text-[#F6F2E9]/70 mb-6 font-light">
            Mulai eksplorasi menulis aksara Bali secara interaktif di kanvas digital kami.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ShinyButton
              label="Mulai Latihan Kanvas"
              href="/latihan/web/bali"
              fillColor="rgba(13, 14, 18, 0.75)"
              labelColor="#F6F2E9"
              accentColor="#ffd261"
              accentSoftColor="#ffe8a3"
              cornerRadius={9999}
              className="text-xs sm:text-sm tracking-wide font-medium shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(255,210,97,0.18)] hover:scale-105 active:scale-95 transition-transform duration-300 px-6 py-3"
            />
            <Link
              href="/cerita"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#D4A373] hover:text-[#ffd261] transition-colors px-6 py-3 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/80 hover:bg-white/[0.06] shadow-md hover:scale-105 active:scale-95 duration-300"
            >
              <BookOpenIcon className="h-4 w-4" />
              Petualangan Cerita Calon Arang
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
