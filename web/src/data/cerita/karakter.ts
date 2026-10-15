// ============================================================================
// TEMPLATE KARAKTER PENDAMPING (COMPANION ROSTER)
// ============================================================================
// Catatan untuk Pengembang / Desainer:
// Karakter menggunakan avatar emoji sebagai placeholder sementara.
// Anda dapat menggantinya dengan aset ilustrasi kustom (PNG / SVG / WebP)
// cukup dengan mengisi properti `avatarUrl` dengan path aset lokal Anda,
// misalnya: avatarUrl: '/images/karakter/sawerigading.png'
// ============================================================================

export interface KarakterCompanion {
  id: string;
  nama: string;
  gelar: string;
  avatar: string; // Emoji placeholder
  avatarUrl?: string; // Slot aset ilustrasi kustom
  aksaraId: 'lontara' | 'sunda' | 'bali' | 'umum';
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
    gelar: 'Resi Penjaga Lontar Nusantara',
    avatar: 'GP',
    avatarUrl: '/images/characters/char-guru-pamomong.webp',
    aksaraId: 'umum',
    wilayah: 'Nusantara',
    warnaAksen: '#ffd261',
    bgGradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    kutipanTeaser:
      'Selamat datang, perintis aksara! Naskah-naskah kuno menyimpan rahasia peradaban leluhur kita. Pilihlah kisahmu!',
    deskripsi:
      'Tetua paleografi yang mengembara ke seantero kepulauan, membimbing pemula mengenali jejak huruf kuno.',
  },
  {
    id: 'sawerigading',
    nama: 'Sawerigading',
    gelar: 'Satria Pengarung Samudra Luwu',
    avatar: 'SW',
    avatarUrl: '/images/characters/char-sawerigading.webp',
    aksaraId: 'lontara',
    wilayah: 'Sulawesi Selatan (Bugis-Makassar)',
    warnaAksen: '#38bdf8',
    bgGradient: 'from-sky-500/20 via-sky-600/10 to-transparent',
    kutipanTeaser:
      'Kapal Pinisi telah siap berlayar! Bantu aku membaca ukiran belah ketupat sulapa eppa di kemudi sebelum badai tiba.',
    deskripsi:
      'Tokoh epos agung I La Galigo yang gagah berani menjelajahi lautan luas berbekal kompas bintang dan naskah Lontara.',
  },
  {
    id: 'purbasari',
    nama: 'Putri Purbasari',
    gelar: 'Putri Pertapa Hutan Galuh',
    avatar: 'PB',
    avatarUrl: '/images/characters/char-putri-purbasari.webp',
    aksaraId: 'sunda',
    wilayah: 'Jawa Barat (Tatar Pasundan)',
    warnaAksen: '#4ade80',
    bgGradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    kutipanTeaser:
      'Di kedalaman hutan sunyi, aksara ngalagena terukir di atas batu prasasti telaga. Mari singkap tabir kebenarannya!',
    deskripsi:
      'Putri berhati murni yang dibuang ke hutan belantara namun dilindungi satwa suci dan aksara suci Carita Parahyangan.',
  },
  {
    id: 'lutung-kasarung',
    nama: 'Sang Guruminda',
    gelar: 'Kera Sakti Kahyangan Penjaga Hutan Cupu',
    avatar: 'GM',
    avatarUrl: '/images/characters/char-lutung-kasarung.webp',
    aksaraId: 'sunda',
    wilayah: 'Jawa Barat (Gunung Cupu Mandalasena)',
    warnaAksen: '#ffd261',
    bgGradient: 'from-amber-500/20 via-emerald-600/10 to-transparent',
    kutipanTeaser:
      'Jangan bersedih, Tuan Putri! Kebenaran naskah dluwang leluhur tak akan pernah tenggelam oleh fitnah duniawi.',
    deskripsi:
      'Jelmaan pangeran kahyangan berhati mulia yang menemani Putri Purbasari menyingkap rahasia aksara Sunda kuno.',
  },
  {
    id: 'calon-arang-arya',
    nama: 'Mpu Arya',
    gelar: 'Penjaga Mantra Suci Rontal',
    avatar: 'MA',
    avatarUrl: '/images/characters/char-mpu-arya.webp',
    aksaraId: 'bali',
    wilayah: 'Bali & Lombok (Sunda Kecil)',
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
    wilayah: 'Bali & Jawa Timur (Kadiri)',
    warnaAksen: '#f97316',
    bgGradient: 'from-orange-500/20 via-amber-600/10 to-transparent',
    kutipanTeaser:
      'Keseimbangan jagat tidak ditegakkan dengan amarah, melainkan dengan ketajaman ilmu dan kebersihan aksara suci.',
    deskripsi:
      'Sang mahaguru spiritual yang membimbing para satria aksara melipatgandakan kekuatan kebajikan di bumi Dewata.',
  },
];

export function getKarakterById(id: string): KarakterCompanion | undefined {
  return DAFTAR_KARAKTER.find((k) => k.id === id);
}

export function getKarakterByAksara(aksaraId: string): KarakterCompanion | undefined {
  return DAFTAR_KARAKTER.find((k) => k.aksaraId === aksaraId);
}
