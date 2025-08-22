"use client"

import React from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    isStreaming?: boolean
  }
  streamingContent?: string
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, streamingContent }) => {
  const [copied, setCopied] = React.useState(false)
  const isUser = message.role === "user"
  const displayContent = streamingContent !== undefined ? streamingContent : message.content

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] group relative",
          isUser ? "order-2" : "order-1"
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 relative",
            isUser
              ? "bg-gradient-to-r from-primary to-primary-light text-white"
              : "glass border border-white/10"
          )}
        >
          {/* Message Content */}
          <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {displayContent}
            {message.isStreaming && streamingContent && (
              <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>

          {/* Copy Button for AI Messages */}
          {!isUser && message.content && !message.isStreaming && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleCopy}
              className={cn(
                "absolute -top-8 right-0 p-1.5 rounded-lg",
                "bg-white/10 hover:bg-white/20 transition-all",
                "opacity-0 group-hover:opacity-100",
                "flex items-center gap-1 text-xs text-white/70"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "text-xs text-white/40 mt-1 px-2",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  )
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}
