// API Configuration - Updated và cleaned up theo backend mới
export const API_CONFIG = {
  // Base URL - adjust this to match your backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // 🔐 AUTHENTICATION APIs (AuthenticationController)
  AUTH: {
    // Login/Logout chính
    LOGIN: '/api/auth/log-in',                    // POST - Đăng nhập thường (email/password)
    LOGOUT: '/api/auth/log-out',                  // POST - Đăng xuất (hỗ trợ tất cả loại tài khoản)
    
    // Token Management
    STATUS: '/api/auth/status',                   // GET - Kiểm tra trạng thái đăng nhập
    VALIDATE_TOKEN: '/api/auth/validate-token',   // POST - Validate JWT token

  },
  
  // 🔑 PASSWORD RESET APIs (ForgotPasswordController)
  PASSWORD_RESET: {
    SEND_OTP: '/api/forgot-password/send-otp',           // POST - Gửi mã OTP
    VERIFY_OTP: '/api/forgot-password/verify-otp',       // POST - Xác thực OTP
    RESET_PASSWORD: '/api/forgot-password/reset-password' // POST - Đặt lại mật khẩu
  },
  
  // 👤 USER MANAGEMENT APIs (NguoiDungRestController) - ⭐ MỚI
  USER: {
    // Registration & User Management
    REGISTER: '/api/khachhang/register',          // POST - 🎯 Đăng ký khách hàng với đầy đủ thông tin
    GET_BY_ID: '/api/nguoidung/{maNguoiDung}',    // GET - Lấy người dùng theo ID
    GET_BY_EMAIL: '/api/nguoidung/email/{email}', // GET - Lấy người dùng theo email
    UPDATE: '/api/nguoidung/{maNguoiDung}',       // PUT - Cập nhật thông tin người dùng
    DELETE: '/api/nguoidung/{maNguoiDung}',       // DELETE - Xóa người dùng (soft delete)
    
    // Validation APIs
    CHECK_EMAIL: '/api/nguoidung/check-email/{email}',     // GET - Kiểm tra email tồn tại
    CHECK_ID: '/api/nguoidung/check-id/{maNguoiDung}'      // GET - Kiểm tra mã người dùng tồn tại
  },
  
  // 🌐 OAUTH2 APIs (OAuth2Controller) - Updated
  OAUTH2: {
    // JWT Token Management  
    GET_JWT_TOKEN: '/api/oauth2/get-jwt-token',   // GET - ⭐ Lấy JWT token từ Google OAuth2
    
    // User Information
    USER_INFO: '/api/oauth2/user-info',           // GET - Lấy thông tin OAuth2 user
    SUCCESS: '/api/oauth2/success',               // GET - OAuth2 success handler
    FAILURE: '/api/oauth2/failure',               // GET - OAuth2 failure handler
    
    // Validation & Checking (OAuth2)
    CHECK_EMAIL: '/api/oauth2/check-email',       // GET - Kiểm tra email trùng lặp (OAuth2)
    CHECK_SUB: '/api/oauth2/check-sub',           // GET - Kiểm tra OAuth2 ID
    
    // Configuration & Testing
    TEST_CONFIG: '/api/oauth2/test-config',       // GET - Kiểm tra cấu hình OAuth2
    
    // Deprecated (sẽ chuyển hướng)
    LOGOUT_DEPRECATED: '/api/oauth2/logout'       // POST - ⚠️ DEPRECATED, dùng AUTH.LOGOUT
  },
  
  // 🚀 OAuth2 Authorization URLs (Spring Security endpoints)
  AUTHORIZATION: {
    GOOGLE: '/oauth2/authorization/google',       // Đăng nhập Google
    FACEBOOK: '/oauth2/authorization/facebook'    // Đăng nhập Facebook
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function for OAuth2 authorization URLs
export const getAuthUrl = (provider) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.AUTHORIZATION[provider.toUpperCase()]}`
}

// Helper function for parameterized URLs
export const getApiUrlWithParams = (endpoint, params) => {
  let url = endpoint
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(value))
  }
  return `${API_CONFIG.BASE_URL}${url}`
}

// User roles constants
export const USER_ROLES = {
  ADMIN: 0,           // Quản trị
  MANAGER: 1,         // Quản lý  
  STAFF: 2,           // Nhân viên
  CUSTOMER: 3         // Khách hàng (default)
}

// New API Configuration structure
export const API_BASE_URL = 'http://localhost:8080'

export const API_ENDPOINTS = {
  // OAuth2 endpoints
  OAUTH2: {
    TEST_CONFIG: '/api/oauth2/test-config',
    USER_INFO: '/api/oauth2/user-info',
    ANALYZE: '/api/oauth2/analyze',
    CHECK_EMAIL: '/api/oauth2/check-email',
    CHECK_SUB: '/api/oauth2/check-sub',
    GET_TOKEN: '/api/oauth2/get-token',
    GOOGLE_CALLBACK: '/api/oauth2/callback/google',
    GOOGLE_REGISTER: '/api/oauth2/register/google'
  },
  
  // Product categories
  CATEGORIES: {
    LIST: '/api/loaisanpham',
    BY_ID: (id) => `/api/loaisanpham/${id}`
  },
  
  // Products
  PRODUCTS: {
    LIST: '/api/sanpham',
    BY_ID: (id) => `/api/sanpham/${id}`,
    BY_CATEGORY: (categoryId) => `/api/sanpham/category/${categoryId}`,
    BY_CATEGORY_ACTIVE: (categoryId) => `/api/sanpham/category/${categoryId}/active`,
    // New: products with inventory included (no auth required)
    WITH_STOCK_LIST: '/api/sanpham/with-tonkho',
    BY_ID_WITH_STOCK: (id) => `/api/sanpham/${id}/with-tonkho`
  },
  
  // Cart (GioHang) - Updated API endpoints theo hướng dẫn mới
  CART: {
    // GET giỏ theo khách hàng (danh sách item)
    BY_CUSTOMER: (maKH) => `/api/giohang/by-khachhang/${maKH}`,
    // GET giỏ + tổng tiền
    BY_CUSTOMER_WITH_ITEMS: (maKH) => `/api/giohang/by-khachhang/${maKH}/with-items`,
    // Cập nhật trạng thái giỏ (Shopping -> Paid/Canceled)
    UPDATE_STATUS: (maKH) => `/api/giohang/by-khachhang/${maKH}/status`,
    // Xóa toàn bộ item trong giỏ (đang Shopping)
    CLEAR_ITEMS: (maKH) => `/api/giohang/by-khachhang/${maKH}/items`,
    // Đồng bộ giỏ từ localStorage sau khi login
    SYNC: '/api/giohang/sync',
    // Lấy thông tin user hiện tại (để suy ra maKH)
    CURRENT_USER: '/api/giohang/current-user'
  },
  
  // Cart Items - Updated API endpoints theo hướng dẫn mới
  CART_ITEMS: {
    // Thêm/Cộng dồn item vào giỏ
    ADD: '/api/giohang/items',
    // Cập nhật số lượng item
    UPDATE_QTY: (itemId) => `/api/giohang/items/${itemId}/quantity`,
    // Xóa 1 item
    REMOVE: (itemId) => `/api/giohang/items/${itemId}`
  },

  // HoaDon (Hóa đơn) - API endpoints cho thanh toán (thay thế DonHang)
  HOADON: {
    // 📋 APIs cơ bản (CRUD operations)
    LIST: '/api/hoadon',
    BY_ID: (maHD) => `/api/hoadon/${maHD}`,
    CREATE: '/api/hoadon',
    UPDATE: (maHD) => `/api/hoadon/${maHD}`,
    DELETE: (maHD) => `/api/hoadon/${maHD}`,
    
    // 🛒 APIs từ giỏ hàng (checkout flow)
    CREATE_FROM_CART: '/api/hoadon/from-cart',
    BY_CUSTOMER: (maKH) => `/api/hoadon/by-khachhang/${maKH}`,
    UPDATE_STATUS: (maHD) => `/api/hoadon/${maHD}/trangthai`,
    
    // 🆕 APIs chi tiết đầy đủ (full details) - RECOMMENDED
    BY_ID_FULL: (maHD) => `/api/hoadon/${maHD}/full-details`,
    BY_CUSTOMER_FULL: (maKH) => `/api/hoadon/by-khachhang/${maKH}/full-details`,
    
    // 📊 APIs đếm (counting)
    COUNT_BY_STATUS: (status) => `/api/hoadon/count/trangthai/${status}`,
    COUNT_BY_CUSTOMER: (maKH) => `/api/hoadon/count/khachhang/${maKH}`,
    
    // 🔍 APIs tìm kiếm và lọc (filtering & searching)
    BY_STATUS: (status) => `/api/hoadon/status/${status}`,
    BY_CUSTOMER_AND_STATUS: (maKH, status) => `/api/hoadon/by-khachhang/${maKH}/status/${status}`,
    BY_DATE_RANGE: '/api/hoadon/date-range', // ?fromDate=2024-01-01&toDate=2024-12-31
    BY_CUSTOMER_AND_DATE: (maKH) => `/api/hoadon/by-khachhang/${maKH}/date-range`,
    SEARCH: '/api/hoadon/search', // ?query=keyword&page=1&size=10
    
    // ❌ APIs hủy đơn hàng (cancellation)
    CANCEL: (maHD) => `/api/hoadon/${maHD}/cancel`, // PATCH với ?lyDoHuy=...
    
    // 📈 APIs thống kê (statistics)
    STATISTICS: (maKH) => `/api/hoadon/by-khachhang/${maKH}/statistics`,
    COUNT_BY_STATUS_CUSTOMER: (maKH) => `/api/hoadon/by-khachhang/${maKH}/count-by-status`
  },

  // Chi tiết hóa đơn
  CHITIETHOADON: {
    // 🆕 API mới - Lấy chi tiết theo mã hóa đơn (RECOMMENDED)
    BY_HOADON: (maHD) => `/api/chitiethoadon/hoadon/${maHD}`,
    // Cập nhật chi tiết hóa đơn
    UPDATE: (maCTHD) => `/api/chitiethoadon/${maCTHD}`,
    // API cũ (deprecated) - giữ lại cho backward compatibility
    BY_HOADON_OLD: (maHD) => `/api/chitiethoadon/${maHD}`
  },

  // Khách hàng
  KHACHHANG: {
    // Lấy thông tin khách hàng theo mã
    BY_ID: (maKH) => `/api/khachhang/${maKH}`,
    // Lấy khách hàng theo người dùng
    BY_NGUOIDUNG: (maNguoiDung) => `/api/khachhang/by-nguoidung/${maNguoiDung}`,
    // Cập nhật thông tin khách hàng
    UPDATE_INFO: (maKH) => `/api/khachhang/${maKH}`,
    // Đăng ký khách hàng mới
    REGISTER: '/api/khachhang/register'
  },
  
  // Images
  IMAGES: {
    PRODUCT_LIST: (productId) => `/api/hinhanh/product/${productId}`,
    SERVE_IMAGE: (filename) => `/api/upload/serve-image/${filename}`,
    PRODUCT_IMAGES: (productId) => [
      `/api/upload/serve-image/${productId}_main.jfif`,
      `/api/upload/serve-image/${productId}_main1.jfif`,
      `/api/upload/serve-image/${productId}_main2.jfif`
    ]
  },
  
  // Inventory (Tồn kho) - API endpoints cho số lượng tồn
  INVENTORY: {
    // Lấy tất cả tồn kho chi tiết
    ALL_DETAILS: '/api/tonkhochitiet',
    // Lấy tồn kho chi tiết theo ID
    BY_ID: (id) => `/api/tonkhochitiet/${id}`,
    // Lấy tồn kho theo sản phẩm
    BY_PRODUCT: (productId) => `/api/tonkhochitiet/product/${productId}`,
    // Lấy tồn kho theo kho
    BY_WAREHOUSE: (warehouseId) => `/api/tonkhochitiet/warehouse/${warehouseId}`,
    // So sánh maSP giữa bảng SanPham và TonKhoChiTiet (active)
    COMPARE_MASP: '/api/tonkhochitiet/compare-masp'
  }
}

export default {
  baseURL: API_BASE_URL,
  endpoints: API_ENDPOINTS
}

// 📚 API Usage Examples - Ví dụ sử dụng các API mới
/*
🔍 1. Lọc hóa đơn theo trạng thái:
// Lấy tất cả hóa đơn đã thanh toán
GET /api/hoadon/status/1

// Lấy hóa đơn chờ thanh toán của khách hàng KH001
GET /api/hoadon/by-khachhang/KH001/status/0

📅 2. Lọc hóa đơn theo ngày:
// Lấy hóa đơn trong tháng 1/2024
GET /api/hoadon/date-range?fromDate=2024-01-01&toDate=2024-01-31

// Lấy hóa đơn của khách hàng trong khoảng thời gian
GET /api/hoadon/by-khachhang/KH001/date-range?fromDate=2024-01-01&toDate=2024-12-31

❌ 3. Hủy hóa đơn:
// Hủy hóa đơn với lý do
PATCH /api/hoadon/123/cancel?lyDoHuy=Khách hàng không muốn mua nữa

📈 4. Thống kê hóa đơn:
// Lấy thống kê tổng quan của khách hàng
GET /api/hoadon/by-khachhang/KH001/statistics
Response: { totalInvoices: 15, totalAmount: 2500000, totalDiscount: 250000, totalPoints: 2500 }

// Lấy số lượng hóa đơn theo từng trạng thái
GET /api/hoadon/by-khachhang/KH001/count-by-status
Response: { pending: 2, paid: 10, processing: 1, cancelled: 2, returned: 0 }

🔍 5. Tìm kiếm hóa đơn:
// Tìm kiếm hóa đơn theo từ khóa
GET /api/hoadon/search?query=HD001&page=1&size=10

📊 6. Đếm hóa đơn:
// Đếm tất cả hóa đơn đã thanh toán
GET /api/hoadon/count/trangthai/1

// Đếm tổng hóa đơn của khách hàng
GET /api/hoadon/count/khachhang/KH001
*/
