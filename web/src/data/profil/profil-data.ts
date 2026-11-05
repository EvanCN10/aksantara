// ============================================================================
// DATA PROFIL & PORTOFOLIO SISWA AKSANTARA (BALI DIGIFEST 2026)
// ============================================================================

export interface SiswaProfile {
  id: string;
  nama: string;
  nisn: string;
  email: string;
  avatar: string;
  avatarUrl?: string;
  level: number;
  gelarBudaya: string;
  totalXp: number;
  nextLevelXp: number;
  streakHari: number;
  totalMenitBelajar: number;
  totalGlifDikuasai: number;
  totalBintangCerita: number;
}

export interface ScriptMastery {
  aksaraId: 'bali';
  namaAksara: string;
  aksaraAsli: string;
  warnaTema: string;
  glifDikuasai: number;
  totalGlif: number;
  akurasiRataRata: number;
  glifFavorit: { simbol: string; label: string }[];
  latihanTerakhir: string;
}

export interface StoryProgressSummary {
  eposSlug: string;
  judul: string;
  aksaraNama: string;
  warnaTema: string;
  bintangTerkumpul: number;
  maxBintang: number;
  babSelesai: number;
  totalBab: number;
  karakterPendamping: { nama: string; avatar: string; avatarUrl?: string };
}

export interface CulturalBadge {
  id: string;
  judul: string;
  deskripsi: string;
  icon: string;
  kategori: 'kanvas' | 'cerita' | 'preservasi' | 'spesial';
  diperolehPada: string;
  tier: 'emas' | 'perak' | 'perunggu';
}

export const DEFAULT_SISWA_PROFILE: SiswaProfile = {
  id: 'usr-siswa-01',
  nama: 'Wayan Arya Pratama',
  nisn: '008492019',
  email: 'arya.pratama@sekolah.bali.id',
  avatar: 'AP',
  avatarUrl: '/images/characters/avatar-siswa-default.webp',
  level: 3,
  gelarBudaya: 'Juru Tulis Rontal Bali Dwipa',
  totalXp: 1250,
  nextLevelXp: 2000,
  streakHari: 5,
  totalMenitBelajar: 185,
  totalGlifDikuasai: 18,
  totalBintangCerita: 3,
};

export const SCRIPT_MASTERY_LIST: ScriptMastery[] = [
  {
    aksaraId: 'bali',
    namaAksara: 'Aksara Bali',
    aksaraAsli: 'ᬅᬓ᭄ᬱᬭ',
    warnaTema: '#f97316',
    glifDikuasai: 18,
    totalGlif: 30,
    akurasiRataRata: 92,
    glifFavorit: [
      { simbol: 'ᬓ', label: 'Ka' },
      { simbol: 'ᬢ', label: 'Ta' },
      { simbol: 'ᬩ', label: 'Ba' },
    ],
    latihanTerakhir: 'Hari ini, 10:15',
  },
];

export const STORY_PROGRESS_LIST: StoryProgressSummary[] = [
  {
    eposSlug: 'calon-arang',
    judul: 'Misteri Mantra Calon Arang',
    aksaraNama: 'Aksara Bali',
    warnaTema: '#f97316',
    bintangTerkumpul: 3,
    maxBintang: 9,
    babSelesai: 1,
    totalBab: 3,
    karakterPendamping: {
      nama: 'Maharesi Mpu Bharadah',
      avatar: 'MB',
      avatarUrl: '/images/characters/char-mpu-bharadah.webp',
    },
  },
];

export const CULTURAL_BADGE_LIST: CulturalBadge[] = [
  {
    id: 'badge-1',
    judul: 'Penoreh Rontal Pertama',
    deskripsi: 'Menyelesaikan goresan aksara Bali pertama di Kanvas Belajar dengan akurasi model di atas 90%.',
    icon: 'ScrollText',
    kategori: 'kanvas',
    diperolehPada: '10 Okt 2026',
    tier: 'emas',
  },
  {
    id: 'badge-2',
    judul: 'Harmoni Jagat Girah',
    deskripsi: 'Membuka rahasia rontal suci Calon Arang Bab 1 dan merapalkan wianjana Tri Hita Karana.',
    icon: 'Sparkles',
    kategori: 'cerita',
    diperolehPada: '12 Okt 2026',
    tier: 'emas',
  },
  {
    id: 'badge-3',
    judul: 'Kurator Rontal Pemula',
    deskripsi: 'Mengusulkan transkripsi manuskrip lontar Kawi kuno pertama di Preservation Studio.',
    icon: 'Compass',
    kategori: 'preservasi',
    diperolehPada: '14 Okt 2026',
    tier: 'perak',
  },
];
