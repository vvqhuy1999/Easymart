<template>
  <div class="profile-page">
    <div class="container py-5">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-body text-center">
              <div class="position-relative d-inline-block mb-3">
                <img :src="user?.avatar || 'https://via.placeholder.com/80'" class="rounded-circle" width="80" height="80" :alt="user?.name || 'User'">
                <button class="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0" style="width: 24px; height: 24px; padding: 0;">
                  <i class="fas fa-camera" style="font-size: 0.7rem;"></i>
                </button>
              </div>
              <h5 class="mb-1">{{ displayName }}</h5>
              <p class="text-muted mb-0">{{ displayEmail }}</p>
              <small class="text-muted">Tham gia từ {{ formatDate(displayJoinDate) }}</small>
            </div>
          </div>
          
          <div class="card shadow-sm border-0 mt-3">
            <div class="card-body">
              <h6 class="card-title">Thông tin khách hàng</h6>
              <div class="row text-center">
                <div class="col-6">
                  <div class="border-end">
                    <h6 class="text-primary mb-0">{{ customerInfo?.maKH || 'N/A' }}</h6>
                    <small class="text-muted">Mã KH</small>
                  </div>
                </div>
                <div class="col-6">
                  <h6 class="text-success mb-0">{{ customerInfo?.diemTichLuy || 0 }}</h6>
                  <small class="text-muted">Điểm tích lũy</small>
                </div>
              </div>
              <div class="mt-2 text-center">
                <span class="badge bg-info">{{ customerInfo?.loaiKhachHang || 'Thường' }}</span>
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
                          :value="customerInfo?.hoTen || profileForm.name" 
                          @input="profileForm.name = $event.target.value"
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
                          disabled
                        >
                      </div>
                      <small class="text-muted">Email không thể thay đổi</small>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label">Số điện thoại</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-phone"></i></span>
                        <input 
                          :value="customerInfo?.sdt || profileForm.phone" 
                          @input="profileForm.phone = $event.target.value"
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
                          :value="customerInfo?.ngaySinh || profileForm.birthDate" 
                          @input="profileForm.birthDate = $event.target.value"
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
                          :value="customerInfo?.diaChi || profileForm.address" 
                          @input="profileForm.address = $event.target.value"
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
                  </div>
                </form>
              </div>
              
              <!-- Password Tab -->
              <div v-show="activeTab === 'password'" class="tab-content">
                <h5 class="mb-4">Đổi mật khẩu</h5>
                
                <!-- Success/Error Messages -->
                <div v-if="passwordSuccess" class="alert alert-success alert-dismissible fade show" role="alert" style="background-color: #d4edda !important; border-color: #c3e6cb !important; color: #155724 !important;">
                  <i class="fas fa-check-circle me-2"></i>{{ passwordSuccess }}
                  <button type="button" class="btn-close" @click="passwordSuccess = ''"></button>
                </div>
                
                <div v-if="passwordError" class="alert alert-danger alert-dismissible fade show" role="alert" style="background-color: #f8d7da !important; border-color: #f5c6cb !important; color: #721c24 !important;">
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
                    

                  </div>
                </form>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { API_CONFIG } from '../config/api'

// Composables
const router = useRouter()
const { user, isLoggedIn, validateProfileAccess, updateCustomerProfile } = useAuth()

// Helper function to get token from cookie
const getTokenFromCookie = () => {
  return document.cookie.split('; ').find(row => row.startsWith('easymart-token='))?.split('=')[1]
}

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

// Computed properties for customer data
const customerInfo = computed(() => user.value?.customerInfo || {})
const displayName = computed(() => customerInfo.value.hoTen || user.value?.name || 'User')
const displayEmail = computed(() => user.value?.email || 'No email')
const displayJoinDate = computed(() => customerInfo.value.ngayTao || user.value?.joinDate)
const displayOrders = computed(() => customerInfo.value.tongDonHang || user.value?.totalOrders || 0)
const displaySpent = computed(() => customerInfo.value.tongChiTieu || user.value?.totalSpent || 0)

// Debug computed properties
const debugFormData = computed(() => ({
  formName: profileForm.value.name,
  customerName: customerInfo.value.hoTen,
  userValue: user.value?.customerInfo?.hoTen,
  formPhone: profileForm.value.phone,
  customerPhone: customerInfo.value.sdt,
  formAddress: profileForm.value.address,
  customerAddress: customerInfo.value.diaChi
}))

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Chưa có thông tin'
  
  try {
    // Handle different date formats from API
    let date
    if (typeof dateString === 'string') {
      // Try to parse the date string
      date = new Date(dateString)
    } else if (dateString instanceof Date) {
      date = dateString
    } else {
      return 'Chưa có thông tin'
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Chưa có thông tin'
    }
    
    return date.toLocaleDateString('vi-VN')
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Chưa có thông tin'
  }
}

const formatPrice = (price) => {
  if (!price || isNaN(price) || price === 0) {
    return '0 ₫'
  }
  
  try {
    // Convert to number if it's a string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    
    if (isNaN(numericPrice)) {
      return '0 ₫'
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numericPrice)
  } catch (error) {
    console.error('Price formatting error:', error)
    return '0 ₫'
  }
}



const resetPasswordForm = () => {
  // Reset form fields
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  
  // Reset password visibility
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
  
  // Auto-hide success message after 3 seconds
  if (passwordSuccess.value) {
    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)
  }
}



const updateProfile = async () => {
  profileError.value = ''
  profileSuccess.value = ''
  isProfileLoading.value = true
  
  try {
    // Prepare update data - sử dụng field names đúng với backend
    const updateData = {
      hoTen: profileForm.value.name,
      sdt: profileForm.value.phone, // Backend sử dụng sdt, không phải soDienThoai
      ngaySinh: profileForm.value.birthDate,
      diaChi: profileForm.value.address
    }
    
    console.log('📝 Profile form data:', profileForm.value)
    console.log('📤 Update data prepared:', updateData)
    console.log('📱 Phone number being sent:', profileForm.value.phone)
    
    // Call API to update profile
    const result = await updateCustomerProfile(updateData)
    
    if (result.success) {
      profileSuccess.value = result.message || 'Thông tin cá nhân đã được cập nhật thành công!'
      // Refresh profile data
      await validateProfileAccess()
      // Form data will be automatically updated from customerInfo
    } else {
      profileError.value = result.error || 'Có lỗi xảy ra khi cập nhật thông tin!'
    }
    
  } catch (error) {
    console.error('Profile update error:', error)
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
  
  // Additional password validation
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/
  if (!passwordRegex.test(passwordForm.value.newPassword)) {
    passwordError.value = 'Mật khẩu phải chứa cả chữ và số!'
    return
  }
  
  // Check if new password is same as current password
  if (passwordForm.value.newPassword === passwordForm.value.currentPassword) {
    passwordError.value = 'Mật khẩu mới không được giống mật khẩu hiện tại!'
    return
  }
  
  isPasswordLoading.value = true
  
  try {
    // Get JWT token from cookie
    const token = getTokenFromCookie()
    if (!token) {
      passwordError.value = 'Không có token xác thực!'
      return
    }
    
    // Call API to change password
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/nguoidung/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
        confirmPassword: passwordForm.value.confirmPassword
      })
    })
    
    const result = await response.json()
    
    // Check if response is successful (status 200-299)
    if (response.ok) {
      // Check different success indicators
      const isSuccess = result.success || result.message?.includes('thành công') || result.message?.includes('success')
      
      if (isSuccess) {
        passwordSuccess.value = 'Mật khẩu đã được thay đổi thành công!'
        
        // Reset form immediately
        passwordForm.value.currentPassword = ''
        passwordForm.value.newPassword = ''
        passwordForm.value.confirmPassword = ''
        
        // Reset password visibility
        showCurrentPassword.value = false
        showNewPassword.value = false
        showConfirmPassword.value = false
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          passwordSuccess.value = ''
        }, 3000)
        
      } else {
        passwordError.value = result.message || result.error || 'Có lỗi xảy ra khi thay đổi mật khẩu!'
      }
      
    } else {
      passwordError.value = result.message || result.error || `HTTP Error: ${response.status} ${response.statusText}`
    }
    
  } catch (error) {
    console.error('Change password error:', error)
    passwordError.value = 'Có lỗi xảy ra khi thay đổi mật khẩu!'
  } finally {
    isPasswordLoading.value = false
  }
}

// Watch for changes in customerInfo and auto-update form
watch(customerInfo, (newCustomerInfo) => {
  if (newCustomerInfo && Object.keys(newCustomerInfo).length > 0) {
    console.log('👀 customerInfo changed:', newCustomerInfo)
    profileForm.value = {
      name: newCustomerInfo.hoTen || '',
      email: user.value?.email || '',
      phone: newCustomerInfo.sdt || '',
      birthDate: newCustomerInfo.ngaySinh || '',
      address: newCustomerInfo.diaChi || ''
    }
    console.log('🔄 Form auto-updated from customerInfo:', profileForm.value)
  }
}, { immediate: true })

// Initialize form data
onMounted(async () => {
  try {
    console.log('🚀 Profile page mounted, starting validation...')
    // Validate profile access and get fresh data
    const result = await validateProfileAccess()
    if (result.success) {
      console.log('✅ Profile validated successfully')
      console.log('👤 Current customerInfo:', customerInfo.value)
      
      // Force update form with fresh customer data
      if (customerInfo.value && Object.keys(customerInfo.value).length > 0) {
        profileForm.value = {
          name: customerInfo.value.hoTen || '',
          email: user.value?.email || '',
          phone: customerInfo.value.sdt || '',
          birthDate: customerInfo.value.ngaySinh || '',
          address: customerInfo.value.diaChi || ''
        }
        console.log('📝 Form populated with customer data:', profileForm.value)
        console.log('🏷️ Name field value:', profileForm.value.name)
        console.log('📱 Phone field value:', profileForm.value.phone)
        console.log('📍 Address field value:', profileForm.value.address)
      } else {
        console.log('⚠️ customerInfo is empty or undefined')
      }
    } else {
      console.error('❌ Profile validation failed:', result.error)
      // Redirect to login if validation fails
      router.push('/login')
    }
  } catch (error) {
    console.error('❌ Profile initialization error:', error)
    router.push('/login')
  }
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

/* Custom alert colors để đảm bảo hiển thị đúng */
.alert-success {
  background-color: #d4edda !important;
  border-color: #c3e6cb !important;
  color: #155724 !important;
}

.alert-danger {
  background-color: #f8d7da !important;
  border-color: #f5c6cb !important;
  color: #721c24 !important;
}

/* Override any conflicting CSS */
.alert.alert-success {
  background-color: #d4edda !important;
  border-color: #c3e6cb !important;
  color: #155724 !important;
}

.alert.alert-danger {
  background-color: #f8d7da !important;
  border-color: #f5c6cb !important;
  color: #721c24 !important;
}

/* Force success color with highest specificity */
div[class*="alert-success"], 
.alert-success, 
.alert.alert-success,
div.alert.alert-success,
div[class*="alert-success"][class*="alert-dismissible"],
.alert-success.alert-dismissible,
.alert.alert-success.alert-dismissible {
  background-color: #d4edda !important;
  border-color: #c3e6cb !important;
  color: #155724 !important;
}

/* Force danger color with highest specificity */
div[class*="alert-danger"], 
.alert-danger, 
.alert.alert-danger,
div.alert.alert-danger,
div[class*="alert-danger"][class*="alert-dismissible"],
.alert-danger.alert-dismissible,
.alert.alert-danger.alert-dismissible {
  background-color: #f8d7da !important;
  border-color: #f5c6cb !important;
  color: #721c24 !important;
}

/* Additional specificity for password tab alerts */
.tab-content .alert-success,
.tab-content .alert.alert-success,
.tab-content div.alert.alert-success {
  background-color: #d4edda !important;
  border-color: #c3e6cb !important;
  color: #155724 !important;
}

.tab-content .alert-danger,
.tab-content .alert.alert-danger,
.tab-content div.alert.alert-danger {
  background-color: #f8d7da !important;
  border-color: #f5c6cb !important;
  color: #721c24 !important;
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