'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  Recycle,
  Users,
  Target,
  Award,
  CheckCircle,
  Globe,
  TreePine,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Map,
  Calendar,
  History,
  BarChart3,
  ShieldCheck,
  Cpu,
  Cloud,
  Crown,
  Zap,
  TrendingUp,
  Activity,
  Star,
  Clock
} from 'lucide-react';

const FINAL_COUNTS = {
  wasteProcessed: 250000,
  co2Saved: 15000,
  treesPlanted: 5000,
  communitiesServed: 150
};

const VALUES = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Environmental Stewardship',
    description: "We're committed to protecting our planet through innovative recycling solutions and sustainable practices.",
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Community Impact',
    description: 'Building stronger communities through education, job creation, and accessible recycling programs.',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Innovation Focus',
    description: 'Leveraging cutting-edge technology to transform waste into valuable resources for a circular economy.',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Quality Excellence',
    description: 'Maintaining the highest standards in waste processing while ensuring environmental compliance.',
    color: 'from-amber-500 to-orange-600'
  }
];

const TIMELINE = [
  {
    year: '2018',
    title: 'The Beginning',
    description: 'Founded with a vision to revolutionize waste management in urban communities.',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    year: '2019',
    title: 'First Facility',
    description: 'Opened our first state-of-the-art recycling facility, processing 1,000 tons monthly.',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    year: '2021',
    title: 'Technology Integration',
    description: 'Implemented AI-powered sorting systems, increasing efficiency by 300%.',
    color: 'from-purple-400 to-pink-500'
  },
  {
    year: '2023',
    title: 'Community Expansion',
    description: 'Expanded to serve 150+ communities with comprehensive recycling programs.',
    color: 'from-green-400 to-emerald-500'
  },
  {
    year: '2025',
    title: 'Future Forward',
    description: 'Leading the industry with zero-waste initiatives and carbon-neutral operations.',
    color: 'from-teal-400 to-emerald-500'
  }
];

const TECHNOLOGIES = [
  {
    icon: Cpu,
    title: "AI Optimization",
    description: "Machine learning algorithms optimize collection routes and processing efficiency",
    color: "from-purple-500 to-pink-600",
    stat: "40% efficiency gain"
  },
  {
    icon: BarChart3,
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
    color: "from-amber-500 to-orange-600",
    stat: "99.9% uptime"
  }
];

type StatProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
};

const Stat = ({ icon, label, value, color }: StatProps) => (
  <div className="group text-center">
    <div className={`relative inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <div className="text-white">
        {icon}
      </div>
    </div>
    <div className={`text-2xl font-bold bg-gradient-to-br ${color} bg-clip-text text-transparent mb-2`}>
      {Math.floor(value).toLocaleString()}+
    </div>
    <div className="text-slate-600 font-medium text-sm uppercase tracking-wide">{label}</div>
  </div>
);

const FloatingShape = ({ delay = 0, className = "" }: { delay?: number; className?: string }) => (
  <div 
    className={`absolute bg-gradient-to-br from-emerald-100/30 to-teal-100/20 rounded-lg animate-float ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
    }}
  />
);

export default function AboutUs() {
  const router = useRouter();
  const [counters, setCounters] = useState({
    wasteProcessed: 0,
    co2Saved: 0,
    treesPlanted: 0,
    communitiesServed: 0
  });

  const [isVisible, setIsVisible] = useState(false);
  const [activeTech, setActiveTech] = useState(0);

  // Navigation handlers
  const handleMissionClick = () => {
    document.getElementById('mission-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoinMovement = () => {
    document.getElementById('core-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartRecycling = () => {
    router.push('/delivery-collection');
  };

  const handleLearnPrograms = () => {
    router.push('/dashboard');
  };

  useEffect(() => {
    setIsVisible(true);
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setCounters(prev => ({
        wasteProcessed: Math.min(
          prev.wasteProcessed + FINAL_COUNTS.wasteProcessed / steps,
          FINAL_COUNTS.wasteProcessed
        ),
        co2Saved: Math.min(
          prev.co2Saved + FINAL_COUNTS.co2Saved / steps,
          FINAL_COUNTS.co2Saved
        ),
        treesPlanted: Math.min(
          prev.treesPlanted + FINAL_COUNTS.treesPlanted / steps,
          FINAL_COUNTS.treesPlanted
        ),
        communitiesServed: Math.min(
          prev.communitiesServed + FINAL_COUNTS.communitiesServed / steps,
          FINAL_COUNTS.communitiesServed
        )
      }));
    }, interval);

    const techInterval = setInterval(() => {
      setActiveTech(prev => (prev + 1) % TECHNOLOGIES.length);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(techInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/20 to-emerald-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-cyan-100/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <FloatingShape delay={0} className="w-24 h-24 top-20 left-10 rotate-45" />
          <FloatingShape delay={2} className="w-20 h-20 top-40 right-20 rotate-12" />
          <FloatingShape delay={4} className="w-28 h-28 bottom-32 left-1/4 -rotate-45" />
          <FloatingShape delay={1} className="w-16 h-16 bottom-20 right-1/3 rotate-90" />
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative p-4 bg-white/80 rounded-2xl backdrop-blur-sm border border-slate-200/60 shadow-sm">
                <Leaf className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 leading-tight">
              About <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">EcoManage</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              Transforming waste into wonder through AI-powered innovation and sustainable practices. 
              Pioneering the future of circular economy with cutting-edge technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleMissionClick}
                className="group bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>Our Mission</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleJoinMovement}
                className="group border border-emerald-600 text-emerald-600 px-8 py-3 rounded-full font-semibold bg-white/80 backdrop-blur-sm hover:bg-emerald-600 hover:text-white transition-all duration-300 flex items-center space-x-2"
              >
                <span>Our Values</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white relative">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="mb-16">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Activity className="w-4 h-4" />
                <span>Environmental Impact</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Real Impact, Real Numbers</h2>
              <p className="text-slate-600 font-light">Measurable environmental progress through innovative technology</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <Stat icon={<Recycle className="w-6 h-6" />} label="Tons Recycled" value={counters.wasteProcessed} color="from-emerald-500 to-teal-600" />
              <Stat icon={<Globe className="w-6 h-6" />} label="Tons CO₂ Saved" value={counters.co2Saved} color="from-blue-500 to-cyan-600" />
              <Stat icon={<TreePine className="w-6 h-6" />} label="Trees Planted" value={counters.treesPlanted} color="from-green-500 to-emerald-600" />
              <Stat icon={<Users className="w-6 h-6" />} label="Communities Served" value={counters.communitiesServed} color="from-purple-500 to-pink-600" />
            </div>
          </div>
        </section>

        {/* Mission and Vision */}
        <section id="mission-section" className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.01)_25%,rgba(0,0,0,0.01)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.01)_75%)] bg-[size:4rem_4rem]" />
          
          <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm font-medium mb-4">
                Our Purpose
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To create a sustainable future by transforming waste into valuable resources through 
                AI-powered innovation, community engagement, and environmental stewardship.
              </p>
              <div className="space-y-3">
                {[
                  'Zero waste to landfill by 2030',
                  'Carbon neutral operations',
                  'AI-optimized collection routes',
                  'Blockchain-verified impact tracking'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 group-hover:text-emerald-600 transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-4">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  A world where waste doesn't exist — only resources in transition. We envision thriving 
                  circular economies powered by AI, blockchain, and collective action for a sustainable future.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                <span>Technology Stack</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Powered by Innovation</h2>
              <p className="text-slate-600 font-light max-w-2xl mx-auto">
                Cutting-edge technologies driving environmental transformation and operational excellence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TECHNOLOGIES.map((tech, index) => {
                const Icon = tech.icon;
                const isActive = activeTech === index;
                
                return (
                  <div
                    key={index}
                    className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-500 ${
                      isActive 
                        ? 'border-emerald-300 shadow-xl scale-[1.02]' 
                        : 'border-slate-200 shadow-lg hover:border-slate-300'
                    }`}
                  >
                    <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${tech.color} w-fit`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {tech.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {tech.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span>{tech.stat}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section id="core-section" className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50/20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                <span>Our Values</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Values</h2>
              <p className="text-slate-600 font-light max-w-2xl mx-auto">
                Guiding every decision and action we take towards a sustainable future
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VALUES.map((value, i) => (
                <div
                  key={i}
                  className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {value.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                  
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="relative max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <History className="w-4 h-4" />
                <span>Our Journey</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">From Vision to Impact</h2>
              <p className="text-slate-600 font-light">Building the future of sustainability, one innovation at a time</p>
            </div>
            
            <div className="relative">
              <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-300/30 to-teal-400/30 rounded-full" />
              
              <div className="space-y-8">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="relative flex items-center">
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} order-2 md:order-${i % 2 === 0 ? '1' : '3'}`}>
                      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 max-w-md mx-auto md:mx-0">
                        <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white font-medium text-xs mb-3`}>
                          {item.year}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center order-1 md:order-2 z-10">
                      <div className={`w-4 h-4 rounded-full border-4 border-white shadow-lg bg-gradient-to-r ${item.color}`} />
                    </div>
                    
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} order-3 md:order-${i % 2 === 0 ? '3' : '1'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-20 bg-gradient-to-r from-slate-900 to-emerald-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          
          <div className="relative max-w-3xl mx-auto text-center px-6">
            <div className="mb-8">
              <Crown className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Environmental Impact?</h2>
              <p className="text-emerald-100 mb-8 leading-relaxed">
                Join thousands of organizations making measurable environmental impact. 
                Start your journey towards a sustainable future today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartRecycling}
                className="group bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>Start Recycling Today</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleLearnPrograms}
                className="group border border-white/30 text-white px-8 py-3 rounded-full font-semibold backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Explore Programs</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            <div className="flex justify-center space-x-6 mt-8 text-sm text-emerald-200">
              <span>No credit card required</span>
              <span>•</span>
              <span>Cancel anytime</span>
              <span>•</span>
              <span>24/7 support</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-slate-200 bg-white">
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