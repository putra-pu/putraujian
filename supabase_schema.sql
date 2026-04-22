-- SUPABASE SCHEMA FOR CBT APP SMK PRIMA UNGGUL

-- 1. PROFILES TABLE (Extends Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBJECTS TABLE (Mata Pelajaran)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONS TABLE (Bank Soal)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id),
    text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_answer INTEGER NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXAMS TABLE (Manajemen Ujian)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    duration_minutes INTEGER DEFAULT 60,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXAM_QUESTIONS (Linking questions to specific exams)
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESULTS TABLE (Hasil Akhir Ujian)
CREATE TABLE IF NOT EXISTS public.results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    total_correct INTEGER,
    total_questions INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDENT_ANSWERS (Detail Jawaban per Soal)
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID REFERENCES public.results(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id),
    selected_option_idx INTEGER,
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES --

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own basic info" ON public.profiles;
CREATE POLICY "Users can update their own basic info" ON public.profiles FOR UPDATE USING (auth.uid() = id) 
WITH CHECK (
    -- Prevent users from changing their own role unless they are already an admin
    (CASE WHEN (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin' THEN true ELSE role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) END)
);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subjects: Everyone can read, only admin can modify
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can modify subjects" ON public.subjects;
CREATE POLICY "Only admin can modify subjects" ON public.subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Questions: Teachers and Admin can manage, students cannot see
DROP POLICY IF EXISTS "Teachers and admin can see questions" ON public.questions;
CREATE POLICY "Teachers and admin can see questions" ON public.questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

DROP POLICY IF EXISTS "Teachers and admin can manage questions" ON public.questions;
CREATE POLICY "Teachers and admin can manage questions" ON public.questions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Exams: Viewable by everyone, manageable by admin/teachers
DROP POLICY IF EXISTS "Exams are viewable by everyone" ON public.exams;
CREATE POLICY "Exams are viewable by everyone" ON public.exams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and Teachers can manage exams" ON public.exams;
CREATE POLICY "Admin and Teachers can manage exams" ON public.exams FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Exam Questions: Viewable by everyone, manageable by admin/teachers
DROP POLICY IF EXISTS "Exam questions are viewable by everyone" ON public.exam_questions;
CREATE POLICY "Exam questions are viewable by everyone" ON public.exam_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and Teachers can manage exam questions" ON public.exam_questions;
CREATE POLICY "Admin and Teachers can manage exam questions" ON public.exam_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Results: Students see their own, teachers/admin see all
DROP POLICY IF EXISTS "Students see their own results" ON public.results;
CREATE POLICY "Students see their own results" ON public.results FOR SELECT USING (
    auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

DROP POLICY IF EXISTS "Students can insert their own results" ON public.results;
CREATE POLICY "Students can insert their own results" ON public.results FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Student Answers: Same as results
DROP POLICY IF EXISTS "View student answers" ON public.student_answers;
CREATE POLICY "View student answers" ON public.student_answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND (r.student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'teacher'))))
);

DROP POLICY IF EXISTS "Insert student answers" ON public.student_answers;
CREATE POLICY "Insert student answers" ON public.student_answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND r.student_id = auth.uid())
);

-- KODE UNTUK SINKRONISASI ULANG TABEL PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
BEGIN
  -- Check if this is the first user
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

  BEGIN
    INSERT INTO public.profiles (id, full_name, username, role)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'), 
      COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'user_' || substr(new.id::text, 1, 8)), 
      CASE 
        WHEN is_first_user THEN 'admin'
        ELSE COALESCE(new.raw_user_meta_data->>'role', 'student')
      END
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Extreme fallback to ensure auth user creation doesn't fail
    INSERT INTO public.profiles (id, full_name, username, role)
    VALUES (new.id, 'User', 'user_' || substr(new.id::text, 1, 8), 'student')
    ON CONFLICT (id) DO NOTHING;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SINKRONISASI SAAT METADATA DI UPDATE (Admin merubah melalui dashboard Auth)
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  -- Hanya update jika metadata berubah dan role baru disediakan secara eksplisit
  -- Jika tidak, biarkan data di public.profiles tetap sebagai source of truth
  UPDATE public.profiles
  SET 
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
    username = COALESCE(new.raw_user_meta_data->>'username', username),
    role = CASE 
      WHEN new.raw_user_meta_data->>'role' IS NOT NULL AND new.raw_user_meta_data->>'role' != old.raw_user_meta_data->>'role' 
      THEN new.raw_user_meta_data->>'role'
      ELSE role 
    END
  WHERE id = new.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SINKRONISASI DARI PROFILES KE AUTH METADATA (Agar dashboard Auth tetap akurat)
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'role', new.role,
      'full_name', new.full_name,
      'username', new.username
    )
  WHERE id = new.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_auth();

-- Jalankan ulang pemicu update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Jalankan ulang pemicu insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SINKRONKAN USER YANG SUDAH ADA (BACKFILL)
INSERT INTO public.profiles (id, full_name, username, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 
    COALESCE(raw_user_meta_data->>'role', 'student')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- FUNCTION FOR HARD DELETE (Admin only)
CREATE OR REPLACE FUNCTION public.delete_user_hard(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if the requester is an admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Only admins can perform a hard delete.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
