'use client'

import { motion } from 'framer-motion'
import { MapPin, Recycle, ArrowRight, Search, Filter, Clock, Star, Phone, X, ChevronDown, Heart, Bookmark, ShoppingBag } from 'lucide-react'
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
      image: "/recycling-center-1.jpg"
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
      image: "/recycling-center-2.jpg"
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
      image: "/recycling-center-3.jpg"
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
      image: "/recycling-center-4.jpg"
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
      image: "/recycling-center-5.jpg"
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
      image: "/recycling-center-6.jpg"
    }
  ]

  const materialTypes = ['all', 'general', 'electronics', 'specialty']
  const sortOptions = ['distance', 'rating', 'name']

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-25 to-sage-50" style={{background: 'linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 50%, #f0f8f0 100%)'}}>
      {/* Enhanced Hero Section with Points Display */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-100 via-emerald-75 to-sage-100" style={{background: 'linear-gradient(90deg, #dcf2dc 0%, #d4edda 50%, #e8f5e8 100%)'}}>
        <div className="relative px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-white/40 backdrop-blur-sm p-3 rounded-full shadow-sm">
                <Recycle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-semibold text-green-800 mb-3">
              Eco Rewards Centers
            </h1>
            <p className="text-lg text-green-700/80 max-w-2xl mx-auto mb-6">
              Recycle your items and earn points for sustainable products
            </p>
            
            {/* Points Display */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center bg-white/80 px-6 py-3 rounded-full shadow-sm border border-green-200 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-700">Your Eco Points: <span className="font-bold">1,250</span></span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Enhanced Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <div className="relative max-w-md mx-auto">
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" 
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search centers, materials, or rewards..."
                className="w-full pl-12 pr-10 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all bg-white shadow-sm hover:shadow-md placeholder:text-gray-400 text-gray-700"
                aria-label="Search recycling centers"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-white/80 border border-green-200/60 text-green-700 rounded-lg hover:bg-green-50/80 transition-all"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter: {selectedFilter === 'all' ? 'All Types' : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-sm border border-green-200/60 rounded-lg shadow-lg p-2 min-w-[200px] z-10"
                  >
                    {materialTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedFilter(type)
                          setShowFilters(false)
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedFilter === type 
                            ? 'bg-green-100/80 text-green-800' 
                            : 'hover:bg-green-50/80 text-green-700'
                        }`}
                      >
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/80 border border-green-200/60 rounded-lg text-green-700 outline-none focus:ring-2 focus:ring-green-300/50"
                >
                  <option value="distance">Sort by Distance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-green-600/80">
                {filteredAndSortedCenters.length} center{filteredAndSortedCenters.length !== 1 ? 's' : ''} found
              </div>
              <button className="text-green-600 hover:text-green-700 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {filteredAndSortedCenters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Recycle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-green-700 mb-2">No centers found</h3>
            <p className="text-green-600/70">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSortedCenters.map((center, index) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-green-100/60 relative"
              >
                {/* Favorite Button */}
                <button 
                  onClick={() => toggleFavorite(center.id)}
                  className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${
                    favorites.includes(center.id) 
                      ? 'text-red-500 bg-white/90' 
                      : 'text-gray-400 hover:text-red-500 bg-white/70 hover:bg-white/90'
                  }`}
                >
                  <Heart 
                    className={`w-5 h-5 ${favorites.includes(center.id) ? 'fill-current' : ''}`} 
                  />
                </button>

                {/* Center Image Placeholder */}
                <div className="h-40 bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <Recycle className="w-12 h-12 text-green-500" />
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-green-100/80 p-3 rounded-xl mr-3">
                        <Recycle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">{center.name}</h3>
                        <div className="flex items-center text-green-600/80 text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{center.distance} mi away</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      center.isOpen 
                        ? 'bg-green-100/80 text-green-700' 
                        : 'bg-red-100/80 text-red-700'
                    }`}>
                      {center.isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  {/* Rating and Points */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(center.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-green-200'
                          }`}
                        />
                      ))}
                      <span className="text-green-700 ml-2 text-sm font-medium">{center.rating}</span>
                    </div>

                    {center.rewards && (
                      <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                        <span className="text-green-700 text-xs font-medium">+{center.points} pts</span>
                      </div>
                    )}
                  </div>

                  {/* Materials */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Accepts:</h4>
                    <div className="flex flex-wrap gap-1">
                      {center.accepts.map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="px-2 py-1 bg-green-50/80 text-green-700 text-xs rounded-lg border border-green-100/60"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-green-700/80">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-green-500" />
                      <span>{center.hours}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{center.address}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-green-25/40 border-t border-green-100/60 flex gap-2">
                  <button
                    onClick={() => handleCall(center.phone)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-green-700 hover:text-green-800 hover:bg-white/60 rounded-lg transition-all text-sm font-medium"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </button>
                  <button
                    onClick={() => handleDirections(center.address)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600/90 text-white hover:bg-green-700 rounded-lg transition-all text-sm font-medium"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
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