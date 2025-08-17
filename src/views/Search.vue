<template>
  <div class="search-page">
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
            <i class="fas fa-search"></i> Kết quả tìm kiếm
          </li>
        </ol>
      </nav>

      <!-- Search Header -->
      <div class="search-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="mb-2">
              <i class="fas fa-search text-primary me-2"></i>
              Kết quả tìm kiếm
            </h2>
            <p class="text-muted mb-0" v-if="currentSearchTerm">
              Tìm kiếm cho: <strong>"{{ currentSearchTerm }}"</strong>
              <span class="ms-2">({{ searchResultProducts.length }} sản phẩm)</span>
            </p>
          </div>
          
          <!-- Sort Options -->
          <div class="search-sort">
            <select v-model="sortBy" @change="applySorting" class="form-select form-select-sm">
              <option value="relevance">Liên quan nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá thấp - cao</option>
              <option value="price-desc">Giá cao - thấp</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Search Box -->
      <div class="search-box mb-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control form-control-lg"
                placeholder="Tìm kiếm sản phẩm... (có thể tìm không dấu: 'tim kiem' thay vì 'tìm kiếm')"
                v-model="localSearchQuery"
                @keyup.enter="performSearch"
              >
              <button 
                class="btn btn-primary btn-lg" 
                type="button"
                @click="performSearch"
              >
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResultProducts.length > 0">
        <!-- Results Grid -->
        <div class="row g-4">
          <div 
            v-for="product in sortedProducts" 
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
      </div>

      <!-- No Results -->
      <div v-else-if="currentSearchTerm" class="no-results text-center py-5">
        <div class="no-results-content">
          <i class="fas fa-search fa-4x text-muted mb-4"></i>
          <h3 class="text-muted mb-3">Không tìm thấy kết quả</h3>
          <p class="text-muted mb-4">
            Không tìm thấy sản phẩm nào cho từ khóa <strong>"{{ currentSearchTerm }}"</strong>
          </p>
          <div class="search-suggestions">
            <p class="mb-3"><strong>Gợi ý:</strong></p>
            <ul class="list-unstyled text-muted">
              <li>• Kiểm tra chính tả từ khóa</li>
              <li>• Thử sử dụng từ khóa khác</li>
              <li>• Sử dụng từ khóa ngắn gọn hơn</li>
              <li>• Thử tìm kiếm không dấu (ví dụ: "tim kiem" thay vì "tìm kiếm")</li>
            </ul>
          </div>
          <router-link to="/" class="btn btn-primary mt-3">
            <i class="fas fa-arrow-left me-2"></i>
            Về trang chủ
          </router-link>
        </div>
      </div>

      <!-- Initial State -->
      <div v-else class="initial-state text-center py-5">
        <div class="initial-content">
          <i class="fas fa-search fa-4x text-muted mb-4"></i>
          <h3 class="text-muted mb-3">Tìm kiếm sản phẩm</h3>
          <p class="text-muted mb-4">Nhập từ khóa để tìm kiếm sản phẩm bạn muốn</p>
          <p class="text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            Bạn có thể tìm kiếm có hoặc không dấu. Ví dụ: "tìm kiếm" hoặc "tim kiem"
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <!-- Đã xóa Footer -->
  </div>
</template>

<script setup>
/**
 * Search.vue - Trang tìm kiếm sản phẩm
 * 
 * Chức năng:
 * - Tìm kiếm sản phẩm theo từ khóa (hỗ trợ tìm kiếm không dấu)
 * - Hiển thị kết quả tìm kiếm
 * - Sắp xếp kết quả
 * - Xử lý trường hợp không có kết quả
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'
import { filterBySearchTerm } from '../utils/vietnamese'

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
  showNotification
} = useEasyMart()

// Local state
const localSearchQuery = ref('')
const currentSearchTerm = ref('')
const sortBy = ref('relevance')

// Computed properties
const searchResultProducts = computed(() => {
  if (!currentSearchTerm.value || currentSearchTerm.value.length < 2) return []
  
  // Use Vietnamese diacritic-insensitive search
  return filterBySearchTerm(
    products.value, 
    currentSearchTerm.value, 
    ['name', 'description']
  )
})

const sortedProducts = computed(() => {
  const results = [...searchResultProducts.value]
  
  switch (sortBy.value) {
    case 'name-asc':
      return results.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return results.sort((a, b) => b.name.localeCompare(a.name))
    case 'price-asc':
      return results.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return results.sort((a, b) => b.price - a.price)
    default:
      return results
  }
})

// Methods
const updateSearchQuery = (query) => {
  searchQuery.value = query
  localSearchQuery.value = query
}

const performSearch = () => {
  if (localSearchQuery.value.trim()) {
    currentSearchTerm.value = localSearchQuery.value.trim()
    searchQuery.value = localSearchQuery.value.trim()
    
    // Update URL with search term
    router.push({
      name: 'Search',
      query: { q: currentSearchTerm.value }
    })
  }
}

const viewProduct = (productId) => {
          router.push({ name: 'ProductDetail', params: { id: productId } })
}

const handleAddToWishlist = (productId) => {
  showNotification('Đã thêm vào danh sách yêu thích!', 'success')
}

const applySorting = () => {
  // Sorting is handled by computed property
}

// Initialize search from URL query
onMounted(() => {
  const query = route.query.q
  if (query) {
    currentSearchTerm.value = query
    localSearchQuery.value = query
    searchQuery.value = query
  }
})

// Watch for route changes
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    currentSearchTerm.value = newQuery
    localSearchQuery.value = newQuery
    searchQuery.value = newQuery
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.search-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.search-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.search-sort select {
  min-width: 150px;
}

.no-results,
.initial-state {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.search-suggestions ul {
  text-align: left;
  display: inline-block;
}

.breadcrumb-item a:hover {
  color: #0d6efd !important;
}

@media (max-width: 768px) {
  .search-header {
    padding: 1rem;
  }
  
  .search-header .d-flex {
    flex-direction: column;
    align-items: stretch !important;
  }
  
  .search-sort {
    margin-top: 1rem;
  }
  
  .search-box {
    padding: 1.5rem;
  }
}
</style>