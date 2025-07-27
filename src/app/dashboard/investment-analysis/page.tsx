"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary"
import { InvestmentAssetAllocation } from "@/components/dashboard/InvestmentAssetAllocation"
import { EPFSummary } from "@/components/dashboard/EPFSummary"
import { TransactionsAndHoldings } from "@/components/dashboard/TransactionsAndHoldings"
import { motion, Variants } from "framer-motion"
import masterData from "@/../../sampleMasterData.json"

export default function InvestmentAnalysisPage() {
  const investmentData = masterData.investmentData
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
        {/* TOP ROW: Portfolio Summary + Asset Allocation */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[38vh] flex-shrink-0"
          variants={containerVariants}
        >
          {/* Portfolio Summary */}
          <motion.div variants={itemVariants} className="relative h-full">
            <PortfolioSummary 
              portfolioData={investmentData.portfolioSummary}
            />
          </motion.div>

          {/* Asset Allocation */}
          <motion.div variants={itemVariants} className="relative h-full">
            <InvestmentAssetAllocation 
              assetData={investmentData.assetAllocation}
              totalValue={investmentData.portfolioSummary.totalValue}
            />
          </motion.div>
        </motion.div>

        {/* BOTTOM ROW: EPF Summary + Transactions & Holdings */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0"
          variants={containerVariants}
        >
          {/* EPF Summary */}
          <motion.div variants={itemVariants} className="relative h-full">
            <EPFSummary 
              epfData={investmentData.epfSummary}
            />
          </motion.div>

          {/* Transactions & Holdings */}
          <motion.div variants={itemVariants} className="relative h-full">
            <TransactionsAndHoldings 
              transactions={investmentData.recentTransactions}
              holdings={investmentData.topHoldings}
            />
          </motion.div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  )
}
