<template>
  <div class="facebook-signin-wrapper">
    <!-- Facebook Sign-In Button -->
    <div class="d-grid">
      <button 
        type="button" 
        class="btn btn-outline-primary w-100 fw-bold facebook-signin-btn" 
        :disabled="loading"
        @click="handleDirectFacebookLogin"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        <i v-else class="fab fa-facebook-f me-2"></i>
        {{ loading ? 'Đang xử lý...' : buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { API_CONFIG, getApiUrl } from '../config/api'

// Props
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Đăng nhập với Facebook'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['facebook-login'])

// Handle direct Facebook login - redirect to backend OAuth2
const handleDirectFacebookLogin = () => {
  console.log('Direct Facebook login clicked')
  
  // Emit loading state
  emit('facebook-login', { 
    success: true, 
    redirect: true, 
    message: 'Đang chuyển hướng tới Facebook OAuth2...' 
  })
  
  // Store current frontend URL để backend có thể redirect về đúng chỗ
  const frontendRedirectUrl = window.location.origin + window.location.pathname
  sessionStorage.setItem('oauth2-frontend-redirect', frontendRedirectUrl)
  
  // Get Facebook OAuth2 authorization URL from backend  
  const facebookAuthUrl = getApiUrl(API_CONFIG.AUTHORIZATION.FACEBOOK)
  console.log('Redirecting to Facebook OAuth2:', facebookAuthUrl)
  console.log('Frontend redirect URL stored:', frontendRedirectUrl)
  
  // Redirect to backend OAuth2 endpoint
  setTimeout(() => {
    window.location.href = facebookAuthUrl
  }, 500)
}
</script>

<style scoped>
.facebook-signin-btn {
  border-color: #1877f2;
  color: #1877f2;
  transition: all 0.3s ease;
}

.facebook-signin-btn:hover:not(:disabled) {
  background-color: #1877f2;
  border-color: #1877f2;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 119, 242, 0.3);
}

.facebook-signin-btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(24, 119, 242, 0.25);
}

.facebook-signin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
