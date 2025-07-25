<template>
  <div class="payment-success-page">
    <div class="container py-5 mt-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <div class="success-card">
            <!-- Success Icon -->
            <div class="success-icon">
              <div class="checkmark-circle">
                <i class="fas fa-check"></i>
              </div>
            </div>

            <!-- Success Message -->
            <div class="success-content text-center">
              <h1 class="success-title">Thanh toán thành công!</h1>
              <p class="success-subtitle">
                Cảm ơn bạn đã mua hàng tại EasyMart. Đơn hàng của bạn đã được xác nhận.
              </p>

              <!-- Order Info -->
              <div class="order-info">
                <div class="order-code">
                  <span class="label">Mã đơn hàng:</span>
                  <span class="value">{{ orderCode }}</span>
                </div>
                <div class="order-total">
                  <span class="label">Tổng tiền:</span>
                  <span class="value">{{ formatPrice(orderTotal) }}</span>
                </div>
                <div class="payment-method">
                  <span class="label">Phương thức:</span>
                  <span class="value">{{ getPaymentMethodName(paymentMethod) }}</span>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="next-steps">
                <h5>Bước tiếp theo:</h5>
                <div class="steps-list">
                  <div v-if="paymentMethod === 'cod'" class="step">
                    <i class="fas fa-truck text-primary"></i>
                    <span>Chúng tôi sẽ giao hàng và bạn thanh toán khi nhận hàng</span>
                  </div>
                  <div v-else-if="paymentMethod === 'banking'" class="step">
                    <i class="fas fa-university text-primary"></i>
                    <span>Vui lòng chuyển khoản theo thông tin đã cung cấp</span>
                  </div>
                  <div v-else class="step">
                    <i class="fas fa-credit-card text-primary"></i>
                    <span>Thanh toán đã được xử lý thành công</span>
                  </div>
                  
                  <div class="step">
                    <i class="fas fa-box text-success"></i>
                    <span>Đơn hàng sẽ được chuẩn bị và đóng gói</span>
                  </div>
                  
                  <div class="step">
                    <i class="fas fa-shipping-fast text-warning"></i>
                    <span>Giao hàng trong vòng 2-24 giờ</span>
                  </div>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="contact-info">
                <p class="mb-2">
                  <i class="fas fa-phone text-primary me-2"></i>
                  Hotline hỗ trợ: <strong>1900 1234</strong>
                </p>
                <p class="mb-0">
                  <i class="fas fa-envelope text-primary me-2"></i>
                  Email: <strong>support@easymart.vn</strong>
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <router-link to="/" class="btn btn-primary btn-lg me-3">
                  <i class="fas fa-home me-2"></i>
                  Về trang chủ
                </router-link>
                <button class="btn btn-outline-primary btn-lg" @click="viewOrderHistory">
                  <i class="fas fa-history me-2"></i>
                  Xem đơn hàng
                </button>
              </div>

              <!-- Social Share -->
              <div class="social-share">
                <p class="mb-3">Chia sẻ niềm vui mua sắm:</p>
                <div class="social-buttons">
                  <button class="btn btn-facebook" @click="shareToFacebook">
                    <i class="fab fa-facebook-f"></i>
                  </button>
                  <button class="btn btn-twitter" @click="shareToTwitter">
                    <i class="fab fa-twitter"></i>
                  </button>
                  <button class="btn btn-zalo" @click="shareToZalo">
                    <i class="fas fa-comment"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Details -->
      <div class="row justify-content-center mt-5" v-if="orderDetails">
        <div class="col-lg-8">
          <div class="order-details-card">
            <h5 class="card-title">
              <i class="fas fa-receipt me-2"></i>
              Chi tiết đơn hàng
            </h5>
            
            <div class="order-items">
              <div 
                v-for="item in orderDetails.items" 
                :key="item.productId"
                class="order-item"
              >
                <img 
                  :src="item.product?.image" 
                  :alt="item.product?.name"
                  class="item-image"
                >
                <div class="item-info">
                  <h6>{{ item.product?.name }}</h6>
                  <div class="item-details">
                    <span>{{ formatPrice(item.product?.price || 0) }} x {{ item.quantity }}</span>
                    <span class="item-total">{{ formatPrice((item.product?.price || 0) * item.quantity) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-summary">
              <div class="summary-row">
                <span>Tạm tính:</span>
                <span>{{ formatPrice(orderDetails.summary?.subtotal || 0) }}</span>
              </div>
              <div class="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{{ orderDetails.summary?.shippingFee === 0 ? 'Miễn phí' : formatPrice(orderDetails.summary?.shippingFee || 0) }}</span>
              </div>
              <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span>{{ formatPrice(orderDetails.summary?.total || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'

// Router
const router = useRouter()
const route = useRoute()

// Composables
const { formatPrice, showNotification } = useEasyMart()

// State
const orderCode = ref('')
const orderTotal = ref(0)
const paymentMethod = ref('')
const orderDetails = ref(null)

// Get order info from route query or localStorage
onMounted(() => {
  // Try to get from route query first
  if (route.query.orderCode) {
    orderCode.value = route.query.orderCode
    orderTotal.value = parseInt(route.query.total) || 0
    paymentMethod.value = route.query.paymentMethod || 'cod'
  } else {
    // Try to get from localStorage
    const lastOrder = localStorage.getItem('easymart-last-order')
    if (lastOrder) {
      const order = JSON.parse(lastOrder)
      orderCode.value = order.orderCode
      orderTotal.value = order.summary?.total || 0
      paymentMethod.value = order.customer?.paymentMethod || 'cod'
      orderDetails.value = order
    } else {
      // No order found, redirect to home
      showNotification('Không tìm thấy thông tin đơn hàng', 'warning')
      router.push('/')
    }
  }
})

// Methods
const getPaymentMethodName = (method) => {
  const methods = {
    'cod': 'Thanh toán khi nhận hàng (COD)',
    'banking': 'Chuyển khoản ngân hàng',
    'qr': 'Quét mã QR',
    'momo': 'Ví MoMo',
    'vnpay': 'VNPay',
    'zalopay': 'ZaloPay'
  }
  return methods[method] || 'Khác'
}

const viewOrderHistory = () => {
  // In real app, navigate to order history page
  showNotification('Tính năng xem lịch sử đơn hàng đang được phát triển', 'info')
}

const shareToFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`
  window.open(url, '_blank', 'width=600,height=400')
}

const shareToTwitter = () => {
  const text = `Tôi vừa mua sắm thành công tại EasyMart! Mã đơn hàng: ${orderCode.value}`
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`
  window.open(url, '_blank', 'width=600,height=400')
}

const shareToZalo = () => {
  showNotification('Tính năng chia sẻ Zalo đang được phát triển', 'info')
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.success-card {
  background: white;
  border-radius: 20px;
  padding: 50px 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  text-align: center;
}

.success-icon {
  margin-bottom: 30px;
}

.checkmark-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #28a745, #20c997);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: successPulse 1.5s ease-in-out;
}

.checkmark-circle i {
  font-size: 40px;
  color: white;
  animation: checkmarkAppear 0.8s ease-in-out 0.5s both;
}

@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes checkmarkAppear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.success-title {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.success-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.order-info {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin: 30px 0;
}

.order-info > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-info > div:last-child {
  margin-bottom: 0;
}

.order-info .label {
  font-weight: 500;
  color: #6c757d;
}

.order-info .value {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
}

.next-steps {
  margin: 30px 0;
  text-align: left;
}

.next-steps h5 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.step {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.step i {
  font-size: 1.2rem;
  margin-right: 15px;
  width: 20px;
}

.contact-info {
  background: #e3f2fd;
  border-radius: 15px;
  padding: 20px;
  margin: 30px 0;
}

.action-buttons {
  margin: 30px 0;
}

.btn-lg {
  padding: 12px 30px;
  font-weight: 600;
  border-radius: 50px;
}

.social-share {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #dee2e6;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-buttons .btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.btn-facebook {
  background: #1877f2;
  border-color: #1877f2;
  color: white;
}

.btn-twitter {
  background: #1da1f2;
  border-color: #1da1f2;
  color: white;
}

.btn-zalo {
  background: #0068ff;
  border-color: #0068ff;
  color: white;
}

.order-details-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.order-details-card .card-title {
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f8f9fa;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}

.item-info {
  flex: 1;
}

.item-info h6 {
  margin-bottom: 5px;
  color: #2c3e50;
}

.item-details {
  display: flex;
  justify-content: space-between;
  color: #6c757d;
}

.item-total {
  font-weight: 600;
  color: #2c3e50;
}

.order-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f8f9fa;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  padding-top: 10px;
  border-top: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .success-card {
    padding: 30px 20px;
  }
  
  .success-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons .btn {
    margin: 0 !important;
  }
}
</style>