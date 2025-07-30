"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Activity, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataPoint {
  month: string
  value?: number
  score?: number
  surplus?: number
}

interface GrowthTrendsProps {
  netWorthHistory: DataPoint[]
  creditScoreHistory: DataPoint[]
  cashFlowHistory: DataPoint[]
  insight?: string
}

export const GrowthTrends: React.FC<GrowthTrendsProps> = ({
  netWorthHistory,
  creditScoreHistory,
  cashFlowHistory,
  insight
}) => {
  const [activeChart, setActiveChart] = useState<'netWorth' | 'creditScore' | 'cashFlow'>('netWorth')
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [showInsight, setShowInsight] = useState(false)

  const formatValue = (value: number, type: string) => {
    if (type === 'netWorth') return `₹${(value / 100000).toFixed(1)}L`
    if (type === 'creditScore') return value.toString()
    if (type === 'cashFlow') return `₹${(value / 1000).toFixed(0)}k`
    return value.toString()
  }

  const normalizeData = (data: DataPoint[], key: 'value' | 'score' | 'surplus') => {
    const values = data.map(d => d[key] || 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    return data.map(d => ({
      ...d,
      normalized: ((d[key] || 0) - min) / (max - min)
    }))
  }

  const chartData = {
    netWorth: normalizeData(netWorthHistory, 'value'),
    creditScore: normalizeData(creditScoreHistory, 'score'),
    cashFlow: normalizeData(cashFlowHistory, 'surplus')
  }

  const activeData = chartData[activeChart]

  return (
    <motion.div className="relative h-full">
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden"
      )}>
        {/* Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="text-sm sm:text-base font-medium text-gray-400">Growth Trends</h3>
              <p className="text-gray-500 text-xs sm:text-sm hidden sm:inline">Performance analysis</p>
            </div>
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>

          {/* AI Insight - At Top */}
          {insight && (
            <div className="mb-2 sm:mb-3">
              <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
                <div className="flex items-start sm:items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <TrendingUp className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                    <p className="text-xs font-medium text-white">AI Insight:</p>
                    <p className="text-xs text-gray-300">
                      Trend: <span className="text-primary font-medium">Positive growth</span>. 
                      All metrics showing upward trajectory this quarter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chart Type Selector */}
          <div className="flex gap-1 mb-2 overflow-x-auto no-scrollbar">
            {[
              { key: 'netWorth', label: 'Net Worth', color: '#10b981' },
              { key: 'creditScore', label: 'Credit Score', color: '#3b82f6' },
              { key: 'cashFlow', label: 'Cash Flow', color: '#f59e0b' }
            ].map((chart) => (
              <motion.button
                key={chart.key}
                className={cn(
                  "px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap",
                  activeChart === chart.key
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                )}
                onClick={() => setActiveChart(chart.key as typeof activeChart)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {chart.label}
              </motion.button>
            ))}
          </div>

          {/* Value display - Moved above the chart */}
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <div className="text-[10px] sm:text-xs text-gray-500">
              {activeData[0]?.month} - {activeData[activeData.length - 1]?.month}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-white/[0.08] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 border border-white/[0.1]">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">
                {activeChart === 'netWorth' && '+17.7%'}
                {activeChart === 'creditScore' && '+2.5%'}
                {activeChart === 'cashFlow' && '-13.3%'}
              </span>
            </div>
          </div>

          {/* Line Chart - Responsive sizing */}
          <div className="flex-1 mb-2">
            <div className="relative bg-white/[0.02] rounded-lg p-2 h-full min-h-[200px] sm:min-h-[250px]">
              <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
                {/* Subtle Grid lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={i}
                    x1="15"
                    y1={15 + i * 25}
                    x2="285"
                    y2={15 + i * 25}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Gradient definition for worm effect */}
                <defs>
                  <linearGradient id={`gradient-${activeChart}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={
                      activeChart === 'netWorth' ? '#10b981' :
                      activeChart === 'creditScore' ? '#3b82f6' : '#f59e0b'
                    } stopOpacity="0.3" />
                    <stop offset="100%" stopColor={
                      activeChart === 'netWorth' ? '#10b981' :
                      activeChart === 'creditScore' ? '#3b82f6' : '#f59e0b'
                    } stopOpacity="1" />
                  </linearGradient>
                </defs>
                
                {/* Worm Line with glow effect */}
                <motion.polyline
                  fill="none"
                  stroke={`url(#gradient-${activeChart})`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))"
                  points={activeData.map((data, index) => 
                    `${15 + (index * 45)},${120 - (data.normalized * 80)}`
                  ).join(' ')}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                
                {/* Glowing Data points */}
                {activeData.map((data, index) => (
                  <motion.circle
                    key={`${activeChart}-${index}`}
                    cx={15 + (index * 45)}
                    cy={120 - (data.normalized * 80)}
                    r="4"
                    fill={
                      activeChart === 'netWorth' ? '#10b981' :
                      activeChart === 'creditScore' ? '#3b82f6' : '#f59e0b'
                    }
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    filter="drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                  />
                ))}
              </svg>
              
              {/* Month labels - positioned at bottom with guaranteed space */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                {activeData.map((data, index) => (
                  <span key={index} className="text-[9px] sm:text-xs text-gray-400 font-medium">
                    {data.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
