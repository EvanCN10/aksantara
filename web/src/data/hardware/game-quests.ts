import { KARTU_RFID_PRESET, type RfidCardData } from '@/lib/serial/tactile-serial-types';

export type HardwareGameKind = 'ramu-mantra' | 'speed-match';
export type HardwareGameDeck = 'sunda' | 'trinitas';

interface BaseQuest {
  ronde: number;
  aksaraId: RfidCardData['aksaraId'];
  aksaraNama: string;
  xpReward: number;
}

export interface RamuMantraQuest extends BaseQuest {
  kind: 'ramu-mantra';
  targetKonsonanId: string;
  targetDiakritikId: string;
  targetKonsonanSimbol: string;
  targetKonsonanLabel: string;
  targetDiakritikSimbol: string;
  targetDiakritikLabel: string;
  targetSukuKata: string;
  targetLatin: string;
  petunjuk: string;
}

export interface SpeedMatchQuest extends BaseQuest {
  kind: 'speed-match';
  targetId: string;
  pertanyaan: string;
  targetSimbol: string;
  targetLabel: string;
  tipe: RfidCardData['tipe'];
  alokasiDetik: number;
}

export type HardwareGameQuest = RamuMantraQuest | SpeedMatchQuest;

const SCRIPT_NAMES = { sunda: 'Aksara Sunda', lontara: 'Aksara Lontara', bali: 'Aksara Bali' };
export const SPEED_ROUND_SECONDS = 15;
const ROUND_XP = 50;

export const SUNDA_CARD_IDS = ['SD-KA-01', 'SD-GA-02', 'SD-PANGHULU-05', 'SD-PANYUKU-06'] as const;
export const SUNDA_GAME_CARDS = KARTU_RFID_PRESET.filter((card) =>
  SUNDA_CARD_IDS.some((uid) => uid === card.uid)
);

function getCard(uid: string): RfidCardData {
  const card = KARTU_RFID_PRESET.find((entry) => entry.uid === uid);
  if (!card) throw new Error(`Kartu tantangan tidak ada di katalog: ${uid}`);
  return card;
}

function createRamuQuest(consonantId: string, diacriticId: string, index: number): RamuMantraQuest {
  const consonant = getCard(consonantId);
  const diacritic = getCard(diacriticId);
  return {
    kind: 'ramu-mantra', ronde: index + 1,
    aksaraId: consonant.aksaraId, aksaraNama: SCRIPT_NAMES[consonant.aksaraId],
    targetKonsonanId: consonantId, targetDiakritikId: diacriticId,
    targetKonsonanSimbol: consonant.simbol, targetKonsonanLabel: consonant.label,
    targetDiakritikSimbol: diacritic.simbol, targetDiakritikLabel: diacritic.label,
    targetSukuKata: `${consonant.simbol}${diacritic.simbol}`,
    targetLatin: `${consonant.latin.slice(0, -1)}${diacritic.latin}`.toUpperCase(),
    petunjuk: `Letakkan ${consonant.label} [${consonant.simbol}] di Slot 1 dan ${diacritic.label} [${diacritic.simbol}] di Slot 2.`,
    xpReward: ROUND_XP,
  };
}

function createSpeedQuest(uid: string, index: number): SpeedMatchQuest {
  const card = getCard(uid);
  return {
    kind: 'speed-match', ronde: index + 1, targetId: uid,
    pertanyaan: `Tempelkan ${card.tipe === 'konsonan' ? 'konsonan' : 'tanda diakritik'} ${card.label} dari ${SCRIPT_NAMES[card.aksaraId]}!`,
    targetSimbol: card.simbol, targetLabel: card.label, tipe: card.tipe,
    aksaraId: card.aksaraId, aksaraNama: SCRIPT_NAMES[card.aksaraId],
    alokasiDetik: SPEED_ROUND_SECONDS, xpReward: ROUND_XP,
  };
}

export const SUNDA_RAMU_MANTRA_QUESTS: RamuMantraQuest[] = [
  ['SD-KA-01', 'SD-PANGHULU-05'],
  ['SD-KA-01', 'SD-PANYUKU-06'],
  ['SD-GA-02', 'SD-PANGHULU-05'],
  ['SD-GA-02', 'SD-PANYUKU-06'],
].map(([consonant, diacritic], index) => createRamuQuest(consonant, diacritic, index));

export const SUNDA_SPEED_MATCH_QUESTS = SUNDA_CARD_IDS.map(createSpeedQuest);

// The original five-round decks remain available only in explicit simulation mode.
export const TRINITAS_RAMU_MANTRA_QUESTS: RamuMantraQuest[] = [
  ['SD-KA-01', 'SD-PANGHULU-05'],
  ['LT-GA-08', 'LT-TUKKI-11'],
  ['BL-TA-14', 'BL-ULU-15'],
  ['SD-BA-04', 'SD-PANYUKU-06'],
  ['LT-KA-07', 'LT-TETTA-10'],
].map(([consonant, diacritic], index) => createRamuQuest(consonant, diacritic, index));

export const TRINITAS_SPEED_MATCH_QUESTS = [
  'LT-GA-08', 'SD-PANGHULU-05', 'BL-TA-14', 'SD-BA-04', 'BL-ULU-15',
].map(createSpeedQuest);

export function getGameQuests(kind: HardwareGameKind, deck: HardwareGameDeck): readonly HardwareGameQuest[] {
  if (kind === 'ramu-mantra') {
    return deck === 'sunda' ? SUNDA_RAMU_MANTRA_QUESTS : TRINITAS_RAMU_MANTRA_QUESTS;
  }
  return deck === 'sunda' ? SUNDA_SPEED_MATCH_QUESTS : TRINITAS_SPEED_MATCH_QUESTS;
}
