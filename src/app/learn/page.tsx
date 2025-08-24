import Link from 'next/link';
import { Calculator, BookOpen, Microscope, Globe } from 'lucide-react';

const subjects = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: Calculator,
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    units: ['Counting', 'Addition', 'Subtraction', 'Place Value', 'Multiplication', 'Fractions', 'Decimals', 'Problem Solving', 'Geometry', 'Advanced Operations']
  },
  {
    id: 'reading',
    name: 'Reading & Language Arts',
    icon: BookOpen,
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    units: ['Letter Recognition', 'Phonics', 'Sight Words', 'Blending', 'Comprehension', 'Vocabulary', 'Inference', 'Main Idea', 'Context Clues', 'Genre Study']
  },
  {
    id: 'science',
    name: 'Science',
    icon: Microscope,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    units: ['Living vs Nonliving', 'Animal Needs', 'Plant Parts', 'Weather', 'States of Matter', 'Habitats', 'Life Cycles', 'Forces', 'Energy', 'Ecosystems']
  },
  {
    id: 'social-studies',
    name: 'Social Studies',
    icon: Globe,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    units: ['Family', 'Community Helpers', 'Needs vs Wants', 'Rules and Laws', 'Map Skills', 'Symbols', 'Government', 'Geography', 'History', 'Economics']
  }
];

export default function LearnHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Learning Journeys
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              Personalized pathways that grow with you
            </p>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start your learning adventure with content tailored to your level. 
              Each journey includes interactive lessons, mindful breaks, and progress tracking.
            </p>
          </div>

          {/* Diagnostic Recommendations Banner */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-12 border border-green-200 dark:border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  🎯 Personalized Recommendations
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Complete a diagnostic assessment to get your perfect starting point!
                </p>
                <Link
                  href="/diagnostic"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Take Diagnostic Assessment →
                </Link>
              </div>
              <div className="text-6xl opacity-20">
                🧠
              </div>
            </div>
          </div>

          {/* Subject Learning Paths */}
          <div className="grid md:grid-cols-2 gap-8">
            {subjects.map((subject) => {
              const IconComponent = subject.icon;
              return (
                <div
                  key={subject.id}
                  className={`${subject.bgColor} rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50`}
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${subject.color} text-white`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {subject.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Adaptive learning path with {subject.units.length} key units
                      </p>
                    </div>
                  </div>

                  {/* Unit Preview */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Learning Units:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {subject.units.slice(0, 6).map((unit, index) => (
                        <div
                          key={index}
                          className="text-xs bg-white/50 dark:bg-gray-700/50 rounded px-2 py-1 text-gray-600 dark:text-gray-400"
                        >
                          {unit}
                        </div>
                      ))}
                      {subject.units.length > 6 && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 px-2 py-1">
                          +{subject.units.length - 6} more...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      href={`/learn/${subject.id}`}
                      className={`inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r ${subject.color} text-white font-medium rounded-lg hover:opacity-90 transition-opacity`}
                    >
                      Start {subject.name} Journey
                    </Link>
                    
                    <Link
                      href={`/diagnostic/${subject.id}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                    >
                      Take {subject.name} Diagnostic First
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coming Soon Features */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Learning Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Adaptive Content</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lessons automatically adjust to your progress and learning style
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="text-4xl mb-3">🧘‍♀️</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Mindful Breaks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Regular breathing exercises and reflection moments
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Progress Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visual progress indicators and achievement celebrations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
