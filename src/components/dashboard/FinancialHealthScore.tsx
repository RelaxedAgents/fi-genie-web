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
  const radius = 55
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = (displayScore / 100) * circumference

  return (
    <motion.div className="relative h-full">
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden"
      )}>
        {/* Content */}
        <div className="relative z-10 p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-gray-400">Financial Health</h3>
              <p className="text-gray-500 text-sm">Overall score</p>
            </div>
          </div>

          {/* AI Insight - At Top */}
          {insight && (
            <div className="mb-3">
              <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Info className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-xs font-medium text-white">AI Insight:</p>
                    <p className="text-xs text-gray-300">
                      Score: <span className="text-primary font-medium">{score}/100</span>. 
                      Focus on improving debt management for better health.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Score Display with Ring */}
          <svg 
            className="mx-auto my-2 block flex-shrink-0"
            width="110" 
            height="110" 
            viewBox="0 0 140 140"
          >
                {/* Circular pulse effect - moved to back */}
                <motion.circle
                  cx="70"
                  cy="70"
                  r={radius + 5}
                  fill="none"
                  stroke={`url(#pulseGradient-${score})`}
                  strokeWidth="1"
                  animate={{
                    r: [radius + 5, radius + 15, radius + 5],
                    opacity: [0.15, 0, 0.15]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Background circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                
                {/* Enhanced glow effect */}
                <motion.circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={`url(#glowGradient-${score})`}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  opacity="0.3"
                  filter="blur(6px)"
                  animate={{
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
                />
                
                {/* Animated progress ring */}
                <motion.circle
                  cx="70"
                  cy="70"
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
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
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
                <linearGradient id={`pulseGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={scoreColors.from} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={scoreColors.to} stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              {/* Score text inside SVG */}
              <motion.text
                x="70"
                y="75"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-4xl font-bold fill-white"
                style={{ fontSize: '2.75rem' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3,
                  type: "spring",
                  bounce: 0.4
                }}
              >
                {Math.round(displayScore)}
              </motion.text>
              
              {/* Animated particles inside SVG */}
              {[...Array(4)].map((_, i) => (
                <motion.circle
                  key={i}
                  r="3"
                  fill="#22d3ee"
                  opacity="0.6"
                  animate={{
                    cx: [70, 70 + Math.cos(i * 90 * Math.PI / 180) * 35, 70],
                    cy: [70, 70 + Math.sin(i * 90 * Math.PI / 180) * 35, 70],
                    opacity: [0, 0.6, 0],
                    r: [2, 3, 2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.75,
                    ease: "easeOut"
                  }}
                />
              ))}
          </svg>

          {/* Status Text */}
          <motion.p 
            className="text-white font-medium text-sm mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {status}
          </motion.p>
          
          {/* Component Scores - Always visible */}
          <motion.div
            className="grid grid-cols-2 gap-1 w-full flex-shrink-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {Object.entries(components).map(([key, value], index) => (
              <motion.div
                key={key}
                className="bg-white/[0.03] rounded-md px-1.5 py-1.5 backdrop-blur-sm border border-white/[0.05]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
              >
                <div className="text-[10px] text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-xs font-semibold text-white">{value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </motion.div>
  )
}
