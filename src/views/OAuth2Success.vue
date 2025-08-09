<template>
  <div>
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh; background: #f8fafc;">
      <div class="card shadow p-4 border-0" style="max-width: 400px; width: 100%; border-radius: 1.5rem;">
        <div class="text-center">
          <!-- Loading state -->
          <div v-if="isLoading" class="mb-4">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Đang xử lý...</span>
            </div>
            <h3 class="mt-3 text-primary">{{ loadingMessage }}</h3>
            <p class="text-muted">Vui lòng đợi...</p>
          </div>
          
          <!-- Success state -->
          <div v-if="success" class="mb-4">
            <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
            <h3 class="mt-3 text-success">{{ successMessage }}</h3>
            <p class="text-muted">Đang chuyển hướng...</p>
          </div>
          
          <!-- Error state -->
          <div v-if="error" class="mb-4">
            <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
            <h3 class="mt-3 text-warning">Cần đăng ký tài khoản</h3>
            <p class="text-muted mb-3">{{ errorMessage }}</p>
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              Bạn sẽ được chuyển hướng đến trang đăng ký để hoàn tất quá trình.
            </div>
            <button @click="goToLogin" class="btn btn-secondary me-2">
              <i class="fas fa-arrow-left me-2"></i>
              Quay lại đăng nhập
            </button>
            <button @click="goToRegister" class="btn btn-primary">
              <i class="fas fa-user-plus me-2"></i>
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- OAuth Confirmation Dialog -->
    <OAuthConfirmDialog
      :show="showConfirmDialog"
      :user-info="pendingUserInfo"
      :provider="oauthProvider"
      :is-new-user="isNewUser"
      @confirm="handleOAuthConfirm"
      @cancel="handleOAuthCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import OAuthConfirmDialog from '../components/OAuthConfirmDialog.vue'

// Composables
const router = useRouter()
const { handleOAuth2Callback } = useAuth()

// UI states
const isLoading = ref(true)
const success = ref(false)
const error = ref(false)
const loadingMessage = ref('Đang xử lý đăng nhập OAuth2...')
const successMessage = ref('')
const errorMessage = ref('')

// OAuth confirmation dialog states
const showConfirmDialog = ref(false)
const pendingUserInfo = ref({})
const oauthProvider = ref('google')
const isNewUser = ref(false)

// Process OAuth2 success callback from backend
onMounted(async () => {
  console.log('OAuth2 Success page loaded')
  console.log('Current URL:', window.location.href)
  
  try {
    loadingMessage.value = 'Đang xử lý thông tin đăng nhập...'
    
    // Extract parameters from URL (from backend redirect)
    const urlParams = new URLSearchParams(window.location.search)
    const successParam = urlParams.get('success')
    const token = urlParams.get('token')
    const email = urlParams.get('email')
    const role = urlParams.get('role')
    const userId = urlParams.get('userId')
    
    console.log('OAuth2 URL params:', { success: successParam, token: token ? 'EXISTS' : 'NULL', email, role, userId })
    
    if (successParam === 'true' && token) {
      // Check if user exists in our system
      const userEmail = email || ''
      if (userEmail) {
        try {
          const { checkEmailDuplicate } = useAuth()
          const emailCheck = await checkEmailDuplicate(userEmail)
          
                     if (emailCheck.success && emailCheck.result.exists) {
             // User exists - show confirmation dialog for login
             const userInfo = {
               name: email ? email.split('@')[0] : 'OAuth User',
               email: userEmail,
               avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email ? email.split('@')[0] : 'OAuth User')}&background=007bff&color=fff`
             }
             
             pendingUserInfo.value = userInfo
             oauthProvider.value = 'google'
             isNewUser.value = false
             showConfirmDialog.value = true
             isLoading.value = false
             return
           } else {
             // User doesn't exist - show confirmation dialog for registration
             const userInfo = {
               name: email ? email.split('@')[0] : 'OAuth User',
               email: userEmail,
               avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email ? email.split('@')[0] : 'OAuth User')}&background=007bff&color=fff`
             }
             
             pendingUserInfo.value = userInfo
             oauthProvider.value = 'google'
             isNewUser.value = true
             showConfirmDialog.value = true
             isLoading.value = false
             return
           }
          
        } catch (checkError) {
          console.error('Error checking user existence:', checkError)
          // Fallback to auto-login if check fails
        }
      }
      
      // Fallback: auto-login if no email or check failed
      const userData = {
        id: userId || 'OAUTH_USER',
        name: email ? email.split('@')[0] : 'OAuth User',
        email: email || '',
        phone: '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email ? email.split('@')[0] : 'OAuth User')}&background=007bff&color=fff`,
        joinDate: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent: 0,
        role: role || 'USER',
        loginMethod: 'google'
      }
      
      // Store JWT token and user info
      localStorage.setItem('easymart-token', token)
      localStorage.setItem('easymart-user', JSON.stringify(userData))
      
      isLoading.value = false
      success.value = true
      successMessage.value = `Chào mừng ${userData.name}!`
      
      console.log('✅ OAuth2 Login successful!')
      console.log('Token stored:', token ? 'YES' : 'NO')
      console.log('User data:', userData)
      
      // Get intended redirect path
      const redirectPath = sessionStorage.getItem('oauth2-frontend-redirect') || 
                          localStorage.getItem('easymart-redirect-after-login') || 
                          '/'
      
      // Clean up
      sessionStorage.removeItem('oauth2-frontend-redirect')
      localStorage.removeItem('easymart-redirect-after-login')
      
      // Clean URL parameters
      window.history.replaceState({}, document.title, '/oauth2/success')
      
      // Redirect after success message
      setTimeout(() => {
        // If redirect path is login or register, go to home instead
        if (redirectPath.includes('/login') || redirectPath.includes('/register')) {
          router.push('/')
        } else {
          router.push(redirectPath)
        }
      }, 2000)
      
    } else {
      // OAuth2 failed
      console.error('❌ OAuth2 Login failed')
      throw new Error('OAuth2 đăng nhập thất bại hoặc thiếu thông tin')
    }
    
  } catch (err) {
    console.error('OAuth2 Success page error:', err)
    isLoading.value = false
    error.value = true
    errorMessage.value = err.message || 'Đăng nhập OAuth2 thất bại'
  }
})

// Go back to login page
const goToLogin = () => {
  router.push('/login')
}

// Go to register page
const goToRegister = () => {
  router.push('/register?oauth=pending')
}

// Handle OAuth confirmation
const handleOAuthConfirm = (data) => {
  const { userInfo, isNewUser, provider } = data
  
  if (isNewUser) {
    // Redirect to register with user info
    sessionStorage.setItem('pending-oauth-user-info', JSON.stringify(userInfo))
    router.push('/register?oauth=pending')
  } else {
    // Proceed with login
    const userData = {
      id: 'OAUTH_USER',
      name: userInfo.name,
      email: userInfo.email,
      phone: '',
      avatar: userInfo.avatar,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      role: 'USER',
      loginMethod: provider
    }
    
    // Store JWT token and user info
    const token = new URLSearchParams(window.location.search).get('token')
    if (token) {
      localStorage.setItem('easymart-token', token)
      localStorage.setItem('easymart-user', JSON.stringify(userData))
    }
    
    // Show success and redirect
    showConfirmDialog.value = false
    success.value = true
    successMessage.value = `Chào mừng ${userData.name}! Đăng nhập thành công.`
    
    // Redirect after success message
    setTimeout(() => {
      const redirectPath = sessionStorage.getItem('oauth2-frontend-redirect') || 
                          localStorage.getItem('easymart-redirect-after-login') || 
                          '/'
      sessionStorage.removeItem('oauth2-frontend-redirect')
      localStorage.removeItem('easymart-redirect-after-login')
      
      if (redirectPath.includes('/login') || redirectPath.includes('/register')) {
        router.push('/')
      } else {
        router.push(redirectPath)
      }
    }, 2000)
  }
}

// Handle OAuth cancellation
const handleOAuthCancel = () => {
  showConfirmDialog.value = false
  router.push('/login')
}
</script>

<style scoped>
.card {
  border-radius: 1.5rem;
}

.fas {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
