// Sample keys for different JWT algorithms using environment variables

// HMAC secrets of different lengths
const HMAC_SECRETS = {
  HS256: 'your-256-bit-secret',
  HS384: 'your-384-bit-secret-which-is-longer-than-hs256',
  HS512: 'your-512-bit-secret-which-is-much-longer-than-both-hs256-and-hs384-algorithms'
}

// Get keys from environment variables
const getEnvKey = (keyName) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[keyName]
  }
  return process.env[keyName]
}

// Real cryptographic keys from environment variables
export const SAMPLE_KEYS = {
  // HMAC secrets
  ...HMAC_SECRETS,
  
  // Real RSA keys from environment variables
  RS256_PRIVATE: getEnvKey('VITE_RSA_256_PRIVATE_KEY'),
  RS256_PUBLIC: getEnvKey('VITE_RSA_256_PUBLIC_KEY'),
  RS384_PRIVATE: getEnvKey('VITE_RS_384_PRIVATE_KEY'),
  RS384_PUBLIC: getEnvKey('VITE_RS_384_PUBLIC_KEY'),
  RS512_PRIVATE: getEnvKey('VITE_RS_512_PRIVATE_KEY'),
  RS512_PUBLIC: getEnvKey('VITE_RS_512_PUBLIC_KEY'),
  
  // Real PSS keys from environment variables
  PS256_PRIVATE: getEnvKey('VITE_PS_256_PRIVATE_KEY'),
  PS256_PUBLIC: getEnvKey('VITE_PS_256_PUBLIC_KEY'),
  PS384_PRIVATE: getEnvKey('VITE_PS_384_PRIVATE_KEY'),
  PS384_PUBLIC: getEnvKey('VITE_PS_384_PUBLIC_KEY'),
  PS512_PRIVATE: getEnvKey('VITE_PS_512_PRIVATE_KEY'),
  PS512_PUBLIC: getEnvKey('VITE_PS_512_PUBLIC_KEY'),
  
  // Real ECDSA keys from environment variables
  ES256_PRIVATE: getEnvKey('VITE_ES_256_PRIVATE_KEY'),
  ES256_PUBLIC: getEnvKey('VITE_ES_256_PUBLIC_KEY'),
  ES384_PRIVATE: getEnvKey('VITE_ES_384_PRIVATE_KEY'),
  ES384_PUBLIC: getEnvKey('VITE_ES_384_PUBLIC_KEY'),
  ES512_PRIVATE: getEnvKey('VITE_ES_512_PRIVATE_KEY'),
  ES512_PUBLIC: getEnvKey('VITE_ES_512_PUBLIC_KEY')
}

export function getKeyForAlgorithm(algorithm, keyType = 'signing') {
  // For HMAC algorithms, return the secret
  if (algorithm.startsWith('HS')) {
    return HMAC_SECRETS[algorithm] || 'default-hmac-secret'
  }
  
  // For asymmetric algorithms, get the appropriate key type
  let targetKeyType
  if (keyType === 'signing') {
    targetKeyType = 'private'
  } else if (keyType === 'display') {
    targetKeyType = 'public'
  } else {
    targetKeyType = 'public' // default to public for verification
  }
  
  // Get key from environment variables
  const keyName = `${algorithm}_${targetKeyType.toUpperCase()}`
  const envKey = SAMPLE_KEYS[keyName]
  
  if (envKey) {
    return envKey
  }
  
  // Fallback for missing keys
  return `${algorithm}-${targetKeyType}-key-placeholder`
}

export function getKeyTypeLabel(algorithm) {
  if (algorithm.startsWith('HS')) {
    return 'Secret'
  }
  return 'Public Key'
}

// Helper function to check if we have real keys for an algorithm
export function hasRealKeysForAlgorithm(algorithm) {
  if (algorithm.startsWith('HS')) {
    return true // HMAC always has secrets
  }
  
  // Check if environment variables contain the keys
  const privateKey = SAMPLE_KEYS[`${algorithm}_PRIVATE`]
  const publicKey = SAMPLE_KEYS[`${algorithm}_PUBLIC`]
  
  return !!(privateKey && publicKey && 
           privateKey !== `${algorithm}-private-key-placeholder` &&
           publicKey !== `${algorithm}-public-key-placeholder`)
}

// Get key info for debugging/testing
export function getKeyInfo(algorithm) {
  const hasReal = hasRealKeysForAlgorithm(algorithm)
  const keyType = getKeyTypeLabel(algorithm)
  const signingKey = getKeyForAlgorithm(algorithm, 'signing')
  const displayKey = getKeyForAlgorithm(algorithm, 'display')
  
  return {
    algorithm,
    hasRealKeys: hasReal,
    keyType,
    signingKey: signingKey.substring(0, 50) + '...', // truncated for display
    displayKey: displayKey.substring(0, 50) + '...', // truncated for display
    signingKeyLength: signingKey.length,
    displayKeyLength: displayKey.length
  }
}