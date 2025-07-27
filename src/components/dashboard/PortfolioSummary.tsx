"use client"

import React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Activity } from "lucide-react"

interface PortfolioData {
  totalValue: number
  totalInvested: number
  totalReturns: number
  returnPercentage: number
  xirr: number
}

interface PortfolioSummaryProps {
  portfolioData: PortfolioData
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolioData
}) => {
  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount)
    if (absAmount >= 100000) {
      return `₹${(absAmount / 100000).toFixed(1)}L`
    } else if (absAmount >= 1000) {
      return `₹${(absAmount / 1000).toFixed(1)}k`
    }
    return `₹${absAmount.toLocaleString()}`
  }

  const isPositive = (amount: number) => amount >= 0

  return (
    <motion.div className="relative h-full">
      <div className="relative w-full h-full rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] shadow-2xl shadow-black/50 overflow-hidden group">
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-gray-400">Portfolio Overview</h3>
              <p className="text-gray-500 text-sm">Investment summary</p>
            </div>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>

          {/* AI Insight */}
          <div className="mb-4">
            <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium text-white">AI Insight:</p>
                  <p className="text-xs text-gray-300">
                    Portfolio up {portfolioData.returnPercentage.toFixed(1)}% ({formatCurrency(portfolioData.totalReturns)} gains). 
                    XIRR of {portfolioData.xirr}% beats market.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Portfolio Value */}
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-gray-300 text-sm font-medium">Total Portfolio Value</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-bold text-white">
                {formatCurrency(portfolioData.totalValue)}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                isPositive(portfolioData.totalReturns) ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {isPositive(portfolioData.totalReturns) ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  isPositive(portfolioData.totalReturns) ? 'text-green-400' : 'text-red-400'
                }`}>
                  {portfolioData.returnPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* Total Invested */}
            <motion.div 
              className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-sm">Total Invested</span>
              </div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(portfolioData.totalInvested)}
              </div>
            </motion.div>

            {/* Total Returns */}
            <motion.div 
              className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {isPositive(portfolioData.totalReturns) ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-400 text-sm">Total Returns</span>
              </div>
              <div className={`text-lg font-bold ${
                isPositive(portfolioData.totalReturns) ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive(portfolioData.totalReturns) ? '+' : ''}{formatCurrency(portfolioData.totalReturns)}
              </div>
            </motion.div>

            {/* XIRR */}
            <motion.div 
              className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400 text-sm">XIRR</span>
              </div>
              <div className="text-lg font-bold text-purple-400">
                {portfolioData.xirr.toFixed(2)}%
              </div>
            </motion.div>

            {/* Return Percentage */}
            <motion.div 
              className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-sm">Returns %</span>
              </div>
              <div className={`text-lg font-bold ${
                isPositive(portfolioData.returnPercentage) ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive(portfolioData.returnPercentage) ? '+' : ''}{portfolioData.returnPercentage.toFixed(2)}%
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
