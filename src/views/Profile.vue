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
                    :class="['nav-link', { active: activeTab === 'shipping' }]"
                    @click="activeTab = 'shipping'"
                  >
                    <i class="fas fa-shipping-fast me-2"></i>Thông tin giao hàng
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
              <div v-show="activeTab === 'shipping'" class="tab-content">
                <h5 class="mb-4">Thông tin giao hàng</h5>
                
                <!-- Data Status Info -->
                <div v-if="!hasCustomerData && !hasFormData" class="alert alert-warning mb-3">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  <strong>Chưa có thông tin giao hàng</strong><br>
                  Vui lòng nhập thông tin giao hàng của bạn.
                </div>
                
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
                  <!-- Thông tin cá nhân -->
                  <div class="card mb-4">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">
                        <i class="fas fa-user me-2 text-primary"></i>
                        Thông tin cá nhân
                      </h6>
                    </div>
                    <div class="card-body">
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
                              disabled
                            >
                          </div>
                          <small class="text-muted">Email không thể thay đổi</small>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                          <label for="phone" class="form-label">Số điện thoại *</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-phone"></i></span>
                            <input 
                              v-model="profileForm.phone" 
                              type="tel" 
                              class="form-control" 
                              id="phone"
                              required
                              placeholder="Nhập số điện thoại"
                            >
                          </div>
                          <small class="text-muted">Số điện thoại để liên lạc khi giao hàng</small>
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
                      </div>
                    </div>
                  </div>
                  
                  <!-- Thông tin địa chỉ giao hàng -->
                  <div class="card mb-4">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">
                        <i class="fas fa-map-marker-alt me-2 text-success"></i>
                        Địa chỉ giao hàng
                      </h6>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-12 mb-3">
                          <label for="address" class="form-label">Địa chỉ chi tiết *</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                            <textarea 
                              v-model="profileForm.address" 
                              class="form-control" 
                              id="address"
                              rows="3"
                              required
                              placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                            ></textarea>
                          </div>
                          <small class="text-muted">Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="isProfileLoading">
                      <i v-if="!isProfileLoading" class="fas fa-save me-2"></i>
                      <span v-if="isProfileLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ isProfileLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin giao hàng' }}
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
const activeTab = ref('shipping')

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
const displayName = computed(() => customerInfo.value.hoTen || customerInfo.value.tenNguoiDung || user.value?.name || 'User')
const displayEmail = computed(() => user.value?.email || 'No email')
const displayJoinDate = computed(() => customerInfo.value.ngayTao || customerInfo.value.ngayDangKy || user.value?.joinDate)
const displayOrders = computed(() => customerInfo.value.tongDonHang || user.value?.totalOrders || 0)
const displaySpent = computed(() => customerInfo.value.tongChiTieu || user.value?.totalSpent || 0)

// Computed property để kiểm tra xem form có dữ liệu hay không
const hasFormData = computed(() => {
  return profileForm.value.name || 
         profileForm.value.phone || 
         profileForm.value.birthDate || 
         profileForm.value.address
})

// Computed property để kiểm tra xem customerInfo có dữ liệu hay không
const hasCustomerData = computed(() => {
  return customerInfo.value.hoTen || 
         customerInfo.value.sdt || 
         customerInfo.value.ngaySinh || 
         customerInfo.value.diaChi
})

// Computed property để kiểm tra xem có trường nào thiếu dữ liệu không
const hasMissingFields = computed(() => {
  return !customerInfo.value.sdt || 
         !customerInfo.value.ngaySinh || 
         !customerInfo.value.diaChi ||
         !profileForm.value.address ||
         !profileForm.value.phone
})

// Computed property để đếm số trường có dữ liệu
const completedFieldsCount = computed(() => {
  let count = 0
  if (customerInfo.value.hoTen) count++
  if (customerInfo.value.sdt) count++
  if (customerInfo.value.ngaySinh) count++
  if (customerInfo.value.diaChi) count++
  if (profileForm.value.address) count++
  if (profileForm.value.phone) count++
  return count
})

// Computed property để tính phần trăm hoàn thành
const completionPercentage = computed(() => {
  return Math.round((completedFieldsCount.value / 5) * 100)
})

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
    console.log('📝 Profile form data before update:', profileForm.value)
    
    // Lấy maKH từ customerInfo
    const maKH = customerInfo.value?.maKH
    if (!maKH) {
      throw new Error('Không tìm thấy mã khách hàng!')
    }
    
    // Prepare update data - sử dụng field names đúng với backend
    const updateData = {
      hoTen: profileForm.value.name,
      sdt: profileForm.value.phone, // Backend sử dụng sdt
      ngaySinh: profileForm.value.birthDate,
      diaChi: profileForm.value.address,
      taiKhoan: user.value?.email // Thêm taiKhoan
    }
    
    console.log('📤 Update data prepared:', updateData)
    console.log('📱 Phone number being sent:', profileForm.value.phone)
    console.log('🏷️ Name being sent:', profileForm.value.name)
    console.log('📍 Address being sent:', profileForm.value.address)
    console.log('📅 Birth date being sent:', profileForm.value.birthDate)
    console.log('🔑 maKH being used:', maKH)
    
    // Sử dụng API mới để cập nhật profile
    const token = getTokenFromCookie()
    if (!token) {
      throw new Error('Không có token xác thực!')
    }
    
    const updateEndpoint = `${API_CONFIG.BASE_URL}/api/khachhang/${maKH}/update-info`
    console.log('🔗 Update endpoint:', updateEndpoint)
    
    const updateResponse = await fetch(updateEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    })
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}))
      throw new Error(`HTTP error! status: ${updateResponse.status}, message: ${errorData.message || 'Unknown error'}`)
    }
    
    const updateResult = await updateResponse.json()
    console.log('📥 Update response:', updateResult)
    
    // Kiểm tra response format khác nhau
    if (updateResult?.success || updateResult?.result?.success || updateResult?.message?.includes('thành công')) {
      console.log('✅ Update successful, refreshing user data...')
      profileSuccess.value = updateResult.message || 'Thông tin giao hàng đã được cập nhật thành công!'
      
      // Cập nhật lại customerInfo trong user state nếu có thay đổi
      if (user.value && user.value.customerInfo) {
        user.value.customerInfo.hoTen = profileForm.value.name
        user.value.customerInfo.sdt = profileForm.value.phone
        user.value.customerInfo.ngaySinh = profileForm.value.birthDate
        user.value.customerInfo.diaChi = profileForm.value.address
      }
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        profileSuccess.value = ''
      }, 3000)
      
      console.log('✅ Profile updated successfully')
    } else {
      console.log('⚠️ Update response format unexpected:', updateResult)
      profileError.value = updateResult.message || updateResult.error || 'Có lỗi xảy ra khi cập nhật thông tin giao hàng!'
    }
    
  } catch (error) {
    console.error('❌ Profile update error:', error)
    profileError.value = 'Có lỗi xảy ra khi cập nhật thông tin giao hàng: ' + error.message
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
    
    // Cải thiện logic mapping dữ liệu
    const mappedData = {
      name: newCustomerInfo.hoTen || newCustomerInfo.tenNguoiDung || '',
      email: user.value?.email || '',
      phone: newCustomerInfo.sdt || newCustomerInfo.soDienThoai || newCustomerInfo.phone || '',
      birthDate: newCustomerInfo.ngaySinh || '',
      address: newCustomerInfo.diaChi || newCustomerInfo.address || ''
    }
    
    console.log('🔄 Mapped data from customerInfo:', mappedData)
    
    // Cập nhật form với dữ liệu đã được map
    profileForm.value = { ...profileForm.value, ...mappedData }
    
    console.log('🔄 Form auto-updated from customerInfo:', profileForm.value)
  }
}, { immediate: true, deep: true })

// Function để lấy thông tin profile từ API mới
const fetchProfileInfo = async () => {
  try {
    console.log('📡 Fetching profile info from new API...')
    
    // Lấy maKH từ customerInfo hoặc từ user state
    const maKH = customerInfo.value?.maKH || user.value?.customerInfo?.maKH
    if (!maKH) {
      console.log('⚠️ No maKH found, falling back to validateProfileAccess')
      return await validateProfileAccess()
    }
    
    // Sử dụng API mới để lấy thông tin profile
    const token = getTokenFromCookie()
    if (!token) {
      throw new Error('Không có token xác thực!')
    }
    
    const infoEndpoint = `${API_CONFIG.BASE_URL}/api/khachhang/${maKH}/info`
    console.log('🔗 Fetching from endpoint:', infoEndpoint)
    
    const infoResponse = await fetch(infoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!infoResponse.ok) {
      const errorData = await infoResponse.json().catch(() => ({}))
      console.log('⚠️ New API failed, falling back to validateProfileAccess')
      return await validateProfileAccess()
    }
    
    const infoResult = await infoResponse.json()
    console.log('📥 New API response:', infoResult)
    console.log('📥 New API response type:', typeof infoResult)
    console.log('📥 New API response keys:', Object.keys(infoResult || {}))
    
    // Cập nhật customerInfo với dữ liệu mới - xử lý nhiều format khác nhau
    let newCustomerData = null
    
    // Kiểm tra các format response có thể có
    if (infoResult?.data) {
      newCustomerData = infoResult.data
      console.log('✅ Found data in infoResult.data')
    } else if (infoResult?.result) {
      newCustomerData = infoResult.result
      console.log('✅ Found data in infoResult.result')
    } else if (infoResult?.hoTen || infoResult?.sdt || infoResult?.diaChi) {
      // Nếu response trực tiếp chứa customer data
      newCustomerData = infoResult
      console.log('✅ Found data directly in infoResult')
    } else if (Array.isArray(infoResult)) {
      // Nếu response là array, lấy phần tử đầu tiên
      newCustomerData = infoResult[0]
      console.log('✅ Found data in infoResult[0] (array response)')
    } else {
      console.log('⚠️ New API response format analysis:')
      console.log('  - infoResult:', infoResult)
      console.log('  - infoResult.constructor:', infoResult?.constructor?.name)
      console.log('  - infoResult.toString():', infoResult?.toString())
      
      console.log('⚠️ New API response format unexpected, falling back to validateProfileAccess')
      return await validateProfileAccess()
    }
    
    if (newCustomerData) {
      console.log('🔄 New customer data received:', newCustomerData)
      console.log('🔄 New customer data keys:', Object.keys(newCustomerData || {}))
      
      // Cập nhật user state với dữ liệu mới
      if (user.value?.customerInfo) {
        user.value.customerInfo = { ...user.value.customerInfo, ...newCustomerData }
        console.log('✅ Customer info updated in user state')
      }
      
      return { success: true, data: newCustomerData }
    } else {
      console.log('⚠️ Could not extract data from new API response, falling back to validateProfileAccess')
      return await validateProfileAccess()
    }
    
  } catch (error) {
    console.error('❌ Error fetching profile info:', error)
    console.log('🔄 Falling back to validateProfileAccess due to error')
    return await validateProfileAccess()
  }
}

// Initialize form data
onMounted(async () => {
  try {
    console.log('🚀 Profile page mounted, starting validation...')
    
    // Thử sử dụng API mới trước, fallback về API cũ nếu cần
    const result = await fetchProfileInfo()
    
    if (result.success) {
      console.log('✅ Profile fetched successfully')
      console.log('👤 Current customerInfo:', customerInfo.value)
      
      // Force update form with fresh customer data
      if (customerInfo.value && Object.keys(customerInfo.value).length > 0) {
        // Sử dụng logic mapping tương tự như trong watch
        const mappedData = {
          name: customerInfo.value.hoTen || customerInfo.value.tenNguoiDung || '',
          email: user.value?.email || '',
          phone: customerInfo.value.sdt || customerInfo.value.soDienThoai || customerInfo.value.phone || '',
          birthDate: customerInfo.value.ngaySinh || '',
          address: customerInfo.value.diaChi || customerInfo.value.address || ''
        }
        
        profileForm.value = { ...profileForm.value, ...mappedData }
        
        console.log('📝 Form populated with customer data:', profileForm.value)
        console.log('🏷️ Name field value:', profileForm.value.name)
        console.log('📱 Phone field value:', profileForm.value.phone)
        console.log('📍 Address field value:', profileForm.value.address)
        console.log('📅 Birth date field value:', profileForm.value.birthDate)
      } else {
        console.log('⚠️ customerInfo is empty or undefined')
      }
    } else {
      console.error('❌ Profile fetch failed:', result.error)
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