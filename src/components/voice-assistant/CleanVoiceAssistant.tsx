"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { VoiceOrb } from "@/components/common/VoiceOrb"
import { NavigationButton } from "./NavigationButton"
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant"
import { VOICE_ASSISTANT_CONFIG } from "@/config/mockPhoneNumbers"

interface CleanVoiceAssistantProps {
  onNavigateToDashboard: () => void
}

export const CleanVoiceAssistant: React.FC<CleanVoiceAssistantProps> = ({
  onNavigateToDashboard,
}) => {
  const { state, startInteraction } = useVoiceAssistant()
  const [showNavigationButton, setShowNavigationButton] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Start the voice interaction automatically
    startInteraction()
  }, [startInteraction])

  useEffect(() => {
    // Timer to track elapsed time
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    // Show navigation button after configured duration
    if (elapsedTime >= VOICE_ASSISTANT_CONFIG.interactionDuration) {
      setShowNavigationButton(true)
    }

    return () => clearInterval(interval)
  }, [elapsedTime])

  return (
    <div className="fixed inset-0 bg-dark overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-lighter to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Main content - centered avatar with better sizing */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 pt-20">
        {/* Status text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-2">
            {state === VOICE_ASSISTANT_CONFIG.states.IDLE && "Hello, I'm ArthaAI"}
            {state === VOICE_ASSISTANT_CONFIG.states.LISTENING && "I'm listening..."}
            {state === VOICE_ASSISTANT_CONFIG.states.PROCESSING && "Processing your request..."}
            {state === VOICE_ASSISTANT_CONFIG.states.SPEAKING && "Here's what I found..."}
          </h2>
          <p className="text-sm md:text-base text-white/60">
            Your AI-powered financial assistant
          </p>
        </motion.div>

        {/* Avatar container with adjusted sizing */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            scale: { type: "spring", damping: 15 }
          }}
          className="flex items-center justify-center"
        >
          <VoiceOrb 
            state={
              state === VOICE_ASSISTANT_CONFIG.states.IDLE ? "idle" :
              state === VOICE_ASSISTANT_CONFIG.states.LISTENING ? "listening" :
              state === VOICE_ASSISTANT_CONFIG.states.PROCESSING ? "processing" :
              "speaking"
            }
            size="large"
            showParticles={true}
          />
        </motion.div>

        {/* Voice hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-sm text-white/40 text-center"
        >
          {!showNavigationButton && "Analyzing your financial profile..."}
        </motion.p>
      </div>

      {/* Navigation Button - properly centered */}
      <AnimatePresence>
        {showNavigationButton && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
              type: "spring",
              damping: 20
            }}
            className="fixed bottom-8 left-0 right-0 flex justify-center z-20"
          >
            <NavigationButton onClick={onNavigateToDashboard} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle ambient particles - only render when mounted */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/10 rounded-full"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 10,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
