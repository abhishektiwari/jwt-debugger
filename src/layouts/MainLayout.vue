<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          JWT Debugger
        </q-toolbar-title>

        <q-btn
          flat
          dense
          icon="open_in_new"
          label="GitHub"
          @click="openGitHub"
          no-caps
        >
          <q-tooltip>View on GitHub</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MainLayout',
  components: {
  },
  data () {
    return {
      githubUrl: 'https://github.com/abhishektiwari/jwt-debugger'
    }
  },
  methods: {
    openGitHub() {
      openURL(this.githubUrl)
    }
  }
}
</script>