// ============================================================================
// DATA TANTANGAN MINI-GAME KINESTETIK (RAMU MANTRA & SPEED MATCH)
// ============================================================================

export interface RamuMantraQuest {
  ronde: number;
  aksaraId: 'sunda' | 'lontara' | 'bali';
  aksaraNama: string;
  targetKonsonanSimbol: string;
  targetKonsonanLabel: string;
  targetDiakritikSimbol: string;
  targetDiakritikLabel: string;
  targetSukuKata: string;
  targetLatin: string;
  petunjuk: string;
  xpReward: number;
}

export interface SpeedMatchQuest {
  ronde: number;
  pertanyaan: string;
  targetSimbol: string;
  targetLabel: string;
  tipe: 'konsonan' | 'diakritik';
  aksaraId: 'sunda' | 'lontara' | 'bali';
  aksaraNama: string;
  alokasiDetik: number;
  xpReward: number;
}

// 5 Ronde Tantangan Meramu Mantra Suku Kata (Konsonan + Diakritik)
export const RAMU_MANTRA_QUESTS: RamuMantraQuest[] = [
  {
    ronde: 1,
    aksaraId: 'sunda',
    aksaraNama: 'Aksara Sunda',
    targetKonsonanSimbol: 'ᮊ',
    targetKonsonanLabel: 'Ka',
    targetDiakritikSimbol: 'ᮤ',
    targetDiakritikLabel: 'Panghulu (i)',
    targetSukuKata: 'ᮊᮤ',
    targetLatin: 'KI',
    petunjuk: 'Letakkan konsonan Sunda Ka [ᮊ] di Slot 1 dan tanda vokal Panghulu [ᮤ] di Slot 2.',
    xpReward: 50,
  },
  {
    ronde: 2,
    aksaraId: 'lontara',
    aksaraNama: 'Aksara Lontara',
    targetKonsonanSimbol: 'ᨁ',
    targetKonsonanLabel: 'Ga',
    targetDiakritikSimbol: 'ᨘ',
    targetDiakritikLabel: 'Tukki (u)',
    targetSukuKata: 'ᨁᨘ',
    targetLatin: 'GU',
    petunjuk: 'Letakkan konsonan Lontara Ga [ᨁ] di Slot 1 dan tanda vokal Tukki [ᨘ] di Slot 2.',
    xpReward: 50,
  },
  {
    ronde: 3,
    aksaraId: 'bali',
    aksaraNama: 'Aksara Bali',
    targetKonsonanSimbol: 'ᬢ',
    targetKonsonanLabel: 'Ta',
    targetDiakritikSimbol: 'ᬶ',
    targetDiakritikLabel: 'Ulu (i)',
    targetSukuKata: 'ᬢᬶ',
    targetLatin: 'TI',
    petunjuk: 'Letakkan konsonan Bali Ta [ᬢ] di Slot 1 dan tanda vokal Ulu [ᬶ] di Slot 2.',
    xpReward: 50,
  },
  {
    ronde: 4,
    aksaraId: 'sunda',
    aksaraNama: 'Aksara Sunda',
    targetKonsonanSimbol: 'ᮘ',
    targetKonsonanLabel: 'Ba',
    targetDiakritikSimbol: 'ᮥ',
    targetDiakritikLabel: 'Panyuku (u)',
    targetSukuKata: 'ᮘᮥ',
    targetLatin: 'BU',
    petunjuk: 'Letakkan konsonan Sunda Ba [ᮘ] di Slot 1 dan tanda vokal Panyuku [ᮥ] di Slot 2.',
    xpReward: 50,
  },
  {
    ronde: 5,
    aksaraId: 'lontara',
    aksaraNama: 'Aksara Lontara',
    targetKonsonanSimbol: 'ᨀ',
    targetKonsonanLabel: 'Ka',
    targetDiakritikSimbol: 'ᨗ',
    targetDiakritikLabel: 'Tetta (i)',
    targetSukuKata: 'ᨀᨗ',
    targetLatin: 'KI',
    petunjuk: 'Letakkan konsonan Lontara Ka [ᨀ] di Slot 1 dan tanda vokal Tetta [ᨗ] di Slot 2.',
    xpReward: 50,
  },
];

// 5 Ronde Tantangan Aksara Cepat Tanggap (Speed Match 15 Detik)
export const SPEED_MATCH_QUESTS: SpeedMatchQuest[] = [
  {
    ronde: 1,
    pertanyaan: 'Tempelkan konsonan GA dari Aksara Lontara!',
    targetSimbol: 'ᨁ',
    targetLabel: 'Ga',
    tipe: 'konsonan',
    aksaraId: 'lontara',
    aksaraNama: 'Aksara Lontara',
    alokasiDetik: 15,
    xpReward: 50,
  },
  {
    ronde: 2,
    pertanyaan: 'Tempelkan tanda diakritik PANGHULU [i] dari Aksara Sunda!',
    targetSimbol: 'ᮤ',
    targetLabel: 'Panghulu (i)',
    tipe: 'diakritik',
    aksaraId: 'sunda',
    aksaraNama: 'Aksara Sunda',
    alokasiDetik: 15,
    xpReward: 50,
  },
  {
    ronde: 3,
    pertanyaan: 'Tempelkan konsonan TA dari Aksara Bali Wianjana!',
    targetSimbol: 'ᬢ',
    targetLabel: 'Ta',
    tipe: 'konsonan',
    aksaraId: 'bali',
    aksaraNama: 'Aksara Bali',
    alokasiDetik: 15,
    xpReward: 50,
  },
  {
    ronde: 4,
    pertanyaan: 'Tempelkan konsonan BA dari Aksara Sunda Ngalagena!',
    targetSimbol: 'ᮘ',
    targetLabel: 'Ba',
    tipe: 'konsonan',
    aksaraId: 'sunda',
    aksaraNama: 'Aksara Sunda',
    alokasiDetik: 15,
    xpReward: 50,
  },
  {
    ronde: 5,
    pertanyaan: 'Tempelkan tanda diakritik ULU [i] dari Aksara Bali!',
    targetSimbol: 'ᬶ',
    targetLabel: 'Ulu (i)',
    tipe: 'diakritik',
    aksaraId: 'bali',
    aksaraNama: 'Aksara Bali',
    alokasiDetik: 15,
    xpReward: 50,
  },
];
