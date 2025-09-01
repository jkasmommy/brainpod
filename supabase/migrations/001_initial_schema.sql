-- BrainPod Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'essential', 'family', 'plus')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learner profiles (for multi-learner support)
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL CHECK (grade_level >= 0 AND grade_level <= 12),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnostic assessment results
CREATE TABLE IF NOT EXISTS public.diagnostic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'reading', 'science', 'social-studies')),
  ability_score REAL NOT NULL CHECK (ability_score >= -3 AND ability_score <= 3),
  placement_label TEXT NOT NULL,
  recommended_grade TEXT NOT NULL,
  recommended_unit TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning plans (generated from diagnostic results)
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'reading', 'science', 'social-studies')),
  plan_items JSONB NOT NULL,
  placement_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual lesson progress tracking
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'reading', 'science', 'social-studies')),
  unit TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'completed', 'mastered')),
  score REAL CHECK (score >= 0 AND score <= 100),
  time_spent INTEGER DEFAULT 0, -- in seconds
  attempts INTEGER DEFAULT 0,
  hint_usage INTEGER DEFAULT 0,
  mistakes_made INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill mastery tracking (granular skill-level progress)
CREATE TABLE IF NOT EXISTS public.skill_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'reading', 'science', 'social-studies')),
  mastery_level REAL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  confidence_level REAL DEFAULT 0 CHECK (confidence_level >= 0 AND confidence_level <= 100),
  last_practiced TIMESTAMPTZ DEFAULT NOW(),
  total_practice_time INTEGER DEFAULT 0, -- in seconds
  practice_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, skill_id)
);

-- Learning sessions (tracks individual learning sessions)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'reading', 'science', 'social-studies')),
  lesson_ids TEXT[] DEFAULT '{}',
  duration INTEGER DEFAULT 0, -- in seconds
  lessons_completed INTEGER DEFAULT 0,
  total_score REAL DEFAULT 0,
  mindful_breaks_taken INTEGER DEFAULT 0,
  session_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Parent/teacher notes and observations
CREATE TABLE IF NOT EXISTS public.learner_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'observation' CHECK (note_type IN ('observation', 'achievement', 'concern', 'goal')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements and badges
CREATE TABLE IF NOT EXISTS public.learner_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES public.learner_profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  subject TEXT CHECK (subject IN ('math', 'reading', 'science', 'social-studies')),
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  points_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learner_profiles_user_id ON public.learner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_learner_subject ON public.diagnostic_results(learner_id, subject);
CREATE INDEX IF NOT EXISTS idx_learning_plans_learner_subject ON public.learning_plans(learner_id, subject, is_active);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_learner_subject ON public.lesson_progress(learner_id, subject);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON public.lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_skill_mastery_learner_subject ON public.skill_mastery(learner_id, subject);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_learner ON public.learning_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_notes_learner ON public.learner_notes(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_achievements_learner ON public.learner_achievements(learner_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_achievements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Users can only see their own learner profiles
CREATE POLICY "Users can view own learner profiles" ON public.learner_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see diagnostic results for their learners
CREATE POLICY "Users can view own diagnostic results" ON public.diagnostic_results
  FOR ALL USING (
    learner_id IN (
      SELECT id FROM public.learner_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see learning plans for their learners
CREATE POLICY "Users can view own learning plans" ON public.learning_plans
  FOR ALL USING (
    learner_id IN (
      SELECT id FROM public.learner_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see lesson progress for their learners
CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress
  FOR ALL USING (
    learner_id IN (
      SELECT id FROM public.learner_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see skill mastery for their learners
CREATE POLICY "Users can view own skill mastery" ON public.skill_mastery
  FOR ALL USING (
    learner_id IN (
      SELECT id FROM public.learner_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see learning sessions for their learners
CREATE POLICY "Users can view own learning sessions" ON public.learning_sessions
  FOR ALL USING (
    learner_id IN (
      SELECT id FROM public.learner_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see notes for their learners
CREATE POLICY "Users can view own learner notes" ON public.learner_notes
  FOR ALL USING (
    learner_id IN (
      SELECT id FROM public.learner_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see achievements for their learners
CREATE POLICY "Users can view own learner achievements" ON public.learner_achievements
  FOR ALL USING (
    learner_id IN (
      SELECT id FROM public.learner_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learner_profiles_updated_at BEFORE UPDATE ON public.learner_profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_plans_updated_at BEFORE UPDATE ON public.learning_plans 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_mastery_updated_at BEFORE UPDATE ON public.skill_mastery 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learner_notes_updated_at BEFORE UPDATE ON public.learner_notes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
