"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AudioSpectrumAnalyzerProps {
  isActive: boolean
  isListening: boolean
}

export const AudioSpectrumAnalyzer: React.FC<AudioSpectrumAnalyzerProps> = ({
  isActive,
  isListening,
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(Array(8).fill(0))

  useEffect(() => {
    if (!isActive || !isListening) {
      setFrequencies(Array(8).fill(0))
      return
    }

    // Simulate audio frequencies
    const interval = setInterval(() => {
      setFrequencies(
        Array(8)
          .fill(0)
          .map(() => Math.random() * 0.8 + 0.2)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isActive, isListening])

  const rings = [
    { radius: 40, strokeWidth: 3, opacity: 0.9 },
    { radius: 60, strokeWidth: 4, opacity: 0.7 },
    { radius: 85, strokeWidth: 5, opacity: 0.5 },
    { radius: 115, strokeWidth: 6, opacity: 0.3 },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      >
        <defs>
          <linearGradient id="spectrum-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Background rings */}
        {rings.map((ring, index) => (
          <motion.circle
            key={`bg-${index}`}
            cx="150"
            cy="150"
            r={ring.radius}
            fill="none"
            stroke="white"
            strokeWidth={ring.strokeWidth}
            opacity={0.05}
          />
        ))}

        {/* Animated spectrum rings */}
        {isActive && (
          <>
            {rings.map((ring, ringIndex) => (
              <g key={`ring-${ringIndex}`}>
                {Array.from({ length: 32 }).map((_, i) => {
                  const angle = (i * 360) / 32
                  const radian = (angle * Math.PI) / 180
                  const freqIndex = Math.floor((i / 32) * frequencies.length)
                  const amplitude = frequencies[freqIndex] || 0
                  const segmentLength = (2 * Math.PI * ring.radius) / 32 * 0.8

                  return (
                    <motion.path
                      key={`segment-${ringIndex}-${i}`}
                      d={`
                        M ${150 + ring.radius * Math.cos(radian)} ${150 + ring.radius * Math.sin(radian)}
                        A ${ring.radius} ${ring.radius} 0 0 1 
                        ${150 + ring.radius * Math.cos(radian + (11.25 * Math.PI) / 180)} 
                        ${150 + ring.radius * Math.sin(radian + (11.25 * Math.PI) / 180)}
                      `}
                      fill="none"
                      stroke="url(#spectrum-gradient)"
                      strokeWidth={ring.strokeWidth}
                      strokeLinecap="round"
                      initial={{
                        opacity: 0.1,
                        strokeWidth: ring.strokeWidth,
                      }}
                      animate={{
                        opacity: isListening ? amplitude * ring.opacity : 0.1,
                        strokeWidth: isListening
                          ? ring.strokeWidth + amplitude * 2
                          : ring.strokeWidth,
                      }}
                      transition={{
                        duration: 0.1,
                        ease: "easeOut",
                      }}
                    />
                  )
                })}
              </g>
            ))}

            {/* Center pulse */}
            <motion.circle
              cx="150"
              cy="150"
              r="20"
              fill="url(#spectrum-gradient)"
              initial={{
                scale: 1,
                opacity: 0.3,
              }}
              animate={{
                scale: isListening ? [1, 1.2, 1] : 1,
                opacity: isListening ? [0.5, 0.8, 0.5] : 0.3,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}

        {/* Inactive state center */}
        {!isActive && (
          <circle
            cx="150"
            cy="150"
            r="20"
            fill="white"
            opacity="0.1"
          />
        )}
      </svg>
    </div>
  )
}
