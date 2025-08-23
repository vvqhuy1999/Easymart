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
          
          <!-- Promotion Stats -->
          <div v-if="!isLoading && !error && promotions.length > 0" class="promo-stats mb-4">
            <div class="row g-3 justify-content-center">
              <div class="col-auto">
                <div class="stat-item">
                  <span class="stat-number">{{ getPromotionStats().total }}</span>
                  <span class="stat-label">Tổng khuyến mãi</span>
                </div>
              </div>
              <div class="col-auto">
                <div class="stat-item">
                  <span class="stat-number">{{ getPromotionStats().active }}</span>
                  <span class="stat-label">Đang diễn ra</span>
                </div>
              </div>
              <div class="col-auto">
                <div class="stat-item">
                  <span class="stat-number">{{ getPromotionStats().percentage }}</span>
                  <span class="stat-label">Giảm %</span>
                </div>
              </div>
              <div class="col-auto">
                <div class="stat-item">
                  <span class="stat-number">{{ getPromotionStats().buyXGetY }}</span>
                  <span class="stat-label">Mua X tặng Y</span>
                </div>
              </div>
            </div>
            
            <!-- Coupon Codes Preview -->
            <div class="coupon-preview mt-4">
              <h6 class="text-white mb-3">
                <i class="fas fa-ticket-alt me-2"></i>
                Mã khuyến mãi có sẵn:
              </h6>
              <div class="d-flex flex-wrap gap-2 justify-content-center">
                <span 
                  v-for="promo in promotions.filter(p => p.couponCode)" 
                  :key="promo.maKM"
                  class="coupon-badge"
                  :title="`${promo.tenChuongTrinh} - ${promo.moTa}`"
                >
                  {{ promo.couponCode }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="promo-badges">
            <span class="badge-flash">⚡ FLASH SALE</span>
            <span class="badge-hot">🔥 HOT DEAL</span>
            <span class="badge-new">✨ MỚI NHẤT</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Coupons Section -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-3 text-white fs-5">Đang tải khuyến mãi...</p>
    </div>
    
    <div v-else-if="error" class="container py-5">
      <div class="alert alert-warning text-center">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h5>Không thể tải khuyến mãi</h5>
        <p class="mb-3">{{ error }}</p>
        <button @click="fetchPromotions" class="btn btn-warning">
          <i class="fas fa-redo me-2"></i>Thử lại
        </button>
      </div>
    </div>
    
    <CouponsSection 
      v-else
      :coupons="coupons"
      :showMoreButton="true"
      @save-coupon="saveCoupon"
      @view-more="loadMoreCoupons"
    />

    <!-- Additional Promotions Info -->
    <section v-if="!isLoading && !error && promotions.length > 0" class="promotion-info py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="info-card card-warning">
              <div class="info-icon">
                <i class="fas fa-clock"></i>
              </div>
              <h5>⏰ Ưu Đãi Có Hạn</h5>
              <p class="text-muted">
                {{ promotions.filter(p => isPromotionActive(p)).length }} khuyến mãi đang diễn ra! 
                Hãy sử dụng ngay trước khi hết hạn.
              </p>
              <div class="card-shine"></div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="info-card card-success">
              <div class="info-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <h5>💰 Giảm Giá Lên Đến {{ getMaxDiscount() }}%</h5>
              <p class="text-muted">
                Tiết kiệm đáng kể với {{ promotions.filter(p => p.loaiKM === 'PhanTram').length }} 
                mã giảm giá theo phần trăm!
              </p>
              <div class="card-shine"></div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="info-card card-info">
              <div class="info-icon">
                <i class="fas fa-gift"></i>
              </div>
              <h5>🎁 Khuyến Mãi Đặc Biệt</h5>
              <p class="text-muted">
                {{ promotions.filter(p => p.loaiKM === 'MuaXTangY').length }} chương trình 
                mua X tặng Y đang chờ bạn!
              </p>
              <div class="card-shine"></div>
            </div>
          </div>
        </div>
        
        <!-- Coupon Details Section -->
        <div class="row mt-5">
          <div class="col-12">
            <div class="coupon-details-section">
              <h3 class="text-center mb-4">
                <i class="fas fa-tags text-primary me-2"></i>
                Chi Tiết Mã Khuyến Mãi
              </h3>
              <div class="row g-4">
                <div 
                  v-for="promo in promotions.filter(p => p.couponCode)" 
                  :key="promo.maKM"
                  class="col-lg-4 col-md-6"
                >
                  <div class="coupon-detail-card">
                    <div class="coupon-header">
                      <div class="coupon-code">{{ promo.couponCode }}</div>
                      <div class="coupon-type">{{ getCouponTypeLabel(promo.loaiKM) }}</div>
                    </div>
                    <div class="coupon-body">
                      <h6 class="coupon-title">{{ promo.tenChuongTrinh }}</h6>
                      <p class="coupon-description">{{ promo.moTa }}</p>
                      <div class="coupon-value">
                        <span v-if="promo.loaiKM === 'PhanTram'">
                          Giảm {{ promo.giaTriKM }}%
                        </span>
                        <span v-else-if="promo.loaiKM === 'Diem'">
                          Tặng {{ promo.giaTriKM }} điểm
                        </span>
                        <span v-else-if="promo.loaiKM === 'MuaXTangY'">
                          Mua X tặng Y
                        </span>
                        <span v-else>
                          Giá trị: {{ promo.giaTriKM }}
                        </span>
                      </div>
                      <div class="coupon-conditions">
                        <small class="text-muted">{{ promo.dieuKienApDung }}</small>
                      </div>
                      <div class="coupon-usage">
                        <div class="progress mb-2" style="height: 8px;">
                          <div 
                            class="progress-bar bg-success" 
                            :style="{ width: `${(promo.daSuDung / promo.soLuongToiDa) * 100}%` }"
                          ></div>
                        </div>
                        <small class="text-muted">
                          Đã sử dụng: {{ promo.daSuDung }}/{{ promo.soLuongToiDa }}
                        </small>
                      </div>
                      <div class="coupon-dates">
                        <small class="text-muted">
                          <i class="fas fa-calendar me-1"></i>
                          {{ formatDate(promo.ngayBatDau) }} - {{ formatDate(promo.ngayKetThuc) }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
 * - Coupons Section với tất cả mã khuyến mãi từ API
 * - Thông tin bổ sung về khuyến mãi
 * - Nút quay lại mua sắm
 */

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// Composables
import { useEasyMart } from '../composables/useEasyMart'

// Components
import CouponsSection from '../components/CouponsSection.vue'

// Router
const router = useRouter()

// Lấy data từ composable
const {
  formatPrice,
  showNotification
} = useEasyMart()

// Local state cho khuyến mãi
const promotions = ref([])
const isLoading = ref(false)
const error = ref('')

// Fetch khuyến mãi từ API
const fetchPromotions = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    console.log('📡 Fetching promotions from API...')
    const response = await fetch('http://localhost:8080/api/khuyenmai')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('📥 Promotions API response:', result)
    
    // Xử lý response format khác nhau
    let promotionsData = []
    
    if (result?.data) {
      promotionsData = result.data
    } else if (result?.result) {
      promotionsData = result.result
    } else if (Array.isArray(result)) {
      promotionsData = result
    } else {
      throw new Error('Unexpected response format')
    }
    
    // Lọc chỉ những khuyến mãi có trạng thái = 1 và không bị xóa
    const activePromotions = promotionsData.filter(promo => 
      promo.trangThai === 1 && !promo.isDeleted
    )
    
    console.log('✅ Active promotions:', activePromotions)
    promotions.value = activePromotions
    
  } catch (error) {
    console.error('❌ Error fetching promotions:', error)
    error.value = 'Không thể tải danh sách khuyến mãi: ' + error.message
    showNotification('Có lỗi xảy ra khi tải khuyến mãi!', 'error')
  } finally {
    isLoading.value = false
  }
}

// Convert API data to coupon format cho CouponsSection
const coupons = computed(() => {
  return promotions.value.map(promo => ({
    id: promo.maKM,
    code: promo.couponCode || promo.maKM, // Sử dụng couponCode nếu có, fallback về maKM
    description: promo.moTa,
    discountType: mapDiscountType(promo.loaiKM),
    discountValue: promo.giaTriKM,
    minOrderValue: 0, // API không có field này, để mặc định
    maxDiscount: promo.giaTriKM * 1000, // Ước tính dựa trên giá trị khuyến mãi
    startDate: new Date(promo.ngayBatDau),
    endDate: new Date(promo.ngayKetThuc),
    isActive: isPromotionActive(promo),
    remainingQuantity: promo.soLuongToiDa - promo.daSuDung,
    totalQuantity: promo.soLuongToiDa,
    usedQuantity: promo.daSuDung,
    conditions: promo.dieuKienApDung,
    programName: promo.tenChuongTrinh
  }))
})

// Map loại khuyến mãi từ API sang format của component
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

// Kiểm tra khuyến mãi có còn hiệu lực không
const isPromotionActive = (promo) => {
  const now = new Date()
  const startDate = new Date(promo.ngayBatDau)
  const endDate = new Date(promo.ngayKetThuc)
  
  return now >= startDate && now <= endDate && 
         promo.trangThai === 1 && 
         !promo.isDeleted &&
         promo.daSuDung < promo.soLuongToiDa
}

// Methods
const loadMoreCoupons = () => {
  // Logic để load thêm mã khuyến mãi (có thể implement sau)
  console.log('Loading more coupons...')
}

const saveCoupon = (coupon) => {
  console.log('Saving coupon:', coupon)
  // Tìm promotion tương ứng để lấy couponCode
  const promotion = promotions.value.find(p => p.maKM === coupon.id)
  const displayCode = promotion?.couponCode || coupon.code
  
  showNotification(`Đã lưu mã khuyến mãi ${displayCode}!`, 'success')
}

// Get max discount value
const getMaxDiscount = () => {
  const percentagePromotions = promotions.value.filter(p => p.loaiKM === 'PhanTram');
  if (percentagePromotions.length === 0) return 0;
  return Math.max(...percentagePromotions.map(p => p.giaTriKM));
}

// Get promotion statistics
const getPromotionStats = () => {
  const total = promotions.value.length;
  const active = promotions.value.filter(p => isPromotionActive(p)).length;
  const percentage = promotions.value.filter(p => p.loaiKM === 'PhanTram').length;
  const buyXGetY = promotions.value.filter(p => p.loaiKM === 'MuaXTangY').length;
  const points = promotions.value.filter(p => p.loaiKM === 'Diem').length;
  
  return { total, active, percentage, buyXGetY, points };
}

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Get coupon type label
const getCouponTypeLabel = (loaiKM) => {
  const typeMap = {
    'PhanTram': 'Giảm giá',
    'TienMat': 'Tiền mặt',
    'Diem': 'Điểm',
    'MuaXTangY': 'Mua X tặng Y',
    'GiamGia': 'Giảm giá'
  }
  return typeMap[loaiKM] || 'Khuyến mãi'
}

// Set page title và fetch data
onMounted(async () => {
  document.title = 'Khuyến mãi Bùng Nổ - EasyMart'
  await fetchPromotions()
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

/* Promotion Stats */
.promo-stats {
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem 2rem;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: #feca57;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Coupon Codes Preview */
.coupon-preview {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.coupon-preview h6 {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.coupon-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
}

.coupon-badge:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

/* Coupon Details Section */
.coupon-details-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.coupon-detail-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.coupon-code {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  background: #feca57;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #feca57;
  box-shadow: 0 2px 8px rgba(254, 202, 87, 0.3);
  white-space: nowrap;
}

.coupon-type {
  font-size: 0.9rem;
  color: #4a5568;
  background: #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coupon-body {
  margin-bottom: 1.5rem;
}

.coupon-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.coupon-description {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.4;
  margin-bottom: 0.8rem;
}

.coupon-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.coupon-conditions {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.8rem;
}

.coupon-usage {
  margin-bottom: 0.8rem;
}

.progress {
  height: 8px;
  border-radius: 4px;
  background-color: #e2e8f0;
  overflow: hidden;
}

.progress-bar {
  border-radius: 4px;
  transition: width 0.6s ease-in-out;
}

.coupon-dates {
  font-size: 0.8rem;
  color: #718096;
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