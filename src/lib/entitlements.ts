/**
 * Entitlements system for BrainPod
 * Controls feature access based on user subscription
 */

export interface Subscription {
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan: 'free' | 'essential' | 'family' | 'plus';
  status: string;
  current_period_end: Date;
  quantity: number;
  seats_allowed: number;
  user_id?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent' | 'teacher';
}

// Feature flags for different plan tiers
const PLAN_FEATURES = {
  free: {
    multi_learner: false,
    advanced_analytics: false,
    offline_access: false,
    priority_support: false,
    custom_learning_paths: false,
    api_access: false,
    white_label: false,
    max_seats: 1,
    subjects: ['math', 'reading'], // Limited subjects
  },
  essential: {
    multi_learner: false,
    advanced_analytics: true,
    offline_access: true,
    priority_support: true,
    custom_learning_paths: true,
    api_access: false,
    white_label: false,
    max_seats: 1,
    subjects: ['math', 'reading', 'science', 'social-studies'], // All subjects
  },
  family: {
    multi_learner: true,
    advanced_analytics: true,
    offline_access: true,
    priority_support: true,
    custom_learning_paths: true,
    api_access: false,
    white_label: false,
    max_seats: 4,
    subjects: ['math', 'reading', 'science', 'social-studies'],
  },
  plus: {
    multi_learner: true,
    advanced_analytics: true,
    offline_access: true,
    priority_support: true,
    custom_learning_paths: true,
    api_access: true,
    white_label: true,
    max_seats: 6,
    subjects: ['math', 'reading', 'science', 'social-studies'],
  },
};

/**
 * Get user's current subscription
 */
export function getUserSubscription(user: User): Subscription | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const subscriptions = JSON.parse(
      localStorage.getItem('bp_subscriptions') || '[]'
    ) as Subscription[];
    
    // Find active subscription for user
    const activeSubscription = subscriptions.find(
      sub => sub.user_id === user.id && 
             sub.status === 'active' && 
             new Date(sub.current_period_end) > new Date()
    );
    
    return activeSubscription || null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Get user's plan tier (defaults to 'free' if no active subscription)
 */
export function getUserPlan(user: User): 'free' | 'essential' | 'family' | 'plus' {
  const subscription = getUserSubscription(user);
  return subscription?.plan || 'free';
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeature(user: User, feature: keyof typeof PLAN_FEATURES.free): boolean {
  const plan = getUserPlan(user);
  return PLAN_FEATURES[plan][feature] as boolean;
}

/**
 * Get maximum number of seats/learners allowed for user
 */
export function maxSeats(user: User): number {
  const plan = getUserPlan(user);
  return PLAN_FEATURES[plan].max_seats;
}

/**
 * Check if user can access a specific subject
 */
export function canAccess(user: User, subject: string): boolean {
  const plan = getUserPlan(user);
  return PLAN_FEATURES[plan].subjects.includes(subject);
}

/**
 * Get all features available to user
 */
export function getUserFeatures(user: User) {
  const plan = getUserPlan(user);
  return PLAN_FEATURES[plan];
}

/**
 * Check if user can create additional learner profiles
 */
export function canCreateLearner(user: User): boolean {
  if (!hasFeature(user, 'multi_learner')) return false;
  
  // Get current number of learners
  const currentLearners = getCurrentLearnerCount(user);
  const maxAllowed = maxSeats(user);
  
  return currentLearners < maxAllowed;
}

/**
 * Get current number of learner profiles for user
 */
export function getCurrentLearnerCount(user: User): number {
  if (typeof window === 'undefined') return 1;
  
  try {
    // Count learner profiles (you may need to adapt this based on your data structure)
    const profiles = JSON.parse(
      localStorage.getItem(`bp_learner_profiles_${user.id}`) || '[]'
    );
    return Math.max(1, profiles.length); // At least 1 (the user themselves)
  } catch (error) {
    console.error('Error getting learner count:', error);
    return 1;
  }
}

/**
 * Check if user has an active subscription
 */
export function hasActiveSubscription(user: User): boolean {
  const subscription = getUserSubscription(user);
  return subscription !== null;
}

/**
 * Get subscription status for display
 */
export function getSubscriptionStatus(user: User): {
  plan: string;
  status: string;
  renewsAt?: Date;
  seatsUsed: number;
  seatsAllowed: number;
} {
  const subscription = getUserSubscription(user);
  const plan = getUserPlan(user);
  const seatsUsed = getCurrentLearnerCount(user);
  const seatsAllowed = maxSeats(user);
  
  if (!subscription) {
    return {
      plan: 'Free',
      status: 'active',
      seatsUsed,
      seatsAllowed,
    };
  }
  
  return {
    plan: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
    status: subscription.status,
    renewsAt: new Date(subscription.current_period_end),
    seatsUsed,
    seatsAllowed,
  };
}

/**
 * Create a test subscription for development
 */
export function createTestSubscription(user: User, plan: 'essential' | 'family' | 'plus'): void {
  if (typeof window === 'undefined') return;
  
  const testSubscription: Subscription = {
    stripe_subscription_id: `test_sub_${Date.now()}`,
    stripe_customer_id: `test_cus_${user.id}`,
    plan,
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    quantity: 1,
    seats_allowed: PLAN_FEATURES[plan].max_seats,
    user_id: user.id,
  };
  
  const existingSubscriptions = JSON.parse(
    localStorage.getItem('bp_subscriptions') || '[]'
  );
  
  // Remove any existing subscriptions for this user
  const filteredSubscriptions = existingSubscriptions.filter(
    (sub: Subscription) => sub.user_id !== user.id
  );
  
  filteredSubscriptions.push(testSubscription);
  localStorage.setItem('bp_subscriptions', JSON.stringify(filteredSubscriptions));
  
  console.log(`Created test ${plan} subscription for user ${user.id}`);
}
