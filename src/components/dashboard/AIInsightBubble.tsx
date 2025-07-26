"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIInsightBubbleProps {
  insight: string
  position?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  delay?: number
  floating?: boolean
}

export const AIInsightBubble: React.FC<AIInsightBubbleProps> = ({
  insight,
  position = {},
  delay = 0,
  floating = false
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  if (isDismissed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "absolute z-50",
            floating ? "fixed pointer-events-auto" : "pointer-events-none"
          )}
          style={{
            ...position,
            ...(floating ? {} : { transform: 'translate(-50%, -50%)' })
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: floating ? [0, -10, 0] : 0 
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={floating ? {
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          } : {
            duration: 0.3
          }}
        >
          <div className={cn(
            "relative",
            floating ? "max-w-xs" : "max-w-[200px]",
            "bg-white/[0.03] backdrop-blur-xl",
            "border border-white/[0.05]",
            "rounded-2xl shadow-xl shadow-black/50",
            "overflow-hidden"
          )}>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-light/10" />
            
            {/* Animated background */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
                ]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <motion.div
                    className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      scale: { duration: 2, repeat: Infinity },
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-primary" />
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {insight}
                  </p>
                </div>

                {floating && (
                  <button
                    onClick={() => setIsDismissed(true)}
                    className="flex-shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X className="w-2 h-2 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-primary/20"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Connection line (for non-floating bubbles) */}
          {!floating && (
            <svg className="absolute -z-10" style={{ 
              top: position.top ? '50%' : undefined,
              bottom: position.bottom ? '50%' : undefined,
              left: position.left ? '100%' : position.right ? undefined : '50%',
              right: position.right ? '100%' : undefined,
              transform: 'translate(-50%, -50%)'
            }}>
              <motion.line
                x1="0"
                y1="0"
                x2={position.left ? -20 : position.right ? 20 : 0}
                y2="0"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
                strokeDasharray="2,2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </svg>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
