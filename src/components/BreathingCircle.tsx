'use client';

import { useState, useEffect } from 'react';

interface BreathingCircleProps {
  onComplete?: () => void;
  duration?: number; // Total duration in seconds
  className?: string;
}

export default function BreathingCircle({ 
  onComplete, 
  duration = 20, 
  className = '' 
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      
      // Cycle through breathing phases (4 seconds inhale, 2 seconds hold, 4 seconds exhale)
      const cycleTime = timeLeft % 10;
      if (cycleTime >= 6) {
        setPhase('inhale');
      } else if (cycleTime >= 4) {
        setPhase('hold');
      } else {
        setPhase('exhale');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isActive, onComplete]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 'scale-125';
      case 'hold': return 'scale-125';
      case 'exhale': return 'scale-75';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Breathing Circle */}
      <div className="relative mb-6">
        <div 
          className={`
            w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 
            transition-transform duration-4000 ease-in-out shadow-lg
            ${getCircleScale()}
          `}
          style={{ 
            transitionDuration: phase === 'hold' ? '2s' : '4s',
            filter: 'blur(0.5px)'
          }}
        />
        
        {/* Inner circle for better visual */}
        <div 
          className={`
            absolute inset-4 rounded-full bg-gradient-to-br from-blue-300 to-purple-400 
            transition-transform duration-4000 ease-in-out opacity-80
            ${getCircleScale()}
          `}
          style={{ 
            transitionDuration: phase === 'hold' ? '2s' : '4s' 
          }}
        />
      </div>

      {/* Phase Text */}
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-1000">
        {getPhaseText()}
      </h3>

      {/* Timer */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Time remaining
        </p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
      </div>

      {/* Affirmation */}
      <div className="mt-6 text-center max-w-sm">
        <p className="text-gray-600 dark:text-gray-300 italic">
          &quot;I am calm, I am focused, I am ready to learn.&quot;
        </p>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => {
          setIsActive(false);
          if (onComplete) onComplete();
        }}
        className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
      >
        Skip mindful break
      </button>
    </div>
  );
}
