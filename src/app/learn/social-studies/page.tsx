'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, requireAuth, getUserDisplayName } from '@/lib/auth';
import Link from 'next/link';
import { Globe, BookOpen, Clock, Users, ChevronRight, Star, MapPin } from 'lucide-react';

const socialStudiesUnits = [
  {
    id: 'community-helpers',
    title: 'Community Helpers',
    description: 'Learn about the important people who help our community',
    grade: 'K-2',
    lessons: 6,
    duration: '42 min',
    difficulty: 'Beginner',
    color: 'from-green-500 to-teal-600',
    icon: '👥',
    topics: ['Police Officers', 'Firefighters', 'Teachers', 'Doctors', 'Mail Carriers', 'Community Safety']
  },
  {
    id: 'geography-basics',
    title: 'Geography Basics',
    description: 'Explore maps, continents, and places around the world',
    grade: '2-4',
    lessons: 5,
    duration: '35 min',
    difficulty: 'Intermediate',
    color: 'from-blue-500 to-indigo-600',
    icon: '🗺️',
    topics: ['Maps & Globes', 'Continents & Oceans', 'Countries', 'Landforms', 'Climate Zones']
  },
  {
    id: 'american-history',
    title: 'American History Basics',
    description: 'Journey through important events in American history',
    grade: '3-5',
    lessons: 7,
    duration: '49 min',
    difficulty: 'Intermediate',
    color: 'from-red-500 to-orange-600',
    icon: '🇺🇸',
    topics: ['Native Americans', 'Explorers', 'Colonies', 'Revolution', 'Civil War', 'Modern America', 'Important Leaders']
  },
  {
    id: 'government-civics',
    title: 'Government & Civics',
    description: 'Understand how government works and your role as a citizen',
    grade: '4-6',
    lessons: 5,
    duration: '40 min',
    difficulty: 'Advanced',
    color: 'from-purple-500 to-pink-600',
    icon: '🏛️',
    topics: ['Three Branches', 'Constitution', 'Rights & Responsibilities', 'Elections', 'Local Government']
  },
  {
    id: 'world-cultures',
    title: 'World Cultures',
    description: 'Discover diverse cultures and traditions from around the globe',
    grade: '3-6',
    lessons: 6,
    duration: '48 min',
    difficulty: 'Intermediate',
    color: 'from-orange-500 to-red-600',
    icon: '🌍',
    topics: ['Asian Cultures', 'European Traditions', 'African Heritage', 'Latin America', 'Festivals', 'Languages']
  }
];

export default function SocialStudiesPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white mb-6">
              <Globe size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-6">
              Social Studies Explorer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore our world's history, cultures, geography, and government. Learn about different people, 
              places, and how we all connect in our global community.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {socialStudiesUnits.reduce((total, unit) => total + unit.lessons, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Study Units</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                K-6
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Grade Levels</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                Global
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Perspective</div>
            </div>
          </div>

          {/* Social Studies Units */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
              Choose Your Adventure
            </h2>
            
            {socialStudiesUnits.map((unit, index) => (
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
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
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
                      href={`/learn/social-studies/${unit.id}`}
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

          {/* Interactive Features */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
              <MapPin className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Virtual Field Trips
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take virtual trips to historical sites, museums, and landmarks around the world. 
                Experience history and culture firsthand!
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-8">
              <Users className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Interactive Activities
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Engage with timeline builders, map activities, role-playing scenarios, 
                and cultural exploration games.
              </p>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                More Adventures Coming Soon!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We're adding more social studies units including Ancient Civilizations, 
                Economics for Kids, and Current Events. Expand your world knowledge!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
