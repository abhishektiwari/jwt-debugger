import * as jws from './useJwtHandler'
import axios from 'axios'
import jwktopem from './useJwkHandler'
import qs from 'qs'
import { ref, computed } from 'vue'
import { getSampleTokenForAlgorithm, generateFreshTokenForAlgorithm, getSampleJWT } from './useSampleToken'
import { getKeyForAlgorithm, getKeyTypeLabel } from './useSampleKeys'

function generateQuickGuid() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  )
}

export function useTokenValidation() {
  const token = ref('')
  const jwksUri = ref(null)
  const isValidToken = ref(false)
  const expiredToken = ref(false)
  const hasValidSignature = ref(false)
  const tokenPayload = ref(false)
  const tokenHeader = ref(false)
  const jwksKeys = ref([])
  const hasJwksKey = ref(false)
  const signingAlg = ref('HS256')
  const signingKey = ref('')
  const hmacAlg = ['HS256', 'HS384', 'HS512']
  const rsaAlg = ['RS256', 'RS384', 'RS512']
  const ecdsaAlg = ['ES256', 'ES384', 'ES512']
  const pssAlg = ['PS256', 'PS384', 'PS512']
  const asymmetricAlg = [...rsaAlg, ...ecdsaAlg, ...pssAlg]
  const allSupportedAlg = [...hmacAlg, ...asymmetricAlg, 'none']

  const hasHmacAlg = computed(() => {
    return hmacAlg.includes(signingAlg.value)
  })

  const hasAsymmetricAlg = computed(() => {
    return asymmetricAlg.includes(signingAlg.value)
  })

  const isRsaAlg = computed(() => {
    return rsaAlg.includes(signingAlg.value)
  })

  const isEcdsaAlg = computed(() => {
    return ecdsaAlg.includes(signingAlg.value)
  })

  const isPssAlg = computed(() => {
    return pssAlg.includes(signingAlg.value)
  })

  const isNoneAlg = computed(() => {
    return signingAlg.value === 'none'
  })

  const keyTypeLabel = computed(() => {
    return getKeyTypeLabel(signingAlg.value)
  })

  async function generateTokenForAlgorithm(algorithm) {
    // Use existing sample token if available, otherwise generate fresh one
    const token = await getSampleTokenForAlgorithm(algorithm)
    
    // Set appropriate signing key for display
    const displayKey = getKeyForAlgorithm(algorithm, 'display')
    signingKey.value = displayKey
    
    return token
  }

  async function generateFreshToken(algorithm) {
    const freshToken = await generateFreshTokenForAlgorithm(algorithm)
    
    // Set appropriate signing key for display
    const displayKey = getKeyForAlgorithm(algorithm, 'display')
    signingKey.value = displayKey
    
    return freshToken
  }

  async function onAlgorithmChange() {
    if (signingAlg.value) {
      token.value = await generateTokenForAlgorithm(signingAlg.value)
      await parseJwtToken()
    }
  }

  async function initialToken() {
    if (window.location.hash) {
      var params = qs.parse(location.hash.replace(/(#!?[^#]+)?#/, '?'), {
        ignoreQueryPrefix: true
      })
      for (const [key, value] of Object.entries(params)) {
        if (key === 'token') {
          token.value = value
          await parseJwtToken()
        }
        if (key === 'jwks') {
          jwksUri.value = value
          getJwksKeys()
        }
      }
      window.location.hash = ''
    }
    if (!token.value) {
      // Initialize with default algorithm if not set
      if (!signingAlg.value) {
        signingAlg.value = 'HS256'
      }
      
      // Set default signing key based on algorithm
      if (!signingKey.value) {
        signingKey.value = getKeyForAlgorithm(signingAlg.value, 'display')
      }
      
      hasJwksKey.value = false
      token.value = await getSampleTokenForAlgorithm(signingAlg.value)
      await parseJwtToken()
      await validateTokenUsingSigningKey()
      hasJwksKey.value = false
    }
  }

  async function getJwksKeys() {
    let response
    let keys
    try {
      if (jwksUri.value) {
        response = await axios.get(jwksUri.value)
        keys = response.data.keys
        if (!keys || !keys.length) {
          console.error('No public keys found')
          hasJwksKey.value = false
        } else {
          jwksKeys.value = keys
          hasJwksKey.value = true
          await parseJwtToken()
        }
      } else {
        console.log('JWKS URI is blank or null')
        jwksKeys.value = []
        hasJwksKey.value = false
        await parseJwtToken()
      }
    } catch (error) {
      throw error
    }
  }

  async function parseJwtToken() {
    if (token.value) {
      isValidToken.value = false
      try {
        const decoded = jws.decode(token.value)
        tokenHeader.value = decoded.header
        if (typeof decoded.payload === 'object') {
          tokenPayload.value = decoded.payload
        } else {
          tokenPayload.value = JSON.parse(decoded.payload)
        }
        if (tokenHeader.value && tokenPayload.value) {
          signingAlg.value = tokenHeader.value.alg
          if (jwksKeys.value.length > 0 && !isValidToken.value) {
            await validateTokenUsingJwksKey()
          }
          if (signingKey.value && !isValidToken.value) {
            await validateTokenUsingSigningKey()
          }
        } else {
          tokenPayload.value = false
          tokenHeader.value = false
          isValidToken.value = false
          signingAlg.value = ''
        }
      } catch (error) {
        tokenPayload.value = false
        tokenHeader.value = false
        isValidToken.value = false
        signingAlg.value = ''
      }
    } else {
      token.value = ''
      tokenPayload.value = false
      tokenHeader.value = false
      isValidToken.value = false
      signingAlg.value = ''
    }
  }

  async function parseSecret() {
    await validateTokenUsingSigningKey()
  }

  async function validateTokenUsingJwksKey() {
    try {
      const key = jwksKeys.value.find(key => key.kid === tokenHeader.value.kid)
      if (key) {
        isValidToken.value = await jws.verify(
          token.value,
          signingAlg.value,
          jwktopem(key)
        )
      } else {
        console.log('No matching JSON key found')
        isValidToken.value = false
      }
    } catch (error) {
      console.error(error)
      isValidToken.value = false
    }
  }

  async function validateTokenUsingSigningKey() {
    try {
      if (!signingKey.value && !isNoneAlg.value) {
        console.log('No signing key found')
        isValidToken.value = false
        return
      }

      // For 'none' algorithm, no signature verification needed
      if (isNoneAlg.value) {
        isValidToken.value = token.value.endsWith('.')
        return
      }

      // Get the appropriate key for verification
      let verificationKey = signingKey.value
      
      // For HMAC algorithms, use the secret directly
      if (hasHmacAlg.value) {
        verificationKey = getKeyForAlgorithm(signingAlg.value, 'signing')
      }
      // For asymmetric algorithms, use the provided key (should be public key for verification)
      else if (hasAsymmetricAlg.value) {
        verificationKey = signingKey.value
      }

      isValidToken.value = await jws.verify(
        token.value,
        signingAlg.value,
        verificationKey
      )
    } catch (error) {
      console.error('Token validation error:', error)
      isValidToken.value = false
    }
  }

  return {
    token,
    jwksUri,
    isValidToken,
    expiredToken,
    hasValidSignature,
    tokenPayload,
    tokenHeader,
    jwksKeys,
    hasJwksKey,
    signingAlg,
    signingKey,
    hasHmacAlg,
    hasAsymmetricAlg,
    isRsaAlg,
    isEcdsaAlg,
    isPssAlg,
    isNoneAlg,
    keyTypeLabel,
    initialToken,
    getJwksKeys,
    parseJwtToken,
    parseSecret,
    validateTokenUsingJwksKey,
    validateTokenUsingSigningKey,
    onAlgorithmChange,
    generateTokenForAlgorithm,
    generateFreshToken
  }
}