<template>
  <div v-if="!$q.platform.is.electron && $q.platform.is.desktop && ($q.platform.is.mac || $q.platform.is.win || $q.platform.is.linux)" class="bg-grey-3 q-pa-md rounded-borders">
    <div class="text-h6">Download Desktop App</div>
    <div class="text-caption text-grey">
      Available for Mac, Windows, and Linux
    </div>
    <q-btn
      unelevated
      color="primary"
      icon="download"
      label="View Releases"
      @click="openReleases"
      no-caps
      class="q-mt-sm full-width"
    />
  </div>
</template>

<script>
import { openURL } from 'quasar'

export default {
  data() {
    return {
      releasesUrl: 'https://github.com/abhishektiwari/jwt-debugger/releases/latest'
    }
  },
  methods: {
    openReleases() {
      openURL(this.releasesUrl)
    }
  }
}
</script>