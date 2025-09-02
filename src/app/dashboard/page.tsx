'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import { SubjectKey, getAllLevels, LevelRecord } from '@/lib/levels';
import { getMasterySummary } from '@/lib/mastery';
import SubjectCard from '@/components/SubjectCard';
import SupabaseTest from '@/components/SupabaseTest';
import {
  GraduationCap,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';

interface NextActivity {
  lessonId: string;
  title: string;
  minutes: number;
  standards?: string[];
  type?: 'lesson' | 'review' | 'assessment';
  difficulty?: number;
}

interface DashboardData {
  levels: Record<SubjectKey, LevelRecord | null>;
  nextActivities: Record<SubjectKey, NextActivity | null>;
  masteryStats: Record<SubjectKey, {
    mastered: number;
    total: number;
    needingReview: number;
  }>;
  overallStats: {
    subjectsStarted: number;
    totalActivities: number;
    weeklyMinutes: number;
    streak: number;
  };
}

const subjects: SubjectKey[] = ['math', 'reading', 'science', 'social-studies'];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string>('');

  // Check authentication first
  useEffect(() => {
    const currentUser = requireAuth(router);
    if (currentUser) {
      setUser(currentUser);
      setAuthLoading(false);
    }
  }, [router]);

  // Load dashboard data when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  /**
   * Load all dashboard data including levels, next activities, and stats
   */
  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load level records
      const levels = getAllLevels();
      
      // Load next activities for each subject that has a level
      const nextActivities: Record<SubjectKey, NextActivity | null> = {} as any;
      const masteryStats: Record<SubjectKey, any> = {} as any;
      
      for (const subject of subjects) {
        // Get mastery statistics
        masteryStats[subject] = getMasterySummary(subject);
        
        // Get next activity if level exists
        if (levels[subject]) {
          try {
            const response = await fetch(`/api/plan/today?subject=${subject}`);
            if (response.ok) {
              const todayData = await response.json();
              if (todayData.playlist && todayData.playlist.length > 0) {
                const nextItem = todayData.playlist[0];
                nextActivities[subject] = {
                  lessonId: nextItem.lessonId,
                  title: nextItem.title || nextItem.lessonId,
                  minutes: nextItem.minutes || 10,
                  standards: nextItem.standards,
                  type: nextItem.type || 'lesson',
                  difficulty: nextItem.difficulty
                };
              } else {
                nextActivities[subject] = null;
              }
            } else {
              nextActivities[subject] = null;
            }
          } catch (err) {
            console.warn(`Failed to load next activity for ${subject}:`, err);
            nextActivities[subject] = null;
          }
        } else {
          nextActivities[subject] = null;
        }
      }
      
      // Calculate overall statistics
      const subjectsStarted = Object.values(levels).filter(Boolean).length;
      const totalActivities = Object.values(nextActivities).filter(Boolean).length;
      
      // Mock weekly stats for demo - in production would track from activity log
      const weeklyMinutes = 120; // Example: 2 hours this week
      const streak = 5; // Example: 5-day learning streak
      
      setData({
        levels,
        nextActivities,
        masteryStats,
        overallStats: {
          subjectsStarted,
          totalActivities,
          weeklyMinutes,
          streak
        }
      });
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Data loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading your learning dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
              <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { levels, nextActivities, masteryStats, overallStats } = data;

  // Check if this is a new user (no subjects started)
  const isNewUser = overallStats.subjectsStarted === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Welcome back, {getUserDisplayName(user)}! 🎓
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Continue your personalized learning journey
            </p>
          </div>

          {/* New User Welcome */}
          {isNewUser && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-12">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">
                  Welcome to BrainPod! 🚀
                </h2>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Get started by taking a quick diagnostic in any subject. We'll create a personalized 
                  learning plan just for you based on your current level and learning goals.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {subjects.map(subject => {
                    const subjectNames = {
                      math: 'Math',
                      reading: 'Reading',
                      science: 'Science',
                      'social-studies': 'Social Studies'
                    };
                    return (
                      <a
                        key={subject}
                        href={`/diagnostic/${subject}`}
                        className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {subjectNames[subject]} Diagnostic
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {!isNewUser && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Subjects Started</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {overallStats.subjectsStarted}/4
                    </p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Learning Streak</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {overallStats.streak} days
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {overallStats.weeklyMinutes} min
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Next Activities</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {overallStats.totalActivities}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}

          {/* Subject Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Your Subjects
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.map(subject => (
                <SubjectCard
                  key={subject}
                  subject={subject}
                  level={levels[subject] || undefined}
                  next={nextActivities[subject] || undefined}
                  masteryStats={masteryStats[subject]}
                  className="hover:scale-[1.02] transition-transform"
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/plan"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Calendar className="w-5 h-5 text-blue-500 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">View Learning Plans</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your daily lessons</p>
                </div>
              </a>
              
              <a
                href="/analytics"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <TrendingUp className="w-5 h-5 text-green-500 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">View Progress</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track your learning journey</p>
                </div>
              </a>
              
              <a
                href="/learn"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Award className="w-5 h-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Browse Lessons</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Explore all available content</p>
                </div>
              </a>
            </div>
          </div>

          {/* Supabase Connection Test - Debug Tool */}
          <div className="mt-12">
            <SupabaseTest />
          </div>
        </div>
      </div>
    </div>
  );
}
