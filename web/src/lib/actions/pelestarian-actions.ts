'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DAFTAR_MANUSKRIP } from '@/data/pelestarian/manuskrip-data';
import type {
  TransliterationSubmissionResult,
  TransliterationReviewResult,
  CurationStatus,
} from '@/types/pelestarian';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export async function submitTransliteration(
  input: unknown
): Promise<TransliterationSubmissionResult> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { success: false, error: 'Format permintaan tidak valid.' };
  }

  const raw = input as Record<string, unknown>;
  const { submissionId, manuscriptId, proposedTranscription } = raw;
  if (!isValidUuid(submissionId)) {
    return { success: false, error: 'Identifikasi kiriman (UUID) tidak valid.' };
  }

  if (typeof manuscriptId !== 'string' || manuscriptId.trim().length === 0) {
    return { success: false, error: 'Identifikasi naskah wajib diisi.' };
  }

  if (typeof proposedTranscription !== 'string' || proposedTranscription.trim().length === 0) {
    return { success: false, error: 'Usulan transliterasi tidak boleh kosong.' };
  }

  const trimmedText = proposedTranscription.trim();
  if (trimmedText.length > 10000) {
    return { success: false, error: 'Usulan transliterasi melebihi batas maksimal 10.000 karakter.' };
  }

  const manuscript = DAFTAR_MANUSKRIP.find((m) => m.id === manuscriptId);
  if (!manuscript) {
    return { success: false, error: 'Naskah yang dipilih tidak terdaftar dalam katalog arsip.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'Silakan masuk ke akun Anda terlebih dahulu untuk mengirim usulan transliterasi.',
    };
  }

  // Cek apakah submissionId sudah pernah dikirim sebelumnya (idempotency check)
  const { data: existingRows, error: checkError } = await supabase
    .from('manuscript_submissions')
    .select('id, user_id, proposed_transcription')
    .eq('id', submissionId);

  if (checkError) {
    return { success: false, error: `Gagal memeriksa status kiriman: ${checkError.message}` };
  }

  if (existingRows && existingRows.length > 0) {
    const existing = existingRows[0];
    if (existing.user_id === user.id && existing.proposed_transcription === trimmedText) {
      return { success: true, submissionId };
    }
    return { success: false, error: 'Konflik ID kiriman: ID ini telah digunakan untuk kiriman lain.' };
  }

  // Insert submission baru
  const { error: insertError } = await supabase.from('manuscript_submissions').insert({
    id: submissionId,
    user_id: user.id,
    kode_arsip: manuscript.kodeArsip,
    judul_naskah: manuscript.judul,
    aksara_id: manuscript.aksaraId,
    proposed_transcription: trimmedText,
    status: 'menunggu',
    verified_by: null,
    catatan_filolog: null,
    reviewed_at: null,
    xp_awarded: 0,
  });

  if (insertError) {
    return { success: false, error: `Gagal menyimpan usulan ke basis data: ${insertError.message}` };
  }

  revalidatePath('/pelestarian/status');
  return { success: true, submissionId };
}

export async function reviewTransliteration(
  input: unknown
): Promise<TransliterationReviewResult> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { success: false, error: 'Format permintaan review tidak valid.' };
  }

  const raw = input as Record<string, unknown>;
  const { submissionId, status, catatanFilolog } = raw;

  if (!isValidUuid(submissionId)) {
    return { success: false, error: 'Identifikasi usulan (UUID) tidak valid.' };
  }

  if (status !== 'terverifikasi' && status !== 'tinjauan') {
    return { success: false, error: 'Status review harus bernilai terverifikasi atau tinjauan.' };
  }

  if (typeof catatanFilolog !== 'string' || catatanFilolog.trim().length === 0) {
    return { success: false, error: 'Catatan peninjau wajib diisi.' };
  }

  const trimmedCatatan = catatanFilolog.trim();
  if (trimmedCatatan.length > 4000) {
    return { success: false, error: 'Catatan peninjau melebihi batas maksimal 4000 karakter.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Sesi tidak valid. Silakan masuk kembali.' };
  }

  // Periksa peran pengguna di tabel profiles dari sisi server
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !['guru', 'filolog', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Akses ditolak: Anda tidak memiliki wewenang kurator atau peninjau naskah.' };
  }

  // Eksekusi UPDATE dengan status awal 'menunggu' untuk mencegah double-review/race condition
  const { data: updatedRows, error: updateError } = await supabase
    .from('manuscript_submissions')
    .update({
      status: status as CurationStatus,
      catatan_filolog: trimmedCatatan,
    })
    .eq('id', submissionId)
    .eq('status', 'menunggu')
    .select('id');

  if (updateError) {
    return { success: false, error: `Gagal memperbarui status review: ${updateError.message}` };
  }

  if (!updatedRows || updatedRows.length === 0) {
    return { success: false, error: 'Usulan sudah ditinjau atau tidak dapat diakses.' };
  }

  revalidatePath('/pelestarian/status');
  return { success: true, submissionId };
}
