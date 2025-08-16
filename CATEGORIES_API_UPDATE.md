# 🔄 Cập nhật Categories & Products API - EasyMart

## 📋 Tổng quan

Đã cập nhật hệ thống categories và products để sử dụng API backend thay vì dữ liệu hardcode. Hệ thống sẽ tự động lấy:

- **Danh mục sản phẩm** từ API `http://localhost:8080/api/loaisanpham`
- **Sản phẩm theo danh mục** từ API `http://localhost:8080/api/sanpham/category/{categoryId}/active`

## 🚀 Các thay đổi đã thực hiện

### 1. Tạo CategoryService (`src/utils/categoryService.js`)
- **`getAllCategories()`**: Lấy tất cả danh mục từ API
- **`getCategoryById(id)`**: Lấy danh mục theo ID
- **Mapping tự động**: Chuyển đổi từ API format sang frontend format
- **Fallback**: Sử dụng default categories nếu API không khả dụng

### 2. Tích hợp Products API trực tiếp trong useEasyMart ⭐ ĐƠN GIẢN HÓA
- **`loadProducts()`**: Lấy tất cả sản phẩm từ API `/api/sanpham`
- **`getProductsByCategory(categoryId)`**: Lấy sản phẩm theo danh mục từ API `/api/sanpham/category/{categoryId}/active`
- **Mapping tự động**: Chuyển đổi từ API format sang frontend format
- **Không có fallback data** - hoàn toàn phụ thuộc vào API
- **Không cần ProductService riêng biệt** - tích hợp trực tiếp trong composable

### 3. Cập nhật API Configuration (`src/config/api.js`)
- Thêm endpoints cho categories và products
- Cấu hình base URL và endpoints
- **Giữ nguyên cấu trúc cũ** để tương thích với các file hiện tại

### 4. Cập nhật useEasyMart Composable
- Thêm `isLoadingCategories` state
- Tự động load categories và products từ API khi khởi tạo
- Fallback về default data nếu API fail
- **`getProductsByCategory()`** giờ đây là async function
- **API calls trực tiếp** thay vì qua service riêng biệt

### 5. Cập nhật Components
- **Home.vue**: Loading state cho categories và products, async loading
- **Categories.vue**: Loading state cho categories grid và popular categories
- **CategorySection.vue**: Loading state cho products, empty state, retry button

## 🔧 Cách sử dụng

### Khởi chạy ứng dụng
```bash
npm run dev
```

### Kiểm tra API
```bash
# Test API categories
curl http://localhost:8080/api/loaisanpham

# Test API products by category
curl http://localhost:8080/api/sanpham/category/LSP001/active

# Test individual product
curl http://localhost:8080/api/sanpham/{productId}
```

## 📊 API Response Format

### Categories API
```json
// Input (API Response)
{
  "maLoaiSP": "LSP001",
  "tenLoai": "Tươi sống",
  "moTa": "Các loại rau củ quả tươi",
  "loaiCha": null,
  "thuTuHienThi": 1,
  "isDeleted": false
}

// Output (Frontend Format)
{
  "id": "LSP001",
  "name": "Tươi sống",
  "description": "Các loại rau củ quả tươi",
  "parentId": null,
  "displayOrder": 1,
  "isDeleted": false,
  "icon": "fas fa-leaf",
  "color": "success"
}
```

### Products API
```json
// Input (API Response)
{
  "maSanPham": "SP001",
  "tenSanPham": "Cá basa fillet tươi 500g",
  "giaBan": 52000,
  "giaGoc": null,
  "maLoaiSP": "LSP001",
  "tenLoai": "Tươi sống",
  "hinhAnh": "https://example.com/image.jpg",
  "moTa": "Cá basa tươi ngon",
  "isFlashSale": false,
  "isActive": true,
  "soLuongTon": 50,
  "donViTinh": "gói"
}

// Output (Frontend Format)
{
  "id": "SP001",
  "name": "Cá basa fillet tươi 500g",
  "price": 52000,
  "originalPrice": null,
  "categoryId": "LSP001",
  "categoryName": "Tươi sống",
  "image": "https://example.com/image.jpg",
  "description": "Cá basa tươi ngon",
  "isFlashSale": false,
  "isActive": true,
  "stock": 50,
  "unit": "gói"
}
```

## 🎨 Icon và Color Mapping - Tự động

Hệ thống sẽ **tự động map icon và color** dựa trên tên danh mục từ API:

### 🔍 Cách hoạt động:
1. **Phân tích tên danh mục** từ API response
2. **Tìm kiếm từ khóa** trong tên để xác định loại
3. **Map icon và color** phù hợp nhất
4. **Fallback** về icon/color mặc định nếu không tìm thấy

### 📋 Bảng mapping chính:

| Loại danh mục | Từ khóa | Icon | Color | Ví dụ |
|---------------|---------|------|-------|--------|
| **Tươi sống** | tươi sống, rau củ, thịt, cá, trái cây | `fas fa-leaf` | `success` | "Tươi sống", "Rau củ quả" |
| **Đông lạnh** | đông lạnh, kem | `fas fa-snowflake` | `info` | "Đông lạnh", "Kem các loại" |
| **Đồ đóng hộp** | đóng hộp, hộp, lon | `fas fa-box` | `warning` | "Đồ đóng hộp", "Thực phẩm hộp" |
| **Đồ uống** | đồ uống, nước, sữa, trà, cà phê | `fas fa-tint` | `primary` | "Đồ uống", "Nước giải khát" |
| **Sữa & em bé** | sữa, em bé, trẻ em | `fas fa-baby` | `info` | "Sữa & em bé", "Đồ trẻ em" |
| **Gia vị** | gia vị, dầu ăn, nước mắm, muối | `fas fa-pepper-hot` | `danger` | "Gia vị", "Dầu ăn" |
| **Hóa phẩm** | hóa phẩm, tẩy rửa, giặt, vệ sinh | `fas fa-soap` | `success` | "Hóa phẩm", "Tẩy rửa" |

### 🎯 Fallback logic:
- **Từ khóa chung**: "ăn", "thực phẩm" → `fas fa-utensils` + `success`
- **Từ khóa chung**: "đồ" → `fas fa-shopping-basket` + `primary`
- **Mặc định**: `fas fa-tags` + `primary`

## 🚨 Xử lý lỗi

### Fallback Strategy
1. **API Available**: Sử dụng dữ liệu từ API
2. **API Unavailable**: 
   - **Categories**: Sử dụng default categories hardcode
   - **Products**: Không có fallback, trả về array rỗng
3. **Network Error**: Log error và xử lý theo từng loại data

### Error Handling
```javascript
try {
  const categories = await CategoryService.getAllCategories()
  const products = await ProductService.getProductsByCategory(categoryId)
  // Use API data
} catch (error) {
  console.error('API failed, using defaults:', error)
  // Use default data
}
```

## 🔄 Cập nhật tương lai

### Thêm tính năng
- [ ] Cache categories và products trong localStorage
- [ ] Refresh data theo interval
- [ ] Admin panel để quản lý categories và products
- [ ] Category hierarchy (parent-child)
- [ ] Product search và filter nâng cao

### Tối ưu hóa
- [ ] Lazy loading cho categories và products
- [ ] Pagination cho data lớn
- [ ] Image optimization và lazy loading
- [ ] Service worker cho offline support

## 📝 Ghi chú

- **Categories và Products** sẽ tự động load khi ứng dụng khởi động
- **Loading state** được hiển thị trong tất cả components liên quan
- **Fallback strategy khác nhau**:
  - **Categories**: Có fallback data để giữ UI/UX
  - **Products**: Không có fallback, hoàn toàn phụ thuộc API
- **Icon & Color tự động**: Categories từ API sẽ được tự động map icon và color dựa trên tên
- **Async loading** cho products theo từng category để tối ưu performance
- **Retry mechanism** cho việc load products khi API fail
- **Đơn giản hóa**: Không cần ProductService riêng biệt, API calls trực tiếp trong useEasyMart

## 🧪 Testing

Để test API:

```bash
# Test categories
curl http://localhost:8080/api/loaisanpham

# Test products by category
curl http://localhost:8080/api/sanpham/category/LSP001/active

# Test individual product
curl http://localhost:8080/api/sanpham/SP001
```

## 📞 Hỗ trợ

Nếu gặp vấn đề với API:

1. **Kiểm tra backend** có đang chạy không
2. **Kiểm tra endpoints** có hoạt động không
3. **Kiểm tra console logs** để debug
4. **Fallback data** sẽ tự động được sử dụng
5. **Retry buttons** có sẵn trong UI để load lại data

## 🔧 Troubleshooting

### Lỗi thường gặp:
- **Import errors**: Đã sửa tất cả import paths
- **API compatibility**: Giữ nguyên cấu trúc API cũ
- **Async handling**: Products loading giờ đây là async
- **Fallback data**: Luôn có sẵn default data khi API fail
