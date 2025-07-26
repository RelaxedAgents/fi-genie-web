"use client"

import React from "react"
import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore"

export default function TestWidgetPage() {
  const testData = {
    score: 78,
    components: {
      creditHealth: 85,
      wealthAccumulation: 72,
      debtManagement: 80,
      investmentPerformance: 75
    },
    status: "Good",
    insight: "Your financial health is strong! You're maintaining good credit habits and accumulating wealth effectively. Consider increasing your investment allocation to maximize long-term growth potential."
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F] p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Financial Health Score Widget Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Default state */}
        <div className="h-[400px]">
          <h2 className="text-lg text-gray-400 mb-4">Default State</h2>
          <FinancialHealthScore {...testData} />
        </div>

        {/* Excellent score */}
        <div className="h-[400px]">
          <h2 className="text-lg text-gray-400 mb-4">Excellent Score (90)</h2>
          <FinancialHealthScore 
            {...testData} 
            score={90} 
            status="Excellent"
          />
        </div>

        {/* Poor score */}
        <div className="h-[400px]">
          <h2 className="text-lg text-gray-400 mb-4">Poor Score (35)</h2>
          <FinancialHealthScore 
            {...testData} 
            score={35} 
            status="Needs Improvement"
          />
        </div>
      </div>

      <div className="mt-8 text-gray-400">
        <p>Hover over the widgets to see component scores</p>
        <p>Click the info icon to see insights</p>
      </div>
    </div>
  )
}
