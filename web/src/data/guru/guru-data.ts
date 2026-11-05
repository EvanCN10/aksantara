// ============================================================================
// DATA MOCK ANALITIK KELAS & ROSTER SISWA GURU (AKSARA BALI)
// ============================================================================

export interface SiswaRosterItem {
  id: string;
  nisn: string;
  nama: string;
  avatar: string;
  gelarBudaya: string;
  akurasiMenulis: number; // 0 - 100%
  glifDikuasai: number; // jumlah glif terlatih
  eposBintang: number; // bab selesai / 9
  usulanPreservasi: number; // jumlah transliterasi
  statusAktivitas: 'Aktif Hari Ini' | 'Kemarin' | '3 Hari Lalu';
  perluRemedi: boolean;
  glifKendala?: {
    aksara: string;
    glif: string;
    catatan: string;
  };
}

export interface GlifKritisItem {
  aksaraId: 'bali';
  aksaraNama: string;
  glif: string;
  namaGlif: string;
  tingkatKesalahan: number; // %
  kendalaUmum: string;
}

export interface GuruClassProfile {
  namaGuru: string;
  gelarAkademik: string;
  jabatan: string;
  nip: string;
  institusi: string;
  namaKelas: string;
  tahunAjaran: string;
  totalSiswa: number;
  siswaAktif: number;
  rataRataAkurasi: number;
  totalGlifDikuasai: number;
  totalPreservasi: number;
}

export interface AktivitasKelasItem {
  id: string;
  siswaNama: string;
  avatar: string;
  waktu: string;
  kegiatan: string;
  tipe: 'canvas' | 'cerita' | 'pelestarian';
  detail: string;
}

export const GURU_PROFILE: GuruClassProfile = {
  namaGuru: 'I Made Dananjaya',
  gelarAkademik: 'M.Hum.',
  jabatan: 'Pamong Budaya Utama & Kurator Aksara Bali',
  nip: '19820412 200801 1 003',
  institusi: 'SMKN 1 Sukawati & Balai Pelestarian Kebudayaan Wilayah XV Bali',
  namaKelas: 'Kelas X Pelestarian Aksara Bali Dwipa',
  tahunAjaran: 'Tahun Ajaran 2025/2026 - Semester Genap',
  totalSiswa: 34,
  siswaAktif: 32,
  rataRataAkurasi: 89.2,
  totalGlifDikuasai: 248,
  totalPreservasi: 48,
};

export const GLIF_KRITIS_DATA: GlifKritisItem[] = [
  {
    aksaraId: 'bali',
    aksaraNama: 'Bali Dwipa',
    glif: 'ᬗ',
    namaGlif: 'Nga (ᬗ)',
    tingkatKesalahan: 35,
    kendalaUmum: 'Tarikan kurva ekor bawah sering memotong grid dasar dan kehilangan keluwesan.',
  },
  {
    aksaraId: 'bali',
    aksaraNama: 'Bali Dwipa',
    glif: 'ᬰ',
    namaGlif: 'Sa Saga (ᬰ)',
    tingkatKesalahan: 31,
    kendalaUmum: 'Lekukan mahkota atas tertukar dengan Sa Danti sehingga skor klasifikasi turun.',
  },
  {
    aksaraId: 'bali',
    aksaraNama: 'Bali Dwipa',
    glif: 'ᬡ',
    namaGlif: 'Na Rumbah (ᬡ)',
    tingkatKesalahan: 27,
    kendalaUmum: 'Proporsi busur ganda kiri terlalu sempit dibanding tiang vertikal kanan.',
  },
];

export const DAFTAR_SISWA_ROSTER: SiswaRosterItem[] = [
  {
    id: '1',
    nisn: '0081293811',
    nama: 'Wayan Arya Pratama',
    avatar: 'AP',
    gelarBudaya: 'Juru Tulis Rontal Bali Dwipa',
    akurasiMenulis: 94.5,
    glifDikuasai: 22,
    eposBintang: 9,
    usulanPreservasi: 8,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: false,
  },
  {
    id: '2',
    nisn: '0081293812',
    nama: 'Ni Made Ayu Dewi',
    avatar: 'AD',
    gelarBudaya: 'Cantrik Rontal Wianjana',
    akurasiMenulis: 74.2,
    glifDikuasai: 12,
    eposBintang: 6,
    usulanPreservasi: 2,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: true,
    glifKendala: {
      aksara: 'Bali',
      glif: 'ᬗ (Nga)',
      catatan: 'Kurva lengkung ekor bawah menyimpang 38% dari template baku rontal.',
    },
  },
  {
    id: '3',
    nisn: '0081293813',
    nama: 'I Ketut Sudharma',
    avatar: 'KS',
    gelarBudaya: 'Cantrik Wianjana Pemula',
    akurasiMenulis: 72.8,
    glifDikuasai: 10,
    eposBintang: 5,
    usulanPreservasi: 1,
    statusAktivitas: 'Kemarin',
    perluRemedi: true,
    glifKendala: {
      aksara: 'Bali',
      glif: 'ᬰ (Sa Saga)',
      catatan: 'Lekukan mahkota atas sering terpotong sebelum lengkung penuh.',
    },
  },
  {
    id: '4',
    nisn: '0081293814',
    nama: 'Ni Luh Putu Savitri',
    avatar: 'PS',
    gelarBudaya: 'Penyurat Rontal Kawi',
    akurasiMenulis: 96.1,
    glifDikuasai: 26,
    eposBintang: 9,
    usulanPreservasi: 12,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: false,
  },
  {
    id: '5',
    nisn: '0081293815',
    nama: 'I Gede Budi Antara',
    avatar: 'BA',
    gelarBudaya: 'Cantrik Aksara Bali',
    akurasiMenulis: 88.4,
    glifDikuasai: 18,
    eposBintang: 8,
    usulanPreservasi: 5,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: false,
  },
  {
    id: '6',
    nisn: '0081293816',
    nama: 'Komang Krisna Murti',
    avatar: 'KM',
    gelarBudaya: 'Penyurat Lontar Madya',
    akurasiMenulis: 91.7,
    glifDikuasai: 20,
    eposBintang: 7,
    usulanPreservasi: 6,
    statusAktivitas: '3 Hari Lalu',
    perluRemedi: false,
  },
];

export const AKTIVITAS_KELAS_TERBARU: AktivitasKelasItem[] = [
  {
    id: 'act-1',
    siswaNama: 'Ni Luh Putu Savitri',
    avatar: 'PS',
    waktu: '5 menit lalu',
    kegiatan: 'Preservasi Naskah Baru',
    tipe: 'pelestarian',
    detail: 'Mengajukan transliterasi lempir 4 Lontar Calon Arang British Library.',
  },
  {
    id: 'act-2',
    siswaNama: 'Wayan Arya Pratama',
    avatar: 'AP',
    waktu: '18 menit lalu',
    kegiatan: 'Sesi Latihan Kanvas AI',
    tipe: 'canvas',
    detail: 'Menyelesaikan karakter Bali [Ka] dengan akurasi model 96%.',
  },
  {
    id: 'act-3',
    siswaNama: 'I Gede Budi Antara',
    avatar: 'BA',
    waktu: '42 menit lalu',
    kegiatan: 'Menamatkan Bab Cerita Rontal',
    tipe: 'cerita',
    detail: 'Menyelesaikan Bab 1 Calon Arang: Rontal Rahasia di Desa Girah.',
  },
];

// ============================================================================
// DATA DETAIL DIAGNOSTIK SISWA (AKSARA BALI)
// ============================================================================

export interface RiwayatCanvasItem {
  id: string;
  aksara: 'bali';
  aksaraNama: string;
  glif: string;
  namaKarakter: string;
  skorAkurasi: number;
  strokeOrderScore: number;
  aspectRatioScore: number;
  smoothnessScore: number;
  tanggal: string;
  status: 'sempurna' | 'baik' | 'remedi';
  catatanAi: string;
}

export interface RiwayatEposItem {
  id: string;
  eposJudul: string;
  aksara: string;
  babSelesai: number;
  totalBab: number;
  bintang: number;
  status: 'Tamat' | 'Sedang Berjalan';
}

export interface RiwayatPreservasiItem {
  id: string;
  kodeArsip: string;
  judulNaskah: string;
  aksara: string;
  usulanTeks: string;
  status: 'terverifikasi' | 'menunggu';
  catatanFilolog: string;
  xpDidapat: number;
  tanggal: string;
}

export interface SiswaDetailData extends SiswaRosterItem {
  catatanGuruTerdahulu: string;
  riwayatCanvas: RiwayatCanvasItem[];
  riwayatEpos: RiwayatEposItem[];
  riwayatPreservasi: RiwayatPreservasiItem[];
}

const DETAIL_FALLBACK_CANVAS: RiwayatCanvasItem[] = [
  {
    id: 'c-1',
    aksara: 'bali',
    aksaraNama: 'Aksara Bali',
    glif: 'ᬓ',
    namaKarakter: 'Ka',
    skorAkurasi: 95,
    strokeOrderScore: 96,
    aspectRatioScore: 94,
    smoothnessScore: 95,
    tanggal: 'Hari ini, 10:15',
    status: 'sempurna',
    catatanAi: 'Goresan kurvalinier sangat proporsional dengan keluwesan naskah rontal.',
  },
  {
    id: 'c-2',
    aksara: 'bali',
    aksaraNama: 'Aksara Bali',
    glif: 'ᬕ',
    namaKarakter: 'Ga',
    skorAkurasi: 88,
    strokeOrderScore: 90,
    aspectRatioScore: 86,
    smoothnessScore: 88,
    tanggal: 'Kemarin, 14:20',
    status: 'baik',
    catatanAi: 'Lekukan tubuh karakter sudah stabil, jaga kontinuitas tarikan busur.',
  },
  {
    id: 'c-3',
    aksara: 'bali',
    aksaraNama: 'Aksara Bali',
    glif: 'ᬗ',
    namaKarakter: 'Nga',
    skorAkurasi: 72,
    strokeOrderScore: 70,
    aspectRatioScore: 74,
    smoothnessScore: 72,
    tanggal: '2 hari lalu',
    status: 'remedi',
    catatanAi: 'Kurva ekor bawah melebar melewati sumbu vertikal. Disarankan mengulang latihan.',
  },
];

const DETAIL_FALLBACK_EPOS: RiwayatEposItem[] = [
  {
    id: 'e-1',
    eposJudul: 'Misteri Mantra Calon Arang',
    aksara: 'Aksara Bali',
    babSelesai: 3,
    totalBab: 3,
    bintang: 9,
    status: 'Tamat',
  },
];

const DETAIL_FALLBACK_PRESERVASI: RiwayatPreservasiItem[] = [
  {
    id: 'p-1',
    kodeArsip: 'BL/EAP-001/BLN',
    judulNaskah: 'Lontar Calon Arang Lembar 1',
    aksara: 'Aksara Bali',
    usulanTeks: 'ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ ᬦᬫᬲᬶᬤ᭄ᬥᬫ᭄',
    status: 'terverifikasi',
    catatanFilolog: 'Transliterasi akurat sesuai rontal aslinya. XP penuh diberikan.',
    xpDidapat: 120,
    tanggal: 'Hari ini, 09:30',
  },
];

export function getSiswaDetailById(id: string): SiswaDetailData {
  const base = DAFTAR_SISWA_ROSTER.find((s) => s.id === id) || DAFTAR_SISWA_ROSTER[0];
  return {
    ...base,
    catatanGuruTerdahulu:
      'Siswa menunjukkan ketelitian tinggi dalam tarikan kurvalinier aksara Bali dan aktif dalam kurasi naskah rontal.',
    riwayatCanvas: DETAIL_FALLBACK_CANVAS,
    riwayatEpos: DETAIL_FALLBACK_EPOS,
    riwayatPreservasi: DETAIL_FALLBACK_PRESERVASI,
  };
}

export function getAdjacentSiswaIds(currentId: string): { prevId: string | null; nextId: string | null } {
  const index = DAFTAR_SISWA_ROSTER.findIndex((s) => s.id === currentId);
  if (index === -1) return { prevId: null, nextId: null };
  const prevId = index > 0 ? DAFTAR_SISWA_ROSTER[index - 1].id : null;
  const nextId = index < DAFTAR_SISWA_ROSTER.length - 1 ? DAFTAR_SISWA_ROSTER[index + 1].id : null;
  return { prevId, nextId };
}
