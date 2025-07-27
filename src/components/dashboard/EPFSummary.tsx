"use client"

import React from "react"
import { motion } from "framer-motion"
import { Shield, Users, Building, Clock, Activity } from "lucide-react"

interface EPFItem {
  label: string
  value: string
}

interface EPFData {
  dataType: string
  summary: {
    title: string
    totalBalance: string
    pensionBalance: string
    lastUpdated: string
    items: EPFItem[]
  }
}

interface EPFSummaryProps {
  epfData: EPFData
}

export const EPFSummary: React.FC<EPFSummaryProps> = ({
  epfData
}) => {
  const getItemIcon = (label: string) => {
    if (label.includes("Employee")) return <Users className="w-4 h-4 text-blue-400" />
    if (label.includes("Employer")) return <Building className="w-4 h-4 text-green-400" />
    if (label.includes("Pension")) return <Shield className="w-4 h-4 text-purple-400" />
    return <Activity className="w-4 h-4 text-cyan-400" />
  }

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
              <h3 className="text-base font-medium text-gray-400">EPF Summary</h3>
              <p className="text-gray-500 text-sm">Retirement savings</p>
            </div>
            <Shield className="w-5 h-5 text-primary" />
          </div>

          {/* AI Insight */}
          <div className="mb-4">
            <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium text-white">AI Insight:</p>
                  <p className="text-xs text-gray-300">
                    EPF balance {epfData.summary.totalBalance} growing steadily. 
                    Pension fund {epfData.summary.pensionBalance} on track for retirement goals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Balance Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Total PF Balance */}
            <motion.div 
              className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-sm">PF Balance</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {epfData.summary.totalBalance}
              </div>
            </motion.div>

            {/* Pension Balance */}
            <motion.div 
              className="bg-white/[0.04] rounded-lg p-3 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400 text-sm">Pension Fund</span>
              </div>
              <div className="text-lg font-bold text-purple-400">
                {epfData.summary.pensionBalance}
              </div>
            </motion.div>
          </div>

          {/* Detailed Breakdown */}
          <div className="flex-1">
            <h4 className="text-white text-sm font-medium mb-2">Breakdown</h4>
            <div className="space-y-2">
              {epfData.summary.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/[0.04] rounded-lg p-2.5 backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getItemIcon(item.label)}
                      <span className="text-gray-300 text-sm">{item.label}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {item.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 text-xs">{epfData.summary.lastUpdated}</span>
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
