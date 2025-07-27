"use client"

import React, { useEffect, useState } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { Info } from "lucide-react"
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

  return (
    <motion.div className="relative h-full">
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden group"
      )}>
        {/* Liquid Fill Effect */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <defs>
            <clipPath id="waveClipPath">
              <rect x="0" y="0" width="100" height="100" />
            </clipPath>
          </defs>
          
          <g clipPath="url(#waveClipPath)">
            {/* Animated fill with wave */}
            <motion.g
              initial={{ y: 100 }}
              animate={{ y: 100 - fillHeight }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              {/* Wave path */}
              <motion.path
                d="M0,5 Q25,0 50,5 T100,5 L100,100 L0,100 Z"
                className="fill-primary/30"
                animate={{
                  d: [
                    "M0,5 Q25,0 50,5 T100,5 L100,100 L0,100 Z",
                    "M0,5 Q25,10 50,5 T100,5 L100,100 L0,100 Z",
                    "M0,5 Q25,0 50,5 T100,5 L100,100 L0,100 Z"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.g>
          </g>
        </motion.svg>

        {/* Content */}
        <div className="relative z-10 p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Credit Score</h3>
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
        </div>

      </div>
    </motion.div>
  )
}
