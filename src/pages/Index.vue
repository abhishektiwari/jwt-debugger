<template>
  <q-page>
    <div class="q-pa-md">
      <div class="full-width full-height row">
        <div class="col-sm-12 col-md-6 padding5">
          <q-card bordered flat class="no-margin full-height">
            <q-card-section class="q-pt-xs">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h5 q-mt-sm q-mb-xs">JWT Token</div>
                  <div class="text-caption text-grey">
                    Paste your encoded JWT token here
                  </div>
                </div>
                <q-btn 
                  flat 
                  round 
                  icon="content_copy" 
                  color="primary"
                  @click="copyJwtToken"
                  v-if="token"
                  class="q-mt-sm"
                >
                  <q-tooltip>Copy JWT Token</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <q-input
                v-model="token"
                filled
                autogrow
                type="textarea"
                class="jwt_token"
                debounce="500"
                @update:model-value="handleParseJwtToken"
              />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-h6">JWKS Endpoint</div>
              <div class="text-caption text-grey">
                For RSA and ECDSA signed token paste your JWKS Endpoint URL
              </div>
              <q-input
                outlined
                v-model="jwksUri"
                placeholder="Your JWKS Endpoint"
                debounce="500"
                clearable
                @update:model-value="handleGetJwksKeys"
              />
              <q-list
                bordered
                separator
                class="rounded-borders q-mt-sm"
                v-if="jwksKeys.length > 0"
              >
                <q-item
                  clickable
                  v-ripple
                  active-class="text-orange"
                  v-for="item in jwksKeys"
                  :key="item.kid"
                >
                  <q-item-section avatar>
                    <q-icon name="vpn_key" />
                  </q-item-section>
                  <q-item-section
                    >{{ item.kty }} Key
                    <q-item-label caption>{{ item.kid }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-h6">Algorithm</div>
              <div class="text-caption text-grey">
                Select the signing algorithm used for the JWT token
              </div>
              <q-select
                v-model="signingAlg"
                :options="algorithmOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                class="q-mb-md"
                @update:model-value="handleAlgorithmChange"
              />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-h6">{{ keyTypeLabel }}</div>
              <div class="text-caption text-grey">
                For HMAC signed token paste your secret, OR
              </div>
              <div class="text-caption text-grey">
                For RSA and ECDSA signed token paste public or private key in
                PEM format
              </div>
              <q-input
                v-model="signingKey"
                filled
                autogrow
                type="textarea"
                class="jwt_token"
                @update:model-value="handleParseSecret"
              />
            </q-card-section>
            <q-separator v-if="token" />
            <q-card-actions v-if="token">
              <q-btn flat round icon="share" color="red"/>
              <q-btn flat color="red" @click="shareWebLink">
                Share via web link
              </q-btn>
            </q-card-actions>
            <q-card-section v-if="token">
              <download-banners />
            </q-card-section>
          </q-card>
        </div>
        <q-separator />
        <div class="col-sm-12 col-md-6 padding5">
          <q-card bordered flat class="no-margin full-height">
            <q-card-section class="q-pt-xs">
              <div class="text-h5 q-mt-sm q-mb-xs">Token Details</div>
              <div class="text-caption text-grey">
                Click to copy the attribute values
              </div>
            </q-card-section>
            <q-separator />
            <ValidationBanners
              :token="token"
              :signingKey="signingKey"
              :isValidToken="isValidToken"
              :tokenPayload="tokenPayload"
              :tokenHeader="tokenHeader"
              :hasJwksKey="hasJwksKey"
              :hasHmacAlg="hasHmacAlg"
            />
            <q-banner dense rounded class="bg-grey-3" v-if="token">
              <div class="row items-center justify-between full-width">
                <div class="text-h6">Token Header</div>
                <q-btn 
                  flat 
                  round 
                  icon="content_copy" 
                  color="primary"
                  @click="copyTokenHeader"
                  v-if="tokenHeader"
                  size="sm"
                >
                  <q-tooltip>Copy Header</q-tooltip>
                </q-btn>
              </div>
            </q-banner>
            <q-card-section>
              <vue-json-pretty
                :path="'res'"
                :data="tokenHeader"
                @node-click="handleClick"
                @node-mouseover="handleNodeMouseover"
                @mouseleave="hideTooltip"
                :showSelectController="true"
                :highlightMouseoverNode="true"
                v-if="tokenHeader"
              >
              </vue-json-pretty>
            </q-card-section>
            <q-separator v-if="token" />
            <q-banner dense class="bg-grey-3" v-if="token">
              <div class="row items-center justify-between full-width">
                <div class="text-h6">Token Payload</div>
                <q-btn 
                  flat 
                  round 
                  icon="content_copy" 
                  color="primary"
                  @click="copyTokenPayload"
                  v-if="tokenPayload"
                  size="sm"
                >
                  <q-tooltip>Copy Payload</q-tooltip>
                </q-btn>
              </div>
            </q-banner>

            <vue-json-pretty
              :path="'res'"
              :data="tokenPayload"
              @node-click="handleClick"
              @node-mouseover="handleNodeMouseover"
              @mouseleave="hideTooltip"
              :showSelectController="true"
              :highlightMouseoverNode="true"
              v-if="tokenPayload"
            >
            </vue-json-pretty>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Tooltip for timestamp hover -->
    <div
      v-if="tooltipVisible"
      class="timestamp-tooltip"
      :style="{
        left: tooltipX + 10 + 'px',
        top: tooltipY + 10 + 'px'
      }"
    >
      {{ tooltipContent }}
    </div>
  </q-page>
</template>

<script>
import { useTokenValidation } from '../composables/useTokenValidation'
import { copyToClipboard, useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import ValidationBanners from '../components/ValidationBanners.vue'
import DownloadBanners from '../components/DownloadBanners.vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css';
import { onMounted, ref } from 'vue'

export default {
  name: 'PageIndex',
  components: {
    ValidationBanners,
    VueJsonPretty,
    DownloadBanners
  },
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const {
      token,
      jwksUri,
      isValidToken,
      tokenPayload,
      tokenHeader,
      jwksKeys,
      hasJwksKey,
      signingKey,
      signingAlg,
      hasHmacAlg,
      keyTypeLabel,
      initialToken,
      getJwksKeys,
      parseJwtToken,
      parseSecret,
      onAlgorithmChange
    } = useTokenValidation()

    // Tooltip state for timestamp hover
    const tooltipVisible = ref(false)
    const tooltipContent = ref('')
    const tooltipX = ref(0)
    const tooltipY = ref(0)

    const algorithmOptions = [
      { label: 'HS256 - HMAC using SHA-256 hash algorithm', value: 'HS256' },
      { label: 'HS384 - HMAC using SHA-384 hash algorithm', value: 'HS384' },
      { label: 'HS512 - HMAC using SHA-512 hash algorithm', value: 'HS512' },
      { label: 'RS256 - RSASSA using SHA-256 hash algorithm', value: 'RS256' },
      { label: 'RS384 - RSASSA using SHA-384 hash algorithm', value: 'RS384' },
      { label: 'RS512 - RSASSA using SHA-512 hash algorithm', value: 'RS512' },
      { label: 'PS256 - RSASSA-PSS using SHA-256 hash algorithm', value: 'PS256' },
      { label: 'PS384 - RSASSA-PSS using SHA-384 hash algorithm', value: 'PS384' },
      { label: 'PS512 - RSASSA-PSS using SHA-512 hash algorithm', value: 'PS512' },
      { label: 'ES256 - ECDSA using P-256 curve and SHA-256 hash algorithm', value: 'ES256' },
      { label: 'ES384 - ECDSA using P-384 curve and SHA-384 hash algorithm', value: 'ES384' },
      { label: 'ES512 - ECDSA using P-521 curve and SHA-512 hash algorithm', value: 'ES512' },
      { label: 'none - No digital signature or MAC value included', value: 'none' }
    ]

    function shareWebLink() {
      let shareUrl
      if (hasJwksKey.value && jwksKeys.value) {
        shareUrl = `https://jwtdebugger.app/#/?token=${token.value}&jwks=${jwksUri.value}`
      } else {
        shareUrl = `https://jwtdebugger.app/#/?token=${token.value}`
      }
      copyToClipboard(shareUrl).then(() => {
        $q.notify('Link copied')
      })
    }

    function handleClick(node) {
      // Vue-json-pretty @node-click passes a node object
      // Use node.content for the actual value, fallback to node.value or node
      const data = node?.content ?? node?.value ?? node

      // Log for debugging
      console.log('Node clicked:', node)
      console.log('Data to copy:', data)

      if (data === undefined || data === null) {
        $q.notify({
          type: 'warning',
          message: 'No value to copy'
        })
        return
      }

      let valueToCopy
      if (typeof data === 'object' && data !== null) {
        valueToCopy = JSON.stringify(data, null, 2)
      } else {
        valueToCopy = String(data)
      }

      copyToClipboard(valueToCopy).then(() => {
        $q.notify('Copied: ' + (valueToCopy.length > 50 ? valueToCopy.substring(0, 50) + '...' : valueToCopy))
      }).catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Failed to copy'
        })
      })
    }

    function handleNodeMouseover(node, event) {
      // Check if this is a timestamp field in JWT (exp, iat, nbf)
      const timestampFields = ['exp', 'iat', 'nbf']
      const key = node?.key
      const value = node?.content ?? node?.value

      // Only show tooltip for known timestamp fields with numeric values
      if (timestampFields.includes(key) && typeof value === 'number') {
        // Convert Unix timestamp to human-readable date
        const date = new Date(value * 1000)
        const formattedDate = date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })

        // Position tooltip near mouse cursor
        const mouseEvent = event || window.event
        tooltipX.value = mouseEvent?.clientX || 0
        tooltipY.value = mouseEvent?.clientY || 0
        tooltipContent.value = formattedDate
        tooltipVisible.value = true
      } else {
        tooltipVisible.value = false
      }
    }

    function hideTooltip() {
      tooltipVisible.value = false
    }

    function copyTokenHeader() {
      const headerData = JSON.stringify(tokenHeader.value, null, 2)
      copyToClipboard(headerData).then(() => {
        $q.notify('Token Header copied to clipboard')
      })
    }

    function copyTokenPayload() {
      const payloadData = JSON.stringify(tokenPayload.value, null, 2)
      copyToClipboard(payloadData).then(() => {
        $q.notify('Token Payload copied to clipboard')
      })
    }

    function copyJwtToken() {
      copyToClipboard(token.value).then(() => {
        $q.notify('JWT Token copied to clipboard')
      })
    }

    // Wrapper functions for async event handlers
    const handleParseJwtToken = async () => {
      await parseJwtToken()
    }

    const handleAlgorithmChange = async () => {
      await onAlgorithmChange()
    }

    const handleGetJwksKeys = async () => {
      await getJwksKeys()
    }

    const handleParseSecret = async () => {
      await parseSecret()
    }

    onMounted(async () => {
      // Load token from URL query parameters if present
      if (route.query.token) {
        token.value = decodeURIComponent(route.query.token)
        // Load JWKS URI from URL query parameters if present
        if (route.query.jwks) {
          jwksUri.value = decodeURIComponent(route.query.jwks)
        }
        await handleParseJwtToken()
        if (route.query.jwks) {
          await handleGetJwksKeys()
        }
      } else {
        await initialToken()
      }
    })

    return {
      token,
      jwksUri,
      isValidToken,
      tokenPayload,
      tokenHeader,
      jwksKeys,
      hasJwksKey,
      signingKey,
      signingAlg,
      hasHmacAlg,
      keyTypeLabel,
      algorithmOptions,
      tooltipVisible,
      tooltipContent,
      tooltipX,
      tooltipY,
      getJwksKeys,
      parseJwtToken,
      parseSecret,
      onAlgorithmChange,
      handleParseJwtToken,
      handleAlgorithmChange,
      handleGetJwksKeys,
      handleParseSecret,
      shareWebLink,
      handleClick,
      handleNodeMouseover,
      hideTooltip,
      copyTokenHeader,
      copyTokenPayload,
      copyJwtToken
    }
  }
}
</script>

<style lang="css">
.padding5 {
  padding: 5px;
}
.jwt_token {
  font-family: monospace;
}
.timestamp-tooltip {
  position: fixed;
  z-index: 9999;
  background-color: #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  word-wrap: break-word;
}
</style>