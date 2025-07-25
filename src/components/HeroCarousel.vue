<template>
  <div class="container mb-4">
    <div id="heroCarousel" class="carousel slide carousel-fade hero-carousel-animated" data-bs-ride="carousel" data-bs-interval="4000">
      <div class="carousel-indicators">
        <button 
          v-for="(slide, index) in slides" 
          :key="index"
          type="button" 
          data-bs-target="#heroCarousel" 
          :data-bs-slide-to="index" 
          :class="{ active: index === 0 }"
        ></button>
      </div>
      
      <div class="carousel-inner rounded-4 overflow-hidden">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          class="carousel-item animated-slide" 
          :class="{ active: index === 0 }"
        >
          <img 
            :src="slide.image" 
            class="d-block w-100 carousel-image" 
            style="height: 400px; object-fit: cover;" 
            :alt="slide.title"
          >
          <div class="carousel-caption animated-caption">
            <div class="bg-dark bg-opacity-50 rounded-3 p-4">
              <h3 class="fw-bold">{{ slide.title }}</h3>
              <p class="mb-0">{{ slide.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <div class="bg-primary rounded-circle p-3">
          <span class="carousel-control-prev-icon"></span>
        </div>
      </button>
      
      <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <div class="bg-primary rounded-circle p-3">
          <span class="carousel-control-next-icon"></span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
/* 
 * HeroCarousel.vue - Banner carousel chính của trang chủ
 * 
 * Component hiển thị carousel banner quảng cáo ở đầu trang chủ
 * Sử dụng Bootstrap Carousel với auto-slide
 * 
 * Tính năng:
 * - Auto-slide với Bootstrap JavaScript
 * - Indicators để jump đến slide cụ thể  
 * - Navigation controls (prev/next)
 * - Responsive design với object-fit cover
 * - Custom styling với rounded corners và overlay
 */

// ==================== STATIC DATA ====================
// Danh sách slides cho hero carousel
// Mỗi slide bao gồm: image (URL), title (tiêu đề), description (mô tả)
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
</script>

<style scoped>
/* ==================== HERO CAROUSEL ANIMATIONS ==================== */

/* Main carousel container animation */
.hero-carousel-animated {
  animation: fadeInUp 0.8s ease-out;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.hero-carousel-animated:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Enhanced carousel fade effect */
.carousel-fade .carousel-item {
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.carousel-fade .carousel-item.active {
  opacity: 1;
}

/* Image animations */
.carousel-image {
  transition: all 0.6s ease;
  transform: scale(1);
}

.carousel-item.active .carousel-image {
  animation: zoomInSlide 4s ease-in-out infinite alternate;
}

.carousel-image:hover {
  transform: scale(1.05);
}

/* Image overlay effect */
.image-container {
  position: relative;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 123, 255, 0.1), rgba(255, 255, 255, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.carousel-item:hover .image-overlay {
  opacity: 1;
}

/* Caption animations */
.animated-caption {
  animation-delay: 0.3s;
}

.carousel-item.active .animated-caption {
  animation: slideInUp 0.8s ease-out;
}

.carousel-caption h3 {
  animation: fadeInLeft 1s ease-out 0.5s both;
  transform: translateX(-30px);
  opacity: 0;
}

.carousel-item.active .carousel-caption h3 {
  animation: fadeInLeft 0.8s ease-out 0.6s both;
}

.carousel-caption p {
  animation: fadeInRight 1s ease-out 0.7s both;
  transform: translateX(30px);
  opacity: 0;
}

.carousel-item.active .carousel-caption p {
  animation: fadeInRight 0.8s ease-out 0.8s both;
}

/* Control button animations */
.carousel-control-prev,
.carousel-control-next {
  transition: all 0.3s ease;
  opacity: 0.7;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  opacity: 1;
  transform: scale(1.1);
}

.carousel-control-prev .bg-primary,
.carousel-control-next .bg-primary {
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
}

.carousel-control-prev:hover .bg-primary,
.carousel-control-next:hover .bg-primary {
  box-shadow: 0 6px 20px rgba(13, 110, 253, 0.5);
  transform: translateY(-2px);
}

/* Indicator animations */
.carousel-indicators [data-bs-target] {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background-color: transparent;
  transition: all 0.3s ease;
}

.carousel-indicators [data-bs-target].active {
  background-color: #fff;
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.carousel-indicators [data-bs-target]:hover {
  background-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

/* ==================== KEYFRAME ANIMATIONS ==================== */

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

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes zoomInSlide {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.03);
  }
}

/* ==================== RESPONSIVE ANIMATIONS ==================== */

@media (max-width: 768px) {
  .hero-carousel-animated:hover {
    transform: none;
  }
  
  .carousel-image:hover {
    transform: scale(1.02);
  }
  
  .carousel-control-prev:hover,
  .carousel-control-next:hover {
    transform: scale(1.05);
  }
}

/* ==================== PERFORMANCE OPTIMIZATIONS ==================== */

.carousel-item,
.carousel-image,
.carousel-caption {
  will-change: transform, opacity;
}

.carousel-item.active .carousel-image {
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>