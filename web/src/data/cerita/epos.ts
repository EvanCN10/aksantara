// ============================================================================
// DATA KAMPANYE EPOS RONTAL (AKSARA BALI)
// ============================================================================

export type StatusBab = 'selesai' | 'terbuka' | 'terkunci';

export interface BabCerita {
  n: number;
  judul: string;
  sinopsis: string;
  xp: number;
  bintang: number; // 0 sampai 3
  status: StatusBab;
  fokusGlif: {
    simbol: string;
    label: string;
  }[];
  perkiraanMenit: number;
}

export interface CeritaEpos {
  id: string;
  slug: string;
  judul: string;
  subjudul: string;
  eposAsli: string;
  bannerUrl?: string;
  aksaraId: 'bali';
  aksaraNama: string;
  aksaraAsli: string;
  wilayah: string;
  ringkasan: string;
  karakterId: string;
  tagline: string;
  warnaTema: string;
  totalBintang: number;
  maxBintang: number;
  babList: BabCerita[];
}

export const DAFTAR_EPOS: CeritaEpos[] = [
  {
    id: 'calon-arang',
    slug: 'calon-arang',
    judul: 'Misteri Mantra Calon Arang',
    subjudul: 'Menundukkan Wabah Girah Melalui Rontal Suci',
    eposAsli: 'Lontar Calon Arang (Kakawin Kawi Naskah Bali-Jawa Timur)',
    bannerUrl: '/images/stories/banners/banner-calon-arang.webp',
    aksaraId: 'bali',
    aksaraNama: 'Aksara Bali',
    aksaraAsli: 'ᬅᬓ᭄ᬱᬭ',
    wilayah: 'Bali Dwipa',
    ringkasan:
      'Ketika rimba Girah dilanda kutukan wabah, Mpu Bharadah mengutus muridnya untuk mempelajari lontar suci beraksara wianjana demi mengembalikan keseimbangan jagat Tri Hita Karana.',
    karakterId: 'calon-arang-arya',
    tagline: 'Kekuatan Mantra Spiritual Rontal Dewata',
    warnaTema: '#f97316',
    totalBintang: 3,
    maxBintang: 9,
    babList: [
      {
        n: 1,
        judul: 'Rontal Rahasia di Desa Girah',
        sinopsis:
          'Menyelinap masuk ke kediaman sang janda sakti dan menyalin lembaran daun rontal dengan aksara wianjana pertama.',
        xp: 150,
        bintang: 3,
        status: 'selesai',
        fokusGlif: [
          { simbol: 'ᬓ', label: 'Ka' },
          { simbol: 'ᬕ', label: 'Ga' },
          { simbol: 'ᬮ', label: 'La' },
        ],
        perkiraanMenit: 5,
      },
      {
        n: 2,
        judul: 'Tarian Api Barong & Rangda',
        sinopsis:
          'Pertarungan dua kekuatan abadi. Rapalkan aksara pangangge suara untuk melindungi penduduk desa dari kobaran api.',
        xp: 250,
        bintang: 0,
        status: 'terbuka',
        fokusGlif: [
          { simbol: 'ᬢ', label: 'Ta' },
          { simbol: 'ᬤ', label: 'Da' },
          { simbol: 'ᬧ', label: 'Pa' },
        ],
        perkiraanMenit: 7,
      },
      {
        n: 3,
        judul: 'Harmoni Jagat Hyang Widhi',
        sinopsis:
          'Kedamaian kembali bersemi di Pulau Dewata. Ukirkan mantra penutup Kakawin di atas lempengan tembaga sakral.',
        xp: 350,
        bintang: 0,
        status: 'terbuka',
        fokusGlif: [
          { simbol: 'ᬩ', label: 'Ba' },
          { simbol: 'ᬫ', label: 'Ma' },
          { simbol: 'ᬲ', label: 'Sa' },
        ],
        perkiraanMenit: 9,
      },
    ],
  },
];

export function getEposBySlug(slug: string): CeritaEpos | undefined {
  return DAFTAR_EPOS.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || DAFTAR_EPOS[0];
}

export function getEposByAksara(aksaraId: string): CeritaEpos[] {
  return DAFTAR_EPOS.filter((c) => c.aksaraId === aksaraId);
}
