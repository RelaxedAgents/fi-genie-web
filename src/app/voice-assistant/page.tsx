"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CleanVoiceAssistant } from "@/components/voice-assistant/CleanVoiceAssistant"
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader"
import { createSession } from "@/config/mockPhoneNumbers"
import { saveUser } from "@/lib/auth"
import { fetchDashboardData } from "@/lib/api/dashboardApi"
import { saveDashboardData, setApiStatus, clearDashboardData, clearApiStatus } from "@/lib/dashboardData"

export default function VoiceAssistantPage() {
  const router = useRouter()

  useEffect(() => {
    // Create a new session with mock phone number
    const session = createSession()
    
    // Save the mock phone number as authenticated user
    saveUser(session.phoneNumber)
    
    // Clear any existing dashboard data for a fresh start
    clearDashboardData()
    clearApiStatus()
    
    // Start fetching dashboard data in the background
    setApiStatus('loading')
    fetchDashboardData(session.phoneNumber)
      .then((data) => {
        saveDashboardData(data, session.phoneNumber)
        setApiStatus('success')
      })
      .catch((error) => {
        console.error('Failed to fetch dashboard data:', error)
        setApiStatus('error')
      })
  }, [])

  const handleNavigateToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <>
      <AuthenticatedHeader transparent={true} />
      <CleanVoiceAssistant onNavigateToDashboard={handleNavigateToDashboard} />
    </>
  )
}
