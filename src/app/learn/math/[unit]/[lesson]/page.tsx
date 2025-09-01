'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, Play, CheckCircle, RotateCcw, ArrowRight, Star, Trophy } from 'lucide-react';

interface LessonContent {
  id: string;
  title: string;
  unit: string;
  duration: string;
  objectives: string[];
  content: {
    type: 'explanation' | 'example' | 'practice' | 'game';
    title: string;
    content: string;
    examples?: string[];
    questions?: {
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }[];
  }[];
}

const lessonData: Record<string, Record<string, LessonContent>> = {
  'counting': {
    '1': {
      id: '1',
      title: 'Counting to 10',
      unit: 'counting',
      duration: '5 min',
      objectives: [
        'Count objects from 1 to 10',
        'Understand number sequence',
        'Practice one-to-one correspondence'
      ],
      content: [
        {
          type: 'explanation',
          title: 'What is Counting?',
          content: 'Counting is saying numbers in order while pointing to objects. Each object gets one number!'
        },
        {
          type: 'example',
          title: "Let's Count Together!",
          content: 'Here are some apples. Let\'s count them together:',
          examples: ['🍎 → 1', '🍎🍎 → 1, 2', '🍎🍎🍎 → 1, 2, 3', '🍎🍎🍎🍎 → 1, 2, 3, 4']
        },
        {
          type: 'practice',
          title: 'Your Turn!',
          content: 'Now you try counting!',
          questions: [
            {
              question: 'How many stars are there? ⭐⭐⭐',
              options: ['2', '3', '4', '5'],
              correct: 1,
              explanation: 'Count each star: 1, 2, 3. There are 3 stars!'
            },
            {
              question: 'How many balloons? 🎈🎈🎈🎈🎈',
              options: ['4', '5', '6', '3'],
              correct: 1,
              explanation: 'Count carefully: 1, 2, 3, 4, 5. There are 5 balloons!'
            }
          ]
        }
      ]
    },
    '2': {
      id: '2',
      title: 'Number Recognition 1-10',
      unit: 'counting',
      duration: '4 min',
      objectives: [
        'Recognize written numbers 1-10',
        'Match numbers to quantities',
        'Practice number identification'
      ],
      content: [
        {
          type: 'explanation',
          title: 'Reading Numbers',
          content: 'Numbers are special symbols that tell us "how many". Let\'s learn what each number looks like!'
        },
        {
          type: 'example',
          title: 'Number Gallery',
          content: 'Here are the numbers 1 through 10:',
          examples: ['1 → one dot •', '2 → two dots ••', '3 → three dots •••', '4 → four dots ••••', '5 → five dots •••••']
        },
        {
          type: 'practice',
          title: 'Match the Number',
          content: 'Can you match the number to the right amount?',
          questions: [
            {
              question: 'Which number matches this many dots? •••••••',
              options: ['6', '7', '8', '5'],
              correct: 1,
              explanation: 'Count the dots: 1, 2, 3, 4, 5, 6, 7. The number is 7!'
            },
            {
              question: 'What number is this? 4',
              options: ['Three', 'Four', 'Five', 'Six'],
              correct: 1,
              explanation: 'The symbol 4 means "four"!'
            }
          ]
        }
      ]
    }
  },
  'addition': {
    '1': {
      id: '1',
      title: 'Adding Numbers 1-5',
      unit: 'addition',
      duration: '6 min',
      objectives: [
        'Understand addition as combining groups',
        'Add numbers within 5',
        'Use pictures to solve addition problems'
      ],
      content: [
        {
          type: 'explanation',
          title: 'What is Addition?',
          content: 'Addition means putting groups together to find out how many you have in total. We use the + sign!'
        },
        {
          type: 'example',
          title: 'Let\'s Add!',
          content: 'When we add, we combine groups:',
          examples: ['2 + 1 = 3 (🍎🍎 + 🍎 = 🍎🍎🍎)', '1 + 2 = 3 (🍎 + 🍎🍎 = 🍎🍎🍎)', '3 + 1 = 4 (🍎🍎🍎 + 🍎 = 🍎🍎🍎🍎)']
        },
        {
          type: 'practice',
          title: 'Addition Practice',
          content: 'Try these addition problems!',
          questions: [
            {
              question: '2 + 2 = ?',
              options: ['3', '4', '5', '6'],
              correct: 1,
              explanation: '2 + 2 means 2 things plus 2 more things = 4 total!'
            },
            {
              question: 'If you have 3 toys and get 1 more, how many do you have?',
              options: ['3', '4', '5', '2'],
              correct: 1,
              explanation: '3 + 1 = 4. You have 4 toys total!'
            }
          ]
        }
      ]
    }
  }
};

export default function LessonPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Lesson Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the lesson you're looking for.
          </p>
          <Link
            href={`/learn/math/${unit}`}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
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
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {score}/{totalQuestions}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
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
                  href={`/learn/math/${unit}`}
                  className="flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href={`/learn/math/${unit}`}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
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
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Examples:
                  </h3>
                  <div className="space-y-2">
                    {currentContent.examples.map((example, index) => (
                      <div key={index} className="text-blue-700 dark:text-blue-300 font-mono">
                        {example}
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
                            ? index === currentContent.questions[0].correct
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-800 dark:text-red-200'
                            : index === currentContent.questions[0].correct
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
                className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-500 transition-colors"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentContent.questions && !showExplanation}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
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
