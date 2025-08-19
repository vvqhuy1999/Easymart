<template>
  <!-- Component hiển thị một danh mục sản phẩm với header và grid sản phẩm -->
  <section v-if="products.length > 0" class="py-5 my-4" :id="`category-${category.id}`">
    <!-- Container chính với padding và margin -->
    <div class="container">
      <!-- Header của section chứa thông tin danh mục và controls -->
      <div class="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4 p-4 bg-light rounded-4 shadow-sm">
        <!-- Phần nội dung header bên trái -->
        <div class="d-flex align-items-center gap-4 mb-3 mb-md-0">
          <!-- Icon của danh mục với màu sắc động -->
          <div class="bg-white rounded-4 p-3 shadow-sm border" style="width: 90px; height: 90px; display: flex; align-items: center; justify-content: center;">
            <i :class="`${category.icon} fs-1`" :style="{ color: getCategoryColor() }"></i>
          </div>
          <!-- Thông tin danh mục -->
          <div>
            <!-- Tiêu đề danh mục -->
            <h2 class="fw-bold text-dark mb-2 fs-2">{{ category.name }}</h2>
            <!-- Mô tả danh mục (nếu có) -->
            <p v-if="category.description" class="text-muted mb-3 fs-6">{{ category.description }}</p>
            <!-- Thống kê danh mục -->
            <div class="d-flex flex-wrap gap-3">
              <!-- Số lượng sản phẩm -->
              <span class="badge bg-primary bg-opacity-10 text-primary p-2 rounded-pill">
                <i class="fas fa-box me-2"></i>
                {{ products.length }} sản phẩm
              </span>
              <!-- Rating trung bình -->
              <span class="badge bg-warning bg-opacity-10 text-warning p-2 rounded-pill">
                <i class="fas fa-star me-2"></i>
                {{ averageRating.toFixed(1) }} sao
              </span>
              <!-- Badge sản phẩm mới (nếu có) -->
              <span v-if="hasNewProducts" class="badge bg-danger p-2 rounded-pill">
                <i class="fas fa-sparkles me-2"></i>
                Có sản phẩm mới
              </span>
            </div>
          </div>
        </div>
        
        <!-- Phần controls bên phải header -->
        <div class="d-flex align-items-center gap-3">
          <!-- Grid view info -->
          <div class="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 px-3 py-2">
            <span class="text-primary fw-semibold small">
              <i class="fas fa-th me-2"></i>
              Hiển thị dạng lưới
            </span>
          </div>
          
          <!-- Dropdown sắp xếp sản phẩm -->
          <div>
            <select v-model="sortBy" class="form-select form-select-sm rounded-3 border-primary border-opacity-25 fw-semibold" @change="handleSort" style="min-width: 160px;">
              <option value="default">Mặc định</option>
              <option value="name">Tên A-Z</option>
              <option value="price-low">Giá thấp - cao</option>
              <option value="price-high">Giá cao - thấp</option>
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Bootstrap Container hiển thị danh sách sản phẩm -->
      <div class="mt-4 mb-5">
        <!-- Loading state for products -->
        <div v-if="isLoadingProducts" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải sản phẩm...</span>
          </div>
          <p class="text-muted mt-3">Đang tải sản phẩm trong danh mục...</p>
        </div>
        
        <!-- Products grid when loaded -->
        <div v-else-if="products.length > 0">
          <!-- Bootstrap Row cho grid layout -->
          <TransitionGroup 
            name="products" 
            tag="div" 
            class="row g-3"
          >
            <!-- Loop qua các sản phẩm đã được sort với Bootstrap columns -->
            <div
              v-for="(product, index) in displayedProducts"
              :key="product.id"
              :class="[
                'col-12', 
                'col-sm-6', 
                'col-md-4', 
                'col-lg-3',
                'product-item'
              ]"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <!-- Component ProductCard với các props và events -->
              <ProductCard
                :product="product"
                :formatPrice="formatPrice"
                @add-to-cart="handleAddToCart"
                @view-detail="handleViewProduct"
                @add-to-wishlist="handleAddToWishlist"
              />
            </div>
          </TransitionGroup>
        </div>
        
        <!-- Empty state when no products -->
        <div v-else class="text-center py-5">
          <div class="empty-icon mb-4">
            <i class="fas fa-box-open fa-4x text-muted"></i>
          </div>
          <h4 class="text-muted mb-3">Chưa có sản phẩm nào</h4>
          <p class="text-muted mb-4">Danh mục này chưa có sản phẩm nào được thêm vào</p>
          <button class="btn btn-primary" @click="emit('load-products', category.id)">
            <i class="fas fa-refresh me-2"></i>Tải lại sản phẩm
          </button>
        </div>
      </div>

      <!-- Footer section với Load More và Show All buttons -->
      <div class="text-center mt-5 p-4 bg-light bg-opacity-50 rounded-4 border">
        <!-- Loading state khi đang tải thêm sản phẩm -->
        <div v-if="isLoading" class="d-flex flex-column align-items-center gap-3 py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="text-muted fw-semibold mb-0 fs-6">Đang tải thêm sản phẩm...</p>
        </div>

        <!-- Action buttons khi không loading -->
        <div v-else>
          <!-- Load More và Show All buttons -->
          <div v-if="hasMoreProducts" class="d-flex justify-content-center align-items-center gap-3 flex-wrap">
            <button 
              class="btn btn-primary fw-bold px-4 py-2 rounded-3" 
              @click="loadMoreProducts"
            >
              <i class="fas fa-plus me-2"></i>Xem thêm {{ remainingProductsCount }} sản phẩm
            </button>
            <button 
              class="btn btn-outline-primary fw-bold px-4 py-2 rounded-3" 
              @click="showAllProducts"
            >
              <i class="fas fa-expand me-2"></i>Hiển thị tất cả
            </button>
            <router-link 
              :to="{ name: 'Category', params: { id: category.id } }"
              class="btn btn-outline-success fw-bold px-4 py-2 rounded-3"
            >
              <i class="fas fa-arrow-right me-2"></i>Xem trang danh mục
            </router-link>
          </div>

          <!-- Show Less button -->
          <div v-else-if="displayedProducts.length > initialDisplayCount" class="mt-3">
            <button 
              class="btn btn-outline-secondary fw-semibold px-4 py-2 rounded-3" 
              @click="showLessProducts"
            >
              <i class="fas fa-compress me-2"></i>Thu gọn
            </button>
            <router-link 
              :to="{ name: 'Category', params: { id: category.id } }"
              class="btn btn-outline-success fw-bold px-4 py-2 rounded-3 ms-2"
            >
              <i class="fas fa-arrow-right me-2"></i>Xem trang danh mục
            </router-link>
          </div>

          <!-- All products shown message -->
          <div v-else class="text-muted">
            <i class="fas fa-check-circle text-success me-2"></i>
            Đã hiển thị tất cả sản phẩm trong danh mục
            <div class="mt-3">
              <router-link 
                :to="{ name: 'Category', params: { id: category.id } }"
                class="btn btn-outline-success fw-bold px-4 py-2 rounded-3"
              >
                <i class="fas fa-arrow-right me-2"></i>Xem trang danh mục
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Features Section -->
      <div v-if="categoryFeatures && categoryFeatures.length > 0" class="mt-5 pt-4 border-top">
        <h5 class="fw-bold text-dark text-center mb-4">Đặc điểm danh mục</h5>
        <div class="row g-3">
          <div 
            v-for="feature in categoryFeatures" 
            :key="feature.id"
            class="col-md-6 col-lg-4"
          >
            <div class="d-flex align-items-center gap-3 p-3 bg-white rounded-3 shadow-sm border feature-item">
              <i :class="`${feature.icon} fs-4 text-primary`"></i>
              <span class="fw-semibold text-dark">{{ feature.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/* 
 * CategorySection Component - Vue 3 Composition API
 * Component hiển thị một danh mục sản phẩm với:
 * - Header thông tin danh mục
 * - Grid/List view toggles
 * - Sort options
 * - Product cards với animation
 * - Load more functionality
 */

// Import các function cần thiết từ Vue
import { computed, ref, watch } from 'vue'
import ProductCard from './ProductCard.vue'

// ==================== PROPS ====================
// Định nghĩa các props nhận từ parent component
const props = defineProps({
  category: {
    type: Object,
    required: true
    // Chứa thông tin danh mục: id, name, icon, description, features...
  },
  products: {
    type: Array,
    required: true
    // Mảng sản phẩm thuộc danh mục này
  },
  isLoadingProducts: {
    type: Boolean,
    default: false
    // Trạng thái loading của products
  },
  formatPrice: {
    type: Function,
    required: true
    // Function format giá tiền (VD: 50000 -> "50.000đ")
  },
  initialDisplayCount: {
    type: Number,
    default: 8
    // Số lượng sản phẩm hiển thị ban đầu
  }
})

// ==================== EVENTS ====================
// Định nghĩa các events emit lên parent component
const emit = defineEmits(['add-to-cart', 'view-product', 'add-to-wishlist', 'show-more', 'show-all', 'load-products'])

// ==================== REACTIVE DATA ====================
// Cách sắp xếp sản phẩm: 'default', 'name', 'price-low', 'price-high', 'newest', 'popular'
const sortBy = ref('default')
// Số lượng sản phẩm hiện tại đang hiển thị
const displayCount = ref(props.initialDisplayCount)
// Trạng thái loading khi thực hiện các action
const isLoading = ref(false)
// Trạng thái hiển thị loading spinner khi load more
const showLoadingState = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Danh sách sản phẩm đã được sắp xếp theo sortBy
const sortedProducts = computed(() => {
  let sorted = [...props.products].map(p => ({
    ...p,
    price: Number.isFinite(Number(p.price)) && Number(p.price) > 0 ? Number(p.price) : Number(p.giaHienTai) || 0
  }))
  
  switch (sortBy.value) {
    case 'name':
      // Sắp xếp theo tên A-Z (hỗ trợ tiếng Việt)
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    case 'price-low':
      // Sắp xếp theo giá tăng dần
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      // Sắp xếp theo giá giảm dần
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      // Sắp xếp theo ngày tạo mới nhất
      return sorted.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
    case 'popular':
      // Sắp xếp theo độ phổ biến
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    default:
      // Giữ nguyên thứ tự ban đầu
      return sorted
  }
})

// Danh sách sản phẩm hiển thị trên UI (đã limit theo displayCount)
const displayedProducts = computed(() => {
  return sortedProducts.value.slice(0, displayCount.value)
})

// Kiểm tra còn sản phẩm để load more không
const hasMoreProducts = computed(() => {
  return displayCount.value < props.products.length
})

const remainingProductsCount = computed(() => {
  return props.products.length - displayCount.value
})

const averageRating = computed(() => {
  if (props.products.length === 0) return 0
  const totalRating = props.products.reduce((sum, product) => sum + (product.rating || 4.5), 0)
  return totalRating / props.products.length
})

const hasNewProducts = computed(() => {
  return props.products.some(product => product.isNew || Math.random() > 0.8)
})

// Methods
const getCategoryColor = () => {
  const colorMap = {
    'primary': '#0d6efd',
    'success': '#198754',
    'danger': '#dc3545',
    'warning': '#ffc107',
    'info': '#0dcaf0',
    'secondary': '#6c757d'
  }
  return colorMap[props.category.color] || '#0d6efd'
}

const handleSort = () => {
  // Sorting is handled by computed property
}

const loadMoreProducts = async () => {
  isLoading.value = true
  showLoadingState.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  displayCount.value = Math.min(displayCount.value + props.initialDisplayCount, props.products.length)
  
  isLoading.value = false
  showLoadingState.value = false
  
  emit('show-more', {
    categoryId: props.category.id,
    displayCount: displayCount.value
  })
}

const showAllProducts = () => {
  displayCount.value = props.products.length
  emit('show-all', {
    categoryId: props.category.id,
    totalProducts: props.products.length
  })
}

const showLessProducts = () => {
  displayCount.value = props.initialDisplayCount
  // Scroll to category title
  document.getElementById(`category-${props.category.id}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const handleAddToCart = (productId) => {
  emit('add-to-cart', productId)
}

const handleViewProduct = (productId) => {
  emit('view-product', productId)
}

const handleAddToWishlist = (productId) => {
  emit('add-to-wishlist', productId)
}

// Watch for category changes
watch(() => props.category.id, () => {
  displayCount.value = props.initialDisplayCount
  sortBy.value = 'default'
})
</script>

<style scoped>
/* Minimal custom CSS - chỉ giữ những gì Bootstrap không thể thay thế */

/* Animation cho products */
.products-enter-active {
  transition: all 0.6s ease;
}

.products-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.products-leave-active {
  transition: all 0.4s ease;
}

.products-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.products-move {
  transition: transform 0.5s ease;
}

/* Feature item hover effect */
.feature-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.align-items-center.gap-4 {
    flex-direction: column;
    text-align: center;
  }
  
  .d-flex.flex-wrap.gap-3 {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .d-flex.justify-content-center.align-items-center.gap-3.flex-wrap {
    flex-direction: column;
  }
}
</style>