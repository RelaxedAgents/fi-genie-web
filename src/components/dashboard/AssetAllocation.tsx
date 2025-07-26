"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PieChart, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Asset {
  category: string
  value: number
  percentage: number
  color: string
}

interface AssetAllocationProps {
  assets: Asset[]
  totalValue: number
  insight?: string
}

export const AssetAllocation: React.FC<AssetAllocationProps> = ({
  assets,
  totalValue,
  insight
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [showInsight, setShowInsight] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(2)}L`
  }

  // Calculate donut segments
  let currentAngle = 0
  const segments = assets.map((asset, index) => {
    const startAngle = currentAngle
    const endAngle = currentAngle + (asset.percentage / 100) * 360
    currentAngle = endAngle
    return { ...asset, startAngle, endAngle, index }
  })

  // Draw particles effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      life: number
    }> = []

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add new particles
      if (Math.random() < 0.1 && particles.length < 50) {
        const segment = segments[Math.floor(Math.random() * segments.length)]
        const angle = (segment.startAngle + segment.endAngle) / 2 + rotation
        const rad = (angle * Math.PI) / 180
        const radius = 80 + Math.random() * 20
        
        particles.push({
          x: canvas.width / 2 + Math.cos(rad) * radius,
          y: canvas.height / 2 + Math.sin(rad) * radius,
          vx: Math.cos(rad) * 0.5,
          vy: Math.sin(rad) * 0.5,
          size: Math.random() * 3 + 1,
          color: segment.color || '#3B82F6',
          life: 1
        })
      }

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.01

        ctx.globalAlpha = particle.life
        ctx.fillStyle = particle.color + '40'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        if (particle.life <= 0) {
          particles.splice(index, 1)
        }
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [segments, rotation])

  return (
    <motion.div className="relative h-full">
      <div className={cn(
        "relative w-full h-full rounded-3xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "shadow-2xl shadow-black/50",
        "overflow-hidden"
      )}>
        {/* Content */}
        <div className="relative z-10 p-2.5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-medium text-gray-400">Asset Allocation</h3>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              {insight && (
                <motion.button
                  className="relative group"
                  onMouseEnter={() => setShowInsight(true)}
                  onMouseLeave={() => setShowInsight(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Info className="w-4 h-4 text-gray-400 hover:text-primary transition-colors" />
                  
                  <AnimatePresence>
                    {showInsight && (
                      <motion.div
                        className="absolute top-full right-0 mt-2 w-64 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="bg-gray-900/95 backdrop-blur-md rounded-lg p-3 shadow-xl border border-white/10">
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {insight}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </div>
          </div>

          {/* 3D Donut Chart */}
          <div className="flex-1 relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              width={270}
              height={270}
            />
            
            <svg
              className="relative w-28 h-28"
              viewBox="0 0 200 200"
              style={{ transform: `rotateY(${rotation}deg)`, transformStyle: 'preserve-3d' }}
            >
              {/* Shadow effect */}
              <ellipse
                cx="100"
                cy="110"
                rx="80"
                ry="20"
                fill="rgba(0,0,0,0.2)"
                filter="blur(10px)"
              />

              {segments.map((segment) => {
                const startRad = (segment.startAngle * Math.PI) / 180
                const endRad = (segment.endAngle * Math.PI) / 180
                const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0

                const innerRadius = 50
                const outerRadius = 80

                const x1 = 100 + Math.cos(startRad) * outerRadius
                const y1 = 100 + Math.sin(startRad) * outerRadius
                const x2 = 100 + Math.cos(endRad) * outerRadius
                const y2 = 100 + Math.sin(endRad) * outerRadius
                const x3 = 100 + Math.cos(startRad) * innerRadius
                const y3 = 100 + Math.sin(startRad) * innerRadius
                const x4 = 100 + Math.cos(endRad) * innerRadius
                const y4 = 100 + Math.sin(endRad) * innerRadius

                return (
                  <motion.g
                    key={segment.index}
                    onMouseEnter={() => setHoveredSegment(segment.index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    animate={{
                      transform: hoveredSegment === segment.index ? 'translateZ(10px)' : 'translateZ(0px)'
                    }}
                  >
                    <motion.path
                      d={`
                        M ${x1} ${y1}
                        A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
                        L ${x4} ${y4}
                        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x3} ${y3}
                        Z
                      `}
                      fill={`url(#gradient-${segment.index})`}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                      animate={{
                        scale: hoveredSegment === segment.index ? 1.05 : 1,
                        filter: hoveredSegment === segment.index ? 'brightness(1.2)' : 'brightness(1)'
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </motion.g>
                )
              })}

              {/* Gradients */}
              <defs>
                {segments.map((segment) => (
                  <radialGradient key={segment.index} id={`gradient-${segment.index}`}>
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                  </radialGradient>
                ))}
              </defs>
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {formatCurrency(totalValue)}
                </p>
                <p className="text-xs text-gray-400">Total Assets</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            {assets.slice(0, 4).map((asset, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#60A5FA' }}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 truncate">{asset.category}</p>
                  <p className="text-xs font-semibold text-white">
                    {asset.percentage.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
