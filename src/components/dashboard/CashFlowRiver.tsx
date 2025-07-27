"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Lightbulb, TrendingUp, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIInsightsProps {
  creditInsights: string[]
  netWorthInsights: string[]
  bankingInsights: string[]
  investmentInsights: string[]
}

export const CashFlowRiver: React.FC<AIInsightsProps> = ({
  creditInsights,
  netWorthInsights,
  bankingInsights,
  investmentInsights
}) => {
  const [activeTab, setActiveTab] = useState<'credit' | 'netWorth' | 'banking' | 'investment'>('credit')

  const allInsights = 
    activeTab === 'credit' ? creditInsights :
    activeTab === 'netWorth' ? netWorthInsights :
    activeTab === 'banking' ? bankingInsights :
    investmentInsights

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
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-gray-400">AI Insights</h3>
              <p className="text-gray-500 text-sm">Smart recommendations</p>
            </div>
            <Brain className="w-5 h-5 text-primary" />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-4">
            <button
              onClick={() => setActiveTab('credit')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'credit'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Credit
            </button>
            <button
              onClick={() => setActiveTab('netWorth')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'netWorth'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Net Worth
            </button>
            <button
              onClick={() => setActiveTab('banking')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'banking'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Banking
            </button>
            <button
              onClick={() => setActiveTab('investment')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'investment'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Investment
            </button>
          </div>

          {/* Insights List */}
          <div className="flex-1 space-y-3">
            {allInsights.map((insight, index) => (
              <motion.div
                key={`${activeTab}-${index}`}
                className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {activeTab === 'credit' ? (
                      <Shield className="w-3 h-3 text-primary" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {insight}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Summary */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">
                {activeTab === 'credit' ? 'Credit Optimization' : 'Wealth Building'}
              </span>
              <span className="text-xs text-gray-400">
                {allInsights.length} insights available
              </span>
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
