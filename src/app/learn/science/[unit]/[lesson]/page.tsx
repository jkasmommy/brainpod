'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, Play, CheckCircle, RotateCcw, ArrowRight, Star, Trophy, Microscope } from 'lucide-react';

interface LessonContent {
  id: string;
  title: string;
  unit: string;
  duration: string;
  objectives: string[];
  content: {
    type: 'explanation' | 'example' | 'practice' | 'experiment' | 'exploration';
    title: string;
    content: string;
    examples?: string[];
    activities?: string[];
    questions?: {
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }[];
  }[];
}

const lessonData: Record<string, Record<string, LessonContent>> = {
  'plants-animals': {
    '1': {
      id: '1',
      title: 'What Makes Something Alive?',
      unit: 'plants-animals',
      duration: '6 min',
      objectives: [
        'Identify characteristics of living things',
        'Distinguish between living and non-living',
        'Understand basic life processes'
      ],
      content: [
        {
          type: 'explanation',
          title: 'Living vs Non-Living',
          content: 'All living things have special characteristics that make them different from non-living things. Let\'s discover what makes something alive!'
        },
        {
          type: 'example',
          title: 'Signs of Life',
          content: 'Living things have these amazing abilities:',
          examples: [
            '🌱 They GROW bigger over time',
            '🍎 They need FOOD or make their own food',
            '💨 They BREATHE (take in air)',
            '🏃 They can MOVE (plants move toward sunlight!)',
            '🐣 They can make MORE of themselves (babies!)',
            '🏠 They respond to their environment'
          ]
        },
        {
          type: 'practice',
          title: 'Living or Not Living?',
          content: 'Can you tell which things are alive?',
          questions: [
            {
              question: 'Is a tree alive?',
              options: ['Yes, it\'s alive!', 'No, it\'s not alive'],
              correct: 0,
              explanation: 'Yes! Trees grow, make their own food from sunlight, and can make seeds for baby trees!'
            },
            {
              question: 'Is a rock alive?',
              options: ['Yes, it\'s alive!', 'No, it\'s not alive'],
              correct: 1,
              explanation: 'No! Rocks don\'t grow, eat, breathe, or make baby rocks. They are non-living.'
            }
          ]
        }
      ]
    },
    '2': {
      id: '2',
      title: 'Plant Parts and Functions',
      unit: 'plants-animals',
      duration: '8 min',
      objectives: [
        'Identify major parts of a plant',
        'Understand what each part does',
        'Learn how plants get what they need'
      ],
      content: [
        {
          type: 'explanation',
          title: 'Amazing Plant Parts',
          content: 'Plants are like living factories! Each part has a special job to help the plant survive and grow.'
        },
        {
          type: 'example',
          title: 'Plant Part Jobs',
          content: 'Here\'s what each part does:',
          examples: [
            '🌿 LEAVES: Make food from sunlight (like tiny solar panels!)',
            '🌸 FLOWERS: Make seeds for new plants',
            '🌱 STEM: Carries water and food around the plant',
            '🏠 ROOTS: Drink water from soil and hold the plant steady'
          ]
        },
        {
          type: 'exploration',
          title: 'Plant Investigation',
          content: 'Let\'s explore how plants are amazing!',
          activities: [
            'Imagine you\'re a drop of water traveling from the roots to the leaves',
            'Think about how leaves are like food factories',
            'Picture how flowers attract bees and butterflies'
          ]
        },
        {
          type: 'practice',
          title: 'Plant Part Quiz',
          content: 'Test your plant knowledge!',
          questions: [
            {
              question: 'Which part of the plant makes food from sunlight?',
              options: ['Roots', 'Leaves', 'Flowers', 'Stem'],
              correct: 1,
              explanation: 'Leaves are like nature\'s solar panels! They use sunlight to make food for the plant.'
            }
          ]
        }
      ]
    }
  },
  'matter-energy': {
    '1': {
      id: '1',
      title: 'Solids, Liquids, and Gases',
      unit: 'matter-energy',
      duration: '8 min',
      objectives: [
        'Identify the three states of matter',
        'Understand how molecules behave differently',
        'Recognize examples in everyday life'
      ],
      content: [
        {
          type: 'explanation',
          title: 'The Three States of Matter',
          content: 'Everything around us is made of tiny particles called molecules. These molecules behave differently in solids, liquids, and gases!'
        },
        {
          type: 'example',
          title: 'How Molecules Move',
          content: 'Think of molecules like tiny dancing balls:',
          examples: [
            '🧊 SOLIDS: Molecules hold hands tightly and barely move',
            '💧 LIQUIDS: Molecules are friends but can slide around each other',
            '☁️ GASES: Molecules are free spirits flying around everywhere!'
          ]
        },
        {
          type: 'experiment',
          title: 'Virtual Experiment',
          content: 'Let\'s see matter change!',
          activities: [
            'Ice cube melting: solid → liquid',
            'Water boiling: liquid → gas',
            'Steam cooling: gas → liquid'
          ]
        },
        {
          type: 'practice',
          title: 'State of Matter Challenge',
          content: 'What state of matter is this?',
          questions: [
            {
              question: 'What state of matter is orange juice?',
              options: ['Solid', 'Liquid', 'Gas'],
              correct: 1,
              explanation: 'Orange juice is a liquid! It takes the shape of its container and flows.'
            }
          ]
        }
      ]
    }
  }
};

export default function ScienceLessonPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Lesson Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the science lesson you're looking for.
          </p>
          <Link
            href={`/learn/science/${unit}`}
            className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
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
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {score}/{totalQuestions}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
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
                  href={`/learn/science/${unit}`}
                  className="flex items-center justify-center px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href={`/learn/science/${unit}`}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors"
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
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
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
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Examples:
                  </h3>
                  <div className="space-y-2">
                    {currentContent.examples.map((example, index) => (
                      <div key={index} className="text-purple-700 dark:text-purple-300">
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
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                    Activities:
                  </h3>
                  <div className="space-y-2">
                    {currentContent.activities.map((activity, index) => (
                      <div key={index} className="text-green-700 dark:text-green-300 flex items-start">
                        <Microscope className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Questions */}
            {currentContent.questions && currentContent.questions.length > 0 && (
              <div className="mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">
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
                            ? 'bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
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
                className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-purple-500 transition-colors"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentContent.questions && !showExplanation}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
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
