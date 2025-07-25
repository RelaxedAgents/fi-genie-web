"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const newOtp = value.split("").slice(0, 6)
    setOtp([...newOtp, ...new Array(6 - newOtp.length).fill("")])
  }, [value])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return

    const newOtp = [...otp]
    newOtp[index] = digit.slice(-1)
    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6)
    const newOtp = pastedData.split("")
    setOtp([...newOtp, ...new Array(6 - newOtp.length).fill("")])
    onChange(pastedData)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.length < 6 ? newOtp.length : 5
    inputRefs.current[nextEmptyIndex]?.focus()
  }

  return (
    <motion.div
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex justify-center gap-2 sm:gap-3"
    >
      {otp.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold",
              "glass rounded-lg outline-none transition-all duration-300",
              "focus:ring-2 focus:ring-primary/50",
              error && "ring-2 ring-red-500/50",
              !error && "hover:bg-white/[0.1]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
