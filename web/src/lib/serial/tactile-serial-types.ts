// ============================================================================
// AKSANTARA TACTILE PAD — SERIAL & RFID CONTRACT TYPES
// ============================================================================

export type SerialConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'simulated';

export type TipeSlot = 'konsonan' | 'diakritik';

export interface RfidCardData {
  uid: string;
  aksaraId: 'lontara' | 'sunda' | 'bali';
  tipe: TipeSlot;
  simbol: string;
  label: string;
  latin: string;
  fonetik: string;
}

export interface SerialTelemetryLog {
  id: string;
  timestamp: string;
  arah: 'RX' | 'TX' | 'SYS';
  pesan: string;
}

export interface TactilePadState {
  slotKonsonan: RfidCardData | null;
  slotDiakritik: RfidCardData | null;
  sukuKataGabungan: string;
  latinGabungan: string;
  isMatch: boolean;
}

// Koleksi kartu RFID bawaan kit fisik (30 Kartu Trinitas Aksara)
export const KARTU_RFID_PRESET: RfidCardData[] = [
  // Sunda
  { uid: 'SD-KA-01', aksaraId: 'sunda', tipe: 'konsonan', simbol: 'ᮊ', label: 'Ka', latin: 'ka', fonetik: '/ka/' },
  { uid: 'SD-GA-02', aksaraId: 'sunda', tipe: 'konsonan', simbol: 'ᮌ', label: 'Ga', latin: 'ga', fonetik: '/ga/' },
  { uid: 'SD-TA-03', aksaraId: 'sunda', tipe: 'konsonan', simbol: 'ᮒ', label: 'Ta', latin: 'ta', fonetik: '/ta/' },
  { uid: 'SD-BA-04', aksaraId: 'sunda', tipe: 'konsonan', simbol: 'ᮘ', label: 'Ba', latin: 'ba', fonetik: '/ba/' },
  { uid: 'SD-PANGHULU-05', aksaraId: 'sunda', tipe: 'diakritik', simbol: 'ᮤ', label: 'Panghulu (i)', latin: 'i', fonetik: '/i/' },
  { uid: 'SD-PANYUKU-06', aksaraId: 'sunda', tipe: 'diakritik', simbol: 'ᮥ', label: 'Panyuku (u)', latin: 'u', fonetik: '/u/' },
  
  // Lontara
  { uid: 'LT-KA-07', aksaraId: 'lontara', tipe: 'konsonan', simbol: 'ᨀ', label: 'Ka', latin: 'ka', fonetik: '/ka/' },
  { uid: 'LT-GA-08', aksaraId: 'lontara', tipe: 'konsonan', simbol: 'ᨁ', label: 'Ga', latin: 'ga', fonetik: '/ga/' },
  { uid: 'LT-TA-09', aksaraId: 'lontara', tipe: 'konsonan', simbol: 'ᨈ', label: 'Ta', latin: 'ta', fonetik: '/ta/' },
  { uid: 'LT-TETTA-10', aksaraId: 'lontara', tipe: 'diakritik', simbol: 'ᨗ', label: 'Tetta (i)', latin: 'i', fonetik: '/i/' },
  { uid: 'LT-TUKKI-11', aksaraId: 'lontara', tipe: 'diakritik', simbol: 'ᨘ', label: 'Tukki (u)', latin: 'u', fonetik: '/u/' },

  // Bali
  { uid: 'BL-KA-12', aksaraId: 'bali', tipe: 'konsonan', simbol: 'ᬓ', label: 'Ka', latin: 'ka', fonetik: '/ka/' },
  { uid: 'BL-GA-13', aksaraId: 'bali', tipe: 'konsonan', simbol: 'ᬕ', label: 'Ga', latin: 'ga', fonetik: '/ga/' },
  { uid: 'BL-TA-14', aksaraId: 'bali', tipe: 'konsonan', simbol: 'ᬢ', label: 'Ta', latin: 'ta', fonetik: '/ta/' },
  { uid: 'BL-ULU-15', aksaraId: 'bali', tipe: 'diakritik', simbol: 'ᬶ', label: 'Ulu (i)', latin: 'i', fonetik: '/i/' },
  { uid: 'BL-SUKU-16', aksaraId: 'bali', tipe: 'diakritik', simbol: 'ᬸ', label: 'Suku (u)', latin: 'u', fonetik: '/u/' },
];
