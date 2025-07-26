"use client"

import React, { useEffect, useState } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { Shield, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreditShieldProps {
  score: number
  maxScore: number
  rating: string
  paymentHistory: {
    onTimePercentage: number
  }
  historicalData: Array<{ month: string; score: number }>
  insight?: string
}

export const CreditShield: React.FC<CreditShieldProps> = ({
  score,
  maxScore,
  rating,
  paymentHistory,
  historicalData,
  insight
}) => {
  const [displayScore, setDisplayScore] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const controls = useAnimation()
  
  const percentage = (score / maxScore) * 100
  const fillHeight = percentage

  useEffect(() => {
    // Animate score counting
    const duration = 2000
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    // Animate liquid fill
    controls.start({
      height: `${fillHeight}%`,
      transition: { duration: 2, ease: "easeOut" }
    })

    return () => clearInterval(timer)
  }, [score, fillHeight, controls])

  const getScoreColor = () => {
    if (score >= 750) return "from-primary/50 to-primary-light/50"
    if (score >= 650) return "from-primary/40 to-primary-light/40"
    if (score >= 550) return "from-primary/30 to-primary-light/30"
    return "from-primary/20 to-primary-light/20"
  }

  return (
    <motion.div
      className="relative h-full"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden group"
      )}>
        {/* Shield Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Shield className="w-32 h-32" />
        </div>

        {/* Liquid Fill Effect */}
        <div className="absolute inset-0 flex items-end">
          <motion.div
            className="relative w-full"
            initial={{ height: 0 }}
            animate={controls}
          >
            {/* Gradient Fill */}
            <div className={cn(
              "absolute inset-0",
              "bg-gradient-to-t",
              getScoreColor()
            )} />
            
            {/* Wave Animation */}
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M0,10 Q25,5 50,10 T100,10 L100,20 L0,20 Z"
                fill="url(#waveGradient)"
                animate={{
                  d: [
                    "M0,10 Q25,5 50,10 T100,10 L100,20 L0,20 Z",
                    "M0,10 Q25,15 50,10 T100,10 L100,20 L0,20 Z",
                    "M0,10 Q25,5 50,10 T100,10 L100,20 L0,20 Z"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" className="text-primary-light/50" stopColor="currentColor" />
                  <stop offset="100%" className="text-primary/50" stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Credit Shield</h3>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              {insight && (
                <motion.button
                  className="relative group"
                  onMouseEnter={() => setShowInsight(true)}
                  onMouseLeave={() => setShowInsight(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Info className="w-4 h-4 text-gray-400 hover:text-primary transition-colors" />
                  
                  <AnimatePresence>
                    {showInsight && (
                      <motion.div
                        className="absolute top-full right-0 mt-2 w-64 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="bg-gray-900/95 backdrop-blur-md rounded-lg p-3 shadow-xl border border-white/10">
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {insight}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </div>
          </div>

          {/* Score Display */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              className="text-4xl font-bold text-white mb-1"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {displayScore}
            </motion.div>
            <p className="text-sm font-medium gradient-text">{rating}</p>
            <p className="text-xs text-gray-500">out of {maxScore}</p>
          </div>

          {/* Payment History (shown on hover) */}
          <motion.div
            className="mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={showDetails ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Payment History</span>
                <span className="text-xs font-semibold text-white">
                  {paymentHistory.onTimePercentage}% on-time
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${paymentHistory.onTimePercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Mini Chart Preview */}
            <div className="mt-3 flex items-end justify-between h-12">
              {historicalData.slice(-5).map((data, index) => (
                <motion.div
                  key={index}
                  className="w-1 bg-primary/50 rounded-full"
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.score / maxScore) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Shield Glow Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: [
              "inset 0 0 50px rgba(59, 130, 246, 0.1)",
              "inset 0 0 100px rgba(59, 130, 246, 0.2)",
              "inset 0 0 50px rgba(59, 130, 246, 0.1)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  )
}
