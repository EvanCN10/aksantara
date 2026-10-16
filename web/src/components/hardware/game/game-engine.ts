import type { RfidCardData } from '@/lib/serial/tactile-serial-types';
import { SPEED_ROUND_SECONDS, type HardwareGameQuest } from '@/data/hardware/game-quests';

export type GamePhase = 'ready' | 'playing' | 'success' | 'failed' | 'complete';

export interface HardwareGameState {
  roundIndex: number;
  score: number;
  correctCount: number;
  timeLeft: number;
  phase: GamePhase;
  generation: number;
  acceptedRevision: number;
}

export type HardwareGameAction =
  | { type: 'restart' }
  | { type: 'pause' }
  | { type: 'start'; revision: number }
  | { type: 'next'; revision: number; totalRounds: number; seconds: number }
  | { type: 'tick'; generation: number }
  | { type: 'cards'; generation: number; revision: number; matches: boolean; reward: number; speedMatch: boolean };

const SPEED_BONUS_PER_SECOND = 2;

export const INITIAL_GAME_STATE: HardwareGameState = {
  roundIndex: 0, score: 0, correctCount: 0, timeLeft: SPEED_ROUND_SECONDS,
  phase: 'ready', generation: 0, acceptedRevision: 0,
};

export function questMatchesCards(
  quest: HardwareGameQuest,
  consonant: RfidCardData | null,
  diacritic: RfidCardData | null,
): boolean {
  if (quest.kind === 'ramu-mantra') {
    return consonant?.uid === quest.targetKonsonanId && consonant.aksaraId === quest.aksaraId &&
      consonant.tipe === 'konsonan' && diacritic?.uid === quest.targetDiakritikId &&
      diacritic.aksaraId === quest.aksaraId && diacritic.tipe === 'diakritik';
  }
  const card = quest.tipe === 'konsonan' ? consonant : diacritic;
  return card?.uid === quest.targetId && card.aksaraId === quest.aksaraId && card.tipe === quest.tipe;
}

function acceptCards(state: HardwareGameState, action: Extract<HardwareGameAction, { type: 'cards' }>): HardwareGameState {
  if (state.phase !== 'playing' || state.generation !== action.generation ||
    action.revision <= state.acceptedRevision) return state;
  if (!action.matches) return { ...state, acceptedRevision: action.revision };
  const bonus = action.speedMatch ? state.timeLeft * SPEED_BONUS_PER_SECOND : 0;
  return {
    ...state, phase: 'success', acceptedRevision: action.revision,
    score: state.score + action.reward + bonus, correctCount: state.correctCount + 1,
  };
}

export function hardwareGameReducer(state: HardwareGameState, action: HardwareGameAction): HardwareGameState {
  switch (action.type) {
    case 'restart':
      return { ...INITIAL_GAME_STATE, generation: state.generation + 1 };
    case 'pause':
      return state.phase === 'playing' ? { ...state, phase: 'ready', generation: state.generation + 1 } : state;
    case 'start':
      return state.phase === 'ready'
        ? { ...state, phase: 'playing', acceptedRevision: action.revision, generation: state.generation + 1 }
        : state;
    case 'next':
      if (state.phase !== 'success' && state.phase !== 'failed') return state;
      return state.roundIndex + 1 === action.totalRounds ? { ...state, phase: 'complete' } : {
        ...state, roundIndex: state.roundIndex + 1, phase: 'playing', timeLeft: action.seconds,
        acceptedRevision: action.revision, generation: state.generation + 1,
      };
    case 'tick':
      if (state.phase !== 'playing' || state.generation !== action.generation) return state;
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1), phase: state.timeLeft <= 1 ? 'failed' : 'playing' };
    case 'cards':
      return acceptCards(state, action);
  }
}
