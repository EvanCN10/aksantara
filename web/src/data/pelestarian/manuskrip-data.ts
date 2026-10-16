// ============================================================================
// DATA KOLEKSI MANUSKRIP KUNO (PILAR 4 - PRESERVASI BUDAYA)
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
  },
];
