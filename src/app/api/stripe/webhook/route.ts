import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanFromPriceId } from '@/lib/stripe';
import Stripe from 'stripe';

// This is your Stripe CLI webhook secret or your live webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe!.subscriptions.retrieve(
      session.subscription as string,
      { expand: ['items.data.price'] }
    );
    
    await upsertSubscription(subscription, session.metadata?.userId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  await upsertSubscription(subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // In a real app, you would update your database to mark the subscription as cancelled
  // For now, we'll just log it
  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: 'cancelled',
    current_period_end: new Date((subscription as any).current_period_end * 1000),
  };
  
  console.log('Would update subscription to cancelled:', subscriptionData);
}

async function upsertSubscription(subscription: Stripe.Subscription, userId?: string) {
  const priceId = subscription.items.data[0]?.price.id;
  const planInfo = getPlanFromPriceId(priceId || '');
  
  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan: planInfo.plan,
    status: subscription.status,
    current_period_end: new Date((subscription as any).current_period_end * 1000),
    quantity: subscription.items.data[0]?.quantity || 1,
    seats_allowed: planInfo.seats,
    user_id: userId,
  };
  
  // In a real app with a database, you would upsert the subscription here
  // For now, we'll store it in localStorage (demo purposes only)
  console.log('Would upsert subscription:', subscriptionData);
  
  // Demo: Store in localStorage (client-side storage simulation)
  if (typeof window !== 'undefined') {
    const existingSubscriptions = JSON.parse(
      localStorage.getItem('bp_subscriptions') || '[]'
    );
    
    const existingIndex = existingSubscriptions.findIndex(
      (sub: any) => sub.stripe_subscription_id === subscription.id
    );
    
    if (existingIndex >= 0) {
      existingSubscriptions[existingIndex] = subscriptionData;
    } else {
      existingSubscriptions.push(subscriptionData);
    }
    
    localStorage.setItem('bp_subscriptions', JSON.stringify(existingSubscriptions));
  }
}
