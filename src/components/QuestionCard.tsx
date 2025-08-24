'use client';

import { useState, useEffect, useRef } from 'react';
import { DiagItem } from '../lib/diagTypes';
import Apple from './Apple';

interface QuestionCardProps {
  item: DiagItem;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

export default function QuestionCard({ 
  item, 
  onAnswer, 
  disabled = false, 
  showFeedback = false,
  isCorrect 
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [focusedChoice, setFocusedChoice] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const choiceRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset selection when item changes
  useEffect(() => {
    setSelectedAnswer('');
    setFocusedChoice(0);
    
    // Focus the card for screen readers
    if (cardRef.current) {
      cardRef.current.focus();
    }
  }, [item.id]);

  // Handle keyboard navigation for MCQ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || !item.choices) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setFocusedChoice(prev => 
            prev < item.choices!.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedChoice(prev => 
            prev > 0 ? prev - 1 : item.choices!.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (item.choices && item.choices[focusedChoice]) {
            handleChoiceSelect(item.choices[focusedChoice]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, item.choices, focusedChoice]);

  // Focus the current choice button
  useEffect(() => {
    if (choiceRefs.current[focusedChoice]) {
      choiceRefs.current[focusedChoice]?.focus();
    }
  }, [focusedChoice]);

  const handleChoiceSelect = (choice: string) => {
    if (disabled) return;
    setSelectedAnswer(choice);
    onAnswer(choice);
  };

  const renderChoices = () => {
    if (!item.choices) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {item.choices.map((choice, index) => {
          const isSelected = selectedAnswer === choice;
          const isFocused = focusedChoice === index;
          
          let buttonClass = `
            p-4 rounded-lg border-2 text-left transition-all duration-200 
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
            ${isFocused ? 'ring-2 ring-blue-400' : ''}
          `;

          if (showFeedback && selectedAnswer) {
            if (choice === item.answer) {
              buttonClass += ' bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-400 dark:text-green-200';
            } else if (isSelected) {
              buttonClass += ' bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-400 dark:text-red-200';
            } else {
              buttonClass += ' bg-gray-50 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400';
            }
          } else if (isSelected) {
            buttonClass += ' bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-200';
          } else {
            buttonClass += ' bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700';
          }

          return (
            <button
              key={index}
              ref={el => { choiceRefs.current[index] = el; }}
              onClick={() => handleChoiceSelect(choice)}
              disabled={disabled}
              className={buttonClass}
              aria-pressed={isSelected}
              aria-describedby={showFeedback ? `feedback-${item.id}` : undefined}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${isSelected 
                    ? 'bg-current text-white' 
                    : 'border-current'
                  }
                `}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{choice}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderCountingQuestion = () => {
    if (item.type !== 'count') return null;

    // Extract number from prompt for display
    const count = parseInt(item.answer);
    
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-center gap-2 min-h-[100px] items-center">
          {Array.from({ length: count }, (_, i) => (
            <Apple key={i} size="md" />
          ))}
        </div>
        
        <div className="text-center">
          <input
            type="number"
            min="0"
            max="20"
            className="w-20 h-12 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            placeholder="?"
            disabled={disabled}
            onChange={(e) => onAnswer(e.target.value)}
            aria-label="Enter the number you counted"
          />
        </div>
      </div>
    );
  };

  const renderPhonemeQuestion = () => {
    if (item.type !== 'phoneme') return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <input
            type="text"
            maxLength={10}
            className="w-32 h-12 text-center text-xl font-medium border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            placeholder="/sound/"
            disabled={disabled}
            onChange={(e) => onAnswer(e.target.value)}
            aria-label="Enter the sound this letter makes"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Type the sound using forward slashes, like: /m/
        </p>
      </div>
    );
  };

  return (
    <div 
      ref={cardRef}
      className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg backdrop-blur-sm"
      tabIndex={-1}
      aria-live="polite"
    >
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
            {item.skill.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.gradeHint}
          </span>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {item.prompt}
        </h2>
      </div>

      {/* Question Content */}
      <div className="mb-6">
        {item.type === 'mcq' && renderChoices()}
        {item.type === 'count' && renderCountingQuestion()}
        {item.type === 'phoneme' && renderPhonemeQuestion()}
        {item.type === 'map' && renderChoices()} {/* Maps use MCQ format */}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div 
          id={`feedback-${item.id}`}
          className={`p-3 rounded-lg text-sm font-medium ${
            isCorrect 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}
          role="status"
          aria-live="assertive"
        >
          {isCorrect ? (
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>Excellent work!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>💭</span>
              <span>Good try! The correct answer is: {item.answer}</span>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Instructions */}
      {item.type === 'mcq' && !disabled && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Use arrow keys to navigate, Enter or Space to select
        </div>
      )}
    </div>
  );
}
