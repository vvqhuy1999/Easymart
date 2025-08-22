<template>
  <div class="cart-page">
    <!-- Cart Content -->
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
            <i class="fas fa-shopping-cart"></i> Giỏ hàng
          </li>
        </ol>
      </nav>
      
      <h2 class="mb-4">
        <i class="fas fa-shopping-cart text-primary me-2"></i>
        Giỏ hàng của bạn
      </h2>

      <!-- Cart Items -->
      <div v-if="cart.length > 0" class="row">
        <!-- Items List -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table align-middle">
                  <thead class="table-light">
                    <tr>
                      <th width="50">
                        <div class="form-check">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :checked="isAllSelected"
                            @change="toggleSelectAll"
                            id="selectAll"
                          >
                          <label class="form-check-label" for="selectAll">
                            Tất cả
                          </label>
                        </div>
                      </th>
                      <th>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in cartItems" :key="item.productId">
                      <td>
                        <div class="form-check">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :checked="selectedItems.has(item.productId)"
                            @change="toggleItemSelection(item.productId)"
                            :id="`item-${item.productId}`"
                          >
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <img 
                            :src="item.product?.image" 
                            :alt="item.product?.name"
                            class="cart-item-image me-3"
                            @click="viewProduct(item.productId)"
                          >
                          <div>
                            <h6 class="mb-1 product-name" @click="viewProduct(item.productId)">
                              {{ item.product?.name }}
                            </h6>
                            <small class="text-muted">
                              Danh mục: {{ getCategoryName(item.product?.categoryId) }}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="fw-bold text-danger">
                          {{ formatPrice(item.product?.price || 0) }}
                        </span>
                      </td>
                      <td>
                        <div class="quantity-controls">
                          <button 
                            class="btn btn-outline-secondary btn-sm"
                            @click="updateQuantity(item.productId, item.quantity - 1)"
                            :disabled="item.quantity <= 1"
                          >
                            <i class="fas fa-minus"></i>
                          </button>
                          <span class="quantity-display">{{ item.quantity }}</span>
                          <button 
                            class="btn btn-outline-secondary btn-sm"
                            @click="updateQuantity(item.productId, item.quantity + 1)"
                          >
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td>
                        <span class="fw-bold text-danger fs-6">
                          {{ formatPrice((item.product?.price || 0) * item.quantity) }}
                        </span>
                      </td>
                      <td>
                        <button 
                          class="btn btn-outline-danger btn-sm"
                          @click="confirmRemove(item.productId, item.product?.name)"
                          title="Xóa sản phẩm"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4">
          <div class="card sticky-top" style="top: 100px;">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="fas fa-receipt me-2"></i>
                Tổng kết đơn hàng
              </h5>
            </div>
            <div class="card-body">
              <div class="order-summary">
                <div class="d-flex justify-content-between mb-2">
                  <span>Đã chọn ({{ selectedItemsCount }} sản phẩm):</span>
                  <span>{{ formatPrice(selectedSubtotal) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span :class="selectedShippingFee === 0 ? 'text-success' : ''">
                    {{ selectedShippingFee === 0 ? 'Miễn phí' : formatPrice(selectedShippingFee) }}
                  </span>
                </div>
                <div v-if="selectedShippingFee === 0" class="small text-success mb-2">
                  <i class="fas fa-check-circle me-1"></i>
                  Bạn được miễn phí vận chuyển!
                </div>
                <div v-else-if="selectedSubtotal > 0" class="small text-muted mb-2">
                  <i class="fas fa-info-circle me-1"></i>
                  Mua thêm {{ formatPrice(200000 - selectedSubtotal) }} để được miễn phí ship
                </div>
                <hr>
                <div class="d-flex justify-content-between mb-3">
                  <strong class="fs-5">Tổng cộng:</strong>
                  <strong class="text-danger fs-5">{{ formatPrice(selectedTotal) }}</strong>
                </div>
                <button 
                  class="btn btn-primary w-100 mb-2 py-2" 
                  @click="checkout"
                  :disabled="selectedItems.size === 0"
                >
                  <i class="fas fa-credit-card me-2"></i>
                  Tiến hành thanh toán
                </button>
                <router-link to="/" class="btn btn-outline-secondary w-100">
                  <i class="fas fa-arrow-left me-2"></i>
                  Tiếp tục mua sắm
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="row">
        <div class="col-12">
          <div class="empty-cart text-center py-5">
            <div class="empty-cart-icon mb-4">
              <i class="fas fa-shopping-cart fa-5x text-muted"></i>
            </div>
            <h3 class="text-muted mb-3">Giỏ hàng trống</h3>
            <p class="text-muted mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <router-link to="/" class="btn btn-primary btn-lg">
              <i class="fas fa-shopping-bag me-2"></i>
              Bắt đầu mua sắm
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Cart.vue - Trang giỏ hàng
 * 
 * Chức năng:
 * - Hiển thị danh sách sản phẩm trong giỏ hàng
 * - Cập nhật số lượng sản phẩm
 * - Xóa sản phẩm khỏi giỏ hàng  
 * - Tính tổng tiền và phí vận chuyển
 * - Chuyển đến trang thanh toán (tạo hóa đơn)
 * - Chọn sản phẩm để thanh toán
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'
import { useCart } from '../composables/useCart'
import { useOrders } from '../composables/useOrders'

// Router
const router = useRouter()

// Composable data
const {
  categories,
  formatPrice,
  getProductsByCategory,
  getCategoryById,
  products,
  showNotification
} = useEasyMart()

  const { cart, cartCount, removeFromCart, updateCartQuantity, reloadCartFromBackend, getBackendCartSnapshot } = useCart()
const { createOrderFromCart } = useOrders()

// Local state for selection
const selectedItems = ref(new Set())
const shippingAddress = ref('123 Đường ABC, Quận 1, TP.HCM')

// Computed properties
const cartItems = computed(() => {
  return cart.value.map(cartItem => {
    const product = products.value.find(p => p.id === cartItem.productId)
    return {
      ...cartItem,
      product: product
    }
  }).filter(item => item.product) // Lọc bỏ items không tìm thấy product
})

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)
})

const shippingFee = computed(() => {
  return subtotal.value >= 200000 ? 0 : 30000 // Miễn phí ship từ 200k
})

const total = computed(() => {
  return subtotal.value + shippingFee.value
})

const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

const selectedCartItems = computed(() => {
  return cartItems.value.filter(item => selectedItems.value.has(item.productId))
})

const selectedSubtotal = computed(() => {
  return selectedCartItems.value.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)
})

const selectedShippingFee = computed(() => {
  return selectedSubtotal.value >= 200000 ? 0 : 30000
})

const selectedTotal = computed(() => {
  return selectedSubtotal.value + selectedShippingFee.value
})

const selectedItemsCount = computed(() => {
  return selectedCartItems.value.reduce((total, item) => total + item.quantity, 0)
})

const isAllSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(item => selectedItems.value.has(item.productId))
})

// Methods
const viewProduct = (productId) => {
          router.push({ name: 'ProductDetail', params: { id: productId } })
}

const getCategoryName = (categoryId) => {
  const category = getCategoryById(categoryId)
  return category ? category.name : 'Không xác định'
}

const updateQuantity = (productId, newQuantity) => {
  if (newQuantity <= 0) {
    const item = cartItems.value.find(item => item.productId === productId)
    confirmRemove(productId, item?.product?.name || 'Sản phẩm')
  } else {
    updateCartQuantity(productId, newQuantity)
  }
}

const confirmRemove = (productId, productName) => {
  if (confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
    removeFromCart(productId)
    // Remove from selected items if it was selected
    selectedItems.value.delete(productId)
    showNotification(`Đã xóa ${productName} khỏi giỏ hàng!`, 'info')
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
      router.push('/login')
      return
    }

  // Ensure we have backend cart data
  console.log('🧩 Loading cart data before checkout...')
  await reloadCartFromBackend()

  // Get the actual backend cart items (not computed cartItems)
  const backendCartItems = cart.value
  try {
    console.log('🔍 Backend cart items:', backendCartItems)
    console.log('🔍 Backend cart items type:', typeof backendCartItems)
    console.log('🔍 Backend cart items length:', backendCartItems?.length)
  } catch (error) {
    console.error('❌ Error logging backend cart items:', error)
    showNotification('Lỗi khi xử lý dữ liệu giỏ hàng. Vui lòng thử lại.', 'error')
    return
  }

  console.log('🔍 User object from localStorage:', user)
  
  // Declare variables early to avoid reference errors
  // Get maKH from useCart composable using getBackendCartSnapshot
  const cartSnapshot = await getBackendCartSnapshot()
  const maKH = cartSnapshot.maKH || user?.maKH || user?.id || user?.maNguoiDung || localStorage.getItem('easymart-user-id')
  console.log('🔍 maKH resolved:', maKH)
  console.log('🔍 cartSnapshot.maKH:', cartSnapshot.maKH)
  
  if (!maKH) {
    showNotification('Không thể xác định mã khách hàng. Vui lòng đăng nhập lại.', 'error')
    return
  }
  const maNV = user?.maNV ||'NV001' // Always use NV001 for now since backend requires it
  
  console.log('🔑 User info for checkout:')
  console.log('   - user object:', user)
  console.log('   - maKH resolved:', maKH)
  console.log('   - maNV resolved:', maNV)

  console.log('🔍 selectedItems.value:', selectedItems.value)
  const selectedProductIds = Array.from(selectedItems.value)
  console.log('🎯 Selected product IDs:', selectedProductIds)

  // Find backend items that match selected products
  console.log('🔍 Filtering backend items...')
  console.log('🔍 backendCartItems:', backendCartItems)
  console.log('🔍 selectedProductIds:', selectedProductIds)
  
  const selectedBackendItems = backendCartItems.filter(backendItem => {
    console.log('🔍 Checking backendItem:', backendItem)
    console.log('🔍 backendItem.productId:', backendItem.productId)
    console.log('🔍 selectedProductIds.includes(backendItem.productId):', selectedProductIds.includes(backendItem.productId))
    return selectedProductIds.includes(backendItem.productId)
  })
  console.log('📦 Selected backend items:', selectedBackendItems)
  
  // Debug: Log cấu trúc dữ liệu thực tế từ backend
  try {
    console.log('🔍 Backend cart items structure:')
    backendCartItems.forEach((item, index) => {
      console.log(`   Item ${index}:`, {
        keys: Object.keys(item),
        values: Object.values(item)
      })
    })
    
    console.log('🔍 Selected backend items structure:')
    selectedBackendItems.forEach((item, index) => {
      console.log(`   Selected Item ${index}:`, {
        keys: Object.keys(item),
        values: Object.values(item)
      })
      console.log(`   Selected Item ${index} details:`, {
        productId: item.productId,
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price
      })
      console.log(`   Selected Item ${index} original data:`, item.originalData)
    })
  } catch (error) {
    console.error('❌ Error logging cart structure:', error)
    showNotification('Lỗi khi xử lý cấu trúc giỏ hàng. Vui lòng thử lại.', 'error')
    return
  }

  // Kiểm tra ID giỏ hàng - sử dụng itemId từ frontend (đã được transform)
  const getCartItemId = (item) => {
    // itemId từ frontend đã được transform từ backend
    return item.itemId
  }
  
  const missingIds = selectedBackendItems.filter(ci => !getCartItemId(ci))
  if (missingIds.length > 0) {
    console.warn('⚠️ Some selected items are missing cart item ID. Items:', missingIds.map(i => i.productId))
    console.log('🔍 Available fields for missing items:')
    missingIds.forEach(item => {
      console.log(`   Product ${item.productId}:`, Object.keys(item))
    })
    showNotification('Không thể tạo hóa đơn: một số sản phẩm chưa có ID giỏ hàng. Vui lòng làm mới giỏ hàng và thử lại.', 'error')
    return
  }

  // Build selectedCartItemIds từ ID giỏ hàng (theo flow chuẩn)
  const selectedCartItemIds = selectedBackendItems.map(ci => String(getCartItemId(ci)))
  console.log('🆔 Selected cart item IDs:', selectedCartItemIds)

  // Calculate totals from selected items
  const orderPayload = {
    maKH,
    maNV: maNV || 'NV001', // Backend yêu cầu maNV không được null
    selectedCartItemIds,
    trangThai: 0 // 0 = Chờ thanh toán (có thể cần thiết để tạo HoaDon)
  }

  // Log payload for verification
  console.log('🧾 Building invoice payload from cart:')
  console.log('   - maKH:', orderPayload.maKH)
  console.log('   - maNV:', orderPayload.maNV)
  console.log('   - selectedCartItemIds:', orderPayload.selectedCartItemIds)
  console.log('   - trangThai:', orderPayload.trangThai)

  try {
    showNotification('Đang tạo hóa đơn từ giỏ...', 'info')
    console.log('🚀 Calling createOrderFromCart with payload:', orderPayload)
    const result = await createOrderFromCart(orderPayload)

    // Summarize result
    console.log('✅ createOrderFromCart result:', result)

    if (result?.success) {
      showNotification('Tạo hóa đơn thành công!', 'success')
      
      // Lưu thông tin hóa đơn để chuyển sang Checkout.vue
      const invoiceData = {
        maHD: result.result?.maHD,
        maKH: result.result?.maKH,
        items: result.result?.items || [],
        tongTien: result.result?.tongTien,
        ngayLap: result.result?.ngayLap,
        trangThai: result.result?.trangThai
      }
      
      // Lưu vào localStorage để Checkout.vue có thể sử dụng
      localStorage.setItem('easymart-invoice', JSON.stringify(invoiceData))
      
      // Lưu danh sách item đã chọn để Checkout.vue hiển thị
      localStorage.setItem('easymart-selected-items', JSON.stringify(selectedCartItemIds))
      
      // 🧹 Clear cart items sau khi tạo hóa đơn thành công
      console.log('🗑️ Items đã được chuyển sang hóa đơn, clearing cart...')
      
      try {
        // Backend đã xử lý chuyển items từ giỏ hàng sang hóa đơn
        // Bây giờ reload giỏ hàng để cập nhật UI
        await reloadCartFromBackend()
        console.log('✅ Cart reloaded after order creation')
      } catch (reloadError) {
        console.warn('⚠️ Failed to reload cart after order creation:', reloadError)
      }
      
      setTimeout(() => {
        // Chuyển đến trang thanh toán
        router.push('/checkout')
      }, 1000)
    } else {
      showNotification(result?.message || 'Không thể tạo hóa đơn', 'error')
    }
  } catch (err) {
    console.error('❌ Checkout failed:', err)
    showNotification(err?.message || 'Thanh toán thất bại', 'error')
  }
  } catch (error) {
    console.error('❌ Checkout function error:', error)
    showNotification('Lỗi không mong muốn trong quá trình thanh toán. Vui lòng thử lại.', 'error')
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
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cart-item-image:hover {
  transform: scale(1.05);
}

.product-name {
  cursor: pointer;
  transition: color 0.2s ease;
}

.product-name:hover {
  color: #0d6efd !important;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls button {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.quantity-display {
  font-weight: bold;
  min-width: 30px;
  text-align: center;
  font-size: 1.1rem;
}

.empty-cart {
  padding: 4rem 2rem;
}

.empty-cart-icon {
  opacity: 0.3;
}

.order-summary {
  font-size: 0.95rem;
}

.breadcrumb-item a:hover {
  color: #0d6efd !important;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.9rem;
  }
  
  .cart-item-image {
    width: 60px;
    height: 60px;
  }
  
  .quantity-controls {
    flex-direction: column;
    gap: 5px;
  }
  
  .quantity-controls button {
    width: 30px;
    height: 30px;
  }
}
</style>