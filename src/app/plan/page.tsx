'use client';

import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Clock, Target, Zap, RefreshCw } from 'lucide-react';

interface PlanItem {
  lessonId: string;
  skills: string[];
  scheduled_for: string;
  status: 'todo' | 'inprogress' | 'done' | 'locked';
  priority: number;
  title?: string;
  minutes?: number;
  standards?: string[];
  difficulty?: number;
}

const subjects = [
  { id: 'math', name: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-purple-600' },
  { id: 'reading', name: 'Reading', icon: '📚', color: 'from-green-500 to-teal-600' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-purple-500 to-pink-600' },
  { id: 'social-studies', name: 'Social Studies', icon: '🌍', color: 'from-orange-500 to-red-600' }
];

export default function PlanPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('math');
  const [todaysPlaylist, setTodaysPlaylist] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  // Load today's playlist on component mount
  useEffect(() => {
    loadTodaysPlaylist();
  }, []);

  /**
   * Generate a new personalized learning plan for selected subject
   */
  const generatePlan = async () => {
    setGenerating(true);
    setError('');

    try {
      // Get placement data from localStorage (from diagnostic results)
      const placementKey = `bp_place_${selectedSubject}`;
      const savedPlacement = localStorage.getItem(placementKey);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Add placement data to headers if available
      if (savedPlacement) {
        const placementData = JSON.parse(savedPlacement);
        headers['x-placement-data'] = JSON.stringify(placementData.placement);
      }

      const response = await fetch('/api/plan/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ subject: selectedSubject })
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      
      // Save plan items to localStorage (in production, would save to database)
      const planKey = `bp_plan_${selectedSubject}`;
      localStorage.setItem(planKey, JSON.stringify(data.planItems));
      
      // Refresh today's playlist
      await loadTodaysPlaylist();
      
    } catch (err) {
      console.error('Error generating plan:', err);
      setError('Failed to generate learning plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Load today's playlist from all subjects
   */
  const loadTodaysPlaylist = async () => {
    setLoading(true);
    setError('');

    try {
      // Collect plan items from all subjects
      const allPlanItems: PlanItem[] = [];
      
      for (const subject of subjects) {
        const planKey = `bp_plan_${subject.id}`;
        const savedPlan = localStorage.getItem(planKey);
        
        if (savedPlan) {
          const planItems: PlanItem[] = JSON.parse(savedPlan);
          allPlanItems.push(...planItems);
        }
      }

      if (allPlanItems.length === 0) {
        setTodaysPlaylist([]);
        return;
      }

      // Get mastery data if available
      const masteryData = localStorage.getItem('bp_mastery') || '{}';

      const headers = {
        'x-plan-data': JSON.stringify(allPlanItems),
        'x-mastery-data': masteryData
      };

      const response = await fetch('/api/plan/today', {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to load today\'s playlist');
      }

      const data = await response.json();
      setTodaysPlaylist(data.playlist);

    } catch (err) {
      console.error('Error loading playlist:', err);
      setError('Failed to load today\'s playlist.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get lesson URL for navigation
   */
  const getLessonUrl = (lessonId: string) => {
    // Parse lesson ID: subject-grade-unit-number
    const parts = lessonId.split('-');
    if (parts.length >= 4) {
      const [subject, grade, unit] = parts;
      return `/learn/${subject}/${grade}/${unit}/${lessonId}`;
    }
    return `/learn/${selectedSubject}`;
  };

  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= -0.5) return 'bg-green-100 text-green-800';
    if (difficulty <= 0) return 'bg-yellow-100 text-yellow-800';
    if (difficulty <= 0.5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= -0.5) return 'Easy';
    if (difficulty <= 0) return 'Medium';
    if (difficulty <= 0.5) return 'Hard';
    return 'Challenge';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              My Learning Plan 🎯
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              Personalized daily lessons based on your diagnostic results
            </p>
          </div>

          {/* Subject Filter */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Generate Plan for Subject:
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSubject === subject.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{subject.icon}</div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {subject.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Generate Plan Button */}
            <div className="text-center">
              <button
                onClick={generatePlan}
                disabled={generating}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Generate {subjects.find(s => s.id === selectedSubject)?.name} Plan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Today's Playlist */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Today&apos;s Playlist
              </h2>
              <button
                onClick={loadTodaysPlaylist}
                disabled={loading}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your lessons...</p>
              </div>
            ) : todaysPlaylist.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  No lessons scheduled for today
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  Generate a learning plan to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysPlaylist.map((item, index) => (
                  <div
                    key={item.lessonId}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3">
                            #{index + 1}
                          </span>
                          {item.priority >= 1000 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Review
                            </span>
                          )}
                          {item.difficulty !== undefined && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                              {getDifficultyLabel(item.difficulty)}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          {item.title || item.lessonId}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.minutes || 10} minutes
                          {item.skills.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{item.skills.join(', ')}</span>
                            </>
                          )}
                        </div>

                        {item.standards && item.standards.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.standards.map((standard) => (
                              <span
                                key={standard}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {standard}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <a
                          href={getLessonUrl(item.lessonId)}
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Lesson
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan Stats */}
          {todaysPlaylist.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {todaysPlaylist.length}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Lessons Today
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {todaysPlaylist.reduce((total, item) => total + (item.minutes || 10), 0)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Minutes Total
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {todaysPlaylist.filter(item => item.priority >= 1000).length}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Review Items
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
