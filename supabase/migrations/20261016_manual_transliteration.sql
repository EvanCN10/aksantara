-- ==============================================================================
-- MIGRATION: 20261016_manual_transliteration.sql
-- Transliterasi Manual & Review Manusia (Audit #16 SSOT v3.1 Compliance)
-- ==============================================================================

BEGIN;

-- 1. Tambah kolom reviewed_at dan ubah default xp_awarded menjadi 0
ALTER TABLE public.manuscript_submissions
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.manuscript_submissions
    ALTER COLUMN xp_awarded SET DEFAULT 0;

-- 2. Tutup eskalasi peran pada handle_new_user (selalu 'siswa')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nama, role, gelar_budaya, avatar)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nama', NEW.raw_user_meta_data->>'name', 'Penoreh Aksara'),
        'siswa',
        'Cantrik Pemula',
        '👑'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger proteksi perubahan role pada profiles (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF current_user NOT IN ('postgres', 'service_role', 'supabase_admin') THEN
            RAISE EXCEPTION 'Perubahan role hanya dapat dilakukan oleh administrator basis data.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 4. Fungsi pembantu verifikasi peran reviewer
CREATE OR REPLACE FUNCTION public.is_reviewer(user_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_uuid AND role IN ('guru', 'filolog', 'admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Perbarui kebijakan RLS pada manuscript_submissions
DROP POLICY IF EXISTS "Manuscripts submissions viewable by all" ON public.manuscript_submissions;
DROP POLICY IF EXISTS "Manuscripts submissions viewable by owner or reviewer" ON public.manuscript_submissions;
CREATE POLICY "Manuscripts submissions viewable by owner or reviewer" ON public.manuscript_submissions
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR public.is_reviewer(auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert own manuscript submission" ON public.manuscript_submissions;
CREATE POLICY "Users can insert own manuscript submission" ON public.manuscript_submissions
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'menunggu'
        AND verified_by IS NULL
        AND catatan_filolog IS NULL
        AND reviewed_at IS NULL
        AND xp_awarded = 0
        AND length(trim(proposed_transcription)) > 0
        AND length(proposed_transcription) <= 10000
    );

DROP POLICY IF EXISTS "Reviewers can review manuscript submissions" ON public.manuscript_submissions;
CREATE POLICY "Reviewers can review manuscript submissions" ON public.manuscript_submissions
    FOR UPDATE TO authenticated
    USING (
        public.is_reviewer(auth.uid())
        AND auth.uid() != user_id
        AND status = 'menunggu'
    )
    WITH CHECK (
        public.is_reviewer(auth.uid())
        AND status IN ('terverifikasi', 'tinjauan')
    );

-- 6. Trigger sebelum update manuscript_submissions untuk menjamin imutabilitas dan integritas kurasi
CREATE OR REPLACE FUNCTION public.protect_manuscript_submission_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'menunggu' THEN
        RAISE EXCEPTION 'Usulan sudah ditinjau dan bersifat tetap (immutable).';
    END IF;

    IF OLD.user_id = auth.uid() THEN
        RAISE EXCEPTION 'Peninjau tidak dapat mereview usulan miliknya sendiri.';
    END IF;

    IF NEW.status NOT IN ('terverifikasi', 'tinjauan') THEN
        RAISE EXCEPTION 'Status review harus bernilai terverifikasi atau tinjauan.';
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.kode_arsip IS DISTINCT FROM OLD.kode_arsip
       OR NEW.judul_naskah IS DISTINCT FROM OLD.judul_naskah
       OR NEW.aksara_id IS DISTINCT FROM OLD.aksara_id
       OR NEW.proposed_transcription IS DISTINCT FROM OLD.proposed_transcription
       OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
       OR NEW.xp_awarded IS DISTINCT FROM OLD.xp_awarded THEN
        RAISE EXCEPTION 'Perubahan metadata dan usulan naskah tidak diizinkan saat peninjauan.';
    END IF;

    IF NEW.catatan_filolog IS NULL OR length(trim(NEW.catatan_filolog)) = 0 OR length(NEW.catatan_filolog) > 4000 THEN
        RAISE EXCEPTION 'Catatan peninjau wajib diisi dengan panjang maksimal 4000 karakter.';
    END IF;

    NEW.verified_by := auth.uid();
    NEW.reviewed_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

DROP TRIGGER IF EXISTS trg_protect_manuscript_submission_update ON public.manuscript_submissions;
CREATE TRIGGER trg_protect_manuscript_submission_update
    BEFORE UPDATE ON public.manuscript_submissions
    FOR EACH ROW EXECUTE FUNCTION public.protect_manuscript_submission_update();

COMMIT;
