# 🚀 Migration Guide: Từ DonHang sang HoaDon

## 📋 Tổng quan thay đổi

Backend đã được cập nhật để thay thế hoàn toàn hệ thống `DonHang/ChiTietDonHang` bằng `HoaDon/ChiTietHoaDon`. Frontend cũng đã được cập nhật tương ứng.

## 🔄 Thay đổi chính

### 1. API Endpoints

| Cũ (DonHang) | Mới (HoaDon) | Method | Mô tả |
|---------------|---------------|---------|-------|
| `/api/donhang/from-cart` | `/api/hoadon/from-cart` | POST | Tạo hóa đơn từ giỏ hàng |
| `/api/donhang/by-khachhang/{maKH}` | `/api/hoadon/by-khachhang/{maKH}` | GET | Lấy danh sách hóa đơn theo khách hàng |
| `/api/donhang/{orderId}` | `/api/hoadon/{maHD}` | GET | Lấy thông tin hóa đơn theo ID |
| `/api/donhang/{orderId}/status` | `/api/hoadon/{maHD}/trangthai` | PATCH | Cập nhật trạng thái hóa đơn |

### 2. Cấu trúc Response

#### Cũ (DonHang):
```json
{
  "success": true,
  "order": {
    "maDonHang": "DH001",
    "maKH": "KH001",
    "trangThai": "0",
    "chiTietDonHang": [...]
  }
}
```

#### Mới (HoaDon):
```json
{
  "success": true,
  "hoadon": {
    "maHD": "HD001",
    "maKH": "KH001",
    "trangThai": "0",
    "chiTietHoaDon": [...]
  }
}
```

### 3. Trạng thái hóa đơn

| Mã | Trạng thái | Mô tả |
|----|-------------|-------|
| 0 | Chờ thanh toán | Hóa đơn mới tạo, chưa thanh toán |
| 1 | Đã thanh toán | Hóa đơn đã được thanh toán |
| 3 | Hủy | Hóa đơn bị hủy |
| 4 | Hoàn trả | Hóa đơn được hoàn trả |

## 📁 Files đã cập nhật

### 1. `src/config/api.js`
- Thay đổi `ORDERS` thành `HOADON`
- Cập nhật tất cả endpoints

### 2. `src/utils/orderService.js`
- Cập nhật tất cả API calls
- Thay đổi response parsing từ `result.order` thành `result.hoadon`
- Cập nhật error messages

### 3. `src/composables/useOrders.js`
- Cập nhật logic xử lý response
- Thay đổi field mapping từ `maDonHang` thành `maHD`
- Cập nhật từ `chiTietDonHang` thành `chiTietHoaDon`

### 4. `src/views/Cart.vue`
- Cập nhật UI messages
- Thay đổi từ "đơn hàng" thành "hóa đơn"

## 🧪 Testing

### Test script
```bash
node test-hoadon-api.js
```

### Test endpoints
1. **POST /api/hoadon/from-cart** - Tạo hóa đơn từ giỏ hàng
2. **GET /api/hoadon/by-khachhang/{maKH}** - Lấy danh sách hóa đơn
3. **GET /api/hoadon/{maHD}** - Lấy thông tin hóa đơn
4. **PATCH /api/hoadon/{maHD}/trangthai** - Cập nhật trạng thái

## ⚠️ Lưu ý quan trọng

### 1. Field Mapping
- `maDonHang` → `maHD`
- `chiTietDonHang` → `chiTietHoaDon`
- `maChiTiet` → `maChiTiet` (giữ nguyên)
- `maSP` → `maSP` (giữ nguyên)

### 2. Response Structure
- Luôn kiểm tra `result.hoadon` thay vì `result.order`
- Sử dụng `result.hoadon.maHD` thay vì `result.order.maDonHang`

### 3. Cart Integration
- Khi tạo hóa đơn với trạng thái "Chờ thanh toán" (0), giỏ hàng sẽ tự động được xóa
- Điều này thay thế logic cũ của DonHang

## 🔍 Debugging

### Console Logs
Tất cả API calls đều có console logs chi tiết:
- Request payload
- Response data
- Error handling
- Field mapping

### Common Issues
1. **Missing hoadon object**: Kiểm tra `result.hoadon` thay vì `result.order`
2. **Field not found**: Sử dụng `maHD` thay vì `maDonHang`
3. **API 404**: Đảm bảo backend đã được cập nhật với endpoints mới

## 📚 References

- [Backend Migration Notes](./README.md)
- [API Documentation](./API_DOCS.md)
- [Test Script](./test-hoadon-api.js)

## 🎯 Next Steps

1. ✅ Frontend migration completed
2. 🔄 Test với backend mới
3. 📝 Update documentation
4. 🚀 Deploy to production

---

**Lưu ý**: Đảm bảo backend đã được cập nhật trước khi test frontend mới!
