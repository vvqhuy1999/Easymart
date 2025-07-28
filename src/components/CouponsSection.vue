<template>
  <section class="coupons-section">
    <div class="container my-5">
      <!-- Section Header -->
      <div class="section-header text-center mb-5">
        <div class="header-icon">
          <i class="fas fa-gift fs-2"></i>
        </div>
        <h2 class="section-title">Mã Khuyến Mãi</h2>
        <p class="section-subtitle">Tiết kiệm thêm với các mã giảm giá hấp dẫn</p>
      </div>

      <!-- Coupons Grid -->
      <div class="coupons-grid">
        <div 
          v-for="(coupon, index) in coupons" 
          :key="coupon.id"
          class="coupon-wrapper"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div 
            class="coupon-card"
            :class="[
              `coupon-${coupon.type}`,
              { 'coupon-used': coupon.isUsed, 'coupon-expired': coupon.isExpired }
            ]"
            @click="handleCouponClick(coupon)"
          >
            <!-- Coupon Left Side -->
            <div class="coupon-left">
              <div class="coupon-icon">
                <i :class="getCouponIcon(coupon.type)"></i>
              </div>
              <div class="coupon-value">
                <div class="discount-value">{{ coupon.discount }}</div>
                <div class="discount-unit">{{ coupon.unit }}</div>
              </div>
            </div>

            <!-- Coupon Divider -->
            <div class="coupon-divider">
              <div class="divider-line"></div>
              <div class="divider-circles">
                <div class="circle circle-top"></div>
                <div class="circle circle-bottom"></div>
              </div>
            </div>

            <!-- Coupon Right Side -->
            <div class="coupon-right">
              <div class="coupon-info">
                <h6 class="coupon-title">{{ coupon.title }}</h6>
                <p class="coupon-description">{{ coupon.description }}</p>
                
                <div class="coupon-details">
                  <div class="coupon-code">
                    <span class="code-label">Mã:</span>
                    <span class="code-value">{{ coupon.code }}</span>
                  </div>
                  
                  <div class="coupon-expiry">
                    <i class="fas fa-clock text-warning"></i>
                    <span>{{ formatExpiryDate(coupon.expiry) }}</span>
                  </div>
                  
                  <div v-if="coupon.minOrder" class="coupon-condition">
                    <i class="fas fa-shopping-cart text-info"></i>
                    <span>Đơn tối thiểu: {{ formatPrice(coupon.minOrder) }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="coupon-actions">
                <button 
                  class="btn coupon-btn"
                  :class="getCouponButtonClass(coupon)"
                  @click.stop="handleSaveCoupon(coupon)"
                  :disabled="coupon.isUsed || coupon.isExpired"
                >
                  <i :class="getCouponButtonIcon(coupon)" class="me-2"></i>
                  {{ getCouponButtonText(coupon) }}
                </button>
              </div>
            </div>

            <!-- Status Badge -->
            <div v-if="coupon.isUsed || coupon.isExpired" class="coupon-status">
              <span v-if="coupon.isUsed" class="status-badge status-used">
                <i class="fas fa-check-circle"></i>Đã sử dụng
              </span>
              <span v-else-if="coupon.isExpired" class="status-badge status-expired">
                <i class="fas fa-times-circle"></i>Hết hạn
              </span>
            </div>

            <!-- Popular Badge -->
            <div v-if="coupon.isPopular" class="popular-badge">
              <i class="fas fa-fire"></i>
              <span>Hot</span>
            </div>
          </div>
        </div>
      </div>

      <!-- View More Button -->
      <div v-if="showMoreButton" class="text-center mt-5">
        <button 
          class="btn btn-outline-primary btn-lg rounded-pill px-5"
          @click="viewMoreCoupons"
        >
          <i class="fas fa-plus me-2"></i>Xem thêm mã khuyến mãi
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  coupons: {
    type: Array,
    required: true
  },
  showMoreButton: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['save-coupon', 'view-more', 'coupon-click'])

// Reactive data
const copiedCoupons = ref(new Set())

// Methods
const getCouponIcon = (type) => {
  const icons = {
    percentage: 'fas fa-percentage',
    fixed: 'fas fa-tag',
    shipping: 'fas fa-shipping-fast',
    special: 'fas fa-star'
  }
  return icons[type] || 'fas fa-gift'
}

const getCouponButtonClass = (coupon) => {
  if (coupon.isUsed) return 'btn-secondary'
  if (coupon.isExpired) return 'btn-outline-secondary'
  if (copiedCoupons.value.has(coupon.code)) return 'btn-success'
  return 'btn-primary'
}

const getCouponButtonIcon = (coupon) => {
  if (coupon.isUsed) return 'fas fa-check'
  if (coupon.isExpired) return 'fas fa-times'
  if (copiedCoupons.value.has(coupon.code)) return 'fas fa-check'
  return 'fas fa-copy'
}

const getCouponButtonText = (coupon) => {
  if (coupon.isUsed) return 'Đã dùng'
  if (coupon.isExpired) return 'Hết hạn'
  if (copiedCoupons.value.has(coupon.code)) return 'Đã copy'
  return 'Copy mã'
}

const formatExpiryDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Đã hết hạn'
  if (diffDays === 0) return 'Hết hạn hôm nay'
  if (diffDays === 1) return 'Hết hạn ngày mai'
  if (diffDays < 7) return `Còn ${diffDays} ngày`
  
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const handleSaveCoupon = async (coupon) => {
  if (coupon.isUsed || coupon.isExpired) return

  try {
    // Copy to clipboard
    await navigator.clipboard.writeText(coupon.code)
    
    // Mark as copied
    copiedCoupons.value.add(coupon.code)
    
    // Remove copied status after 3 seconds
    setTimeout(() => {
      copiedCoupons.value.delete(coupon.code)
    }, 3000)
    
    emit('save-coupon', coupon.code)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = coupon.code
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    copiedCoupons.value.add(coupon.code)
    setTimeout(() => {
      copiedCoupons.value.delete(coupon.code)
    }, 3000)
    
    emit('save-coupon', coupon.code)
  }
}

const handleCouponClick = (coupon) => {
  emit('coupon-click', coupon)
}

const viewMoreCoupons = () => {
  emit('view-more')
}
</script>

<style scoped>
.coupons-section {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  padding: 2rem 0;
}

/* Section Header */
.section-header {
  margin-bottom: 3rem;
}

.header-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 2rem;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

/* Coupons Grid */
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.coupon-wrapper {
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Coupon Cards */
.coupon-card {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  display: flex;
  min-height: 200px;
}

.coupon-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.coupon-percentage {
  border-color: #667eea;
}

.coupon-fixed {
  border-color: #11998e;
}

.coupon-shipping {
  border-color: #4facfe;
}

.coupon-special {
  border-color: #fa709a;
}

.coupon-used, .coupon-expired {
  opacity: 0.6;
  cursor: not-allowed;
}

.coupon-used:hover, .coupon-expired:hover {
  transform: none;
}

/* Coupon Left Side */
.coupon-left {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.coupon-fixed .coupon-left {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.coupon-shipping .coupon-left {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.coupon-special .coupon-left {
  background: linear-gradient(135deg, #fa709a, #fee140);
}

.coupon-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.coupon-value {
  text-align: center;
}

.discount-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.discount-unit {
  font-size: 0.875rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Coupon Divider */
.coupon-divider {
  position: relative;
  width: 2px;
  background: linear-gradient(to bottom, #e2e8f0, #cbd5e0, #e2e8f0);
}

.divider-circles {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.circle {
  width: 20px;
  height: 20px;
  background: #f8f9fa;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.circle-top {
  top: -40px;
}

.circle-bottom {
  bottom: -40px;
}

/* Coupon Right Side */
.coupon-right {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-info {
  flex: 1;
}

.coupon-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.coupon-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.coupon-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.coupon-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-label {
  color: #6c757d;
  font-weight: 500;
}

.code-value {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-family: monospace;
  border: 1px solid #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.coupon-expiry, .coupon-condition {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

/* Action Button */
.coupon-actions {
  margin-top: auto;
}

.coupon-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
}

.coupon-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.coupon-btn:disabled {
  cursor: not-allowed;
}

.btn-success.coupon-btn {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.btn-success.coupon-btn:hover {
  box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
}

/* Status Badges */
.coupon-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-used {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
}

.status-expired {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.popular-badge {
  position: absolute;
  top: -2px;
  left: -2px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0 0 16px 0;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .coupons-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .coupon-card {
    flex-direction: column;
    min-height: auto;
  }
  
  .coupon-left {
    flex-direction: row;
    min-width: auto;
    padding: 1.5rem;
    justify-content: flex-start;
  }
  
  .coupon-icon {
    margin-bottom: 0;
    margin-right: 1rem;
  }
  
  .coupon-divider {
    height: 2px;
    width: 100%;
  }
  
  .divider-circles {
    top: 50%;
    left: 50%;
  }
  
  .circle-top {
    top: -10px;
    left: -40px;
  }
  
  .circle-bottom {
    bottom: -10px;
    right: -40px;
    left: auto;
  }
  
  .coupon-right {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .coupons-grid {
    grid-template-columns: 1fr;
  }
  
  .coupon-left {
    padding: 1rem;
  }
  
  .coupon-right {
    padding: 1rem;
  }
  
  .discount-value {
    font-size: 2rem;
  }
}
</style>