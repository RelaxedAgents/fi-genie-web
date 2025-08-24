// Mock phone numbers for demo sessions
export const MOCK_PHONE_NUMBERS = [
  '1111111111',
  '2222222222',
  '3333333333',
  '4444444444',
  '5555555555',
  '6666666666',
  '7777777777',
  '8888888888',
  '9999999999',
  '1010101010',
  '1212121212',
  '1313131313',
  '1414141414',
  '2020202020',
  '2121212121',
  '2525252525'
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
