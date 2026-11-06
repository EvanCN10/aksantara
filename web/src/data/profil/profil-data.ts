// ============================================================================
// DATA PROFIL & PORTOFOLIO SISWA AKSANTARA (BALI DIGIFEST 2026)
// ============================================================================

export interface SiswaProfile {
  id: string;
  nama: string;
  statusSesi: string;
  email: string;
  avatar: string;
  avatarUrl?: string;
  level: number;
  gelarBudaya: string;
  totalXp: number;
  nextLevelXp: number;
  totalEvaluasiKanvas: number;
  totalGlifDikuasai: number;
  totalBintangCerita: number;
  babCeritaSelesai: number;
}

export interface CulturalBadge {
  id: string;
  judul: string;
  deskripsi: string;
  icon: string;
  kategori: 'kanvas' | 'cerita' | 'preservasi';
  tier: 'emas' | 'perak' | 'perunggu';
}

export const DEFAULT_SISWA_PROFILE: SiswaProfile = {
  id: 'guest_local',
  nama: 'I Wayan Pratama (Tamu)',
  statusSesi: 'Mode Tamu',
  email: 'Sesi lokal perangkat ini',
  avatar: 'WP',
  avatarUrl: '/images/characters/avatar-siswa-default.webp',
  level: 1,
  gelarBudaya: 'Siswa Aksara Bali',
  totalXp: 0,
  nextLevelXp: 500,
  totalEvaluasiKanvas: 0,
  totalGlifDikuasai: 0,
  totalBintangCerita: 0,
  babCeritaSelesai: 0,
};

export const CULTURAL_BADGE_LIST: CulturalBadge[] = [
  {
    id: 'badge-1',
    judul: 'Penoreh Rontal Pertama',
    deskripsi: 'Mengklasifikasikan minimal satu karakter Aksara Bali secara tepat di Kanvas Belajar ONNX.',
    icon: 'ScrollText',
    kategori: 'kanvas',
    tier: 'emas',
  },
  {
    id: 'badge-2',
    judul: 'Harmoni Jagat Girah',
    deskripsi: 'Menuntaskan minimal satu bab petualangan interaktif Lontar Calon Arang di Story Mode.',
    icon: 'Sparkles',
    kategori: 'cerita',
    tier: 'emas',
  },
  {
    id: 'badge-3',
    judul: 'Kurator Rontal Pemula',
    deskripsi: 'Mengajukan usulan transliterasi manual naskah lontar Bali di Studio Pelestarian.',
    icon: 'Compass',
    kategori: 'preservasi',
    tier: 'perak',
  },
];
