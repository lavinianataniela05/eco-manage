'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Star,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  Sparkles,
  Gift,
  Users,
  Target
} from 'lucide-react';

const SUBSCRIPTION_PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for getting started with recycling',
    icon: <Users className="w-6 h-6" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    features: [
      'Basic recycling tracking',
      'Community access',
      'Monthly progress reports',
      'Standard support'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: 'Rp 49.000',
    period: '/month',
    description: 'Best for eco-conscious individuals',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-teal-500',
    bgColor: 'bg-teal-100',
    features: [
      'Advanced recycling analytics',
      'Priority pickup scheduling',
      'Carbon footprint tracking',
      'Exclusive eco-rewards',
      'Priority support',
      'Personalized tips'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Rp 149.000',
    period: '/month',
    description: 'For businesses & communities',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    features: [
      'Everything in Pro',
      'Multi-user management',
      'Custom reporting',
      'API access',
      'Dedicated account manager',
      'Custom sustainability goals',
      'White-label solutions'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const BENEFITS = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Secure & Reliable',
    description: 'Your data is protected with enterprise-grade security'
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Flexible Billing',
    description: 'Cancel anytime with no long-term commitment'
  },
  {
    icon: <Gift className="w-8 h-8" />,
    title: 'Eco Rewards',
    description: 'Earn points and rewards for your sustainable actions'
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Impact Tracking',
    description: 'Monitor your environmental impact in real-time'
  }
];

type PlanCardProps = {
  plan: typeof SUBSCRIPTION_PLANS[0];
  onSelect: (plan: string) => void;
};

const PlanCard = ({ plan, onSelect }: PlanCardProps) => (
  <div className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${
    plan.popular ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-100'
  }`}>
    {plan.popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
          <Star className="w-4 h-4 fill-current" />
          <span>MOST POPULAR</span>
        </div>
      </div>
    )}
    
    <div className="text-center mb-6">
      <div className={`p-3 rounded-full ${plan.bgColor} ${plan.color} mb-4 mx-auto w-fit`}>
        {plan.icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
      <div className="flex items-baseline justify-center mb-2">
        <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
        {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
      </div>
      <p className="text-gray-600">{plan.description}</p>
    </div>
    
    <ul className="space-y-4 mb-8">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
          <span className="text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
    
    <button
      onClick={() => onSelect(plan.name)}
      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
        plan.popular 
          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-lg hover:shadow-xl' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } group-hover:shadow-lg`}
    >
      {plan.cta}
    </button>
  </div>
);

export default function Subscription() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    // Navigate to checkout or show modal
    router.push('/checkout?plan=' + plan.toLowerCase());
  };

  const handleLearnMore = () => {
    document.getElementById('benefits-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 bg-teal-200 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-emerald-200 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative p-6 bg-white/10 rounded-full backdrop-blur-lg border border-white/20 inline-block">
              <Crown className="w-16 h-16 text-teal-600" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-spin" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent leading-tight">
            Choose Your Eco Plan
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Join thousands of eco-warriors making a real impact. Start with a free plan and upgrade as you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleLearnMore}
              className="group bg-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Learn More</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-full font-semibold hover:bg-teal-600 hover:text-white transition-all duration-300"
            >
              View Plans
            </button>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans-section" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-emerald-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 font-light">No hidden fees. Cancel anytime.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <PlanCard key={index} plan={plan} onSelect={handlePlanSelect} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Go Premium?</h2>
            <p className="text-lg text-gray-600 font-light">Unlock the full potential of your eco-journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="p-3 rounded-lg bg-teal-100 text-teal-600 mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 font-light">Everything you need to know</p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. There are no cancellation fees."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, bank transfers, and popular digital wallets."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! The Pro plan comes with a 14-day free trial. No credit card required."
              },
              {
                question: "How does the carbon footprint tracking work?",
                answer: "We calculate your carbon savings based on the amount and type of materials you recycle."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}