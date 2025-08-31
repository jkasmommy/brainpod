'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import { getManifest } from '@/lib/curriculum';
import { getStandardLabel } from '@/lib/standards';
import Link from 'next/link';
import { Calculator, BookOpen, Microscope, Globe, GraduationCap, Users, Baby, User } from 'lucide-react';

// Grade band definitions
type GradeBand = 'K-2' | '3-5' | '6-8' | '9-12';

const gradeBands: Array<{
  id: GradeBand;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  grades: string[];
}> = [
  {
    id: 'K-2',
    label: 'K–2',
    icon: Baby,
    description: 'Early Elementary',
    grades: ['K', '1', '2']
  },
  {
    id: '3-5',
    label: '3–5',
    icon: User,
    description: 'Elementary',
    grades: ['3', '4', '5']
  },
  {
    id: '6-8',
    label: '6–8',
    icon: Users,
    description: 'Middle School',
    grades: ['6', '7', '8']
  },
  {
    id: '9-12',
    label: '9–12',
    icon: GraduationCap,
    description: 'High School',
    grades: ['HS']
  }
];

const subjects = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: Calculator,
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'reading',
    name: 'Reading & Language Arts',
    icon: BookOpen,
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'science',
    name: 'Science',
    icon: Microscope,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'social-studies',
    name: 'Social Studies',
    icon: Globe,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  }
];

export default function LearnHub() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedGradeBand, setSelectedGradeBand] = useState<GradeBand>('K-2');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [manifest, setManifest] = useState<any>(null);

  const toggleUnits = (subjectId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Check authentication
  useEffect(() => {
    const currentUser = requireAuth(router);
    if (currentUser) {
      setUser(currentUser);
      setAuthLoading(false);
    }
  }, [router]);

  // Load manifest data
  useEffect(() => {
    const loadManifest = async () => {
      try {
        const manifestData = await getManifest();
        setManifest(manifestData);
      } catch (error) {
        console.error('Error loading manifest:', error);
      }
    };
    loadManifest();
  }, []);

  // Get content for current grade band and subject
  const getSubjectContent = (subjectId: string) => {
    if (!manifest || !manifest[subjectId]) return null;
    
    const subjectData = manifest[subjectId];
    const grades = gradeBands.find(gb => gb.id === selectedGradeBand)?.grades || [];
    
    const content: Array<{
      grade: string;
      units: Array<{
        id: string;
        title: string;
        description?: string;
        lessons: any[];
        isHighSchoolCourse?: boolean;
      }>;
    }> = [];

    grades.forEach(grade => {
      if (subjectData[grade]) {
        const gradeData = subjectData[grade];
        const units = Object.entries(gradeData).map(([unitId, unitData]: [string, any]) => ({
          id: unitId,
          title: unitData.title,
          description: unitData.description,
          lessons: unitData.lessons || [],
          isHighSchoolCourse: grade === 'HS'
        }));
        
        if (units.length > 0) {
          content.push({ grade, units });
        }
      }
    });

    return content;
  };

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Learning Hub 📚
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Explore personalized learning paths across all subjects and grade levels
            </p>
          </div>

          {/* Grade Band Tabs */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="inline-flex bg-white/80 dark:bg-gray-800/80 rounded-xl p-1 shadow-lg backdrop-blur-sm">
                {gradeBands.map((band) => {
                  const Icon = band.icon;
                  return (
                    <button
                      key={band.id}
                      onClick={() => setSelectedGradeBand(band.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        selectedGradeBand === band.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{band.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {gradeBands.find(band => band.id === selectedGradeBand)?.description}
              </p>
            </div>
          </div>

          {/* Subject Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {subjects.map((subject) => {
              const Icon = subject.icon;
              const content = getSubjectContent(subject.id);
              const hasContent = content && content.length > 0;
              
              return (
                <div
                  key={subject.id}
                  className={`relative overflow-hidden rounded-2xl shadow-xl ${subject.bgColor} backdrop-blur-sm border border-white/20`}
                >
                  {/* Subject Header */}
                  <div className={`bg-gradient-to-r ${subject.color} p-6 text-white`}>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{subject.name}</h3>
                        <p className="text-white/80">
                          {selectedGradeBand === '9-12' ? 'High School Courses' : 'Learning Units'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {!hasContent ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Content for {gradeBands.find(band => band.id === selectedGradeBand)?.description} coming soon!
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          Check back later for {subject.name} content
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {content.map((gradeContent, gradeIndex) => (
                          <div key={gradeContent.grade}>
                            {/* Grade header for mixed content */}
                            {content.length > 1 && (
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                Grade {gradeContent.grade === 'HS' ? '9-12' : gradeContent.grade}
                              </h4>
                            )}
                            
                            {/* Units/Courses */}
                            <div className="space-y-3">
                              {gradeContent.units.slice(0, expandedUnits[subject.id] ? undefined : 3).map((unit, unitIndex) => (
                                <Link
                                  key={unit.id}
                                  href={`/learn/${subject.id}${gradeContent.grade === 'HS' ? '/HS' : ''}/${unit.id}${unit.lessons.length > 0 ? `/${unit.lessons[0].id}` : ''}`}
                                  className="block p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors group border border-white/30"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {unit.title}
                                        {unit.isHighSchoolCourse && (
                                          <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            Course
                                          </span>
                                        )}
                                      </h5>
                                      {unit.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {unit.description}
                                        </p>
                                      )}
                                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
                                        <span>{unit.lessons.length} lessons</span>
                                        {unit.lessons.length > 0 && (
                                          <span>
                                            ~{unit.lessons.reduce((total, lesson) => total + (lesson.minutes || 10), 0)} min
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                              
                              {/* Show more/less toggle */}
                              {gradeContent.units.length > 3 && (
                                <button
                                  onClick={() => toggleUnits(subject.id)}
                                  className="w-full p-3 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                                >
                                  {expandedUnits[subject.id] 
                                    ? `Show less` 
                                    : `+${gradeContent.units.length - 3} more...`
                                  }
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Start Section */}
          <div className="mt-16 text-center">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                New to BrainPod? 🚀
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Take a quick diagnostic assessment to find your perfect starting point and 
                get a personalized learning plan tailored to your current level.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/diagnostic/${subject.id}`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    <subject.icon className="w-4 h-4 mr-2" />
                    {subject.name} Assessment
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
