import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID v4 using expo-crypto
 * This is compatible with React Native/Expo Go environments
 * where crypto.getRandomValues() is not available
 */
export function generateUUID(): string {
  // Generate 16 random bytes
  const randomBytes = Crypto.getRandomBytes(16);
  
  // Set version (4) and variant (RFC4122) bits
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // Version 4
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // Variant RFC4122
  
  // Convert to hex string with dashes
  const hex = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Alias for compatibility with uuid library
export const uuidv4 = generateUUID;
