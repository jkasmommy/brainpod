/**
 * Progress tracking and analytics for learning activities
 */

export interface LessonProgress {
  lessonId: string;
  subject: string;
  attempts: number;
  correctAnswers: number;
  totalAnswers: number;
  correctRate: number;
  timeSpent: number; // in minutes
  mastered: boolean;
  lastPracticed: number; // timestamp
  nextReview?: number; // timestamp for spaced repetition
  difficulty: number; // -1 to 1 scale
  skillsRequired: string[];
  skillsLearned: string[];
}

export interface StudySession {
  sessionId: string;
  timestamp: number;
  subject: string;
  lessons: string[];
  totalTime: number;
  totalQuestions: number;
  correctAnswers: number;
  mood: number; // 1-5 scale
  completionRate: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
  category: 'mastery' | 'streak' | 'completion' | 'speed' | 'accuracy';
}

export interface LearningStreak {
  subject: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD format
  streakStartDate: string;
}

/**
 * Updates lesson progress after completion
 */
export function updateLessonProgress(
  lessonId: string,
  subject: string,
  correctAnswers: number,
  totalAnswers: number,
  timeSpent: number,
  difficulty: number,
  skillsRequired: string[] = [],
  skillsLearned: string[] = []
): LessonProgress {
  const existingProgress = getLessonProgress(lessonId);
  const correctRate = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;
  
  const progress: LessonProgress = {
    lessonId,
    subject,
    attempts: (existingProgress?.attempts || 0) + 1,
    correctAnswers: (existingProgress?.correctAnswers || 0) + correctAnswers,
    totalAnswers: (existingProgress?.totalAnswers || 0) + totalAnswers,
    correctRate: calculateOverallCorrectRate(existingProgress, correctAnswers, totalAnswers),
    timeSpent: (existingProgress?.timeSpent || 0) + timeSpent,
    mastered: determineMastery(existingProgress, correctRate, totalAnswers),
    lastPracticed: Date.now(),
    difficulty,
    skillsRequired,
    skillsLearned,
  };

  // Calculate next review date using spaced repetition
  if (progress.mastered) {
    const intervals = [1, 2, 4, 7, 14]; // days
    const intervalIndex = Math.min(progress.attempts - 1, intervals.length - 1);
    const nextReviewDays = intervals[intervalIndex];
    progress.nextReview = Date.now() + (nextReviewDays * 24 * 60 * 60 * 1000);
  }

  // Save to localStorage
  const masteryKey = 'bp_mastery';
  const allProgress = getAllProgress();
  allProgress[lessonId] = progress;
  localStorage.setItem(masteryKey, JSON.stringify(allProgress));

  return progress;
}

/**
 * Calculate overall correct rate considering previous attempts
 */
function calculateOverallCorrectRate(
  existingProgress: LessonProgress | null,
  newCorrect: number,
  newTotal: number
): number {
  if (!existingProgress) {
    return newTotal > 0 ? newCorrect / newTotal : 0;
  }

  const totalCorrect = existingProgress.correctAnswers + newCorrect;
  const totalQuestions = existingProgress.totalAnswers + newTotal;
  
  return totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
}

/**
 * Determine if a lesson is mastered based on performance
 */
function determineMastery(
  existingProgress: LessonProgress | null,
  currentCorrectRate: number,
  totalAnswers: number
): boolean {
  // Already mastered
  if (existingProgress?.mastered) return true;
  
  // Need at least 3 questions to determine mastery
  if (totalAnswers < 3) return false;
  
  // Need at least 80% correct rate
  if (currentCorrectRate < 0.8) return false;
  
  // If this is a repeat attempt, need consistent performance
  if (existingProgress && existingProgress.attempts > 0) {
    const overallRate = calculateOverallCorrectRate(existingProgress, 0, 0);
    return overallRate >= 0.75; // Slightly lower threshold for overall rate
  }
  
  return true;
}

/**
 * Get progress for a specific lesson
 */
export function getLessonProgress(lessonId: string): LessonProgress | null {
  const allProgress = getAllProgress();
  return allProgress[lessonId] || null;
}

/**
 * Get all progress data
 */
export function getAllProgress(): Record<string, LessonProgress> {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem('bp_mastery');
  return stored ? JSON.parse(stored) : {};
}

/**
 * Record a study session
 */
export function recordStudySession(
  subject: string,
  lessons: string[],
  totalTime: number,
  totalQuestions: number,
  correctAnswers: number,
  mood: number
): StudySession {
  const session: StudySession = {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    subject,
    lessons,
    totalTime,
    totalQuestions,
    correctAnswers,
    mood,
    completionRate: totalQuestions > 0 ? correctAnswers / totalQuestions : 0
  };

  // Save to localStorage
  const sessionsKey = 'bp_sessions';
  const existingSessions = localStorage.getItem(sessionsKey);
  const allSessions: StudySession[] = existingSessions ? JSON.parse(existingSessions) : [];
  allSessions.push(session);
  
  // Keep only last 50 sessions
  if (allSessions.length > 50) {
    allSessions.splice(0, allSessions.length - 50);
  }
  
  localStorage.setItem(sessionsKey, JSON.stringify(allSessions));

  return session;
}

/**
 * Get recent study sessions
 */
export function getStudySessions(limit: number = 10): StudySession[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('bp_sessions');
  const sessions: StudySession[] = stored ? JSON.parse(stored) : [];
  
  return sessions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Update learning streak for a subject
 */
export function updateLearningStreak(subject: string): LearningStreak {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const streaksKey = 'bp_streaks';
  const existingStreaks = localStorage.getItem(streaksKey);
  const allStreaks: Record<string, LearningStreak> = existingStreaks ? JSON.parse(existingStreaks) : {};
  
  const currentStreak = allStreaks[subject] || {
    subject,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    streakStartDate: today
  };

  // Check if this continues the streak
  const lastDate = new Date(currentStreak.lastActivityDate);
  const todayDate = new Date(today);
  const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (currentStreak.lastActivityDate === today) {
    // Same day, no change to streak
    return currentStreak;
  } else if (daysDiff === 1 || currentStreak.currentStreak === 0) {
    // Consecutive day or first day
    currentStreak.currentStreak += 1;
    currentStreak.lastActivityDate = today;
    
    if (currentStreak.currentStreak === 1) {
      currentStreak.streakStartDate = today;
    }
  } else if (daysDiff > 1) {
    // Streak broken, restart
    currentStreak.currentStreak = 1;
    currentStreak.lastActivityDate = today;
    currentStreak.streakStartDate = today;
  }

  // Update longest streak
  if (currentStreak.currentStreak > currentStreak.longestStreak) {
    currentStreak.longestStreak = currentStreak.currentStreak;
  }

  // Save updated streaks
  allStreaks[subject] = currentStreak;
  localStorage.setItem(streaksKey, JSON.stringify(allStreaks));

  return currentStreak;
}

/**
 * Get learning streak for a subject
 */
export function getLearningStreak(subject: string): LearningStreak | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('bp_streaks');
  const streaks: Record<string, LearningStreak> = stored ? JSON.parse(stored) : {};
  
  return streaks[subject] || null;
}

/**
 * Check for new achievements
 */
export function checkAchievements(subject: string): Achievement[] {
  const newAchievements: Achievement[] = [];
  const existingAchievements = getAchievements();
  
  // Get current progress
  const allProgress = getAllProgress();
  const subjectLessons = Object.values(allProgress).filter(p => p.subject === subject);
  const masteredLessons = subjectLessons.filter(p => p.mastered);
  const streak = getLearningStreak(subject);
  
  // Mastery achievements
  const masteryMilestones = [
    { count: 1, id: 'first_lesson', title: 'First Success!', description: 'Completed your first lesson', icon: '🎯' },
    { count: 5, id: 'quick_learner', title: 'Quick Learner', description: 'Mastered 5 lessons', icon: '⚡' },
    { count: 10, id: 'dedicated_student', title: 'Dedicated Student', description: 'Mastered 10 lessons', icon: '📚' },
    { count: 25, id: 'knowledge_seeker', title: 'Knowledge Seeker', description: 'Mastered 25 lessons', icon: '🔍' },
    { count: 50, id: 'subject_expert', title: 'Subject Expert', description: 'Mastered 50 lessons', icon: '🎓' }
  ];

  for (const milestone of masteryMilestones) {
    const achievementId = `${subject}_${milestone.id}`;
    if (masteredLessons.length >= milestone.count && !existingAchievements.find(a => a.id === achievementId)) {
      newAchievements.push({
        id: achievementId,
        title: milestone.title,
        description: `${milestone.description} in ${subject}`,
        icon: milestone.icon,
        unlockedAt: Date.now(),
        category: 'mastery'
      });
    }
  }

  // Streak achievements
  if (streak) {
    const streakMilestones = [
      { days: 3, id: 'getting_warm', title: 'Getting Warm', description: 'Learned 3 days in a row', icon: '🔥' },
      { days: 7, id: 'week_warrior', title: 'Week Warrior', description: 'Learned for a full week', icon: '⚡' },
      { days: 14, id: 'two_week_champion', title: 'Two Week Champion', description: 'Learned for two weeks straight', icon: '🏆' },
      { days: 30, id: 'monthly_master', title: 'Monthly Master', description: 'Learned for a full month', icon: '👑' }
    ];

    for (const milestone of streakMilestones) {
      const achievementId = `${subject}_${milestone.id}`;
      if (streak.currentStreak >= milestone.days && !existingAchievements.find(a => a.id === achievementId)) {
        newAchievements.push({
          id: achievementId,
          title: milestone.title,
          description: `${milestone.description} in ${subject}`,
          icon: milestone.icon,
          unlockedAt: Date.now(),
          category: 'streak'
        });
      }
    }
  }

  // Accuracy achievements
  const highAccuracyLessons = subjectLessons.filter(p => p.correctRate >= 0.95 && p.totalAnswers >= 5);
  if (highAccuracyLessons.length >= 5) {
    const achievementId = `${subject}_precision_master`;
    if (!existingAchievements.find(a => a.id === achievementId)) {
      newAchievements.push({
        id: achievementId,
        title: 'Precision Master',
        description: 'Achieved 95%+ accuracy on 5+ lessons',
        icon: '🎯',
        unlockedAt: Date.now(),
        category: 'accuracy'
      });
    }
  }

  // Save new achievements
  if (newAchievements.length > 0) {
    const allAchievements = [...existingAchievements, ...newAchievements];
    localStorage.setItem('bp_achievements', JSON.stringify(allAchievements));
  }

  return newAchievements;
}

/**
 * Get all unlocked achievements
 */
export function getAchievements(): Achievement[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('bp_achievements');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get learning analytics for the dashboard
 */
export function getLearningAnalytics() {
  const allProgress = getAllProgress();
  const sessions = getStudySessions(30); // Last 30 sessions
  
  // Group by subject
  const bySubject: Record<string, any> = {};
  
  Object.values(allProgress).forEach(progress => {
    if (!bySubject[progress.subject]) {
      bySubject[progress.subject] = {
        totalLessons: 0,
        masteredLessons: 0,
        totalTime: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageAccuracy: 0,
        streak: getLearningStreak(progress.subject)?.currentStreak || 0
      };
    }

    const subjectData = bySubject[progress.subject];
    subjectData.totalLessons += 1;
    if (progress.mastered) subjectData.masteredLessons += 1;
    subjectData.totalTime += progress.timeSpent;
    subjectData.totalQuestions += progress.totalAnswers;
    subjectData.correctAnswers += progress.correctAnswers;
  });

  // Calculate averages
  Object.keys(bySubject).forEach(subject => {
    const data = bySubject[subject];
    data.averageAccuracy = data.totalQuestions > 0 ? data.correctAnswers / data.totalQuestions : 0;
    data.completionRate = data.totalLessons > 0 ? data.masteredLessons / data.totalLessons : 0;
  });

  return {
    bySubject,
    totalSessions: sessions.length,
    totalTimeSpent: Object.values(bySubject).reduce((sum: number, data: any) => sum + data.totalTime, 0),
    totalAchievements: getAchievements().length,
    recentActivity: sessions.slice(0, 5)
  };
}
