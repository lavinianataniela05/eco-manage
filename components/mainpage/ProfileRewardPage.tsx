'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit, FiStar, FiCheck, FiTrash2, FiUser, FiMail, 
  FiPhone, FiMapPin, FiAward, FiClock, FiCalendar, FiGift,
  FiShoppingBag,
  FiPackage,
  FiTrendingUp,
  FiRefreshCw,
  FiShoppingCart,
  FiCreditCard
} from 'react-icons/fi';
import { 
  doc, getDoc, setDoc, updateDoc, onSnapshot, 
  collection, query, where, orderBy, getDocs,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Types
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
  type: 'pickup' | 'reward' | 'level' | 'transaction' | 'purchase';
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
    totalRecycling: 0
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [rewardFilter, setRewardFilter] = useState<'all' | Reward['category']>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserData(user.uid);
        await loadUserActivities(user.uid);
        await loadUserOrders(user.uid);
        await loadUserCollections(user.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Load user data from Firestore
  const loadUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        setUser(userData);
        setEditForm({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
        });
        setIsNewUser(false);
      } else {
        // New user - initialize with default values
        const defaultUserData: UserData = {
          name: "",
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
          totalRecycling: 0
        };
        
        setUser(defaultUserData);
        setEditForm({
          name: "",
          email: currentUser?.email || "",
          phone: "",
          address: "",
        });
        setIsNewUser(true);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Load user activities with error handling for indexes
  const loadUserActivities = async (userId: string) => {
    setActivitiesLoading(true);
    try {
      // Try with ordering first (if index exists)
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
          setActivities(activitiesData);
          setActivitiesLoading(false);
        },
        (error) => {
          console.warn('Index not ready, using fallback:', error);
          // If index doesn't exist yet, use fallback
          loadActivitiesFallback(userId);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up activities listener:', error);
      // Use fallback method
      loadActivitiesFallback(userId);
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
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA; // Descending order
      });
      
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
      const collectionsQuery = query(
        collection(db, 'collections'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
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
        totalCarbonOffset += (data.bagsCount || 0) * 2.5; // 1kg = 2.5kg carbon offset
      });
      
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
      const userData: UserData = {
        ...user,
        ...editForm,
        email: currentUser.email || editForm.email
      };

      await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });
      
      setUser(userData);
      setIsEditing(false);
      setIsNewUser(false);

      // Add welcome activity for new users
      if (isNewUser) {
        await addActivity(currentUser.uid, {
          type: 'level',
          title: "Welcome!",
          description: "Profile completed successfully",
          date: new Date().toISOString().split('T')[0]
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
        points: user.points - reward.points,
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
      const updatedInventory = user.inventory.filter(item => item.id !== itemId);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        inventory: updatedInventory
      });

      setSelectedInventoryItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Determine user badge based on points
  const getUserBadge = () => {
    if (user.points >= 2000) return { 
      name: "Eco Legend", 
      color: "from-purple-500 to-indigo-600",
      nextLevel: null,
      progress: 100
    };
    if (user.points >= 1500) return { 
      name: "Eco Champion", 
      color: "from-teal-500 to-cyan-600",
      nextLevel: "Eco Legend (2000 pts)",
      progress: Math.min(100, ((user.points - 1500) / 500) * 100)
    };
    if (user.points >= 1000) return { 
      name: "Green Guardian", 
      color: "from-emerald-500 to-teal-600",
      nextLevel: "Eco Champion (1500 pts)",
      progress: Math.min(100, ((user.points - 1000) / 500) * 100)
    };
    if (user.points >= 500) return { 
      name: "Eco Explorer", 
      color: "from-blue-500 to-cyan-500",
      nextLevel: "Green Guardian (1000 pts)",
      progress: Math.min(100, ((user.points - 500) / 500) * 100)
    };
    return { 
      name: "Eco Starter", 
      color: "from-green-500 to-emerald-500",
      nextLevel: "Eco Explorer (500 pts)",
      progress: Math.min(100, (user.points / 500) * 100)
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
    purchase: "bg-indigo-100 text-indigo-800"
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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Recycling History Tab Component
  const RecyclingHistoryTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Your Recycling History</h2>
          <p className="text-gray-600 text-sm">Track your eco-friendly contributions and earned points</p>
        </div>
        <button
          onClick={() => router.push('/eco-collect')}
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
            onClick={() => router.push('/eco-collect')}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
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
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
            >
              <FiEdit className="mr-2" />
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

                  {/* Rewards Tab */}
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
                          <p className="text-gray-600 text-sm">Redeem your points for eco-friendly products</p>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                          >
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
                                  {reward.points}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                              
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() => setSelectedReward(reward)}
                                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                  View Details
                                </button>
                                
                                <button
                                  onClick={() => handleClaimReward(reward.id)}
                                  disabled={reward.claimed || user.points < reward.points}
                                  className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    reward.claimed
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : user.points < reward.points
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                                  )}
                                >
                                  {reward.claimed ? (
                                    <>Claimed <FiCheck className="inline ml-1" /></>
                                  ) : user.points < reward.points ? (
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
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
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {isNewUser ? "Complete Your Profile" : "Edit Profile"}
                  </h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors"
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
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedReward.name}</h3>
                <p className="text-gray-600 mb-4">{selectedReward.description}</p>

                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center text-amber-500 font-bold text-lg">
                    <FiStar className="w-5 h-5 mr-1" />
                    {selectedReward.points} points
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    selectedReward.claimed 
                      ? "bg-gray-100 text-gray-400" 
                      : user.points >= selectedReward.points 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}>
                    {selectedReward.claimed 
                      ? "Already Claimed" 
                      : user.points >= selectedReward.points 
                      ? "Available" 
                      : "Need More Points"}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleClaimReward(selectedReward.id)}
                    disabled={selectedReward.claimed || user.points < selectedReward.points}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all",
                      selectedReward.claimed || user.points < selectedReward.points
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