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

export const MonthlyTrendsMobile: React.FC<MonthlyTrendsProps> = ({
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
    <div className="relative h-full w-full">
      <div className="relative w-full h-full rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-400">Monthly Trends</h3>
              <p className="text-gray-500 text-xs">Cash flow analysis</p>
            </div>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>

          {/* AI Insights - Compact */}
          <div className="mb-2 flex-shrink-0">
            <div className="bg-white/[0.06] rounded-lg p-2 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
                <div className="flex items-center gap-1 min-w-0">
                  <p className="text-[10px] font-medium text-white">AI Insight:</p>
                  <p className="text-[10px] text-gray-300 truncate">
                    Spending {outflowTrend >= 0 ? 'up' : 'down'} {Math.abs(outflowTrend).toFixed(1)}%. 
                    Review {trendsData.summary.topSpendingCategory.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Tab Navigation */}
          <div className="flex gap-1 mb-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'details'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Details
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
            {activeTab === 'overview' ? (
              <div className="space-y-2">
                {/* Compact Line Chart */}
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <svg width="100%" height="80" viewBox="0 0 300 80" className="overflow-visible">
                    {/* Grid lines */}
                    {[0, 1, 2].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 40}
                        x2="300"
                        y2={i * 40}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Inflow Line */}
                    <motion.polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData.map((data, index) => 
                        `${(index * 60)},${80 - (data.inflow / maxValue) * 70}`
                      ).join(' ')}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    
                    {/* Outflow Line */}
                    <motion.polyline
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData.map((data, index) => 
                        `${(index * 60)},${80 - (data.outflow / maxValue) * 70}`
                      ).join(' ')}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
                    />
                    
                    {/* Data points */}
                    {chartData.map((data, index) => (
                      <g key={index}>
                        <circle
                          cx={index * 60}
                          cy={80 - (data.inflow / maxValue) * 70}
                          r="3"
                          fill="#10b981"
                        />
                        <circle
                          cx={index * 60}
                          cy={80 - (data.outflow / maxValue) * 70}
                          r="3"
                          fill="#ef4444"
                        />
                      </g>
                    ))}
                  </svg>
                  
                  {/* Month labels */}
                  <div className="flex justify-between mt-1">
                    {chartData.map((data, index) => (
                      <span key={index} className="text-[10px] text-gray-400">
                        {data.month}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                    <span className="text-[10px] text-gray-400">Inflow</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                    <span className="text-[10px] text-gray-400">Outflow</span>
                  </div>
                </div>

                {/* Current Month Summary */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.04] rounded-lg p-2.5 backdrop-blur-sm border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-gray-400 text-xs">This Month In</span>
                    </div>
                    <div className="text-base font-semibold text-green-400">
                      {formatCurrency(currentMonth?.inflow || 0)}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {inflowTrend >= 0 ? (
                        <TrendingUp className="w-2.5 h-2.5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                      )}
                      <span className={`text-[10px] ${inflowTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(inflowTrend).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/[0.04] rounded-lg p-2.5 backdrop-blur-sm border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-gray-400 text-xs">This Month Out</span>
                    </div>
                    <div className="text-base font-semibold text-red-400">
                      {formatCurrency(currentMonth?.outflow || 0)}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {outflowTrend >= 0 ? (
                        <TrendingUp className="w-2.5 h-2.5 text-red-400" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 text-green-400" />
                      )}
                      <span className={`text-[10px] ${outflowTrend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {Math.abs(outflowTrend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Transaction Summary */}
                <div className="bg-white/[0.04] rounded-lg p-2 backdrop-blur-sm border border-white/[0.06]">
                  <h4 className="text-white text-xs font-medium mb-1.5">Transactions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-400">
                        {trendsData.summary.inflowTransactions}
                      </div>
                      <div className="text-[10px] text-gray-400">Inflow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-red-400">
                        {trendsData.summary.outflowTransactions}
                      </div>
                      <div className="text-[10px] text-gray-400">Outflow</div>
                    </div>
                  </div>
                </div>

                {/* Average Analysis */}
                <div className="bg-white/[0.04] rounded-lg p-2 backdrop-blur-sm border border-white/[0.06]">
                  <h4 className="text-white text-xs font-medium mb-1.5">Averages</h4>
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
              </div>
            )}
          </div>
        </div>

        {/* Subtle Glow Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        </motion.div>
      </div>
    </div>
  )
}
