// ============================================================================
// DATA KAMPANYE EPOS NUSANTARA (TRINITAS AKSARA)
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
  aksaraId: 'lontara' | 'sunda' | 'bali';
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
    id: 'sawerigading',
    slug: 'sawerigading',
    judul: 'Kisah Sawerigading & I La Galigo',
    subjudul: 'Mengarungi Samudra Luwu Menyingkap Sulapa Eppa',
    eposAsli: 'Sureq Galigo (Karya Sastra Terpanjang di Dunia)',
    bannerUrl: '/images/stories/banners/banner-sawerigading.webp',
    aksaraId: 'lontara',
    aksaraNama: 'Aksara Lontara',
    aksaraAsli: 'ᨒᨚᨈᨑ',
    wilayah: 'Sulawesi Selatan',
    ringkasan:
      'Ikuti pengembaraan Sawerigading mengarungi samudra luas dengan perahu pinisi, menelusuri pesan leluhur Batara Guru yang terukir dalam aksara belah ketupat Lontara.',
    karakterId: 'sawerigading',
    tagline: 'Pelayaran Epos Maritim Bugis-Makassar',
    warnaTema: '#38bdf8',
    totalBintang: 5,
    maxBintang: 9,
    babList: [
      {
        n: 1,
        judul: 'Panggilan Samudra Luwu',
        sinopsis:
          'Sawerigading menerima pertanda dari dewa langit dan harus membaca ukiran awal di haluan pinisi untuk menentukan arah angin.',
        xp: 150,
        bintang: 3,
        status: 'selesai',
        fokusGlif: [
          { simbol: 'ᨀ', label: 'Ka' },
          { simbol: 'ᨁ', label: 'Ga' },
          { simbol: 'ᨒ', label: 'La' },
        ],
        perkiraanMenit: 4,
      },
      {
        n: 2,
        judul: 'Kemudi Beraksara Emas',
        sinopsis:
          'Badai besar menghadang di perairan Selat Makassar. Selesaikan tantangan menulis aksara untuk mengunci kemudi kapal pinisi.',
        xp: 200,
        bintang: 2,
        status: 'terbuka',
        fokusGlif: [
          { simbol: 'ᨑ', label: 'Ra' },
          { simbol: 'ᨓ', label: 'Wa' },
          { simbol: 'ᨈ', label: 'Ta' },
        ],
        perkiraanMenit: 6,
      },
      {
        n: 3,
        judul: 'Pusaka Batara Guru',
        sinopsis:
          'Mendarat di tanah harapan dan menguraikan naskah kuno Lontara terakhir yang menjaga persatuan suku bangsa maritim.',
        xp: 300,
        bintang: 0,
        status: 'terbuka',
        fokusGlif: [
          { simbol: 'ᨔ', label: 'Sa' },
          { simbol: 'ᨕ', label: 'A' },
          { simbol: 'ᨖ', label: 'Ha' },
        ],
        perkiraanMenit: 8,
      },
    ],
  },
  {
    id: 'lutung-kasarung',
    slug: 'lutung-kasarung',
    judul: 'Legenda Lutung Kasarung',
    subjudul: 'Keadilan Hutan Sunyi & Aksara Ngalagena Purba',
    eposAsli: 'Carita Lutung Kasarung (Naskah Sunda Kuna Pantun Bogor)',
    bannerUrl: '/images/stories/banners/banner-lutung-kasarung.webp',
    aksaraId: 'sunda',
    aksaraNama: 'Aksara Sunda',
    aksaraAsli: 'ᮃᮊ᮪ᮞᮛ',
    wilayah: 'Jawa Barat',
    ringkasan:
      'Putri Purbasari diasingkan ke hutan belantara oleh kakaknya. Bersama sang kera sakti jelmaan Guruminda, ia mengungkap kekuatan penyembuh aksara suci dluwang kuno.',
    karakterId: 'purbasari',
    tagline: 'Kisah Kesucian Hati Tatar Pasundan',
    warnaTema: '#4ade80',
    totalBintang: 3,
    maxBintang: 9,
    babList: [
      {
        n: 1,
        judul: 'Pengasingan Putri Purbasari',
        sinopsis:
          'Tiba di rimba Pasundan yang pekat, Purbasari menemukan batu prasasti beraksara ngalagena pembimbing langkah pertamanya.',
        xp: 150,
        bintang: 3,
        status: 'selesai',
        fokusGlif: [
          { simbol: 'ᮊ', label: 'Ka' },
          { simbol: 'ᮌ', label: 'Ga' },
          { simbol: 'ᮜ', label: 'La' },
        ],
        perkiraanMenit: 5,
      },
      {
        n: 2,
        judul: 'Telaga Sunyi Sang Hyang',
        sinopsis:
          'Lutung Kasarung membimbing sang putri membasuh wajah di telaga suci dengan merapalkan tanda rarangken pembersih luhur.',
        xp: 200,
        bintang: 0,
        status: 'terbuka',
        fokusGlif: [
          { simbol: 'ᮒ', label: 'Ta' },
          { simbol: 'ᮓ', label: 'Da' },
          { simbol: 'ᮕ', label: 'Pa' },
        ],
        perkiraanMenit: 6,
      },
      {
        n: 3,
        judul: 'Kembalinya Sang Guruminda',
        sinopsis:
          'Kebenaran terbukti di hadapan istana Kerajaan Pasundan. Tuliskan maklumat perdamaian dengan aksara Sunda paripurna.',
        xp: 300,
        bintang: 0,
        status: 'terbuka',
        fokusGlif: [
          { simbol: 'ᮘ', label: 'Ba' },
          { simbol: 'ᮙ', label: 'Ma' },
          { simbol: 'ᮞ', label: 'Sa' },
        ],
        perkiraanMenit: 8,
      },
    ],
  },
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
    wilayah: 'Bali & Lombok',
    ringkasan:
      'Ketika rimba Girah dilanda kutukan wabah, Mpu Bharadah mengutus muridnya untuk mempelajari lontar suci beraksara wianjana demi mengembalikan keseimbangan jagat Tri Hita Karana.',
    karakterId: 'calon-arang-arya',
    tagline: 'Kekuatan Mantra Spiritual Rontal Dewata',
    warnaTema: '#f97316',
    totalBintang: 0,
    maxBintang: 9,
    babList: [
      {
        n: 1,
        judul: 'Rontal Rahasia di Desa Girah',
        sinopsis:
          'Menyelinap masuk ke kediaman sang janda sakti dan menyalin lembaran daun rontal dengan aksara wianjana pertama.',
        xp: 150,
        bintang: 0,
        status: 'terbuka',
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
  return DAFTAR_EPOS.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function getEposByAksara(aksaraId: string): CeritaEpos[] {
  return DAFTAR_EPOS.filter((c) => c.aksaraId === aksaraId);
}
