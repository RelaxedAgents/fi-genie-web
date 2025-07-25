"use client"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ParticleBackground } from "@/components/effects/ParticleBackground"
import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  )
}
