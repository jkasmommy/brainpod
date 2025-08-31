/**
 * Level management system for tracking student placement and progress
 * Integrates with diagnostic placement to maintain learning levels per subject
 */

export type SubjectKey = "math" | "reading" | "science" | "social-studies";

export interface LevelRecord {
  subject: SubjectKey;
  levelLabel: string;
  grade: string;
  unit: string;
  ability: number;
  confidence: number;
  lastUpdated: string;
}

/**
 * Get level record for a specific subject from localStorage
 */
export function getLevel(subject: SubjectKey): LevelRecord | null {
  try {
    const stored = localStorage.getItem(`bp_level_${subject}`);
    if (!stored) return null;
    return JSON.parse(stored) as LevelRecord;
  } catch (error) {
    console.error(`Error loading level for ${subject}:`, error);
    return null;
  }
}

/**
 * Save level record for a specific subject to localStorage
 */
export function setLevel(subject: SubjectKey, level: LevelRecord): void {
  try {
    localStorage.setItem(`bp_level_${subject}`, JSON.stringify(level));
  } catch (error) {
    console.error(`Error saving level for ${subject}:`, error);
  }
}

/**
 * Create or update level record from diagnostic placement data
 * Converts placement output to standardized LevelRecord format
 */
export function upsertLevelFromPlacement(placement: {
  subject: SubjectKey;
  ability: number;
  label: string;
  recommendedGrade: string;
  recommendedUnit?: string;
  sem?: number;
}): LevelRecord {
  // Calculate confidence based on standard error of measurement
  // Higher SEM = lower confidence, clamp between 40% and 95%
  const confidence = Math.max(0.4, Math.min(0.95, 1 - (placement.sem ?? 0.4)));
  
  const levelRecord: LevelRecord = {
    subject: placement.subject,
    levelLabel: placement.label,
    grade: placement.recommendedGrade,
    unit: placement.recommendedUnit || 'Introduction',
    ability: placement.ability,
    confidence,
    lastUpdated: new Date().toISOString()
  };

  // Persist to localStorage
  setLevel(placement.subject, levelRecord);
  
  return levelRecord;
}

/**
 * Get all subject level records
 */
export function getAllLevels(): Record<SubjectKey, LevelRecord | null> {
  const subjects: SubjectKey[] = ["math", "reading", "science", "social-studies"];
  const levels: Record<SubjectKey, LevelRecord | null> = {} as any;
  
  subjects.forEach(subject => {
    levels[subject] = getLevel(subject);
  });
  
  return levels;
}

/**
 * Check if a subject has been diagnosed (has a level record)
 */
export function hasLevel(subject: SubjectKey): boolean {
  return getLevel(subject) !== null;
}

/**
 * Get grade level as display string
 */
export function getGradeDisplay(grade: string): string {
  if (grade === 'K') return 'Kindergarten';
  if (grade === 'PK') return 'Pre-K';
  return `Grade ${grade}`;
}

/**
 * Convert ability score to performance level description
 */
export function getPerformanceLevel(ability: number): string {
  if (ability >= 1.5) return 'Advanced';
  if (ability >= 0.5) return 'Proficient';
  if (ability >= -0.5) return 'Developing';
  return 'Beginning';
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
}
