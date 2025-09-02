/**
 * BrainPod Enhanced Diagnostic Engine
 * 
 * Loads diagnostic items from either static JSON files or Supabase database
 * based on NEXT_PUBLIC_FEATURE_CONTENT_DB feature flag.
 * 
 * This enhances the existing diagnosticEngine.ts with database support.
 */

import { createClient } from '@supabase/supabase-js';
import { isFeatureEnabled } from './flags';
import { DiagItem, DiagState, DiagBlueprint, Subject } from './diagTypes';

// ============================================================================
// DIAGNOSTIC BANK LOADING
// ============================================================================

/**
 * Load diagnostic item bank for a subject with feature flag support
 */
export async function loadDiagBank(subject: Subject): Promise<DiagItem[]> {
  if (isFeatureEnabled('contentFromDB')) {
    return await loadDiagBankFromDB(subject);
  } else {
    return await loadDiagBankFromJSON(subject);
  }
}

/**
 * Load diagnostic bank from Supabase database
 */
async function loadDiagBankFromDB(subject: Subject): Promise<DiagItem[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get diagnostic items for the subject
    const { data: items, error } = await supabase
      .from('content_diagnostic_items')
      .select(`
        *,
        content_diagnostic_forms!inner (
          subject_id,
          label,
          meta
        )
      `)
      .eq('content_diagnostic_forms.subject_id', subject)
      .order('order_index');

    if (error) {
      console.error(`Failed to load ${subject} diagnostic bank from DB:`, error);
      // Fallback to JSON if database fails
      return await loadDiagBankFromJSON(subject);
    }

    if (!items || items.length === 0) {
      console.warn(`No diagnostic items found for ${subject} in database`);
      // Fallback to JSON if no items in database
      return await loadDiagBankFromJSON(subject);
    }

    // Transform database items to DiagItem format
    const diagItems: DiagItem[] = items
      .map(dbItem => {
        try {
          const item = dbItem.item;
          
          // Validate required fields
          if (!item.id || !item.subject || !item.skill || 
              typeof item.difficulty !== 'number' || !item.prompt || !item.answer) {
            console.warn('Invalid diagnostic item structure:', item);
            return null;
          }

          return {
            id: item.id,
            subject: item.subject as Subject,
            skill: item.skill,
            gradeHint: item.gradeHint || 'K-2', // Default grade hint
            difficulty: item.difficulty,
            type: item.type || 'mcq',
            prompt: item.prompt,
            choices: item.choices || [],
            answer: item.answer
          } as DiagItem;
        } catch (error) {
          console.warn('Error processing diagnostic item:', error);
          return null;
        }
      })
      .filter((item): item is DiagItem => item !== null);

    console.log(`✅ Loaded ${diagItems.length} diagnostic items for ${subject} from database`);
    return diagItems;

  } catch (error) {
    console.error(`Error loading ${subject} diagnostic bank from database:`, error);
    // Fallback to JSON on any error
    return await loadDiagBankFromJSON(subject);
  }
}

/**
 * Load diagnostic bank from static JSON file (legacy)
 */
async function loadDiagBankFromJSON(subject: Subject): Promise<DiagItem[]> {
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
    
    const validItems = items.filter((item: unknown): item is DiagItem => {
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

    console.log(`✅ Loaded ${validItems.length} diagnostic items for ${subject} from JSON`);
    return validItems;

  } catch (error) {
    console.error(`Error loading ${subject} diagnostic bank from JSON:`, error);
    // Return empty array rather than throwing to prevent app crash
    return [];
  }
}

// ============================================================================
// DIAGNOSTIC METADATA LOADING
// ============================================================================

/**
 * Get diagnostic form metadata (configuration)
 */
export async function getDiagnosticConfig(subject: Subject): Promise<DiagBlueprint | null> {
  if (isFeatureEnabled('contentFromDB')) {
    return await getDiagnosticConfigFromDB(subject);
  } else {
    return getDiagnosticConfigDefault(subject);
  }
}

/**
 * Load diagnostic configuration from database
 */
async function getDiagnosticConfigFromDB(subject: Subject): Promise<DiagBlueprint | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return getDiagnosticConfigDefault(subject);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: form, error } = await supabase
      .from('content_diagnostic_forms')
      .select('*')
      .eq('subject_id', subject)
      .single();

    if (error || !form) {
      console.warn(`No diagnostic form config found for ${subject}, using defaults`);
      return getDiagnosticConfigDefault(subject);
    }

    const meta = form.meta || {};
    
    return {
      subject,
      minItems: meta.min_items || 5,
      maxItems: meta.max_items || 20,
      breakAfter: meta.break_after || 10,
      startDifficulty: meta.start_difficulty || 0,
      stopRules: {
        streak: meta.stop_streak || 4,
        minSkills: meta.min_skills || 3
      }
    };

  } catch (error) {
    console.error(`Error loading diagnostic config for ${subject}:`, error);
    return getDiagnosticConfigDefault(subject);
  }
}

/**
 * Get default diagnostic configuration
 */
function getDiagnosticConfigDefault(subject: Subject): DiagBlueprint {
  const configs = {
    math: {
      minItems: 8,
      maxItems: 25,
      breakAfter: 12,
      description: 'Adaptive mathematics diagnostic to determine your current skill level'
    },
    reading: {
      minItems: 6,
      maxItems: 20,
      breakAfter: 10,
      description: 'Reading comprehension and phonics diagnostic assessment'
    },
    science: {
      minItems: 5,
      maxItems: 18,
      breakAfter: 9,
      description: 'Science concepts and inquiry skills diagnostic'
    },
    'social-studies': {
      minItems: 5,
      maxItems: 15,
      breakAfter: 8,
      description: 'Social studies knowledge and reasoning diagnostic'
    }
  };

  const config = configs[subject] || configs.math;
  
  return {
    subject,
    minItems: config.minItems,
    maxItems: config.maxItems,
    breakAfter: config.breakAfter,
    startDifficulty: 0,
    stopRules: {
      streak: 4,
      minSkills: 3
    }
  };
}

// ============================================================================
// DIAGNOSTIC RESULTS STORAGE
// ============================================================================

/**
 * Save diagnostic results to database
 */
export async function saveDiagnosticResults(
  userId: string,
  subject: Subject,
  responses: Array<{
    itemId: string;
    response: string;
    correct: boolean;
    timeMs?: number;
  }>,
  finalAbility: number,
  finalSE: number,
  placement: any
): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Cannot save diagnostic results - missing Supabase config');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save overall diagnostic result
    const { data: result, error: resultError } = await supabase
      .from('diagnostic_results')
      .insert({
        user_id: userId,
        subject,
        score: Math.round((finalAbility + 2) * 25), // Convert to 0-100 scale
        ability_estimate: finalAbility,
        standard_error: finalSE,
        total_items: responses.length,
        correct_items: responses.filter(r => r.correct).length,
        placement_data: placement,
        completed_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (resultError) {
      console.error('Error saving diagnostic result:', resultError);
      return;
    }

    // Save individual responses
    const responseRecords = responses.map(response => ({
      diagnostic_result_id: result.id,
      item_id: response.itemId,
      response: response.response,
      correct: response.correct,
      response_time_ms: response.timeMs
    }));

    const { error: responsesError } = await supabase
      .from('diagnostic_responses')
      .insert(responseRecords);

    if (responsesError) {
      console.error('Error saving diagnostic responses:', responsesError);
    } else {
      console.log(`✅ Saved diagnostic results for ${subject}: ${responses.length} responses`);
    }

  } catch (error) {
    console.error('Error saving diagnostic results:', error);
  }
}

/**
 * Get user's diagnostic history for a subject
 */
export async function getDiagnosticHistory(
  userId: string,
  subject?: Subject
): Promise<any[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('diagnostic_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading diagnostic history:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Error loading diagnostic history:', error);
    return [];
  }
}

// ============================================================================
// RE-EXPORT EXISTING DIAGNOSTIC ENGINE FUNCTIONS
// ============================================================================

// Import and re-export the core diagnostic functions from the original engine
export {
  nextItem,
  score,
  updateAbility
} from './diagnosticEngine';

// Re-export types
export type { DiagItem, DiagState, DiagBlueprint, Subject } from './diagTypes';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if diagnostic database is ready
 */
export async function isDiagnosticDBReady(): Promise<boolean> {
  if (!isFeatureEnabled('contentFromDB')) {
    return false;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('content_diagnostic_forms')
      .select('id')
      .limit(1);

    return !error && data && data.length > 0;
  } catch (error) {
    console.error('Error checking diagnostic database:', error);
    return false;
  }
}

/**
 * Get diagnostic system status
 */
export async function getDiagnosticStatus() {
  const contentFromDB = isFeatureEnabled('contentFromDB');
  
  return {
    contentFromDB,
    source: contentFromDB ? 'database' : 'json',
    dbReady: contentFromDB ? await isDiagnosticDBReady() : null
  };
}
