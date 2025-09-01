'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import Link from 'next/link';
import { Globe, ArrowLeft, Clock, Target, Play, CheckCircle } from 'lucide-react';

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
  'community-helpers': {
    name: 'Community Helpers',
    level: 'K-2',
    description: 'Learn about the important people who help our community',
    objectives: [
      'Identify different community helpers',
      'Understand how helpers serve the community',
      'Learn about community safety',
      'Recognize the importance of cooperation'
    ],
    lessons: [
      { id: '1', title: 'Police Officers Keep Us Safe', duration: '7 min', type: 'Story & Discussion' },
      { id: '2', title: 'Firefighters to the Rescue', duration: '6 min', type: 'Interactive Story' },
      { id: '3', title: 'Teachers Help Us Learn', duration: '6 min', type: 'Role Play' },
      { id: '4', title: 'Doctors and Nurses Help Us Stay Healthy', duration: '8 min', type: 'Virtual Visit' },
      { id: '5', title: 'Mail Carriers Deliver Our Mail', duration: '6 min', type: 'Community Tour' },
      { id: '6', title: 'Working Together in Our Community', duration: '9 min', type: 'Collaborative Activity' }
    ]
  },
  'geography-basics': {
    name: 'Geography Basics',
    level: '2-4',
    description: 'Explore maps, continents, and places around the world',
    objectives: [
      'Read and use simple maps',
      'Identify continents and oceans',
      'Understand different landforms',
      'Learn about climate and weather patterns'
    ],
    lessons: [
      { id: '1', title: 'Maps and Globes', duration: '8 min', type: 'Interactive Exploration' },
      { id: '2', title: 'Seven Continents', duration: '7 min', type: 'Virtual World Tour' },
      { id: '3', title: 'Countries and Capitals', duration: '8 min', type: 'Geography Game' },
      { id: '4', title: 'Landforms Around Us', duration: '6 min', type: 'Visual Journey' },
      { id: '5', title: 'Climate Zones', duration: '6 min', type: 'Weather Investigation' }
    ]
  },
  'american-history': {
    name: 'American History Basics',
    level: '3-5',
    description: 'Journey through important events in American history',
    objectives: [
      'Learn about Native American cultures',
      'Understand early exploration and settlement',
      'Explore the Revolutionary War',
      'Discover important historical figures'
    ],
    lessons: [
      { id: '1', title: 'Native Americans: First People', duration: '8 min', type: 'Cultural Exploration' },
      { id: '2', title: 'Explorers Come to America', duration: '7 min', type: 'Adventure Story' },
      { id: '3', title: 'The 13 Colonies', duration: '7 min', type: 'Historical Simulation' },
      { id: '4', title: 'The Revolutionary War', duration: '8 min', type: 'Timeline Activity' },
      { id: '5', title: 'The Civil War', duration: '7 min', type: 'Historical Drama' },
      { id: '6', title: 'Modern America', duration: '6 min', type: 'Progress Timeline' },
      { id: '7', title: 'American Heroes and Leaders', duration: '6 min', type: 'Biography Gallery' }
    ]
  },
  'government-civics': {
    name: 'Government & Civics',
    level: '4-6',
    description: 'Understand how government works and your role as a citizen',
    objectives: [
      'Learn about the three branches of government',
      'Understand the Constitution and Bill of Rights',
      'Explore rights and responsibilities of citizens',
      'Learn about elections and voting'
    ],
    lessons: [
      { id: '1', title: 'Three Branches of Government', duration: '9 min', type: 'Government Simulation' },
      { id: '2', title: 'The Constitution', duration: '8 min', type: 'Document Analysis' },
      { id: '3', title: 'Rights and Responsibilities', duration: '8 min', type: 'Citizenship Workshop' },
      { id: '4', title: 'How Elections Work', duration: '8 min', type: 'Mock Election' },
      { id: '5', title: 'Local Government', duration: '7 min', type: 'Community Meeting' }
    ]
  },
  'world-cultures': {
    name: 'World Cultures',
    level: '3-6',
    description: 'Discover diverse cultures and traditions from around the globe',
    objectives: [
      'Explore different cultural traditions',
      'Learn about world religions and beliefs',
      'Understand cultural celebrations',
      'Appreciate diversity and similarities'
    ],
    lessons: [
      { id: '1', title: 'Asian Cultures and Traditions', duration: '8 min', type: 'Cultural Journey' },
      { id: '2', title: 'European Heritage', duration: '8 min', type: 'Historical Tour' },
      { id: '3', title: 'African Cultures', duration: '8 min', type: 'Cultural Celebration' },
      { id: '4', title: 'Latin American Traditions', duration: '8 min', type: 'Festival Experience' },
      { id: '5', title: 'World Festivals and Holidays', duration: '8 min', type: 'Global Celebration' },
      { id: '6', title: 'Languages Around the World', duration: '8 min', type: 'Language Adventure' }
    ]
  }
};

export default function SocialStudiesUnitPage({ params }: Props) {
  const router = useRouter();
  const { unit } = params;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const unitInfo = unitData[unit];

  if (!unitInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Unit Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the social studies unit you're looking for.
          </p>
          <Link
            href="/learn/social-studies"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Social Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/learn/social-studies"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Social Studies
            </Link>
          </div>

          {/* Unit Overview */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    <Globe size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
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
            </div>

            {/* Learning Objectives */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Learning Objectives
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {unitInfo.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                    <Target size={16} className="mr-3 text-orange-500 flex-shrink-0" />
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
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white flex items-center justify-center font-bold">
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
                        <span className="text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded text-xs">
                          {lesson.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {lesson.completed && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                    <Link
                      href={`/learn/social-studies/${unit}/${lesson.id}`}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
                    >
                      <Play size={16} className="mr-2" />
                      {lesson.completed ? 'Review' : 'Start'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Unit Progress */}
          <div className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Ready to Explore?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start with the first lesson and discover the fascinating world of social studies.
              </p>
              <Link
                href={`/learn/social-studies/${unit}/1`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-medium"
              >
                <Play size={18} className="mr-2" />
                Start First Lesson
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
