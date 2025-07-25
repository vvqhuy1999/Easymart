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
        
        <button 
          class="btn btn-primary search-btn" 
          @click="performSearch"
          type="button"
          title="Tìm kiếm"
        >
          <i class="fas fa-search"></i>
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
                v-for="search in recentSearches"
                :key="search"
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
                v-for="keyword in popularKeywords"
                :key="keyword"
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
          <!-- No Results -->
          <div v-if="searchResults.length === 0 && !isSearching" class="no-results">
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
                :key="suggestion"
                :class="['suggestion-item', { active: highlightedIndex === index }]"
                @click="selectSuggestion(suggestion)"
              >
                <i class="fas fa-search me-2"></i>{{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Product Results -->
          <div v-if="searchResults.length > 0" class="product-results">
            <div class="results-header">
              <h6 class="section-title">
                <i class="fas fa-box text-primary me-2"></i>
                Sản phẩm ({{ searchResults.length }})
              </h6>
              <button 
                class="btn btn-sm btn-outline-primary view-all-btn"
                @click="viewAllResults"
              >
                Xem tất cả
              </button>
            </div>
            
            <div class="product-list">
              <div 
                v-for="(product, index) in displayedResults" 
                :key="product.id"
                :class="['product-item', { 
                  active: highlightedIndex === (searchSuggestions.length + index),
                  'out-of-stock': !product.inStock 
                }]"
                @click="selectProduct(product)"
              >
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" loading="lazy">
                  <div v-if="product.discount" class="product-badge">
                    -{{ product.discount }}%
                  </div>
                </div>
                
                <div class="product-info">
                  <h6 class="product-name">{{ highlightSearchTerm(product.name) }}</h6>
                  <div class="product-price">
                    <span v-if="product.originalPrice" class="original-price">
                      {{ formatPrice(product.originalPrice) }}
                    </span>
                    <span class="current-price">{{ formatPrice(product.price) }}</span>
                  </div>
                  
                  <div class="product-meta">
                    <div class="product-rating">
                      <i class="fas fa-star text-warning"></i>
                      <span>{{ product.rating || 4.5 }}</span>
                    </div>
                    <div v-if="!product.inStock" class="out-of-stock-label">
                      Hết hàng
                    </div>
                  </div>
                </div>
                
                <div class="product-actions">
                  <button 
                    class="btn btn-sm btn-primary quick-add-btn"
                    @click.stop="quickAddToCart(product.id)"
                    :disabled="!product.inStock"
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
                :key="category.id"
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

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    required: true
  },
  searchResults: {
    type: Array,
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

// Static data
const placeholders = [
  'Tìm kiếm sản phẩm...',
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
  
  return popularKeywords.filter(keyword => 
    keyword.toLowerCase().includes(props.searchQuery.toLowerCase()) &&
    keyword.toLowerCase() !== props.searchQuery.toLowerCase()
  ).slice(0, 3)
})

const displayedResults = computed(() => {
  return props.searchResults.slice(0, 5)
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
const handleSearch = (event) => {
  const query = event.target.value
  emit('update-search', query)
  
  if (query.length >= 2) {
    isSearching.value = true
    
    // Debounce search
    clearTimeout(searchDebounceTimeout.value)
    searchDebounceTimeout.value = setTimeout(() => {
      isSearching.value = false
    }, 500)
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
  focusInput()
}

const performSearch = () => {
  if (props.searchQuery.trim()) {
    addToRecentSearches(props.searchQuery)
    showDropdown.value = false
    // Implement search action
    console.log('Performing search for:', props.searchQuery)
  }
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
  emit('view-product', product.id)
}

const selectCategory = (category) => {
  showDropdown.value = false
  emit('view-category', category.id)
}

const quickAddToCart = (productId) => {
  emit('add-to-cart', productId)
}

const viewAllResults = () => {
  addToRecentSearches(props.searchQuery)
  showDropdown.value = false
  // Navigate to search results page
  console.log('View all results for:', props.searchQuery)
}

const highlightSearchTerm = (text) => {
  if (!props.searchQuery || props.searchQuery.length < 2) return text
  
  const regex = new RegExp(`(${props.searchQuery})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
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
        performSearch()
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
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: text;
}

.search-wrapper:focus-within {
  border-color: var(--bs-primary);
  box-shadow: 0 4px 20px rgba(22, 160, 133, 0.15);
  transform: translateY(-2px);
}

.search-icon {
  position: absolute;
  left: 1rem;
  z-index: 2;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  outline: none;
  border-radius: 12px;
}

.search-input::placeholder {
  color: #9ca3af;
  transition: opacity 0.3s ease;
}

.search-input:focus::placeholder {
  opacity: 0.5;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.75rem;
}

.clear-btn {
  background: transparent;
  border: none;
  color: #6c757d;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.search-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Dropdown Styles */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.05);
  max-height: 600px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  transform-origin: top center;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.8);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.8);
}

/* Quick Search */
.quick-search {
  padding: 1.5rem;
}

.dropdown-section {
  margin-bottom: 2rem;
}

.dropdown-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.recent-searches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recent-search-item {
  font-size: 0.85rem;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  transition: all 0.2s ease;
}

.recent-search-item:hover {
  background-color: var(--bs-secondary);
  border-color: var(--bs-secondary);
  color: white;
}

.popular-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.popular-keyword {
  font-size: 0.85rem;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  transition: all 0.2s ease;
}

.popular-keyword:hover {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

/* Search Results */
.search-results {
  padding: 1rem 0;
}

.no-results {
  padding: 2rem;
  text-align: center;
}

.no-results-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-results-content h6 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.no-results-content p {
  color: #6b7280;
  margin: 0;
}

/* Search Suggestions */
.search-suggestions {
  padding: 0 1.5rem 1rem;
}

.suggestion-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s ease;
  text-align: left;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f3f4f6;
  color: var(--bs-primary);
}

/* Product Results */
.product-results {
  padding: 0 1.5rem 1rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-all-btn {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.product-item:hover,
.product-item.active {
  background-color: #f8f9fa;
  border-color: var(--bs-primary);
}

.product-item.out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-image {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  font-weight: 600;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.product-name :deep(mark) {
  background-color: #fef3c7;
  color: #d97706;
  padding: 0.1rem 0.2rem;
  border-radius: 3px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.original-price {
  font-size: 0.8rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.current-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--bs-primary);
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
}

.out-of-stock-label {
  color: #dc3545;
  font-weight: 500;
}

.product-actions {
  display: flex;
  align-items: center;
}

.quick-add-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.quick-add-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

/* Category Results */
.category-results {
  padding: 0 1.5rem 1rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
  padding-top: 1rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s ease;
  text-align: left;
}

.category-item:hover {
  background-color: #f3f4f6;
}

.product-count {
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Search Footer */
.search-footer {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
}

.search-tips {
  text-align: center;
}

/* Search Overlay for Mobile */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
  .search-dropdown {
    position: fixed;
    top: 80px;
    left: 1rem;
    right: 1rem;
    max-height: calc(100vh - 100px);
    z-index: 1001;
  }
  
  .search-wrapper {
    border-radius: 25px;
  }
  
  .search-input {
    padding-left: 2.5rem;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .product-item {
    padding: 0.75rem;
  }
  
  .product-image {
    width: 50px;
    height: 50px;
  }
  
  .recent-searches,
  .popular-keywords {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .search-actions {
    gap: 0.25rem;
  }
  
  .search-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .product-actions {
    display: none;
  }
  
  .results-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>