<template>
  <div class="user-profile">
    <div class="card">
      <div class="card-header">
        <h5><i class="fas fa-user me-2"></i>Thông tin cá nhân</h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
        </div>
        
        <div v-else-if="userProfile">
          <div class="row">
            <div class="col-md-4 text-center">
              <img :src="userProfile.avatar" :alt="userProfile.name" class="rounded-circle mb-3" width="100" height="100">
              <h6>{{ userProfile.name }}</h6>
              <span class="badge bg-primary">{{ userProfile.role }}</span>
            </div>
            <div class="col-md-8">
              <table class="table table-borderless">
                <tr>
                  <td><strong>Email:</strong></td>
                  <td>{{ userProfile.email }}</td>
                </tr>
                <tr>
                  <td><strong>Số điện thoại:</strong></td>
                  <td>{{ userProfile.phone || 'Chưa cập nhật' }}</td>
                </tr>
                <tr>
                  <td><strong>Ngày tham gia:</strong></td>
                  <td>{{ formatDate(userProfile.joinDate) }}</td>
                </tr>
                <tr>
                  <td><strong>Tổng đơn hàng:</strong></td>
                  <td>{{ userProfile.totalOrders }}</td>
                </tr>
                <tr>
                  <td><strong>Tổng chi tiêu:</strong></td>
                  <td>{{ formatCurrency(userProfile.totalSpent) }}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="mt-3">
            <button @click="refreshProfile" class="btn btn-outline-primary me-2">
              <i class="fas fa-sync-alt me-2"></i>Làm mới
            </button>
            <button @click="testAPI" class="btn btn-outline-success">
              <i class="fas fa-flask me-2"></i>Test API Call
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { apiCall } from '../utils/apiClient'

// Local state
const loading = ref(false)
const error = ref('')
const userProfile = ref(null)

// Composables
const { user, getUserByEmail } = useAuth()

// Load user profile on mount
onMounted(() => {
  loadUserProfile()
})

// Load user profile (from localStorage first, then from API)
const loadUserProfile = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // First, use local user data
    if (user.value) {
      userProfile.value = user.value
    }
    
    // Then try to get fresh data from API
    try {
      // Try USER API first (for traditional accounts)
      if (user.value?.email && user.value?.loginMethod === 'traditional') {
        try {
          const userResponse = await getUserByEmail(user.value.email)
          if (userResponse.success && userResponse.result) {
            const freshData = userResponse.result
            userProfile.value = {
              ...userProfile.value,
              id: freshData.maNguoiDung || userProfile.value.id,
              name: freshData.tenNguoiDung || userProfile.value.name,
              email: freshData.email || userProfile.value.email,
              phone: freshData.soDienThoai || userProfile.value.phone,
              role: freshData.vaiTro || userProfile.value.role,
              totalOrders: freshData.tongDonHang || userProfile.value.totalOrders,
              totalSpent: freshData.tongChiTieu || userProfile.value.totalSpent
            }
          }
        } catch (userError) {
          console.warn('USER API failed, trying OAuth2 API:', userError)
          // Fallback to OAuth2 API
          const response = await apiCall('/api/oauth2/user-info')
          if (response.success) {
            const freshData = response.result
            userProfile.value = {
              ...userProfile.value,
              id: freshData.maNguoiDung || userProfile.value.id,
              name: freshData.tenNguoiDung || userProfile.value.name,
              email: freshData.email || userProfile.value.email,
              phone: freshData.soDienThoai || userProfile.value.phone,
              role: freshData.vaiTro || userProfile.value.role,
              totalOrders: freshData.tongDonHang || userProfile.value.totalOrders,
              totalSpent: freshData.tongChiTieu || userProfile.value.totalSpent
            }
          }
        }
      } else {
        // For OAuth2 accounts, use OAuth2 API
        const response = await apiCall('/api/oauth2/user-info')
        if (response.success) {
          const freshData = response.result
          userProfile.value = {
            ...userProfile.value,
            id: freshData.maNguoiDung || userProfile.value.id,
            name: freshData.tenNguoiDung || userProfile.value.name,
            email: freshData.email || userProfile.value.email,
            phone: freshData.soDienThoai || userProfile.value.phone,
            role: freshData.vaiTro || userProfile.value.role,
            totalOrders: freshData.tongDonHang || userProfile.value.totalOrders,
            totalSpent: freshData.tongChiTieu || userProfile.value.totalSpent
          }
        }
      }
    } catch (apiError) {
      console.warn('Could not fetch fresh user data:', apiError)
      // Use local data if API fails
    }
    
  } catch (err) {
    console.error('Error loading user profile:', err)
    error.value = 'Không thể tải thông tin người dùng'
  } finally {
    loading.value = false
  }
}

// Refresh profile data
const refreshProfile = () => {
  loadUserProfile()
}

// Test API call - sử dụng AUTH.STATUS API mới
const testAPI = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('Testing API call...')
    const response = await apiCall('/api/auth/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('easymart-token')}`
      }
    })
    
    if (response.success) {
      console.log('✅ API test successful:', response.result)
      alert('API test thành công! Xem console để biết chi tiết.')
    } else {
      throw new Error(response.message || 'API test failed')
    }
    
  } catch (err) {
    console.error('API test failed:', err)
    error.value = 'API test thất bại: ' + err.message
  } finally {
    loading.value = false
  }
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const formatCurrency = (amount) => {
  if (!amount) return '0đ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}
</script>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.card-header {
  background: linear-gradient(135deg, #007bff, #6c757d);
  color: white;
  border-radius: 10px 10px 0 0;
}

.table td {
  padding: 0.5rem 0.75rem;
}

img {
  border: 3px solid #007bff;
}

.badge {
  font-size: 0.8em;
}
</style>
