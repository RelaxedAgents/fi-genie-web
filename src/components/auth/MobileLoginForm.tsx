"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { PhoneInput } from "@/components/ui/PhoneInput"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import { Button } from "@/components/common/Button"
import { isValidIndianMobile, saveUser } from "@/lib/auth"

export const MobileLoginForm: React.FC = () => {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isValidIndianMobile(phone)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    setIsLoading(true)

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    // Save user data with just the 10-digit number
    saveUser(phone)

    // Navigate to OTP screen
    router.push("/auth/otp")
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (error) setError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mobile Number
        </label>
        <PhoneInput
          value={phone}
          onChange={handlePhoneChange}
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
          disabled={isLoading || phone.length === 0}
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
              Continue
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>

      <p className="text-center text-sm text-gray-400">
        By continuing, you agree to our{" "}
        <a href="#" className="text-primary hover:text-primary-light transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:text-primary-light transition-colors">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}
