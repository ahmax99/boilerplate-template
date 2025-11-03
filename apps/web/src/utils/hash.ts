import { base64url } from 'jose'

/**
 * Generates a SHA-256 hash of the input data and returns it as a base64url-encoded string.
 * This is a general-purpose hashing function suitable for:
 * - Generating stable keys for React components
 * - Creating fingerprints for data objects
 * - Authentication tokens and signatures
 *
 * @param data - The data to hash. Can be any JSON-serializable value.
 * @returns A base64url-encoded SHA-256 hash string
 *
 * @example
 * ```ts
 * const hash1 = await hashData({ id: 1, name: 'John' })
 * const hash2 = await hashData([1, 2, 3])
 * const hash3 = await hashData('some string')
 * ```
 */
export async function hashData(data: unknown): Promise<string> {
  const jsonString = JSON.stringify(data)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(jsonString)

  // Use Web Crypto API for SHA-256 hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)

  // Convert to base64url for URL-safe string representation
  return base64url.encode(new Uint8Array(hashBuffer))
}

/**
 * Synchronous version of hashData using a simple hash algorithm.
 * Use this when you need synchronous hashing (e.g., in React Server Components).
 * Note: This is NOT cryptographically secure - use hashData() for security-sensitive operations.
 *
 * @param data - The data to hash. Can be any JSON-serializable value.
 * @returns A hexadecimal hash string
 *
 * @example
 * ```ts
 * const hash = hashDataSync({ id: 1, name: 'John' })
 * ```
 */
export function hashDataSync(data: unknown): string {
  const jsonString = JSON.stringify(data)
  let hash = 0

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.codePointAt(i) ?? 0
    hash = (hash << 5) - hash + char
    hash = hash >>> 0 // Convert to 32-bit integer
  }

  // Convert to hexadecimal and ensure positive value
  return Math.abs(hash).toString(16)
}

/**
 * Generates a cryptographically secure random token.
 * Useful for:
 * - Session tokens
 * - CSRF tokens
 * - API keys
 * - Nonces
 *
 * @param byteLength - The length of the random token in bytes (default: 32)
 * @returns A base64url-encoded random token
 *
 * @example
 * ```ts
 * const sessionToken = generateSecureToken()
 * const csrfToken = generateSecureToken(16)
 * ```
 */
export function generateSecureToken(byteLength = 32): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(byteLength))
  return base64url.encode(randomBytes)
}
