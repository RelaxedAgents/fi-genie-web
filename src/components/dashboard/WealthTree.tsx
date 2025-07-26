"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Trees, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetBreakdown {
  category: string
  value: number
  percentage: number
  color: string
}

interface WealthTreeProps {
  netWorth: number
  assetBreakdown: AssetBreakdown[]
  monthlyGrowth: {
    percentage: number
    status: string
  }
  historicalData: Array<{ month: string; value: number }>
  insight?: string
}

export const WealthTree: React.FC<WealthTreeProps> = ({
  netWorth,
  assetBreakdown,
  monthlyGrowth,
  historicalData,
  insight
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null)
  const [showInsight, setShowInsight] = useState(false)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = netWorth / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= netWorth) {
        setDisplayValue(netWorth)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [netWorth])

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(2)}L`
  }

  // Create branch positions for tree visualization
  const branches = assetBreakdown.map((asset, index) => {
    const angle = (index * 360) / assetBreakdown.length - 90
    const radius = 50 + (asset.percentage * 0.5)
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return { ...asset, x, y, angle }
  })

  return (
    <motion.div className="relative h-full">
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <Trees className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Wealth Tree</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp className={cn(
                  "w-4 h-4",
                  monthlyGrowth.status === "up" ? "text-green-500" : "text-red-500"
                )} />
                <span className={cn(
                  "text-sm font-semibold",
                  monthlyGrowth.status === "up" ? "text-green-500" : "text-red-500"
                )}>
                  {monthlyGrowth.percentage}%
                </span>
              </div>
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

          {/* Tree Visualization */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Trunk (Net Worth) */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <motion.div
                className="text-3xl font-bold text-white mb-1"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {formatCurrency(displayValue)}
              </motion.div>
              <p className="text-xs text-gray-500">Net Worth</p>
            </div>

            {/* Branches (Assets) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="-100 -100 200 200">
              {/* Tree trunk */}
                <motion.rect
                  x="-8"
                  y="0"
                  width="16"
                  height="60"
                  fill="url(#trunkGradient)"
                  initial={{ height: 0 }}
                  animate={{ height: 60 }}
                  transition={{ duration: 1 }}
                />

              {/* Branches */}
              {branches.map((branch, index) => (
                <g key={index}>
                  {/* Branch line */}
                  <motion.line
                    x1="0"
                    y1="0"
                    x2={branch.x}
                    y2={branch.y}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                  
                  {/* Leaf/Asset bubble */}
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    onMouseEnter={() => setHoveredBranch(index)}
                    onMouseLeave={() => setHoveredBranch(null)}
                  >
                    <motion.circle
                      cx={branch.x}
                      cy={branch.y}
                      r={12 + branch.percentage * 0.2}
                      fill={`url(#gradient-${index})`}
                      fillOpacity="0.8"
                      animate={{
                        scale: hoveredBranch === index ? 1.1 : 1
                      }}
                      style={{ cursor: "pointer" }}
                    />
                    {hoveredBranch === index && (
                      <foreignObject
                        x={branch.x - 50}
                        y={branch.y - 60}
                        width="100"
                        height="40"
                      >
                        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 text-center">
                          <p className="text-xs font-medium text-white">{branch.category}</p>
                          <p className="text-xs text-gray-400">{formatCurrency(branch.value)}</p>
                        </div>
                      </foreignObject>
                    )}
                  </motion.g>
                </g>
              ))}

              {/* Gradients */}
              <defs>
                <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B4513" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#654321" stopOpacity="0.8" />
                </linearGradient>
                {branches.map((_, index) => (
                  <radialGradient key={index} id={`gradient-${index}`}>
                    <stop offset="0%" className="text-primary-light" stopColor="currentColor" />
                    <stop offset="100%" className="text-primary" stopColor="currentColor" />
                  </radialGradient>
                ))}
              </defs>
            </svg>

            {/* Animated Particles (leaves) */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-400/50 rounded-full"
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, -Math.random() * 100 - 50],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut"
                }}
                style={{
                  left: "50%",
                  bottom: "40%"
                }}
              />
            ))}
          </div>

          {/* Growth Indicator */}
          <div className="mt-4 flex items-center justify-center gap-4">
            {historicalData.slice(-3).map((data, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-500">{data.month}</p>
                <p className="text-xs font-semibold text-white">
                  {formatCurrency(data.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
