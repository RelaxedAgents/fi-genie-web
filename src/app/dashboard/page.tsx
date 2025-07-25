"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Brain } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { ParticleBackground } from "@/components/effects/ParticleBackground"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <ParticleBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Brain className="w-20 h-20 text-primary" />
            <div className="absolute inset-0 bg-primary/20 blur-xl" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Welcome to <span className="gradient-text">FiGenie</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-8">
          Your dashboard is being prepared...
        </p>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </motion.div>
    </div>
  )
}
