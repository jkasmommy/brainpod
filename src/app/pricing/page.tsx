'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Star, Users, Shield, Clock, BookOpen, Brain, Heart, ChevronDown, ChevronUp } from 'lucide-react';

const familyPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out BrainPod',
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    features: [
      'Access to basic lessons',
      '1 learner profile',
      'Progress tracking',
      'Basic assessments',
      'Community support'
    ],
    limitations: [
      'Limited advanced content',
      'No multi-learner support',
      'Basic analytics only'
    ],
    cta: 'Get Started Free',
    priceIds: {
      monthly: null,
      annual: null
    }
  },
  {
    id: 'essential',
    name: 'Essential',
    description: 'Great for individual learners',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    popular: false,
    features: [
      'Full curriculum access',
      '1 learner profile',
      'Advanced progress tracking',
      'Personalized learning paths',
      'Priority support',
      'Offline content access',
      'Detailed analytics'
    ],
    limitations: [],
    cta: 'Start Essential',
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_PRICE_ESSENTIAL_MONTHLY,
      annual: process.env.NEXT_PUBLIC_PRICE_ESSENTIAL_ANNUAL
    }
  },
  {
    id: 'family',
    name: 'Family',
    description: 'Perfect for families with multiple children',
    monthlyPrice: 19.99,
    annualPrice: 199.99,
    popular: true,
    features: [
      'Everything in Essential',
      'Up to 4 learner profiles',
      'Family dashboard',
      'Parental controls',
      'Cross-learner analytics',
      'Sibling challenges',
      'Family progress reports'
    ],
    limitations: [],
    cta: 'Start Family',
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_PRICE_FAMILY_MONTHLY,
      annual: process.env.NEXT_PUBLIC_PRICE_FAMILY_ANNUAL
    }
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'For larger families or tutoring',
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    popular: false,
    features: [
      'Everything in Family',
      'Up to 6 learner profiles',
      'Advanced tutoring tools',
      'Custom learning paths',
      'White-label options',
      'API access',
      'Dedicated support'
    ],
    limitations: [],
    cta: 'Start Plus',
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_PRICE_PLUS_MONTHLY,
      annual: process.env.NEXT_PUBLIC_PRICE_PLUS_ANNUAL
    }
  }
];

const schoolPlans = [
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Individual classroom solution',
    price: 'Contact us',
    features: [
      'Classroom management',
      'Up to 30 students',
      'Teacher dashboard',
      'Assignment creation',
      'Grade book integration',
      'Parent communication tools',
      'Professional development'
    ],
    cta: 'Request Demo'
  },
  {
    id: 'school',
    name: 'School & District',
    description: 'Comprehensive institutional solution',
    price: 'Contact us',
    features: [
      'Everything in Teacher',
      'Unlimited students',
      'Admin dashboard',
      'Multi-school management',
      'Advanced analytics',
      'Custom integration',
      'Training & support',
      'Compliance tools'
    ],
    cta: 'Request Demo'
  }
];

const benefits = [
  {
    icon: Brain,
    title: 'Adaptive Learning',
    description: 'AI-powered personalization that adapts to each learner\'s pace and style'
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'COPPA compliant with industry-leading privacy and security measures'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Learn anytime, anywhere with offline access and progress sync'
  },
  {
    icon: BookOpen,
    title: 'Standards Aligned',
    description: 'Curriculum aligned with Common Core, NGSS, and state standards'
  },
  {
    icon: Users,
    title: 'Family Focused',
    description: 'Designed for families with tools for parents and multi-learner support'
  },
  {
    icon: Heart,
    title: 'Mindful Learning',
    description: 'Built-in mindfulness breaks and emotional learning support'
  }
];

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'All paid plans come with a 14-day free trial. No credit card required to start. You can cancel anytime during the trial period without being charged.'
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle, and we\'ll prorate any differences.'
  },
  {
    question: 'What ages does BrainPod support?',
    answer: 'BrainPod is designed for learners ages 5-18, covering kindergarten through high school with adaptive content for each level.'
  },
  {
    question: 'How many devices can I use?',
    answer: 'All plans allow unlimited device access. Each learner can use any device (tablet, computer, phone) with their profile.'
  },
  {
    question: 'Is there a discount for annual billing?',
    answer: 'Yes! Annual plans save you approximately 3 months compared to monthly billing - that\'s a 25% savings.'
  },
  {
    question: 'What if I need more learner profiles?',
    answer: 'For families needing more than 6 profiles, contact us for custom pricing. Schools and districts have unlimited learner access.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your account settings or by contacting support. Your access continues until the end of your billing period.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee if you\'re not completely satisfied with BrainPod.'
  }
];

export default function PricingPage() {
  const [selectedTab, setSelectedTab] = useState<'families' | 'schools'>('families');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string | undefined, planName: string) => {
    if (!priceId) {
      alert('Price ID not configured. Please check environment variables.');
      return;
    }

    setLoading(planName);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getAnnualSavings = (monthly: number, annual: number) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - annual;
    const monthsSaved = Math.round(savings / monthly);
    return monthsSaved;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Choose Your Learning Journey
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Unlock personalized, adaptive learning for every member of your family or classroom. 
              Start with our free plan or choose the perfect fit for your needs.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => setSelectedTab('families')}
                className={`px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedTab === 'families'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'
                }`}
              >
                Families
              </button>
              <button
                onClick={() => setSelectedTab('schools')}
                className={`px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedTab === 'schools'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'
                }`}
              >
                Schools
              </button>
            </div>
          </div>

          {/* Family Plans */}
          {selectedTab === 'families' && (
            <>
              {/* Billing Toggle */}
              <div className="flex justify-center mb-12">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      billingPeriod === 'monthly'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('annual')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      billingPeriod === 'annual'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Annual
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Save 25%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {familyPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl ${
                      plan.popular 
                        ? 'ring-2 ring-blue-500 shadow-blue-500/25' 
                        : 'border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {plan.description}
                      </p>
                      <div className="mb-4">
                        {plan.monthlyPrice === 0 ? (
                          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                            Free
                          </span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                              ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-1">
                              /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                            </span>
                            {billingPeriod === 'annual' && plan.monthlyPrice > 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                ~{getAnnualSavings(plan.monthlyPrice, plan.annualPrice)} months free
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start">
                          <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-400">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (plan.id === 'free') {
                          window.location.href = '/dashboard';
                        } else {
                          const priceId = billingPeriod === 'monthly' 
                            ? plan.priceIds.monthly 
                            : plan.priceIds.annual;
                          handleCheckout(priceId, plan.name);
                        }
                      }}
                      disabled={loading === plan.name}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        plan.popular
                          ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
                          : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white focus:ring-gray-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading === plan.name ? 'Loading...' : plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* School Plans */}
          {selectedTab === 'schools' && (
            <>
              {/* Pilot Banner */}
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white text-center mb-12">
                <h3 className="text-2xl font-bold mb-2">🚀 Pilot Program Available</h3>
                <p className="text-green-100 mb-4">
                  Join our exclusive pilot program and get early access to BrainPod for Schools 
                  with special pricing and dedicated support.
                </p>
                <Link
                  href="/contact?subject=School Pilot Program"
                  className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-500"
                >
                  Join Pilot Program
                </Link>
              </div>

              {/* School Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {schoolPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {plan.description}
                      </p>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {plan.price}
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/contact?subject=School Demo Request"
                      className="w-full inline-flex items-center justify-center py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">
              Why Choose BrainPod?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm"
                >
                  <benefit.icon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-xl"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
