"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PieChart, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Asset {
  type: string
  value: number
  percentage: number
  color: string
}

interface InvestmentAssetAllocationProps {
  assetData: Asset[]
  totalValue: number
  insight?: string
}

export const InvestmentAssetAllocation: React.FC<InvestmentAssetAllocationProps> = ({
  assetData,
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
    const absAmount = Math.abs(value)
    if (absAmount >= 100000) {
      return `₹${(absAmount / 100000).toFixed(1)}L`
    } else if (absAmount >= 1000) {
      return `₹${(absAmount / 1000).toFixed(1)}k`
    }
    return `₹${absAmount.toLocaleString()}`
  }

  // Calculate donut segments
  let currentAngle = 0
  const segments = assetData.map((asset, index) => {
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
        <div className="relative z-10 flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-gray-400">Asset Allocation</h3>
              <p className="text-gray-500 text-sm">Investment distribution</p>
            </div>
            <PieChart className="w-5 h-5 text-primary" />
          </div>

          {/* AI Insight */}
          <div className="mb-4">
            <div className="bg-white/[0.06] rounded-lg p-1.5 backdrop-blur-sm border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-2.5 h-2.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium text-white">AI Insight:</p>
                  <p className="text-xs text-gray-300">
                    Stocks ({assetData[0]?.percentage?.toFixed(1) || '0'}%) outperforming MFs ({assetData[1]?.percentage?.toFixed(1) || '0'}%). 
                    Consider rebalancing for diversification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Pie Chart */}
          <div className="flex-1 flex gap-4">
            {/* Left Half - Pie Chart */}
            <div className="w-1/2 flex items-center justify-center">
              <div className="relative">
                <svg width="200" height="200" className="transform -rotate-90">
                  {assetData.map((asset, index) => {
                    const radius = 80
                    const circumference = 2 * Math.PI * radius
                    const strokeDasharray = `${(asset.percentage / 100) * circumference} ${circumference}`
                    const strokeDashoffset = -segments.slice(0, index).reduce((acc, seg) => acc + seg.percentage, 0) * circumference / 100
                    
                    return (
                      <motion.circle
                        key={index}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={asset.color}
                        strokeWidth="24"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circumference}` }}
                        animate={{ strokeDasharray }}
                        transition={{ duration: 1.2, delay: index * 0.15 }}
                      />
                    )
                  })}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(totalValue)}
                  </div>
                  <div className="text-sm text-gray-400">Total Assets</div>
                </div>
              </div>
            </div>

            {/* Right Half - Asset Details */}
            <div className="w-1/2 flex flex-col justify-center space-y-3">
              {assetData.map((asset, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: asset.color,
                        boxShadow: `0 0 8px ${asset.color}40`
                      }}
                    />
                    <div>
                      <div className="text-white text-sm font-medium">
                        {asset.type}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {asset.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">
                      {formatCurrency(asset.value)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
