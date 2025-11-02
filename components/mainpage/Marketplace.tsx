'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  Star,
  Recycle,
  Leaf,
  Shield,
  ChevronRight,
  Sparkles,
  Tag,
  X,
  Plus,
  Minus,
  User,
  Crown,
  Zap
} from 'lucide-react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Types
type Product = {
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
  subscriptionDiscount: number;
};

type CartItem = {
  productId: string;
  quantity: number;
  product?: Product;
};

type UserSubscription = {
  tier: 'basic' | 'pro' | 'enterprise' | null;
  status: 'active' | 'inactive' | 'canceled' | 'trial';
  isActive: boolean;
  startDate: string;
  endDate: string;
};

type Order = {
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
};

type PaymentMethod = 'credit_card' | 'gopay' | 'ovo' | 'bank_transfer';

const CATEGORIES = [
  { name: 'All', count: 0, icon: <Recycle className="w-5 h-5" /> },
  { name: 'Furniture', count: 0, icon: <Tag className="w-5 h-5" /> },
  { name: 'Fashion', count: 0, icon: <Tag className="w-5 h-5" /> },
  { name: 'Home', count: 0, icon: <Tag className="w-5 h-5" /> },
  { name: 'Kitchen', count: 0, icon: <Tag className="w-5 h-5" /> }
];

// Points calculation dengan bonus untuk subscriber
const calculatePointsFromTransaction = (amount: number, isSubscribed: boolean): number => {
  const basePoints = Math.floor(amount / 10000);
  return isSubscribed ? Math.floor(basePoints * 1.5) : basePoints;
};

// Product Card Component
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist,
  userSubscription,
  calculateProductPrice 
}: { 
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  userSubscription: UserSubscription | null;
  calculateProductPrice: (product: Product) => number;
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const finalPrice = calculateProductPrice(product);
  const hasSubscriptionDiscount = userSubscription?.isActive && finalPrice < product.price;
  const productDiscount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onToggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      {productDiscount > 0 && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          -{productDiscount}%
        </div>
      )}
      
      {hasSubscriptionDiscount && (
        <div className="absolute top-4 left-20 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 flex items-center space-x-1">
          <Crown className="w-3 h-3" />
          <span>-20%</span>
        </div>
      )}
      
      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 flex items-center space-x-1">
        <Leaf className="w-3 h-3" />
        <span>{product.ecoScore}</span>
      </div>
      
      <button
        onClick={handleWishlist}
        className={`absolute top-16 right-4 p-2 rounded-full transition-all duration-300 ${
          isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-100 aspect-square">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
          <span className="text-sm text-gray-500">•</span>
          <span className={`text-sm font-medium ${
            product.condition === 'excellent' ? 'text-green-600' :
            product.condition === 'good' ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {product.condition}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-800">Rp {finalPrice.toLocaleString()}</span>
            {hasSubscriptionDiscount && (
              <span className="text-sm text-gray-500 line-through">Rp {product.price.toLocaleString()}</span>
            )}
          </div>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">Rp {product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {hasSubscriptionDiscount && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <div className="flex items-center space-x-1 text-purple-700 text-xs">
              <Crown className="w-3 h-3" />
              <span className="font-semibold">Premium Discount Applied</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{product.seller}</span>
          <span>{product.delivery}</span>
        </div>

        <button
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock < 1}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            product.stock < 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default function Marketplace() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  // Load products dan user data
  useEffect(() => {
    loadProducts();
  }, []);

  // Auth state listener dengan load subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserData(user.uid);
      } else {
        setCart([]);
        setUserSubscription(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      const productsData: Product[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        productsData.push({ 
          id: doc.id, 
          ...data,
          subscriptionDiscount: data.subscriptionDiscount || 20
        } as Product);
      });
      
      setProducts(productsData);
      updateCategoryCounts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Load subscription data
        const subscription: UserSubscription = userData.subscription || {
          tier: null,
          status: 'inactive',
          isActive: false,
          startDate: '',
          endDate: ''
        };
        setUserSubscription(subscription);
        
        // Load cart
        const cartItems: CartItem[] = userData.cart || [];
        const populatedCart = await Promise.all(
          cartItems.map(async (item) => {
            const productDoc = await getDoc(doc(db, 'products', item.productId));
            if (productDoc.exists()) {
              const productData = productDoc.data();
              return {
                ...item,
                product: { 
                  id: productDoc.id, 
                  ...productData,
                  subscriptionDiscount: productData.subscriptionDiscount || 20
                } as Product
              };
            }
            return item;
          })
        );
        
        setCart(populatedCart.filter(item => item.product));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateCategoryCounts = (productsData: Product[]) => {
    const counts = productsData.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    CATEGORIES.forEach(cat => {
      if (cat.name === 'All') {
        cat.count = productsData.length;
      } else {
        cat.count = counts[cat.name.toLowerCase()] || 0;
      }
    });
  };

  const saveCartToFirebase = async (userId: string, cartItems: CartItem[]) => {
    try {
      const cartForFirebase = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      await updateDoc(doc(db, 'users', userId), {
        cart: cartForFirebase
      });
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Calculate prices dengan subscription discount
  const calculateProductPrice = (product: Product): number => {
    if (userSubscription?.isActive && product.subscriptionDiscount > 0) {
      const discountAmount = product.price * (product.subscriptionDiscount / 100);
      return Math.floor(product.price - discountAmount);
    }
    return product.price;
  };

  const calculateCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => {
      if (!item.product) return sum;
      const itemPrice = calculateProductPrice(item.product);
      return sum + itemPrice * item.quantity;
    }, 0);

    const originalSubtotal = cart.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    const subscriptionDiscount = userSubscription?.isActive ? 
      originalSubtotal - subtotal : 0;

    const deliveryFee = cart.reduce((sum, item) => {
      if (!item.product) return sum;
      const deliveryCost = item.product.delivery === 'Free' ? 0 : 
                          parseInt(item.product.delivery.replace(/\D/g, '')) || 0;
      return sum + deliveryCost;
    }, 0);

    const total = subtotal + deliveryFee;
    const pointsEarned = calculatePointsFromTransaction(total, userSubscription?.isActive || false);

    return {
      subtotal,
      originalSubtotal,
      subscriptionDiscount,
      deliveryFee,
      total,
      pointsEarned
    };
  };

  const { subtotal, originalSubtotal, subscriptionDiscount, deliveryFee, total, pointsEarned } = calculateCartTotals();

  const handleAddToCart = async (productId: string) => {
    if (!currentUser) {
      alert('Please login to add items to cart');
      router.push('/login');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock < 1) {
      alert('Sorry, this product is out of stock');
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      let newCart;
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          alert(`Only ${product.stock} items available`);
          return prev;
        }
        newCart = prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { productId, quantity: 1, product }];
      }
      
      saveCartToFirebase(currentUser.uid, newCart);
      return newCart;
    });
    
    setIsCartOpen(true);
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!currentUser) return;

    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      alert(`Only ${product.stock} items available`);
      return;
    }
    
    setCart(prev => {
      const newCart = prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      
      saveCartToFirebase(currentUser.uid, newCart);
      return newCart;
    });
  };

  const removeFromCart = async (productId: string) => {
    if (!currentUser) return;

    setCart(prev => {
      const newCart = prev.filter(item => item.productId !== productId);
      saveCartToFirebase(currentUser.uid, newCart);
      return newCart;
    });
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!currentUser) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const wishlist = userData?.wishlist || [];

      if (wishlist.includes(productId)) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          wishlist: arrayRemove(productId)
        });
      } else {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          wishlist: arrayUnion(productId)
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handlePayment = async () => {
    if (!currentUser) return;
    
    setIsProcessing(true);
    
    try {
      // Check stock availability
      for (const item of cart) {
        const productDoc = await getDoc(doc(db, 'products', item.productId));
        if (productDoc.exists()) {
          const product = productDoc.data() as Product;
          if (product.stock < item.quantity) {
            alert(`Sorry, ${product.name} is out of stock`);
            setIsProcessing(false);
            return;
          }
        }
      }

      const orderId = `ORD-${Date.now()}`;
      const order: Order = {
        id: orderId,
        userId: currentUser.uid,
        items: cart,
        subtotal: originalSubtotal,
        discount: 0,
        subscriptionDiscount,
        deliveryFee,
        total,
        pointsEarned,
        paymentMethod,
        status: 'paid',
        createdAt: new Date(),
        transactionId: `TXN-${Date.now()}`,
        subscriptionApplied: userSubscription?.isActive || false
      };

      // Save order
      await setDoc(doc(db, 'orders', orderId), order);

      // Update user points
      await updateDoc(doc(db, 'users', currentUser.uid), {
        points: increment(pointsEarned)
      });

      // Add activity
      await setDoc(doc(collection(db, 'activities')), {
        userId: currentUser.uid,
        type: 'transaction',
        title: "Shopping Points",
        description: `Earned points from purchase #${order.transactionId}`,
        date: new Date().toISOString().split('T')[0],
        points: pointsEarned,
        createdAt: new Date(),
        subscriptionBonus: userSubscription?.isActive || false
      });

      // Update product stock
      for (const item of cart) {
        await updateDoc(doc(db, 'products', item.productId), {
          stock: increment(-item.quantity)
        });
      }

      // Clear cart
      await updateDoc(doc(db, 'users', currentUser.uid), {
        cart: []
      });

      setOrderDetails(order);
      setOrderComplete(true);
      setCart([]);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSellItem = () => {
    router.push('/sell');
  };

  const handleProfile = () => {
    router.push('/profile-reward');
  };

  const handleUpgradeSubscription = () => {
    router.push('/subscription');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           product.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Cart Sidebar Component
  const CartSidebar = () => (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
      isCartOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const finalPrice = calculateProductPrice(item.product!);
                const hasDiscount = userSubscription?.isActive && finalPrice < item.product!.price;
                
                return (
                  <div key={item.productId} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.product?.image || '/api/placeholder/80/80'}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-800">{item.product?.name}</h3>
                      <div className="flex items-center space-x-2">
                        {hasDiscount ? (
                          <>
                            <p className="text-sm font-semibold text-teal-600">
                              Rp {finalPrice.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              Rp {item.product?.price.toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">Rp {item.product?.price.toLocaleString()}</p>
                        )}
                      </div>
                      {item.product && item.quantity > item.product.stock && (
                        <p className="text-xs text-red-600">Only {item.product.stock} available</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-6 space-y-4">
            {/* Subscription Status Banner */}
            {userSubscription?.isActive ? (
              <div className="bg-gradient-to-r from-purple-500 to-teal-500 text-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold">Premium Member</span>
                </div>
                <p className="text-sm opacity-90">You're getting 20% discount on all items!</p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-amber-800">Upgrade to Premium</span>
                </div>
                <p className="text-sm text-amber-700 mb-2">
                  Get 20% discount on all purchases
                </p>
                <button
                  onClick={handleUpgradeSubscription}
                  className="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {originalSubtotal.toLocaleString()}</span>
              </div>
              
              {userSubscription?.isActive && subscriptionDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Subscription Discount (20%)</span>
                  <span>- Rp {subscriptionDiscount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>Rp {deliveryFee.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 text-center">
                Earn <strong>{pointsEarned} points</strong> from this purchase!
                {userSubscription?.isActive && (
                  <span className="block text-xs mt-1">+50% bonus for Premium members!</span>
                )}
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Checkout Modal Component
  const CheckoutModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity ${
      isCheckoutOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {!orderComplete ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subscription Status in Checkout */}
            {userSubscription?.isActive ? (
              <div className="bg-gradient-to-r from-purple-500 to-teal-500 text-white p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5" />
                    <span className="font-bold">Premium Member Active</span>
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    20% OFF Applied
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-800">Upgrade to Premium</p>
                    <p className="text-sm text-amber-700">Get 20% discount on this order</p>
                  </div>
                  <button
                    onClick={handleUpgradeSubscription}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-3">
                {cart.map((item) => {
                  const finalPrice = calculateProductPrice(item.product!);
                  const hasDiscount = userSubscription?.isActive && finalPrice < item.product!.price;
                  
                  return (
                    <div key={item.productId} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product?.image || '/api/placeholder/60/60'}
                          alt={item.product?.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-sm">{item.product?.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          {hasDiscount && (
                            <p className="text-xs text-green-600">Premium discount applied</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp {(finalPrice * item.quantity).toLocaleString()}</p>
                        {hasDiscount && (
                          <p className="text-sm text-gray-500 line-through">
                            Rp {((item.product?.price || 0) * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'credit_card', name: 'Credit Card', icon: '💳' },
                  { id: 'gopay', name: 'GoPay', icon: '📱' },
                  { id: 'ovo', name: 'OVO', icon: '📲' },
                  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {originalSubtotal.toLocaleString()}</span>
                </div>
                
                {userSubscription?.isActive && subscriptionDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Subscription Discount (20%)</span>
                    <span>- Rp {subscriptionDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>Rp {deliveryFee.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString()}</span>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 text-center">
                    You will earn <strong>{pointsEarned} points</strong> from this purchase!
                    {userSubscription?.isActive && (
                      <span className="block text-xs mt-1">+50% bonus points for Premium members!</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay Rp {total.toLocaleString()}</span>
              )}
            </button>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">Thank you for your purchase</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono">{orderDetails?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span>Rp {orderDetails?.total.toLocaleString()}</span>
                </div>
                {orderDetails?.subscriptionApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Subscription Savings:</span>
                    <span>- Rp {orderDetails?.subscriptionDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Points Earned:</span>
                  <span className="text-green-600 font-bold">+{orderDetails?.pointsEarned}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderComplete(false);
                  router.push('/profile-reward');
                }}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                View Points in Profile
              </button>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderComplete(false);
                }}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">EcoMarket</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for sustainable products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Sell Item Button */}
              <button
                onClick={handleSellItem}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sell Item
              </button>

              {/* Profile Button */}
              <button
                onClick={handleProfile}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-teal-600 transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="font-medium">Profile</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Subscription Status Badge */}
              {userSubscription?.isActive && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-teal-500 text-white px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-semibold">Premium</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Sustainable Shopping Made Easy</h1>
            <p className="text-lg mb-6 opacity-90">
              Discover pre-loved items, reduce waste, and earn rewards with every purchase. 
              {userSubscription?.isActive && (
                <span className="block mt-2 font-semibold">
                  🎉 Enjoy your 20% Premium discount on all items!
                </span>
              )}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Quality Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5" />
                <span>Eco-Friendly</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Rewards</span>
              </div>
            </div>
          </div>
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Categories & Filters */}
        <div className="flex items-center justify-between mb-8">
          {/* Categories */}
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === category.name
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.name
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort & Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            
            <button className="flex items-center space-x-2 border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-md animate-pulse">
                <div className="bg-gray-200 rounded-xl aspect-square mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                userSubscription={userSubscription}
                calculateProductPrice={calculateProductPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Checkout Modal */}
      <CheckoutModal />

      {/* Overlay */}
      {(isCartOpen || isCheckoutOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(false);
          }}
        />
      )}
    </div>
  );
}