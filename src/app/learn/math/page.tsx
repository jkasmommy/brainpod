'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import Link from 'next/link';
import { Calculator, ArrowLeft, Star, Clock, Target } from 'lucide-react';

const mathUnits = [
  { id: 'counting', name: 'Counting & Number Recognition', level: 'K-1', description: 'Learn to count and recognize numbers 1-20' },
  { id: 'addition', name: 'Addition Basics', level: '1-2', description: 'Adding numbers up to 20 with visual support' },
  { id: 'subtraction', name: 'Subtraction Basics', level: '1-2', description: 'Subtracting numbers up to 20' },
  { id: 'place-value', name: 'Place Value', level: '2-3', description: 'Understanding tens and ones places' },
  { id: 'multiplication', name: 'Multiplication', level: '3-4', description: 'Times tables and repeated addition' },
  { id: 'fractions', name: 'Fractions', level: '3-4', description: 'Parts of a whole and equivalent fractions' },
  { id: 'decimals', name: 'Decimals', level: '4-5', description: 'Understanding decimal notation and operations' },
  { id: 'problem-solving', name: 'Problem Solving', level: '3-5', description: 'Word problems and mathematical reasoning' },
  { id: 'geometry', name: 'Geometry Basics', level: '2-4', description: 'Shapes, angles, and spatial reasoning' },
  { id: 'advanced-operations', name: 'Advanced Operations', level: '4-5', description: 'Multi-digit operations and algorithms' }
];

export default function MathLearning() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const currentUser = requireAuth(router);
    if (currentUser) {
      setUser(currentUser);
      setAuthLoading(false);
    }
  }, [router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading math learning...</p>
        </div>
      </div>
    );
  }

  // Check for saved placement recommendation
  // const getRecommendedUnit = () => {
  //   if (typeof window !== 'undefined') {
  //     const saved = localStorage.getItem('bp_place_math');
  //     if (saved) {
  //       const placement = JSON.parse(saved);
  //       return placement.placement?.recommendedUnit;
  //     }
  //   }
  //   return null;
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link
            href="/learn"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-8 group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Learning Hub
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl">
                <Calculator size={48} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Mathematics Journey
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              Build your math confidence step by step
            </p>
            
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From counting basics to advanced operations, each unit builds on the last with 
              adaptive practice and mindful learning breaks.
            </p>
          </div>

          {/* Recommendation Banner */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                  <Target className="mr-2 text-green-600" size={20} />
                  Recommended Starting Point
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Based on your diagnostic: <span className="font-medium text-purple-600 dark:text-purple-400">Advanced Operations</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                  You scored 100% and are ready for accelerated content! 🚀
                </p>
                <div className="flex space-x-3">
                  <Link
                    href="/learn/math/advanced-operations"
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Start Recommended Unit →
                  </Link>
                  <Link
                    href="/diagnostic/math"
                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Retake Diagnostic
                  </Link>
                </div>
              </div>
              <div className="text-4xl opacity-20">
                🎯
              </div>
            </div>
          </div>

          {/* Learning Units */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Choose Your Learning Unit
            </h2>
            
            {mathUnits.map((unit, index) => {
              const isRecommended = unit.id === 'advanced-operations';
              
              return (
                <div
                  key={unit.id}
                  className={`bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 shadow-lg border transition-all hover:shadow-xl ${
                    isRecommended 
                      ? 'border-green-400 ring-2 ring-green-200 dark:ring-green-700/50' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          Unit {index + 1}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          Grade {unit.level}
                        </span>
                        {isRecommended && (
                          <span className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded flex items-center">
                            <Star size={12} className="mr-1" />
                            Recommended
                          </span>
                        )}
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
                          15-20 min
                        </div>
                        <div className="flex items-center">
                          <Target size={16} className="mr-1" />
                          Interactive lessons
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Link
                        href={`/learn/math/${unit.id}`}
                        className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                          isRecommended
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                        }`}
                      >
                        {isRecommended ? 'Start Here' : 'Begin Unit'} →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Learning Path Info */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
              Your Learning Experience
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🧠</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Adaptive Learning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Content adjusts to your pace and understanding level
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">🌸</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Mindful Breaks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Regular breathing exercises to maintain focus and calm
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Progress Rewards</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earn stars and achievements as you master new skills
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
