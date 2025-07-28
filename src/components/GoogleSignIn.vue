<template>
  <div class="google-signin-wrapper">
    <!-- Divider -->
    <div class="text-center my-3">
      <div class="position-relative">
        <hr class="my-3">
        <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
          {{ dividerText }}
        </span>
      </div>
    </div>
    
    <!-- Google Sign-In Button -->
    <div class="d-grid">
      <GoogleLogin 
        :callback="handleGoogleCallback"
        prompt
        auto-login
        class="google-signin-btn"
      >
        <button type="button" class="btn btn-outline-danger w-100 fw-bold" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="fab fa-google me-2"></i>
          {{ loading ? 'Đang xử lý...' : buttonText }}
        </button>
      </GoogleLogin>
    </div>
  </div>
</template>

<script setup>
import { GoogleLogin } from 'vue3-google-login'

// Props
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Đăng nhập với Google'
  },
  dividerText: {
    type: String,
    default: 'hoặc'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['google-login'])

// Handle Google callback
const handleGoogleCallback = (response) => {
  emit('google-login', response)
}
</script>

<style scoped>
.google-signin-btn .btn-outline-danger {
  border-color: #db4437;
  color: #db4437;
  transition: all 0.3s ease;
}

.google-signin-btn .btn-outline-danger:hover:not(:disabled) {
  background-color: #db4437;
  border-color: #db4437;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(219, 68, 55, 0.3);
}

.google-signin-btn .btn-outline-danger:focus {
  box-shadow: 0 0 0 0.2rem rgba(219, 68, 55, 0.25);
}

.google-signin-btn .btn-outline-danger:disabled {
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