import { describe, it, expect } from 'vitest'
import { 
  initializeSampleTokens, 
  getSampleTokenForAlgorithm, 
  generateFreshTokenForAlgorithm,
  getSampleJWT,
  getInitializedSampleTokens
} from '../src/composables/useSampleToken.js'
import { SAMPLE_KEYS, getKeyForAlgorithm, hasRealKeysForAlgorithm } from '../src/composables/useSampleKeys.js'
import * as jwtHandler from '../src/composables/useJwtHandler.js'

describe('Sample Token Generation with Real Implementation', () => {

  describe('Token Generation Functions', () => {
    it('should generate sample JWT (default HS256)', async () => {
      const sampleJWT = await getSampleJWT()
      
      expect(sampleJWT).toBeDefined()
      expect(typeof sampleJWT).toBe('string')
      expect(sampleJWT.split('.').length).toBe(3)
      
      const decoded = jwtHandler.decode(sampleJWT)
      expect(decoded.header.alg).toBe('HS256')
      expect(decoded.header.typ).toBe('JWT')
      expect(decoded.payload.sub).toBeDefined()
      expect(decoded.payload.name).toBeDefined()
      expect(decoded.payload.iat).toBeDefined()
      expect(decoded.payload.exp).toBeDefined()
      expect(decoded.payload.aud).toBe('jwt-debugger-app')
      expect(decoded.payload.iss).toBe('jwt-debugger')
      expect(decoded.payload.jti).toBeDefined()
    })

    it('should generate fresh tokens for all HMAC algorithms', async () => {
      const hmacAlgorithms = ['HS256', 'HS384', 'HS512']
      
      for (const algorithm of hmacAlgorithms) {
        const token1 = await generateFreshTokenForAlgorithm(algorithm)
        const token2 = await generateFreshTokenForAlgorithm(algorithm)
        
        expect(token1).toBeDefined()
        expect(token2).toBeDefined()
        expect(token1).not.toBe(token2) // Should be different due to iat and jti
        
        const decoded1 = jwtHandler.decode(token1)
        const decoded2 = jwtHandler.decode(token2)
        
        expect(decoded1.header.alg).toBe(algorithm)
        expect(decoded2.header.alg).toBe(algorithm)
        expect(decoded1.payload.jti).not.toBe(decoded2.payload.jti) // Different JTI
      }
    })

    it('should generate fresh tokens for available asymmetric algorithms', async () => {
      const asymmetricAlgorithms = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512', 'ES256', 'ES384', 'ES512']
      
      for (const algorithm of asymmetricAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          
          expect(token).toBeDefined()
          expect(typeof token).toBe('string')
          expect(token.split('.').length).toBe(3)
          
          const decoded = jwtHandler.decode(token)
          expect(decoded.header.alg).toBe(algorithm)
          expect(decoded.payload.sub).toBeDefined()
        } else {
          console.log(`Skipping ${algorithm} - keys not available in environment`)
        }
      }
    })

    it('should generate none algorithm tokens', async () => {
      const token = await generateFreshTokenForAlgorithm('none')
      
      expect(token).toBeDefined()
      expect(token.endsWith('.')).toBe(true) // none algorithm has empty signature
      
      const decoded = jwtHandler.decode(token)
      expect(decoded.header.alg).toBe('none')
      expect(decoded.payload.sub).toBeDefined()
    })
  })

  describe('Sample Token Consistency', () => {
    it('should return same sample token for repeated calls', async () => {
      const algorithm = 'HS256'
      
      const token1 = await getSampleTokenForAlgorithm(algorithm)
      const token2 = await getSampleTokenForAlgorithm(algorithm)
      const token3 = await getSampleTokenForAlgorithm(algorithm)
      
      expect(token1).toBe(token2)
      expect(token2).toBe(token3)
    })

    it('should return different tokens for fresh generation', async () => {
      const algorithm = 'HS256'
      
      const fresh1 = await generateFreshTokenForAlgorithm(algorithm)
      const fresh2 = await generateFreshTokenForAlgorithm(algorithm)
      const fresh3 = await generateFreshTokenForAlgorithm(algorithm)
      
      expect(fresh1).not.toBe(fresh2)
      expect(fresh2).not.toBe(fresh3)
      expect(fresh1).not.toBe(fresh3)
    })
  })

  describe('Token Initialization', () => {
    it('should initialize sample tokens for all algorithms', async () => {
      const sampleTokens = await initializeSampleTokens()
      
      expect(sampleTokens).toBeDefined()
      expect(typeof sampleTokens).toBe('object')
      
      // Check HMAC algorithms
      expect(sampleTokens.HS256).toBeDefined()
      expect(sampleTokens.HS384).toBeDefined()
      expect(sampleTokens.HS512).toBeDefined()
      
      // Check that none algorithm is included
      expect(sampleTokens.none).toBeDefined()
      expect(sampleTokens.none.endsWith('.')).toBe(true)
      
      // Verify token structure
      for (const [algorithm, token] of Object.entries(sampleTokens)) {
        if (algorithm !== 'none') {
          expect(token.split('.').length).toBe(3)
        }
        
        const decoded = jwtHandler.decode(token)
        expect(decoded.header.alg).toBe(algorithm)
        expect(decoded.payload.sub).toBeDefined()
      }
    })

    it('should get initialized sample tokens', async () => {
      // First initialize
      await initializeSampleTokens()
      
      // Then get initialized tokens
      const tokens = getInitializedSampleTokens()
      
      expect(tokens).toBeDefined()
      expect(tokens.HS256).toBeDefined()
      expect(tokens.HS384).toBeDefined()
      expect(tokens.HS512).toBeDefined()
      expect(tokens.none).toBeDefined()
    })
  })

  describe('Token Payload Structure', () => {
    it('should generate tokens with standard JWT claims', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      const decoded = jwtHandler.decode(token)
      
      // Check required claims
      expect(decoded.payload.sub).toBe('1234567890')
      expect(decoded.payload.name).toBe('John Doe')
      expect(decoded.payload.aud).toBe('jwt-debugger-app')
      expect(decoded.payload.iss).toBe('jwt-debugger')
      
      // Check time-based claims
      expect(decoded.payload.iat).toBeDefined()
      expect(decoded.payload.exp).toBeDefined()
      expect(decoded.payload.exp).toBeGreaterThan(decoded.payload.iat)
      
      // Check JTI (should be a GUID-like string)
      expect(decoded.payload.jti).toBeDefined()
      expect(typeof decoded.payload.jti).toBe('string')
      expect(decoded.payload.jti.includes('-')).toBe(true)
    })

    it('should generate different JTI for each fresh token', async () => {
      const algorithm = 'HS256'
      const token1 = await generateFreshTokenForAlgorithm(algorithm)
      const token2 = await generateFreshTokenForAlgorithm(algorithm)
      
      const decoded1 = jwtHandler.decode(token1)
      const decoded2 = jwtHandler.decode(token2)
      
      expect(decoded1.payload.jti).not.toBe(decoded2.payload.jti)
    })

    it('should generate tokens with reasonable expiration time', async () => {
      const algorithm = 'HS256'
      const token = await generateFreshTokenForAlgorithm(algorithm)
      const decoded = jwtHandler.decode(token)
      
      const now = Math.floor(Date.now() / 1000)
      const expiration = decoded.payload.exp
      const expirationDiff = expiration - now
      
      // Should expire in approximately 1 hour (3600 seconds)
      expect(expirationDiff).toBeGreaterThan(3500) // At least 58+ minutes
      expect(expirationDiff).toBeLessThan(3700) // At most 61+ minutes
    })
  })

  describe('Key Integration', () => {
    it('should use correct keys for token generation', async () => {
      const hmacAlgorithms = ['HS256', 'HS384', 'HS512']
      
      for (const algorithm of hmacAlgorithms) {
        const token = await generateFreshTokenForAlgorithm(algorithm)
        const signingKey = getKeyForAlgorithm(algorithm, 'signing')
        
        // Verify token with the same key used for signing
        const verification = await jwtHandler.verify(token, algorithm, signingKey)
        expect(verification.success).toBe(true)
      }
    })

    it('should handle asymmetric key algorithms when available', async () => {
      const asymmetricAlgorithms = ['ES256', 'ES384', 'ES512', 'RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512']
      
      for (const algorithm of asymmetricAlgorithms) {
        if (hasRealKeysForAlgorithm(algorithm)) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          const publicKey = getKeyForAlgorithm(algorithm, 'display')
          
          // Verify token with public key
          const verification = await jwtHandler.verify(token, algorithm, publicKey)
          expect(verification.success).toBe(true)
        }
      }
    })
  })

  describe('Error Handling in Token Generation', () => {
    it('should handle null or undefined algorithm gracefully', async () => {
      // The implementation should default to HS256 for null/undefined algorithm
      const tokenNull = await generateFreshTokenForAlgorithm(null)
      const tokenUndefined = await generateFreshTokenForAlgorithm(undefined)
      
      expect(tokenNull).toBeDefined()
      expect(tokenUndefined).toBeDefined()
      
      const decodedNull = jwtHandler.decode(tokenNull)
      const decodedUndefined = jwtHandler.decode(tokenUndefined)
      
      expect(decodedNull.header.alg).toBe('HS256')
      expect(decodedUndefined.header.alg).toBe('HS256')
    })

    it('should handle unsupported algorithms', async () => {
      // Should still generate a token (probably defaulting to HS256 or handling gracefully)
      const token = await generateFreshTokenForAlgorithm('UNSUPPORTED_ALG')
      
      expect(token).toBeDefined()
      
      const decoded = jwtHandler.decode(token)
      expect(decoded.header.alg).toBeDefined()
    })
  })

  describe('Performance and Consistency', () => {
    it('should generate tokens efficiently', async () => {
      const algorithm = 'HS256'
      const startTime = Date.now()
      
      // Generate multiple tokens
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(generateFreshTokenForAlgorithm(algorithm))
      }
      
      const tokens = await Promise.all(promises)
      const endTime = Date.now()
      
      expect(tokens.length).toBe(10)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in less than 1 second
      
      // All tokens should be valid and different
      for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i]).toBeDefined()
        for (let j = i + 1; j < tokens.length; j++) {
          expect(tokens[i]).not.toBe(tokens[j])
        }
      }
    })

    it('should maintain consistency across multiple algorithm switches', async () => {
      const algorithms = ['HS256', 'HS384', 'HS512', 'none']
      const results = {}
      
      // Generate tokens for each algorithm multiple times
      for (const algorithm of algorithms) {
        results[algorithm] = []
        for (let i = 0; i < 3; i++) {
          const token = await generateFreshTokenForAlgorithm(algorithm)
          results[algorithm].push(token)
        }
      }
      
      // Verify each algorithm's tokens are different but valid
      for (const [algorithm, tokens] of Object.entries(results)) {
        expect(tokens.length).toBe(3)
        
        for (let i = 0; i < tokens.length; i++) {
          const decoded = jwtHandler.decode(tokens[i])
          expect(decoded.header.alg).toBe(algorithm)
          
          for (let j = i + 1; j < tokens.length; j++) {
            expect(tokens[i]).not.toBe(tokens[j])
          }
        }
      }
    })
  })
})