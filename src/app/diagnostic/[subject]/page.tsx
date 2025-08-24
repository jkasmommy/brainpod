'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  DiagItem, 
  DiagState, 
  DiagBlueprint, 
  DiagAttempt, 
  Subject 
} from '../../../lib/diagTypes';
import {
  loadDiagBank,
  nextItem,
  score,
  updateAbility,
  shouldStop,
  place,
  getBlueprintForSubject
} from '../../../lib/diagnosticEngine';
import DiagProgress from '../../../components/DiagProgress';
import QuestionCard from '../../../components/QuestionCard';
import MindfulBreak from '../../../components/MindfulBreak';

export default function DiagnosticRunner() {
  const params = useParams();
  const router = useRouter();
  const subject = params.subject as Subject;

  const [itemBank, setItemBank] = useState<DiagItem[]>([]);
  const [blueprint, setBlueprint] = useState<DiagBlueprint | null>(null);
  const [state, setState] = useState<DiagState | null>(null);
  const [currentItem, setCurrentItem] = useState<DiagItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<DiagAttempt[]>([]);
  const [showMindfulBreak, setShowMindfulBreak] = useState(false);
  const [mood, setMood] = useState<number>(3);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize diagnostic
  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        
        // Validate subject
        if (!['math', 'reading', 'science', 'social-studies'].includes(subject)) {
          setError('Invalid subject. Please select a valid subject.');
          return;
        }

        // Load item bank and blueprint
        const [bank, bp] = await Promise.all([
          loadDiagBank(subject),
          Promise.resolve(getBlueprintForSubject(subject))
        ]);

        if (bank.length === 0) {
          setError(`No diagnostic items found for ${subject}. Please try again later.`);
          return;
        }

        setItemBank(bank);
        setBlueprint(bp);

        // Initialize state
        const initialState: DiagState = {
          subject,
          ability: bp.startDifficulty,
          itemsAsked: [],
          skillsSeen: new Set(),
          correctCount: 0,
          attempts: 0,
          streak: 0,
          mood: 3,
          needsBreak: false
        };

        setState(initialState);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize diagnostic:', err);
        setError('Failed to load diagnostic. Please refresh and try again.');
        setLoading(false);
      }
    }

    initialize();
  }, [subject]);

  // Get next question when state changes
  useEffect(() => {
    if (!state || !itemBank.length || !blueprint || !hasStarted) return;

    const next = nextItem(state, itemBank);
    if (next) {
      setCurrentItem(next);
      setShowFeedback(false);
    } else {
      // No more items available
      completeAssessment();
    }
  }, [state, itemBank, blueprint, hasStarted]);

  // Check for mindful break triggers
  useEffect(() => {
    if (!state || !blueprint) return;

    if (state.attempts === blueprint.breakAfter || state.mood <= 2) {
      if (!showMindfulBreak && state.attempts > 0) {
        setState(prev => prev ? { ...prev, needsBreak: true } : null);
        setShowMindfulBreak(true);
      }
    }
  }, [state?.attempts, state?.mood, blueprint?.breakAfter, showMindfulBreak]);

  const startDiagnostic = () => {
    if (state) {
      setState(prev => prev ? { ...prev, mood } : null);
      setHasStarted(true);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentItem || !state || !blueprint || showFeedback) return;

    const isCorrect = score(answer, currentItem);
    setLastCorrect(isCorrect);
    setShowFeedback(true);

    // Create attempt record
    const attempt: DiagAttempt = {
      itemId: currentItem.id,
      response: answer,
      correct: isCorrect,
      abilityAfter: state.ability,
      timestamp: Date.now()
    };

    // Update state
    const newState = { ...state };
    newState.itemsAsked.push(currentItem.id);
    updateAbility(newState, isCorrect, currentItem);
    
    setState(newState);

    // Store attempt
    const newAttempts = [...attempts, attempt];
    setAttempts(newAttempts);

    // Store in localStorage
    const storageKey = `bp_diag_${subject}`;
    const existingData = localStorage.getItem(storageKey);
    const allAttempts = existingData ? 
      [...JSON.parse(existingData), attempt] : 
      [attempt];
    localStorage.setItem(storageKey, JSON.stringify(allAttempts));

    // Check if should stop
    setTimeout(() => {
      if (shouldStop(newState, blueprint)) {
        completeAssessment();
      } else {
        // Continue to next question
        setShowFeedback(false);
      }
    }, 2000);
  };

  const completeAssessment = () => {
    if (!state) return;

    const placement = place(state.ability, subject);
    
    // Store placement in localStorage
    const placementKey = `bp_place_${subject}`;
    const savedPlacement = {
      subject,
      placement,
      timestamp: Date.now(),
      attempts
    };
    localStorage.setItem(placementKey, JSON.stringify(savedPlacement));

    // Navigate to results with placement data
    const params = new URLSearchParams({
      ability: placement.ability.toString(),
      grade: placement.recommendedGrade,
      unit: placement.recommendedUnit || '',
      correct: state.correctCount.toString(),
      total: state.attempts.toString()
    });

    router.push(`/diagnostic/${subject}/result?${params.toString()}`);
  };

  const handleMindfulBreakComplete = () => {
    setShowMindfulBreak(false);
    setState(prev => prev ? { ...prev, needsBreak: false } : null);
  };

  const handleMindfulBreakSkip = () => {
    setShowMindfulBreak(false);
    setState(prev => prev ? { ...prev, needsBreak: false } : null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your {subject} diagnostic...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Pre-start mood check
  if (!hasStarted && state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                {subject.charAt(0).toUpperCase() + subject.slice(1).replace('-', ' ')} Diagnostic
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Let's find your perfect starting point!
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Before we start, how are you feeling today?
              </h2>
              
              <div className="mb-8">
                <div className="flex justify-center space-x-3 mb-4">
                  {[1, 2, 3, 4, 5].map((moodLevel) => (
                    <button
                      key={moodLevel}
                      onClick={() => setMood(moodLevel)}
                      className={`w-16 h-16 rounded-full text-3xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        mood === moodLevel 
                          ? 'bg-blue-200 dark:bg-blue-700 scale-110 shadow-lg' 
                          : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'
                      }`}
                    >
                      {moodLevel === 1 ? '😢' : moodLevel === 2 ? '😕' : moodLevel === 3 ? '😐' : moodLevel === 4 ? '😊' : '😄'}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  1 = Very sad, 5 = Very happy
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What to expect:</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {blueprint?.minItems}-{blueprint?.maxItems} adaptive questions</li>
                  <li>• Questions get easier/harder based on your answers</li>
                  <li>• Includes a mindful breathing break</li>
                  <li>• Takes about 5-10 minutes</li>
                </ul>
              </div>

              <button
                onClick={startDiagnostic}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start My {subject.charAt(0).toUpperCase() + subject.slice(1).replace('-', ' ')} Assessment 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main diagnostic interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              {subject.charAt(0).toUpperCase() + subject.slice(1).replace('-', ' ')} Assessment
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Adaptive learning level assessment
            </p>
          </div>

          {/* Progress */}
          {state && blueprint && (
            <DiagProgress 
              state={state} 
              maxItems={blueprint.maxItems}
              showAbility={state.attempts >= 3}
            />
          )}

          {/* Question */}
          {currentItem && (
            <QuestionCard
              item={currentItem}
              onAnswer={handleAnswer}
              disabled={showFeedback}
              showFeedback={showFeedback}
              isCorrect={lastCorrect}
            />
          )}

          {/* Mindful Break Modal */}
          <MindfulBreak
            isOpen={showMindfulBreak}
            onComplete={handleMindfulBreakComplete}
            onSkip={handleMindfulBreakSkip}
            title="Assessment Break Time! 🌸"
            message="You're doing great! Let's take a moment to breathe and recharge."
          />
        </div>
      </div>
    </div>
  );
}
