'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Recycle, 
  MapPin, 
  Gauge, 
  Truck, 
  UserCircle2, 
  Info, 
  LogOut, 
  Sparkles, 
  ChevronRight,
  Crown,
  Store,
  Check,
  Settings
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged, User } from 'firebase/auth'

interface NavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  showBadge?: (userSubscription: any) => boolean;
}

const getNavLinks = (userSubscription: any): NavLink[] => [
  { name: 'Dashboard', path: '/dashboard', icon: <Gauge className="w-4 h-4" /> },
  { name: 'Marketplace', path: '/marketplace', icon: <Store className="w-4 h-4" />, badge: 'New' },
  // { name: 'Recycling Centers', path: '/recycling-centers', icon: <Recycle className="w-4 h-4" /> },
  { name: 'Waste Tracking', path: '/waste-tracking', icon: <MapPin className="w-4 h-4" /> },
  { name: 'Collection', path: '/delivery-collection', icon: <Truck className="w-4 h-4" /> },
  { 
    name: 'Subscription', 
    path: '/subscription', 
    icon: <Crown className="w-4 h-4" />, 
    badge: userSubscription?.tier === 'pro' ? 'Active' : 'Upgrade',
    showBadge: (userSub) => !userSub?.isActive || userSub?.tier !== 'pro'
  },
  { name: 'Profile', path: '/profile-reward', icon: <UserCircle2 className="w-4 h-4" /> },
  { name: 'About Us', path: '/about', icon: <Info className="w-4 h-4" /> },
]

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserData(user.uid);
      } else {
        setUserPoints(0);
        setUserSubscription(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserPoints(userData.points || 0);
          setUserSubscription(userData.subscription || null);
        } else {
          setUserPoints(0);
          setUserSubscription(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserPoints(0);
      setUserSubscription(null);
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  
  const sidebarVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const, 
        stiffness: 120,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  const isActiveLink = (linkPath: string) => {
    if (linkPath === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(linkPath);
  };

  const navLinks = getNavLinks(userSubscription);

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="w-64 bg-white/95 backdrop-blur-xl h-screen p-6 border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 shadow-sm"
    >
      {/* Logo Section */}
      <motion.div 
        className="flex items-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg mr-3 shadow-md">
          <Recycle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">EcoManage</h2>
          <p className="text-xs text-gray-500">Sustainable Platform</p>
        </div>
      </motion.div>
      
      {/* Points Display */}
      <Link href="/profile-reward" className="block mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative p-4 rounded-xl border border-gray-200 cursor-pointer group hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
              {loading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '🌱'
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">Eco Points</span>
                <Sparkles className="w-3 h-3 text-emerald-500" />
              </div>
              <div className="text-lg font-semibold text-gray-900 min-h-[24px] flex items-center">
                {loading ? (
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                ) : (
                  userPoints.toLocaleString()
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </motion.div>
      </Link>
      
      {/* Divider */}
      <div className="h-px bg-gray-200 mb-6"></div>
      
      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        <AnimatePresence>
          {navLinks.map((link, i) => {
            const isActive = isActiveLink(link.path);
            const shouldShowBadge = link.showBadge ? link.showBadge(userSubscription) : !!link.badge;
            
            return (
              <motion.div
                key={link.path}
                variants={itemVariants}
                custom={i}
                whileHover={{ x: 2 }}
              >
                <Link
                  href={link.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className={`mr-3 ${
                    isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {link.icon}
                  </span>
                  <span className="text-sm font-medium flex-1">{link.name}</span>
                  
                  {shouldShowBadge && link.badge && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      link.path === '/subscription'
                        ? userSubscription?.tier === 'pro'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                        : link.path === '/marketplace'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>
      
      {/* Subscription Status */}
      {userSubscription?.tier === 'pro' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg"
        >
          <div className="flex items-center justify-center space-x-2">
            <Crown className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Pro Plan Active</span>
            <Check className="w-3 h-3 text-emerald-600" />
          </div>
        </motion.div>
      )}
      
      {/* Divider */}
      <div className="h-px bg-gray-200 my-4"></div>
      
      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ x: 2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
      >
        <LogOut className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-500" />
        <span className="text-sm font-medium">Sign Out</span>
      </motion.button>
    </motion.aside>
  )
}