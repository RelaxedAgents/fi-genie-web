"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { TrendingUp, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetBreakdown {
  category: string
  value: number
  percentage: number
  color: string
}

interface WealthWebProps {
  netWorth: number
  assetBreakdown: AssetBreakdown[]
  monthlyGrowth: {
    percentage: number
    status: string
  }
  historicalData: Array<{ month: string; value: number }>
  insight?: string
}

export const WealthWeb: React.FC<WealthWebProps> = ({
  netWorth,
  assetBreakdown,
  monthlyGrowth,
  historicalData,
  insight
}) => {
  const [displayValue, setDisplayValue] = useState(0)
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

  // Calculate spider web positions
  const numAxes = assetBreakdown.length
  const angleStep = (2 * Math.PI) / numAxes
  const maxRadius = 150
  const levels = 5 // Number of concentric circles

  // Generate points for the spider web based on percentage values
  const webPoints = assetBreakdown.map((asset, index) => {
    const angle = index * angleStep - Math.PI / 2 // Start from top
    const radius = (asset.percentage / 100) * maxRadius // Position based on percentage
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const labelX = Math.cos(angle) * (maxRadius + 35)
    const labelY = Math.sin(angle) * (maxRadius + 35)
    return { ...asset, x, y, labelX, labelY, angle }
  })

  // Create path for the filled polygon
  const polygonPath = webPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ') + ' Z'

  return (
    <motion.div className="relative h-full">
      <div 
        className={cn(
          "relative w-full h-full rounded-3xl",
          "bg-white/[0.03] backdrop-blur-xl",
          "border border-white/[0.05]",
          "shadow-2xl shadow-black/50",
          "overflow-hidden"
        )}
      >

        {/* Content */}
        <div className="relative z-10 p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-400">Wealth Web</h3>
            <div className="flex items-center gap-2">
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

          {/* Net Worth Display */}
          <div className="text-center mb-2">
            <div className="text-3xl font-bold text-white">
              {formatCurrency(displayValue)}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-xs text-gray-500">Net Worth</span>
              <TrendingUp className={cn(
                "w-3 h-3",
                monthlyGrowth.status === "up" ? "text-green-500" : "text-red-500"
              )} />
              <span className={cn(
                "text-xs font-semibold",
                monthlyGrowth.status === "up" ? "text-green-500" : "text-red-500"
              )}>
                {monthlyGrowth.percentage}%
              </span>
            </div>
          </div>

          {/* Spider Web Visualization */}
          <div className="flex-1 relative flex items-center justify-center">
            <svg 
              className="absolute inset-0 w-full h-full" 
              viewBox="-220 -220 440 440"
            >
              {/* Grid circles */}
              {[...Array(levels)].map((_, level) => (
                <circle
                  key={level}
                  cx="0"
                  cy="0"
                  r={(level + 1) * (maxRadius / levels)}
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.15"
                  strokeWidth="1.5"
                />
              ))}

              {/* Radial lines */}
              {webPoints.map((point, index) => (
                <line
                  key={`line-${index}`}
                  x1="0"
                  y1="0"
                  x2={Math.cos(point.angle) * maxRadius}
                  y2={Math.sin(point.angle) * maxRadius}
                  stroke="white"
                  strokeOpacity="0.15"
                  strokeWidth="1.5"
                />
              ))}

              {/* Filled polygon */}
              <path
                d={polygonPath}
                fill="url(#webGradient)"
                fillOpacity="0.2"
                stroke="url(#webGradient)"
                strokeWidth="2"
                strokeOpacity="0.6"
              />

              {/* Asset points */}
              {webPoints.map((point, index) => (
                <g key={`point-${index}`}>
                  {/* Glowing point */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill={point.color}
                  />
                  
                  {/* Glow effect */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill={point.color}
                    fillOpacity="0.3"
                    filter="blur(4px)"
                  />

                  {/* Labels - Always visible */}
                  <foreignObject
                    x={point.labelX - 60}
                    y={point.labelY - 30}
                    width="120"
                    height="60"
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-sm font-medium text-gray-300 text-center">
                        {point.category}
                      </p>
                      <p className="text-base font-bold text-white">
                        {formatCurrency(point.value)}
                      </p>
                      <p className="text-sm font-bold" style={{ color: point.color }}>
                        {point.percentage}%
                      </p>
                    </div>
                  </foreignObject>
                </g>
              ))}

              {/* Gradient definitions */}
              <defs>
                <radialGradient id="webGradient">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                </radialGradient>
              </defs>

            </svg>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
