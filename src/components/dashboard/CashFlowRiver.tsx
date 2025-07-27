"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, TrendingUp, TrendingDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthlyData {
  income: {
    total: number
  }
  expenses: {
    total: number
  }
  surplus: number
  savingsRate: number
}

interface HistoricalData {
  month: string
  surplus: number
  income: number
  expenses: number
}

interface CashFlowRiverProps {
  monthlyData: MonthlyData
  historicalData: HistoricalData[]
  savingsRate: number
  insight?: string
}

export const CashFlowRiver: React.FC<CashFlowRiverProps> = ({
  monthlyData,
  historicalData,
  savingsRate,
  insight
}) => {
  const [displaySurplus, setDisplaySurplus] = useState(0)
  const [showInsight, setShowInsight] = useState(false)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = monthlyData.surplus / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= monthlyData.surplus) {
        setDisplaySurplus(monthlyData.surplus)
        clearInterval(timer)
      } else {
        setDisplaySurplus(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [monthlyData.surplus])

  const formatCurrency = (value: number) => {
    return `₹${(value / 1000).toFixed(1)}k`
  }

  return (
    <motion.div 
      className="relative h-full"
    >
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden"
      )}>
        {/* River Animation Background */}
        <div className="absolute inset-0">
          {/* Flowing Water Effect */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className="text-blue-400/20" stopColor="currentColor" />
                <stop offset="50%" className="text-cyan-400/30" stopColor="currentColor" />
                <stop offset="100%" className="text-blue-400/20" stopColor="currentColor" />
              </linearGradient>
            </defs>
            
            {/* River waves */}
            {[0, 1, 2].map((index) => (
              <motion.path
                key={index}
                d="M0,50 Q25,45 50,50 T100,50 L100,100 L0,100 Z"
                fill="url(#riverGradient)"
                fillOpacity={0.3 - index * 0.1}
                animate={{
                  d: [
                    "M0,50 Q25,45 50,50 T100,50 L100,100 L0,100 Z",
                    "M0,50 Q25,55 50,50 T100,50 L100,100 L0,100 Z",
                    "M0,50 Q25,45 50,50 T100,50 L100,100 L0,100 Z"
                  ]
                }}
                transition={{
                  duration: 3 + index,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.5
                }}
              />
            ))}
          </svg>

          {/* Flow particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-cyan-400/60 rounded-full shadow-sm shadow-cyan-400/50"
              animate={{
                x: ["-2%", "102%"],
                y: [
                  `${55 + Math.sin(i * 0.5) * 10}%`,
                  `${60 + Math.sin(i * 0.5 + 1) * 10}%`,
                  `${55 + Math.sin(i * 0.5 + 2) * 10}%`
                ],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Cash Flow River</h3>
            <div className="flex items-center gap-2">
              {insight && (
                <motion.button
                  className="relative group"
                  onClick={() => setShowInsight(!showInsight)}
                  whileTap={{ scale: 0.9 }}
                >
                  <Info className="w-4 h-4 text-gray-400 transition-colors" />
                  
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

          {/* Main Display */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <motion.div
              className="text-3xl font-bold text-white mb-1"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {formatCurrency(displaySurplus)}
            </motion.div>
            <p className="text-sm text-gray-400 mb-1">Monthly Surplus</p>
            
            {/* Savings Rate Badge */}
            <motion.div
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                "bg-green-500/20 text-green-400 border border-green-500/30"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {savingsRate.toFixed(1)}% Savings Rate
            </motion.div>
          </div>

          {/* Income/Expense Flow Visualization */}
          <motion.div
            className="mt-4 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            {/* Income Stream */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-500">Income</span>
                </div>
                <span className="text-xs font-semibold text-green-400">
                  {formatCurrency(monthlyData.income.total)}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Expense Stream */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-gray-500">Expenses</span>
                </div>
                <span className="text-xs font-semibold text-red-400">
                  {formatCurrency(monthlyData.expenses.total)}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(monthlyData.expenses.total / monthlyData.income.total) * 100}%` 
                  }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
