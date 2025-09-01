import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for our BrainPod application
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_status: 'free' | 'essential' | 'family' | 'plus';
  created_at: string;
  updated_at: string;
}

export interface LearnerProfile {
  id: string;
  user_id: string;
  name: string;
  grade_level: number;
  avatar_url?: string;
  preferences: {
    learning_style?: string;
    difficulty_preference?: string;
    subjects_of_interest?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface DiagnosticResult {
  id: string;
  learner_id: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies';
  ability_score: number;
  placement_label: string;
  recommended_grade: string;
  recommended_unit: string;
  assessment_data: any;
  completed_at: string;
}

export interface LearningPlan {
  id: string;
  learner_id: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies';
  plan_items: any[];
  placement_data: any;
  generated_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  learner_id: string;
  lesson_id: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies';
  unit: string;
  status: 'todo' | 'inprogress' | 'completed' | 'mastered';
  score?: number;
  time_spent: number;
  attempts: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillMastery {
  id: string;
  learner_id: string;
  skill_id: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies';
  mastery_level: number; // 0-100
  confidence_level: number; // 0-100
  last_practiced: string;
  total_practice_time: number;
  created_at: string;
  updated_at: string;
}

// Helper functions for database operations
export const userOperations = {
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }
};

export const learnerOperations = {
  async getLearnerProfiles(userId: string) {
    const { data, error } = await supabase
      .from('learner_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as LearnerProfile[];
  },

  async createLearnerProfile(profile: Omit<LearnerProfile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('learner_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data as LearnerProfile;
  },

  async updateLearnerProfile(id: string, updates: Partial<LearnerProfile>) {
    const { data, error } = await supabase
      .from('learner_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as LearnerProfile;
  }
};

export const diagnosticOperations = {
  async saveDiagnosticResult(result: Omit<DiagnosticResult, 'id' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('diagnostic_results')
      .insert({
        ...result,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as DiagnosticResult;
  },

  async getDiagnosticResults(learnerId: string, subject?: string) {
    let query = supabase
      .from('diagnostic_results')
      .select('*')
      .eq('learner_id', learnerId)
      .order('completed_at', { ascending: false });
    
    if (subject) {
      query = query.eq('subject', subject);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as DiagnosticResult[];
  }
};

export const planOperations = {
  async saveLearningPlan(plan: Omit<LearningPlan, 'id' | 'generated_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('learning_plans')
      .insert({
        ...plan,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as LearningPlan;
  },

  async getLearningPlan(learnerId: string, subject: string) {
    const { data, error } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('learner_id', learnerId)
      .eq('subject', subject)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data as LearningPlan;
  },

  async updateLearningPlan(id: string, updates: Partial<LearningPlan>) {
    const { data, error } = await supabase
      .from('learning_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as LearningPlan;
  }
};

export const progressOperations = {
  async saveProgress(progress: Omit<LessonProgress, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .insert({
        ...progress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as LessonProgress;
  },

  async updateProgress(id: string, updates: Partial<LessonProgress>) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as LessonProgress;
  },

  async getLearnerProgress(learnerId: string, subject?: string) {
    let query = supabase
      .from('lesson_progress')
      .select('*')
      .eq('learner_id', learnerId)
      .order('updated_at', { ascending: false });
    
    if (subject) {
      query = query.eq('subject', subject);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as LessonProgress[];
  }
};

export const masteryOperations = {
  async updateSkillMastery(mastery: Omit<SkillMastery, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('skill_mastery')
      .upsert({
        ...mastery,
        last_practiced: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'learner_id,skill_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as SkillMastery;
  },

  async getSkillMastery(learnerId: string, subject?: string) {
    let query = supabase
      .from('skill_mastery')
      .select('*')
      .eq('learner_id', learnerId)
      .order('last_practiced', { ascending: false });
    
    if (subject) {
      query = query.eq('subject', subject);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as SkillMastery[];
  }
};
