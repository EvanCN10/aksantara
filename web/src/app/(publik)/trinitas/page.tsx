'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

function SparklesIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function CpuIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2M9 2v2M20 15h2M20 9h2M9 20v2M15 20v2M2 9h2M2 15h2" />
    </svg>
  );
}

function LayersIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5" />
      <path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5" />
    </svg>
  );
}

function ScrollTextIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10a2 2 0 0 0-2 2Z" />
      <path d="M4 17a2 2 0 0 1 2-2h2v4a2 2 0 0 1-2 2H4Z" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CompassIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function BookOpenIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function Volume2Icon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

type AksaraKey = 'lontara' | 'sunda' | 'bali';

interface Glif {
  simbol: string;
  label: string;
  ipa: string;
  artikulasi: string;
  catatan: string;
}

interface Diakritik {
  nama: string;
  keterangan: string;
  contoh: string;
}

interface AksaraData {
  key: AksaraKey;
  nama: string;
  aksaraAsli: string;
  asalSingkat: string;
  asal: string;
  karakterVisual: string;
  glif: Glif[];
  diakritik: Diakritik[];
  tantanganAI: string;
  solusiModel: string;
}

const DATA_AKSARA: Record<AksaraKey, AksaraData> = {
  lontara: {
    key: 'lontara',
    nama: 'Aksara Lontara',
    aksaraAsli: 'ᨒᨚᨈᨑ',
    asalSingkat: 'Bugis-Makassar',
    asal: 'Sulawesi Selatan, tradisi maritim dan epos agung I La Galigo',
    karakterVisual:
      'Dominan pola geometris bersudut tajam (belah ketupat), minim garis lengkung. Bentuk ini beradaptasi dengan guratan pisau kalam pada daun lontar kering yang rentan robek bila digores melengkung secara berulang.',
    glif: [
      {
        simbol: 'ᨀ',
        label: 'Ka',
        ipa: '[ka]',
        artikulasi: 'Velar tak bersuara',
        catatan: 'Konsonan dasar pangkal tenggorokan dengan sudut belah ketupat tegas.',
      },
      {
        simbol: 'ᨁ',
        label: 'Ga',
        ipa: '[ga]',
        artikulasi: 'Velar bersuara',
        catatan: 'Variasi tarikan horizontal di tengah badan belah ketupat.',
      },
      {
        simbol: 'ᨂ',
        label: 'Nga',
        ipa: '[ŋa]',
        artikulasi: 'Nasal velar',
        catatan: 'Bentuk sudut terbuka di bagian atas penanda bunyi sengau.',
      },
      {
        simbol: 'ᨄ',
        label: 'Pa',
        ipa: '[pa]',
        artikulasi: 'Bilabial tak bersuara',
        catatan: 'Karakter bibir dengan bukaan sudut ke kanan atas.',
      },
      {
        simbol: 'ᨈ',
        label: 'Ta',
        ipa: '[ta]',
        artikulasi: 'Dental tak bersuara',
        catatan: 'Garis diagonal tajam menyerupai layar perahu pinisi Bugis.',
      },
      {
        simbol: 'ᨊ',
        label: 'Na',
        ipa: '[na]',
        artikulasi: 'Nasal alveolar',
        catatan: 'Simbol nasal ujung lidah dengan sudut simetris.',
      },
      {
        simbol: 'ᨑ',
        label: 'Ra',
        ipa: '[ra]',
        artikulasi: 'Getar alveolar',
        catatan: 'Garis tunggal menyerong yang melambangkan keluwesan arus laut.',
      },
      {
        simbol: 'ᨔ',
        label: 'Sa',
        ipa: '[sa]',
        artikulasi: 'Frikatif alveolar',
        catatan: 'Bentuk dua segitiga bertaut penanda desis tajam.',
      },
    ],
    diakritik: [
      {
        nama: "Titi' riaseq",
        keterangan: 'Titik di atas badan aksara',
        contoh: 'Mengubah konsonan bawaan /a/ menjadi vokal /i/',
      },
      {
        nama: "Titi' riyawa",
        keterangan: 'Titik di bawah badan aksara',
        contoh: 'Mengubah konsonan bawaan /a/ menjadi vokal /u/',
      },
      {
        nama: "Kecce' riolo",
        keterangan: 'Tanda di depan aksara',
        contoh: 'Menandai vokal /e/ (taling depan)',
      },
    ],
    tantanganAI:
      'Membedakan ketajaman sudut pada citra binarized tanpa bias urutan goresan, karena kesamaan morfologi antar konsonan belah ketupat sangat rentan memicu false-positive.',
    solusiModel:
      'Feature extractor CNN/ViT terlatih NusaAksara mengisolasi rasio koordinat sudut dan densitas piksel biner terpusat.',
  },
  sunda: {
    key: 'sunda',
    nama: 'Aksara Sunda',
    aksaraAsli: 'ᮃᮊ᮪ᮞᮛ ᮞᮥᮔ᮪ᮓ',
    asalSingkat: 'Pasundan',
    asal: 'Jawa Barat, prasasti Kawali dan naskah kuno Carita Parahyangan',
    karakterVisual:
      'Konsonan ngalagena berkarakter modular dengan tarikan vertikal-horizontal yang konsisten. Memiliki tinggi glif seragam sehingga sangat stabil saat dirangkai dalam baris manuskrip dluwang.',
    glif: [
      {
        simbol: 'ᮊ',
        label: 'Ka',
        ipa: '[ka]',
        artikulasi: 'Velar dasar',
        catatan: 'Konsonan ngalagena pembuka dengan lekukan atas khas Pasundan.',
      },
      {
        simbol: 'ᮌ',
        label: 'Ga',
        ipa: '[ga]',
        artikulasi: 'Velar bersuara',
        catatan: 'Garis sejajar vertikal dengan simpul penghubung datar.',
      },
      {
        simbol: 'ᮍ',
        label: 'Nga',
        ipa: '[ŋa]',
        artikulasi: 'Nasal velar',
        catatan: 'Glif sengau dengan tarikan lengkung anggun berimbang.',
      },
      {
        simbol: 'ᮎ',
        label: 'Ca',
        ipa: '[t͡ʃa]',
        artikulasi: 'Palatal tak bersuara',
        catatan: 'Lekukan tengah tajam dengan kaki penopang tegak lurus.',
      },
      {
        simbol: 'ᮏ',
        label: 'Ja',
        ipa: '[d͡ʒa]',
        artikulasi: 'Palatal bersuara',
        catatan: 'Struktur modular dengan aksen kait ganda di sisi kiri.',
      },
      {
        simbol: 'ᮒ',
        label: 'Ta',
        ipa: '[ta]',
        artikulasi: 'Dental tak bersuara',
        catatan: 'Dua tiang vertikal simetris bertopi garis datar.',
      },
      {
        simbol: 'ᮓ',
        label: 'Da',
        ipa: '[da]',
        artikulasi: 'Dental bersuara',
        catatan: 'Variasi garis lengkung bawah yang menopang badan konsonan.',
      },
      {
        simbol: 'ᮘ',
        label: 'Ba',
        ipa: '[ba]',
        artikulasi: 'Bilabial bersuara',
        catatan: 'Karakter kokoh menyerupai benteng dengan proporsi modular rapi.',
      },
    ],
    diakritik: [
      {
        nama: 'Rarangken Luhur (Atas)',
        keterangan: 'Panghulu, Pamepet, Paneuleung',
        contoh: 'Mengubah bunyi vokal /i/, /ə/, atau vokal khas Sunda /ɤ/',
      },
      {
        nama: 'Rarangken Handap (Bawah)',
        keterangan: 'Panyuku, Panyakra, Panyiku',
        contoh: 'Mengubah bunyi vokal /u/ atau menyisipkan gugus konsonan /r/, /l/',
      },
      {
        nama: 'Rarangken Sejajar (Samping)',
        keterangan: 'Panolong, Pangwisad, Pamaeh',
        contoh: 'Vokalisasi /o/, akhiran desah /h/, dan pembunuh vokal konsonan mati',
      },
    ],
    tantanganAI:
      'Presisi verifikasi posisi spasial rarangken terhadap ngalagena dasar, karena ukuran diakritik yang mungil rentan tertukar koordinat atas-bawah pada citra resolusi rendah.',
    solusiModel:
      'Pipeline segmentasi spasial hierarkis yang memvalidasi bounding-box konsonan induk sebelum mengevaluasi rarangken di sekitarnya.',
  },
  bali: {
    key: 'bali',
    nama: 'Aksara Bali',
    aksaraAsli: 'ᬅᬓ᭄ᬱᬭ ᬩᬮᬶ',
    asalSingkat: 'Bali & Lombok',
    asal: 'Bali dan Lombok, sastra rontal, Kakawin, dan tradisi kidung suci',
    karakterVisual:
      'Kurvalinier mengalir dinamis dengan tingkat kerumitan tinggi. Menggunakan sistem gantungan dan gempelan (adeg-adeg) yang bertumpuk vertikal saat membentuk kluster konsonan mati.',
    glif: [
      {
        simbol: 'ᬓ',
        label: 'Ka',
        ipa: '[ka]',
        artikulasi: 'Wianjana kanthya',
        catatan: 'Aksara wianjana pertama dengan lengkungan gelombang ganda harmonis.',
      },
      {
        simbol: 'ᬔ',
        label: 'Kha (Mahaprana)',
        ipa: '[kʰa]',
        artikulasi: 'Kanthya aspirat',
        catatan: 'Glif bernapas panjang dengan ornamen lingkar di puncak kurva.',
      },
      {
        simbol: 'ᬕ',
        label: 'Ga',
        ipa: '[ga]',
        artikulasi: 'Wianjana bersuara',
        catatan: 'Tarikan kontinu satu nafas melambangkan ketenangan sastra rontal.',
      },
      {
        simbol: 'ᬖ',
        label: 'Gha (Mahaprana)',
        ipa: '[ɡʱa]',
        artikulasi: 'Aspirat bersuara',
        catatan: 'Karakter langka dalam naskah Sansekerta dan Kawi kuno.',
      },
      {
        simbol: 'ᬗ',
        label: 'Nga',
        ipa: '[ŋa]',
        artikulasi: 'Anunasika kanthya',
        catatan: 'Lengkungan bawah fleksibel penanda resonansi rongga hidung.',
      },
      {
        simbol: 'ᬘ',
        label: 'Ca',
        ipa: '[t͡ʃa]',
        artikulasi: 'Wianjana talawya',
        catatan: 'Kurva lembut langit-langit mulut dengan simpul kanan khas.',
      },
      {
        simbol: 'ᬚ',
        label: 'Ja',
        ipa: '[d͡ʒa]',
        artikulasi: 'Talawya bersuara',
        catatan: 'Struktur kurva bertingkat yang memerlukan stabilitas tarikan tangan.',
      },
      {
        simbol: 'ᬢ',
        label: 'Ta',
        ipa: '[ta]',
        artikulasi: 'Wianjana dantya',
        catatan: 'Lekukan gigi dengan kelenturan kurva warisan aksara Pallawa.',
      },
    ],
    diakritik: [
      {
        nama: 'Pangangge Suara',
        keterangan: 'Tedung, Ulu, Suku, Taling',
        contoh: 'Mengubah bunyi vokal aksara induk menjadi /aː/, /i/, /u/, /e/, /o/',
      },
      {
        nama: 'Pangangge Tengenan',
        keterangan: 'Cecek, Surang, Bisah, Adeg-adeg',
        contoh: 'Penanda konsonan penutup suku kata (/ŋ/, /r/, /h/) dan pembunuh vokal',
      },
      {
        nama: 'Gantungan & Gempelan',
        keterangan: 'Bentuk sub-skrip konsonan tumpuk',
        contoh: 'Ditulis di bawah aksara utama untuk mematikan vokal konsonan sebelumnya',
      },
    ],
    tantanganAI:
      'Segmentasi ligatur kontinu serta pemisahan gantungan aksara yang bertumpuk vertikal, rawan terdeteksi sebagai satu glif tunggal oleh model konvensional.',
    solusiModel:
      'Model berbasis Vision Transformer (ViT) dengan mekanisme multi-head attention untuk memisahkan lapisan aksara induk dan gantungan bawah.',
  },
};

const TAB_LIST: AksaraKey[] = ['lontara', 'sunda', 'bali'];

const MATRIKS_KOMPARASI: {
  parameter: string;
  lontara: string;
  sunda: string;
  bali: string;
}[] = [
  {
    parameter: 'Asal Wilayah',
    lontara: 'Sulawesi Selatan',
    sunda: 'Jawa Barat',
    bali: 'Bali & Lombok',
  },
  {
    parameter: 'Ciri Geometris',
    lontara: 'Sudut tajam, belah ketupat',
    sunda: 'Modular, tinggi konsisten',
    bali: 'Kurvalinier, ligatur mengalir',
  },
  {
    parameter: 'Sistem Vokalisasi',
    lontara: "Titi' riaseq & titi' riyawa",
    sunda: 'Rarangken luhur, handap, sejajar',
    bali: 'Pangangge suara & tengenan',
  },
  {
    parameter: 'Kompleksitas Topologi',
    lontara: 'Rendah (garis lurus dominan)',
    sunda: 'Sedang (presisi posisi modular)',
    bali: 'Tinggi (gantungan bertumpuk vertikal)',
  },
  {
    parameter: 'Tantangan Model AI',
    lontara: 'Diskriminasi sudut belah ketupat',
    sunda: 'Verifikasi relasi spasial diakritik',
    bali: 'Segmentasi multi-karakter dan ligatur',
  },
  {
    parameter: 'Benchmark Akademis',
    lontara: 'NusaAksara ACL 2025',
    sunda: 'NusaAksara ACL 2025',
    bali: 'NusaAksara ACL 2025',
  },
];

export default function TrinitasAksaraPage() {
  const [aktif, setAktif] = useState<AksaraKey>('lontara');
  const [selectedGlifIndex, setSelectedGlifIndex] = useState<number>(0);

  const data = DATA_AKSARA[aktif];
  const glifAktif = data.glif[selectedGlifIndex] || data.glif[0];

  const handleTabChange = (key: AksaraKey) => {
    setAktif(key);
    setSelectedGlifIndex(0);
  };

  return (
    <main className="relative min-h-screen bg-[#0c1a2c] text-[#F6F2E9] overflow-x-hidden selection:bg-[#ffd261]/20 selection:text-[#ffd261]">
      {/* Background Ambience & Radial Glow */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0c1a2c] via-[#0c1a2c] to-[#060b14]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255, 210, 97, 0.08) 0%, rgba(207, 86, 0, 0.04) 40%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* =========================================
            1. HERO SECTION
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 pt-28 md:pt-36 pb-12 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/90 text-[#D4A373] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <SparklesIcon className="h-3.5 w-3.5 text-[#ffd261]" />
            Paleografi &amp; Digitalisasi Budaya
          </div>

          <h1
            className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-t from-[#ffd261] via-[#FFF2D6] to-[#FFFFFF] bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-philosopher), serif',
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85))',
            }}
          >
            Harmoni Trinitas Aksara Nusantara
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm md:text-base text-[#F6F2E9]/80 leading-relaxed font-light">
            Aksantara mengunci fokus pada tiga aksara dengan karakteristik paleografi kontras:
            Lontara dengan geometri maritim bersudut tajam, Sunda dengan ngalagena modular teratur,
            dan Bali dengan kurvalinier kompleks warisan naskah lontar. Ketiganya menjadi tolok ukur
            pengujian model AI klasifikasi visual yang tangguh dan objektif.
          </p>
        </section>

        {/* =========================================
            2. AKSARA TAB SELECTOR
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6">
          <div
            role="tablist"
            aria-label="Pilihan Aksara Nusantara"
            className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-[#D4A373]/25 bg-[#0D0E12]/85 p-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          >
            {TAB_LIST.map((key) => {
              const item = DATA_AKSARA[key];
              const isAktif = key === aktif;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isAktif}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={`flex-1 rounded-xl px-5 py-3.5 text-left transition-all duration-300 cursor-pointer ${
                    isAktif
                      ? 'bg-gradient-to-r from-[#cf5600] to-[#9a3412] text-white shadow-[0_4px_20px_rgba(207,86,0,0.35)] border border-[#ffd261]/35'
                      : 'text-[#F6F2E9]/65 hover:bg-white/[0.04] hover:text-[#F6F2E9] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-lg font-bold tracking-wide"
                      style={{ fontFamily: 'var(--font-philosopher), serif' }}
                    >
                      {item.nama}
                    </span>
                    <span
                      className="text-xs opacity-60 font-serif"
                      aria-hidden="true"
                    >
                      {item.aksaraAsli}
                    </span>
                  </div>
                  <div className="text-xs mt-1 opacity-80 font-mono tracking-wider">
                    {item.asalSingkat}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================
            3. INTERACTIVE AKSARA EXPLORER & GLIF SPOTLIGHT
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
            {/* Kartu Glif Utama dengan Ornate Frame */}
            <OrnateFrame className="aspect-auto bg-[#0c1a2c]/60 backdrop-blur-xl">
              <div className="flex flex-col gap-6 p-6 sm:p-8 w-full">
                {/* Header Aksara Aktif */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2
                      className="text-2xl sm:text-3xl font-bold text-[#ffd261]"
                      style={{ fontFamily: 'var(--font-philosopher), serif' }}
                    >
                      {data.nama}
                    </h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-[#D4A373]/35 bg-[#141721] text-[#D4A373]">
                      {data.asalSingkat}
                    </span>
                  </div>
                  <p className="text-xs text-[#D4A373] mt-2 tracking-wide font-medium">
                    {data.asal}
                  </p>
                  <p className="text-sm text-[#F6F2E9]/75 mt-3 leading-relaxed">
                    {data.karakterVisual}
                  </p>
                </div>

                {/* Spotlight Glif Terpilih */}
                <div className="relative rounded-2xl border border-[#D4A373]/30 bg-gradient-to-b from-[#141721]/90 to-[#0A0C12]/95 p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 40%, rgba(255, 210, 97, 0.12) 0%, transparent 70%)',
                    }}
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-7xl sm:text-8xl md:text-9xl text-[#ffd261] font-normal leading-none drop-shadow-[0_4px_16px_rgba(255,210,97,0.35)] select-none">
                      {glifAktif.simbol}
                    </span>
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className="text-2xl font-bold text-[#F6F2E9]"
                        style={{ fontFamily: 'var(--font-philosopher), serif' }}
                      >
                        {glifAktif.label}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/25">
                        {glifAktif.ipa}
                      </span>
                    </div>
                    <span className="text-xs text-[#D4A373] font-medium mt-1">
                      {glifAktif.artikulasi}
                    </span>
                    <p className="text-xs text-[#F6F2E9]/70 mt-2 max-w-md leading-relaxed">
                      {glifAktif.catatan}
                    </p>
                  </div>
                </div>

                {/* Grid 8 Glif Selektor Interaktif */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#D4A373] font-semibold">
                      Pilih Glif Konsonan
                    </p>
                    <span className="text-[11px] text-[#F6F2E9]/50">
                      Klik simbol untuk melihat detail
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                    {data.glif.map((g, idx) => {
                      const isSelected = idx === selectedGlifIndex;
                      return (
                        <button
                          key={g.label}
                          type="button"
                          onClick={() => setSelectedGlifIndex(idx)}
                          aria-label={`Pilih aksara ${g.label} (${g.simbol})`}
                          className={`flex flex-col items-center justify-center rounded-xl py-3 px-2 transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border border-[#ffd261] bg-[#ffd261]/15 text-[#ffd261] shadow-[0_0_16px_rgba(255,210,97,0.25)] scale-105'
                              : 'border border-[#D4A373]/25 bg-black/40 text-[#F6F2E9] hover:bg-white/5 hover:border-[#D4A373]/50'
                          }`}
                        >
                          <span className="text-3xl sm:text-4xl leading-tight select-none">
                            {g.simbol}
                          </span>
                          <span className="text-[11px] font-medium opacity-80 mt-1">
                            {g.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </OrnateFrame>

            {/* Kolom Kanan: Diakritik & Validasi Model AI */}
            <div className="flex flex-col gap-6">
              {/* Vokalisasi & Diakritik */}
              <div className="rounded-2xl border border-[#D4A373]/25 bg-[rgba(20,23,33,0.92)] p-6 sm:p-7 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <Volume2Icon className="h-4 w-4 text-[#ffd261]" />
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D4A373] font-semibold">
                    Vokalisasi &amp; Diakritik
                  </p>
                </div>
                <p className="text-sm text-[#F6F2E9]/65 mb-5">
                  Sistem penanda vokal dan penutup suku kata pada konsonan {data.nama}
                </p>

                <ul className="space-y-4">
                  {data.diakritik.map((d) => (
                    <li
                      key={d.nama}
                      className="border-l-2 border-[#cf5600] pl-4 py-0.5 transition-colors hover:border-[#ffd261]"
                    >
                      <p className="text-sm font-semibold text-[#F6F2E9]">{d.nama}</p>
                      <p className="text-xs text-[#D4A373] mt-0.5">{d.keterangan}</p>
                      <p className="text-xs text-[#F6F2E9]/60 mt-1 leading-relaxed">
                        {d.contoh}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rationale Tantangan AI Classifier */}
              <div className="rounded-2xl border border-[#D4A373]/25 bg-[rgba(20,23,33,0.92)] p-6 sm:p-7 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 mb-3">
                  <CpuIcon className="h-4 w-4 text-[#ffd261]" />
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D4A373] font-semibold">
                    Evaluasi AI Classifier
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-[#cf5600] uppercase tracking-wider block mb-1">
                      Tantangan Karakter:
                    </span>
                    <p className="text-xs text-[#F6F2E9]/75 leading-relaxed">
                      {data.tantanganAI}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-[#ffd261] uppercase tracking-wider block mb-1">
                      Solusi Algoritma Aksantara:
                    </span>
                    <p className="text-xs text-[#F6F2E9]/75 leading-relaxed">
                      {data.solusiModel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            4. MATRIKS KOMPARASI PALEOGRAFI
            ========================================= */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <LayersIcon className="h-5 w-5 text-[#ffd261]" />
            <h2
              className="text-2xl sm:text-3xl font-bold text-center text-[#F6F2E9]"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              Matriks Komparasi Paleografi
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D4A373]/25 bg-[rgba(20,23,33,0.92)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#D4A373]/25 bg-black/30">
                  <th className="px-5 py-4 text-xs uppercase tracking-[0.2em] text-[#D4A373] font-semibold">
                    Parameter
                  </th>
                  <th
                    className={`px-5 py-4 text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
                      aktif === 'lontara'
                        ? 'text-[#ffd261] bg-[#ffd261]/[0.08]'
                        : 'text-[#D4A373]'
                    }`}
                  >
                    Lontara
                  </th>
                  <th
                    className={`px-5 py-4 text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
                      aktif === 'sunda'
                        ? 'text-[#ffd261] bg-[#ffd261]/[0.08]'
                        : 'text-[#D4A373]'
                    }`}
                  >
                    Sunda
                  </th>
                  <th
                    className={`px-5 py-4 text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
                      aktif === 'bali'
                        ? 'text-[#ffd261] bg-[#ffd261]/[0.08]'
                        : 'text-[#D4A373]'
                    }`}
                  >
                    Bali
                  </th>
                </tr>
              </thead>
              <tbody>
                {MATRIKS_KOMPARASI.map((baris, idx) => (
                  <tr
                    key={baris.parameter}
                    className={`transition-colors ${
                      idx !== MATRIKS_KOMPARASI.length - 1
                        ? 'border-b border-white/5'
                        : ''
                    } hover:bg-white/[0.02]`}
                  >
                    <td className="px-5 py-4 text-[#F6F2E9] font-medium whitespace-nowrap">
                      {baris.parameter}
                    </td>
                    <td
                      className={`px-5 py-4 transition-colors ${
                        aktif === 'lontara'
                          ? 'text-[#ffd261] font-medium bg-[#ffd261]/[0.05]'
                          : 'text-[#F6F2E9]/70'
                      }`}
                    >
                      {baris.lontara}
                    </td>
                    <td
                      className={`px-5 py-4 transition-colors ${
                        aktif === 'sunda'
                          ? 'text-[#ffd261] font-medium bg-[#ffd261]/[0.05]'
                          : 'text-[#F6F2E9]/70'
                      }`}
                    >
                      {baris.sunda}
                    </td>
                    <td
                      className={`px-5 py-4 transition-colors ${
                        aktif === 'bali'
                          ? 'text-[#ffd261] font-medium bg-[#ffd261]/[0.05]'
                          : 'text-[#F6F2E9]/70'
                      }`}
                    >
                      {baris.bali}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================
            5. KAJIAN PEDAGOGIS: MENGAPA BUKAN URUTAN GORESAN?
            ========================================= */}
        <section className="mx-auto max-w-4xl px-6 py-12">
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
                Berbeda dari Kanji atau Hanzi yang memiliki aturan goresan baku (Bishun), aksara
                daerah Nusantara tidak mewariskan urutan tarikan garis yang kaku. Pujangga lontar
                dan juru tulis kuno menulis dengan kebebasan gaya tangan masing-masing, dan
                kurikulum muatan lokal sekolah lebih menekankan keutuhan bentuk fonetis ketimbang
                urutan tarikan pena.
              </p>
              <p>
                Atas dasar riset tersebut, Aksantara mengimplementasikan Shape and Topology
                Classifier: model mengevaluasi karakter berdasarkan keutuhan proporsi visual dan
                koordinat spasial diakritik, bukan jejak lintasan gerak pena. Siswa yang memulai
                goresan dari sudut berbeda tidak dipenalti selama karakter terbentuk secara utuh
                dan dapat dibaca dengan benar.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            6. CALL TO ACTION (CTA)
            ========================================= */}
        <section className="mx-auto max-w-3xl px-6 pt-6 pb-28 text-center">
          <p className="text-sm text-[#F6F2E9]/70 mb-6 font-light">
            Sudah memahami karakteristik, fonetik, dan geometri ketiga aksara. Mulai berlatih
            menulis langsung secara digital atau jelajahi konsol fisik Phygital.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ShinyButton
              label="Uji Coba Web Canvas"
              href="/mulai"
              fillColor="rgba(13, 14, 18, 0.75)"
              labelColor="#F6F2E9"
              accentColor="#ffd261"
              accentSoftColor="#ffe8a3"
              cornerRadius={9999}
              className="text-xs sm:text-sm tracking-wide font-medium shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(255,210,97,0.18)] hover:scale-105 active:scale-95 transition-transform duration-300 px-6 py-3"
            />
            <Link
              href="/tentang"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#D4A373] hover:text-[#ffd261] transition-colors px-6 py-3 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/80 hover:bg-white/[0.06] shadow-md hover:scale-105 active:scale-95 duration-300"
            >
              <CompassIcon className="h-4 w-4" />
              Eksplorasi Mode Phygital
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-[#F6F2E9]/45">
            <BookOpenIcon className="h-3.5 w-3.5" />
            Disusun merujuk benchmark akademis NusaAksara, ACL 2025
          </div>
        </section>
      </div>
    </main>
  );
}
