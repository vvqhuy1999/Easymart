<template>
  <div>
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh; background: #f8fafc;">
      <div class="card shadow p-4 border-0" style="max-width: 400px; width: 100%; border-radius: 1.5rem;">
        <h2 class="mb-4 text-center text-primary fw-bold">Quên mật khẩu</h2>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center mb-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang xử lý...</span>
          </div>
          <p class="mt-2 text-muted">Đang gửi yêu cầu...</p>
        </div>
        
        <!-- Success message -->
        <div v-if="success" class="alert alert-success" role="alert">
          <i class="fas fa-check-circle me-2"></i>{{ success }}
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
        </div>
        
        <!-- Info message -->
        <div v-if="info" class="alert alert-info" role="alert">
          <i class="fas fa-info-circle me-2"></i>{{ info }}
        </div>
        
        <!-- Step 1: Email Form -->
        <form v-if="currentStep === 1 && !success" @submit.prevent="handleSendOtp" :class="{ 'd-none': isLoading }">
          <div class="mb-4">
            <p class="text-muted text-center">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </p>
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
                autocomplete="email"
                placeholder="Nhập email của bạn"
                :disabled="isLoading"
              >
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary w-100 fw-bold mb-3" :disabled="isLoading">
            <i v-if="!isLoading" class="fas fa-paper-plane me-2"></i>
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'Đang gửi...' : 'Gửi mã OTP' }}
          </button>
        </form>

        <!-- Step 2: OTP Verification -->
        <form v-if="currentStep === 2" @submit.prevent="handleVerifyOtp" :class="{ 'd-none': isLoading }">
          <div class="mb-4">
            <p class="text-muted text-center">
              Nhập mã OTP đã được gửi đến <strong>{{ email }}</strong>
            </p>
          </div>
          
          <div class="mb-3">
            <label for="otp" class="form-label">Mã OTP</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-key"></i></span>
              <input 
                v-model="otp" 
                type="text" 
                class="form-control text-center" 
                id="otp" 
                required 
                maxlength="6"
                placeholder="Nhập 6 số OTP"
                :disabled="isLoading"
              >
            </div>
            <small class="text-muted">Mã OTP có 6 số, hiệu lực trong 5 phút</small>
          </div>
          
          <div class="d-flex gap-2 mb-3">
            <button type="submit" class="btn btn-primary flex-fill" :disabled="isLoading">
              <i v-if="!isLoading" class="fas fa-check me-2"></i>
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isLoading ? 'Đang xác thực...' : 'Xác thực OTP' }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="resendOtp" :disabled="isResending">
              <i v-if="!isResending" class="fas fa-redo me-2"></i>
              <span v-if="isResending" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isResending ? 'Đang gửi...' : 'Gửi lại' }}
            </button>
          </div>
        </form>

        <!-- Step 3: Reset Password -->
        <form v-if="currentStep === 3" @submit.prevent="handleResetPassword" :class="{ 'd-none': isLoading }">
          <div class="mb-4">
            <p class="text-muted text-center">
              Tạo mật khẩu mới cho tài khoản <strong>{{ email }}</strong>
            </p>
          </div>
          
          <div class="mb-3">
            <label for="newPassword" class="form-label">Mật khẩu mới</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input 
                v-model="newPassword" 
                :type="showNewPassword ? 'text' : 'password'" 
                class="form-control" 
                id="newPassword" 
                required 
                minlength="6"
                placeholder="Nhập mật khẩu mới"
                :disabled="isLoading"
              >
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="showNewPassword = !showNewPassword"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <small class="text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
          </div>
          
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input 
                v-model="confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                class="form-control" 
                id="confirmPassword" 
                required 
                minlength="6"
                placeholder="Nhập lại mật khẩu mới"
                :disabled="isLoading"
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
          
          <button type="submit" class="btn btn-primary w-100 fw-bold mb-3" :disabled="isLoading">
            <i v-if="!isLoading" class="fas fa-save me-2"></i>
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu' }}
          </button>
        </form>
        
        <!-- Back to Login -->
        <div class="text-center mt-3">
          <router-link to="/login" class="text-muted text-decoration-none">
            <i class="fas fa-arrow-left me-1"></i>Quay lại đăng nhập
          </router-link>
        </div>
        
        <!-- Additional Help -->
        <div class="mt-4 p-3 bg-light rounded" :class="{ 'd-none': isLoading }">
          <h6 class="text-muted mb-2"><i class="fas fa-lightbulb me-2"></i>Lưu ý:</h6>
          <small class="text-muted">
            • Kiểm tra hộp thư email của bạn<br>
            • Kiểm tra thư mục spam nếu không thấy<br>
            • Mã OTP có hiệu lực trong 5 phút<br>
            • Quy trình: Gửi OTP → Xác thực OTP → Đặt lại mật khẩu
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_CONFIG } from '../config/api'

// Composables
const router = useRouter()

// Form data
const email = ref('')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// UI states
const currentStep = ref(1)
const isLoading = ref(false)
const isResending = ref(false)
const error = ref('')
const success = ref('')
const info = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Step 1: Gửi OTP
async function handleSendOtp() {
  // Clear previous messages
  error.value = ''
  success.value = ''
  info.value = ''
  
  // Basic validation
  if (!email.value) {
    error.value = 'Vui lòng nhập email'
    return
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Email không hợp lệ'
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PASSWORD_RESET.SEND_OTP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      success.value = `Đã gửi mã OTP đến ${email.value}. Vui lòng kiểm tra email của bạn.`
      currentStep.value = 2
      
      // Clear OTP field
      otp.value = ''
      
    } else {
      // Xử lý các trường hợp lỗi khác nhau
      if (response.status === 404) {
        error.value = 'Email không tồn tại trong hệ thống'
      } else if (response.status === 429) {
        error.value = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 5 phút trước khi thử lại'
      } else if (response.status === 500) {
        error.value = 'Lỗi hệ thống. Vui lòng thử lại sau'
      } else {
        error.value = result.message || result.error || 'Có lỗi xảy ra, vui lòng thử lại sau'
      }
    }
    
  } catch (err) {
    console.error('Send OTP error:', err)
    error.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại'
  } finally {
    isLoading.value = false
  }
}

// Step 2: Xác thực OTP
async function handleVerifyOtp() {
  error.value = ''
  
  if (!otp.value) {
    error.value = 'Vui lòng nhập mã OTP'
    return
  }
  
  if (otp.value.length !== 6) {
    error.value = 'Mã OTP phải có 6 số'
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PASSWORD_RESET.VERIFY_OTP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        otpCode: otp.value
      })
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      success.value = 'Mã OTP hợp lệ! Vui lòng tạo mật khẩu mới.'
      currentStep.value = 3
      
      // Clear password fields
      newPassword.value = ''
      confirmPassword.value = ''
      
    } else {
      if (response.status === 400) {
        error.value = 'Mã OTP không đúng hoặc đã hết hạn'
      } else if (response.status === 404) {
        error.value = 'Email không tồn tại trong hệ thống'
      } else {
        error.value = result.message || result.error || 'Có lỗi xảy ra khi xác thực OTP'
      }
    }
    
  } catch (err) {
    console.error('Verify OTP error:', err)
    error.value = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau'
  } finally {
    isLoading.value = false
  }
}

// Step 3: Đặt lại mật khẩu
async function handleResetPassword() {
  error.value = ''
  
  // Validation
  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }
  
  if (newPassword.value.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }
  
  // Password strength validation
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/
  if (!passwordRegex.test(newPassword.value)) {
    error.value = 'Mật khẩu phải chứa cả chữ và số'
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PASSWORD_RESET.RESET_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        otpCode: otp.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
      })
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      success.value = 'Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...'
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } else {
      if (response.status === 400) {
        error.value = 'Mã OTP không đúng hoặc đã hết hạn'
      } else if (response.status === 404) {
        error.value = 'Email không tồn tại trong hệ thống'
      } else {
        error.value = result.message || result.error || 'Có lỗi xảy ra khi đặt lại mật khẩu'
      }
    }
    
  } catch (err) {
    console.error('Reset password error:', err)
    error.value = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau'
  } finally {
    isLoading.value = false
  }
}

// Gửi lại OTP
async function resendOtp() {
  isResending.value = true
  error.value = ''
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PASSWORD_RESET.SEND_OTP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      info.value = 'Đã gửi lại mã OTP mới. Vui lòng kiểm tra email của bạn.'
      otp.value = ''
      
      // Auto hide info message
      setTimeout(() => {
        info.value = ''
      }, 5000)
      
    } else {
      if (response.status === 429) {
        error.value = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 5 phút trước khi thử lại'
      } else {
        error.value = result.message || result.error || 'Có lỗi xảy ra khi gửi lại OTP'
      }
    }
    
  } catch (err) {
    console.error('Resend OTP error:', err)
    error.value = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau'
  } finally {
    isResending.value = false
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.alert {
  border-radius: 0.75rem;
  border: none;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
}
</style>
