export interface Product {
  id: number;
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
  seller: string;
  delivery: string;
  tags: string[];
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
  cta: string;
  popular: boolean;
}