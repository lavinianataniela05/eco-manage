'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  Recycle,
  Users,
  Target,
  Award,
  ArrowRight,
  CheckCircle,
  Globe,
  TreePine,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const FINAL_COUNTS = {
  wasteProcessed: 250000,
  co2Saved: 15000,
  treesPlanted: 5000,
  communitiesServed: 150
};

const VALUES = [
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Environmental Stewardship',
    description: "We're committed to protecting our planet through innovative recycling solutions and sustainable practices.",
    color: 'text-teal-500'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Community Impact',
    description: 'Building stronger communities through education, job creation, and accessible recycling programs.',
    color: 'text-blue-500'
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Innovation Focus',
    description: 'Leveraging cutting-edge technology to transform waste into valuable resources for a circular economy.',
    color: 'text-purple-500'
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: 'Quality Excellence',
    description: 'Maintaining the highest standards in waste processing while ensuring environmental compliance.',
    color: 'text-amber-500'
  }
];

const TIMELINE = [
  {
    year: '2018',
    title: 'The Beginning',
    description: 'Founded with a vision to revolutionize waste management in urban communities.',
    color: 'bg-teal-400'
  },
  {
    year: '2019',
    title: 'First Facility',
    description: 'Opened our first state-of-the-art recycling facility, processing 1,000 tons monthly.',
    color: 'bg-blue-400'
  },
  {
    year: '2021',
    title: 'Technology Integration',
    description: 'Implemented AI-powered sorting systems, increasing efficiency by 300%.',
    color: 'bg-purple-400'
  },
  {
    year: '2023',
    title: 'Community Expansion',
    description: 'Expanded to serve 150+ communities with comprehensive recycling programs.',
    color: 'bg-emerald-400'
  },
  {
    year: '2025',
    title: 'Future Forward',
    description: 'Leading the industry with zero-waste initiatives and carbon-neutral operations.',
    color: 'bg-green-400'
  }
];

type StatProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
};

const Stat = ({ icon, label, value, color }: StatProps) => (
  <div className={`group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-100`}>
    <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600 mb-4 mx-auto w-fit group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    
    <div className={`text-4xl font-bold text-${color}-600 mb-2`}>
      {Math.floor(value).toLocaleString()}+
    </div>
    <div className="text-gray-600 font-medium">{label}</div>
  </div>
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
    const duration = 2500;
    const steps = 100;
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

    const timeout = setTimeout(() => {
      clearInterval(timer);
      setCounters(FINAL_COUNTS);
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  const FloatingElement = ({ delay = 0, children }: { delay?: number; children: React.ReactNode }) => (
    <div 
      className="absolute animate-pulse opacity-20"
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '4s'
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <FloatingElement delay={0}>
            <Leaf className="w-32 h-32 text-teal-200 top-20 left-10" />
          </FloatingElement>
          <FloatingElement delay={1}>
            <Recycle className="w-24 h-24 text-emerald-200 top-40 right-20" />
          </FloatingElement>
          <FloatingElement delay={2}>
            <TreePine className="w-28 h-28 text-green-200 bottom-32 left-1/4" />
          </FloatingElement>
          <FloatingElement delay={0.5}>
            <Globe className="w-20 h-20 text-blue-200 bottom-20 right-1/3" />
          </FloatingElement>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/90 via-emerald-700/80 to-green-800/90"></div>
        
        {/* Main Content */}
        <div className={`relative z-10 text-center px-6 max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative p-6 bg-white/10 rounded-full backdrop-blur-lg border border-white/20 inline-block">
              <Leaf className="w-16 h-16 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-teal-100 to-emerald-100 bg-clip-text text-transparent leading-tight">
            About EcoWaste
          </h1>
          
          <p className="text-xl md:text-2xl text-teal-100 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
            Transforming waste into wonder, one community at a time. We're pioneering the future of sustainable recycling with cutting-edge innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleMissionClick}
              className="group bg-white text-teal-700 px-8 py-4 rounded-full font-semibold hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Our Mission</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleJoinMovement}
              className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-teal-700 transition-all duration-300"
            >
              Our Core Values
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-emerald-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Environmental Impact</h2>
            <p className="text-lg text-gray-600 font-light">Real numbers, real change, real impact</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stat icon={<Recycle className="w-8 h-8" />} label="Tons Recycled" value={counters.wasteProcessed} color="teal" />
            <Stat icon={<Globe className="w-8 h-8" />} label="Tons CO₂ Saved" value={counters.co2Saved} color="blue" />
            <Stat icon={<TreePine className="w-8 h-8" />} label="Trees Planted" value={counters.treesPlanted} color="emerald" />
            <Stat icon={<Users className="w-8 h-8" />} label="Communities Served" value={counters.communitiesServed} color="purple" />
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section id="mission-section" className="py-20 bg-gradient-to-br from-teal-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-teal-300 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-teal-100 mb-6 font-light leading-relaxed">
              To create a sustainable future by transforming waste into valuable resources through innovation, community engagement, and environmental stewardship.
            </p>
            <div className="space-y-4">
              {[
                'Zero waste to landfill by 2030',
                'Carbon neutral operations',
                'Community education & engagement',
                'Circular economy leadership'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 group">
                  <div className="p-2 bg-teal-500/20 rounded-full group-hover:bg-teal-400/30 transition-colors">
                    <CheckCircle className="w-6 h-6 text-teal-300" />
                  </div>
                  <span className="text-teal-100 text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-teal-300/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-teal-300 mr-3" />
                <h3 className="text-2xl font-bold">Our Vision</h3>
              </div>
              <p className="text-teal-100 text-lg font-light leading-relaxed">
                A world where waste doesn't exist — only resources in transition. We envision thriving circular economies that benefit every community, powered by innovation and sustained by collective action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id = "core-section"className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 font-light">Guiding every decision and action we take</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`p-3 rounded-lg ${value.color} bg-opacity-10 mb-4 mx-auto w-fit group-hover:scale-110 transition-transform`}>
                  {value.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/30 to-emerald-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 font-light">From bold vision to measurable impact</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-teal-400 to-emerald-500 rounded-full shadow-lg"></div>
            
            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <div key={i} className={`flex items-center ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${i % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                      <div className={`inline-block px-3 py-1 rounded-full ${item.color} text-white font-bold text-sm mb-3`}>
                        {item.year}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className={`absolute left-1/2 transform -translate-x-1/2 w-5 h-5 ${item.color} rounded-full border-4 border-white shadow-lg z-10`}></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-400/30 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center px-6">
          <div className="mb-8">
            <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-lg text-teal-100 mb-8 font-light leading-relaxed max-w-3xl mx-auto">
              Join thousands of environmental champions already making a difference. Together, we can build a greener, more sustainable future for generations to come.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartRecycling}
              className="group bg-white text-teal-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Start Recycling Today</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleLearnPrograms}
              className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-teal-700 transition-all duration-300"
            >
              Learn More About Our Programs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}