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
  grade?: string; // Add grade prop for age-appropriate content
}

// Age-appropriate affirmations
const youngAffirmations = [
  "You are doing great! 🌟",
  "Take your time and breathe. 🌸", 
  "Every step forward is progress. 💪",
  "You are brave and smart. 🧠",
  "Learning is a journey, not a race. 🌈",
  "You've got this! Keep going. ⭐",
  "Take a moment to appreciate how far you've come. 🌱"
];

const teenAffirmations = [
  "You're making solid progress! 💪",
  "Take a breath. You've got this handled. 🌟",
  "Growth happens when you push through challenges. 🚀",
  "Your effort today shapes your future success. ⭐",
  "Smart work beats hard work. You're doing both. 🧠",
  "Every expert was once a beginner. Keep building. 🏗️",
  "Focus on progress, not perfection. 📈"
];

// Mindful break types
const breakTypes = {
  young: {
    title: "Time for a Mindful Break! 🧘‍♀️",
    message: "Let's take a moment to breathe and reset your learning energy.",
    breathingPattern: { inhale: 4, hold: 4, exhale: 4, pause: 1 } // 4-4-4-1 pattern
  },
  teen: {
    title: "Quick Reset Break 🧘",
    message: "Take a moment to center yourself and refocus your energy.",
    breathingPattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 } // Box breathing 4-4-4-4
  }
};

export default function MindfulBreak({ 
  onComplete, 
  onSkip,
  title,
  message,
  duration = 20,
  isOpen,
  grade
}: MindfulBreakProps) {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  // Determine age group and get appropriate content
  const isTeenOrHS = grade === 'HS' || ['9', '10', '11', '12'].includes(grade || '');
  const breakType = isTeenOrHS ? breakTypes.teen : breakTypes.young;
  const affirmations = isTeenOrHS ? teenAffirmations : youngAffirmations;
  
  const finalTitle = title || breakType.title;
  const finalMessage = message || breakType.message;

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
        e.preventDefault();
        e.stopPropagation();
        onSkip();
        return;
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
            {finalTitle}
          </h2>
          <p 
            id="mindful-break-description"
            className="text-gray-600 dark:text-gray-300 mb-4"
          >
            {finalMessage}
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
            key={`breathing-${duration}-${isOpen}`}
            duration={duration}
            onComplete={onComplete}
            onSkip={onSkip}
            breathingPattern={breakType.breathingPattern}
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
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Press ESC to skip
          </p>
        </div>

        {/* Screen reader live region */}
        <div className="sr-only" aria-live="polite" role="status">
          Mindful break in progress. Take deep breaths and relax.
        </div>
      </div>
    </div>
  );
}
