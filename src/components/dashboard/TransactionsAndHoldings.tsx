"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Activity, TrendingUp, TrendingDown, Calendar, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Transaction {
  date: string
  type: string
  scheme: string
  amount: number
  units: number
  nav: number | null
}

interface Holding {
  name: string
  type: string
  currentValue: number
  investedValue: number
  returns: number
  returnPercentage: number
  units: number
}

interface TransactionsAndHoldingsProps {
  transactions: Transaction[]
  holdings: Holding[]
}

export const TransactionsAndHoldings: React.FC<TransactionsAndHoldingsProps> = ({
  transactions,
  holdings
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'holdings'>('transactions')
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount)
    if (absAmount >= 100000) {
      return `₹${(absAmount / 100000).toFixed(1)}L`
    } else if (absAmount >= 1000) {
      return `₹${(absAmount / 1000).toFixed(1)}k`
    }
    return `₹${absAmount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short' 
    })
  }

  const getSchemeDisplayName = (scheme: string) => {
    if (scheme.startsWith('INE')) {
      return scheme.substring(0, 12) + '...'
    }
    if (scheme.length > 25) {
      return scheme.substring(0, 25) + '...'
    }
    return scheme
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    return transaction.type.toLowerCase() === filter
  })

  const topPerformer = holdings.reduce((prev, current) => 
    (prev.returnPercentage > current.returnPercentage) ? prev : current
  )

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
              <h3 className="text-base font-medium text-gray-400">Activity & Holdings</h3>
              <p className="text-gray-500 text-sm">Recent activity</p>
            </div>
            <Activity className="w-5 h-5 text-primary" />
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
                    Recent activity in {getSchemeDisplayName(transactions[0]?.scheme || '')}. 
                    Top performer: {getSchemeDisplayName(topPerformer.name)} (+{topPerformer.returnPercentage.toFixed(0)}% gains).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'holdings'
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Holdings
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === 'transactions' ? (
              <>
                {/* Filter */}
                <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'buy' | 'sell')}
                    className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="all">All Transactions</option>
                    <option value="buy">Buy Only</option>
                    <option value="sell">Sell Only</option>
                  </select>
                </div>

                {/* Transactions List - Scrollable */}
                <div className="flex-1 overflow-y-scroll min-h-0 max-h-full thin-scrollbar pr-2">
                  <div className="space-y-2 pb-2">
                    {filteredTransactions.map((transaction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white/[0.04] rounded-lg p-2.5 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all flex-shrink-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              transaction.type === 'Buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                              {transaction.type === 'Buy' ? (
                                <ArrowUpRight className="w-3 h-3 text-green-400" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 text-red-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white text-xs font-medium truncate">
                                {getSchemeDisplayName(transaction.scheme)}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {formatDate(transaction.date)} • {transaction.units} units
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-sm font-semibold ${
                              transaction.type === 'Buy' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'Buy' ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </div>
                            {transaction.nav && (
                              <div className="text-xs text-gray-400">
                                @₹{transaction.nav}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Holdings List - Scrollable */}
                <div className="flex-1 overflow-y-scroll min-h-0 max-h-full thin-scrollbar pr-2">
                  <div className="space-y-2 pb-2">
                    {holdings.map((holding, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white/[0.04] rounded-lg p-2.5 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all flex-shrink-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-white text-xs font-medium truncate">
                              {getSchemeDisplayName(holding.name)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {holding.type} • {holding.units} units
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold text-white">
                              {formatCurrency(holding.currentValue)}
                            </div>
                            <div className={`text-xs flex items-center gap-1 ${
                              holding.returns >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {holding.returns >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {holding.returnPercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
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
