# 📦 Hướng dẫn tích hợp tính năng tồn kho

## 🎯 Tổng quan

Tính năng tồn kho đã được tích hợp vào ứng dụng EasyMart để hiển thị số lượng tồn của sản phẩm trong thời gian thực.

## 🚀 Tính năng đã tích hợp

### 1. Hiển thị số lượng tồn trên ProductCard
- Số lượng tồn được hiển thị bên cạnh số lượng đánh giá
- Màu sắc thay đổi theo trạng thái tồn kho:
  - 🟢 Xanh: Còn hàng (>10)
  - 🟡 Vàng: Sắp hết hàng (≤10)
  - 🔴 Đỏ: Hết hàng (=0)

### 2. Hiển thị chi tiết tồn kho trên ProductDetail
- Trạng thái tồn kho với icon và màu sắc
- Số lượng tồn cụ thể
- Disable các nút thêm vào giỏ hàng khi hết hàng
- Giới hạn số lượng mua theo tồn kho

### 3. API Endpoints được sử dụng
- `GET /api/tonkhochitiet` - Lấy tất cả tồn kho chi tiết
- `GET /api/tonkhochitiet/{id}` - Lấy tồn kho theo ID
- `GET /api/tonkhochitiet/product/{productId}` - Lấy tồn kho theo sản phẩm
- `GET /api/tonkhochitiet/warehouse/{warehouseId}` - Lấy tồn kho theo kho

## 🏗️ Kiến trúc hệ thống

### 1. InventoryService (`src/utils/inventoryService.js`)
- Xử lý các API calls đến backend
- Tính toán tổng số lượng tồn từ nhiều kho
- Xử lý lỗi và fallback

### 2. useInventory Composable (`src/composables/useInventory.js`)
- Quản lý state tồn kho
- Cache dữ liệu để tối ưu performance
- Cung cấp các computed properties cho UI

### 3. Components được cập nhật
- `ProductCard.vue` - Hiển thị số lượng tồn
- `ProductDetail.vue` - Hiển thị chi tiết tồn kho

## 📱 Cách sử dụng

### 1. Trong ProductCard
```vue
<template>
  <small v-if="stockQuantity !== null" :class="stockStatusClass" class="ms-2">
    ({{ stockQuantity }})
  </small>
</template>

<script setup>
import { useInventory } from '../composables/useInventory.js'

const { getProductStock, getStockStatusClass } = useInventory()
const stockQuantity = ref(null)
const stockStatusClass = ref('text-muted')

// Load stock quantity khi component mount
onMounted(async () => {
  if (props.product?.maSP) {
    const stock = await getProductStock(props.product.maSP)
    stockQuantity.value = stock
    stockStatusClass.value = getStockStatusClass.value(props.product.maSP)
  }
})
</script>
```

### 2. Trong ProductDetail
```vue
<template>
  <div class="stock-info">
    <i :class="[stockStatusIcon, stockStatusIconClass]"></i>
    <strong :class="stockStatusClass">{{ stockStatusText }}</strong>
    <div class="small text-muted">
      <span v-if="stockQuantity !== null">Còn {{ stockQuantity }} sản phẩm</span>
      <span v-else>Đang kiểm tra...</span>
    </div>
  </div>
</template>

<script setup>
import { useInventory } from '../composables/useInventory.js'

const { getProductStock } = useInventory()

const loadStockInfo = async () => {
  if (!currentProduct.value?.maSP) return
  
  const stock = await getProductStock(currentProduct.value.maSP)
  stockQuantity.value = stock
  
  // Cập nhật trạng thái tồn kho
  if (stock > 0) {
    stockStatusText.value = 'Còn hàng'
    stockStatusClass.value = 'text-success'
    stockStatusIcon.value = 'fas fa-check-circle'
    stockStatusIconClass.value = 'text-success'
  } else {
    stockStatusText.value = 'Hết hàng'
    stockStatusClass.value = 'text-danger'
    stockStatusIcon.value = 'fas fa-times-circle'
    stockStatusIconClass.value = 'text-danger'
  }
}
</script>
```

## 🧪 Testing

### 1. Test API endpoints
```bash
# Test lấy tất cả tồn kho
curl http://localhost:8080/api/tonkhochitiet

# Test lấy tồn kho theo ID
curl http://localhost:8080/api/tonkhochitiet/1

# Test lấy tồn kho theo sản phẩm
curl http://localhost:8080/api/tonkhochitiet/product/SP001
```

### 2. Test script
```bash
node test-inventory-simple.js
```

## 🔧 Cấu hình

### 1. API Base URL
Cập nhật trong `src/config/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  // ...
}
```

### 2. Environment Variables
Tạo file `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🚨 Xử lý lỗi

### 1. API không khả dụng
- Fallback về số lượng tồn mặc định (0)
- Hiển thị trạng thái "Không xác định"
- Log lỗi để debug

### 2. Sản phẩm không có mã
- Kiểm tra `product.maSP` trước khi gọi API
- Fallback về `product.id` nếu cần

## 📈 Performance

### 1. Caching
- Dữ liệu tồn kho được cache trong composable
- Chỉ gọi API khi cần thiết
- Clear cache khi cần refresh

### 2. Lazy Loading
- Load thông tin tồn kho khi component mount
- Không block UI rendering

## 🔮 Tính năng tương lai

### 1. Real-time updates
- WebSocket để cập nhật tồn kho real-time
- Push notification khi hết hàng

### 2. Advanced inventory management
- Quản lý tồn kho theo từng kho
- Cảnh báo khi tồn kho thấp
- Lịch sử thay đổi tồn kho

## 📝 Ghi chú

- Đảm bảo backend API trả về đúng format dữ liệu
- Kiểm tra CORS nếu frontend và backend khác domain
- Test kỹ các trường hợp lỗi và edge cases
- Monitor performance khi có nhiều sản phẩm

## 🆘 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser
2. Network tab trong DevTools
3. Backend API logs
4. CORS configuration
5. API endpoint availability
