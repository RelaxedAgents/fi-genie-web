"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PieChart, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Asset {
  category: string
  value: number
  percentage: number
  color: string
}

interface AssetAllocationProps {
  assets: Asset[]
  totalValue: number
  insight?: string
}

export const AssetAllocation: React.FC<AssetAllocationProps> = ({
  assets,
  totalValue,
  insight
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [showInsight, setShowInsight] = useState(false)
  const [displayValue, setDisplayValue] = useState(totalValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Mark as hydrated after mount
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Animate total value only after hydration
  useEffect(() => {
    if (!isHydrated) return

    const duration = 2000
    const steps = 60
    const increment = totalValue / steps
    let current = 0

    setDisplayValue(0) // Start animation from 0
    const timer = setInterval(() => {
      current += increment
      if (current >= totalValue) {
        setDisplayValue(totalValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalValue, isHydrated])

  const formatCurrency = (value: number) => {
    const absAmount = Math.abs(value)
    if (absAmount >= 100000) {
      return `₹${(absAmount / 100000).toFixed(1)}L`
    } else if (absAmount >= 1000) {
      return `₹${(absAmount / 1000).toFixed(1)}k`
    }
    return `₹${absAmount.toLocaleString()}`
  }

  // Calculate pie segments
  let cumulativePercentage = 0
  const segments = assets.map((asset, index) => {
    const startAngle = (cumulativePercentage * 360) / 100
    const endAngle = ((cumulativePercentage + asset.percentage) * 360) / 100
    cumulativePercentage += asset.percentage
    return { ...asset, startAngle, endAngle, index }
  })

  // Convert angle to radians
  const angleToRadians = (angle: number) => (angle * Math.PI) / 180

  // Create path for each segment
  const createPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = angleToRadians(startAngle - 90)
    const end = angleToRadians(endAngle - 90)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    const x1 = Math.cos(start) * radius
    const y1 = Math.sin(start) * radius
    const x2 = Math.cos(end) * radius
    const y2 = Math.sin(end) * radius

    return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Asset Allocation</h3>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
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

          {/* Total Assets Display */}
          <motion.div 
            className="text-center mb-4"
            initial={isHydrated ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={isHydrated ? { delay: 0.3, duration: 0.5 } : { duration: 0 }}
          >
            <motion.p 
              className="text-3xl font-bold text-white"
              initial={isHydrated ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={isHydrated ? { delay: 0.5, type: "spring", stiffness: 200 } : { duration: 0 }}
            >
              {formatCurrency(displayValue)}
            </motion.p>
            <p className="text-sm text-gray-400 mt-1">Total Assets</p>
          </motion.div>

          {/* Pie Chart */}
          <div className="flex-1 relative flex items-center justify-center">
            <motion.svg
              className="w-56 h-56"
              viewBox="-120 -120 240 240"
              initial={isHydrated ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={isHydrated ? { duration: 1, type: "spring", stiffness: 100 } : { duration: 0 }}
            >
              {/* Background circle */}
              <circle
                cx="0"
                cy="0"
                r="100"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2"
              />

              {/* Pie segments */}
              {segments.map((segment) => (
                <motion.g
                  key={segment.index}
                  onMouseEnter={() => setHoveredSegment(segment.index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <motion.path
                    d={createPath(segment.startAngle, segment.endAngle, 100)}
                    fill={segment.color}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    initial={isHydrated ? { scale: 0 } : { scale: 1 }}
                    animate={{
                      scale: hoveredSegment === segment.index ? 1.05 : 1,
                      filter: hoveredSegment === segment.index ? 'brightness(1.3)' : 'brightness(1)'
                    }}
                    transition={{ 
                      scale: {
                        delay: isHydrated ? segment.index * 0.1 : 0,
                        duration: isHydrated ? 0.5 : 0,
                        type: "spring",
                        stiffness: 200
                      },
                      filter: { duration: 0.2 }
                    }}
                  />
                  
                  {/* Hover tooltip */}
                  {hoveredSegment === segment.index && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <rect
                        x="-50"
                        y="-130"
                        width="100"
                        height="40"
                        rx="8"
                        fill="rgba(0,0,0,0.9)"
                        stroke={segment.color}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-115"
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {segment.category}
                      </text>
                      <text
                        x="0"
                        y="-100"
                        textAnchor="middle"
                        fill={segment.color}
                        fontSize="14"
                        fontWeight="700"
                      >
                        {segment.percentage.toFixed(1)}%
                      </text>
                    </motion.g>
                  )}
                </motion.g>
              ))}
            </motion.svg>
          </div>

          {/* Legend - Single line at bottom */}
          <div className="flex items-center justify-between gap-4 mt-4 px-2">
            {assets.map((asset, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-1.5 min-w-0"
                initial={isHydrated ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isHydrated ? { delay: 0.8 + index * 0.1, duration: 0.3 } : { duration: 0 }}
              >
                <motion.div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: asset.color }}
                  animate={{
                    scale: hoveredSegment === index ? 1.3 : 1
                  }}
                  transition={{ duration: 0.2 }}
                />
                <div className="flex items-center gap-1 min-w-0">
                  <p className="text-xs text-gray-400 truncate">{asset.category}</p>
                  <p className="text-xs font-semibold text-white flex-shrink-0">
                    {asset.percentage.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
