<template>
  <section class="container my-5">
    <div class="row align-items-center mb-4">
      <div class="col-md-6">
        <h2 class="fs-1 fw-bold text-dark mb-0">
          <i class="fas fa-clock text-danger me-3"></i>Khuyến Mãi Trong Ngày
        </h2>
      </div>
      <div class="col-md-6 text-end">
        <div class="text-center">
          <div class="small text-muted mb-2">Kết thúc sau:</div>
          <div class="d-flex justify-content-center align-items-center gap-2">
            <div class="bg-danger text-white rounded-2 d-flex flex-column align-items-center p-2 shadow-sm" style="min-width: 50px;">
              <span class="fs-5 fw-bold">{{ formatTime(countdown.hours) }}</span>
              <small style="font-size: 0.7rem; opacity: 0.9;">Giờ</small>
            </div>
            <div class="fs-4 fw-bold text-danger">:</div>
            <div class="bg-danger text-white rounded-2 d-flex flex-column align-items-center p-2 shadow-sm" style="min-width: 50px;">
              <span class="fs-5 fw-bold">{{ formatTime(countdown.minutes) }}</span>
              <small style="font-size: 0.7rem; opacity: 0.9;">Phút</small>
            </div>
            <div class="fs-4 fw-bold text-danger">:</div>
            <div class="bg-danger text-white rounded-2 d-flex flex-column align-items-center p-2 shadow-sm" style="min-width: 50px;">
              <span class="fs-5 fw-bold">{{ formatTime(countdown.seconds) }}</span>
              <small style="font-size: 0.7rem; opacity: 0.9;">Giây</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row g-4">
      <div v-for="product in products" :key="product.id" class="col-md-3">
        <div class="card h-100 shadow-sm border-0 position-relative overflow-hidden daily-deal-card">
          <div 
            v-if="product.originalPrice" 
            class="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 rounded-end-2 fw-bold z-2 flash-badge"
            style="font-size: 0.8rem;"
          >
            -{{ getDiscountPercentage(product) }}%
          </div>
          <div class="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 rounded-start-2 fw-bold z-2" style="font-size: 0.7rem;">
            FLASH SALE
          </div>
          <img 
            :src="product.image" 
            class="card-img-top w-100 object-fit-cover" 
            :alt="product.name"
            style="height: 200px;"
          >
          <div class="card-body d-flex flex-column">
            <h6 class="card-title fw-semibold text-dark mb-2 lh-sm" style="height: 2.6rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: 0.9rem;">
              {{ product.name }}
            </h6>
            <div class="mb-3">
              <span v-if="product.originalPrice" class="text-muted text-decoration-line-through me-2" style="font-size: 0.8rem;">
                {{ formatPrice(product.originalPrice) }}
              </span>
              <span class="fw-bold text-danger fs-5">{{ formatPrice(product.price) }}</span>
            </div>
            <div class="mb-3">
              <div class="small text-muted mb-1">Đã bán: {{ getRandomStock() }}/100</div>
              <div class="progress" style="height: 6px;">
                <div 
                  class="progress-bar bg-success" 
                  role="progressbar" 
                  :style="{ width: getRandomStock() + '%' }"
                ></div>
              </div>
            </div>
            <button 
              class="btn btn-danger w-100 fw-semibold py-2 rounded-3 flash-btn mt-auto" 
              @click="$emit('add-to-cart', product.id)"
            >
              <i class="fas fa-bolt me-1"></i> Mua Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Define props
const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  countdown: {
    type: Object,
    required: true
  },
  formatPrice: {
    type: Function,
    required: true
  }
})

// Define emits
const emit = defineEmits(['add-to-cart'])

// Methods converted to functions
const formatTime = (time) => {
  return time.toString().padStart(2, '0')
}

const getDiscountPercentage = (product) => {
  if (!product.originalPrice) return 0
  return Math.round((1 - product.price / product.originalPrice) * 100)
}

const getRandomStock = () => {
  return Math.floor(Math.random() * 60) + 20
}
</script>

<style scoped>
/* Minimal custom CSS - chỉ giữ những gì Bootstrap không thể thay thế */
.daily-deal-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border: 2px solid transparent;
}

.daily-deal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15) !important;
  border-color: #dc3545;
}

.flash-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.8; 
  }
}

.flash-btn {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
  border: none !important;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.flash-btn:hover {
  background: linear-gradient(135deg, #c82333, #bd2130) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.flash-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.flash-btn:hover::before {
  left: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .daily-deal-card {
    margin-bottom: 1rem;
  }
}
</style>