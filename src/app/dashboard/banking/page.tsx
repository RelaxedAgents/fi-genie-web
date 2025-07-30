"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { BankAccountSummary } from "@/components/dashboard/BankAccountSummary"
import { SpendingCategories } from "@/components/dashboard/SpendingCategories"
import { SpendingCategoriesMobile } from "@/components/dashboard/SpendingCategoriesMobile"
import { MonthlyTrends } from "@/components/dashboard/MonthlyTrends"
import { MonthlyTrendsMobile } from "@/components/dashboard/MonthlyTrendsMobile"
import { BankAccountsList } from "@/components/dashboard/BankAccountsList"
import { MobileDashboardTabs } from "@/components/dashboard/MobileDashboardTabs"
import { motion, Variants } from "framer-motion"
import { useDashboardData } from "@/hooks/useDashboardData"

export default function BankingPage() {
  const { data, isLoading } = useDashboardData()
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
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading banking data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const bankingData = data.bankingData

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
  ]

  const tabContent = {
    overview: (
      <div className="space-y-3 h-full flex flex-col">
        <div className="flex-1">
          <BankAccountSummary 
            summary={bankingData.accountSummary}
            trends={bankingData.monthlyTrends}
          />
        </div>
        <div className="flex-1">
          <BankAccountsList accounts={bankingData.bankAccounts} />
        </div>
      </div>
    ),
    analytics: (
      <div className="h-full flex flex-col gap-3 overflow-hidden">
        <div className="h-[45%] min-h-0 overflow-hidden">
          <MonthlyTrendsMobile 
            trendsData={bankingData.monthlyTrends}
            chartData={bankingData.monthlyTrends.chartData}
          />
        </div>
        <div className="h-[55%] min-h-0 overflow-hidden">
          <SpendingCategoriesMobile 
            categories={bankingData.spendingCategories}
            totalSpent={bankingData.accountSummary.monthlyOutflow}
          />
        </div>
      </div>
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
        {/* TOP ROW: Bank Accounts + Monthly Trends */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[calc(48%-6px)] flex-shrink-0"
          variants={containerVariants}
        >
          {/* Bank Accounts */}
          <motion.div variants={itemVariants} className="relative h-full">
            <BankAccountsList accounts={bankingData.bankAccounts} />
          </motion.div>

          {/* Monthly Trends */}
          <motion.div variants={itemVariants} className="relative h-full">
            <MonthlyTrends 
              trendsData={bankingData.monthlyTrends}
              chartData={bankingData.monthlyTrends.chartData}
            />
          </motion.div>
        </motion.div>

        {/* BOTTOM ROW: Account Summary + Spend Analysis */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[calc(52%-6px)] flex-shrink-0"
          variants={containerVariants}
        >
          {/* Account Summary */}
          <motion.div variants={itemVariants} className="relative h-full">
            <BankAccountSummary 
              summary={bankingData.accountSummary}
              trends={bankingData.monthlyTrends}
            />
          </motion.div>

          {/* Spend Analysis (formerly Spending Categories) */}
          <motion.div variants={itemVariants} className="relative h-full">
            <SpendingCategories 
              categories={bankingData.spendingCategories}
              totalSpent={bankingData.accountSummary.monthlyOutflow}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
