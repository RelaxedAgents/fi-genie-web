export interface Avatar {
  id: string;
  emoji?: string;
  gradient?: string;
  label: string;
}

export const avatars: Avatar[] = [
  // Emoji avatars
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'brain', emoji: '🧠', label: 'Brain' },
  
  // Gradient avatars
  { 
    id: 'gradient-1', 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    label: 'Purple Wave'
  },
  { 
    id: 'gradient-2', 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    label: 'Pink Sunset'
  },
  { 
    id: 'gradient-3', 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    label: 'Ocean Blue'
  },
];

export const defaultAvatar = avatars[5]; // First gradient as default
