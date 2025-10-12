"use client";

import React, { useState, useEffect } from 'react';
import { 
  Leaf, MapPin, Award, Recycle, Calendar, Globe, History, User, 
  Info, Map, Sparkles, Crown, Zap, Users, Target, TreePine, 
  ChevronRight, CheckCircle, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function UnifiedDashboard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({
    wasteProcessed: 0,
    co2Saved: 0,
    treesPlanted: 0,
    communitiesServed: 0
  });

  const FINAL_COUNTS = {
    wasteProcessed: 12500,
    co2Saved: 8900,
    treesPlanted: 4500,
    communitiesServed: 150
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Feature rotation
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);

    // Counter animation
    const duration = 2500;
    const steps = 100;
    const counterInterval = duration / steps;

    const counterTimer = setInterval(() => {
      setCounters(prev => ({
        wasteProcessed: Math.min(prev.wasteProcessed + FINAL_COUNTS.wasteProcessed / steps, FINAL_COUNTS.wasteProcessed),
        co2Saved: Math.min(prev.co2Saved + FINAL_COUNTS.co2Saved / steps, FINAL_COUNTS.co2Saved),
        treesPlanted: Math.min(prev.treesPlanted + FINAL_COUNTS.treesPlanted / steps, FINAL_COUNTS.treesPlanted),
        communitiesServed: Math.min(prev.communitiesServed + FINAL_COUNTS.communitiesServed / steps, FINAL_COUNTS.communitiesServed)
      }));
    }, counterInterval);

    const timeout = setTimeout(() => {
      clearInterval(counterTimer);
      setCounters(FINAL_COUNTS);
    }, duration);

    return () => {
      clearInterval(featureInterval);
      clearInterval(counterTimer);
      clearTimeout(timeout);
    };
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Pickup Scheduling",
      description: "AI-optimized collection routes reducing emissions and improving efficiency",
      color: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-500"
    },
    {
      icon: MapPin,
      title: "Smart Locations Network",
      description: "IoT-enabled drop boxes with real-time capacity monitoring and analytics",
      color: "from-teal-50 to-cyan-50",
      iconColor: "text-teal-600",
      bgColor: "bg-teal-500"
    },
    {
      icon: Award,
      title: "Eco Rewards System",
      description: "Blockchain-verified sustainability points and reward redemption",
      color: "from-green-50 to-emerald-50",
      iconColor: "text-green-600",
      bgColor: "bg-green-500"
    },
    {
      icon: Globe,
      title: "Environmental Impact",
      description: "Comprehensive carbon footprint reduction tracking and reporting",
      color: "from-cyan-50 to-blue-50",
      iconColor: "text-cyan-600",
      bgColor: "bg-cyan-500"
    }
  ];

  const wasteTypes = [
    { 
      icon: "🔄", 
      name: "Plastic", 
      color: "from-blue-50 to-blue-100", 
      count: "2.3k", 
      subtitle: "Polymer Recycling",
      points: 150 
    },
    { 
      icon: "📄", 
      name: "Paper", 
      color: "from-amber-50 to-amber-100", 
      count: "1.8k", 
      subtitle: "Fiber Recovery",
      points: 120 
    },
    { 
      icon: "⚙️", 
      name: "Metal", 
      color: "from-slate-50 to-slate-100", 
      count: "945", 
      subtitle: "Metal Reclamation",
      points: 200 
    },
    { 
      icon: "🌱", 
      name: "Organic", 
      color: "from-green-50 to-green-100", 
      count: "3.1k", 
      subtitle: "Compost Processing",
      points: 100 
    }
  ];

  const featureButtons = [
    { 
      name: "Recycling Centers", 
      icon: Map, 
      href: "/recycling-centers", 
      description: "Find nearby facilities",
      color: "from-purple-500 to-pink-500"
    },
    { 
      name: "Waste Tracking", 
      icon: History, 
      href: "/waste-tracking", 
      description: "Monitor your impact",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      name: "Collection Schedule", 
      icon: Calendar, 
      href: "/delivery-collection", 
      description: "Manage pickups",
      color: "from-teal-500 to-emerald-500"
    },
    { 
      name: "Profile & Rewards", 
      icon: User, 
      href: "/profile-reward", 
      description: "Your eco-profile",
      color: "from-green-500 to-lime-500"
    },
    { 
      name: "About Our Mission", 
      icon: Info, 
      href: "/about", 
      description: "Learn more",
      color: "from-amber-500 to-orange-500"
    },
  ];

  const coreValues = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Environmental Stewardship",
      description: "Committed to protecting our planet through innovative recycling solutions",
      color: "text-teal-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Impact",
      description: "Building stronger communities through education and accessible programs",
      color: "text-blue-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Innovation Focus",
      description: "Leveraging technology to transform waste into valuable resources",
      color: "text-purple-500"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality Excellence",
      description: "Highest standards in waste processing and environmental compliance",
      color: "text-amber-500"
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const backgroundElementAnimation = {
    animate: {
      opacity: [0.1, 0.2, 0.1],
      scale: [1, 1.1, 1],
    },
    transition: {
      duration: 15,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: [0.42, 0, 0.58, 1] // cubic-bezier equivalent of easeInOut
    }
  };

  const StatCard = ({ icon, label, value, color, change }: { 
    icon: string; 
    label: string; 
    value: string; 
    color: string;
    change?: string;
  }) => (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-white hover:to-gray-100 transition-all cursor-pointer border border-gray-100/50"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl md:text-3xl font-bold ${color} mb-1`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      {change && <div className="text-xs text-emerald-500 font-semibold">{change}</div>}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 overflow-hidden">
      {/* Enhanced background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-100/20 via-transparent to-transparent"></div>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-teal-200/10 to-emerald-200/10"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 300}px`,
              height: `${100 + Math.random() * 300}px`,
            }}
            animate={backgroundElementAnimation.animate}
            transition={{
              ...backgroundElementAnimation.transition,
              duration: 15 + Math.random() * 20,
              ease: [0.42, 0, 0.58, 1]
            }}
          />
        ))}
      </div>

      <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Enhanced Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-teal-50/70 border border-teal-100/50 shadow-2xl mb-16 min-h-[600px] backdrop-blur-sm"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] bg-cover"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-300/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/10 rounded-full translate-y-48 -translate-x-48"></div>
          
          <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center">
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-6 mb-8 flex-wrap"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-4 bg-white/80 rounded-2xl shadow-lg border border-teal-100/50 backdrop-blur-sm"
              >
                <Leaf className="w-12 h-12 text-teal-600" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-3 tracking-tight">
                  Eco<span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">Manage</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl">
                  Intelligent waste management solutions powered by AI and IoT technology
                </p>
              </div>
            </motion.div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center mt-4">
              <motion.div 
                variants={itemVariants}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-medium">Live Environmental Impact Dashboard</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 border border-teal-100/50 shadow-lg backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-6">
                    <StatCard 
                      icon="♻️" 
                      label="Kg Recycled" 
                      value={`${Math.floor(counters.wasteProcessed).toLocaleString()}+`} 
                      color="text-emerald-600"
                      change="+12%"
                    />
                    <StatCard 
                      icon="👥" 
                      label="Active Users" 
                      value={`${Math.floor(counters.communitiesServed).toLocaleString()}+`} 
                      color="text-teal-600"
                      change="+8%"
                    />
                    <StatCard 
                      icon="🌍" 
                      label="CO₂ Reduction" 
                      value={`${Math.floor(counters.co2Saved).toLocaleString()}kg`} 
                      color="text-cyan-600"
                      change="+5%"
                    />
                    <StatCard 
                      icon="🌱" 
                      label="Trees Planted" 
                      value={`${Math.floor(counters.treesPlanted).toLocaleString()}+`} 
                      color="text-green-600"
                      change="+15%"
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-white/80 rounded-2xl p-8 border border-teal-100/50 shadow-lg backdrop-blur-sm"
              >
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Join thousands of environmentally conscious users in our mission to transform waste management. 
                  Our platform leverages cutting-edge technology to create sustainable communities.
                </p>
                <div className="flex gap-4 flex-col sm:flex-row">
                  <motion.button
                    onClick={() => handleNavigation('/delivery-collection')}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started
                  </motion.button>
                  <motion.button
                    onClick={() => handleNavigation('/marketplace')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 border border-teal-200 text-teal-700 px-6 py-4 rounded-xl font-semibold text-center bg-white/50 hover:bg-teal-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Explore Marketplace</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Core Values Section */}
        <section className="mb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Our <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">Core Values</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Guiding every decision and action we take towards a sustainable future
            </motion.p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/80 rounded-2xl p-6 border border-teal-100/50 shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-300"
              >
                <div className={`p-3 rounded-xl bg-opacity-10 ${value.color.replace('text-', 'bg-')} mb-4 w-fit group-hover:scale-110 transition-transform`}>
                  {value.icon}
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Enhanced Feature Buttons Section */}
        <section className="mb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Platform <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">Features</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Comprehensive tools designed for efficient waste management and environmental impact tracking
            </motion.p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
          >
            {featureButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <motion.button
                  key={index}
                  variants={itemVariants}
                  onClick={() => handleNavigation(button.href)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-white/80 rounded-2xl p-6 border border-teal-100/50 shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-300 text-left"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className={`relative p-3 bg-gradient-to-br ${button.color} rounded-xl shadow-lg group-hover:shadow-xl transition-all w-fit`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 transition-colors mb-2 text-sm">
                    {button.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{button.description}</p>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* Enhanced Features Section */}
        <section className="mb-20">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Our <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">Technology</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Advanced solutions driving the future of sustainable waste management
            </motion.p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-500 bg-gradient-to-br ${feature.color} border border-white/50 shadow-lg hover:shadow-xl ${
                    isActive ? 'ring-2 ring-teal-200/50' : ''
                  }`}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-emerald-400/10"
                      />
                    )}
                  </AnimatePresence>
                  
                  <div className="relative z-10">
                    <div className={`mb-6 p-3 rounded-xl bg-gradient-to-br ${feature.bgColor} shadow-lg w-fit ${
                      isActive ? 'scale-110' : ''
                    } transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Enhanced Waste Types Section */}
        <section className="mb-20">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="bg-white/80 rounded-3xl shadow-xl p-8 md:p-12 border border-teal-100/50 backdrop-blur-sm"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                variants={itemVariants}
                className="min-w-[280px]"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-teal-200/30 to-emerald-200/30 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/90 rounded-3xl p-8 border border-teal-100/50 shadow-lg backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {wasteTypes.map((waste, index) => (
                        <motion.button
                          key={index}
                          variants={itemVariants}
                          whileHover={{ y: -5, scale: 1.02 }}
                          onClick={() => handleNavigation('/waste-tracking')}
                          className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100/50 text-left"
                        >
                          <div className={`mb-3 p-3 rounded-lg bg-gradient-to-br ${waste.color} text-gray-800 text-center shadow-sm`}>
                            <div className="text-2xl mb-1">{waste.icon}</div>
                            <div className="text-xs font-semibold opacity-75">{waste.count} tons</div>
                          </div>
                          <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors text-sm mb-1">
                            {waste.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">{waste.subtitle}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-600 font-semibold">{waste.points} pts/kg</span>
                            <Sparkles className="w-3 h-3 text-amber-500" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <Recycle className="w-4 h-4" />
                  Advanced Material Recovery
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Sustainable <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">Material Processing</span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our intelligent sorting system utilizes machine learning and computer vision to achieve 
                  unprecedented recycling efficiency. Each material stream follows optimized pathways for maximum environmental benefit.
                </p>
                
                <div className="space-y-3">
                  {[
                    "AI-powered contamination detection system",
                    "Automated quality assessment and sorting",
                    "Optimized processing pathways for each material"
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-teal-500 to-teal-400' : 
                        index === 1 ? 'from-emerald-500 to-emerald-400' : 'from-green-500 to-green-400'
                      }`}></div>
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation('/recycling-centers')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mt-4"
                >
                  Find Recycling Centers
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Mission Call to Action */}
        <section className="mb-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-700 text-white"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-24 h-24 bg-teal-300 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10 p-12 text-center">
              <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
              <p className="text-lg text-teal-100 mb-8 font-light leading-relaxed max-w-2xl mx-auto">
                Join thousands of environmental champions already making a difference. Together, we can build a greener, more sustainable future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => handleNavigation('/delivery-collection')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-white text-teal-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Start Recycling Today</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={() => handleNavigation('/about')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-teal-700 transition-all"
                >
                  Learn About Our Mission
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer Section */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-8 border-t border-teal-100/50"
        >
          <p className="text-gray-600">
            © 2024 EcoManage. Transforming waste management through innovation.
          </p>
        </motion.footer>
      </main>
    </div>
  );
}