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

// Create app
const app = createApp(App)

// Use router
app.use(router)

// Mount app
app.mount('#app')