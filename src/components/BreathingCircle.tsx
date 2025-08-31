'use client';

import { useState, useEffect } from 'react';

interface BreathingCircleProps {
  onComplete?: () => void;
  onSkip?: () => void;
  duration?: number; // Total duration in seconds
  className?: string;
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
}

export default function BreathingCircle({ 
  onComplete, 
  onSkip,
  duration = 20, 
  className = '',
  breathingPattern = { inhale: 4, hold: 2, exhale: 4, pause: 1 }
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [cycleTimer, setCycleTimer] = useState(0);

  // Reset timeLeft if duration changes (component remount)
  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(true);
    setHasCompleted(false);
  }, [duration]);

  useEffect(() => {
    if (!isActive || hasCompleted) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        console.log('Timer tick:', prev); // Debug log
        const newTime = prev - 1;
        
        // If time is up, complete the exercise
        if (newTime <= 0) {
          console.log('Timer completed, calling onComplete'); // Debug log
          setIsActive(false);
          setHasCompleted(true);
          clearInterval(interval);
          if (onComplete) {
            setTimeout(() => onComplete(), 100); // Small delay to ensure state updates
          }
          return 0;
        }
        
        // Cycle through breathing phases using the provided pattern
        setCycleTimer(prev => {
          const totalCycleTime = breathingPattern.inhale + breathingPattern.hold + breathingPattern.exhale + breathingPattern.pause;
          const currentCycleTime = (prev + 1) % totalCycleTime;
          
          if (currentCycleTime < breathingPattern.inhale) {
            setPhase('inhale');
          } else if (currentCycleTime < breathingPattern.inhale + breathingPattern.hold) {
            setPhase('hold');
          } else if (currentCycleTime < breathingPattern.inhale + breathingPattern.hold + breathingPattern.exhale) {
            setPhase('exhale');
          } else {
            setPhase('pause');
          }
          
          return currentCycleTime;
        });
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, hasCompleted, onComplete]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      case 'pause': return 'Pause...';
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
      {onSkip && (
        <button
          onClick={() => {
            setIsActive(false);
            setHasCompleted(true);
            onSkip();
          }}
          className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
        >
          Skip mindful break
        </button>
      )}
    </div>
  );
}
