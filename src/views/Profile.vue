<template>
  <div class="profile-page">
    <div class="container py-5">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-body text-center">
              <div class="position-relative d-inline-block mb-3">
                <img :src="user.avatar" class="rounded-circle" width="80" height="80" :alt="user.name">
                <button class="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0" style="width: 24px; height: 24px; padding: 0;">
                  <i class="fas fa-camera" style="font-size: 0.7rem;"></i>
                </button>
              </div>
              <h5 class="mb-1">{{ user.name }}</h5>
              <p class="text-muted mb-0">{{ user.email }}</p>
              <small class="text-muted">Tham gia từ {{ formatDate(user.joinDate) }}</small>
            </div>
          </div>
          
          <div class="card shadow-sm border-0 mt-3">
            <div class="card-body">
              <h6 class="card-title">Thống kê</h6>
              <div class="row text-center">
                <div class="col-6">
                  <div class="border-end">
                    <h4 class="text-primary mb-0">{{ user.totalOrders }}</h4>
                    <small class="text-muted">Đơn hàng</small>
                  </div>
                </div>
                <div class="col-6">
                  <h4 class="text-success mb-0">{{ formatPrice(user.totalSpent) }}</h4>
                  <small class="text-muted">Đã chi tiêu</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="col-lg-9">
          <!-- Tab Navigation -->
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom">
              <ul class="nav nav-tabs card-header-tabs" role="tablist">
                <li class="nav-item">
                  <button 
                    :class="['nav-link', { active: activeTab === 'profile' }]"
                    @click="activeTab = 'profile'"
                  >
                    <i class="fas fa-user me-2"></i>Thông tin cá nhân
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    :class="['nav-link', { active: activeTab === 'password' }]"
                    @click="activeTab = 'password'"
                  >
                    <i class="fas fa-lock me-2"></i>Đổi mật khẩu
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    :class="['nav-link', { active: activeTab === 'orders' }]"
                    @click="activeTab = 'orders'"
                  >
                    <i class="fas fa-shopping-bag me-2"></i>Đơn hàng
                  </button>
                </li>
              </ul>
            </div>
            
            <div class="card-body">
              <!-- Profile Tab -->
              <div v-show="activeTab === 'profile'" class="tab-content">
                <h5 class="mb-4">Thông tin cá nhân</h5>
                
                <!-- Success/Error Messages -->
                <div v-if="profileSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
                  <i class="fas fa-check-circle me-2"></i>{{ profileSuccess }}
                  <button type="button" class="btn-close" @click="profileSuccess = ''"></button>
                </div>
                
                <div v-if="profileError" class="alert alert-danger alert-dismissible fade show" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>{{ profileError }}
                  <button type="button" class="btn-close" @click="profileError = ''"></button>
                </div>
                
                <form @submit.prevent="updateProfile">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="name" class="form-label">Họ và tên *</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                        <input 
                          v-model="profileForm.name" 
                          type="text" 
                          class="form-control" 
                          id="name" 
                          required
                          placeholder="Nhập họ và tên"
                        >
                      </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">Email *</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                        <input 
                          v-model="profileForm.email" 
                          type="email" 
                          class="form-control" 
                          id="email" 
                          required
                          placeholder="Nhập email"
                        >
                      </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label">Số điện thoại</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-phone"></i></span>
                        <input 
                          v-model="profileForm.phone" 
                          type="tel" 
                          class="form-control" 
                          id="phone"
                          placeholder="Nhập số điện thoại"
                        >
                      </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                      <label for="birthDate" class="form-label">Ngày sinh</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-calendar"></i></span>
                        <input 
                          v-model="profileForm.birthDate" 
                          type="date" 
                          class="form-control" 
                          id="birthDate"
                        >
                      </div>
                    </div>
                    
                    <div class="col-12 mb-3">
                      <label for="address" class="form-label">Địa chỉ</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                        <textarea 
                          v-model="profileForm.address" 
                          class="form-control" 
                          id="address"
                          rows="3"
                          placeholder="Nhập địa chỉ"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="isProfileLoading">
                      <i v-if="!isProfileLoading" class="fas fa-save me-2"></i>
                      <span v-if="isProfileLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ isProfileLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin' }}
                    </button>
                    <button type="button" class="btn btn-outline-secondary" @click="resetProfileForm">
                      <i class="fas fa-undo me-2"></i>Khôi phục
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- Password Tab -->
              <div v-show="activeTab === 'password'" class="tab-content">
                <h5 class="mb-4">Đổi mật khẩu</h5>
                
                <!-- Success/Error Messages -->
                <div v-if="passwordSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
                  <i class="fas fa-check-circle me-2"></i>{{ passwordSuccess }}
                  <button type="button" class="btn-close" @click="passwordSuccess = ''"></button>
                </div>
                
                <div v-if="passwordError" class="alert alert-danger alert-dismissible fade show" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>{{ passwordError }}
                  <button type="button" class="btn-close" @click="passwordError = ''"></button>
                </div>
                
                <form @submit.prevent="changePassword">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="currentPassword" class="form-label">Mật khẩu hiện tại *</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fas fa-lock"></i></span>
                          <input 
                            v-model="passwordForm.currentPassword" 
                            :type="showCurrentPassword ? 'text' : 'password'" 
                            class="form-control" 
                            id="currentPassword" 
                            required
                            placeholder="Nhập mật khẩu hiện tại"
                          >
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary" 
                            @click="showCurrentPassword = !showCurrentPassword"
                          >
                            <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="newPassword" class="form-label">Mật khẩu mới *</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fas fa-lock"></i></span>
                          <input 
                            v-model="passwordForm.newPassword" 
                            :type="showNewPassword ? 'text' : 'password'" 
                            class="form-control" 
                            id="newPassword" 
                            required
                            placeholder="Nhập mật khẩu mới"
                            minlength="6"
                          >
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary" 
                            @click="showNewPassword = !showNewPassword"
                          >
                            <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                          </button>
                        </div>
                        <div class="form-text">Mật khẩu phải có ít nhất 6 ký tự</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="confirmPassword" class="form-label">Xác nhận mật khẩu mới *</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fas fa-lock"></i></span>
                          <input 
                            v-model="passwordForm.confirmPassword" 
                            :type="showConfirmPassword ? 'text' : 'password'" 
                            class="form-control" 
                            id="confirmPassword" 
                            required
                            placeholder="Nhập lại mật khẩu mới"
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
                    </div>
                    
                    <div class="col-md-6">
                      <div class="card bg-light border-0 h-100">
                        <div class="card-body">
                          <h6 class="card-title">
                            <i class="fas fa-shield-alt text-primary me-2"></i>Bảo mật mật khẩu
                          </h6>
                          <ul class="list-unstyled mb-0">
                            <li class="mb-2">
                              <i class="fas fa-check text-success me-2"></i>
                              Sử dụng ít nhất 6 ký tự
                            </li>
                            <li class="mb-2">
                              <i class="fas fa-check text-success me-2"></i>
                              Kết hợp chữ và số
                            </li>
                            <li class="mb-2">
                              <i class="fas fa-check text-success me-2"></i>
                              Không sử dụng thông tin cá nhân
                            </li>
                            <li class="mb-0">
                              <i class="fas fa-check text-success me-2"></i>
                              Thay đổi định kỳ
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="isPasswordLoading">
                      <i v-if="!isPasswordLoading" class="fas fa-key me-2"></i>
                      <span v-if="isPasswordLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ isPasswordLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}
                    </button>
                    <button type="button" class="btn btn-outline-secondary" @click="resetPasswordForm">
                      <i class="fas fa-undo me-2"></i>Khôi phục
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- Orders Tab -->
              <div v-show="activeTab === 'orders'" class="tab-content">
                <h5 class="mb-4">Đơn hàng của tôi</h5>
                
                <div class="text-center py-5">
                  <i class="fas fa-shopping-bag text-muted" style="font-size: 3rem;"></i>
                  <h6 class="mt-3 text-muted">Chưa có đơn hàng nào</h6>
                  <p class="text-muted">Hãy bắt đầu mua sắm để xem lịch sử đơn hàng tại đây</p>
                  <router-link to="/" class="btn btn-primary">
                    <i class="fas fa-shopping-cart me-2"></i>Mua sắm ngay
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

// Composables
const router = useRouter()
const { user, isLoggedIn } = useAuth()

// Check if user is logged in
if (!isLoggedIn.value) {
  router.push('/login')
}

// Tab state
const activeTab = ref('profile')

// Profile form
const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  address: ''
})

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// UI states
const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)
const profileSuccess = ref('')
const profileError = ref('')
const passwordSuccess = ref('')
const passwordError = ref('')

// Password visibility
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const resetProfileForm = () => {
  profileForm.value = {
    name: user.value.name || '',
    email: user.value.email || '',
    phone: user.value.phone || '',
    birthDate: user.value.birthDate || '',
    address: user.value.address || ''
  }
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const updateProfile = async () => {
  profileError.value = ''
  profileSuccess.value = ''
  isProfileLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update user data in localStorage
    const updatedUser = {
      ...user.value,
      ...profileForm.value
    }
    
    localStorage.setItem('easymart-user', JSON.stringify(updatedUser))
    
    // Update reactive user data
    Object.assign(user.value, updatedUser)
    
    profileSuccess.value = 'Thông tin cá nhân đã được cập nhật thành công!'
    
  } catch (error) {
    profileError.value = 'Có lỗi xảy ra khi cập nhật thông tin!'
  } finally {
    isProfileLoading.value = false
  }
}

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  
  // Validate passwords
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Mật khẩu mới không khớp!'
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Mật khẩu mới phải có ít nhất 6 ký tự!'
    return
  }
  
  isPasswordLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    passwordSuccess.value = 'Mật khẩu đã được thay đổi thành công!'
    resetPasswordForm()
    
  } catch (error) {
    passwordError.value = 'Có lỗi xảy ra khi thay đổi mật khẩu!'
  } finally {
    isPasswordLoading.value = false
  }
}

// Initialize form data
onMounted(() => {
  resetProfileForm()
})
</script>

<style scoped>
.profile-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
  background-color: transparent;
}

.nav-tabs .nav-link:hover {
  color: #007bff;
  border-color: transparent;
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

.card {
  border-radius: 0.75rem;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>