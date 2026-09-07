/**
 * Generate a high-entropy cryptographic code verifier string.
 */
export function generateCodeVerifier(length = 64): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  let result = ""
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const values = new Uint8Array(length)
    crypto.getRandomValues(values)
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length]
    }
    return result
  }
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64")
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * Generate a SHA-256 code challenge from a code verifier (base64url encoded).
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
    const hash = await crypto.subtle.digest("SHA-256", data)
    return base64UrlEncode(hash)
  }
  // Node.js fallback
  try {
    const nodeCrypto = require("crypto")
    const hash = nodeCrypto.createHash("sha256").update(verifier).digest()
    return base64UrlEncode(hash)
  } catch {
    throw new Error("Cryptographic subtle digest is not available in current environment")
  }
}

/**
 * Generate random state string to prevent CSRF.
 */
export function generateState(length = 32): string {
  return generateCodeVerifier(length)
}

/**
 * Validates whether state received matches stored state.
 */
export function validateState(storedState?: string | null, receivedState?: string | null): boolean {
  if (!storedState || !receivedState) return false
  return storedState === receivedState
}
