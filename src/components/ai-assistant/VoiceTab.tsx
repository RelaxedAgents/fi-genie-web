"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react"
import TalkingHeadAvatar from "./TalkingHeadAvatar"
import { GeminiAvatarController } from "@/lib/avatarController"
import { GeminiLiveHandler } from "@/lib/geminiLiveHandler"
import { cn } from "@/lib/utils"

type VoiceState = "idle" | "listening" | "thinking" | "speaking"

export const VoiceTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  
  const avatarControllerRef = useRef<GeminiAvatarController | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const geminiLiveRef = useRef<GeminiLiveHandler | null>(null)

  // Handle avatar load
  const handleAvatarLoad = useCallback((head: any) => {
    console.log("Avatar loaded successfully")
    avatarControllerRef.current = new GeminiAvatarController(head)
    
    // Initialize Gemini Live handler if not already initialized
    if (!geminiLiveRef.current) {
      // In production, get the API key from environment or user settings
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
      const phoneNumber = '1234567890' // Get from user context
      
      geminiLiveRef.current = new GeminiLiveHandler({
        apiKey,
        phoneNumber,
        onStateChange: (state) => {
          setVoiceState(state)
        },
        onError: (error) => {
          console.error('Gemini Live error:', error)
        },
        onTranscript: (transcript) => {
          console.log('Transcript:', transcript)
        }
      })
      
      // Connect avatar controller to Gemini Live
      geminiLiveRef.current.setAvatarController(avatarControllerRef.current)
    }
  }, [])

  // Handle avatar error
  const handleAvatarError = useCallback((error: Error) => {
    console.error("Avatar loading error:", error)
  }, [])

  // Handle connection
  const handleConnect = useCallback(async () => {
    if (isConnected) {
      // Disconnect
      setIsConnected(false)
      setVoiceState("idle")
      
      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      
      // Stop avatar
      if (avatarControllerRef.current) {
        avatarControllerRef.current.stop()
      }
      
      // Disconnect Gemini Live
      if (geminiLiveRef.current) {
        geminiLiveRef.current.disconnect()
      }
    } else {
      // Connect
      setIsConnected(true)
      setVoiceState("listening")
      
      // Set avatar to listening state
      if (avatarControllerRef.current) {
        avatarControllerRef.current.setListeningState()
        
        // Start listening with microphone
        try {
          const stream = await avatarControllerRef.current.startListening()
          if (stream) {
            mediaStreamRef.current = stream
          }
        } catch (error) {
          console.error("Error starting microphone:", error)
        }
      }
      
      // Connect to Gemini Live instead of simulating
      if (geminiLiveRef.current) {
        geminiLiveRef.current.connect().then(() => {
          geminiLiveRef.current?.startListening()
        })
      } else {
        // Fallback to simulation if Gemini Live not available
        simulateVoiceInteraction()
      }
    }
  }, [isConnected])

  // Simulate voice interaction for demo purposes
  const simulateVoiceInteraction = useCallback(() => {
    // Simulate user speaking after 2 seconds
    setTimeout(() => {
      setVoiceState("thinking")
      if (avatarControllerRef.current) {
        avatarControllerRef.current.setThinkingState()
      }
    }, 2000)
    
    // Simulate AI response after 4 seconds
    setTimeout(() => {
      setVoiceState("speaking")
      if (avatarControllerRef.current) {
        avatarControllerRef.current.setSpeakingState({
          text: "Based on your portfolio analysis, I see excellent growth potential in your equity investments. Your mutual funds have shown a 15% increase this quarter.",
          mood: "happy"
        })
      }
    }, 4000)
    
    // Return to listening after 8 seconds
    setTimeout(() => {
      setVoiceState("listening")
      if (avatarControllerRef.current) {
        avatarControllerRef.current.setListeningState()
      }
    }, 8000)
  }, [])

  // Handle mute
  const handleMute = useCallback(() => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    // Mute/unmute the actual media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState
      })
    }
    
    // Notify GeminiLiveHandler if it has a setMuted method
    if (geminiLiveRef.current && 'setMuted' in geminiLiveRef.current) {
      (geminiLiveRef.current as any).setMuted(newMutedState)
    }
  }, [isMuted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (avatarControllerRef.current) {
        avatarControllerRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Avatar Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto aspect-square"
        >
          <TalkingHeadAvatar
            onLoad={handleAvatarLoad}
            onError={handleAvatarError}
            className="w-full h-full"
          />
        </motion.div>
      </div>

      {/* Voice Controls */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-center gap-4">
              {/* Connect/Disconnect Button */}
              <motion.button
                onClick={handleConnect}
                className={cn(
                  "p-4 rounded-full transition-all duration-200",
                  isConnected
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-primary/20 text-primary hover:bg-primary/30"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isConnected ? (
                  <PhoneOff className="w-6 h-6" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </motion.button>

              {/* Mute Button */}
              <motion.button
                onClick={handleMute}
                disabled={!isConnected}
                className={cn(
                  "p-4 rounded-full transition-all duration-200",
                  !isConnected && "opacity-50 cursor-not-allowed",
                  isMuted
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
                whileHover={isConnected ? { scale: 1.05 } : {}}
                whileTap={isConnected ? { scale: 0.95 } : {}}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </motion.button>

            </div>

            {/* Status Text */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                {!isConnected ? "Click to start voice conversation" :
                 voiceState === "listening" ? "Listening..." :
                 voiceState === "thinking" ? "Processing..." :
                 voiceState === "speaking" ? "Speaking..." :
                 "Connected"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
