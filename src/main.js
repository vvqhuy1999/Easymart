import { createApp } from 'vue'
import App from './App.vue'

// Import Router
import router from './router'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// Import custom styles
import './assets/styles.css'

// Import API Client for token management
import { startTokenAutoRefresh, isTokenValid } from './utils/apiClient'

// Import auth utilities
import { useAuth } from './composables/useAuth'

// Create app
const app = createApp(App)

// Use router
app.use(router)

// Start token auto-refresh if user is logged in
if (isTokenValid()) {
  console.log('Starting JWT token auto-refresh...')
  startTokenAutoRefresh()
}

// Setup auto-logout checking for blacklisted tokens
if (typeof window !== 'undefined') {
  // Check token blacklist every 30 seconds
  setInterval(async () => {
    const { autoLogoutIfInvalid } = useAuth()
    await autoLogoutIfInvalid()
  }, 30000) // 30 seconds
  
  // Also check on page focus (when user comes back to tab)
  window.addEventListener('focus', async () => {
    const { autoLogoutIfInvalid } = useAuth()
    await autoLogoutIfInvalid()
  })
  
  console.log('🔐 Auto-logout checking enabled (30s interval + on focus)')
}

// Mount app
app.mount('#app')