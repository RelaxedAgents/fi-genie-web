"use client"

import { useState, useCallback, useEffect } from "react"
import { VOICE_ASSISTANT_CONFIG } from "@/config/mockPhoneNumbers"

export function useVoiceAssistant() {
  const [state, setState] = useState<string>(VOICE_ASSISTANT_CONFIG.states.IDLE)
  const [isActive, setIsActive] = useState(false)

  // Simulate voice interaction flow
  const simulateInteraction = useCallback(() => {
    // Start with listening
    setState(VOICE_ASSISTANT_CONFIG.states.LISTENING)
    
    // After 5 seconds, move to processing
    setTimeout(() => {
      setState(VOICE_ASSISTANT_CONFIG.states.PROCESSING)
      
      // After 3 seconds, move to speaking
      setTimeout(() => {
        setState(VOICE_ASSISTANT_CONFIG.states.SPEAKING)
        
        // After 5 seconds, complete
        setTimeout(() => {
          setState(VOICE_ASSISTANT_CONFIG.states.COMPLETE)
        }, 5000)
      }, 3000)
    }, 5000)
  }, [])

  const startInteraction = useCallback(() => {
    if (!isActive) {
      setIsActive(true)
      simulateInteraction()
    }
  }, [isActive, simulateInteraction])

  const stopInteraction = useCallback(() => {
    setIsActive(false)
    setState(VOICE_ASSISTANT_CONFIG.states.IDLE)
  }, [])

  // Cycle through states for demo purposes
  useEffect(() => {
    if (isActive && state === VOICE_ASSISTANT_CONFIG.states.COMPLETE) {
      // After completion, restart the cycle after 2 seconds
      const timeout = setTimeout(() => {
        simulateInteraction()
      }, 2000)
      
      return () => clearTimeout(timeout)
    }
  }, [isActive, state, simulateInteraction])

  return {
    state,
    isActive,
    startInteraction,
    stopInteraction,
  }
}
