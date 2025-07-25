"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, RefreshCw } from "lucide-react"
import { OTPInput } from "@/components/ui/OTPInput"
import { Button } from "@/components/common/Button"
import { getCurrentUser, formatPhoneNumber } from "@/lib/auth"

export const OTPForm: React.FC = () => {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    // Get phone number from localStorage
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setPhoneNumber(user.phone)
  }, [router])

  useEffect(() => {
    // Timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) return

    setIsLoading(true)

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Since it's a dummy OTP, any 6-digit code works
    router.push("/auth/profile")
  }

  const handleResend = () => {
    if (!canResend) return
    
    // Reset timer
    setResendTimer(30)
    setCanResend(false)
    
    // In real app, this would trigger a new OTP
    console.log("Resending OTP...")
  }

  const maskedPhone = phoneNumber ? 
    `${phoneNumber.slice(0, 2)}****${phoneNumber.slice(-2)}` : ""

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-400">
          We've sent a verification code to
        </p>
        <p className="text-lg font-semibold text-white mt-1">
          +91 {maskedPhone}
        </p>
      </div>

      <div>
        <OTPInput
          value={otp}
          onChange={setOtp}
          disabled={isLoading}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || otp.length !== 6}
          className="w-full group"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              Verify
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
            canResend 
              ? "text-primary hover:text-primary-light cursor-pointer" 
              : "text-gray-500 cursor-not-allowed"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
        </button>
      </div>

      <p className="text-center text-xs text-gray-500">
        Having trouble? <a href="#" className="text-primary hover:text-primary-light">Contact Support</a>
      </p>
    </form>
  )
}
