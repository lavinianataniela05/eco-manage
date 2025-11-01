// types/index.ts
export type SubscriptionTier = 'basic' | 'pro' | 'enterprise' | null;
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'trial';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  points: number;
  subscription: {
    tier: 'basic' | 'pro' | 'premium';
    status: 'active' | 'inactive' | 'canceled' | 'trial';
    isActive: boolean;
    startDate: string;
    endDate: string;
    discountRate: number;
  };
  wishlist: string[]; // product IDs
  cart: [
    {
      productId: string,
      quantity: number,
      addedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  condition: 'excellent' | 'good' | 'fair';
  rating: number;
  reviewCount: number;
  image: string;
  ecoScore: number;
  description: string;
  sellerId: string;
  sellerName: string;
  deliveryTime: string;
  tags: string[];
  stock: number;
  status: 'active' | 'inactive' | 'sold';
  subscriptionDiscount: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: [
    {
      productId: string;
      quantity: number;
      addedAt: Date;
    }
  ],
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  pointsEarned: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  subscriptionApplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}