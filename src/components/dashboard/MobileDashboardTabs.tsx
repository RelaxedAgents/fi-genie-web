"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  scrollable?: boolean // Optional scrollable flag per tab
}

interface MobileDashboardTabsProps {
  tabs: Tab[]
  children: Record<string, React.ReactNode>
  defaultTab?: string
}

export const MobileDashboardTabs: React.FC<MobileDashboardTabsProps> = ({
  tabs,
  children,
  defaultTab
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id)

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex gap-1 p-2 pb-0 flex-shrink-0">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-3 py-2 rounded-t-lg text-xs font-medium transition-all",
              "relative overflow-hidden",
              activeTab === tab.id
                ? "bg-white/[0.08] text-white border-b-2 border-primary"
                : "bg-white/[0.03] text-gray-400 hover:bg-white/[0.05]"
            )}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              {tab.icon}
              {tab.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "h-full",
              "overflow-x-hidden",
              // Find the current tab to check if it's scrollable
              tabs.find(tab => tab.id === activeTab)?.scrollable !== false 
                ? "overflow-y-auto" // Scrollable by default
                : "overflow-y-hidden", // No scroll if explicitly set to false
              // Conditional scrolling based on screen size for scrollable tabs
              tabs.find(tab => tab.id === activeTab)?.scrollable !== false && "min-[800px]:overflow-y-hidden",
              "p-2", // Default padding
              "sm:p-3", // Slightly larger on small screens
              "min-[800px]:p-3" // Optimized padding for large phones (6.1"+)
            )}
          >
            {children[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
