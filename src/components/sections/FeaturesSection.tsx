"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  Brain, 
  TrendingUp, 
  PiggyBank, 
  Shield, 
  MessageSquare, 
  BarChart3,
  Zap,
  Target
} from "lucide-react"
import { GlassCard } from "@/components/common/GlassCard"
import { staggerContainer, fadeInUp } from "@/lib/animations"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized financial recommendations based on your spending patterns and goals.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    title: "Smart Investment Tracking",
    description: "Monitor your portfolio performance with real-time AI analysis and predictions.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: PiggyBank,
    title: "Automated Savings",
    description: "Let AI optimize your savings strategy and automatically allocate funds to your goals.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your financial data is protected with enterprise-grade encryption and security protocols.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: MessageSquare,
    title: "Natural Language Q&A",
    description: "Ask questions about your finances in plain English and get instant AI-powered answers.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Forecast your financial future with advanced AI models and scenario planning.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
]

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="section-padding relative">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-gray-300">Powerful Features</span>
            </div>
            <h2 className="text-display-2 md:text-heading-1 font-display font-bold mb-6">
              Everything You Need to <span className="gradient-text">Master Your Finances</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive tools and insights to help you make 
              smarter financial decisions and achieve your goals faster.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <GlassCard 
                className="h-full group"
                hover={true}
                delay={index * 0.1}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 flex-grow">{feature.description}</p>
                  <motion.div 
                    className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-sm font-medium">Learn more</span>
                    <Target className="w-4 h-4" />
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature highlight */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 text-center px-4"
        >
          <div className="inline-flex flex-col sm:flex-row items-center justify-center glass rounded-2xl p-4 sm:p-8 gap-4 sm:gap-8 w-full max-w-fit">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text">98%</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">User Satisfaction</p>
            </div>
            <div className="hidden sm:block w-px h-16 bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text">24/7</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">AI Assistance</p>
            </div>
            <div className="hidden sm:block w-px h-16 bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text">256-bit</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Encryption</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
