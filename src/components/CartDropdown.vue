<template>
  <div class="cart-dropdown">
    <!-- Cart Trigger -->
    <div 
      class="cart-trigger position-relative"
      @click="toggleCart"
      @mouseenter="clearHideTimeout"
      @mouseleave="hideCartDelayed"
    >
      <div class="nav-link px-3 py-2 rounded-pill position-relative cart-icon-wrapper">
        <i class="fas fa-shopping-bag fs-5"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count" style="font-size: 0.7rem;">
          {{ cartCount }}
        </span>
      </div>
      
      <!-- Dropdown arrow for hover indication -->
      <i class="fas fa-chevron-down ms-1 text-muted" style="font-size: 0.7rem;"></i>
    </div>

    <!-- Cart Dropdown Content -->
    <div 
      v-show="showCart"
      class="cart-dropdown-content position-absolute"
      @mouseenter="clearHideTimeout"
      @mouseleave="hideCartDelayed"
    >
      <div class="card shadow-lg border-0" style="width: 350px;">
        <!-- Header -->
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            <i class="fas fa-shopping-cart me-2"></i>Giỏ hàng ({{ cartCount }})
          </h6>
          <div class="d-flex align-items-center">
            <div class="form-check me-3">
              <input 
                class="form-check-input" 
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleSelectAll"
                id="selectAllDropdown"
              >
              <label class="form-check-label text-white small" for="selectAllDropdown">
                Tất cả
              </label>
            </div>
            <button 
              class="btn btn-sm btn-outline-light"
              @click="showCart = false"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="card-body p-0" style="max-height: 400px; overflow-y: auto;">
          <!-- Empty Cart -->
          <div v-if="cartItems.length === 0" class="text-center p-4">
            <i class="fas fa-shopping-cart text-muted fs-1 mb-3"></i>
            <p class="text-muted mb-0">Giỏ hàng trống</p>
            <small class="text-muted">Thêm sản phẩm để bắt đầu mua sắm</small>
          </div>

          <!-- Cart Items List -->
          <div v-else>
            <div 
              v-for="item in cartItems" 
              :key="item.productId"
              class="cart-item d-flex align-items-center p-3 border-bottom"
            >
              <!-- Checkbox -->
              <div class="form-check me-2">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :checked="selectedItems.has(item.productId)"
                  @change="toggleItemSelection(item.productId)"
                  :id="`dropdown-item-${item.productId}`"
                >
              </div>

              <!-- Product Image -->
              <div class="flex-shrink-0 me-3">
                <img 
                  :src="item.product?.image || 'https://via.placeholder.com/60'" 
                  :alt="item.product?.name || 'Product'"
                  class="rounded"
                  style="width: 60px; height: 60px; object-fit: cover;"
                >
              </div>

              <!-- Product Info -->
              <div class="flex-grow-1">
                <h6 class="mb-1 text-truncate" style="max-width: 180px;">
                  {{ item.product?.name || 'Sản phẩm' }}
                </h6>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-primary fw-bold">
                    {{ formatPrice(item.product?.price || 0) }}
                  </span>
                  <div class="quantity-controls d-flex align-items-center">
                    <button 
                      class="btn btn-sm btn-outline-secondary"
                      @click="updateQuantity(item.productId, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="mx-2 fw-bold">{{ item.quantity }}</span>
                    <button 
                      class="btn btn-sm btn-outline-secondary"
                      @click="updateQuantity(item.productId, item.quantity + 1)"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-1">
                  <small class="text-muted">
                    Tổng: {{ formatPrice((item.product?.price || 0) * item.quantity) }}
                  </small>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="removeItem(item.productId)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="cartItems.length > 0" class="card-footer bg-light">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-muted">Đã chọn: {{ selectedItems.size }}/{{ cartItems.length }} sản phẩm</small>
            <strong class="text-primary">{{ formatPrice(selectedTotal) }}</strong>
          </div>
          <div class="d-grid gap-2">
            <router-link 
              to="/cart" 
              class="btn btn-outline-primary btn-sm"
              @click="showCart = false"
            >
              <i class="fas fa-shopping-cart me-2"></i>Xem giỏ hàng
            </router-link>
            <button 
              class="btn btn-primary btn-sm"
              @click="checkout"
              :disabled="selectedItems.size === 0"
            >
              <i class="fas fa-credit-card me-2"></i>Thanh toán ({{ selectedItems.size }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCart } from '../composables/useCart'
import { useEasyMart } from '../composables/useEasyMart'

// Composables
const { cart, cartCount, removeFromCart, updateCartQuantity } = useCart()
const { products, formatPrice, showNotification } = useEasyMart()

// Local state
const showCart = ref(false)
const selectedItems = ref(new Set())
let hideTimeout = null

// Computed properties
const cartItems = computed(() => {
  return cart.value.map(item => {
    const product = products.value.find(p => p.id === item.productId)
    return {
      ...item,
      product: product || item.product
    }
  }).filter(item => item.product)
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)
})

const selectedCartItems = computed(() => {
  return cartItems.value.filter(item => selectedItems.value.has(item.productId))
})

const selectedTotal = computed(() => {
  return selectedCartItems.value.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)
})

const isAllSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(item => selectedItems.value.has(item.productId))
})

// Methods
const toggleCart = () => {
  showCart.value = !showCart.value
}

const hideCartDelayed = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  hideTimeout = setTimeout(() => {
    showCart.value = false
  }, 200)
}

const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  showCart.value = true
}

const updateQuantity = (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(productId)
  } else {
    updateCartQuantity(productId, newQuantity)
  }
}

const removeItem = (productId) => {
  const item = cartItems.value.find(item => item.productId === productId)
  if (item) {
    removeFromCart(productId)
    showNotification(`Đã xóa ${item.product.name} khỏi giỏ hàng!`, 'info')
  }
}

const checkout = () => {
  if (selectedItems.value.size === 0) {
    showNotification('Vui lòng chọn sản phẩm để thanh toán!', 'warning')
    return
  }
  
  showCart.value = false
  
  // Save selected items to localStorage
  const selectedProductIds = Array.from(selectedItems.value)
  localStorage.setItem('easymart-selected-items', JSON.stringify(selectedProductIds))
  
  // Navigate to checkout page
  window.location.href = '/checkout'
}

// Selection methods
const toggleItemSelection = (productId) => {
  if (selectedItems.value.has(productId)) {
    selectedItems.value.delete(productId)
  } else {
    selectedItems.value.add(productId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value.clear()
  } else {
    cartItems.value.forEach(item => {
      selectedItems.value.add(item.productId)
    })
  }
}

// Cleanup
onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})
</script>

<style scoped>
.cart-icon-wrapper {
  cursor: pointer;
  transition: color 0.2s ease;
}

.cart-icon-wrapper:hover {
  color: #0d6efd !important;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
}

.cart-dropdown {
  position: relative;
}

.cart-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.cart-dropdown-content {
  top: 100%;
  right: 0;
  z-index: 9999;
  margin-top: 0;
}

.cart-item {
  transition: background-color 0.2s ease;
}

.cart-item:hover {
  background-color: #f8f9fa;
}

.quantity-controls button {
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-count {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cart-dropdown-content .card {
    width: 300px;
  }
}
</style>