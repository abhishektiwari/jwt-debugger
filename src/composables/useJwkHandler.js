import jwkToPem from 'jwk-to-pem'

export default function convertJwkToPem(jwk) {
  try {
    return jwkToPem(jwk)
  } catch (error) {
    console.error('Error converting JWK to PEM:', error)
    throw new Error('Failed to convert JWK to PEM format')
  }
}