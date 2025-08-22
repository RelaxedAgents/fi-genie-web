"use client"

import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown"

interface AuthenticatedHeaderProps {
  transparent?: boolean
  className?: string
}

export const AuthenticatedHeader: React.FC<AuthenticatedHeaderProps> = ({
  transparent = false,
  className = "",
}) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
    >
      <div className={`${transparent ? "" : "glass"} transition-all duration-300`}>
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard">
              <motion.div
                className="flex items-center gap-2 sm:gap-3 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Image 
                    src="/arthaai-logo.png" 
                    alt="ArthaAI Logo" 
                    width={40} 
                    height={40} 
                    className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
                </div>
                <span className="text-lg sm:text-xl font-display font-bold gradient-text">
                  FiGenie
                </span>
              </motion.div>
            </Link>

            {/* User Profile */}
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
