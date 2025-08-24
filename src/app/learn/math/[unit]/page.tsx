import Link from 'next/link';
import { Calculator, ArrowLeft, Star, Clock, Target, Play, CheckCircle } from 'lucide-react';

interface Props {
  params: { unit: string };
}

const unitData: Record<string, { 
  name: string; 
  level: string; 
  description: string; 
  objectives: string[];
  lessons: { id: string; title: string; duration: string; type: string; completed?: boolean }[];
}> = {
  'counting': {
    name: 'Counting & Number Recognition',
    level: 'K-1',
    description: 'Master counting from 1-20 and recognize number symbols',
    objectives: [
      'Count objects up to 20',
      'Recognize written numbers 1-20',
      'Understand one-to-one correspondence',
      'Compare quantities using "more" and "less"'
    ],
    lessons: [
      { id: '1', title: 'Counting to 10', duration: '5 min', type: 'Interactive' },
      { id: '2', title: 'Number Recognition 1-10', duration: '4 min', type: 'Practice' },
      { id: '3', title: 'Counting to 20', duration: '6 min', type: 'Interactive' },
      { id: '4', title: 'Number Recognition 11-20', duration: '4 min', type: 'Practice' },
      { id: '5', title: 'More and Less', duration: '5 min', type: 'Game' }
    ]
  },
  'advanced-operations': {
    name: 'Advanced Operations',
    level: '4-5',
    description: 'Master multi-digit arithmetic and problem-solving strategies',
    objectives: [
      'Multiply multi-digit numbers',
      'Divide with remainders',
      'Solve complex word problems',
      'Use mental math strategies'
    ],
    lessons: [
      { id: '1', title: 'Multi-Digit Multiplication', duration: '8 min', type: 'Interactive' },
      { id: '2', title: 'Division with Remainders', duration: '7 min', type: 'Practice' },
      { id: '3', title: 'Word Problem Strategies', duration: '10 min', type: 'Problem Solving' },
      { id: '4', title: 'Mental Math Tricks', duration: '6 min', type: 'Game' },
      { id: '5', title: 'Challenge Problems', duration: '8 min', type: 'Assessment' }
    ]
  }
};

export default function MathUnit({ params }: Props) {
  const { unit } = params;
  const unitInfo = unitData[unit];

  if (!unitInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Unit Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The math unit you're looking for doesn't exist yet.
            </p>
            <Link
              href="/learn/math"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Math Units
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link
            href="/learn/math"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-8 group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Math Units
          </Link>

          {/* Unit Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      Grade {unitInfo.level}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {unitInfo.name}
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {unitInfo.description}
                </p>
              </div>
              
              {unit === 'advanced-operations' && (
                <div className="ml-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <span className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    Recommended
                  </span>
                </div>
              )}
            </div>

            {/* Learning Objectives */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Learning Objectives
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {unitInfo.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                    <Target size={16} className="mr-3 text-blue-500 flex-shrink-0" />
                    {objective}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Lessons in this Unit
            </h2>
            
            {unitInfo.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {lesson.title}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {lesson.duration}
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs">
                          {lesson.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {lesson.completed && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                      <Play size={16} className="mr-2" />
                      {lesson.completed ? 'Review' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Unit Progress */}
          <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Unit Progress
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-gray-400">
                0 of {unitInfo.lessons.length} lessons completed
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                0% Complete
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                style={{ width: '0%' }}
              ></div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ready to begin your learning journey? Start with the first lesson above!
              </p>
              
              <div className="flex justify-center space-x-4">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
                  Start First Lesson
                </button>
                <Link
                  href="/learn/math"
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Choose Different Unit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
