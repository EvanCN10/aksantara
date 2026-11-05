// ============================================================================
// TEMPLATE KARAKTER PENDAMPING (COMPANION ROSTER - BALI DWIPA)
// ============================================================================

export interface KarakterCompanion {
  id: string;
  nama: string;
  gelar: string;
  avatar: string;
  avatarUrl?: string;
  aksaraId: 'bali' | 'umum';
  wilayah: string;
  warnaAksen: string;
  bgGradient: string;
  kutipanTeaser: string;
  deskripsi: string;
}

export const DAFTAR_KARAKTER: KarakterCompanion[] = [
  {
    id: 'sang-juru-tulis',
    nama: 'Sang Guru Pamomong',
    gelar: 'Resi Penjaga Lontar Aksara Bali',
    avatar: 'GP',
    avatarUrl: '/images/characters/char-guru-pamomong.webp',
    aksaraId: 'umum',
    wilayah: 'Bali Dwipa',
    warnaAksen: '#ffd261',
    bgGradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    kutipanTeaser:
      'Selamat datang, perintis aksara! Naskah lontar rontal kuno menyimpan rahasia keluhuran leluhur Bali Dwipa.',
    deskripsi:
      'Tetua paleografi yang membimbing pemula mengenali jejak huruf kuno dan tata tulis aksara Bali.',
  },
  {
    id: 'calon-arang-arya',
    nama: 'Mpu Arya',
    gelar: 'Penjaga Mantra Suci Rontal',
    avatar: 'MA',
    avatarUrl: '/images/characters/char-mpu-arya.webp',
    aksaraId: 'bali',
    wilayah: 'Bali Dwipa (Girah)',
    warnaAksen: '#f97316',
    bgGradient: 'from-orange-500/20 via-orange-600/10 to-transparent',
    kutipanTeaser:
      'Kekuatan mantra Calon Arang berkobar di rimba Girah. Hanya mereka yang fasih melafalkan aksara suci yang dapat memadamkannya.',
    deskripsi:
      'Satria sastra yang menjaga ketenangan jagat dewata dengan merapalkan aksara wianjana Kakawin Kawi kuno.',
  },
  {
    id: 'mpu-bharadah',
    nama: 'Mpu Bharadah',
    gelar: 'Maharesi Penegak Dharma Kerajaan Daha',
    avatar: 'MB',
    avatarUrl: '/images/characters/char-mpu-bharadah.webp',
    aksaraId: 'bali',
    wilayah: 'Bali & Kadiri',
    warnaAksen: '#f97316',
    bgGradient: 'from-orange-500/20 via-amber-600/10 to-transparent',
    kutipanTeaser:
      'Keseimbangan jagat tidak ditegakkan dengan amarah, melainkan dengan ketajaman ilmu dan kebersihan aksara suci.',
    deskripsi:
      'Sang mahaguru spiritual yang membimbing para satria aksara melipatgandakan kekuatan kebajikan di bumi Dewata.',
  },
];

export function getKarakterById(id: string): KarakterCompanion | undefined {
  return DAFTAR_KARAKTER.find((k) => k.id === id) || DAFTAR_KARAKTER[1];
}

export function getKarakterByAksara(aksaraId: string): KarakterCompanion | undefined {
  return DAFTAR_KARAKTER.find((k) => k.aksaraId === aksaraId) || DAFTAR_KARAKTER[1];
}
