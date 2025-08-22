"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Mic } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { ChatTab } from "@/components/ai-assistant/ChatTab"
import { VoiceTab } from "@/components/ai-assistant/VoiceTab"
import { cn } from "@/lib/utils"

type TabType = "chat" | "voice"

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<TabType>("chat")

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-80px)] flex flex-col">
        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-1 flex gap-1">
              <TabButton
                active={activeTab === "chat"}
                onClick={() => setActiveTab("chat")}
                icon={<MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Chat"
              />
              <TabButton
                active={activeTab === "voice"}
                onClick={() => setActiveTab("voice")}
                icon={<Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Voice"
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 px-4 sm:px-6 pb-4">
          <div className="max-w-4xl mx-auto h-full">
            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ChatTab />
                </motion.div>
              ) : (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <VoiceTab />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200",
        active
          ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span className="text-sm sm:text-base font-medium">{label}</span>
    </motion.button>
  )
}
