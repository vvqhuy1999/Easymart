<template>
  <div id="productDetail" class="bg-white">

    <!-- Breadcrumb -->
    <div class="container mt-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <a href="#" @click.prevent="$emit('go-home')" class="text-decoration-none">
              <i class="fas fa-home me-1"></i>Trang chủ
            </a>
          </li>
          <li v-if="currentCategory" class="breadcrumb-item">
            <a :href="`#category-${currentCategory.id}`" class="text-decoration-none">
              {{ currentCategory.name }}
            </a>
          </li>
          <li v-if="currentProduct" class="breadcrumb-item active">
            {{ currentProduct.name }}
          </li>
        </ol>
      </nav>
    </div>

    <!-- Product Detail Section -->
    <div class="container my-5">
      <!-- Loading State -->
      <div v-if="!currentProduct && isLoading" class="row">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải sản phẩm...</span>
          </div>
          <p class="text-muted mt-3">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
      
      <!-- Not Found State -->
      <div v-else-if="!currentProduct" class="row">
        <div class="col-12 text-center">
          <h3>Không tìm thấy sản phẩm</h3>
          <p class="text-muted">Sản phẩm bạn tìm kiếm không tồn tại.</p>
          
          <!-- Debug Info (tạm thời) -->
          <div class="debug-info mt-4 p-3 bg-light rounded text-start">
            <h6 class="text-muted">Debug Info:</h6>
            <p><strong>Product ID:</strong> {{ props.productId }}</p>
            <p><strong>Current Product:</strong> {{ currentProduct }}</p>
            <p><strong>Is Loading:</strong> {{ isLoading }}</p>
            <p><strong>Products Count:</strong> {{ products.length }}</p>
            <p><strong>Available Product IDs:</strong> {{ products.map(p => p.id).join(', ') }}</p>
          </div>
          
          <button class="btn btn-primary mt-3" @click="$emit('go-home')">
            <i class="fas fa-home me-2"></i>Về trang chủ
          </button>
        </div>
      </div>

      <div v-else class="row animate-fade-in">
        <!-- Product Images -->
        <div class="col-lg-6">
          <div class="position-relative">
            <img 
              :src="currentImages[selectedImageIndex]?.url || currentProduct.image" 
              class="w-100 product-image-main shadow-product" 
              :alt="currentProduct.name"
            >
            <div class="position-absolute top-0 end-0 m-3 bg-dark bg-opacity-75 text-white p-2 rounded">
              <i class="fas fa-search-plus me-1"></i>Zoom
            </div>
          </div>
          
          <div class="row g-2 mt-3">
            <div 
              v-for="(image, index) in currentImages" 
              :key="index"
              class="col-3"
            >
              <div class="product-thumbnail-container">
                <img 
                  :src="image.url" 
                  class="w-100 product-thumbnail" 
                  :class="{ active: index === selectedImageIndex }"
                  @click="selectedImageIndex = index" 
                  :alt="image.alt"
                >
              </div>
            </div>
          </div>
        </div>
        
        <!-- Product Info -->
        <div class="col-lg-6">
          <div class="ps-lg-4">
            <h1 class="fs-2 fw-bold text-dark mb-3">{{ currentProduct.name }}</h1>
            
            <div class="mb-3">
              <span class="feature-badge">Tươi sống</span>
              <span class="feature-badge">Chất lượng cao</span>
              <span class="feature-badge">An toàn</span>
              <span v-if="currentProduct.originalPrice" class="feature-badge">Giảm giá</span>
            </div>
            
            <div class="d-flex align-items-center mb-3">
              <div class="text-warning me-3">
                <i v-for="n in 5" :key="n" class="fas fa-star"></i>
                <span class="text-dark ms-2 fw-semibold">4.8</span>
              </div>
              <span class="text-muted">|</span>
              <span class="text-muted ms-3">
                <i class="fas fa-shopping-cart me-1"></i>{{ Math.floor(Math.random() * 500) + 100 }} đã bán
              </span>
            </div>
            
            <div class="mb-4">
              <div v-if="discountPercentage > 0" class="discount-badge">
                -{{ discountPercentage }}% GIẢM GIÁ
              </div>
              <div class="d-flex align-items-baseline">
                <span v-if="currentProduct.originalPrice" class="original-price">
                  {{ formatPrice(currentProduct.originalPrice) }}
                </span>
                <span class="detail-price">{{ formatPrice(currentProduct.price) }}</span>
              </div>
              <small v-if="currentProduct.originalPrice" class="text-muted">
                Tiết kiệm: {{ formatPrice(currentProduct.originalPrice - currentProduct.price) }}
              </small>
            </div>
            
            <div class="stock-info mb-4">
              <div class="row">
                <div class="col-6">
                  <div class="text-center">
                    <i class="fas fa-check-circle text-success fs-4"></i>
                    <div class="mt-2">
                      <strong class="text-success">Còn hàng</strong>
                      <div class="small text-muted">Còn {{ Math.floor(Math.random() * 50) + 20 }} sản phẩm</div>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center">
                    <i class="fas fa-shield-alt text-primary fs-4"></i>
                    <div class="mt-2">
                      <strong class="text-primary">Chất lượng</strong>
                      <div class="small text-muted">Đảm bảo tươi ngon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Số lượng:</label>
                <div class="quantity-selector d-flex">
                  <button class="quantity-btn" @click="changeQuantity(-1)">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input 
                    type="number" 
                    class="form-control quantity-input" 
                    v-model="quantity" 
                    min="1" 
                    max="10"
                  >
                  <button class="quantity-btn" @click="changeQuantity(1)">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-8">
                <label class="form-label fw-semibold">Hành động:</label>
                <div class="d-flex gap-2">
                  <button class="btn add-to-cart-btn text-white flex-fill" @click="addToCartWithQuantity">
                    <i class="fas fa-cart-plus me-2"></i>Thêm vào giỏ
                  </button>
                  <button class="btn buy-now-btn text-white flex-fill" @click="buyNow">
                    <i class="fas fa-bolt me-2"></i>Mua ngay
                  </button>
                </div>
              </div>
            </div>
            
            <div class="delivery-info p-3">
              <h6 class="fw-bold text-success mb-3">
                <i class="fas fa-shipping-fast me-2"></i>Thông tin giao hàng
              </h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-clock text-success me-3"></i>
                    <div>
                      <strong>Giao hàng nhanh</strong>
                      <div class="small text-muted">Trong 2 giờ</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-truck text-success me-3"></i>
                    <div>
                      <strong>Miễn phí ship</strong>
                      <div class="small text-muted">Đơn từ 200k</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row g-2 mt-3">
              <div class="col-4">
                <button class="btn btn-outline-primary w-100 rounded-pill" @click="addToWishlist">
                  <i class="fas fa-heart me-1"></i>Yêu thích
                </button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-secondary w-100 rounded-pill" @click="shareProduct">
                  <i class="fas fa-share-alt me-1"></i>Chia sẻ
                </button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-info w-100 rounded-pill" @click="compareProduct">
                  <i class="fas fa-balance-scale me-1"></i>So sánh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Product Info Tabs -->
    <div v-if="currentProduct" class="container my-5">
      <ul class="nav nav-pills product-tabs justify-content-center mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            :class="['nav-link', { active: activeTab === 'description' }]"
            @click="activeTab = 'description'"
          >
            <i class="fas fa-info-circle me-2"></i>Mô tả sản phẩm
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            :class="['nav-link', { active: activeTab === 'reviews' }]"
            @click="activeTab = 'reviews'"
          >
            <i class="fas fa-star me-2"></i>Đánh giá
          </button>
        </li>
      </ul>
      
      <div class="tab-content" style="min-height: 400px; background: white; border-radius: 10px; padding: 20px;">
        <!-- Description Tab -->
        <div v-show="activeTab === 'description'" class="tab-pane" style="display: block;">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-5">
                  <h5 class="text-primary mb-4">
                    <i class="fas fa-info-circle me-2"></i>Về sản phẩm {{ currentProduct.name }}
                  </h5>
                  <p class="lead">{{ productDescription }}</p>
                  
                  <div class="feature-highlight">
                    <h6 class="text-primary mb-2">
                      <i class="fas fa-certificate me-2"></i>Cam kết chất lượng
                    </h6>
                    <p class="mb-0">
                      Chúng tôi cam kết 100% sản phẩm tươi ngon, an toàn. 
                      Nếu không hài lòng, hoàn tiền trong 24h.
                    </p>
                  </div>

                  <!-- Extra Specs -->
                  <div class="mt-4">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-list-ul me-2"></i>Thông số sản phẩm
                    </h6>
                    <ul class="list-unstyled small mb-0">
                      <li v-if="currentProduct.weight">
                        <i class="fas fa-weight-hanging text-muted me-2"></i>
                        Trọng lượng: <strong>{{ currentProduct.weight }}</strong> <span v-if="currentProduct.weightUnit">{{ currentProduct.weightUnit }}</span>
                      </li>
                      <li v-if="currentProduct.weightUnit && !currentProduct.weight">
                        <i class="fas fa-balance-scale text-muted me-2"></i>
                        Đơn vị tính: <strong>{{ currentProduct.weightUnit }}</strong>
                      </li>
                      <li v-if="currentProduct.shelfLifeDays">
                        <i class="fas fa-hourglass-half text-muted me-2"></i>
                        Hạn sử dụng: <strong>{{ currentProduct.shelfLifeDays }} ngày</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reviews Tab -->
        <div v-show="activeTab === 'reviews'" class="tab-pane" style="display: block; width: 100%;">
          <!-- Write Review Component -->
          <WriteReview 
            :product="currentProduct" 
            @review-submitted="handleNewReview"
          />
          
          <!-- Existing Reviews -->
          <ProductReviews :product="currentProduct" :reviews="currentReviews" />
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div v-if="relatedProducts.length > 0" class="container my-5">
      <h3 class="section-title fs-2 fw-bold text-dark mb-4">
        <i class="fas fa-heart text-danger me-3"></i>Sản phẩm liên quan
      </h3>
      <div class="row g-4">
        <div 
          v-for="product in relatedProducts"
          :key="product.id"
          class="col-lg-3 col-md-4 col-sm-6"
        >
          <ProductCard
            :product="product"
            :formatPrice="formatPrice"
            @add-to-cart="addToCart"
            @view-detail="$emit('view-product', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Coupon Button Widget -->
    <CouponButtonWidget 
      :show-on-scroll="true"
      :scroll-threshold="300"
      @coupon-copied="handleCouponCopied"
    />

  </div>
</template>

<script setup>
/* 
 * ProductDetail.vue - Trang chi tiết sản phẩm
 * 
 * Component hiển thị thông tin chi tiết của một sản phẩm cụ thể
 * 
 * Tính năng:
 * - Hiển thị thông tin sản phẩm (hình ảnh, giá, mô tả...)
 * - Gallery hình ảnh với thumbnails
 * - Chọn số lượng và thêm vào giỏ hàng
 * - Tab thông tin (mô tả, đánh giá)
 * - Sản phẩm liên quan
 * - Breadcrumb navigation
 * - Chia sẻ sản phẩm
 */

// ==================== IMPORTS ====================
// Vue Composition API
import { ref, computed, onMounted, watch } from 'vue'

// Composables và Components
import { useEasyMart } from '../composables/useEasyMart'
import { useProductDetail } from '../composables/useProductDetail'
import './ProductCard.vue'
import '../assets/styles.css'

import ProductCard from './ProductCard.vue'
import ProductReviews from './ProductReviews.vue'
import WriteReview from './WriteReview.vue'
import CouponButtonWidget from './CouponButtonWidget.vue'

// ==================== PROPS & EMITS ====================
// Props nhận từ parent component
const props = defineProps({
  productId: {
    type: [Number, String],
    required: true
    // ID của sản phẩm cần hiển thị chi tiết
  }
})

// Events emit về parent component
const emit = defineEmits(['go-home', 'view-product'])

// ==================== COMPOSABLE DATA ====================
// Sử dụng useEasyMart composable để lấy data và methods toàn cục
const {
  products,           // Danh sách tất cả sản phẩm
  categories,         // Danh sách danh mục
  searchQuery,        // Từ khóa tìm kiếm
  searchResults,      // Kết quả tìm kiếm
  cartCount,          // Số lượng items trong giỏ hàng
  addToCart,          // Function thêm vào giỏ hàng
  formatPrice,        // Function format giá tiền
  showNotification    // Function hiển thị thông báo
} = useEasyMart()

// Sử dụng useProductDetail composable để lấy logic chi tiết sản phẩm
const {
  currentProduct,
  quantity,
  selectedImageIndex,
  activeTab,
  currentReviews,
  currentImages,
  averageRating,
  discountPercentage,
  relatedProducts,
  currentCategory,
  isLoading,
  loadProduct,
  changeQuantity,
  addToCartWithQuantity,
  buyNow,
  addToWishlist,
  shareProduct,
  compareProduct,
  setActiveTab
} = useProductDetail(props.productId)

// ==================== COMPUTED PROPERTIES ====================
/**
 * Mô tả sản phẩm (fallback nếu không có)
 */
const productDescription = computed(() => {
  return currentProduct.value?.description || 'Sản phẩm chất lượng cao, được chọn lọc kỹ càng để đảm bảo tươi ngon và an toàn cho sức khỏe. Được nuôi trồng theo quy trình khép kín, đảm bảo vệ sinh an toàn thực phẩm.'
})

// ==================== METHODS ====================
/**
 * Xử lý khi có review mới được submit
 * @param {Object} newReview - Review mới từ WriteReview component
 */
const handleNewReview = (newReview) => {
  console.log('🎉 New review submitted:', newReview)
  
  // Thêm review mới vào đầu danh sách (hiển thị review mới nhất trước)
  if (currentProduct.value && currentProduct.value.reviews) {
    currentProduct.value.reviews.unshift(newReview)
  }
  
  // Show notification
  showNotification('Cảm ơn bạn đã đánh giá sản phẩm!', 'success')
}

// Watch cho props.productId để load sản phẩm mới khi route thay đổi
watch(() => props.productId, async (newId) => {
  console.log('🔄 ProductDetail - ProductId changed to:', newId)
  console.log('🔄 ProductDetail - currentProduct before load:', currentProduct.value)
  if (newId) {
    await loadProduct(newId)
    console.log('🔄 ProductDetail - currentProduct after load:', currentProduct.value)
  }
}, { immediate: true })

// Watch cho currentReviews để kiểm tra khi nào reviews thay đổi
watch(currentReviews, (newReviews) => {
  console.log('🔄 ProductDetail - currentReviews changed:', newReviews)
  console.log('🔄 ProductDetail - currentReviews length:', newReviews?.length || 0)
}, { immediate: true })

// Watch cho activeTab để kiểm tra khi nào tab thay đổi
watch(activeTab, (newTab) => {
  console.log('🔄 ProductDetail - activeTab changed to:', newTab)
}, { immediate: true })

// ==================== LIFECYCLE HOOKS ====================
// Load sản phẩm khi component mount
onMounted(async () => {
  console.log('🚀 ProductDetail - Component mounted with productId:', props.productId)
  console.log('🚀 ProductDetail - currentProduct on mount:', currentProduct.value)
  if (props.productId) {
    await loadProduct(props.productId)
    console.log('🚀 ProductDetail - currentProduct after mount load:', currentProduct.value)
  }
})

// ==================== COUPON METHODS ====================
const handleCouponCopied = (couponCode) => {
  showNotification(`Đã copy mã khuyến mãi: ${couponCode}`, 'success')
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeInUp 0.8s ease-out;
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

</style>