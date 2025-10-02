'use client';

import React, { useState, useEffect, JSX } from 'react';
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
  Target,
  Calendar,
  Check,
  Award,
  TrendingDown,
  CreditCard,
  Lock,
  BadgeCheck
} from 'lucide-react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Define proper types for billing options
type BillingOption = {
  duration: number;
  label: string;
  price: number;
  originalPrice: number;
  discount: number;
  monthlyEquivalent?: number;
  bestDeal?: boolean;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  icon: JSX.Element;
  color: string;
  bgColor: string;
  features: string[];
  cta: string;
  popular: boolean;
  duration: number;
  billingOptions: BillingOption[];
};

// Payment types
type PaymentMethod = 'credit_card' | 'bank_transfer' | 'gopay' | 'ovo' | 'shopeepay' | 'qris';

// Subscription Plans Data
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    originalPrice: 0,
    description: 'Perfect for getting started with recycling',
    icon: <Users className="w-6 h-6" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    features: [
      'Basic recycling tracking',
      'Community access',
      'Monthly progress reports',
      'Standard support',
      'Marketplace access'
    ],
    cta: 'Get Started',
    popular: false,
    duration: 1,
    billingOptions: [
      { duration: 1, label: 'Monthly', price: 0, originalPrice: 0, discount: 0 }
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49000,
    originalPrice: 49000,
    description: 'Best for eco-conscious individuals',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-teal-500',
    bgColor: 'bg-teal-100',
    features: [
      '20% discount on all marketplace items',
      'Advanced recycling analytics',
      'Priority pickup scheduling',
      'Carbon footprint tracking',
      'Exclusive eco-rewards',
      'Priority support',
      'Personalized tips',
      '+50% bonus points on purchases'
    ],
    cta: 'Subscribe Now',
    popular: true,
    duration: 1,
    billingOptions: [
      { 
        duration: 1, 
        label: '1 Month', 
        price: 49000, 
        originalPrice: 49000,
        discount: 0,
        monthlyEquivalent: 49000
      },
      { 
        duration: 6, 
        label: '6 Months', 
        price: 249000,
        originalPrice: 294000,
        discount: 15,
        monthlyEquivalent: 41500,
        bestDeal: false
      },
      { 
        duration: 12, 
        label: '12 Months', 
        price: 470400,
        originalPrice: 588000,
        discount: 20,
        monthlyEquivalent: 39200,
        bestDeal: true
      }
    ]
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

const PAYMENT_METHODS = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Visa, MasterCard, JCB',
    fees: 0
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <BadgeCheck className="w-6 h-6" />,
    description: 'BCA, Mandiri, BNI, BRI',
    fees: 0
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: <Zap className="w-6 h-6" />,
    description: 'GoPay Wallet',
    fees: 0
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'OVO Wallet',
    fees: 0
  },
  {
    id: 'qris',
    name: 'QRIS',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Any QRIS-enabled app',
    fees: 0
  }
];

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const calculateSavings = (originalPrice: number, discountedPrice: number): number => {
  return originalPrice - discountedPrice;
};

export default function Subscription() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  
  const [selectedBilling, setSelectedBilling] = useState<{[key: string]: BillingOption}>({
    pro: SUBSCRIPTION_PLANS[1].billingOptions[2] // Default 12 bulan
  });

  // Check auth state and load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserSubscription(user.uid);
      } else {
        setUserSubscription(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserSubscription = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserSubscription(userData.subscription || null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleBillingSelect = (planId: string, billingOption: BillingOption) => {
    setSelectedBilling(prev => ({
      ...prev,
      [planId]: billingOption
    }));
  };

  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      alert('Please login to subscribe');
      router.push('/login');
      return;
    }

    if (userSubscription?.isActive && userSubscription.tier === planId) {
      alert('You are already subscribed to this plan!');
      return;
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return;

    if (planId === 'basic') {
      // Handle free basic plan
      setSelectedPlan(planId);
      setIsProcessing(true);
      await activateBasicPlan(currentUser.uid);
      return;
    }

    // For Pro plan - show payment modal
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  // Simulate payment processing dengan berbagai metode
  const processPayment = async (): Promise<{success: boolean; transactionId?: string}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulasi: 90% success rate untuk demo
        const success = Math.random() > 0.1;
        if (success) {
          resolve({
            success: true,
            transactionId: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });
        } else {
          resolve({
            success: false
          });
        }
      }, 3000);
    });
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !selectedPlan || !currentUser) {
      alert('Please select a payment method');
      return;
    }

    setPaymentStatus('processing');

    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
      const billingOption = selectedBilling[selectedPlan];
      
      if (!plan || !billingOption) return;

      // Process payment
      const paymentResult = await processPayment();

      if (paymentResult.success) {
        setPaymentStatus('success');
        
        // Aktifkan subscription setelah pembayaran berhasil
        await activateProSubscription(
          currentUser.uid, 
          plan, 
          billingOption, 
          selectedPaymentMethod,
          paymentResult.transactionId
        );
        
        // Redirect setelah delay
        setTimeout(() => {
          setShowPaymentModal(false);
          router.push('/marketplace');
        }, 2000);
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
    }
  };

  const activateBasicPlan = async (userId: string) => {
    try {
      const subscriptionData = {
        tier: 'basic',
        status: 'active',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        activatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', userId), {
        subscription: subscriptionData
      });

      // Add activity
      const activityId = `activity_${Date.now()}`;
      await setDoc(doc(db, 'activities', activityId), {
        id: activityId,
        userId: userId,
        type: 'subscription',
        title: "Basic Plan Activated",
        description: "You've activated the Basic subscription plan",
        date: new Date().toISOString().split('T')[0],
        points: 0,
        createdAt: new Date()
      });

      setUserSubscription(subscriptionData);
      alert('Basic plan activated successfully!');
      router.push('/marketplace');
    } catch (error) {
      console.error('Error activating basic plan:', error);
      alert('Failed to activate basic plan');
    } finally {
      setIsProcessing(false);
    }
  };

  const activateProSubscription = async (
    userId: string, 
    plan: SubscriptionPlan, 
    billingOption: BillingOption,
    paymentMethod: PaymentMethod,
    transactionId?: string
  ) => {
    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + billingOption.duration);

      const subscriptionData = {
        tier: plan.id,
        status: 'active',
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        duration: billingOption.duration,
        billingCycle: billingOption.label,
        paymentMethod: paymentMethod,
        activatedAt: serverTimestamp()
      };

      // Update user subscription
      await updateDoc(doc(db, 'users', userId), {
        subscription: subscriptionData
      });

      // Create subscription record
      const subscriptionId = `sub_${Date.now()}`;
      await setDoc(doc(db, 'subscriptions', subscriptionId), {
        id: subscriptionId,
        userId: userId,
        planId: plan.id,
        tier: plan.id,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        duration: billingOption.duration,
        billingCycle: billingOption.label,
        isActive: true,
        paymentMethod: paymentMethod,
        amount: billingOption.price,
        originalAmount: billingOption.originalPrice,
        discount: billingOption.discount,
        monthlyEquivalent: billingOption.monthlyEquivalent,
        transactionId: transactionId,
        createdAt: new Date()
      });

      // Create payment record
      const paymentId = `pay_${Date.now()}`;
      await setDoc(doc(db, 'payments', paymentId), {
        id: paymentId,
        userId: userId,
        subscriptionId: subscriptionId,
        amount: billingOption.price,
        paymentMethod: paymentMethod,
        status: 'completed',
        transactionId: transactionId,
        orderId: subscriptionId,
        createdAt: new Date()
      });

      // Calculate bonus points based on duration
      const bonusPoints = billingOption.duration * 100;

      // Add activity
      const activityId = `activity_${Date.now()}_sub`;
      await setDoc(doc(db, 'activities', activityId), {
        id: activityId,
        userId: userId,
        type: 'subscription',
        title: "Pro Plan Activated",
        description: `You've subscribed to ${plan.name} plan for ${billingOption.duration} months`,
        date: new Date().toISOString().split('T')[0],
        points: bonusPoints,
        createdAt: new Date()
      });

      // Add bonus points for subscription
      await updateDoc(doc(db, 'users', userId), {
        points: increment(bonusPoints)
      });

      setUserSubscription(subscriptionData);
      
    } catch (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUser || !userSubscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will lose your Pro benefits.')) {
      return;
    }

    try {
      const basicPlan = {
        tier: 'basic',
        status: 'inactive',
        isActive: false,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', currentUser.uid), {
        subscription: basicPlan
      });

      // Update subscription records
      const subscriptionsQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(subscriptionsQuery);
      const updatePromises = snapshot.docs.map(async (doc) => {
        await updateDoc(doc.ref, {
          status: 'canceled',
          isActive: false,
          canceledAt: new Date()
        });
      });
      
      await Promise.all(updatePromises);

      // Add activity
      const activityId = `activity_${Date.now()}_cancel`;
      await setDoc(doc(db, 'activities', activityId), {
        id: activityId,
        userId: currentUser.uid,
        type: 'subscription',
        title: "Subscription Canceled",
        description: "Your Pro subscription has been canceled",
        date: new Date().toISOString().split('T')[0],
        points: 0,
        createdAt: new Date()
      });

      setUserSubscription(basicPlan);
      alert('Subscription canceled successfully.');
      
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  // Reset payment modal
  const resetPaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentMethod(null);
    setPaymentStatus('idle');
    setIsProcessing(false);
  };

  const handleLearnMore = () => {
    document.getElementById('benefits-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Billing Option Component
  const BillingOption = ({ option, isSelected, onSelect, planId }: {
    option: BillingOption;
    isSelected: boolean;
    onSelect: (planId: string, option: BillingOption) => void;
    planId: string;
  }) => {
    const savings = calculateSavings(option.originalPrice, option.price);
    
    return (
      <div
        onClick={() => onSelect(planId, option)}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        } ${option.bestDeal ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`font-semibold ${
            isSelected ? 'text-teal-700' : 'text-gray-800'
          }`}>
            {option.label}
          </span>
          {option.bestDeal && (
            <div className="flex items-center space-x-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              <Award className="w-3 h-3" />
              <span>BEST DEAL</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-800">
              {formatCurrency(option.price)}
            </span>
            {option.duration > 1 && (
              <span className="text-sm text-gray-600">
                for {option.duration} months
              </span>
            )}
          </div>

          {option.discount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(option.originalPrice)}
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                  Save {option.discount}%
                </span>
              </div>
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>Save {formatCurrency(savings)}</span>
              </div>
            </div>
          )}

          {option.monthlyEquivalent && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{formatCurrency(option.monthlyEquivalent)}</span>
              <span>/month</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!showPaymentModal || !selectedPlan) return null;

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    const billingOption = selectedBilling[selectedPlan];
    
    if (!plan || !billingOption) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Complete Payment</h3>
              <button
                onClick={resetPaymentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={paymentStatus === 'processing'}
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mt-2">Subscribe to {plan.name} Plan</p>
          </div>

          {/* Order Summary */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{plan.name} Plan</span>
                <span className="text-gray-800">{billingOption.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="text-gray-800 font-semibold">
                  {formatCurrency(billingOption.price)}
                </span>
              </div>
              {billingOption.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>{billingOption.discount}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          {paymentStatus === 'idle' && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">Payment Method</h4>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id as PaymentMethod)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPaymentMethod === method.id
                        ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-teal-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Processing */}
          {paymentStatus === 'processing' && (
            <div className="p-6 border-b border-gray-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <h4 className="font-semibold text-gray-800 mb-2">Processing Payment</h4>
                <p className="text-gray-600">Please wait while we process your payment...</p>
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>Demo:</strong> This is a simulation. Payment will "succeed" in 3 seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Success */}
          {paymentStatus === 'success' && (
            <div className="p-6 border-b border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Payment Successful!</h4>
                <p className="text-gray-600 mb-4">
                  Your {plan.name} subscription is now active. Redirecting...
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">
                    You've earned {billingOption.duration * 100} bonus points!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Failed */}
          {paymentStatus === 'failed' && (
            <div className="p-6 border-b border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-red-600 text-2xl">!</div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Payment Failed</h4>
                <p className="text-gray-600 mb-4">
                  Sorry, we couldn't process your payment. Please try again.
                </p>
                <button
                  onClick={() => setPaymentStatus('idle')}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6">
            {paymentStatus === 'idle' && (
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    selectedPaymentMethod
                      ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Pay {formatCurrency(billingOption.price)}
                </button>
                <button
                  onClick={resetPaymentModal}
                  className="w-full py-3 px-6 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {paymentStatus === 'idle' && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Payments are secure and encrypted</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Plan Card Component
  const PlanCard = ({ plan, userSub, onSubscribe, isProcessing, selectedPlan }: {
    plan: SubscriptionPlan;
    userSub: any;
    onSubscribe: (planId: string) => void;
    isProcessing: boolean;
    selectedPlan: string | null;
  }) => {
    const isCurrentPlan = userSub?.isActive && userSub.tier === plan.id;
    const isBasicPlan = plan.id === 'basic';
    const selectedBillingOption = selectedBilling[plan.id] || plan.billingOptions[0];

    return (
      <div className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${
        plan.popular ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-100'
      } ${isCurrentPlan ? 'ring-4 ring-green-500/30 border-green-500' : ''}`}>
        
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
              <Star className="w-4 h-4 fill-current" />
              <span>MOST POPULAR</span>
            </div>
          </div>
        )}

        {isCurrentPlan && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>CURRENT PLAN</span>
            </div>
          </div>
        )}
        
        <div className="text-center mb-6">
          <div className={`p-3 rounded-full ${plan.bgColor} ${plan.color} mb-4 mx-auto w-fit`}>
            {plan.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
          
          {isBasicPlan ? (
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-4xl font-bold text-gray-800">Free</span>
            </div>
          ) : (
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-3xl font-bold text-gray-800">
                  {formatCurrency(selectedBillingOption.monthlyEquivalent || selectedBillingOption.price)}
                </span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <p className="text-sm text-gray-600">
                billed as {formatCurrency(selectedBillingOption.price)}
              </p>
              {selectedBillingOption.discount > 0 && (
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <span className="text-green-600 text-sm font-semibold">
                    Save {selectedBillingOption.discount}%
                  </span>
                  <span className="text-gray-500 text-sm line-through">
                    {formatCurrency(selectedBillingOption.originalPrice)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <p className="text-gray-600">{plan.description}</p>
        </div>

        {/* Billing Options untuk Pro Plan */}
        {!isBasicPlan && (
          <div className="mb-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Choose billing period:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {plan.billingOptions.map((option: BillingOption, index: number) => (
                <BillingOption
                  key={index}
                  option={option}
                  isSelected={selectedBillingOption.duration === option.duration}
                  onSelect={handleBillingSelect}
                  planId={plan.id}
                />
              ))}
            </div>
          </div>
        )}
        
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        {isCurrentPlan ? (
          <div className="space-y-3">
            <button
              disabled
              className="w-full py-4 px-6 rounded-xl font-semibold bg-green-500 text-white cursor-not-allowed"
            >
              Current Plan
            </button>
            {!isBasicPlan && (
              <button
                onClick={handleCancelSubscription}
                className="w-full py-3 px-6 rounded-xl font-semibold border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onSubscribe(plan.id)}
            disabled={isProcessing && selectedPlan === plan.id}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              plan.popular 
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-lg hover:shadow-xl' 
                : isBasicPlan
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
            } ${isProcessing && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing && selectedPlan === plan.id ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : isBasicPlan ? (
              plan.cta
            ) : (
              `Subscribe - ${formatCurrency(selectedBillingOption.price)}`
            )}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 overflow-hidden">
      {/* Payment Modal */}
      <PaymentModal />

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
            Join thousands of eco-warriors making a real impact. {userSubscription?.isActive && userSubscription.tier === 'pro' ? (
              <span className="text-teal-600 font-semibold">You're enjoying Pro benefits! 🎉</span>
            ) : (
              "Start with a free plan and upgrade to unlock exclusive benefits."
            )}
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
        <div className="relative max-w-4xl mx-auto px-6">
          
          {/* Current Plan Status */}
          {userSubscription?.isActive && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Current Plan: {userSubscription.tier === 'pro' ? 'Pro' : 'Basic'}
                  </h3>
                  <p className="text-green-600">
                    {userSubscription.tier === 'pro' 
                      ? `You are enjoying 20% discount on marketplace and exclusive benefits! (${userSubscription.billingCycle || '1 Month'})`
                      : 'You are on our free Basic plan.'
                    }
                  </p>
                </div>
                {userSubscription.tier === 'pro' && (
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Active
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Flexible Plans, Best Value</h2>
            <p className="text-lg text-gray-600 font-light">Choose the billing period that works best for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard 
                key={plan.id}
                plan={plan}
                userSub={userSubscription}
                onSubscribe={handleSubscribe}
                isProcessing={isProcessing}
                selectedPlan={selectedPlan}
              />
            ))}
          </div>

          {/* Price Comparison Table */}
          <div className="mt-16 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">💰 Price Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-teal-200">
                    <th className="text-left pb-4 font-semibold text-gray-800">Billing Period</th>
                    <th className="text-center pb-4 font-semibold text-gray-600">Monthly Price</th>
                    <th className="text-center pb-4 font-semibold text-gray-600">Total Price</th>
                    <th className="text-center pb-4 font-semibold text-gray-600">Savings</th>
                    <th className="text-center pb-4 font-semibold text-gray-600">Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBSCRIPTION_PLANS[1].billingOptions.map((option, index) => {
                    const savings = calculateSavings(option.originalPrice, option.price);
                    return (
                      <tr key={index} className="border-b border-teal-100">
                        <td className="py-4 text-gray-700 font-medium">
                          <div className="flex items-center space-x-2">
                            <span>{option.label}</span>
                            {option.bestDeal && (
                              <Award className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-center font-semibold text-teal-600">
                          {formatCurrency(option.monthlyEquivalent || option.price)}/mo
                        </td>
                        <td className="py-4 text-center text-gray-800 font-medium">
                          {formatCurrency(option.price)}
                        </td>
                        <td className="py-4 text-center text-green-600 font-semibold">
                          {formatCurrency(savings)}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            option.discount > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {option.discount > 0 ? `${option.discount}% OFF` : 'Standard'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">💡 Smart Choice Tip</h4>
                  <p className="text-yellow-700 text-sm">
                    Choosing <strong>12 months</strong> saves you <strong>20%</strong> compared to monthly billing - 
                    that's like getting <strong>2.4 months FREE!</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Go Pro?</h2>
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
                answer: "Yes, you can cancel your Pro subscription at any time. There are no cancellation fees and you'll receive a prorated refund for the unused period."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, bank transfers, GoPay, OVO, and other popular digital wallets in Indonesia."
              },
              {
                question: "How does the 20% discount work?",
                answer: "The 20% discount is automatically applied to all purchases in our marketplace when you're subscribed to the Pro plan. The discount shows up instantly in your cart and at checkout."
              },
              {
                question: "What happens when my subscription ends?",
                answer: "You'll receive a notification before your subscription ends. You can choose to renew with the same billing period or switch to a different one. If you don't renew, you'll automatically revert to the Basic plan."
              },
              {
                question: "Can I switch billing periods?",
                answer: "Yes! When you renew your subscription, you can choose any available billing period. The new billing period will start immediately after your current one ends."
              },
              {
                question: "Is there a discount for longer commitments?",
                answer: "Absolutely! We offer 15% discount for 6-month subscriptions and 20% discount for 12-month subscriptions. The longer you commit, the more you save!"
              },
              {
                question: "Do I get bonus points for longer subscriptions?",
                answer: "Yes! You'll receive 100 bonus points for each month of your subscription. So a 12-month subscription gives you 1,200 bonus points upfront!"
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