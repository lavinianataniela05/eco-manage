'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit, FiStar, FiCheck, FiTrash2, FiUser, FiMail, 
  FiPhone, FiMapPin, FiAward, FiClock, FiCalendar, FiGift,
  FiShoppingBag,
  FiPackage,
  FiTrendingUp,
  FiRefreshCw,
  FiShoppingCart,
  FiCreditCard,
  FiHeart,
  FiFrown,
  FiZap
} from 'react-icons/fi';
import { 
  doc, getDoc, setDoc, updateDoc, onSnapshot, 
  collection, query, where, orderBy, getDocs,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Types (update dengan subscription)
type Reward = {
  id: number;
  name: string;
  points: number;
  claimed: boolean;
  image: string;
  description: string;
  category: 'home' | 'lifestyle' | 'tech' | 'fashion';
};

type InventoryItem = {
  id: string;
  name: string;
  dateClaimed: string;
  image: string;
  pointsSpent: number;
  status: 'processing' | 'shipped' | 'delivered';
};

type Activity = {
  id: string;
  type: 'pickup' | 'reward' | 'level' | 'transaction' | 'purchase' | 'subscription';
  title: string;
  description: string;
  date: string;
  points?: number;
  createdAt?: any;
};

type Collection = {
  id: string;
  pickupDate: any;
  pickupTime: string;
  recyclingTypeLabel: string;
  bagsCount: number;
  pointsEarned: number;
  status: string;
  totalCost: number;
  address: string;
};

type Order = {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
  pointsEarned: number;
};

type SubscriptionTier = 'basic' | 'pro' | null;
type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'trial';

type UserSubscription = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  isActive: boolean;
  startDate: string;
  endDate: string;
  billingCycle?: string;
  duration?: number;
};

type UserData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
  points: number;
  level: string;
  completedPickups: number;
  scheduledPickups: number;
  carbonOffset: number;
  favoriteCategory: string;
  inventory: InventoryItem[];
  totalOrders: number;
  totalSpent: number;
  totalRecycling: number;
  displayName?: string;
  photoURL?: string;
  subscription?: UserSubscription;
};

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    points: 0,
    level: "Eco Starter",
    completedPickups: 0,
    scheduledPickups: 0,
    carbonOffset: 0,
    favoriteCategory: 'home',
    inventory: [],
    totalOrders: 0,
    totalSpent: 0,
    totalRecycling: 0,
    subscription: {
      tier: null,
      status: 'inactive',
      isActive: false,
      startDate: '',
      endDate: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "Stainless Steel Bottle",
      points: 500,
      claimed: false,
      image: "/bottle.jpg",
      description: "Premium insulated water bottle that keeps drinks cold for 24 hours",
      category: 'home'
    },
    {
      id: 2,
      name: "Reusable Grocery Bag Set",
      points: 300,
      claimed: false,
      image: "/bag.jpg",
      description: "Set of 3 organic cotton bags with reinforced stitching",
      category: 'fashion'
    },
    {
      id: 3,
      name: "Solar Charger",
      points: 1200,
      claimed: false,
      image: "/charger.jpg",
      description: "Portable 10W solar-powered charger with USB ports",
      category: 'tech'
    },
    {
      id: 4,
      name: "Bamboo Toothbrush Set",
      points: 250,
      claimed: false,
      image: "/toothbrush.jpg",
      description: "4-pack of biodegradable bamboo toothbrushes",
      category: 'lifestyle'
    },
  ]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'rewards' | 'inventory' | 'orders' | 'recycling'>('activity');
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [rewardFilter, setRewardFilter] = useState<'all' | Reward['category']>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);

  // MODAL POPUP STATE
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  // Check if user is Premium Member
  const isPremiumMember = user.subscription?.isActive && user.subscription.tier === 'pro';

  // Debug loading state
  useEffect(() => {
    console.log('Loading state:', loading);
    console.log('Current user:', currentUser);
    console.log('Is new user:', isNewUser);
    console.log('Is Premium Member:', isPremiumMember);
    console.log('Subscription:', user.subscription);
  }, [loading, currentUser, isNewUser, isPremiumMember, user.subscription]);

  // Listen to auth state changes - UPDATED dengan subscription
  useEffect(() => {
    let unsubscribePoints: (() => void) | undefined;
    let unsubscribeActivities: (() => void) | undefined;
    let authTimeout: NodeJS.Timeout;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log('User authenticated:', user.uid);
          setCurrentUser(user);
          
          // Load user data first
          await loadUserData(user.uid);
          
          // Load other data in parallel
          await Promise.all([
            loadUserOrders(user.uid),
            loadUserCollections(user.uid)
          ]);

          // Set up real-time listener for user updates (including subscription)
          const userDocRef = doc(db, 'users', user.uid);
          unsubscribePoints = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              console.log('Real-time user update:', userData);
              setUser(prev => ({
                ...prev,
                points: userData.points || 0,
                name: userData.name || user.displayName || prev.name,
                email: userData.email || user.email || prev.email,
                phone: userData.phone || prev.phone,
                address: userData.address || prev.address,
                subscription: userData.subscription || prev.subscription
              }));
            }
          });

          // Set up activities listener
          unsubscribeActivities = await loadUserActivities(user.uid);

        } else {
          console.log('No user, redirecting to login');
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error in auth listener:', error);
      } finally {
        setLoading(false);
      }
    });

    // Safety timeout
    authTimeout = setTimeout(() => {
      if (loading) {
        console.log('Auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
      if (unsubscribePoints) {
        unsubscribePoints();
      }
      if (unsubscribeActivities) {
        unsubscribeActivities();
      }
    };
  }, [router]);

  // Load user data from Firestore - UPDATED dengan subscription
  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data loaded:', userData);
        
        // Check if user has completed profile (has name, phone, address)
        const hasCompletedProfile = userData.name && userData.phone && userData.address;
        
        // Gunakan data dari Firestore, fallback ke auth data jika tidak ada
        const updatedUserData: UserData = {
          name: userData.name || currentUser?.displayName || "",
          email: userData.email || currentUser?.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          memberSince: userData.memberSince || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          points: userData.points || 0,
          level: userData.level || "Eco Starter",
          completedPickups: userData.completedPickups || 0,
          scheduledPickups: userData.scheduledPickups || 0,
          carbonOffset: userData.carbonOffset || 0,
          favoriteCategory: userData.favoriteCategory || 'home',
          inventory: userData.inventory || [],
          totalOrders: userData.totalOrders || 0,
          totalSpent: userData.totalSpent || 0,
          totalRecycling: userData.totalRecycling || 0,
          subscription: userData.subscription || {
            tier: null,
            status: 'inactive',
            isActive: false,
            startDate: '',
            endDate: ''
          }
        };
        
        setUser(updatedUserData);
        setEditForm({
          name: userData.name || currentUser?.displayName || "",
          email: userData.email || currentUser?.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });
        
        // Set isNewUser berdasarkan apakah profile sudah lengkap
        setIsNewUser(!hasCompletedProfile);
        
      } else {
        // New user - initialize dengan data dari Firebase Auth
        console.log('New user detected, initializing with auth data');
        const defaultUserData: UserData = {
          name: currentUser?.displayName || "",
          email: currentUser?.email || "",
          phone: "",
          address: "",
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          points: 0,
          level: "Eco Starter",
          completedPickups: 0,
          scheduledPickups: 0,
          carbonOffset: 0,
          favoriteCategory: 'home',
          inventory: [],
          totalOrders: 0,
          totalSpent: 0,
          totalRecycling: 0,
          subscription: {
            tier: null,
            status: 'inactive',
            isActive: false,
            startDate: '',
            endDate: ''
          }
        };
        
        setUser(defaultUserData);
        setEditForm({
          name: currentUser?.displayName || "",
          email: currentUser?.email || "",
          phone: "",
          address: "",
        });
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback ke auth data jika error
      if (currentUser) {
        setUser(prev => ({
          ...prev,
          name: currentUser.displayName || "",
          email: currentUser.email || ""
        }));
        setEditForm(prev => ({
          ...prev,
          name: currentUser.displayName || "",
          email: currentUser.email || ""
        }));
      }
    }
  };

  // FIXED: Tampilkan popup otomatis untuk new user
  const isNewUserRef = useRef(isNewUser);
  const loadingRef = useRef(loading);
  const hasShownPopupRef = useRef(hasShownPopup);

  // Update refs when state changes
  useEffect(() => {
    isNewUserRef.current = isNewUser;
    loadingRef.current = loading;
    hasShownPopupRef.current = hasShownPopup;
  }, [isNewUser, loading, hasShownPopup]);

  useEffect(() => {
    if (isNewUserRef.current && !loadingRef.current && !hasShownPopupRef.current) {
      console.log('Showing profile popup for new/incomplete user');
      const timer = setTimeout(() => {
        setShowProfilePopup(true);
        setHasShownPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isNewUser, loading, hasShownPopup]);

  // Load user activities dengan proper error handling
  const loadUserActivities = async (userId: string): Promise<(() => void) | undefined> => {
    setActivitiesLoading(true);
    try {
      console.log('Loading activities for:', userId);
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(activitiesQuery, 
        (snapshot) => {
          const activitiesData: Activity[] = [];
          snapshot.forEach((doc) => {
            activitiesData.push({ id: doc.id, ...doc.data() } as Activity);
          });
          console.log('Activities loaded:', activitiesData.length);
          setActivities(activitiesData);
          setActivitiesLoading(false);
        },
        (error) => {
          console.warn('Index not ready, using fallback:', error);
          loadActivitiesFallback(userId);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up activities listener:', error);
      loadActivitiesFallback(userId);
      return undefined;
    }
  };

  // Fallback method without ordering
  const loadActivitiesFallback = async (userId: string) => {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(activitiesQuery);
      const activitiesData: Activity[] = [];
      snapshot.forEach((doc) => {
        activitiesData.push({ id: doc.id, ...doc.data() } as Activity);
      });
      
      // Sort manually on client side
      activitiesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.date);
        const dateB = b.createdAt?.toDate?.() || new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Activities loaded (fallback):', activitiesData.length);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities fallback:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Load user orders
  const loadUserOrders = async (userId: string) => {
    setOrdersLoading(true);
    try {
      console.log('Loading orders for:', userId);
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(ordersQuery);
      const ordersData: Order[] = [];
      let totalSpent = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          items: data.items || [],
          total: data.total || 0,
          status: data.status || 'completed',
          createdAt: data.createdAt,
          pointsEarned: data.pointsEarned || 0
        });
        totalSpent += data.total || 0;
      });
      
      console.log('Orders loaded:', ordersData.length);
      setOrders(ordersData);
      
      // Update user stats
      setUser(prev => ({
        ...prev,
        totalOrders: ordersData.length,
        totalSpent
      }));
      
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load user collections (recycling history)
  const loadUserCollections = async (userId: string) => {
    setCollectionsLoading(true);
    try {
      console.log('Loading collections for:', userId);
      const collectionsQuery = query(
        collection(db, 'collections'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(collectionsQuery);
      const collectionsData: Collection[] = [];
      let totalRecycling = 0;
      let totalCarbonOffset = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        collectionsData.push({
          id: doc.id,
          pickupDate: data.pickupDate,
          pickupTime: data.pickupTime,
          recyclingTypeLabel: data.recyclingTypeLabel,
          bagsCount: data.bagsCount,
          pointsEarned: data.pointsEarned || 0,
          status: data.status,
          totalCost: data.totalCost || 0,
          address: data.address
        });
        totalRecycling += data.bagsCount || 0;
        totalCarbonOffset += (data.bagsCount || 0) * 2.5;
      });
      
      // Sort manually on client side
      collectionsData.sort((a, b) => {
        const dateA = new Date(a.pickupDate?.toDate?.() || a.pickupDate).getTime();
        const dateB = new Date(b.pickupDate?.toDate?.() || b.pickupDate).getTime();
        return dateB - dateA;
      });
      
      console.log('Collections loaded:', collectionsData.length);
      setCollections(collectionsData);
      
      // Update user stats
      setUser(prev => ({
        ...prev,
        completedPickups: collectionsData.filter(c => c.status === 'completed').length,
        scheduledPickups: collectionsData.filter(c => c.status === 'scheduled').length,
        totalRecycling,
        carbonOffset: totalCarbonOffset
      }));
      
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // Add activity to Firestore
  const addActivity = async (userId: string, activity: Omit<Activity, 'id'>) => {
    try {
      await setDoc(doc(collection(db, 'activities')), {
        ...activity,
        userId,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  // Handle profile update
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const userData: Partial<UserData> = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        memberSince: user.memberSince,
        points: user.points,
        level: user.level,
        completedPickups: user.completedPickups,
        scheduledPickups: user.scheduledPickups,
        carbonOffset: user.carbonOffset,
        favoriteCategory: user.favoriteCategory,
        inventory: user.inventory,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        totalRecycling: user.totalRecycling,
        subscription: user.subscription
      };

      await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });
      
      setUser(prev => ({
        ...prev,
        ...userData
      }));
      setIsNewUser(false);
      setShowProfilePopup(false);

      // Add welcome activity for new users
      if (isNewUser) {
        await addActivity(currentUser.uid, {
          type: 'level',
          title: "Welcome!",
          description: "Profile completed successfully",
          date: new Date().toISOString().split('T')[0],
          points: 50
        });
        
        await updateDoc(doc(db, 'users', currentUser.uid), {
          points: increment(50)
        });
      }

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle claiming reward
  const handleClaimReward = async (rewardId: number) => {
    if (!currentUser) return;

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.claimed || user.points < reward.points) return;

    try {
      const inventoryItem: InventoryItem = {
        id: Date.now().toString(),
        name: reward.name,
        dateClaimed: new Date().toISOString().split('T')[0],
        image: reward.image,
        pointsSpent: reward.points,
        status: 'processing'
      };

      // Update user data in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        points: increment(-reward.points),
        inventory: arrayUnion(inventoryItem)
      });

      // Add reward activity
      await addActivity(currentUser.uid, {
        type: 'reward',
        title: "Redeemed Reward",
        description: `Claimed ${reward.name}`,
        date: new Date().toISOString().split('T')[0],
        points: -reward.points
      });

      // Update local state
      const updatedRewards = rewards.map(r => 
        r.id === rewardId ? { ...r, claimed: true } : r
      );
      setRewards(updatedRewards);
      setSelectedReward(null);

    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  // Handle deleting inventory item
  const handleDeleteItem = async (itemId: string) => {
    if (!currentUser) return;

    try {
      const itemToRemove = user.inventory.find(item => item.id === itemId);
      if (!itemToRemove) return;

      const updatedInventory = user.inventory.filter(item => item.id !== itemId);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        inventory: updatedInventory
      });

      setUser(prev => ({ ...prev, inventory: updatedInventory }));
      setSelectedInventoryItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Determine user badge based on points dan subscription
  const getUserBadge = () => {
    // Jika user adalah premium member, override dengan badge premium
    if (isPremiumMember) {
      return { 
        name: "🌟 Premium Member", 
        color: "from-purple-500 to-pink-600",
        nextLevel: null,
        progress: 100,
        isPremium: true
      };
    }

    if (user.points >= 2000) return { 
      name: "Eco Legend", 
      color: "from-purple-500 to-indigo-600",
      nextLevel: null,
      progress: 100,
      isPremium: false
    };
    if (user.points >= 1500) return { 
      name: "Eco Champion", 
      color: "from-teal-500 to-cyan-600",
      nextLevel: "Eco Legend (2000 pts)",
      progress: Math.min(100, ((user.points - 1500) / 500) * 100),
      isPremium: false
    };
    if (user.points >= 1000) return { 
      name: "Green Guardian", 
      color: "from-emerald-500 to-teal-600",
      nextLevel: "Eco Champion (1500 pts)",
      progress: Math.min(100, ((user.points - 1000) / 500) * 100),
      isPremium: false
    };
    if (user.points >= 500) return { 
      name: "Eco Explorer", 
      color: "from-blue-500 to-cyan-500",
      nextLevel: "Green Guardian (1000 pts)",
      progress: Math.min(100, ((user.points - 500) / 500) * 100),
      isPremium: false
    };
    return { 
      name: "Eco Starter", 
      color: "from-green-500 to-emerald-500",
      nextLevel: "Eco Explorer (500 pts)",
      progress: Math.min(100, (user.points / 500) * 100),
      isPremium: false
    };
  };

  // Filter rewards by category
  const filteredRewards = rewardFilter === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === rewardFilter);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const tabContentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const badgeColors: Record<string, string> = {
    pickup: "bg-blue-100 text-blue-800",
    reward: "bg-amber-100 text-amber-800",
    level: "bg-purple-100 text-purple-800",
    transaction: "bg-green-100 text-green-800",
    purchase: "bg-indigo-100 text-indigo-800",
    subscription: "bg-pink-100 text-pink-800"
  };

  const categoryColors: Record<string, string> = {
    home: "bg-indigo-100 text-indigo-800",
    lifestyle: "bg-emerald-100 text-emerald-800",
    tech: "bg-cyan-100 text-cyan-800",
    fashion: "bg-pink-100 text-pink-800"
  };

  const statusColors: Record<string, string> = {
    processing: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    scheduled: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Premium Benefits Component
  const PremiumBenefits = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <FiFrown className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-800">🌟 Premium Member Benefits</h3>
          <p className="text-purple-600 text-sm">You're enjoying exclusive perks!</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <FiTrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-gray-700">20% Discount</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiZap className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-700">+50% Points</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiStar className="w-4 h-4 text-amber-500" />
          <span className="text-gray-700">Priority Support</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiGift className="w-4 h-4 text-pink-500" />
          <span className="text-gray-700">Exclusive Rewards</span>
        </div>
      </div>

      {user.subscription?.billingCycle && (
        <div className="mt-3 pt-3 border-t border-purple-200">
          <p className="text-xs text-purple-600">
            Current plan: <strong>{user.subscription.billingCycle}</strong>
            {user.subscription.endDate && (
              <span> • Renews: {formatDate(user.subscription.endDate)}</span>
            )}
          </p>
        </div>
      )}
    </motion.div>
  );

  // Upgrade CTA Component
  const UpgradeCTA = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="mb-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl border border-purple-300 cursor-pointer shadow-lg"
      onClick={() => router.push('/subscription')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <FiFrown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Upgrade to Premium</h3>
            <p className="text-white/90 text-xs">Get 20% discount + exclusive benefits</p>
          </div>
        </div>
        <div className="text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );

  // Recycling History Tab Component
  const RecyclingHistoryTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Your Recycling History</h2>
          <p className="text-gray-600 text-sm">Track your eco-friendly contributions and earned points</p>
        </div>
        <button
          onClick={() => router.push('/delivery-collection')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Schedule Pickup</span>
        </button>
      </div>
      
      {collectionsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recycling history...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">♻️</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No recycling history yet</h3>
          <p className="text-gray-500 mb-4">Schedule your first pickup to start earning points and help the environment</p>
          <button
            onClick={() => router.push('/delivery-collection')}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors"
          >
            Schedule First Pickup
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  collection.status === 'completed' ? 'bg-green-100 text-green-600' :
                  collection.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  <FiRefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{collection.recyclingTypeLabel}</h4>
                  <p className="text-sm text-gray-600">
                    {collection.bagsCount}kg • {formatDate(collection.pickupDate?.toDate?.()?.toISOString() || collection.pickupDate)} at {collection.pickupTime}
                  </p>
                  <p className="text-xs text-gray-500">{collection.address}</p>
                  <p className={`text-xs font-medium mt-1 ${
                    collection.status === 'completed' ? 'text-green-600' : 
                    collection.status === 'scheduled' ? 'text-blue-600' : 
                    'text-yellow-600'
                  }`}>
                    {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-green-600 font-bold justify-end">
                  <FiStar className="w-4 h-4" />
                  <span>+{collection.pointsEarned} pts</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{formatCurrency(collection.totalCost)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Orders Tab Component
  const OrdersTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Your Orders</h2>
          <p className="text-gray-600 text-sm">Track your marketplace purchases</p>
        </div>
        <button
          onClick={() => router.push('/marketplace')}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
        >
          <FiShoppingCart className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>
      
      {ordersLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-300 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
                  <FiShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Order #{order.id.slice(-8)}</h4>
                  <p className="text-sm text-gray-600">
                    {order.items?.length || 0} items • {formatDate(order.createdAt?.toDate?.()?.toISOString() || new Date().toISOString())}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${
                    order.status === 'completed' ? 'text-green-600' : 
                    order.status === 'processing' ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">{formatCurrency(order.total)}</div>
                {order.pointsEarned > 0 && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm justify-end mt-1">
                    <FiStar className="w-3 h-3" />
                    <span>+{order.pointsEarned} pts</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Profile Popup Component
  // const ProfilePopup = () => (
  //   <AnimatePresence>
  //     {showProfilePopup && (
  //       <motion.div
  //         initial={{ opacity: 0 }}
  //         animate={{ opacity: 1 }}
  //         exit={{ opacity: 0 }}
  //         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  //         onClick={() => setShowProfilePopup(false)}
  //       >
  //         <motion.div
  //           initial={{ scale: 0.9, opacity: 0 }}
  //           animate={{ scale: 1, opacity: 1 }}
  //           exit={{ scale: 0.9, opacity: 0 }}
  //           className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
  //           onClick={(e) => e.stopPropagation()}
  //         >
  //           <div className="p-6">
  //             <div className="flex justify-between items-center mb-6">
  //               <h2 className="text-xl font-bold text-gray-800">
  //                 {isNewUser ? "Complete Your Profile" : "Edit Profile"}
  //               </h2>
  //               <button
  //                 onClick={() => setShowProfilePopup(false)}
  //                 className="text-gray-400 hover:text-gray-600 transition-colors"
  //               >
  //                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  //                 </svg>
  //               </button>
  //             </div>

  //             {isNewUser && (
  //               <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
  //                 <div className="flex items-center">
  //                   <div className="p-2 bg-blue-500 rounded-lg mr-3">
  //                     <FiStar className="w-4 h-4 text-white" />
  //                   </div>
  //                   <div>
  //                     <p className="text-blue-800 font-medium text-sm">Complete your profile to earn 50 bonus points!</p>
  //                   </div>
  //                 </div>
  //               </div>
  //             )}

  //             <form onSubmit={handleEditSubmit} className="space-y-4">
  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Full Name *
  //                 </label>
  //                 <input
  //                   type="text"
  //                   value={editForm.name}
  //                   onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
  //                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
  //                   placeholder="Enter your full name"
  //                   required
  //                 />
  //               </div>

  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Email
  //                 </label>
  //                 <input
  //                   type="email"
  //                   value={editForm.email}
  //                   onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
  //                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
  //                   placeholder="Enter your email"
  //                   required
  //                   disabled
  //                 />
  //                 <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
  //               </div>

  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Phone Number *
  //                 </label>
  //                 <input
  //                   type="tel"
  //                   value={editForm.phone}
  //                   onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
  //                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
  //                   placeholder="Enter your phone number"
  //                   required
  //                 />
  //               </div>

  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Address *
  //                 </label>
  //                 <textarea
  //                   value={editForm.address}
  //                   onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
  //                   rows={3}
  //                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
  //                   placeholder="Enter your complete address"
  //                   required
  //                 />
  //               </div>

  //               <div className="flex space-x-3 pt-4">
  //                 <button
  //                   type="button"
  //                   onClick={() => setShowProfilePopup(false)}
  //                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
  //                 >
  //                   {isNewUser ? "Skip for now" : "Cancel"}
  //                 </button>
  //                 <button
  //                   type="submit"
  //                   className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors"
  //                 >
  //                   {isNewUser ? "Complete Profile" : "Save Changes"}
  //                 </button>
  //               </div>
  //             </form>
  //           </div>
  //         </motion.div>
  //       </motion.div>
  //     )}
  //   </AnimatePresence>
  // );
  // Profile Popup Component yang lebih modern
const ProfilePopup = () => (
  <AnimatePresence>
    {showProfilePopup && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={() => setShowProfilePopup(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header dengan gradient */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {isNewUser ? "Complete Your Profile" : "Edit Profile"}
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  {isNewUser 
                    ? "Complete your profile to unlock all features" 
                    : "Update your personal information"
                  }
                </p>
              </div>
              <button
                onClick={() => setShowProfilePopup(false)}
                className="text-white hover:text-green-100 transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bonus Points Info untuk new user */}
          {isNewUser && (
            <div className="mx-6 -mt-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-500 rounded-lg mr-3">
                    <FiStar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-amber-800 font-semibold text-sm">Complete your profile</p>
                    <p className="text-amber-600 text-xs">Get 50 bonus points instantly!</p>
                  </div>
                  <div className="ml-auto bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    +50
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <form onSubmit={handleEditSubmit} className="space-y-5">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-cyan-100 overflow-hidden border-4 border-white shadow-lg"
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <FiUser className="w-10 h-10" />
                    </div>
                  </motion.div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                  >
                    <FiEdit className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">Click to upload photo</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                    Full Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all"
                      placeholder="Enter your email"
                      required
                      disabled
                    />
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Locked</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed for security reasons</p>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                    Phone Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter your phone number"
                      required
                    />
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                    Address
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter your complete address for pickup services"
                      required
                    />
                    <FiMapPin className="absolute left-3 top-4 text-gray-400 w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500">This address will be used for recycling pickups</p>
                </div>
              </div>

              {/* Progress Bar untuk new user */}
              {isNewUser && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between text-sm text-blue-800 mb-2">
                    <span>Profile Completion</span>
                    <span className="font-semibold">
                      {(() => {
                        const fields = [editForm.name, editForm.phone, editForm.address];
                        const completed = fields.filter(field => field.trim().length > 0).length;
                        return `${Math.round((completed / fields.length) * 100)}%`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(() => {
                        const fields = [editForm.name, editForm.phone, editForm.address];
                        const completed = fields.filter(field => field.trim().length > 0).length;
                        return (completed / fields.length) * 100;
                      })()}%` }}
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Complete all required fields to get your bonus points
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <motion.button
                  type="button"
                  onClick={() => setShowProfilePopup(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  {isNewUser ? "Maybe Later" : "Cancel"}
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  {isNewUser ? (
                    <span className="flex items-center justify-center">
                      Complete & Get Points
                      <FiStar className="ml-2 w-4 h-4" />
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </div>

              {/* Security Note */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  🔒 Your information is secure and encrypted
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isNewUser ? "Complete Your Profile" : "My Eco Profile"}
            </h1>
            <p className="text-gray-800">
              {isNewUser ? "Welcome! Let's get started" : "Track your sustainability journey"}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-amber-100">
              <FiStar className="text-amber-500 mr-2" />
              <span className="font-bold text-gray-800">{user.points.toLocaleString()}</span>
              <span className="ml-1 text-gray-600">pts</span>
            </div>
            
            {/* TOMBOL SUBSCRIBE - Tampilkan berbeda untuk premium vs non-premium */}
            {isPremiumMember ? (
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-md">
                <FiFrown className="mr-2" />
                <span>Premium Member</span>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/subscription')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg"
              >
                <FiHeart className="mr-2" />
                <span>Subscribe</span>
              </button>
            )}

            {/* TOMBOL EDIT PROFILE */}
            {/* <button 
              onClick={() => setShowProfilePopup(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
            >
              <FiEdit className="mr-2" />
              {isNewUser ? "Complete Profile" : "Edit Profile"}
            </button> */}
            {/* // Ganti bagian tombol edit profile di header dengan ini: */}
<button 
  onClick={() => setShowProfilePopup(true)}
  className="flex items-center px-5 py-2.5 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200 font-medium"
>
  <FiEdit className="mr-2 w-4 h-4" />
  {isNewUser ? "Complete Profile" : "Edit Profile"}
</button>

            <button 
              onClick={() => router.push('/marketplace')}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
            >
              <FiShoppingBag className="mr-2" />
              <span>Shop</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className={cn("h-2 bg-gradient-to-r", getUserBadge().color)}></div>
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="relative w-32 h-32 mb-4 rounded-full bg-gradient-to-br from-green-100 to-cyan-100 overflow-hidden border-4 border-white shadow-md"
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <FiUser className="w-16 h-16" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200">
                      <div className={cn("w-6 h-6 rounded-full bg-gradient-to-r", getUserBadge().color)}></div>
                    </div>
                    {/* Premium Badge */}
                    {isPremiumMember && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 shadow-lg">
                        <FiFrown className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 text-center">{user.name || "New User"}</h2>
                  <p className="text-gray-500 mb-2 text-sm">{user.email}</p>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "mt-2 mb-4 px-4 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r shadow-md",
                      getUserBadge().color
                    )}
                  >
                    {getUserBadge().name}
                  </motion.div>
                </div>
                
                {/* TAMPILKAN PREMIUM BENEFITS ATAU UPGRADE CTA */}
                {isPremiumMember ? (
                  <PremiumBenefits />
                ) : (
                  <UpgradeCTA />
                )}
                
                <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FiMail className="text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-all">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{user.phone || "Not set"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FiMapPin className="text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{user.address || "Not set"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-sm font-medium text-gray-900">{user.memberSince}</p>
                    </div>
                  </div>

                  {/* Subscription Info */}
                  {isPremiumMember && user.subscription?.endDate && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <FiFrown className="text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Premium Until</p>
                        <p className="text-sm font-medium text-purple-600">
                          {formatDate(user.subscription.endDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</span>
                  <span className="text-2xl font-bold text-green-600 mt-1">{user.completedPickups}</span>
                  <span className="text-xs text-gray-500 mt-1">Pickups</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Carbon</span>
                  <span className="text-2xl font-bold text-teal-600 mt-1">{user.carbonOffset.toFixed(1)}kg</span>
                  <span className="text-xs text-gray-500 mt-1">Offset</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-bold text-blue-600 mt-1">{user.totalOrders}</span>
                  <span className="text-xs text-gray-500 mt-1">Orders</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recycled</span>
                  <span className="text-2xl font-bold text-emerald-600 mt-1">{user.totalRecycling}kg</span>
                  <span className="text-xs text-gray-500 mt-1">Waste</span>
                </div>
              </div>
            </motion.div>

            {/* Level Progress */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Level Progress</h3>
                <FiAward className="text-amber-500" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Level</span>
                  <span className="font-medium text-gray-800">{getUserBadge().name}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getUserBadge().progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn("h-2 rounded-full bg-gradient-to-r", getUserBadge().color)}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{user.points} pts</span>
                  {getUserBadge().nextLevel && (
                    <span>Next: {getUserBadge().nextLevel}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {[
                    { id: 'activity', label: 'Activity', icon: FiClock },
                    { id: 'rewards', label: 'Rewards', icon: FiGift },
                    { id: 'inventory', label: 'Inventory', icon: FiPackage },
                    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
                    { id: 'recycling', label: 'Recycling', icon: FiRefreshCw }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                        activeTab === tab.id
                          ? "border-green-500 text-green-600 bg-green-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tabs Content */}
              <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                  {/* Activity Tab */}
                  {activeTab === 'activity' && (
                    <motion.div
                      key="activity"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={tabContentVariants}
                      className="p-6"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                        <div className="text-sm text-gray-500">
                          {activities.length} activities
                        </div>
                      </div>
                      
                      {activitiesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading activities...</p>
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="text-center py-12">
                          <FiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-700 mb-2">No activities yet</h3>
                          <p className="text-gray-500">Your activities will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activities.map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className={cn("p-2 rounded-lg", badgeColors[activity.type] || "bg-gray-100")}>
                                {activity.type === 'pickup' && <FiRefreshCw className="w-4 h-4" />}
                                {activity.type === 'reward' && <FiGift className="w-4 h-4" />}
                                {activity.type === 'level' && <FiAward className="w-4 h-4" />}
                                {activity.type === 'transaction' && <FiCreditCard className="w-4 h-4" />}
                                {activity.type === 'purchase' && <FiShoppingBag className="w-4 h-4" />}
                                {activity.type === 'subscription' && <FiFrown className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{activity.title}</h4>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(activity.date)}
                                </p>
                              </div>
                              {activity.points && (
                                <div className={cn(
                                  "text-sm font-medium px-2 py-1 rounded",
                                  activity.points > 0 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                )}>
                                  {activity.points > 0 ? '+' : ''}{activity.points} pts
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Rewards Tab - Tampilkan badge premium jika user premium */}
                  {activeTab === 'rewards' && (
                    <motion.div
                      key="rewards"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={tabContentVariants}
                      className="p-6"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">Available Rewards</h2>
                          <p className="text-gray-600 text-sm">
                            {isPremiumMember 
                              ? "🎉 Premium members get exclusive rewards!" 
                              : "Redeem your points for eco-friendly products"
                            }
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isPremiumMember && (
                            <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              <FiFrown className="w-3 h-3 mr-1" />
                              PREMIUM
                            </div>
                          )}
                          <select
                            value={rewardFilter}
                            onChange={(e) => setRewardFilter(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="all">All Categories</option>
                            <option value="home">Home</option>
                            <option value="lifestyle">Lifestyle</option>
                            <option value="tech">Tech</option>
                            <option value="fashion">Fashion</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRewards.map((reward) => (
                          <motion.div
                            key={reward.id}
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all relative",
                              isPremiumMember ? "border-purple-200 ring-1 ring-purple-100" : "border-gray-200"
                            )}
                          >
                            {/* Premium Badge untuk beberapa reward */}
                            {isPremiumMember && reward.id <= 2 && (
                              <div className="absolute top-3 left-3 z-10">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                                  <FiFrown className="w-3 h-3 mr-1" />
                                  PREMIUM
                                </div>
                              </div>
                            )}

                            <div className="h-48 bg-gradient-to-br from-green-100 to-cyan-100 relative overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                {reward.category === 'home' && '🏠'}
                                {reward.category === 'lifestyle' && '🌿'}
                                {reward.category === 'tech' && '📱'}
                                {reward.category === 'fashion' && '👕'}
                              </div>
                              <div className="absolute top-4 right-4">
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  categoryColors[reward.category]
                                )}>
                                  {reward.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800">{reward.name}</h3>
                                <div className="flex items-center text-amber-500 font-bold">
                                  <FiStar className="w-4 h-4 mr-1" />
                                  {isPremiumMember ? Math.floor(reward.points * 0.8) : reward.points}
                                  {isPremiumMember && (
                                    <span className="text-xs text-gray-400 line-through ml-1">
                                      {reward.points}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                              
                              {isPremiumMember && reward.id <= 2 && (
                                <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                                  <p className="text-xs text-purple-700 font-medium">
                                    🎉 Premium exclusive - 20% less points!
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() => setSelectedReward(reward)}
                                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                  View Details
                                </button>
                                
                                <button
                                  onClick={() => handleClaimReward(reward.id)}
                                  disabled={reward.claimed || user.points < (isPremiumMember && reward.id <= 2 ? Math.floor(reward.points * 0.8) : reward.points)}
                                  className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    reward.claimed
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : user.points < (isPremiumMember && reward.id <= 2 ? Math.floor(reward.points * 0.8) : reward.points)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                                  )}
                                >
                                  {reward.claimed ? (
                                    <>Claimed <FiCheck className="inline ml-1" /></>
                                  ) : user.points < (isPremiumMember && reward.id <= 2 ? Math.floor(reward.points * 0.8) : reward.points) ? (
                                    "Insufficient Points"
                                  ) : (
                                    "Claim Reward"
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Inventory Tab */}
                  {activeTab === 'inventory' && (
                    <motion.div
                      key="inventory"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={tabContentVariants}
                      className="p-6"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">My Inventory</h2>
                          <p className="text-gray-600 text-sm">Your claimed rewards and their status</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.inventory.length} items
                        </div>
                      </div>

                      {user.inventory.length === 0 ? (
                        <div className="text-center py-12">
                          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-700 mb-2">No items yet</h3>
                          <p className="text-gray-500 mb-4">Claim rewards to see them here</p>
                          <button
                            onClick={() => setActiveTab('rewards')}
                            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors"
                          >
                            Browse Rewards
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {user.inventory.map((item) => (
                            <motion.div
                              key={item.id}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                            >
                              <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                  📦
                                </div>
                                <div className="absolute top-3 right-3">
                                  <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    statusColors[item.status]
                                  )}>
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                  <div className="flex items-center text-amber-500 text-sm">
                                    <FiStar className="w-3 h-3 mr-1" />
                                    {item.pointsSpent}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                                  <span>Claimed: {formatDate(item.dateClaimed)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <button
                                    onClick={() => setSelectedInventoryItem(item)}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    View Details
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                                  >
                                    <FiTrash2 className="w-3 h-3 mr-1" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === 'orders' && <OrdersTab />}

                  {/* Recycling Tab */}
                  {activeTab === 'recycling' && <RecyclingHistoryTab />}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* PROFILE POPUP COMPONENT */}
      <ProfilePopup />

      {/* Reward Detail Modal - Updated dengan discount premium */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="h-48 bg-gradient-to-br from-green-100 to-cyan-100 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl">
                    {selectedReward.category === 'home' && '🏠'}
                    {selectedReward.category === 'lifestyle' && '🌿'}
                    {selectedReward.category === 'tech' && '📱'}
                    {selectedReward.category === 'fashion' && '👕'}
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      categoryColors[selectedReward.category]
                    )}>
                      {selectedReward.category}
                    </span>
                  </div>
                  {isPremiumMember && selectedReward.id <= 2 && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                        <FiFrown className="w-3 h-3 mr-1" />
                        PREMIUM
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedReward.name}</h3>
                <p className="text-gray-600 mb-4">{selectedReward.description}</p>

                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center text-amber-500 font-bold text-lg">
                    <FiStar className="w-5 h-5 mr-1" />
                    {isPremiumMember && selectedReward.id <= 2 ? (
                      <>
                        <span>{Math.floor(selectedReward.points * 0.8)} points</span>
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {selectedReward.points}
                        </span>
                      </>
                    ) : (
                      <span>{selectedReward.points} points</span>
                    )}
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    selectedReward.claimed 
                      ? "bg-gray-100 text-gray-400" 
                      : user.points >= (isPremiumMember && selectedReward.id <= 2 ? Math.floor(selectedReward.points * 0.8) : selectedReward.points)
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}>
                    {selectedReward.claimed 
                      ? "Already Claimed" 
                      : user.points >= (isPremiumMember && selectedReward.id <= 2 ? Math.floor(selectedReward.points * 0.8) : selectedReward.points)
                      ? "Available" 
                      : "Need More Points"}
                  </div>
                </div>

                {isPremiumMember && selectedReward.id <= 2 && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium">
                      🎉 Premium Benefit: You get 20% discount on this reward!
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleClaimReward(selectedReward.id)}
                    disabled={selectedReward.claimed || user.points < (isPremiumMember && selectedReward.id <= 2 ? Math.floor(selectedReward.points * 0.8) : selectedReward.points)}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all",
                      selectedReward.claimed || user.points < (isPremiumMember && selectedReward.id <= 2 ? Math.floor(selectedReward.points * 0.8) : selectedReward.points)
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    )}
                  >
                    {selectedReward.claimed ? "Claimed" : "Claim Reward"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Item Detail Modal */}
      <AnimatePresence>
        {selectedInventoryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    📦
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      statusColors[selectedInventoryItem.status]
                    )}>
                      {selectedInventoryItem.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedInventoryItem.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Spent:</span>
                    <span className="font-medium text-amber-500 flex items-center">
                      <FiStar className="w-4 h-4 mr-1" />
                      {selectedInventoryItem.pointsSpent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Claimed:</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(selectedInventoryItem.dateClaimed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={cn(
                      "font-medium",
                      selectedInventoryItem.status === 'delivered' ? "text-green-600" :
                      selectedInventoryItem.status === 'shipped' ? "text-blue-600" :
                      "text-yellow-600"
                    )}>
                      {selectedInventoryItem.status.charAt(0).toUpperCase() + selectedInventoryItem.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedInventoryItem(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteItem(selectedInventoryItem.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}