import { ref, computed } from 'vue'
import { API_CONFIG, getApiUrl } from '../config/api.js'

// Global state - singleton pattern
const user = ref(null)
const isLoggedIn = computed(() => !!user.value)

// Load user from localStorage on init
const loadUser = () => {
  const savedUser = localStorage.getItem('easymart-user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
  }
}

// Save user to localStorage
const saveUser = (userData) => {
  localStorage.setItem('easymart-user', JSON.stringify(userData))
  user.value = userData
}

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(getApiUrl(endpoint), {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

// Traditional login function - sử dụng demo account theo HTML test
const login = async (email, password) => {
  try {
    // Simulate demo login như trong HTML test
    if (email === 'demo@easymart.vn') {
      // Mock successful login cho demo account
      const userData = {
        id: 'DEMO_USER',
        name: 'Demo User',
        email: email,
        phone: '0123456789',
        avatar: `https://ui-avatars.com/api/?name=Demo+User&background=007bff&color=fff`,
        joinDate: new Date().toISOString().split('T')[0],
        totalOrders: 5,
        totalSpent: 1500000,
        role: 'USER',
        loginMethod: 'traditional'
      }
      
      saveUser(userData)
      return { success: true, user: userData }
    }
    
    // For other emails, try to get JWT token first to authenticate
    try {
      const tokenResponse = await apiCall(API_CONFIG.OAUTH2.GET_TOKEN)
      if (tokenResponse.success) {
        // If we have a valid session, create user from token info
        const userData = {
          id: tokenResponse.result.user_info?.maNguoiDung || 'USER_' + Date.now(),
          name: tokenResponse.result.user_info?.tenNguoiDung || email.split('@')[0],
          email: tokenResponse.result.user_email || email,
          phone: tokenResponse.result.user_info?.soDienThoai || '',
          avatar: `https://ui-avatars.com/api/?name=${tokenResponse.result.user_info?.tenNguoiDung || email.split('@')[0]}&background=007bff&color=fff`,
          joinDate: new Date().toISOString().split('T')[0],
          totalOrders: 0,
          totalSpent: 0,
          role: tokenResponse.result.user_role || 'USER',
          loginMethod: 'traditional'
        }
        
        localStorage.setItem('easymart-token', tokenResponse.result.jwt_token)
        saveUser(userData)
        return { success: true, user: userData }
      }
    } catch (tokenError) {
      console.log('No existing session found')
    }
    
    // If no session exists, return error for non-demo accounts
    return { success: false, error: 'Email hoặc mật khẩu không đúng. Hãy thử tài khoản demo: demo@easymart.vn' }
    
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Đăng nhập thất bại. Vui lòng thử lại.' }
  }
}

// Login with Google function - handle response từ GoogleSignIn component  
const loginWithGoogle = async (response) => {
  try {
    // Nếu là redirect response, chỉ return success
    if (response.redirect) {
      return { 
        success: true, 
        redirect: true, 
        message: response.message || 'Đang chuyển hướng tới Google OAuth2...' 
      }
    }
    
    // Legacy support for credential-based login (không còn dùng)
    if (response.credential) {
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      console.log('Legacy Google credential payload:', payload)
      return { success: false, error: 'Vui lòng sử dụng OAuth2 flow mới' }
    }
    
    return { success: false, error: 'Invalid response format' }
    
  } catch (error) {
    console.error('Google login error:', error)
    return { success: false, error: 'Đăng nhập với Google thất bại. Vui lòng thử lại.' }
  }
}

// Login with Facebook function - handle response từ FacebookSignIn component
const loginWithFacebook = async (response) => {
  try {
    // Nếu là redirect response, chỉ return success
    if (response.redirect) {
      return { 
        success: true, 
        redirect: true, 
        message: response.message || 'Đang chuyển hướng tới Facebook OAuth2...' 
      }
    }
    
    // Legacy support for credential-based login (không còn dùng)
    if (response.credential) {
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      console.log('Legacy Facebook credential payload:', payload)
      return { success: false, error: 'Vui lòng sử dụng OAuth2 flow mới' }
    }
    
    return { success: false, error: 'Invalid response format' }
    
  } catch (error) {
    console.error('Facebook login error:', error)
    return { success: false, error: 'Đăng nhập với Facebook thất bại. Vui lòng thử lại.' }
  }
}

// Register function - sử dụng demo registration
const register = async (name, email, phone, password, confirmPassword) => {
  try {
    // Validate passwords match
    if (password !== confirmPassword) {
      return { success: false, error: 'Mật khẩu không khớp!' }
    }
    
    // Validate phone number
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(phone)) {
      return { success: false, error: 'Số điện thoại phải có 10-11 chữ số!' }
    }
    
    // Check if email already exists
    const emailCheck = await checkEmailDuplicate(email)
    if (emailCheck.success && emailCheck.result.exists) {
      return { success: false, error: 'Email đã tồn tại trong hệ thống!' }
    }
    
    // Simulate successful registration
    const userData = {
      id: 'USER_' + Date.now(),
      name: name,
      email: email,
      phone: phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=28a745&color=fff`,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      role: 'USER',
      loginMethod: 'traditional'
    }
    
    saveUser(userData)
    return { success: true, user: userData }
    
  } catch (error) {
    console.error('Register error:', error)
    return { success: false, error: 'Đăng ký thất bại. Vui lòng thử lại.' }
  }
}

// Register with Google function - handle response từ GoogleSignIn component
const registerWithGoogle = async (response) => {
  try {
    // Nếu là redirect response, chỉ return success  
    if (response.redirect) {
      return { 
        success: true, 
        redirect: true, 
        message: response.message || 'Đang chuyển hướng tới Google OAuth2...' 
      }
    }
    
    // Legacy support for credential-based register (không còn dùng)
    if (response.credential) {
      console.log('Legacy Google register credential')
      return { success: false, error: 'Vui lòng sử dụng OAuth2 flow mới' }
    }
    
    return { success: false, error: 'Invalid response format' }
    
  } catch (error) {
    console.error('Google register error:', error)
    return { success: false, error: 'Đăng ký với Google thất bại. Vui lòng thử lại.' }
  }
}

// Register with Facebook function - handle response từ FacebookSignIn component
const registerWithFacebook = async (response) => {
  try {
    // Nếu là redirect response, chỉ return success  
    if (response.redirect) {
      return { 
        success: true, 
        redirect: true, 
        message: response.message || 'Đang chuyển hướng tới Facebook OAuth2...' 
      }
    }
    
    // Legacy support for credential-based register (không còn dùng)
    if (response.credential) {
      console.log('Legacy Facebook register credential')
      return { success: false, error: 'Vui lòng sử dụng OAuth2 flow mới' }
    }
    
    return { success: false, error: 'Invalid response format' }
    
  } catch (error) {
    console.error('Facebook register error:', error)
    return { success: false, error: 'Đăng ký với Facebook thất bại. Vui lòng thử lại.' }
  }
}

// Get JWT token from backend
const getJWTToken = async () => {
  try {
    const response = await apiCall(API_CONFIG.OAUTH2.GET_TOKEN)
    if (response.success) {
      localStorage.setItem('easymart-token', response.result.jwt_token)
      return response.result
    } else {
      throw new Error(response.message || 'Không thể lấy JWT token')
    }
  } catch (error) {
    console.error('Get JWT token error:', error)
    throw error
  }
}

// Get user info from backend
const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('easymart-token')
    if (!token) {
      throw new Error('Không có token xác thực')
    }
    
    const response = await apiCall(API_CONFIG.OAUTH2.USER_INFO, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.success) {
      return response.result
    } else {
      throw new Error(response.message || 'Không thể lấy thông tin user')
    }
  } catch (error) {
    console.error('Get user info error:', error)
    throw error
  }
}

// Test OAuth2 configuration
const testOAuth2Config = async () => {
  try {
    const response = await apiCall(API_CONFIG.OAUTH2.TEST_CONFIG)
    return response
  } catch (error) {
    console.error('Test OAuth2 config error:', error)
    throw error
  }
}

// Check email duplicate
const checkEmailDuplicate = async (email) => {
  try {
    const response = await apiCall(`${API_CONFIG.OAUTH2.CHECK_EMAIL}?email=${encodeURIComponent(email)}`)
    return response
  } catch (error) {
    console.error('Check email duplicate error:', error)
    throw error
  }
}

// Check OAuth2 sub
const checkOAuth2Sub = async (sub) => {
  try {
    const response = await apiCall(`${API_CONFIG.OAUTH2.CHECK_SUB}?sub=${encodeURIComponent(sub)}`)
    return response
  } catch (error) {
    console.error('Check OAuth2 sub error:', error)
    throw error
  }
}

// Handle OAuth2 callback after redirect (Legacy - mostly not used now)
const handleOAuth2Callback = async () => {
  try {
    // This function is now mostly deprecated since backend handles OAuth2 flow
    // and redirects directly to /oauth2/success with token in URL parameters
    
    // Check if there's already a token (from URL parameters processing)
    const token = localStorage.getItem('easymart-token')
    const user = localStorage.getItem('easymart-user')
    
    if (token && user) {
      // Token and user already stored by OAuth2Success component
      const userData = JSON.parse(user)
      return { success: true, user: userData }
    }
    
    // Check if this is an OAuth2 callback with code (fallback)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    
    if (error) {
      console.error('OAuth2 error:', error)
      return { success: false, error: `OAuth2 lỗi: ${error}` }
    }
    
    if (code) {
      console.log('Legacy OAuth2 callback with code:', code)
      
      // Try to get user info and JWT token from backend APIs
      try {
        const userInfoResponse = await apiCall(API_CONFIG.OAUTH2.USER_INFO)
        const tokenResponse = await apiCall(API_CONFIG.OAUTH2.GET_TOKEN)
        
        if (userInfoResponse.success && tokenResponse.success) {
          const userInfo = userInfoResponse.result
          const tokenInfo = tokenResponse.result
          
          // Check if user exists in our system
          const email = userInfo.email || tokenInfo.user_email
          const emailCheck = await checkEmailDuplicate(email)
          
          if (emailCheck.success && emailCheck.result.exists) {
            // User exists - proceed with login
            const userData = {
              id: userInfo.maNguoiDung || tokenInfo.user_info?.maNguoiDung || 'OAUTH_USER',
              name: userInfo.tenNguoiDung || tokenInfo.user_info?.tenNguoiDung || 'OAuth User',
              email: email,
              phone: userInfo.soDienThoai || tokenInfo.user_info?.soDienThoai || '',
              avatar: userInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.tenNguoiDung || 'OAuth User')}&background=007bff&color=fff`,
              joinDate: userInfo.ngayTao || new Date().toISOString().split('T')[0],
              totalOrders: userInfo.tongDonHang || 0,
              totalSpent: userInfo.tongChiTieu || 0,
              role: userInfo.vaiTro || tokenInfo.user_role || 'USER',
              loginMethod: 'google',
              sub: userInfo.sub || tokenInfo.user_info?.sub
            }
            
            // Save JWT token and user
            localStorage.setItem('easymart-token', tokenInfo.jwt_token)
            saveUser(userData)
            
            return { success: true, user: userData }
          } else {
            // User doesn't exist - need registration
            return { 
              success: false, 
              needsRegistration: true,
              error: 'Tài khoản chưa tồn tại. Vui lòng đăng ký trước.',
              userInfo: {
                name: userInfo.tenNguoiDung || tokenInfo.user_info?.tenNguoiDung || 'OAuth User',
                email: email,
                avatar: userInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.tenNguoiDung || 'OAuth User')}&background=007bff&color=fff`
              }
            }
          }
        }
      } catch (apiError) {
        console.error('Failed to get user info from APIs:', apiError)
        return { success: false, error: 'Không thể lấy thông tin user từ backend' }
      }
    }
    
    return null // Not an OAuth2 callback
    
  } catch (error) {
    console.error('OAuth2 callback error:', error)
    return { success: false, error: 'Xử lý OAuth2 callback thất bại' }
  }
}

// Logout function - clean up all user data
const logout = () => {
  localStorage.removeItem('easymart-user')
  localStorage.removeItem('easymart-token')
  localStorage.removeItem('easymart-user-email')
  localStorage.removeItem('easymart-user-role')
  localStorage.removeItem('easymart-user-id')
  sessionStorage.removeItem('oauth2-frontend-redirect')
  sessionStorage.removeItem('google-credential')
  sessionStorage.removeItem('oauth2-login-mode')
  sessionStorage.removeItem('google-user-info')
  user.value = null
}

// Initialize user on first load
loadUser()

export function useAuth() {
  return {
    user,
    isLoggedIn,
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    registerWithGoogle,
    registerWithFacebook,
    logout,
    loadUser,
    getJWTToken,
    getUserInfo,
    testOAuth2Config,
    checkEmailDuplicate,
    checkOAuth2Sub,
    handleOAuth2Callback
  }
}