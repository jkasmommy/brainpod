'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, Play, CheckCircle, RotateCcw, ArrowRight, Star, Trophy, Globe, Users } from 'lucide-react';

interface LessonContent {
  id: string;
  title: string;
  unit: string;
  duration: string;
  objectives: string[];
  content: {
    type: 'explanation' | 'story' | 'practice' | 'activity' | 'discussion';
    title: string;
    content: string;
    examples?: string[];
    activities?: string[];
    discussion?: string[];
    questions?: {
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }[];
  }[];
}

const lessonData: Record<string, Record<string, LessonContent>> = {
  'community-helpers': {
    '1': {
      id: '1',
      title: 'Police Officers Keep Us Safe',
      unit: 'community-helpers',
      duration: '7 min',
      objectives: [
        'Learn what police officers do',
        'Understand how they help our community',
        'Know when to call for help'
      ],
      content: [
        {
          type: 'story',
          title: 'Officer Maria\'s Day',
          content: 'Meet Officer Maria! She wears a special uniform and badge. Every day, she helps keep our neighborhood safe. Let\'s follow her on her important work!'
        },
        {
          type: 'explanation',
          title: 'How Police Officers Help Us',
          content: 'Police officers have many important jobs in our community:',
          examples: [
            '🚔 They drive around in police cars to keep us safe',
            '🚦 They help direct traffic so cars don\'t crash',
            '🏠 They help find lost pets and people',
            '📞 They come when people call 911 for emergencies',
            '🏫 They visit schools to teach us about safety',
            '👮 They work with other helpers in our community'
          ]
        },
        {
          type: 'discussion',
          title: 'When Do We Call Police?',
          content: 'Let\'s think about when we might need police help:',
          discussion: [
            'If someone is in danger and needs help right away',
            'If there\'s an accident with cars',
            'If someone is lost and can\'t find their family',
            'Remember: Only call 911 for real emergencies!'
          ]
        },
        {
          type: 'practice',
          title: 'Police Helper Quiz',
          content: 'What do you know about police officers?',
          questions: [
            {
              question: 'What number do you call in an emergency?',
              options: ['123', '911', '555', '999'],
              correct: 1,
              explanation: '911 is the special number to call when you need help from police, firefighters, or doctors!'
            },
            {
              question: 'How do police officers help our community?',
              options: ['They only give tickets', 'They keep us safe and help people', 'They just drive cars', 'They don\'t help anyone'],
              correct: 1,
              explanation: 'Police officers do many things to keep us safe and help people in our community!'
            }
          ]
        }
      ]
    },
    '2': {
      id: '2',
      title: 'Firefighters to the Rescue',
      unit: 'community-helpers',
      duration: '6 min',
      objectives: [
        'Learn what firefighters do',
        'Understand fire safety',
        'Know how firefighters help in emergencies'
      ],
      content: [
        {
          type: 'story',
          title: 'Captain Jake and the Fire Station',
          content: 'Captain Jake is a brave firefighter! He lives at the fire station with his team. When the alarm rings, they slide down the pole and rush to help people. Let\'s learn about their amazing job!'
        },
        {
          type: 'explanation',
          title: 'What Firefighters Do',
          content: 'Firefighters are heroes who help in many ways:',
          examples: [
            '🔥 They put out fires to keep buildings and people safe',
            '🚒 They drive big red fire trucks with ladders and hoses',
            '🏥 They help people who are hurt or sick',
            '🐱 They rescue cats stuck in trees and animals in danger',
            '🏫 They teach us about fire safety',
            '💧 They use water and special tools to fight fires'
          ]
        },
        {
          type: 'activity',
          title: 'Fire Safety Rules',
          content: 'Learn important fire safety rules to stay safe:',
          activities: [
            'Stop, Drop, and Roll if your clothes catch fire',
            'Crawl low under smoke to get fresh air',
            'Know two ways out of every room',
            'Practice fire drills at home with your family',
            'Never play with matches or lighters'
          ]
        },
        {
          type: 'practice',
          title: 'Firefighter Knowledge Check',
          content: 'Test what you learned about firefighters!',
          questions: [
            {
              question: 'What should you do if you see smoke in a room?',
              options: ['Stand up tall', 'Crawl low on the ground', 'Run very fast', 'Hide under a bed'],
              correct: 1,
              explanation: 'Crawl low under smoke because smoke rises up and clean air stays down low!'
            }
          ]
        }
      ]
    }
  },
  'geography-basics': {
    '1': {
      id: '1',
      title: 'Maps and Globes',
      unit: 'geography-basics',
      duration: '8 min',
      objectives: [
        'Understand what maps and globes show us',
        'Learn basic map symbols',
        'Use maps to find places'
      ],
      content: [
        {
          type: 'explanation',
          title: 'What Are Maps and Globes?',
          content: 'Maps and globes are special tools that show us where things are in the world! They help us understand our Earth and find places we want to go.'
        },
        {
          type: 'story',
          title: 'Emma\'s Map Adventure',
          content: 'Emma found an old treasure map in her grandmother\'s attic! The map had special symbols and pictures. Let\'s help Emma learn how to read maps so she can find the treasure!'
        },
        {
          type: 'explanation',
          title: 'Map Symbols and Features',
          content: 'Maps use special symbols to show us different things:',
          examples: [
            '🏔️ Mountains are shown with triangle shapes',
            '🏞️ Rivers are blue winding lines',
            '🏙️ Cities are shown with dots or squares',
            '🛣️ Roads are lines that connect places',
            '🧭 The compass rose shows North, South, East, West',
            '🗝️ The map key explains what symbols mean'
          ]
        },
        {
          type: 'activity',
          title: 'Reading Maps Together',
          content: 'Let\'s practice reading a map of our neighborhood:',
          activities: [
            'Find the school symbol on the map',
            'Trace the path from home to the park',
            'Count how many streets you cross',
            'Look for the compass rose to find which direction is north'
          ]
        },
        {
          type: 'practice',
          title: 'Map Skills Quiz',
          content: 'Show what you know about maps!',
          questions: [
            {
              question: 'What does a compass rose show us?',
              options: ['The weather', 'Directions like North and South', 'How big things are', 'What time it is'],
              correct: 1,
              explanation: 'A compass rose shows us the four main directions: North, South, East, and West!'
            }
          ]
        }
      ]
    }
  }
};

export default function SocialStudiesLessonPage() {
  const router = useRouter();
  const params = useParams();
  const unit = params.unit as string;
  const lessonId = params.lesson as string;
  
  const [user, setUser] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const lesson = lessonData[unit]?.[lessonId];

  useEffect(() => {
    if (lesson) {
      const questions = lesson.content.reduce((total, section) => 
        total + (section.questions?.length || 0), 0
      );
      setTotalQuestions(questions);
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Lesson Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the social studies lesson you're looking for.
          </p>
          <Link
            href={`/learn/social-studies/${unit}`}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Unit
          </Link>
        </div>
      </div>
    );
  }

  const currentContent = lesson.content[currentSection];
  const isLastSection = currentSection === lesson.content.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (currentContent.questions) {
      const isCorrect = answerIndex === currentContent.questions[0]?.correct;
      if (isCorrect) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (isLastSection) {
      setLessonComplete(true);
    } else {
      setCurrentSection(currentSection + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const resetLesson = () => {
    setCurrentSection(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setLessonComplete(false);
  };

  if (lessonComplete) {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
              <div className="mb-6">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Lesson Complete!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Great job finishing "{lesson.title}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {score}/{totalQuestions}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Correct Answers
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {percentage}%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Score
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetLesson}
                  className="flex items-center justify-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <Link
                  href={`/learn/social-studies/${unit}`}
                  className="flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Next Lesson
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href={`/learn/social-studies/${unit}`}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Unit
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {lesson.duration}
              </div>
              <div className="text-sm text-gray-500">
                {currentSection + 1} of {lesson.content.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {lesson.title}
              </h1>
              <div className="text-sm text-gray-500">
                {Math.round(((currentSection + 1) / lesson.content.length) * 100)}% Complete
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSection + 1) / lesson.content.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {currentContent.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {currentContent.content}
              </p>
            </div>

            {/* Examples */}
            {currentContent.examples && (
              <div className="mb-6">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">
                    Examples:
                  </h3>
                  <div className="space-y-2">
                    {currentContent.examples.map((example, index) => (
                      <div key={index} className="text-orange-700 dark:text-orange-300">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activities */}
            {currentContent.activities && (
              <div className="mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Activities:
                  </h3>
                  <div className="space-y-2">
                    {currentContent.activities.map((activity, index) => (
                      <div key={index} className="text-blue-700 dark:text-blue-300 flex items-start">
                        <Play className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Discussion Points */}
            {currentContent.discussion && (
              <div className="mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                    Let's Discuss:
                  </h3>
                  <div className="space-y-2">
                    {currentContent.discussion.map((point, index) => (
                      <div key={index} className="text-green-700 dark:text-green-300 flex items-start">
                        <Users className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Questions */}
            {currentContent.questions && currentContent.questions.length > 0 && (
              <div className="mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-4">
                    {currentContent.questions[0].question}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {currentContent.questions[0].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedAnswer === null
                            ? 'bg-white dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                            : selectedAnswer === index
                            ? index === currentContent.questions?.[0]?.correct
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-800 dark:text-red-200'
                            : index === currentContent.questions?.[0]?.correct
                            ? 'bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-500'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  {showExplanation && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="flex items-start">
                        <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-800 dark:text-yellow-200">
                          {currentContent.questions[0].explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (currentSection > 0) {
                    setCurrentSection(currentSection - 1);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                  }
                }}
                disabled={currentSection === 0}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-orange-500 transition-colors"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentContent.questions && !showExplanation}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {isLastSection ? 'Complete Lesson' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
