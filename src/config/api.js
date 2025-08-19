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
    BY_CATEGORY_ACTIVE: (categoryId) => `/api/sanpham/category/${categoryId}/active`
  },
  
  // Cart (GioHang)
  CART: {
    BY_CUSTOMER: (maKH) => `/api/giohang/by-khachhang/${maKH}`,
    CREATE: '/api/giohang',
    BY_ID: (maGH) => `/api/giohang/${maGH}`,
    UPDATE_STATUS: (maGH) => `/api/giohang/${maGH}/status`,
    CLEAR_ITEMS: (maGH) => `/api/giohang/${maGH}/items`,
    WITH_ITEMS_BY_ID: (maGH) => `/api/giohang/${maGH}/with-items`,
    BY_CUSTOMER_WITH_ITEMS: (maKH) => `/api/giohang/by-khachhang/${maKH}/with-items`,
    SYNC: '/api/giohang/sync'
  },
  
  // Cart Items (ChiTietGioHang)
  CART_ITEMS: {
    BY_CART: (maGH) => `/api/chitietgiohang/by-giohang/${maGH}`,
    ADD: '/api/chitietgiohang',
    UPDATE_QTY: (maCTGH) => `/api/chitietgiohang/${maCTGH}/quantity`,
    REMOVE: (maCTGH) => `/api/chitietgiohang/${maCTGH}`
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
  }
}

export default {
  baseURL: API_BASE_URL,
  endpoints: API_ENDPOINTS
}
