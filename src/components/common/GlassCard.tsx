"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = true,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={cn(
        "glass rounded-2xl p-6",
        hover && "glass-hover cursor-pointer",
        className
      )}
      whileHover={hover ? { y: -5 } : {}}
    >
      {children}
    </motion.div>
  )
}
