"use client"

import React from "react"
import { motion } from "framer-motion"
import { Phone, PhoneOff, Mic, MicOff, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceControlsProps {
  isConnected: boolean
  isMuted: boolean
  isListening: boolean
  onConnect: () => void
  onMute: () => void
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isConnected,
  isMuted,
  isListening,
  onConnect,
  onMute,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Connect/Disconnect Button */}
        <motion.button
          onClick={onConnect}
          className={cn(
            "flex-1 w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all duration-200",
            "flex items-center justify-center gap-3",
            isConnected
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              : "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isConnected ? (
            <>
              <PhoneOff className="w-5 h-5" />
              <span>Disconnect</span>
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              <span>Connect</span>
            </>
          )}
        </motion.button>

        {/* Mute/Unmute Button */}
        <motion.button
          onClick={onMute}
          disabled={!isConnected}
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            "flex items-center justify-center",
            !isConnected
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : isMuted
              ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
          )}
          whileHover={isConnected ? { scale: 1.05 } : {}}
          whileTap={isConnected ? { scale: 0.95 } : {}}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </motion.button>

        {/* Voice Activity Indicator */}
        <div className="flex items-center gap-2 px-4">
          <Activity
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              isConnected && isListening
                ? "text-green-400"
                : "text-white/30"
            )}
          />
          <span className="text-sm text-white/60">
            {!isConnected && "Offline"}
            {isConnected && !isListening && "Idle"}
            {isConnected && isListening && "Active"}
          </span>
          {isConnected && isListening && (
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Status</span>
          <span
            className={cn(
              "font-medium",
              isConnected ? "text-green-400" : "text-white/40"
            )}
          >
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        </div>
        {isConnected && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-white/60">Microphone</span>
            <span
              className={cn(
                "font-medium",
                isMuted ? "text-orange-400" : "text-green-400"
              )}
            >
              {isMuted ? "Muted" : "Active"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
