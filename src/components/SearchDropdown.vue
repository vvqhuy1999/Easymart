<template>
  <div class="search-container">
    <div class="search-wrapper" @click="focusInput">
      <div class="search-icon">
        <i class="fas fa-search" v-show="!isSearching"></i>
        <div v-show="isSearching" class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Đang tìm kiếm...</span>
        </div>
      </div>
      
      <input 
        ref="searchInput"
        type="text" 
        class="form-control search-input" 
        :placeholder="currentPlaceholder"
        :value="searchQuery"
        @input="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        autocomplete="off"
        spellcheck="false"
      >
      
      <div class="search-actions">
        <button 
          v-if="searchQuery.length > 0"
          class="btn btn-sm clear-btn" 
          @click="clearSearch"
          type="button"
          title="Xóa tìm kiếm"
        >
          <i class="fas fa-times"></i>
        </button>
        

      </div>
    </div>
    
    <!-- Search Dropdown -->
    <Transition name="dropdown">
      <div 
        v-if="showDropdown"
        class="search-dropdown"
        @mousedown.prevent
      >
        <!-- Quick Search -->
        <div v-if="searchQuery.length === 0" class="quick-search">
          <div class="dropdown-section">
            <h6 class="section-title">
              <i class="fas fa-history text-muted me-2"></i>Tìm kiếm gần đây
            </h6>
            <div class="recent-searches">
              <button
                v-for="(search, index) in recentSearches"
                :key="`recent-${index}`"
                class="btn btn-sm btn-outline-secondary recent-search-item"
                @click="selectRecentSearch(search)"
              >
                <i class="fas fa-history me-2"></i>{{ search }}
              </button>
            </div>
          </div>
          
          <div class="dropdown-section">
            <h6 class="section-title">
              <i class="fas fa-fire text-danger me-2"></i>Từ khóa phổ biến
            </h6>
            <div class="popular-keywords">
              <button
                v-for="(keyword, index) in popularKeywords"
                :key="`popular-${index}`"
                class="btn btn-sm btn-outline-primary popular-keyword"
                @click="selectKeyword(keyword)"
              >
                {{ keyword }}
              </button>
            </div>
          </div>
        </div>

        <!-- Search Results -->
        <div v-else class="search-results">
          <!-- API Search Error -->
          <div v-if="apiSearchError" class="search-error">
            <div class="error-content">
              <i class="fas fa-exclamation-triangle text-warning"></i>
              <h6>Lỗi tìm kiếm</h6>
              <p>{{ apiSearchError }}</p>
              <button class="btn btn-sm btn-outline-primary" @click="handleSearch({ target: { value: searchQuery } })">
                <i class="fas fa-redo me-2"></i>Thử lại
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="displayedResults.length === 0 && !isSearching" class="no-results">
            <div class="no-results-content">
              <i class="fas fa-search-minus text-muted"></i>
              <h6>Không tìm thấy kết quả</h6>
              <p>Thử tìm kiếm với từ khóa khác</p>
            </div>
          </div>

          <!-- Search Suggestions -->
          <div v-if="searchSuggestions.length > 0" class="search-suggestions">
            <h6 class="section-title">
              <i class="fas fa-lightbulb text-warning me-2"></i>Gợi ý tìm kiếm
            </h6>
            <div class="suggestion-items">
              <button
                v-for="(suggestion, index) in searchSuggestions"
                :key="`suggestion-${index}`"
                :class="['suggestion-item', { active: highlightedIndex === index }]"
                @click="selectSuggestion(suggestion)"
              >
                <i class="fas fa-search me-2"></i>{{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Product Results -->
          <div v-if="displayedResults.length > 0" class="product-results">
            <div class="results-header">
              <h6 class="section-title">
                <i class="fas fa-box text-primary me-2"></i>
                Sản phẩm ({{ displayedResults.length }})
              </h6>
            </div>
            
            <div class="product-list">
              <div 
                v-for="(product, index) in displayedResults" 
                :key="product.maSP || product.id || index"
                :class="['product-item', { 
                  active: highlightedIndex === (searchSuggestions.length + index),
                  'out-of-stock': (product.trongLuong || product.stock || 0) === 0 || product.inStock === false
                }]"
                @click="selectProduct(product)"
              >
                <div class="product-image">
                  <img 
                    :src="getProductImage(product)" 
                    :alt="product.tenSP || product.name || 'Sản phẩm'" 
                    loading="lazy"
                    @error="handleImageError"
                  >
                  <div v-if="product.giamGia || product.discount" class="product-badge">
                    -{{ product.giamGia || product.discount }}%
                  </div>
                </div>
                
                <div class="product-info">
                  <h6 class="product-name">{{ product.tenSP || product.name || 'Tên sản phẩm' }}</h6>
                  <div class="product-price">
                    <span v-if="product.giaGoc || product.originalPrice" class="original-price">
                      {{ formatCurrency(product.giaGoc || product.originalPrice) }}
                    </span>
                    <span class="current-price">{{ formatCurrency(product.giaHienTai || product.giaBan || product.price || 0) }}</span>
                  </div>
                  
                  <div class="product-meta">
                    <div class="product-rating">
                      <i class="fas fa-star text-warning"></i>
                      <span>{{ product.danhGia || product.rating || 4.5 }}</span>
                    </div>
                    <div v-if="(product.trongLuong || product.stock || 0) === 0 || product.inStock === false" class="out-of-stock-label">
                      Hết hàng
                    </div>
                  </div>
                </div>
                
                <div class="product-actions">
                  <button 
                    class="btn btn-sm btn-primary quick-add-btn"
                    @click.stop="quickAddToCart(product.maSP || product.id)"
                    :disabled="(product.trongLuong || product.stock || 0) === 0 || product.inStock === false"
                    title="Thêm vào giỏ hàng"
                  >
                    <i class="fas fa-cart-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Categories Results -->
          <div v-if="categoryResults.length > 0" class="category-results">
            <h6 class="section-title">
              <i class="fas fa-layer-group text-success me-2"></i>Danh mục
            </h6>
            <div class="category-list">
              <button
                v-for="category in categoryResults"
                :key="category.maLoaiSP || category.id"
                class="category-item"
                @click="selectCategory(category)"
              >
                <i :class="`${category.icon} text-${category.color} me-2`"></i>
                {{ category.name }}
                <span class="product-count">({{ category.productCount }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Search Footer -->
        <div class="search-footer">
          <div class="search-tips">
            <small class="text-muted">
              <i class="fas fa-keyboard me-1"></i>
              Enter để tìm kiếm, ↑↓ để điều hướng, Esc để đóng
            </small>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Search Overlay -->
    <div 
      v-if="showDropdown && isMobile"
      class="search-overlay"
      @click="hideDropdown"
    ></div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { quickSearch } from '../utils/searchService'
import { API_BASE_URL } from '../config/api'

// Router
const router = useRouter()

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['update-search', 'add-to-cart', 'view-product', 'view-category'])

// Refs
const searchInput = ref(null)

// Reactive data
const showDropdown = ref(false)
const isSearching = ref(false)
const highlightedIndex = ref(-1)
const placeholderIndex = ref(0)
const searchDebounceTimeout = ref(null)

// API search results
const apiSearchResults = ref([])
const apiSearchError = ref(null)

// Static data
const placeholders = [
  'Tìm kiếm sản phẩm... (có thể tìm không dấu)',
  'Rau củ quả tươi ngon...',
  'Thịt cá hải sản...',
  'Sữa và các sản phẩm từ sữa...',
  'Bánh kẹo đồ uống...'
]

const recentSearches = reactive([
  'Rau xanh organic',
  'Thịt bò úc',
  'Sữa tươi'
])

const popularKeywords = reactive([
  'Rau organic',
  'Thịt tươi',
  'Hải sản',
  'Trái cây',
  'Sữa tươi',
  'Bánh mì',
  'Đồ uống',
  'Gia vị'
])

// Computed
const currentPlaceholder = computed(() => {
  return placeholders[placeholderIndex.value]
})

const searchSuggestions = computed(() => {
  if (props.searchQuery.length < 2) return []
  
  // Simple keyword matching for suggestions
  return popularKeywords.filter(keyword => 
    keyword.toLowerCase().includes(props.searchQuery.toLowerCase()) &&
    keyword.toLowerCase() !== props.searchQuery.toLowerCase()
  ).slice(0, 3)
})

const displayedResults = computed(() => {
  // Sử dụng kết quả từ API search
  return apiSearchResults.value.slice(0, 5)
})

const categoryResults = computed(() => {
  // Mock category data
  if (props.searchQuery.length < 2) return []
  
  return [
    { id: 1, name: 'Rau củ quả', icon: 'fas fa-carrot', color: 'success', productCount: 24 },
    { id: 2, name: 'Thịt cá', icon: 'fas fa-fish', color: 'danger', productCount: 15 },
    { id: 3, name: 'Sữa', icon: 'fas fa-glass-whiskey', color: 'info', productCount: 8 }
  ].filter(cat => 
    cat.name.toLowerCase().includes(props.searchQuery.toLowerCase())
  )
})

const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// Methods
const handleSearch = async (event) => {
  const query = event.target.value
  emit('update-search', query)
  
  if (query.length >= 2) {
    isSearching.value = true
    apiSearchError.value = null
    
    // Debounce search
    clearTimeout(searchDebounceTimeout.value)
    searchDebounceTimeout.value = setTimeout(async () => {
      try {
        // Sử dụng API search thay vì local search
        const results = await quickSearch(query, 10)
        apiSearchResults.value = results
      } catch (error) {
        console.error('API search error:', error)
        apiSearchError.value = 'Lỗi tìm kiếm, vui lòng thử lại'
        apiSearchResults.value = []
      } finally {
        isSearching.value = false
      }
    }, 300) // Giảm delay để tìm kiếm nhanh hơn
  } else {
    apiSearchResults.value = []
    isSearching.value = false
  }
  
  showDropdown.value = true
  highlightedIndex.value = -1
}

const handleFocus = () => {
  showDropdown.value = true
}

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const hideDropdown = () => {
  showDropdown.value = false
}

const focusInput = () => {
  searchInput.value?.focus()
}

const clearSearch = () => {
  emit('update-search', '')
  apiSearchResults.value = []
  apiSearchError.value = null
  focusInput()
}



const addToRecentSearches = (query) => {
  const trimmedQuery = query.trim()
  if (trimmedQuery && !recentSearches.includes(trimmedQuery)) {
    recentSearches.unshift(trimmedQuery)
    if (recentSearches.length > 5) {
      recentSearches.pop()
    }
  }
}

const selectRecentSearch = (search) => {
  emit('update-search', search)
  focusInput()
}

const selectKeyword = (keyword) => {
  emit('update-search', keyword)
  focusInput()
}

const selectSuggestion = (suggestion) => {
  emit('update-search', suggestion)
  addToRecentSearches(suggestion)
  focusInput()
}

const selectProduct = (product) => {
  addToRecentSearches(props.searchQuery)
  showDropdown.value = false
  
  // Chuyển trang trực tiếp đến chi tiết sản phẩm
  const productId = product.maSP || product.id
  if (productId) {
    router.push({ 
      name: 'ProductDetail', 
      params: { id: productId } 
    })
  }
}

const selectCategory = (category) => {
  showDropdown.value = false
  
  // Chuyển trang trực tiếp đến danh mục
  const categoryId = category.maLoaiSP || category.id
  if (categoryId) {
    router.push({ 
      name: 'Category', 
      params: { id: categoryId } 
    })
  }
}

const quickAddToCart = (productId) => {
  emit('add-to-cart', productId)
}



// Format currency for Vietnamese Dong
const formatCurrency = (price) => {
  const numeric = Number(price)
  if (!Number.isFinite(numeric) || numeric <= 0) return '0 ₫'
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numeric)
}

// Get product image from API data
const getProductImage = (product) => {
  // Try to get image from API response
  if (product.hinhAnh) {
    return `${API_BASE_URL}/api/upload/serve-image/${product.hinhAnh}`
  }
  
  if (product.image) {
    return `${API_BASE_URL}/api/upload/serve-image/${product.image}`
  }
  
  // Try to construct image path from maSP
  if (product.maSP) {
    return `${API_BASE_URL}/api/upload/serve-image/${product.maSP}_main.jfif`
  }
  
  if (product.id) {
    return `${API_BASE_URL}/api/upload/serve-image/${product.id}_main.jfif`
  }
  
  // Fallback to default image
  return '/placeholder-product.jpg'
}

// Handle image loading error
const handleImageError = (event) => {
  // Use a data URL for placeholder image
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAxNUMzMi43NjE0IDE1IDM1IDE3LjIzODYgMzUgMjBDMzUgMjIuNzYxNCAzMi43NjE0IDI1IDMwIDI1QzI3LjIzODYgMjUgMjUgMjIuNzYxNCAyNSAyMEMyNSAxNy4yMzg2IDI3LjIzODYgMTUgMzAgMTVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0zMCAyN0MzMi43NjE0IDI3IDM1IDI5LjIzODYgMzUgMzJDMzUgMzQuNzYxNCAzMi43NjE0IDM3IDMwIDM3QzI3LjIzODYgMzcgMjUgMzQuNzYxNCAyNSAzMkMyNSAyOS4yMzg2IDI3LjIzODYgMjcgMzAgMjdaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='
}

const handleKeydown = (event) => {
  if (!showDropdown.value) return
  
  const totalItems = searchSuggestions.value.length + displayedResults.value.length
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, totalItems - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0) {
        if (highlightedIndex.value < searchSuggestions.value.length) {
          selectSuggestion(searchSuggestions.value[highlightedIndex.value])
        } else {
          const productIndex = highlightedIndex.value - searchSuggestions.value.length
          selectProduct(displayedResults.value[productIndex])
        }
      } else {
        // Enter without selection - do nothing
      }
      break
    case 'Escape':
      event.preventDefault()
      showDropdown.value = false
      searchInput.value?.blur()
      break
  }
}

const rotatePlaceholder = () => {
  placeholderIndex.value = (placeholderIndex.value + 1) % placeholders.length
}

// Lifecycle
let placeholderInterval = null

onMounted(() => {
  // Rotate placeholder text
  placeholderInterval = setInterval(rotatePlaceholder, 3000)
  
  // Handle clicks outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container')) {
      showDropdown.value = false
    }
  })
})

onUnmounted(() => {
  if (placeholderInterval) {
    clearInterval(placeholderInterval)
  }
})

// Watchers
watch(() => props.searchQuery, (newQuery) => {
  if (newQuery.length === 0) {
    isSearching.value = false
    apiSearchResults.value = []
    apiSearchError.value = null
  }
})
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-wrapper:focus-within {
  border-color: var(--bs-primary);
  box-shadow: 0 4px 20px rgba(var(--bs-primary-rgb), 0.2);
  transform: translateY(-1px);
}

.search-icon {
  color: #6c757d;
  margin-right: 12px;
  font-size: 1rem;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  flex: 1;
  padding: 0;
}

.search-input::placeholder {
  color: #adb5bd;
  font-weight: 400;
}

.search-input:focus::placeholder {
  color: #dee2e6;
}

.search-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.clear-btn {
  background: none;
  border: none;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}



/* Dropdown Styles */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 500px;
  overflow-y: auto;
  margin-top: 8px;
}

.dropdown-section {
  padding: 16px;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #495057;
}

.recent-searches, .popular-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-search-item, .popular-keyword {
  font-size: 0.875rem;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.recent-search-item:hover, .popular-keyword:hover {
  transform: translateY(-1px);
}

/* Search Results */
.search-results {
  max-height: 450px;
  overflow-y: auto;
}

/* Search Error */
.search-error {
  padding: 40px 20px;
  text-align: center;
}

.error-content i {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-content h6 {
  color: #dc3545;
  margin-bottom: 8px;
}

.error-content p {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.no-results {
  padding: 40px 20px;
  text-align: center;
}

.no-results-content i {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-results-content h6 {
  color: #6c757d;
  margin-bottom: 8px;
}

.no-results-content p {
  color: #adb5bd;
  font-size: 0.875rem;
}

/* Suggestions */
.search-suggestions {
  padding: 16px;
  border-bottom: 1px solid #f8f9fa;
}

.suggestion-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  text-align: left;
  transition: all 0.2s ease;
  color: #495057;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f8f9fa;
  color: var(--bs-primary);
}

/* Product Results */
.product-results {
  padding: 16px;
}

.results-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 12px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.product-item:hover,
.product-item.active {
  border-color: var(--bs-primary);
  box-shadow: 0 4px 15px rgba(var(--bs-primary-rgb), 0.1);
  transform: translateY(-1px);
}

.product-item.out-of-stock {
  opacity: 0.6;
  background: #f8f9fa;
}

.product-image {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #dc3545;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 4px;
}

.original-price {
  font-size: 0.75rem;
  color: #6c757d;
  text-decoration: line-through;
  margin-right: 8px;
}

.current-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bs-primary);
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6c757d;
}

.out-of-stock-label {
  font-size: 0.75rem;
  color: #dc3545;
  font-weight: 500;
  background: #fff5f5;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #fecaca;
}

.product-actions {
  margin-left: 12px;
}

.quick-add-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.quick-add-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.quick-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Category Results */
.category-results {
  padding: 16px;
  border-top: 1px solid #f8f9fa;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: left;
}

.category-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.product-count {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Footer */
.search-footer {
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 15px 15px;
}

.search-tips {
  text-align: center;
}

/* Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-dropdown {
    position: fixed;
    top: 60px;
    left: 10px;
    right: 10px;
    max-height: calc(100vh - 80px);
  }
  
  .search-wrapper {
    border-radius: 20px;
    padding: 10px 16px;
  }
  
  .product-item {
    padding: 16px 12px;
  }
  
  .product-image {
    width: 50px;
    height: 50px;
  }
  
  .dropdown-section {
    padding: 12px;
  }
}

@media (max-width: 576px) {
  .recent-searches,
  .popular-keywords {
    flex-direction: column;
  }
  
  .recent-search-item,
  .popular-keyword {
    width: 100%;
    text-align: left;
    justify-content: flex-start;
  }
}
</style>