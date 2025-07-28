# Hướng dẫn cấu hình Google OAuth cho EasyMart

## Bước 1: Tạo Google OAuth Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API trong Library
4. Đi đến "Credentials" > "Create Credentials" > "OAuth client ID"
5. Chọn "Web application"
6. Thêm authorized JavaScript origins:
   - `http://localhost:5173` (cho development)
   - `https://yourdomain.com` (cho production)
7. Thêm authorized redirect URIs:
   - `http://localhost:5173` (cho development)
   - `https://yourdomain.com` (cho production)

## Bước 2: Cấu hình Client ID

Mở file `src/main.js` và thay thế Client ID:

```javascript
app.use(vue3GoogleLogin, {
  clientId: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE'
})
```

## Bước 3: Kiểm tra tính năng

1. Chạy `npm run dev`
2. Truy cập trang đăng nhập
3. Click nút "Đăng nhập với Google"
4. Đăng nhập với tài khoản Google của bạn

## Lưu ý bảo mật

- Không commit Client ID thật vào Git
- Sử dụng environment variables cho production
- Kiểm tra domain authorization trước khi deploy

## Troubleshooting

### Lỗi "popup_closed_by_user"
- Người dùng đã đóng popup trước khi hoàn thành đăng nhập
- Không cần xử lý đặc biệt

### Lỗi "invalid_client"
- Client ID không đúng hoặc domain chưa được authorize
- Kiểm tra lại cấu hình trong Google Cloud Console

### Lỗi CORS
- Thêm domain vào authorized origins trong Google Cloud Console