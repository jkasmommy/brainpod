/**
 * Authentication utilities for BrainPod
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent' | 'teacher';
  createdAt: number;
  lastLogin?: number;
}

export interface UserProfile {
  age?: number;
  parentalConsent?: boolean;
  grade?: string;
  subjects?: string[];
  preferences?: Record<string, any>;
}

/**
 * Get the currently logged-in user
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('bp_current_user');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Sign out the current user
 */
export function signOut(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('bp_current_user');
  // Optionally clear other user-specific data
  // localStorage.removeItem('bp_preferences');
}

/**
 * Get user profile data
 */
export function getUserProfile(userId?: string): UserProfile | null {
  if (typeof window === 'undefined') return null;
  
  const user = getCurrentUser();
  const targetUserId = userId || user?.id;
  
  if (!targetUserId) return null;
  
  const stored = localStorage.getItem(`bp_profile_${targetUserId}`);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Update user profile data
 */
export function updateUserProfile(profileData: Partial<UserProfile>): void {
  if (typeof window === 'undefined') return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  const existingProfile = getUserProfile() || {};
  const updatedProfile = { ...existingProfile, ...profileData };
  
  localStorage.setItem(`bp_profile_${user.id}`, JSON.stringify(updatedProfile));
}

/**
 * Create demo account if it doesn't exist
 */
export function createDemoAccount(): void {
  if (typeof window === 'undefined') return;
  
  const users = JSON.parse(localStorage.getItem('bp_users') || '[]');
  const demoUser = users.find((u: User) => u.email === 'demo@brainpod.com');
  
  if (!demoUser) {
    const demo: User = {
      id: 'demo_user_001',
      email: 'demo@brainpod.com',
      name: 'Demo Student',
      role: 'student',
      createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastLogin: Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 days ago
    };
    
    users.push(demo);
    localStorage.setItem('bp_users', JSON.stringify(users));
    localStorage.setItem('bp_password_demo_user_001', 'demo123');
    
    // Create demo profile
    localStorage.setItem('bp_profile_demo_user_001', JSON.stringify({
      age: 8,
      grade: '2nd',
      parentalConsent: true,
      subjects: ['math', 'reading'],
      preferences: {
        theme: 'light',
        reminderTime: '16:00'
      }
    }));
    
    // Create some demo progress data
    const demoProgress = {
      'math-k-counting-1': {
        lessonId: 'math-k-counting-1',
        subject: 'math',
        attempts: 3,
        correctAnswers: 18,
        totalAnswers: 20,
        correctRate: 0.9,
        timeSpent: 25,
        mastered: true,
        lastPracticed: Date.now() - (1 * 24 * 60 * 60 * 1000),
        difficulty: -0.3,
        skillsRequired: ['count_objects'],
        skillsLearned: ['count_objects']
      },
      'reading-k-phonics-1': {
        lessonId: 'reading-k-phonics-1',
        subject: 'reading',
        attempts: 2,
        correctAnswers: 15,
        totalAnswers: 16,
        correctRate: 0.9375,
        timeSpent: 20,
        mastered: true,
        lastPracticed: Date.now() - (2 * 24 * 60 * 60 * 1000),
        difficulty: -0.4,
        skillsRequired: ['letter_sounds'],
        skillsLearned: ['letter_sounds']
      }
    };
    
    localStorage.setItem('bp_mastery', JSON.stringify(demoProgress));
    
    // Create demo placement data
    localStorage.setItem('bp_place_math', JSON.stringify({
      subject: 'math',
      placement: {
        ability: -0.2,
        recommendedGrade: 'K',
        recommendedUnit: 'counting'
      },
      timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
      attempts: [
        { itemId: 'math-1', response: 'A', correct: true, abilityAfter: -0.1, timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000) },
        { itemId: 'math-2', response: 'B', correct: true, abilityAfter: 0.0, timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000) }
      ]
    }));
    
    localStorage.setItem('bp_place_reading', JSON.stringify({
      subject: 'reading',
      placement: {
        ability: -0.3,
        recommendedGrade: 'K',
        recommendedUnit: 'phonics'
      },
      timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000),
      attempts: [
        { itemId: 'reading-1', response: 'C', correct: true, abilityAfter: -0.2, timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000) }
      ]
    }));
    
    // Create demo streak data
    localStorage.setItem('bp_streaks', JSON.stringify({
      math: {
        subject: 'math',
        currentStreak: 5,
        longestStreak: 12,
        lastActivityDate: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        streakStartDate: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      reading: {
        subject: 'reading',
        currentStreak: 3,
        longestStreak: 8,
        lastActivityDate: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        streakStartDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      }
    }));
    
    // Create demo achievements
    localStorage.setItem('bp_achievements', JSON.stringify([
      {
        id: 'math_first_lesson',
        title: 'First Success!',
        description: 'Completed your first lesson in math',
        icon: '🎯',
        unlockedAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
        category: 'mastery'
      },
      {
        id: 'reading_first_lesson',
        title: 'First Success!',
        description: 'Completed your first lesson in reading',
        icon: '🎯',
        unlockedAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
        category: 'mastery'
      },
      {
        id: 'math_getting_warm',
        title: 'Getting Warm',
        description: 'Learned 3 days in a row in math',
        icon: '🔥',
        unlockedAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
        category: 'streak'
      }
    ]));
    
    console.log('Demo account created successfully!');
  }
}

/**
 * Initialize authentication system
 */
export function initializeAuth(): void {
  if (typeof window === 'undefined') return;
  
  createDemoAccount();
}

/**
 * Require authentication - redirect to signin if not authenticated
 */
export function requireAuth(router: any): User | null {
  const user = getCurrentUser();
  
  if (!user) {
    router.push('/signin');
    return null;
  }
  
  return user;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user?: User | null): string {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return 'Guest';
  
  return currentUser.name || currentUser.email.split('@')[0];
}

/**
 * Check if user has specific role
 */
export function hasRole(role: 'student' | 'parent' | 'teacher', user?: User | null): boolean {
  const currentUser = user || getCurrentUser();
  return currentUser?.role === role;
}

/**
 * Get all users (admin function)
 */
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];
  
  return JSON.parse(localStorage.getItem('bp_users') || '[]');
}
