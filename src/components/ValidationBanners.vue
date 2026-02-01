<template>
  <div>
    <!-- Token Quality Indicator -->
    <div class="q-pa-sm q-gutter-sm" v-if="token && tokenPayload">
      <q-banner rounded class="bg-grey-3">
        <div class="row q-col-gutter-sm">
          <div class="col-6 col-sm-3" v-for="field in qualityFields" :key="field.key">
            <div class="row items-center no-wrap">
              <q-icon
                :name="field.available ? 'check_circle' : 'cancel'"
                :color="field.available ? 'positive' : 'negative'"
                size="sm"
                class="q-mr-xs"
              />
              <span class="text-caption">{{ field.key }}</span>
            </div>
          </div>
        </div>
      </q-banner>
    </div>

    <div class="q-pa-sm q-gutter-sm" v-if="token && !isValidToken">
      <q-banner rounded class="bg-red-8 text-white">
        <div class="text-h6">JWT Token is invalid</div>
        The JWT has not been verified and is not valid for use
      </q-banner>
    </div>
    <div class="q-pa-sm q-gutter-sm" v-if="token && isValidToken">
      <q-banner rounded class="bg-green-8 text-white">
        <div class="text-h6">JWT Token is valid</div>
        JWT Token has been verified using the key
      </q-banner>
    </div>
    <div class="q-pa-sm q-gutter-sm" v-if="token && !signingKey && !hasJwksKey">
      <q-banner rounded class="bg-red-8 text-white">
        <div class="text-h6">Key not found</div>
        No signing key was found for token validation
      </q-banner>
    </div>
    <div class="q-pa-sm q-gutter-sm" v-if="token && (signingKey || hasJwksKey)">
      <q-banner rounded class="bg-green-8 text-white">
        <div class="text-h6">Key found</div>
        A signing key is available for token validation
      </q-banner>
    </div>
    <div class="q-pa-sm q-gutter-sm" v-if="token && isValidToken">
      <q-banner rounded class="bg-green-8 text-white">
        <div class="text-h6">Signature verified</div>
        The signature of the JWT token has been verified using a signing key or secret
      </q-banner>
    </div>
    <div class="q-pa-sm q-gutter-sm" v-if="token && !isValidToken">
      <q-banner rounded class="bg-red-8 text-white">
        <div class="text-h6">Signature not verified</div>
        The signature of the JWT has not been verified
      </q-banner>
    </div>
    <div
      class="q-pa-sm q-gutter-sm"
      v-if="token && !isTokenExpired && tokenPayload?.exp"
    >
      <q-banner rounded class="bg-red-8 text-white">
        <div class="text-h6">Expired</div>
        The JWT token expired on
        {{ expiredDatetime }}
      </q-banner>
    </div>
    <div
      class="q-pa-sm q-gutter-sm"
      v-if="token && isTokenExpired && tokenPayload?.exp"
    >
      <q-banner rounded class="bg-green-8 text-white">
        <div class="text-h6">Not expired</div>
        The JWT token will expire on
        {{ expiredDatetime }}
      </q-banner>
    </div>
  </div>
</template>

<script>
export default {
  props: ['token', 'isValidToken', 'tokenPayload', 'tokenHeader', 'hasJwksKey', 'signingKey', 'hasHmacAlg'],
  computed: {
    qualityFields() {
      const fields = [
        { key: 'iss', label: 'iss (Issuer)', location: 'payload' },
        { key: 'sub', label: 'sub (Subject)', location: 'payload' },
        { key: 'aud', label: 'aud (Audience)', location: 'payload' },
        { key: 'exp', label: 'exp (Expiration)', location: 'payload' },
        { key: 'nbf', label: 'nbf (Not Before)', location: 'payload' },
        { key: 'iat', label: 'iat (Issued At)', location: 'payload' },
        { key: 'jti', label: 'jti (JWT ID)', location: 'payload' },
        { key: 'typ', label: 'typ (Type)', location: 'header' }
      ]

      return fields.map(field => {
        const source = field.location === 'header' ? this.tokenHeader : this.tokenPayload
        const available = source && source[field.key] !== undefined && source[field.key] !== null
        return {
          ...field,
          available
        }
      })
    },
    isTokenExpired() {
      if (this.tokenPayload) {
        return Math.round(new Date().getTime() / 1000) < this.tokenPayload.exp
      } else {
        return false
      }
    },
    expiredDatetime() {
      return new Date(this.tokenPayload.exp * 1000).toLocaleString()
    }
  }
}
</script>