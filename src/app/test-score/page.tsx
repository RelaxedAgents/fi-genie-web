"use client"

import React from "react"
import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore"

export default function TestScorePage() {
  const testData = {
    score: 78,
    components: {
      creditHealth: 82,
      wealthAccumulation: 85,
      debtManagement: 65,
      investmentPerformance: 80
    },
    status: "Good",
    insight: "Your financial health is strong! You're maintaining good credit habits and accumulating wealth effectively."
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F] p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Financial Health Score Test - Isolated</h1>
      
      <div className="w-[300px] h-[450px] mx-auto">
        <FinancialHealthScore {...testData} />
      </div>

      <div className="mt-8 text-gray-400 text-center">
        <p>Testing the Financial Health Score widget in isolation</p>
        <p>Check if there's a visible square boundary around the score circle</p>
      </div>
    </div>
  )
}
