<template>
  <div class="column items-center" v-if="!$q.platform.is.electron">
    <div class="col" v-if="$q.platform.is.desktop && $q.platform.is.mac">
      <q-banner rounded class="bg-grey-3">
        Download the JWT Debugger for Mac Desktop
        <q-btn
          unelevated
          round
          color="primary"
          icon="fas fa-download"
          @click="launch(macDownloadUrl)"
        />
      </q-banner>
    </div>
    <div class="col" v-if="$q.platform.is.desktop && $q.platform.is.win">
      <q-banner rounded class="bg-grey-3">
        Download the JWT Debugger for Windows Desktop
        <q-btn
          unelevated
          round
          color="primary"
          icon="fas fa-download"
          @click="launch(windowsDownloadUrl)"
        />
      </q-banner>
    </div>
    <div class="col" v-if="$q.platform.is.desktop && $q.platform.is.linux">
      <q-banner rounded class="bg-grey-3">
        Download the JWT Debugger for Debian Desktop
        <q-btn
          unelevated
          round
          color="primary"
          icon="fas fa-download"
          @click="launch(linuxDownloadUrl)"
        />
      </q-banner>
    </div>
  </div>
</template>

<script>
import { openURL } from 'quasar'

export default {
  data() {
    return {
      macDownloadUrl: import.meta.env.VITE_DOWNLOAD_URL_MAC,
      windowsDownloadUrl: import.meta.env.VITE_DOWNLOAD_URL_WINDOWS,
      linuxDownloadUrl: import.meta.env.VITE_DOWNLOAD_URL_LINUX
    }
  },
  methods: {
    launch(url) {
      openURL(url)
    }
  }
}
</script>