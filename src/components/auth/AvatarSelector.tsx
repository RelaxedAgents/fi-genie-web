"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar } from "@/data/avatars"

interface AvatarSelectorProps {
  avatars: Avatar[]
  selectedAvatar: Avatar | null
  onSelect: (avatar: Avatar) => void
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  avatars,
  selectedAvatar,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {avatars.map((avatar, index) => (
        <motion.button
          key={avatar.id}
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(avatar)}
          className={cn(
            "relative w-16 h-16 rounded-xl glass transition-all duration-300",
            "hover:shadow-lg hover:shadow-primary/20",
            selectedAvatar?.id === avatar.id && "ring-2 ring-primary shadow-lg shadow-primary/30"
          )}
        >
          {/* Glow effect for selected avatar */}
          {selectedAvatar?.id === avatar.id && (
            <motion.div
              layoutId="selectedGlow"
              className="absolute inset-0 rounded-xl bg-primary/20 blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Avatar content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center rounded-xl overflow-hidden">
            {avatar.emoji ? (
              <span className="text-2xl">{avatar.emoji}</span>
            ) : avatar.gradient ? (
              <div 
                className="w-full h-full"
                style={{ background: avatar.gradient }}
              />
            ) : null}
          </div>

          {/* Selection indicator */}
          {selectedAvatar?.id === avatar.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg z-20"
            >
              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  )
}
