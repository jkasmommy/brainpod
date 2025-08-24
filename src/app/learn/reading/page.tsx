import Link from 'next/link';
import { Book, ArrowLeft, Star, Clock, Target } from 'lucide-react';

const readingUnits = [
  { id: 'phonics', name: 'Phonics & Letter Sounds', level: 'K-1', description: 'Learn letter sounds and basic phonetic patterns' },
  { id: 'sight-words', name: 'Sight Words', level: 'K-2', description: 'Master high-frequency words for fluent reading' },
  { id: 'fluency', name: 'Reading Fluency', level: '1-3', description: 'Build speed and expression in reading' },
  { id: 'comprehension', name: 'Reading Comprehension', level: '2-4', description: 'Understand and analyze what you read' },
  { id: 'vocabulary', name: 'Vocabulary Building', level: '3-5', description: 'Expand your word knowledge and usage' },
  { id: 'writing', name: 'Writing Skills', level: '2-5', description: 'Express ideas clearly through writing' }
];

export default function ReadingLearning() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link
            href="/learn"
            className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 mb-8 group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Learning Hub
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-2xl">
                <Book size={48} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
              Reading Journey
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              Discover the joy of reading and writing
            </p>
            
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From phonics to comprehension, build strong literacy skills with engaging activities 
              and adaptive practice sessions.
            </p>
          </div>

          {/* Take Diagnostic Banner */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-8 border border-yellow-200 dark:border-yellow-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                  <Target className="mr-2 text-orange-600" size={20} />
                  Find Your Starting Point
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Take a quick diagnostic to discover your ideal reading level and get personalized recommendations.
                </p>
                <div className="flex space-x-3">
                  <Link
                    href="/diagnostic/reading"
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  >
                    Take Reading Diagnostic →
                  </Link>
                </div>
              </div>
              <div className="text-4xl opacity-20">
                📚
              </div>
            </div>
          </div>

          {/* Learning Units */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Reading & Writing Units
            </h2>
            
            {readingUnits.map((unit, index) => (
              <div
                key={unit.id}
                className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        Unit {index + 1}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Grade {unit.level}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {unit.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {unit.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        15-25 min
                      </div>
                      <div className="flex items-center">
                        <Target size={16} className="mr-1" />
                        Interactive stories
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all">
                      Begin Unit →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Path Info */}
          <div className="mt-12 bg-green-50 dark:bg-green-900/20 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
              Reading Adventure Features
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📖</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Interactive Stories</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Engaging narratives that adapt to your reading level
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Phonics Practice</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sound out words with guided pronunciation support
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">✍️</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Writing Practice</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Express creativity through guided writing exercises
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
