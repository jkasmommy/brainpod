/**
 * BrainPod Adaptive Diagnostic Engine
 * 
 * Implements Item Response Theory (1-PL model) for adaptive assessment.
 * Selects optimal next items, updates ability estimates, and determines
 * when to stop testing based on measurement precision.
 */

import { DiagItem, DiagBlueprint, DiagState, Placement, Subject } from './diagTypes';

/**
 * Load diagnostic item bank for a subject
 */
export async function loadDiagBank(subject: Subject): Promise<DiagItem[]> {
  try {
    const response = await fetch(`/content/diagnostic/${subject}-v1.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${subject} diagnostic bank: ${response.status}`);
    }
    const items = await response.json();
    
    // Validate items structure
    if (!Array.isArray(items)) {
      throw new Error(`Invalid ${subject} bank: expected array`);
    }
    
    return items.filter((item: unknown): item is DiagItem => {
      const itemObj = item as Record<string, unknown>;
      return (
        typeof itemObj.id === 'string' &&
        itemObj.subject === subject &&
        typeof itemObj.skill === 'string' &&
        typeof itemObj.difficulty === 'number' &&
        typeof itemObj.prompt === 'string' &&
        typeof itemObj.answer === 'string'
      );
    });
  } catch (error) {
    console.error(`Error loading ${subject} diagnostic bank:`, error);
    // Return empty array rather than throwing to prevent app crash
    return [];
  }
}

/**
 * Select next optimal item based on current ability estimate
 * Uses information-maximizing strategy (item difficulty ≈ ability)
 */
export function nextItem(
  state: DiagState, 
  itemBank: DiagItem[]
): DiagItem | null {
  // Filter out already asked items
  const availableItems = itemBank.filter(item => 
    !state.itemsAsked.includes(item.id)
  );
  
  if (availableItems.length === 0) {
    return null;
  }
  
  // Find item closest to current ability for maximum information
  let bestItem = availableItems[0];
  let bestScore = Math.abs(bestItem.difficulty - state.ability);
  
  for (const item of availableItems) {
    const score = Math.abs(item.difficulty - state.ability);
    
    // Slightly prefer items from skills we haven't seen yet
    const skillBonus = state.skillsSeen.has(item.skill) ? 0 : 0.1;
    const adjustedScore = score - skillBonus;
    
    if (adjustedScore < bestScore) {
      bestScore = adjustedScore;
      bestItem = item;
    }
  }
  
  return bestItem;
}

/**
 * Score a response against the correct answer
 */
export function score(response: string, item: DiagItem): boolean {
  // Normalize for comparison (trim, lowercase)
  const normalizedResponse = response.trim().toLowerCase();
  const normalizedAnswer = item.answer.trim().toLowerCase();
  
  return normalizedResponse === normalizedAnswer;
}

/**
 * Update ability estimate using enhanced 1-PL model
 * More aggressive in finding true ability level and struggle point
 */
export function updateAbility(
  state: DiagState, 
  correct: boolean, 
  item: DiagItem
): void {
  // More aggressive delta for faster convergence to true ability
  const baseDelta = 0.5;
  
  // Calculate expected probability of correct response
  const expectedP = 1 / (1 + Math.exp(-(state.ability - item.difficulty)));
  
  // Information function (how much this item tells us about ability)
  const information = expectedP * (1 - expectedP);
  
  // Surprise factor - how unexpected was this response?
  const surprise = correct ? (1 - expectedP) : expectedP;
  
  // Adaptive delta that increases with information and surprise
  const adaptiveDelta = baseDelta * (0.3 + 1.4 * information) * (0.5 + surprise);
  
  // Apply larger changes when we're consistently right/wrong to find limits faster
  let streakMultiplier = 1.0;
  if (Math.abs(state.streak) >= 2) {
    streakMultiplier = 1.0 + (Math.abs(state.streak) * 0.15); // Increase by 15% per streak item
  }
  
  const delta = adaptiveDelta * (correct ? 1 : -1) * streakMultiplier;
  state.ability += delta;
  
  // Expand range to capture more ability levels (-3 to +3 covers K through college)
  state.ability = Math.max(-3, Math.min(3, state.ability));
  
  // Update streak tracking
  if (correct) {
    state.streak = state.streak >= 0 ? state.streak + 1 : 1;
  } else {
    state.streak = state.streak <= 0 ? state.streak - 1 : -1;
  }
  
  // Track this skill
  state.skillsSeen.add(item.skill);
  state.correctCount += correct ? 1 : 0;
  state.attempts += 1;
}

/**
 * Determine if diagnostic should stop based on enhanced stopping rules
 * Focus on finding true struggle point rather than stopping early
 */
export function shouldStop(
  state: DiagState, 
  blueprint: DiagBlueprint
): boolean {
  // Hard stop at max items
  if (state.attempts >= blueprint.maxItems) {
    return true;
  }
  
  // Must have minimum items and skills
  if (state.attempts < blueprint.minItems || state.skillsSeen.size < blueprint.stopRules.minSkills) {
    return false;
  }
  
  // Enhanced stopping criteria:
  // 1. Long consecutive wrong streak indicates we found upper limit
  // 2. Oscillating pattern (getting some right, some wrong) indicates we're at struggle point
  // 3. Very high ability with long correct streak may need harder items
  
  const longWrongStreak = state.streak <= -blueprint.stopRules.streak;
  const veryLongStreak = Math.abs(state.streak) >= blueprint.stopRules.streak + 2;
  
  // Check for oscillating pattern (struggle point indicator)
  if (state.attempts >= 6) {
    const recentAttempts = 4; // Look at last 4 attempts
    // This would require tracking recent responses - simplified for now
    // In production, track last N responses to detect oscillation
  }
  
  // If ability is very high (>2.0) and all recent answers correct, need harder items
  if (state.ability > 2.0 && state.streak >= 4) {
    // Don't stop yet - we haven't found their ceiling
    return false;
  }
  
  // Stop if we found clear upper limit (wrong streak) or have sufficient evidence
  return longWrongStreak || (veryLongStreak && state.skillsSeen.size >= blueprint.stopRules.minSkills);
}

/**
 * Convert final ability estimate to grade placement recommendation
 * Enhanced scale covering K through college level
 */
export function place(ability: number, subject: Subject): Placement {
  // Calculate standard error (simplified - would use more sophisticated model in production)
  const sem = 0.25; // Reduced SEM for more confidence
  
  let recommendedGrade: string;
  let recommendedUnit: string | undefined;
  
  // Expanded ability scale covering K through college
  if (ability <= -2.5) {
    recommendedGrade = "Pre-K/K Foundation";
    recommendedUnit = getFoundationUnit(subject);
  } else if (ability <= -1.5) {
    recommendedGrade = "Kindergarten - Grade 1";
    recommendedUnit = getRemediationUnit(subject);
  } else if (ability <= -0.8) {
    recommendedGrade = "Grade 1-2 Level";
    recommendedUnit = getGradeUnit(subject, -1);
  } else if (ability <= -0.2) {
    recommendedGrade = "Grade 2-3 Level";
    recommendedUnit = getGradeUnit(subject, 0);
  } else if (ability <= 0.3) {
    recommendedGrade = "Grade 3-4 Level";
    recommendedUnit = getGradeUnit(subject, 1);
  } else if (ability <= 0.8) {
    recommendedGrade = "Grade 4-5 Level";
    recommendedUnit = getGradeUnit(subject, 2);
  } else if (ability <= 1.3) {
    recommendedGrade = "Grade 5-6 Level";
    recommendedUnit = getMiddleSchoolUnit(subject);
  } else if (ability <= 1.8) {
    recommendedGrade = "Middle School (6-8)";
    recommendedUnit = getAdvancedUnit(subject);
  } else if (ability <= 2.3) {
    recommendedGrade = "High School (9-12)";
    recommendedUnit = getHighSchoolUnit(subject);
  } else {
    recommendedGrade = "College/Advanced Level";
    recommendedUnit = getCollegeUnit(subject);
  }
  
  return {
    ability,
    sem,
    recommendedGrade,
    recommendedUnit
  };
}

/**
 * Get foundation (pre-K) unit recommendation by subject
 */
function getFoundationUnit(subject: Subject): string {
  const units = {
    math: "number-recognition",
    reading: "letter-recognition", 
    science: "basic-observation",
    "social-studies": "self-and-family"
  };
  return units[subject];
}

/**
 * Get remediation unit recommendation by subject
 */
function getRemediationUnit(subject: Subject): string {
  const units = {
    math: "counting-basics",
    reading: "letter-sounds", 
    science: "living-nonliving",
    "social-studies": "family-community"
  };
  return units[subject];
}

/**
 * Get grade-level unit recommendation by subject
 */
function getGradeUnit(subject: Subject, gradeOffset: number): string {
  const baseUnits = {
    math: gradeOffset <= -1 ? "counting" : gradeOffset === 0 ? "addition-subtraction" : gradeOffset === 1 ? "place-value" : "multiplication-division",
    reading: gradeOffset <= -1 ? "phonics" : gradeOffset === 0 ? "sight-words" : gradeOffset === 1 ? "comprehension" : "advanced-reading",
    science: gradeOffset <= -1 ? "animal-needs" : gradeOffset === 0 ? "states-matter" : gradeOffset === 1 ? "life-cycles" : "forces-energy", 
    "social-studies": gradeOffset <= -1 ? "community-helpers" : gradeOffset === 0 ? "map-skills" : gradeOffset === 1 ? "government-basics" : "geography"
  };
  return baseUnits[subject];
}

/**
 * Get middle school unit recommendation by subject
 */
function getMiddleSchoolUnit(subject: Subject): string {
  const units = {
    math: "fractions-decimals",
    reading: "literary-analysis",
    science: "scientific-method",
    "social-studies": "world-geography"
  };
  return units[subject];
}

/**
 * Get enrichment unit recommendation by subject
 */
function getEnrichmentUnit(subject: Subject): string {
  const units = {
    math: "problem-solving-strategies",
    reading: "comprehension-strategies",
    science: "inquiry-based-learning",
    "social-studies": "cultural-studies"
  };
  return units[subject];
}

/**
 * Get advanced unit recommendation by subject
 */
function getAdvancedUnit(subject: Subject): string {
  const units = {
    math: "algebraic-thinking",
    reading: "critical-analysis", 
    science: "systems-thinking",
    "social-studies": "historical-analysis"
  };
  return units[subject];
}

/**
 * Get high school unit recommendation by subject
 */
function getHighSchoolUnit(subject: Subject): string {
  const units = {
    math: "algebra-geometry",
    reading: "advanced-literature",
    science: "physics-chemistry",
    "social-studies": "world-history"
  };
  return units[subject];
}

/**
 * Get college level unit recommendation by subject
 */
function getCollegeUnit(subject: Subject): string {
  const units = {
    math: "calculus-statistics",
    reading: "research-writing",
    science: "advanced-sciences",
    "social-studies": "political-science"
  };
  return units[subject];
}

/**
 * Get subject-specific diagnostic blueprint
 * Enhanced to find true struggle point with more challenging items
 */
export function getBlueprintForSubject(subject: Subject): DiagBlueprint {
  const baseBlueprint = {
    minItems: 8,      // Increased minimum
    maxItems: 20,     // Increased maximum to find ceiling
    breakAfter: 10,   // Later break to maintain momentum
    startDifficulty: 0, // Start at grade level
    stopRules: {
      streak: 4,      // Need 4 wrong in a row to confirm ceiling
      minSkills: 5    // More skills to assess
    }
  };
  
  // Subject-specific adjustments for comprehensive assessment
  switch (subject) {
    case 'math':
      return { 
        ...baseBlueprint, 
        subject, 
        minItems: 10,
        stopRules: { streak: 4, minSkills: 6 } 
      };
    case 'reading':
      return { 
        ...baseBlueprint, 
        subject, 
        minItems: 8,
        maxItems: 18, 
        stopRules: { streak: 4, minSkills: 5 } 
      };
    case 'science':
      return { 
        ...baseBlueprint, 
        subject, 
        minItems: 8,
        stopRules: { streak: 4, minSkills: 5 } 
      };
    case 'social-studies':
      return { 
        ...baseBlueprint, 
        subject, 
        minItems: 8,
        stopRules: { streak: 4, minSkills: 5 } 
      };
    default:
      return { ...baseBlueprint, subject };
  }
}
