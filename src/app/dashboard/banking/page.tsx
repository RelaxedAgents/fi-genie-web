"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { BankAccountSummary } from "@/components/dashboard/BankAccountSummary"
import { SpendingCategories } from "@/components/dashboard/SpendingCategories"
import { MonthlyTrends } from "@/components/dashboard/MonthlyTrends"
import { BankAccountsList } from "@/components/dashboard/BankAccountsList"
import { motion, Variants } from "framer-motion"
import masterData from "@/../../sampleMasterData.json"

export default function BankingPage() {
  const bankingData = masterData.bankingData
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
        className="relative h-[calc(100vh-5rem)] p-2 overflow-hidden flex flex-col gap-3"
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
