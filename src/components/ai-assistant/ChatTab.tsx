"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import { ChatMessage } from "./ChatMessage"
import { StreamingIndicator } from "./StreamingIndicator"
import { queryAgent } from "@/lib/api/agentApi"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [progressMessage, setProgressMessage] = useState("AI is thinking")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const currentAiMessageId = useRef<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setProgressMessage("AI is thinking")
    setStreamingContent("")

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString()
    currentAiMessageId.current = aiMessageId

    await queryAgent({
      query: userMessage.content,
      onStreamStart: () => {
        // Add AI message when streaming starts
        const aiMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        }
        setMessages((prev) => [...prev, aiMessage])
      },
      onProgressUpdate: (message) => {
        setProgressMessage(message)
      },
      onAgentResponse: (response) => {
        // Append intermediate responses to streaming content
        setStreamingContent((prev) => prev + response + "\n")
      },
      onFinalAnalysis: (analysis) => {
        // Set the final content and finalize the message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: analysis, isStreaming: false }
              : msg
          )
        )
        setStreamingContent("")
      },
      onStreamComplete: () => {
        // Clean up
        setIsLoading(false)
        currentAiMessageId.current = null
      },
      onError: (error) => {
        console.error("Chat error:", error)
        // Add error message
        const errorMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "I apologize, but I encountered an error while processing your request. Please try again later.",
          timestamp: new Date(),
          isStreaming: false,
        }
        setMessages((prev) => [...prev, errorMessage])
        setStreamingContent("")
        setIsLoading(false)
        currentAiMessageId.current = null
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col glass rounded-2xl overflow-hidden">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 thin-scrollbar">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center pt-8">
              <h3 className="text-xl sm:text-2xl font-light text-white/80 mb-2">
                Start a conversation
              </h3>
              <p className="text-sm sm:text-base text-white/50">
                Ask me anything about your finances
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    streamingContent={
                      message.isStreaming ? streamingContent : undefined
                    }
                  />
                ))}
              </AnimatePresence>
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <StreamingIndicator message={progressMessage} />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-white/10 p-4 bg-dark/50 backdrop-blur-sm">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className={cn(
                "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl",
                "text-white placeholder-white/40 resize-none",
                "focus:outline-none focus:border-primary/50 focus:bg-white/10",
                "transition-all duration-200",
                "min-h-[48px] max-h-[120px]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
            />
          </div>
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-xl transition-all duration-200",
              "flex items-center justify-center min-w-[48px]",
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            )}
            whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
            whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
