"use client"

import React from "react"
import { motion } from "framer-motion"
import { PieChart, ShoppingBag, Car, Utensils, Zap, CreditCard, MoreHorizontal } from "lucide-react"

interface SpendingCategory {
  category: string
  amount: number
  percentage: number
  color: string
}

interface SpendingCategoriesProps {
  categories: SpendingCategory[]
  totalSpent: number
}

export const SpendingCategoriesMobile: React.FC<SpendingCategoriesProps> = ({
  categories,
  totalSpent
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`
    }
    return `₹${amount.toLocaleString()}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food & dining':
        return <Utensils className="w-3 h-3" />
      case 'transportation':
        return <Car className="w-3 h-3" />
      case 'shopping':
        return <ShoppingBag className="w-3 h-3" />
      case 'bills & utilities':
        return <Zap className="w-3 h-3" />
      case 'cash':
        return <CreditCard className="w-3 h-3" />
      default:
        return <MoreHorizontal className="w-3 h-3" />
    }
  }

  // Calculate cumulative percentage for donut chart
  let cumulativePercentage = 0

  return (
    <div className="relative h-full w-full">
      <div className="relative w-full h-full rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-3 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-400">Spend Analysis</h3>
              <p className="text-gray-500 text-xs">Spending breakdown</p>
            </div>
            <PieChart className="w-4 h-4 text-primary" />
          </div>

          {/* AI Insight - Compact */}
          <div className="mb-2 flex-shrink-0">
            <div className="bg-white/[0.06] rounded-lg p-2 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <PieChart className="w-3 h-3 text-primary flex-shrink-0" />
                <div className="flex items-center gap-1 min-w-0">
                  <p className="text-[10px] font-medium text-white">AI Insight:</p>
                  <p className="text-[10px] text-gray-300 truncate">
                    Top spending: {categories[0]?.category}. 
                    Consider budget limits for better savings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Donut Chart - Compact */}
          <div className="flex justify-center mb-3 flex-shrink-0">
            <div className="relative">
              <svg width="140" height="140" className="transform -rotate-90">
                {categories.map((category, index) => {
                  const radius = 50
                  const circumference = 2 * Math.PI * radius
                  const strokeDasharray = `${(category.percentage / 100) * circumference} ${circumference}`
                  const strokeDashoffset = -cumulativePercentage * circumference / 100
                  cumulativePercentage += category.percentage
                  
                  return (
                    <motion.circle
                      key={index}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke={category.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  )
                })}
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-white">
                  {formatCurrency(totalSpent)}
                </div>
                <div className="text-xs text-gray-400">Total Spent</div>
              </div>
            </div>
          </div>

          {/* Categories List - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white/[0.04] rounded-lg p-2 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5 shadow-lg"
                      style={{ 
                        backgroundColor: category.color,
                        boxShadow: `0 0 4px ${category.color}40`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate">
                        {category.category}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {category.percentage}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
    </div>
  )
}
