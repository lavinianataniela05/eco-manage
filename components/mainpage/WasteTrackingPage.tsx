'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Gauge, Calendar, Package, Truck, Clock, CheckCircle, Leaf, Recycle, TrendingUp, Plus, Filter, Download, MapPin, User, Phone, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { useAuthState } from 'react-firebase-hooks/auth'

interface Collection {
  id: string
  pickupDate: any
  pickupTime: string
  address: string
  email: string
  phone: string
  pickupNotes: string
  recyclingType: string
  recyclingTypeLabel: string
  bagsCount: number
  weight: number
  distance: number
  totalCost: number
  paymentMethod: string
  status: string
  statusLabel: string
  collector: string | null
  collectorPhone: string | null
  notes: string
  createdAt: any
  updatedAt: any
}

export default function WasteTracking() {
  const [user] = useAuthState(auth)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    wasteType: '',
    dateRange: '',
    weightRange: ''
  })

  const router = useRouter()

  // Fetch collections from Firebase - SIMPLIFIED VERSION
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchCollections = async () => {
      try {
        // Simple query without complex ordering to avoid index requirements
        const q = query(
          collection(db, 'collections'),
          where('userId', '==', user.uid)
        )

        const querySnapshot = await getDocs(q)
        const collectionsData: Collection[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          collectionsData.push({
            id: doc.id,
            ...data
          } as Collection)
        })

        // Sort manually on client side
        collectionsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.pickupDate?.seconds * 1000) || new Date(0)
          const dateB = b.createdAt?.toDate?.() || new Date(b.pickupDate?.seconds * 1000) || new Date(0)
          return dateB.getTime() - dateA.getTime() // Descending order
        })

        setCollections(collectionsData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching collections:', error)
        setLoading(false)
      }
    }

    fetchCollections()

    // Optional: Set up real-time listener after initial load
    // const unsubscribe = onSnapshot(q, (querySnapshot) => {
    //   const collectionsData: Collection[] = []
    //   querySnapshot.forEach((doc) => {
    //     const data = doc.data()
    //     collectionsData.push({
    //       id: doc.id,
    //       ...data
    //     } as Collection)
    //   })
    //   // Sort manually
    //   collectionsData.sort((a, b) => {
    //     const dateA = a.createdAt?.toDate?.() || new Date(a.pickupDate?.seconds * 1000) || new Date(0)
    //     const dateB = b.createdAt?.toDate?.() || new Date(b.pickupDate?.seconds * 1000) || new Date(0)
    //     return dateB.getTime() - dateA.getTime()
    //   })
    //   setCollections(collectionsData)
    //   setLoading(false)
    // })

    // return () => unsubscribe()
  }, [user])

  // Calculate stats from collections data
  const stats = [
    { 
      name: "Total Collected", 
      value: `${collections.reduce((sum, item) => sum + item.weight, 0).toFixed(1)} kg`, 
      icon: <Recycle className="w-5 h-5" />,
      change: `${collections.filter(item => item.status === 'completed').length} pickups completed`,
      color: "text-green-600"
    },
    { 
      name: "This Month", 
      value: `${collections
        .filter(item => {
          try {
            const itemDate = item.createdAt?.toDate?.() || new Date(item.pickupDate?.seconds * 1000)
            const now = new Date()
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
          } catch {
            return false
          }
        })
        .reduce((sum, item) => sum + item.weight, 0)
        .toFixed(1)} kg`, 
      icon: <Calendar className="w-5 h-5" />,
      change: `${collections.filter(item => {
        try {
          const itemDate = item.createdAt?.toDate?.() || new Date(item.pickupDate?.seconds * 1000)
          const now = new Date()
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
        } catch {
          return false
        }
      }).length} pickups this month`,
      color: "text-green-600"
    },
    { 
      name: "CO₂ Saved", 
      value: `${(collections.reduce((sum, item) => sum + item.weight, 0) * 0.46).toFixed(1)} kg`, 
      icon: <Leaf className="w-5 h-5" />,
      change: "Equivalent to planting trees",
      color: "text-green-600"
    }
  ]

  const upcomingPickups = collections
    .filter(item => item.status === 'scheduled' || item.status === 'in_progress')
    .map(item => {
      let dateText = 'Date not available'
      try {
        const itemDate = item.createdAt?.toDate?.() || new Date(item.pickupDate?.seconds * 1000)
        dateText = itemDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
      } catch (error) {
        console.error('Error parsing date:', error)
      }

      return {
        date: dateText,
        time: item.pickupTime || 'Time not set',
        type: item.recyclingTypeLabel || 'Recycling',
        collector: item.collector || 'EcoManage Team'
      }
    })

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const wasteTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'paper', label: 'Paper' },
    { value: 'ewaste', label: 'E-Waste' },
    { value: 'glass', label: 'Glass' },
    { value: 'metal', label: 'Metal' },
    { value: 'mixed', label: 'Mixed' }
  ]

  const dateRangeOptions = [
    { value: '', label: 'All Dates' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' }
  ]

  const weightRangeOptions = [
    { value: '', label: 'All Weights' },
    { value: '0-5', label: '0-5 kg' },
    { value: '5-10', label: '5-10 kg' },
    { value: '10-15', label: '10-15 kg' },
    { value: '15+', label: '15+ kg' }
  ]

  const handleFilterChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      status: '',
      wasteType: '',
      dateRange: '',
      weightRange: ''
    })
  }

  const applyFilters = () => {
    setShowFilterModal(false)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-green-700 bg-green-50 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Completed'
        }
      case 'in_progress':
        return {
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          icon: <Truck className="w-4 h-4" />,
          label: 'In Progress'
        }
      case 'scheduled':
        return {
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          icon: <Clock className="w-4 h-4" />,
          label: 'Scheduled'
        }
      case 'cancelled':
        return {
          color: 'text-red-700 bg-red-50 border-red-200',
          icon: <X className="w-4 h-4" />,
          label: 'Cancelled'
        }
      default:
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          icon: <Clock className="w-4 h-4" />,
          label: 'Unknown'
        }
    }
  }

  const filteredCollections = collections.filter(item => {
    if (filters.status && item.status !== filters.status) return false
    if (filters.wasteType && item.recyclingType !== filters.wasteType) return false
    
    if (filters.dateRange) {
      try {
        const today = new Date()
        const itemDate = item.createdAt?.toDate?.() || new Date(item.pickupDate?.seconds * 1000)
        const diffTime = today.getTime() - itemDate.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        
        if (filters.dateRange === 'last7' && diffDays > 7) return false
        if (filters.dateRange === 'last30' && diffDays > 30) return false
        if (filters.dateRange === 'last90' && diffDays > 90) return false
      } catch {
        return false
      }
    }
    
    if (filters.weightRange) {
      if (filters.weightRange === '0-5' && item.weight > 5) return false
      if (filters.weightRange === '5-10' && (item.weight <= 5 || item.weight > 10)) return false
      if (filters.weightRange === '10-15' && (item.weight <= 10 || item.weight > 15)) return false
      if (filters.weightRange === '15+' && item.weight <= 15) return false
    }
    
    return true
  })

  const activeFilterCount = Object.values(filters).filter(val => val !== '').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-25 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your collection history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-25 to-green-50" style={{ background: 'linear-gradient(135deg, #fafff9 0%, #f0fdf4 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-xl mr-4 shadow-sm">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Waste Collection</h1>
                <p className="text-gray-600 mt-1 text-base">Track your pickup history and schedule</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilterModal(true)}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200 shadow-sm text-sm relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 flex items-center transition-all duration-200 shadow-md text-sm"
                onClick={() => router.push('/delivery-collection')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Pickup
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-50 p-2 rounded-lg">
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="font-medium">Active</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 font-medium">{stat.name}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Upcoming Pickups Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-fit"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Upcoming Pickups
            </h3>
            <div className="space-y-3">
              {upcomingPickups.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming pickups</p>
              ) : (
                upcomingPickups.map((pickup, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-800">{pickup.date}</span>
                      <span className="text-xs text-green-600">{pickup.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{pickup.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{pickup.collector}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Collection History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-25">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-green-600" />
                    Collection History
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Showing {filteredCollections.length} of {collections.length} collections</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Collections</div>
                  <div className="text-xl font-bold text-green-600">{collections.length}</div>
                </div>
              </div>
            </div>
            
            {filteredCollections.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-gray-400 mb-4">
                  {collections.length === 0 ? "No collections found" : "No collections match your filters"}
                </div>
                {collections.length > 0 && (
                  <button 
                    onClick={resetFilters}
                    className="text-green-600 hover:text-green-800 font-medium text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCollections.map((item, index) => {
                  const statusInfo = getStatusInfo(item.status)
                  let formattedDate = 'Date not available'
                  try {
                    const itemDate = item.createdAt?.toDate?.() || new Date(item.pickupDate?.seconds * 1000)
                    formattedDate = itemDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  } catch (error) {
                    console.error('Error parsing date:', error)
                  }
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      whileHover={{ 
                        backgroundColor: "rgba(240, 253, 244, 0.5)",
                        transition: { type: "spring", stiffness: 300 }
                      }}
                      className="p-5 transition-all duration-300"
                    >
                      <div className="flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg mt-1">
                              <Package className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-gray-800">{item.recyclingTypeLabel || 'Recycling'}</h3>
                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {formattedDate} at {item.pickupTime || 'Time not set'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-800">{item.weight || 0} kg</div>
                            <div className="text-xs text-gray-500">Weight</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center mb-1">
                              <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-xs font-medium text-gray-700">Pickup Address</span>
                            </div>
                            <p className="text-xs text-gray-600">{item.address || 'Address not provided'}</p>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center mb-1">
                              <User className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-xs font-medium text-gray-700">Collector</span>
                            </div>
                            <p className="text-xs text-gray-600">{item.collector || 'Not assigned yet'}</p>
                            {item.collectorPhone && (
                              <div className="flex items-center mt-1">
                                <Phone className="w-3 h-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">{item.collectorPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1.5 inline-flex items-center text-xs font-medium rounded-full border ${statusInfo.color}`}>
                              <span className="mr-1.5">{statusInfo.icon}</span>
                              {statusInfo.label}
                            </span>
                            {item.pickupNotes && (
                              <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-full">
                                {item.pickupNotes}
                              </span>
                            )}
                          </div>
                          
                          <motion.button
                            whileHover={{ x: 3 }}
                            className="text-green-600 hover:text-green-800 font-medium text-xs flex items-center transition-colors self-end xs:self-auto"
                          >
                            View Details
                            <svg className="w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Environmental Impact Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Environmental Impact</h3>
                <p className="text-green-100 mt-1 text-sm">Your waste collection efforts have made a positive impact</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {(collections.reduce((sum, item) => sum + (item.weight || 0), 0) * 0.46).toFixed(1)} kg
              </div>
              <div className="text-green-100 text-sm">CO₂ Emissions Prevented</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Filter Collections</h3>
                </div>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="bg-green-100 p-1 rounded mr-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </span>
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-800"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="bg-green-100 p-1 rounded mr-2">
                      <Recycle className="w-4 h-4 text-green-600" />
                    </span>
                    Waste Type
                  </label>
                  <select
                    name="wasteType"
                    value={filters.wasteType}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-800"
                  >
                    {wasteTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="bg-green-100 p-1 rounded mr-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </span>
                    Date Range
                  </label>
                  <select
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-800"
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="bg-green-100 p-1 rounded mr-2">
                      <Gauge className="w-4 h-4 text-green-600" />
                    </span>
                    Weight Range
                  </label>
                  <select
                    name="weightRange"
                    value={filters.weightRange}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-800"
                  >
                    {weightRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-white transition-all"
                >
                  Reset All
                </motion.button>
                <div className="space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilterModal(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={applyFilters}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-md"
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}