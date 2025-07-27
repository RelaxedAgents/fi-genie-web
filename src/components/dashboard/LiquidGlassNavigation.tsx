"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Home, Banknote, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Banking", path: "/dashboard/banking", icon: Banknote },
  { name: "Investment Analysis", path: "/dashboard/investment-analysis", icon: TrendingUp },
]

export const LiquidGlassNavigation: React.FC = () => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <nav className="relative px-10 py-5">
      {/* Container glass background */}
      <div className="absolute inset-0 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05]" />
      
      {/* Navigation items */}
      <div className="relative flex items-center justify-center gap-2">
        <LayoutGroup>
          {navItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon

            return (
              <Link key={item.path} href={item.path} className="relative">
                <motion.div
                  className="relative px-8 py-4 rounded-full cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Sliding active indicator - only shows for active item */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute inset-0.5 rounded-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    >
                      {/* Glass effect for active state */}
                      <div className="absolute inset-0 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/20" />
                      
                      {/* Subtle glow */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-primary-light/10 to-primary/10 blur-xl" />
                      
                      {/* Pulse animation */}
                      <motion.div
                        className="absolute inset-0 rounded-full border border-primary/20"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.2, 0, 0.2],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Content with larger text */}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center gap-3 text-lg font-medium transition-all duration-300",
                    isActive 
                      ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]" 
                      : "text-gray-400 hover:text-white"
                  )}>
                    <Icon className="w-6 h-6" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </LayoutGroup>
      </div>
    </nav>
  )
}
