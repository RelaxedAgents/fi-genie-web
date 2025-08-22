"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { motion } from "framer-motion"
import { Target, Plus } from "lucide-react"

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-9rem)] md:min-h-[calc(100vh-5rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Target className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Financial Goals
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 mb-8"
          >
            Track your financial goals and milestones. Set targets for savings, investments, and more.
          </motion.p>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-medium">Coming Soon</span>
          </motion.div>

          {/* Placeholder Cards Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass rounded-xl p-4 border border-white/[0.08] opacity-30"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Floating Action Button Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 opacity-30"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
