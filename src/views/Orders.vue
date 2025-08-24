<template>
  <div class="orders-page">
    <!-- Header -->
    <div class="container mt-5 pt-5">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="text-primary mb-0">
              <i class="fas fa-box me-3"></i>Đơn hàng của tôi
            </h1>
            <div class="d-flex gap-2">
              <button 
                @click="refreshOrders" 
                class="btn btn-outline-primary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i>
                Làm mới
              </button>
            </div>
          </div>
          
          <!-- Order Status Tabs -->
          <div class="order-tabs mb-4">
            <ul class="nav nav-pills nav-fill">
              <li class="nav-item">
                <button 
                  :class="getTabClass('pending')"
                  @click="setActiveTab('pending')"
                >
                  <i class="fas fa-clock me-2"></i>Chờ thanh toán
                  <span :class="getBadgeClass('pending')">{{ orderCounts.pending }}</span>
                </button>
              </li>
                             <li class="nav-item">
                 <button 
                   :class="getTabClass('paid')"
                   @click="setActiveTab('paid')"
                 >
                   <i class="fas fa-check-circle me-2"></i>Đã thanh toán
                   <span :class="getBadgeClass('paid')">{{ orderCounts.paid }}</span>
                 </button>
               </li>
               
               <li class="nav-item">
                 <button 
                   :class="getTabClass('completed')"
                   @click="setActiveTab('completed')"
                 >
                   <i class="fas fa-shipping-fast me-2"></i>Hoàn thành
                   <span :class="getBadgeClass('completed')">{{ orderCounts.completed }}</span>
                 </button>
               </li>

               <li class="nav-item">
                 <button 
                   :class="getTabClass('cancelled')"
                   @click="setActiveTab('cancelled')"
                 >
                   <i class="fas fa-times-circle me-2"></i>Đã hủy
                   <span :class="getBadgeClass('cancelled')">{{ orderCounts.cancelled }}</span>
                 </button>
               </li>
            </ul>
          </div>
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
            <div class="mt-3">
              <button @click="loadOrders" class="btn btn-outline-danger btn-sm me-2">
                <i class="fas fa-redo me-1"></i>Thử lại
              </button>
              <button @click="refreshCustomerInfo" class="btn btn-outline-info btn-sm me-2">
                <i class="fas fa-sync-alt me-1"></i>Làm mới thông tin khách hàng
              </button>
              <button @click="goToProfile" class="btn btn-primary btn-sm">
                <i class="fas fa-user-edit me-1"></i>Cập nhật thông tin cá nhân
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders List -->
    <div v-else-if="orders.length > 0" class="container">
      <div class="row">
        <div class="col-12">

          
          <!-- Tab Content Info -->
          <div class="tab-info mb-3">
            <div class="alert alert-info d-flex align-items-center">
              <i class="fas fa-info-circle me-2"></i>
              <span>
                Hiển thị {{ paginatedOrders.length }} / {{ filteredOrders.length }} đơn hàng 
                <strong>{{ getTabTitle(activeTab) }}</strong>
                <span v-if="totalPages > 1" class="ms-2">
                  (Trang {{ currentPage }} / {{ totalPages }})
                </span>
              </span>
            </div>
          </div>
          
          <!-- No orders in current tab -->
                      <div v-if="filteredOrders.length === 0" class="text-center py-5">
              <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">Không có đơn hàng {{ getTabTitle(activeTab).toLowerCase() }}</h4>
              <p class="text-muted">
                <span v-if="activeTab === 'pending'">Bạn chưa có đơn hàng nào đang chờ thanh toán.</span>
                <span v-else-if="activeTab === 'paid'">Bạn chưa có đơn hàng nào đã thanh toán.</span>
                <span v-else-if="activeTab === 'completed'">Bạn chưa có đơn hàng nào hoàn thành.</span>
                <span v-else-if="activeTab === 'cancelled'">Bạn chưa có đơn hàng nào bị hủy.</span>
              </p>
            <button 
              @click="setActiveTab('pending')" 
              class="btn btn-outline-primary"
            >
              <i class="fas fa-clock me-2"></i>Xem đơn hàng chờ thanh toán
            </button>
          </div>
          
          <!-- Orders List -->
          <div v-else class="orders-list">
            <div 
              v-for="(order, index) in paginatedOrders" 
              :key="order.maHD" 
              class="order-card mb-4"
            >
              <!-- Order Header -->
              <div class="order-header p-3 bg-light rounded-top">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h5 class="mb-1">
                      <i class="fas fa-receipt me-2 text-primary"></i>
                      Hóa đơn #{{ index + 1 }}
                    </h5>
                    <small class="text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      {{ formatDate(order.ngayLap) }}
                    </small>
                    <br>
                    <small class="text-muted">
                      <i class="fas fa-hashtag me-1"></i>
                      Mã: {{ order.maHD }}
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
                    
                    <!-- Thông báo khi không có sản phẩm -->
                    <div v-if="!order.chiTietHoaDon || order.chiTietHoaDon.length === 0" class="alert alert-info">
                      <i class="fas fa-info-circle me-2"></i>
                      <strong>Không có sản phẩm trong đơn hàng này</strong>
                      <br>
                      <small class="text-muted">Đơn hàng có thể đã được xử lý hoặc chưa có chi tiết sản phẩm.</small>
                    </div>
                    
                    <div v-if="order.chiTietHoaDon && order.chiTietHoaDon.length > 0" class="items-list">
                      <div 
                        v-for="item in order.chiTietHoaDon" 
                        :key="item.maCTHD || item.id" 
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
                        <span>{{ formatCurrency(order.tongTienHang || order.tongTien) }}</span>
                      </div>
                      
                      <!-- Hiển thị mã khuyến mãi nếu có -->
                      <div v-if="order.coupon || order.maKM" class="summary-item d-flex justify-content-between mb-2 text-info">
                        <span>Mã khuyến mãi:</span>
                        <span>{{ order.coupon?.code || order.maKM || 'N/A' }}</span>
                      </div>
                      
                      <!-- Hiển thị giảm giá nếu có -->
                      <div v-if="order.tienGiamGia > 0" class="summary-item d-flex justify-content-between mb-2 text-success">
                        <span>Giảm giá:</span>
                        <span>-{{ formatCurrency(order.tienGiamGia) }}</span>
                      </div>
                      
                      <!-- Hiển thị thông tin khuyến mãi chi tiết nếu có -->
                      <div v-if="order.khuyenMai" class="summary-item d-flex justify-content-between mb-2 text-info">
                        <span>Chương trình:</span>
                        <span>{{ order.khuyenMai.tenChuongTrinh || order.khuyenMai.moTa || 'Khuyến mãi' }}</span>
                      </div>
                      
                      <hr>
                      
                      <!-- Hiển thị tổng tiền sau giảm giá nếu khác với tổng tiền gốc -->
                      <div v-if="order.tongTienSauGiamGia && order.tongTienSauGiamGia !== order.tongTien" class="summary-item d-flex justify-content-between mb-2 text-warning">
                        <span>Tổng sau giảm giá:</span>
                        <span>{{ formatCurrency(order.tongTienSauGiamGia) }}</span>
                      </div>
                      
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
                    <!-- Checkout button chỉ cho đơn hàng chờ thanh toán -->
                    <button 
                      v-if="canCancelOrder(order.trangThai)"
                      @click="checkoutOrder(order.maHD)"
                      class="btn btn-success btn-sm me-2"
                      :disabled="loading"
                    >
                      <i class="fas fa-credit-card me-1"></i>Checkout
                    </button>
                    
                    <button 
                      v-if="canCancelOrder(order.trangThai)"
                      @click="cancelOrderHandler(order.maHD)"
                      class="btn btn-outline-danger btn-sm"
                      :disabled="loading"
                    >
                      <i class="fas fa-times me-1"></i>Hủy đơn
                    </button>
                    
                    <!-- Hiển thị thông tin trạng thái nếu không thể hủy -->
                    <small 
                      v-if="!canCancelOrder(order.trangThai)" 
                      class="text-muted"
                    >
                      <i class="fas fa-info-circle me-1"></i>
                      {{ getStatusText(order.trangThai) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-section mt-4">
            <nav aria-label="Orders pagination">
              <ul class="pagination justify-content-center">
                <!-- Previous button -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button 
                    class="page-link" 
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                
                <!-- Page numbers -->
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button 
                    class="page-link" 
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                </li>
                
                <!-- Next button -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button 
                    class="page-link" 
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
            
            <!-- Page info -->
            <div class="text-center mt-2">
              <small class="text-muted">
                Trang {{ currentPage }} / {{ totalPages }} 
                ({{ paginatedOrders.length }} đơn hàng)
              </small>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useOrders } from '../composables/useOrders'
import { useCart } from '../composables/useCart'
import { API_CONFIG, API_ENDPOINTS } from '../config/api.js'
import { getToken } from '../utils/tokenStorage.js'

// ==================== UTILITY FUNCTIONS ====================
// Decode JWT token to get user info
const decodeToken = (token) => {
  try {
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      email: payload.sub, // sub chính là email
      issuer: payload.iss,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
      raw: payload
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// ==================== COMPOSABLES ====================
const router = useRouter()

// Kiểm tra an toàn useAuth
let user, isAuthenticated
try {
  const authResult = useAuth()
  user = authResult.user
  isAuthenticated = authResult.isAuthenticated
} catch (err) {
  console.error('❌ useAuth failed:', err)
  user = ref(null)
  isAuthenticated = ref(false)
}

// Kiểm tra an toàn useOrders
let orders, loading, error, loadCustomerOrders, cancelOrder
try {
  const ordersResult = useOrders()
  orders = ordersResult.orders
  loading = ordersResult.loading
  error = ordersResult.error
  loadCustomerOrders = ordersResult.loadCustomerOrders
  cancelOrder = ordersResult.cancelOrder
  
  // Debug: Kiểm tra xem orders có được khởi tạo đúng không
  console.log('🔍 useOrders initialized successfully:')
  console.log('   - orders:', orders)
  console.log('   - orders.value:', orders?.value)
  console.log('   - loading:', loading)
  console.log('   - error:', error)
  
} catch (err) {
  console.error('❌ useOrders failed:', err)
  // Fallback values
  orders = ref([])
  loading = ref(false)
  error = ref(null)
  loadCustomerOrders = async () => ({ success: false, error: 'useOrders not available' })
  cancelOrder = async () => ({ success: false, error: 'cancelOrder not available' })
}

// Kiểm tra an toàn useCart
let cart
try {
  const cartResult = useCart()
  cart = cartResult
} catch (err) {
  console.error('❌ useCart failed:', err)
  cart = { maKH: null, isResolved: false }
}

// ==================== REACTIVE STATE ====================
const currentUser = ref(null)
const activeTab = ref('pending') // 'pending', 'paid', 'completed', 'cancelled'

// ==================== COMPUTED ====================
const hasOrders = computed(() => orders.value.length > 0)

// Filtered orders based on active tab
const filteredOrders = computed(() => {
  if (!orders.value || orders.value.length === 0) return []
  
  switch (activeTab.value) {
    case 'pending':
      return orders.value.filter(order => {
        const status = typeof order.trangThai === 'string' ? parseInt(order.trangThai) : order.trangThai
        return status === 0
      })
    case 'paid':
      return orders.value.filter(order => {
        const status = typeof order.trangThai === 'string' ? parseInt(order.trangThai) : order.trangThai
        return status === 1
      })
    case 'completed':
      return orders.value.filter(order => {
        const status = typeof order.trangThai === 'string' ? parseInt(order.trangThai) : order.trangThai
        return status === 2
      })
    case 'cancelled':
      return orders.value.filter(order => {
        const status = typeof order.trangThai === 'string' ? parseInt(order.trangThai) : order.trangThai
        return status === 3
      })
    default:
      return orders.value.filter(order => {
        const status = typeof order.trangThai === 'string' ? parseInt(order.trangThai) : order.trangThai
        return status === 0 // Default to pending
      })
  }
})

// Order counts for each status (bao gồm completed)
const orderCounts = computed(() => {
  if (!orders.value || orders.value.length === 0) {
    return { pending: 0, paid: 0, completed: 0, cancelled: 0 }
  }
  
  const counts = { pending: 0, paid: 0, completed: 0, cancelled: 0 }
  
  orders.value.forEach(order => {
    const status = typeof order.trangThai === 'string' ? parseInt(order.trangThai) : order.trangThai
    switch (status) {
      case 0: counts.pending++; break
      case 1: counts.paid++; break
      case 2: counts.completed++; break
      case 3: counts.cancelled++; break
    }
  })
  
  return counts
})

// Pagination logic
const itemsPerPage = 4 // Hiển thị 4 đơn hàng mỗi trang
const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage)
})

const paginatedOrders = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredOrders.value.slice(startIndex, endIndex)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  if (totalPages.value <= maxVisiblePages) {
    // Hiển thị tất cả các trang nếu ít hơn maxVisiblePages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Logic để hiển thị trang hiện tại và các trang xung quanh
    const startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

// ==================== METHODS ====================
// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of orders list
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetPagination = () => {
  currentPage.value = 1
}
/**
 * Helper function để extract maKH từ response data
 */
const extractMaKH = (data, source) => {
  if (data?.maKH) {
    return data.maKH
  } else if (data?.customer?.maKH) {
    return data.customer.maKH
  } else if (data?.result?.maKH) {
    return data.result.maKH
  } else if (data?.data?.maKH) {
    return data.data.maKH
  } else {
    return null
  }
}

/**
 * Lấy maKH từ API
 */
const getMaKHFromAPI = async () => {
  try {
    console.log('🔍 === GETTING MAKH FROM API ===')
    
    // Sử dụng cùng cách như cart để lấy thông tin user đầy đủ
    const token = getToken()
    if (!token) {
      console.log('❌ No token available')
      return null
    }
    
    // Bước 1: Lấy thông tin user từ token (decode JWT)
    const tokenData = decodeToken(token)
    if (!tokenData?.email) {
      console.log('❌ No email found in token')
      return null
    }
    
    const userEmail = tokenData.email
    console.log('📧 User email from token:', userEmail)
    
    // Bước 2: Lấy maNguoiDung từ email API
    console.log('👤 Step 1: Getting maNguoiDung from email API...')
    const userResponse = await fetch(`${API_CONFIG.BASE_URL}/api/nguoidung/email/${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!userResponse.ok) {
      console.log('⚠️ User email API failed with status:', userResponse.status)
      return null
    }
    
    const userInfo = await userResponse.json()
    const realUserId = userInfo.maNguoiDung
    console.log('✅ Got real maNguoiDung:', realUserId)
    
    // Bước 3: Sử dụng maNguoiDung để lấy customer info
    console.log('👤 Step 2: Getting customer info with maNguoiDung...')
    const customerResponse = await fetch(`${API_CONFIG.BASE_URL}/api/khachhang/by-nguoidung/${realUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!customerResponse.ok) {
      console.log('⚠️ Customer API failed with status:', customerResponse.status)
      return null
    }
    
    const customerData = await customerResponse.json()
    console.log('✅ Customer data from API:', customerData)
    
    const maKH = extractMaKH(customerData, 'Customer API')
    if (maKH) {
      console.log('✅ Found maKH from API:', maKH)
      return maKH
    }
    
    console.log('❌ No maKH found in customer data')
    return null
    
  } catch (err) {
    console.error('❌ Error getting maKH from API:', err)
    return null
  }
}

/**
 * Lấy danh sách đơn hàng của khách hàng
 */
const loadOrders = async () => {
  try {
    console.log('🔄 === LOADING ORDERS ===')
    console.log('🔄 Current orders state:', orders?.value)
    console.log('🔄 Current loading state:', loading?.value)
    
    // Tìm maKH từ các nguồn khác nhau - ưu tiên cart vì nó đang hoạt động
    let maKH = cart?.maKH || 
                currentUser.value?.maKH || 
                currentUser.value?.khachHang?.maKH
    
    console.log('🔑 Found maKH from sources:', {
      cart: cart?.maKH,
      currentUser: currentUser.value?.maKH,
      currentUserKhachHang: currentUser.value?.khachHang?.maKH,
      final: maKH
    })
    
    // Nếu cart đã có maKH thì sử dụng luôn (cart đang hoạt động tốt)
    if (cart?.maKH) {
      maKH = cart.maKH
      console.log('✅ Using maKH from cart (most reliable):', maKH)
      
      // Cập nhật currentUser với thông tin từ cart
      if (currentUser.value) {
        currentUser.value.maKH = maKH
        currentUser.value.khachHang = { maKH: maKH }
      }
    } else if (!maKH) {
      // Chỉ thử API nếu cart không có maKH
      console.log('🔍 No maKH found from cart, trying API...')
      const realMaKH = await getMaKHFromAPI()
      if (realMaKH) {
        maKH = realMaKH
        console.log('✅ Got maKH from API:', maKH)
        
        // Cập nhật currentUser với thông tin customer
        if (currentUser.value) {
          currentUser.value.maKH = realMaKH
          currentUser.value.khachHang = { maKH: realMaKH }
        }
      } else {
        // Không tìm thấy maKH, không thể load orders
        console.log('❌ No maKH found from any source')
        error.value = 'Không thể xác định thông tin khách hàng. Vui lòng đăng nhập lại hoặc cập nhật thông tin cá nhân trong trang Profile.'
        return
      }
    }
    
    console.log('🚀 Calling loadCustomerOrders with maKH:', maKH)
    // loadCustomerOrders sẽ tự động cập nhật orders state
    const result = await loadCustomerOrders(maKH)
    console.log('✅ loadCustomerOrders completed:', result)
    console.log('📊 Orders after loading:', orders?.value)
    console.log('📊 Orders length:', orders?.value?.length)
    
  } catch (err) {
    console.error('❌ Error loading orders:', err)
    error.value = err.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng'
  }
}

/**
 * Chuyển đến trang Profile để cập nhật thông tin cá nhân
 */
const goToProfile = () => {
  router.push('/profile')
}

/**
 * Refresh customer info từ API
 */
const refreshCustomerInfo = async () => {
  try {
    const maKH = await getMaKHFromAPI()
    if (maKH) {
      // Cập nhật currentUser
      if (currentUser.value) {
        currentUser.value.maKH = maKH
        currentUser.value.khachHang = { maKH: maKH }
      }
      // Thử load orders lại
      await loadOrders()
      return true
    }
    return false
  } catch (err) {
    console.error('❌ Error refreshing customer info:', err)
    return false
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
  // Convert to number để đảm bảo consistency
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  
  const statusMap = {
    0: 'badge bg-warning text-dark',
    1: 'badge bg-success',
    2: 'badge bg-info',
    3: 'badge bg-danger',
    4: 'badge bg-secondary'
  }
  
  return statusMap[numStatus] || 'badge bg-secondary'
}

/**
 * Lấy text trạng thái
 */
const getStatusText = (status) => {
  // Convert to number để đảm bảo consistency
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  
  const statusMap = {
    0: 'Chờ thanh toán',
    1: 'Đã thanh toán',
    2: 'Đang xử lý',
    3: 'Đã hủy',
    4: 'Hoàn trả'
  }
  
  return statusMap[numStatus] || `Không xác định (${status})`
}

/**
 * Kiểm tra có thể hủy đơn hàng không
 */
const canCancelOrder = (status) => {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  // Chỉ có thể hủy khi trạng thái = 0 (Chờ thanh toán)
  return numStatus === 0
}






/**
 * Làm mới danh sách đơn hàng (force reload)
 */
const refreshOrders = async () => {
  try {
    // Clear current orders trước khi load lại
    orders.value = []
    await loadOrders()
  } catch (err) {
    console.error('❌ Error refreshing orders:', err)
    alert('Có lỗi xảy ra khi làm mới danh sách đơn hàng!')
  }
}

/**
 * Thay đổi tab active
 */
const setActiveTab = (tab) => {
  activeTab.value = tab
  // Reset phân trang khi chuyển tab
  resetPagination()
}

/**
 * Lấy class cho tab button
 */
const getTabClass = (tab) => {
  return activeTab.value === tab 
    ? 'nav-link active' 
    : 'nav-link'
}

/**
 * Lấy badge class cho số đếm
 */
const getBadgeClass = (tab) => {
  const baseClass = 'badge rounded-pill ms-2'
  switch (tab) {
    case 'pending': return `${baseClass} bg-warning text-dark`
    case 'paid': return `${baseClass} bg-success`
    case 'completed': return `${baseClass} bg-info`
    case 'cancelled': return `${baseClass} bg-danger`
    default: return `${baseClass} bg-warning text-dark`
  }
}

/**
 * Lấy title cho tab
 */
const getTabTitle = (tab) => {
  switch (tab) {
    case 'pending': return 'chờ thanh toán'
    case 'paid': return 'đã thanh toán'
    case 'completed': return 'hoàn thành'
    case 'cancelled': return 'đã hủy'
    default: return 'chờ thanh toán'
  }
}

/**
 * Checkout đơn hàng
 */
const checkoutOrder = async (orderId) => {
  try {
    if (!orderId) {
      alert('Không có mã đơn hàng để checkout!')
      return
    }
    
    // Tìm đơn hàng trong danh sách
    const order = orders.value.find(o => o.maHD === orderId)
    
    if (order) {
      // Kiểm tra trạng thái đơn hàng
      if (order.trangThai !== 0) {
        alert('Chỉ có thể checkout đơn hàng đang chờ thanh toán!')
        return
      }
      
      // Lưu thông tin đơn hàng vào localStorage để checkout page có thể sử dụng
      const invoiceData = {
        maHD: order.maHD,
        tongTien: order.tongTien,
        chiTietHoaDon: order.chiTietHoaDon || order.chiTietList || [],
        timestamp: new Date().toISOString(),
        source: 'orders-page',
        // Thêm thông tin coupon nếu có
        coupon: order.coupon || null,
        // Thêm thông tin giảm giá
        tienGiamGia: order.tienGiamGia || 0,
        // Cập nhật tổng tiền sau khi áp dụng coupon
        tongTienSauGiamGia: order.tongTienSauGiamGia || order.tongTien
      }
      
      // Tạo selected items từ chi tiết hóa đơn
      const selectedItems = (order.chiTietHoaDon || order.chiTietList || []).map(item => 
        item.sanPham?.maSP || item.maSP
      ).filter(Boolean)
      
      localStorage.setItem('easymart-invoice', JSON.stringify(invoiceData))
      localStorage.setItem('easymart-selected-items', JSON.stringify(selectedItems))
      
      console.log('✅ Saved to localStorage:', {
        invoice: invoiceData,
        selectedItems: selectedItems
      })
      
      // Chuyển đến trang checkout - đơn giản như trong giỏ hàng
      router.push('/checkout')
      
    } else {
      alert('Không tìm thấy thông tin đơn hàng!')
    }
  } catch (error) {
    console.error('❌ Error during checkout:', error)
    alert('Không thể chuyển đến trang checkout. Vui lòng thử lại!')
  }
}

/**
 * Hủy đơn hàng
 */
const cancelOrderHandler = async (orderId) => {
  // Kiểm tra trạng thái đơn hàng trước khi hủy
  const order = orders.value.find(o => o.maHD === orderId)
  if (!order) {
    alert('Không tìm thấy đơn hàng!')
    return
  }
  
  if (!canCancelOrder(order.trangThai)) {
    const statusText = getStatusText(order.trangThai)
    alert(`Không thể hủy đơn hàng này. Trạng thái hiện tại: ${statusText}`)
    return
  }
  
  // Chỉ hiển thị confirm dialog đơn giản
  if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
    return
  }
  
  try {
    console.log('❌ Cancelling order:', orderId)
    
    // Lý do mặc định
    const lyDoHuy = 'Khách hàng yêu cầu hủy đơn hàng'
    
    // Sử dụng API hủy đơn hàng mới
    await cancelOrder(orderId, lyDoHuy)
    
    // Reload orders để cập nhật trạng thái ngay lập tức
    console.log('🔄 Refreshing orders after successful cancellation...')
    await loadOrders()
    
    // Show success message
    alert('Đã hủy đơn hàng thành công!')
    console.log('✅ Order cancelled and UI updated successfully')
  } catch (err) {
    console.error('❌ Error cancelling order:', err)
    
    // Xử lý các loại lỗi khác nhau
    let errorMessage = err.message || 'Lỗi không xác định'
    let shouldAutoRefresh = false
    
    // Phân tích lỗi chi tiết
    if (errorMessage.includes('đã được hủy trước đó') || 
        errorMessage.includes('already cancelled') ||
        errorMessage.includes('đã hủy') ||
        errorMessage.includes('cancelled')) {
      errorMessage = 'Đơn hàng này đã được hủy trước đó.'
      shouldAutoRefresh = true
    } else if (errorMessage.includes('không thể hủy') || 
               errorMessage.includes('cannot cancel') ||
               errorMessage.includes('không được phép') ||
               errorMessage.includes('not allowed')) {
      errorMessage = 'Không thể hủy đơn hàng này do trạng thái hiện tại không cho phép.'
      shouldAutoRefresh = true
    } else if (errorMessage.includes('Bad Request') || 
               errorMessage.includes('400')) {
      errorMessage = 'Yêu cầu hủy đơn hàng không hợp lệ. Có thể đơn hàng đã được xử lý hoặc không tồn tại.'
      shouldAutoRefresh = true
    } else if (errorMessage.includes('Unauthorized') || 
               errorMessage.includes('401')) {
      errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    } else if (errorMessage.includes('Forbidden') || 
               errorMessage.includes('403')) {
      errorMessage = 'Bạn không có quyền hủy đơn hàng này.'
    } else if (errorMessage.includes('Not Found') || 
               errorMessage.includes('404')) {
      errorMessage = 'Không tìm thấy đơn hàng này.'
      shouldAutoRefresh = true
    }
    
    // Hiển thị thông báo lỗi
    alert(`Không thể hủy đơn hàng: ${errorMessage}`)
    
    // Tự động reload nếu cần
    if (shouldAutoRefresh) {
      console.log('🔄 Auto-refreshing orders due to error...')
      setTimeout(() => {
        loadOrders()
      }, 2000)
    }
  }
}

/**
 * Kiểm tra user có đăng nhập thực sự không
 */
const checkUserLoginStatus = () => {
  // Kiểm tra localStorage - chỉ cần easymart-user là đủ
  const storedUser = localStorage.getItem('easymart-user')
  const token = getToken()
  
  return storedUser && token
}

// ==================== LIFECYCLE HOOKS ====================
onMounted(async () => {
  try {
    console.log('🚀 === ORDERS PAGE MOUNTED ===')
    
    // Kiểm tra user có đăng nhập thực sự không
    const isLoggedIn = checkUserLoginStatus()
    console.log('🔐 User login status:', isLoggedIn)
    
    if (!isLoggedIn) {
      console.log('❌ User not logged in, redirecting to login')
      router.push('/login')
      return
    }
    
    // Lấy thông tin user từ localStorage
    const userData = JSON.parse(localStorage.getItem('easymart-user') || 'null')
    if (!userData) {
      console.log('❌ No user data in localStorage, redirecting to login')
      router.push('/login')
      return
    }
    
    console.log('📦 User data loaded:', userData)
    
    // Bổ sung thông tin email từ token để hiển thị đầy đủ
    const token = getToken()
    if (token) {
      const tokenData = decodeToken(token)
      if (tokenData?.email) {
        userData.email = tokenData.email
        console.log('📧 Added email from token:', tokenData.email)
      }
    }
    
    currentUser.value = userData
    
    // Kiểm tra xem đã có maKH chưa
    const existingMaKH = userData.maKH || userData.customerInfo?.maKH
    console.log('🔑 Existing maKH from user data:', existingMaKH)
    
    if (existingMaKH) {
      console.log('✅ maKH already available, loading orders directly')
      await loadOrders()
    } else {
      console.log('🔍 No maKH found, trying to get from API...')
      // Thử lấy maKH từ API trước
      const maKH = await getMaKHFromAPI()
      if (maKH) {
        console.log('✅ Got maKH from API, updating user data and loading orders')
        // Cập nhật currentUser
        currentUser.value.maKH = maKH
        currentUser.value.khachHang = { maKH: maKH }
        
        // Load orders
        await loadOrders()
      } else {
        console.log('❌ Could not get maKH from API, showing error')
        error.value = 'Không thể xác định thông tin khách hàng. Vui lòng đăng nhập lại hoặc cập nhật thông tin cá nhân trong trang Profile.'
      }
    }
    
    // Tự động refresh orders mỗi 30 giây
    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing orders...')
        await loadOrders()
      } catch (err) {
        console.warn('⚠️ Auto-refresh failed:', err.message)
      }
    }, 30000)
    
    // Cleanup interval khi component bị unmount
    const cleanup = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
    
    // Đăng ký cleanup function - đặt bên ngoài async function
    onUnmounted(cleanup)
    
  } catch (err) {
    console.error('❌ Error in onMounted:', err)
    error.value = 'Có lỗi xảy ra khi khởi tạo trang. Vui lòng thử lại.'
  }
})

// Cleanup function được đặt bên ngoài để tránh lỗi onUnmounted
onUnmounted(() => {
  console.log('🧹 Orders page unmounted, cleaning up...')
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

/* Order Tabs */
.order-tabs .nav-pills {
  background: white;
  border-radius: 15px;
  padding: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.order-tabs .nav-pills .nav-item {
  flex: 1;
}

.order-tabs .nav-pills .nav-link {
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #6c757d;
  font-weight: 500;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-tabs .nav-pills .nav-link:hover {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
  transform: translateY(-2px);
}

.order-tabs .nav-pills .nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.order-tabs .nav-pills .nav-link.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.order-tabs .badge {
  font-size: 0.7rem;
  min-width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Tab content */
.tab-info .alert {
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
}

/* Responsive tabs */
@media (max-width: 768px) {
  .order-tabs .nav-pills .nav-link {
    font-size: 0.85rem;
    padding: 0.5rem 0.25rem;
  }
  
  .order-tabs .nav-pills .nav-link i {
    display: none;
  }
  
  .order-tabs .badge {
    font-size: 0.6rem;
    min-width: 1.2rem;
    height: 1.2rem;
  }
}

/* Pagination styles */
.pagination-section {
  margin-top: 2rem;
}

.pagination .page-link {
  color: #007bff;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  margin: 0 2px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.pagination .page-item.disabled .page-link:hover {
  background-color: #fff;
  color: #6c757d;
  transform: none;
  box-shadow: none;
}

@media (max-width: 576px) {
  .order-tabs .nav-pills {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .order-tabs .nav-pills .nav-link {
    justify-content: flex-start;
  }
  
  .order-tabs .nav-pills .nav-link i {
    display: inline;
  }
}
</style>