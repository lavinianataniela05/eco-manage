'use client'

import { motion } from 'framer-motion'
import { MapPin, Recycle, ArrowRight, Search, Filter, Clock, Star, Phone, X, ChevronDown, Heart, Bookmark, ShoppingBag, Sparkles, Crown } from 'lucide-react'
import { useState, useMemo } from 'react'

export default function RecyclingCenters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('distance')
  const [favorites, setFavorites] = useState<number[]>([])
  const [savedLocations, setSavedLocations] = useState<number[]>([])

  const centers = [
    {
      id: 1,
      name: "Green Valley Recycling",
      address: "123 Eco Drive, Portland, OR",
      distance: 1.2,
      accepts: ["Paper", "Plastic", "Glass", "Metal"],
      hours: "Mon-Sat: 8AM-6PM",
      rating: 4.8,
      phone: "(503) 555-0123",
      type: "general",
      isOpen: true,
      rewards: true,
      points: 150,
      image: "/recycling-center-1.jpg",
      features: ["Eco Rewards", "Fast Processing", "Educational Tours"]
    },
    {
      id: 2,
      name: "Earth Friendly Center",
      address: "456 Sustainability Blvd, Portland, OR",
      distance: 2.5,
      accepts: ["Electronics", "Batteries", "Hazardous Waste"],
      hours: "Tue-Sun: 9AM-5PM",
      rating: 4.6,
      phone: "(503) 555-0456",
      type: "specialty",
      isOpen: false,
      rewards: false,
      points: 0,
      image: "/recycling-center-2.jpg",
      features: ["Specialized Handling", "Certified Disposal"]
    },
    {
      id: 3,
      name: "Urban Recycle Hub",
      address: "789 Green Street, Portland, OR",
      distance: 3.1,
      accepts: ["Clothing", "Plastic", "Metal", "Textiles"],
      hours: "Daily: 7AM-7PM",
      rating: 4.9,
      phone: "(503) 555-0789",
      type: "general",
      isOpen: true,
      rewards: true,
      points: 200,
      image: "/recycling-center-3.jpg",
      features: ["24/7 Drop-off", "Community Events", "Eco Rewards"]
    },
    {
      id: 4,
      name: "Eco Tech Solutions",
      address: "321 Innovation Ave, Portland, OR",
      distance: 4.2,
      accepts: ["Electronics", "Computers", "Phones"],
      hours: "Mon-Fri: 10AM-6PM",
      rating: 4.7,
      phone: "(503) 555-0321",
      type: "electronics",
      isOpen: true,
      rewards: true,
      points: 175,
      image: "/recycling-center-4.jpg",
      features: ["Data Security", "Eco Rewards", "Tech Recycling"]
    },
    {
      id: 5,
      name: "Recycle & Reward Depot",
      address: "654 Eco Lane, Portland, OR",
      distance: 1.8,
      accepts: ["Plastic", "Glass", "Aluminum", "Cardboard"],
      hours: "Mon-Fri: 7AM-8PM, Sat-Sun: 9AM-5PM",
      rating: 4.5,
      phone: "(503) 555-0654",
      type: "general",
      isOpen: true,
      rewards: true,
      points: 225,
      image: "/recycling-center-5.jpg",
      features: ["High Points", "Eco Rewards", "Bulk Acceptance"]
    },
    {
      id: 6,
      name: "Green Earth Materials Exchange",
      address: "987 Conservation Way, Portland, OR",
      distance: 5.0,
      accepts: ["Construction Materials", "Wood", "Metal"],
      hours: "Wed-Sun: 8AM-4PM",
      rating: 4.3,
      phone: "(503) 555-0987",
      type: "specialty",
      isOpen: true,
      rewards: false,
      points: 0,
      image: "/recycling-center-6.jpg",
      features: ["Construction Focus", "Material Reuse"]
    }
  ]

  const materialTypes = [
    { value: 'all', label: 'All Types', icon: '🔄' },
    { value: 'general', label: 'General', icon: '♻️' },
    { value: 'electronics', label: 'Electronics', icon: '💻' },
    { value: 'specialty', label: 'Specialty', icon: '⚡' }
  ]

  const sortOptions = [
    { value: 'distance', label: 'Distance' },
    { value: 'rating', label: 'Rating' },
    { value: 'name', label: 'Name' },
    { value: 'points', label: 'Points' }
  ]

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSavedLocation = (id: number) => {
    setSavedLocations(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const filteredAndSortedCenters = useMemo(() => {
    let filtered = centers.filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           center.accepts.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesFilter = selectedFilter === 'all' || center.type === selectedFilter
      
      return matchesSearch && matchesFilter
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance
        case 'rating':
          return b.rating - a.rating
        case 'name':
          return a.name.localeCompare(b.name)
        case 'points':
          return b.points - a.points
        default:
          return 0
      }
    })
  }, [searchTerm, selectedFilter, sortBy])

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-green-50 to-teal-50/60">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto text-center relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 border border-white/30"
          >
            <Recycle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Eco Rewards Centers
          </h1>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover recycling centers near you and earn Eco Points for sustainable choices
          </p>
          
          {/* Enhanced Points Display */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/30 cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/30 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-emerald-100 text-sm font-medium">Your Eco Points</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-white">1,250</span>
                  <Crown className="w-5 h-5 text-yellow-300" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12 max-w-7xl mx-auto -mt-8 relative">
        {/* Search and Filter Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search centers, materials, or locations..."
                  className="w-full pl-12 pr-10 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white hover:border-emerald-300 placeholder:text-emerald-400/60 text-emerald-800"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all font-medium"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {materialTypes.find(t => t.value === selectedFilter)?.label}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 bg-white border border-emerald-200 rounded-xl shadow-lg p-2 min-w-[200px] z-10"
                  >
                    {materialTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setSelectedFilter(type.value)
                          setShowFilters(false)
                        }}
                        className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedFilter === type.value 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'hover:bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-200 font-medium appearance-none pr-10"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      Sort by {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
              </div>

              {/* Results Count */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-emerald-600 font-medium">
                  {filteredAndSortedCenters.length} center{filteredAndSortedCenters.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Centers Grid */}
        {filteredAndSortedCenters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-emerald-100"
          >
            <Recycle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">No centers found</h3>
            <p className="text-emerald-600">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredAndSortedCenters.map((center, index) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100 group"
              >
                {/* Header with Image */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-teal-500 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      onClick={() => toggleFavorite(center.id)}
                      className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                        favorites.includes(center.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(center.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-full backdrop-blur-sm bg-white/20 text-white hover:bg-white/30 transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${
                    center.isOpen 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {center.isOpen ? 'Open Now' : 'Closed'}
                  </div>

                  {/* Points Badge */}
                  {center.rewards && (
                    <div className="absolute bottom-4 left-4 flex items-center space-x-1 px-3 py-1 bg-yellow-400 rounded-full text-sm font-semibold text-emerald-900">
                      <Sparkles className="w-3 h-3" />
                      <span>+{center.points} pts</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title and Rating */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-emerald-900 mb-1">{center.name}</h3>
                      <div className="flex items-center text-emerald-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{center.distance} mi away</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-emerald-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-semibold text-emerald-800">{center.rating}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {center.features?.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Materials */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-2">Accepts:</h4>
                    <div className="flex flex-wrap gap-1">
                      {center.accepts.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg border border-emerald-200 font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-emerald-700">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                      <span>{center.hours}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">{center.address}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-200 flex gap-3">
                  <button
                    onClick={() => handleCall(center.phone)}
                    className="flex-1 flex items-center justify-center px-4 py-2 text-emerald-700 hover:text-emerald-800 hover:bg-white rounded-lg transition-all font-medium text-sm"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </button>
                  <button
                    onClick={() => handleDirections(center.address)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all font-medium text-sm"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Directions
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}