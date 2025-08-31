# BrainPod Environment Configuration

This document outlines the environment variables needed to run BrainPod with Stripe integration.

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (Test Mode)
# Family Plans (Monthly/Annual)
STRIPE_PRICE_FAMILY_ESSENTIAL_MONTHLY=price_...
STRIPE_PRICE_FAMILY_ESSENTIAL_ANNUAL=price_...
STRIPE_PRICE_FAMILY_PLUS_MONTHLY=price_...
STRIPE_PRICE_FAMILY_PLUS_ANNUAL=price_...

# School Plans (Monthly/Annual)  
STRIPE_PRICE_SCHOOL_ESSENTIAL_MONTHLY=price_...
STRIPE_PRICE_SCHOOL_ESSENTIAL_ANNUAL=price_...
STRIPE_PRICE_SCHOOL_PLUS_MONTHLY=price_...
STRIPE_PRICE_SCHOOL_PLUS_ANNUAL=price_...

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setting Up Stripe

### 1. Create Stripe Account
1. Go to https://stripe.com and create an account
2. Activate your account and navigate to the Dashboard

### 2. Get API Keys
1. In Stripe Dashboard, go to Developers > API Keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Reveal and copy your **Secret key** (starts with `sk_test_`)

### 3. Create Products and Prices

#### Family Plans
Create the following products in Stripe Dashboard > Products:

**BrainPod Family Essential**
- Price: $9.99/month or $99.99/year
- Billing: Recurring
- Currency: USD

**BrainPod Family Plus**  
- Price: $19.99/month or $199.99/year
- Billing: Recurring
- Currency: USD

#### School Plans
**BrainPod School Essential**
- Price: $4.99/month or $49.99/year per seat
- Billing: Recurring
- Currency: USD

**BrainPod School Plus**
- Price: $9.99/month or $99.99/year per seat  
- Billing: Recurring
- Currency: USD

### 4. Copy Price IDs
After creating each price, copy the Price ID (starts with `price_`) and add to your `.env.local` file.

### 5. Set Up Webhooks
1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. URL: `http://localhost:3000/api/stripe/webhook` (for local development)
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`  
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)

## Testing the Integration

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Stripe Integration
1. Navigate to `/pricing`
2. Click "Get Started" on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Complete checkout

### 3. Test Webhook (Local Development)
Install Stripe CLI for local webhook testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Production Deployment

### Vercel Environment Variables
When deploying to Vercel, add these environment variables in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to Environment Variables
3. Add all variables from your `.env.local` file
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Update webhook endpoint URL in Stripe Dashboard to your production URL

### Production Stripe Setup
1. Switch to Live mode in Stripe Dashboard
2. Create production versions of all products/prices
3. Update environment variables with live API keys and price IDs
4. Update webhook endpoint to production URL

## Security Notes

- Never commit `.env.local` to version control
- Keep secret keys secure and rotate them regularly
- Use different keys for development and production
- Validate webhooks using the signing secret
- Always verify payments server-side before granting access

## Support

For issues with Stripe integration:
1. Check Stripe Dashboard > Logs for API errors
2. Review webhook delivery attempts
3. Test with Stripe CLI for local development
4. Consult Stripe documentation: https://stripe.com/docs
