<template>
  <div class="category-page">
    <!-- Header -->
    <!-- Đã xóa Header -->

    <!-- Page Content -->
    <div class="container py-5 mt-5">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="fas fa-home"></i> Trang chủ
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i :class="currentCategory?.icon"></i> {{ currentCategory?.name || 'Danh mục' }}
          </li>
        </ol>
      </nav>

      <!-- Category Header -->
      <div v-if="currentCategory" class="category-header mb-5 text-center">
        <div class="category-icon mb-3">
          <i :class="`${currentCategory.icon} fa-4x text-primary`"></i>
        </div>
        <h1 class="category-title">{{ currentCategory.name }}</h1>
        <p class="text-muted">Khám phá {{ categoryProducts.length }} sản phẩm chất lượng</p>
      </div>



      <!-- Loading State -->
      <div v-if="isLoadingProducts" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải sản phẩm...</span>
        </div>
        <p class="text-muted mt-3">Đang tải sản phẩm trong danh mục...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="text-center py-5">
        <div class="error-state">
          <i class="fas fa-exclamation-triangle fa-4x text-danger mb-4"></i>
          <h3 class="text-danger mb-3">Không thể tải sản phẩm</h3>
          <p class="text-muted mb-4">Đã xảy ra lỗi khi tải sản phẩm từ API</p>
          <button @click="loadCategoryProducts" class="btn btn-primary me-2">
            <i class="fas fa-refresh me-2"></i>Thử lại
          </button>
          <router-link to="/" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i>Về trang chủ
          </router-link>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="categoryProducts.length > 0" class="row g-4">
        <div 
          v-for="product in categoryProducts" 
          :key="product.id" 
          class="col-6 col-md-4 col-lg-3"
        >
          <ProductCard
            :product="product"
            :formatPrice="formatPrice"
            @add-to-cart="addToCart"
            @view-detail="viewProduct"
            @add-to-wishlist="handleAddToWishlist"
          />
        </div>
      </div>

      <!-- No Products -->
      <div v-else class="text-center py-5">
        <div class="no-products">
          <i class="fas fa-box-open fa-4x text-muted mb-4"></i>
          <h3 class="text-muted mb-3">Chưa có sản phẩm</h3>
          <p class="text-muted mb-4">Danh mục này hiện chưa có sản phẩm nào</p>
          <router-link to="/" class="btn btn-primary">
            <i class="fas fa-arrow-left me-2"></i>
            Về trang chủ
          </router-link>
        </div>
      </div>
    </div>

    <!-- Coupon Button Widget -->
    <CouponButtonWidget 
      :show-on-scroll="true"
      :scroll-threshold="200"
      @coupon-copied="handleCouponCopied"
    />

    <!-- Footer -->
    <!-- Đã xóa Footer -->
  </div>
</template>

<script setup>
/**
 * Category.vue - Trang danh mục sản phẩm
 * 
 * Hiển thị tất cả sản phẩm thuộc một danh mục cụ thể
 */

import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

// Components
// Đã xóa import Header và Footer
import ProductCard from '../components/ProductCard.vue'
import CouponButtonWidget from '../components/CouponButtonWidget.vue'

// Router
const router = useRouter()
const route = useRoute()

// Composable
const {
  categories,
  products,
  searchQuery,
  searchResults,
  cartCount,
  formatPrice,
  addToCart,
  getCategoryById,
  showNotification
} = useEasyMart()

// Reactive data
const categoryProducts = ref([])
const isLoadingProducts = ref(false)
const hasError = ref(false)

// Computed properties
const categoryId = computed(() => route.params.id)

const currentCategory = computed(() => {
  return getCategoryById(categoryId.value)
})

// Methods
const loadCategoryProducts = async () => {
  if (!categoryId.value) return
  
  try {
    isLoadingProducts.value = true
    hasError.value = false
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_CATEGORY_ACTIVE(categoryId.value)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const apiProducts = await response.json()
    
    // Debug: Log mapped prices
    console.log('[Category] API raw length:', Array.isArray(apiProducts) ? apiProducts.length : -1)
    
    // Map API products to frontend format
    categoryProducts.value = apiProducts.map(product => {
      const mappedProduct = {
        id: product.maSP || product.id,
        name: product.tenSP || product.name,
        price: product.giaHienTai || product.giaBan || product.price,
        originalPrice: product.giaGoc || product.originalPrice,
        categoryId: product.loaiSanPham?.maLoaiSP || product.categoryId,
        categoryName: product.loaiSanPham?.tenLoai || product.categoryName,
        image: `${API_BASE_URL}${API_ENDPOINTS.IMAGES.SERVE_IMAGE(product.maSP + '_main.jfif')}`,
        images: API_ENDPOINTS.IMAGES.PRODUCT_IMAGES(product.maSP).map(img => `${API_BASE_URL}${img}`),
        description: product.moTa || product.description,
        isFlashSale: product.isFlashSale || false,
        isActive: product.isActive !== false,
        stock: product.trongLuong || product.stock || 0,
        unit: product.donViTinh || product.unit || 'cái',
        rating: product.danhGia || product.rating || 4.5,
        reviews: product.danhGia || product.reviews || []
      }
      
      return mappedProduct
    })
    console.log('[Category] Mapped products:', categoryProducts.value.map(p => ({ id: p.id, price: p.price, giaHienTai: p.giaHienTai })))
    
  } catch (error) {
    console.error(`Failed to load products for category ${categoryId.value}:`, error)
    hasError.value = true
    categoryProducts.value = []
  } finally {
    isLoadingProducts.value = false
  }
}

const viewProduct = (productId) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}

const handleAddToWishlist = (productId) => {
  showNotification('Đã thêm vào danh sách yêu thích!', 'success')
}

const handleCouponCopied = (couponCode) => {
  showNotification(`Đã copy mã khuyến mãi: ${couponCode}`, 'success')
}

// Lifecycle hooks
onMounted(() => {
  loadCategoryProducts()
})

// Watch for category changes
watch(categoryId, () => {
  loadCategoryProducts()
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.category-header {
  padding: 2rem 0;
}

.category-icon {
  opacity: 0.8;
}

.category-title {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.no-products {
  padding: 3rem 1rem;
}

.error-state {
  padding: 3rem 1rem;
}

.breadcrumb-item a:hover {
  color: #0d6efd !important;
}

@media (max-width: 768px) {
  .category-header {
    padding: 1rem 0;
  }
  
  .category-icon i {
    font-size: 2.5rem !important;
  }
  
  .category-title {
    font-size: 1.5rem;
  }
}
</style>