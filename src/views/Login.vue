<template>
  <div>
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh; background: #f8fafc;">
      <div class="card shadow p-4 border-0" style="max-width: 400px; width: 100%; border-radius: 1.5rem;">
        <h2 class="mb-4 text-center text-primary fw-bold">Đăng nhập</h2>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center mb-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang đăng nhập...</span>
          </div>
          <p class="mt-2 text-muted">Đang xử lý...</p>
        </div>
        
        <!-- Login required message -->
        <div v-if="loginRequired" class="alert alert-info" role="alert">
          <i class="fas fa-info-circle me-2"></i>
          Vui lòng đăng nhập để tiến hành thanh toán!
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
        </div>
        
        <!-- Success message -->
        <div v-if="success" class="alert alert-success" role="alert">
          <i class="fas fa-check-circle me-2"></i>{{ success }}
        </div>
        
        <form @submit.prevent="handleLogin" :class="{ 'd-none': isLoading }">
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
            <label for="password" class="form-label">Mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                class="form-control" 
                id="password" 
                required 
                autocomplete="current-password"
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
          
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
            <label class="form-check-label" for="rememberMe">
              Ghi nhớ đăng nhập
            </label>
          </div>
          
          <button type="submit" class="btn btn-primary w-100 fw-bold" :disabled="isLoading">
            <i v-if="!isLoading" class="fas fa-sign-in-alt me-2"></i>
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>
        
        <!-- Divider -->
        <div class="text-center my-3">
          <div class="position-relative">
            <hr>
            <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">hoặc</span>
          </div>
        </div>
        
        <!-- Social Login Buttons -->
        <div class="mb-3">
          <GoogleSignIn 
            :loading="isLoading"
            @google-login="handleGoogleLogin"
          />
        </div>
        <div class="mb-3">
          <FacebookSignIn 
            :loading="isLoading"
            @facebook-login="handleFacebookLogin"
          />
        </div>
        
        <div class="text-center mt-3" :class="{ 'd-none': isLoading }">
          <span>Bạn chưa có tài khoản?</span>
          <router-link to="/register" class="ms-1 text-primary">Đăng ký</router-link>
        </div>
        
        <!-- Demo accounts -->
        <div class="mt-4 p-3 bg-light rounded" :class="{ 'd-none': isLoading }">
          <h6 class="text-muted mb-2"><i class="fas fa-info-circle me-2"></i>Tài khoản demo:</h6>
          <small class="text-muted">
            Email: demo@easymart.vn<br>
            Mật khẩu: bất kỳ
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import GoogleSignIn from '../components/GoogleSignIn.vue'
import FacebookSignIn from '../components/FacebookSignIn.vue'

// Composables
const router = useRouter()
const { login, loginWithGoogle, loginWithFacebook, handleOAuth2Callback } = useAuth()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// UI states
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const loginRequired = ref(false)

// Check if login is required for checkout and handle OAuth2 callback
onMounted(async () => {
  const redirectPath = localStorage.getItem('easymart-redirect-after-login')
  loginRequired.value = redirectPath === '/checkout'
  
  // Check if this is an OAuth2 callback
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    console.log('Detected OAuth2 callback with code:', code)
    isLoading.value = true
    success.value = 'Đang xử lý đăng nhập OAuth2...'
    
    try {
      const result = await handleOAuth2Callback()
      
      if (result && result.success) {
        success.value = `Chào mừng ${result.user.name}! Đăng nhập thành công. Đang chuyển hướng...`
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Check for redirect after login
        const redirectPath = localStorage.getItem('easymart-redirect-after-login')
        localStorage.removeItem('easymart-redirect-after-login')
        
        // Redirect after success message
        setTimeout(() => {
          router.push(redirectPath || '/')
        }, 1500)
      } else if (result && result.needsRegistration) {
        // User doesn't exist - redirect to register with user info
        error.value = result.error
        if (result.userInfo) {
          // Store user info for registration
          sessionStorage.setItem('pending-oauth-user-info', JSON.stringify(result.userInfo))
          setTimeout(() => {
            router.push('/register?oauth=pending')
          }, 2000)
        }
      } else if (result && !result.success) {
        error.value = result.error || 'OAuth2 callback thất bại'
      }
    } catch (err) {
      console.error('OAuth2 callback error:', err)
      error.value = 'Có lỗi xảy ra khi xử lý OAuth2 callback'
    } finally {
      isLoading.value = false
    }
  }
})

async function handleLogin() {
  // Clear previous messages
  error.value = ''
  success.value = ''
  isLoading.value = true
  
  try {
    const result = await login(email.value, password.value)
    
    if (result.success) {
      success.value = `Chào mừng ${result.user.name}! Đang chuyển hướng...`
      
      // Check for redirect after login
      const redirectPath = localStorage.getItem('easymart-redirect-after-login')
      localStorage.removeItem('easymart-redirect-after-login')
      
      // Redirect after success message
      setTimeout(() => {
        router.push(redirectPath || '/')
      }, 1500)
    } else {
      error.value = result.error || 'Đăng nhập thất bại'
    }
  } catch (err) {
    error.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    isLoading.value = false
  }
}

// Handle Google Login
async function handleGoogleLogin(response) {
  error.value = ''
  success.value = ''
  isLoading.value = true
  
  try {
    // Check if response is valid
    if (!response.success) {
      error.value = response.error || 'Đăng nhập với Google thất bại'
      return
    }

    const result = await loginWithGoogle(response.credential)
    
    if (result.success) {
      if (result.redirect) {
        // Đang redirect tới Google OAuth2, hiển thị loading message
        success.value = result.message || 'Đang chuyển hướng tới Google OAuth2...'
        // Không tắt isLoading vì đang redirect
        return
      } else if (result.user) {
        success.value = `Chào mừng ${result.user.name}! Đang chuyển hướng...`
        
        // Check for redirect after login
        const redirectPath = localStorage.getItem('easymart-redirect-after-login')
        localStorage.removeItem('easymart-redirect-after-login')
        
        // Redirect after success message
        setTimeout(() => {
          router.push(redirectPath || '/')
        }, 1500)
      }
    } else {
      // Nếu cần registration, chuyển hướng tới trang đăng ký
      if (result.needsRegistration) {
        error.value = result.error
        // Store Google credential để sử dụng cho registration
        sessionStorage.setItem('pending-google-credential', response.credential)
        setTimeout(() => {
          router.push('/register?google=pending')
        }, 2000)
      } else {
        error.value = result.error || 'Đăng nhập với Google thất bại'
      }
    }
  } catch (err) {
    console.error('Google login error:', err)
    error.value = 'Có lỗi xảy ra khi đăng nhập với Google, vui lòng thử lại'
  } finally {
    if (!success.value.includes('chuyển hướng tới Google OAuth2')) {
      isLoading.value = false
    }
  }
}

// Handle Facebook Login
async function handleFacebookLogin(response) {
  error.value = ''
  success.value = ''
  isLoading.value = true
  
  try {
    // Check if response is valid
    if (!response.success) {
      error.value = response.error || 'Đăng nhập với Facebook thất bại'
      return
    }

    const result = await loginWithFacebook(response.credential)
    
    if (result.success) {
      if (result.redirect) {
        // Đang redirect tới Facebook OAuth2, hiển thị loading message
        success.value = result.message || 'Đang chuyển hướng tới Facebook OAuth2...'
        // Không tắt isLoading vì đang redirect
        return
      } else if (result.user) {
        success.value = `Chào mừng ${result.user.name}! Đang chuyển hướng...`
        
        // Check for redirect after login
        const redirectPath = localStorage.getItem('easymart-redirect-after-login')
        localStorage.removeItem('easymart-redirect-after-login')
        
        // Redirect after success message
        setTimeout(() => {
          router.push(redirectPath || '/')
        }, 1500)
      }
    } else {
      // Nếu cần registration, chuyển hướng tới trang đăng ký
      if (result.needsRegistration) {
        error.value = result.error
        // Store Facebook credential để sử dụng cho registration
        sessionStorage.setItem('pending-facebook-credential', response.credential)
        setTimeout(() => {
          router.push('/register?facebook=pending')
        }, 2000)
      } else {
        error.value = result.error || 'Đăng nhập với Facebook thất bại'
      }
    }
  } catch (err) {
    console.error('Facebook login error:', err)
    error.value = 'Có lỗi xảy ra khi đăng nhập với Facebook, vui lòng thử lại'
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