<template>
  <div class="google-signin-wrapper">
    <!-- Google Sign-In Button -->
    <div class="d-grid">
      <button 
        type="button" 
        class="btn btn-outline-danger w-100 fw-bold google-signin-btn" 
        :disabled="loading"
        @click="handleDirectGoogleLogin"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        <i v-else class="fab fa-google me-2"></i>
        {{ loading ? 'Đang xử lý...' : buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { API_CONFIG, getApiUrl, API_BASE_URL } from '../config/api'

// Props
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Đăng nhập với Google'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['google-login'])

// Handle direct Google login - redirect to backend OAuth2
const handleDirectGoogleLogin = () => {
  console.log('Direct Google login clicked')
  
  try {
    // Emit loading state
    emit('google-login', { 
      success: true, 
      redirect: true, 
      message: 'Đang chuyển hướng tới Google OAuth2...' 
    })
    
    // Store current frontend URL để backend có thể redirect về đúng chỗ
    const frontendRedirectUrl = window.location.origin + window.location.pathname
    sessionStorage.setItem('oauth2-frontend-redirect', frontendRedirectUrl)
    
    // Get Google OAuth2 authorization URL from backend  
    const googleAuthUrl = getApiUrl(API_CONFIG.AUTHORIZATION.GOOGLE)
    console.log('Redirecting to Google OAuth2:', googleAuthUrl)
    console.log('Frontend redirect URL stored:', frontendRedirectUrl)
    
    // Redirect to backend OAuth2 endpoint
    setTimeout(() => {
      window.location.href = googleAuthUrl
    }, 500)
    
  } catch (error) {
    console.error('Google OAuth2 redirect error:', error)
    // Emit error state
    emit('google-login', { 
      success: false, 
      error: 'Không thể chuyển hướng tới Google OAuth2. Vui lòng thử lại.' 
    })
  }
}
</script>

<style scoped>
.google-signin-btn {
  border-color: #db4437;
  color: #db4437;
  transition: all 0.3s ease;
}

.google-signin-btn:hover:not(:disabled) {
  background-color: #db4437;
  border-color: #db4437;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(219, 68, 55, 0.3);
}

.google-signin-btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(219, 68, 55, 0.25);
}

.google-signin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.position-relative hr {
  margin: 0;
}

.position-relative span {
  font-size: 0.875rem;
}
</style>
