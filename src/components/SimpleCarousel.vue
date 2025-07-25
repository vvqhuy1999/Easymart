<template>
  <div class="container my-4">
    <div class="position-relative rounded-4 overflow-hidden" style="height: 400px;">
      <!-- Slides -->
      <div class="position-relative w-100 h-100">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          class="position-absolute top-0 start-0 w-100 h-100 slide" 
          :class="{ active: index === currentSlide }"
          :style="{ transform: `translateX(${(index - currentSlide) * 100}%)` }"
        >
          <img 
            :src="slide.image" 
            class="d-block w-100 h-100" 
            style="object-fit: cover;" 
            :alt="slide.title"
          >
          <div class="position-absolute bottom-0 start-0 end-0 p-4 slide-caption">
            <div class="bg-dark bg-opacity-50 rounded-3 p-4">
              <h3 class="fw-bold text-white mb-2">{{ slide.title }}</h3>
              <p class="mb-0 text-white">{{ slide.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicators -->
      <div class="position-absolute bottom-0 start-50 translate-middle-x p-3 d-flex gap-2">
        <button 
          v-for="(slide, index) in slides" 
          :key="index"
          type="button" 
          class="btn p-0 rounded-circle border-2 border-white indicator"
          :class="{ 'bg-primary border-primary': index === currentSlide }"
          style="width: 12px; height: 12px;"
          @click="goToSlide(index)"
        ></button>
      </div>

      <!-- Controls -->
      <button 
        class="btn position-absolute top-50 start-0 translate-middle-y ms-4" 
        type="button" 
        @click="previousSlide"
      >
        <div class="bg-primary rounded-circle p-3 hover-scale">
          <i class="fas fa-chevron-left text-white"></i>
        </div>
      </button>
      
      <button 
        class="btn position-absolute top-50 end-0 translate-middle-y me-4" 
        type="button" 
        @click="nextSlide"
      >
        <div class="bg-primary rounded-circle p-3 hover-scale">
          <i class="fas fa-chevron-right text-white"></i>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
/* 
 * SimpleCarousel.vue - Component Carousel đơn giản
 * 
 * Component hiển thị carousel với auto-slide và controls thủ công
 * 
 * Tính năng:
 * - Auto-slide mỗi 4 giây
 * - Pause khi hover
 * - Navigation với nút prev/next
 * - Indicators để jump đến slide cụ thể
 * - Smooth transitions với CSS
 * - Responsive design
 */

// ==================== IMPORTS ====================
// Vue Composition API functions
import { ref, onMounted, onUnmounted } from 'vue'

// ==================== REACTIVE DATA ====================
// Index của slide hiện tại (0-based)
const currentSlide = ref(0)

// Reference cho auto-slide interval
const autoSlideInterval = ref(null)

// Trạng thái hover (để pause auto-slide)
const isHovered = ref(false)

// ==================== STATIC DATA ====================
// Danh sách slides với hình ảnh và nội dung
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Sản phẩm tươi ngon mỗi ngày',
    description: 'Chất lượng hàng đầu - Giá cả cạnh tranh'
  },
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Mua sắm tiện lợi',
    description: 'Giao hàng tận nơi - Thanh toán đa dạng'
  },
  {
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Khuyến mãi hấp dẫn',
    description: 'Tiết kiệm lên đến 50% cho các sản phẩm chọn lọc'
  }
]

// ==================== NAVIGATION METHODS ====================
/**
 * Chuyển đến slide tiếp theo (với wrapping)
 */
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

/**
 * Chuyển đến slide trước đó (với wrapping)
 */
const previousSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? slides.length - 1 : currentSlide.value - 1
}

/**
 * Jump đến slide cụ thể theo index
 * @param {number} index - Index của slide cần chuyển đến
 */
const goToSlide = (index) => {
  currentSlide.value = index
}

// ==================== AUTO-SLIDE LOGIC ====================
/**
 * Bắt đầu auto-slide (chỉ khi không hover)
 */
const startAutoSlide = () => {
  if (!isHovered.value) {
    autoSlideInterval.value = setInterval(() => {
      nextSlide()
    }, 4000) // Chuyển slide mỗi 4 giây
  }
}

/**
 * Dừng auto-slide
 */
const stopAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}

// ==================== EVENT HANDLERS ====================
/**
 * Xử lý khi hover vào carousel - pause auto-slide
 */
const handleMouseEnter = () => {
  isHovered.value = true
  stopAutoSlide()
}

/**
 * Xử lý khi rời khỏi carousel - resume auto-slide
 */
const handleMouseLeave = () => {
  isHovered.value = false
  startAutoSlide()
}

// ==================== LIFECYCLE HOOKS ====================
// Bắt đầu auto-slide khi component mount
onMounted(() => {
  startAutoSlide()
})

// Cleanup interval khi component unmount
onUnmounted(() => {
  stopAutoSlide()
})
</script>

<style scoped>
/* Minimal custom CSS - chỉ giữ những gì Bootstrap không thể thay thế */
.slide {
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-caption {
  animation: fadeInUp 0.8s ease-out;
}

.indicator {
  transition: all 0.3s ease;
}

.indicator:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.7) !important;
  transform: scale(1.1);
}

.indicator.bg-primary {
  transform: scale(1.2);
}

.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .slide-caption {
    padding: 1rem !important;
  }
  
  .hover-scale {
    padding: 0.5rem !important;
  }
}
</style>