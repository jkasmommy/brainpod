/**
 * BrainPod Diagnostic System Types
 * 
 * Defines the core types for adaptive diagnostic assessments
 * that determine optimal starting grade/unit for each subject.
 */

export type Subject = "math" | "reading" | "science" | "social-studies";

/**
 * Individual diagnostic item/question
 */
export interface DiagItem {
  id: string;
  subject: Subject;
  skill: string;              // e.g., "counting", "phonics", "life-cycles"
  gradeHint: string;          // e.g., "K", "1", "2-3"
  difficulty: number;         // -2 to +2 (lower = easier)
  type: "mcq" | "count" | "phoneme" | "map";
  prompt: string;             // The question text
  choices?: string[];         // For MCQ items
  answer: string;             // Correct answer
}

/**
 * Configuration for how a diagnostic should run
 */
export interface DiagBlueprint {
  subject: Subject;
  minItems: number;           // Minimum questions before stopping
  maxItems: number;           // Maximum questions (hard stop)
  breakAfter: number;         // Trigger mindful break after this many items
  startDifficulty: number;    // Initial difficulty level (usually 0)
  stopRules: {
    streak: number;           // Stop if consecutive correct/incorrect reaches this
    minSkills: number;        // Minimum distinct skills to assess
  };
}

/**
 * Final placement recommendation
 */
export interface Placement {
  ability: number;            // Final ability estimate (-2 to +2)
  sem: number;               // Standard error of measurement
  recommendedGrade: string;   // Human-readable grade recommendation
  recommendedUnit?: string;   // Optional unit/topic to start with
}

/**
 * Current diagnostic session state
 */
export interface DiagState {
  subject: Subject;
  ability: number;            // Current ability estimate
  itemsAsked: string[];       // IDs of items already asked
  skillsSeen: Set<string>;    // Distinct skills encountered
  correctCount: number;       // Number correct so far
  attempts: number;           // Total attempts
  streak: number;             // Current streak (positive = correct, negative = incorrect)
  mood: number;               // 1-5 mood rating
  needsBreak: boolean;        // Whether to show mindful break
}

/**
 * Individual response record (for localStorage)
 */
export interface DiagAttempt {
  itemId: string;
  response: string;
  correct: boolean;
  abilityAfter: number;
  timestamp: number;
}

/**
 * Saved diagnostic results (for localStorage)
 */
export interface SavedPlacement {
  subject: Subject;
  placement: Placement;
  timestamp: number;
  attempts: DiagAttempt[];
}
