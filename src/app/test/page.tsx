"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { setupTestUser } from "@/lib/testAuth"

export default function TestPage() {
  const router = useRouter()

  useEffect(() => {
    // Setup test user
    setupTestUser()
    
    // Navigate to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }, [router])

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Setting up test user...</h1>
        <p className="text-gray-400">You will be redirected to the dashboard shortly.</p>
      </div>
    </div>
  )
}
