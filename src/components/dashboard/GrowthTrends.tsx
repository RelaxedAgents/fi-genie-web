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
        <div className="relative z-10 p-2.5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-medium text-gray-400">Growth Trends</h3>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
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

          {/* Chart Type Selector */}
          <div className="flex gap-1 mb-1.5">
            {[
              { key: 'netWorth', label: 'Net Worth' },
              { key: 'creditScore', label: 'Credit Score' },
              { key: 'cashFlow', label: 'Cash Flow' }
            ].map((chart) => (
              <motion.button
                key={chart.key}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all",
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

          {/* Chart */}
          <div 
            className="flex-1 relative"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              })
            }}
            onMouseLeave={() => setMousePosition(null)}
          >
            <svg className="w-full h-full" viewBox="0 0 400 150">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                <line
                  key={y}
                  x1="30"
                  y1={130 - y * 110}
                  x2="380"
                  y2={130 - y * 110}
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="5,5"
                />
              ))}

              {/* Main line chart */}
              <motion.path
                d={`M ${activeData.map((point, index) => {
                  const x = 30 + (index / (activeData.length - 1)) * 350
                  const y = 130 - point.normalized * 110
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ')}`}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              {/* Glow effect for line */}
              <motion.path
                d={`M ${activeData.map((point, index) => {
                  const x = 30 + (index / (activeData.length - 1)) * 350
                  const y = 130 - point.normalized * 110
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ')}`}
                fill="none"
                stroke="url(#glowGradient)"
                strokeWidth="8"
                filter="blur(8px)"
                opacity="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              {/* Area fill */}
              <motion.path
                d={`M ${activeData.map((point, index) => {
                  const x = 30 + (index / (activeData.length - 1)) * 350
                  const y = 130 - point.normalized * 110
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ')} L 380 130 L 30 130 Z`}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              {/* Data points */}
              {activeData.map((point, index) => {
                const x = 30 + (index / (activeData.length - 1)) * 350
                const y = 130 - point.normalized * 110
                
                return (
                  <g key={index}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3B82F6"
                      stroke="white"
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    />
                    
                    {/* Pulse effect */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      animate={{
                        r: [4, 12, 4],
                        opacity: [1, 0, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    />
                  </g>
                )
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                
                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
                
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover tooltip */}
            {mousePosition && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: mousePosition.x,
                  top: mousePosition.y - 40
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                  <p className="text-white font-semibold">
                    {activeChart === 'netWorth' && 'Net Worth'}
                    {activeChart === 'creditScore' && 'Credit Score'}
                    {activeChart === 'cashFlow' && 'Cash Flow'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Value display */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-400">
              {activeData[0]?.month} - {activeData[activeData.length - 1]?.month}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-white">
                {activeChart === 'netWorth' && '+13.5%'}
                {activeChart === 'creditScore' && '+21 pts'}
                {activeChart === 'cashFlow' && '+11.8%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
