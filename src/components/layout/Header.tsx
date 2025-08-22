"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/common/Button"
import { cn } from "@/lib/utils"

export const Header: React.FC = () => {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "glass py-4" : "py-6"
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                scrollToTop()
              }}
              className="flex items-center space-x-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Image 
                  src="/arthaai-logo.png" 
                  alt="ArthaAI Logo" 
                  width={48} 
                  height={48} 
                  className="w-12 h-12 group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                ArthaAI
              </span>
            </motion.a>


            {/* CTA Button */}
            <div className="hidden md:block">
              <Button size="md" onClick={() => router.push("/voice-assistant")}>Get Started</Button>
            </div>

            {/* Mobile CTA Button */}
            <div className="md:hidden">
              <Button size="sm" onClick={() => router.push("/voice-assistant")}>Get Started</Button>
            </div>
          </nav>
        </div>
      </motion.header>

    </>
  )
}
