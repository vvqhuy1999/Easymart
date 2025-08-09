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

// Create app
const app = createApp(App)

// Use router
app.use(router)

// Start token auto-refresh if user is logged in
if (isTokenValid()) {
  console.log('Starting JWT token auto-refresh...')
  startTokenAutoRefresh()
}

// Mount app
app.mount('#app')