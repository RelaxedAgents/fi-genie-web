"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Currency symbols floating */}
      <div className="absolute inset-0">
        {["$", "€", "£", "¥", "₹"].map((symbol, index) => (
          <motion.div
            key={symbol}
            className="absolute text-primary/10 text-4xl font-light"
            style={{
              left: `${20 + index * 15}%`,
              top: `${10 + index * 15}%`,
            }}
            animate={{
              y: [0, -100, 0],
              rotate: [0, 360],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 15 + index * 2,
              repeat: Infinity,
              delay: index * 2,
              ease: "easeInOut",
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-300" />
      <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-success/10 rounded-full blur-3xl animate-pulse animation-delay-500" />
    </div>
  )
}
