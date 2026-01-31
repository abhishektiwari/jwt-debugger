import * as jws from './useJwtHandler'
import { getKeyForAlgorithm } from './useSampleKeys'

function generateQuickGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Generate sample payload with standard JWT claims
function generateSamplePayload() {
  return {
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: 'jwt-debugger-app',
    iss: 'jwt-debugger',
    jti: generateQuickGuid()
  }
}

// Generate sample token for specific algorithm
async function generateSampleToken(algorithm = 'HS256') {
  // Handle null/undefined algorithm
  if (!algorithm) {
    algorithm = 'HS256'
  }
  
  const payload = generateSamplePayload()
  
  // Get the appropriate signing key for the algorithm
  const signingKey = getKeyForAlgorithm(algorithm, 'signing')
  
  return await jws.sign(algorithm, payload, signingKey)
}

// Initialize sample tokens asynchronously
let SAMPLE_TOKENS = {}

async function initializeSampleTokens() {
  SAMPLE_TOKENS = {
    // HMAC algorithms
    HS256: await generateSampleToken('HS256'),
    HS384: await generateSampleToken('HS384'),
    HS512: await generateSampleToken('HS512'),
    
    // RSA algorithms
    RS256: await generateSampleToken('RS256'),
    RS384: await generateSampleToken('RS384'),
    RS512: await generateSampleToken('RS512'),
    
    // PSS algorithms
    PS256: await generateSampleToken('PS256'),
    PS384: await generateSampleToken('PS384'),
    PS512: await generateSampleToken('PS512'),
    
    // ECDSA algorithms
    ES256: await generateSampleToken('ES256'),
    ES384: await generateSampleToken('ES384'),
    ES512: await generateSampleToken('ES512'),
    
    // None algorithm
    none: await generateSampleToken('none')
  }
  return SAMPLE_TOKENS
}

// Export the initialization function and getter
export { initializeSampleTokens }

// Function to get sample token for specific algorithm
export async function getSampleTokenForAlgorithm(algorithm) {
  if (!SAMPLE_TOKENS[algorithm]) {
    return await generateSampleToken(algorithm)
  }
  return SAMPLE_TOKENS[algorithm]
}

// Function to generate fresh token for algorithm
export async function generateFreshTokenForAlgorithm(algorithm) {
  return await generateSampleToken(algorithm)
}

// Function to get default sample JWT (HS256 for backward compatibility)
export async function getSampleJWT() {
  return await getSampleTokenForAlgorithm('HS256')
}

// Get initialized sample tokens
export function getInitializedSampleTokens() {
  return SAMPLE_TOKENS
}

export { generateSamplePayload }