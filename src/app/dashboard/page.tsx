"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { getCurrentUser } from "@/lib/auth"
import { createSession } from "@/config/mockPhoneNumbers"
import { saveUser } from "@/lib/auth"
import { fetchDashboardData } from "@/lib/api/dashboardApi"
import { saveDashboardData, setApiStatus, getDashboardData } from "@/lib/dashboardData"
import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore"
import { CreditShield } from "@/components/dashboard/CreditShield"
import { CashFlowRiver } from "@/components/dashboard/CashFlowRiver"
import { CashFlowRiverMobile } from "@/components/dashboard/CashFlowRiverMobile"
import { AssetAllocation } from "@/components/dashboard/AssetAllocation"
import { GrowthTrends } from "@/components/dashboard/GrowthTrends"
import { motion, Variants } from "framer-motion"
import { useDashboardData } from "@/hooks/useDashboardData"
import { MobileDashboardTabs } from "@/components/dashboard/MobileDashboardTabs"

export default function DashboardPage() {
  const router = useRouter()
  const { data, isLoading } = useDashboardData()
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)

  useEffect(() => {
    // Check if user exists, if not create a mock session
    const user = getCurrentUser()
    if (!user) {
      // Create a new session with mock phone number
      const session = createSession()
      
      // Save the mock phone number as authenticated user
      saveUser(session.phoneNumber)
      
      // Reload to ensure data is fetched with the new session
      router.refresh()
    } else {
      // Check if we have valid cached data for this user
      const cachedData = getDashboardData(user.phone)
      if (!cachedData) {
        // No valid cached data, fetch fresh data
        setApiStatus('loading')
        fetchDashboardData(user.phone)
          .then((data) => {
            saveDashboardData(data, user.phone)
            setApiStatus('success')
            router.refresh()
          })
          .catch((error) => {
            console.error('Failed to fetch dashboard data:', error)
            setApiStatus('error')
          })
      }
    }
  }, [router])

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

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your financial data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'insights', label: 'Insights' },
    { id: 'trends', label: 'Trends' },
    { id: 'assets', label: 'Assets' },
  ]

  const tabContent = {
    overview: (
      <div className="space-y-3">
        <FinancialHealthScore 
          score={data.financialOverview.financialHealthScore.overall}
          components={data.financialOverview.financialHealthScore.components}
          status={data.financialOverview.financialHealthScore.status}
          insight={data.aiGeneratedInsights.overallProfile}
        />
        <CreditShield 
          netWorth={{
            total: data.financialOverview.netWorth.total,
            totalAssets: data.financialOverview.netWorth.totalAssets,
            totalLiabilities: data.financialOverview.netWorth.totalLiabilities,
            debtToAssetRatio: data.financialOverview.netWorth.debtToAssetRatio
          }}
          creditScore={{
            score: data.financialOverview.creditScore.score,
            maxScore: data.financialOverview.creditScore.maxScore,
            rating: data.financialOverview.creditScore.rating
          }}
          insight={data.aiGeneratedInsights.creditInsights[0]}
        />
      </div>
    ),
    insights: (
      <CashFlowRiverMobile 
        creditInsights={data.aiGeneratedInsights.creditInsights}
        netWorthInsights={data.aiGeneratedInsights.netWorthInsights}
        bankingInsights={data.aiGeneratedInsights.bankingInsights}
        investmentInsights={data.aiGeneratedInsights.investmentInsights}
      />
    ),
    trends: (
      <GrowthTrends 
        netWorthHistory={data.historicalData.netWorth}
        creditScoreHistory={data.historicalData.creditScore}
        cashFlowHistory={data.historicalData.monthlyCashFlow}
        insight={data.aiGeneratedInsights.creditInsights[1]}
      />
    ),
    assets: (
      <AssetAllocation 
        assets={data.wealthProfile.assetBreakdown}
        totalValue={data.financialOverview.netWorth.totalAssets}
        insight={data.aiGeneratedInsights.netWorthInsights[2]}
      />
    ),
  }

  return (
    <DashboardLayout>
      {/* Mobile Tabbed View */}
      <div className="block md:hidden h-[calc(100vh-9rem)]">
        <MobileDashboardTabs tabs={tabs} defaultTab="overview">
          {tabContent}
        </MobileDashboardTabs>
      </div>

      {/* Desktop Grid View */}
      <motion.div 
        className="hidden md:flex flex-col gap-3 h-[calc(100vh-5rem)] p-3 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Row: Financial Health Score + Main Metrics */}
        <div className="grid grid-cols-3 gap-3 h-[calc(40%-4px)]">
          {/* Financial Health Score - Left */}
          <motion.div variants={itemVariants} className="relative">
            <FinancialHealthScore 
              score={data.financialOverview.financialHealthScore.overall}
              components={data.financialOverview.financialHealthScore.components}
              status={data.financialOverview.financialHealthScore.status}
              insight={data.aiGeneratedInsights.overallProfile}
            />
          </motion.div>

          {/* Overview */}
          <motion.div variants={itemVariants} className="relative">
            <CreditShield 
              netWorth={{
                total: data.financialOverview.netWorth.total,
                totalAssets: data.financialOverview.netWorth.totalAssets,
                totalLiabilities: data.financialOverview.netWorth.totalLiabilities,
                debtToAssetRatio: data.financialOverview.netWorth.debtToAssetRatio
              }}
              creditScore={{
                score: data.financialOverview.creditScore.score,
                maxScore: data.financialOverview.creditScore.maxScore,
                rating: data.financialOverview.creditScore.rating
              }}
              insight={data.aiGeneratedInsights.creditInsights[0]}
            />
          </motion.div>

          {/* AI Insights */}
          <motion.div variants={itemVariants} className="relative">
            <CashFlowRiver 
              creditInsights={data.aiGeneratedInsights.creditInsights}
              netWorthInsights={data.aiGeneratedInsights.netWorthInsights}
              bankingInsights={data.aiGeneratedInsights.bankingInsights}
              investmentInsights={data.aiGeneratedInsights.investmentInsights}
            />
          </motion.div>
        </div>

        {/* Bottom Row: Asset Allocation + Growth Trends */}
        <div className="grid grid-cols-2 gap-3 h-[calc(60%-4px)]">
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
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
