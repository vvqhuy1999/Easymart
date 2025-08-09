import { ref, computed } from 'vue'
import { API_CONFIG, getApiUrl, getApiUrlWithParams, USER_ROLES } from '../config/api.js'

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
  // Trigger a custom event to notify other components
  window.dispatchEvent(new CustomEvent('user-updated', { detail: userData }))
}

// Force reload user from localStorage
const forceReloadUser = () => {
  const savedUser = localStorage.getItem('easymart-user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
    window.dispatchEvent(new CustomEvent('user-updated', { detail: user.value }))
  }
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

// Traditional login function - sử dụng API AUTH.LOGIN mới
const login = async (email, password) => {
  try {
    // Simulate demo login cho demo account
    if (email === 'demo@easymart.vn') {
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
    
    // Call new AUTH.LOGIN API
    try {
      const loginResponse = await apiCall(API_CONFIG.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ 
          email: email, 
          matKhau: password 
        })
      })
      
      // loginResponse has structure: { result: { authenticated: true, message: "...", token: "..." } }
      if (loginResponse && loginResponse.result && loginResponse.result.authenticated) {
        const result = loginResponse.result
        
        // Save JWT token
        if (result.token) {
          localStorage.setItem('easymart-token', result.token)
        }
        
        // For traditional login, we need to get user info separately or create basic user data
        const userData = {
          id: 'USER_' + Date.now(), // Will be updated when we get user info
          name: email.split('@')[0], // Basic name from email
          email: email,
          phone: '',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=007bff&color=fff`,
          joinDate: new Date().toISOString().split('T')[0],
          totalOrders: 0,
          totalSpent: 0,
          role: 'USER',
          loginMethod: 'traditional'
        }
        
        saveUser(userData)
        return { success: true, user: userData, message: result.message }
      } else {
        return { success: false, error: loginResponse?.result?.message || 'Email hoặc mật khẩu không đúng' }
      }
    } catch (apiError) {
      console.error('Login API error:', apiError)
      return { success: false, error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' }
    }
    
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

// Register function - sử dụng API USER.REGISTER thật
const register = async (name, email, phone = '', password, confirmPassword) => {
  try {
    // Validate passwords match
    if (password !== confirmPassword) {
      return { success: false, error: 'Mật khẩu không khớp!' }
    }
    
    // Validate phone number (optional)
    if (phone && phone.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(phone)) {
        return { success: false, error: 'Số điện thoại phải có 10-11 chữ số!' }
      }
    }
    
    // Check if email already exists using USER API
    try {
      const emailCheck = await checkUserEmailExists(email)
      if (emailCheck && emailCheck.exists) {
        return { success: false, error: 'Email đã tồn tại trong hệ thống!' }
      }
    } catch (emailCheckError) {
      console.warn('Email check failed, proceeding anyway:', emailCheckError)
    }
    
    // Call USER.REGISTER API
    const registerData = {
      email: email,
      matKhau: password,
      vaiTro: USER_ROLES.CUSTOMER, // Default role: Customer (3)
      tenNguoiDung: name
    }
    
    // Only add phone if provided
    if (phone && phone.trim()) {
      registerData.soDienThoai = phone
    }
    
    const registerResponse = await apiCall(API_CONFIG.USER.REGISTER, {
      method: 'POST',
      body: JSON.stringify(registerData)
    })
    
    // registerResponse is the user object directly from backend
    if (registerResponse && registerResponse.maNguoiDung) {
      const result = registerResponse
      const userData = {
        id: result.maNguoiDung || 'USER_' + Date.now(),
        name: result.tenNguoiDung || name,
        email: result.email || email,
        phone: result.soDienThoai || phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=28a745&color=fff`,
        joinDate: result.ngayTao || new Date().toISOString().split('T')[0],
        totalOrders: result.tongDonHang || 0,
        totalSpent: result.tongChiTieu || 0,
        role: getRoleString(result.vaiTro) || 'USER',
        loginMethod: 'traditional'
      }
      
      saveUser(userData)
      return { success: true, user: userData }
    } else {
      return { success: false, error: 'Đăng ký thất bại - Không nhận được dữ liệu user từ server' }
    }
    
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
    const response = await apiCall(API_CONFIG.OAUTH2.GET_JWT_TOKEN)
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

// Check email duplicate (OAuth2)
const checkEmailDuplicate = async (email) => {
  try {
    const response = await apiCall(`${API_CONFIG.OAUTH2.CHECK_EMAIL}?email=${encodeURIComponent(email)}`)
    return response
  } catch (error) {
    console.error('Check email duplicate error:', error)
    throw error
  }
}

// Check if user email exists (USER API) - NEW
const checkUserEmailExists = async (email) => {
  try {
    // Build URL with parameters but pass just the endpoint to apiCall
    const endpoint = API_CONFIG.USER.CHECK_EMAIL.replace('{email}', encodeURIComponent(email))
    const response = await apiCall(endpoint)
    return response
  } catch (error) {
    console.error('Check user email exists error:', error)
    throw error
  }
}

// Get user by email (USER API) - NEW
const getUserByEmail = async (email) => {
  try {
    // Build URL with parameters but pass just the endpoint to apiCall
    const endpoint = API_CONFIG.USER.GET_BY_EMAIL.replace('{email}', encodeURIComponent(email))
    const response = await apiCall(endpoint)
    return response
  } catch (error) {
    console.error('Get user by email error:', error)
    throw error
  }
}

// Helper function to convert role number to string
const getRoleString = (roleNumber) => {
  switch (roleNumber) {
    case USER_ROLES.ADMIN: return 'ADMIN'
    case USER_ROLES.MANAGER: return 'MANAGER'
    case USER_ROLES.STAFF: return 'STAFF'
    case USER_ROLES.CUSTOMER: return 'USER'
    default: return 'USER'
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

// Check authentication status - NEW API
const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('easymart-token')
    if (!token) {
      return { success: false, error: 'No token found' }
    }
    
    const response = await apiCall(API_CONFIG.AUTH.STATUS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response
  } catch (error) {
    console.error('Check auth status error:', error)
    return { success: false, error: 'Failed to check auth status' }
  }
}

// Validate token - NEW API
const validateToken = async (token) => {
  try {
    const response = await apiCall(API_CONFIG.AUTH.VALIDATE_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ token })
    })
    return response
  } catch (error) {
    console.error('Validate token error:', error)
    return { success: false, error: 'Token validation failed' }
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
        const tokenResponse = await apiCall(API_CONFIG.OAUTH2.GET_JWT_TOKEN)
        
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

// Logout function - sử dụng API AUTH.LOGOUT mới
const logout = async () => {
  try {
    const token = localStorage.getItem('easymart-token')
    
    if (token) {
      // Call new AUTH.LOGOUT API
      try {
        await apiCall(API_CONFIG.AUTH.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (apiError) {
        console.warn('Logout API call failed:', apiError)
        // Continue with local cleanup even if API fails
      }
    }
    
    // Clean up all local data
    localStorage.removeItem('easymart-user')
    localStorage.removeItem('easymart-token')
    localStorage.removeItem('easymart-user-email')
    localStorage.removeItem('easymart-user-role')
    localStorage.removeItem('easymart-user-id')
    sessionStorage.removeItem('oauth2-frontend-redirect')
    sessionStorage.removeItem('google-credential')
    sessionStorage.removeItem('oauth2-login-mode')
    sessionStorage.removeItem('google-user-info')
    sessionStorage.removeItem('pending-oauth-user-info')
    sessionStorage.removeItem('pending-google-credential')
    sessionStorage.removeItem('pending-facebook-credential')
    user.value = null
    
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    // Still clean up local data even if there's an error
    localStorage.clear()
    sessionStorage.clear()
    user.value = null
    return { success: false, error: 'Đăng xuất có lỗi, nhưng đã xóa dữ liệu local' }
  }
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
    forceReloadUser,
    getJWTToken,
    getUserInfo,
    testOAuth2Config,
    checkEmailDuplicate,
    checkUserEmailExists,
    getUserByEmail,
    checkOAuth2Sub,
    checkAuthStatus,
    validateToken,
    handleOAuth2Callback
  }
}