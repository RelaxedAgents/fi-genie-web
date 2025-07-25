"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  message: string
  show: boolean
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mt-2 text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
