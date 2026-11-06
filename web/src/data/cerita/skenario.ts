// ============================================================================
// SKENARIO CERITA INTERAKTIF (STORY BEATS ENGINE - AKSARA BALI)
// ============================================================================

export type TipeBeat = 'dialog' | 'narasi' | 'pilihan' | 'kanvas';

export interface AksaraHighlight {
  simbol: string;
  label: string;
  makna: string;
}

export interface OpsiJawaban {
  id: string;
  teks: string;
  benar: boolean;
  penjelasan?: string;
}

export interface StoryBeat {
  id: string;
  tipe: TipeBeat;
  karakterId?: string;
  pembicaraNama?: string;
  teks: string;
  aksaraHighlight?: AksaraHighlight;
  pertanyaan?: string;
  opsiJawaban?: OpsiJawaban[];
  petunjukBantuan?: string;
  targetGlif?: {
    slug: string;
    simbol: string;
    label: string;
    petunjuk: string;
  };
}

export interface SkenarioBab {
  eposSlug: string;
  babNomor: number;
  judulBab: string;
  eposJudul: string;
  aksaraId: 'bali';
  sceneBg?: string;
  xpReward: number;
  beats: StoryBeat[];
}

// SKENARIO EPOS 3: CALON ARANG (BALI) - TRILOGI RONTAL DEWATA LENGKAP
// ============================================================================

export const SKENARIO_CALON_ARANG_BAB_1: SkenarioBab = {
  eposSlug: 'calon-arang',
  babNomor: 1,
  judulBab: 'Rontal Rahasia di Desa Girah',
  eposJudul: 'Misteri Mantra Calon Arang',
  aksaraId: 'bali',
  xpReward: 150,
  beats: [
    {
      id: 'ca-1-beat-1',
      tipe: 'dialog',
      karakterId: 'calon-arang-arya',
      pembicaraNama: 'Mpu Arya',
      teks:
        'Malam purnama temaram di atas rimba Girah. Kabut tebal menyelimuti desa yang terkena kutukan wabah. Guru Bharadah, di manakah naskah lontar rahasia itu disembunyikan?',
    },
    {
      id: 'ca-1-beat-2',
      tipe: 'dialog',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Tenangkan batinmu, Arya. Masuklah ke bilik candi pemujaan di barat desa. Di sanalah tersimpan peti tembaga berukir aksara Bali Wianjana yang mengunci lembaran daun rontal keramat.',
    },
    {
      id: 'ca-1-beat-3',
      tipe: 'narasi',
      teks:
        'Di tengah kesunyian candi tua berbatu hitam andesit, sebuah peti kuno berhias ukiran sulur pepatran khas Bali tampak berpendar redup di atas altar sesaji.',
    },
    {
      id: 'ca-1-beat-4',
      tipe: 'dialog',
      karakterId: 'calon-arang-arya',
      pembicaraNama: 'Mpu Arya',
      teks:
        'Gembok peti ini memiliki segel aksara Wianjana pertama yang harus dipulihkan sebelum mantra daun lontar dapat terbaca!',
      aksaraHighlight: {
        simbol: 'ᬓ',
        label: 'Ka',
        makna:
          'Salah satu konsonan Wianjana utama aksara Bali (Ha-Na-Ca-Ra-Ka), melambangkan daya cipta dan perisai spiritual batin.',
      },
    },
    {
      id: 'ca-1-beat-5',
      tipe: 'pilihan',
      petunjukBantuan: 'Dalam tradisi nyurat lontar Bali, aksara digoreskan menggunakan pisau pengrupak lalu dihitamkan dengan minyak kemiri.',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Sebelum menyentuh naskah suci, buktikan pemahamanmu: Alat apakah yang secara tradisional digunakan oleh para undagi dan pujangga Bali untuk menulis aksara di atas daun lontar?',
      pertanyaan: 'Alat tradisional apakah yang digunakan untuk menggoreskan aksara di atas daun lontar (nyurat lontar) di Bali?',
      opsiJawaban: [
        {
          id: 'opt-1',
          teks: 'Pengrupak (pisau besi berujung lancip)',
          benar: true,
          penjelasan:
            'Tepat sekali! Tradisi nyurat lontar menggunakan pisau pengrupak, lalu bekas goresannya dihitamkan dengan jelaga minyak kemiri gosong.',
        },
        {
          id: 'opt-2',
          teks: 'Kuas bulu bambu bertinta bak hitam',
          benar: false,
          penjelasan: 'Kuas bertinta adalah tradisi kaligrafi Asia Timur, bukan tradisi lontar rontal Bali.',
        },
        {
          id: 'opt-3',
          teks: 'Pena bulu angsa bertinta getah damar',
          benar: false,
          penjelasan: 'Pena bulu lazim di tradisi Eropa abad pertengahan; daun lontar Bali digores dengan pisau pengrupak.',
        },
      ],
    },
    {
      id: 'ca-1-beat-6',
      tipe: 'kanvas',
      teks:
        'Tantangan Goresan In-Story: Goreskan aksara ᬓ (Ka) dengan pisau pengrupak batinmu untuk membuka segel peti lontar.',
      targetGlif: {
        slug: 'ka',
        simbol: 'ᬓ',
        label: 'Ka',
        petunjuk: 'Goreskan dua gelombang lengkung simetris khas aksara Bali Wianjana.',
      },
      petunjukBantuan: 'Goreskan dua gelombang lengkung simetris khas aksara Bali Wianjana Ka.',
    },
    {
      id: 'ca-1-beat-7',
      tipe: 'dialog',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Svaha! Segel tembaga terbuka! Lembaran daun rontal terbentang harum beraroma minyak cendana. Kita telah siap menyingkap mantra penunduk wabah!',
    },
  ],
};

export const SKENARIO_CALON_ARANG_BAB_2: SkenarioBab = {
  eposSlug: 'calon-arang',
  babNomor: 2,
  judulBab: 'Tarian Api Barong & Rangda',
  eposJudul: 'Misteri Mantra Calon Arang',
  aksaraId: 'bali',
  xpReward: 250,
  beats: [
    {
      id: 'ca-2-beat-1',
      tipe: 'narasi',
      teks:
        'Saat malam sandikala tiba di perbatasan rimba Girah, kobaran api mistis berkobar tinggi. Sosok Rangda bertaring panjang berhadapan dengan Barong Ket penegak Dharma.',
    },
    {
      id: 'ca-2-beat-2',
      tipe: 'dialog',
      karakterId: 'calon-arang-arya',
      pembicaraNama: 'Mpu Arya',
      teks:
        'Hawa panas membakar pepohonan! Api amarah Calon Arang semakin membesar! Kita harus merapalkan mantra penyeimbang sebelum desa hangus terbakar!',
    },
    {
      id: 'ca-2-beat-3',
      tipe: 'dialog',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Ingatlah ajaran Rwa Bhineda: kebajikan dan angkara murka selalu berdampingan di jagat raya. Rapalkan aksara ᬢ (Ta) untuk meredam kobaran api menjadi ketenangan!',
      aksaraHighlight: {
        simbol: 'ᬢ',
        label: 'Ta',
        makna: 'Glif Wianjana pelambang ketetapan hati, keteguhan tapa brata, dan ketenangan batin semesta.',
      },
    },
    {
      id: 'ca-2-beat-4',
      tipe: 'pilihan',
      petunjukBantuan: 'Tanda vokalisasi pengubah bunyi vokal dalam sistem penulisan aksara Bali disebut Pangangge Suara.',
      karakterId: 'calon-arang-arya',
      pembicaraNama: 'Mpu Arya',
      teks:
        'Pertajam ilmu mantramu: Apakah sebutan untuk tanda vokalisasi (pengubah bunyi vokal) dalam sistem penulisan aksara Bali?',
      pertanyaan: 'Apakah nama tanda vokalisasi (diakritik pengubah bunyi) dalam aksara Bali?',
      opsiJawaban: [
        {
          id: 'opt-1',
          teks: 'Pangangge Suara (Ulu, Suku, Taling, Tedung)',
          benar: true,
          penjelasan:
            'Tepat sekali! Pangangge Suara mencakup Ulu untuk bunyi [i], Suku untuk [u], Taling untuk [e], Tedung untuk vokal panjang [a], dll.',
        },
        {
          id: 'opt-2',
          teks: 'Rarangken Panyuku',
          benar: false,
          penjelasan: 'Pengangge adalah istilah tanda vokalisasi dalam aksara Bali.',
        },
        {
          id: 'opt-3',
          teks: 'Sandhangan Swara',
          benar: false,
          penjelasan: 'Sandhangan swara adalah istilah tanda vokal dalam tradisi aksara Jawa.',
        },
      ],
    },
    {
      id: 'ca-2-beat-5',
      tipe: 'dialog',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Mantra telah tersusun dengan benar! Sekarang, goreskan aksara ᬢ (Ta) ke angkasa malam untuk memadamkan amukan api Rangda!',
    },
    {
      id: 'ca-2-beat-6',
      tipe: 'kanvas',
      teks: 'Tantangan Goresan In-Story: Goreskan glif ᬢ (Ta) penyeimbang jagat untuk menenangkan kobaran api.',
      targetGlif: {
        slug: 'ta',
        simbol: 'ᬢ',
        label: 'Ta',
        petunjuk: 'Tarik garis meliuk tegas dengan puncak busur khas aksara Bali.',
      },
      petunjukBantuan: 'Tarik garis meliuk tegas dengan puncak busur khas aksara Bali Ta.',
    },
    {
      id: 'ca-2-beat-7',
      tipe: 'dialog',
      karakterId: 'calon-arang-arya',
      pembicaraNama: 'Mpu Arya',
      teks:
        'Ajaib! Kobaran api merah mereda, berganti hembusan angin sejuk bertabur kelopak bunga kamboja putih! Sosok Rangda kembali tenang dalam pelukan Barong pelindung!',
    },
  ],
};

export const SKENARIO_CALON_ARANG_BAB_3: SkenarioBab = {
  eposSlug: 'calon-arang',
  babNomor: 3,
  judulBab: 'Harmoni Jagat Hyang Widhi',
  eposJudul: 'Misteri Mantra Calon Arang',
  aksaraId: 'bali',
  xpReward: 350,
  beats: [
    {
      id: 'ca-3-beat-1',
      tipe: 'narasi',
      teks:
        'Fajar keemasan menyingsing di lereng suci Gunung Agung. Penduduk desa Girah berkumpul membawa sesaji canang sari untuk upacara ruwatan agung penyucian jagat.',
    },
    {
      id: 'ca-3-beat-2',
      tipe: 'dialog',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Wabah telah sirna dan kedamaian telah bersemi kembali. Namun kedamaian ini harus diabadikan dalam prasasti tembaga agar anak cucu kelak ingat pada kesucian bumi.',
    },
    {
      id: 'ca-3-beat-3',
      tipe: 'dialog',
      karakterId: 'calon-arang-arya',
      pembicaraNama: 'Mpu Arya',
      teks:
        'Prasasti tembaga telah disiapkan, Guru. Glif apakah yang menjadi mahkota penutup doa ruwatan agung ini?',
      aksaraHighlight: {
        simbol: 'ᬩ',
        label: 'Ba',
        makna:
          'Glif kemuliaan, berkah kesuburan bumi, dan ketenteraman abadi seluruh ciptaan Ida Sang Hyang Widhi Wasa.',
      },
    },
    {
      id: 'ca-3-beat-4',
      tipe: 'pilihan',
      petunjukBantuan: 'Falsafah tiga keharmonisan hidup masyarakat Bali (Tuhan, manusia, dan alam) adalah Tri Hita Karana.',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Ujian kebijaksanaan paripurna: Filosofi hidup luhur masyarakat Bali yang menjaga keharmonisan antara Manusia, Alam, dan Tuhan disebut apa?',
      pertanyaan: 'Apakah nama falsafah hidup masyarakat Bali yang menjaga tiga keharmonisan kosmos semesta?',
      opsiJawaban: [
        {
          id: 'opt-1',
          teks: 'Tri Hita Karana (Parahyangan, Pawongan, Palemahan)',
          benar: true,
          penjelasan:
            'Benar sekali! Tri Hita Karana adalah pilar harmoni Bali: hubungan suci dengan Tuhan, sesama manusia, dan alam lingkungan.',
        },
        {
          id: 'opt-2',
          teks: 'Catur Purusartha',
          benar: false,
          penjelasan: 'Catur Purusartha adalah empat tujuan hidup manusia dalam ajaran Hindu (Dharma, Artha, Kama, Moksha).',
        },
        {
          id: 'opt-3',
          teks: 'Sad Ripu',
          benar: false,
          penjelasan: 'Sad Ripu adalah enam musuh dalam diri manusia yang harus dikendalikan.',
        },
      ],
    },
    {
      id: 'ca-3-beat-5',
      tipe: 'dialog',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Hatimu telah matang dalam kebijaksanaan, muridku Arya. Torehkan aksara pamungkas ᬩ (Ba) di atas lempengan tembaga sakral ini!',
    },
    {
      id: 'ca-3-beat-6',
      tipe: 'kanvas',
      teks:
        'Tantangan Goresan In-Story: Torehkan glif pamungkas ᬩ (Ba) pada prasasti tembaga perdamaian dewata.',
      targetGlif: {
        slug: 'ba',
        simbol: 'ᬩ',
        label: 'Ba',
        petunjuk: 'Goreskan lengkung dasar ganda meliuk dengan keluwesan aksara Bali kuno.',
      },
      petunjukBantuan: 'Goreskan lengkung dasar ganda meliuk dengan keluwesan aksara Bali Ba.',
    },
    {
      id: 'ca-3-beat-7',
      tipe: 'dialog',
      karakterId: 'calon-arang-arya',
      pembicaraNama: 'Mpu Arya',
      teks:
        'Om Shanti Shanti Shanti Om! Prasasti telah selesai terukir megah! Jagat Bali kembali tentram, indah, dan lestari berkat keagungan aksara leluhur kita!',
    },
  ],
};

// ============================================================================
// ============================================================================
// HELPER LOADER SKENARIO
// ============================================================================

export function getSceneBgPath(eposSlug: string, babNomor: number): string {
  const bab = Math.min(Math.max(babNomor, 1), 3);
  return `/images/stories/scenes/scene-calonarang-bab${bab}.webp`;
}

export function getSkenarioBab(eposSlug: string, babNomor: number): SkenarioBab {
  let base: SkenarioBab;

  if (babNomor === 1) base = SKENARIO_CALON_ARANG_BAB_1;
  else if (babNomor === 2) base = SKENARIO_CALON_ARANG_BAB_2;
  else if (babNomor === 3) base = SKENARIO_CALON_ARANG_BAB_3;
  else base = getFallbackSkenario(eposSlug, babNomor);

  return {
    ...base,
    sceneBg: base.sceneBg || getSceneBgPath(eposSlug, babNomor),
  };
}

function getFallbackSkenario(eposSlug: string, babNomor: number): SkenarioBab {
  const defaultGlif = { slug: 'ka', simbol: 'ᬓ', label: 'Ka' };

  return {
    eposSlug: 'calon-arang',
    babNomor,
    judulBab: `Petualangan Epos Bab ${babNomor}`,
    eposJudul: 'Misteri Mantra Calon Arang',
    aksaraId: 'bali',
    sceneBg: getSceneBgPath(eposSlug, babNomor),
    xpReward: 200,
    beats: [
      {
        id: 'beat-intro',
        tipe: 'narasi',
        teks: `Babak baru dibuka dalam lontar rontal Calon Arang. Menuntut kemahiran goresan aksara Bali yang lebih mendalam.`,
      },
      {
        id: 'beat-dialog-1',
        tipe: 'dialog',
        karakterId: 'calon-arang-arya',
        pembicaraNama: 'Mpu Arya',
        teks: 'Tantangan di depan menuntut ketenangan batin. Bersiaplah menggoreskan glif wianjana berikutnya!',
        aksaraHighlight: {
          simbol: defaultGlif.simbol,
          label: defaultGlif.label,
          makna: 'Karakter kunci untuk menundukkan marabahaya di desa Girah.',
        },
      },
      {
        id: 'beat-canvas-challenge',
        tipe: 'kanvas',
        teks: `Tantangan Goresan: Pulihkan aksara ${defaultGlif.label} (${defaultGlif.simbol}) untuk melanjutkan perjalanan.`,
        targetGlif: {
          slug: defaultGlif.slug,
          simbol: defaultGlif.simbol,
          label: defaultGlif.label,
          petunjuk: 'Goreskan karakter dengan kurva meliuk halus khas naskah rontal Bali.',
        },
        petunjukBantuan: 'Goreskan karakter dengan kurva meliuk halus khas naskah rontal Bali.',
      },
      {
        id: 'beat-finish',
        tipe: 'dialog',
        karakterId: 'calon-arang-arya',
        pembicaraNama: 'Mpu Arya',
        teks: 'Bagus sekali! Rintangan bab ini telah berhasil kita lewati bersama.',
      },
    ],
  };
}
