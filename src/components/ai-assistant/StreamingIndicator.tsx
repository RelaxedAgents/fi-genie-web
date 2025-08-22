"use client"

import React from "react"
import { motion } from "framer-motion"

interface StreamingIndicatorProps {
  message?: string
}

export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({ 
  message = "AI is thinking" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="glass border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
        <span className="text-sm text-white/60">{message}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
