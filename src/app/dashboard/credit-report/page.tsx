"use client"

import React from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function CreditReportPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8 h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            Credit Report
          </h1>
          <p className="text-gray-400 text-lg">
            Your credit report analysis will be available soon...
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
