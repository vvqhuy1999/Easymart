<template>
  <div>
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh; background: #f8fafc;">
      <div class="card shadow p-4 border-0" style="max-width: 400px; width: 100%; border-radius: 1.5rem;">
        <h2 class="mb-4 text-center text-primary fw-bold">Đăng ký</h2>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center mb-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang đăng ký...</span>
          </div>
          <p class="mt-2 text-muted">Đang xử lý...</p>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
        </div>
        
        <!-- Success message -->
        <div v-if="success" class="alert alert-success" role="alert">
          <i class="fas fa-check-circle me-2"></i>{{ success }}
        </div>
        
        <form @submit.prevent="handleRegister" :class="{ 'd-none': isLoading }">
          <div class="mb-3">
            <label for="name" class="form-label">Họ và tên</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-user"></i></span>
              <input 
                v-model="name" 
                type="text" 
                class="form-control" 
                id="name" 
                required 
                autocomplete="name"
                placeholder="Nhập họ và tên"
              >
            </div>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-envelope"></i></span>
              <input 
                v-model="email" 
                type="email" 
                class="form-control" 
                id="email" 
                required 
                autocomplete="username"
                placeholder="Nhập email của bạn"
              >
            </div>
          </div>
          <div class="mb-3">
            <label for="phone" class="form-label">Số điện thoại</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-phone"></i></span>
              <input 
                v-model="phone" 
                type="tel" 
                class="form-control" 
                id="phone" 
                required 
                autocomplete="tel"
                placeholder="Nhập số điện thoại"
                pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10-11 chữ số"
              >
            </div>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                class="form-control" 
                id="password" 
                required 
                autocomplete="new-password"
                placeholder="Nhập mật khẩu"
              >
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Nhập lại mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input 
                v-model="confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                class="form-control" 
                id="confirmPassword" 
                required 
                autocomplete="new-password"
                placeholder="Nhập lại mật khẩu"
              >
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="agreeTerms" v-model="agreeTerms" required>
            <label class="form-check-label" for="agreeTerms">
              Tôi đồng ý với <a href="#" class="text-primary">điều khoản sử dụng</a>
            </label>
          </div>
          
          <button type="submit" class="btn btn-primary w-100 fw-bold" :disabled="isLoading">
            <i v-if="!isLoading" class="fas fa-user-plus me-2"></i>
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký' }}
          </button>
        </form>
        
        <!-- Divider -->
        <div class="text-center my-3" :class="{ 'd-none': isLoading }">
          <div class="position-relative">
            <hr>
            <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">hoặc</span>
          </div>
        </div>
        
        <!-- Social Register Buttons -->
        <div class="mb-3" :class="{ 'd-none': isLoading }">
          <GoogleSignIn 
            button-text="Đăng ký với Google"
            :loading="isLoading"
            @google-login="handleGoogleRegister"
          />
        </div>
        <div class="mb-3" :class="{ 'd-none': isLoading }">
          <FacebookSignIn 
            button-text="Đăng ký với Facebook"
            :loading="isLoading"
            @facebook-login="handleFacebookRegister"
          />
        </div>
        
        <div class="text-center mt-3" :class="{ 'd-none': isLoading }">
          <span>Đã có tài khoản?</span>
          <router-link to="/login" class="ms-1 text-primary">Đăng nhập</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import GoogleSignIn from '../components/GoogleSignIn.vue'
import FacebookSignIn from '../components/FacebookSignIn.vue'
import { API_CONFIG, getApiUrl } from '../config/api'

// Composables
const router = useRouter()
const { register, registerWithGoogle, registerWithFacebook, handleOAuth2Callback } = useAuth()

// Form data
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// UI states
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Check if there's a pending social registration or OAuth2 callback
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const googlePending = urlParams.get('google')
  const facebookPending = urlParams.get('facebook')
  const oauthPending = urlParams.get('oauth')
  const code = urlParams.get('code')
  
  // Handle OAuth2 callback
  if (code) {
    console.log('Detected OAuth2 callback in Register with code:', code)
    isLoading.value = true
    success.value = 'Đang xử lý đăng ký OAuth2...'
    
    try {
      const result = await handleOAuth2Callback()
      
      if (result && result.success) {
        success.value = `Chào mừng ${result.user.name}! Đăng ký thành công. Đang chuyển hướng...`
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Redirect after success message
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else if (result && !result.success) {
        error.value = result.error || 'OAuth2 callback thất bại'
      }
    } catch (err) {
      console.error('OAuth2 callback error in Register:', err)
      error.value = 'Có lỗi xảy ra khi xử lý OAuth2 callback'
    } finally {
      isLoading.value = false
    }
    return
  }
  
  // Handle pending Google registration from Login redirect
  if (googlePending === 'pending') {
    const pendingCredential = sessionStorage.getItem('pending-google-credential')
    if (pendingCredential) {
      // Auto-fill with Google info and show message
      try {
        const payload = JSON.parse(atob(pendingCredential.split('.')[1]))
        name.value = payload.name || ''
        email.value = payload.email || ''
        
        // Show info message
        success.value = 'Thông tin từ Google đã được điền sẵn. Nhấn đăng ký với Google để tiếp tục.'
        
        sessionStorage.removeItem('pending-google-credential')
      } catch (err) {
        console.error('Error processing pending Google credential:', err)
        sessionStorage.removeItem('pending-google-credential')
      }
    }
  }
  
  // Handle pending Facebook registration from Login redirect
  if (facebookPending === 'pending') {
    const pendingCredential = sessionStorage.getItem('pending-facebook-credential')
    if (pendingCredential) {
      // Auto-fill with Facebook info and show message
      try {
        const payload = JSON.parse(atob(pendingCredential.split('.')[1]))
        name.value = payload.name || ''
        email.value = payload.email || ''
        
        // Show info message
        success.value = 'Thông tin từ Facebook đã được điền sẵn. Nhấn đăng ký với Facebook để tiếp tục.'
        
        sessionStorage.removeItem('pending-facebook-credential')
      } catch (err) {
        console.error('Error processing pending Facebook credential:', err)
        sessionStorage.removeItem('pending-facebook-credential')
      }
    }
  }
  
  // Handle pending OAuth registration from Login redirect
  if (oauthPending === 'pending') {
    const pendingUserInfo = sessionStorage.getItem('pending-oauth-user-info')
    if (pendingUserInfo) {
      try {
        const userInfo = JSON.parse(pendingUserInfo)
        name.value = userInfo.name || ''
        email.value = userInfo.email || ''
        
        // Show info message
        success.value = 'Thông tin từ OAuth đã được điền sẵn. Vui lòng hoàn tất đăng ký.'
        
        sessionStorage.removeItem('pending-oauth-user-info')
      } catch (err) {
        console.error('Error processing pending OAuth user info:', err)
        sessionStorage.removeItem('pending-oauth-user-info')
      }
    }
  }
})

async function handleRegister() {
  // Clear previous messages
  error.value = ''
  success.value = ''
  
  // Validate form
  if (password.value !== confirmPassword.value) {
    error.value = 'Mật khẩu không khớp!'
    return
  }
  
  // Validate phone number
  const phoneRegex = /^[0-9]{10,11}$/
  if (!phoneRegex.test(phone.value)) {
    error.value = 'Số điện thoại phải có 10-11 chữ số!'
    return
  }
  
  if (!agreeTerms.value) {
    error.value = 'Vui lòng đồng ý với điều khoản sử dụng!'
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await register(name.value, email.value, phone.value, password.value, confirmPassword.value)
    
    if (result.success) {
      success.value = `Chào mừng ${result.user.name}! Đăng ký thành công. Đang chuyển hướng...`
      
      // Redirect after success message
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      error.value = result.error || 'Đăng ký thất bại'
    }
  } catch (err) {
    error.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    isLoading.value = false
  }
}

async function handleGoogleRegister(response) {
  // Clear previous messages
  error.value = ''
  success.value = ''
  
  try {
    // Check if response is valid
    if (!response.success) {
      error.value = response.error || 'Đăng ký với Google thất bại'
      return
    }

    // If this is a redirect response, show loading and redirect
    if (response.redirect) {
      success.value = response.message || 'Đang chuyển hướng tới Google OAuth2...'
      isLoading.value = true
      // Don't set isLoading to false since we're redirecting
      return
    }

    // Handle other cases (if any)
    const result = await registerWithGoogle(response)
    
    if (result.success) {
      if (result.redirect) {
        // Đang redirect tới Google OAuth2, hiển thị loading message
        success.value = result.message || 'Đang chuyển hướng tới Google OAuth2...'
        isLoading.value = true
        // Không tắt isLoading vì đang redirect
        return
      } else if (result.user) {
        success.value = `Chào mừng ${result.user.name}! Đăng ký thành công. Đang chuyển hướng...`
        
        // Redirect after success message
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } else {
      error.value = result.error || 'Đăng ký với Google thất bại'
    }
  } catch (err) {
    console.error('Google register error:', err)
    error.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    if (!success.value.includes('chuyển hướng tới Google OAuth2')) {
      isLoading.value = false
    }
  }
}

async function handleFacebookRegister(response) {
  // Clear previous messages
  error.value = ''
  success.value = ''
  
  try {
    // Check if response is valid
    if (!response.success) {
      error.value = response.error || 'Đăng ký với Facebook thất bại'
      return
    }

    // If this is a redirect response, show loading and redirect
    if (response.redirect) {
      success.value = response.message || 'Đang chuyển hướng tới Facebook OAuth2...'
      isLoading.value = true
      // Don't set isLoading to false since we're redirecting
      return
    }

    // Handle other cases (if any)
    const result = await registerWithFacebook(response)
    
    if (result.success) {
      if (result.redirect) {
        // Đang redirect tới Facebook OAuth2, hiển thị loading message
        success.value = result.message || 'Đang chuyển hướng tới Facebook OAuth2...'
        isLoading.value = true
        // Không tắt isLoading vì đang redirect
        return
      } else if (result.user) {
        success.value = `Chào mừng ${result.user.name}! Đăng ký thành công. Đang chuyển hướng...`
        
        // Redirect after success message
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } else {
      error.value = result.error || 'Đăng ký với Facebook thất bại'
    }
  } catch (err) {
    console.error('Facebook register error:', err)
    error.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    if (!success.value.includes('chuyển hướng tới Facebook OAuth2')) {
      isLoading.value = false
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 1.5rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.form-control:focus {
  border-left: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group .form-control {
  border-left: none;
}

.input-group .form-control:first-child {
  border-left: 1px solid #ced4da;
}

.btn-outline-secondary {
  border-left: none;
}
</style>