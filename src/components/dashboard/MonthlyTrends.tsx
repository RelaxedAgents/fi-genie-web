"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface ChartData {
  month: string
  inflow: number
  outflow: number
}

interface TrendsData {
  summary: {
    averageCredit: number
    averageDebit: number
    topSpendingCategory: string
    inflowTransactions: number
    outflowTransactions: number
  }
}

interface MonthlyTrendsProps {
  trendsData: TrendsData
  chartData: ChartData[]
}

export const MonthlyTrends: React.FC<MonthlyTrendsProps> = ({
  trendsData,
  chartData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview')

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`
    }
    return `₹${amount.toLocaleString()}`
  }

  // Calculate max value for chart scaling
  const maxValue = Math.max(...chartData.map(d => Math.max(d.inflow, d.outflow)))

  // Calculate trends
  const currentMonth = chartData[chartData.length - 1]
  const previousMonth = chartData[chartData.length - 2]
  const inflowTrend = currentMonth && previousMonth ? 
    ((currentMonth.inflow - previousMonth.inflow) / previousMonth.inflow) * 100 : 0
  const outflowTrend = currentMonth && previousMonth ? 
    ((currentMonth.outflow - previousMonth.outflow) / previousMonth.outflow) * 100 : 0

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
              <h3 className="text-base font-medium text-gray-400">Monthly Trends</h3>
              <p className="text-gray-500 text-sm">Cash flow analysis</p>
            </div>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>

          {/* AI Insights - At Top */}
          <div className="mb-4">
            <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium text-white">AI Insight:</p>
                  <p className="text-xs text-gray-300">
                    Spending {outflowTrend >= 0 ? 'up' : 'down'} {Math.abs(outflowTrend).toFixed(1)}%. 
                    Review {trendsData.summary.topSpendingCategory.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Tab Navigation */}
          <div className="flex gap-1 mb-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'details'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Details
            </button>
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* Line Chart */}
              <div className="flex-1 mb-3">
                <div className="relative h-40 bg-white/[0.02] rounded-lg p-4">
                  <svg width="100%" height="100%" viewBox="0 0 300 120" className="overflow-visible">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 30}
                        x2="300"
                        y2={i * 30}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Inflow Line */}
                    <motion.polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData.map((data, index) => 
                        `${(index * 60)},${120 - (data.inflow / maxValue) * 100}`
                      ).join(' ')}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    
                    {/* Outflow Line */}
                    <motion.polyline
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData.map((data, index) => 
                        `${(index * 60)},${120 - (data.outflow / maxValue) * 100}`
                      ).join(' ')}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                    />
                    
                    {/* Data points */}
                    {chartData.map((data, index) => (
                      <g key={index}>
                        <motion.circle
                          cx={index * 60}
                          cy={120 - (data.inflow / maxValue) * 100}
                          r="4"
                          fill="#10b981"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                        />
                        <motion.circle
                          cx={index * 60}
                          cy={120 - (data.outflow / maxValue) * 100}
                          r="4"
                          fill="#ef4444"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 1.5 + index * 0.1 }}
                        />
                      </g>
                    ))}
                  </svg>
                  
                  {/* Month labels */}
                  <div className="flex justify-between mt-2">
                    {chartData.map((data, index) => (
                      <span key={index} className="text-xs text-gray-400">
                        {data.month}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <span className="text-xs text-gray-400">Inflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <span className="text-xs text-gray-400">Outflow</span>
                  </div>
                </div>
              </div>

              {/* Current Month Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">This Month In</span>
                  </div>
                  <div className="text-lg font-semibold text-green-400">
                    {formatCurrency(currentMonth?.inflow || 0)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {inflowTrend >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs ${inflowTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.abs(inflowTrend).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400 text-sm">This Month Out</span>
                  </div>
                  <div className="text-lg font-semibold text-red-400">
                    {formatCurrency(currentMonth?.outflow || 0)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {outflowTrend >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-red-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-green-400" />
                    )}
                    <span className={`text-xs ${outflowTrend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {Math.abs(outflowTrend).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Compact Details View */}
              <div className="flex-1 space-y-2">
                {/* Transaction Summary */}
                <div className="bg-white/[0.04] rounded-lg p-2 backdrop-blur-sm border border-white/[0.06]">
                  <h4 className="text-white text-xs font-medium mb-2">Transactions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-400">
                        {trendsData.summary.inflowTransactions}
                      </div>
                      <div className="text-xs text-gray-400">Inflow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-red-400">
                        {trendsData.summary.outflowTransactions}
                      </div>
                      <div className="text-xs text-gray-400">Outflow</div>
                    </div>
                  </div>
                </div>

                {/* Average Analysis */}
                <div className="bg-white/[0.04] rounded-lg p-2 backdrop-blur-sm border border-white/[0.06]">
                  <h4 className="text-white text-xs font-medium mb-2">Averages</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Credit</span>
                      <span className="text-green-400 text-xs font-semibold">
                        ₹{trendsData.summary.averageCredit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Debit</span>
                      <span className="text-red-400 text-xs font-semibold">
                        ₹{trendsData.summary.averageDebit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="bg-white/[0.04] rounded-lg p-2 backdrop-blur-sm border border-white/[0.06]">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Monthly Insight</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Spending {outflowTrend >= 0 ? 'up' : 'down'} {Math.abs(outflowTrend).toFixed(1)}%. 
                        Review {trendsData.summary.topSpendingCategory.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
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
