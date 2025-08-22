"use client"

import React from "react"
import { motion } from "framer-motion"

interface NavigationButtonProps {
  onClick: () => void
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="group relative px-10 py-4 bg-gradient-to-r from-primary to-secondary rounded-full overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-secondary to-primary"
        animate={{
          x: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ width: "200%" }}
      />

      {/* Button content */}
      <div className="relative">
        <span className="text-white font-semibold text-lg">
          Continue
        </span>
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 20px rgba(0, 212, 255, 0.3)",
            "0 0 40px rgba(0, 212, 255, 0.5)",
            "0 0 20px rgba(0, 212, 255, 0.3)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  )
}
