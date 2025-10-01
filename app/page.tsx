'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Leaf, LeafyGreen } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/register')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md"
      >
        <div className="mb-8">
          <motion.div
            animate={{ 
              rotate: [-15, 15, -15],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <LeafyGreen className="w-20 h-20 text-emerald-600 mx-auto" strokeWidth={1} />
          </motion.div>
        </div>

        <h1 className="text-4xl font-bold text-emerald-800 mb-4">
          Welcome to <span className="text-emerald-600">EcoManage</span>
        </h1>
        
        <p className="text-lg text-emerald-700 mb-8">
          Sustainable solutions for a greener tomorrow
        </p>

        <div className="flex justify-center space-x-2">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              backgroundColor: ["#10B981", "#059669", "#10B981"]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-3 w-3 bg-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              backgroundColor: ["#10B981", "#059669", "#10B981"]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: 0.3,
              ease: "easeInOut"
            }}
            className="h-3 w-3 bg-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              backgroundColor: ["#10B981", "#059669", "#10B981"]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: 0.6,
              ease: "easeInOut"
            }}
            className="h-3 w-3 bg-emerald-500 rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-emerald-600 text-sm"
        >
          <p>Redirecting to registration...</p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "linear" }}
            className="h-1 bg-emerald-200 rounded-full mt-2"
          >
            <motion.div 
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <button 
          onClick={() => router.push('/login')}
          className="text-emerald-600 hover:text-emerald-800 font-medium text-sm"
        >
          Already have an account? Sign in
        </button>
      </motion.div>
    </div>
  )
}