<template>
  <div class="coupon-button-widget">
    <!-- Floating Coupon Button -->
    <div 
      class="floating-coupon-btn"
      :class="{ 'show': showButton }"
      @click="toggleCouponModal"
      title="Xem mã khuyến mãi"
    >
      <div class="coupon-icon">
        <i class="fas fa-ticket-alt"></i>
      </div>
      <div class="coupon-text">
        <div class="coupon-label">Mã giảm giá</div>
        <div class="coupon-count">{{ availableCoupons.length }} mã</div>
      </div>
      <div class="coupon-pulse"></div>
    </div>

    <!-- Coupon Modal -->
    <div 
      v-if="showModal" 
      class="coupon-modal-overlay"
      @click="closeCouponModal"
    >
      <div class="coupon-modal" @click.stop>
        <div class="coupon-modal-header">
          <h5 class="modal-title">
            <i class="fas fa-gift me-2"></i>
            Mã Khuyến Mãi Có Sẵn
          </h5>
          <button 
            type="button" 
            class="btn-close-custom"
            @click="closeCouponModal"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="coupon-modal-body">
          <div class="coupon-list">
            <div 
              v-for="coupon in availableCoupons" 
              :key="coupon.code"
              class="coupon-item"
              :class="`coupon-${coupon.type}`"
            >
              <div class="coupon-item-left">
                <div class="coupon-discount">
                  <span class="discount-value">{{ coupon.discount }}</span>
                  <span class="discount-unit">{{ coupon.unit }}</span>
                </div>
              </div>
              
              <div class="coupon-item-right">
                <div class="coupon-info">
                  <h6 class="coupon-title">{{ coupon.title }}</h6>
                  <p class="coupon-description">{{ coupon.description }}</p>
                  <div class="coupon-details">
                    <div class="coupon-code">
                      <span class="code-label">Mã:</span>
                      <span class="code-value">{{ coupon.code }}</span>
                    </div>
                    <div class="coupon-expiry">
                      <i class="fas fa-clock"></i>
                      <span>{{ formatExpiryDate(coupon.expiry) }}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  class="btn coupon-copy-btn"
                  @click="copyCouponCode(coupon)"
                  :disabled="copiedCoupons.has(coupon.code)"
                >
                  <i :class="copiedCoupons.has(coupon.code) ? 'fas fa-check' : 'fas fa-copy'" class="me-2"></i>
                  {{ copiedCoupons.has(coupon.code) ? 'Đã copy' : 'Copy mã' }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-4">
            <router-link 
              to="/promotions" 
              class="btn btn-outline-primary"
              @click="closeCouponModal"
            >
              <i class="fas fa-plus me-2"></i>
              Xem tất cả mã khuyến mãi
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  showOnScroll: {
    type: Boolean,
    default: true
  },
  scrollThreshold: {
    type: Number,
    default: 300
  }
})

// Emits
const emit = defineEmits(['coupon-copied'])

// Reactive data
const showButton = ref(false)
const showModal = ref(false)
const copiedCoupons = ref(new Set())

// Sample coupons data (in real app, this would come from props or API)
const availableCoupons = ref([
  {
    id: 1,
    code: 'SAVE10',
    title: 'Giảm 10%',
    description: 'Giảm 10% cho đơn hàng từ 200k',
    discount: '10',
    unit: '%',
    type: 'percentage',
    expiry: '2024-12-31',
    minOrderValue: 200000,
    maxDiscount: 50000
  },
  {
    id: 2,
    code: 'FREESHIP',
    title: 'Miễn phí vận chuyển',
    description: 'Miễn phí ship cho đơn từ 150k',
    discount: 'Free',
    unit: 'Ship',
    type: 'shipping',
    expiry: '2024-12-31',
    minOrderValue: 150000,
    maxDiscount: 30000
  },
  {
    id: 3,
    code: 'FRESH50',
    title: 'Giảm 50K',
    description: 'Giảm 50K cho đơn hàng từ 300k',
    discount: '50K',
    unit: '',
    type: 'fixed',
    expiry: '2024-12-31',
    minOrderValue: 300000,
    maxDiscount: 50000
  }
])

// Methods
const toggleCouponModal = () => {
  showModal.value = !showModal.value
}

const closeCouponModal = () => {
  showModal.value = false
}

const handleScroll = () => {
  if (props.showOnScroll) {
    showButton.value = window.scrollY > props.scrollThreshold
  }
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

const copyCouponCode = async (coupon) => {
  try {
    await navigator.clipboard.writeText(coupon.code)
    copiedCoupons.value.add(coupon.code)
    
    // Remove copied status after 3 seconds
    setTimeout(() => {
      copiedCoupons.value.delete(coupon.code)
    }, 3000)
    
    emit('coupon-copied', coupon.code)
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
    
    emit('coupon-copied', coupon.code)
  }
}

// Lifecycle
onMounted(() => {
  if (props.showOnScroll) {
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
  } else {
    showButton.value = true
  }
})

onUnmounted(() => {
  if (props.showOnScroll) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
/* Floating Coupon Button */
.floating-coupon-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1000;
  opacity: 0;
  transform: translateY(100px) scale(0.8);
  pointer-events: none;
  position: relative;
  overflow: hidden;
}

.floating-coupon-btn.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

.floating-coupon-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
}

.coupon-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coupon-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.coupon-label {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1;
}

.coupon-count {
  font-size: 0.75rem;
  opacity: 0.9;
  line-height: 1;
}

.coupon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

/* Modal Styles */
.coupon-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
}

.coupon-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.coupon-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-close-custom:hover {
  background: #f8f9fa;
  color: #495057;
}

.coupon-modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* Coupon Items */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-item {
  display: flex;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.coupon-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
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

.coupon-item-left {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.coupon-fixed .coupon-item-left {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.coupon-shipping .coupon-item-left {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.coupon-discount {
  text-align: center;
}

.discount-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  display: block;
}

.discount-unit {
  font-size: 0.8rem;
  opacity: 0.9;
  text-transform: uppercase;
}

.coupon-item-right {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-info {
  flex: 1;
}

.coupon-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.coupon-description {
  color: #6c757d;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.coupon-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coupon-code, .coupon-expiry {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.code-label {
  color: #6c757d;
  font-weight: 500;
}

.code-value {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #667eea;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-family: monospace;
}

.coupon-expiry {
  color: #6c757d;
}

.coupon-copy-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-left: 16px;
}

.coupon-copy-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.coupon-copy-btn:disabled {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .floating-coupon-btn {
    bottom: 15px;
    right: 15px;
    padding: 10px 16px;
  }
  
  .coupon-text {
    display: none;
  }
  
  .coupon-modal {
    margin: 10px;
    max-height: 90vh;
  }
  
  .coupon-item {
    flex-direction: column;
  }
  
  .coupon-item-left {
    min-width: auto;
    padding: 16px;
  }
  
  .coupon-item-right {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .coupon-copy-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>