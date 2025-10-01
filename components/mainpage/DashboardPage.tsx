// "use client";

// import React, { useState, useEffect } from 'react';
// import { Leaf, MapPin, Phone, Mail, Award, Recycle, Calendar, Globe, History, User, Info, Map } from 'lucide-react'; // Added Map, History, User, Info for new buttons
// import { motion, AnimatePresence } from 'framer-motion';

// export default function Dashboard() {
//   const [isVisible, setIsVisible] = useState(false);
//   const [activeFeature, setActiveFeature] = useState(0);

//   useEffect(() => {
//     setIsVisible(true);
//     const interval = setInterval(() => {
//       setActiveFeature(prev => (prev + 1) % 4);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   const features = [
//     {
//       icon: Calendar,
//       title: "Smart Pickup",
//       description: "AI-powered scheduling for optimal waste collection routes",
//       color: "bg-emerald-100"
//     },
//     {
//       icon: MapPin,
//       title: "Smart Locations",
//       description: "IoT-enabled drop boxes with real-time capacity monitoring",
//       color: "bg-teal-100"
//     },
//     {
//       icon: Award,
//       title: "Eco Rewards",
//       description: "Blockchain-verified points for sustainable waste disposal",
//       color: "bg-green-100"
//     },
//     {
//       icon: Globe,
//       title: "Green Impact",
//       description: "Real-time carbon footprint reduction tracking",
//       color: "bg-cyan-100"
//     }
//   ];

//   const wasteTypes = [
//     { icon: "🔄", name: "Plastic", color: "from-blue-100 to-blue-200", count: "2.3k" },
//     { icon: "📄", name: "Paper", color: "from-amber-100 to-amber-200", count: "1.8k" },
//     { icon: "⚙️", name: "Metal", color: "from-gray-100 to-gray-200", count: "945" },
//     { icon: "🌱", name: "Organic", color: "from-green-100 to-green-200", count: "3.1k" }
//   ];

//   // New array for feature buttons
//   const featureButtons = [
//     { name: "Recycling Center", icon: Map, href: "/recycling-centers" },
//     { name: "Waste Tracking", icon: History, href: "/waste-tracking" },
//     { name: "Collection", icon: Calendar, href: "/delivery-collection" },
//     { name: "Profile & Rewards", icon: User, href: "/profile-reward" },
//     { name: "About Us", icon: Info, href: "/about" },
//   ];

//   return (
//     <div className="p-8 bg-green-50 min-h-screen">
//       {/* Decorative elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         {[...Array(15)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full bg-emerald-50/80"
//             initial={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               width: `${100 + Math.random() * 200}px`,
//               height: `${100 + Math.random() * 200}px`,
//             }}
//             animate={{
//               opacity: [0.1, 0.3, 0.1],
//             }}
//             transition={{
//               duration: 15 + Math.random() * 15,
//               repeat: Infinity,
//               repeatType: "reverse",
//             }}
//           />
//         ))}
//       </div>

//       <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
//         {/* Hero Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 shadow-sm mb-16 min-h-[500px] min-w-[280px]"
//         >
//           <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 bg-cover"></div>
          
//           <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-between">
//             <motion.div 
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2, duration: 0.6 }}
//               className="flex items-center gap-4 mb-8 flex-wrap"
//             >
//               <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
//                 <Leaf className="w-12 h-12 text-emerald-600" />
//               </div>
//               <div>
//                 <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-2 tracking-tight">
//                   Eco<span className="text-emerald-600">Waste</span>
//                 </h1>
//                 <p className="text-lg md:text-2xl text-gray-600 font-light">
//                   Revolutionizing waste management with AI & IoT
//                 </p>
//               </div>
//             </motion.div>
            
//             <div className="grid md:grid-cols-2 gap-8 items-end">
//               <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4, duration: 0.6 }}
//                 className="space-y-4"
//               >
//                 <div className="flex items-center gap-3 text-gray-700">
//                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
//                   <span className="text-lg font-medium">Live Impact Tracking</span>
//                 </div>
//                 <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
//                   <div className="grid grid-cols-3 gap-4 text-gray-800 text-center">
//                     <div>
//                       <div className="text-3xl font-bold text-emerald-600">12.5k</div>
//                       <div className="text-sm text-gray-500">Kg Recycled</div>
//                     </div>
//                     <div>
//                       <div className="text-3xl font-bold text-teal-600">890</div>
//                       <div className="text-sm text-gray-500">Active Users</div>
//                     </div>
//                     <div>
//                       <div className="text-3xl font-bold text-cyan-600">45%</div>
//                       <div className="text-sm text-gray-500">CO₂ Reduced</div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
              
//               <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6, duration: 0.6 }}
//                 className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm"
//               >
//                 <p className="text-gray-700 text-lg leading-relaxed">
//                   Join the revolution in sustainable waste management. Our smart platform connects 
//                   communities, optimizes collection routes, and rewards environmental responsibility.
//                 </p>
//                 {/* Changed button to an anchor tag for navigation */}
//                 <motion.a
//                   href="/delivery-collection" // Example: Link to a signup page
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="mt-6 inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium text-lg shadow-sm hover:shadow-md transition-all"
//                   aria-label="Get started with EcoManage"
//                 >
//                   Get Started
//                 </motion.a>
//               </motion.div>
//             </div>
//           </div>
//         </motion.section>

//         {/* Feature Buttons Section */}
//         <section className="mb-20">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, margin: "0px 0px -100px 0px" }}
//             transition={{ duration: 0.6 }}
//             className="text-center mb-10"
//           >
//             <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
//               Explore Our <span className="text-emerald-600">Features</span>
//             </h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               Access key functionalities for a smarter waste management experience
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
//             {featureButtons.map((button, index) => {
//               const Icon = button.icon;
//               return (
//                 <motion.a
//                   key={index}
//                   href={button.href}
//                   whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
//                   whileTap={{ scale: 0.98 }}
//                   className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm transition-all duration-300 text-center group"
//                   aria-label={`Go to ${button.name} page`}
//                 >
//                   <div className="p-4 mb-4 rounded-xl bg-emerald-500 group-hover:bg-emerald-600 transition-colors duration-300">
//                     <Icon className="w-8 h-8 text-white" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
//                     {button.name}
//                   </h3>
//                 </motion.a>
//               );
//             })}
//           </div>
//         </section>

//         {/* Features Section (Existing) */}
//         <section className="mb-20">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, margin: "0px 0px -100px 0px" }}
//             transition={{ duration: 0.6 }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
//               How It <span className="text-emerald-600">Works</span>
//             </h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               Experience the future of waste management with our intelligent ecosystem
//             </p>
//           </motion.div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {features.map((feature, index) => {
//               const Icon = feature.icon;
//               const isActive = activeFeature === index;
              
//               return (
//                 <motion.div
//                   key={index}
//                   whileHover={{ y: -5 }}
//                   className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-300 ${
//                     isActive ? 'shadow-md border border-emerald-200' : 'shadow-sm hover:shadow-md border border-gray-100'
//                   } ${feature.color}`}
//                   aria-label={feature.title}
//                 >
//                   <AnimatePresence>
//                     {isActive && (
//                       <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 0.2 }}
//                         exit={{ opacity: 0 }}
//                         className="absolute inset-0 bg-emerald-200/30"
//                       />
//                     )}
//                   </AnimatePresence>
                  
//                   <div className="relative z-10">
//                     <div className={`mb-6 p-4 rounded-2xl transition-all duration-300 inline-flex ${
//                       isActive ? 'bg-emerald-600' : 'bg-emerald-500'
//                     }`}>
//                       <Icon className="w-8 h-8 text-white" />
//                     </div>
                    
//                     <h3 className="text-xl font-bold mb-3 text-gray-900">
//                       {feature.title}
//                     </h3>
                    
//                     <p className="text-gray-600">
//                       {feature.description}
//                     </p>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </section>

//         {/* Waste Types Section (Existing) */}
//         <section className="mb-20">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, margin: "0px 0px -100px 0px" }}
//             transition={{ duration: 0.6 }}
//             className="bg-white rounded-3xl shadow-sm p-8 md:p-12 border border-emerald-100"
//           >
//             <div className="grid lg:grid-cols-2 gap-12 items-center">
//               <motion.div 
//                 initial={{ opacity: 0, x: -20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//                 className="order-2 lg:order-1 min-w-[280px]"
//               >
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-emerald-100/30 rounded-3xl blur-xl"></div>
//                   <div className="relative bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm">
//                     <div className="grid grid-cols-2 gap-6">
//                       {wasteTypes.map((waste, index) => (
//                         <motion.div
//                           key={index}
//                           whileHover={{ y: -5 }}
//                           className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
//                           aria-label={`${waste.name} waste type`}
//                         >
//                           <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${waste.color} text-gray-800 text-center shadow-sm`}>
//                             <div className="text-2xl mb-1">{waste.icon}</div>
//                             <div className="text-xs font-medium">{waste.count} tons</div>
//                           </div>
//                           <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
//                             {waste.name}
//                           </h3>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
              
//               <motion.div 
//                 initial={{ opacity: 0, x: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, margin: "0px 0px -100px 0px" }}
//                 transition={{ duration: 0.6 }}
//                 className="order-1 lg:order-2"
//               >
//                 <div className="space-y-6">
//                   <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
//                     <Recycle className="w-4 h-4" />
//                     Smart Sorting
//                   </div>
                  
//                   <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
//                     Choose Your <span className="text-emerald-600">Waste Type</span>
//                   </h2>
                  
//                   <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
//                     Our AI-powered sorting system automatically categorizes your waste for maximum 
//                     recycling efficiency. Each type is processed using cutting-edge environmental technologies.
//                   </p>
                  
//                   <div className="space-y-4">
//                     {[
//                       "Real-time contamination detection",
//                       "Automated quality assessment",
//                       "Optimized processing pathways"
//                     ].map((item, index) => (
//                       <motion.div 
//                         key={index}
//                         whileHover={{ x: 5 }}
//                         className="flex items-center gap-3"
//                       >
//                         <div className={`w-2 h-2 rounded-full ${
//                           index === 0 ? 'bg-emerald-500' : 
//                           index === 1 ? 'bg-teal-500' : 'bg-cyan-500'
//                         }`}></div>
//                         <span className="text-gray-700">{item}</span>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         </section>

//       </main>
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect } from 'react';
import { Leaf, MapPin, Phone, Mail, Award, Recycle, Calendar, Globe, History, User, Info, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Pickup Scheduling",
      description: "AI-optimized collection routes reducing emissions and improving efficiency",
      color: "from-emerald-50 to-emerald-100"
    },
    {
      icon: MapPin,
      title: "Smart Locations Network",
      description: "IoT-enabled drop boxes with real-time capacity monitoring and analytics",
      color: "from-teal-50 to-teal-100"
    },
    {
      icon: Award,
      title: "Eco Rewards System",
      description: "Blockchain-verified sustainability points and reward redemption",
      color: "from-green-50 to-green-100"
    },
    {
      icon: Globe,
      title: "Environmental Impact",
      description: "Comprehensive carbon footprint reduction tracking and reporting",
      color: "from-cyan-50 to-cyan-100"
    }
  ];

  const wasteTypes = [
    { icon: "🔄", name: "Plastic", color: "from-blue-50 to-blue-100", count: "2.3k", subtitle: "Polymer Recycling" },
    { icon: "📄", name: "Paper", color: "from-amber-50 to-amber-100", count: "1.8k", subtitle: "Fiber Recovery" },
    { icon: "⚙️", name: "Metal", color: "from-slate-50 to-slate-100", count: "945", subtitle: "Metal Reclamation" },
    { icon: "🌱", name: "Organic", color: "from-green-50 to-green-100", count: "3.1k", subtitle: "Compost Processing" }
  ];

  const featureButtons = [
    { name: "Recycling Centers", icon: Map, href: "/recycling-centers", description: "Find nearby facilities" },
    { name: "Waste Tracking", icon: History, href: "/waste-tracking", description: "Monitor your impact" },
    { name: "Collection Schedule", icon: Calendar, href: "/delivery-collection", description: "Manage pickups" },
    { name: "Profile & Rewards", icon: User, href: "/profile-reward", description: "Your eco-profile" },
    { name: "About Our Mission", icon: Info, href: "/about", description: "Learn more" },
  ];

  const stats = [
    { value: "12.5k", label: "Kg Recycled", change: "+12%", color: "text-emerald-600" },
    { value: "890", label: "Active Users", change: "+8%", color: "text-teal-600" },
    { value: "45%", label: "CO₂ Reduction", change: "+5%", color: "text-cyan-600" },
    { value: "98%", label: "Efficiency Rate", change: "+3%", color: "text-blue-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50">
      {/* Enhanced background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent"></div>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-emerald-200/10 to-teal-200/10"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${150 + Math.random() * 300}px`,
              height: `${150 + Math.random() * 300}px`,
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Enhanced Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/80 border border-emerald-200/50 shadow-xl mb-16 min-h-[560px] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] bg-cover"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-300/10 rounded-full -translate-y-36 translate-x-36"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-300/10 rounded-full translate-y-48 -translate-x-48"></div>
          
          <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-6 mb-8 flex-wrap"
            >
              <div className="p-4 bg-white/80 rounded-2xl shadow-lg border border-emerald-100/50 backdrop-blur-sm">
                <Leaf className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-3 tracking-tight">
                  Eco<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Waste</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl">
                  Intelligent waste management solutions powered by AI and IoT technology
                </p>
              </div>
            </motion.div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center mt-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-medium">Live Environmental Impact Dashboard</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 border border-emerald-100/50 shadow-lg backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                        <div className="text-xs text-emerald-500 font-semibold">{stat.change}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-white/80 rounded-2xl p-8 border border-emerald-100/50 shadow-lg backdrop-blur-sm"
              >
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Join thousands of environmentally conscious users in our mission to transform waste management. 
                  Our platform leverages cutting-edge technology to create sustainable communities.
                </p>
                <div className="flex gap-4">
                  <motion.a
                    href="/delivery-collection"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold text-center shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started
                  </motion.a>
                  <motion.a
                    href="/about"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl font-semibold text-center bg-white/50 hover:bg-emerald-50 transition-all"
                  >
                    Learn More
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Enhanced Feature Buttons Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed for efficient waste management and environmental impact tracking
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {featureButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <motion.a
                  key={index}
                  href={button.href}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-white/80 rounded-2xl p-6 border border-emerald-100/50 shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:from-emerald-600 group-hover:to-teal-600 transition-all">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors mb-2">
                      {button.name}
                    </h3>
                    <p className="text-sm text-gray-600">{button.description}</p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Technology</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced solutions driving the future of sustainable waste management
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-500 bg-gradient-to-br ${feature.color} border border-white/50 shadow-lg hover:shadow-xl ${
                    isActive ? 'ring-2 ring-emerald-200/50' : ''
                  }`}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10"
                      />
                    )}
                  </AnimatePresence>
                  
                  <div className="relative z-10">
                    <div className={`mb-6 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg w-fit ${
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
          </div>
        </section>

        {/* Enhanced Waste Types Section */}
        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 rounded-3xl shadow-xl p-8 md:p-12 border border-emerald-100/50 backdrop-blur-sm"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="min-w-[280px]"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/90 rounded-3xl p-8 border border-emerald-100/50 shadow-lg backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {wasteTypes.map((waste, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100/50"
                        >
                          <div className={`mb-3 p-3 rounded-lg bg-gradient-to-br ${waste.color} text-gray-800 text-center shadow-sm`}>
                            <div className="text-2xl mb-1">{waste.icon}</div>
                            <div className="text-xs font-semibold opacity-75">{waste.count} tons</div>
                          </div>
                          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm">
                            {waste.name}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">{waste.subtitle}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <Recycle className="w-4 h-4" />
                  Advanced Material Recovery
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Sustainable <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Material Processing</span>
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
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-emerald-500 to-emerald-400' : 
                        index === 1 ? 'from-teal-500 to-teal-400' : 'from-cyan-500 to-cyan-400'
                      }`}></div>
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Footer Section */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-8 border-t border-emerald-100/50"
        >
          <p className="text-gray-600">
            © 2024 EcoWaste. Transforming waste management through innovation.
          </p>
        </motion.footer>
      </main>
    </div>
  );
}