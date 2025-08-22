"use client"

import React from "react"
import { motion } from "framer-motion"
import { VOICE_ASSISTANT_CONFIG } from "@/config/mockPhoneNumbers"

interface GradientOrbProps {
  state: string
}

export const GradientOrb: React.FC<GradientOrbProps> = ({ state }) => {
  // State-based configurations
  const stateConfig: Record<string, {
    gradient: string
    scale: number[]
    animationDuration: number
    glowIntensity: number
    rotationSpeed: number
  }> = {
    [VOICE_ASSISTANT_CONFIG.states.IDLE]: {
      gradient: "from-cyan-400 via-blue-500 to-cyan-400",
      scale: [1, 1.05, 1],
      animationDuration: 4,
      glowIntensity: 0.3,
      rotationSpeed: 20
    },
    [VOICE_ASSISTANT_CONFIG.states.LISTENING]: {
      gradient: "from-cyan-400 via-emerald-500 to-teal-400",
      scale: [1, 1.15, 1],
      animationDuration: 2,
      glowIntensity: 0.5,
      rotationSpeed: 15
    },
    [VOICE_ASSISTANT_CONFIG.states.PROCESSING]: {
      gradient: "from-blue-500 via-purple-500 to-indigo-500",
      scale: [0.95, 1.1, 0.95],
      animationDuration: 1,
      glowIntensity: 0.7,
      rotationSpeed: 5
    },
    [VOICE_ASSISTANT_CONFIG.states.SPEAKING]: {
      gradient: "from-purple-500 via-pink-500 to-purple-500",
      scale: [1, 1.2, 1],
      animationDuration: 1.5,
      glowIntensity: 0.8,
      rotationSpeed: 10
    }
  }

  const config = stateConfig[state] || stateConfig[VOICE_ASSISTANT_CONFIG.states.IDLE]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main gradient orb */}
      <motion.div
        className="relative"
        animate={{
          scale: config.scale,
        }}
        transition={{
          duration: config.animationDuration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Outer glow */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-3xl`}
          style={{
            width: "400px",
            height: "400px",
            opacity: config.glowIntensity * 0.5,
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: "50%"
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: config.rotationSpeed,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Middle layer */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} blur-2xl`}
          style={{
            width: "300px",
            height: "300px",
            opacity: config.glowIntensity * 0.7,
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: "50%"
          }}
          animate={{
            rotate: -360
          }}
          transition={{
            duration: config.rotationSpeed * 0.8,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Core gradient */}
        <motion.div
          className={`relative rounded-full bg-gradient-to-tr ${config.gradient} blur-xl`}
          style={{
            width: "200px",
            height: "200px",
            opacity: config.glowIntensity
          }}
          animate={{
            rotate: 180
          }}
          transition={{
            duration: config.rotationSpeed * 0.6,
            repeat: Infinity,
            ease: "linear",
            repeatType: "reverse"
          }}
        />

        {/* Inner bright core */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: "100px",
            height: "100px",
            background: `radial-gradient(circle, rgba(255,255,255,${config.glowIntensity * 0.3}) 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: "50%"
          }}
        />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{
              left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 30}%`,
              top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 30}%`,
            }}
            animate={{
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Ripple effects for listening state */}
      {state === VOICE_ASSISTANT_CONFIG.states.LISTENING && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`ripple-${i}`}
              className="absolute rounded-full border-2 border-emerald-400/30"
              style={{
                width: "250px",
                height: "250px",
                transform: "translate(-50%, -50%)",
                left: "50%",
                top: "50%"
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.5, 2],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.6,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
