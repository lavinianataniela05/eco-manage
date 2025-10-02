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
  User
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
};

type CartItem = {
  productId: string;
  quantity: number;
  product?: Product;
};

type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  pointsEarned: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: Date;
  transactionId: string;
};

type PaymentMethod = 'credit_card' | 'gopay' | 'ovo' | 'bank_transfer';

const CATEGORIES = [
  { name: 'All', count: 0, icon: <Recycle className="w-5 h-5" /> },
  { name: 'Furniture', count: 0, icon: <Tag className="w-5 h-5" /> },
  { name: 'Fashion', count: 0, icon: <Tag className="w-5 h-5" /> },
  { name: 'Home', count: 0, icon: <Tag className="w-5 h-5" /> },
  { name: 'Kitchen', count: 0, icon: <Tag className="w-5 h-5" /> }
];

// Points calculation
const calculatePointsFromTransaction = (amount: number): number => {
  return Math.floor(amount / 10000);
};

export default function Marketplace() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
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

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserCart(user.uid);
      } else {
        setCart([]);
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
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      setProducts(productsData);
      updateCategoryCounts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
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

  const loadUserCart = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cartItems: CartItem[] = userData.cart || [];
        
        const populatedCart = await Promise.all(
          cartItems.map(async (item) => {
            const productDoc = await getDoc(doc(db, 'products', item.productId));
            if (productDoc.exists()) {
              return {
                ...item,
                product: { id: productDoc.id, ...productDoc.data() } as Product
              };
            }
            return item;
          })
        );
        
        setCart(populatedCart.filter(item => item.product));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
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
        total,
        pointsEarned,
        paymentMethod,
        status: 'paid',
        createdAt: new Date(),
        transactionId: `TXN-${Date.now()}`
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
        createdAt: new Date()
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

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const deliveryFee = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    const deliveryCost = item.product.delivery === 'Free' ? 0 : 
                        parseInt(item.product.delivery.replace(/\D/g, '')) || 0;
    return sum + deliveryCost;
  }, 0);

  const total = subtotal + deliveryFee;
  const pointsEarned = calculatePointsFromTransaction(total);

  const handleSellItem = () => {
    router.push('/sell');
  };

  const handleProfile = () => {
    router.push('/profile-page');
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
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                  <img
                    src={item.product?.image || '/api/placeholder/80/80'}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600">Rp {item.product?.price.toLocaleString()}</p>
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
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span>Rp {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>Rp {total.toLocaleString()}</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 text-center">
                Earn <strong>{pointsEarned} points</strong> from this purchase!
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

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-3">
                {cart.map((item) => (
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
                      </div>
                    </div>
                    <p className="font-medium">Rp {((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
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
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
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
                  router.push('/profile-page');
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

  // Product Card Component
  const ProductCard = ({ product, onAddToCart, onToggleWishlist }: any) => {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleWishlist = () => {
      setIsWishlisted(!isWishlisted);
      onToggleWishlist(product.id);
    };

    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    return (
      <div className="group relative bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
            -{discount}%
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

          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-800">Rp {product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">Rp {product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{product.seller}</span>
            <span>{product.delivery}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {product.tags.map((tag: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock === 0}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
              product.stock === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 overflow-hidden">
      <CartSidebar />
      <CheckoutModal />

      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => router.push('/')}
              >
                <Recycle className="w-8 h-8 text-teal-600" />
                <span className="text-xl font-bold text-gray-800">EcoMarket</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <button className="text-gray-700 hover:text-teal-600 font-medium">Categories</button>
                <button className="text-gray-700 hover:text-teal-600 font-medium">Deals</button>
                <button className="text-gray-700 hover:text-teal-600 font-medium">What's New</button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <button
                    onClick={handleProfile}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="text-gray-700 hover:text-teal-600 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="bg-teal-600 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-400/30 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative p-6 bg-white/10 rounded-full backdrop-blur-lg border border-white/20 inline-block">
              <Recycle className="w-16 h-16 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-teal-100 to-emerald-100 bg-clip-text text-transparent leading-tight">
            Eco Marketplace
          </h1>
          
          <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Discover unique upcycled treasures, secondhand gems, and sustainable products. Shop consciously, live sustainably.
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for upcycled furniture, vintage fashion, sustainable products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 focus:ring-2 focus:ring-teal-500 text-gray-800 placeholder-gray-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors">
                Search
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSellItem}
              className="group bg-white text-teal-700 px-8 py-4 rounded-full font-semibold hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Sell Your Items</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-teal-700 transition-all duration-300"
            >
              Browse Products
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {CATEGORIES.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.name
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} products found
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="eco-score">Eco Score</option>
              </select>
              
              <button className="bg-white border border-gray-300 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Recycle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Shop Eco?</h2>
            <p className="text-lg text-gray-600 font-light">Every purchase makes a difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="w-12 h-12" />,
                title: 'Reduce Waste',
                description: 'Give pre-loved items a new life and keep them out of landfills'
              },
              {
                icon: <Recycle className="w-12 h-12" />,
                title: 'Support Circular Economy',
                description: 'Promote sustainable consumption and production patterns'
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: 'Quality Verified',
                description: 'All products are checked for quality and sustainability'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="p-4 bg-teal-100 text-teal-600 rounded-2xl w-fit mx-auto mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}