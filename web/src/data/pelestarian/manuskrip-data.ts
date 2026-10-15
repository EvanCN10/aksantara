// ============================================================================
// DATA KOLEKSI MANUSKRIP KUNO & KURASI KOMUNITAS (PILAR 4)
// ============================================================================

export interface ManuskripItem {
  id: string;
  kodeArsip: string;
  judul: string;
  imageUrl?: string;
  aksaraId: 'lontara' | 'sunda' | 'bali';
  aksaraNama: string;
  asalKoleksi: string;
  abad: string;
  mediaNaskah: string;
  deskripsi: string;
  simbolSampel: string;
  prediksiOcrAi: string;
  confidenceScore: number;
  transliterasiBaku: string;
  segmenDeteksi: { id: string; x: number; y: number; w: number; h: number; teks: string }[];
}

export interface KurasiStatusItem {
  id: string;
  kodeArsip: string;
  judulNaskah: string;
  aksaraId: 'lontara' | 'sunda' | 'bali';
  pengusulNama: string;
  tanggalUsulan: string;
  usulanTeks: string;
  status: 'terverifikasi' | 'menunggu' | 'tinjauan';
  catatanFilolog?: string;
  kuratorNama?: string;
}

export const DAFTAR_MANUSKRIP: ManuskripItem[] = [
  {
    id: 'calon-arang-eap',
    kodeArsip: 'BL/EAP-001/BLN',
    judul: 'Lontar Calon Arang Lembar 1',
    imageUrl: '/images/manuscripts/manuskrip-calon-arang-bali.webp',
    aksaraId: 'bali',
    aksaraNama: 'Aksara Bali (Kakawin Kawi)',
    asalKoleksi: 'British Library Endangered Archives Programme',
    abad: 'Abad ke-16 Masehi',
    mediaNaskah: 'Daun Lontar Rontal (Nyurat Pengrupak)',
    deskripsi:
      'Naskah kuno rontal yang memuat mantra pembuka ruwatan desa Girah. Ditulis menggunakan aksara Bali Wianjana gaya Kawi kuno dengan torehan jelaga minyak kemiri.',
    simbolSampel: 'ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ ᬦᬫᬲᬶᬤ᭄ᬥᬫ᭄',
    prediksiOcrAi: 'Om awighnamastu namasiddham... [teks bait kedua memudar]',
    confidenceScore: 88,
    transliterasiBaku: 'Om awighnamastu namasiddham. Yan katekeng purnameng sasih kadasa.',
    segmenDeteksi: [
      { id: 'box-1', x: 12, y: 25, w: 28, h: 45, teks: 'ᬑᬁ ᬅᬯᬶᬖ᭄ᬦ (Om awighna)' },
      { id: 'box-2', x: 42, y: 22, w: 26, h: 48, teks: 'ᬫᬲ᭄ᬢᬸ (mastu)' },
      { id: 'box-3', x: 70, y: 24, w: 24, h: 46, teks: 'ᬦᬫᬲᬶᬤ᭄ᬥᬫ᭄ (namasiddham)' },
    ],
  },
  {
    id: 'sewaka-darma-pnri',
    kodeArsip: 'PNRI/KROPAK-408',
    judul: 'Carita Sewaka Darma Lembar 4',
    imageUrl: '/images/manuscripts/manuskrip-sewaka-darma-sunda.webp',
    aksaraId: 'sunda',
    aksaraNama: 'Aksara Sunda Kuno (Kropak)',
    asalKoleksi: 'Perpustakaan Nasional Republik Indonesia (PNRI)',
    abad: 'Abad ke-15 Masehi',
    mediaNaskah: 'Kertas Kulit Kayu Dluwang Saeh',
    deskripsi:
      'Naskah tuntunan moral luhur spiritual Parahyangan beraksara Sunda Kuno Ngalagena purba. Menguraikan laku tapa dan kesucian budi manusia.',
    simbolSampel: 'ᮔᮤᮠᮔ᮪ ᮞᮤᮔᮥᮛᮒ᮪ ᮓᮩᮚᮤ ᮕᮥᮔ᮪',
    prediksiOcrAi: 'Nihan sinurat deui pun... [dua karakter terpotong noda]',
    confidenceScore: 92,
    transliterasiBaku: 'Nihan sinurat deui pun. Ini carita sewaka darma ngaranya.',
    segmenDeteksi: [
      { id: 'box-1', x: 15, y: 20, w: 25, h: 50, teks: 'ᮔᮤᮠᮔ᮪ (Nihan)' },
      { id: 'box-2', x: 44, y: 20, w: 28, h: 50, teks: 'ᮞᮤᮔᮥᮛᮒ᮪ (sinurat)' },
      { id: 'box-3', x: 74, y: 20, w: 20, h: 50, teks: 'ᮓᮩᮚᮤ ᮕᮥᮔ᮪ (deui pun)' },
    ],
  },
  {
    id: 'sureq-galigo-eap',
    kodeArsip: 'BL/EAP-153/LWU',
    judul: 'Sureq Galigo Naskah Luwu Jilid 2',
    imageUrl: '/images/manuscripts/manuskrip-sureq-galigo-lontara.webp',
    aksaraId: 'lontara',
    aksaraNama: 'Aksara Lontara Bugis (Sulapa Eppa)',
    asalKoleksi: 'Koleksi Naskah Keraton Luwu & Arsip Leiden',
    abad: 'Abad ke-18 Masehi',
    mediaNaskah: 'Daun Lontar Ijuk Berbingkai Kayu Bitti',
    deskripsi:
      'Petikan naskah epik maritim terpanjang di dunia Sureq Galigo. Mengisahkan pelayaran Sawerigading mengarungi Laut Jawa bertuliskan aksara belah ketupat.',
    simbolSampel: 'ᨕᨗᨐᨊ ᨔᨙᨓ ᨀᨑᨙᨅ ᨆᨊᨘᨑᨘ',
    prediksiOcrAi: 'Iyana sewa kareba manuru... [aksara sudut pudar]',
    confidenceScore: 85,
    transliterasiBaku: 'Iyana sewa kareba manurung ri Luwu lalo masse.',
    segmenDeteksi: [
      { id: 'box-1', x: 10, y: 25, w: 26, h: 45, teks: 'ᨕᨗᨐᨊ (Iyana)' },
      { id: 'box-2', x: 38, y: 25, w: 28, h: 45, teks: 'ᨔᨙᨓ ᨀᨑᨙᨅ (sewa kareba)' },
      { id: 'box-3', x: 68, y: 25, w: 26, h: 45, teks: 'ᨆᨊᨘᨑᨘ (manuru...)' },
    ],
  },
];

export const DAFTAR_KURASI_STATUS: KurasiStatusItem[] = [
  {
    id: 'kur-001',
    kodeArsip: 'BL/EAP-001/BLN',
    judulNaskah: 'Lontar Calon Arang Lembar 1',
    aksaraId: 'bali',
    pengusulNama: 'Raden Arya Nusantara',
    tanggalUsulan: '12 Okt 2026',
    usulanTeks: 'Om awighnamastu namasiddham. Yan katekeng purnameng sasih kadasa.',
    status: 'terverifikasi',
    catatanFilolog:
      'Koreksi pembacaan bait kedua telah tepat sesuai metrum Kakawin Kawi kuno dan diverifikasi bersama naskah pembanding koleksi Kirtya Singaraja.',
    kuratorNama: 'Dr. I Wayan Sastrawan, M.Hum (Ahli Filologi Lontar)',
  },
  {
    id: 'kur-002',
    kodeArsip: 'PNRI/KROPAK-408',
    judulNaskah: 'Carita Sewaka Darma Lembar 4',
    aksaraId: 'sunda',
    pengusulNama: 'Siswa Mahir Sunda 02',
    tanggalUsulan: '13 Okt 2026',
    usulanTeks: 'Nihan sinurat deui pun. Ini carita sewaka darma ngaranya ti heula.',
    status: 'menunggu',
    catatanFilolog:
      'Usulan telah masuk ke antrean kurasi. Menunggu validasi lintas-pembacaan dengan naskah Sewaka Darma naskah Ciburuy Garut.',
    kuratorNama: 'Tim Epigrafi Sunda Kuno UNPAD',
  },
  {
    id: 'kur-003',
    kodeArsip: 'BL/EAP-153/LWU',
    judulNaskah: 'Sureq Galigo Naskah Luwu Jilid 2',
    aksaraId: 'lontara',
    pengusulNama: 'Siswa Peneliti Bugis 05',
    tanggalUsulan: '13 Okt 2026',
    usulanTeks: 'Iyana sewa kareba manurung ri Luwu riesso minggu.',
    status: 'tinjauan',
    catatanFilolog:
      'Kata terakhir "riesso minggu" perlu diperiksa ulang karena kata serapan "minggu" biasanya belum lazim pada abad naskah asli dibuat.',
    kuratorNama: 'Drs. Andi Tenri Gappa (Pemerhati Naskah Bugis Kuno)',
  },
  {
    id: 'kur-004',
    kodeArsip: 'BL/EAP-001/BLN',
    judulNaskah: 'Lontar Calon Arang Lembar 2',
    aksaraId: 'bali',
    pengusulNama: 'Komunitas Sastra Dewata',
    tanggalUsulan: '14 Okt 2026',
    usulanTeks: 'Mwah tdaning sang hyang agni murub ring madhyaning setra.',
    status: 'terverifikasi',
    catatanFilolog:
      'Pembacaan sangat akurat. Glif sandhangan wianjana yang patah berhasil direkonstruksi dengan sempurna.',
    kuratorNama: 'Dr. I Wayan Sastrawan, M.Hum (Ahli Filologi Lontar)',
  },
];
