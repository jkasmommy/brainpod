'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Subject } from '../../../../lib/diagTypes';
import { BookOpen, Calculator, Microscope, Globe, TrendingUp, Star, RefreshCw } from 'lucide-react';

const subjectConfig = {
  math: {
    name: 'Mathematics',
    icon: Calculator,
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  reading: {
    name: 'Reading & Language Arts', 
    icon: BookOpen,
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  science: {
    name: 'Science',
    icon: Microscope,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  'social-studies': {
    name: 'Social Studies',
    icon: Globe,
    color: 'from-orange-500 to-red-600', 
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  }
};

export default function DiagnosticResults() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = params.subject as Subject;

  const [results, setResults] = useState({
    ability: 0,
    grade: '',
    unit: '',
    correct: 0,
    total: 0
  });

  useEffect(() => {
    // Get results from URL params
    const ability = parseFloat(searchParams.get('ability') || '0');
    const grade = searchParams.get('grade') || 'On Grade';
    const unit = searchParams.get('unit') || '';
    const correct = parseInt(searchParams.get('correct') || '0');
    const total = parseInt(searchParams.get('total') || '0');

    setResults({ ability, grade, unit, correct, total });
  }, [searchParams]);

  const config = subjectConfig[subject];
  const IconComponent = config?.icon || Calculator;

  // Calculate performance metrics
  const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
  const abilityPercentage = Math.max(10, Math.min(90, ((results.ability + 2) / 4) * 100));
  
  // Get ability level color and description
  const getAbilityDisplay = (ability: number) => {
    if (ability <= -1.0) return { 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      label: 'Building Foundation',
      description: 'Focus on fundamental concepts'
    };
    if (ability <= -0.3) return { 
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Developing Skills',
      description: 'Strengthening core knowledge'
    };
    if (ability <= 0.3) return { 
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30', 
      label: 'On Track',
      description: 'Meeting grade-level expectations'
    };
    if (ability <= 0.8) return { 
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Strong Progress',
      description: 'Above grade-level performance'
    };
    return { 
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'Advanced',
      description: 'Ready for challenging material'
    };
  };

  const abilityDisplay = getAbilityDisplay(results.ability);
  
  // Get learning path recommendations
  const getLearningPath = () => {
    const baseUrl = `/learn/${subject}`;
    
    if (results.unit) {
      return `${baseUrl}/${results.unit}`;
    }
    
    // Fallback recommendations
    return baseUrl;
  };

  const retakeDiagnostic = () => {
    // Clear stored results
    localStorage.removeItem(`bp_diag_${subject}`);
    localStorage.removeItem(`bp_place_${subject}`);
    
    // Navigate back to diagnostic
    router.push(`/diagnostic/${subject}`);
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Invalid Subject
          </h1>
          <Link 
            href="/diagnostic" 
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Return to Diagnostics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgColor} dark:from-gray-900 dark:to-gray-800`}>
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Celebration Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className={`p-6 rounded-full bg-gradient-to-r ${config.color} text-white shadow-2xl`}>
                <IconComponent size={48} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
              Fantastic Work! 🎉
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
              You've completed your {config.name} diagnostic
            </p>
            
            <p className="text-gray-600 dark:text-gray-400">
              Here's what we discovered about your learning level
            </p>
          </div>

          {/* Results Dashboard */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Performance Summary */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <TrendingUp className="mr-3 text-green-500" size={24} />
                Your Performance
              </h2>
              
              <div className="space-y-6">
                {/* Accuracy */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {results.correct} out of {results.total} questions correct
                  </p>
                </div>

                {/* Learning Level */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Learning Level</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${abilityDisplay.bg} ${abilityDisplay.color}`}>
                      {abilityDisplay.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${config.color}`}
                      style={{ width: `${abilityPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {abilityDisplay.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <Star className="mr-3 text-yellow-500" size={24} />
                Recommended Path
              </h2>
              
              <div className={`${abilityDisplay.bg} rounded-lg p-6 mb-6`}>
                <h3 className={`text-xl font-bold ${abilityDisplay.color} mb-2`}>
                  {results.grade}
                </h3>
                {results.unit && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start with: <span className="font-medium">{results.unit.replace('-', ' ')}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This level will provide the right balance of challenge and support for your learning journey.
                </p>
              </div>

              <Link
                href={getLearningPath()}
                className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${config.color} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
              >
                Start Learning Journey →
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={retakeDiagnostic}
              className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              <RefreshCw className="mr-2" size={18} />
              Retake Assessment
            </button>
            
            <Link
              href="/diagnostic"
              className="flex items-center px-6 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Try Another Subject
            </Link>
            
            <Link
              href="/"
              className="flex items-center px-6 py-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              Return Home
            </Link>
          </div>

          {/* Next Steps */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
              What Happens Next?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Personalized Learning
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your learning path adapts to your progress and interests
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">🧘‍♀️</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Mindful Breaks
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Regular breathing exercises keep you focused and calm
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Progress Tracking
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Watch your skills grow with visual progress indicators
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
