'use client';

import { useState, useEffect, useRef } from 'react';
import BreathingCircle from './BreathingCircle';

interface MindfulBreakProps {
  onComplete: () => void;
  onSkip?: () => void;
  title?: string;
  message?: string;
  duration?: number;
  isOpen: boolean;
}

const affirmations = [
  "You are doing great! 🌟",
  "Take your time and breathe. 🌸", 
  "Every step forward is progress. 💪",
  "You are brave and smart. 🧠",
  "Learning is a journey, not a race. 🌈",
  "You've got this! Keep going. ⭐",
  "Take a moment to appreciate how far you've come. 🌱"
];

export default function MindfulBreak({ 
  onComplete, 
  onSkip,
  title = "Time for a Mindful Break! 🧘‍♀️",
  message = "Let's take a moment to breathe and reset your learning energy.",
  duration = 20,
  isOpen 
}: MindfulBreakProps) {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    // Set random affirmation
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setCurrentAffirmation(randomAffirmation);

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onSkip) {
        onSkip();
      }
      
      if (e.key === 'Tab') {
        e.preventDefault();
        // Focus skip button if available
        if (skipButtonRef.current) {
          skipButtonRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSkip]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 max-w-md w-full shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mindful-break-title"
        aria-describedby="mindful-break-description"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 
            id="mindful-break-title"
            className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2"
          >
            {title}
          </h2>
          <p 
            id="mindful-break-description"
            className="text-gray-600 dark:text-gray-300 mb-4"
          >
            {message}
          </p>
          
          {/* Affirmation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
            <p className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {currentAffirmation}
            </p>
          </div>
        </div>

        {/* Breathing Circle */}
        <div className="flex justify-center mb-6">
          <BreathingCircle 
            duration={duration}
            onComplete={onComplete}
          />
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Follow the circle as it grows and shrinks
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Breathe in as it grows, hold, then breathe out as it shrinks
          </p>
        </div>

        {/* Skip Option */}
        {onSkip && (
          <div className="text-center">
            <button
              ref={skipButtonRef}
              onClick={onSkip}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-2 py-1"
            >
              Skip break (press ESC)
            </button>
          </div>
        )}

        {/* Screen reader live region */}
        <div className="sr-only" aria-live="polite" role="status">
          Mindful break in progress. Take deep breaths and relax.
        </div>
      </div>
    </div>
  );
}
