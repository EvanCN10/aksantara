// ============================================================================
// SKENARIO CERITA INTERAKTIF (STORY BEATS ENGINE)
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
  karakterId?: string; // id karakter dari DAFTAR_KARAKTER
  pembicaraNama?: string;
  teks: string;
  aksaraHighlight?: AksaraHighlight;
  // Khusus tipe 'pilihan'
  pertanyaan?: string;
  opsiJawaban?: OpsiJawaban[];
  // Khusus tipe 'kanvas'
  targetGlif?: {
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
  aksaraId: 'lontara' | 'sunda' | 'bali';
  xpReward: number;
  beats: StoryBeat[];
}

// ============================================================================
// SKENARIO PILOT 1: SAWERIGADING (LONTARA) — BAB 1: PANGGILAN SAMUDRA LUWU
// ============================================================================

export const SKENARIO_SAWERIGADING_BAB_1: SkenarioBab = {
  eposSlug: 'sawerigading',
  babNomor: 1,
  judulBab: 'Panggilan Samudra Luwu',
  eposJudul: 'Kisah Sawerigading & I La Galigo',
  aksaraId: 'lontara',
  xpReward: 150,
  beats: [
    {
      id: 'beat-1',
      tipe: 'dialog',
      karakterId: 'sawerigading',
      pembicaraNama: 'Sawerigading',
      teks:
        'Lihatlah cakrawala di Teluk Bone itu, Sahabatku! Angin musim timur mulai bertiup kencang. Waktu pelayaran akbar kita telah tiba!',
    },
    {
      id: 'beat-2',
      tipe: 'narasi',
      teks:
        'Di dermaga Kerajaan Luwu, perahu pinisi raksasa bersandar megah. Di haluan kapal, terdapat ukiran prasasti kayu berusia ratusan tahun warisan Batara Guru.',
    },
    {
      id: 'beat-3',
      tipe: 'dialog',
      karakterId: 'sawerigading',
      pembicaraNama: 'Sawerigading',
      teks:
        'Sebelum kita membentangkan layar tanja, kita harus memeriksa ukiran keramat di kemudi haluan ini.',
      aksaraHighlight: {
        simbol: 'ᨀ',
        label: 'Ka',
        makna: 'Konsonan dasar bersudut belah ketupat penanda fondasi bumi dan kestabilan perahu.',
      },
    },
    {
      id: 'beat-4',
      tipe: 'pilihan',
      karakterId: 'sawerigading',
      pembicaraNama: 'Sawerigading',
      teks:
        'Uji pemahamanmu sebelum berlayar: Berdasarkan filosofi Sulapa Eppa Lontara, apa arti pola geometris belah ketupat pada aksara ᨀ (Ka)?',
      pertanyaan: 'Apa makna filosofis empat sudut Sulapa Eppa pada aksara Lontara?',
      opsiJawaban: [
        {
          id: 'opt-1',
          teks: 'Empat musim di benua seberang lautan',
          benar: false,
          penjelasan: 'Bukan musim, tradisi maritim Bugis berakar pada unsur alam.',
        },
        {
          id: 'opt-2',
          teks: 'Empat unsur pembentuk jagat: Air, Api, Angin, dan Tanah',
          benar: true,
          penjelasan: 'Tepat sekali! Sulapa Eppa melambangkan keseimbangan kosmos alam.',
        },
        {
          id: 'opt-3',
          teks: 'Empat jenis kayu bahan perahu pinisi',
          benar: false,
          penjelasan: 'Kayu pinisi memang istimewa, namun Sulapa Eppa merujuk pada filosofi kosmos.',
        },
      ],
    },
    {
      id: 'beat-5',
      tipe: 'dialog',
      karakterId: 'sawerigading',
      pembicaraNama: 'Sawerigading',
      teks:
        'Jawabanmu sungguh bijak! Sekarang, ukiran ᨀ (Ka) pada kemudi kayu ini memudar diterpa ombak garam. Goreskan kembali glif ini di kanvas pusaka agar kemudi terkunci aman!',
    },
    {
      id: 'beat-6',
      tipe: 'kanvas',
      teks:
        'Tantangan Goresan In-Story: Pulihkan aksara ᨀ (Ka) pada batu prasasti kemudi pinisi.',
      targetGlif: {
        simbol: 'ᨀ',
        label: 'Ka',
        petunjuk: 'Tarik dua garis belah ketupat simetris yang bertaut tegas.',
      },
    },
    {
      id: 'beat-7',
      tipe: 'dialog',
      karakterId: 'sawerigading',
      pembicaraNama: 'Sawerigading',
      teks:
        'Luar biasa! Kemudi pinisi bergetar dan bercahaya keemasan! Layar tanja telah terkembang sempurna. Kita siap mengarungi samudra menuju Tanah Melayu!',
    },
  ],
};

// ============================================================================
// SKENARIO EPOS 2: LUTUNG KASARUNG (SUNDA) — TRILOGI PASUNDAN LENGKAP
// ============================================================================

export const SKENARIO_LUTUNG_KASARUNG_BAB_1: SkenarioBab = {
  eposSlug: 'lutung-kasarung',
  babNomor: 1,
  judulBab: 'Pengasingan Putri Purbasari',
  eposJudul: 'Legenda Lutung Kasarung',
  aksaraId: 'sunda',
  xpReward: 150,
  beats: [
    {
      id: 'lk-1-beat-1',
      tipe: 'dialog',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Rimba Gunung Cupu ini begitu sunyi dan lebat. Kakanda Purbararang tega mengasingkanku hanya karena dengki... Namun aku percaya Hyang Keresa tidak akan menelantarkan orang yang berhati tulus.',
    },
    {
      id: 'lk-1-beat-2',
      tipe: 'dialog',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Krak! Jangan berputus asa, wahai Tuan Putri berhati murni! Akulah sang penunggu rimba ini. Lihatlah batu bertulis di dekat akar pohon beringin tua itu!',
    },
    {
      id: 'lk-1-beat-3',
      tipe: 'narasi',
      teks:
        'Di bawah naungan beringin purba, sebuah prasasti batu cadas bertuliskan deretan aksara Sunda kuno Ngalagena mulai terlihat di balik lumut basah.',
    },
    {
      id: 'lk-1-beat-4',
      tipe: 'dialog',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Untuk menyingkap jalan setapak rahasia menuju mata air telaga, kita harus memulihkan ukiran lambang keteguhan raga ini.',
      aksaraHighlight: {
        simbol: 'ᮊ',
        label: 'Ka',
        makna:
          'Konsonan dasar Ngalagena bertanduk ganda menyerupai tanduk kerbau pembajak sawah, melambangkan ketabahan insan bumi Pasundan.',
      },
    },
    {
      id: 'lk-1-beat-5',
      tipe: 'pilihan',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Mari kita uji ingatanmu: Menurut naskah Sunda kuna, media apakah yang lazim digunakan para resi leluhur Tatar Sunda untuk menuliskan aksara?',
      pertanyaan: 'Media naskah tradisional apakah yang lazim digunakan untuk menulis aksara Sunda kuna?',
      opsiJawaban: [
        {
          id: 'opt-1',
          teks: 'Kertas dluwang pohon Saeh dan daun lontar kropak',
          benar: true,
          penjelasan:
            'Tepat sekali! Naskah Sunda Kuna seperti Sanghyang Siksakanda Ng Karesian ditulis di atas daun lontar dan kertas kulit kayu dluwang Saeh.',
        },
        {
          id: 'opt-2',
          teks: 'Lembaran kain sutra Tiongkok kuno',
          benar: false,
          penjelasan: 'Kain sutra adalah komoditas niaga, bukan media utama penyalinan naskah kuno Sunda.',
        },
        {
          id: 'opt-3',
          teks: 'Pelat besi tempa dari gunung berapi',
          benar: false,
          penjelasan: 'Pelat besi sangat jarang digunakan; naskah kuno Sunda menggunakan media nabati alam.',
        },
      ],
    },
    {
      id: 'lk-1-beat-6',
      tipe: 'kanvas',
      teks:
        'Tantangan Goresan In-Story: Pulihkan aksara ᮊ (Ka) pada batu prasasti untuk membuka jalan air rahasia.',
      targetGlif: {
        simbol: 'ᮊ',
        label: 'Ka',
        petunjuk: 'Tarik lengkung dasar dan dua cabang tanduk lancip di bagian atas.',
      },
    },
    {
      id: 'lk-1-beat-7',
      tipe: 'dialog',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Alangkah indahnya! Batu prasasti itu memancarkan kilau zamrud kehijauan. Gemericik air telaga suci mulai terdengar dari balik rimbun semak bambu!',
    },
  ],
};

export const SKENARIO_LUTUNG_KASARUNG_BAB_2: SkenarioBab = {
  eposSlug: 'lutung-kasarung',
  babNomor: 2,
  judulBab: 'Telaga Sunyi Sang Hyang',
  eposJudul: 'Legenda Lutung Kasarung',
  aksaraId: 'sunda',
  xpReward: 200,
  beats: [
    {
      id: 'lk-2-beat-1',
      tipe: 'dialog',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Inilah Telaga Kahyangan Sang Hyang Mandalasena! Airnya sejernih embun pagi dan mampu melunturkan segala bisa fitnah duniawi.',
    },
    {
      id: 'lk-2-beat-2',
      tipe: 'dialog',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Wajahku yang dicoreng boreh hitam oleh Purbararang terasa pedih... Guruminda, apakah air telaga ini sungguh dapat memulihkan rupaku?',
    },
    {
      id: 'lk-2-beat-3',
      tipe: 'dialog',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Pasti, Tuan Putri! Namun sebelum membasuh raga, pusatkan batinmu pada glif suci ᮒ (Ta) yang menenangkan kalbu.',
      aksaraHighlight: {
        simbol: 'ᮒ',
        label: 'Ta',
        makna: 'Glif konsonan Ngalagena bermakna keteguhan tekad dan penolak mara bahaya batin.',
      },
    },
    {
      id: 'lk-2-beat-4',
      tipe: 'pilihan',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Uji wawasan aksara Sunda: Dalam sistem penulisan aksara Sunda, tanda vokalisasi penambah atau perubah bunyi vokal disebut apa?',
      pertanyaan: 'Apakah nama tanda vokalisasi (diakritik) dalam sistem aksara Sunda?',
      opsiJawaban: [
        {
          id: 'opt-1',
          teks: 'Sandhangan',
          benar: false,
          penjelasan: 'Sandhangan adalah istilah tanda diakritik dalam aksara Jawa (Hanacaraka).',
        },
        {
          id: 'opt-2',
          teks: 'Rarangken',
          benar: true,
          penjelasan:
            'Benar! Rarangken adalah tanda vokalisasi (panghulu untuk bunyi [i], panyuku untuk [u], paneuleung untuk [eu], dll.) pada aksara Sunda.',
        },
        {
          id: 'opt-3',
          teks: 'Pangangge Suara',
          benar: false,
          penjelasan: 'Pangangge suara adalah istilah tanda vokal dalam tradisi aksara Bali.',
        },
      ],
    },
    {
      id: 'lk-2-beat-5',
      tipe: 'dialog',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Pemahamanmu sungguh mengagumkan! Sekarang, goreskan aksara ᮒ (Ta) di atas cermin air telaga pusaka untuk merapalkan doa penyembuh!',
    },
    {
      id: 'lk-2-beat-6',
      tipe: 'kanvas',
      teks: 'Tantangan Goresan In-Story: Lukiskan glif ᮒ (Ta) pada permukaan telaga berkilau.',
      targetGlif: {
        simbol: 'ᮒ',
        label: 'Ta',
        petunjuk: 'Goreskan garis tegak melengkung dengan lekukan anggun di bagian tengah.',
      },
    },
    {
      id: 'lk-2-beat-7',
      tipe: 'dialog',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Luar biasa! Boreh hitam di paras dan lenganku lenyap seketika! Kulitku kembali putih bersih bercahaya laksana rembulan purnama. Terima kasih, Guruminda sahabatku!',
    },
  ],
};

export const SKENARIO_LUTUNG_KASARUNG_BAB_3: SkenarioBab = {
  eposSlug: 'lutung-kasarung',
  babNomor: 3,
  judulBab: 'Kembalinya Sang Guruminda',
  eposJudul: 'Legenda Lutung Kasarung',
  aksaraId: 'sunda',
  xpReward: 300,
  beats: [
    {
      id: 'lk-3-beat-1',
      tipe: 'narasi',
      teks:
        'Di hadapan balairung megah keraton Pasundan, ribuan rakyat dan Prabu Tapa Ageung berkumpul menyaksikan pembuktian kebenaran antara Putri Purbasari dan Purbararang.',
    },
    {
      id: 'lk-3-beat-2',
      tipe: 'dialog',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Waktunya menyingkap tabir sejati telah tiba! Tidak ada dusta yang abadi saat kebenaran luhur menyingsing bak fajar.',
    },
    {
      id: 'lk-3-beat-3',
      tipe: 'dialog',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Ayahanda Prabu, kebenaran bukan terletak pada kemegahan busana lahiriah, melainkan pada kemurnian budi dan wasiat aksara para leluhur.',
      aksaraHighlight: {
        simbol: 'ᮘ',
        label: 'Ba',
        makna: 'Glif keagungan dan berkah kemakmuran abadi yang mengokohkan takhta keadilan.',
      },
    },
    {
      id: 'lk-3-beat-4',
      tipe: 'pilihan',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Ujian puncak kearifan: Nilai utama apakah yang diajarkan dalam epos Carita Lutung Kasarung naskah Pantun Bogor kuno?',
      pertanyaan: 'Nilai moral utama apakah yang menjadi inti ajaran epos Carita Lutung Kasarung?',
      opsiJawaban: [
        {
          id: 'opt-1',
          teks: 'Kekuasaan mutlak seorang penguasa atas rakyatnya',
          benar: false,
          penjelasan: 'Kekuasaan tanpa kebajikan akan runtuh seperti ketamakan Purbararang.',
        },
        {
          id: 'opt-2',
          teks: 'Ketulusan hati dan kemurnian budi mengalahkan kedengkian fana',
          benar: true,
          penjelasan:
            'Tepat sekali! Kemurnian batin Purbasari dan kesetiaan Guruminda adalah esensi keluhuran budaya Parahyangan.',
        },
        {
          id: 'opt-3',
          teks: 'Mengejar emas permata demi kemakmuran keraton',
          benar: false,
          penjelasan: 'Harta benda fana tidak dapat menyelamatkan martabat dan kesucian jiwa manusia.',
        },
      ],
    },
    {
      id: 'lk-3-beat-5',
      tipe: 'dialog',
      karakterId: 'lutung-kasarung',
      pembicaraNama: 'Sang Guruminda',
      teks:
        'Kilatan cahaya emas membubung ke angkasa—sosok kera lutung meluruh, menjelma menjadi Sang Hyang Guruminda, kesatria tampan dari kahyangan! Sekarang, Tuan Putri, materaikan piagam damai ini dengan glif ᮘ (Ba)!',
    },
    {
      id: 'lk-3-beat-6',
      tipe: 'kanvas',
      teks:
        'Tantangan Goresan In-Story: Tuliskan glif pamungkas ᮘ (Ba) pada naskah piagam perdamaian Pasundan.',
      targetGlif: {
        simbol: 'ᮘ',
        label: 'Ba',
        petunjuk: 'Buat kotak terbuka melengkung dengan ciri khas lekukan simetris aksara Sunda.',
      },
    },
    {
      id: 'lk-3-beat-7',
      tipe: 'dialog',
      karakterId: 'purbasari',
      pembicaraNama: 'Putri Purbasari',
      teks:
        'Titah perdamaian telah dimeteraikan! Purbararang diampuni, dan seluruh negeri Pasundan kembali bersatu dalam kedamaian dan kemakmuran aksara leluhur kita!',
    },
  ],
};

// ============================================================================
// SKENARIO EPOS 3: CALON ARANG (BALI) — TRILOGI RONTAL DEWATA LENGKAP
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
          'Konsonan Wianjana pertama aksara Bali, melambangkan awal mula penciptaan dan perisai spiritual penangkal marabahaya batin.',
      },
    },
    {
      id: 'ca-1-beat-5',
      tipe: 'pilihan',
      karakterId: 'mpu-bharadah',
      pembicaraNama: 'Mpu Bharadah',
      teks:
        'Sebelum menyentuh naskah suci, buktikan pemahamanmu: Alat apakah yang secara tradisional digunakan oleh para undagi dan pujangga Bali untuk menulis aksara di atas daun lontar?',
      pertanyaan: 'Alat tradisional apakah yang digunakan untuk menggoreskan aksara di atas daun lontar (*nyurat lontar*) di Bali?',
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
        simbol: 'ᬓ',
        label: 'Ka',
        petunjuk: 'Goreskan dua gelombang lengkung simetris khas aksara Bali Wianjana.',
      },
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
          penjelasan: 'Rarangken adalah istilah tanda vokalisasi dalam aksara Sunda.',
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
        simbol: 'ᬢ',
        label: 'Ta',
        petunjuk: 'Tarik garis meliuk tegas dengan puncak busur khas aksara Bali.',
      },
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
        simbol: 'ᬩ',
        label: 'Ba',
        petunjuk: 'Goreskan lengkung dasar ganda meliuk dengan keluwesan aksara Bali kuno.',
      },
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
// HELPER LOADER SKENARIO
// ============================================================================

export function getSkenarioBab(eposSlug: string, babNomor: number): SkenarioBab {
  const slug = eposSlug.toLowerCase();

  // 1. Epos Sawerigading (Lontara)
  if (slug === 'sawerigading' && babNomor === 1) {
    return SKENARIO_SAWERIGADING_BAB_1;
  }

  // 2. Epos Lutung Kasarung (Sunda)
  if (slug === 'lutung-kasarung') {
    if (babNomor === 1) return SKENARIO_LUTUNG_KASARUNG_BAB_1;
    if (babNomor === 2) return SKENARIO_LUTUNG_KASARUNG_BAB_2;
    if (babNomor === 3) return SKENARIO_LUTUNG_KASARUNG_BAB_3;
  }

  // 3. Epos Calon Arang (Bali)
  if (slug === 'calon-arang') {
    if (babNomor === 1) return SKENARIO_CALON_ARANG_BAB_1;
    if (babNomor === 2) return SKENARIO_CALON_ARANG_BAB_2;
    if (babNomor === 3) return SKENARIO_CALON_ARANG_BAB_3;
  }

  // Fallback scenario generator untuk bab-bab lainnya jika dibuka
  const isLontara = slug === 'sawerigading';
  const isSunda = slug === 'lutung-kasarung';

  const defaultAksara = isLontara ? 'lontara' : isSunda ? 'sunda' : 'bali';
  const defaultGlif = isLontara ? { simbol: 'ᨁ', label: 'Ga' } : isSunda ? { simbol: 'ᮊ', label: 'Ka' } : { simbol: 'ᬓ', label: 'Ka' };

  return {
    eposSlug,
    babNomor,
    judulBab: `Petualangan Epos Bab ${babNomor}`,
    eposJudul: isLontara ? 'I La Galigo' : isSunda ? 'Lutung Kasarung' : 'Calon Arang',
    aksaraId: defaultAksara,
    xpReward: 200,
    beats: [
      {
        id: 'beat-intro',
        tipe: 'narasi',
        teks: `Babak baru dimulai dalam perjalanan ${eposSlug}. Perjalanan ini menuntut kemahiran aksara yang lebih mendalam.`,
      },
      {
        id: 'beat-dialog-1',
        tipe: 'dialog',
        karakterId: isLontara ? 'sawerigading' : isSunda ? 'purbasari' : 'calon-arang-arya',
        pembicaraNama: isLontara ? 'Sawerigading' : isSunda ? 'Putri Purbasari' : 'Mpu Arya',
        teks: 'Tantangan di depan semakin menantang. Bersiaplah mengenali glif rahasia berikutnya!',
        aksaraHighlight: {
          simbol: defaultGlif.simbol,
          label: defaultGlif.label,
          makna: 'Karakter kunci untuk memecahkan teka-teki bab ini.',
        },
      },
      {
        id: 'beat-canvas-challenge',
        tipe: 'kanvas',
        teks: `Tantangan Goresan: Pulihkan aksara ${defaultGlif.label} (${defaultGlif.simbol}) untuk melanjutkan perjalanan.`,
        targetGlif: {
          simbol: defaultGlif.simbol,
          label: defaultGlif.label,
          petunjuk: 'Goreskan karakter dengan proporsi simetris.',
        },
      },
      {
        id: 'beat-finish',
        tipe: 'dialog',
        karakterId: isLontara ? 'sawerigading' : isSunda ? 'purbasari' : 'calon-arang-arya',
        pembicaraNama: isLontara ? 'Sawerigading' : isSunda ? 'Putri Purbasari' : 'Mpu Arya',
        teks: 'Bagus sekali! Rintangan bab ini telah berhasil kita lewati bersama.',
      },
    ],
  };
}
