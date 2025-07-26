// Auth utilities for FiGenie

interface UserData {
  user: {
    id: string;
    phone: string;
    username?: string;
    avatar?: string;
    isAuthenticated: boolean;
    metadata: {
      lastLogin: string;
      loginCount: number;
      deviceInfo?: string;
    };
  };
}

const AUTH_STORAGE_KEY = 'figenie_auth';

// Validate mobile number (any 10 digits)
export const isValidIndianMobile = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return /^\d{10}$/.test(cleaned);
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return cleaned;
};

// Get stored user data
export const getStoredUser = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading auth data:', error);
    return null;
  }
};

// Check if user exists with phone number
export const getUserByPhone = (phone: string): UserData | null => {
  const storedData = getStoredUser();
  if (storedData && storedData.user.phone === phone) {
    return storedData;
  }
  return null;
};

// Create or update user
export const saveUser = (phone: string, existingId?: string): UserData => {
  const now = new Date().toISOString();
  const existingUser = getUserByPhone(phone);
  
  const userData: UserData = {
    user: {
      id: existingId || existingUser?.user.id || crypto.randomUUID(),
      phone: phone,
      isAuthenticated: true,
      metadata: {
        lastLogin: now,
        loginCount: (existingUser?.user.metadata.loginCount || 0) + 1,
        deviceInfo: navigator.userAgent,
      },
    },
  };
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  return userData;
};

// Clear auth data
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const userData = getStoredUser();
  return userData?.user.isAuthenticated || false;
};

// Get current user
export const getCurrentUser = () => {
  const userData = getStoredUser();
  return userData?.user || null;
};

// Update user profile (username and avatar)
export const updateUserProfile = (username: string, avatar: string): void => {
  const userData = getStoredUser();
  if (userData) {
    userData.user.username = username;
    userData.user.avatar = avatar;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  }
};

// Logout user
export const logout = (): void => {
  clearAuth();
};

// Get avatar by ID
export const getAvatarById = (avatarId: string) => {
  // Import avatars from data
  const { avatars } = require('@/data/avatars');
  return avatars.find((avatar: any) => avatar.id === avatarId) || null;
};
