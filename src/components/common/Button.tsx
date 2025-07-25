"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, onClick, disabled, type = "button" }, ref) => {
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "text-gray-400 hover:text-white transition-colors duration-300",
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-dark",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizes[size],
          variants[variant],
          className
        )}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = "Button"
