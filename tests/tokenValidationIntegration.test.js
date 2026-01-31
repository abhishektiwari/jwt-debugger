import { describe, it, expect, beforeEach } from 'vitest'
import { useTokenValidation } from '../src/composables/useTokenValidation.js'
import { generateFreshTokenForAlgorithm } from '../src/composables/useSampleToken.js'
import { getKeyForAlgorithm, hasRealKeysForAlgorithm } from '../src/composables/useSampleKeys.js'
import * as jwtHandler from '../src/composables/useJwtHandler.js'

describe('Token Validation Integration with Real Implementation', () => {
  let tokenValidation

  beforeEach(() => {
    tokenValidation = useTokenValidation()
  })

  describe('Token Parsing and Algorithm Detection', () => {
    it('should parse HMAC tokens and detect algorithm correctly', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      tokenValidation.token.value = token
      await tokenValidation.parseJwtToken()

      expect(tokenValidation.tokenHeader.value).toBeDefined()
      expect(tokenValidation.tokenHeader.value.alg).toBe(algorithm)
      expect(tokenValidation.tokenHeader.value.typ).toBe('JWT')
      expect(tokenValidation.tokenPayload.value).toBeDefined()
      expect(tokenValidation.tokenPayload.value.sub).toBe('1234567890')
      expect(tokenValidation.signingAlg.value).toBe(algorithm)
    })

    it('should parse asymmetric tokens when available', async () => {
      const algorithms = ['RS256', 'ES256', 'PS256']
      
      for (const algorithm of algorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          
          tokenValidation.token.value = token
          await tokenValidation.parseJwtToken()

          expect(tokenValidation.tokenHeader.value.alg).toBe(algorithm)
          expect(tokenValidation.signingAlg.value).toBe(algorithm)
          expect(tokenValidation.tokenPayload.value.sub).toBe('1234567890')
        }
      }
    })

    it('should parse none algorithm tokens', async () => {
      const token = await generateFreshTokenForAlgorithm('none')
      
      tokenValidation.token.value = token
      await tokenValidation.parseJwtToken()

      expect(tokenValidation.tokenHeader.value.alg).toBe('none')
      expect(tokenValidation.signingAlg.value).toBe('none')
      expect(tokenValidation.tokenPayload.value.sub).toBe('1234567890')
    })
  })

  describe('Algorithm Family Detection', () => {
    it('should detect HMAC algorithms correctly', async () => {
      const hmacAlgorithms = ['HS256', 'HS384', 'HS512']
      
      for (const algorithm of hmacAlgorithms) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        
        tokenValidation.token.value = token
        await tokenValidation.parseJwtToken()

        expect(tokenValidation.hasHmacAlg.value).toBe(true)
        expect(tokenValidation.hasAsymmetricAlg.value).toBe(false)
        expect(tokenValidation.isNoneAlg.value).toBe(false)
        expect(tokenValidation.keyTypeLabel.value).toBe('Secret')
      }
    })

    it('should detect RSA algorithms correctly when available', async () => {
      const rsaAlgorithms = ['RS256', 'RS384', 'RS512']
      
      for (const algorithm of rsaAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          
          tokenValidation.token.value = token
          await tokenValidation.parseJwtToken()

          expect(tokenValidation.hasHmacAlg.value).toBe(false)
          expect(tokenValidation.hasAsymmetricAlg.value).toBe(true)
          expect(tokenValidation.isRsaAlg.value).toBe(true)
          expect(tokenValidation.isEcdsaAlg.value).toBe(false)
          expect(tokenValidation.isPssAlg.value).toBe(false)
          expect(tokenValidation.keyTypeLabel.value).toBe('Public Key')
        }
      }
    })

    it('should detect ECDSA algorithms correctly when available', async () => {
      const ecdsaAlgorithms = ['ES256', 'ES384', 'ES512']
      
      for (const algorithm of ecdsaAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          
          tokenValidation.token.value = token
          await tokenValidation.parseJwtToken()

          expect(tokenValidation.hasHmacAlg.value).toBe(false)
          expect(tokenValidation.hasAsymmetricAlg.value).toBe(true)
          expect(tokenValidation.isRsaAlg.value).toBe(false)
          expect(tokenValidation.isEcdsaAlg.value).toBe(true)
          expect(tokenValidation.isPssAlg.value).toBe(false)
          expect(tokenValidation.keyTypeLabel.value).toBe('Public Key')
        }
      }
    })

    it('should detect PSS algorithms correctly when available', async () => {
      const pssAlgorithms = ['PS256', 'PS384', 'PS512']
      
      for (const algorithm of pssAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          
          tokenValidation.token.value = token
          await tokenValidation.parseJwtToken()

          expect(tokenValidation.hasHmacAlg.value).toBe(false)
          expect(tokenValidation.hasAsymmetricAlg.value).toBe(true)
          expect(tokenValidation.isRsaAlg.value).toBe(false)
          expect(tokenValidation.isEcdsaAlg.value).toBe(false)
          expect(tokenValidation.isPssAlg.value).toBe(true)
          expect(tokenValidation.keyTypeLabel.value).toBe('Public Key')
        }
      }
    })

    it('should detect none algorithm correctly', async () => {
      const token = await generateFreshTokenForAlgorithm('none')
      
      tokenValidation.token.value = token
      await tokenValidation.parseJwtToken()

      expect(tokenValidation.hasHmacAlg.value).toBe(false)
      expect(tokenValidation.hasAsymmetricAlg.value).toBe(false)
      expect(tokenValidation.isNoneAlg.value).toBe(true)
      expect(tokenValidation.keyTypeLabel.value).toBe('Public Key')
    })
  })

  describe('Token Validation with Real Keys', () => {
    it('should validate HMAC tokens with correct secrets', async () => {
      const hmacAlgorithms = ['HS256', 'HS384', 'HS512']
      
      for (const algorithm of hmacAlgorithms) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const displayKey = getKeyForAlgorithm(algorithm, 'display')
        
        tokenValidation.token.value = token
        tokenValidation.signingKey.value = displayKey
        tokenValidation.signingAlg.value = algorithm
        
        await tokenValidation.parseJwtToken()
        await tokenValidation.validateTokenUsingSigningKey()

        expect(tokenValidation.isValidToken.value).toBe(true)
      }
    })

    it('should validate asymmetric tokens when keys are available', async () => {
      const asymmetricAlgorithms = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512', 'ES256', 'ES384', 'ES512']
      
      for (const algorithm of asymmetricAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          const publicKey = getKeyForAlgorithm(algorithm, 'display')
          
          tokenValidation.token.value = token
          tokenValidation.signingKey.value = publicKey
          tokenValidation.signingAlg.value = algorithm
          
          await tokenValidation.parseJwtToken()
          await tokenValidation.validateTokenUsingSigningKey()

          expect(tokenValidation.isValidToken.value).toBe(true)
        }
      }
    })

    it('should validate none algorithm tokens', async () => {
      const token = await generateFreshTokenForAlgorithm('none')
      
      tokenValidation.token.value = token
      tokenValidation.signingKey.value = ''
      tokenValidation.signingAlg.value = 'none'
      
      await tokenValidation.parseJwtToken()
      await tokenValidation.validateTokenUsingSigningKey()

      expect(tokenValidation.isValidToken.value).toBe(true)
    })

    it('should fail validation with wrong HMAC secrets', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      tokenValidation.token.value = token
      tokenValidation.signingKey.value = 'wrong-secret'
      tokenValidation.signingAlg.value = algorithm
      
      await tokenValidation.parseJwtToken()
      await tokenValidation.validateTokenUsingSigningKey()

      expect(tokenValidation.isValidToken.value).toBe(false)
    })
  })

  describe('Algorithm Change Integration', () => {
    it('should generate new tokens when algorithm changes', async () => {
      // Start with HS256
      tokenValidation.signingAlg.value = 'HS256'
      await tokenValidation.onAlgorithmChange()
      
      const firstToken = tokenValidation.token.value
      expect(firstToken).toBeDefined()
      
      const firstDecoded = jwtHandler.decode(firstToken)
      expect(firstDecoded.header.alg).toBe('HS256')
      
      // Change to HS384
      tokenValidation.signingAlg.value = 'HS384'
      await tokenValidation.onAlgorithmChange()
      
      const secondToken = tokenValidation.token.value
      expect(secondToken).toBeDefined()
      expect(secondToken).not.toBe(firstToken)
      
      const secondDecoded = jwtHandler.decode(secondToken)
      expect(secondDecoded.header.alg).toBe('HS384')
    })

    it('should update signing key when algorithm changes', async () => {
      // Start with HS256
      tokenValidation.signingAlg.value = 'HS256'
      await tokenValidation.onAlgorithmChange()
      
      const hs256Key = tokenValidation.signingKey.value
      expect(hs256Key).toBeDefined()
      
      // Change to HS512
      tokenValidation.signingAlg.value = 'HS512'
      await tokenValidation.onAlgorithmChange()
      
      const hs512Key = tokenValidation.signingKey.value
      expect(hs512Key).toBeDefined()
      expect(hs512Key).not.toBe(hs256Key) // Different key for different algorithm
    })
  })

  describe('Token Generation Integration', () => {
    it('should generate fresh tokens for different algorithms', async () => {
      const algorithms = ['HS256', 'HS384', 'HS512', 'none']
      
      for (const algorithm of algorithms) {
        const token = await tokenValidation.generateFreshToken(algorithm)
        
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
        
        const decoded = jwtHandler.decode(token)
        expect(decoded.header.alg).toBe(algorithm)
        
        // Should also update the signing key appropriately
        const expectedKey = getKeyForAlgorithm(algorithm, 'display')
        expect(tokenValidation.signingKey.value).toBe(expectedKey)
      }
    })

    it('should generate sample tokens for algorithms', async () => {
      const algorithms = ['HS256', 'HS384', 'HS512']
      
      for (const algorithm of algorithms) {
        const token = await tokenValidation.generateTokenForAlgorithm(algorithm)
        
        expect(token).toBeDefined()
        
        const decoded = jwtHandler.decode(token)
        expect(decoded.header.alg).toBe(algorithm)
      }
    })
  })

  describe('Initial Token Setup', () => {
    it('should initialize with default token and settings', async () => {
      // Reset the composable state
      tokenValidation.token.value = ''
      tokenValidation.signingAlg.value = ''
      tokenValidation.signingKey.value = ''
      
      await tokenValidation.initialToken()
      
      // Should have initialized with default values
      expect(tokenValidation.token.value).toBeDefined()
      expect(tokenValidation.token.value).not.toBe('')
      expect(tokenValidation.signingAlg.value).toBe('HS256') // Default algorithm
      expect(tokenValidation.signingKey.value).toBeDefined()
      expect(tokenValidation.signingKey.value).not.toBe('')
      
      // Token should be valid
      expect(tokenValidation.isValidToken.value).toBe(true)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty token gracefully', async () => {
      tokenValidation.token.value = ''
      await tokenValidation.parseJwtToken()

      expect(tokenValidation.tokenHeader.value).toBe(false)
      expect(tokenValidation.tokenPayload.value).toBe(false)
      expect(tokenValidation.isValidToken.value).toBe(false)
      expect(tokenValidation.signingAlg.value).toBe('')
    })

    it('should handle malformed tokens gracefully', async () => {
      const malformedTokens = [
        'invalid.jwt.token',
        'only-one-part',
        'two.parts',
        'invalid_base64.invalid_payload.invalid_signature'
      ]

      for (const malformedToken of malformedTokens) {
        tokenValidation.token.value = malformedToken
        await tokenValidation.parseJwtToken()

        expect(tokenValidation.tokenHeader.value).toBe(false)
        expect(tokenValidation.tokenPayload.value).toBe(false)
        expect(tokenValidation.isValidToken.value).toBe(false)
        expect(tokenValidation.signingAlg.value).toBe('')
      }
    })

    it('should handle validation without signing key for asymmetric algorithms', async () => {
      const algorithm = 'RS256'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        
        tokenValidation.token.value = token
        tokenValidation.signingKey.value = '' // No key provided
        tokenValidation.signingAlg.value = algorithm
        
        await tokenValidation.parseJwtToken()
        await tokenValidation.validateTokenUsingSigningKey()

        expect(tokenValidation.isValidToken.value).toBe(false)
      }
    })

    it('should handle validation without signing key for HMAC algorithms', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      tokenValidation.token.value = token
      tokenValidation.signingKey.value = '' // No key provided
      tokenValidation.signingAlg.value = algorithm
      
      await tokenValidation.parseJwtToken()
      await tokenValidation.validateTokenUsingSigningKey()

      expect(tokenValidation.isValidToken.value).toBe(false)
    })
  })

  describe('Reactive State Management', () => {
    it('should update all relevant state when token changes', async () => {
      // Start with empty state
      tokenValidation.token.value = ''
      
      expect(tokenValidation.tokenHeader.value).toBe(false)
      expect(tokenValidation.tokenPayload.value).toBe(false)
      expect(tokenValidation.isValidToken.value).toBe(false)
      
      // Set a valid token
      const token = await generateFreshTokenForAlgorithm('HS256')
      tokenValidation.token.value = token
      tokenValidation.signingKey.value = getKeyForAlgorithm('HS256', 'display')
      
      await tokenValidation.parseJwtToken()
      
      expect(tokenValidation.tokenHeader.value).not.toBe(false)
      expect(tokenValidation.tokenPayload.value).not.toBe(false)
      expect(tokenValidation.signingAlg.value).toBe('HS256')
      
      await tokenValidation.validateTokenUsingSigningKey()
      expect(tokenValidation.isValidToken.value).toBe(true)
    })

    it('should update algorithm-specific computed properties', async () => {
      // Test HMAC
      const hmacToken = await generateFreshTokenForAlgorithm('HS256')
      tokenValidation.token.value = hmacToken
      await tokenValidation.parseJwtToken()
      
      expect(tokenValidation.hasHmacAlg.value).toBe(true)
      expect(tokenValidation.hasAsymmetricAlg.value).toBe(false)
      expect(tokenValidation.isNoneAlg.value).toBe(false)
      
      // Test asymmetric (if available)
      const asymAlgorithm = hasRealKeysForAlgorithm('ES256') ? 'ES256' : 'RS256'
      if (hasRealKeysForAlgorithm(asymAlgorithm)) {
        const asymToken = await generateFreshTokenForAlgorithm(asymAlgorithm)
        tokenValidation.token.value = asymToken
        await tokenValidation.parseJwtToken()
        
        expect(tokenValidation.hasHmacAlg.value).toBe(false)
        expect(tokenValidation.hasAsymmetricAlg.value).toBe(true)
        expect(tokenValidation.isNoneAlg.value).toBe(false)
      }
      
      // Test none
      const noneToken = await generateFreshTokenForAlgorithm('none')
      tokenValidation.token.value = noneToken
      await tokenValidation.parseJwtToken()
      
      expect(tokenValidation.hasHmacAlg.value).toBe(false)
      expect(tokenValidation.hasAsymmetricAlg.value).toBe(false)
      expect(tokenValidation.isNoneAlg.value).toBe(true)
    })
  })
})