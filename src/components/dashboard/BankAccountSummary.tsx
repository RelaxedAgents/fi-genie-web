"use client"

import React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Activity } from "lucide-react"

interface AccountSummary {
  totalBalance: number
  monthlyInflow: number
  monthlyOutflow: number
  netCashFlow: number
}

interface MonthlyTrends {
  summary: {
    averageCredit: number
    averageDebit: number
    topSpendingCategory: string
    inflowTransactions: number
    outflowTransactions: number
  }
}

interface BankAccountSummaryProps {
  summary: AccountSummary
  trends: MonthlyTrends
}

export const BankAccountSummary: React.FC<BankAccountSummaryProps> = ({
  summary,
  trends
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

  const isNegative = (amount: number) => amount < 0

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
              <h3 className="text-base font-medium text-gray-400">Account Summary</h3>
              <p className="text-gray-500 text-sm">Your financial overview</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>

          {/* AI Insights - At Top */}
          <div className="mb-4">
            <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium text-white">AI Insight:</p>
                  <p className="text-xs text-gray-300">
                    Most spent on <span className="text-primary font-medium">{trends.summary.topSpendingCategory}</span> this month
                  </p>
                </div>
              </div>
            </div>
          </div>

      {/* Total Balance Section */}
      <div className="mb-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <DollarSign className="w-3 h-3 text-primary" />
          <span className="text-gray-300 text-xs font-medium">Total Balance</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-lg font-bold ${isNegative(summary.totalBalance) ? 'text-red-400' : 'text-green-400'}`}>
            {isNegative(summary.totalBalance) ? '-' : ''}{formatCurrency(Math.abs(summary.totalBalance))}
          </span>
          {isNegative(summary.netCashFlow) ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/20">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-red-400 text-xs font-medium">Deficit</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/20">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-medium">Surplus</span>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Cash Flow */}
      <div className="mb-1.5">
        <h4 className="text-gray-300 text-xs font-medium mb-1">Monthly Cash Flow</h4>
        <div className="grid grid-cols-2 gap-1.5">
          <motion.div 
            className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.1] transition-all"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-gray-300 text-xs font-medium">Inflow</span>
            </div>
            <div className="text-sm font-bold text-green-400">
              {formatCurrency(summary.monthlyInflow)}
            </div>
            <div className="text-xs text-gray-400">
              {trends.summary.inflowTransactions} txns
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.1] transition-all"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <ArrowDownRight className="w-3 h-3 text-red-400" />
              <span className="text-gray-300 text-xs font-medium">Outflow</span>
            </div>
            <div className="text-sm font-bold text-red-400">
              {formatCurrency(summary.monthlyOutflow)}
            </div>
            <div className="text-xs text-gray-400">
              {trends.summary.outflowTransactions} txns
            </div>
          </motion.div>
        </div>
      </div>

      {/* Transaction Insights */}
      <div className="mb-1.5">
        <h4 className="text-gray-300 text-xs font-medium mb-1">Transaction Insights</h4>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="text-center bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
            <div className="text-sm font-bold text-white">
              ₹{trends.summary.averageCredit.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Avg Credit</div>
          </div>
          <div className="text-center bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
            <div className="text-sm font-bold text-white">
              ₹{trends.summary.averageDebit.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Avg Debit</div>
          </div>
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
