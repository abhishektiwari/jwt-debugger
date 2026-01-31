import { describe, it, expect, beforeEach } from 'vitest'
import * as jwtHandler from '../src/composables/useJwtHandler.js'
import { useTokenValidation } from '../src/composables/useTokenValidation.js'
import { getKeyForAlgorithm, hasRealKeysForAlgorithm } from '../src/composables/useSampleKeys.js'
import { generateFreshTokenForAlgorithm, getSampleTokenForAlgorithm } from '../src/composables/useSampleToken.js'

describe('JWT Validation with Real Implementation', () => {
  let tokenValidation
  
  beforeEach(() => {
    tokenValidation = useTokenValidation()
  })

  describe('HMAC Algorithm Validation', () => {
    it('should validate HS256 tokens using real signatures', async () => {
      const algorithm = 'HS256'
      const signingKey = getKeyForAlgorithm(algorithm, 'signing')
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)

      const verification = await jwtHandler.verify(token, algorithm, signingKey)
      expect(verification.success).toBe(true)
      expect(verification.payload).toBeDefined()
      expect(verification.payload.sub).toBeDefined()
    })

    it('should validate HS384 tokens using real signatures', async () => {
      const algorithm = 'HS384'
      const signingKey = getKeyForAlgorithm(algorithm, 'signing')
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      const verification = await jwtHandler.verify(token, algorithm, signingKey)
      expect(verification.success).toBe(true)
      expect(verification.payload.sub).toBeDefined()
    })

    it('should validate HS512 tokens using real signatures', async () => {
      const algorithm = 'HS512'
      const signingKey = getKeyForAlgorithm(algorithm, 'signing')
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      const verification = await jwtHandler.verify(token, algorithm, signingKey)
      expect(verification.success).toBe(true)
      expect(verification.payload.sub).toBeDefined()
    })

    it('should fail HMAC validation with wrong secret', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      const verification = await jwtHandler.verify(token, algorithm, 'wrong-secret')
      expect(verification.success).toBe(false)
      expect(verification.error).toContain('signature verification failed')
    })
  })

  describe('RSA Algorithm Validation', () => {
    it('should validate RS256 tokens if keys are available', async () => {
      const algorithm = 'RS256'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        expect(token).toBeDefined()
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
        expect(verification.payload.sub).toBeDefined()
      } else {
        console.log('Skipping RS256 test - keys not available in environment')
        expect(true).toBe(true) // Pass the test if keys aren't available
      }
    })

    it('should validate RS384 tokens if keys are available', async () => {
      const algorithm = 'RS384'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
      } else {
        console.log('Skipping RS384 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })

    it('should validate RS512 tokens if keys are available', async () => {
      const algorithm = 'RS512'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
      } else {
        console.log('Skipping RS512 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })
  })

  describe('PSS Algorithm Validation', () => {
    it('should validate PS256 tokens if keys are available', async () => {
      const algorithm = 'PS256'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
      } else {
        console.log('Skipping PS256 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })

    it('should validate PS384 tokens if keys are available', async () => {
      const algorithm = 'PS384'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
      } else {
        console.log('Skipping PS384 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })

    it('should validate PS512 tokens if keys are available', async () => {
      const algorithm = 'PS512'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
      } else {
        console.log('Skipping PS512 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })
  })

  describe('ECDSA Algorithm Validation', () => {
    it('should validate ES256 tokens if keys are available', async () => {
      const algorithm = 'ES256'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        expect(token).toBeDefined()
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
        expect(verification.payload.sub).toBeDefined()
      } else {
        console.log('Skipping ES256 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })

    it('should validate ES384 tokens if keys are available', async () => {
      const algorithm = 'ES384'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
      } else {
        console.log('Skipping ES384 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })

    it('should validate ES512 tokens if keys are available', async () => {
      const algorithm = 'ES512'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const publicKey = getKeyForAlgorithm(algorithm, 'display')
        
        const verification = await jwtHandler.verify(token, algorithm, publicKey)
        expect(verification.success).toBe(true)
      } else {
        console.log('Skipping ES512 test - keys not available in environment')
        expect(true).toBe(true)
      }
    })
  })

  describe('None Algorithm Validation', () => {
    it('should validate none algorithm tokens', async () => {
      const algorithm = 'none'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      expect(token).toBeDefined()
      expect(token.endsWith('.')).toBe(true) // none algorithm has empty signature

      const verification = await jwtHandler.verify(token, algorithm, '')
      expect(verification.success).toBe(true)
      expect(verification.payload.sub).toBeDefined()
    })
  })

  describe('Token Validation Integration with useTokenValidation', () => {
    it('should integrate with token validation composable for HMAC', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      tokenValidation.token.value = token
      tokenValidation.signingAlg.value = algorithm
      tokenValidation.signingKey.value = getKeyForAlgorithm(algorithm, 'display')
      
      await tokenValidation.parseJwtToken()
      expect(tokenValidation.tokenHeader.value.alg).toBe(algorithm)
      expect(tokenValidation.signingAlg.value).toBe(algorithm)
      
      await tokenValidation.validateTokenUsingSigningKey()
      expect(tokenValidation.isValidToken.value).toBe(true)
    })

    it('should integrate with token validation composable for RSA if available', async () => {
      const algorithm = 'RS256'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        
        tokenValidation.token.value = token
        tokenValidation.signingAlg.value = algorithm
        tokenValidation.signingKey.value = getKeyForAlgorithm(algorithm, 'display')
        
        await tokenValidation.parseJwtToken()
        expect(tokenValidation.tokenHeader.value.alg).toBe(algorithm)
        
        await tokenValidation.validateTokenUsingSigningKey()
        expect(tokenValidation.isValidToken.value).toBe(true)
      } else {
        console.log('Skipping RSA integration test - keys not available')
        expect(true).toBe(true)
      }
    })

    it('should integrate with token validation composable for ECDSA if available', async () => {
      const algorithm = 'ES256'
      
      if (hasRealKeysForAlgorithm(algorithm)) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        
        tokenValidation.token.value = token
        tokenValidation.signingAlg.value = algorithm
        tokenValidation.signingKey.value = getKeyForAlgorithm(algorithm, 'display')
        
        await tokenValidation.parseJwtToken()
        expect(tokenValidation.tokenHeader.value.alg).toBe(algorithm)
        
        await tokenValidation.validateTokenUsingSigningKey()
        expect(tokenValidation.isValidToken.value).toBe(true)
      } else {
        console.log('Skipping ECDSA integration test - keys not available')
        expect(true).toBe(true)
      }
    })

    it('should handle validation failures gracefully', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      tokenValidation.token.value = token
      tokenValidation.signingAlg.value = algorithm
      tokenValidation.signingKey.value = 'wrong-secret'
      
      await tokenValidation.parseJwtToken()
      await tokenValidation.validateTokenUsingSigningKey()
      
      expect(tokenValidation.isValidToken.value).toBe(false)
    })
  })

  describe('Algorithm-specific Features', () => {
    it('should test all HMAC algorithms', async () => {
      const hmacAlgorithms = ['HS256', 'HS384', 'HS512']
      
      for (const algorithm of hmacAlgorithms) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const decoded = jwtHandler.decode(token)
        
        expect(decoded.header.alg).toBe(algorithm)
        expect(decoded.header.typ).toBe('JWT')
        expect(decoded.payload.sub).toBeDefined()
        
        const signingKey = getKeyForAlgorithm(algorithm, 'signing')
        const verification = await jwtHandler.verify(token, algorithm, signingKey)
        expect(verification.success).toBe(true)
      }
    })

    it('should test available asymmetric algorithms', async () => {
      const asymmetricAlgorithms = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512', 'ES256', 'ES384', 'ES512']
      
      for (const algorithm of asymmetricAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          const decoded = jwtHandler.decode(token)
          
          expect(decoded.header.alg).toBe(algorithm)
          expect(decoded.payload.sub).toBeDefined()
          
          const publicKey = getKeyForAlgorithm(algorithm, 'display')
          const verification = await jwtHandler.verify(token, algorithm, publicKey)
          expect(verification.success).toBe(true)
        } else {
          console.log(`Skipping ${algorithm} - keys not available in environment`)
        }
      }
    })
  })

  describe('Real Token Generation and Validation', () => {
    it('should generate and validate fresh tokens consistently', async () => {
      const algorithm = 'HS256'
      
      // Generate multiple fresh tokens
      const token1 = await generateFreshTokenForAlgorithm(algorithm)
      const token2 = await generateFreshTokenForAlgorithm(algorithm)
      
      expect(token1).not.toBe(token2) // Should be different due to iat and jti
      
      const signingKey = getKeyForAlgorithm(algorithm, 'signing')
      
      // Both should validate successfully
      const verification1 = await jwtHandler.verify(token1, algorithm, signingKey)
      const verification2 = await jwtHandler.verify(token2, algorithm, signingKey)
      
      expect(verification1.success).toBe(true)
      expect(verification2.success).toBe(true)
    })

    it('should use sample tokens consistently', async () => {
      const algorithm = 'HS256'
      
      // Get sample token multiple times
      const sampleToken1 = await getSampleTokenForAlgorithm(algorithm)
      const sampleToken2 = await getSampleTokenForAlgorithm(algorithm)
      
      expect(sampleToken1).toBe(sampleToken2) // Should be same sample token
      
      const signingKey = getKeyForAlgorithm(algorithm, 'signing')
      const verification = await jwtHandler.verify(sampleToken1, algorithm, signingKey)
      expect(verification.success).toBe(true)
    })

    it('should handle expiration validation', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      const signingKey = getKeyForAlgorithm(algorithm, 'signing')
      
      const validation = await jwtHandler.validateAndDecode(token, algorithm, signingKey)
      expect(validation.success).toBe(true)
      expect(validation.expired).toBe(false) // Should not be expired for fresh tokens
      expect(validation.decoded.payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })
  })

  describe('Environment Key Configuration', () => {
    it('should show which algorithms have real keys available', () => {
      const allAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512', 'ES256', 'ES384', 'ES512']
      const availableAlgorithms = []
      const missingAlgorithms = []
      
      for (const algorithm of allAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          availableAlgorithms.push(algorithm)
        } else {
          missingAlgorithms.push(algorithm)
        }
      }
      
      console.log('Available algorithms with real keys:', availableAlgorithms)
      console.log('Missing algorithms (will use placeholders):', missingAlgorithms)
      
      // HMAC should always be available
      expect(availableAlgorithms).toContain('HS256')
      expect(availableAlgorithms).toContain('HS384')
      expect(availableAlgorithms).toContain('HS512')
    })

    it('should handle missing environment keys gracefully', () => {
      // Test that the system can handle missing asymmetric keys
      const allAlgorithms = ['RS256', 'PS256', 'ES256']
      
      for (const algorithm of allAlgorithms) {
        const hasKeys = hasRealKeysForAlgorithm(algorithm)
        const keyForSigning = getKeyForAlgorithm(algorithm, 'signing')
        const keyForDisplay = getKeyForAlgorithm(algorithm, 'display')
        
        // Should return some key (either real or placeholder)
        expect(keyForSigning).toBeDefined()
        expect(keyForDisplay).toBeDefined()
        expect(typeof keyForSigning).toBe('string')
        expect(typeof keyForDisplay).toBe('string')
        
        if (!hasKeys) {
          // Should return placeholder if no real keys
          expect(keyForSigning).toContain('placeholder')
          expect(keyForDisplay).toContain('placeholder')
        }
      }
    })
  })

  describe('Error Handling with Real Implementation', () => {
    it('should handle malformed tokens', () => {
      const malformedTokens = [
        'invalid.jwt.token',
        'only-one-part',
        'two.parts',
        '',
        'invalid_base64.invalid_payload.invalid_signature'
      ]

      for (const malformedToken of malformedTokens) {
        const decoded = jwtHandler.decode(malformedToken)
        expect(decoded.header).toBeNull()
        expect(decoded.payload).toBeNull()
        expect(decoded.signature).toBeNull()
      }
    })

    it('should handle verification errors with real implementation', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      
      // Test with wrong algorithm
      const wrongAlgorithmVerification = await jwtHandler.verify(token, 'HS384', getKeyForAlgorithm('HS384', 'signing'))
      expect(wrongAlgorithmVerification.success).toBe(false)
      
      // Test with wrong secret
      const wrongSecretVerification = await jwtHandler.verify(token, algorithm, 'wrong-secret')
      expect(wrongSecretVerification.success).toBe(false)
      expect(wrongSecretVerification.error).toContain('signature verification failed')
    })
  })
})