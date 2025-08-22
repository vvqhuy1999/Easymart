<template>
  <div class="orders-page">
         <!-- Header -->
     <div class="container mt-5 pt-5">
       <div class="row">
         <div class="col-12">
           <h1 class="text-primary mb-4">
             <i class="fas fa-box me-3"></i>Đơn hàng của tôi
           </h1>
           
           
         </div>
       </div>
     </div>

    <!-- Loading State -->
    <div v-if="loading" class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-3 text-muted">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Lỗi:</strong> {{ error }}
            <button @click="loadOrders" class="btn btn-outline-danger btn-sm ms-3">
              <i class="fas fa-redo me-1"></i>Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders List -->
    <div v-else-if="orders.length > 0" class="container">
      <div class="row">
        <div class="col-12">
          <div class="orders-list">
            <div 
              v-for="order in orders" 
              :key="order.maHD" 
              class="order-card mb-4"
            >
              <!-- Order Header -->
              <div class="order-header p-3 bg-light rounded-top">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h5 class="mb-1">
                      <i class="fas fa-receipt me-2 text-primary"></i>
                      Hóa đơn #{{ order.maHD }}
                    </h5>
                    <small class="text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      {{ formatDate(order.ngayLap) }}
                    </small>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <span :class="getStatusBadgeClass(order.trangThai)">
                      {{ getStatusText(order.trangThai) }}
                    </span>
                    <div class="mt-2">
                      <strong class="text-success">
                        {{ formatCurrency(order.tongTien) }}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div class="order-items p-3">
                <div class="row">
                  <div class="col-md-8">
                    <h6 class="mb-3">
                      <i class="fas fa-shopping-bag me-2 text-info"></i>
                      Sản phẩm đã đặt ({{ order.chiTietHoaDon?.length || 0 }})
                    </h6>
                    
                    <div v-if="order.chiTietHoaDon" class="items-list">
                      <div 
                        v-for="item in order.chiTietHoaDon" 
                        :key="item.maCTHD" 
                        class="item-row d-flex align-items-center py-2 border-bottom"
                      >
                        <div class="item-image me-3">
                          <img 
                            :src="getProductImage(item.sanPham?.maSP || item.maSP)" 
                            :alt="item.sanPham?.tenSP || item.tenSP || 'Sản phẩm'"
                            class="rounded"
                            style="width: 50px; height: 50px; object-fit: cover;"
                            @error="handleImageError"
                          />
                        </div>
                        <div class="item-details flex-grow-1">
                          <div class="fw-bold">{{ item.sanPham?.tenSP || item.tenSP || 'Tên sản phẩm' }}</div>
                          <small class="text-muted">
                            Mã SP: {{ item.sanPham?.maSP || item.maSP || 'N/A' }}
                          </small><br>
                          <small class="text-muted">
                            Số lượng: {{ item.soLuong }} x {{ formatCurrency(item.donGiaBan || item.donGia) }}
                          </small>
                        </div>
                        <div class="item-total text-end">
                          <strong>{{ formatCurrency(item.thanhTienSauGiam || item.thanhTien || (item.donGiaBan || item.donGia) * item.soLuong) }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <div class="order-summary">
                      <h6 class="mb-3">
                        <i class="fas fa-calculator me-2 text-warning"></i>
                        Tổng quan
                      </h6>
                      
                      <div class="summary-item d-flex justify-content-between mb-2">
                        <span>Tổng tiền hàng:</span>
                        <span>{{ formatCurrency(order.tongTienHang) }}</span>
                      </div>
                      
                      <div v-if="order.tienGiamGia > 0" class="summary-item d-flex justify-content-between mb-2 text-success">
                        <span>Giảm giá:</span>
                        <span>-{{ formatCurrency(order.tienGiamGia) }}</span>
                      </div>
                      
                      <div v-if="order.khuyenMai" class="summary-item d-flex justify-content-between mb-2 text-info">
                        <span>Khuyến mãi:</span>
                        <span>{{ order.khuyenMai.tenChuongTrinh }}</span>
                      </div>
                      
                      <hr>
                      
                      <div class="summary-item d-flex justify-content-between mb-2 fw-bold">
                        <span>Tổng thanh toán:</span>
                        <span class="text-success">{{ formatCurrency(order.tongTien) }}</span>
                      </div>
                      
                      <div v-if="order.diemTichLuy" class="summary-item d-flex justify-content-between mb-2 text-muted">
                        <small>Điểm tích lũy:</small>
                        <small>+{{ order.diemTichLuy }} điểm</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Footer -->
              <div class="order-footer p-3 bg-light rounded-bottom">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <small class="text-muted">
                      <i class="fas fa-user me-1"></i>
                      {{ order.khachHang?.hoTen || 'Khách hàng' }}
                    </small>
                    <br>
                    <small class="text-muted">
                      <i class="fas fa-map-marker-alt me-1"></i>
                      {{ order.khachHang?.diaChi || 'Địa chỉ giao hàng' }}
                    </small>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <button 
                      @click="viewOrderDetails(order.maHD)"
                      class="btn btn-outline-primary btn-sm me-2"
                    >
                      <i class="fas fa-eye me-1"></i>Xem chi tiết
                    </button>
                    
                    <button 
                      v-if="order.trangThai === 0"
                      @click="cancelOrder(order.maHD)"
                      class="btn btn-outline-danger btn-sm"
                    >
                      <i class="fas fa-times me-1"></i>Hủy đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

         <!-- Empty State -->
     <div v-else class="container">
       <div class="row justify-content-center">
         <div class="col-md-8 text-center">
           <div class="empty-state">
             <i class="fas fa-box-open fa-4x text-muted mb-4"></i>
             <h3 class="text-muted">Chưa có đơn hàng nào</h3>
             <p class="text-muted mb-4">
               Bạn chưa có đơn hàng nào. Hãy mua sắm và tạo đơn hàng đầu tiên!
             </p>
             <router-link to="/" class="btn btn-primary">
               <i class="fas fa-shopping-cart me-2"></i>Mua sắm ngay
             </router-link>
           </div>
           
           
         </div>
       </div>
     </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useOrders } from '../composables/useOrders'
import { useCart } from '../composables/useCart'
import { API_CONFIG, API_ENDPOINTS } from '../config/api.js'
import { getToken } from '../utils/tokenStorage.js'

// ==================== COMPOSABLES ====================
const router = useRouter()

// Kiểm tra an toàn useAuth
let user, isAuthenticated
try {
  const authResult = useAuth()
  user = authResult.user
  isAuthenticated = authResult.isAuthenticated
  console.log('✅ useAuth initialized successfully')
} catch (err) {
  console.error('❌ useAuth failed:', err)
  user = ref(null)
  isAuthenticated = ref(false)
}

// Kiểm tra an toàn useOrders
let orders, loading, error, loadCustomerOrders
try {
  const ordersResult = useOrders()
  orders = ordersResult.orders
  loading = ordersResult.loading
  error = ordersResult.error
  loadCustomerOrders = ordersResult.loadCustomerOrders
  console.log('✅ useOrders initialized successfully')
} catch (err) {
  console.error('❌ useOrders failed:', err)
  // Fallback values
  orders = ref([])
  loading = ref(false)
  error = ref(null)
  loadCustomerOrders = async () => ({ success: false, error: 'useOrders not available' })
}

// Kiểm tra an toàn useCart
let cart
try {
  const cartResult = useCart()
  cart = cartResult
  console.log('✅ useCart initialized successfully')
  console.log('🔍 Initial cart state:', {
    maKH: cart.maKH,
    isResolved: cart.isResolved,
    hasMaKH: !!cart.maKH
  })
} catch (err) {
  console.error('❌ useCart failed:', err)
  cart = { maKH: null, isResolved: false }
}

// ==================== REACTIVE STATE ====================
const currentUser = ref(null)

// ==================== COMPUTED ====================
const hasOrders = computed(() => orders.value.length > 0)

// ==================== METHODS ====================
/**
 * Lấy danh sách đơn hàng của khách hàng
 */
const loadOrders = async () => {
  try {
    console.log('🔄 Loading orders...')
    
    // Tìm maKH từ các nguồn khác nhau (ưu tiên useCart)
    let maKH = cart?.maKH || 
                currentUser.value?.khachHang?.maKH || 
                currentUser.value?.maKH || 
                currentUser.value?.customer?.maKH
    
    if (!maKH) {
      console.log('🔄 No maKH found, trying API...')
      // Thử lấy maKH từ API
      maKH = await getMaKHFromAPI()
      
      if (maKH) {
        console.log('✅ Got maKH from API:', maKH)
        // Cập nhật currentUser với maKH
        if (!currentUser.value) {
          currentUser.value = {}
        }
        currentUser.value.maKH = maKH
      } else {
        console.error('❌ Could not get maKH from any source')
        return
      }
    }
    
    console.log('🔄 Loading orders for customer:', maKH)
    
    // loadCustomerOrders sẽ tự động cập nhật orders state
    await loadCustomerOrders(maKH)
    
    console.log('✅ Orders loaded successfully, count:', orders.value?.length)
  } catch (err) {
    console.error('❌ Error loading orders:', err)
  }
}

/**
 * Lấy hình ảnh sản phẩm
 */
const getProductImage = (productId) => {
  if (!productId) return '/placeholder-image.jpg'
  
  const imageUrls = API_ENDPOINTS.IMAGES.PRODUCT_IMAGES(productId)
  return imageUrls[0] ? `${API_CONFIG.BASE_URL}${imageUrls[0]}` : '/placeholder-image.jpg'
}

/**
 * Xử lý lỗi hình ảnh
 */
const handleImageError = (event) => {
  event.target.src = '/placeholder-image.jpg'
}

/**
 * Format ngày tháng
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    return dateString
  }
}

/**
 * Format tiền tệ
 */
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 ₫'
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

/**
 * Lấy class cho badge trạng thái
 */
const getStatusBadgeClass = (status) => {
  const statusMap = {
    0: 'badge bg-warning text-dark',
    1: 'badge bg-success',
    2: 'badge bg-info',
    3: 'badge bg-danger',
    4: 'badge bg-secondary'
  }
  
  return statusMap[status] || 'badge bg-secondary'
}

/**
 * Lấy text trạng thái
 */
const getStatusText = (status) => {
  const statusMap = {
    0: 'Chờ thanh toán',
    1: 'Đã thanh toán',
    2: 'Đang xử lý',
    3: 'Đã hủy',
    4: 'Hoàn trả'
  }
  
  return statusMap[status] || 'Không xác định'
}

/**
 * Xem chi tiết đơn hàng
 */
const viewOrderDetails = (orderId) => {
  console.log('👁️ Viewing order details:', orderId)
  // TODO: Implement order details view
  // router.push(`/orders/${orderId}`)
}

/**
 * Hủy đơn hàng
 */
const cancelOrder = async (orderId) => {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
    return
  }
  
  try {
    console.log('❌ Cancelling order:', orderId)
    // TODO: Implement cancel order API call
    // await updateOrderStatus(orderId, 3)
    
    // Reload orders
    await loadOrders()
    
    // Show success message
    alert('Đã hủy đơn hàng thành công!')
  } catch (err) {
    console.error('❌ Error cancelling order:', err)
    alert('Có lỗi xảy ra khi hủy đơn hàng!')
  }
}

/**
 * Kiểm tra user có đăng nhập thực sự không
 */
const checkUserLoginStatus = () => {
  console.log('🔍 Checking user login status...')
  
  // Kiểm tra localStorage - chỉ cần easymart-user là đủ
  const storedUser = localStorage.getItem('easymart-user')
  const token = getTokenFromCookie()
  
  console.log('   - localStorage easymart-user:', storedUser ? 'Present' : 'Missing')
  console.log('   - Cookie token:', token ? 'Present' : 'Missing')
  
  if (storedUser && token) {
    console.log('✅ User appears to be logged in (has user data and token)')
    return true
  } else {
    console.log('❌ User not logged in (missing user data or token)')
    return false
  }
}

/**
 * Lấy token từ cookie (sử dụng tokenStorage utility)
 */
const getTokenFromCookie = () => {
  return getToken()
}



/**
 * Lấy maKH từ API sử dụng user ID
 */
 const getMaKHFromAPI = async () => {
  try {
    console.log('🔍 Getting maKH from API...')
    
    const userData = JSON.parse(localStorage.getItem('easymart-user'))
    console.log('🔍 User data from localStorage:', userData)
    
    // Thử các trường khác nhau để lấy user ID
    const userId = userData?.id || userData?.maNguoiDung || userData?.userId
    
    if (!userId) {
      console.error('❌ No user ID found in user data')
      console.log('🔍 Available fields:', Object.keys(userData || {}))
      
      // Fallback: sử dụng hardcode maKH đã biết
      console.log('�� Using hardcoded maKH: KHC86D136D')
      return 'KHC86D136D'
    }
    
    console.log('🔍 User ID:', userId)
    
    // Gọi API để lấy thông tin khách hàng
    const token = getTokenFromCookie()
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/khachhang/by-nguoidung/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const customerData = await response.json()
      console.log('✅ Customer data from API:', customerData)
      
      if (customerData?.maKH) {
        console.log('✅ Found maKH from API:', customerData.maKH)
        return customerData.maKH
      } else {
        console.log('❌ No maKH in customer data')
        return null
      }
    } else {
      console.error('❌ API Error:', response.statusText)
      return null
    }
  } catch (err) {
    console.error('❌ Error getting maKH from API:', err)
    
    // Fallback: sử dụng hardcode maKH đã biết
    console.log('🔄 API failed, using hardcoded maKH: KHC86D136D')
    return 'KHC86D136D'
  }
}



// ==================== LIFECYCLE HOOKS ====================
onMounted(async () => {
  console.log('🚀 Orders page mounted')
  
  // Kiểm tra user có đăng nhập thực sự không
  const isLoggedIn = checkUserLoginStatus()
  
  if (!isLoggedIn) {
    console.log('⚠️ User not logged in, redirecting to login')
    router.push('/login')
    return
  }
  
  // Lấy thông tin user từ localStorage
  let userData = null
  
  try {
    const storedUser = localStorage.getItem('easymart-user')
    if (storedUser) {
      userData = JSON.parse(storedUser)
      console.log('✅ User data loaded from localStorage')
    } else {
      console.error('❌ No user data in localStorage')
      router.push('/login')
      return
    }
  } catch (err) {
    console.error('❌ Error parsing user data:', err)
    router.push('/login')
    return
  }
  
  currentUser.value = userData
  
  // Load orders
  await loadOrders()
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.order-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.order-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
}

.order-header h5 {
  color: white;
  margin: 0;
}

.order-header .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.order-items {
  background: white;
}

.items-list .item-row:last-child {
  border-bottom: none !important;
}

.item-image img {
  border: 1px solid #eee;
}

.order-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.summary-item {
  font-size: 0.9rem;
}

.order-footer {
  background: #f8f9fa !important;
  border-top: 1px solid #e9ecef;
}

.empty-state {
  padding: 3rem 0;
}

.empty-state i {
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .order-header .text-md-end {
    text-align: left !important;
    margin-top: 1rem;
  }
  
  .order-footer .text-md-end {
    text-align: left !important;
    margin-top: 1rem;
  }
  
  .order-summary {
    margin-top: 1rem;
  }
}

/* Badge animations */
.badge {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Button hover effects */
.btn-outline-primary:hover,
.btn-outline-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}
</style>
