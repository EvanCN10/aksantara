// ============================================================================
// AKSANTARA SUPABASE PROGRESS & PERSISTENCE SERVICE
// ============================================================================
// Layanan ini mencatat progres pembelajaran siswa ke database Supabase PostgreSQL:
// 1. `user_glyph_progress` & `practice_sessions` (Latihan Kanvas Digital)
// 2. `story_progress` (Penyelesaian Bab Cerita Rakyat)
// 3. `manuscript_submissions` (Transkripsi Naskah Kuno Pilar 4)
//
// Karakteristik Zero-Failure:
// Jika koneksi Supabase belum aktif atau sedang offline di panggung demo,
// seluruh progres tersimpan di localStorage browser tanpa melempar error.
// ============================================================================

import { createClient } from './client';

export interface GlyphProgressPayload {
  aksaraId: 'lontara' | 'sunda' | 'bali';
  glifSlug: string;
  simbol: string;
  score: number;
  status: 'sempurna' | 'bagus' | 'kurang';
  strokeCount: number;
}

export interface StoryProgressPayload {
  eposSlug: string;
  babNomor: number;
  bintang: number;
  xpEarned: number;
}

export interface ManuscriptSubmissionPayload {
  manuscriptId: string;
  aksaraType: string;
  transkripsiAksara: string;
  transliterasiLatin: string;
  terjemahanIndonesia: string;
  catatanKurator?: string;
}

/**
 * Mencatat hasil latihan goresan kanvas ke database Supabase & localStorage
 */
export async function saveGlyphPractice(
  userId: string,
  payload: GlyphProgressPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Simpan ke LocalStorage sebagai cache lokal instan
    if (typeof window !== 'undefined') {
      const localKey = `aksantara_practice_${payload.aksaraId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.push({ ...payload, timestamp: new Date().toISOString() });
      localStorage.setItem(localKey, JSON.stringify(existing.slice(-100)));
    }

    // 2. Kirim ke Supabase jika client aktif
    const supabase = createClient();
    if (supabase && userId && !userId.startsWith('guest_')) {
      const { error } = await supabase.from('user_glyph_progress').upsert(
        {
          user_id: userId,
          aksara_type: payload.aksaraId,
          glyph_character: payload.simbol,
          glyph_name: payload.glifSlug,
          mastery_score: payload.score,
          practice_count: 1,
          last_accuracy: payload.score,
          updated_at: new Date().toISOString(),
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
    return { success: true }; // Jangan gagalkan UI
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
    // 1. Simpan ke LocalStorage
    if (typeof window !== 'undefined') {
      const localKey = `aksantara_story_${payload.eposSlug}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '{}');
      existing[payload.babNomor] = {
        bintang: Math.max(existing[payload.babNomor]?.bintang || 0, payload.bintang),
        completedAt: new Date().toISOString(),
        xpEarned: payload.xpEarned,
      };
      localStorage.setItem(localKey, JSON.stringify(existing));
    }

    // 2. Kirim ke Supabase
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

/**
 * Mengirim usulan kurasi transliterasi naskah kuno (Pilar 4)
 */
export async function saveManuscriptSubmission(
  userId: string,
  payload: ManuscriptSubmissionPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const submissions = JSON.parse(localStorage.getItem('aksantara_submissions') || '[]');
      submissions.push({
        id: `sub-${Date.now()}`,
        userId,
        ...payload,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      });
      localStorage.setItem('aksantara_submissions', JSON.stringify(submissions));
    }

    const supabase = createClient();
    if (supabase && userId && !userId.startsWith('guest_')) {
      const { error } = await supabase.from('manuscript_submissions').insert({
        user_id: userId,
        manuscript_id: payload.manuscriptId,
        aksara_type: payload.aksaraType,
        original_text: payload.transkripsiAksara,
        transliteration: payload.transliterasiLatin,
        translation: payload.terjemahanIndonesia,
        curator_notes: payload.catatanKurator,
        status: 'pending',
      });

      if (error) {
        console.warn('[ProgressService] Manuscript sync warning:', error.message);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[ProgressService] saveManuscriptSubmission fallback:', errorMsg);
    return { success: true };
  }
}
