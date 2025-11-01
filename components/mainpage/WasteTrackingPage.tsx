'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Gauge, Calendar, Package, Truck, Clock, CheckCircle, Leaf, Recycle, TrendingUp, Plus, Filter, Download, MapPin, User, Phone, X, ThumbsUp, MessageCircle, CheckSquare, Square, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { collection, query, where, orderBy, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore'
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
  userConfirmed: boolean
}

// Random collector names for assignment
const COLLECTOR_NAMES = [
  { name: "Ahmad Wijaya", phone: "+62 812-3456-7890" },
  { name: "Budi Santoso", phone: "+62 813-9876-5432" },
  { name: "Citra Dewi", phone: "+62 814-5678-9012" },
  { name: "Dian Pratama", phone: "+62 815-4321-6789" },
  { name: "Eko Putra", phone: "+62 816-7890-1234" },
  { name: "Fitriani", phone: "+62 817-6543-2109" },
  { name: "Gunawan", phone: "+62 818-9012-3456" },
  { name: "Hana Sari", phone: "+62 819-8765-4321" }
]

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [selectMode, setSelectMode] = useState(false)

  const router = useRouter()

  // Function to get random collector
  const getRandomCollector = () => {
    const randomIndex = Math.floor(Math.random() * COLLECTOR_NAMES.length)
    return COLLECTOR_NAMES[randomIndex]
  }

  // Function to calculate collection status based on real-time
  const calculateCollectionStatus = (collection: Collection) => {
    try {
      const pickupDate = collection.pickupDate?.toDate?.() || new Date(collection.pickupDate?.seconds * 1000)
      const pickupTime = collection.pickupTime
      const now = new Date()
      
      // Parse pickup time (format: "14:30")
      const [hours, minutes] = pickupTime.split(':').map(Number)
      const pickupDateTime = new Date(pickupDate)
      pickupDateTime.setHours(hours, minutes, 0, 0)
      
      const timeDiff = now.getTime() - pickupDateTime.getTime()
      const minutesDiff = timeDiff / (1000 * 60)
      
      // If current time has passed pickup time, mark as completed
      if (minutesDiff > 0 && collection.status !== 'completed') {
        return 'completed'
      }
      
      return collection.status
    } catch (error) {
      console.error('Error calculating status:', error)
      return collection.status
    }
  }

  // Update collection status in Firebase
  const updateCollectionStatus = async (collectionId: string, updates: any) => {
    try {
      const collectionRef = doc(db, 'collections', collectionId)
      await updateDoc(collectionRef, {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating collection:', error)
    }
  }

  // Enhanced collections data with automatic status progression
  const enhancedCollections = collections.map(collection => {
    const newStatus = calculateCollectionStatus(collection)
    let collector = collection.collector
    let collectorPhone = collection.collectorPhone
    
    // Assign random collector if not assigned and status is not completed
    if (!collector && newStatus !== 'completed') {
      const randomCollector = getRandomCollector()
      collector = randomCollector.name
      collectorPhone = randomCollector.phone
    }
    
    // Update status in Firebase if it changed
    if (newStatus !== collection.status && collection.id) {
      updateCollectionStatus(collection.id, { 
        status: newStatus,
        collector: collector || collection.collector,
        collectorPhone: collectorPhone || collection.collectorPhone
      })
    }
    
    return {
      ...collection,
      status: newStatus,
      collector,
      collectorPhone
    }
  })

  // Fetch collections from Firebase
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchCollections = async () => {
      try {
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
            userConfirmed: data.userConfirmed || false,
            ...data
          } as Collection)
        })

        // Sort manually on client side - newest first
        collectionsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.pickupDate?.seconds * 1000) || new Date(0)
          const dateB = b.createdAt?.toDate?.() || new Date(b.pickupDate?.seconds * 1000) || new Date(0)
          return dateB.getTime() - dateA.getTime()
        })

        setCollections(collectionsData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching collections:', error)
        setLoading(false)
      }
    }

    fetchCollections()

    // Set up interval to update status every 30 seconds
    const statusInterval = setInterval(() => {
      setCollections(prev => [...prev]) // Force re-render to recalculate status
    }, 30000)

    return () => clearInterval(statusInterval)
  }, [user])

  // Selection handlers
  const toggleSelectAll = () => {
    const completableCollections = enhancedCollections
      .filter(item => item.status === 'completed' && !item.userConfirmed)
      .map(item => item.id)
    
    if (selectedCollections.length === completableCollections.length) {
      setSelectedCollections([])
    } else {
      setSelectedCollections(completableCollections)
    }
  }

  const toggleSelectCollection = (collectionId: string) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    )
  }

  // Handle quick confirmation (single collection)
  const handleQuickConfirm = (collectionId: string) => {
    setSelectedCollections([collectionId])
    setShowConfirmationModal(true)
  }

  // Handle bulk confirmation
  const handleBulkConfirmation = () => {
    if (selectedCollections.length === 0) return
    setShowConfirmationModal(true)
  }

  const submitBulkConfirmation = async () => {
    if (selectedCollections.length === 0) return

    try {
      // Update all selected collections
      const updatePromises = selectedCollections.map(collectionId =>
        updateCollectionStatus(collectionId, {
          userConfirmed: true,
          userRating: rating,
          userFeedback: feedback,
          confirmedAt: new Date()
        })
      )

      await Promise.all(updatePromises)

      // Update local state
      setCollections(prev => prev.map(item => 
        selectedCollections.includes(item.id)
          ? { ...item, userConfirmed: true }
          : item
      ))

      setShowConfirmationModal(false)
      setSelectedCollections([])
      setSelectMode(false)
      setRating(5)
      setFeedback('')
    } catch (error) {
      console.error('Error confirming collections:', error)
    }
  }

  // Calculate stats from enhanced collections
  const completableCollections = enhancedCollections.filter(
    item => item.status === 'completed' && !item.userConfirmed
  )

  const stats = [
    { 
      name: "Total Collected", 
      value: `${enhancedCollections.reduce((sum, item) => sum + item.weight, 0).toFixed(1)} kg`, 
      icon: <Recycle className="w-5 h-5" />,
      change: `${enhancedCollections.filter(item => item.status === 'completed').length} pickups completed`,
      color: "text-green-600"
    },
    { 
      name: "Awaiting Confirmation", 
      value: `${completableCollections.length}`, 
      icon: <Clock className="w-5 h-5" />,
      change: `${selectedCollections.length} selected`,
      color: "text-amber-600"
    },
    { 
      name: "Confirmed Pickups", 
      value: `${enhancedCollections.filter(item => item.userConfirmed).length}`, 
      icon: <ThumbsUp className="w-5 h-5" />,
      change: "Successfully verified",
      color: "text-green-600"
    }
  ]

  const upcomingPickups = enhancedCollections
    .filter(item => item.status === 'scheduled' || item.status === 'in_progress')
    .map(item => {
      let dateText = 'Date not available'
      let timeRemaining = ''
      try {
        const itemDate = item.createdAt?.toDate?.() || new Date(item.pickupDate?.seconds * 1000)
        dateText = itemDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })
        
        // Calculate time remaining
        const pickupTime = item.pickupTime
        const [hours, minutes] = pickupTime.split(':').map(Number)
        const pickupDateTime = new Date(itemDate)
        pickupDateTime.setHours(hours, minutes, 0, 0)
        const now = new Date()
        const timeDiff = pickupDateTime.getTime() - now.getTime()
        
        if (timeDiff > 0) {
          const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60))
          const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
          
          if (hoursRemaining > 0) {
            timeRemaining = `${hoursRemaining}h ${minutesRemaining}m`
          } else {
            timeRemaining = `${minutesRemaining}m`
          }
        } else {
          timeRemaining = 'Due now'
        }
      } catch (error) {
        console.error('Error parsing date:', error)
      }

      return {
        date: dateText,
        time: item.pickupTime || 'Time not set',
        type: item.recyclingTypeLabel || 'Recycling',
        collector: item.collector || 'EcoManage Team',
        status: item.status,
        timeRemaining
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

  const filteredCollections = enhancedCollections.filter(item => {
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

              {/* Main Confirm Button - Always Visible */}
              {completableCollections.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (completableCollections.length === 1) {
                      // If only one collection needs confirmation, confirm it directly
                      handleQuickConfirm(completableCollections[0].id)
                    } else {
                      // If multiple, enter selection mode
                      setSelectMode(true)
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 flex items-center transition-all duration-200 shadow-md text-sm"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Confirm Pickups ({completableCollections.length})
                </motion.button>
              )}

              {/* Selection Mode Controls */}
              {selectMode && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectMode(false)
                      setSelectedCollections([])
                    }}
                    className="bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkConfirmation}
                    disabled={selectedCollections.length === 0}
                    className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center transition-all duration-200 shadow-md text-sm"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Confirm ({selectedCollections.length})
                  </motion.button>
                </div>
              )}
              
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

        {/* Selection Header */}
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
                >
                  {selectedCollections.length === completableCollections.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  Select All ({completableCollections.length})
                </button>
                <span className="text-blue-600 text-sm">
                  {selectedCollections.length} collections selected
                </span>
              </div>
              <div className="text-blue-600 text-sm">
                Select completed pickups to confirm
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Confirm Banner - For single unconfirmed collection */}
        {completableCollections.length === 1 && !selectMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">Confirm Your Collection</h3>
                  <p className="text-amber-700 text-sm">You have 1 completed collection waiting for confirmation</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickConfirm(completableCollections[0].id)}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Confirm Now
              </motion.button>
            </div>
          </motion.div>
        )}

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
                upcomingPickups.map((pickup, index) => {
                  const statusInfo = getStatusInfo(pickup.status)
                  return (
                    <div key={index} className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-green-800">{pickup.date}</span>
                        <span className="text-xs text-green-600">{pickup.time}</span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">{pickup.type}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{pickup.collector}</p>
                        <span className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </div>
                      {pickup.timeRemaining && (
                        <div className="mt-2 text-xs text-amber-600 font-medium">
                          ⏱️ {pickup.timeRemaining} remaining
                        </div>
                      )}
                    </div>
                  )
                })
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
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {filteredCollections.length} of {enhancedCollections.length} collections
                    <span className="text-green-600 ml-2">• Real-time updates</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Confirmed</div>
                  <div className="text-xl font-bold text-green-600">
                    {enhancedCollections.filter(item => item.userConfirmed).length}/{enhancedCollections.length}
                  </div>
                </div>
              </div>
            </div>
            
            {filteredCollections.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-gray-400 mb-4">
                  {enhancedCollections.length === 0 ? "No collections found" : "No collections match your filters"}
                </div>
                {enhancedCollections.length > 0 && (
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
                  
                  const isSelectable = item.status === 'completed' && !item.userConfirmed
                  const isSelected = selectedCollections.includes(item.id)
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      whileHover={{ 
                        backgroundColor: isSelected ? "rgba(59, 130, 246, 0.1)" : "rgba(240, 253, 244, 0.5)",
                        transition: { type: "spring", stiffness: 300 }
                      }}
                      className={`p-5 transition-all duration-300 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                          {/* Selection Checkbox */}
                          {selectMode && isSelectable && (
                            <button
                              onClick={() => toggleSelectCollection(item.id)}
                              className="mt-1 flex-shrink-0"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          )}
                          
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                            
                            {item.userConfirmed && (
                              <span className="px-2 py-1.5 inline-flex items-center text-xs font-medium rounded-full border border-green-200 bg-green-50 text-green-700">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Confirmed
                              </span>
                            )}
                            
                            {item.pickupNotes && (
                              <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-full">
                                {item.pickupNotes}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!selectMode && isSelectable && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickConfirm(item.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                Confirm
                              </motion.button>
                            )}
                            
                            <motion.button
                              whileHover={{ x: 3 }}
                              className="text-green-600 hover:text-green-800 font-medium text-xs flex items-center transition-colors"
                            >
                              View Details
                              <svg className="w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </motion.button>
                          </div>
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
                {(enhancedCollections.reduce((sum, item) => sum + (item.weight || 0), 0) * 0.46).toFixed(1)} kg
              </div>
              <div className="text-green-100 text-sm">CO₂ Emissions Prevented</div>
            </div>
          </div>
        </motion.div>

        {/* Bulk Confirmation Modal */}
        {showConfirmationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center">
                  <ThumbsUp className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Confirm {selectedCollections.length > 1 ? `${selectedCollections.length} Collections` : 'Collection'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowConfirmationModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {selectedCollections.length > 1 ? 'Collections Completed' : 'Collection Completed'}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedCollections.length > 1 
                      ? `Please confirm that ${selectedCollections.length} collections were completed successfully.`
                      : 'Please confirm that your collection was completed successfully.'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate your experience
                    </label>
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-1">
                      {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very Poor'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="How was your collection experience?"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmationModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitBulkConfirmation}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-md flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Confirm {selectedCollections.length > 1 ? `All (${selectedCollections.length})` : 'Completion'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

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