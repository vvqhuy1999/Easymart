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

      <!-- Products Grid -->
      <div v-if="categoryProducts.length > 0" class="row g-4">
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

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'

// Components
// Đã xóa import Header và Footer
import ProductCard from '../components/ProductCard.vue'

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

// Computed properties
const categoryId = computed(() => parseInt(route.params.id))

const currentCategory = computed(() => {
  return getCategoryById(categoryId.value)
})

const categoryProducts = computed(() => {
  return products.value.filter(product => product.categoryId === categoryId.value)
})

// Methods
const viewProduct = (productId) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}

const handleAddToWishlist = (productId) => {
  showNotification('Đã thêm vào danh sách yêu thích!', 'success')
}
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