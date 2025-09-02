'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { getLesson } from '@/lib/contentLoader';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Target, Play, Pause, CheckCircle } from 'lucide-react';
import MindfulBreak from '@/components/MindfulBreak';

interface Props {
  params: { 
    unit: string;
    lesson: string;
  };
}

export default function MathLesson({ params }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentActivity, setCurrentActivity] = useState(0);
  const [showMindfulBreak, setShowMindfulBreak] = useState(false);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    const currentUser = requireAuth(router);
    if (currentUser) {
      setUser(currentUser);
      setAuthLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadLessonData = async () => {
      if (authLoading) return;

      try {
        setLoading(true);
        const lesson = await getLesson(params.lesson);
        
        if (lesson) {
          setLessonData(lesson);
        } else {
          setError('Lesson not found');
        }
      } catch (error) {
        console.error('Error loading lesson:', error);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [params.lesson, authLoading]);

  const startLesson = () => {
    setLessonStarted(true);
  };

  const nextActivity = () => {
    if (lessonData?.activities && currentActivity < lessonData.activities.length - 1) {
      // Show mindful break every 2 activities
      if ((currentActivity + 1) % 2 === 0) {
        setShowMindfulBreak(true);
      } else {
        setCurrentActivity(currentActivity + 1);
      }
    } else {
      // Lesson completed
      setLessonCompleted(true);
    }
  };

  const completeMindfulBreak = () => {
    setShowMindfulBreak(false);
    setCurrentActivity(currentActivity + 1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <Link
            href={`/learn/math/${params.unit}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Unit
          </Link>
        </div>
      </div>
    );
  }

  if (showMindfulBreak) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Mindful Moment
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Take a moment to breathe and reset before continuing.
            </p>
            <MindfulBreak isOpen={true} onComplete={completeMindfulBreak} />
          </div>
        </div>
      </div>
    );
  }

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Lesson Complete!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Great job completing "{lessonData?.lesson.title}"
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                href={`/learn/math/${params.unit}`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Unit
              </Link>
              <Link
                href="/learn/math"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Continue Learning
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lessonStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation */}
            <Link
              href={`/learn/math/${params.unit}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-8 group"
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Unit
            </Link>

            {/* Lesson Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl">
                  <BookOpen size={48} />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                {lessonData?.lesson.title}
              </h1>
              
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                {lessonData?.lesson.summary || 'Interactive math lesson with guided practice'}
              </p>
              
              <div className="flex justify-center items-center space-x-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  {lessonData?.lesson.minutes || 10} minutes
                </div>
                <div className="flex items-center">
                  <Target size={20} className="mr-2" />
                  Difficulty: {lessonData?.lesson.difficulty > 0 ? 'Challenging' : 'Foundational'}
                </div>
              </div>
            </div>

            {/* Skills Overview */}
            {lessonData?.skills && lessonData.skills.length > 0 && (
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  What You'll Learn
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {lessonData.skills.map((skill: any, index: number) => (
                    <div key={skill.id} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300">{skill.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start Lesson */}
            <div className="text-center">
              <button
                onClick={startLesson}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Play size={24} className="mr-3" />
                Start Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main lesson content
  const activity = lessonData?.activities?.[currentActivity];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Activity {currentActivity + 1} of {lessonData?.activities?.length || 1}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(((currentActivity + 1) / (lessonData?.activities?.length || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentActivity + 1) / (lessonData?.activities?.length || 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>

          {/* Activity Content */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-lg">
            {activity ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                  {activity.kind === 'instruction' && 'Instruction'}
                  {activity.kind === 'practice' && 'Practice'}
                  {activity.kind === 'quiz' && 'Quiz'}
                  {activity.kind === 'mindful' && 'Mindful Moment'}
                </h2>

                {/* Render activity based on type */}
                {activity.content?.blocks?.map((block: any, index: number) => (
                  <div key={index} className="mb-6">
                    {block.type === 'instruction' && (
                      <div className="prose max-w-none dark:prose-invert">
                        {block.markdown && (
                          <div dangerouslySetInnerHTML={{ __html: block.markdown.replace(/\n/g, '<br>') }} />
                        )}
                        {block.html && (
                          <div dangerouslySetInnerHTML={{ __html: block.html }} />
                        )}
                      </div>
                    )}
                    
                    {block.type === 'practice' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Practice Questions</h3>
                        {block.items?.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="mb-3">{item.stem}</p>
                            {item.type === 'mcq' && item.choices && (
                              <div className="space-y-2">
                                {item.choices.map((choice: string, choiceIndex: number) => (
                                  <button
                                    key={choiceIndex}
                                    className="block w-full text-left p-3 bg-white dark:bg-gray-600 rounded border hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
                                  >
                                    {choice}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between items-center mt-8">
                  <button
                    disabled={currentActivity === 0}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={nextActivity}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentActivity < (lessonData?.activities?.length || 1) - 1 ? 'Next' : 'Complete Lesson'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Lesson content is being prepared...
                </p>
                <button
                  onClick={nextActivity}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
