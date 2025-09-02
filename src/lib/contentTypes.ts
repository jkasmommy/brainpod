/**
 * BrainPod Content Database Types
 * 
 * TypeScript definitions for the content database schema and activity content.
 * These types correspond to the database tables and JSON structures.
 */

// ============================================================================
// CORE CONTENT TYPES
// ============================================================================

export interface ContentSubject {
  id: string;                   // 'math', 'reading', 'science', 'social-studies'
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentCourse {
  id: string;                   // 'K', '1', '2', ..., 'HS:algebra-1'
  subject_id: string;
  type: 'grade' | 'course';
  title: string;
  short_title?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContentUnit {
  id: string;                   // UUID
  subject_id: string;
  course_id: string;
  slug: string;                 // 'counting', 'place-value', etc.
  title: string;
  description?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContentLesson {
  id: string;                   // 'math-k-counting-1'
  unit_id: string;              // UUID reference
  title: string;
  minutes: number;
  difficulty: number;           // -1.0 to +1.0
  summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentSkill {
  id: string;                   // 'count_1_5', 'add_within_5'
  subject_id: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentStandard {
  code: string;                 // 'K.CC.A.1', 'HS-LS1-2'
  framework: string;            // 'CCSS-M', 'NGSS', 'C3'
  title?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// ACTIVITY CONTENT TYPES
// ============================================================================

export interface MCQItem {
  type: 'mcq';
  stem: string;                 // Question text
  choices: Array<string | number>;
  answer: string | number;      // Correct answer
  explanation?: string;         // Why this answer is correct
  skill_id?: string;            // Associated skill
  difficulty?: number;          // -1.0 to +1.0
  prompts?: {
    generate_hint?: string;     // Prompt template ID or inline prompt
    rubric?: string;            // Scoring rubric
    encouragement?: string;     // Positive feedback
  };
}

export interface NumericInputItem {
  type: 'numeric';
  stem: string;
  answer: number;
  tolerance?: number;           // Acceptable range (±)
  unit?: string;                // 'inches', 'cm', etc.
  explanation?: string;
  skill_id?: string;
  difficulty?: number;
  prompts?: {
    generate_hint?: string;
    rubric?: string;
  };
}

export interface TextInputItem {
  type: 'text';
  stem: string;
  answer: string | string[];    // Single answer or multiple acceptable answers
  case_sensitive?: boolean;
  explanation?: string;
  skill_id?: string;
  difficulty?: number;
  prompts?: {
    generate_hint?: string;
    rubric?: string;
  };
}

export interface DragDropItem {
  type: 'drag-drop';
  stem: string;
  items: Array<{
    id: string;
    label: string;
    category: string;
  }>;
  categories: Array<{
    id: string;
    label: string;
  }>;
  solution: Record<string, string>;  // item_id -> category_id
  explanation?: string;
  skill_id?: string;
  difficulty?: number;
}

export type ActivityItem = MCQItem | NumericInputItem | TextInputItem | DragDropItem;

// ============================================================================
// ACTIVITY BLOCK TYPES
// ============================================================================

export interface InstructionBlock {
  type: 'instruction';
  html?: string;                // Safe HTML content
  markdown?: string;            // Markdown content (alternative to HTML)
  image?: string;               // Image URL
  video?: string;               // Video URL
  audio?: string;               // Audio URL
}

export interface PracticeBlock {
  type: 'practice';
  instructions?: string;        // Optional instructions for the practice
  items: ActivityItem[];        // Practice questions/activities
  shuffle?: boolean;            // Whether to randomize item order
  max_attempts?: number;        // Max attempts per item (default: unlimited)
}

export interface QuizBlock {
  type: 'quiz';
  instructions?: string;
  items: ActivityItem[];
  shuffle?: boolean;
  time_limit?: number;          // Time limit in seconds
  attempts: number;             // Usually 1 for quizzes
}

export interface MindfulBlock {
  type: 'mindful';
  mode: 'breathing' | 'stretch' | 'affirmation' | 'gratitude';
  duration?: number;            // Duration in seconds
  payload: {
    pattern?: number[];         // Breathing pattern [inhale, hold, exhale, pause]
    script?: string;            // Guided text/audio script
    background?: string;        // Background image/video URL
    audio?: string;             // Background audio URL
  };
}

export type ActivityBlock = InstructionBlock | PracticeBlock | QuizBlock | MindfulBlock;

// ============================================================================
// COMPLETE ACTIVITY CONTENT
// ============================================================================

export interface ActivityContent {
  schema: number;               // Version number (currently 1)
  blocks: ActivityBlock[];      // Ordered sequence of activity blocks
  metadata?: {
    estimated_time?: number;    // Estimated completion time in minutes
    adaptive?: boolean;         // Whether content adapts based on performance
    prerequisite_skills?: string[];  // Required skills
    learning_objectives?: string[];  // What students will learn
  };
}

export interface ContentActivity {
  id: string;                   // UUID
  lesson_id: string;
  kind: 'instruction' | 'practice' | 'quiz' | 'mindful';
  content: ActivityContent;     // JSON content following schema above
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// DIAGNOSTIC TYPES
// ============================================================================

export interface DiagnosticForm {
  id: string;                   // 'math-k', 'reading-1'
  subject_id: string;
  label?: string;
  description?: string;
  meta?: {
    min_items?: number;
    max_items?: number;
    target_precision?: number;
    adaptive?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface DiagnosticItem {
  id: string;                   // UUID
  form_id: string;
  external_id?: string;         // Original ID from JSON files
  order_index: number;
  item: {
    id: string;                 // Diagnostic item identifier
    subject: string;
    skill: string;              // Associated skill ID
    difficulty: number;         // IRT difficulty parameter
    prompt: string;             // Question text
    type: 'mcq' | 'input' | 'numeric';
    choices?: string[];         // For MCQ items
    answer: string;             // Correct answer
    explanation?: string;       // Explanation of correct answer
    hint?: string;              // Optional hint
  };
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// PROMPT TEMPLATE TYPES
// ============================================================================

export interface PromptTemplate {
  id: string;                   // UUID
  scope: 'lesson' | 'activity' | 'skill' | 'diagnostic' | 'global';
  ref_id?: string;              // Reference to lesson_id, skill_id, etc.
  version: number;
  name: string;                 // 'generate_hint', 'rubric', 'encouragement'
  template: string;             // Prompt with {{placeholders}}
  meta?: {
    model?: string;             // Preferred AI model
    temperature?: number;       // Generation temperature
    max_tokens?: number;        // Token limit
    variables?: string[];       // List of required template variables
  };
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// CONTENT LOADING TYPES
// ============================================================================

export interface LessonWithActivities {
  lesson: ContentLesson;
  activities: ContentActivity[];
  skills: ContentSkill[];
  standards: ContentStandard[];
}

export interface UnitWithLessons {
  unit: ContentUnit;
  lessons: ContentLesson[];
}

export interface CourseWithUnits {
  course: ContentCourse;
  units: ContentUnit[];
}

export interface SubjectContent {
  subject: ContentSubject;
  courses: CourseWithUnits[];
}

// ============================================================================
// LEGACY COMPATIBILITY TYPES
// ============================================================================

// Types for the current manifest.json structure (for migration compatibility)
export interface LegacyManifest {
  [subject: string]: {
    [grade: string]: {
      [unit: string]: {
        title: string;
        description?: string;
        lessons: Array<{
          id: string;
          title: string;
          skills: string[];
          minutes: number;
          difficulty: number;
          standards: string[];
        }>;
      };
    };
  };
}

export interface LegacySkills {
  [skillId: string]: string[];  // skill_id -> prerequisite_skill_ids
}
