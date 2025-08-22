"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface TalkingHeadAvatarProps {
  onLoad?: (head: any) => void
  onError?: (error: Error) => void
  className?: string
}

// Avatar states
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'

// Dynamic component to handle TalkingHead initialization
const TalkingHeadContainer = ({ onLoad, onError, className }: TalkingHeadAvatarProps) => {
  const avatarRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && avatarRef.current) {
      initTalkingHead()
    }

    return () => {
      // Cleanup
      if (headRef.current) {
        try {
          headRef.current.stop()
        } catch (e) {
          console.error('Error stopping TalkingHead:', e)
        }
      }
    }
  }, [])

  const initTalkingHead = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Set a timeout for the entire initialization
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Avatar loading timeout')), 15000) // 15 second timeout
      })

      const initPromise = async () => {
        // Import TalkingHead
        const { TalkingHead } = await import('@met4citizen/talkinghead')
        
        if (!avatarRef.current) return

        // Initialize TalkingHead with proper configuration
        const head = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "/api/gtts/",
          lipsyncModules: [], // Disable dynamic loading for now
          avatarMood: 'neutral',
          lipsyncLang: 'en',
          ttsLang: "en-US",
          ttsVoice: "en-US-Standard-A",
          modelFPS: 30,
          cameraView: 'upper',
          lightAmbientIntensity: 1.2,
          lightDirectIntensity: 0.8
        })

        // Load local avatar file
        await head.showAvatar({
          url: '/avatars/brunette.glb',
          body: 'F',
          avatarMood: 'neutral',
          ttsLang: "en-US",
          ttsVoice: "en-US-Standard-C",
          lipsyncLang: 'en'
        })
        console.log('Avatar loaded successfully')

        headRef.current = head
        return head
      }

      // Race between initialization and timeout
      const head = await Promise.race([initPromise(), timeoutPromise])
      
      setIsLoading(false)
      
      if (onLoad && head) {
        onLoad(head)
      }
    } catch (err) {
      console.error('Error initializing TalkingHead:', err)
      setError('Failed to load 3D avatar. Using voice orb instead.')
      setIsLoading(false)
      
      if (onError) {
        onError(err as Error)
      }
    }
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading avatar...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
          <div className="text-center">
            <p className="text-sm text-red-400 mb-2">{error}</p>
            <button 
              onClick={initTalkingHead}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Avatar container */}
      <div 
        ref={avatarRef} 
        className="w-full h-full rounded-2xl overflow-hidden bg-black/10"
        style={{ minHeight: '300px', maxHeight: '500px' }}
      />
    </div>
  )
}

// Dynamic import wrapper to avoid SSR issues
const TalkingHeadAvatar = dynamic<TalkingHeadAvatarProps>(
  () => Promise.resolve(TalkingHeadContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
)

export default TalkingHeadAvatar
