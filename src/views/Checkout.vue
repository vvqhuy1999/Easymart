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
        
        <!-- Debug buttons -->
        <div class="d-flex gap-2">
          <button 
            @click="debugLocalStorageData" 
            class="btn btn-outline-warning btn-sm"
            title="Debug localStorage data"
          >
            <i class="fas fa-bug me-1"></i>Debug Data
          </button>
        </div>
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
                      value="cod"
                      v-model="orderForm.paymentMethod"
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

                  <!-- Available Coupons -->
                  <div v-if="!appliedCoupon && availableCoupons.length > 0" class="available-coupons mt-2">
                    <small class="text-muted d-block mb-2">Mã khuyến mãi có sẵn:</small>
                    <div class="d-flex flex-wrap gap-1">
                      <button 
                        v-for="coupon in availableCoupons" 
                        :key="coupon.code"
                        class="btn btn-sm"
                        style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none;"
                        @click="selectCoupon(coupon.code)"
                        :title="coupon.description"
                      >
                        {{ coupon.code }}
                      </button>
                    </div>
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

// Router
const router = useRouter()

// Composables
const { formatPrice, showNotification, products } = useEasyMart()
const { cart, clearCart } = useCart()
const { user, isLoggedIn } = useAuth()

// Debug function để kiểm tra localStorage data
const debugLocalStorageData = () => {
  console.log('🔍 Debug LocalStorage Data:')
  console.log('   - easymart-invoice:', localStorage.getItem('easymart-invoice'))
  console.log('   - easymart-selected-items:', localStorage.getItem('easymart-selected-items'))
  console.log('   - easymart-cart:', localStorage.getItem('easymart-cart'))
  
  try {
    const invoice = JSON.parse(localStorage.getItem('easymart-invoice') || 'null')
    if (invoice) {
      console.log('   - Invoice parsed:', invoice)
      console.log('   - Invoice keys:', Object.keys(invoice))
      console.log('   - chiTietHoaDon:', invoice.chiTietHoaDon)
      console.log('   - items:', invoice.items)
    }
  } catch (e) {
    console.error('   - Error parsing invoice:', e)
  }
}

// Helper function để lấy hình ảnh sản phẩm
const getProductImage = (productId) => {
  if (!productId) return '/placeholder-image.jpg'
  
  // Sử dụng API hình ảnh sản phẩm với BASE_URL
  const imageUrls = API_ENDPOINTS.IMAGES.PRODUCT_IMAGES(productId)
  
  // Trả về hình ảnh đầu tiên với BASE_URL hoặc placeholder
  return imageUrls[0] ? `${API_CONFIG.BASE_URL}${imageUrls[0]}` : '/placeholder-image.jpg'
}

// Helper function để kiểm tra trạng thái auth
const checkAuthStatus = () => {
  console.log('🔐 Checking auth status...')
  console.log('   - isLoggedIn:', isLoggedIn)
  console.log('   - user:', user)
  console.log('   - orderForm:', orderForm)
  
  if (isLoggedIn && typeof isLoggedIn.value !== 'undefined') {
    console.log('✅ isLoggedIn is properly initialized')
  } else {
    console.log('❌ isLoggedIn is not properly initialized')
  }
  
  if (user && typeof user.value !== 'undefined') {
    console.log('✅ user is properly initialized')
  } else {
    console.log('❌ user is not properly initialized')
  }
}

// Helper function để pre-fill thông tin người dùng
const prefillUserInfo = async () => {
  try {
    // Kiểm tra an toàn các giá trị
    if (!isLoggedIn || !isLoggedIn.value) {
      console.log('⚠️ User chưa đăng nhập hoặc isLoggedIn undefined')
      
      // Fallback: thử lấy thông tin từ localStorage
      tryFallbackUserInfo()
      return
    }
    
    if (!user || !user.value) {
      console.log('⚠️ User object chưa sẵn sàng hoặc user undefined')
      
      // Fallback: thử lấy thông tin từ localStorage
      tryFallbackUserInfo()
      return
    }
    
    console.log('👤 Pre-filling user info:', user.value)
    
    // Lấy thông tin giao hàng từ API Profile
    await fetchShippingInfoFromProfile()
    
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

// Function để lấy thông tin giao hàng từ Profile API
const fetchShippingInfoFromProfile = async () => {
  try {
    console.log('📡 Fetching shipping info from Profile API...')
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
    
    // Gọi API để lấy thông tin profile
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
      console.log('⚠️ Profile API failed:', infoResponse.status)
      return
    }
    
    const infoResult = await infoResponse.json()
    console.log('📥 Profile API response:', infoResult)
    
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
      console.log('✅ Customer data received:', customerData)
      
      // Cập nhật user state với dữ liệu mới
      if (user.value?.customerInfo) {
        user.value.customerInfo = { ...user.value.customerInfo, ...customerData }
      }
      
      // Cập nhật form với thông tin giao hàng
      if (customerData.hoTen) {
        orderForm.value.fullName = customerData.hoTen
      }
      
      if (customerData.sdt) {
        orderForm.value.phone = customerData.sdt
      }
      
      if (customerData.diaChi) {
        orderForm.value.address = customerData.diaChi
      }
      
      if (customerData.nguoiDung?.email) {
        orderForm.value.email = customerData.nguoiDung.email
      }
      
      console.log('✅ Shipping info updated from Profile API')
    }
    
  } catch (error) {
    console.error('❌ Error fetching shipping info:', error)
  } finally {
    isSyncingWithProfile.value = false
  }
}

// Function để cập nhật thông tin giao hàng vào Profile
const updateShippingInfoToProfile = async () => {
  try {
    console.log('📤 Updating shipping info to Profile API...')
    
    // Lấy maKH từ user state
    const maKH = user.value?.customerInfo?.maKH
    if (!maKH) {
      console.log('⚠️ No maKH found, cannot update shipping info')
      return false
    }
    
    // Lấy token từ cookie
    const token = getTokenFromCookie()
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
    
    // Gọi API để cập nhật profile
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
      console.log('⚠️ Update failed:', updateResponse.status, errorData.message)
      return false
    }
    
    const updateResult = await updateResponse.json()
    console.log('📥 Update response:', updateResult)
    
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
      console.log('⚠️ Update response format unexpected:', updateResult)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error updating shipping info:', error)
    return false
  }
}

// Function để lưu thông tin giao hàng vào Profile (gọi từ button)
const saveShippingInfoToProfile = async () => {
  try {
    console.log('💾 Saving shipping info to Profile...')
    
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
    
    // Cập nhật thông tin vào Profile
    const updateSuccess = await updateShippingInfoToProfile()
    
    if (updateSuccess) {
      showNotification('Thông tin giao hàng đã được lưu vào Profile thành công!', 'success')
    } else {
      showNotification('Không thể lưu thông tin giao hàng vào Profile. Vui lòng thử lại!', 'error')
    }
    
  } catch (error) {
    console.error('❌ Error saving shipping info to Profile:', error)
    showNotification('Có lỗi xảy ra khi lưu thông tin giao hàng!', 'error')
  }
}

// Helper function để lấy token từ cookie
const getTokenFromCookie = () => {
  return document.cookie.split('; ').find(row => row.startsWith('easymart-token='))?.split('=')[1]
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
       orderForm.value.paymentMethod = activeMethods[0].tenPTTT
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
const availableCoupons = ref([
  {
    code: 'WELCOME10',
    description: 'Giảm 10% cho đơn hàng đầu tiên',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 100000,
    maxDiscount: 50000
  },

  {
    code: 'SAVE50K',
    description: 'Giảm 50.000đ cho đơn từ 500.000đ',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 500000,
    maxDiscount: 50000
  },
  {
    code: 'VIP20',
    description: 'Giảm 20% cho khách VIP (tối đa 100k)',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 200000,
    maxDiscount: 100000
  }
])

// Order form
const orderForm = ref({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  paymentMethod: 'cod'
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const coupon = availableCoupons.value.find(c => 
      c.code.toLowerCase() === couponCode.value.trim().toLowerCase()
    )
    
    if (!coupon) {
      showNotification('Mã khuyến mãi không hợp lệ!', 'error')
      return
    }
    
    // Check minimum order value
    if (subtotal.value < coupon.minOrderValue) {
      showNotification(
        `Đơn hàng tối thiểu ${formatPrice(coupon.minOrderValue)} để áp dụng mã này!`, 
        'warning'
      )
      return
    }
    
    appliedCoupon.value = coupon
    showNotification(`Áp dụng mã ${coupon.code} thành công!`, 'success')
    
  } catch (error) {
    showNotification('Có lỗi xảy ra khi áp dụng mã khuyến mãi!', 'error')
  } finally {
    isApplyingCoupon.value = false
  }
}

const removeCoupon = () => {
  appliedCoupon.value = null
  couponCode.value = ''
  showNotification('Đã xóa mã khuyến mãi!', 'info')
}

const selectCoupon = (code) => {
  couponCode.value = code
  applyCoupon()
}

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
      const updateSuccess = await updateShippingInfoToProfile()
      
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
        coupon: appliedCoupon.value ? {
          code: appliedCoupon.value.code,
          description: appliedCoupon.value.description,
          discountType: appliedCoupon.value.discountType,
          discountValue: couponDiscount.value
        } : null,
        createdAt: invoice.ngayLap || new Date().toISOString()
      }
    } else {
      // Không có hóa đơn, tạo mới (fallback)
      console.log('⚠️ Không có hóa đơn, tạo đơn hàng mới')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create order object
      order = {
        orderCode: orderCode.value,
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
          discountValue: couponDiscount.value
        } : null,
        createdAt: new Date().toISOString()
      }
    }
    
    // Save order to localStorage (in real app, send to API)
    // const orders = JSON.parse(localStorage.getItem('easymart-orders') || '[]')
    // orders.push(order)
    // localStorage.setItem('easymart-orders', JSON.stringify(orders))
    
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
    handlePaymentRedirect(order)
    
  } catch (error) {
    showNotification('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!', 'error')
  } finally {
    isProcessing.value = false
  }
}

const handlePaymentRedirect = (order) => {
  const paymentMethod = orderForm.value.paymentMethod
  
  // Save order info to localStorage for payment success page
  localStorage.setItem('easymart-last-order', JSON.stringify(order))
  
  switch (paymentMethod) {
    case 'Tiền Mặt':
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}. Bạn sẽ thanh toán khi nhận hàng.`, 'success')
      break
      
    case 'Chuyển Khoản':
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}. Vui lòng chuyển khoản theo thông tin đã cung cấp.`, 'success')
      break
      
    case 'MoMo':
      showNotification(`Đang chuyển đến MoMo để thanh toán...`, 'info')
      setTimeout(() => {
        showNotification(`Thanh toán MoMo thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
      }, 1500)
      break
      
    case 'ZaloPay':
      showNotification(`Đang chuyển đến ZaloPay để thanh toán...`, 'info')
      setTimeout(() => {
        showNotification(`Thanh toán ZaloPay thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
      }, 1500)
      break
      
    case 'Thẻ Tín Dụng':
      showNotification(`Đang chuyển đến cổng thanh toán...`, 'info')
      setTimeout(() => {
        showNotification(`Thanh toán thẻ tín dụng thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
      }, 1500)
      break
      
    case 'VNPay':
      showNotification(`Đang chuyển đến VNPay để thanh toán...`, 'info')
      setTimeout(() => {
        showNotification(`Thanh toán VNPay thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
      }, 1500)
      break
      
    default:
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
  }
  
  // Redirect to payment success page after delay
  setTimeout(() => {
    router.push({
      name: 'PaymentSuccess',
      query: {
        orderCode: orderCode.value,
        total: total.value,
        paymentMethod: paymentMethod
      }
    })
  }, 3000)
}

// Initialize
onMounted(async () => {
  console.log('🚀 Checkout page mounted')
  
  // Fetch payment methods from API
  await fetchPaymentMethods()
  
  // Debug localStorage data
  debugLocalStorageData()
  
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