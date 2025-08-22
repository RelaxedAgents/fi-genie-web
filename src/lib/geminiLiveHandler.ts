import { GeminiAvatarController } from './avatarController'

export interface GeminiLiveConfig {
  apiKey: string
  phoneNumber: string
  onStateChange?: (state: GeminiLiveState) => void
  onError?: (error: Error) => void
  onTranscript?: (transcript: string) => void
}

export type GeminiLiveState = 'idle' | 'listening' | 'thinking' | 'speaking'

export class GeminiLiveHandler {
  private ws: WebSocket | null = null
  private avatarController: GeminiAvatarController | null = null
  private config: GeminiLiveConfig
  private state: GeminiLiveState = 'idle'
  private audioContext: AudioContext | null = null
  private audioQueue: ArrayBuffer[] = []
  private isProcessingAudio = false

  constructor(config: GeminiLiveConfig) {
    this.config = config
  }

  setAvatarController(controller: GeminiAvatarController) {
    this.avatarController = controller
  }

  async connect() {
    try {
      // Initialize audio context
      this.audioContext = new AudioContext({ sampleRate: 16000 })

      // Connect to Gemini Live WebSocket
      // In production, this would connect to the actual Gemini Live API
      // For now, we'll use a mock endpoint
      const wsUrl = `wss://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:streamGenerateContent?key=${this.config.apiKey}`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('Connected to Gemini Live')
        this.setState('idle')
        this.sendInitialConfig()
      }

      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        await this.handleMessage(data)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.config.onError?.(new Error('WebSocket connection error'))
      }

      this.ws.onclose = () => {
        console.log('Disconnected from Gemini Live')
        this.setState('idle')
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      this.config.onError?.(error as Error)
    }
  }

  private sendInitialConfig() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    const config = {
      setup: {
        model: "models/gemini-2.0-flash-exp",
        config: {
          responseModalities: ["AUDIO", "TEXT"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede"
              }
            }
          }
        },
        tools: [
          {
            googleSearch: {}
          },
          {
            functionDeclarations: [
              {
                name: "fetch_financial_data",
                description: "Fetch user's financial data",
                parameters: {
                  type: "object",
                  properties: {
                    dataType: {
                      type: "string",
                      enum: ["net_worth", "credit_report", "bank_transactions", "investments"]
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    }

    this.ws.send(JSON.stringify(config))
  }

  private async handleMessage(data: any) {
    // Handle different message types from Gemini Live
    if (data.type === 'audio') {
      await this.handleAudioData(data.audio)
    } else if (data.type === 'text') {
      this.handleTextResponse(data.text)
    } else if (data.type === 'function_call') {
      await this.handleFunctionCall(data.function)
    } else if (data.type === 'state') {
      this.handleStateChange(data.state)
    }
  }

  private async handleAudioData(audioData: string) {
    // Convert base64 audio to ArrayBuffer
    const audioBuffer = this.base64ToArrayBuffer(audioData)
    
    // Add to audio queue
    this.audioQueue.push(audioBuffer)
    
    // Process audio queue
    if (!this.isProcessingAudio) {
      this.processAudioQueue()
    }

    // Update avatar state
    if (this.avatarController) {
      this.avatarController.setState('speaking')
    }
  }

  private async processAudioQueue() {
    if (this.audioQueue.length === 0 || !this.avatarController) {
      this.isProcessingAudio = false
      return
    }

    this.isProcessingAudio = true
    const audioBuffer = this.audioQueue.shift()!

    // Stream audio to avatar
    const head = this.avatarController.getHead()
    if (head) {
      // Convert audio buffer to format expected by TalkingHead
      const pcmData = await this.convertToPCM(audioBuffer)
      
      // Stream audio with lip-sync
      head.streamAudio(pcmData)
    }

    // Continue processing queue
    setTimeout(() => this.processAudioQueue(), 100)
  }

  private handleTextResponse(text: string) {
    // Update transcript
    this.config.onTranscript?.(text)

    // Parse response for avatar control
    if (this.avatarController) {
      const response = this.avatarController.parseGeminiResponse({ text })
      
      // Update avatar mood and gestures
      if (response.mood) {
        this.avatarController.setMood(response.mood)
      }
      
      if (response.gesture) {
        this.avatarController.playGesture(response.gesture)
      }
    }
  }

  private async handleFunctionCall(functionData: any) {
    // Handle function calls for financial data
    if (functionData.name === 'fetch_financial_data') {
      // This would call the Finance MCP API
      const response = await this.fetchFinancialData(functionData.parameters)
      
      // Send response back to Gemini
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          functionResponse: {
            name: functionData.name,
            response: response
          }
        }))
      }
    }
  }

  private handleStateChange(state: string) {
    switch (state) {
      case 'listening':
        this.setState('listening')
        this.avatarController?.setState('listening')
        break
      case 'thinking':
        this.setState('thinking')
        this.avatarController?.setState('thinking')
        break
      case 'speaking':
        this.setState('speaking')
        this.avatarController?.setState('speaking')
        break
      default:
        this.setState('idle')
        this.avatarController?.setState('idle')
    }
  }

  private setState(state: GeminiLiveState) {
    this.state = state
    this.config.onStateChange?.(state)
  }

  async startListening() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    // Request microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)

      source.connect(processor)
      processor.connect(audioContext.destination)

      processor.onaudioprocess = (e) => {
        const audioData = e.inputBuffer.getChannelData(0)
        this.sendAudioData(audioData)
      }

      this.setState('listening')
    } catch (error) {
      console.error('Failed to access microphone:', error)
      this.config.onError?.(error as Error)
    }
  }

  private sendAudioData(audioData: Float32Array) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    // Convert Float32Array to base64
    const base64Audio = this.arrayBufferToBase64(audioData.buffer as ArrayBuffer)

    this.ws.send(JSON.stringify({
      audio: {
        data: base64Audio,
        mimeType: "audio/pcm;rate=16000"
      }
    }))
  }

  stopListening() {
    this.setState('idle')
    // Stop audio processing
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.audioQueue = []
    this.isProcessingAudio = false
  }

  private async fetchFinancialData(parameters: any): Promise<any> {
    // Mock implementation - would call actual Finance MCP API
    const mockData: Record<string, any> = {
      net_worth: {
        total: 1250000,
        assets: 1500000,
        liabilities: 250000
      }
    }
    
    return mockData[parameters.dataType as string] || {}
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private async convertToPCM(audioBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    // Convert audio to PCM format expected by TalkingHead
    // This is a simplified version - actual implementation would handle various formats
    return audioBuffer
  }
}
