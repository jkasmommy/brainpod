'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  BookOpen,
  Brain,
  Zap,
  CheckCircle,
  ArrowLeft,
  Download,
  Filter
} from 'lucide-react';
import { getLearningAnalytics, getStudySessions, getAchievements, getAllProgress } from '@/lib/progress';

interface AnalyticsData {
  bySubject: Record<string, any>;
  totalSessions: number;
  totalTimeSpent: number;
  totalAchievements: number;
  recentActivity: any[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedSubject, setSelectedSubject] = useState('all');

  const subjects = [
    { id: 'math', name: 'Mathematics', icon: '🔢', color: 'blue' },
    { id: 'reading', name: 'Reading', icon: '📚', color: 'green' },
    { id: 'science', name: 'Science', icon: '🔬', color: 'purple' },
    { id: 'social-studies', name: 'Social Studies', icon: '🌍', color: 'orange' }
  ];

  useEffect(() => {
    // Check authentication first
    const currentUser = requireAuth(router);
    if (currentUser) {
      setUser(currentUser);
      loadAnalytics();
    }
  }, [router, timeRange, selectedSubject]);

  const loadAnalytics = () => {
    setLoading(true);
    
    try {
      const data = getLearningAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getSubjectColor = (subject: string): string => {
    const subjectInfo = subjects.find(s => s.id === subject);
    return subjectInfo?.color || 'gray';
  };

  const exportData = () => {
    const allProgress = getAllProgress();
    const sessions = getStudySessions(100);
    const achievements = getAchievements();
    
    const exportData = {
      progress: allProgress,
      sessions,
      achievements,
      analytics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brainpod-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            No Data Available
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start learning to see detailed analytics and progress tracking.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Learning Analytics 📈
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Detailed insights into learning progress and performance
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              
              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              
              {/* Export Button */}
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatTime(analytics.totalTimeSpent)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Study Sessions</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analytics.totalSessions}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {analytics.totalAchievements}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Object.values(analytics.bySubject).length > 0 
                      ? Math.round(Object.values(analytics.bySubject).reduce((sum: number, data: any) => sum + data.averageAccuracy, 0) / Object.values(analytics.bySubject).length * 100)
                      : 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subject Performance */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Subject Performance
              </h2>
              
              <div className="space-y-4">
                {Object.entries(analytics.bySubject).length > 0 ? (
                  Object.entries(analytics.bySubject).map(([subject, data]: [string, any]) => {
                    const subjectInfo = subjects.find(s => s.id === subject);
                    const completionRate = data.completionRate * 100;
                    const accuracy = data.averageAccuracy * 100;
                    
                    return (
                      <div key={subject} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{subjectInfo?.icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                {subjectInfo?.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {data.masteredLessons}/{data.totalLessons} lessons completed
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTime(data.totalTime)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {data.streak > 0 ? `${data.streak} day streak` : 'No streak'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bars */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>Completion</span>
                              <span>{Math.round(completionRate)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-${getSubjectColor(subject)}-500`}
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>Accuracy</span>
                              <span>{Math.round(accuracy)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-${getSubjectColor(subject)}-400`}
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No subject data available yet. Start learning to see progress!
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Activity
              </h2>
              
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivity.map((session, index) => {
                    const subjectInfo = subjects.find(s => s.id === session.subject);
                    const accuracy = session.totalQuestions > 0 
                      ? Math.round((session.correctAnswers / session.totalQuestions) * 100) 
                      : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center">
                          <div className="text-xl mr-3">{subjectInfo?.icon}</div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {subjectInfo?.name} Session
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(session.timestamp).toLocaleDateString()} • 
                              {formatTime(session.totalTime)} • 
                              {accuracy}% accuracy
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {session.correctAnswers}/{session.totalQuestions}
                          </div>
                          {session.mood && (
                            <div className="text-sm">
                              {session.mood >= 4 ? '😊' : session.mood >= 3 ? '😐' : '😕'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No recent activity found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Learning Insights */}
          <div className="mt-8 bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Learning Insights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">📅</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Study Consistency
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.totalSessions > 20 ? 'Excellent' : 
                   analytics.totalSessions > 10 ? 'Good' : 
                   analytics.totalSessions > 5 ? 'Developing' : 'Getting Started'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on session frequency
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Focus Areas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.entries(analytics.bySubject)
                    .sort(([,a], [,b]) => (a as any).averageAccuracy - (b as any).averageAccuracy)
                    .slice(0, 1)
                    .map(([subject]) => subjects.find(s => s.id === subject)?.name)
                    .join(', ') || 'None identified'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Subjects needing attention
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Strengths
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.entries(analytics.bySubject)
                    .sort(([,a], [,b]) => (b as any).averageAccuracy - (a as any).averageAccuracy)
                    .slice(0, 1)
                    .map(([subject]) => subjects.find(s => s.id === subject)?.name)
                    .join(', ') || 'Still discovering'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Best performing subjects
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
