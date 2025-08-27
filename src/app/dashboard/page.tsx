'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  Star, 
  CheckCircle, 
  BarChart3,
  Trophy,
  Flame,
  Brain,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

interface ProgressData {
  subject: string;
  name: string;
  icon: string;
  color: string;
  placement?: {
    grade: string;
    unit: string;
    ability: number;
  };
  completion?: {
    lessonsCompleted: number;
    totalLessons: number;
    percentage: number;
  };
  streak?: number;
  lastActivity?: string;
  achievements?: string[];
}

interface ActivityItem {
  id: string;
  type: 'diagnostic' | 'lesson' | 'achievement';
  subject: string;
  title: string;
  timestamp: number;
  score?: number;
  duration?: number;
}

const subjects = [
  { id: 'math', name: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-purple-600' },
  { id: 'reading', name: 'Reading', icon: '📚', color: 'from-green-500 to-teal-600' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-purple-500 to-pink-600' },
  { id: 'social-studies', name: 'Social Studies', icon: '🌍', color: 'from-orange-500 to-red-600' }
];

export default function Dashboard() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStreak, setTotalStreak] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ completed: 0, target: 20 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    try {
      const progress: ProgressData[] = [];
      const activities: ActivityItem[] = [];
      let maxStreak = 0;
      let totalAchievementCount = 0;
      let weeklyCompleted = 0;

      // Process each subject
      for (const subject of subjects) {
        const subjectData: ProgressData = {
          subject: subject.id,
          name: subject.name,
          icon: subject.icon,
          color: subject.color,
          achievements: []
        };

        // Load placement data
        const placementKey = `bp_place_${subject.id}`;
        const savedPlacement = localStorage.getItem(placementKey);
        if (savedPlacement) {
          const placementData = JSON.parse(savedPlacement);
          subjectData.placement = {
            grade: placementData.placement.recommendedGrade,
            unit: placementData.placement.recommendedUnit || 'Introduction',
            ability: placementData.placement.ability
          };
          subjectData.lastActivity = new Date(placementData.timestamp).toLocaleDateString();
          
          // Add diagnostic completion to activities
          activities.push({
            id: `diag-${subject.id}-${placementData.timestamp}`,
            type: 'diagnostic',
            subject: subject.id,
            title: `${subject.name} Diagnostic Complete`,
            timestamp: placementData.timestamp,
            score: Math.round((placementData.attempts?.filter((a: any) => a.correct).length || 0) / (placementData.attempts?.length || 1) * 100)
          });
        }

        // Load mastery/completion data
        const masteryKey = `bp_mastery`;
        const savedMastery = localStorage.getItem(masteryKey);
        if (savedMastery) {
          const masteryData = JSON.parse(savedMastery);
          const subjectLessons = Object.keys(masteryData).filter(key => key.startsWith(subject.id));
          const completedLessons = subjectLessons.filter(key => masteryData[key].mastered).length;
          
          subjectData.completion = {
            lessonsCompleted: completedLessons,
            totalLessons: Math.max(subjectLessons.length, 10), // Minimum of 10 for progress bar
            percentage: Math.round((completedLessons / Math.max(subjectLessons.length, 10)) * 100)
          };

          weeklyCompleted += completedLessons;

          // Calculate streak for this subject
          const subjectStreak = calculateStreak(masteryData, subject.id);
          subjectData.streak = subjectStreak;
          maxStreak = Math.max(maxStreak, subjectStreak);

          // Add lesson completions to activities
          subjectLessons.forEach(lessonId => {
            const lesson = masteryData[lessonId];
            if (lesson.mastered && lesson.lastPracticed) {
              activities.push({
                id: `lesson-${lessonId}-${lesson.lastPracticed}`,
                type: 'lesson',
                subject: subject.id,
                title: `Completed ${lessonId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
                timestamp: lesson.lastPracticed,
                score: Math.round(lesson.correctRate * 100),
                duration: lesson.timeSpent || 10
              });
            }
          });
        }

        // Generate achievements based on progress
        const achievements = generateAchievements(subjectData);
        subjectData.achievements = achievements;
        totalAchievementCount += achievements.length;

        progress.push(subjectData);
      }

      // Sort activities by timestamp (most recent first)
      activities.sort((a, b) => b.timestamp - a.timestamp);

      setProgressData(progress);
      setActivityHistory(activities.slice(0, 10)); // Show last 10 activities
      setTotalStreak(maxStreak);
      setTotalAchievements(totalAchievementCount);
      setWeeklyGoal({ completed: weeklyCompleted, target: 20 });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (masteryData: any, subject: string): number => {
    const subjectLessons = Object.keys(masteryData)
      .filter(key => key.startsWith(subject))
      .map(key => masteryData[key])
      .filter(lesson => lesson.lastPracticed)
      .sort((a, b) => b.lastPracticed - a.lastPracticed);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const lesson of subjectLessons) {
      const lessonDate = new Date(lesson.lastPracticed);
      lessonDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - lessonDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++;
        currentDate = lessonDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const generateAchievements = (data: ProgressData): string[] => {
    const achievements: string[] = [];
    
    if (data.placement) {
      achievements.push('🎯 Diagnostic Complete');
    }
    
    if (data.completion && data.completion.percentage >= 25) {
      achievements.push('🌟 Quarter Master');
    }
    
    if (data.completion && data.completion.percentage >= 50) {
      achievements.push('🎖️ Half Way Hero');
    }
    
    if (data.completion && data.completion.percentage >= 75) {
      achievements.push('🏆 Almost There');
    }
    
    if (data.completion && data.completion.percentage >= 100) {
      achievements.push('👑 Subject Master');
    }
    
    if (data.streak && data.streak >= 3) {
      achievements.push('🔥 On Fire');
    }
    
    if (data.streak && data.streak >= 7) {
      achievements.push('⚡ Week Warrior');
    }

    return achievements;
  };

  const getGradeLevel = (ability: number): string => {
    if (ability < -0.5) return 'Kindergarten';
    if (ability < 0) return '1st Grade';
    if (ability < 0.5) return '2nd Grade';
    if (ability < 1) return '3rd Grade';
    return '4th+ Grade';
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Learning Dashboard 📊
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Track your progress and celebrate achievements
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learning Streak</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {totalStreak} days
                  </p>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {totalAchievements}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Progress</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {weeklyGoal.completed}/{weeklyGoal.target}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {activityHistory.length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subject Progress */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Subject Progress
              </h2>

              {progressData.map((subject) => (
                <div
                  key={subject.subject}
                  className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-3xl mr-3">{subject.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {subject.name}
                        </h3>
                        {subject.placement && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Level: {getGradeLevel(subject.placement.ability)} • {subject.placement.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => router.push(`/learn/${subject.subject}`)}
                      className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" />
                      Continue
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {subject.completion && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Lessons Completed</span>
                        <span>{subject.completion.lessonsCompleted}/{subject.completion.totalLessons}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${subject.color}`}
                          style={{ width: `${subject.completion.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {subject.lastActivity || 'No activity yet'}
                    </div>
                    
                    {subject.streak && subject.streak > 0 && (
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Flame className="w-4 h-4 mr-1" />
                        {subject.streak} day streak
                      </div>
                    )}
                  </div>

                  {/* Achievements */}
                  {subject.achievements && subject.achievements.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {subject.achievements.slice(0, 3).map((achievement, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          >
                            {achievement}
                          </span>
                        ))}
                        {subject.achievements.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{subject.achievements.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {progressData.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No progress yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    Take a diagnostic to get started!
                  </p>
                  <button
                    onClick={() => router.push('/diagnostic')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Start Learning
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Recent Activity
              </h2>

              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                {activityHistory.length > 0 ? (
                  <div className="space-y-4">
                    {activityHistory.map((activity) => {
                      const subject = subjects.find(s => s.id === activity.subject);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="text-xl mr-3">{subject?.icon}</div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formatTimeAgo(activity.timestamp)}
                                {activity.score && ` • ${activity.score}% correct`}
                                {activity.duration && ` • ${activity.duration}min`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {activity.type === 'diagnostic' && (
                              <Target className="w-4 h-4 text-blue-500" />
                            )}
                            {activity.type === 'lesson' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {activity.type === 'achievement' && (
                              <Award className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      No activity yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Your learning activity will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/plan')}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-blue-800 dark:text-blue-200">View Learning Plan</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </button>
                  
                  <button
                    onClick={() => router.push('/analytics')}
                    className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-purple-800 dark:text-purple-200">Detailed Analytics</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </button>
                  
                  <button
                    onClick={() => router.push('/diagnostic')}
                    className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-green-800 dark:text-green-200">Take Assessment</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-green-600" />
                  </button>
                  
                  <button
                    onClick={() => router.push('/learn')}
                    className="w-full flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-orange-600 mr-3" />
                      <span className="text-orange-800 dark:text-orange-200">Browse Lessons</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-orange-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
