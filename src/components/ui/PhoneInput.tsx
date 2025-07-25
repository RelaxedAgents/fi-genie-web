"use client"

import React, { useState, ChangeEvent } from "react"
import { motion } from "framer-motion"
import { Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPhoneNumber } from "@/lib/auth"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  onBlur?: () => void
  disabled?: boolean
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error = false,
  onBlur,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "")
    if (input.length <= 10) {
      onChange(input)
    }
  }

  return (
    <motion.div
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div
        className={cn(
          "relative flex items-center gap-3 glass rounded-lg px-4 py-3 transition-all duration-300",
          isFocused && "ring-2 ring-primary/50",
          error && "ring-2 ring-red-500/50",
          !error && !isFocused && "hover:bg-white/[0.1]"
        )}
      >
        <div className="flex items-center gap-2 text-gray-400">
          <Phone className="w-5 h-5" />
          <span className="text-lg font-medium">+91</span>
          <div className="w-px h-6 bg-gray-600" />
        </div>
        
        <input
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          disabled={disabled}
          placeholder="98765 43210"
          className={cn(
            "flex-1 bg-transparent outline-none text-white placeholder-gray-500",
            "text-lg font-medium tracking-wide",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          autoComplete="tel"
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-lg bg-red-500/10 pointer-events-none"
        />
      )}
    </motion.div>
  )
}
