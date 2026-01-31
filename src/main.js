import { createApp } from 'vue'
import { Quasar, Notify } from 'quasar'
import quasarIconSet from 'quasar/icon-set/material-icons'

// Import Quasar css
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'
import router from './router/index'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './router/routes'

const app = createApp(App)

// Create router instance
// Use hash history for Electron (file:// protocol compatibility)
const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createWebHashHistory()
})

app.use(Quasar, {
  plugins: {
    Notify
  },
  iconSet: quasarIconSet
})

app.use(Router)

app.mount('#app')