"use client";

import React, { useState, useEffect } from 'react';
import { 
  Leaf, MapPin, Award, Recycle, Calendar, Globe, History, User, 
  Info, Map, Sparkles, Crown, Zap, Users, Target, TreePine, 
  ChevronRight, CheckCircle, ArrowRight, TrendingUp, Shield, 
  Lightbulb, BarChart3, Activity, Star
} from 'lucide-react';

export default function UnifiedDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredWaste, setHoveredWaste] = useState<number | null>(null);
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
    
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);

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
      title: "AI-Powered Scheduling",
      description: "Machine learning algorithms optimize collection routes, reducing emissions by up to 40%",
      color: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-50 via-emerald-100 to-teal-100",
      stat: "40% less emissions"
    },
    {
      icon: MapPin,
      title: "IoT Smart Network",
      description: "Real-time monitoring of 500+ drop points with predictive capacity analytics",
      color: "from-blue-500 to-cyan-600",
      gradient: "from-blue-50 via-blue-100 to-cyan-100",
      stat: "500+ locations"
    },
    {
      icon: Award,
      title: "Blockchain Rewards",
      description: "Immutable sustainability credits verified on distributed ledger technology",
      color: "from-purple-500 to-pink-600",
      gradient: "from-purple-50 via-purple-100 to-pink-100",
      stat: "100% verified"
    },
    {
      icon: Globe,
      title: "Carbon Intelligence",
      description: "Comprehensive environmental impact tracking with ISO 14064 compliance",
      color: "from-green-500 to-emerald-600",
      gradient: "from-green-50 via-green-100 to-emerald-100",
      stat: "ISO certified"
    }
  ];

  const wasteTypes = [
    { 
      icon: "♻️", 
      name: "Plastic & Polymers", 
      gradient: "from-blue-400 to-blue-600", 
      bgGradient: "from-blue-50 to-blue-100",
      count: "2,345", 
      subtitle: "Advanced Polymer Recovery",
      points: 150,
      efficiency: "94%",
      trend: "+12%"
    },
    { 
      icon: "📄", 
      name: "Paper & Cardboard", 
      gradient: "from-amber-400 to-orange-600", 
      bgGradient: "from-amber-50 to-orange-100",
      count: "1,876", 
      subtitle: "Fiber Reclamation",
      points: 120,
      efficiency: "91%",
      trend: "+8%"
    },
    { 
      icon: "⚙️", 
      name: "Metals & Alloys", 
      gradient: "from-slate-400 to-slate-700", 
      bgGradient: "from-slate-50 to-slate-100",
      count: "945", 
      subtitle: "Metal Extraction",
      points: 200,
      efficiency: "97%",
      trend: "+15%"
    },
    { 
      icon: "🌱", 
      name: "Organic Waste", 
      gradient: "from-green-400 to-green-700", 
      bgGradient: "from-green-50 to-green-100",
      count: "3,124", 
      subtitle: "Composting & Biogas",
      points: 100,
      efficiency: "89%",
      trend: "+10%"
    }
  ];

  const featureButtons = [
    { 
      name: "Recycling Network", 
      icon: Map, 
      description: "Find 500+ verified facilities",
      color: "from-violet-500 via-purple-500 to-fuchsia-500",
      shadowColor: "shadow-purple-500/30"
    },
    { 
      name: "Impact Analytics", 
      icon: BarChart3, 
      description: "Real-time metrics dashboard",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      shadowColor: "shadow-cyan-500/30"
    },
    { 
      name: "Smart Collection", 
      icon: Calendar, 
      description: "AI-optimized scheduling",
      color: "from-emerald-500 via-teal-500 to-green-500",
      shadowColor: "shadow-emerald-500/30"
    },
    { 
      name: "Rewards Hub", 
      icon: Award, 
      description: "Earn & redeem eco-credits",
      color: "from-amber-500 via-orange-500 to-red-500",
      shadowColor: "shadow-amber-500/30"
    },
    { 
      name: "Our Mission", 
      icon: Info, 
      description: "Discover our impact",
      color: "from-indigo-500 via-blue-500 to-cyan-500",
      shadowColor: "shadow-indigo-500/30"
    },
  ];

  const coreValues = [
    {
      icon: Shield,
      title: "Environmental Stewardship",
      description: "Leading the charge in sustainable waste management with proven results and measurable impact",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      metric: "99.9%"
    },
    {
      icon: Users,
      title: "Community Partnership",
      description: "Empowering local communities through education, accessibility, and shared environmental goals",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      metric: "150+"
    },
    {
      icon: Lightbulb,
      title: "Innovation Leadership",
      description: "Pioneering technology integration with AI, IoT, and blockchain for next-gen waste solutions",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      metric: "24/7"
    },
    {
      icon: Target,
      title: "Excellence Standard",
      description: "Maintaining ISO-certified processes with rigorous quality control and environmental compliance",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      metric: "ISO+"
    }
  ];

  const achievements = [
    { label: "Carbon Offset", value: "8.9k", unit: "tonnes", icon: "🌍", color: "text-cyan-600" },
    { label: "Waste Diverted", value: "12.5k", unit: "tonnes", icon: "♻️", color: "text-emerald-600" },
    { label: "Trees Equivalent", value: "4.5k", unit: "planted", icon: "🌳", color: "text-green-600" },
    { label: "Active Community", value: "150", unit: "cities", icon: "🏙️", color: "text-teal-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Sophisticated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-emerald-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOCIgc3Ryb2tlPSIjMTRiOGE2IiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-40"></div>
      </div>

      <main className="relative z-10 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
        {/* Premium Hero Section */}
        <section className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-white/95 via-white/90 to-teal-50/80 border border-white/60 shadow-2xl mb-24 backdrop-blur-xl">
          {/* Sophisticated background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #14b8a6 35px, #14b8a6 36px)`
            }}></div>
          </div>
          
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-400/10 via-emerald-400/5 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-8 md:p-16 lg:p-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6 mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl blur-xl opacity-50"></div>
                <div className="relative p-5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl shadow-2xl">
                  <Leaf className="w-14 h-14 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl md:text-7xl font-black mb-2">
                  <span className="text-slate-900">Eco</span>
                  <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">Manage</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 font-light tracking-wide">
                  Next-Generation Waste Intelligence Platform
                </p>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Live Impact Dashboard */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  </div>
                  <span className="text-base font-semibold text-slate-700 tracking-wide uppercase text-sm">Live Environmental Impact</span>
                </div>
                
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-3xl blur opacity-20"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-teal-100/50">
                    <div className="grid grid-cols-2 gap-6">
                      {achievements.map((stat, i) => (
                        <div key={i} className="text-center group cursor-pointer">
                          <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">{stat.icon}</div>
                          <div className={`text-3xl md:text-4xl font-black ${stat.color} mb-1`}>
                            {stat.value}
                          </div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{stat.unit}</div>
                          <div className="text-xs text-slate-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-slate-700"><strong className="text-emerald-600">+18%</strong> increase in recycling efficiency this quarter</span>
                </div>
              </div>
              
              {/* Right: Value Proposition */}
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
                    <Star className="w-4 h-4" />
                    Industry Leading Platform
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                    Transform Your Environmental Impact with <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Intelligent Solutions</span>
                  </h2>
                  
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Join the world's most advanced waste management ecosystem. Our AI-powered platform combines IoT sensors, blockchain verification, and predictive analytics to deliver unprecedented sustainability results.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: CheckCircle, text: "Real-time impact tracking & analytics", color: "text-teal-600" },
                      { icon: CheckCircle, text: "Blockchain-verified sustainability credits", color: "text-emerald-600" },
                      { icon: CheckCircle, text: "AI-optimized collection routing", color: "text-green-600" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-slate-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 flex-col sm:flex-row">
                  <button className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-5 rounded-2xl font-bold shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="flex-1 border-2 border-teal-600 text-teal-700 px-8 py-5 rounded-2xl font-bold hover:bg-teal-50 transition-all duration-300 flex items-center justify-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span>Watch Demo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values - Premium Design */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              What Drives Us
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Built on <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Unwavering Principles</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Four pillars that guide every decision, innovation, and partnership we forge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative">
                    <div className={`p-4 rounded-2xl ${value.bgColor} mb-6 w-fit group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${value.color}`} />
                    </div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                        {value.title}
                      </h3>
                      <span className={`text-2xl font-black ${value.color}`}>{value.metric}</span>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Platform Features - Modern Grid */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap className="w-4 h-4" />
              Platform Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Powerful <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Features</span> at Your Fingertips
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive suite of tools designed for maximum efficiency and environmental impact
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {featureButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <button
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${button.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  
                  <div className="relative">
                    <div className={`relative mb-6`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${button.color} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity ${button.shadowColor}`}></div>
                      <div className={`relative p-4 bg-gradient-to-br ${button.color} rounded-2xl shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-teal-600 group-hover:to-emerald-600 transition-all mb-3 text-lg">
                      {button.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{button.description}</p>
                    
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all mt-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Technology Features */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Activity className="w-4 h-4" />
              Advanced Technology
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Cutting-Edge</span> Infrastructure
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Enterprise-grade systems powering the future of sustainable waste management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-700 border ${
                    isActive 
                      ? 'bg-gradient-to-br ' + feature.gradient + ' border-white/50 shadow-2xl scale-[1.02]' 
                      : 'bg-white border-slate-200/50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  )}
                  
                  <div className="relative">
                    <div className={`mb-8 p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-xl w-fit transform ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-500`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-slate-900">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/80 text-slate-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      {feature.stat}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Material Processing - Premium Showcase */}
        <section className="mb-24">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-white via-white to-slate-50 border border-slate-200/50 shadow-2xl p-12 lg:p-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/30 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative grid lg:grid-cols-2 gap-16 items-center">
              {/* Material Grid */}
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-6">
                  {wasteTypes.map((waste, index) => (
                    <button
                      key={index}
                      onMouseEnter={() => setHoveredWaste(index)}
                      onMouseLeave={() => setHoveredWaste(null)}
                      className={`relative group bg-white rounded-3xl p-6 border-2 transition-all duration-500 ${
                        hoveredWaste === index 
                          ? 'border-teal-400 shadow-2xl -translate-y-2 scale-[1.02]' 
                          : 'border-slate-200 shadow-lg hover:border-teal-300'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${waste.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      
                      <div className="relative">
                        <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${waste.gradient} shadow-lg text-center transform group-hover:scale-110 transition-transform`}>
                          <div className="text-3xl mb-2">{waste.icon}</div>
                          <div className="text-white text-xs font-bold">{waste.count} tons</div>
                        </div>
                        
                        <h3 className="font-bold text-slate-900 mb-2 text-sm">
                          {waste.name}
                        </h3>
                        <p className="text-xs text-slate-600 mb-4">{waste.subtitle}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="text-xs">
                            <span className="text-slate-500">Efficiency:</span>
                            <span className="font-bold text-teal-600 ml-1">{waste.efficiency}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span className="text-xs font-bold text-amber-600">{waste.points} pts/kg</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-emerald-600 font-semibold mt-2">
                          {waste.trend} this month
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Content */}
              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
                    <Recycle className="w-4 h-4" />
                    Advanced Processing
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                    Precision <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Material Recovery</span> Systems
                  </h2>
                  
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Our state-of-the-art facilities employ machine learning algorithms and computer vision technology to achieve industry-leading recovery rates. Each material stream is meticulously processed for maximum environmental benefit and circular economy integration.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      { text: "AI-powered contamination detection achieving 99.8% accuracy", icon: Shield },
                      { text: "Automated quality assessment with real-time analytics", icon: BarChart3 },
                      { text: "Optimized processing pathways reducing energy consumption by 35%", icon: Zap }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <div className="p-2 rounded-xl bg-teal-50 group-hover:bg-teal-100 transition-colors">
                          <item.icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-slate-700 flex-1">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 group">
                    <span>Explore Our Facilities</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action - Premium */}
        <section className="mb-24">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-2xl mb-8 animate-pulse">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Ready to Lead the <span className="text-transparent bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text">Sustainability Revolution?</span>
              </h2>
              
              <p className="text-xl text-teal-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of organizations and individuals making measurable environmental impact. Start your journey towards a sustainable future today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <button className="group bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300 flex items-center gap-3">
                  <span>Start Your Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-slate-900 transition-all duration-300">
                  Schedule a Demo
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-teal-100">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-teal-100">Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-teal-100">24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-slate-200">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">EcoManage</span>
          </div>
          <p className="text-slate-600 mb-2">
            © 2024 EcoManage. Pioneering sustainable waste management through innovation.
          </p>
          <p className="text-sm text-slate-500">
            ISO 14001 Certified | Carbon Neutral Operations | B Corp Pending
          </p>
        </footer>
      </main>
    </div>
  );
}