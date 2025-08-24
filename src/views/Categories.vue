<template>
  <div class="categories-page">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="py-3">
      <div class="container">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="fas fa-home me-1"></i>Trang chủ
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="fas fa-layer-group me-1"></i>Danh mục sản phẩm
          </li>
        </ol>
      </div>
    </nav>

    <!-- Page Header -->
    <section class="hero-section py-5 mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8 mx-auto text-center">
            <div class="hero-icon mb-4">
              <i class="fas fa-layer-group fa-4x text-primary"></i>
            </div>
            <h1 class="display-4 fw-bold text-dark mb-3">Danh mục sản phẩm</h1>
            <p class="lead text-muted mb-4">
              Khám phá {{ categories.length }} danh mục đa dạng với hàng nghìn sản phẩm chất lượng cao
            </p>
            <div class="stats-row d-flex justify-content-center gap-4 flex-wrap">
              <div class="stat-item">
                <span class="stat-number">{{ totalProducts }}</span>
                <span class="stat-label">Sản phẩm</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ categories.length }}</span>
                <span class="stat-label">Danh mục</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">100%</span>
                <span class="stat-label">Tươi ngon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search and Filter -->
    <section class="filter-section py-4 bg-light">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="search-box">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control border-start-0" 
                  placeholder="Tìm kiếm danh mục... (có thể tìm không dấu)"
                  v-model="searchQuery"
                >
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex justify-content-md-end justify-content-start mt-3 mt-md-0 gap-3">
              <select class="form-select w-auto" v-model="sortBy">
                <option value="name">Sắp xếp theo tên</option>
                <option value="products">Số lượng sản phẩm</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
              <div class="btn-group" role="group">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                  title="Xem dạng lưới"
                >
                  <i class="fas fa-th"></i>
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="Xem dạng danh sách"
                >
                  <i class="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="categories-section py-5">
      <div class="container">
        <!-- Loading state -->
        <div v-if="isLoadingCategories" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải danh mục...</span>
          </div>
          <p class="text-muted mt-3">Đang tải danh mục sản phẩm...</p>
        </div>
        
        <!-- Grid View when loaded -->
        <div v-else-if="viewMode === 'grid'" class="row g-4">
          <div 
            v-for="category in filteredCategories" 
            :key="category.id"
            :id="`category-${category.id}`"
            class="col-lg-4 col-md-6"
          >
            <div class="category-card h-100" @click="goToCategory(category.id)">
              <div class="category-card-header">
                <div class="category-icon">
                  <i :class="`${category.icon} fa-3x`" :style="{ color: getCategoryColor(category.color) }"></i>
                </div>
                <div class="category-badge">
                  {{ getCategoryProductCount(category.id) }} sản phẩm
                </div>
              </div>
              <div class="category-card-body">
                <h5 class="category-name">{{ category.name }}</h5>
                <p class="category-description">{{ category.description || getDefaultDescription(category.name) }}</p>
                <div class="category-stats">
                  <div class="stat">
                    <i class="fas fa-box text-primary me-2"></i>
                    <span>{{ getCategoryProductCount(category.id) }} sản phẩm</span>
                  </div>
                  <div class="stat">
                    <i class="fas fa-star text-warning me-2"></i>
                    <span>{{ (Math.random() * 2 + 3).toFixed(1) }}</span>
                  </div>
                </div>
              </div>
              <div class="category-card-footer">
                <button class="btn btn-primary w-100">
                  <i class="fas fa-arrow-right me-2"></i>Xem sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- List View when loaded -->
        <div v-else-if="!isLoadingCategories" class="category-list-view">
          <div 
            v-for="category in filteredCategories" 
            :key="category.id"
            :id="`category-${category.id}`"
            class="category-list-item"
            @click="goToCategory(category.id)"
          >
            <div class="row align-items-center">
              <div class="col-auto">
                <div class="category-icon-sm">
                  <i :class="`${category.icon} fa-2x`" :style="{ color: getCategoryColor(category.color) }"></i>
                </div>
              </div>
              <div class="col">
                <h5 class="category-name mb-1">{{ category.name }}</h5>
                <p class="category-description text-muted mb-2">{{ category.description || getDefaultDescription(category.name) }}</p>
                <div class="category-meta">
                  <span class="badge bg-primary me-2">{{ getCategoryProductCount(category.id) }} sản phẩm</span>
                  <span class="text-muted small">
                    <i class="fas fa-star text-warning me-1"></i>{{ (Math.random() * 2 + 3).toFixed(1) }}
                  </span>
                </div>
              </div>
              <div class="col-auto">
                <button class="btn btn-outline-primary">
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State when loaded -->
        <div v-if="!isLoadingCategories && filteredCategories.length === 0" class="empty-state text-center py-5">
          <div class="empty-icon mb-4">
            <i class="fas fa-search fa-4x text-muted"></i>
          </div>
          <h4 class="text-muted mb-3">Không tìm thấy danh mục nào</h4>
          <p class="text-muted mb-4">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
          <button class="btn btn-primary" @click="clearSearch">
            <i class="fas fa-refresh me-2"></i>Xóa bộ lọc
          </button>
        </div>
      </div>
    </section>

    <!-- Popular Categories -->
    <section class="popular-categories py-5 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h3 class="text-center mb-5">
              <i class="fas fa-fire text-danger me-2"></i>Danh mục phổ biến
            </h3>
            <!-- Loading state for popular categories -->
            <div v-if="isLoadingCategories" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
              <p class="text-muted mt-3">Đang tải danh mục phổ biến...</p>
            </div>
            
            <!-- Popular categories when loaded -->
            <div v-else class="row g-3">
              <div 
                v-for="category in popularCategories" 
                :key="category.id"
                class="col-lg-2 col-md-3 col-sm-4 col-6"
              >
                <div class="popular-category-item" @click="goToCategory(category.id)">
                  <div class="popular-icon">
                    <i :class="`${category.icon} fa-2x`" :style="{ color: getCategoryColor(category.color) }"></i>
                  </div>
                  <h6 class="popular-name">{{ category.name }}</h6>
                  <span class="popular-count">{{ getCategoryProductCount(category.id) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'

import CategoryService from '../utils/categoryService.js'

// Router
const router = useRouter()
const route = useRoute()

// Get data from composable
const {
  categories,
  products,
  getProductsByCategory,
  isLoadingCategories
} = useEasyMart()

// Reactive data
const searchQuery = ref('')
const sortBy = ref('name')
const viewMode = ref('grid')

// Handle hash navigation on mount
onMounted(() => {
  if (route.hash) {
    nextTick(() => {
      const element = document.querySelector(route.hash)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  }
})

// Computed
const totalProducts = computed(() => products.value.length)

const filteredCategories = computed(() => {
  let filtered = categories.value

  // Search filter
  if (searchQuery.value.trim()) {
    filtered = filtered.filter(category => 
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'products':
        return getCategoryProductCount(b.id) - getCategoryProductCount(a.id)
      case 'popular':
        return Math.random() - 0.5 // Random for demo
      default:
        return 0
    }
  })

  return filtered
})

const popularCategories = computed(() => {
  return categories.value
    .map(category => ({
      ...category,
      productCount: getCategoryProductCount(category.id)
    }))
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 6)
})

// Methods
const getCategoryProductCount = (categoryId) => {
  return getProductsByCategory(categoryId).length
}

const getCategoryColor = (color) => {
  const colorMap = {
    'primary': '#0d6efd',
    'secondary': '#6c757d', 
    'success': '#198754',
    'danger': '#dc3545',
    'warning': '#ffc107',
    'info': '#0dcaf0',
    'light': '#f8f9fa',
    'dark': '#212529'
  }
  return colorMap[color] || '#0d6efd'
}

const getDefaultDescription = (categoryName) => {
  const descriptions = {
    'Rau củ quả': 'Rau củ quả tươi ngon, giàu vitamin và chất xơ',
    'Thịt cá': 'Thịt cá tươi sống, đảm bảo chất lượng và an toàn',
    'Sữa': 'Sản phẩm từ sữa dinh dưỡng cho cả gia đình',
    'Bánh kẹo': 'Bánh kẹo ngọt ngào, thơm ngon hấp dẫn',
    'Đồ uống': 'Đồ uống giải khát, bổ dưỡng và thơm ngon'
  }
  return descriptions[categoryName] || `Khám phá các sản phẩm ${categoryName} chất lượng cao`
}

const goToCategory = (categoryId) => {
  router.push({ name: 'Category', params: { id: categoryId } })
}

const clearSearch = () => {
  searchQuery.value = ''
  sortBy.value = 'name'
}
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="1" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-icon {
  position: relative;
  z-index: 2;
}

.stats-row {
  position: relative;
  z-index: 2;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Filter Section */
.filter-section {
  border-bottom: 1px solid #dee2e6;
}

.search-box .input-group-text {
  border-right: none;
}

.search-box .form-control {
  border-left: none;
}

.search-box .form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
}

/* Category Cards */
.category-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.category-card-header {
  position: relative;
  padding: 2rem 1.5rem 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  text-align: center;
}

.category-icon {
  margin-bottom: 1rem;
}

.category-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-card-body {
  padding: 1.5rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.75rem;
}

.category-description {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.category-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6c757d;
}

.category-card-footer {
  padding: 0 1.5rem 1.5rem;
}

/* List View */
.category-list-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.category-list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.category-icon-sm {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.category-meta .badge {
  font-size: 0.75rem;
}

/* Popular Categories */
.popular-category-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.popular-category-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.popular-icon {
  margin-bottom: 1rem;
}

.popular-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.5rem;
}

.popular-count {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
}

.empty-icon {
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 0;
  }
  
  .display-4 {
    font-size: 2rem;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    min-width: auto;
    width: 100%;
  }
  
  .category-card-header {
    padding: 1.5rem 1rem 0.5rem;
  }
  
  .category-card-body {
    padding: 1rem;
  }
  
  .category-card-footer {
    padding: 0 1rem 1rem;
  }
  
  .category-list-item {
    padding: 1rem;
  }
  
  .category-icon-sm {
    width: 60px;
    height: 60px;
  }
  
  .popular-category-item {
    padding: 1rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .filter-section .row > div {
    margin-bottom: 1rem;
  }
  
  .filter-section .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-group {
    width: 100%;
  }
  
  .form-select {
    width: 100% !important;
  }
}
</style>