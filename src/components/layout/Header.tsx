"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X, Brain } from "lucide-react"
import { Button } from "@/components/common/Button"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "About", href: "#about" },
]

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const element = document.querySelector(href)
      element?.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
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
                scrollToSection("#")
              }}
              className="flex items-center space-x-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Brain className="w-8 h-8 text-primary group-hover:text-primary-light transition-colors" />
                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                FiGenie
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(item.href)
                    }}
                    className="text-gray-400 hover:text-white transition-colors duration-300 font-medium"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button size="md">Get Started</Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          x: isMobileMenuOpen ? 0 : "100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-0 z-40 bg-dark/95 backdrop-blur-xl md:hidden",
          !isMobileMenuOpen && "pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(item.href)
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: isMobileMenuOpen ? 1 : 0,
                x: isMobileMenuOpen ? 0 : 20,
              }}
              transition={{ delay: index * 0.1 }}
              className="text-2xl font-display font-semibold text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isMobileMenuOpen ? 1 : 0,
              y: isMobileMenuOpen ? 0 : 20,
            }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg">Get Started</Button>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
