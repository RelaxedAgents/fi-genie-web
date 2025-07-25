"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, User } from "lucide-react"
import { Button } from "@/components/common/Button"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import { TypingText } from "@/components/ui/TypingText"
import { AvatarSelector } from "@/components/auth/AvatarSelector"
import { avatars, defaultAvatar } from "@/data/avatars"
import { updateUserProfile } from "@/lib/auth"
import { cn } from "@/lib/utils"

// Validate username (4-8 chars, alphanumeric + underscore/dash)
const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_-]{4,8}$/.test(username)
}

export const UsernameForm: React.FC = () => {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAvatarSection, setShowAvatarSection] = useState(false)

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isValidUsername(username)) {
      setError("Username must be 4-8 characters (letters, numbers, _ or -)")
      return
    }

    // Show avatar section after username is valid
    setShowAvatarSection(true)
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    // Save to localStorage
    updateUserProfile(username, selectedAvatar.id)
    
    // Simulate a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Navigate to dashboard
    router.push("/dashboard")
  }

  const handleSkipAvatar = async () => {
    setIsLoading(true)
    
    // Save with default avatar
    updateUserProfile(username, defaultAvatar.id)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push("/dashboard")
  }

  return (
    <div className="space-y-8">
      {/* Welcome message with typing animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-4">
          <TypingText text="Welcome aboard! What should we call you?" />
        </h1>
      </motion.div>

      {!showAvatarSection ? (
        // Username input section
        <motion.form
          onSubmit={handleUsernameSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choose your username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase())
                  if (error) setError("")
                }}
                placeholder="johndoe"
                maxLength={8}
                className={cn(
                  "w-full pl-12 pr-4 py-3 glass rounded-lg outline-none transition-all duration-300",
                  "text-white placeholder-gray-500 text-lg",
                  "focus:ring-2 focus:ring-primary/50",
                  error && "ring-2 ring-red-500/50"
                )}
              />
            </div>
            <ErrorMessage message={error} show={!!error} />
            <p className="text-xs text-gray-500 mt-2">
              4-8 characters, letters, numbers, underscore or dash
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={username.length === 0}
            className="w-full group"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.form>
      ) : (
        // Avatar selection section
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Choose your avatar
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Pick an avatar that represents you
            </p>
            
            <AvatarSelector
              avatars={avatars}
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleSkipAvatar}
              disabled={isLoading}
              className="flex-1"
            >
              Skip & Use Default
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1 group"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
