"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Banking", href: "/dashboard/banking", icon: Building2 },
  { name: "Invest", href: "/dashboard/investment-analysis", icon: TrendingUp },
  { name: "AI Chat", href: "/chat", icon: Sparkles },
]

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "glass border-t border-white/[0.08]",
        "md:hidden" // Only show on mobile
      )}
    >
      <div className="px-2 py-2 pb-safe"> {/* pb-safe for iOS safe area */}
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            const isAIChat = item.name === "AI Chat"

            return (
              <li key={item.name}>
                <motion.button
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "relative flex flex-col items-center p-2 rounded-lg",
                    "touch-feedback",
                    isAIChat ? "min-w-[80px] min-h-[56px]" : "min-w-[64px] min-h-[52px]",
                    "transition-all duration-200",
                    isActive ? "text-primary" : isAIChat ? "text-white" : "text-gray-400"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* AI Chat gradient background */}
                  {isAIChat && !isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg opacity-80"
                      animate={{
                        opacity: [0.6, 0.9, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  <Icon className={cn(
                    isAIChat ? "w-6 h-6 mb-1" : "w-5 h-5 mb-1",
                    "relative z-10",
                    isActive && "filter drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]",
                    isAIChat && !isActive && "filter drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  )} />
                  
                  <span className={cn(
                    "text-[10px] font-medium relative z-10",
                    isActive && "font-semibold",
                    isAIChat && "font-semibold"
                  )}>
                    {item.name}
                  </span>

                  {/* "Try me!" badge for AI Chat */}
                  {isAIChat && !isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold z-20"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Try me!
                    </motion.div>
                  )}

                  {/* Glow effect for active item */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-xl rounded-lg"
                      animate={{
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.button>
              </li>
            )
          })}
        </ul>
      </div>
    </motion.nav>
  )
}
