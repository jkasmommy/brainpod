import { PlanItem } from './types';

/**
 * Build a daily playlist using spaced repetition intervals
 * Review intervals: [1, 2, 4, 7, 14] days for optimal retention
 */
export function buildDailyPlaylist(
  planItems: PlanItem[], 
  mastery?: { [lessonId: string]: number }
): PlanItem[] {
  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date(today);

  // Filter items that are scheduled for today or overdue
  const dueItems = planItems.filter(item => {
    const scheduledDate = new Date(item.scheduled_for);
    return scheduledDate <= todayDate && item.status !== "done";
  });

  // Add review items based on mastery and spaced repetition
  const reviewItems = generateReviewItems(planItems, mastery, today);

  // Combine and sort by priority
  const allItems = [...dueItems, ...reviewItems];
  
  // Remove duplicates (same lesson scheduled multiple times)
  const uniqueItems = allItems.filter((item, index, self) => 
    index === self.findIndex(i => i.lessonId === item.lessonId)
  );

  // Sort by priority (lower number = higher priority)
  return uniqueItems.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate review items based on spaced repetition intervals
 * Uses research-backed intervals: 1, 2, 4, 7, 14 days
 */
function generateReviewItems(
  planItems: PlanItem[], 
  mastery: { [lessonId: string]: number } = {}, 
  today: string
): PlanItem[] {
  const reviewItems: PlanItem[] = [];
  const reviewIntervals = [1, 2, 4, 7, 14]; // Days
  const todayDate = new Date(today);

  // Find completed items that need review
  const completedItems = planItems.filter(item => item.status === "done");

  completedItems.forEach(item => {
    const completedDate = new Date(item.scheduled_for);
    const daysSinceCompletion = Math.floor(
      (todayDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get mastery level (0-1, default 0.5)
    const masteryLevel = mastery[item.lessonId] || 0.5;
    
    // Determine if review is needed based on interval and mastery
    const shouldReview = shouldScheduleReview(daysSinceCompletion, masteryLevel, reviewIntervals);
    
    if (shouldReview) {
      // Create review item with lower priority
      reviewItems.push({
        ...item,
        scheduled_for: today,
        status: "todo",
        priority: item.priority + 1000 // Lower priority for reviews
      });
    }
  });

  return reviewItems;
}

/**
 * Determine if a lesson should be reviewed based on spaced repetition algorithm
 */
function shouldScheduleReview(
  daysSinceCompletion: number, 
  masteryLevel: number, 
  intervals: number[]
): boolean {
  // Higher mastery = longer intervals before review
  // Lower mastery = more frequent reviews
  
  // Adjust intervals based on mastery (0.5 = baseline)
  const masteryMultiplier = Math.max(0.5, masteryLevel);
  const adjustedIntervals = intervals.map(interval => 
    Math.round(interval * masteryMultiplier)
  );

  // Check if current day matches any review interval
  return adjustedIntervals.some(interval => {
    // Allow 1-day tolerance for review scheduling
    return Math.abs(daysSinceCompletion - interval) <= 1;
  });
}

/**
 * Update mastery score based on lesson performance
 */
export function updateMastery(
  lessonId: string, 
  performance: number, // 0-1 (0 = poor, 1 = excellent)
  currentMastery: number = 0.5
): number {
  // Weighted average: 70% current mastery + 30% recent performance
  const newMastery = (currentMastery * 0.7) + (performance * 0.3);
  
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, newMastery));
}

/**
 * Calculate optimal lesson sequence for a learning session
 */
export function optimizeSessionOrder(playlist: PlanItem[]): PlanItem[] {
  // Sort by learning science principles:
  // 1. Prerequisites first
  // 2. Interleave different skill types
  // 3. End with review/reinforcement
  
  const newLessons = playlist.filter(item => item.priority < 1000);
  const reviewLessons = playlist.filter(item => item.priority >= 1000);
  
  // Interleave new and review lessons
  const optimized: PlanItem[] = [];
  const maxLength = Math.max(newLessons.length, reviewLessons.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (i < newLessons.length) {
      optimized.push(newLessons[i]);
    }
    if (i < reviewLessons.length && optimized.length > 0) {
      optimized.push(reviewLessons[i]);
    }
  }
  
  return optimized;
}
