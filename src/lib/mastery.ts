/**
 * Mastery tracking and spaced repetition system
 * Manages student progress and schedules reviews based on performance
 */

import { SubjectKey } from './levels';

export interface MasteryRecord {
  skillId: string;
  theta: number; // IRT ability estimate for this skill (-2 to +2)
  attempts: number;
  lastPracticed: string; // ISO date string
  nextReview: string; // ISO date string
  masteryLevel: 'beginning' | 'developing' | 'proficient' | 'advanced';
}

export interface ReviewItem {
  lessonId: string;
  skillId: string;
  scheduledFor: string; // ISO date string
  priority: number;
  reviewType: 'spaced' | 'immediate' | 'remediation';
}

/**
 * Update mastery for a skill based on practice result
 * Uses IRT-like theta adjustment with spaced repetition scheduling
 */
export function updateMastery(params: {
  subject: SubjectKey;
  skillId: string;
  correct: boolean;
  lessonId?: string;
}): MasteryRecord {
  const { subject, skillId, correct, lessonId } = params;
  
  // Load existing mastery data
  const masteryKey = `bp_mastery_${subject}`;
  const existing = localStorage.getItem(masteryKey);
  const masteryData: Record<string, MasteryRecord> = existing ? JSON.parse(existing) : {};
  
  // Get or create mastery record for this skill
  const current = masteryData[skillId] || {
    skillId,
    theta: 0,
    attempts: 0,
    lastPracticed: new Date().toISOString(),
    nextReview: new Date().toISOString(),
    masteryLevel: 'beginning' as const
  };
  
  // Update theta based on performance
  // Correct answers increase theta, incorrect decrease it
  const adjustment = correct ? 0.2 : -0.2;
  const newTheta = Math.max(-2, Math.min(2, current.theta + adjustment));
  
  // Update mastery record
  const updated: MasteryRecord = {
    ...current,
    theta: newTheta,
    attempts: current.attempts + 1,
    lastPracticed: new Date().toISOString(),
    nextReview: calculateNextReview(newTheta, correct),
    masteryLevel: thetaToMasteryLevel(newTheta)
  };
  
  // Save updated mastery data
  masteryData[skillId] = updated;
  localStorage.setItem(masteryKey, JSON.stringify(masteryData));
  
  // Schedule review if needed
  if (lessonId) {
    scheduleReview({
      subject,
      lessonId,
      skillId,
      days: nextReviewInDays(newTheta, correct)
    });
  }
  
  return updated;
}

/**
 * Calculate next review date based on theta and performance
 */
function calculateNextReview(theta: number, correct: boolean): string {
  const days = nextReviewInDays(theta, correct);
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + days);
  return nextReview.toISOString();
}

/**
 * Calculate number of days until next review based on mastery level
 * Higher theta = longer intervals, incorrect answers = shorter intervals
 */
export function nextReviewInDays(theta: number, wasCorrect: boolean = true): number {
  // Base intervals based on theta (mastery level)
  let baseDays: number;
  
  if (theta >= 1.5) {
    baseDays = 14; // Advanced: 2 weeks
  } else if (theta >= 0.5) {
    baseDays = 7;  // Proficient: 1 week
  } else if (theta >= -0.5) {
    baseDays = 4;  // Developing: 4 days
  } else {
    baseDays = 2;  // Beginning: 2 days
  }
  
  // Adjust based on recent performance
  if (!wasCorrect) {
    baseDays = Math.max(1, Math.floor(baseDays / 2)); // Half the interval for incorrect
  }
  
  return baseDays;
}

/**
 * Convert theta to mastery level description
 */
function thetaToMasteryLevel(theta: number): MasteryRecord['masteryLevel'] {
  if (theta >= 1.5) return 'advanced';
  if (theta >= 0.5) return 'proficient';
  if (theta >= -0.5) return 'developing';
  return 'beginning';
}

/**
 * Schedule a review item for future practice
 */
export function scheduleReview(params: {
  subject: SubjectKey;
  lessonId: string;
  skillId: string;
  days: number;
}): void {
  const { subject, lessonId, skillId, days } = params;
  
  // Calculate scheduled date
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + days);
  
  // Load existing plan
  const planKey = `bp_plan_${subject}`;
  const existing = localStorage.getItem(planKey);
  const planItems = existing ? JSON.parse(existing) : [];
  
  // Create review item
  const reviewItem = {
    lessonId: `review-${lessonId}`,
    skillId,
    scheduledFor: scheduledDate.toISOString(),
    priority: 1000 + (7 - days) * 100, // Higher priority for sooner reviews
    reviewType: 'spaced' as const,
    title: `Review: ${lessonId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    minutes: 5,
    type: 'review'
  };
  
  // Add to plan items
  planItems.push(reviewItem);
  
  // Save updated plan
  localStorage.setItem(planKey, JSON.stringify(planItems));
}

/**
 * Get mastery data for a subject
 */
export function getMasteryData(subject: SubjectKey): Record<string, MasteryRecord> {
  const masteryKey = `bp_mastery_${subject}`;
  const existing = localStorage.getItem(masteryKey);
  return existing ? JSON.parse(existing) : {};
}

/**
 * Get skills that need review (past due date)
 */
export function getSkillsNeedingReview(subject: SubjectKey): MasteryRecord[] {
  const masteryData = getMasteryData(subject);
  const now = new Date();
  
  return Object.values(masteryData).filter(record => {
    const reviewDate = new Date(record.nextReview);
    return reviewDate <= now;
  });
}

/**
 * Get overall mastery summary for a subject
 */
export function getMasterySummary(subject: SubjectKey): {
  totalSkills: number;
  masteredSkills: number;
  averageTheta: number;
  skillsNeedingReview: number;
  masteryPercentage: number;
} {
  const masteryData = getMasteryData(subject);
  const records = Object.values(masteryData);
  
  if (records.length === 0) {
    return {
      totalSkills: 0,
      masteredSkills: 0,
      averageTheta: 0,
      skillsNeedingReview: 0,
      masteryPercentage: 0
    };
  }
  
  const masteredSkills = records.filter(r => r.theta >= 0.5).length;
  const averageTheta = records.reduce((sum, r) => sum + r.theta, 0) / records.length;
  const skillsNeedingReview = getSkillsNeedingReview(subject).length;
  
  return {
    totalSkills: records.length,
    masteredSkills,
    averageTheta,
    skillsNeedingReview,
    masteryPercentage: Math.round((masteredSkills / records.length) * 100)
  };
}

/**
 * Reset mastery data for a subject (useful for testing)
 */
export function resetMasteryData(subject: SubjectKey): void {
  const masteryKey = `bp_mastery_${subject}`;
  localStorage.removeItem(masteryKey);
}
