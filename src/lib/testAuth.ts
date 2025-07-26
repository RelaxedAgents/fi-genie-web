// Test authentication setup
import { saveUser, updateUserProfile } from './auth'

export function setupTestUser() {
  const phone = '9999999999'
  const username = 'TestUser'
  const avatar = 'avatar-1' // This should match one of the avatar IDs in avatars.ts
  
  // First save the user with phone number
  saveUser(phone)
  
  // Then update their profile with username and avatar
  updateUserProfile(username, avatar)
  
  console.log('Test user created:', { phone, username, avatar })
}
