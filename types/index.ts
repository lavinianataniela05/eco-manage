// types/index.ts
export type SubscriptionTier = 'basic' | 'pro' | 'enterprise' | null;
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'trial';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  points: number;
  cart: CartItem[];
  wishlist: string[];
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  condition: 'excellent' | 'good' | 'new';
  rating: number;
  reviewCount: number;
  image: string;
  ecoScore: number;
  description: string;
  seller: string;
  delivery: string;
  tags: string[];
  stock: number;
  status: 'active' | 'inactive';
  subscriptionDiscount: number; // Discount for subscribed users
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  subscriptionDiscount: number;
  deliveryFee: number;
  total: number;
  pointsEarned: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: Date;
  transactionId: string;
  subscriptionApplied: boolean;
}