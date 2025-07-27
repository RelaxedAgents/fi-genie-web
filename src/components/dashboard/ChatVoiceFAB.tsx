"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MessageCircle, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"

export const ChatVoiceFAB: React.FC = () => {
  const router = useRouter()

  const handleClick = () => {
    // Get current user data from localStorage
    const currentUser = getCurrentUser()
    
    // Get the current origin to construct the return URL
    const returnUrl = window.location.origin + '/dashboard'
    
    // Build query parameters including phone number
    const params = new URLSearchParams({
      returnUrl: returnUrl,
      phone: currentUser?.phone || ''
    })
    
    // Redirect to Gemini Vox with return URL and phone number as query parameters
    window.location.href = `https://gemini-vox-218281830730.us-central1.run.app?${params.toString()}`
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <motion.button
        onClick={handleClick}
        className={cn(
          "relative flex items-center gap-2 px-6 py-3",
          "glass rounded-full shadow-2xl",
          "hover:shadow-primary/20 hover:shadow-3xl",
          "transition-all duration-300 group"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary-light/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icons container */}
      <div className="relative z-10 flex items-center gap-2">
        {/* Chat icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MessageCircle className="w-5 h-5 text-primary-light" />
        </motion.div>

        {/* Slash separator */}
        <span className="text-gray-500 text-lg font-light">/</span>

        {/* Voice icon */}
        <motion.div
          initial={{ rotate: 10 }}
          animate={{ rotate: 0 }}
          whileHover={{ rotate: -10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Mic className="w-5 h-5 text-primary-light" />
        </motion.div>
      </div>

      {/* Enhanced pulse animations */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-primary-light/15"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      </motion.button>
    </div>
  )
}
