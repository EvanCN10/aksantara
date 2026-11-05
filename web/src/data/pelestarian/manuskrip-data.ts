// ============================================================================
// DATA KOLEKSI MANUSKRIP KUNO RONTAL (AKSARA BALI)
// ============================================================================

export interface ManuskripItem {
  id: string;
  kodeArsip: string;
  judul: string;
  imageUrl?: string;
  aksaraId: 'bali';
  aksaraNama: string;
  asalKoleksi: string;
  abad: string;
  mediaNaskah: string;
  deskripsi: string;
  simbolSampel: string;
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
  },
  {
    id: 'sutasoma-kirtya',
    kodeArsip: 'GK/KROPAK-139/ST',
    judul: 'Kakawin Sutasoma Pupuh 139',
    imageUrl: '/images/manuscripts/manuskrip-calon-arang-bali.webp',
    aksaraId: 'bali',
    aksaraNama: 'Aksara Bali (Bhinneka Tunggal Ika)',
    asalKoleksi: 'Gedong Kirtya Singaraja',
    abad: 'Abad ke-14 Masehi',
    mediaNaskah: 'Daun Lontar Rontal Bertali Benang Tridatu',
    deskripsi:
      'Naskah rontal mahakarya Mpu Tantular yang memuat falsafah persatuan bangsa "Bhinneka Tunggal Ika tan Hana Dharma Mangrwa". Diukir dengan aksara Bali Swalalita klasik.',
    simbolSampel: 'ᬩ᭄ᬳᬶᬦ᭄ᬦᬾᬓ ᬢᬸᬗ᭄ᬕᬮ᭄ ᬇᬓ ᬢᬦ᭄ ᬳᬦ ᬥᬃᬫ ᬫᬗ᭄ᬃᬯ',
  },
  {
    id: 'usadha-bali',
    kodeArsip: 'GK/LNT-042/PRM',
    judul: 'Lontar Usadha Taru Pramana',
    imageUrl: '/images/manuscripts/manuskrip-calon-arang-bali.webp',
    aksaraId: 'bali',
    aksaraNama: 'Aksara Bali (Pengobatan Tradisional)',
    asalKoleksi: 'Pusat Dokumentasi Kebudayaan Bali',
    abad: 'Abad ke-17 Masehi',
    mediaNaskah: 'Daun Lontar Rontal Nyurat Usadha',
    deskripsi:
      'Kompilasi pengetahuan medis dan botani tradisional Bali mengenai khasiat tanaman obat nusantara dalam tulisan aksara Bali Wianjana bersistem vokal lengkap.',
    simbolSampel: 'ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ',
  },
];
