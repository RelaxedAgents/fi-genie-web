"use client"

import React from "react"
import { motion } from "framer-motion"

export const AuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0B0F] via-[#0D0E14] to-[#0A0B0F]" />
      
      {/* Aurora layers */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 80%, #6B46F2 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 20%, #00D4FF 0%, transparent 50%)",
            "radial-gradient(ellipse at 40% 40%, #9945FF 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 80%, #6B46F2 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(ellipse at 80% 20%, #00FF88 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 80%, #FF6B35 0%, transparent 50%)",
            "radial-gradient(ellipse at 60% 60%, #00D4FF 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 20%, #00FF88 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20,
          }}
          animate={{
            y: -20,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
