"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ParticleBackground } from "@/components/effects/ParticleBackground"
import { LiquidGlassNavigation } from "@/components/dashboard/LiquidGlassNavigation"
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown"
import { ChatVoiceFAB } from "@/components/dashboard/ChatVoiceFAB"

export default function TestHeaderPage() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/[0.12] backdrop-blur-xl border-b border-white/20 shadow-xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard">
                <motion.div
                  className="flex items-center gap-3 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <span className="text-white font-bold text-xl">Fi</span>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  </div>
                  <span className="text-xl font-display font-bold gradient-text">
                    FiGenie
                  </span>
                </motion.div>
              </Link>

              {/* Navigation */}
              <LiquidGlassNavigation />

              {/* User Profile */}
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="container mx-auto px-6 py-8 h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
                Header Test Page
              </h1>
              <p className="text-gray-400 text-lg">
                This page tests the header visibility without page transitions.
              </p>
            </div>
          </div>
        </main>

        {/* Chat/Voice FAB */}
        <ChatVoiceFAB />
      </div>
    </div>
  )
}
