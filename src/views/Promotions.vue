<template>
  <div class="promotions-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb" class="py-3">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-decoration-none">
                <i class="fas fa-home me-1"></i>Trang chủ
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              <i class="fas fa-gift me-1"></i>Khuyến mãi
            </li>
          </ol>
        </nav>
        
        <div class="header-content text-center py-5">
          <div class="header-icon">
            <i class="fas fa-gift fs-1"></i>
          </div>
          <h1 class="display-4 fw-bold mb-3">🎉 KHUYẾN MÃI BÙ<span class="text-warning">NG NỔ</span> 🎉</h1>
          <p class="lead mb-4">💥 Ưu đãi khủng - Giá sốc - Tiết kiệm tối đa 💥</p>
          <div class="promo-badges">
            <span class="badge-flash">⚡ FLASH SALE</span>
            <span class="badge-hot">🔥 HOT DEAL</span>
            <span class="badge-new">✨ MỚI NHẤT</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Coupons Section -->
    <CouponsSection 
      :coupons="coupons"
      :showMoreButton="true"
      @save-coupon="saveCoupon"
      @view-more="loadMoreCoupons"
    />

    <!-- Additional Promotions Info -->
    <section class="promotion-info py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="info-card card-warning">
              <div class="info-icon">
                <i class="fas fa-clock"></i>
              </div>
              <h5>⏰ Ưu Đãi Có Hạn</h5>
              <p class="text-muted">Các mã khuyến mãi có thời gian sử dụng giới hạn, hãy sử dụng ngay!</p>
              <div class="card-shine"></div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="info-card card-success">
              <div class="info-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <h5>💰 Giảm Giá Lên Đến 70%</h5>
              <p class="text-muted">Tiết kiệm đáng kể với các mã giảm giá có giá trị cực khủng!</p>
              <div class="card-shine"></div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="info-card card-info">
              <div class="info-icon">
                <i class="fas fa-shipping-fast"></i>
              </div>
              <h5>🚚 Miễn Phí Vận Chuyển</h5>
              <p class="text-muted">Nhận ưu đãi miễn phí vận chuyển cho đơn hàng từ 200.000đ.</p>
              <div class="card-shine"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Back to Shopping Button -->
    <div class="text-center py-4">
      <router-link to="/" class="btn btn-explosive btn-lg rounded-pill px-5">
        <i class="fas fa-arrow-left me-2"></i>🛒 Tiếp tục mua sắm ngay!
      </router-link>
    </div>

    <!-- Floating Elements -->
    <div class="floating-elements">
      <div class="float-element float-1">💥</div>
      <div class="float-element float-2">🎁</div>
      <div class="float-element float-3">⭐</div>
      <div class="float-element float-4">🔥</div>
      <div class="float-element float-5">💎</div>
    </div>
  </div>
</template>

<script setup>
/**
 * Promotions.vue - Trang khuyến mãi EasyMart
 * 
 * Hiển thị:
 * - Breadcrumb navigation
 * - Page header với tiêu đề bùng nổ
 * - Coupons Section với tất cả mã khuyến mãi
 * - Thông tin bổ sung về khuyến mãi
 * - Nút quay lại mua sắm
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Composables
import { useEasyMart } from '../composables/useEasyMart'

// Components
import CouponsSection from '../components/CouponsSection.vue'

// Router
const router = useRouter()

// Lấy data từ composable
const {
  coupons,
  saveCoupon
} = useEasyMart()

// Methods
const loadMoreCoupons = () => {
  // Logic để load thêm mã khuyến mãi (có thể implement sau)
  console.log('Loading more coupons...')
}

// Set page title
onMounted(() => {
  document.title = 'Khuyến mãi Bùng Nổ - EasyMart'
})
</script>

<style scoped>
.promotions-page {
  min-height: 100vh;
  background: linear-gradient(45deg, #ff6b6b, #feca57, #ff9ff3, #54a0ff, #5f27cd);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  position: relative;
  overflow-x: hidden;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24, #feca57, #ff9ff3);
  background-size: 400% 400%;
  animation: gradientShift 6s ease infinite;
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  animation: sparkle 4s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.breadcrumb {
  background: none;
  padding: 0;
}

.breadcrumb-item a {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.breadcrumb-item.active {
  color: white;
  font-weight: 600;
}

.header-content {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

.header-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #feca57, #ff6b6b, #ff9ff3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4);
  animation: bounce 2s ease-in-out infinite, glow 3s ease-in-out infinite alternate;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-15px) scale(1.1); }
  60% { transform: translateY(-8px) scale(1.05); }
}

@keyframes glow {
  from { box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4), 0 0 30px rgba(255, 202, 87, 0.6); }
  to { box-shadow: 0 20px 50px rgba(255, 107, 107, 0.6), 0 0 40px rgba(255, 202, 87, 0.8); }
}

.display-4 {
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  animation: textGlow 2s ease-in-out infinite alternate;
}

@keyframes textGlow {
  from { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5); }
  to { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 255, 0.8); }
}

.promo-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.promo-badges [class*="badge-"] {
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: pulse 2s infinite;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.badge-flash {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  color: #2d3748;
}

.badge-hot {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.badge-new {
  background: linear-gradient(135deg, #54a0ff, #5f27cd);
  color: white;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Promotion Info */
.promotion-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.info-card {
  text-align: center;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  position: relative;
  overflow: hidden;
  border: 3px solid transparent;
}

.info-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.card-warning {
  border-color: #feca57;
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.1), rgba(255, 255, 255, 0.95));
}

.card-success {
  border-color: #2ed573;
  background: linear-gradient(135deg, rgba(46, 213, 115, 0.1), rgba(255, 255, 255, 0.95));
}

.card-info {
  border-color: #54a0ff;
  background: linear-gradient(135deg, rgba(84, 160, 255, 0.1), rgba(255, 255, 255, 0.95));
}

.info-icon {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.2rem;
  color: white;
  position: relative;
  z-index: 2;
}

.card-warning .info-icon {
  background: linear-gradient(135deg, #feca57, #ff9f43);
}

.card-success .info-icon {
  background: linear-gradient(135deg, #2ed573, #1dd1a1);
}

.card-info .info-icon {
  background: linear-gradient(135deg, #54a0ff, #2e86de);
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  50% { transform: translateX(0%) translateY(0%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.info-card h5 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.3rem;
}

/* Explosive Button */
.btn-explosive {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24, #feca57);
  background-size: 200% 200%;
  border: none;
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  animation: buttonGlow 2s ease-in-out infinite alternate;
  position: relative;
  overflow: hidden;
}

.btn-explosive:hover {
  background: linear-gradient(135deg, #ee5a24, #ff6b6b, #feca57);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
  color: white;
}

@keyframes buttonGlow {
  from { box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4); }
  to { box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6), 0 0 20px rgba(254, 202, 87, 0.4); }
}

/* Floating Elements */
.floating-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.float-element {
  position: absolute;
  font-size: 2rem;
  animation: float 6s ease-in-out infinite;
  opacity: 0.7;
}

.float-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.float-2 {
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.float-3 {
  top: 30%;
  right: 25%;
  animation-delay: 2s;
}

.float-4 {
  bottom: 30%;
  left: 20%;
  animation-delay: 3s;
}

.float-5 {
  top: 70%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-40px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-20px) rotate(270deg);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 2rem 1rem !important;
  }
  
  .display-4 {
    font-size: 1.8rem;
  }
  
  .info-card {
    padding: 2rem 1.5rem;
  }
  
  .promo-badges {
    gap: 0.5rem;
  }
  
  .promo-badges [class*="badge-"] {
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
  }
  
  .float-element {
    font-size: 1.5rem;
  }
}
</style>