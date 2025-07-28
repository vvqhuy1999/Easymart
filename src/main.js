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

// Import Google Login
import vue3GoogleLogin from 'vue3-google-login'

// Create app
const app = createApp(App)

// Use router
app.use(router)

// Configure Google Login
app.use(vue3GoogleLogin, {
  clientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com' // Replace with your actual Google Client ID
})

// Mount app
app.mount('#app')