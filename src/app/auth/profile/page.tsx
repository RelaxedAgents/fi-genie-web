"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { UsernameForm } from "@/components/auth/UsernameForm"
import { getCurrentUser } from "@/lib/auth"

export default function ProfileSetupPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    
    // If user already has username, redirect to dashboard
    if (user.username) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <AuthLayout title="Create Your Profile">
      <UsernameForm />
    </AuthLayout>
  )
}
