# Hướng dẫn sử dụng Cart API đã cập nhật

## 🎯 Các tính năng mới

### 1. **Xóa trực tiếp trong database**
- ✅ Khi xóa sản phẩm → xóa luôn trong backend (nếu đã đăng nhập)
- ✅ Khi xóa toàn bộ giỏ hàng → xóa luôn trong backend
- ✅ Khi cập nhật số lượng → cập nhật luôn trong backend

### 2. **Cộng dồn số lượng sản phẩm**
- ✅ Khi thêm sản phẩm đã có → backend tự động cộng dồn
- ✅ Frontend reload cart sau khi thêm để có số lượng chính xác

### 3. **Quản lý trạng thái giỏ hàng**
- ✅ `0 = Shopping` (đang mua sắm)
- ✅ `1 = Paid` (đã thanh toán)
- ✅ `2 = Canceled` (đã hủy)

## 🚀 Cách sử dụng trong Components

### Thêm sản phẩm vào giỏ
```vue
<script setup>
import { useCart } from '@/composables/useCart'

const { addToCart } = useCart()

const handleAddToCart = async (productId, quantity = 1, productData = null) => {
  const success = await addToCart(productId, quantity, productData)
  if (success) {
    // Thông báo thành công
    console.log('Đã thêm vào giỏ hàng')
  }
}
</script>
```

### Xóa sản phẩm khỏi giỏ
```vue
<script setup>
const { removeFromCart } = useCart()

const handleRemoveItem = async (productId) => {
  await removeFromCart(productId)
  console.log('Đã xóa khỏi giỏ hàng')
}
</script>
```

### Cập nhật số lượng sản phẩm
```vue
<script setup>
const { updateCartQuantity } = useCart()

const handleUpdateQuantity = async (productId, newQuantity) => {
  await updateCartQuantity(productId, newQuantity)
  console.log('Đã cập nhật số lượng')
}
</script>
```

### Xóa toàn bộ giỏ hàng
```vue
<script setup>
const { clearCart } = useCart()

const handleClearCart = async () => {
  await clearCart()
  console.log('Đã xóa toàn bộ giỏ hàng')
}
</script>
```

### Thanh toán giỏ hàng
```vue
<script setup>
const { checkoutCart } = useCart()

const handleCheckout = async () => {
  try {
    const result = await checkoutCart()
    if (result.success) {
      console.log('✅', result.message)
      // Redirect to success page
      router.push('/payment-success')
    } else {
      console.error('❌', result.error)
    }
  } catch (error) {
    console.error('Lỗi thanh toán:', error.message)
  }
}
</script>
```

### Hủy giỏ hàng
```vue
<script setup>
const { cancelCart } = useCart()

const handleCancelCart = async () => {
  try {
    const result = await cancelCart()
    if (result.success) {
      console.log('✅', result.message)
    } else {
      console.error('❌', result.error)
    }
  } catch (error) {
    console.error('Lỗi hủy giỏ hàng:', error.message)
  }
}
</script>
```

## 🔧 Advanced Usage

### Sử dụng Backend API trực tiếp
```vue
<script setup>
const { 
  addItemToBackendCart,
  updateItemQuantityInBackend,
  removeItemFromBackend,
  clearBackendCart,
  updateCartStatus
} = useCart()

// Thêm trực tiếp vào backend
const addDirectly = async () => {
  const result = await addItemToBackendCart('SP001', 2, 125000)
  if (result) {
    console.log('Đã thêm vào backend:', result)
  }
}

// Cập nhật trạng thái giỏ hàng
const markAsPaid = async () => {
  const success = await updateCartStatus(1) // 1 = Paid
  if (success) {
    console.log('Đã đánh dấu là đã thanh toán')
  }
}
</script>
```

### Debug và Monitoring
```vue
<script setup>
const { 
  testCartAPIConnection,
  getLocalCartSnapshot,
  getBackendCartSnapshot,
  compareLocalAndBackend
} = useCart()

// Test kết nối API
const testAPI = async () => {
  const result = await testCartAPIConnection()
  console.log('API Test Result:', result)
}

// So sánh local vs backend
const debugCart = async () => {
  const comparison = await compareLocalAndBackend()
  console.log('Cart Comparison:', comparison)
}
</script>
```

## 📊 Flow hoạt động mới

### Khi chưa đăng nhập:
1. **Thêm sản phẩm** → Lưu trong localStorage
2. **Xóa sản phẩm** → Xóa khỏi localStorage
3. **Cập nhật số lượng** → Cập nhật trong localStorage

### Khi đã đăng nhập:
1. **Thêm sản phẩm** → Gọi API backend → Reload cart từ backend
2. **Xóa sản phẩm** → Xóa từ backend → Xóa khỏi localStorage
3. **Cập nhật số lượng** → Cập nhật backend → Cập nhật localStorage
4. **Xóa toàn bộ** → Xóa từ backend → Clear localStorage

### Khi login:
1. **Auto sync** → localStorage merge với backend
2. **Reload cart** → Lấy dữ liệu mới nhất từ backend
3. **Sync itemIds** → Cập nhật itemId cho các items local

### Khi logout:
1. **Persist cart** → Sync localStorage lên backend
2. **Clear local** → Xóa localStorage

## ⚠️ Lưu ý quan trọng

### 1. Error Handling
Tất cả functions đều có error handling và sẽ:
- Log chi tiết errors
- Fallback về localStorage nếu backend fail
- Không throw exceptions để không crash UI

### 2. Authentication
- Các operations với backend yêu cầu JWT token
- Nếu token hết hạn, sẽ fallback về localStorage only
- Auto redirect về login nếu unauthorized

### 3. Consistency
- Sau mỗi operation với backend, cart sẽ được reload
- Local cart luôn sync với backend khi có thể
- ItemIds được sync để có thể xóa/cập nhật chính xác

## 🧪 Testing

### Test thêm sản phẩm cộng dồn:
```javascript
// Trong browser console
const cart = useCart()

// Thêm sản phẩm lần 1
await cart.addToCart('SP001', 2)

// Thêm sản phẩm lần 2 (sẽ cộng dồn thành 4)
await cart.addToCart('SP001', 2)

// Kiểm tra kết quả
console.log(await cart.getBackendCartSnapshot())
```

### Test xóa sản phẩm:
```javascript
// Xóa sản phẩm (sẽ xóa luôn trong database)
await cart.removeFromCart('SP001')

// Kiểm tra đã xóa chưa
console.log(await cart.getBackendCartSnapshot())
```

### Test thanh toán:
```javascript
// Thêm sản phẩm
await cart.addToCart('SP001', 1)

// Thanh toán
const result = await cart.checkoutCart()
console.log('Checkout result:', result)

// Kiểm tra cart đã clear chưa
console.log('Local cart:', cart.getLocalCartSnapshot())
```

## 🔍 Troubleshooting

### Cart không sync:
1. Kiểm tra token: `localStorage.getItem('easymart-token')`
2. Test API: `cart.testCartAPIConnection()`
3. So sánh: `cart.compareLocalAndBackend()`

### Items không được cộng dồn:
1. Kiểm tra backend có implement đúng logic cộng dồn
2. Verify API response sau khi add
3. Check console logs cho errors

### Xóa không hoạt động:
1. Kiểm tra itemId có trong cart items
2. Verify backend API endpoints
3. Check authentication token

Với những cập nhật này, cart system bây giờ đã hoạt động hoàn toàn sync với database và hỗ trợ đầy đủ các operations CRUD! 🎉
