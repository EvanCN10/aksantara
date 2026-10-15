// ============================================================================
// DATA MOCK ANALITIK KELAS & ROSTER SISWA GURU (PILAR 1-4)
// ============================================================================

export interface SiswaRosterItem {
  id: string;
  nisn: string;
  nama: string;
  avatar: string;
  gelarBudaya: string;
  akurasiMenulis: number; // 0 - 100%
  sesiHardware: number; // jumlah sesi mini-game
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
  aksaraId: 'lontara' | 'sunda' | 'bali';
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
  totalSesiHardware: number;
  totalPreservasi: number;
}

export interface AktivitasKelasItem {
  id: string;
  siswaNama: string;
  avatar: string;
  waktu: string;
  kegiatan: string;
  tipe: 'canvas' | 'hardware' | 'cerita' | 'pelestarian';
  detail: string;
}

export const GURU_PROFILE: GuruClassProfile = {
  namaGuru: 'Ki Ageng Dananjaya',
  gelarAkademik: 'M.Hum.',
  jabatan: 'Pamong Budaya Utama & Kurator Aksara Nusantara',
  nip: '19820412 200801 1 003',
  institusi: 'SMKN 1 Warisan Budaya & Sanggar Aksara Dwipantara',
  namaKelas: 'Kelas X Warisan Aksara (Parahyangan & Luwu)',
  tahunAjaran: 'Tahun Ajaran 2025/2026 - Semester Genap',
  totalSiswa: 34,
  siswaAktif: 32,
  rataRataAkurasi: 89.2,
  totalSesiHardware: 84,
  totalPreservasi: 48,
};

export const GLIF_KRITIS_DATA: GlifKritisItem[] = [
  {
    aksaraId: 'lontara',
    aksaraNama: 'Lontara Bugis',
    glif: 'ᨊ',
    namaGlif: 'Nga (ᨊ)',
    tingkatKesalahan: 42,
    kendalaUmum: 'Pembalikan orientasi sudut belah ketupat Sulapa Eppa pada tarikan kedua.',
  },
  {
    aksaraId: 'sunda',
    aksaraNama: 'Sunda Kuno',
    glif: 'ᮑ',
    namaGlif: 'Nya (ᮑ)',
    tingkatKesalahan: 28,
    kendalaUmum: 'Lekukan garis mahkota atas sering terputus sebelum batas horizontal.',
  },
  {
    aksaraId: 'bali',
    aksaraNama: 'Bali Dwipa',
    glif: 'ᬗ',
    namaGlif: 'Nga (ᬗ)',
    tingkatKesalahan: 35,
    kendalaUmum: 'Tarikan kurva ekor bawah sering memotong grid dasar dan kehilangan proporsi.',
  },
];

export const DAFTAR_SISWA_ROSTER: SiswaRosterItem[] = [
  {
    id: '1',
    nisn: '0081293811',
    nama: 'Raden Arya Nusantara',
    avatar: 'RA',
    gelarBudaya: 'Juru Tulis Madya Parahyangan',
    akurasiMenulis: 94.5,
    sesiHardware: 14,
    eposBintang: 9,
    usulanPreservasi: 8,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: false,
  },
  {
    id: '2',
    nisn: '0081293812',
    nama: 'Siti Rahma Dewata',
    avatar: 'SR',
    gelarBudaya: 'Cantrik Rontal Wianjana',
    akurasiMenulis: 74.2,
    sesiHardware: 5,
    eposBintang: 6,
    usulanPreservasi: 2,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: true,
    glifKendala: {
      aksara: 'Bali',
      glif: 'ᬗ (Nga)',
      catatan: 'Kurva lengkung ekor bawah menyimpang 38% dari template baku.',
    },
  },
  {
    id: '3',
    nisn: '0081293813',
    nama: 'Ahmad Rizky Luwu',
    avatar: 'AR',
    gelarBudaya: 'Cantrik Sulapa Eppa',
    akurasiMenulis: 72.8,
    sesiHardware: 4,
    eposBintang: 5,
    usulanPreservasi: 1,
    statusAktivitas: 'Kemarin',
    perluRemedi: true,
    glifKendala: {
      aksara: 'Lontara',
      glif: 'ᨊ (Nga)',
      catatan: 'Sudut belah ketupat terbalik 180 derajat pada tarikan kanvas.',
    },
  },
  {
    id: '4',
    nisn: '0081293814',
    nama: 'Budi Santoso Parahyangan',
    avatar: 'BS',
    gelarBudaya: 'Juru Tulis Madya Sunda',
    akurasiMenulis: 89.0,
    sesiHardware: 10,
    eposBintang: 8,
    usulanPreservasi: 5,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: false,
  },
  {
    id: '5',
    nisn: '0081293815',
    nama: 'Ni Luh Putu Savitri',
    avatar: 'NL',
    gelarBudaya: 'Penoreh Rontal Madya',
    akurasiMenulis: 96.2,
    sesiHardware: 16,
    eposBintang: 9,
    usulanPreservasi: 12,
    statusAktivitas: 'Aktif Hari Ini',
    perluRemedi: false,
  },
  {
    id: '6',
    nisn: '0081293816',
    nama: 'Andi Mallombasi',
    avatar: 'AM',
    gelarBudaya: 'Punggawa Aksara Lontara',
    akurasiMenulis: 91.4,
    sesiHardware: 12,
    eposBintang: 8,
    usulanPreservasi: 7,
    statusAktivitas: 'Kemarin',
    perluRemedi: false,
  },
  {
    id: '7',
    nisn: '0081293817',
    nama: 'Cecep Hidayat',
    avatar: 'CH',
    gelarBudaya: 'Cantrik Aksara Sunda',
    akurasiMenulis: 84.6,
    sesiHardware: 8,
    eposBintang: 7,
    usulanPreservasi: 4,
    statusAktivitas: '3 Hari Lalu',
    perluRemedi: false,
  },
  {
    id: '8',
    nisn: '0081293818',
    nama: 'I Wayan Gede Dharma',
    avatar: 'IW',
    gelarBudaya: 'Juru Pustaka Kawi',
    akurasiMenulis: 88.5,
    sesiHardware: 9,
    eposBintang: 8,
    usulanPreservasi: 6,
    statusAktivitas: 'Kemarin',
    perluRemedi: false,
  },
];

export const AKTIVITAS_KELAS_TERBARU: AktivitasKelasItem[] = [
  {
    id: 'act-1',
    siswaNama: 'Ni Luh Putu Savitri',
    avatar: 'NL',
    waktu: '10 menit lalu',
    kegiatan: 'Menyelesaikan Preservasi Naskah',
    tipe: 'pelestarian',
    detail: 'Mengusulkan transliterasi Lontar Calon Arang Lembar 1 (EAP-001/BL).',
  },
  {
    id: 'act-2',
    siswaNama: 'Raden Arya Nusantara',
    avatar: 'RA',
    waktu: '25 menit lalu',
    kegiatan: 'Rekor Hardware Speed Match',
    tipe: 'hardware',
    detail: 'Mencapai skor 340 poin dalam 5 ronde kilat konsonan Lontara.',
  },
  {
    id: 'act-3',
    siswaNama: 'Budi Santoso Parahyangan',
    avatar: 'BS',
    waktu: '45 menit lalu',
    kegiatan: 'Latihan Menulis AI Canvas',
    tipe: 'canvas',
    detail: 'Menyelesaikan karakter Sunda [Ka] dengan akurasi 93%.',
  },
  {
    id: 'act-4',
    siswaNama: 'Ahmad Rizky Luwu',
    avatar: 'AR',
    waktu: '1 jam lalu',
    kegiatan: 'Menamatkan Epos Cerita',
    tipe: 'cerita',
    detail: 'Menyelesaikan Bab 2 Sawerigading: Badai di Teluk Bone.',
  },
];

// ============================================================================
// DATA DETAIL DIAGNOSTIK SISWA (PILAR 1-4)
// ============================================================================

export interface RiwayatCanvasItem {
  id: string;
  aksara: 'lontara' | 'sunda' | 'bali';
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

export interface RiwayatHardwareItem {
  id: string;
  game: 'ramu-mantra' | 'speed-match';
  gameNama: string;
  targetSukuKata: string;
  kartuDigunakan: string[];
  durasiDetik: number;
  skor: number;
  tanggal: string;
  status: 'Lulus Sempurna' | 'Berhasil' | 'Perlu Latihan';
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
  riwayatHardware: RiwayatHardwareItem[];
  riwayatEpos: RiwayatEposItem[];
  riwayatPreservasi: RiwayatPreservasiItem[];
}

const DETAIL_FALLBACK_CANVAS: RiwayatCanvasItem[] = [
  {
    id: 'c-1',
    aksara: 'sunda',
    aksaraNama: 'Sunda Parahyangan',
    glif: 'ᮊ',
    namaKarakter: 'Ka (ᮊ)',
    skorAkurasi: 96.0,
    strokeOrderScore: 98,
    aspectRatioScore: 95,
    smoothnessScore: 95,
    tanggal: '13 Okt 2026, 14:20',
    status: 'sempurna',
    catatanAi: 'Lekukan mahkota atas dan garis dasar vertikal simetris dengan referensi Kaganga.',
  },
  {
    id: 'c-2',
    aksara: 'lontara',
    aksaraNama: 'Lontara Bugis',
    glif: 'ᨀ',
    namaKarakter: 'Ka (ᨀ)',
    skorAkurasi: 94.2,
    strokeOrderScore: 95,
    aspectRatioScore: 93,
    smoothnessScore: 94,
    tanggal: '12 Okt 2026, 10:15',
    status: 'sempurna',
    catatanAi: 'Sudut belah ketupat Sulapa Eppa presisi, orientasi sudut tajam 45 derajat.',
  },
  {
    id: 'c-3',
    aksara: 'bali',
    aksaraNama: 'Bali Dwipa',
    glif: 'ᬓ',
    namaKarakter: 'Ka (ᬓ)',
    skorAkurasi: 93.8,
    strokeOrderScore: 92,
    aspectRatioScore: 94,
    smoothnessScore: 95,
    tanggal: '11 Okt 2026, 16:40',
    status: 'baik',
    catatanAi: 'Kurva wianjana proporsional, tarikan ekor bawah tidak memotong batas grid.',
  },
];

const DETAIL_FALLBACK_HARDWARE: RiwayatHardwareItem[] = [
  {
    id: 'h-1',
    game: 'speed-match',
    gameNama: 'Aksara Cepat Tanggap (Speed Match)',
    targetSukuKata: 'ᨁ (Ga)',
    kartuDigunakan: ['ᨁ Konsonan Lontara Ga'],
    durasiDetik: 11.2,
    skor: 340,
    tanggal: '13 Okt 2026, 15:30',
    status: 'Lulus Sempurna',
  },
  {
    id: 'h-2',
    game: 'ramu-mantra',
    gameNama: 'Peramu Suku Kata (Ramu Mantra)',
    targetSukuKata: 'ᮊᮤ (KI)',
    kartuDigunakan: ['ᮊ Konsonan Sunda Ka', 'ᮤ Vokalisasi Panghulu (I)'],
    durasiDetik: 14.8,
    skor: 250,
    tanggal: '12 Okt 2026, 11:00',
    status: 'Lulus Sempurna',
  },
];

const DETAIL_FALLBACK_EPOS: RiwayatEposItem[] = [
  {
    id: 'e-1',
    eposJudul: 'Sawerigading & I La Galigo',
    aksara: 'Lontara Bugis',
    babSelesai: 3,
    totalBab: 3,
    bintang: 3,
    status: 'Tamat',
  },
  {
    id: 'e-2',
    eposJudul: 'Legenda Lutung Kasarung',
    aksara: 'Sunda Parahyangan',
    babSelesai: 3,
    totalBab: 3,
    bintang: 3,
    status: 'Tamat',
  },
  {
    id: 'e-3',
    eposJudul: 'Misteri Mantra Calon Arang',
    aksara: 'Bali Dwipa',
    babSelesai: 3,
    totalBab: 3,
    bintang: 3,
    status: 'Tamat',
  },
];

const DETAIL_FALLBACK_PRESERVASI: RiwayatPreservasiItem[] = [
  {
    id: 'p-1',
    kodeArsip: 'BL/EAP-001/BLN',
    judulNaskah: 'Lontar Calon Arang Lembar 1',
    aksara: 'Bali Kawi',
    usulanTeks: 'Om awighnamastu namasiddham. Yan katekeng purnameng sasih kadasa.',
    status: 'terverifikasi',
    catatanFilolog: 'Transliterasi bait pembuka sangat presisi sesuai naskah rontal Kawi asli.',
    xpDidapat: 75,
    tanggal: '13 Okt 2026',
  },
  {
    id: 'p-2',
    kodeArsip: 'PNRI/KROPAK-408',
    judulNaskah: 'Sewaka Darma Lembar 4',
    aksara: 'Sunda Kuno',
    usulanTeks: 'Ini pakeun nreteskeun sakala rahayu sangkan mulya sabumi.',
    status: 'terverifikasi',
    catatanFilolog: 'Pembacaan glif Saeh Sunda kuno terverifikasi oleh tim epigrafi.',
    xpDidapat: 75,
    tanggal: '11 Okt 2026',
  },
];

export function getSiswaDetailById(id: string): SiswaDetailData | null {
  const base = DAFTAR_SISWA_ROSTER.find((s) => s.id === id);
  if (!base) return null;

  // Custom data for student 3 (Ahmad Rizky Luwu - Remedi)
  if (id === '3') {
    return {
      ...base,
      catatanGuruTerdahulu:
        'Perlu pendampingan khusus pada belah ketupat Sulapa Eppa Lontara. Tarikan sudut kedua masih terbalik 180 derajat.',
      riwayatCanvas: [
        {
          id: 'c-31',
          aksara: 'lontara',
          aksaraNama: 'Lontara Bugis',
          glif: 'ᨊ',
          namaKarakter: 'Nga (ᨊ)',
          skorAkurasi: 65.4,
          strokeOrderScore: 60,
          aspectRatioScore: 68,
          smoothnessScore: 72,
          tanggal: '13 Okt 2026, 09:30',
          status: 'remedi',
          catatanAi: 'Sudut belah ketupat terbalik 180 derajat pada tarikan kanvas kedua. Diperlukan modul remedi.',
        },
        {
          id: 'c-32',
          aksara: 'lontara',
          aksaraNama: 'Lontara Bugis',
          glif: 'ᨀ',
          namaKarakter: 'Ka (ᨀ)',
          skorAkurasi: 78.0,
          strokeOrderScore: 80,
          aspectRatioScore: 76,
          smoothnessScore: 79,
          tanggal: '12 Okt 2026, 14:15',
          status: 'baik',
          catatanAi: 'Garis diagonal cukup baik namun proporsi tinggi glif masih sedikit condong ke kiri.',
        },
        {
          id: 'c-33',
          aksara: 'sunda',
          aksaraNama: 'Sunda Parahyangan',
          glif: 'ᮊ',
          namaKarakter: 'Ka (ᮊ)',
          skorAkurasi: 76.5,
          strokeOrderScore: 78,
          aspectRatioScore: 74,
          smoothnessScore: 78,
          tanggal: '11 Okt 2026, 11:20',
          status: 'baik',
          catatanAi: 'Lekukan mahkota atas agak terburu-buru, perhatikan kelenturan garis.',
        },
      ],
      riwayatHardware: [
        {
          id: 'h-31',
          game: 'ramu-mantra',
          gameNama: 'Peramu Suku Kata (Ramu Mantra)',
          targetSukuKata: 'ᨁᨘ (GU)',
          kartuDigunakan: ['ᨁ Konsonan Lontara Ga', 'ᨘ Vokalisasi Lontara U'],
          durasiDetik: 22.4,
          skor: 180,
          tanggal: '12 Okt 2026, 10:45',
          status: 'Berhasil',
        },
      ],
      riwayatEpos: [
        {
          id: 'e-31',
          eposJudul: 'Sawerigading & I La Galigo',
          aksara: 'Lontara Bugis',
          babSelesai: 2,
          totalBab: 3,
          bintang: 2,
          status: 'Sedang Berjalan',
        },
        {
          id: 'e-32',
          eposJudul: 'Legenda Lutung Kasarung',
          aksara: 'Sunda Parahyangan',
          babSelesai: 2,
          totalBab: 3,
          bintang: 2,
          status: 'Sedang Berjalan',
        },
        {
          id: 'e-33',
          eposJudul: 'Misteri Mantra Calon Arang',
          aksara: 'Bali Dwipa',
          babSelesai: 1,
          totalBab: 3,
          bintang: 1,
          status: 'Sedang Berjalan',
        },
      ],
      riwayatPreservasi: [
        {
          id: 'p-31',
          kodeArsip: 'BL/EAP-153/LUW',
          judulNaskah: 'Sureq Galigo Luwu Lembar 1',
          aksara: 'Lontara Luwu',
          usulanTeks: 'Iyyami riaseng neneq mallomo...',
          status: 'menunggu',
          catatanFilolog: 'Sedang dalam antrean kurasi epigrafi Bugis kuno.',
          xpDidapat: 75,
          tanggal: '13 Okt 2026',
        },
      ],
    };
  }

  // Custom data for student 2 (Siti Rahma Dewata - Remedi Bali)
  if (id === '2') {
    return {
      ...base,
      catatanGuruTerdahulu:
        'Goresan vokal Bali cukup lentur, namun glif Nga (ᬗ) masih sering melorot di bawah garis dasar panduan rontal.',
      riwayatCanvas: [
        {
          id: 'c-21',
          aksara: 'bali',
          aksaraNama: 'Bali Dwipa',
          glif: 'ᬗ',
          namaKarakter: 'Nga (ᬗ)',
          skorAkurasi: 68.2,
          strokeOrderScore: 65,
          aspectRatioScore: 66,
          smoothnessScore: 73,
          tanggal: '13 Okt 2026, 11:10',
          status: 'remedi',
          catatanAi: 'Kurva lengkung ekor bawah menyimpang 38% dari template baku Wianjana.',
        },
        {
          id: 'c-22',
          aksara: 'bali',
          aksaraNama: 'Bali Dwipa',
          glif: 'ᬓ',
          namaKarakter: 'Ka (ᬓ)',
          skorAkurasi: 88.5,
          strokeOrderScore: 90,
          aspectRatioScore: 87,
          smoothnessScore: 89,
          tanggal: '12 Okt 2026, 15:00',
          status: 'baik',
          catatanAi: 'Proporsi garis sangat rapi dan harmonis.',
        },
      ],
      riwayatHardware: DETAIL_FALLBACK_HARDWARE,
      riwayatEpos: [
        {
          id: 'e-21',
          eposJudul: 'Misteri Mantra Calon Arang',
          aksara: 'Bali Dwipa',
          babSelesai: 2,
          totalBab: 3,
          bintang: 2,
          status: 'Sedang Berjalan',
        },
        {
          id: 'e-22',
          eposJudul: 'Legenda Lutung Kasarung',
          aksara: 'Sunda Parahyangan',
          babSelesai: 2,
          totalBab: 3,
          bintang: 2,
          status: 'Sedang Berjalan',
        },
        {
          id: 'e-23',
          eposJudul: 'Sawerigading & I La Galigo',
          aksara: 'Lontara Bugis',
          babSelesai: 2,
          totalBab: 3,
          bintang: 2,
          status: 'Sedang Berjalan',
        },
      ],
      riwayatPreservasi: DETAIL_FALLBACK_PRESERVASI.slice(0, 1),
    };
  }

  // Default / Exemplary student (e.g. Raden Arya id '1' or others)
  return {
    ...base,
    catatanGuruTerdahulu:
      'Prestasi literasi sangat unggul di ketiga aksara Trinitas. Menunjukkan dedikasi tinggi pada preservasi naskah kuno rontal.',
    riwayatCanvas: DETAIL_FALLBACK_CANVAS,
    riwayatHardware: DETAIL_FALLBACK_HARDWARE,
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

