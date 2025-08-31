/**
 * Enhanced Progress Tracking with Curriculum Integration
 */

import { 
  StudentProgress, 
  SkillNode, 
  MATH_SKILLS, 
  READING_SKILLS, 
  GRADE_LEVELS,
  getNextRecommendedSkill,
  generateAdaptiveLessonSequence
} from './curriculum';

export interface EnhancedLessonProgress {
  lessonId: string;
  subject: string;
  grade: string;
  unit: string;
  skills: string[]; // SkillNode IDs
  standards: string[]; // Standard codes
  attempts: number;
  correctAnswers: number;
  totalAnswers: number;
  correctRate: number;
  timeSpent: number; // minutes
  mastered: boolean;
  masteryThreshold: number; // 0-1, typically 0.8
  lastPracticed: number; // timestamp
  difficulty: number; // -2 to 2
  skillsLearned: string[];
  prerequisitesMet: boolean;
  nextRecommendedLessons: string[];
}

export interface CurriculumProgress {
  studentId: string;
  subject: string;
  currentLevel: {
    grade: string;
    unit: string;
    lesson: string;
    position: number; // 0-1, how far through the unit
  };
  skillMastery: Record<string, {
    level: number; // 0-1 mastery level
    lastPracticed: number;
    attempts: number;
    needsReview: boolean;
    masteredDate?: number;
  }>;
  standardsProgress: Record<string, {
    introduced: boolean;
    practicing: boolean;
    mastered: boolean;
    evidence: string[]; // lesson IDs where this was practiced
  }>;
  adaptivePath: {
    recommendedLessons: string[];
    acceleratedTrack: boolean;
    supportNeeded: string[]; // skill IDs needing extra support
    skipRecommendations: string[]; // lesson IDs that can be skipped
  };
  yearlyGoals: {
    gradeLevel: string;
    progressToGoals: number; // 0-1
    onTrackForGradeLevel: boolean;
    projectedCompletionDate: number;
  };
}

/**
 * Track lesson completion with curriculum integration
 */
export function recordLessonCompletion(
  lessonId: string,
  correctAnswers: number,
  totalAnswers: number,
  timeSpent: number,
  studentId: string = 'current'
): void {
  try {
    // Parse lesson ID to extract curriculum information
    const lessonParts = lessonId.split('_');
    const subject = lessonParts[0];
    const grade = lessonParts[1];
    const unit = lessonParts[2];
    
    // Get existing progress
    let progress = getStudentProgress(subject, studentId);
    
    // Create lesson progress record
    const lessonProgress: EnhancedLessonProgress = {
      lessonId,
      subject,
      grade,
      unit,
      skills: getSkillsForLesson(lessonId),
      standards: getStandardsForLesson(lessonId),
      attempts: 1,
      correctAnswers,
      totalAnswers,
      correctRate: totalAnswers > 0 ? correctAnswers / totalAnswers : 0,
      timeSpent,
      mastered: (correctAnswers / totalAnswers) >= 0.8,
      masteryThreshold: 0.8,
      lastPracticed: Date.now(),
      difficulty: calculateLessonDifficulty(lessonId),
      skillsLearned: [],
      prerequisitesMet: true,
      nextRecommendedLessons: []
    };
    
    // Update skill mastery based on lesson performance
    updateSkillMastery(lessonProgress, progress);
    
    // Update curriculum progress
    updateCurriculumProgress(lessonProgress, progress);
    
    // Generate adaptive next steps
    generateAdaptiveRecommendations(progress);
    
    // Save progress
    saveStudentProgress(progress, studentId);
    
    // Update mastery data for backward compatibility
    const masteryKey = 'bp_mastery';
    const existingMastery = JSON.parse(localStorage.getItem(masteryKey) || '{}');
    existingMastery[lessonId] = {
      lessonId,
      subject,
      attempts: lessonProgress.attempts,
      correctAnswers,
      totalAnswers,
      correctRate: lessonProgress.correctRate,
      timeSpent,
      mastered: lessonProgress.mastered,
      lastPracticed: Date.now(),
      difficulty: lessonProgress.difficulty,
      skillsRequired: lessonProgress.skills,
      skillsLearned: lessonProgress.skillsLearned
    };
    localStorage.setItem(masteryKey, JSON.stringify(existingMastery));
    
  } catch (error) {
    console.error('Error recording lesson completion:', error);
  }
}

/**
 * Get comprehensive student progress for a subject
 */
export function getStudentProgress(subject: string, studentId: string = 'current'): CurriculumProgress {
  const progressKey = `bp_curriculum_progress_${subject}_${studentId}`;
  const saved = localStorage.getItem(progressKey);
  
  if (saved) {
    return JSON.parse(saved);
  }
  
  // Create initial progress structure
  const gradeLevel = GRADE_LEVELS['K']; // Start at kindergarten
  const subjectCurriculum = gradeLevel.subjects.find(s => s.subject === subject);
  const firstUnit = subjectCurriculum?.units[0];
  
  return {
    studentId,
    subject,
    currentLevel: {
      grade: 'K',
      unit: firstUnit?.id || 'introduction',
      lesson: '',
      position: 0
    },
    skillMastery: {},
    standardsProgress: {},
    adaptivePath: {
      recommendedLessons: [],
      acceleratedTrack: false,
      supportNeeded: [],
      skipRecommendations: []
    },
    yearlyGoals: {
      gradeLevel: 'K',
      progressToGoals: 0,
      onTrackForGradeLevel: true,
      projectedCompletionDate: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  };
}

/**
 * Update skill mastery based on lesson performance
 */
function updateSkillMastery(lesson: EnhancedLessonProgress, progress: CurriculumProgress): void {
  const allSkills = lesson.subject === 'math' ? MATH_SKILLS : READING_SKILLS;
  
  for (const skillId of lesson.skills) {
    const skill = allSkills[skillId];
    if (!skill) continue;
    
    const currentMastery = progress.skillMastery[skillId] || {
      level: 0,
      lastPracticed: 0,
      attempts: 0,
      needsReview: false
    };
    
    // Update mastery level based on performance
    const performanceWeight = 0.3; // How much this attempt affects overall mastery
    const newLevel = (currentMastery.level * (1 - performanceWeight)) + 
                    (lesson.correctRate * performanceWeight);
    
    progress.skillMastery[skillId] = {
      level: Math.min(1, Math.max(0, newLevel)),
      lastPracticed: Date.now(),
      attempts: currentMastery.attempts + 1,
      needsReview: newLevel < 0.7 && currentMastery.attempts > 2,
      masteredDate: newLevel >= 0.8 && !currentMastery.masteredDate ? Date.now() : currentMastery.masteredDate
    };
  }
}

/**
 * Update curriculum progress and positioning
 */
function updateCurriculumProgress(lesson: EnhancedLessonProgress, progress: CurriculumProgress): void {
  // Update standards progress
  for (const standardCode of lesson.standards) {
    if (!progress.standardsProgress[standardCode]) {
      progress.standardsProgress[standardCode] = {
        introduced: false,
        practicing: false,
        mastered: false,
        evidence: []
      };
    }
    
    const standardProgress = progress.standardsProgress[standardCode];
    standardProgress.introduced = true;
    standardProgress.practicing = true;
    standardProgress.evidence.push(lesson.lessonId);
    
    if (lesson.mastered && standardProgress.evidence.length >= 2) {
      standardProgress.mastered = true;
      standardProgress.practicing = false;
    }
  }
  
  // Update current level if this lesson represents progress
  if (lesson.grade === progress.currentLevel.grade && 
      lesson.unit === progress.currentLevel.unit) {
    progress.currentLevel.lesson = lesson.lessonId;
    
    // Calculate position within unit based on lessons completed
    const gradeLevel = GRADE_LEVELS[lesson.grade];
    const subjectCurriculum = gradeLevel?.subjects.find(s => s.subject === lesson.subject);
    const unit = subjectCurriculum?.units.find(u => u.id === lesson.unit);
    
    if (unit && unit.lessons) {
      const lessonIndex = unit.lessons.indexOf(lesson.lessonId);
      if (lessonIndex >= 0) {
        progress.currentLevel.position = (lessonIndex + 1) / unit.lessons.length;
      }
    }
  }
}

/**
 * Generate adaptive recommendations for next steps
 */
function generateAdaptiveRecommendations(progress: CurriculumProgress): void {
  const subject = progress.subject;
  
  // Find skills that need review
  const supportNeeded: string[] = [];
  for (const [skillId, mastery] of Object.entries(progress.skillMastery)) {
    if (mastery.needsReview || (mastery.level < 0.7 && mastery.attempts > 1)) {
      supportNeeded.push(skillId);
    }
  }
  
  // Find skills ready for acceleration
  const readyForAcceleration = Object.entries(progress.skillMastery)
    .filter(([_, mastery]) => mastery.level >= 0.9)
    .map(([skillId, _]) => skillId);
  
  // Generate recommended lesson sequence
  const mockStudentProgress: StudentProgress = {
    studentId: progress.studentId,
    subject: progress.subject,
    currentGrade: progress.currentLevel.grade,
    currentUnit: progress.currentLevel.unit,
    currentLesson: progress.currentLevel.lesson,
    masteredSkills: Object.entries(progress.skillMastery)
      .filter(([_, mastery]) => mastery.level >= 0.8)
      .map(([skillId, _]) => skillId),
    skillLevels: Object.fromEntries(
      Object.entries(progress.skillMastery).map(([skillId, mastery]) => [skillId, mastery.level])
    ),
    adaptiveLevel: calculateAdaptiveLevel(progress),
    lastAssessment: new Date(),
    recommendedPath: [],
    strugglingAreas: supportNeeded,
    acceleratedAreas: readyForAcceleration
  };
  
  progress.adaptivePath = {
    recommendedLessons: generateAdaptiveLessonSequence(
      subject, 
      progress.currentLevel.unit, 
      mockStudentProgress, 
      5
    ),
    acceleratedTrack: readyForAcceleration.length > supportNeeded.length,
    supportNeeded,
    skipRecommendations: []
  };
}

/**
 * Calculate overall adaptive level for student
 */
function calculateAdaptiveLevel(progress: CurriculumProgress): number {
  const masteryLevels = Object.values(progress.skillMastery).map(m => m.level);
  if (masteryLevels.length === 0) return 0;
  
  const averageMastery = masteryLevels.reduce((sum, level) => sum + level, 0) / masteryLevels.length;
  
  // Convert mastery (0-1) to ability (-2 to 2)
  return (averageMastery - 0.5) * 4;
}

/**
 * Get skills associated with a lesson
 */
function getSkillsForLesson(lessonId: string): string[] {
  // This would be expanded to map lessons to skills
  // For now, return basic mapping based on lesson ID
  const lessonParts = lessonId.split('_');
  const subject = lessonParts[0];
  
  if (subject === 'math') {
    if (lessonId.includes('counting')) {
      return ['count_1_10', 'number_recognition_1_10'];
    } else if (lessonId.includes('addition')) {
      return ['addition_within_5', 'addition_within_10'];
    }
  } else if (subject === 'reading') {
    if (lessonId.includes('letters')) {
      return ['letter_recognition_uppercase', 'letter_recognition_lowercase'];
    } else if (lessonId.includes('phonics')) {
      return ['letter_sounds_basic', 'rhyming_words'];
    }
  }
  
  return [];
}

/**
 * Get standards associated with a lesson
 */
function getStandardsForLesson(lessonId: string): string[] {
  // This would be expanded to map lessons to standards
  // For now, return basic mapping
  const lessonParts = lessonId.split('_');
  const subject = lessonParts[0];
  
  if (subject === 'math' && lessonId.includes('counting')) {
    return ['CCSS.MATH.K.CC.A.1', 'CCSS.MATH.K.CC.B.4'];
  } else if (subject === 'reading' && lessonId.includes('letters')) {
    return ['CCSS.ELA-LITERACY.RF.K.1.A', 'CCSS.ELA-LITERACY.RF.K.3.A'];
  }
  
  return [];
}

/**
 * Calculate difficulty level for a lesson
 */
function calculateLessonDifficulty(lessonId: string): number {
  // Basic difficulty calculation based on lesson content
  if (lessonId.includes('_k_') || lessonId.includes('counting')) return -1.0;
  if (lessonId.includes('_1_') || lessonId.includes('addition')) return -0.5;
  if (lessonId.includes('_2_')) return 0.0;
  if (lessonId.includes('_3_')) return 0.5;
  return 1.0;
}

/**
 * Save student progress to localStorage
 */
function saveStudentProgress(progress: CurriculumProgress, studentId: string = 'current'): void {
  const progressKey = `bp_curriculum_progress_${progress.subject}_${studentId}`;
  localStorage.setItem(progressKey, JSON.stringify(progress));
}

/**
 * Get grade-level expectations for dashboard display
 */
export function getGradeLevelExpectations(subject: string, grade: string): {
  skills: string[];
  standards: string[];
  yearEndGoals: string[];
} {
  const gradeLevel = GRADE_LEVELS[grade];
  if (!gradeLevel) return { skills: [], standards: [], yearEndGoals: [] };
  
  const subjectCurriculum = gradeLevel.subjects.find(s => s.subject === subject);
  if (!subjectCurriculum) return { skills: [], standards: [], yearEndGoals: [] };
  
  const allSkills = subjectCurriculum.units.flatMap(unit => unit.skills);
  const allStandards = subjectCurriculum.units.flatMap(unit => unit.standards);
  
  return {
    skills: allSkills,
    standards: allStandards,
    yearEndGoals: subjectCurriculum.yearEndGoals
  };
}

/**
 * Check if student is on track for grade level
 */
export function isOnTrackForGradeLevel(
  subject: string, 
  currentGrade: string, 
  studentId: string = 'current'
): {
  onTrack: boolean;
  percentComplete: number;
  areasOfConcern: string[];
  strengths: string[];
} {
  const progress = getStudentProgress(subject, studentId);
  const expectations = getGradeLevelExpectations(subject, currentGrade);
  
  let masteredCount = 0;
  const areasOfConcern: string[] = [];
  const strengths: string[] = [];
  
  for (const skillId of expectations.skills) {
    const mastery = progress.skillMastery[skillId];
    if (mastery?.level >= 0.8) {
      masteredCount++;
      if (mastery.level >= 0.95) {
        strengths.push(skillId);
      }
    } else if (mastery?.attempts > 2 && mastery.level < 0.6) {
      areasOfConcern.push(skillId);
    }
  }
  
  const percentComplete = expectations.skills.length > 0 ? 
    masteredCount / expectations.skills.length : 0;
  
  return {
    onTrack: percentComplete >= 0.7,
    percentComplete,
    areasOfConcern,
    strengths
  };
}
