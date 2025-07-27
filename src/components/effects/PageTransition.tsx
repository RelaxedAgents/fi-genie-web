"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

// Define navigation order for slide transitions
const navigationOrder: Record<string, number> = {
  "/dashboard": 0,
  "/dashboard/banking": 1,
  "/dashboard/investment-analysis": 2,
  "/chat": 99, // Special case - always slide from right
}

type TransitionDirection = "forward" | "backward"

const getTransitionDirection = (fromPath: string, toPath: string): TransitionDirection => {
  const fromIndex = navigationOrder[fromPath] ?? -1
  const toIndex = navigationOrder[toPath] ?? -1

  // Special cases for chat
  if (toPath === "/chat") return "forward" // Always slide forward to chat
  if (fromPath === "/chat") return "backward" // Always slide backward from chat
  
  // Normal navigation based on indices
  return toIndex > fromIndex ? "forward" : "backward"
}

// Animation variants with clearer naming
const pageVariants = {
  // When moving forward (e.g., Home -> Banking)
  enterFromRight: {
    x: "100%",
    opacity: 0,
  },
  
  // When moving backward (e.g., Banking -> Home)
  enterFromLeft: {
    x: "-100%", 
    opacity: 0,
  },
  
  // Current position
  center: {
    x: 0,
    opacity: 1,
  },
  
  // Exit animations
  exitToLeft: {
    x: "-100%",
    opacity: 0,
  },
  
  exitToRight: {
    x: "100%",
    opacity: 0,
  },
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [previousPath, setPreviousPath] = useState(pathname)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track path changes
  useEffect(() => {
    if (pathname !== previousPath) {
      setPreviousPath(pathname)
    }
  }, [pathname, previousPath])

  if (!mounted) return <>{children}</>

  const direction = getTransitionDirection(previousPath, pathname)
  
  // Determine animation variants based on direction
  const enterVariant = direction === "forward" ? "enterFromRight" : "enterFromLeft"
  const exitVariant = direction === "forward" ? "exitToLeft" : "exitToRight"
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={enterVariant}
        animate="center"
        exit={exitVariant}
        variants={pageVariants}
        transition={{
          type: "tween",
          ease: [0.25, 0.1, 0.25, 1],
          duration: 0.4,
        }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
