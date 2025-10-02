"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Recycle, LogOut, CheckCircle, Loader2, Sparkles, Leaf } from 'lucide-react';

const LogoutPage: React.FC = () => {
  const router = useRouter();
  const [stage, setStage] = useState<'logging-out' | 'clearing-data' | 'complete'>('logging-out');
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    if (!isClient) return;

    const logoutSequence = async () => {
      // Stage 1: Logging out animation
      setStage('logging-out');
      
      // Simulate progress for visual feedback
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      // Wait for initial animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 2: Clearing data
      setStage('clearing-data');
      
      // Clear auth tokens, cookies, or localStorage here
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('preferences');
        // Add any other cleanup logic here
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      
      // Wait for clearing animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stage 3: Complete
      setStage('complete');
      
      // Final delay before redirect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Redirect to login page
      router.push('/login');
    };

    logoutSequence();
  }, [router, isClient]);

  const containerVariants = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut" as const
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: {
        duration: 0.4
      }
    }
  };

  const logoVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: { 
      rotate: [0, 360, 720],
      scale: [1, 1.08, 1],
      transition: {
        duration: 2.4,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatDelay: 1.2
      }
    }
  };

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1.1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: 0.3 + i * 0.1,
        ease: "easeInOut" as const
      }
    })
  };

  const progressVariants = {
    initial: { width: "0%" },
    animate: { 
      width: `${progress}%`,
      transition: {
        duration: 0.4,
        ease: "easeInOut" as const
      }
    }
  };

  const leafVariants = (i: number) => ({
    initial: { opacity: 0 },
    animate: {
      y: [0, -10, 0],
      x: [0, Math.random() * 10 - 5, 0],
      rotate: [0, Math.random() * 180],
      opacity: [0.2, 0.5, 0.2],
      transition: {
        duration: 15 + Math.random() * 20,
        repeat: Infinity,
        delay: Math.random() * 5,
        ease: "easeInOut" as const
      }
    }
  });

  // Generate floating leaves only on client side
  const floatingLeaves = isClient ? Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-green-700"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${12 + Math.random() * 16}px`,
      }}
      variants={leafVariants(i)}
      initial="initial"
      animate="animate"
    >
      <Leaf className="w-full h-full" />
    </motion.div>
  )) : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-green-50">
      {/* Floating leaf background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingLeaves}
      </div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center relative overflow-hidden border border-green-200"
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Logo and branding */}
        <motion.div 
          className="flex flex-col items-center justify-center mb-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div 
            className="bg-green-50 p-4 rounded-xl shadow-inner border border-green-100 relative"
            variants={logoVariants}
            initial="initial"
            animate="animate"
            style={{
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
            }}
          >
            <Recycle className="w-8 h-8 text-emerald-800" />
            
            {/* Sparkle effects around logo */}
            {Array.from({ length: 5 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: i === 0 ? '-6px' : i === 1 ? '-6px' : i === 2 ? '50%' : i === 3 ? '100%' : '50%',
                  left: i === 0 ? '-6px' : i === 1 ? '100%' : i === 2 ? '-6px' : i === 3 ? '100%' : '100%',
                  transform: i === 4 ? 'translateY(-50%)' : i === 2 ? 'translateY(-50%)' : 'none'
                }}
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                custom={i}
              >
                <Sparkles className="w-3 h-3 text-emerald-700" />
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-600">
                EcoWaste
              </span>
            </h1>
            <p className="text-sm text-green-600 font-medium mt-1">Sustainable Living Platform</p>
          </div>
        </motion.div>

        {/* Main content with stage transitions */}
        <AnimatePresence mode="wait">
          {stage === 'logging-out' && (
            <motion.div
              key="logging-out"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-green-100 rounded-full mb-4 border border-green-200"
                >
                  <LogOut className="w-6 h-6 text-emerald-600" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Signing you out</h2>
                  <p className="text-sm text-gray-600 mt-1">Securely ending your session...</p>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'clearing-data' && (
            <motion.div
              key="clearing-data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="p-3 bg-emerald-100 rounded-full mb-4 border border-emerald-200"
                >
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Clearing your data</h2>
                  <p className="text-sm text-gray-600 mt-1">Removing sensitive information...</p>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 180 }}
              className="mb-6"
            >
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="p-3 bg-green-100 rounded-full mb-4 border border-green-200"
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Successfully signed out</h2>
                  <p className="text-sm text-gray-600 mt-1">You'll be redirected shortly</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full bg-green-100 rounded-full h-2 mb-8 overflow-hidden border border-green-200">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            variants={progressVariants}
            initial="initial"
            animate="animate"
            style={{
              boxShadow: '0 2px 8px -1px rgba(16, 185, 129, 0.2)'
            }}
          />
        </div>

        {/* Footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600 mb-1">
            Thank you for helping our planet
          </p>
          <p className="text-xs text-green-600 font-medium">
            Every small action makes a difference 🌿
          </p>
        </motion.div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-100 via-emerald-100 to-green-100"></div>
      </motion.div>
    </div>
  );
};

export default LogoutPage;