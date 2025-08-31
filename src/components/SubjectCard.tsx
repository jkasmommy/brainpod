/**
 * Subject Card Component
 * Displays subject progress, level, and next activities
 */

import Link from 'next/link';
import { SubjectKey, LevelRecord, getGradeDisplay, getPerformanceLevel } from '@/lib/levels';
import { ConfidenceRing, MasteryRing } from './ProgressRing';
import { renderStandards } from '@/lib/standards';
import { 
  PlayCircle, 
  BookOpen, 
  Clock, 
  Target, 
  RefreshCw,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

interface NextActivity {
  lessonId: string;
  title: string;
  minutes: number;
  standards?: string[];
  type?: 'lesson' | 'review' | 'assessment';
  difficulty?: number;
}

interface SubjectCardProps {
  subject: SubjectKey;
  level?: LevelRecord;
  next?: NextActivity;
  masteryStats?: {
    mastered: number;
    total: number;
    needingReview: number;
  };
  className?: string;
}

// Subject metadata
const subjectInfo = {
  math: { 
    name: 'Mathematics', 
    icon: '🔢', 
    color: 'from-blue-500 to-purple-600',
    lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    darkBg: 'bg-blue-100 dark:bg-blue-900/40'
  },
  reading: { 
    name: 'Reading', 
    icon: '📚', 
    color: 'from-green-500 to-teal-600',
    lightBg: 'bg-green-50 dark:bg-green-900/20',
    darkBg: 'bg-green-100 dark:bg-green-900/40'
  },
  science: { 
    name: 'Science', 
    icon: '🔬', 
    color: 'from-purple-500 to-pink-600',
    lightBg: 'bg-purple-50 dark:bg-purple-900/20',
    darkBg: 'bg-purple-100 dark:bg-purple-900/40'
  },
  'social-studies': { 
    name: 'Social Studies', 
    icon: '🌍', 
    color: 'from-orange-500 to-red-600',
    lightBg: 'bg-orange-50 dark:bg-orange-900/20',
    darkBg: 'bg-orange-100 dark:bg-orange-900/40'
  }
};

export default function SubjectCard({ 
  subject, 
  level, 
  next, 
  masteryStats,
  className = '' 
}: SubjectCardProps) {
  const info = subjectInfo[subject];
  
  // No diagnostic taken yet
  if (!level) {
    return (
      <div className={`${info.lightBg} rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">{info.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {info.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take diagnostic to get started
              </p>
            </div>
          </div>
          
          <AlertCircle className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete a quick diagnostic to discover your current level and get personalized lessons.
          </p>
          
          <div className="flex gap-2">
            <Link
              href={`/diagnostic/${subject}`}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Target className="w-4 h-4 mr-2" />
              Take Diagnostic
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Has diagnostic results
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="text-3xl mr-3">{info.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {info.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getGradeDisplay(level.grade)} • {level.unit}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {level.levelLabel}
              </span>
              {level.grade === 'HS' && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  Course
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Confidence Ring */}
        <ConfidenceRing confidence={level.confidence} size={50} />
      </div>
      
      {/* Performance Level */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Performance Level</span>
        </div>
        <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {getPerformanceLevel(level.ability)}
        </span>
      </div>
      
      {/* Mastery Stats */}
      {masteryStats && masteryStats.total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Skills Mastery</span>
            </div>
            <MasteryRing 
              mastered={masteryStats.mastered} 
              total={masteryStats.total} 
              size={40} 
            />
          </div>
          {masteryStats.needingReview > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {masteryStats.needingReview} skills need review
            </p>
          )}
        </div>
      )}
      
      {/* Next Activity */}
      {next ? (
        <div className={`${info.darkBg} rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-2 mb-2">
            <PlayCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Next Activity
            </span>
            {next.type === 'review' && (
              <RefreshCw className="w-3 h-3 text-amber-500" />
            )}
          </div>
          
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
            {next.title}
          </h4>
          
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-3 h-3 mr-1" />
            {next.minutes} minutes
          </div>
          
          {next.standards && next.standards.length > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {renderStandards(next.standards)}
            </p>
          )}
          
          <Link
            href={`/learn/${subject}`}
            className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Continue Learning
          </Link>
        </div>
      ) : (
        <div className={`${info.darkBg} rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No Activities Scheduled
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Generate a learning plan to get personalized lessons.
          </p>
          <Link
            href={`/plan?subject=${subject}`}
            className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Target className="w-4 h-4 mr-2" />
            Generate Plan
          </Link>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/plan?subject=${subject}`}
          className="flex-1 flex items-center justify-center px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          View Plan
        </Link>
        
        <Link
          href={`/diagnostic/${subject}`}
          className="flex items-center justify-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Retake
        </Link>
      </div>
      
      {/* Last Updated */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Level updated {new Date(level.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  );
}
