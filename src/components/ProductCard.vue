<template>
  <div class="card h-100 shadow-sm border-0 position-relative overflow-hidden product-card" @click="handleCardClick">
    <div class="position-relative overflow-hidden" style="height: 200px;">
      <img 
        :src="product.image" 
        class="card-img-top w-100 h-100 object-fit-cover" 
        :alt="product.name"
        loading="lazy"
      >
      <div class="position-absolute top-0 start-0 end-0 bottom-0 d-flex flex-column justify-content-between p-3 product-overlay">
        <div class="d-flex flex-wrap gap-2">
          <span v-if="discountPercentage > 0" class="badge bg-danger rounded-pill">
            -{{ discountPercentage }}%
          </span>
          <span v-if="isNew" class="badge bg-success rounded-pill">
            Mới
          </span>
          <span v-if="isBestSeller" class="badge bg-warning rounded-pill">
            Bán chạy
          </span>
        </div>
        <div class="d-flex justify-content-center gap-2 quick-actions">
          <button 
            class="btn btn-light btn-sm rounded-circle p-2" 
            @click.stop="handleAddToCart"
            :title="'Thêm ' + product.name + ' vào giỏ hàng'"
            style="width: 40px; height: 40px;"
          >
            <i class="fas fa-cart-plus"></i>
          </button>
          <button 
            class="btn btn-light btn-sm rounded-circle p-2" 
            @click.stop="handleViewDetail"
            :title="'Xem chi tiết ' + product.name"
            style="width: 40px; height: 40px;"
          >
            <i class="fas fa-eye"></i>
          </button>
          <button 
            class="btn btn-light btn-sm rounded-circle p-2" 
            @click.stop="handleAddToWishlist"
            :title="'Thêm ' + product.name + ' vào yêu thích'"
            style="width: 40px; height: 40px;"
          >
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="card-body d-flex flex-column">
      <div class="d-flex align-items-center justify-content-between mb-2">
                 <div class="d-flex gap-1">
          <i 
            v-for="star in 5" 
            :key="star"
            :class="[
              'fas fa-star',
              star <= product.rating ? 'text-warning' : 'text-muted'
            ]"
            style="font-size: 0.875rem;"
          ></i>
        </div>
        
        <small v-if="stockQuantity !== null" :class="stockStatusClass" class="ms-2">({{ stockQuantity }})</small>
        <small v-else class="text-muted ms-2">(Đang tải...)</small>
      </div>
      
      <h6 class="card-title fw-semibold text-dark mb-3 lh-sm" style="height: 2.8rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
        {{ product.name }}
      </h6>
      
      <div class="mb-auto">
        <span v-if="product.originalPrice" class="text-muted text-decoration-line-through me-2" style="font-size: 0.875rem;">
          {{ formatPrice(numberize(product.originalPrice)) }}
        </span>
        <span class="fw-bold text-primary fs-5">{{ formatPrice(displayPrice) }}</span>
      </div>
      
      <div class="mt-3">
        <button 
          class="btn btn-primary w-100 fw-semibold rounded-3 py-2" 
          @click.stop="handleAddToCart"
          :disabled="isLoading"
        >
          <i v-if="!isLoading" class="fas fa-cart-plus me-2"></i>
          <div v-else class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          {{ isLoading ? 'Đang thêm...' : 'Thêm giỏ hàng' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useInventory } from '../composables/useInventory.js'

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  formatPrice: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits(['add-to-cart', 'view-detail', 'add-to-wishlist'])

// Reactive data
const isLoading = ref(false)

// Inventory composable
const { getProductStock, getStockStatusClass } = useInventory()
const stockQuantity = ref(null)
const stockStatusClass = ref('text-muted')
// Optional: set a fixed maKho for single store mode
const MA_KHO = 1

// Computed
const discountPercentage = computed(() => {
  if (!props.product.originalPrice) return 0
  return Math.round((1 - props.product.price / props.product.originalPrice) * 100)
})

const isNew = computed(() => {
  // Logic để xác định sản phẩm mới (ví dụ: tạo trong 7 ngày qua)
  return props.product.isNew || Math.random() > 0.7
})

const isBestSeller = computed(() => {
  return props.product.isBestSeller || Math.random() > 0.8
})



// Methods
const numberize = (val) => {
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}

const displayPrice = computed(() => {
  const p1 = numberize(props.product.price)
  const p2 = numberize(props.product.giaHienTai)
  return p1 > 0 ? p1 : (p2 > 0 ? p2 : 0)
})

const handleAddToCart = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    emit('add-to-cart', props.product.maSP || props.product.id)
  } finally {
    isLoading.value = false
  }
}

const handleViewDetail = () => {
  emit('view-detail', props.product.maSP || props.product.id)
}

const handleAddToWishlist = () => {
  emit('add-to-wishlist', props.product.maSP || props.product.id)
}

const handleCardClick = () => {
  handleViewDetail()
}

// Lấy số lượng tồn khi component được mount
const loadStockQuantity = async () => {
  // Thử nhiều field khác nhau để tìm mã sản phẩm
  const possibleIds = [
    props.product?.maSP,
    props.product?.id,
    props.product?.maSanPham,
    props.product?.productId,
    props.product?.code
  ].filter(Boolean)
  
  if (possibleIds.length > 0) {
    // Thử từng ID cho đến khi tìm thấy stock
    for (const productId of possibleIds) {
      try {
        const stock = await getProductStock(productId, MA_KHO)
        
        if (stock !== null && stock !== undefined && stock > 0) {
          stockQuantity.value = stock
          stockStatusClass.value = getStockStatusClass.value(`${productId}@${MA_KHO}`)
          return
        }
      } catch (error) {
        continue
      }
    }
    
    // Nếu vẫn không tìm thấy
    stockQuantity.value = 0
    stockStatusClass.value = 'text-muted'
  } else {
    stockQuantity.value = 0
    stockStatusClass.value = 'text-muted'
  }
}

// Watch product changes để cập nhật số lượng tồn
watch(() => props.product, () => {
  loadStockQuantity()
}, { immediate: false, deep: false })

// Load stock quantity khi component mount
onMounted(() => {
  loadStockQuantity()
})
</script>

<style scoped>
/* Minimal custom CSS - chỉ giữ những gì Bootstrap không thể thay thế */
.product-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.product-overlay {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.3)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.quick-actions {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.product-card:hover .quick-actions {
  opacity: 1;
  transform: translateY(0);
}

.btn:hover {
  transform: scale(1.05);
}

/* Mobile responsive - show overlay on mobile */
@media (max-width: 576px) {
  .product-overlay {
    opacity: 1;
  }
  
  .quick-actions {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>