"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/common/Button"
import { fadeInUp, floatingAnimation } from "@/lib/animations"

export const HeroSection: React.FC = () => {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/voice-assistant")
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass mb-4 sm:mb-6"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm text-gray-300">AI-Powered Financial Intelligence</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-4 sm:mb-6">
              Your <span className="gradient-text">AI-Powered</span> Financial Genius
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              Transform your financial future with intelligent insights, personalized recommendations, 
              and automated wealth management powered by cutting-edge AI technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button size="md" className="group text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4" onClick={handleGetStarted}>
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="secondary" size="md" className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
                Watch Demo
              </Button>
            </div>

            <div className="mt-8 sm:mt-12 flex items-center gap-4 sm:gap-6 lg:gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">50K+</p>
                <p className="text-gray-500 text-xs sm:text-sm">Active Users</p>
              </div>
              <div className="w-px h-8 sm:h-10 lg:h-12 bg-gray-700" />
              <div className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">$2.5M+</p>
                <p className="text-gray-500 text-xs sm:text-sm">Saved Monthly</p>
              </div>
              <div className="w-px h-8 sm:h-10 lg:h-12 bg-gray-700" />
              <div className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">4.9/5</p>
                <p className="text-gray-500 text-xs sm:text-sm">User Rating</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - AI Assistant Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2 px-4 sm:px-0"
          >
            <div className="relative z-10 mx-auto max-w-md lg:max-w-none">
              {/* Main Dashboard Card */}
              <motion.div
                className="glass rounded-2xl p-6 shadow-2xl"
                animate={floatingAnimation}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold">AI Financial Dashboard</h3>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm text-gray-400">Live</span>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Balance</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">$124,567.89</p>
                  <p className="text-success text-xs sm:text-sm mt-1">+12.5% this month</p>
                </div>

                {/* Chart Mockup */}
                <div className="h-24 sm:h-28 lg:h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl mb-4 sm:mb-6 flex items-end justify-around p-2 sm:p-3 lg:p-4">
                  {[40, 65, 45, 70, 55, 85, 60].map((height, index) => (
                    <motion.div
                      key={index}
                      className="w-3 sm:w-4 lg:w-6 bg-gradient-primary rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    />
                  ))}
                </div>

                {/* AI Suggestions */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="glass rounded-lg p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">AI Insight</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">Save $350 by optimizing subscriptions</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements - Hidden on mobile to prevent overflow */}
              <motion.div
                className="hidden sm:block absolute -top-4 -right-4 glass rounded-xl p-3 lg:p-4 shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-xs text-gray-400 mb-1">Savings Goal</p>
                <p className="text-lg lg:text-xl font-bold text-success">89%</p>
              </motion.div>

              <motion.div
                className="hidden sm:block absolute -bottom-4 -left-4 glass rounded-xl p-3 lg:p-4 shadow-xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-xs text-gray-400 mb-1">Credit Score</p>
                <p className="text-lg lg:text-xl font-bold">782</p>
              </motion.div>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
