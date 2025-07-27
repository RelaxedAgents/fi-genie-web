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

export const SpendingCategories: React.FC<SpendingCategoriesProps> = ({
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
        return <Utensils className="w-4 h-4" />
      case 'transportation':
        return <Car className="w-4 h-4" />
      case 'shopping':
        return <ShoppingBag className="w-4 h-4" />
      case 'bills & utilities':
        return <Zap className="w-4 h-4" />
      case 'cash':
        return <CreditCard className="w-4 h-4" />
      default:
        return <MoreHorizontal className="w-4 h-4" />
    }
  }

  // Calculate the circumference for the donut chart
  const radius = 80
  const circumference = 2 * Math.PI * radius
  let cumulativePercentage = 0

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
              <h3 className="text-base font-medium text-gray-400">Spend Analysis</h3>
              <p className="text-gray-500 text-sm">Spending breakdown</p>
            </div>
            <PieChart className="w-5 h-5 text-primary" />
          </div>

          {/* AI Insight - At Top */}
          <div className="mb-4">
            <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium text-white">AI Insight:</p>
                  <p className="text-xs text-gray-300">
                    Top spending: <span className="text-primary font-medium">{categories[0]?.category}</span>. 
                    Consider budget limits for better savings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart Left Half + Values Right Half in 2 Columns */}
          <div className="flex-1 flex gap-3">
            {/* Left Half - Pie Chart */}
            <div className="w-1/2 flex items-center justify-center">
              <div className="relative">
                <svg width="260" height="260" className="transform -rotate-90">
                  {categories.map((category, index) => {
                    const radius = 100
                    const circumference = 2 * Math.PI * radius
                    const strokeDasharray = `${(category.percentage / 100) * circumference} ${circumference}`
                    const strokeDashoffset = -cumulativePercentage * circumference / 100
                    cumulativePercentage += category.percentage
                    
                    return (
                      <motion.circle
                        key={index}
                        cx="130"
                        cy="130"
                        r={radius}
                        fill="none"
                        stroke={category.color}
                        strokeWidth="30"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circumference}` }}
                        animate={{ strokeDasharray }}
                        transition={{ duration: 1.2, delay: index * 0.15 }}
                      />
                    )
                  })}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(totalSpent)}
                  </div>
                  <div className="text-base text-gray-400">Total Spent</div>
                </div>
              </div>
            </div>

            {/* Right Half - Values in 2 Columns */}
            <div className="w-1/2 grid grid-cols-2 gap-2 content-center">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
                    style={{ 
                      backgroundColor: category.color,
                      boxShadow: `0 0 6px ${category.color}40`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">
                      {category.category}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatCurrency(category.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage}%
                    </div>
                  </div>
                </motion.div>
              ))}
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
