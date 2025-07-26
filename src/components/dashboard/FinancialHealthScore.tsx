"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface FinancialHealthScoreProps {
  score: number
  components: {
    creditHealth: number
    wealthAccumulation: number
    debtManagement: number
    investmentPerformance: number
  }
  status: string
  insight?: string
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  score,
  components,
  status,
  insight
}) => {
  const [displayScore, setDisplayScore] = useState(0)
  const [showInsight, setShowInsight] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score)
    }, 500)
    return () => clearTimeout(timer)
  }, [score])

  const getScoreColor = (score: number) => {
    if (score >= 80) return { from: "#10b981", to: "#059669" } // green
    if (score >= 60) return { from: "#f59e0b", to: "#d97706" } // yellow/amber
    if (score >= 40) return { from: "#f97316", to: "#ea580c" } // orange
    return { from: "#ef4444", to: "#dc2626" } // red
  }

  const scoreColors = getScoreColor(score)
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = (displayScore / 100) * circumference

  return (
    <motion.div className="relative h-full">
      {/* Glass Card Container */}
      <motion.div
        className={cn(
          "relative w-full h-full rounded-3xl",
          "bg-white/[0.06] backdrop-blur-xl",
          "border border-white/[0.08]",
          "shadow-2xl shadow-black/50",
          "flex flex-col"
        )}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0">
          <div className={cn(
            "absolute inset-0 opacity-20",
            "bg-gradient-to-br from-primary/30 to-primary-light/30"
          )} />
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-2">
            <h3 className="text-base font-medium text-gray-400">Financial Health</h3>
            {insight && (
              <div className="relative">
                <motion.button
                  className="relative group"
                  onMouseEnter={() => setShowInsight(true)}
                  onMouseLeave={() => setShowInsight(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Info className="w-4 h-4 text-gray-500 hover:text-primary transition-colors" />
                </motion.button>
                
                <AnimatePresence>
                  {showInsight && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-64 z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className="bg-gray-900/95 backdrop-blur-md rounded-lg p-3 shadow-xl border border-white/20">
                        <p className="text-xs text-gray-200 leading-relaxed">
                          {insight}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {/* Score Display with Ring */}
          <div className="relative flex items-center justify-center flex-1 py-2">
            <div className="relative">
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 120 120"
                style={{ transform: 'rotate(-90deg)' }}
              >
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                
                {/* Animated progress ring */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={`url(#scoreGradient-${score})`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 " + circumference, opacity: 0 }}
                  animate={{ 
                    strokeDasharray: `${strokeDasharray} ${circumference}`,
                    opacity: 1
                  }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                />
                
                {/* Enhanced glow effect */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={`url(#glowGradient-${score})`}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  opacity="0.4"
                  filter="blur(8px)"
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              
              <defs>
                <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={scoreColors.from} />
                  <stop offset="100%" stopColor={scoreColors.to} />
                </linearGradient>
                <linearGradient id={`glowGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity="1" />
                  <stop offset="100%" stopColor={scoreColors.to} stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
            
              {/* Score number with animation */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-5xl font-bold text-white">
                  {Math.round(displayScore)}
                </span>
              </motion.div>
            </div>
            
            {/* Enhanced animated particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                animate={{
                  x: [0, Math.cos(i * 90 * Math.PI / 180) * 35, 0],
                  y: [0, Math.sin(i * 90 * Math.PI / 180) * 35, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.75,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Status Text */}
          <motion.p 
            className="text-white font-medium text-base mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {status}
          </motion.p>
          
          {/* Component Scores - Always visible */}
          <motion.div
            className="grid grid-cols-2 gap-2 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {Object.entries(components).map(([key, value], index) => (
              <motion.div
                key={key}
                className="bg-white/[0.04] rounded-lg p-2 backdrop-blur-sm border border-white/[0.06]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
              >
                <div className="text-xs text-gray-500 capitalize mb-0.5">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm font-semibold text-white">{value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Enhanced Pulse Animation using box-shadow */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(0, 212, 255, 0)",
              "0 0 0 10px rgba(0, 212, 255, 0.3)",
              "0 0 0 0 rgba(0, 212, 255, 0)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  )
}
