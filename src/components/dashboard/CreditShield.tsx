"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface OverviewProps {
  netWorth: {
    total: number
    totalAssets: number
    totalLiabilities: number
    debtToAssetRatio: number
  }
  creditScore: {
    score: number
    maxScore?: number
    rating?: string
  }
  insight?: string
}

export const CreditShield: React.FC<OverviewProps> = ({
  netWorth,
  creditScore,
  insight
}) => {
  const [displayNetWorth, setDisplayNetWorth] = useState(0)
  const [displayCreditScore, setDisplayCreditScore] = useState(0)
  const [showInsight, setShowInsight] = useState(false)

  useEffect(() => {
    // Animate net worth counting
    const duration = 2000
    const steps = 60
    const increment = netWorth.total / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= netWorth.total) {
        setDisplayNetWorth(netWorth.total)
        clearInterval(timer)
      } else {
        setDisplayNetWorth(Math.floor(current))
      }
    }, duration / steps)

    // Animate credit score counting
    const scoreIncrement = creditScore.score / steps
    let scoreCurrent = 0

    const scoreTimer = setInterval(() => {
      scoreCurrent += scoreIncrement
      if (scoreCurrent >= creditScore.score) {
        setDisplayCreditScore(creditScore.score)
        clearInterval(scoreTimer)
      } else {
        setDisplayCreditScore(Math.floor(scoreCurrent))
      }
    }, duration / steps)

    return () => {
      clearInterval(timer)
      clearInterval(scoreTimer)
    }
  }, [netWorth.total, creditScore.score])

  const formatCurrency = (value: number) => {
    const absAmount = Math.abs(value)
    if (absAmount >= 100000) {
      return `₹${(absAmount / 100000).toFixed(1)}L`
    } else if (absAmount >= 1000) {
      return `₹${(absAmount / 1000).toFixed(1)}k`
    }
    return `₹${absAmount.toLocaleString()}`
  }

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
        <div className="relative z-10 p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="text-sm sm:text-base font-medium text-gray-400">Overview</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Financial summary</p>
            </div>
          </div>

          {/* AI Insight - At Top */}
          {insight && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
                <div className="flex items-start sm:items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <Info className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                    <p className="text-xs font-medium text-white">AI Insight:</p>
                    <p className="text-xs text-gray-300">
                      Net Worth: <span className="text-primary font-medium">{formatCurrency(netWorth.total)}</span>. 
                      Low debt ratio of {netWorth.debtToAssetRatio.toFixed(1)}% is excellent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Display - Net Worth and Credit Score - Centered */}
          <div className="flex-1 flex justify-center items-center mb-4 sm:mb-6">
            <div className="flex gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="text-center">
                <motion.div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-1 sm:mb-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {formatCurrency(displayNetWorth)}
                </motion.div>
                <p className="text-xs sm:text-sm text-gray-400">Net Worth</p>
              </div>
              <div className="text-center">
                <motion.div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {displayCreditScore}
                </motion.div>
                <p className="text-xs sm:text-sm text-gray-400">Credit Score</p>
              </div>
            </div>
          </div>

          {/* Overview Cards - Removed Credit Score */}
          <div className="space-y-2 sm:space-y-3">
            {/* Assets */}
            <motion.div
              className="bg-white/[0.03] rounded-lg p-2 backdrop-blur-sm border border-white/[0.05]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-xs sm:text-sm text-gray-400">Total Assets</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-green-400">
                  {formatCurrency(netWorth.totalAssets)}
                </span>
              </div>
            </motion.div>

            {/* Liabilities */}
            <motion.div
              className="bg-white/[0.03] rounded-lg p-2 backdrop-blur-sm border border-white/[0.05]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                  <span className="text-xs sm:text-sm text-gray-400">Total Liabilities</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-red-400">
                  {formatCurrency(netWorth.totalLiabilities)}
                </span>
              </div>
            </motion.div>

            {/* Debt to Asset Ratio */}
            <motion.div
              className="bg-white/[0.03] rounded-lg p-2 backdrop-blur-sm border border-white/[0.05]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-xs sm:text-sm text-gray-400">Debt to Asset Ratio</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-blue-400">
                  {netWorth.debtToAssetRatio.toFixed(1)}%
                </span>
              </div>
            </motion.div>
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
