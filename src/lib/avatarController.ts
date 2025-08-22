import { TalkingHead } from '@met4citizen/talkinghead'

export interface GeminiResponse {
  text: string
  mood?: string
  gesture?: string
  thinking?: boolean
  confidence?: number
}

export class GeminiAvatarController {
  private head: TalkingHead | null = null
  private isStreaming: boolean = false
  private currentMood: string = 'neutral'

  constructor(head: TalkingHead) {
    this.head = head
  }

  // Parse Gemini response for avatar control
  parseGeminiResponse(response: GeminiResponse) {
    return {
      text: response.text,
      mood: this.analyzeSentiment(response.text),
      gesture: this.detectGesture(response.text),
      eyeContact: this.shouldMakeEyeContact(response.text),
      thinking: response.thinking || false,
      confidence: response.confidence || 1.0
    }
  }

  // Analyze sentiment from text
  private analyzeSentiment(text: string): string {
    const positive = ['good', 'great', 'excellent', 'profit', 'growth', 'increase', 'success']
    const negative = ['bad', 'loss', 'decline', 'problem', 'risk', 'decrease', 'concern']
    const neutral = ['analysis', 'report', 'data', 'information', 'review']
    
    const lowerText = text.toLowerCase()
    
    if (positive.some(word => lowerText.includes(word))) {
      return 'happy'
    } else if (negative.some(word => lowerText.includes(word))) {
      return 'concerned'
    }
    return 'neutral'
  }

  // Detect appropriate gesture from text
  private detectGesture(text: string): string | null {
    const gestures: Record<string, string[]> = {
      'thumbup': ['excellent', 'great job', 'well done', 'perfect'],
      'index': ['important', 'note this', 'remember', 'key point'],
      'shrug': ['uncertain', 'maybe', 'not sure', 'possibly'],
      'ok': ['perfect', 'exactly', 'correct', 'right']
    }
    
    const lowerText = text.toLowerCase()
    
    for (const [gesture, triggers] of Object.entries(gestures)) {
      if (triggers.some(trigger => lowerText.includes(trigger))) {
        return gesture
      }
    }
    
    return null
  }

  // Determine if eye contact should be made
  private shouldMakeEyeContact(text: string): boolean {
    const importantPhrases = ['important', 'remember', 'note', 'key', 'critical', 'essential']
    return importantPhrases.some(phrase => text.toLowerCase().includes(phrase))
  }

  // Set avatar to idle state
  setIdleState() {
    if (!this.head) return
    
    this.head.setMood('neutral')
    this.head.stopGesture()
  }

  // Set avatar to listening state
  setListeningState() {
    if (!this.head) return
    
    this.head.setMood('attentive')
    this.head.makeEyeContact(5000)
  }

  // Set avatar to thinking state
  setThinkingState() {
    if (!this.head) return
    
    this.head.setMood('contemplative')
    this.head.playGesture('thinking', 3000)
    this.head.lookAhead(2000)
  }

  // Set avatar to speaking state with response
  setSpeakingState(response: GeminiResponse) {
    if (!this.head) return
    
    const parsed = this.parseGeminiResponse(response)
    
    // Set mood
    if (parsed.mood) {
      this.head.setMood(parsed.mood)
      this.currentMood = parsed.mood
    }
    
    // Play gesture if detected
    if (parsed.gesture) {
      this.head.playGesture(parsed.gesture, 2000)
    }
    
    // Make eye contact for important points
    if (parsed.eyeContact) {
      this.head.makeEyeContact(3000)
    }
    
    // Speak the text with lip-sync
    this.head.speakText(parsed.text)
  }

  // Handle streaming response
  startStream() {
    if (!this.head) return
    
    this.isStreaming = true
    this.head.streamStart(
      {},
      () => console.log('Audio stream started'),
      () => {
        console.log('Audio stream ended')
        this.isStreaming = false
      },
      (subtitle) => console.log('Subtitle:', subtitle)
    )
  }

  // Handle streaming chunk
  handleStreamChunk(chunk: { content?: string; audio?: ArrayBuffer }) {
    if (!this.head || !this.isStreaming) return
    
    // Process partial response
    if (chunk.content) {
      const commands = this.parseGeminiResponse({ text: chunk.content })
      
      // Update mood immediately if sentiment changes
      if (commands.mood !== this.currentMood) {
        this.head.setMood(commands.mood)
        this.currentMood = commands.mood
      }
    }
    
    // Stream audio if available
    if (chunk.audio) {
      this.head.streamAudio(chunk.audio)
    }
  }

  // End streaming
  endStream() {
    if (!this.head) return
    
    this.isStreaming = false
    this.head.streamStop()
  }

  // Start listening with microphone
  async startListening() {
    if (!this.head) return
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      
      this.head.startListening(
        analyser,
        {
          listeningSilenceThresholdLevel: 40,
          listeningActiveThresholdLevel: 90
        },
        (state) => {
          if (state === 'start') {
            console.log('User started speaking')
          } else if (state === 'stop') {
            console.log('User stopped speaking')
          }
        }
      )
      
      return stream
    } catch (error) {
      console.error('Error accessing microphone:', error)
      throw error
    }
  }

  // Stop all activities
  stop() {
    if (!this.head) return
    
    this.head.stop()
    this.isStreaming = false
  }

  // Get the TalkingHead instance
  getHead(): TalkingHead | null {
    return this.head
  }

  // Set the current state
  setState(state: 'idle' | 'listening' | 'thinking' | 'speaking') {
    switch (state) {
      case 'idle':
        this.setIdleState()
        break
      case 'listening':
        this.setListeningState()
        break
      case 'thinking':
        this.setThinkingState()
        break
      case 'speaking':
        // Speaking state is handled separately with response data
        break
    }
  }

  // Set mood
  setMood(mood: string) {
    if (!this.head) return
    this.head.setMood(mood)
    this.currentMood = mood
  }

  // Play gesture
  playGesture(gesture: string, duration: number = 2000) {
    if (!this.head) return
    this.head.playGesture(gesture, duration)
  }
}
