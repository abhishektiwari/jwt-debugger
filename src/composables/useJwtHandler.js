// JWT Handler using jose package for browser-compatible JWT operations
import * as jose from 'jose'

// JWT decode function compatible with browser
export function decode(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null
    }
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    // Convert Uint8Array to string using TextDecoder
    const decoder = new TextDecoder()
    const headerBytes = jose.base64url.decode(parts[0])
    const payloadBytes = jose.base64url.decode(parts[1])
    
    const header = JSON.parse(decoder.decode(headerBytes))
    const payload = JSON.parse(decoder.decode(payloadBytes))
    const signature = parts[2]
    
    return {
      header,
      payload,
      signature
    }
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

// Async JWT signing function with real cryptographic signatures
export async function sign(algorithm, payload, key) {
  try {
    const encoder = new TextEncoder()
    
    // Handle 'none' algorithm specially
    if (algorithm === 'none') {
      const header = { alg: 'none', typ: 'JWT' }
      const headerEncoded = jose.base64url.encode(encoder.encode(JSON.stringify(header)))
      const payloadEncoded = jose.base64url.encode(encoder.encode(JSON.stringify(payload)))
      return `${headerEncoded}.${payloadEncoded}.`
    }

    // For HMAC algorithms using jose library
    if (algorithm.startsWith('HS')) {
      const secret = encoder.encode(key)
      
      // Use SignJWT for JWT creation (recommended approach)
      const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: algorithm, typ: 'JWT' })
        .setIssuedAt()
        .sign(secret)
      
      return jwt
    }

    // For asymmetric algorithms, use real cryptographic signatures
    if (algorithm.startsWith('RS') || algorithm.startsWith('PS') || algorithm.startsWith('ES')) {
      // Import the private key
      const privateKey = await jose.importPKCS8(key, algorithm)
      
      // Use SignJWT for JWT creation (recommended approach)
      const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: algorithm, typ: 'JWT' })
        .setIssuedAt()
        .sign(privateKey)
      
      return jwt
    }

    throw new Error(`Unsupported algorithm: ${algorithm}`)
  } catch (error) {
    console.error('JWT signing error:', error)
    throw new Error(`Failed to sign JWT with algorithm ${algorithm}: ${error.message}`)
  }
}

// Helper function to create HMAC tokens synchronously
function createHmacToken(header, payload, secret, algorithm) {
  // For testing purposes, create a simple hash-based signature
  const data = `${header}.${payload}`
  const hashLength = algorithm === 'HS256' ? 32 : algorithm === 'HS384' ? 48 : 64
  
  // Create a simple hash for demonstration (not cryptographically secure)
  let hash = 0
  for (let i = 0; i < data.length + secret.length; i++) {
    const char = i < data.length ? data.charCodeAt(i) : secret.charCodeAt(i - data.length)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Convert to base64url
  const encoder = new TextEncoder()
  const hashString = Math.abs(hash).toString().padStart(hashLength, '0')
  const signature = jose.base64url.encode(encoder.encode(hashString))
  return `${header}.${payload}.${signature}`
}

// Async JWT verification function with real cryptographic verification
export async function verify(token, algorithm, secretOrKey) {
  try {
    // Handle null/undefined inputs
    if (!token || !algorithm) {
      return false
    }

    // Handle 'none' algorithm
    if (algorithm === 'none') {
      return token.endsWith('.')
    }

    // For HMAC algorithms using jose library
    if (algorithm.startsWith('HS')) {
      const encoder = new TextEncoder()
      const secret = encoder.encode(secretOrKey)
      
      try {
        await jose.jwtVerify(token, secret, {
          algorithms: [algorithm]
        })
        return true
      } catch {
        return false
      }
    }

    // For asymmetric algorithms, use real cryptographic verification
    if (algorithm.startsWith('RS') || algorithm.startsWith('PS') || algorithm.startsWith('ES')) {
      try {
        // Import the public key
        const publicKey = await jose.importSPKI(secretOrKey, algorithm)
        
        // Verify the JWT
        await jose.jwtVerify(token, publicKey, {
          algorithms: [algorithm]
        })
        return true
      } catch {
        return false
      }
    }

    return false
  } catch (error) {
    console.error('JWT verification error:', error)
    return false
  }
}


// Additional utility functions for compatibility

// Get JWT header without verification
export function getHeader(token) {
  try {
    const decoded = decode(token)
    return decoded ? decoded.header : null
  } catch (error) {
    console.error('Error getting JWT header:', error)
    return null
  }
}

// Get JWT payload without verification
export function getPayload(token) {
  try {
    const decoded = decode(token)
    return decoded ? decoded.payload : null
  } catch (error) {
    console.error('Error getting JWT payload:', error)
    return null
  }
}

// Get JWT signature
export function getSignature(token) {
  try {
    const decoded = decode(token)
    return decoded ? decoded.signature : null
  } catch (error) {
    console.error('Error getting JWT signature:', error)
    return null
  }
}

// Validate JWT structure (3 parts separated by dots)
export function isValidJwtFormat(token) {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  const parts = token.split('.')
  return parts.length === 3
}

// Check if JWT is expired
export function isTokenExpired(token) {
  try {
    const payload = getPayload(token)
    if (!payload || !payload.exp) {
      return false // No expiration claim
    }
    
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true // Assume expired if we can't parse
  }
}

// Get algorithm from token header
export function getAlgorithm(token) {
  try {
    const header = getHeader(token)
    return header ? header.alg : null
  } catch (error) {
    console.error('Error getting algorithm from token:', error)
    return null
  }
}

// Create a JWT with custom claims
export async function createToken(algorithm, claims, key, options = {}) {
  try {
    const now = Math.floor(Date.now() / 1000)
    
    // Default payload with standard claims
    const payload = {
      iat: now,
      exp: now + (options.expiresIn || 3600), // Default 1 hour
      ...claims
    }
    
    return await sign(algorithm, payload, key)
  } catch (error) {
    console.error('Error creating token:', error)
    throw error
  }
}

// Validate token and return decoded data if valid
export async function validateAndDecode(token, algorithm, secretOrKey) {
  try {
    // First check format
    if (!isValidJwtFormat(token)) {
      return { valid: false, error: 'Invalid JWT format' }
    }
    
    // Decode to get header and payload
    const decoded = decode(token)
    if (!decoded) {
      return { valid: false, error: 'Failed to decode JWT' }
    }
    
    // Verify signature
    const isValid = await verify(token, algorithm, secretOrKey)
    if (!isValid) {
      return { valid: false, error: 'Invalid signature' }
    }
    
    // Check expiration
    const expired = isTokenExpired(token)
    
    return {
      valid: true,
      expired: expired,
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature
    }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// Export jose instance for advanced usage
export { jose }