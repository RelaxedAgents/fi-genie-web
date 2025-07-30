"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PieChart } from "lucide-react"
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
  const [displayValue, setDisplayValue] = useState(0)
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

  // Calculate the circumference for the donut chart
  let cumulativePercentage = 0

  return (
    <motion.div className="relative h-full">
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden group"
      )}>
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

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="text-sm sm:text-base font-medium text-gray-400">Asset Allocation</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Portfolio breakdown</p>
            </div>
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>

          {/* AI Insight - At Top */}
          {insight && (
            <div className="mb-3 sm:mb-4">
              <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
                <div className="flex items-start sm:items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <PieChart className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                    <p className="text-xs font-medium text-white">AI Insight:</p>
                    <p className="text-xs text-gray-300">
                      Top allocation: <span className="text-primary font-medium">{assets[0]?.category}</span>. 
                      Consider diversification for better risk management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donut Chart + Values - Responsive Layout */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-3">
            {/* Donut Chart - Full width on mobile, half on desktop */}
            <div className="flex items-center justify-center lg:w-1/2">
              <div className="relative">
                <svg 
                  viewBox="0 0 260 260" 
                  className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 transform -rotate-90"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {assets.map((asset, index) => {
                    const radius = 100
                    const circumference = 2 * Math.PI * radius
                    const strokeDasharray = `${(asset.percentage / 100) * circumference} ${circumference}`
                    const strokeDashoffset = -cumulativePercentage * circumference / 100
                    cumulativePercentage += asset.percentage
                    
                    return (
                      <motion.circle
                        key={index}
                        cx="130"
                        cy="130"
                        r={radius}
                        fill="none"
                        stroke={asset.color}
                        strokeWidth="30"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circumference}` }}
                        animate={{ strokeDasharray }}
                        transition={{ duration: 1.2, delay: index * 0.15 }}
                      />
                    )
                  })}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {formatCurrency(displayValue)}
                  </div>
                  <div className="text-sm sm:text-base text-gray-400">Total Assets</div>
                </div>
              </div>
            </div>

            {/* Values - Grid on mobile and desktop */}
            <div className="grid grid-cols-2 gap-2 content-center lg:w-1/2">
              {assets.map((asset, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
                    style={{ 
                      backgroundColor: asset.color,
                      boxShadow: `0 0 6px ${asset.color}40`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[11px] sm:text-xs font-medium truncate">
                      {asset.category}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400">
                      {formatCurrency(asset.value)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      {asset.percentage}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Pulse Animation */}
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
      </div>
    </motion.div>
  )
}
