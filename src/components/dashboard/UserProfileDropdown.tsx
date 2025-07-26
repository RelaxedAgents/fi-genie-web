"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentUser, logout, getAvatarById } from "@/lib/auth"

export const UserProfileDropdown: React.FC = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const user = getCurrentUser()
  const avatar = user ? getAvatarById(user.avatar || "") : null

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  const menuItems = [
    { icon: User, label: "View Profile", onClick: () => router.push("/profile") },
    { icon: Settings, label: "Settings", onClick: () => router.push("/settings") },
    { icon: LogOut, label: "Logout", onClick: handleLogout },
  ]

  // Show placeholder if no user
  if (!user || !avatar) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-full glass">
        <div className="w-8 h-8 rounded-full glass bg-gray-700 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-medium text-gray-400 hidden md:inline">
          Guest
        </span>
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-full glass transition-all duration-300",
          "hover:bg-white/[0.08] hover:shadow-lg",
          isOpen && "bg-white/[0.1] shadow-lg"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden glass">
          {avatar.emoji ? (
            <span className="absolute inset-0 flex items-center justify-center text-lg">
              {avatar.emoji}
            </span>
          ) : avatar.gradient ? (
            <div className="w-full h-full" style={{ background: avatar.gradient }} />
          ) : null}
          
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark" />
        </div>

        {/* Username */}
        <span className="text-sm font-medium text-white hidden md:inline">
          {user.username || "User"}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-xl overflow-hidden"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-white/[0.08]">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-gray-400">{user.phone}</p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setIsOpen(false)
                      item.onClick()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                    whileHover={{ x: 4 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
