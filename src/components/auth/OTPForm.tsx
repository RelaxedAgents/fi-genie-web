"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, RotateCcw } from "lucide-react"
import { OTPInput } from "@/components/ui/OTPInput"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import { Button } from "@/components/common/Button"
import { getCurrentUser } from "@/lib/auth"

export const OTPForm: React.FC = () => {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [userPhone, setUserPhone] = useState("")

  useEffect(() => {
    // Get user phone from storage
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setUserPhone(user.phone)

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For demo purposes, accept any 6-digit code
    if (otp.length === 6) {
      // Navigate to profile setup or dashboard
      router.push("/auth/profile")
    } else {
      setError("Invalid OTP. Please try again.")
    }

    setIsLoading(false)
  }

  const handleResend = async () => {
    setIsResending(true)
    setError("")

    // Simulate resend delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Reset countdown
    setCountdown(30)
    setCanResend(false)
    setIsResending(false)

    // Start countdown again
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleOtpChange = (value: string) => {
    setOtp(value)
    if (error) setError("")
  }

  const formatPhone = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    }
    return phone
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-400">
          We sent a verification code to
        </p>
        <p className="text-white font-medium">
          {formatPhone(userPhone)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
          Enter Verification Code
        </label>
        <OTPInput
          value={otp}
          onChange={handleOtpChange}
          error={!!error}
          disabled={isLoading}
        />
        <ErrorMessage message={error} show={!!error} />
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
              Verify & Continue
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>

      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary hover:text-primary-light transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isResending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.div>
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Resend Code
          </button>
        ) : (
          <p className="text-gray-400 text-sm">
            Resend code in {countdown}s
          </p>
        )}
      </div>

      <p className="text-center text-sm text-gray-400">
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="text-primary hover:text-primary-light transition-colors"
        >
          Change number
        </button>
      </p>
    </form>
  )
}
