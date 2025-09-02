/**
 * BrainPod Feature Flags
 * 
 * Centralized feature flag management for gradual rollouts and A/B testing.
 * Used to toggle between static content (JSON) and database content.
 */

export interface FeatureFlags {
  contentFromDB: boolean;
  schoolAdmin: boolean;
  advancedAnalytics: boolean;
  debugMode: boolean;
}

/**
 * Get feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    // Toggle between static manifest.json and database content
    contentFromDB: process.env.NEXT_PUBLIC_FEATURE_CONTENT_DB === '1',
    
    // Enable school administration features
    schoolAdmin: process.env.NEXT_PUBLIC_FEATURE_SCHOOL_ADMIN === '1',
    
    // Enable advanced analytics and insights
    advancedAnalytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === '1',
    
    // Enable debug mode (additional logging, test data, etc.)
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === '1'
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Get feature flag for content source (for use in components)
 */
export function useContentFromDB(): boolean {
  return isFeatureEnabled('contentFromDB');
}

/**
 * Get all feature flags (for debugging)
 */
export function getAllFeatureFlags(): FeatureFlags {
  return getFeatureFlags();
}

/**
 * Feature flag defaults (when env vars are not set)
 */
export const DEFAULT_FLAGS: FeatureFlags = {
  contentFromDB: false,
  schoolAdmin: false,
  advancedAnalytics: false,
  debugMode: false
};

/**
 * Validate feature flag environment variables
 */
export function validateFeatureFlags(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const contentDB = process.env.NEXT_PUBLIC_FEATURE_CONTENT_DB;
  if (contentDB && !['0', '1'].includes(contentDB)) {
    errors.push('NEXT_PUBLIC_FEATURE_CONTENT_DB must be "0" or "1"');
  }
  
  const schoolAdmin = process.env.NEXT_PUBLIC_FEATURE_SCHOOL_ADMIN;
  if (schoolAdmin && !['0', '1'].includes(schoolAdmin)) {
    errors.push('NEXT_PUBLIC_FEATURE_SCHOOL_ADMIN must be "0" or "1"');
  }
  
  const analytics = process.env.NEXT_PUBLIC_FEATURE_ANALYTICS;
  if (analytics && !['0', '1'].includes(analytics)) {
    errors.push('NEXT_PUBLIC_FEATURE_ANALYTICS must be "0" or "1"');
  }
  
  const debug = process.env.NEXT_PUBLIC_DEBUG_MODE;
  if (debug && !['0', '1'].includes(debug)) {
    errors.push('NEXT_PUBLIC_DEBUG_MODE must be "0" or "1"');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
