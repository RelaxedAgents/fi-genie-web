"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { BankAccountSummary } from "@/components/dashboard/BankAccountSummary"
import { SpendingCategories } from "@/components/dashboard/SpendingCategories"
import { MonthlyTrends } from "@/components/dashboard/MonthlyTrends"
import { BankAccountsList } from "@/components/dashboard/BankAccountsList"
import { motion, Variants } from "framer-motion"

// Banking data with positive total balance
const bankingData = {
  accountSummary: {
    totalBalance: 850000,
    monthlyInflow: 125000,
    monthlyOutflow: 98000,
    netCashFlow: 27000,
  },
  monthlyTrends: {
    summary: {
      averageCredit: 845.2,
      averageDebit: 79604.6,
      topSpendingCategory: "Cash",
      inflowTransactions: 5,
      outflowTransactions: 5
    },
    chartData: [
      { month: "Jan", inflow: 120000, outflow: 95000 },
      { month: "Feb", inflow: 118000, outflow: 92000 },
      { month: "Mar", inflow: 130000, outflow: 101000 },
      { month: "Apr", inflow: 122000, outflow: 96000 },
      { month: "May", inflow: 128000, outflow: 105000 },
      { month: "Jun", inflow: 125000, outflow: 98000 }
    ]
  },
  spendingCategories: [
    { category: "Cash", amount: 30800, percentage: 31.4, color: "#10b981" },
    { category: "Food & Dining", amount: 21952, percentage: 22.4, color: "#f59e0b" },
    { category: "Transportation", amount: 16464, percentage: 16.8, color: "#3b82f6" },
    { category: "Shopping", amount: 13328, percentage: 13.6, color: "#8b5cf6" },
    { category: "Bills & Utilities", amount: 10584, percentage: 10.8, color: "#f97316" },
    { category: "Others", amount: 4900, percentage: 5.0, color: "#6b7280" }
  ],
  bankAccounts: [
    {
      id: "acc1",
      bankName: "HDFC Bank",
      accountType: "Savings",
      accountNumber: "****2724",
      balance: 450000,
      status: "Active"
    },
    {
      id: "acc2", 
      bankName: "ICICI Bank",
      accountType: "Current",
      accountNumber: "****1383",
      balance: 320000,
      status: "Active"
    },
    {
      id: "acc3",
      bankName: "SBI",
      accountType: "Savings", 
      accountNumber: "****9026",
      balance: 80000,
      status: "Active"
    }
  ]
}

export default function BankingPage() {
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
