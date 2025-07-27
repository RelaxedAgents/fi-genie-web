"use client"

import React from "react"
import { AssetAllocation } from "@/components/dashboard/AssetAllocation"

export default function TestAssetAllocationPage() {
  const testData = {
    totalValue: 722000, // ₹7.22L
    assets: [
      {
        category: "EPF",
        value: 210624,
        percentage: 29.2,
        trend: 2.5
      },
      {
        category: "Savings Accounts",
        value: 101080,
        percentage: 14.0,
        trend: -1.2
      },
      {
        category: "Indian Securities",
        value: 200595,
        percentage: 27.8,
        trend: 5.3
      },
      {
        category: "Mutual Funds",
        value: 84474,
        percentage: 11.7,
        trend: 3.8
      }
    ],
    insight: "Your portfolio is well-diversified across different asset classes. Consider increasing allocation to Mutual Funds for potentially higher returns. Your EPF forms a solid foundation for retirement planning."
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Asset Allocation Widget</h1>
        <p className="text-gray-400 mb-8">Improved design with vibrant colors, 3D effects, and better interactions</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Default state */}
          <div className="h-[450px]">
            <h2 className="text-lg text-gray-400 mb-4">Enhanced Design</h2>
            <AssetAllocation {...testData} />
          </div>

          {/* With different allocations */}
          <div className="h-[450px]">
            <h2 className="text-lg text-gray-400 mb-4">Equity Heavy Portfolio</h2>
            <AssetAllocation 
              totalValue={1500000}
              assets={[
                { category: "Indian Securities", value: 900000, percentage: 60, trend: 8.2 },
                { category: "Mutual Funds", value: 300000, percentage: 20, trend: 6.5 },
                { category: "EPF", value: 225000, percentage: 15, trend: 2.5 },
                { category: "Savings Accounts", value: 75000, percentage: 5, trend: -0.5 }
              ]}
              insight="Your portfolio is heavily weighted towards equities. This aggressive allocation can provide higher returns but comes with increased volatility."
            />
          </div>

          {/* Conservative portfolio */}
          <div className="h-[450px]">
            <h2 className="text-lg text-gray-400 mb-4">Conservative Portfolio</h2>
            <AssetAllocation 
              totalValue={500000}
              assets={[
                { category: "EPF", value: 200000, percentage: 40, trend: 2.5 },
                { category: "Savings Accounts", value: 150000, percentage: 30, trend: 0.5 },
                { category: "Mutual Funds", value: 100000, percentage: 20, trend: 3.2 },
                { category: "Indian Securities", value: 50000, percentage: 10, trend: 4.5 }
              ]}
              insight="Your conservative allocation prioritizes capital preservation. Consider gradually increasing equity exposure for long-term wealth creation."
            />
          </div>
        </div>

        <div className="mt-12 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">🎨 Visual Enhancements</h4>
              <ul className="space-y-1 text-sm">
                <li>• Distinct colors for each asset type</li>
                <li>• 3D perspective with rotation animation</li>
                <li>• Glowing particle effects matching segment colors</li>
                <li>• Enhanced glass morphism design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">✨ Interactive Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Hover to highlight segments</li>
                <li>• Click segments or legend items to select</li>
                <li>• Trend indicators for each asset</li>
                <li>• Smooth animations and transitions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-gray-400 text-sm">
          <p>💡 Try hovering over segments and clicking on them to see the interactive effects</p>
          <p>ℹ️ Hover over the info icon to see portfolio insights</p>
        </div>
      </div>
    </div>
  )
}
