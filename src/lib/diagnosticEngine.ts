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
    
    return items.filter((item: any): item is DiagItem => {
      return (
        typeof item.id === 'string' &&
        item.subject === subject &&
        typeof item.skill === 'string' &&
        typeof item.difficulty === 'number' &&
        typeof item.prompt === 'string' &&
        typeof item.answer === 'string'
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
 * Update ability estimate using simple 1-PL model
 * More sophisticated than fixed increments - considers item difficulty
 */
export function updateAbility(
  state: DiagState, 
  correct: boolean, 
  item: DiagItem
): void {
  // Simple 1-PL update with item difficulty consideration
  const baseDelta = 0.35;
  
  // Consider how "surprising" this response was
  const expectedP = 1 / (1 + Math.exp(-(state.ability - item.difficulty)));
  const surprise = correct ? (1 - expectedP) : expectedP;
  
  // Adjust ability based on response and surprise
  const delta = baseDelta * (correct ? 1 : -1) * (0.5 + surprise);
  
  state.ability += delta;
  
  // Clamp ability to reasonable range
  state.ability = Math.max(-2, Math.min(2, state.ability));
  
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
 * Determine if diagnostic should stop based on blueprint rules
 */
export function shouldStop(
  state: DiagState, 
  blueprint: DiagBlueprint
): boolean {
  // Hard stop at max items
  if (state.attempts >= blueprint.maxItems) {
    return true;
  }
  
  // Must have minimum items
  if (state.attempts < blueprint.minItems) {
    return false;
  }
  
  // Stop if we have strong evidence (long streak) and sufficient coverage
  const hasLongStreak = Math.abs(state.streak) >= blueprint.stopRules.streak;
  const hasSufficientSkills = state.skillsSeen.size >= blueprint.stopRules.minSkills;
  
  return hasLongStreak && hasSufficientSkills;
}

/**
 * Convert final ability estimate to grade placement recommendation
 */
export function place(ability: number, subject: Subject): Placement {
  // Calculate standard error (simplified - would use more sophisticated model in production)
  const sem = 0.3; // Fixed for simplicity
  
  let recommendedGrade: string;
  let recommendedUnit: string | undefined;
  
  if (ability <= -1.0) {
    recommendedGrade = "Grade K/1 (remediate)";
    recommendedUnit = getRemediationUnit(subject);
  } else if (ability <= -0.3) {
    recommendedGrade = "On Grade -1";
    recommendedUnit = getGradeUnit(subject, -1);
  } else if (ability <= 0.3) {
    recommendedGrade = "On Grade";
    recommendedUnit = getGradeUnit(subject, 0);
  } else if (ability <= 0.8) {
    recommendedGrade = "On Grade + enrichment";
    recommendedUnit = getEnrichmentUnit(subject);
  } else {
    recommendedGrade = "Accelerate +1";
    recommendedUnit = getAdvancedUnit(subject);
  }
  
  return {
    ability,
    sem,
    recommendedGrade,
    recommendedUnit
  };
}

/**
 * Get remediation unit recommendation by subject
 */
function getRemediationUnit(subject: Subject): string {
  const units = {
    math: "number-recognition",
    reading: "letter-sounds", 
    science: "observation-skills",
    "social-studies": "community-helpers"
  };
  return units[subject];
}

/**
 * Get grade-level unit recommendation by subject
 */
function getGradeUnit(subject: Subject, gradeOffset: number): string {
  const baseUnits = {
    math: gradeOffset < 0 ? "counting" : "place-value",
    reading: gradeOffset < 0 ? "phonics" : "sight-words",
    science: gradeOffset < 0 ? "living-nonliving" : "life-cycles", 
    "social-studies": gradeOffset < 0 ? "family" : "community"
  };
  return baseUnits[subject];
}

/**
 * Get enrichment unit recommendation by subject
 */
function getEnrichmentUnit(subject: Subject): string {
  const units = {
    math: "problem-solving",
    reading: "comprehension-strategies",
    science: "scientific-method",
    "social-studies": "geography-basics"
  };
  return units[subject];
}

/**
 * Get advanced unit recommendation by subject
 */
function getAdvancedUnit(subject: Subject): string {
  const units = {
    math: "advanced-operations",
    reading: "advanced-comprehension", 
    science: "systems-thinking",
    "social-studies": "historical-thinking"
  };
  return units[subject];
}

/**
 * Get subject-specific diagnostic blueprint
 */
export function getBlueprintForSubject(subject: Subject): DiagBlueprint {
  const baseBlueprint = {
    minItems: 6,
    maxItems: 15,
    breakAfter: 8,
    startDifficulty: 0,
    stopRules: {
      streak: 4,
      minSkills: 3
    }
  };
  
  // Subject-specific adjustments
  switch (subject) {
    case 'math':
      return { ...baseBlueprint, subject, stopRules: { streak: 3, minSkills: 4 } };
    case 'reading':
      return { ...baseBlueprint, subject, maxItems: 12, stopRules: { streak: 4, minSkills: 3 } };
    case 'science':
      return { ...baseBlueprint, subject, minItems: 5, stopRules: { streak: 3, minSkills: 3 } };
    case 'social-studies':
      return { ...baseBlueprint, subject, minItems: 5, stopRules: { streak: 3, minSkills: 3 } };
    default:
      return { ...baseBlueprint, subject };
  }
}
