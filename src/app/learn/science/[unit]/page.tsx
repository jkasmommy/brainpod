'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import Link from 'next/link';
import { Microscope, ArrowLeft, Clock, Target, Play, CheckCircle } from 'lucide-react';

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
  'plants-animals': {
    name: 'Plants and Animals',
    level: 'K-2',
    description: 'Explore the amazing world of living things and their habitats',
    objectives: [
      'Identify characteristics of living things',
      'Compare plants and animals',
      'Understand basic needs of living things',
      'Explore different habitats'
    ],
    lessons: [
      { id: '1', title: 'What Makes Something Alive?', duration: '6 min', type: 'Interactive' },
      { id: '2', title: 'Plant Parts and Functions', duration: '8 min', type: 'Exploration' },
      { id: '3', title: 'Animal Groups', duration: '7 min', type: 'Discovery' },
      { id: '4', title: 'Habitats Around Us', duration: '9 min', type: 'Virtual Field Trip' },
      { id: '5', title: 'Life Cycles', duration: '8 min', type: 'Animation' }
    ]
  },
  'matter-energy': {
    name: 'Matter and Energy',
    level: '3-5',
    description: 'Discover the building blocks of our physical world',
    objectives: [
      'Identify states of matter',
      'Understand properties of materials',
      'Explore energy and motion',
      'Investigate chemical vs physical changes'
    ],
    lessons: [
      { id: '1', title: 'Solids, Liquids, and Gases', duration: '8 min', type: 'Experiment' },
      { id: '2', title: 'Properties of Matter', duration: '7 min', type: 'Investigation' },
      { id: '3', title: 'Energy in Motion', duration: '9 min', type: 'Interactive' },
      { id: '4', title: 'Chemical Changes', duration: '10 min', type: 'Lab Simulation' }
    ]
  },
  'earth-space': {
    name: 'Earth and Space',
    level: '4-6',
    description: 'Journey through our planet and beyond to the stars',
    objectives: [
      'Understand Earth\'s layers and features',
      'Explore weather and climate',
      'Learn about the solar system',
      'Investigate natural resources'
    ],
    lessons: [
      { id: '1', title: 'Inside Planet Earth', duration: '8 min', type: 'Virtual Tour' },
      { id: '2', title: 'Weather Patterns', duration: '7 min', type: 'Data Analysis' },
      { id: '3', title: 'Our Solar System', duration: '10 min', type: 'Space Journey' },
      { id: '4', title: 'Natural Resources', duration: '8 min', type: 'Case Study' }
    ]
  },
  'human-body': {
    name: 'Human Body Systems',
    level: '5-7',
    description: 'Discover how your amazing body works',
    objectives: [
      'Identify major body systems',
      'Understand how systems work together',
      'Learn about nutrition and health',
      'Explore the brain and nervous system'
    ],
    lessons: [
      { id: '1', title: 'Circulatory System', duration: '9 min', type: 'Animation' },
      { id: '2', title: 'Respiratory System', duration: '8 min', type: 'Interactive Model' },
      { id: '3', title: 'Digestive System', duration: '10 min', type: 'Journey Simulation' },
      { id: '4', title: 'Nervous System', duration: '9 min', type: 'Brain Exploration' }
    ]
  }
};

const subjects = [
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-purple-500 to-pink-600' }
];

export default function ScienceUnitPage({ params }: Props) {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Unit Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the science unit you're looking for.
          </p>
          <Link
            href="/learn/science"
            className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Science
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/learn/science"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Science
            </Link>
          </div>

          {/* Unit Overview */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <Microscope size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
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
                    <Target size={16} className="mr-3 text-purple-500 flex-shrink-0" />
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
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center font-bold">
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
                        <span className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded text-xs">
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
                      href={`/learn/science/${unit}/${lesson.id}`}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
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
          <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Ready to Explore Science?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start with the first lesson and work your way through each concept.
              </p>
              <Link
                href={`/learn/science/${unit}/1`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium"
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
