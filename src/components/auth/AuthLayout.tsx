"use client"

import React from "react"
import { motion } from "framer-motion"
import { Brain } from "lucide-react"
import { ParticleBackground } from "@/components/effects/ParticleBackground"
import { fadeInUp } from "@/lib/animations"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <ParticleBackground />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="w-10 h-10 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-xl" />
            </div>
            <span className="text-3xl font-display font-bold gradient-text">
              FiGenie
            </span>
          </div>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          className="glass rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 text-center">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-400 text-center mb-8">
              {subtitle}
            </p>
          )}
          
          {children}
        </motion.div>

        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl -z-10" />
      </motion.div>
    </div>
  )
}
