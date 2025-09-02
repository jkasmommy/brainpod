'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser, initializeAuth } from '../../../lib/auth';
import { 
  DiagItem, 
  DiagState, 
  DiagBlueprint, 
  DiagAttempt, 
  Subject 
} from '../../../lib/diagTypes';
import {
  loadDiagBank,
  getDiagnosticConfig,
  saveDiagnosticResults,
  nextItem,
  score,
  updateAbility
} from '../../../lib/enhancedDiagnosticEngine';
import DiagProgress from '../../../components/DiagProgress';
import QuestionCard from '../../../components/QuestionCard';
import MindfulBreak from '../../../components/MindfulBreak';

export default function DiagnosticRunner() {
  const params = useParams();
  const router = useRouter();
  const subject = params.subject as Subject;

  // Helper function to generate placement from ability
  const generatePlacement = (ability: number, subject: Subject) => {
    const gradeMap = {
      math: {
        '-2': 'K', '-1.5': 'K', '-1': '1', '-0.5': '1-2', 
        '0': '2-3', '0.5': '3-4', '1': '4-5', '1.5': '6-7', '2': '8+'
      },
      reading: {
        '-2': 'K', '-1.5': 'K', '-1': '1', '-0.5': '1-2',
        '0': '2-3', '0.5': '3-4', '1': '4-5', '1.5': '6-7', '2': '8+'
      },
      science: {
        '-2': 'K-1', '-1.5': '1-2', '-1': '2-3', '-0.5': '3-4',
        '0': '4-5', '0.5': '5-6', '1': '6-7', '1.5': '7-8', '2': 'HS'
      },
      'social-studies': {
        '-2': 'K-1', '-1.5': '1-2', '-1': '2-3', '-0.5': '3-4',
        '0': '4-5', '0.5': '5-6', '1': '6-7', '1.5': '7-8', '2': 'HS'
      }
    };

    const grades = gradeMap[subject] || gradeMap.math;
    const abilityKey = Object.keys(grades).reduce((prev, curr) => 
      Math.abs(parseFloat(curr) - ability) < Math.abs(parseFloat(prev) - ability) ? curr : prev
    );

    return {
      ability,
      sem: 0.3,
      recommendedGrade: grades[abilityKey as keyof typeof grades] || '2-3',
      recommendedUnit: undefined
    };
  };

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
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
  const [hasTriggeredBreak, setHasTriggeredBreak] = useState(false);
  const [mood, setMood] = useState<number>(3);
  const [hasStarted, setHasStarted] = useState(false);

  // Check authentication first
  useEffect(() => {
    initializeAuth();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    setUser(currentUser);
    setAuthLoading(false);
  }, [router]);

  // Initialize diagnostic
  useEffect(() => {
    // Don't initialize if not authenticated yet
    if (authLoading || !user) return;

    async function initialize() {
      try {
        setLoading(true);
        
        // Validate subject
        if (!['math', 'reading', 'science', 'social-studies'].includes(subject)) {
          setError('Invalid subject. Please select a valid subject.');
          return;
        }

        // Load item bank and blueprint
        Promise.all([
          loadDiagBank(subject),
          getDiagnosticConfig(subject)
        ]).then(([bankData, blueprintData]) => {
          
          if (bankData.length === 0) {
            setError(`No diagnostic items found for ${subject}. Please try again later.`);
            return;
          }

          setItemBank(bankData);
          setBlueprint(blueprintData);

          // Initialize state
          const initialState: DiagState = {
            subject,
            ability: blueprintData?.startDifficulty || 0,
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
        }).catch(err => {
          console.error('Failed to initialize diagnostic:', err);
          setError('Failed to load diagnostic. Please refresh and try again.');
          setLoading(false);
        });
      } catch (err) {
        console.error('Failed to initialize diagnostic:', err);
        setError('Failed to load diagnostic. Please refresh and try again.');
        setLoading(false);
      }
    }

    initialize();
  }, [subject, authLoading, user]);

  // Get next question when state changes
  useEffect(() => {
    if (!state || !itemBank.length || !blueprint || !hasStarted || showMindfulBreak) return;

    const next = nextItem(state, itemBank);
    if (next) {
      setCurrentItem(next);
      setShowFeedback(false);
    } else {
      // No more items available
      completeAssessment();
    }
  }, [state, itemBank, blueprint, hasStarted, showMindfulBreak]);

  // Check for mindful break triggers
  useEffect(() => {
    if (!state || !blueprint || showMindfulBreak || hasTriggeredBreak) return;

    // Only trigger break if we have made some progress and need one
    if ((state.attempts === blueprint.breakAfter || state.mood <= 2) && state.attempts > 0) {
      setState(prev => prev ? { ...prev, needsBreak: true } : null);
      setShowMindfulBreak(true);
      setHasTriggeredBreak(true);
    }
  }, [state?.attempts, state?.mood, blueprint?.breakAfter]);

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
      // Check if we should stop
      const shouldStopNow = (newState.attempts >= blueprint.maxItems) ||
        (newState.attempts >= blueprint.minItems && Math.abs(newState.streak) >= blueprint.stopRules.streak);

      if (shouldStopNow) {
        completeAssessment();
      } else {
        // Continue to next question
        setShowFeedback(false);
      }
    }, 2000);
  };

  const completeAssessment = () => {
    if (!state) return;

    // Generate placement recommendation
    const placement = generatePlacement(state.ability, subject);
    
    // Save results to database
    if (user) {
      saveDiagnosticResults(
        user.id,
        subject,
        attempts.map((attempt: DiagAttempt) => ({
          itemId: attempt.itemId,
          response: attempt.response,
          correct: attempt.correct,
          timeMs: Date.now() - attempt.timestamp
        })),
        state.ability,
        0.3, // Standard error estimate
        placement
      ).catch(error => {
        console.error('Failed to save diagnostic results:', error);
      });
    }
    
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
    // Clear the break flag and continue
    setState(prev => {
      if (prev) {
        return { ...prev, needsBreak: false };
      }
      return prev;
    });
  };

  const handleMindfulBreakSkip = () => {
    setShowMindfulBreak(false);
    // Clear the break flag and continue
    setState(prev => {
      if (prev) {
        return { ...prev, needsBreak: false };
      }
      return prev;
    });
  };

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
                Let&apos;s find your perfect starting point!
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
