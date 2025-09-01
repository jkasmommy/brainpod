'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import Link from 'next/link';
import { Microscope, BookOpen, Clock, Users, ChevronRight, Star } from 'lucide-react';

const scienceUnits = [
  {
    id: 'plants-animals',
    title: 'Plants and Animals',
    description: 'Explore the amazing world of living things and their habitats',
    grade: 'K-2',
    lessons: 5,
    duration: '38 min',
    difficulty: 'Beginner',
    color: 'from-green-500 to-teal-600',
    icon: '🌱',
    topics: ['Living vs Non-living', 'Plant Parts', 'Animal Groups', 'Habitats', 'Life Cycles']
  },
  {
    id: 'matter-energy',
    title: 'Matter and Energy',
    description: 'Discover the building blocks of our physical world',
    grade: '3-5',
    lessons: 4,
    duration: '34 min',
    difficulty: 'Intermediate',
    color: 'from-purple-500 to-pink-600',
    icon: '⚛️',
    topics: ['States of Matter', 'Properties', 'Energy & Motion', 'Chemical Changes']
  },
  {
    id: 'earth-space',
    title: 'Earth and Space',
    description: 'Journey through our planet and beyond to the stars',
    grade: '4-6',
    lessons: 4,
    duration: '33 min',
    difficulty: 'Intermediate',
    color: 'from-blue-500 to-indigo-600',
    icon: '🌍',
    topics: ['Earth\'s Layers', 'Weather Patterns', 'Solar System', 'Natural Resources']
  },
  {
    id: 'human-body',
    title: 'Human Body Systems',
    description: 'Discover how your amazing body works',
    grade: '5-7',
    lessons: 4,
    duration: '36 min',
    difficulty: 'Advanced',
    color: 'from-red-500 to-orange-600',
    icon: '🫀',
    topics: ['Circulatory System', 'Respiratory System', 'Digestive System', 'Nervous System']
  }
];

export default function SciencePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white mb-6">
              <Microscope size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
              Science Adventures
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the wonders of science through interactive lessons, experiments, and explorations. 
              From tiny atoms to vast galaxies, let's explore how our world works!
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {scienceUnits.reduce((total, unit) => total + unit.lessons, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                4
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Science Units</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                K-7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Grade Levels</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                Interactive
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Learning Style</div>
            </div>
          </div>

          {/* Science Units */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
              Choose Your Science Journey
            </h2>
            
            {scienceUnits.map((unit, index) => (
              <div
                key={unit.id}
                className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-4 rounded-full bg-gradient-to-r ${unit.color} text-white text-2xl`}>
                        {unit.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                            Grade {unit.grade}
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                            {unit.difficulty}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          {unit.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      {unit.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {unit.topics.map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <BookOpen size={16} className="mr-2" />
                        {unit.lessons} lessons
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        {unit.duration}
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:ml-8">
                    <Link
                      href={`/learn/science/${unit.id}`}
                      className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${unit.color} text-white rounded-xl hover:shadow-lg transition-all font-medium text-lg group`}
                    >
                      Explore Unit
                      <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                More Science Adventures Coming Soon!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We're adding more exciting science units including Chemistry, Physics, Biology, and Environmental Science. 
                Stay tuned for more hands-on learning experiences!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
