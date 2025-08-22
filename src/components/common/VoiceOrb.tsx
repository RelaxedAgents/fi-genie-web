"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceOrbProps {
  state: "idle" | "listening" | "processing" | "speaking"
  size?: "small" | "medium" | "large"
  showParticles?: boolean
  amplitude?: number // 0-1 for voice amplitude
  className?: string
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state = "idle",
  size = "medium",
  showParticles = false,
  amplitude = 0,
  className = "",
}) => {
  const [pulseScale, setPulseScale] = useState(1)

  // State-based configurations
  const stateConfig = {
    idle: {
      color: "rgb(6, 182, 212)", // cyan-500
      shadowColor: "rgba(6, 182, 212, 0.5)",
      scale: [1, 1.02, 1],
      animationDuration: 4,
    },
    listening: {
      color: "rgb(16, 185, 129)", // emerald-500
      shadowColor: "rgba(16, 185, 129, 0.5)",
      scale: [1, 1.05, 1],
      animationDuration: 2,
    },
    processing: {
      color: "rgb(139, 92, 246)", // purple-500
      shadowColor: "rgba(139, 92, 246, 0.5)",
      scale: [0.98, 1.03, 0.98],
      animationDuration: 1.5,
    },
    speaking: {
      color: "rgb(59, 130, 246)", // blue-500
      shadowColor: "rgba(59, 130, 246, 0.5)",
      scale: [1, 1.08, 1],
      animationDuration: 1.8,
    },
  }

  const sizeConfig = {
    small: {
      orbSize: "w-16 h-16",
      containerSize: "w-32 h-32",
    },
    medium: {
      orbSize: "w-20 h-20",
      containerSize: "w-48 h-48",
    },
    large: {
      orbSize: "w-24 h-24",
      containerSize: "w-64 h-64",
    },
  }

  const config = stateConfig[state]
  const sizes = sizeConfig[size]

  // Update pulse scale based on amplitude
  useEffect(() => {
    if (amplitude > 0 && (state === "listening" || state === "speaking")) {
      setPulseScale(1 + amplitude * 0.15)
    } else {
      setPulseScale(1)
    }
  }, [amplitude, state])

  return (
    <div className={`relative ${sizes.containerSize} ${className}`}>
      {/* Main container for centering */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Ripple effects */}
        <AnimatePresence>
          {(state === "listening" || state === "speaking") && (
            <>
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={`ripple-${index}`}
                  className="absolute rounded-full"
                  style={{
                    borderWidth: "2px",
                    borderColor: config.shadowColor,
                  }}
                  initial={{
                    width: "80px",
                    height: "80px",
                    opacity: 0,
                  }}
                  animate={{
                    width: ["80px", "160px", "240px"],
                    height: ["80px", "160px", "240px"],
                    opacity: [0, 0.3, 0],
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: index * 0.8,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main orb with box-shadow ripples */}
        <motion.div
          className="relative"
          animate={{
            scale: config.scale,
          }}
          transition={{
            duration: config.animationDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className={`${sizes.orbSize} rounded-full relative z-10`}
            style={{
              backgroundColor: config.color,
              boxShadow: `
                ${config.shadowColor} 0px 0px 0px 10px,
                ${config.shadowColor.replace("0.5", "0.2")} 0px 0px 0px 20px,
                ${config.shadowColor.replace("0.5", "0.1")} 0px 0px 0px 30px
              `,
            }}
            animate={{
              scale: pulseScale,
            }}
            transition={{
              duration: 0.1,
              ease: "easeOut",
            }}
          >
            {/* Inner glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 60%)`,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Optional floating particles */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full bg-white/30"
                style={{
                  left: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 40}%`,
                  top: `${50 + Math.sin((i * 60 * Math.PI) / 180) * 40}%`,
                }}
                animate={{
                  x: [0, Math.random() * 10 - 5, 0],
                  y: [0, Math.random() * 10 - 5, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
