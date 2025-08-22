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
          <div class="d-grid gap-1">
                        <router-link 
              to="/cart"
              class="btn btn-outline-primary w-100 py-2"
              @click="showCart = false"
            >
              <i class="fas fa-shopping-cart me-2"></i>Xem giỏ hàng
            </router-link>
            <button 
              class="btn btn-primary w-100 py-2"
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
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { useOrders } from '../composables/useOrders'
import { useEasyMart } from '../composables/useEasyMart'

// Composables
const router = useRouter()
const { cart, cartCount, removeFromCart, updateCartQuantity, reloadCartFromBackend, getBackendCartSnapshot } = useCart()
const { createOrderFromCart } = useOrders()
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

// Auto-select all items when cart dropdown opens
const handleCartShow = () => {
  showCart.value = true
  
  // Auto-select all cart items
  if (cartItems.value.length > 0) {
    selectedItems.value.clear()
    cartItems.value.forEach(item => {
      const productId = item.productId || item.maSP
      selectedItems.value.add(productId)
      console.log(`🔄 [CartDropdown] Auto-selected item: ${productId}`, item)
    })
    console.log('🔄 [CartDropdown] Auto-selected all cart items:', selectedItems.value.size)
    console.log('🔄 [CartDropdown] Selected productIds:', Array.from(selectedItems.value))
  }
}

const handleCartHide = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  hideTimeout = setTimeout(() => {
    showCart.value = false
  }, 300)
}

const isAllSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(item => selectedItems.value.has(item.productId))
})

// Methods
const toggleCart = () => {
  if (!showCart.value) {
    // Opening cart - auto-select all items
    handleCartShow()
  } else {
    // Closing cart
    showCart.value = false
  }
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
  
  if (!showCart.value) {
    // Opening cart via hover - auto-select all items
    handleCartShow()
  } else {
    showCart.value = true
  }
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

const checkout = async () => {
  try {
    if (selectedItems.value.size === 0) {
      showNotification('Vui lòng chọn sản phẩm để thanh toán!', 'warning')
      return
    }
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('easymart-user') || 'null')
    if (!user) {
      // Save selected items and redirect path
      const selectedProductIds = Array.from(selectedItems.value)
      localStorage.setItem('easymart-selected-items', JSON.stringify(selectedProductIds))
      localStorage.setItem('easymart-redirect-after-login', '/checkout')
      
      showNotification('Vui lòng đăng nhập để tiến hành thanh toán!', 'warning')
      showCart.value = false
      router.push('/login')
      return
    }

    // Close cart dropdown
    showCart.value = false

    // Ensure we have backend cart data
    console.log('🧩 [CartDropdown] Loading cart data before checkout...')
    await reloadCartFromBackend()

    // Get the actual backend cart items
    const backendCartItems = cart.value
    console.log('🔍 [CartDropdown] Backend cart items:', backendCartItems)
    console.log('🔍 [CartDropdown] Selected items:', Array.from(selectedItems.value))

    if (!backendCartItems || !Array.isArray(backendCartItems) || backendCartItems.length === 0) {
      showNotification('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán!', 'warning')
      return
    }

    // Create selectedCartItemIds array from selected productIds
    const selectedCartItemIds = []
    const selectedProductIds = Array.from(selectedItems.value)
    
    console.log('🔍 [CartDropdown] Backend cart structure:', backendCartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      maSP: item.maSP,
      keys: Object.keys(item)
    })))
    
    selectedProductIds.forEach(productId => {
      const cartItem = backendCartItems.find(item => 
        item.productId === productId || item.maSP === productId
      )
      console.log(`🔍 [CartDropdown] Looking for productId=${productId}, found:`, cartItem)
      
      if (cartItem) {
        // Use same logic as Cart.vue - itemId field
        const cartItemId = cartItem.itemId || cartItem.id || cartItem.maGH || cartItem.cartId
        if (cartItemId) {
          selectedCartItemIds.push(String(cartItemId))
          console.log(`✅ [CartDropdown] Added cart item ID: ${cartItemId}`)
        } else {
          console.warn(`⚠️ [CartDropdown] Cart item found but no ID field:`, Object.keys(cartItem))
        }
      } else {
        console.warn(`⚠️ [CartDropdown] No cart item found for productId: ${productId}`)
      }
    })

    console.log('🔍 [CartDropdown] Selected cart item IDs:', selectedCartItemIds)

    if (selectedCartItemIds.length === 0) {
      console.error('❌ [CartDropdown] No selected cart item IDs found')
      showNotification('Không tìm thấy sản phẩm đã chọn trong giỏ hàng!', 'error')
      return
    }

    console.log('✅ [CartDropdown] Validation passed, proceeding with order creation...')

    // Get customer info using same logic as Cart.vue
    console.log('🔍 [CartDropdown] User object:', user)
    console.log('🔍 [CartDropdown] Getting cart snapshot for maKH...')
    
    const cartSnapshot = await getBackendCartSnapshot()
    console.log('🔍 [CartDropdown] Cart snapshot:', cartSnapshot)
    
    const maKH = cartSnapshot.maKH || user?.maKH || user?.id || user?.maNguoiDung || localStorage.getItem('easymart-user-id')
    console.log('🔍 [CartDropdown] Resolved maKH:', maKH)
    console.log('🔍 [CartDropdown] cartSnapshot.maKH:', cartSnapshot.maKH)
    console.log('🔍 [CartDropdown] user.maKH:', user?.maKH)
    console.log('🔍 [CartDropdown] user.id:', user?.id)
    
    if (!maKH) {
      console.error('❌ [CartDropdown] No customer ID found')
      showNotification('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại!', 'error')
      return
    }

    // Create order payload
    const maNV = user?.maNV || 'NV001' // Always use NV001 for now since backend requires it
    const orderPayload = {
      maKH: maKH,
      maNV: maNV, // Backend yêu cầu maNV không được null
      ghiChu: 'Đặt hàng từ CartDropdown',
      selectedCartItemIds: selectedCartItemIds,
      trangThai: 0 // 0 = Chờ thanh toán
    }

    console.log('🚀 [CartDropdown] Creating order with payload:', orderPayload)
    console.log('🚀 [CartDropdown] Order payload details:')
    console.log('   - maKH:', orderPayload.maKH)
    console.log('   - maNV:', orderPayload.maNV)
    console.log('   - selectedCartItemIds:', orderPayload.selectedCartItemIds)
    console.log('   - selectedCartItemIds length:', orderPayload.selectedCartItemIds.length)

    // Create order from cart
    showNotification('Đang tạo hóa đơn từ giỏ...', 'info')
    console.log('🚀 [CartDropdown] Calling createOrderFromCart with payload:', orderPayload)
    
    const result = await createOrderFromCart(orderPayload)

    console.log('✅ [CartDropdown] createOrderFromCart result:', result)
    console.log('✅ [CartDropdown] Result success:', result?.success)
    console.log('✅ [CartDropdown] Result message:', result?.message)

    if (result?.success) {
      showNotification('Tạo hóa đơn thành công!', 'success')
      
      // Save invoice data for checkout page
      const invoiceData = {
        maHD: result.result?.maHD,
        maKH: result.result?.maKH,
        items: result.result?.items || [],
        tongTien: result.result?.tongTien,
        ngayLap: result.result?.ngayLap,
        trangThai: result.result?.trangThai
      }
      
      localStorage.setItem('easymart-invoice', JSON.stringify(invoiceData))
      localStorage.setItem('easymart-selected-items', JSON.stringify(selectedCartItemIds))
      
      // Reload cart to update UI
      try {
        await reloadCartFromBackend()
        console.log('✅ [CartDropdown] Cart reloaded after order creation')
      } catch (reloadError) {
        console.warn('⚠️ [CartDropdown] Failed to reload cart:', reloadError)
      }
      
      // Navigate to checkout
      console.log('🔄 [CartDropdown] Navigating to checkout in 1 second...')
      setTimeout(() => {
        console.log('🔄 [CartDropdown] Executing router.push("/checkout")')
        router.push('/checkout').then(() => {
          console.log('✅ [CartDropdown] Successfully navigated to /checkout')
        }).catch(err => {
          console.error('❌ [CartDropdown] Navigation failed:', err)
        })
      }, 1000)
      
    } else {
      console.error('❌ [CartDropdown] Order creation failed:', result)
      showNotification(result?.message || 'Không thể tạo hóa đơn', 'error')
    }
    
  } catch (error) {
    console.error('❌ [CartDropdown] Checkout failed:', error)
    console.error('❌ [CartDropdown] Error stack:', error.stack)
    showNotification(error?.message || 'Thanh toán thất bại', 'error')
  }
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