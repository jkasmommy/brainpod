import Link from 'next/link';
import { BookOpen, Calculator, Microscope, Globe } from 'lucide-react';

const subjects = [
  {
    id: 'math',
    name: 'Mathematics',
    description: 'Number sense, operations, and problem solving',
    icon: Calculator,
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'reading',
    name: 'Reading & Language Arts',
    description: 'Phonics, comprehension, and vocabulary',
    icon: BookOpen,
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Life cycles, matter, energy, and scientific thinking',
    icon: Microscope,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'social-studies',
    name: 'Social Studies',
    description: 'Geography, civics, and community understanding',
    icon: Globe,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  }
];

export default function DiagnosticHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Adaptive Diagnostics
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              Discover your perfect starting point with our intelligent assessments
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our adaptive diagnostics adjust to your responses in real-time, finding your optimal learning level in just a few minutes. 
              Includes mindful breaks to keep you focused and calm.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 mb-12 backdrop-blur-sm">
            <p className="text-center text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              &ldquo;BrainPod blends standards-aligned curriculum with mindful breaks to adapt to every learner—because no two minds are alike.&rdquo;
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Built with privacy-first design and accessibility at the core.
            </p>
          </div>

          {/* Subject Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {subjects.map((subject) => {
              const IconComponent = subject.icon;
              return (
                <div
                  key={subject.id}
                  className={`${subject.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${subject.color} text-white`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {subject.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        {subject.description}
                      </p>
                      
                      {/* Diagnostic Info */}
                      <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 mb-4 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">5-10 minutes</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">8-15 adaptive</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Includes:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">Mindful break</span>
                        </div>
                      </div>

                      <Link
                        href={`/diagnostic/${subject.id}`}
                        className={`inline-flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r ${subject.color} text-white font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                      >
                        Start {subject.name} Diagnostic
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Adaptive Questions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Questions adjust based on your responses to find your optimal level
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Mindful Break</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built-in breathing exercise to keep you calm and focused
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Personalized Path</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get your recommended starting grade and learning units
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
