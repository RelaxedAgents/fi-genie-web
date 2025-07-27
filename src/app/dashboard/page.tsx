"use client"

import React, { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore"
import { CreditShield } from "@/components/dashboard/CreditShield"
import { WealthWeb } from "@/components/dashboard/WealthWeb"
import { CashFlowRiver } from "@/components/dashboard/CashFlowRiver"
import { AssetAllocation } from "@/components/dashboard/AssetAllocation"
import { GrowthTrends } from "@/components/dashboard/GrowthTrends"
import { motion, Variants } from "framer-motion"
import masterData from "@/../../sampleMasterData.json"

export default function DashboardPage() {
  const [data, setData] = useState(masterData)
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="relative h-[calc(100vh-5rem)] p-2 overflow-hidden flex flex-col gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Row: Financial Health Score + Main Metrics */}
        <motion.div 
          className="grid grid-cols-4 gap-3 h-[calc(40%-4px)]"
          variants={containerVariants}
        >
          {/* Financial Health Score - Left */}
          <motion.div variants={itemVariants} className="relative">
            <FinancialHealthScore 
              score={data.financialOverview.financialHealthScore.overall}
              components={data.financialOverview.financialHealthScore.components}
              status={data.financialOverview.financialHealthScore.status}
              insight={data.aiGeneratedInsights.overallProfile}
            />
          </motion.div>

          {/* Credit Shield */}
          <motion.div variants={itemVariants} className="relative">
            <CreditShield 
              score={data.financialOverview.creditScore.score}
              maxScore={data.financialOverview.creditScore.maxScore}
              rating={data.financialOverview.creditScore.rating}
              paymentHistory={data.creditReport.paymentHistory}
              historicalData={data.historicalData.creditScore}
              insight={data.aiGeneratedInsights.creditInsights[0]}
            />
          </motion.div>

          {/* Wealth Web */}
          <motion.div variants={itemVariants} className="relative">
            <WealthWeb 
              netWorth={data.financialOverview.netWorth.total}
              assetBreakdown={data.wealthProfile.assetBreakdown}
              monthlyGrowth={data.financialOverview.netWorth.monthlyGrowth}
              historicalData={data.historicalData.netWorth}
              insight={data.aiGeneratedInsights.netWorthInsights[0]}
            />
          </motion.div>

          {/* Cash Flow River */}
          <motion.div variants={itemVariants} className="relative">
            <CashFlowRiver 
              monthlyData={data.monthlyFinancialSnapshot}
              historicalData={data.historicalData.monthlyCashFlow}
              savingsRate={data.monthlyFinancialSnapshot.savingsRate}
              insight={data.aiGeneratedInsights.netWorthInsights[1]}
            />
          </motion.div>
        </motion.div>

        {/* Bottom Row: Asset Allocation + Growth Trends */}
        <motion.div 
          className="grid grid-cols-2 gap-3 h-[calc(60%-4px)]"
          variants={containerVariants}
        >
          {/* Asset Allocation */}
          <motion.div variants={itemVariants} className="relative h-full">
            <AssetAllocation 
              assets={data.wealthProfile.assetBreakdown}
              totalValue={data.financialOverview.netWorth.totalAssets}
              insight={data.aiGeneratedInsights.netWorthInsights[2]}
            />
          </motion.div>

          {/* Growth Trends */}
          <motion.div variants={itemVariants} className="relative h-full">
            <GrowthTrends 
              netWorthHistory={data.historicalData.netWorth}
              creditScoreHistory={data.historicalData.creditScore}
              cashFlowHistory={data.historicalData.monthlyCashFlow}
              insight={data.aiGeneratedInsights.creditInsights[1]}
            />
          </motion.div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  )
}
