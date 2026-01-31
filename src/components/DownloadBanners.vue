<template>
  <div class="column items-center" v-if="!$q.platform.is.electron">
    <div class="col" v-if="$q.platform.is.desktop && ($q.platform.is.mac || $q.platform.is.win || $q.platform.is.linux)">
      <q-banner rounded class="bg-grey-3">
        <div class="row items-center q-gutter-md">
          <div class="col">
            <div class="text-subtitle1 q-mb-xs">Download Desktop App</div>
            <div class="text-caption text-grey-7">Available for Mac, Windows, and Linux</div>
          </div>
          <div>
            <q-btn
              unelevated
              color="primary"
              icon="download"
              label="View Releases"
              @click="openReleases"
              no-caps
            />
          </div>
        </div>
      </q-banner>
    </div>
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