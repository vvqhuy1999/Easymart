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
          <li class="breadcrumb-item">
            <router-link to="/cart" class="text-decoration-none">
              <i class="fas fa-shopping-cart"></i> Giỏ hàng
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="fas fa-credit-card"></i> Thanh toán
          </li>
        </ol>
      </nav>

      <h2 class="mb-4">
        <i class="fas fa-credit-card text-primary me-2"></i>
        Thanh toán đơn hàng
      </h2>

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
              <div class="row">
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
                <div class="col-md-6 mb-3">
                  <div class="form-check payment-method">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      id="banking"
                      value="banking"
                      v-model="orderForm.paymentMethod"
                    >
                    <label class="form-check-label w-100" for="banking">
                      <div class="d-flex align-items-center">
                        <i class="fas fa-university text-primary me-3 fs-4"></i>
                        <div>
                          <strong>Chuyển khoản ngân hàng</strong>
                          <div class="text-muted small">Chuyển khoản trước khi giao hàng</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check payment-method">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      id="qr"
                      value="qr"
                      v-model="orderForm.paymentMethod"
                    >
                    <label class="form-check-label w-100" for="qr">
                      <div class="d-flex align-items-center">
                        <i class="fas fa-qrcode text-dark me-3 fs-4"></i>
                        <div>
                          <strong>Quét mã QR</strong>
                          <div class="text-muted small">Quét QR để thanh toán nhanh</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check payment-method">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      id="momo"
                      value="momo"
                      v-model="orderForm.paymentMethod"
                    >
                    <label class="form-check-label w-100" for="momo">
                      <div class="d-flex align-items-center">
                        <i class="fab fa-momo text-danger me-3 fs-4"></i>
                        <div>
                          <strong>Ví MoMo</strong>
                          <div class="text-muted small">Thanh toán qua ví điện tử MoMo</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check payment-method">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      id="vnpay"
                      value="vnpay"
                      v-model="orderForm.paymentMethod"
                    >
                    <label class="form-check-label w-100" for="vnpay">
                      <div class="d-flex align-items-center">
                        <i class="fas fa-credit-card text-info me-3 fs-4"></i>
                        <div>
                          <strong>VNPay</strong>
                          <div class="text-muted small">Thanh toán qua cổng VNPay</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check payment-method">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      id="zalopay"
                      value="zalopay"
                      v-model="orderForm.paymentMethod"
                    >
                    <label class="form-check-label w-100" for="zalopay">
                      <div class="d-flex align-items-center">
                        <i class="fas fa-mobile-alt text-warning me-3 fs-4"></i>
                        <div>
                          <strong>ZaloPay</strong>
                          <div class="text-muted small">Thanh toán qua ví ZaloPay</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Banking Info (show when banking is selected) -->
              <div v-if="orderForm.paymentMethod === 'banking'" class="banking-info mt-3 p-3 bg-light rounded">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-info-circle me-2"></i>
                  Thông tin chuyển khoản
                </h6>
                <div class="row">
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Ngân hàng:</strong> Vietcombank</p>
                    <p class="mb-2"><strong>Số tài khoản:</strong> 1234567890</p>
                    <p class="mb-2"><strong>Chủ tài khoản:</strong> EASYMART COMPANY</p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Nội dung:</strong> THANHTOAN {{ orderCode }}</p>
                    <p class="mb-0 text-danger"><small><strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng nội dung để đơn hàng được xử lý nhanh chóng.</small></p>
                  </div>
                </div>
              </div>

              <!-- QR Code Info -->
              <div v-if="orderForm.paymentMethod === 'qr'" class="payment-info mt-3 p-3 bg-light rounded">
                <h6 class="text-dark mb-3">
                  <i class="fas fa-qrcode me-2"></i>
                  Quét mã QR để thanh toán
                </h6>
                <div class="row align-items-center">
                  <div class="col-md-6 text-center">
                    <div class="qr-code-placeholder">
                      <i class="fas fa-qrcode fa-5x text-muted mb-2"></i>
                      <p class="text-muted">Mã QR sẽ được tạo sau khi đặt hàng</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Số tiền:</strong> {{ formatPrice(total) }}</p>
                    <p class="mb-2"><strong>Mã đơn hàng:</strong> {{ orderCode }}</p>
                    <p class="mb-0 text-info"><small><strong>Hướng dẫn:</strong> Mở app ngân hàng → Quét QR → Xác nhận thanh toán</small></p>
                  </div>
                </div>
              </div>

              <!-- MoMo Info -->
              <div v-if="orderForm.paymentMethod === 'momo'" class="payment-info mt-3 p-3 bg-light rounded">
                <h6 class="text-danger mb-3">
                  <i class="fab fa-momo me-2"></i>
                  Thanh toán qua ví MoMo
                </h6>
                <div class="row">
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Số tiền:</strong> {{ formatPrice(total) }}</p>
                    <p class="mb-2"><strong>Mã đơn hàng:</strong> {{ orderCode }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-0 text-info"><small><strong>Hướng dẫn:</strong> Bạn sẽ được chuyển đến app MoMo để hoàn tất thanh toán sau khi đặt hàng.</small></p>
                  </div>
                </div>
              </div>

              <!-- VNPay Info -->
              <div v-if="orderForm.paymentMethod === 'vnpay'" class="payment-info mt-3 p-3 bg-light rounded">
                <h6 class="text-info mb-3">
                  <i class="fas fa-credit-card me-2"></i>
                  Thanh toán qua VNPay
                </h6>
                <div class="row">
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Số tiền:</strong> {{ formatPrice(total) }}</p>
                    <p class="mb-2"><strong>Mã đơn hàng:</strong> {{ orderCode }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Hỗ trợ:</strong> Thẻ ATM, Internet Banking, Ví điện tử</p>
                    <p class="mb-0 text-info"><small><strong>Hướng dẫn:</strong> Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.</small></p>
                  </div>
                </div>
              </div>

              <!-- ZaloPay Info -->
              <div v-if="orderForm.paymentMethod === 'zalopay'" class="payment-info mt-3 p-3 bg-light rounded">
                <h6 class="text-warning mb-3">
                  <i class="fas fa-mobile-alt me-2"></i>
                  Thanh toán qua ZaloPay
                </h6>
                <div class="row">
                  <div class="col-md-6">
                    <p class="mb-2"><strong>Số tiền:</strong> {{ formatPrice(total) }}</p>
                    <p class="mb-2"><strong>Mã đơn hàng:</strong> {{ orderCode }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-0 text-info"><small><strong>Hướng dẫn:</strong> Bạn sẽ được chuyển đến app ZaloPay để hoàn tất thanh toán sau khi đặt hàng.</small></p>
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
                <div class="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span :class="shippingFee === 0 ? 'text-success' : ''">
                    {{ shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee) }}
                  </span>
                </div>
                <div v-if="shippingFee === 0" class="small text-success mb-2">
                  <i class="fas fa-check-circle me-1"></i>
                  Bạn được miễn phí vận chuyển!
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
                    <div class="d-flex justify-content-between align-items-center p-2 bg-success bg-opacity-10 rounded">
                      <div>
                        <small class="text-success fw-bold">
                          <i class="fas fa-ticket-alt me-1"></i>
                          {{ appliedCoupon.code }}
                        </small>
                        <div class="small text-muted">{{ appliedCoupon.description }}</div>
                      </div>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="removeCoupon"
                        title="Xóa mã khuyến mãi"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Coupon Discount -->
                  <div v-if="couponDiscount > 0" class="d-flex justify-content-between mb-2 text-success">
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
                        class="btn btn-outline-success btn-sm"
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
                
                <router-link to="/cart" class="btn btn-outline-secondary w-100">
                  <i class="fas fa-arrow-left me-2"></i>
                  Quay lại giỏ hàng
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
            <p class="text-muted mb-4">Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán</p>
            <router-link to="/cart" class="btn btn-primary btn-lg">
              <i class="fas fa-arrow-left me-2"></i>
              Quay lại giỏ hàng
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

// Router
const router = useRouter()

// Composables
const { formatPrice, showNotification, products } = useEasyMart()
const { cart, clearCart } = useCart()

// Local state
const isProcessing = ref(false)
const orderCode = ref('')
const errors = ref({})

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
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển',
    discountType: 'shipping',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 30000
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

const shippingFee = computed(() => {
  // If coupon covers shipping, return 0
  if (appliedCoupon.value?.discountType === 'shipping') {
    return 0
  }
  return subtotal.value >= 200000 ? 0 : 30000
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
      discount = shippingFee.value
      break
    default:
      discount = 0
  }
  
  // Apply maximum discount limit
  return Math.min(discount, coupon.maxDiscount)
})

const total = computed(() => {
  return subtotal.value + shippingFee.value - couponDiscount.value
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create order object
    const order = {
      orderCode: orderCode.value,
      customer: { ...orderForm.value },
      items: selectedItems.value,
      summary: {
        subtotal: subtotal.value,
        shippingFee: shippingFee.value,
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
    
    // Save order to localStorage (in real app, send to API)
    const orders = JSON.parse(localStorage.getItem('easymart-orders') || '[]')
    orders.push(order)
    localStorage.setItem('easymart-orders', JSON.stringify(orders))
    
    // Remove ordered items from cart
    selectedItems.value.forEach(item => {
      const cartIndex = cart.value.findIndex(cartItem => cartItem.productId === item.productId)
      if (cartIndex !== -1) {
        cart.value.splice(cartIndex, 1)
      }
    })
    
    // Save cart changes
    localStorage.setItem('easymart-cart', JSON.stringify(cart.value))
    
    // Clear selected items from localStorage
    localStorage.removeItem('easymart-selected-items')
    
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
    case 'cod':
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}. Bạn sẽ thanh toán khi nhận hàng.`, 'success')
      break
      
    case 'banking':
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}. Vui lòng chuyển khoản theo thông tin đã cung cấp.`, 'success')
      break
      
    case 'qr':
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${orderCode.value}. Vui lòng quét mã QR để thanh toán.`, 'success')
      break
      
    case 'momo':
      showNotification(`Đang chuyển đến MoMo để thanh toán...`, 'info')
      setTimeout(() => {
        showNotification(`Thanh toán MoMo thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
      }, 1500)
      break
      
    case 'vnpay':
      showNotification(`Đang chuyển đến VNPay để thanh toán...`, 'info')
      setTimeout(() => {
        showNotification(`Thanh toán VNPay thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
      }, 1500)
      break
      
    case 'zalopay':
      showNotification(`Đang chuyển đến ZaloPay để thanh toán...`, 'info')
      setTimeout(() => {
        showNotification(`Thanh toán ZaloPay thành công! Mã đơn hàng: ${orderCode.value}`, 'success')
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
onMounted(() => {
  // Generate order code
  orderCode.value = generateOrderCode()
  
  // Get selected items from localStorage
  const storedSelectedItems = localStorage.getItem('easymart-selected-items')
  if (storedSelectedItems) {
    const selectedProductIds = JSON.parse(storedSelectedItems)
    selectedItems.value = cart.value
      .filter(item => selectedProductIds.includes(item.productId))
      .map(item => {
        const product = products.value.find(p => p.id === item.productId)
        return {
          ...item,
          product: product
        }
      })
      .filter(item => item.product)
  }
  
  // If no selected items, redirect to cart
  if (selectedItems.value.length === 0) {
    showNotification('Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán', 'warning')
    router.push('/cart')
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