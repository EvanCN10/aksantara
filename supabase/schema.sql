-- ==============================================================================
-- AKSANTARA DATABASE SCHEMA (SSOT v3.1 COMPLIANT)
-- PostgreSQL DDL for Supabase
-- ==============================================================================
-- Jalankan skrip ini langsung di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('siswa', 'guru', 'filolog', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE aksara_id_enum AS ENUM ('lontara', 'sunda', 'bali');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evaluation_status_enum AS ENUM ('sempurna', 'baik', 'remedi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE curation_status_enum AS ENUM ('terverifikasi', 'menunggu', 'tinjauan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hardware_game_enum AS ENUM ('ramu-mantra', 'speed-match');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLE: PROFILES (User Identity & Cultural Progression)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    nisn TEXT,
    role user_role_enum NOT NULL DEFAULT 'siswa',
    gelar_budaya TEXT DEFAULT 'Cantrik Pemula',
    avatar TEXT DEFAULT '👑',
    xp INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: USER_GLYPH_PROGRESS (Pilar 1: Canvas Mastery per Character)
CREATE TABLE IF NOT EXISTS public.user_glyph_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    aksara_id aksara_id_enum NOT NULL,
    glif_karakter TEXT NOT NULL,
    nama_karakter TEXT NOT NULL,
    best_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    practice_count INTEGER NOT NULL DEFAULT 0,
    last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_glyph UNIQUE (user_id, aksara_id, glif_karakter)
);

-- 4. TABLE: PRACTICE_SESSIONS (Pilar 1: Session Debrief History)
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    aksara_id aksara_id_enum NOT NULL,
    glif_karakter TEXT NOT NULL,
    skor_akurasi NUMERIC(5,2) NOT NULL,
    stroke_order_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    aspect_ratio_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    smoothness_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status_evaluasi evaluation_status_enum NOT NULL DEFAULT 'baik',
    catatan_ai TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLE: HARDWARE_SESSIONS (Pilar 3: Phygital Tactile Pad Telemetry)
CREATE TABLE IF NOT EXISTS public.hardware_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_type hardware_game_enum NOT NULL,
    target_syllable TEXT NOT NULL,
    rfid_cards_used TEXT[] NOT NULL DEFAULT '{}',
    duration_seconds NUMERIC(6,2) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLE: STORY_PROGRESS (Pilar 3: Narrative Folklore Quests)
CREATE TABLE IF NOT EXISTS public.story_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    epos_slug TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    stars_earned INTEGER NOT NULL DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    CONSTRAINT unique_user_epos_chapter UNIQUE (user_id, epos_slug, chapter_number)
);

-- 7. TABLE: MANUSCRIPT_SUBMISSIONS (Pilar 4: Ancient Manuscript Preservation)
CREATE TABLE IF NOT EXISTS public.manuscript_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kode_arsip TEXT NOT NULL,
    judul_naskah TEXT NOT NULL,
    aksara_id aksara_id_enum NOT NULL,
    proposed_transcription TEXT NOT NULL,
    status curation_status_enum NOT NULL DEFAULT 'menunggu',
    catatan_filolog TEXT,
    verified_by UUID REFERENCES public.profiles(id),
    xp_awarded INTEGER NOT NULL DEFAULT 75,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABLE: CLASSROOMS & ENROLLMENT (Guru Command Center)
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    institusi TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classroom_students (
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (classroom_id, student_id)
);

-- 9. TABLE: STUDENT_EVALUATIONS (Guru Individual Student Reports)
CREATE TABLE IF NOT EXISTS public.student_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    catatan TEXT NOT NULL,
    glif_kendala TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nama, role, gelar_budaya, avatar)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nama', NEW.raw_user_meta_data->>'name', 'Penoreh Aksara'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'siswa'),
        CASE
            WHEN (NEW.raw_user_meta_data->>'role') = 'guru' THEN 'Pamong Budaya Muda'
            ELSE 'Cantrik Pemula'
        END,
        CASE
            WHEN (NEW.raw_user_meta_data->>'role') = 'guru' THEN '🏛️'
            ELSE '👑'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_glyph_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscript_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_evaluations ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Public read, self update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Glyph Progress: Self access + Teacher access
CREATE POLICY "Users can manage own glyph progress" ON public.user_glyph_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view students glyph progress" ON public.user_glyph_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classroom_students cs
            JOIN public.classrooms c ON cs.classroom_id = c.id
            WHERE cs.student_id = user_glyph_progress.user_id AND c.teacher_id = auth.uid()
        )
    );

-- 3. Practice Sessions: Self insert/select + Teacher view
CREATE POLICY "Users can view own practice sessions" ON public.practice_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice session" ON public.practice_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view student practice sessions" ON public.practice_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classroom_students cs
            JOIN public.classrooms c ON cs.classroom_id = c.id
            WHERE cs.student_id = practice_sessions.user_id AND c.teacher_id = auth.uid()
        )
    );

-- 4. Hardware Sessions: Self insert/select + Teacher view
CREATE POLICY "Users can view own hardware sessions" ON public.hardware_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hardware session" ON public.hardware_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Story Progress: Self insert/select/update
CREATE POLICY "Users can manage own story progress" ON public.story_progress
    FOR ALL USING (auth.uid() = user_id);

-- 6. Manuscript Submissions: Public view + Self insert + Curator update
CREATE POLICY "Manuscripts submissions viewable by all" ON public.manuscript_submissions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own manuscript submission" ON public.manuscript_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Classrooms & Evaluations: Teacher manage
CREATE POLICY "Teachers can manage classrooms" ON public.classrooms
    FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage evaluations" ON public.student_evaluations
    FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their evaluations" ON public.student_evaluations
    FOR SELECT USING (auth.uid() = student_id);

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
