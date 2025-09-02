-- BrainPod Content Database Migration
-- Creates normalized content tables for subjects, courses, units, lessons, activities, diagnostics, and prompts
-- Run this migration after the initial schema setup

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CONTENT SCHEMA TABLES
-- ============================================================================

-- Subjects (math, reading, science, social-studies)
CREATE TABLE IF NOT EXISTS public.content_subjects (
  id text PRIMARY KEY,          -- 'math','reading','science','social-studies'
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses/Grades (K, 1, 2, ..., HS courses)
CREATE TABLE IF NOT EXISTS public.content_courses (
  id text PRIMARY KEY,          -- 'K','1',...'8','HS:algebra-1'
  subject_id text NOT NULL REFERENCES public.content_subjects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('grade','course')),
  title text NOT NULL,
  short_title text,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Units within courses
CREATE TABLE IF NOT EXISTS public.content_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES public.content_subjects(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.content_courses(id) ON DELETE CASCADE,
  slug text NOT NULL,           -- 'counting', 'place-value', etc.
  title text NOT NULL,
  description text,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(subject_id, course_id, slug)
);

-- Lessons within units
CREATE TABLE IF NOT EXISTS public.content_lessons (
  id text PRIMARY KEY,          -- e.g. 'math-1-pv-1'
  unit_id uuid NOT NULL REFERENCES public.content_units(id) ON DELETE CASCADE,
  title text NOT NULL,
  minutes int DEFAULT 10,
  difficulty real DEFAULT 0.0,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills (learning objectives)
CREATE TABLE IF NOT EXISTS public.content_skills (
  id text PRIMARY KEY,          -- e.g. 'count_1_5', 'add_within_5'
  subject_id text NOT NULL REFERENCES public.content_subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Junction table: Lessons to Skills (many-to-many)
CREATE TABLE IF NOT EXISTS public.content_lesson_skills (
  lesson_id text NOT NULL REFERENCES public.content_lessons(id) ON DELETE CASCADE,
  skill_id text NOT NULL REFERENCES public.content_skills(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, skill_id)
);

-- Skill prerequisites (many-to-many)
CREATE TABLE IF NOT EXISTS public.content_skill_prereqs (
  skill_id text NOT NULL REFERENCES public.content_skills(id) ON DELETE CASCADE,
  prereq_skill_id text NOT NULL REFERENCES public.content_skills(id) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, prereq_skill_id)
);

-- Standards (Common Core, NGSS, etc.)
CREATE TABLE IF NOT EXISTS public.content_standards (
  code text PRIMARY KEY,        -- 'K.CC.A.1','HS-LS1-2','D2.His.2.9-12'
  framework text NOT NULL,      -- 'CCSS-M','CCSS-ELA','NGSS','C3'
  title text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Junction table: Skills to Standards (many-to-many)
CREATE TABLE IF NOT EXISTS public.content_skill_standards (
  skill_id text NOT NULL REFERENCES public.content_skills(id) ON DELETE CASCADE,
  standard_code text NOT NULL REFERENCES public.content_standards(code) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, standard_code)
);

-- Activities within lessons (instruction, practice, quiz, mindful)
CREATE TABLE IF NOT EXISTS public.content_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL REFERENCES public.content_lessons(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('instruction','practice','quiz','mindful')),
  content jsonb NOT NULL,       -- Structured activity content (see ActivityContent type)
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Digital assets (images, audio, video)
CREATE TABLE IF NOT EXISTS public.content_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text REFERENCES public.content_lessons(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text,                    -- 'image','audio','video'
  alt text,
  metadata jsonb,               -- dimensions, duration, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- DIAGNOSTIC SYSTEM TABLES
-- ============================================================================

-- Diagnostic forms (question banks per subject/grade)
CREATE TABLE IF NOT EXISTS public.content_diagnostic_forms (
  id text PRIMARY KEY,          -- e.g., 'math-k', 'math-1', 'reading-k'
  subject_id text NOT NULL REFERENCES public.content_subjects(id) ON DELETE CASCADE,
  label text,
  description text,
  meta jsonb,                   -- config like minItems, maxItems, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual diagnostic questions/items
CREATE TABLE IF NOT EXISTS public.content_diagnostic_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id text NOT NULL REFERENCES public.content_diagnostic_forms(id) ON DELETE CASCADE,
  external_id text,             -- original id from JSON files
  order_index int DEFAULT 0,
  item jsonb NOT NULL,          -- Complete item data (stem, choices, answer, etc.)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PROMPT TEMPLATES SYSTEM
-- ============================================================================

-- AI prompt templates (for hints, rubrics, generation)
CREATE TABLE IF NOT EXISTS public.content_prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('lesson','activity','skill','diagnostic','global')),
  ref_id text,                  -- lesson_id, skill_id, form_id, etc.
  version int NOT NULL DEFAULT 1,
  name text NOT NULL,           -- 'generate_hint', 'rubric', 'encouragement'
  template text NOT NULL,       -- the actual prompt with {{placeholders}}
  meta jsonb,                   -- additional config/parameters
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scope, ref_id, name, version)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all content tables
ALTER TABLE public.content_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_lesson_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_skill_prereqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_skill_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_diagnostic_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_diagnostic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_prompt_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "read content (auth)" ON public.content_subjects;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_courses;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_units;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_lessons;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_skills;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_lesson_skills;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_skill_prereqs;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_standards;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_skill_standards;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_activities;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_assets;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_diagnostic_forms;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_diagnostic_items;
DROP POLICY IF EXISTS "read content (auth)" ON public.content_prompt_templates;

-- Create read policies for authenticated users
CREATE POLICY "read content (auth)" ON public.content_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_lesson_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_skill_prereqs FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_standards FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_skill_standards FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_diagnostic_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_diagnostic_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "read content (auth)" ON public.content_prompt_templates FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_courses_subject ON public.content_courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_content_units_course ON public.content_units(subject_id, course_id);
CREATE INDEX IF NOT EXISTS idx_content_lessons_unit ON public.content_lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_content_activities_lesson ON public.content_activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_content_diagnostic_items_form ON public.content_diagnostic_items(form_id);
CREATE INDEX IF NOT EXISTS idx_content_skills_subject ON public.content_skills(subject_id);
CREATE INDEX IF NOT EXISTS idx_content_prompt_templates_scope_ref ON public.content_prompt_templates(scope, ref_id);

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert core subjects if they don't exist
INSERT INTO public.content_subjects (id, title, description) VALUES
  ('math', 'Mathematics', 'Number sense, operations, algebra, geometry, and data analysis'),
  ('reading', 'Reading & Language Arts', 'Phonics, fluency, comprehension, and writing'),
  ('science', 'Science', 'Physical, life, earth, and space sciences'),
  ('social-studies', 'Social Studies', 'History, geography, civics, and economics')
ON CONFLICT (id) DO NOTHING;

-- Insert Common Core and other standards frameworks
INSERT INTO public.content_standards (code, framework, title) VALUES
  -- Example standards (will be populated by importer)
  ('K.CC.A.1', 'CCSS-M', 'Count to 100 by ones and by tens'),
  ('K.CC.B.4', 'CCSS-M', 'Understand the relationship between numbers and quantities'),
  ('1.NBT.B.2', 'CCSS-M', 'Understand that the two digits of a two-digit number represent amounts of tens and ones')
ON CONFLICT (code) DO NOTHING;

-- Success message
-- SELECT 'Content database migration completed successfully!' as status;
