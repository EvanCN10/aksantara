// ============================================================================
// AKSANTARA SUPABASE PROGRESS & PERSISTENCE SERVICE
// ============================================================================

import { createClient } from './client';

export interface GlyphProgressPayload {
  aksaraId: 'bali';
  glifSlug: string;
  simbol: string;
  label?: string;
  score: number;
  status: 'sempurna' | 'bagus' | 'kurang';
  strokeCount: number;
  ringkasan?: string;
  latencyMs?: number;
}

export interface PracticeRecord extends GlyphProgressPayload {
  timestamp: string;
}

export interface StoryProgressPayload {
  eposSlug: string;
  babNomor: number;
  bintang: number;
  xpEarned: number;
}

export type StoryProgressMap = Record<
  number,
  {
    bintang: number;
    completedAt: string;
    xpEarned: number;
  }
>;

export function getGlyphPracticeRecords(aksaraId: 'bali' = 'bali'): PracticeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`aksantara_practice_${aksaraId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSessionPracticeRecords(aksaraId: 'bali' = 'bali'): PracticeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(`aksantara_session_${aksaraId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStoryProgressMap(eposSlug: string = 'calon-arang'): StoryProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`aksantara_story_${eposSlug}`);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function clearGuestProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem('aksantara_session_bali');
    localStorage.removeItem('aksantara_practice_bali');
    localStorage.removeItem('aksantara_story_calon-arang');
    localStorage.removeItem('aksantara_pelestarian_guest');
  } catch {
    // Ignore storage access errors in restricted modes
  }
}

/**
 * Mencatat hasil latihan goresan kanvas ke database Supabase, sessionStorage & localStorage
 */
export async function saveGlyphPractice(
  userId: string,
  payload: GlyphProgressPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const record: PracticeRecord = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const localKey = `aksantara_practice_${payload.aksaraId}`;
      const existing = getGlyphPracticeRecords(payload.aksaraId);
      existing.push(record);
      localStorage.setItem(localKey, JSON.stringify(existing.slice(-200)));

      const sessionKey = `aksantara_session_${payload.aksaraId}`;
      const sessionExisting = getSessionPracticeRecords(payload.aksaraId);
      sessionExisting.push(record);
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionExisting.slice(-100)));
    }

    const supabase = createClient();
    if (supabase && userId && !userId.startsWith('guest_')) {
      const { error } = await supabase.from('user_glyph_progress').upsert(
        {
          user_id: userId,
          aksara_type: payload.aksaraId,
          glyph_character: payload.simbol,
          glyph_name: payload.glifSlug,
          mastery_score: Math.round(payload.score),
          practice_count: 1,
          last_accuracy: Math.round(payload.score),
          updated_at: record.timestamp,
        },
        { onConflict: 'user_id,aksara_type,glyph_character' }
      );

      if (error) {
        console.warn('[ProgressService] Supabase sync warning:', error.message);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[ProgressService] saveGlyphPractice fallback:', errorMsg);
    return { success: true };
  }
}

/**
 * Mencatat penyelesaian bab cerita rakyat ke database Supabase & localStorage
 */
export async function saveStoryCompletion(
  userId: string,
  payload: StoryProgressPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const localKey = `aksantara_story_${payload.eposSlug}`;
      const existing = getStoryProgressMap(payload.eposSlug);
      existing[payload.babNomor] = {
        bintang: Math.max(existing[payload.babNomor]?.bintang || 0, payload.bintang),
        completedAt: new Date().toISOString(),
        xpEarned: Math.max(existing[payload.babNomor]?.xpEarned || 0, payload.xpEarned),
      };
      localStorage.setItem(localKey, JSON.stringify(existing));
    }

    const supabase = createClient();
    if (supabase && userId && !userId.startsWith('guest_')) {
      const { error } = await supabase.from('story_progress').upsert(
        {
          user_id: userId,
          story_id: payload.eposSlug,
          chapter_number: payload.babNomor,
          completed: true,
          stars_earned: payload.bintang,
          xp_earned: payload.xpEarned,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,story_id,chapter_number' }
      );

      if (error) {
        console.warn('[ProgressService] Story sync warning:', error.message);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[ProgressService] saveStoryCompletion fallback:', errorMsg);
    return { success: true };
  }
}
