// Mock phone numbers for demo sessions
export const MOCK_PHONE_NUMBERS = [
  '9876543210',
  '9876543211',
  '9876543212',
  '9876543213',
  '9876543214',
  '9876543215',
  '9876543216',
  '9876543217',
  '9876543218',
  '9876543219',
] as const;

// Voice assistant configuration
export const VOICE_ASSISTANT_CONFIG = {
  // Duration in seconds before showing dashboard button
  interactionDuration: 30,
  
  // Animation speeds
  waveAnimationSpeed: 2, // seconds per cycle
  pulseAnimationSpeed: 1.5, // seconds per pulse
  
  // Audio visualization
  audioSensitivity: 0.7,
  frequencyBands: 32,
  
  // States
  states: {
    IDLE: 'idle',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    SPEAKING: 'speaking',
    COMPLETE: 'complete',
  } as const,
} as const;

// Get a random mock phone number
export function getRandomMockPhoneNumber(): string {
  const randomIndex = Math.floor(Math.random() * MOCK_PHONE_NUMBERS.length);
  return MOCK_PHONE_NUMBERS[randomIndex];
}

// Session management
export interface SessionData {
  sessionId: string;
  phoneNumber: string;
  startTime: number;
}

export function createSession(): SessionData {
  return {
    sessionId: crypto.randomUUID(),
    phoneNumber: getRandomMockPhoneNumber(),
    startTime: Date.now(),
  };
}
