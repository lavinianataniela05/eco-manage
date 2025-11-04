"use client";

import React, { useState, useEffect } from 'react';
import { 
  Leaf, MapPin, Award, Recycle, Calendar, Globe, History, User, 
  Info, Map, Sparkles, Crown, Zap, Users, Target, TreePine, 
  ChevronRight, CheckCircle, ArrowRight, TrendingUp, Shield, 
  Lightbulb, BarChart3, Activity, Star, Clock, Cpu, Database,
  ShieldCheck, Zap as Lightning, Cloud, Cpu as AI
} from 'lucide-react';

export default function ModernDashboard() {
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
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);

    const duration = 2000;
    const steps = 60;
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

  // Data structures
  const stats = [
    { 
      label: "Waste Processed", 
      value: "12.5k", 
      unit: "tonnes", 
      icon: Recycle, 
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+18%"
    },
    { 
      label: "CO₂ Saved", 
      value: "8.9k", 
      unit: "tonnes", 
      icon: Globe, 
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      trend: "+22%"
    },
    { 
      label: "Trees Equivalent", 
      value: "4.5k", 
      unit: "planted", 
      icon: TreePine, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+15%"
    },
    { 
      label: "Communities", 
      value: "150", 
      unit: "cities", 
      icon: Users, 
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      trend: "+8%"
    }
  ];

  const features = [
    {
      icon: AI,
      title: "AI Optimization",
      description: "Machine learning algorithms optimize collection routes and processing efficiency",
      color: "from-purple-500 to-pink-600",
      stat: "40% efficiency gain"
    },
    {
      icon: Database,
      title: "Smart Analytics",
      description: "Real-time monitoring and predictive analytics across all operations",
      color: "from-blue-500 to-cyan-600",
      stat: "500+ sensors"
    },
    {
      icon: ShieldCheck,
      title: "Blockchain Verification",
      description: "Immutable sustainability credits and transparent impact tracking",
      color: "from-emerald-500 to-teal-600",
      stat: "100% verified"
    },
    {
      icon: Cloud,
      title: "Cloud Platform",
      description: "Scalable infrastructure with real-time collaboration and reporting",
      color: "from-orange-500 to-amber-600",
      stat: "99.9% uptime"
    }
  ];

  const capabilities = [
    { 
      name: "Recycling Network", 
      icon: Map, 
      description: "500+ verified facilities worldwide",
      color: "from-violet-500 to-purple-600"
    },
    { 
      name: "Impact Analytics", 
      icon: BarChart3, 
      description: "Real-time environmental metrics",
      color: "from-blue-500 to-cyan-600"
    },
    { 
      name: "Smart Collection", 
      icon: Calendar, 
      description: "AI-optimized scheduling",
      color: "from-emerald-500 to-teal-600"
    },
    { 
      name: "Rewards System", 
      icon: Award, 
      description: "Earn and redeem eco-credits",
      color: "from-amber-500 to-orange-600"
    },
    { 
      name: "Enterprise API", 
      icon: Cpu, 
      description: "Seamless system integration",
      color: "from-indigo-500 to-blue-600"
    },
  ];

  const materials = [
    { 
      icon: "♻️", 
      name: "Plastic", 
      count: "2,345 tons",
      efficiency: "94%",
      points: 150,
      trend: "+12%",
      color: "from-blue-400 to-cyan-600"
    },
    { 
      icon: "📄", 
      name: "Paper", 
      count: "1,876 tons",
      efficiency: "91%",
      points: 120,
      trend: "+8%",
      color: "from-amber-400 to-orange-600"
    },
    { 
      icon: "⚙️", 
      name: "Metals", 
      count: "945 tons",
      efficiency: "97%",
      points: 200,
      trend: "+15%",
      color: "from-slate-400 to-slate-700"
    },
    { 
      icon: "🌱", 
      name: "Organic", 
      count: "3,124 tons",
      efficiency: "89%",
      points: 100,
      trend: "+10%",
      color: "from-green-400 to-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/20 to-emerald-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-cyan-100/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          {/* <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">EcoManage</h1>
              <p className="text-slate-600 text-sm">Sustainability Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-6 py-2.5 text-slate-700 hover:text-slate-900 transition-colors font-medium">
              Login
            </button>
            <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
              Get Started
            </button>
          </div> */}
        </header>

        {/* Hero Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Next-Gen Waste Management</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                  Intelligent
                  <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Sustainability
                  </span>
                  Platform
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  Transform your environmental impact with AI-powered waste management, 
                  real-time analytics, and blockchain-verified sustainability credits.
                </p>
              </div>

              
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-600">{stat.unit}</div>
                      <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Advanced Technology Stack
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powered by cutting-edge technologies to deliver maximum environmental impact and operational efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-500 ${
                    isActive 
                      ? 'border-emerald-300 shadow-xl scale-[1.02]' 
                      : 'border-slate-200 shadow-lg hover:border-slate-300'
                  }`}
                >
                  <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>{feature.stat}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Platform Capabilities
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive suite of tools designed for modern waste management and sustainability tracking
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <button
                  key={index}
                  className="group bg-white rounded-2xl p-6 text-left border border-slate-200 shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
                >
                  <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${capability.color} w-fit group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {capability.name}
                  </h3>
                  
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {capability.description}
                  </p>
                  
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Materials Processing Section */}
        <section className="mb-16">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Recycle className="w-4 h-4" />
                    <span>Material Recovery</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Advanced Processing Efficiency
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Our AI-powered facilities achieve industry-leading recovery rates through 
                    machine learning and computer vision technology.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    "AI-powered contamination detection (99.8% accuracy)",
                    "Real-time quality assessment and analytics",
                    "35% reduction in energy consumption",
                    "Automated sorting and processing"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  <span>Explore Facilities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {materials.map((material, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredWaste(index)}
                    onMouseLeave={() => setHoveredWaste(null)}
                    className={`bg-gradient-to-br ${material.color} rounded-2xl p-4 text-white transition-all duration-300 ${
                      hoveredWaste === index ? 'scale-105 shadow-2xl' : 'shadow-lg'
                    }`}
                  >
                    <div className="text-2xl mb-2">{material.icon}</div>
                    <div className="space-y-1">
                      <div className="font-semibold">{material.name}</div>
                      <div className="text-sm opacity-90">{material.count}</div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/20">
                        <div className="text-xs">
                          <div className="opacity-80">Efficiency</div>
                          <div className="font-bold">{material.efficiency}</div>
                        </div>
                        <div className="text-xs text-right">
                          <div className="opacity-80">Points</div>
                          <div className="font-bold">{material.points}/kg</div>
                        </div>
                      </div>
                      <div className="text-xs font-medium opacity-90">
                        {material.trend} this month
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-slate-900 to-emerald-900 rounded-3xl p-12 text-center text-white">
            <div className="max-w-2xl mx-auto">
              <Crown className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Environmental Impact?
              </h2>
              <p className="text-lg text-emerald-100 mb-8 leading-relaxed">
                Join thousands of organizations making measurable environmental impact. 
                Start your journey towards a sustainable future today.
              </p>
              
              <div className="flex justify-center space-x-6 mt-8 text-sm text-emerald-200">
                <span>No credit card required</span>
                <span>•</span>
                <span>Cancel anytime</span>
                <span>•</span>
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-slate-200">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
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