"use client"

import React from "react"
import { motion } from "framer-motion"
import { Brain, Twitter, Linkedin, Github, Mail } from "lucide-react"
import { fadeInUp } from "@/lib/animations"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Security", href: "#security" },
    { label: "Roadmap", href: "#roadmap" },
  ],
  company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Careers", href: "#careers" },
    { label: "Press", href: "#press" },
  ],
  resources: [
    { label: "Documentation", href: "#docs" },
    { label: "API", href: "#api" },
    { label: "Support", href: "#support" },
    { label: "Status", href: "#status" },
  ],
  legal: [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Cookie Policy", href: "#cookies" },
    { label: "Licenses", href: "#licenses" },
  ],
}

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
]

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-dark-lighter border-t border-dark-border">
      <div className="container-custom py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="flex items-center space-x-2 mb-4"
            >
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-2xl font-display font-bold gradient-text">
                FiGenie
              </span>
            </motion.div>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-gray-400 mb-6 max-w-xs"
            >
              Your AI-powered financial assistant, helping you make smarter money decisions every day.
            </motion.p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="flex space-x-4"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <social.icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={index}
            >
              <h3 className="font-semibold text-white mb-4 capitalize">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-dark-border"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2024 FiGenie. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">All systems operational</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </footer>
  )
}
