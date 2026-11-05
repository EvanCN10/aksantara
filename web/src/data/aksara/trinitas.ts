// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export type KategoriGlif = 'konsonan' | 'vokal' | 'diakritik' | 'variasi-vokal' | 'suku-kata';
export type VokalSuara = 'a' | 'i' | 'u' | 'e' | 'o' | 'pepet' | 'eu' | 'é';
export type StatusKuasai = 'belum' | 'latihan' | 'dikuasai';

export interface GlifData {
  slug: string;
  simbol: string;
  label: string;
  ipa: string;
  artikulasi: string;
  catatan: string;
  kesulitan: 1 | 2 | 3;
  xp: number;
  kategori: KategoriGlif;
  vokal?: VokalSuara;
  statusBawaan?: StatusKuasai;
}

export interface AksaraDetail {
  id: string;
  nama: string;
  aksaraAsli: string;
  asal: string;
  wilayah: string;
  karakter: string;
  glifList: GlifData[];
}

// ============================================================================
// REPOSITORI DATA GLIF AKSARA BALI
// ============================================================================

export const KATALOG_DATA: Record<string, AksaraDetail> = {
  bali: {
    id: 'bali',
    nama: 'Aksara Bali',
    aksaraAsli: 'ᬅᬓ᭄ᬱᬭ',
    asal: 'Bali & Lombok',
    wilayah: 'Bali Dwipa',
    karakter: 'Kurvalinier mengalir dinamis dengan tingkat kerumitan tinggi, gantungan, dan gempelan naskah rontal suci.',
    glifList: [
      {
        slug: 'ka',
        simbol: 'ᬓ',
        label: 'Ka',
        ipa: '[ka]',
        artikulasi: 'Wianjana kanthya',
        catatan: 'Aksara wianjana pertama dengan lengkungan gelombang ganda harmonis.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'dikuasai',
      },
      {
        slug: 'kha',
        simbol: 'ᬔ',
        label: 'Kha',
        ipa: '[kʰa]',
        artikulasi: 'Kanthya aspirat (Kha Kantia)',
        catatan: 'Glif Kha (swalalita khakantia) bernapas panjang dengan ornamen lingkar di puncak kurva.',
        kesulitan: 3,
        xp: 100,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ga',
        simbol: 'ᬕ',
        label: 'Ga',
        ipa: '[ga]',
        artikulasi: 'Wianjana bersuara',
        catatan: 'Tarikan kontinu satu nafas melambangkan ketenangan sastra rontal.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'dikuasai',
      },
      {
        slug: 'gha',
        simbol: 'ᬖ',
        label: 'Gha',
        ipa: '[ɡʱa]',
        artikulasi: 'Aspirat bersuara (Ga Gora)',
        catatan: 'Karakter Gha (swalalita gagora), langka dalam naskah Sansekerta dan Kakawin Kawi kuno.',
        kesulitan: 3,
        xp: 100,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'nga',
        simbol: 'ᬗ',
        label: 'Nga',
        ipa: '[ŋa]',
        artikulasi: 'Anunasika kanthya',
        catatan: 'Lengkungan bawah fleksibel penanda resonansi rongga hidung.',
        kesulitan: 2,
        xp: 75,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'latihan',
      },
      {
        slug: 'ca',
        simbol: 'ᬘ',
        label: 'Ca',
        ipa: '[t͡ʃa]',
        artikulasi: 'Wianjana talawya',
        catatan: 'Kurva lembut langit-langit mulut dengan simpul kanan khas dewata.',
        kesulitan: 2,
        xp: 75,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ja',
        simbol: 'ᬚ',
        label: 'Ja',
        ipa: '[d͡ʒa]',
        artikulasi: 'Talawya bersuara',
        catatan: 'Struktur kurva bertingkat yang memerlukan stabilitas tarikan tangan.',
        kesulitan: 2,
        xp: 75,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'nya',
        simbol: 'ᬜ',
        label: 'Nya',
        ipa: '[ɲa]',
        artikulasi: 'Anunasika talawya',
        catatan: 'Lekukan nasal palatal yang sangat anggun tergores di daun lontar.',
        kesulitan: 3,
        xp: 100,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ta',
        simbol: 'ᬢ',
        label: 'Ta',
        ipa: '[ta]',
        artikulasi: 'Wianjana dantya',
        catatan: 'Lekukan gigi dengan kelenturan kurva warisan aksara Pallawa luhur.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'dikuasai',
      },
      {
        slug: 'da',
        simbol: 'ᬤ',
        label: 'Da',
        ipa: '[da]',
        artikulasi: 'Dantya bersuara',
        catatan: 'Lengkung tunggal menanjak dengan dasar lingkaran kokoh.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'na',
        simbol: 'ᬦ',
        label: 'Na',
        ipa: '[na]',
        artikulasi: 'Anunasika dantya',
        catatan: 'Karakter nasal ujung lidah dengan dua gelombang simetris.',
        kesulitan: 2,
        xp: 75,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'pa',
        simbol: 'ᬧ',
        label: 'Pa',
        ipa: '[pa]',
        artikulasi: 'Wianjana osthya',
        catatan: 'Bentuk bibir terbuka membulat dengan kelembutan sudut estetik.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ba',
        simbol: 'ᬩ',
        label: 'Ba',
        ipa: '[ba]',
        artikulasi: 'Osthya bersuara',
        catatan: 'Struktur melingkar bersusun penanda bunyi bilabial padat.',
        kesulitan: 2,
        xp: 75,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ma',
        simbol: 'ᬫ',
        label: 'Ma',
        ipa: '[ma]',
        artikulasi: 'Anunasika osthya',
        catatan: 'Dua kurva bersisian lambang penutupan bibir dalam sastra weda.',
        kesulitan: 2,
        xp: 75,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ya',
        simbol: 'ᬬ',
        label: 'Ya',
        ipa: '[ja]',
        artikulasi: 'Antasthya palatal',
        catatan: 'Aliran semivokal lentur seperti riak tirta amerta suci.',
        kesulitan: 2,
        xp: 75,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ra',
        simbol: 'ᬭ',
        label: 'Ra',
        ipa: '[ra]',
        artikulasi: 'Antasthya murdhanya',
        catatan: 'Gelombang getar lidah tajam dengan ujung mengayun ke atas.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'la',
        simbol: 'ᬮ',
        label: 'La',
        ipa: '[la]',
        artikulasi: 'Antasthya dantya',
        catatan: 'Garis sisi lidah mengalir tenang khas naskah lontar Usada Bali.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'wa',
        simbol: 'ᬯ',
        label: 'Wa',
        ipa: '[wa]',
        artikulasi: 'Antasthya osthya',
        catatan: 'Lengkungan bundar berhias lekuk dasar yang tenang dan anggun.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'sa',
        simbol: 'ᬲ',
        label: 'Sa',
        ipa: '[sa]',
        artikulasi: 'Usma dantya',
        catatan: 'Desis gigi dengan kombinasi kurva ganda yang anggun dan berwibawa.',
        kesulitan: 3,
        xp: 100,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'ha',
        simbol: 'ᬳ',
        label: 'Ha',
        ipa: '[ha]',
        artikulasi: 'Wianjana muladhar',
        catatan: 'Konsonan pangkal tenggorokan pembuka seluruh baris wianjana aksara Bali.',
        kesulitan: 1,
        xp: 50,
        kategori: 'konsonan',

        vokal: 'a',
        statusBawaan: 'belum',
      },
      // VOKAL MANDIRI (SWARA)
      {
        slug: 'swara-a',
        simbol: 'ᬅ',
        label: 'Akara (A)',
        ipa: '[a]',
        artikulasi: 'Aksara swara pembuka',
        catatan: 'Simbol vokal suci aksara Brahma pembuka seluruh bait kidung puja mantra.',
        kesulitan: 2,
        xp: 75,
        kategori: 'vokal',
        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'swara-i',
        simbol: 'ᬇ',
        label: 'Ikara (I)',
        ipa: '[i]',
        artikulasi: 'Aksara swara tinggi',
        catatan: 'Swara murni vokal /i/ dalam bait kekawin suci dan naskah kidung kuno.',
        kesulitan: 2,
        xp: 75,
        kategori: 'vokal',
        vokal: 'i',
        statusBawaan: 'belum',
      },
      // DIAKRITIK (PANGANGGE)
      {
        slug: 'ulu',
        simbol: '◌ᬶ',
        label: 'Ulu (i)',
        ipa: '[i]',
        artikulasi: 'Pangangge suara atas',
        catatan: 'Lingkaran mungil di atas badan aksara penanda bunyi vokal /i/.',
        kesulitan: 1,
        xp: 50,
        kategori: 'diakritik',
        vokal: 'i',
        statusBawaan: 'belum',
      },
      {
        slug: 'suku',
        simbol: '◌ᬸ',
        label: 'Suku (u)',
        ipa: '[u]',
        artikulasi: 'Pangangge suara bawah',
        catatan: 'Lengkungan ke bawah di kaki aksara penanda vokal bulat /u/.',
        kesulitan: 1,
        xp: 50,
        kategori: 'diakritik',
        vokal: 'u',
        statusBawaan: 'belum',
      },
      {
        slug: 'taling',
        simbol: 'ᬾ◌',
        label: 'Taling (e)',
        ipa: '[e]',
        artikulasi: 'Pangangge suara depan',
        catatan: 'Pengubah vokal /e/ yang diletakkan mendahului aksara wianjana.',
        kesulitan: 2,
        xp: 75,
        kategori: 'diakritik',
        vokal: 'e',
        statusBawaan: 'belum',
      },
      {
        slug: 'tedung',
        simbol: '◌ᬵ',
        label: 'Tedung (aː)',
        ipa: '[aː]',
        artikulasi: 'Pangangge suara panjang',
        catatan: 'Tiang tegak di kanan aksara pemanjang vokal atau pembentuk gabungan vokal /o/.',
        kesulitan: 1,
        xp: 50,
        kategori: 'diakritik',
        vokal: 'a',
        statusBawaan: 'belum',
      },
      {
        slug: 'cecek',
        simbol: '◌ᬂ',
        label: 'Cecek (ng)',
        ipa: '[ŋ]',
        artikulasi: 'Pangangge tengenan sengau',
        catatan: 'Titik bulan sabit di atas aksara penanda sengau penutup suku kata /ng/.',
        kesulitan: 2,
        xp: 75,
        kategori: 'diakritik',
        statusBawaan: 'belum',
      },
      {
        slug: 'adeg-adeg',
        simbol: '◌᭄',
        label: 'Adeg-adeg (Paten)',
        ipa: '[-]',
        artikulasi: 'Pangangge tengenan pembunuh',
        catatan: 'Penutup suku kata untuk mematikan vokal /a/ pada konsonan akhir kalimat.',
        kesulitan: 2,
        xp: 75,
        kategori: 'diakritik',
        statusBawaan: 'belum',
      },
    ],
  },
};



function createModelGlyph(
  classId: number, simbol: string, label: string, ipa: string,
  kategori: KategoriGlif, catatan: string,
  vokal?: VokalSuara,
): GlifData {
  return {
    slug: `kelas-${classId}`, simbol, label, ipa, kategori, catatan,
    artikulasi: kategori === 'vokal' ? 'Swara mandiri' : 'Konsonan serapan',
    kesulitan: 2, xp: 75, statusBawaan: 'belum',
    ...(vokal ? { vokal } : {}),
  };
}


export const MODEL_GLIF_DATA: Record<'bali', readonly GlifData[]> = {
  bali: [
    createModelGlyph(0, "ᬪ", "Bha", "[bʱa]", "konsonan", "Ba kembang (bha), konsonan swalalita beraspirasi.", "a"),
    createModelGlyph(1, "ᬙ", "Cha", "[t͡ʃʰa]", "konsonan", "Ca laca (cha), konsonan swalalita beraspirasi.", "a"),
    createModelGlyph(2, "ᬥ", "Dha", "[dʱa]", "konsonan", "Da madu (dha), berbeda dari da biasa.", "a"),
    createModelGlyph(4, "ᬛ", "Jha", "[d͡ʒʱa]", "konsonan", "Ja jera (jha), berbeda dari ja biasa.", "a"),
    createModelGlyph(6, "ᬡ", "Na Rambat", "[ɳa]", "konsonan", "Na rambat, konsonan nasal retrofleks swalalita.", "a"),
    createModelGlyph(7, "ᬨ", "Pha", "[pʰa]", "konsonan", "Pa kapal (pha), konsonan swalalita beraspirasi.", "a"),
    createModelGlyph(8, "ᬰ", "Sa Saga", "[ʃa]", "konsonan", "Sa saga, berbeda dari sa sapa dan sa biasa.", "a"),
    createModelGlyph(9, "ᬱ", "Sa Sapa", "[ʂa]", "konsonan", "Sa sapa, berbeda dari sa saga dan sa biasa.", "a"),
    createModelGlyph(10, "ᬝ", "Ta Latik", "[ʈa]", "konsonan", "Ta latik, konsonan retrofleks swalalita.", "a"),
    createModelGlyph(11, "ᬣ", "Tha", "[tʰa]", "konsonan", "Ta tawa (tha), berbeda dari ta biasa.", "a"),
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAksaraData(aksaraId: string = 'bali'): AksaraDetail | undefined {
  const key = aksaraId.toLowerCase();
  return KATALOG_DATA[key] ?? KATALOG_DATA['bali'];
}
