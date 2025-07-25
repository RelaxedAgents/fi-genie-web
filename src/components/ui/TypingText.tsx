"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface TypingTextProps {
  text: string
  className?: string
  delay?: number
}

export const TypingText: React.FC<TypingTextProps> = ({ 
  text, 
  className = "",
  delay = 0 
}) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setCurrentIndex(0)
    }, delay)
    return () => clearTimeout(initialDelay)
  }, [delay])

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-6 bg-primary ml-1"
      />
    </motion.span>
  )
}
