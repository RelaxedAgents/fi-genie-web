"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { VoiceOrbWithControls } from "@/components/common/VoiceOrbWithControls"

export const VoiceTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const handleConnect = () => {
    setIsConnected(!isConnected)
    if (!isConnected) {
      // Simulate voice activity
      setTimeout(() => setIsListening(true), 1000)
      setTimeout(() => setIsListening(false), 3000)
      setTimeout(() => setIsListening(true), 4000)
      setTimeout(() => setIsListening(false), 6000)
    } else {
      setIsListening(false)
    }
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <VoiceOrbWithControls
          state={
            !isConnected ? "idle" :
            isListening ? "listening" :
            "idle"
          }
          isConnected={isConnected}
          isMuted={isMuted}
          onConnect={handleConnect}
          onDisconnect={handleConnect}
          onMute={handleMute}
          title="FiGenie AI"
          size="large"
          showControls={true}
        />
      </motion.div>
    </div>
  )
}
