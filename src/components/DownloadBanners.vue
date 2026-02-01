<template>
  <div>
    <!-- Download Desktop App -->
    <div v-if="!$q.platform.is.electron && $q.platform.is.desktop && ($q.platform.is.mac || $q.platform.is.win || $q.platform.is.linux)" class="bg-grey-3 q-pa-md rounded-borders">
      <div class="row items-center">
        <div class="col">
          <div class="text-h6">Download Desktop App</div>
          <div class="text-caption text-grey">
            Available for Mac, Windows, and Linux
          </div>
        </div>
        <div class="col-auto" style="width: 150px">
          <q-btn
            unelevated
            color="primary"
            icon="download"
            label="Download"
            @click="openReleases"
            no-caps
            class="full-width"
          />
        </div>
      </div>
    </div>

    <!-- Install PWA -->
    <div v-if="!$q.platform.is.electron && showPWAInstall" class="bg-grey-3 q-pa-md rounded-borders q-mt-sm">
      <div class="row items-center">
        <div class="col">
          <div class="text-h6">Install App</div>
          <div class="text-caption text-grey">
            Add to your home screen for quick access
          </div>
        </div>
        <div class="col-auto" style="width: 150px">
          <q-btn
            unelevated
            color="positive"
            icon="add_to_home_screen"
            label="Install"
            @click="installPWA"
            no-caps
            class="full-width"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { openURL } from 'quasar'

export default {
  data() {
    return {
      releasesUrl: 'https://github.com/abhishektiwari/jwt-debugger/releases/latest',
      showPWAInstall: false,
      deferredPrompt: null
    }
  },
  mounted() {
    // Check if already running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://')

    // Show install option if not already installed
    if (!isStandalone) {
      this.showPWAInstall = true
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      this.deferredPrompt = e
      // Show the install button
      this.showPWAInstall = true
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      // Hide the install button
      this.showPWAInstall = false
      this.deferredPrompt = null
    })
  },
  methods: {
    openReleases() {
      openURL(this.releasesUrl)
    },
    async installPWA() {
      if (!this.deferredPrompt) {
        // If no install prompt available, show manual instructions based on browser
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

        let instructions = ''
        if (isSafari && isIOS) {
          instructions = 'Safari iOS: Tap the Share button, then select "Add to Home Screen"'
        } else if (isSafari) {
          instructions = 'Safari: Click Share button → Add to Dock (or File menu → Add to Dock)'
        } else {
          instructions = 'Chrome: Click the install icon in the address bar, or go to Menu → Install JWT Debugger'
        }

        this.$q.notify({
          message: 'To install this app:',
          caption: instructions,
          position: 'center',
          timeout: 6000,
          multiLine: true,
          actions: [{ label: 'Dismiss', color: 'white' }]
        })
        return
      }
      // Show the install prompt
      this.deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice
      // We no longer need the prompt. Clear it up.
      this.deferredPrompt = null
      // Hide the install button regardless of outcome
      this.showPWAInstall = false
    }
  }
}
</script>