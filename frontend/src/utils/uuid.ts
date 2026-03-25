import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID v4 using expo-crypto
 * This is compatible with React Native/Expo Go environments
 * where crypto.getRandomValues() is not available
 * 
 * IMPORTANT: This is an ASYNC function - must be awaited!
 */
export async function generateUUID(): Promise<string> {
  try {
    // Generate 16 random bytes using the async version for better compatibility
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    
    // Convert Uint8Array to regular array for manipulation
    const bytes = Array.from(randomBytes);
    
    // Set version (4) and variant (RFC4122) bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC4122
    
    // Convert to hex string with dashes
    const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  } catch (error) {
    console.error('[UUID] Failed to generate UUID with expo-crypto:', error);
    // Fallback to timestamp-based UUID (less random but functional)
    return generateFallbackUUID();
  }
}

/**
 * Fallback UUID generator using timestamp and Math.random
 * Used only if expo-crypto fails
 */
function generateFallbackUUID(): string {
  const timestamp = Date.now().toString(16);
  const randomPart = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  
  return `${timestamp.slice(-8)}-${randomPart()}-4${randomPart().slice(1)}-${(0x8 | Math.floor(Math.random() * 4)).toString(16)}${randomPart().slice(1)}-${randomPart()}${randomPart()}${randomPart()}`;
}

// Synchronous version using fallback (for cases where async isn't possible)
export function generateUUIDSync(): string {
  return generateFallbackUUID();
}
