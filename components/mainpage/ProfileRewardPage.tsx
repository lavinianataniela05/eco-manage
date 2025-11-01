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
  FiZap,
  FiSettings,
  FiLogOut,
  FiShield,
  FiBell,
  FiHelpCircle,
  FiHome,
  FiSmile,
  FiFrown,
  FiTarget} from 'react-icons/fi';
import { 
  doc, getDoc, setDoc, updateDoc, onSnapshot, 
  collection, query, where, orderBy, getDocs,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Types (same as before)
type Reward = {
  id: string;
  name: string;
  points: number;
  claimed: boolean;
  image: string;
  description: string;
  category: 'home' | 'lifestyle' | 'tech' | 'fashion';
  stock: number;
};

type InventoryItem = {
  id: string;
  name: string;
  dateClaimed: string;
  image: string;
  pointsSpent: number;
  status: 'processing' | 'shipped' | 'delivered';
  rewardId: string;
};

type Activity = {
  id: string;
  type: 'pickup' | 'reward' | 'level' | 'transaction' | 'purchase' | 'subscription';
  title: string;
  description: string;
  date: string;
  points?: number;
  createdAt?: any;
  userId: string;
};

type Collection = {
  id: string;
  userId: string;
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
  userId: string;
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
  discountRate: number;
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

export default function ModernProfilePage() {
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
      endDate: '',
      discountRate: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'rewards' | 'inventory' | 'orders' | 'recycling'>('overview');
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [rewardFilter, setRewardFilter] = useState<'all' | Reward['category']>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);

  const isPremiumMember = user.subscription?.isActive && user.subscription.tier === 'pro';

  // Load all user data dengan error handling untuk index
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeActivities: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        setCurrentUser(user);
        
        try {
          // Load user data first
          await loadUserData(user.uid);
          
          // Load other data
          await Promise.all([
            loadRewards(),
            loadUserOrders(user.uid),
            loadUserCollections(user.uid)
          ]);

          // Set up real-time listeners
          const userDocRef = doc(db, 'users', user.uid);
          unsubscribeUser = onSnapshot(userDocRef, (doc) => {
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
                subscription: userData.subscription || prev.subscription,
                inventory: userData.inventory || [],
                level: userData.level || prev.level,
                completedPickups: userData.completedPickups || prev.completedPickups,
                scheduledPickups: userData.scheduledPickups || prev.scheduledPickups,
                carbonOffset: userData.carbonOffset || prev.carbonOffset,
                totalOrders: userData.totalOrders || prev.totalOrders,
                totalSpent: userData.totalSpent || prev.totalSpent,
                totalRecycling: userData.totalRecycling || prev.totalRecycling
              }));
            }
          });

          // Set up activities listener dengan error handling
          unsubscribeActivities = await loadUserActivities(user.uid);

        } catch (error) {
          console.error('Error loading user data:', error);
        }
        
      } else {
        router.push('/login');
        return;
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeActivities) unsubscribeActivities();
    };
  }, [router]);

  // Load user data from Firestore
  const loadUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data loaded:', userData);
        
        // Check if user has completed profile
        const hasCompletedProfile = userData.name && userData.phone && userData.address;
        
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
            endDate: '',
            discountRate: 0
          }
        };
        
        setUser(updatedUserData);
        setEditForm({
          name: userData.name || currentUser?.displayName || "",
          email: userData.email || currentUser?.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });
        
        setIsNewUser(!hasCompletedProfile);
        
      } else {
        // New user - create document
        console.log('New user detected, creating user document');
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
            endDate: '',
            discountRate: 0
          }
        };
        
        await setDoc(doc(db, 'users', userId), defaultUserData);
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
    }
  };

  // Load rewards dari Firestore dengan fallback ke default data
  const loadRewards = async () => {
    try {
      console.log('Loading rewards from Firestore...');
      const rewardsQuery = query(collection(db, 'rewards'), where('status', '==', 'active'));
      const snapshot = await getDocs(rewardsQuery);
      const rewardsData: Reward[] = [];
      
      if (snapshot.empty) {
        console.log('No rewards found in Firestore, using default rewards');
        // Create default rewards jika tidak ada
        await createDefaultRewards();
        // Load kembali setelah create
        return loadRewards();
      }
      
      snapshot.forEach(doc => {
        const data = doc.data();
        rewardsData.push({
          id: doc.id,
          name: data.name,
          points: data.points,
          claimed: false,
          image: data.image || '/api/placeholder/200/200',
          description: data.description,
          category: data.category,
          stock: data.stock || 10
        });
      });
      
      console.log('Rewards loaded:', rewardsData.length);
      setRewards(rewardsData);
    } catch (error) {
      console.error('Error loading rewards:', error);
      // Fallback ke default rewards
      setRewards(getDefaultRewards());
    }
  };

  // Create default rewards di Firestore
  const createDefaultRewards = async () => {
    try {
      const defaultRewards = [
        {
          name: "Stainless Steel Bottle",
          points: 500,
          image: "/api/placeholder/200/200",
          description: "Premium insulated water bottle that keeps drinks cold for 24 hours",
          category: 'home' as const,
          stock: 10,
          status: 'active',
          createdAt: new Date()
        },
        {
          name: "Reusable Grocery Bag Set",
          points: 300,
          image: "/api/placeholder/200/200",
          description: "Set of 3 organic cotton bags with reinforced stitching",
          category: 'fashion' as const,
          stock: 15,
          status: 'active',
          createdAt: new Date()
        },
        {
          name: "Solar Charger",
          points: 1200,
          image: "/api/placeholder/200/200",
          description: "Portable 10W solar-powered charger with USB ports",
          category: 'tech' as const,
          stock: 5,
          status: 'active',
          createdAt: new Date()
        },
        {
          name: "Bamboo Toothbrush Set",
          points: 250,
          image: "/api/placeholder/200/200",
          description: "4-pack of biodegradable bamboo toothbrushes",
          category: 'lifestyle' as const,
          stock: 20,
          status: 'active',
          createdAt: new Date()
        }
      ];

      const batch = writeBatch(db);
      defaultRewards.forEach(reward => {
        const rewardRef = doc(collection(db, 'rewards'));
        batch.set(rewardRef, reward);
      });

      await batch.commit();
      console.log('Default rewards created successfully');
    } catch (error) {
      console.error('Error creating default rewards:', error);
    }
  };

  // Fallback default rewards
  const getDefaultRewards = (): Reward[] => {
    return [
      {
        id: '1',
        name: "Stainless Steel Bottle",
        points: 500,
        claimed: false,
        image: "/api/placeholder/200/200",
        description: "Premium insulated water bottle that keeps drinks cold for 24 hours",
        category: 'home',
        stock: 10
      },
      {
        id: '2',
        name: "Reusable Grocery Bag Set",
        points: 300,
        claimed: false,
        image: "/api/placeholder/200/200",
        description: "Set of 3 organic cotton bags with reinforced stitching",
        category: 'fashion',
        stock: 15
      },
      {
        id: '3',
        name: "Solar Charger",
        points: 1200,
        claimed: false,
        image: "/api/placeholder/200/200",
        description: "Portable 10W solar-powered charger with USB ports",
        category: 'tech',
        stock: 5
      },
      {
        id: '4',
        name: "Bamboo Toothbrush Set",
        points: 250,
        claimed: false,
        image: "/api/placeholder/200/200",
        description: "4-pack of biodegradable bamboo toothbrushes",
        category: 'lifestyle',
        stock: 20
      }
    ];
  };

  // Load user activities dengan improved error handling
  const loadUserActivities = async (userId: string): Promise<(() => void) | undefined> => {
    try {
      console.log('Setting up activities listener for user:', userId);
      
      // Coba dengan ordering dulu
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
          console.log('Activities loaded with ordering:', activitiesData.length);
          setActivities(activitiesData);
          setIndexError(null);
        },
        (error) => {
          console.warn('Index not ready for activities, using fallback:', error);
          setIndexError('Activities index is being created. Some features may load slower.');
          loadActivitiesFallback(userId);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up activities listener:', error);
      setIndexError('Error loading activities. Please refresh the page.');
      loadActivitiesFallback(userId);
      return undefined;
    }
  };

  const loadActivitiesFallback = async (userId: string) => {
    try {
      console.log('Loading activities fallback for user:', userId);
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
    }
  };

  // Load user orders dengan improved error handling untuk index
  const loadUserOrders = async (userId: string) => {
    try {
      console.log('Loading orders for user:', userId);
      
      let ordersQuery;
      let usedFallback = false;
      
      try {
        // Coba dengan ordering dulu
        ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        // Test the query
        await getDocs(ordersQuery);
      } catch (error) {
        console.warn('Orders index not ready, using fallback:', error);
        usedFallback = true;
        ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', userId)
        );
      }
      
      const snapshot = await getDocs(ordersQuery);
      const ordersData: Order[] = [];
      let totalSpent = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          userId: data.userId,
          items: data.items || [],
          total: data.total || 0,
          status: data.status || 'completed',
          createdAt: data.createdAt,
          pointsEarned: data.pointsEarned || 0
        });
        totalSpent += data.total || 0;
      });
      
      // Manual sort jika menggunakan fallback
      if (usedFallback) {
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date();
          const dateB = b.createdAt?.toDate?.() || new Date();
          return dateB.getTime() - dateA.getTime();
        });
      }
      
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
      setIndexError('Error loading orders. The index is being created.');
    }
  };

  // Load user collections (recycling history) dengan error handling
  const loadUserCollections = async (userId: string) => {
    try {
      console.log('Loading collections for user:', userId);
      const collectionsQuery = query(
        collection(db, 'collections'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(collectionsQuery);
      const collectionsData: Collection[] = [];
      let totalRecycling = 0;
      let totalCarbonOffset = 0;
      let completedPickups = 0;
      let scheduledPickups = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        collectionsData.push({
          id: doc.id,
          userId: data.userId,
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
        
        if (data.status === 'completed') completedPickups++;
        if (data.status === 'scheduled') scheduledPickups++;
      });
      
      // Sort by date
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
        completedPickups,
        scheduledPickups,
        totalRecycling,
        carbonOffset: totalCarbonOffset
      }));
      
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  // Handle profile update - ONLY phone and address can be changed
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const updates = {
        phone: editForm.phone,
        address: editForm.address,
        name: user.name, // Keep original name from auth
        email: user.email, // Keep original email from auth
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', currentUser.uid), updates);
      
      setUser(prev => ({
        ...prev,
        phone: editForm.phone,
        address: editForm.address
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
          points: 50,
          userId: currentUser.uid
        });
        
        await updateDoc(doc(db, 'users', currentUser.uid), {
          points: increment(50)
        });
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
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

  // Handle claiming reward
  const handleClaimReward = async (reward: Reward) => {
    if (!currentUser) {
      alert('Please login to claim rewards');
      return;
    }

    const finalPoints = isPremiumMember ? Math.floor(reward.points * 0.8) : reward.points;

    if (user.points < finalPoints) {
      alert('Insufficient points to claim this reward');
      return;
    }

    if (reward.stock < 1) {
      alert('Sorry, this reward is out of stock');
      return;
    }

    try {
      const batch = writeBatch(db);

      // Create inventory item
      const inventoryItem: InventoryItem = {
        id: `inv_${Date.now()}`,
        name: reward.name,
        dateClaimed: new Date().toISOString().split('T')[0],
        image: reward.image,
        pointsSpent: finalPoints,
        status: 'processing',
        rewardId: reward.id
      };

      // Update user points and inventory
      batch.update(doc(db, 'users', currentUser.uid), {
        points: increment(-finalPoints),
        inventory: arrayUnion(inventoryItem)
      });

      // Update reward stock
      batch.update(doc(db, 'rewards', reward.id), {
        stock: increment(-1)
      });

      // Add activity
      const activityRef = doc(collection(db, 'activities'));
      batch.set(activityRef, {
        type: 'reward',
        title: "Reward Claimed",
        description: `Claimed ${reward.name} for ${finalPoints} points`,
        date: new Date().toISOString().split('T')[0],
        points: -finalPoints,
        userId: currentUser.uid,
        createdAt: new Date()
      });

      await batch.commit();

      // Update local state
      setRewards(prev => prev.map(r => 
        r.id === reward.id ? { ...r, stock: r.stock - 1 } : r
      ));
      setSelectedReward(null);

      alert('Reward claimed successfully! Check your inventory for details.');

    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Error claiming reward. Please try again.');
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

      alert('Item removed from inventory');

    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  // Utility functions
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

  const getUserBadge = () => {
    if (isPremiumMember) {
      return { 
        name: "🌟 Premium Member", 
        color: "from-teal-500 to-emerald-600",
        progress: 100,
      };
    }

    if (user.points >= 2000) return { name: "Eco Legend", color: "from-emerald-500 to-teal-600", progress: 100 };
    if (user.points >= 1500) return { name: "Eco Champion", color: "from-green-500 to-emerald-600", progress: 75 };
    if (user.points >= 1000) return { name: "Green Guardian", color: "from-lime-500 to-green-600", progress: 50 };
    if (user.points >= 500) return { name: "Eco Explorer", color: "from-teal-500 to-cyan-500", progress: 25 };
    return { name: "Eco Starter", color: "from-green-400 to-emerald-500", progress: 10 };
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter rewards
  const filteredRewards = rewardFilter === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === rewardFilter);

  // Show profile popup for new users
  useEffect(() => {
    if (isNewUser && !loading && !hasShownPopup) {
      const timer = setTimeout(() => {
        setShowProfilePopup(true);
        setHasShownPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isNewUser, loading, hasShownPopup]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50">
      {/* Header */}
      

      {/* Index Error Banner */}
      {indexError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <FiBell className="w-5 h-5 text-amber-600 mr-3" />
              <div className="flex-1">
                <p className="text-amber-800 text-sm font-medium">
                  {indexError}
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  This is normal when using Firestore for the first time. The system will work faster once indexes are created.
                </p>
              </div>
              <button
                onClick={() => setIndexError(null)}
                className="text-amber-600 hover:text-amber-800"
              >
                <FiCheck className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-teal-500" />
                    </div>
                    <button 
                      onClick={() => setShowProfilePopup(true)}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                    >
                      <FiEdit className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                  
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{user.name || "New User"}</h2>
                  <p className="text-gray-500 text-sm mb-3">{user.email}</p>
                  
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r",
                    getUserBadge().color
                  )}>
                    {getUserBadge().name}
                  </div>
                </div>

                {/* Points Display */}
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FiStar className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-800">Your Points</span>
                    </div>
                    <span className="text-lg font-bold text-amber-900">{user.points.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="border-t border-gray-200 p-4 space-y-1">
                {[
                  { id: 'overview' as const, label: 'Overview', icon: FiHome },
                  { id: 'activity' as const, label: 'Activity', icon: FiClock },
                  { id: 'rewards' as const, label: 'Rewards', icon: FiGift },
                  { id: 'inventory' as const, label: 'Inventory', icon: FiPackage },
                  { id: 'orders' as const, label: 'Orders', icon: FiShoppingBag },
                  { id: 'recycling' as const, label: 'Recycling', icon: FiRefreshCw },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "bg-teal-50 text-teal-600 border border-teal-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Settings & Logout */}
              
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-teal-600">{user.completedPickups}</div>
                <div className="text-xs text-gray-500 mt-1">Pickups</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-emerald-600">{user.totalOrders}</div>
                <div className="text-xs text-gray-500 mt-1">Orders</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600">{user.carbonOffset.toFixed(0)}kg</div>
                <div className="text-xs text-gray-500 mt-1">CO₂ Saved</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-lime-600">{user.totalRecycling}</div>
                <div className="text-xs text-gray-500 mt-1">kg Recycled</div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[600px]"
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name?.split(' ')[0] || 'there'}! 👋</h2>
                      <p className="text-gray-600">Here's your sustainability journey at a glance</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => router.push('/marketplace')}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Go Shopping
                      </button>
                      <button
                        onClick={() => router.push('/delivery-collection')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Schedule Pickup
                      </button>
                    </div>
                  </div>

                  {/* Premium Banner */}
                  {isPremiumMember ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-6 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl text-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FiFrown className="w-5 h-5" />
                            <h3 className="text-lg font-semibold">Premium Member Benefits</h3>
                          </div>
                          <p className="text-teal-100">You're enjoying exclusive discounts and perks!</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">20% OFF</div>
                          <div className="text-teal-200 text-sm">All purchases</div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-6 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl text-white cursor-pointer hover:from-teal-700 hover:to-emerald-700 transition-all"
                      onClick={() => router.push('/subscription')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FiZap className="w-5 h-5" />
                            <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
                          </div>
                          <p className="text-teal-100">Get 20% discount on all purchases + exclusive rewards</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">Only</div>
                          <div className="text-2xl font-bold">$9.99</div>
                          <div className="text-teal-200 text-sm">per month</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200 cursor-pointer"
                      onClick={() => setActiveTab('rewards')}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <FiGift className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Available Rewards</h3>
                          <p className="text-sm text-gray-600">{rewards.filter(r => r.stock > 0).length} items</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-teal-600">
                        {rewards.filter(r => r.stock > 0).length}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-green-50 to-lime-50 rounded-xl p-6 border border-green-200 cursor-pointer"
                      onClick={() => setActiveTab('inventory')}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiPackage className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">My Inventory</h3>
                          <p className="text-sm text-gray-600">{user.inventory.length} items</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {user.inventory.length}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 cursor-pointer"
                      onClick={() => setActiveTab('activity')}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FiTrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                          <p className="text-sm text-gray-600">{activities.length} activities</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {activities.length}
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Activity Preview */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                      <button 
                        onClick={() => setActiveTab('activity')}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {activities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FiClock className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.description}</p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(activity.date)}
                          </div>
                        </div>
                      ))}
                      {activities.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FiClock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity History</h2>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <FiClock className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(activity.date)}</p>
                        </div>
                        {activity.points && (
                          <div className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            activity.points > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          )}>
                            {activity.points > 0 ? '+' : ''}{activity.points} pts
                          </div>
                        )}
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FiClock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No activities yet</p>
                        <p className="text-sm mt-2">Your activities will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rewards Tab */}
              {activeTab === 'rewards' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Available Rewards</h2>
                      <p className="text-gray-600">Redeem your points for eco-friendly products</p>
                    </div>
                    <select
                      value={rewardFilter}
                      onChange={(e) => setRewardFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="home">Home</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="tech">Tech</option>
                      <option value="fashion">Fashion</option>
                    </select>
                  </div>

                  {rewards.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FiGift className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No rewards available at the moment</p>
                      <p className="text-sm mt-2">Please check back later</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredRewards.map((reward) => {
                        const finalPoints = isPremiumMember ? Math.floor(reward.points * 0.8) : reward.points;
                        const canClaim = user.points >= finalPoints && reward.stock > 0;
                        
                        return (
                          <motion.div
                            key={reward.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                          >
                            <div className="h-32 bg-gradient-to-br from-teal-50 to-emerald-50 relative">
                              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                {reward.category === 'home' && '🏠'}
                                {reward.category === 'lifestyle' && '🌿'}
                                {reward.category === 'tech' && '📱'}
                                {reward.category === 'fashion' && '👕'}
                              </div>
                              {reward.stock < 1 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <span className="text-white font-bold bg-black bg-opacity-70 px-3 py-1 rounded-lg">
                                    Out of Stock
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">{reward.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                              
                              {isPremiumMember && (
                                <div className="mb-2 p-2 bg-teal-50 rounded-lg border border-teal-200">
                                  <p className="text-xs text-teal-700 font-medium">
                                    🎉 Premium discount: {finalPoints} points (20% off!)
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center text-amber-500 font-bold">
                                  <FiStar className="w-4 h-4 mr-1" />
                                  {isPremiumMember ? (
                                    <>
                                      <span>{finalPoints}</span>
                                      <span className="text-sm text-gray-400 line-through ml-1">
                                        {reward.points}
                                      </span>
                                    </>
                                  ) : (
                                    <span>{reward.points}</span>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setSelectedReward(reward)}
                                    className="px-3 py-1 text-teal-600 hover:text-teal-700 text-sm font-medium"
                                  >
                                    Details
                                  </button>
                                  <button
                                    onClick={() => handleClaimReward(reward)}
                                    disabled={!canClaim}
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                                      canClaim
                                        ? "bg-teal-600 text-white hover:bg-teal-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    )}
                                  >
                                    Claim
                                  </button>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                Stock: {reward.stock} available
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Tab */}
              {activeTab === 'inventory' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Inventory</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.inventory.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="h-32 bg-gradient-to-br from-green-50 to-emerald-50 relative">
                          <div className="absolute inset-0 flex items-center justify-center text-3xl">
                            📦
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              item.status === 'delivered' ? "bg-green-100 text-green-800" :
                              item.status === 'shipped' ? "bg-teal-100 text-teal-800" :
                              "bg-yellow-100 text-yellow-800"
                            )}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                          <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                            <span>Claimed: {formatDate(item.dateClaimed)}</span>
                            <span className="flex items-center text-amber-500">
                              <FiStar className="w-3 h-3 mr-1" />
                              {item.pointsSpent}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => setSelectedInventoryItem(item)}
                              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
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
                    {user.inventory.length === 0 && (
                      <div className="col-span-2 text-center py-12 text-gray-500">
                        <FiPackage className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No items in inventory</p>
                        <p className="text-sm mt-2">Claim rewards to see them here</p>
                        <button
                          onClick={() => setActiveTab('rewards')}
                          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Browse Rewards
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FiShoppingBag className="w-6 h-6 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Order #{order.id.slice(-8)}</h4>
                            <p className="text-sm text-gray-600">
                              {order.items?.length || 0} items • {formatDate(order.createdAt?.toDate?.()?.toISOString() || new Date().toISOString())}
                            </p>
                            <p className={cn(
                              "text-xs font-medium mt-1",
                              order.status === 'completed' ? "text-green-600" :
                              order.status === 'processing' ? "text-yellow-600" :
                              "text-teal-600"
                            )}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</div>
                          {order.pointsEarned > 0 && (
                            <div className="flex items-center space-x-1 text-green-600 text-sm justify-end mt-1">
                              <FiStar className="w-3 h-3" />
                              <span>+{order.pointsEarned} pts</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FiShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No orders yet</p>
                        <p className="text-sm mt-2">Your orders will appear here</p>
                        <button
                          onClick={() => router.push('/marketplace')}
                          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Start Shopping
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recycling Tab */}
              {activeTab === 'recycling' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Recycling History</h2>
                      <p className="text-gray-600">Your eco-friendly contributions</p>
                    </div>
                    <button
                      onClick={() => router.push('/delivery-collection')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      <span>Schedule Pickup</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {collections.map((collection) => (
                      <div key={collection.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FiRefreshCw className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{collection.recyclingTypeLabel}</h4>
                            <p className="text-sm text-gray-600">
                              {collection.bagsCount}kg • {formatDate(collection.pickupDate?.toDate?.()?.toISOString() || collection.pickupDate)} at {collection.pickupTime}
                            </p>
                            <p className="text-xs text-gray-500">{collection.address}</p>
                            <p className={cn(
                              "text-xs font-medium mt-1",
                              collection.status === 'completed' ? "text-green-600" :
                              collection.status === 'scheduled' ? "text-teal-600" :
                              "text-yellow-600"
                            )}>
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
                      </div>
                    ))}
                    {collections.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FiRefreshCw className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No recycling history yet</p>
                        <p className="text-sm mt-2">Schedule your first pickup to start earning points</p>
                        <button
                          onClick={() => router.push('/delivery-collection')}
                          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Schedule First Pickup
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isNewUser ? "Complete Your Profile" : "Edit Profile"}
                  </h2>
                  <button
                    onClick={() => setShowProfilePopup(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {isNewUser && (
                  <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-teal-500 rounded-lg mr-3">
                        <FiStar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-teal-800 font-medium text-sm">Complete your profile to earn 50 bonus points!</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProfilePopup(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {isNewUser ? "Skip for now" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      {isNewUser ? "Complete Profile" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Detail Modal */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReward(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="h-48 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl">
                    {selectedReward.category === 'home' && '🏠'}
                    {selectedReward.category === 'lifestyle' && '🌿'}
                    {selectedReward.category === 'tech' && '📱'}
                    {selectedReward.category === 'fashion' && '👕'}
                  </div>
                  {selectedReward.stock < 1 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg bg-black bg-opacity-70 px-4 py-2 rounded-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedReward.name}</h3>
                <p className="text-gray-600 mb-4">{selectedReward.description}</p>

                {isPremiumMember && (
                  <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm text-teal-700 font-medium">
                      🎉 Premium Benefit: You get 20% discount on this reward!
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center text-amber-500 font-bold text-lg">
                    <FiStar className="w-5 h-5 mr-1" />
                    {isPremiumMember ? (
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
                    selectedReward.stock < 1 
                      ? "bg-gray-100 text-gray-400" 
                      : user.points >= (isPremiumMember ? Math.floor(selectedReward.points * 0.8) : selectedReward.points)
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}>
                    {selectedReward.stock < 1 
                      ? "Out of Stock" 
                      : user.points >= (isPremiumMember ? Math.floor(selectedReward.points * 0.8) : selectedReward.points)
                      ? "Available" 
                      : "Need More Points"}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Stock available: {selectedReward.stock}</p>
                  <p>Your points: {user.points}</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleClaimReward(selectedReward)}
                    disabled={selectedReward.stock < 1 || user.points < (isPremiumMember ? Math.floor(selectedReward.points * 0.8) : selectedReward.points)}
                    className={cn(
                      "flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg transition-colors",
                      (selectedReward.stock < 1 || user.points < (isPremiumMember ? Math.floor(selectedReward.points * 0.8) : selectedReward.points))
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    )}
                  >
                    Claim Reward
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Detail Modal */}
      <AnimatePresence>
        {selectedInventoryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInventoryItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center">
                  <div className="text-5xl">📦</div>
                  <div className="absolute top-4 right-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      selectedInventoryItem.status === 'delivered' ? "bg-green-100 text-green-800" :
                      selectedInventoryItem.status === 'shipped' ? "bg-teal-100 text-teal-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {selectedInventoryItem.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedInventoryItem.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Claimed:</span>
                    <span className="font-medium">{formatDate(selectedInventoryItem.dateClaimed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Spent:</span>
                    <span className="flex items-center text-amber-500 font-medium">
                      <FiStar className="w-4 h-4 mr-1" />
                      {selectedInventoryItem.pointsSpent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={cn(
                      "font-medium",
                      selectedInventoryItem.status === 'delivered' ? "text-green-600" :
                      selectedInventoryItem.status === 'shipped' ? "text-teal-600" :
                      "text-yellow-600"
                    )}>
                      {selectedInventoryItem.status.charAt(0).toUpperCase() + selectedInventoryItem.status.slice(1)}
                    </span>
                  </div>
                </div>

                {selectedInventoryItem.status === 'processing' && (
                  <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm text-teal-700">
                      Your reward is being processed. You'll receive a notification when it ships.
                    </p>
                  </div>
                )}

                {selectedInventoryItem.status === 'shipped' && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      Your reward has been shipped! Track your package for delivery updates.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedInventoryItem(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteItem(selectedInventoryItem.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Remove</span>
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