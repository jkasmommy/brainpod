'use client';

import { useState, useEffect } from 'react';
import Apple from './Apple';
import Stars from './Stars';
import Badge from './Badge';
import BreathingCircle from './BreathingCircle';

type Phase = 'onboarding' | 'placement' | 'lesson' | 'mindful' | 'practice' | 'checkpoint';

interface GameState {
  phase: Phase;
  mood: number; // 1-5
  currentRange: [number, number]; // e.g., [1, 3]
  stars: number; // 0-3
  correctStreak: number;
  totalAttempts: number;
  currentQuestion: {
    target: number;
    userAnswer?: number;
  };
}

export default function KinderCountingDemo() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'onboarding',
    mood: 3,
    currentRange: [1, 3],
    stars: 0,
    correctStreak: 0,
    totalAttempts: 0,
    currentQuestion: { target: 1 }
  });

  // Adaptive Logic: Adjust difficulty based on performance
  const adjustDifficulty = (isCorrect: boolean) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      if (isCorrect) {
        newState.correctStreak += 1;
        // Award star every 2 correct answers (max 3 stars)
        if (newState.correctStreak % 2 === 0 && newState.stars < 3) {
          newState.stars += 1;
        }
        // Expand range after 2 correct in a row
        if (newState.correctStreak >= 2 && newState.currentRange[1] < 5) {
          newState.currentRange = [newState.currentRange[0], Math.min(5, newState.currentRange[1] + 1)];
          newState.correctStreak = 0; // Reset streak after expansion
        }
      } else {
        newState.correctStreak = 0;
        // Shrink range on miss, but keep minimum of 1-3
        if (newState.currentRange[1] > 3) {
          newState.currentRange = [1, Math.max(3, newState.currentRange[1] - 1)];
        }
      }
      
      newState.totalAttempts += 1;
      
      // Trigger mindful break if mood is low or after 5 attempts
      if (newState.mood <= 2 || newState.totalAttempts % 5 === 0) {
        newState.phase = 'mindful';
      }
      
      return newState;
    });
  };

  // Generate new question within current range
  const generateQuestion = () => {
    const min = gameState.currentRange[0];
    const max = gameState.currentRange[1];
    const target = Math.floor(Math.random() * (max - min + 1)) + min;
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: { target, userAnswer: undefined }
    }));
  };

  useEffect(() => {
    if (gameState.phase === 'lesson' || gameState.phase === 'practice') {
      generateQuestion();
    }
  }, [gameState.phase, gameState.currentRange]);

  // Render different phases
  const renderPhase = () => {
    switch (gameState.phase) {
      case 'onboarding':
        return (
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              How are you feeling today?
            </h2>
            <div className="mb-8">
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setGameState(prev => ({ ...prev, mood }))}
                    className={`w-12 h-12 rounded-full text-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      gameState.mood === mood 
                        ? 'bg-blue-200 dark:bg-blue-700 scale-110' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'
                    }`}
                  >
                    {mood === 1 ? '😢' : mood === 2 ? '😕' : mood === 3 ? '😐' : mood === 4 ? '😊' : '😄'}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tap how you&apos;re feeling: 1 (sad) to 5 (happy)
              </p>
            </div>
            <button
              onClick={() => setGameState(prev => ({ ...prev, phase: 'placement' }))}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              Let&apos;s Start Learning!
            </button>
          </div>
        );

      case 'placement':
        return (
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              How many apples do you see?
            </h2>
            <div className="flex justify-center space-x-3 mb-8">
              <Apple size="lg" />
              <Apple size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {[1, 2, 3].map((number) => (
                <button
                  key={number}
                  onClick={() => {
                    const isCorrect = number === 2;
                    if (isCorrect) {
                      setGameState(prev => ({ ...prev, phase: 'lesson' }));
                    }
                    // Set initial range based on placement
                    setGameState(prev => ({ 
                      ...prev, 
                      currentRange: isCorrect ? [1, 3] : [1, 2]
                    }));
                  }}
                  className="aspect-square bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg text-2xl font-bold text-blue-600 dark:text-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        );

      case 'lesson':
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Stars count={gameState.stars} />
              <Badge variant="info" size="sm">
                Range: {gameState.currentRange[0]}-{gameState.currentRange[1]}
              </Badge>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Count the apples and tap the number!
            </h2>
            
            {/* Display apples */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[100px] items-center">
              {Array.from({ length: gameState.currentQuestion.target }, (_, i) => (
                <Apple key={i} size="lg" />
              ))}
            </div>
            
            {/* Number choices */}
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {Array.from({ length: gameState.currentRange[1] }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => {
                    const isCorrect = number === gameState.currentQuestion.target;
                    adjustDifficulty(isCorrect);
                    
                    if (isCorrect) {
                      // Generate new question after short delay
                      setTimeout(() => generateQuestion(), 1000);
                    } else {
                      // Show hint and retry
                      setTimeout(() => generateQuestion(), 2000);
                    }
                  }}
                  className="aspect-square bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-lg text-2xl font-bold text-purple-600 dark:text-purple-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  {number}
                </button>
              ))}
            </div>
            
            <div className="mt-6 space-x-4">
              <button
                onClick={() => setGameState(prev => ({ ...prev, phase: 'practice' }))}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Practice Mode
              </button>
              <button
                onClick={() => setGameState(prev => ({ ...prev, phase: 'checkpoint' }))}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
              >
                Check Progress
              </button>
            </div>
          </div>
        );

      case 'mindful':
        return (
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Time for a Mindful Break! 🧘‍♀️
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Let&apos;s take a moment to breathe and reset our learning energy.
            </p>
            <BreathingCircle 
              onComplete={() => setGameState(prev => ({ ...prev, phase: 'lesson' }))}
              duration={20}
            />
          </div>
        );

      case 'practice':
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Stars count={gameState.stars} />
              <Badge variant="warning" size="sm">
                Practice Mode
              </Badge>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Build to {gameState.currentQuestion.target} apples!
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[80px] items-center">
                {Array.from({ length: gameState.currentQuestion.userAnswer || 0 }, (_, i) => (
                  <Apple key={i} size="md" />
                ))}
              </div>
              
              <div className="flex justify-center items-center space-x-6">
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    currentQuestion: {
                      ...prev.currentQuestion,
                      userAnswer: Math.max(0, (prev.currentQuestion.userAnswer || 0) - 1)
                    }
                  }))}
                  className="w-12 h-12 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-full text-2xl font-bold text-red-600 dark:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  -
                </button>
                
                <span className="text-4xl font-bold text-gray-700 dark:text-gray-300 min-w-[3rem]">
                  {gameState.currentQuestion.userAnswer || 0}
                </span>
                
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    currentQuestion: {
                      ...prev.currentQuestion,
                      userAnswer: Math.min(gameState.currentRange[1], (prev.currentQuestion.userAnswer || 0) + 1)
                    }
                  }))}
                  className="w-12 h-12 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-full text-2xl font-bold text-green-600 dark:text-green-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  +
                </button>
              </div>
            </div>
            
            {gameState.currentQuestion.userAnswer === gameState.currentQuestion.target && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Perfect! You built {gameState.currentQuestion.target} apples! 🎉
                </p>
              </div>
            )}
            
            <button
              onClick={() => setGameState(prev => ({ ...prev, phase: 'lesson' }))}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Back to Lessons
            </button>
          </div>
        );

      case 'checkpoint':
        return (
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Great Progress! 🌟
            </h2>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 mb-6">
              <div className="flex justify-center mb-4">
                <Stars count={gameState.stars} size="lg" />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Range:</span>
                  <Badge variant="info" size="sm">
                    {gameState.currentRange[0]} - {gameState.currentRange[1]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Correct Streak:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {gameState.correctStreak}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Attempts:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {gameState.totalAttempts}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ready for bigger numbers or want to stay in your comfort zone?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setGameState(prev => ({ 
                    ...prev, 
                    currentRange: [1, 5],
                    phase: 'lesson' 
                  }));
                }}
                disabled={gameState.currentRange[1] >= 5}
                className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                Try Bigger Numbers (1-5) 🚀
              </button>
              
              <button
                onClick={() => {
                  setGameState(prev => ({ 
                    ...prev, 
                    currentRange: [1, 3],
                    phase: 'lesson' 
                  }));
                }}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                Stay with Smaller Numbers (1-3) 🌱
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
              Kindergarten Math Adventure
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Adaptive counting that grows with you! 🍎✨
            </p>
            
            {/* Progress indicators */}
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className={gameState.phase === 'onboarding' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                Mood Check
              </span>
              <span>→</span>
              <span className={gameState.phase === 'placement' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                Placement
              </span>
              <span>→</span>
              <span className={['lesson', 'practice', 'checkpoint'].includes(gameState.phase) ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                Learning
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-lg backdrop-blur-sm">
            {renderPhase()}
          </div>
        </div>
      </div>
    </div>
  );
}
