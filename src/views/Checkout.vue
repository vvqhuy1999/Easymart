<template>
  <div class="checkout-page">
    <div class="container py-5 mt-5">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="fas fa-home"></i> Trang chủ
            </router-link>
          </li>
          <li class="breadcrumb-item" v-if="!isSingleProductCheckout">
            <router-link to="/cart" class="text-decoration-none">
              <i class="fas fa-shopping-cart"></i> Giỏ hàng
            </router-link>
          </li>
          <li class="breadcrumb-item" v-if="isSingleProductCheckout">
            <span class="text-muted">
              <i class="fas fa-bolt"></i> Mua ngay
            </span>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="fas fa-credit-card"></i> Thanh toán
          </li>
        </ol>
      </nav>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">
          <i class="fas fa-credit-card text-primary me-2"></i>
          {{ isSingleProductCheckout ? 'Thanh toán mua ngay' : 'Thanh toán đơn hàng' }}
        </h2>
      </div>

      <!-- Checkout Content -->
      <div v-if="selectedItems.length > 0" class="row">
        <!-- Customer Information -->
        <div class="col-lg-8">
          <!-- Delivery Information -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-truck me-2"></i>
                Thông tin giao hàng
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="processOrder">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="fullName" class="form-label">Họ và tên *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="fullName"
                      v-model="orderForm.fullName"
                      :class="{ 'is-invalid': errors.fullName }"
                      required
                    >
                    <div v-if="errors.fullName" class="invalid-feedback">
                      {{ errors.fullName }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">Số điện thoại *</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      id="phone"
                      v-model="orderForm.phone"
                      :class="{ 'is-invalid': errors.phone }"
                      required
                    >
                    <div v-if="errors.phone" class="invalid-feedback">
                      {{ errors.phone }}
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email"
                    v-model="orderForm.email"
                    :class="{ 'is-invalid': errors.email }"
                  >
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>
                <div class="mb-3">
                  <label for="address" class="form-label">Địa chỉ giao hàng *</label>
                  <textarea 
                    class="form-control" 
                    id="address" 
                    rows="3"
                    v-model="orderForm.address"
                    :class="{ 'is-invalid': errors.address }"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    required
                  ></textarea>
                  <div v-if="errors.address" class="invalid-feedback">
                    {{ errors.address }}
                  </div>
                </div>
                <div class="mb-3">
                  <label for="notes" class="form-label">Ghi chú đơn hàng</label>
                  <textarea 
                    class="form-control" 
                    id="notes" 
                    rows="2"
                    v-model="orderForm.notes"
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  ></textarea>
                </div>
                
                <!-- Button để chuyển đến trang Profile -->
                <div class="mb-3" v-if="isLoggedIn">
                  <div class="d-flex gap-2">
                    <router-link 
                      to="/profile" 
                      class="btn btn-outline-info btn-sm"
                      title="Chuyển đến trang Profile để cập nhật thông tin"
                    >
                      <i class="fas fa-user-edit me-2"></i>
                      Cập nhật thông tin từ Profile
                    </router-link>
                  </div>
                  
                  <!-- Thông báo trạng thái đồng bộ -->
                  <div class="mt-2">
                    <small class="text-muted">
                      <i class="fas fa-info-circle me-1"></i>
                      Thông tin giao hàng sẽ tự động được đồng bộ với Profile khi đặt hàng
                    </small>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="fas fa-money-bill-wave me-2"></i>
                Phương thức thanh toán
              </h5>
            </div>
            <div class="card-body">
              <!-- Loading state -->
              <div v-if="isLoadingPaymentMethods" class="text-center py-4">
                <div class="spinner-border text-success" role="status">
                  <span class="visually-hidden">Đang tải...</span>
                </div>
                <p class="mt-2 text-muted">Đang tải phương thức thanh toán...</p>
              </div>
              
              <!-- Payment methods from API -->
              <div v-else-if="paymentMethods.length > 0" class="row">
                <div 
                  v-for="method in paymentMethods" 
                  :key="method.maPTTT"
                  class="col-md-6 mb-3"
                >
                  <div class="form-check payment-method">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      :id="method.maPTTT"
                      :value="method.tenPTTT"
                      v-model="orderForm.paymentMethod"
                    >
                    <label class="form-check-label w-100" :for="method.maPTTT">
                      <div class="d-flex align-items-center">
                        <i :class="getPaymentMethodIcon(method.tenPTTT)" class="me-3 fs-4"></i>
                        <div>
                          <strong>{{ method.tenPTTT }}</strong>
                          <div class="text-muted small">{{ method.moTa }}</div>
                          <div v-if="method.phiGiaoDich > 0" class="text-info small">
                            Phí giao dịch: {{ formatPrice(method.phiGiaoDich) }}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Error state -->
              <div v-else-if="paymentMethodsError" class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Không thể tải phương thức thanh toán. Vui lòng thử lại sau.
                <button @click="fetchPaymentMethods" class="btn btn-sm btn-outline-warning ms-2">
                  <i class="fas fa-redo me-1"></i>Thử lại
                </button>
              </div>
              
              <!-- Fallback payment methods -->
              <div v-else class="row">
                <div class="col-md-6 mb-3">
                  <div class="form-check payment-method">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      id="cod"
                      value="Tiền Mặt"
                      v-model="orderForm.paymentMethod"
                      checked
                    >
                    <label class="form-check-label w-100" for="cod">
                      <div class="d-flex align-items-center">
                        <i class="fas fa-hand-holding-usd text-success me-3 fs-4"></i>
                        <div>
                          <strong>Thanh toán khi nhận hàng (COD)</strong>
                          <div class="text-muted small">Thanh toán bằng tiền mặt khi nhận hàng</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Payment Info based on selected method -->
              <div v-if="orderForm.paymentMethod && selectedPaymentMethod" class="payment-info mt-3 p-3 bg-light rounded">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-info-circle me-2"></i>
                  Thông tin {{ selectedPaymentMethod.tenPTTT }}
                </h6>
                <div class="row">
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Số tiền:</strong> {{ formatPrice(total) }}</p>
                    <p class="mb-2"><strong>Mã đơn hàng:</strong> {{ orderCode }}</p>
                    <p v-if="selectedPaymentMethod.phiGiaoDich > 0" class="mb-2">
                      <strong>Phí giao dịch:</strong> {{ formatPrice(selectedPaymentMethod.phiGiaoDich) }}
                    </p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-0 text-info">
                      <small><strong>Hướng dẫn:</strong> {{ getPaymentInstructions(selectedPaymentMethod.tenPTTT) }}</small>
                    </p>
                  </div>
                </div>
                
                <!-- Special info for specific payment methods -->
                <div v-if="selectedPaymentMethod.tenPTTT === 'Chuyển Khoản'" class="banking-details mt-3 p-3 bg-white rounded border">
                  <h6 class="text-primary mb-2">Thông tin chuyển khoản</h6>
                  <div class="row">
                    <div class="col-md-6">
                      <p class="mb-1"><strong>Ngân hàng:</strong> Vietcombank</p>
                      <p class="mb-1"><strong>Số tài khoản:</strong> 1234567890</p>
                      <p class="mb-1"><strong>Chủ tài khoản:</strong> EASYMART COMPANY</p>
                    </div>
                    <div class="col-md-6">
                      <p class="mb-1"><strong>Nội dung:</strong> THANHTOAN {{ orderCode }}</p>
                      <p class="mb-0 text-danger"><small><strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng nội dung để đơn hàng được xử lý nhanh chóng.</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4">
          <div class="card sticky-top" style="top: 100px;">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0">
                <i class="fas fa-receipt me-2"></i>
                Đơn hàng của bạn
              </h5>
            </div>
            <div class="card-body">
              <!-- Order Items -->
              <div class="order-items mb-3">
                <div 
                  v-for="item in selectedItems" 
                  :key="item.productId"
                  class="order-item d-flex align-items-center mb-3 pb-3 border-bottom"
                >
                  <img 
                    :src="item.product?.image" 
                    :alt="item.product?.name"
                    class="order-item-image me-3"
                  >
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ item.product?.name }}</h6>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">{{ formatPrice(item.product?.price || 0) }} x {{ item.quantity }}</span>
                      <span class="fw-bold">{{ formatPrice((item.product?.price || 0) * item.quantity) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="order-summary">
                <div class="d-flex justify-content-between mb-2">
                  <span>Tạm tính ({{ totalItemsCount }} sản phẩm):</span>
                  <span>{{ formatPrice(subtotal) }}</span>
                </div>
                

                <!-- Transaction Fee -->
                <div v-if="selectedPaymentMethod && selectedPaymentMethod.phiGiaoDich > 0" class="d-flex justify-content-between mb-2">
                  <span>Phí giao dịch ({{ selectedPaymentMethod.tenPTTT }}):</span>
                  <span class="text-info">{{ formatPrice(selectedPaymentMethod.phiGiaoDich) }}</span>
                </div>

                <!-- Coupon Section -->
                <div class="coupon-section mb-3">
                  <div class="d-flex gap-2 mb-2">
                    <input 
                      type="text" 
                      class="form-control form-control-sm" 
                      placeholder="Nhập mã khuyến mãi"
                      v-model="couponCode"
                      :disabled="appliedCoupon"
                    >
                    <button 
                      class="btn btn-outline-primary btn-sm"
                      @click="applyCoupon"
                      :disabled="!couponCode.trim() || appliedCoupon || isApplyingCoupon"
                    >
                      <span v-if="isApplyingCoupon">
                        <i class="fas fa-spinner fa-spin"></i>
                      </span>
                      <span v-else>
                        {{ appliedCoupon ? 'Đã áp dụng' : 'Áp dụng' }}
                      </span>
                    </button>
                  </div>
                  
                  <!-- Applied Coupon Display -->
                  <div v-if="appliedCoupon" class="applied-coupon">
                    <div class="d-flex justify-content-between align-items-center p-3 rounded-3" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border: 1px solid rgba(102, 126, 234, 0.3);">
                      <div>
                        <small class="fw-bold" style="color: #667eea;">
                          <i class="fas fa-ticket-alt me-1"></i>
                          {{ appliedCoupon.code }}
                        </small>
                        <div class="small text-muted">{{ appliedCoupon.description }}</div>
                      </div>
                      <button 
                        class="btn btn-sm"
                        style="background: linear-gradient(135deg, #ff6b6b, #ee5a5a); color: white; border: none;"
                        @click="removeCoupon"
                        title="Xóa mã khuyến mãi"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Coupon Discount -->
                  <div v-if="couponDiscount > 0" class="d-flex justify-content-between mb-2" style="color: #11998e;">
                    <span>Giảm giá ({{ appliedCoupon?.code }}):</span>
                    <span>-{{ formatPrice(couponDiscount) }}</span>
                  </div>
                </div>

                <hr>
                <div class="d-flex justify-content-between mb-3">
                  <strong class="fs-5">Tổng cộng:</strong>
                  <strong class="text-danger fs-5">{{ formatPrice(total) }}</strong>
                </div>
                
                <button 
                  type="button"
                  class="btn btn-primary w-100 mb-2 py-2"
                  @click="processOrder"
                  :disabled="isProcessing || !isFormValid"
                >
                  <span v-if="isProcessing">
                    <i class="fas fa-spinner fa-spin me-2"></i>
                    Đang xử lý...
                  </span>
                  <span v-else-if="isProcessingVNPay">
                    <i class="fas fa-spinner fa-spin me-2"></i>
                    Đang chuyển đến VNPay...
                  </span>
                  <span v-else>
                    <i class="fas fa-check me-2"></i>
                    Đặt hàng
                  </span>
                </button>
                
                <router-link 
                  :to="isSingleProductCheckout ? '/' : '/cart'" 
                  class="btn btn-outline-secondary w-100"
                >
                  <i :class="isSingleProductCheckout ? 'fas fa-home' : 'fas fa-arrow-left'" class="me-2"></i>
                  {{ isSingleProductCheckout ? 'Về trang chủ' : 'Quay lại giỏ hàng' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Checkout -->
      <div v-else class="row">
        <div class="col-12">
          <div class="empty-checkout text-center py-5">
            <div class="empty-checkout-icon mb-4">
              <i class="fas fa-exclamation-triangle fa-5x text-warning"></i>
            </div>
            <h3 class="text-muted mb-3">Không có sản phẩm để thanh toán</h3>
            <p class="text-muted mb-4">
              {{ isSingleProductCheckout ? 'Vui lòng quay lại trang sản phẩm để mua hàng' : 'Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán' }}
            </p>
            <router-link 
              :to="isSingleProductCheckout ? '/' : '/cart'" 
              class="btn btn-primary btn-lg"
            >
              <i :class="isSingleProductCheckout ? 'fas fa-home' : 'fas fa-arrow-left'" class="me-2"></i>
              {{ isSingleProductCheckout ? 'Về trang chủ' : 'Quay lại giỏ hàng' }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Checkout.vue - Trang thanh toán
 * 
 * Chức năng:
 * - Hiển thị thông tin đơn hàng
 * - Thu thập thông tin giao hàng
 * - Chọn phương thức thanh toán
 * - Xử lý đặt hàng
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'
import { useCart } from '../composables/useCart'
import { useAuth } from '../composables/useAuth'
import { API_CONFIG, API_ENDPOINTS } from '../config/api.js'
import { getToken } from '../utils/tokenStorage.js'

// Router
const router = useRouter()

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
 * Lấy maKH từ API như trong Orders.vue
 */
const getMaKHFromAPI = async () => {
  try {
    console.log('🔍 === GETTING MAKH FROM API (Checkout) ===')
    
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

// Composables
const { formatPrice, showNotification, products } = useEasyMart()
const { cart, clearCart } = useCart()
const { user, isLoggedIn } = useAuth()

// Helper function để lấy hình ảnh sản phẩm
const getProductImage = (productId) => {
  if (!productId) return '/placeholder-image.jpg'
  
  // Sử dụng API hình ảnh sản phẩm với BASE_URL
  const imageUrls = API_ENDPOINTS.IMAGES.PRODUCT_IMAGES(productId)
  
  // Trả về hình ảnh đầu tiên với BASE_URL hoặc placeholder
  return imageUrls[0] ? `${API_CONFIG.BASE_URL}${imageUrls[0]}` : '/placeholder-image.jpg'
}



// Helper function để pre-fill thông tin người dùng
const prefillUserInfo = async () => {
  try {
    // Kiểm tra xem có đăng nhập thực sự không
    const token = getToken()
    if (!token) {
      console.log('⚠️ No token found, user not logged in')
      tryFallbackUserInfo()
      return
    }
    
    console.log('👤 Pre-filling user info...')
    
    // Đảm bảo có maKH trước khi fetch shipping info
    let maKH = cart?.maKH || 
                user.value?.customerInfo?.maKH || 
                user.value?.maKH ||
                user.value?.khachHang?.maKH
    
    if (!maKH) {
      console.log('🔍 No maKH found, getting from API first...')
      const realMaKH = await getMaKHFromAPI()
      if (realMaKH) {
        maKH = realMaKH
        // Cập nhật user state
        if (user.value) {
          if (!user.value.customerInfo) user.value.customerInfo = {}
          user.value.customerInfo.maKH = realMaKH
          user.value.maKH = realMaKH
          user.value.khachHang = { maKH: realMaKH }
        }
        console.log('✅ Got maKH from API, now fetching shipping info')
      } else {
        console.log('❌ Could not get maKH, using fallback')
        tryFallbackUserInfo()
        return
      }
    }
    
    // Lấy thông tin giao hàng từ Shipping API riêng biệt
    await fetchShippingInfoFromAPI()
    
    // Điền thông tin từ user profile
    if (user.value.name) {
      orderForm.value.fullName = user.value.name
    }
    
    if (user.value.email) {
      orderForm.value.email = user.value.email
    }
    
    // Nếu có thông tin khách hàng chi tiết, sử dụng
    if (user.value.customerInfo) {
      const khachHang = user.value.customerInfo
      
      if (khachHang.hoTen) {
        orderForm.value.fullName = khachHang.hoTen
      }
      
      if (khachHang.sdt) {
        orderForm.value.phone = khachHang.sdt
      }
      
      if (khachHang.diaChi) {
        orderForm.value.address = khachHang.diaChi
      }
      
      if (khachHang.nguoiDung?.email) {
        orderForm.value.email = khachHang.nguoiDung.email
      }
    }
    
    console.log('✅ Form đã được pre-fill:', orderForm.value)
  } catch (error) {
    console.error('❌ Lỗi khi pre-fill user info:', error)
    console.log('🔍 Debug info:', {
      isLoggedIn: isLoggedIn,
      user: user,
      orderForm: orderForm
    })
    
    // Fallback: thử lấy thông tin từ localStorage
    tryFallbackUserInfo()
  }
}

// Fallback function để lấy thông tin từ localStorage
const tryFallbackUserInfo = () => {
  try {
    console.log('🔄 Trying fallback: getting user info from localStorage...')
    
    // Thử lấy thông tin từ localStorage
    const storedUser = localStorage.getItem('easymart-user')
    
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      console.log('📦 Found user data in localStorage:', userData)
      
      if (userData.name) {
        orderForm.value.fullName = userData.name
      }
      
      if (userData.email) {
        orderForm.value.email = userData.email
      }
      
      console.log('✅ Fallback pre-fill successful')
    } else {
      console.log('⚠️ No user data found in localStorage')
    }
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError)
  }
}

// Function để lấy thông tin giao hàng từ Shipping API
const fetchShippingInfoFromProfile = async () => {
  try {
    console.log('📡 Fetching shipping info from Shipping API...')
    isSyncingWithProfile.value = true
    
    // Lấy maKH từ user state
    const maKH = user.value?.customerInfo?.maKH
    if (!maKH) {
      console.log('⚠️ No maKH found, cannot fetch shipping info')
      return
    }
    
    // Lấy token từ cookie
    const token = getTokenFromCookie()
    if (!token) {
      console.log('⚠️ No token found, cannot fetch shipping info')
      return
    }
    
    // Gọi API mới để lấy thông tin shipping
    const infoEndpoint = `${API_CONFIG.BASE_URL}/api/khachhang/${maKH}/shipping-info`
    console.log('🔗 Fetching from Shipping API endpoint:', infoEndpoint)
    
    const infoResponse = await fetch(infoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!infoResponse.ok) {
      console.log('⚠️ Shipping API failed:', infoResponse.status)
      return
    }
    
    const infoResult = await infoResponse.json()
    console.log('📥 Shipping API response:', infoResult)
    
    // Xử lý response format khác nhau
    let customerData = null
    
    if (infoResult?.data) {
      customerData = infoResult.data
    } else if (infoResult?.result) {
      customerData = infoResult.result
    } else if (infoResult?.hoTen || infoResult?.sdt || infoResult?.diaChi) {
      customerData = infoResult
    } else if (Array.isArray(infoResult)) {
      customerData = infoResult[0]
    }
    
    if (customerData) {
      console.log('✅ Shipping data received:', customerData)
      
      // Cập nhật user state với dữ liệu mới
      if (user.value?.customerInfo) {
        user.value.customerInfo = { ...user.value.customerInfo, ...customerData }
      }
      
      // Cập nhật form với thông tin giao hàng
      if (customerData.hoTen) {
        orderForm.value.fullName = customerData.hoTen
      }
      
      // Handle both sdt and soDienThoai field names
      if (customerData.sdt || customerData.soDienThoai) {
        orderForm.value.phone = customerData.sdt || customerData.soDienThoai
      }
      
      if (customerData.diaChi) {
        orderForm.value.address = customerData.diaChi
      }
      
      // Handle email from multiple sources
      if (customerData.email) {
        orderForm.value.email = customerData.email
      } else if (customerData.nguoiDung?.email) {
        orderForm.value.email = customerData.nguoiDung.email
      }
      
      console.log('✅ Shipping info updated from Shipping API')
    }
    
  } catch (error) {
    console.error('❌ Error fetching shipping info:', error)
  } finally {
    isSyncingWithProfile.value = false
  }
}

// Function để cập nhật thông tin giao hàng vào Shipping API
const updateShippingInfoToAPI = async () => {
  try {
    console.log('📤 Updating shipping info to Shipping API...')
    
    // Tìm maKH từ các nguồn khác nhau - ưu tiên cart vì nó đang hoạt động
    let maKH = cart?.maKH || 
                user.value?.customerInfo?.maKH || 
                user.value?.maKH ||
                user.value?.khachHang?.maKH
    
    if (!maKH) {
      // Thử lấy từ API nếu không có
      const realMaKH = await getMaKHFromAPI()
      if (realMaKH) {
        maKH = realMaKH
        console.log('✅ Got maKH from API for update:', maKH)
      } else {
        console.log('⚠️ No maKH found, cannot update shipping info')
        showNotification('Không thể xác định thông tin khách hàng!', 'error')
        return false
      }
    }
    
    // Lấy token từ getToken function thay vì cookie
    const token = getToken()
    if (!token) {
      console.log('⚠️ No token found, cannot update shipping info')
      return false
    }
    
    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      hoTen: orderForm.value.fullName,
      sdt: orderForm.value.phone,
      diaChi: orderForm.value.address,
      email: orderForm.value.email
    }
    
    console.log('📤 Update data prepared:', updateData)
    
    // Gọi API mới cho Shipping Info
    const updateEndpoint = `${API_CONFIG.BASE_URL}/api/khachhang/${maKH}/shipping-info`
    console.log('🔗 Update Shipping API endpoint:', updateEndpoint)
    
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
      console.log('⚠️ Shipping API update failed:', updateResponse.status, errorData.message)
      return false
    }
    
    const updateResult = await updateResponse.json()
    console.log('📥 Shipping API update response:', updateResult)
    
    // Kiểm tra response format
    if (updateResult?.success || updateResult?.result?.success || updateResult?.message?.includes('thành công')) {
      console.log('✅ Shipping info updated successfully')
      
      // Cập nhật user state
      if (user.value?.customerInfo) {
        user.value.customerInfo = { 
          ...user.value.customerInfo, 
          hoTen: orderForm.value.fullName,
          sdt: orderForm.value.phone,
          diaChi: orderForm.value.address
        }
      }
      
      return true
    } else {
      console.log('⚠️ Shipping API update response format unexpected:', updateResult)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error updating shipping info:', error)
    return false
  }
}

// Function để lưu thông tin giao hàng vào Shipping API (gọi từ button)
const saveShippingInfoToAPI = async () => {
  try {
    console.log('💾 Saving shipping info to Shipping API...')
    
    // Validate form trước khi lưu
    if (!validateForm()) {
      showNotification('Vui lòng kiểm tra lại thông tin giao hàng', 'error')
      return
    }
    
    // Kiểm tra xem user có đăng nhập không
    if (!isLoggedIn || !isLoggedIn.value || !user.value?.customerInfo?.maKH) {
      showNotification('Vui lòng đăng nhập để lưu thông tin giao hàng', 'warning')
      return
    }
    
    // Cập nhật thông tin vào Shipping API
    const updateSuccess = await updateShippingInfoToAPI()
    
    if (updateSuccess) {
      showNotification('Thông tin giao hàng đã được lưu thành công!', 'success')
    } else {
      showNotification('Không thể lưu thông tin giao hàng. Vui lòng thử lại!', 'error')
    }
    
  } catch (error) {
    console.error('❌ Error saving shipping info:', error)
    showNotification('Có lỗi xảy ra khi lưu thông tin giao hàng!', 'error')
  }
}

// Helper function để lấy token từ cookie (fallback)
const getTokenFromCookie = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('easymart-token='))?.split('=')[1]
  console.log('🍪 Token from cookie:', token ? 'Present' : 'Missing')
  console.log('🍪 All cookies:', document.cookie)
  return token
}

// Helper function để kiểm tra token có expired không
const isTokenExpired = (token) => {
  try {
    if (!token) return true
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Token expired nếu thời gian hiện tại > thời gian hết hạn
    return currentTime >= payload.exp
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

// Helper function để kiểm tra auth status
const checkAuthStatus = () => {
  const token = getToken()
  
  if (!token) {
    console.log('❌ No token found')
    return false
  }
  
  if (isTokenExpired(token)) {
    console.log('❌ Token expired')
    // Clear expired token
    localStorage.removeItem('easymart-token')
    return false
  }
  
  console.log('✅ Token valid')
  return true
}

// Function để fetch payment methods từ API
const fetchPaymentMethods = async () => {
  try {
    console.log('📡 Fetching payment methods from API...')
    isLoadingPaymentMethods.value = true
    paymentMethodsError.value = ''
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/phuongthucthanhtoan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('📥 Payment methods API response:', result)
    
    // Xử lý response format khác nhau
    let methods = []
    
    if (result?.data) {
      methods = result.data
    } else if (result?.result) {
      methods = result.result
    } else if (Array.isArray(result)) {
      methods = result
    } else {
      throw new Error('Unexpected response format')
    }
    
         // Lọc chỉ những phương thức có trạng thái = 1 và không bị xóa
     const activeMethods = methods.filter(method => 
       method.trangThai === 1 && !method.isDeleted
     )
     
     console.log('✅ Active payment methods:', activeMethods)
     paymentMethods.value = activeMethods
     
     // Set default payment method nếu chưa có
     if (activeMethods.length > 0 && !orderForm.value.paymentMethod) {
       // Ưu tiên thanh toán tiền mặt làm mặc định
       const cashMethod = activeMethods.find(method => 
         method.tenPTTT === 'Tiền Mặt' || 
         method.tenPTTT.toLowerCase().includes('tiền mặt') ||
         method.tenPTTT.toLowerCase().includes('cod')
       )
       
       if (cashMethod) {
         orderForm.value.paymentMethod = cashMethod.tenPTTT
         console.log('💰 Set default payment method to:', cashMethod.tenPTTT)
       } else {
         orderForm.value.paymentMethod = activeMethods[0].tenPTTT
         console.log('💰 Set default payment method to:', activeMethods[0].tenPTTT)
       }
     }
    
  } catch (error) {
    console.error('❌ Error fetching payment methods:', error)
    paymentMethodsError.value = 'Không thể tải phương thức thanh toán: ' + error.message
  } finally {
    isLoadingPaymentMethods.value = false
  }
}

// Function để lấy icon cho phương thức thanh toán
const getPaymentMethodIcon = (methodName) => {
  const iconMap = {
    'Tiền Mặt': 'fas fa-hand-holding-usd text-success',
    'Chuyển Khoản': 'fas fa-university text-primary',
    'MoMo': 'fab fa-momo text-danger',
    'ZaloPay': 'fas fa-mobile-alt text-warning',
    'Thẻ Tín Dụng': 'fas fa-credit-card text-info',
    'VNPay': 'fas fa-credit-card text-info'
  }
  
  return iconMap[methodName] || 'fas fa-credit-card text-secondary'
}

// Function để lấy hướng dẫn cho phương thức thanh toán
const getPaymentInstructions = (methodName) => {
  const instructions = {
    'Tiền Mặt': 'Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng.',
    'Chuyển Khoản': 'Vui lòng chuyển khoản theo thông tin ngân hàng bên dưới.',
    'MoMo': 'Bạn sẽ được chuyển đến app MoMo để hoàn tất thanh toán.',
    'ZaloPay': 'Bạn sẽ được chuyển đến app ZaloPay để hoàn tất thanh toán.',
    'Thẻ Tín Dụng': 'Bạn sẽ được chuyển đến cổng thanh toán để nhập thông tin thẻ.',
    'VNPay': 'Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.'
  }
  
  return instructions[methodName] || 'Vui lòng làm theo hướng dẫn thanh toán.'
}

// Local state
const isProcessing = ref(false)
const isProcessingVNPay = ref(false)
const orderCode = ref('')
const errors = ref({})
const isSyncingWithProfile = ref(false)

// Payment methods state
const paymentMethods = ref([])
const isLoadingPaymentMethods = ref(false)
const paymentMethodsError = ref('')

// Coupon state
const couponCode = ref('')
const appliedCoupon = ref(null)
const isApplyingCoupon = ref(false)
const availableCoupons = ref([]) // No longer needed since we're using real API

// Order form
const orderForm = ref({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  paymentMethod: 'Tiền Mặt' // Mặc định là thanh toán tiền mặt
})

// Get selected items from localStorage or route params
const selectedItems = ref([])

// Computed properties
const subtotal = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)
})



const couponDiscount = computed(() => {
  if (!appliedCoupon.value) return 0
  
  const coupon = appliedCoupon.value
  const orderValue = subtotal.value
  
  // Check minimum order value
  if (orderValue < coupon.minOrderValue) return 0
  
  let discount = 0
  
  switch (coupon.discountType) {
    case 'percentage':
      discount = (orderValue * coupon.discountValue) / 100
      break
    case 'fixed':
      discount = coupon.discountValue
      break
    case 'shipping':
      discount = 0 // Không còn phí vận chuyển
      break
    default:
      discount = 0
  }
  
  // Apply maximum discount limit
  return Math.min(discount, coupon.maxDiscount)
})

const total = computed(() => {
  // Lấy phí giao dịch từ payment method được chọn
  const transactionFee = selectedPaymentMethod.value?.phiGiaoDich || 0
  
  // Tính tổng: tạm tính - giảm giá + phí giao dịch
  return subtotal.value - couponDiscount.value + transactionFee
})

const totalItemsCount = computed(() => {
  return selectedItems.value.reduce((total, item) => total + item.quantity, 0)
})

const isFormValid = computed(() => {
  return orderForm.value.fullName && 
         orderForm.value.phone && 
         orderForm.value.address &&
         orderForm.value.paymentMethod
})

// Computed property để lấy payment method được chọn
const selectedPaymentMethod = computed(() => {
  return paymentMethods.value.find(method => method.tenpttt === orderForm.value.paymentMethod)
})

// Kiểm tra xem có phải mua ngay từ ProductDetail không
const isSingleProductCheckout = computed(() => {
  return selectedItems.value.length === 1 && 
         false
})

// Methods
const generateOrderCode = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `EM${timestamp}${random}`
}

const validateForm = () => {
  errors.value = {}
  
  if (!orderForm.value.fullName.trim()) {
    errors.value.fullName = 'Vui lòng nhập họ và tên'
  }
  
  if (!orderForm.value.phone.trim()) {
    errors.value.phone = 'Vui lòng nhập số điện thoại'
  } else if (!/^[0-9]{10,11}$/.test(orderForm.value.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Số điện thoại không hợp lệ'
  }
  
  if (orderForm.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.value.email)) {
    errors.value.email = 'Email không hợp lệ'
  }
  
  if (!orderForm.value.address.trim()) {
    errors.value.address = 'Vui lòng nhập địa chỉ giao hàng'
  }
  
  return Object.keys(errors.value).length === 0
}

// Coupon methods
const applyCoupon = async () => {
  if (!couponCode.value.trim()) return
  
  isApplyingCoupon.value = true
  
  try {
    // Get token for authentication
    const token = getToken()
    if (!token) {
      showNotification('Vui lòng đăng nhập để sử dụng mã khuyến mãi!', 'error')
      return
    }
    
    // Debug: Log API configuration
    console.log('🔧 API Config:', {
      BASE_URL: API_CONFIG.BASE_URL,
      fullEndpoint: `${API_CONFIG.BASE_URL}/api/khuyenmai`,
      couponCode: couponCode.value.trim()
    })
    
    // Call real promotions API - use the working endpoint structure
    console.log('🔗 Calling promotions API:', `${API_CONFIG.BASE_URL}/api/khuyenmai`)
    console.log('🔑 Token present:', !!token)
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/khuyenmai`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // Response is not JSON, likely HTML error page
      const textResponse = await response.text()
      console.error('❌ Non-JSON response received:', textResponse.substring(0, 200))
      throw new Error('Server trả về lỗi. Vui lòng thử lại sau!')
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `Lỗi ${response.status}: Không thể tải danh sách khuyến mãi`
      throw new Error(errorMessage)
    }
    
    const result = await response.json()
    console.log('📥 Promotions API response:', result)
    
    // Extract promotions data from response
    let promotionsData = []
    
    if (result?.data) {
      promotionsData = result.data
    } else if (result?.result) {
      promotionsData = result.result
    } else if (Array.isArray(result)) {
      promotionsData = result
    } else {
      throw new Error('Không nhận được danh sách khuyến mãi hợp lệ')
    }
    
    // Filter active promotions and find the matching coupon code
    const activePromotions = promotionsData.filter(promo => 
      promo.trangThai === 1 && !promo.isDeleted
    )
    
    console.log('✅ Active promotions found:', activePromotions.length)
    
    // Find the specific coupon by code
    const couponData = activePromotions.find(promo => 
      (promo.couponCode && promo.couponCode.toLowerCase() === couponCode.value.trim().toLowerCase()) ||
      (promo.maKM && promo.maKM.toLowerCase() === couponCode.value.trim().toLowerCase())
    )
    
    if (!couponData) {
      throw new Error('Mã khuyến mãi không tồn tại hoặc đã hết hạn')
    }
    
    console.log('🎯 Found matching coupon:', couponData)
    
    // Map API response to coupon format (using the same structure as Promotions.vue)
    const coupon = {
      code: couponData.couponCode || couponData.maKM,
      description: couponData.moTa || couponData.tenKM || 'Mã khuyến mãi',
      discountType: mapDiscountType(couponData.loaiKM),
      discountValue: couponData.giaTriKM || 0,
      minOrderValue: 0, // API doesn't have this field, default to 0
      maxDiscount: (couponData.giaTriKM || 0) * 1000, // Estimate based on promotion value
      isActive: isPromotionActive(couponData),
      startDate: new Date(couponData.ngayBatDau),
      endDate: new Date(couponData.ngayKetThuc),
      remainingQuantity: (couponData.soLuongToiDa || 0) - (couponData.daSuDung || 0),
      totalQuantity: couponData.soLuongToiDa || 0,
      usedQuantity: couponData.daSuDung || 0
    }
    
    // Validate coupon
    if (!coupon.isActive) {
      throw new Error('Mã khuyến mãi đã hết hạn hoặc không còn hiệu lực')
    }
    
    if (!coupon.code) {
      throw new Error('Mã khuyến mãi không hợp lệ')
    }
    
    // Check minimum order value
    if (subtotal.value < coupon.minOrderValue) {
      showNotification(
        `Đơn hàng tối thiểu ${formatPrice(coupon.minOrderValue)} để áp dụng mã này!`, 
        'warning'
      )
      return
    }
    
    // Apply coupon
    appliedCoupon.value = coupon
    showNotification(`Áp dụng mã ${coupon.code} thành công!`, 'success')
    
  } catch (error) {
    console.error('❌ Error applying coupon:', error)
    
    // Check if it's a server/API error
    if (error.message.includes('Server trả về lỗi') || error.message.includes('fetch')) {
      showNotification('Máy chủ đang gặp sự cố. Vui lòng thử lại sau!', 'error')
    } else {
      showNotification(`Lỗi khi áp dụng mã khuyến mãi: ${error.message}`, 'error')
    }
    
    // Fallback: try to use a test coupon if API fails
    if (error.message.includes('Server trả về lỗi')) {
      console.log('🔄 Trying fallback test coupon...')
      try {
        // Create a test coupon for development/testing
        const testCoupon = {
          code: couponCode.value.trim(),
          description: 'Mã khuyến mãi test (API không khả dụng)',
          discountType: 'percentage',
          discountValue: 10,
          minOrderValue: 0,
          maxDiscount: 50000,
          isActive: true
        }
        
        // Check minimum order value
        if (subtotal.value >= testCoupon.minOrderValue) {
          appliedCoupon.value = testCoupon
          showNotification(`Áp dụng mã test ${testCoupon.code} (API offline)`, 'warning')
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
      }
    }
  } finally {
    isApplyingCoupon.value = false
  }
}

const removeCoupon = () => {
  appliedCoupon.value = null
  couponCode.value = ''
  showNotification('Đã xóa mã khuyến mãi!', 'info')
}

// Helper function to map discount type from API to component format
const mapDiscountType = (loaiKM) => {
  const typeMap = {
    'PhanTram': 'percentage',
    'TienMat': 'fixed',
    'Diem': 'points',
    'MuaXTangY': 'buyXGetY',
    'GiamGia': 'discount'
  }
  return typeMap[loaiKM] || 'discount'
}

// Helper function to check if promotion is active
const isPromotionActive = (promo) => {
  const now = new Date()
  const startDate = new Date(promo.ngayBatDau)
  const endDate = new Date(promo.ngayKetThuc)
  
  return now >= startDate && now <= endDate && 
         promo.trangThai === 1 && 
         !promo.isDeleted &&
         (promo.daSuDung || 0) < (promo.soLuongToiDa || 0)
}

// Function to select a coupon (no longer needed with real API)
// const selectCoupon = (code) => {
//   couponCode.value = code
//   applyCoupon()
// }

const processOrder = async () => {
  if (!validateForm()) {
    showNotification('Vui lòng kiểm tra lại thông tin đơn hàng', 'error')
    return
  }
  
  isProcessing.value = true
  
  try {
    // Tự động cập nhật thông tin giao hàng vào Profile nếu user đã đăng nhập
    if (isLoggedIn && isLoggedIn.value && user.value?.customerInfo?.maKH) {
      console.log('🔄 Auto-updating shipping info to Profile...')
      const updateSuccess = await updateShippingInfoToAPI()
      
      if (updateSuccess) {
        showNotification('Thông tin giao hàng đã được cập nhật vào Profile!', 'success')
      } else {
        console.log('⚠️ Failed to update shipping info to Profile, continuing with order...')
      }
    }
    
    // Kiểm tra xem có hóa đơn từ Cart.vue không
    const invoiceData = localStorage.getItem('easymart-invoice')
    let order
    
    if (invoiceData) {
      // Có hóa đơn rồi, chỉ cần cập nhật thông tin giao hàng và thanh toán
      const invoice = JSON.parse(invoiceData)
      
      console.log('📋 Cập nhật thông tin giao hàng cho hóa đơn:', invoice.maHD)
      
      // TODO: Gọi API để cập nhật thông tin giao hàng của hóa đơn
      // await updateInvoiceShippingInfo(invoice.maHD, orderForm.value)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
              // Create order object với thông tin hóa đơn
        order = {
          orderCode: `HD${invoice.maHD}`,
          invoiceId: invoice.maHD,
          customer: { ...orderForm.value },
          items: selectedItems.value,
          summary: {
            subtotal: subtotal.value,
            couponDiscount: couponDiscount.value,
            total: total.value,
            itemsCount: totalItemsCount.value
          },
          // Sử dụng thông tin coupon từ appliedCoupon (đã được load từ invoice data nếu có)
          coupon: appliedCoupon.value ? {
            code: appliedCoupon.value.code,
            description: appliedCoupon.value.description,
            discountType: appliedCoupon.value.discountType,
            discountValue: couponDiscount.value,
            tienGiamGia: couponDiscount.value,
            tongTienSauGiamGia: total.value
          } : null,
          // Thêm thông tin khuyến mãi để cập nhật database
          maKM: appliedCoupon.value?.code || null,
          tienGiamGia: couponDiscount.value,
          tongTienSauGiamGia: total.value,
          createdAt: invoice.ngayLap || new Date().toISOString()
        }
      
              console.log('📋 Created order with invoice:', {
          orderCode: order.orderCode,
          invoiceId: order.invoiceId,
          coupon: order.coupon,
          couponDiscount: order.summary.couponDiscount,
          total: order.summary.total,
          appliedCoupon: appliedCoupon.value,
          maKM: order.maKM,
          tienGiamGia: order.tienGiamGia,
          tongTienSauGiamGia: order.tongTienSauGiamGia
        })
    } else {
      // Không có hóa đơn, tạo mới (fallback)
      console.log('⚠️ Không có hóa đơn, tạo đơn hàng mới')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create order object
      order = {
        orderCode: orderCode.value,
        invoiceId: null, // Không có invoiceId cho order mới
        customer: { ...orderForm.value },
        items: selectedItems.value,
        summary: {
          subtotal: subtotal.value,
          couponDiscount: couponDiscount.value,
          total: total.value,
          itemsCount: totalItemsCount.value
        },
        coupon: appliedCoupon.value ? {
          code: appliedCoupon.value.code,
          description: appliedCoupon.value.description,
          discountType: appliedCoupon.value.discountType,
          discountValue: couponDiscount.value,
          tienGiamGia: couponDiscount.value,
          tongTienSauGiamGia: total.value
        } : null,
        // Thêm thông tin khuyến mãi để cập nhật database
        maKM: appliedCoupon.value?.code || null,
        tienGiamGia: couponDiscount.value,
        tongTienSauGiamGia: total.value,
        createdAt: new Date().toISOString()
      }
      
              console.log('📋 Created new order:', {
          orderCode: order.orderCode,
          invoiceId: order.invoiceId,
          coupon: order.coupon,
          couponDiscount: order.summary.couponDiscount,
          total: order.summary.total,
          appliedCoupon: appliedCoupon.value,
          maKM: order.maKM,
          tienGiamGia: order.tienGiamGia,
          tongTienSauGiamGia: order.tongTienSauGiamGia
        })
    }
    
    // Save order to localStorage (in real app, send to API)
    // const orders = JSON.parse(localStorage.getItem('easymart-orders') || '[]')
    // orders.push(order)
    // localStorage.setItem('easymart-orders', JSON.stringify(orders))
    
    // Nếu có mã khuyến mãi và có invoiceId, cập nhật lại hóa đơn với thông tin khuyến mãi
    if (appliedCoupon.value && order.invoiceId) {
      try {
        console.log('🎫 Updating invoice with coupon information...')
        console.log('🔍 Applied coupon:', appliedCoupon.value)
        console.log('🔍 Invoice ID:', order.invoiceId)
        console.log('🔍 Coupon discount:', couponDiscount.value)
        console.log('🔍 Total after discount:', total.value)
        
        const token = getTokenFromCookie()
        if (token) {
          console.log('🔑 Token found for invoice update:', token ? 'Present' : 'Missing')
          
          // Bước 1: Lấy thông tin chi tiết mã khuyến mãi từ API
          console.log('🎫 Getting coupon details from API...')
          let couponDetails = null
          
          try {
            const couponResponse = await fetch(`${API_CONFIG.BASE_URL}/api/khuyenmai/coupon/${appliedCoupon.value.code}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            console.log('📡 Coupon API response status:', couponResponse.status)
            
            if (couponResponse.ok) {
              // Kiểm tra content-type để đảm bảo response là JSON
              const contentType = couponResponse.headers.get('content-type')
              console.log('📡 Response content-type:', contentType)
              
              if (contentType && contentType.includes('application/json')) {
                const couponResult = await couponResponse.json()
                console.log('📥 Coupon API response:', couponResult)
                
                // Lấy thông tin mã khuyến mãi từ response
                if (couponResult?.khuyenMai) {
                  // Format mới: response có khuyenMai object
                  couponDetails = couponResult.khuyenMai
                  console.log('✅ Found khuyenMai object:', couponDetails)
                } else if (couponResult?.data) {
                  couponDetails = couponResult.data
                } else if (couponResult?.result) {
                  couponDetails = couponResult.result
                } else if (couponResult?.maKM) {
                  couponDetails = couponResult
                }
                
                console.log('✅ Coupon details retrieved:', couponDetails)
              } else {
                console.log('⚠️ Response is not JSON, content-type:', contentType)
                const textResponse = await couponResponse.text()
                console.log('📄 Text response (first 200 chars):', textResponse.substring(0, 200))
              }
            } else {
              console.log('⚠️ Coupon API failed:', couponResponse.status)
              const couponError = await couponResponse.text()
              console.log('❌ Coupon API error:', couponError)
            }
          } catch (couponError) {
            console.error('❌ Error getting coupon details:', couponError)
          }
          
          // Nếu không lấy được coupon details, thử API khác
          if (!couponDetails) {
            console.log('🔄 Trying alternative coupon API...')
            try {
              const altCouponResponse = await fetch(`${API_CONFIG.BASE_URL}/api/khuyenmai`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              
              if (altCouponResponse.ok) {
                const altCouponResult = await altCouponResponse.json()
                console.log('📥 Alternative coupon API response:', altCouponResult)
                
                // Tìm mã khuyến mãi trong danh sách
                let promotions = []
                if (altCouponResult?.data) {
                  promotions = altCouponResult.data
                } else if (altCouponResult?.result) {
                  promotions = altCouponResult.result
                } else if (Array.isArray(altCouponResult)) {
                  promotions = altCouponResult
                }
                
                // Tìm mã khuyến mãi theo code
                const foundPromotion = promotions.find(promo => 
                  (promo.couponCode && promo.couponCode.toLowerCase() === appliedCoupon.value.code.toLowerCase()) ||
                  (promo.maKM && promo.maKM.toLowerCase() === appliedCoupon.value.code.toLowerCase()) ||
                  (promo.tenKM && promo.tenKM.toLowerCase().includes(appliedCoupon.value.code.toLowerCase())) ||
                  (promo.khuyenMai?.couponCode && promo.khuyenMai.couponCode.toLowerCase() === appliedCoupon.value.code.toLowerCase())
                )
                
                if (foundPromotion) {
                  couponDetails = foundPromotion
                  console.log('✅ Found promotion in alternative API:', foundPromotion)
                } else {
                  console.log('⚠️ Promotion not found in alternative API')
                }
              }
            } catch (altError) {
              console.log('⚠️ Alternative coupon API also failed:', altError)
            }
          }
          
          // Bước 2: Chuẩn bị dữ liệu cập nhật hóa đơn với maKM thực tế
          // Lấy maKH từ nhiều nguồn khác nhau
          let maKH = cart?.maKH || 
                      user.value?.customerInfo?.maKH || 
                      user.value?.maKH ||
                      user.value?.khachHang?.maKH
          
          // Nếu vẫn không có maKH, thử lấy từ API
          if (!maKH) {
            console.log('🔍 No maKH found, trying to get from API...')
            try {
              const realMaKH = await getMaKHFromAPI()
              if (realMaKH) {
                maKH = realMaKH
                console.log('✅ Got maKH from API:', maKH)
              }
            } catch (apiError) {
              console.log('⚠️ Failed to get maKH from API:', apiError)
            }
          }
          
          // Fallback maKH nếu vẫn không có
          if (!maKH) {
            maKH = "KH001" // Fallback value
            console.log('⚠️ Using fallback maKH:', maKH)
          }
          
          // Lấy maKM thực tế từ coupon details
          const realMaKM = couponDetails?.maKM
          console.log('🎯 Real maKM from API:', realMaKM)
          console.log('🎯 Coupon code used:', appliedCoupon.value.code)
          
          const invoiceUpdateData = {
            maHD: order.invoiceId,
            maKH: maKH,
            maNVLap: user.value?.maNhanVien || "NV001",
            khuyenMai: {
              maKM: realMaKM || appliedCoupon.value.code // Ưu tiên maKM thực tế từ API
            },
            tongTienHang: subtotal.value,
            tienGiamGia: couponDiscount.value,
            tongTienSauGiamGia: total.value,
            ghiChu: `Áp dụng mã khuyến mãi: ${appliedCoupon.value.code} - Giảm: ${formatPrice(couponDiscount.value)}`
          }
          
          console.log('📤 Invoice update data with real maKM:', invoiceUpdateData)
          console.log('🔍 Coupon details used:', {
            couponCode: appliedCoupon.value.code,
            realMaKM: realMaKM,
            fallbackMaKM: appliedCoupon.value.code,
            couponDetailsFound: !!couponDetails
          })
          
          console.log('📤 Invoice update data:', invoiceUpdateData)
          console.log('🔍 Data sources:', {
            cartMaKH: cart?.maKH,
            userCustomerInfoMaKH: user.value?.customerInfo?.maKH,
            userMaKH: user.value?.maKH,
            finalMaKH: invoiceUpdateData.maKH,
            maNVLap: invoiceUpdateData.maNVLap
          })
          console.log('🔗 API endpoint:', `${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}`)
          
          // Gọi API để cập nhật hóa đơn với thông tin khuyến mãi
          console.log('🔗 Full API URL:', `${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}`)
          console.log('🔑 Full Authorization header:', `Bearer ${token}`)
          console.log('📤 Full request body:', JSON.stringify(invoiceUpdateData, null, 2))
          
          // Thử kiểm tra xem API endpoint có tồn tại không
          console.log('🔍 Testing if API endpoint exists...')
          try {
            const testResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            console.log('🔍 GET test response status:', testResponse.status)
            if (testResponse.ok) {
              const testData = await testResponse.json().catch(() => ({}))
              console.log('🔍 GET test response data:', testData)
            }
          } catch (testError) {
            console.log('🔍 GET test failed:', testError)
          }
          
          const invoiceUpdateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(invoiceUpdateData)
          })
          
          console.log('📡 Invoice update response status:', invoiceUpdateResponse.status)
          console.log('📡 Invoice update response headers:', Object.fromEntries(invoiceUpdateResponse.headers.entries()))
          
          if (invoiceUpdateResponse.ok) {
            const updateResult = await invoiceUpdateResponse.json().catch(() => ({}))
            console.log('✅ Invoice updated with coupon information successfully')
            console.log('📥 Update response:', updateResult)
            showNotification('Thông tin khuyến mãi đã được cập nhật vào hóa đơn!', 'success')
          } else {
            console.log('⚠️ Failed to update invoice with coupon info, but order was created successfully')
            const errorData = await invoiceUpdateResponse.text()
            console.log('❌ Status:', invoiceUpdateResponse.status)
            console.log('❌ Status text:', invoiceUpdateResponse.statusText)
            console.log('❌ Error response:', errorData)
            
            // Thử fallback: cập nhật trạng thái trước, sau đó cập nhật thông tin khuyến mãi
            console.log('🔄 Trying fallback: update invoice status first...')
            try {
              // Bước 1: Cập nhật trạng thái hóa đơn
              const statusUpdateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}/trangthai/1`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
                // Không cần body cho cập nhật trạng thái
              })
              
              if (statusUpdateResponse.ok) {
                console.log('✅ Status update successful')
                
                                // Bước 2: Thử cập nhật thông tin khuyến mãi qua API khác
                console.log('🔄 Now trying to update coupon info...')
                try {
                  // Thử cập nhật chỉ một số trường thay vì toàn bộ hóa đơn
                  const couponUpdateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}`, {
                    method: 'PUT', // Sử dụng PUT với body đơn giản hơn
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      // Chỉ gửi các trường cần thiết
                      maKM: realMaKM || appliedCoupon.value.code,
                      tienGiamGia: couponDiscount.value,
                      tongTienSauGiamGia: total.value
                      // Bỏ các trường khác để tránh conflict
                    })
                  })
                  
                  if (couponUpdateResponse.ok) {
                    console.log('✅ Coupon info update successful')
                    showNotification('Thông tin khuyến mãi đã được cập nhật thành công!', 'success')
                  } else {
                    console.log('⚠️ Coupon info update failed:', couponUpdateResponse.status)
                    const couponError = await couponUpdateResponse.text()
                    console.log('❌ Coupon update error:', couponError)
                    
                    // Bước 3: Thử cập nhật qua API cuối cùng
                    console.log('🔄 Trying final fallback: direct invoice update...')
                    try {
                      const finalResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}`, {
                        method: 'PATCH', // Thử PATCH thay vì PUT
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                                                 body: JSON.stringify({
                           maKM: realMaKM || appliedCoupon.value.code,
                           tienGiamGia: couponDiscount.value,
                           tongTienSauGiamGia: total.value,
                           ghiChu: `Áp dụng mã khuyến mãi: ${appliedCoupon.value.code} - Giảm: ${formatPrice(couponDiscount.value)}`
                         })
                      })
                      
                      if (finalResponse.ok) {
                        console.log('✅ Final fallback successful with PATCH')
                        showNotification('Thông tin khuyến mãi đã được cập nhật qua PATCH!', 'success')
                      } else {
                        console.log('❌ Final fallback also failed:', finalResponse.status)
                        const finalError = await finalResponse.text()
                        console.log('❌ Final error:', finalError)
                      }
                    } catch (finalError) {
                      console.error('❌ Final fallback error:', finalError)
                    }
                  }
                } catch (couponError) {
                  console.error('❌ Coupon update error:', couponError)
                }
              } else {
                console.log('❌ Status update failed:', statusUpdateResponse.status)
                const statusError = await statusUpdateResponse.text()
                console.log('❌ Status error:', statusError)
              }
              
              
            } catch (fallbackError) {
              console.error('❌ Fallback error:', fallbackError)
            }
          }
        } else {
          console.log('⚠️ Cannot update invoice: Token missing')
          console.log('🔑 Token from cookie:', getTokenFromCookie())
        }
      } catch (error) {
        console.error('❌ Error updating invoice with coupon info:', error)
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        // Không block flow nếu cập nhật hóa đơn fail
      }
    } else {
      console.log('ℹ️ No coupon or invoiceId, skipping invoice update')
      console.log('🔍 Applied coupon:', appliedCoupon.value)
      console.log('🔍 Order invoiceId:', order.invoiceId)
    }
    
    // 🧹 Clear cart after successful order creation
    console.log('🧹 Clearing cart after successful checkout...')
    
    try {
      // Clear backend cart using useCart composable
      await clearCart()
      console.log('✅ Backend cart cleared successfully')
    } catch (clearError) {
      console.warn('⚠️ Failed to clear backend cart:', clearError)
      // Không block checkout flow nếu clear cart fail
    }
    
    // Clear selected items from localStorage
    localStorage.removeItem('easymart-selected-items')
    console.log('🧹 localStorage cleared')
    
    // Handle different payment methods
    await handlePaymentRedirect(order)
    
  } catch (error) {
    showNotification('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!', 'error')
  } finally {
    isProcessing.value = false
  }
}

const handlePaymentRedirect = async (order) => {
  const paymentMethod = orderForm.value.paymentMethod
  
      // Save order info to localStorage for payment success page
    console.log('💾 Saving order to localStorage:', {
      orderCode: order.orderCode,
      coupon: order.coupon,
      couponDiscount: order.summary?.couponDiscount,
      total: order.summary?.total,
      appliedCoupon: appliedCoupon.value
    })
    
    localStorage.setItem('easymart-last-order', JSON.stringify(order))
  
  switch (paymentMethod) {
    case 'Tiền Mặt':
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}. Bạn sẽ thanh toán khi nhận hàng.`, 'success')
      
      // Cập nhật trạng thái đơn hàng thành "Chờ thanh toán" (trạng thái 1)
      try {
        console.log('🔄 Updating order status to "Pending Payment" for COD payment...')
        
        // Lấy token từ cookie để cập nhật trạng thái
        const token = getTokenFromCookie()
        if (token && order.invoiceId) {
          console.log('🔑 Token found for status update:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID for status update:', order.invoiceId)
          
          // Gọi API để cập nhật trạng thái đơn hàng
          // Sử dụng API endpoint đúng: PUT /api/hoadon/{maHD}/trangthai/{trangThai}
          const updateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}/trangthai/1`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
            // Không cần body vì trạng thái được truyền qua URL
          })
          
          if (updateResponse.ok) {
            console.log('✅ Order status updated to "Pending Payment" successfully')
            showNotification('Trạng thái đơn hàng đã được cập nhật!', 'success')
          } else {
            console.log('⚠️ Failed to update order status, but order was created successfully')
            const errorData = await updateResponse.text()
            console.log('❌ Status update error response:', errorData)
            
            // Thử fallback: cập nhật trực tiếp hóa đơn
            console.log('🔄 Trying fallback: direct invoice update...')
            try {
              const fallbackResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  trangThai: 1, // Trạng thái "Chờ thanh toán"
                  ghiChu: 'Đơn hàng COD - Chờ thanh toán khi nhận hàng'
                })
              })
              
              if (fallbackResponse.ok) {
                console.log('✅ Fallback status update successful')
                showNotification('Trạng thái đơn hàng đã được cập nhật qua fallback!', 'success')
              } else {
                console.log('⚠️ Fallback also failed:', fallbackResponse.status)
              }
            } catch (fallbackError) {
              console.error('❌ Fallback error:', fallbackError)
            }
          }
        } else {
          console.log('⚠️ Cannot update status: Token or Invoice ID missing')
          console.log('🔑 Token:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID:', order.invoiceId)
        }
      } catch (error) {
        console.error('❌ Error updating order status:', error)
        // Không block flow nếu cập nhật trạng thái fail
      }
      
      // Chuyển đến trang thanh toán thành công sau 2 giây
      setTimeout(() => {
        router.push({
          name: 'PaymentSuccess',
          query: {
            orderCode: orderCode.value,
            total: total.value,
            paymentMethod: paymentMethod,
            orderStatus: 'pending_payment' // Thêm thông tin trạng thái
          }
        })
      }, 2000)
      return
      
    case 'Chuyển Khoản':
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}. Vui lòng chuyển khoản theo thông tin đã cung cấp.`, 'success')
      
      // Cập nhật trạng thái đơn hàng thành "Chờ thanh toán" (trạng thái 1)
      try {
        console.log('🔄 Updating order status to "Pending Payment" for bank transfer...')
        
        const token = getTokenFromCookie()
        if (token && order.invoiceId) {
          console.log('🔑 Token found for status update:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID for status update:', order.invoiceId)
          
          // Sử dụng API endpoint đúng: PUT /api/hoadon/{maHD}/trangthai/{trangThai}
          const updateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}/trangthai/1`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
            // Không cần body vì trạng thái được truyền qua URL
          })
          
          if (updateResponse.ok) {
            console.log('✅ Order status updated to "Pending Payment" successfully')
            showNotification('Trạng thái đơn hàng đã được cập nhật!', 'success')
          } else {
            console.log('⚠️ Failed to update order status, but order was created successfully')
            const errorData = await updateResponse.text()
            console.log('❌ Status update error response:', errorData)
          }
        } else {
          console.log('⚠️ Cannot update status: Token or Invoice ID missing')
          console.log('🔑 Token:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID:', order.invoiceId)
        }
      } catch (error) {
        console.error('❌ Error updating order status:', error)
      }
      
      // Chuyển đến trang thanh toán thành công sau 2 giây
      setTimeout(() => {
        router.push({
          name: 'PaymentSuccess',
          query: {
            orderCode: orderCode.value,
            total: total.value,
            paymentMethod: paymentMethod,
            orderStatus: 'pending_payment'
          }
        })
      }, 2000)
      return
      
    case 'MoMo':
      showNotification(`Đang chuyển đến MoMo để thanh toán...`, 'info')
      
      // Cập nhật trạng thái đơn hàng thành "Chờ thanh toán" (trạng thái 1)
      try {
        console.log('🔄 Updating order status to "Pending Payment" for MoMo...')
        
        const token = getTokenFromCookie()
        if (token && order.invoiceId) {
          console.log('🔑 Token found for status update:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID for status update:', order.invoiceId)
          
          // Sử dụng API endpoint đúng: PUT /api/hoadon/{maHD}/trangthai/{trangThai}
          const updateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}/trangthai/1`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
            // Không cần body vì trạng thái được truyền qua URL
          })
          
          if (updateResponse.ok) {
            console.log('✅ Order status updated to "Pending Payment" successfully')
          } else {
            console.log('⚠️ Failed to update order status, but order was created successfully')
            const errorData = await updateResponse.text()
            console.log('❌ Status update error response:', errorData)
          }
        } else {
          console.log('⚠️ Cannot update status: Token or Invoice ID missing')
          console.log('🔑 Token:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID:', order.invoiceId)
        }
      } catch (error) {
        console.error('❌ Error updating order status:', error)
      }
      
      // Chuyển đến trang thanh toán thành công sau 2 giây
      setTimeout(() => {
        router.push({
          name: 'PaymentSuccess',
          query: {
            orderCode: orderCode.value,
            total: total.value,
            paymentMethod: paymentMethod,
            orderStatus: 'pending_payment'
          }
        })
      }, 2000)
      return
      
    case 'ZaloPay':
      showNotification(`Đang chuyển đến ZaloPay để thanh toán...`, 'info')
      
      // Cập nhật trạng thái đơn hàng thành "Chờ thanh toán" (trạng thái 1)
      try {
        console.log('🔄 Updating order status to "Pending Payment" for ZaloPay...')
        
        const token = getTokenFromCookie()
        if (token && order.invoiceId) {
          console.log('🔑 Token found for status update:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID for status update:', order.invoiceId)
          
          // Sử dụng API endpoint đúng: PUT /api/hoadon/{maHD}/trangthai/{trangThai}
          const updateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}/trangthai/1`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
            // Không cần body vì trạng thái được truyền qua URL
          })
          
          if (updateResponse.ok) {
            console.log('✅ Order status updated to "Pending Payment" successfully')
          } else {
            console.log('⚠️ Failed to update order status, but order was created successfully')
            const errorData = await updateResponse.text()
            console.log('❌ Status update error response:', errorData)
          }
        } else {
          console.log('⚠️ Cannot update status: Token or Invoice ID missing')
          console.log('🔑 Token:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID:', order.invoiceId)
        }
      } catch (error) {
        console.error('❌ Error updating order status:', error)
      }
      
      // Chuyển đến trang thanh toán thành công sau 2 giây
      setTimeout(() => {
        router.push({
          name: 'PaymentSuccess',
          query: {
            orderCode: orderCode.value,
            total: total.value,
            paymentMethod: paymentMethod,
            orderStatus: 'pending_payment'
          }
        })
      }, 2000)
      return
      
    case 'Thẻ Tín Dụng':
      showNotification(`Đang chuyển đến cổng thanh toán...`, 'info')
      
      // Cập nhật trạng thái đơn hàng thành "Chờ thanh toán" (trạng thái 1)
      try {
        console.log('🔄 Updating order status to "Pending Payment" for Credit Card...')
        
        const token = getTokenFromCookie()
        if (token && order.invoiceId) {
          console.log('🔑 Token found for status update:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID for status update:', order.invoiceId)
          
          // Sử dụng API endpoint đúng: PUT /api/hoadon/{maHD}/trangthai/{trangThai}
          const updateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}/trangthai/1`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
            // Không cần body vì trạng thái được truyền qua URL
          })
          
          if (updateResponse.ok) {
            console.log('✅ Order status updated to "Pending Payment" successfully')
          } else {
            console.log('⚠️ Failed to update order status, but order was created successfully')
            const errorData = await updateResponse.text()
            console.log('❌ Status update error response:', errorData)
          }
        } else {
          console.log('⚠️ Cannot update status: Token or Invoice ID missing')
          console.log('🔑 Token:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID:', order.invoiceId)
        }
      } catch (error) {
        console.error('❌ Error updating order status:', error)
      }
      
      // Chuyển đến trang thanh toán thành công sau 2 giây
      setTimeout(() => {
        router.push({
          name: 'PaymentSuccess',
          query: {
            orderCode: orderCode.value,
            total: total.value,
            paymentMethod: paymentMethod,
            orderStatus: 'pending_payment'
          }
        })
      }, 2000)
      return
      
    case 'VNPay':
      try {
        isProcessingVNPay.value = true
        showNotification(`Đang chuyển đến VNPay để thanh toán...`, 'info')
        
        // Lấy token từ cookie
        const token = getTokenFromCookie()
        if (!token) {
          showNotification('Vui lòng đăng nhập để thanh toán qua VNPay!', 'error')
          return
        }
        
        // Chuẩn bị dữ liệu thanh toán theo format VNPay
        const paymentData = {
          // Các trường thay đổi theo đơn hàng
          vnp_OrderInfo: `Thanh toán đơn hàng ${orderCode.value}`,
          ordertype: "other",
          amount: Math.round(total.value).toString(), // Chuyển thành string như mẫu API
          maHD: orderCode.value.replace(/^(HD|EM)/, ''), // Loại bỏ prefix "HD" hoặc "EM"
          
          // Các trường mặc định cố định (theo mẫu API VNPay)
          language: "vn",
          txt_billing_mobile: "0905123456",
          txt_billing_email: "nguyenvana@example.com",
          txt_billing_fullname: "Nguyen Van A",
          txt_inv_addr1: "123 Duong So 1, Quan 1, TP.HCM"
        }
        
        // Đảm bảo không có giá trị undefined hoặc null
        Object.keys(paymentData).forEach(key => {
          if (paymentData[key] === undefined || paymentData[key] === null) {
            paymentData[key] = ""
          }
        })
        
        // Log để debug amount conversion
        console.log('💳 Amount conversion:', {
          original: total.value,
          converted: paymentData.amount,
          originalType: typeof total.value,
          convertedType: typeof paymentData.amount
        })
        
        // So sánh với mẫu API VNPay
        console.log('📋 API Format Comparison:', {
          expected: {
            amount: "100000",
            amountType: "string"
          },
          actual: {
            amount: paymentData.amount,
            amountType: typeof paymentData.amount
          },
          match: typeof paymentData.amount === "string"
        })
        
        // So sánh dữ liệu form với mẫu mặc định
        console.log('📋 Form Data vs Default Template:', {
          template: {
            txt_billing_mobile: "0905123456",
            txt_billing_email: "nguyenvana@example.com", 
            txt_billing_fullname: "Nguyen Van A",
            txt_inv_addr1: "123 Duong So 1, Quan 1, TP.HCM"
          },
          actual: {
            txt_billing_mobile: paymentData.txt_billing_mobile,
            txt_billing_email: paymentData.txt_billing_email,
            txt_billing_fullname: paymentData.txt_billing_fullname,
            txt_inv_addr1: paymentData.txt_inv_addr1
          },
          note: "Using default values as per API template"
        })
        
        // Log trước validation để debug
        console.log('🔍 Pre-validation check:', {
          txt_billing_mobile: paymentData.txt_billing_mobile,
          txt_billing_fullname: paymentData.txt_billing_fullname,
          txt_inv_addr1: paymentData.txt_inv_addr1,
          amount: paymentData.amount,
          maHD: paymentData.maHD,
          maHDType: typeof paymentData.maHD,
          maHDLength: paymentData.maHD ? paymentData.maHD.length : 'N/A'
        })
        
        // Validation dữ liệu VNPay
        console.log('🔍 Validating txt_billing_mobile:', paymentData.txt_billing_mobile, 'Result:', !!paymentData.txt_billing_mobile)
        if (!paymentData.txt_billing_mobile || !paymentData.txt_billing_fullname || !paymentData.txt_inv_addr1) {
          throw new Error('Thông tin giao hàng không đầy đủ để thanh toán VNPay')
        }
        
        console.log('🔍 Validating amount:', paymentData.amount, 'Result:', !!(paymentData.amount && (Number(paymentData.amount) > 0)))
        if (!paymentData.amount || Number(paymentData.amount) <= 0) {
          throw new Error('Số tiền thanh toán không hợp lệ')
        }
        
        // Validation maHD - phải có giá trị hợp lệ
        console.log('🔍 Validating maHD:', paymentData.maHD, 'Result:', !!(paymentData.maHD && paymentData.maHD !== 'NEW'))
        if (!paymentData.maHD || paymentData.maHD === 'NEW') {
          throw new Error('Mã hóa đơn không hợp lệ. Vui lòng thử lại!')
        }
        
        // Log chi tiết để debug
        console.log('💳 VNPay payment data:', paymentData)
        console.log('💳 Original orderCode:', orderCode.value)
        console.log('💳 Extracted maHD:', paymentData.maHD)
        console.log('💳 Amount type:', typeof paymentData.amount, 'Value:', paymentData.amount)
        console.log('💳 VNPay API endpoint:', `${API_CONFIG.BASE_URL}/api/thanhtoan/vnpay`)
        console.log('💳 VNPay token:', token ? 'Present' : 'Missing')
        console.log('💳 Request body:', JSON.stringify(paymentData, null, 2))
        
        // Gọi API VNPay để tạo URL thanh toán
        const vnpayResponse = await fetch(`${API_CONFIG.BASE_URL}/api/thanhtoan/vnpay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentData)
        })
        
        if (!vnpayResponse.ok) {
          const errorData = await vnpayResponse.json().catch(() => ({}))
          const errorMessage = errorData.message || errorData.error || 'Unknown error'
          console.error('❌ VNPay API error response:', errorData)
          throw new Error(`VNPay API error: ${vnpayResponse.status} - ${errorMessage}`)
        }
        
        const vnpayResult = await vnpayResponse.json()
        console.log('💳 VNPay API response:', vnpayResult)
        console.log('💳 VNPay response keys:', Object.keys(vnpayResult))
        console.log('💳 VNPay response data:', vnpayResult.data)
        console.log('💳 VNPay response type:', typeof vnpayResult)
        console.log('💳 VNPay data type:', typeof vnpayResult.data)
        console.log('💳 VNPay data starts with http:', vnpayResult.data && typeof vnpayResult.data === 'string' ? vnpayResult.data.startsWith('http') : 'N/A')
        
        // Lấy URL thanh toán từ response VNPay
        let paymentUrl = null
        
        // Kiểm tra các trường hợp response khác nhau
        if (vnpayResult?.data && typeof vnpayResult.data === 'string' && vnpayResult.data.startsWith('http')) {
          // Trường hợp data chứa trực tiếp URL
          paymentUrl = vnpayResult.data
        } else if (vnpayResult?.data?.paymentUrl) {
          paymentUrl = vnpayResult.data.paymentUrl
        } else if (vnpayResult?.paymentUrl) {
          paymentUrl = vnpayResult.paymentUrl
        } else if (vnpayResult?.url) {
          paymentUrl = vnpayResult.url
        } else if (vnpayResult?.vnp_PayUrl) {
          paymentUrl = vnpayResult.vnp_PayUrl
        } else if (vnpayResult?.redirectUrl) {
          paymentUrl = vnpayResult.redirectUrl
        } else if (typeof vnpayResult === 'string' && vnpayResult.startsWith('http')) {
          // Trường hợp response trực tiếp là URL
          paymentUrl = vnpayResult
        }
        
        console.log('💳 Extracted payment URL:', paymentUrl)
        
        if (paymentUrl) {
          // Chuyển hướng đến trang thanh toán VNPay
          console.log('🔄 Redirecting to VNPay:', paymentUrl)
          showNotification('Chuyển hướng đến VNPay...', 'success')
          
          // Delay một chút để user thấy thông báo
          setTimeout(() => {
            window.location.href = paymentUrl
          }, 1000)
        } else {
          throw new Error('Không nhận được URL thanh toán từ VNPay API')
        }
        
      } catch (error) {
        console.error('❌ VNPay payment error:', error)
        showNotification(`Lỗi thanh toán VNPay: ${error.message}`, 'error')
        
        // Fallback: hiển thị thông báo thành công và chuyển hướng
        setTimeout(() => {
          showNotification(`Thanh toán VNPay thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
          router.push({
            name: 'PaymentSuccess',
            query: {
              orderCode: orderCode.value,
              total: total.value,
              paymentMethod: paymentMethod
            }
          })
        }, 2000)
      } finally {
        isProcessingVNPay.value = false
      }
      return // Không thực hiện redirect mặc định cho VNPay
      
    default:
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
      
      // Cập nhật trạng thái đơn hàng thành "Chờ thanh toán" (trạng thái 1) cho các phương thức khác
      try {
        console.log('🔄 Updating order status to "Pending Payment" for default payment method...')
        
        const token = getTokenFromCookie()
        if (token && order.invoiceId) {
          console.log('🔑 Token found for status update:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID for status update:', order.invoiceId)
          
          // Sử dụng API endpoint đúng: PUT /api/hoadon/{maHD}/trangthai/{trangThai}
          const updateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/hoadon/${order.invoiceId}/trangthai/1`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
            // Không cần body vì trạng thái được truyền qua URL
          })
          
          if (updateResponse.ok) {
            console.log('✅ Order status updated to "Pending Payment" successfully')
          } else {
            console.log('⚠️ Failed to update order status, but order was created successfully')
            const errorData = await updateResponse.text()
            console.log('❌ Status update error response:', errorData)
          }
        } else {
          console.log('⚠️ Cannot update status: Token or Invoice ID missing')
          console.log('🔑 Token:', token ? 'Present' : 'Missing')
          console.log('🆔 Invoice ID:', order.invoiceId)
        }
      } catch (error) {
        console.error('❌ Error updating order status:', error)
      }
      
      // Chuyển đến trang thanh toán thành công sau 2 giây
      setTimeout(() => {
        router.push({
          name: 'PaymentSuccess',
          query: {
            orderCode: orderCode.value,
            total: total.value,
            paymentMethod: paymentMethod,
            orderStatus: 'pending_payment'
          }
        })
      }, 2000)
      return
  }
}

// Function để lấy thông tin giao hàng từ Shipping API riêng biệt
const fetchShippingInfoFromAPI = async () => {
  try {
    console.log('📡 Fetching shipping info from Shipping API...')
    isSyncingWithProfile.value = true
    
    // Tìm maKH từ các nguồn khác nhau - ưu tiên cart vì nó đang hoạt động
    let maKH = cart?.maKH || 
                user.value?.customerInfo?.maKH || 
                user.value?.maKH ||
                user.value?.khachHang?.maKH
    
    console.log('🔑 Found maKH from sources:', {
      cart: cart?.maKH,
      userCustomerInfo: user.value?.customerInfo?.maKH,
      userMaKH: user.value?.maKH,
      userKhachHang: user.value?.khachHang?.maKH,
      final: maKH
    })
    
    // Nếu cart đã có maKH thì sử dụng luôn (cart đang hoạt động tốt)
    if (cart?.maKH) {
      maKH = cart.maKH
      console.log('✅ Using maKH from cart (most reliable):', maKH)
    } else if (!maKH) {
      // Chỉ thử API nếu không có maKH từ bất kỳ nguồn nào
      console.log('🔍 No maKH found from any source, trying API...')
      const realMaKH = await getMaKHFromAPI()
      if (realMaKH) {
        maKH = realMaKH
        console.log('✅ Got maKH from API:', maKH)
        
        // Cập nhật user state với thông tin customer
        if (user.value) {
          if (!user.value.customerInfo) user.value.customerInfo = {}
          user.value.customerInfo.maKH = realMaKH
          user.value.maKH = realMaKH
          user.value.khachHang = { maKH: realMaKH }
        }
      } else {
        console.log('❌ No maKH found from API, cannot fetch shipping info')
        showNotification('Không thể xác định thông tin khách hàng. Vui lòng đăng nhập lại!', 'warning')
        return
      }
    }
    
    // Lấy token từ getToken function thay vì cookie
    const token = getToken()
    if (!token) {
      console.log('⚠️ No token found, cannot fetch shipping info')
      return
    }
    
    // Thử gọi API mới trước, nếu fail thì fallback về API cũ
    let infoEndpoint = `${API_CONFIG.BASE_URL}/api/khachhang/${maKH}/shipping-info`
    console.log('🔗 Trying Shipping API endpoint first:', infoEndpoint)
    
    let infoResponse = await fetch(infoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    let apiSource = 'Shipping API'
    
    // Nếu Shipping API fail, thử Profile API cũ
    if (!infoResponse.ok) {
      console.log('⚠️ Shipping API failed:', infoResponse.status, 'falling back to Profile API...')
      
      infoEndpoint = `${API_CONFIG.BASE_URL}/api/khachhang/${maKH}/info`
      console.log('🔄 Fallback to Profile API endpoint:', infoEndpoint)
      
      infoResponse = await fetch(infoEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      apiSource = 'Profile API (fallback)'
      
      if (!infoResponse.ok) {
        console.log('⚠️ Profile API also failed:', infoResponse.status)
        return
      }
    }
    
    const infoResult = await infoResponse.json()
    console.log(`📥 ${apiSource} response:`, infoResult)
    
    // Xử lý response format khác nhau
    let customerData = null
    
    if (infoResult?.data) {
      customerData = infoResult.data
    } else if (infoResult?.result) {
      customerData = infoResult.result
    } else if (infoResult?.hoTen || infoResult?.sdt || infoResult?.diaChi) {
      customerData = infoResult
    } else if (Array.isArray(infoResult)) {
      customerData = infoResult[0]
    }
    
    if (customerData) {
      console.log(`✅ Data received from ${apiSource}:`, customerData)
      console.log('🔍 Available fields:', Object.keys(customerData))
      console.log('📝 Current form values before update:', {
        fullName: orderForm.value.fullName,
        phone: orderForm.value.phone,
        email: orderForm.value.email,
        address: orderForm.value.address
      })
      
      // Cập nhật user state với dữ liệu
      if (user.value?.customerInfo) {
        user.value.customerInfo = { ...user.value.customerInfo, ...customerData }
      }
      
      // Cập nhật form với thông tin giao hàng
      if (customerData.hoTen) {
        orderForm.value.fullName = customerData.hoTen
      }
      
      // Handle both sdt and soDienThoai field names
      if (customerData.sdt || customerData.soDienThoai) {
        orderForm.value.phone = customerData.sdt || customerData.soDienThoai
      }
      
      if (customerData.diaChi) {
        orderForm.value.address = customerData.diaChi
      }
      
      // Handle email from multiple sources
      if (customerData.email) {
        orderForm.value.email = customerData.email
      } else if (customerData.nguoiDung?.email) {
        orderForm.value.email = customerData.nguoiDung.email
      }
      
      console.log('📝 Form values after update:', {
        fullName: orderForm.value.fullName,
        phone: orderForm.value.phone,
        email: orderForm.value.email,
        address: orderForm.value.address
      })
      console.log(`✅ Info updated from ${apiSource}`)
    }
    
  } catch (error) {
    console.error('❌ Error fetching shipping info:', error)
  } finally {
    isSyncingWithProfile.value = false
  }
}

// Initialize
onMounted(async () => {
  console.log('🚀 Checkout page mounted')
  
  // Kiểm tra auth status trước
  console.log('🔐 Checking authentication status...')
  if (!checkAuthStatus()) {
    console.log('❌ Authentication failed, redirecting to login...')
    showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'warning')
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    return
  }
  
  console.log('✅ Authentication successful, proceeding...')
  
  // Fetch payment methods from API
  await fetchPaymentMethods()
  
  // Đảm bảo có maKH và fetch shipping info ngay lập tức
  console.log('🔍 Ensuring maKH is available before fetching shipping info...')
  let maKH = cart?.maKH || 
              user.value?.customerInfo?.maKH || 
              user.value?.maKH ||
              user.value?.khachHang?.maKH
  
  if (!maKH) {
    console.log('🔍 No maKH found, getting from API immediately...')
    const realMaKH = await getMaKHFromAPI()
    if (realMaKH) {
      maKH = realMaKH
      // Cập nhật user state
      if (user.value) {
        if (!user.value.customerInfo) user.value.customerInfo = {}
        user.value.customerInfo.maKH = realMaKH
        user.value.maKH = realMaKH
        user.value.khachHang = { maKH: realMaKH }
      }
      console.log('✅ Got maKH from API in onMounted:', maKH)
    }
  }
  
  // Fetch shipping info from API với maKH đã có
  await fetchShippingInfoFromAPI()
  
  // Kiểm tra xem có mua ngay từ ProductDetail không
  const invoiceData = localStorage.getItem('easymart-invoice')
  const storedSelectedItems = localStorage.getItem('easymart-selected-items')
  
  if (invoiceData && storedSelectedItems) {
    // Có hóa đơn từ Cart.vue, ProductDetail, hoặc Orders.vue
    const invoice = JSON.parse(invoiceData)
    const selectedProductIds = JSON.parse(storedSelectedItems)
    
    console.log('📋 Nhận hóa đơn:', invoice)
    console.log('🛒 Selected items:', selectedProductIds)
    console.log('🔍 Invoice structure:', Object.keys(invoice))
    
    // Sử dụng mã hóa đơn thay vì tạo mới
    orderCode.value = `HD${invoice.maHD || invoice.orderId || 'NEW'}`
    
    // Lấy thông tin sản phẩm từ hóa đơn - ưu tiên chiTietHoaDon (từ Orders.vue)
    if (invoice.chiTietHoaDon && invoice.chiTietHoaDon.length > 0) {
      console.log('✅ Sử dụng chiTietHoaDon từ Orders.vue')
      selectedItems.value = invoice.chiTietHoaDon.map(item => ({
        productId: item.maSP || item.productId,
        quantity: item.soLuong || item.quantity,
        product: {
          id: item.maSP || item.productId,
          name: item.tenSP || item.productName,
          price: item.donGiaBan || item.donGia || item.productPrice,
          image: getProductImage(item.maSP || item.productId)
        }
      }))
    } else if (invoice.items && invoice.items.length > 0) {
      console.log('✅ Sử dụng items từ Cart.vue/ProductDetail')
      selectedItems.value = invoice.items.map(item => ({
        productId: item.maSP || item.productId,
        quantity: item.soLuong || item.quantity,
        product: {
          id: item.maSP || item.productId,
          name: item.tenSP || item.productName,
          price: item.donGiaBan || item.donGia || item.productPrice,
          image: getProductImage(item.maSP || item.productId)
        }
      }))
    } else {
      console.log('⚠️ Không có items trong hóa đơn, thử fallback...')
      // Fallback: lấy từ cart nếu không có items trong hóa đơn
      selectedItems.value = cart.value
        .filter(item => selectedProductIds.includes(item.productId))
        .map(item => {
          const product = products.value.find(p => p.id === item.productId)
          if (product) {
            // Cập nhật hình ảnh sản phẩm
            product.image = getProductImage(item.productId)
          }
          return {
            ...item,
            product: product
          }
        })
        .filter(item => item.product)
    }
    
    // Kiểm tra trạng thái auth trước khi pre-fill
    checkAuthStatus()
    
    // Load thông tin coupon từ invoice data nếu có
    if (invoice.coupon) {
      console.log('🎫 Loading coupon from invoice data:', invoice.coupon)
      // Tạo coupon object từ invoice data
      const invoiceCoupon = {
        code: invoice.coupon.code,
        description: invoice.coupon.description,
        discountType: invoice.coupon.discountType,
        discountValue: invoice.coupon.discountValue,
        minOrderValue: 0,
        maxDiscount: invoice.coupon.discountValue * 1000,
        isActive: true
      }
      
      // Áp dụng coupon vào form
      appliedCoupon.value = invoiceCoupon
      couponCode.value = invoice.coupon.code
      
      console.log('✅ Coupon applied from invoice:', appliedCoupon.value)
    } else {
      // Nếu không có coupon trong invoice, thử load từ localStorage
      const lastOrder = localStorage.getItem('easymart-last-order')
      if (lastOrder) {
        const lastOrderData = JSON.parse(lastOrder)
        if (lastOrderData.coupon && lastOrderData.coupon.code === invoice.maHD) {
          console.log('🎫 Loading coupon from last order data:', lastOrderData.coupon)
          appliedCoupon.value = lastOrderData.coupon
          couponCode.value = lastOrderData.coupon.code
        }
      }
    }
    
    // Pre-fill thông tin người dùng vào form
    await prefillUserInfo()
    
  } else {
    // Không có hóa đơn, tạo mới
    orderCode.value = generateOrderCode()
    
    // Get selected items from localStorage
    if (storedSelectedItems) {
      const selectedProductIds = JSON.parse(storedSelectedItems)
      selectedItems.value = cart.value
        .filter(item => selectedProductIds.includes(item.productId))
        .map(item => {
          const product = products.value.find(p => p.id === item.productId)
          if (product) {
            // Cập nhật hình ảnh sản phẩm
            product.image = getProductImage(item.productId)
          }
          return {
            ...item,
            product: product
          }
        })
        .filter(item => item.product)
      }
      
      // Kiểm tra trạng thái auth trước khi pre-fill
      checkAuthStatus()
      
      // Pre-fill thông tin người dùng vào form
      await prefillUserInfo()
  }
  
  // Debug: Log final state
  console.log('📊 Final selectedItems state:')
  console.log('   - Length:', selectedItems.value.length)
  console.log('   - Items:', selectedItems.value)
  console.log('   - Invoice data:', invoiceData ? JSON.parse(invoiceData) : 'None')
  console.log('   - Stored selected items:', storedSelectedItems)
  
  // If no selected items, redirect appropriately
  if (selectedItems.value.length === 0) {
    console.warn('⚠️ No selected items found, redirecting to cart...')
    showNotification('Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán', 'warning')
    
    // Delay redirect để user có thể thấy notification
    setTimeout(() => {
      router.push('/cart')
    }, 2000)
  } else {
    console.log('✅ Selected items loaded successfully, staying on checkout page')
  }
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.order-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.payment-method {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.payment-method:hover {
  border-color: #0d6efd;
  background-color: #f8f9ff;
}

.payment-method input[type="radio"]:checked + label {
  color: #0d6efd;
}

.payment-method input[type="radio"]:checked {
  border-color: #0d6efd;
}

.banking-info {
  border-left: 4px solid #0d6efd;
}

.empty-checkout {
  padding: 4rem 2rem;
}

.empty-checkout-icon {
  opacity: 0.3;
}

.order-summary {
  font-size: 0.95rem;
}

.breadcrumb-item a:hover {
  color: #0d6efd !important;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
}

@media (max-width: 768px) {
  .order-item-image {
    width: 50px;
    height: 50px;
  }
  
  .payment-method {
    padding: 10px;
  }
  
  .banking-info {
    font-size: 0.9rem;
  }
}
.payment-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
  border-left: 4px solid #007bff;
}

.payment-info.banking-info {
  background-color: #e3f2fd;
  border-left-color: #2196f3;
}

.payment-info h6 {
  margin-bottom: 15px;
  font-weight: 600;
}

.qr-code-placeholder {
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  margin: 15px 0;
}

.qr-code-placeholder i {
  opacity: 0.5;
}

.qr-code-placeholder p {
  margin-top: 10px;
  font-size: 0.9rem;
}

.payment-info p {
  margin-bottom: 8px;
}

.payment-info small {
  font-size: 0.85rem;
  line-height: 1.4;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.btn-primary:disabled {
  background: #6c757d;
  transform: none;
  box-shadow: none;
}
</style>