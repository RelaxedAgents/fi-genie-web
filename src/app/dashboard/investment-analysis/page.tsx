"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary"
import { InvestmentAssetAllocation } from "@/components/dashboard/InvestmentAssetAllocation"
import { EPFSummary } from "@/components/dashboard/EPFSummary"
import { TransactionsAndHoldings } from "@/components/dashboard/TransactionsAndHoldings"
import { motion, Variants } from "framer-motion"

// Investment Analysis data
const investmentData = {
  epfSummary: {
    dataType: "epf",
    summary: {
      title: "EPF Balance",
      totalBalance: "₹2,11,111",
      pensionBalance: "₹10,00,000",
      lastUpdated: "As of Today",
      items: [
        {
          label: "Total PF Balance",
          value: "₹2,11,111"
        },
        {
          label: "Pension Contribution",
          value: "₹10,00,000"
        },
        {
          label: "Employee Share",
          value: "₹1,06,111"
        },
        {
          label: "Employer Share",
          value: "₹1,05,000"
        }
      ]
    }
  },
  portfolioSummary: {
    totalValue: 125230.6,
    totalInvested: 118527.05,
    totalReturns: 6703.55,
    returnPercentage: 5.66,
    xirr: 8.15
  },
  assetAllocation: [
    {
      type: "Stocks",
      value: 75392.0,
      percentage: 60.2,
      color: "#4CAF50"
    },
    {
      type: "Mutual Funds",
      value: 49838.6,
      percentage: 39.8,
      color: "#FFC107"
    }
  ],
  topHoldings: [
    {
      name: "INE040A01034",
      type: "Stock",
      currentValue: 72000.0,
      investedValue: 67601.76,
      returns: 4398.24,
      returnPercentage: 6.51,
      units: 48
    },
    {
      name: "UTI Overnight - Direct Plan",
      type: "Mutual Fund",
      currentValue: 29500.0,
      investedValue: 29235.07,
      returns: 264.93,
      returnPercentage: 0.91,
      units: 10
    },
    {
      name: "ICICI Prudential Nifty 50 Index Fund - Direct Plan Growth",
      type: "Mutual Fund",
      currentValue: 10588.6,
      investedValue: 10027.0,
      returns: 561.6,
      returnPercentage: 5.6,
      units: 60.51
    },
    {
      name: "Canara Robeco Gilt Fund - Regular Plan",
      type: "Mutual Fund",
      currentValue: 7000.0,
      investedValue: 6655.46,
      returns: 344.54,
      returnPercentage: 5.18,
      units: 100
    },
    {
      name: "ICICI Prudential Balanced Advantage - Direct Plan",
      type: "Mutual Fund",
      currentValue: 2750.0,
      investedValue: 2636.0,
      returns: 114.0,
      returnPercentage: 4.32,
      units: 50
    },
    {
      name: "INE916P01025",
      type: "Stock",
      currentValue: 1232.0,
      investedValue: 344.0,
      returns: 888.0,
      returnPercentage: 258.14,
      units: 56
    }
  ],
  recentTransactions: [
    {
      date: "2025-07-15",
      type: "Sell",
      scheme: "INE916P01025",
      amount: 200.0,
      units: 10,
      nav: 20.0
    },
    {
      date: "2025-07-15",
      type: "Buy",
      scheme: "INE916P01025",
      amount: 6.0,
      units: 4,
      nav: 1.5
    },
    {
      date: "2025-07-13",
      type: "Buy",
      scheme: "INE040A01034",
      amount: 14000.0,
      units: 10,
      nav: 1400.0
    },
    {
      date: "2025-07-11",
      type: "Buy",
      scheme: "INE916P01025",
      amount: 55.0,
      units: 5,
      nav: 11.0
    },
    {
      date: "2025-07-04",
      type: "Buy",
      scheme: "INE916P01025",
      amount: 80.0,
      units: 10,
      nav: 8.0
    },
    {
      date: "2025-06-05",
      type: "Buy",
      scheme: "INE916P01025",
      amount: 30.0,
      units: 2,
      nav: 15.0
    },
    {
      date: "2025-04-06",
      type: "Buy",
      scheme: "INE043D01016",
      amount: 240.44,
      units: 2,
      nav: 120.22
    },
    {
      date: "2025-03-17",
      type: "Buy",
      scheme: "INE916P01025",
      amount: 15.0,
      units: 3,
      nav: 5.0
    },
    {
      date: "2024-05-30",
      type: "Buy",
      scheme: "INE0CCU25019",
      amount: 0,
      units: 140,
      nav: null
    },
    {
      date: "2023-01-01",
      type: "Buy",
      scheme: "Canara Robeco Gilt Fund - Regular Plan",
      amount: 6655.46,
      units: 100,
      nav: 66.55
    }
  ]
}

export default function InvestmentAnalysisPage() {
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
