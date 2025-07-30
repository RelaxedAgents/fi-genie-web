"use client"

import React from "react"
import { motion } from "framer-motion"
import { Brain, Lightbulb, TrendingUp, Shield, CreditCard, Building2, LineChart } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIInsightsProps {
  creditInsights: string[]
  netWorthInsights: string[]
  bankingInsights: string[]
  investmentInsights: string[]
}

export const CashFlowRiverMobile: React.FC<AIInsightsProps> = ({
  creditInsights,
  netWorthInsights,
  bankingInsights,
  investmentInsights
}) => {
  const categories = [
    {
      name: 'Credit',
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      insights: creditInsights
    },
    {
      name: 'Banking',
      icon: Building2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      insights: bankingInsights
    },
    {
      name: 'Investment',
      icon: LineChart,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      insights: investmentInsights
    },
    {
      name: 'Net Worth',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      insights: netWorthInsights
    }
  ]

  const totalInsights = creditInsights.length + netWorthInsights.length + 
                       bankingInsights.length + investmentInsights.length

  return (
    <motion.div className="relative h-full">
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden"
      )}>
        {/* Content */}
        <div className="relative z-10 p-3 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-400">AI Insights</h3>
              <span className="text-xs text-gray-500">{totalInsights} recommendations</span>
            </div>
            <Brain className="w-4 h-4 text-primary" />
          </div>

          {/* Insights List - All categories visible */}
          <div className="flex-1 overflow-y-auto thin-scrollbar space-y-3">
            {categories.map((category, categoryIndex) => {
              if (category.insights.length === 0) return null
              
              return (
                <motion.div 
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <category.icon className={cn("w-4 h-4", category.color)} />
                    <h4 className={cn("text-xs font-medium", category.color)}>
                      {category.name}
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      ({category.insights.length})
                    </span>
                    <div className="flex-1 h-[1px] bg-white/[0.05] ml-2" />
                  </div>

                  {/* Category Insights */}
                  <div className="space-y-2 ml-6">
                    {category.insights.map((insight, index) => (
                      <motion.div
                        key={`${category.name}-${index}`}
                        className="bg-white/[0.04] rounded-lg p-2.5 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            category.bgColor
                          )}>
                            <Shield className={cn("w-3 h-3", category.color)} />
                          </div>
                          <p className="text-xs text-gray-200 leading-relaxed">
                            {insight}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom Summary */}
          <div className="mt-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-medium text-yellow-400">
                AI-Powered Recommendations
              </span>
            </div>
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
    </motion.div>
  )
}
