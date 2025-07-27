"use client"

import React from "react"
import { motion } from "framer-motion"
import { Building2, CreditCard, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface BankAccount {
  id: string
  bankName: string
  accountType: string
  accountNumber: string
  balance: number
  status: string
}

interface BankAccountsListProps {
  accounts: BankAccount[]
}

export const BankAccountsList: React.FC<BankAccountsListProps> = ({
  accounts
}) => {
  const [showBalances, setShowBalances] = useState(true)

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

  const getBankIcon = (bankName: string) => {
    // You can customize this based on actual bank logos
    return <Building2 className="w-5 h-5" />
  }

  const getAccountTypeIcon = (accountType: string) => {
    return <CreditCard className="w-4 h-4" />
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400'
      case 'inactive':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

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
              <h3 className="text-base font-medium text-gray-400">Bank Accounts</h3>
              <p className="text-gray-500 text-sm">{accounts.length} accounts</p>
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-1 bg-white/[0.04] rounded-lg backdrop-blur-sm border border-white/[0.06] transition-all hover:bg-white/[0.08]"
            >
              {showBalances ? (
                <Eye className="w-4 h-4 text-gray-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* AI Insight - At Top */}
          <div className="mb-4">
            <div className="bg-white/[0.06] rounded-lg p-2 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3 h-3 text-primary" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium text-white">AI Insight:</p>
                  <p className="text-xs text-gray-300">
                    {isNegative(totalBalance) 
                      ? "Total balance is negative. Review overdraft limits."
                      : "Accounts well-balanced. Consider optimizing rates."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

      {/* Total Balance Summary - Compact */}
      <div className="mb-1.5 p-1.5 bg-white/[0.04] rounded-lg backdrop-blur-sm border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Total Balance</p>
            <p className={`text-lg font-bold ${isNegative(totalBalance) ? 'text-red-400' : 'text-green-400'}`}>
              {showBalances ? (
                <>
                  {isNegative(totalBalance) ? '-' : ''}{formatCurrency(Math.abs(totalBalance))}
                </>
              ) : (
                '••••••'
              )}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isNegative(totalBalance) ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
        </div>
      </div>

      {/* Accounts List - Scroll if more than 3 */}
      <div className={`flex-1 space-y-1 ${accounts.length > 3 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white/[0.04] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
          >
            {/* Account Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3 h-3 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white text-xs font-medium truncate">{account.bankName}</h4>
                  <p className="text-gray-400 text-xs">{account.accountNumber}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-semibold ${isNegative(account.balance) ? 'text-red-400' : 'text-white'}`}>
                  {showBalances ? (
                    <>
                      {isNegative(account.balance) ? '-' : ''}{formatCurrency(Math.abs(account.balance))}
                    </>
                  ) : (
                    '••••••'
                  )}
                </p>
                <div className={`text-xs ${getStatusColor(account.status)}`}>
                  {account.status}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
