"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, MessageCircle, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0B0F] via-[#0D0E14] to-[#0A0B0F]" />
      
      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass border-b border-white/[0.08] px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>

            <h1 className="text-xl font-semibold text-white">ArthaAI Assistant</h1>

            <div className="w-20" /> {/* Spacer for center alignment */}
          </div>
        </motion.header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="flex justify-center gap-6 mb-8">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-full glass flex items-center justify-center"
              >
                <MessageCircle className="w-8 h-8 text-primary-light" />
              </motion.div>
              
              <motion.div
                initial={{ rotate: 10 }}
                animate={{ rotate: 0 }}
                whileHover={{ rotate: -10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-full glass flex items-center justify-center"
              >
                <Mic className="w-8 h-8 text-primary-light" />
              </motion.div>
            </div>

            <h2 className="text-3xl font-display font-bold gradient-text mb-4">
              Chat & Voice Assistant
            </h2>
            <p className="text-gray-400">
              Your AI-powered financial assistant is coming soon. Get instant answers through chat or voice commands.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
