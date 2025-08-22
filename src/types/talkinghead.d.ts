declare module '@met4citizen/talkinghead' {
  export interface TalkingHeadConfig {
    ttsEndpoint?: string
    lipsyncModules?: string[]
    avatarMood?: string
    mixerGainSpeech?: number
    lipsyncLang?: string
    ttsLang?: string
    ttsVoice?: string
    modelFPS?: number
    cameraView?: string
    lightAmbientIntensity?: number
    lightDirectIntensity?: number
  }

  export interface AvatarConfig {
    url: string
    body?: string
    avatarMood?: string
    ttsLang?: string
    ttsVoice?: string
    lipsyncLang?: string
  }

  export interface GestureOptions {
    duration?: number
    delay?: number
  }

  export class TalkingHead {
    constructor(container: HTMLElement, config?: TalkingHeadConfig)
    
    showAvatar(config: AvatarConfig): Promise<void>
    speakText(text: string, options?: any): void
    setMood(mood: string): void
    playGesture(gesture: string, duration?: number): void
    makeEyeContact(duration: number): void
    lookAhead(duration: number): void
    stopGesture(): void
    stop(): void
    
    streamStart(options: any, onStart: () => void, onEnd: () => void, onSubtitle: (subtitle: string) => void): void
    streamAudio(audio: ArrayBuffer): void
    streamStop(): void
    
    startListening(analyser: AnalyserNode, options: any, callback: (state: 'start' | 'stop') => void): void
  }
}
