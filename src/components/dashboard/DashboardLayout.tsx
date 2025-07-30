"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ParticleBackground } from "@/components/effects/ParticleBackground"
import { PageTransition } from "@/components/effects/PageTransition"
import { LiquidGlassNavigation } from "@/components/dashboard/LiquidGlassNavigation"
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown"
import { ChatVoiceFAB } from "@/components/dashboard/ChatVoiceFAB"
import { getCurrentUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated
    const user = getCurrentUser()
    if (!user) {
      // Temporarily bypass auth check for testing
      // router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Main Container with Page Transition */}
      <PageTransition>
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50">
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard">
                  <motion.div
                    className="flex items-center gap-2 sm:gap-3 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-lg sm:text-xl">Fi</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    </div>
                    <span className="text-lg sm:text-xl font-display font-bold gradient-text">
                      FiGenie
                    </span>
                  </motion.div>
                </Link>

                {/* Navigation - Hide on mobile */}
                <div className="hidden md:block">
                  <LiquidGlassNavigation />
                </div>

                {/* User Profile */}
                <UserProfileDropdown />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 relative pb-16 md:pb-0"> {/* Add padding bottom for mobile nav */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>

          {/* Chat/Voice FAB - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block">
            <ChatVoiceFAB />
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </PageTransition>
    </div>
  )
}
