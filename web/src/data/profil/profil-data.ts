// ============================================================================
// DATA PROFIL & PORTOFOLIO SISWA AKSANTARA
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
  aksaraId: 'lontara' | 'sunda' | 'bali';
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

export interface HardwareRecordSummary {
  gameJenis: string;
  judul: string;
  icon: string;
  skorTertinggi: number;
  totalSesiDimainkan: number;
  akurasiRataRata: number;
  catatanKhusus: string;
}

export interface CulturalBadge {
  id: string;
  judul: string;
  deskripsi: string;
  icon: string;
  kategori: 'kanvas' | 'cerita' | 'hardware' | 'spesial';
  diperolehPada: string;
  tier: 'emas' | 'perak' | 'perunggu';
}

export const DEFAULT_SISWA_PROFILE: SiswaProfile = {
  id: 'usr-siswa-01',
  nama: 'Raden Arya Nusantara',
  nisn: '008492019',
  email: 'arya.nusantara@sekolah.id',
  avatar: 'RA',
  avatarUrl: '/images/characters/avatar-siswa-default.webp',
  level: 3,
  gelarBudaya: 'Juru Tulis Madya Parahyangan',
  totalXp: 1250,
  nextLevelXp: 2000,
  streakHari: 5,
  totalMenitBelajar: 185,
  totalGlifDikuasai: 18,
  totalBintangCerita: 14,
};

export const SCRIPT_MASTERY_LIST: ScriptMastery[] = [
  {
    aksaraId: 'sunda',
    namaAksara: 'Aksara Sunda',
    aksaraAsli: 'ᮃᮊ᮪ᮞᮛ',
    warnaTema: '#4ade80',
    glifDikuasai: 8,
    totalGlif: 25,
    akurasiRataRata: 95,
    glifFavorit: [
      { simbol: 'ᮊ', label: 'Ka' },
      { simbol: 'ᮒ', label: 'Ta' },
      { simbol: 'ᮘ', label: 'Ba' },
    ],
    latihanTerakhir: 'Kemarin, 14:20',
  },
  {
    aksaraId: 'lontara',
    namaAksara: 'Aksara Lontara',
    aksaraAsli: 'ᨒᨚᨈᨑ',
    warnaTema: '#38bdf8',
    glifDikuasai: 6,
    totalGlif: 23,
    akurasiRataRata: 92,
    glifFavorit: [
      { simbol: 'ᨀ', label: 'Ka' },
      { simbol: 'ᨁ', label: 'Ga' },
      { simbol: 'ᨒ', label: 'La' },
    ],
    latihanTerakhir: '2 hari lalu',
  },
  {
    aksaraId: 'bali',
    namaAksara: 'Aksara Bali',
    aksaraAsli: 'ᬅᬓ᭄ᬱᬭ',
    warnaTema: '#f97316',
    glifDikuasai: 4,
    totalGlif: 18,
    akurasiRataRata: 89,
    glifFavorit: [
      { simbol: 'ᬓ', label: 'Ka' },
      { simbol: 'ᬢ', label: 'Ta' },
      { simbol: 'ᬩ', label: 'Ba' },
    ],
    latihanTerakhir: '3 hari lalu',
  },
];

export const STORY_PROGRESS_LIST: StoryProgressSummary[] = [
  {
    eposSlug: 'sawerigading',
    judul: 'Kisah Sawerigading & I La Galigo',
    aksaraNama: 'Aksara Lontara',
    warnaTema: '#38bdf8',
    bintangTerkumpul: 5,
    maxBintang: 9,
    babSelesai: 2,
    totalBab: 3,
    karakterPendamping: {
      nama: 'Sawerigading',
      avatar: 'SG',
      avatarUrl: '/images/characters/char-sawerigading.webp',
    },
  },
  {
    eposSlug: 'lutung-kasarung',
    judul: 'Legenda Lutung Kasarung',
    aksaraNama: 'Aksara Sunda',
    warnaTema: '#4ade80',
    bintangTerkumpul: 6,
    maxBintang: 9,
    babSelesai: 3,
    totalBab: 3,
    karakterPendamping: {
      nama: 'Sang Guruminda',
      avatar: 'GM',
      avatarUrl: '/images/characters/char-lutung-kasarung.webp',
    },
  },
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

export const HARDWARE_RECORD_LIST: HardwareRecordSummary[] = [
  {
    gameJenis: 'ramu-mantra',
    judul: 'Ramu Mantra (Syllable Crafter)',
    icon: 'FlaskConical',
    skorTertinggi: 250,
    totalSesiDimainkan: 8,
    akurasiRataRata: 96,
    catatanKhusus: 'Suku kata terfavorit: ᮊᮤ (KI) & ᨁᨘ (GU)',
  },
  {
    gameJenis: 'speed-match',
    judul: 'Aksara Cepat Tanggap (Speed Match)',
    icon: 'Zap',
    skorTertinggi: 340,
    totalSesiDimainkan: 12,
    akurasiRataRata: 92,
    catatanKhusus: 'Refleks terbaik: 1.8 detik per penempelan kartu RFID',
  },
];

export const CULTURAL_BADGE_LIST: CulturalBadge[] = [
  {
    id: 'badge-1',
    judul: 'Penoreh Dluwang Pertama',
    deskripsi: 'Menyelesaikan goresan aksara Sunda pertama di Universal Web Canvas dengan akurasi di atas 90%.',
    icon: 'ScrollText',
    kategori: 'kanvas',
    diperolehPada: '10 Okt 2026',
    tier: 'emas',
  },
  {
    id: 'badge-2',
    judul: 'Nakhoda Samudra Luwu',
    deskripsi: 'Menuntaskan pelayaran Bab 1 Epos I La Galigo bersama Sawerigading.',
    icon: 'Compass',
    kategori: 'cerita',
    diperolehPada: '11 Okt 2026',
    tier: 'emas',
  },
  {
    id: 'badge-3',
    judul: 'Tangan Emas Kinestetik',
    deskripsi: 'Menyelesaikan 5 ronde berturut-turut mini-game Ramu Mantra tanpa salah slot kartu.',
    icon: 'Cpu',
    kategori: 'hardware',
    diperolehPada: '12 Okt 2026',
    tier: 'perak',
  },
  {
    id: 'badge-4',
    judul: 'Harmoni Jagat Dewata',
    deskripsi: 'Membuka rahasia rontal suci Calon Arang dan merapalkan aksara Bali Tri Hita Karana.',
    icon: 'Sparkles',
    kategori: 'cerita',
    diperolehPada: '13 Okt 2026',
    tier: 'emas',
  },
];
