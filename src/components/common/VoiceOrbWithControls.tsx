"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react"
import { VoiceOrb } from "./VoiceOrb"

interface VoiceOrbWithControlsProps {
  state: "idle" | "listening" | "processing" | "speaking"
  onConnect?: () => void
  onDisconnect?: () => void
  onMute?: () => void
  isConnected?: boolean
  isMuted?: boolean
  title?: string
  duration?: string
  showControls?: boolean
  size?: "small" | "medium" | "large"
  className?: string
}

export const VoiceOrbWithControls: React.FC<VoiceOrbWithControlsProps> = ({
  state = "idle",
  onConnect,
  onDisconnect,
  onMute,
  isConnected = false,
  isMuted = false,
  title = "AI Assistant",
  duration = "00:00:00",
  showControls = true,
  size = "medium",
  className = "",
}) => {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setElapsedTime(0)
    }
  }, [isConnected])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={`relative flex flex-col items-center gap-8 ${className}`}>
      {/* Voice Orb */}
      <div className="relative">
        <VoiceOrb
          state={state}
          size={size}
          showParticles={false}
          amplitude={state === "listening" || state === "speaking" ? 0.5 : 0}
        />
      </div>

      {/* Control Panel */}
      <AnimatePresence>
        {showControls && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="flex items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md p-4">
              {/* Info Section */}
              <div className="flex flex-col pl-2">
                <span className="text-base font-medium text-white/90">
                  {title}
                </span>
                <span className="font-mono text-sm text-white/50">
                  {formatTime(elapsedTime)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                {/* Mute Button */}
                <button
                  onClick={onMute}
                  className={`
                    grid size-10 place-items-center rounded-full
                    transition-all duration-200
                    ${
                      isMuted
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }
                  `}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <MicOff className="size-5" />
                  ) : (
                    <Mic className="size-5" />
                  )}
                </button>

                {/* Disconnect Button */}
                <button
                  onClick={onDisconnect}
                  className="
                    grid size-10 place-items-center rounded-full
                    bg-red-500 text-white transition-all duration-200
                    hover:bg-red-600 active:scale-95
                  "
                  aria-label="Disconnect"
                >
                  <PhoneOff className="size-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect Button (shown when disconnected) */}
      <AnimatePresence>
        {showControls && !isConnected && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={onConnect}
            className="
              flex items-center gap-3 px-6 py-3 rounded-full
              bg-gradient-to-r from-cyan-500 to-blue-500
              text-white font-medium
              transition-all duration-200
              hover:shadow-lg hover:shadow-cyan-500/25
              active:scale-95
            "
          >
            <Phone className="size-5" />
            <span>Connect Voice Assistant</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
