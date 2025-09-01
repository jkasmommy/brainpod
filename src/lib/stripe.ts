import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe only if secret key is available
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    })
  : null;

export const getStripeCustomerByEmail = async (email: string) => {
  if (!stripe) throw new Error('Stripe not configured');
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });
  
  return customers.data[0] || null;
};

export const createStripeCustomer = async (email: string, name?: string) => {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.customers.create({
    email,
    name,
  });
};

export const getSubscriptionsByCustomer = async (customerId: string) => {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });
};

// Helper function to map Stripe price IDs to plan information
export const getPlanFromPriceId = (priceId: string) => {
  const priceMap: Record<string, { plan: string; seats: number; billing: 'monthly' | 'annual' }> = {
    [process.env.NEXT_PUBLIC_PRICE_ESSENTIAL_MONTHLY || '']: { plan: 'essential', seats: 1, billing: 'monthly' },
    [process.env.NEXT_PUBLIC_PRICE_ESSENTIAL_ANNUAL || '']: { plan: 'essential', seats: 1, billing: 'annual' },
    [process.env.NEXT_PUBLIC_PRICE_FAMILY_MONTHLY || '']: { plan: 'family', seats: 4, billing: 'monthly' },
    [process.env.NEXT_PUBLIC_PRICE_FAMILY_ANNUAL || '']: { plan: 'family', seats: 4, billing: 'annual' },
    [process.env.NEXT_PUBLIC_PRICE_PLUS_MONTHLY || '']: { plan: 'plus', seats: 6, billing: 'monthly' },
    [process.env.NEXT_PUBLIC_PRICE_PLUS_ANNUAL || '']: { plan: 'plus', seats: 6, billing: 'annual' },
  };

  return priceMap[priceId] || { plan: 'free', seats: 1, billing: 'monthly' };
};
