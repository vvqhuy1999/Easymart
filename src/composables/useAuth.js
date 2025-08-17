import { ref, computed } from 'vue'
import { API_CONFIG, getApiUrl, getApiUrlWithParams, USER_ROLES } from '../config/api'

// ============================================================================
// 🍪 COOKIE & STORAGE UTILITIES
// ============================================================================
// Configuration for token storage
const TOKEN_STORAGE_TYPE = 'cookie' // 'localStorage', 'sessionStorage', or 'cookie'

// Cookie utility functions
const setCookie = (name, value, days = 7, secure = false, httpOnly = false) => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = `; expires=${date.toUTCString()}`
  }
  
  let cookieString = `${name}=${value || ''}${expires}; path=/`
  
  if (secure) {
    cookieString += '; Secure'
  }
  
  if (httpOnly) {
    cookieString += '; HttpOnly'
  }
  
  // SameSite attribute for CSRF protection
  cookieString += '; SameSite=Strict'
  
  document.cookie = cookieString
}

const getCookie = (name) => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const removeCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
}

// ============================================================================
// 🔐 STORAGE HELPER FUNCTIONS
// ============================================================================
// Universal storage helper functions
const setStorageItem = (key, value) => {
  if (TOKEN_STORAGE_TYPE === 'cookie' && key === 'easymart-token') {
    // For token, use secure cookie
    setCookie(key, value, 7, false, false) // 7 days, will be secure in production
  } else {
    // For user data, still use localStorage for easy access
    localStorage.setItem(key, value)
  }
}

const getStorageItem = (key) => {
  if (TOKEN_STORAGE_TYPE === 'cookie' && key === 'easymart-token') {
    return getCookie(key)
  } else {
    return localStorage.getItem(key)
  }
}

const removeStorageItem = (key) => {
  if (TOKEN_STORAGE_TYPE === 'cookie' && key === 'easymart-token') {
    removeCookie(key)
  } else {
    localStorage.removeItem(key)
  }
}

// ============================================================================
// 🌍 GLOBAL STATE & REACTIVE VARIABLES
// ============================================================================
// Global state - singleton pattern
const user = ref(null)
const isLoggedIn = computed(() => !!user.value)

// ============================================================================
// 👤 USER DATA MANAGEMENT FUNCTIONS
// ============================================================================
// Load user from localStorage on init - SECURE VERSION
const loadUser = () => {
  const savedUser = localStorage.getItem('easymart-user')
  if (savedUser) {
    try {
      const safeUserData = JSON.parse(savedUser)
      // Only load safe data, full user data will be fetched from API if needed
      user.value = {
        ...safeUserData,
        // Placeholder for sensitive data
        email: null,
        phone: null,
        totalOrders: 0,
        totalSpent: 0,
        joinDate: null
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Clear corrupted data
      localStorage.removeItem('easymart-user')
      user.value = null
    }
  }
}

// Save user to localStorage - SECURE VERSION
const saveUser = (userData) => {
  // Only store essential, non-sensitive data
  const safeUserData = {
    id: userData.id,
    name: userData.name,
    avatar: userData.avatar,
    role: userData.role,
    loginMethod: userData.loginMethod,
    // Store minimal info needed for UI
    displayName: userData.name || userData.email?.split('@')[0] || 'User'
  }
  
  // Store safe data in localStorage
  localStorage.setItem('easymart-user', JSON.stringify(safeUserData))
  
  // Keep full user data in memory only (ref)
  user.value = userData
  
  // Trigger a custom event to notify other components (chỉ khi cần thiết)
  if (userData.triggerEvent !== false) {
    window.dispatchEvent(new CustomEvent('user-updated', { detail: safeUserData }))
  }
}

// ============================================================================
// 🔑 JWT TOKEN UTILITIES
// ============================================================================
// Decode JWT token to get user info
const decodeToken = (token) => {
  try {
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      // sub là email trong JWT này, không có userId
      email: payload.sub, // sub chính là email
      issuer: payload.iss,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
      // Raw payload để debug
      raw: payload
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// Check if token is valid and not expired
const isTokenValid = (token) => {
  try {
    if (!token) return false
    const payload = decodeToken(token)
    if (!payload) return false
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    return payload.exp > now
  } catch (error) {
    return false
  }
}

// ============================================================================
// 🚀 TOKEN INITIALIZATION & VALIDATION
// ============================================================================
// Initialize user from token (token-only approach)
const initUserFromToken = () => {
  const token = getStorageItem('easymart-token')
  if (!token || !isTokenValid(token)) {
    // Clear invalid data
    removeStorageItem('easymart-token')
    localStorage.removeItem('easymart-user')
    user.value = null
    return
  }
  
  const tokenData = decodeToken(token)
  if (tokenData) {
    // Create user object from token data (limited info since no user details in JWT)
    const userData = {
      id: null, // JWT không có ID, sẽ fetch từ server khi cần
      email: tokenData.email, // sub chính là email
      name: tokenData.email.split('@')[0], // Extract name from email
      role: tokenData.role, // KHACH_HANG, etc.
      loginMethod: 'token',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tokenData.email.split('@')[0])}&background=28a745&color=fff`,
      tokenInfo: {
        issuer: tokenData.issuer,
        exp: new Date(tokenData.exp * 1000),
        iat: new Date(tokenData.iat * 1000)
      }
    }
    
    // Update reactive state but don't save to localStorage (token is enough)
    user.value = userData
    
    console.log('🔐 User initialized from token:', userData)
    console.log('🔍 Token payload:', tokenData.raw)
    
    // Fetch complete user info in background (non-blocking)
    setTimeout(async () => {
      try {
        console.log('🔄 Fetching complete user info in background...')
        await ensureUserComplete()
      } catch (error) {
        console.warn('⚠️ Could not fetch complete user info in background:', error)
      }
    }, 1000) // Delay 1 second to not block initial load
  }
}

// Debug function to test current token
const debugCurrentToken = () => {
  const token = getStorageItem('easymart-token')
  console.log('🔍 Current token:', token)
  
  if (token) {
    const decoded = decodeToken(token)
    console.log('📋 Decoded token:', decoded)
    console.log('✅ Token valid:', isTokenValid(token))
    
    if (decoded && decoded.exp) {
      const expDate = new Date(decoded.exp * 1000)
      const now = new Date()
      console.log('⏰ Token expires:', expDate)
      console.log('🕐 Current time:', now)
      console.log('⏱️ Time until expiry:', Math.round((expDate - now) / 1000 / 60), 'minutes')
    }
  } else {
    console.log('❌ No token found')
  }
}

// ============================================================================
// 🌐 SERVER-SIDE TOKEN VALIDATION
// ============================================================================
// Check if token is valid on server (validates expiration, blacklist, etc.)
const checkTokenValidity = async (token) => {
  try {
    if (!token) return false // No token = invalid
    
    console.log('🔍 Validating token on server...')
    
    // Use validate-token API to check if token is still valid
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    })
    
    console.log('📡 Validate token response status:', response.status)
    
    // If validate-token returns non-200, token is invalid
    if (!response.ok) {
      console.log('❌ Token validation failed:', response.status, response.statusText)
      return false // Token is invalid (expired, blacklisted, etc.)
    }
    
    const result = await response.json()
    console.log('📝 Validate token result:', result)
    
    // Check the response format from your backend
    // Response: { "result": { "valid": true, "role": "KHACH_HANG", "username": "email@example.com", ... } }
    if (result && result.result && result.result.valid === true) {
      console.log('✅ Token is valid on server')
      
      // If user info is not complete, fetch full user data using email
      const currentUser = user.value
      if (!currentUser || !currentUser.id || currentUser.email !== result.result.username) {
        console.log('🔄 Updating user info from server...')
        await updateUserFromValidation(result.result)
      }
      
      return true // Token is valid
    } else {
      console.log('❌ Token marked as invalid by server')
      return false // Token is invalid
    }
    
  } catch (error) {
    console.error('❌ Error validating token:', error)
    // If we can't validate, assume token is invalid for security
    return false
  }
}

// ============================================================================
// 🔄 USER DATA UPDATE & SYNCHRONIZATION
// ============================================================================
// Update user info from validation result (fetch full user data)
const updateUserFromValidation = async (validationResult) => {
  try {
    const { username: email, role, expiration } = validationResult
    
    console.log('🔍 Fetching full user data for:', email)
    
    // Get full user info from backend using email
    const fullUserData = await getUserByEmail(email)
    
    if (fullUserData && fullUserData.success && fullUserData.user) {
      const userData = {
        id: fullUserData.user.maNguoiDung || fullUserData.user.id,
        email: email,
        name: fullUserData.user.tenNguoiDung || fullUserData.user.hoTen || email.split('@')[0],
        phone: fullUserData.user.soDienThoai || fullUserData.user.sdt || '',
        address: fullUserData.user.diaChi || '',
        role: role,
        avatar: fullUserData.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullUserData.user.tenNguoiDung || email.split('@')[0])}&background=28a745&color=fff`,
        loginMethod: 'token',
        tokenInfo: {
          expiration: new Date(expiration),
          role: role,
          lastValidated: new Date()
        }
      }
      
      // Update reactive user state
      user.value = userData
      
      // Save to localStorage for persistence
      localStorage.setItem('easymart-user', JSON.stringify(userData))
      
      console.log('✅ User info updated from server:', userData)
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('user-updated', { detail: userData }))
      
    } else {
      console.warn('⚠️ Could not fetch full user data, using minimal info from token')
      
      // Fallback: create minimal user object from validation result
      const minimalUser = {
        id: null, // Will need to be fetched later when needed
        email: email,
        name: email.split('@')[0],
        role: role,
        loginMethod: 'token',
        tokenInfo: {
          expiration: new Date(expiration),
          role: role,
          lastValidated: new Date()
        }
      }
      
      user.value = minimalUser
      localStorage.setItem('easymart-user', JSON.stringify(minimalUser))
    }
    
  } catch (error) {
    console.error('❌ Error updating user from validation:', error)
  }
}

// ============================================================================
// 🚪 AUTO-LOGOUT & SECURITY FUNCTIONS
// ============================================================================
// Auto-logout if token is invalid (expired, blacklisted, etc.)
const autoLogoutIfInvalid = async () => {
  const token = getStorageItem('easymart-token')
  if (!token) {
    console.log('🔍 Auto-logout check: No token found')
    return
  }
  
  console.log('🔍 Auto-logout check: Starting validation...')
  
  // Check local expiration first (quick local check)
  if (!isTokenValid(token)) {
    console.log('🔄 Token expired locally, logging out...')
    await performAutoLogout('Token đã hết hạn')
    return
  }
  
  console.log('✅ Token valid locally, validating on server...')
  
  // Check server validation (expiration, blacklist, etc.)
  const isValidOnServer = await checkTokenValidity(token)
  console.log('🔍 Server validation result:', isValidOnServer)
  
  if (!isValidOnServer) {
    console.log('🚫 Token invalid on server, logging out...')
    await performAutoLogout('Phiên đăng nhập không hợp lệ')
  } else {
    console.log('✅ Token valid on server')
  }
}

// Perform auto-logout (helper function)
const performAutoLogout = async (reason) => {
  console.log('🚪 Performing auto-logout:', reason)
  
  // Clear local data (don't call logout API since token might be invalid)
  removeStorageItem('easymart-token')
  localStorage.removeItem('easymart-user')
  user.value = null
  
  // Show notification
  alert(`${reason}. Bạn sẽ được chuyển về trang đăng nhập.`)
  
  // Redirect to login
  window.location.href = '/login'
}

// ============================================================================
// ✅ USER COMPLETENESS & VALIDATION
// ============================================================================
// Ensure user has complete info (including ID) - call before critical operations
const ensureUserComplete = async () => {
  const currentUser = user.value
  if (!currentUser) {
    console.warn('⚠️ No user logged in')
    return null
  }
  
  // If user already has ID, return it
  if (currentUser.id) {
    console.log('✅ User already has complete info:', currentUser.id)
    return currentUser
  }
  
  // If no ID, fetch from server using email
  if (currentUser.email) {
    console.log('🔍 Fetching user ID for:', currentUser.email)
    
    try {
      const fullUserData = await getUserByEmail(currentUser.email)
      
      if (fullUserData && fullUserData.success && fullUserData.user) {
        const updatedUser = {
          ...currentUser,
          id: fullUserData.user.maNguoiDung || fullUserData.user.id,
          name: fullUserData.user.tenNguoiDung || fullUserData.user.hoTen || currentUser.name,
          phone: fullUserData.user.soDienThoai || fullUserData.user.sdt || currentUser.phone || '',
          address: fullUserData.user.diaChi || currentUser.address || ''
        }
        
        // Update user state
        user.value = updatedUser
        localStorage.setItem('easymart-user', JSON.stringify(updatedUser))
        
        console.log('✅ User info completed with ID:', updatedUser.id)
        return updatedUser
      }
    } catch (error) {
      console.error('❌ Error fetching complete user info:', error)
    }
  }
  
  console.warn('⚠️ Could not complete user info')
  return currentUser
}

// Force reload user from localStorage - SECURE VERSION
const forceReloadUser = () => {
  const savedUser = localStorage.getItem('easymart-user')
  if (savedUser) {
    try {
      const safeUserData = JSON.parse(savedUser)
      user.value = {
        ...safeUserData,
        // Placeholder for sensitive data
        email: null,
        phone: null,
        totalOrders: 0,
        totalSpent: 0,
        joinDate: null
      }
      // KHÔNG dispatch event để tránh vòng lặp vô hạn
      console.log('🔄 User data reloaded from localStorage')
    } catch (error) {
      console.error('Error reloading user data:', error)
      localStorage.removeItem('easymart-user')
      user.value = null
    }
  }
}

// ============================================================================
// 📡 API DATA FETCHING FUNCTIONS
// ============================================================================
// Fetch full user data from API when needed (for sensitive operations)
const fetchFullUserData = async () => {
  try {
    const token = getStorageItem('easymart-token')
    if (!token) return null
    
    // Call API to get full user data
    const response = await apiCall(API_CONFIG.USER.GET_BY_ID, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response && response.result) {
      // Update user with full data
      user.value = response.result
      // Keep safe data in localStorage
      saveUser(response.result)
      return response.result
    }
  } catch (error) {
    console.error('Error fetching full user data:', error)
    return null
  }
}

// ============================================================================
// 🔐 PROFILE VALIDATION FLOW - Core Function
// ============================================================================
// Validate token và lấy thông tin đầy đủ
const validateProfileAccess = async () => {
  try {
    const token = getStorageItem('easymart-token')
    if (!token) {
      throw new Error('Không có token xác thực')
    }

    console.log('🔍 Validating token for profile access...')
    
    // Step 1: Validate token để lấy username
    console.log('📡 Step 1: Calling validate-token API...')
    const validateResponse = await apiCall(API_CONFIG.AUTH.VALIDATE_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ token: token })
    })
    
    console.log('📥 Validate token response:', validateResponse)
    
    if (!validateResponse?.result?.valid) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn')
    }
    
    const { username, role, expiration } = validateResponse.result
    console.log('✅ Token validated:', { username, role, expiration })
    
    // Step 2: Lấy mã người dùng từ email
    console.log('📡 Step 2: Calling GET_BY_EMAIL API...')
    const emailEndpoint = API_CONFIG.USER.GET_BY_EMAIL.replace('{email}', username)
    console.log('🔗 Email endpoint:', emailEndpoint)
    
    const userResponse = await apiCall(emailEndpoint, {
      method: 'GET'
    })
    
    console.log('📥 User response:', userResponse)
    
    // Check different response formats
    let userData = null
    if (userResponse?.result) {
      userData = userResponse.result
    } else if (userResponse?.data) {
      userData = userResponse.data
    } else if (userResponse?.maNguoiDung) {
      userData = userResponse
    } else {
      console.error('❌ Unexpected user response format:', userResponse)
      throw new Error('Response format không đúng từ API người dùng')
    }
    
    const { maNguoiDung, vaiTro } = userData
    console.log('👤 User info retrieved:', { maNguoiDung, vaiTro })
    
    if (!maNguoiDung) {
      throw new Error('Không tìm thấy mã người dùng trong response')
    }
    
    // Step 3: Lấy thông tin khách hàng đầy đủ
    console.log('📡 Step 3: Calling customer API...')
    
    // Lấy thông tin khách hàng từ endpoint chính xác
    console.log('📡 Step 3: Calling customer API...')
    
    let customerData = null
    let customerResponse = null
    
          // Sử dụng endpoint chính cho cả hai loại user (đăng nhập thường và Google OAuth2)
      const endpoints = [
        `/api/khachhang/by-nguoidung/${maNguoiDung}`,  // ✅ Endpoint chính cho cả hai loại user
        `/api/khachhang/${maNguoiDung}`,               // Fallback 1
        `/api/nguoidung/${maNguoiDung}`                // Fallback 2
      ]
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i]
      console.log(`🔗 Trying endpoint ${i + 1}: ${endpoint}`)
      
      try {
        const fullEndpoint = `${API_CONFIG.BASE_URL}${endpoint}`
        console.log(`🔗 Full URL: ${fullEndpoint}`)
        
        customerResponse = await fetch(fullEndpoint, { 
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log(`📡 Response ${i + 1} status:`, customerResponse.status)
        console.log(`📡 Response ${i + 1} redirected:`, customerResponse.redirected)
        
        if (customerResponse.ok) {
          const contentType = customerResponse.headers.get('content-type')
          console.log(`📡 Response ${i + 1} Content-Type:`, contentType)
          
          if (contentType && contentType.includes('application/json')) {
            const responseData = await customerResponse.json()
            console.log(`✅ Endpoint ${i + 1} success:`, responseData)
            
            // Xử lý response format khác nhau giữa đăng nhập thường và Google OAuth2
            if (responseData?.hoTen) {
              // Format customer data - đăng nhập thường
              console.log('✅ Response có hoTen - format customer data')
              customerData = {
                hoTen: responseData.hoTen,
                soDienThoai: responseData.sdt, // Map từ sdt
                ngaySinh: responseData.ngaySinh,
                diaChi: responseData.diaChi,
                ngayTao: responseData.ngayDangKy,
                tongDonHang: 0, // Chưa có trong response
                tongChiTieu: 0,  // Chưa có trong response
                // Thêm thông tin mới
                maKH: responseData.maKH,
                diemTichLuy: responseData.diemTichLuy,
                loaiKhachHang: responseData.loaiKhachHang,
                nguoiDung: responseData.nguoiDung,
                // Thêm field gốc để debug
                sdt: responseData.sdt
              }
            } else if (responseData?.token) {
              // Format token - Google OAuth2 user, cần gọi API khác để lấy customer info
              console.log('⚠️ Response chỉ có token - cần xử lý khác cho Google OAuth2 user')
              
              try {
                // Gọi API để lấy thông tin customer từ maNguoiDung
                console.log('🔄 Gọi API /api/nguoidung để lấy customer info...')
                const customerInfoResponse = await fetch(`${API_CONFIG.BASE_URL}/api/nguoidung/${maNguoiDung}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                })
                
                if (customerInfoResponse.ok) {
                  const customerInfo = await customerInfoResponse.json()
                  console.log('✅ Customer info từ /api/nguoidung:', customerInfo)
                  
                  customerData = {
                    hoTen: customerInfo.tenNguoiDung || username.split('@')[0],
                    soDienThoai: customerInfo.soDienThoai || '',
                    ngaySinh: customerInfo.ngaySinh || null,
                    diaChi: customerInfo.diaChi || '',
                    ngayTao: customerInfo.ngayTao || new Date().toISOString().split('T')[0],
                    tongDonHang: 0,
                    tongChiTieu: 0,
                    // Thông tin cho Google OAuth2 user
                    maKH: customerInfo.maNguoiDung,
                    diemTichLuy: 0,
                    loaiKhachHang: 'OAuth2 User',
                    sdt: customerInfo.soDienThoai || ''
                  }
                } else {
                  console.log('❌ Không thể lấy customer info từ /api/nguoidung')
                  continue // Thử endpoint tiếp theo
                }
              } catch (error) {
                console.log('❌ Lỗi khi gọi /api/nguoidung:', error.message)
                continue // Thử endpoint tiếp theo
              }
            } else if (responseData?.result) {
              customerData = responseData.result
            } else if (responseData?.data) {
              customerData = responseData.data
            } else {
              // Không có hoTen, token, result, data - có thể là Google OAuth2 user
              console.log('⚠️ Response không có hoTen, token, result, data - có thể là Google OAuth2 user')
              
              // Kiểm tra nếu là Google OAuth2 user dựa trên email domain
              const isGoogleUser = username.includes('@gmail.com') || username.includes('@fpt.edu.vn')
              
              if (isGoogleUser) {
                console.log('🔍 Detected Google OAuth2 user, calling /api/nguoidung...')
                
                try {
                  // Gọi API để lấy thông tin customer từ maNguoiDung
                  console.log('🔄 Gọi API /api/nguoidung để lấy customer info...')
                  const customerInfoResponse = await fetch(`${API_CONFIG.BASE_URL}/api/nguoidung/${maNguoiDung}`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  })
                  
                  if (customerInfoResponse.ok) {
                    const customerInfo = await customerInfoResponse.json()
                    console.log('✅ Customer info từ /api/nguoidung:', customerInfo)
                    
                    // Kiểm tra và xử lý dữ liệu phone và address
                    let phoneData = ''
                    let addressData = ''
                    
                    // Thử nhiều field name khác nhau cho phone
                    if (customerInfo.soDienThoai) {
                      phoneData = customerInfo.soDienThoai
                    } else if (customerInfo.sdt) {
                      phoneData = customerInfo.sdt
                    } else if (customerInfo.phone) {
                      phoneData = customerInfo.phone
                    } else if (customerInfo.dienThoai) {
                      phoneData = customerInfo.dienThoai
                    }
                    
                    // Thử nhiều field name khác nhau cho address
                    if (customerInfo.diaChi) {
                      addressData = customerInfo.diaChi
                    } else if (customerInfo.address) {
                      addressData = customerInfo.address
                    } else if (customerInfo.diaChiChiTiet) {
                      addressData = customerInfo.diaChiChiTiet
                    }
                    
                    customerData = {
                      hoTen: customerInfo.tenNguoiDung || customerInfo.hoTen || username.split('@')[0],
                      soDienThoai: phoneData,
                      ngaySinh: customerInfo.ngaySinh || null,
                      diaChi: addressData,
                      ngayTao: customerInfo.ngayTao || customerInfo.ngayDangKy || new Date().toISOString().split('T')[0],
                      tongDonHang: 0,
                      tongChiTieu: 0,
                      // Thông tin cho Google OAuth2 user
                      maKH: customerInfo.maNguoiDung || customerInfo.maKH || maNguoiDung,
                      diemTichLuy: 0,
                      loaiKhachHang: 'OAuth2 User',
                      sdt: phoneData  // Sử dụng phoneData đã xử lý
                    }
                  } else {
                    console.log('❌ Không thể lấy customer info từ /api/nguoidung')
                    continue // Thử endpoint tiếp theo
                  }
                } catch (error) {
                  console.log('❌ Lỗi khi gọi /api/nguoidung:', error.message)
                  continue // Thử endpoint tiếp theo
                }
              } else {
                console.log(`⚠️ Endpoint ${i + 1} response format không xác định:`, responseData)
                continue // Thử endpoint tiếp theo
              }
            }
            
            console.log(`✅ Found working endpoint: ${endpoint}`)
            break // Thoát vòng lặp nếu tìm thấy endpoint hoạt động
          } else {
            const responseText = await customerResponse.text()
            console.log(`⚠️ Endpoint ${i + 1} returned non-JSON:`, responseText.substring(0, 200))
            continue // Thử endpoint tiếp theo
          }
        } else if (customerResponse.redirected) {
          console.log(`⚠️ Endpoint ${i + 1} was redirected - trying /api/nguoidung directly...`)
          
          // Kiểm tra nếu là Google OAuth2 user và bị redirect
          const isGoogleUser = username.includes('@gmail.com') || username.includes('@fpt.edu.vn')
          
          if (isGoogleUser) {
            try {
              // Gọi trực tiếp /api/nguoidung thay vì thử endpoints khác
              const directResponse = await fetch(`${API_CONFIG.BASE_URL}/api/nguoidung/${maNguoiDung}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              
              if (directResponse.ok) {
                const directInfo = await directResponse.json()
                console.log('✅ Direct call to /api/nguoidung successful')
                
                // Xử lý dữ liệu tương tự như đã làm
                let phoneData = directInfo.soDienThoai || directInfo.sdt || directInfo.phone || directInfo.dienThoai || ''
                let addressData = directInfo.diaChi || directInfo.address || directInfo.diaChiChiTiet || ''
                
                customerData = {
                  hoTen: directInfo.tenNguoiDung || directInfo.hoTen || username.split('@')[0],
                  soDienThoai: phoneData,
                  ngaySinh: directInfo.ngaySinh || null,
                  diaChi: addressData,
                  ngayTao: directInfo.ngayTao || directInfo.ngayDangKy || new Date().toISOString().split('T')[0],
                  tongDonHang: 0,
                  tongChiTieu: 0,
                  // Thông tin cho Google OAuth2 user
                  maKH: directInfo.maNguoiDung || directInfo.maKH || maNguoiDung,
                  diemTichLuy: 0,
                  loaiKhachHang: 'OAuth2 User',
                  sdt: phoneData
                }
                
                console.log(`✅ Found working solution: direct call to /api/nguoidung`)
                break // Thoát vòng lặp
              } else {
                console.log('❌ Direct call to /api/nguoidung failed with status:', directResponse.status)
                continue // Thử endpoint tiếp theo
              }
            } catch (directError) {
              console.log('❌ Error in direct call to /api/nguoidung:', directError.message)
              continue // Thử endpoint tiếp theo
            }
          } else {
            console.log(`⚠️ Endpoint ${i + 1} failed with status:`, customerResponse.status)
            continue // Thử endpoint tiếp theo
          }
        } else {
          console.log(`⚠️ Endpoint ${i + 1} failed with status:`, customerResponse.status)
          continue // Thử endpoint tiếp theo
        }
      } catch (error) {
        console.log(`❌ Endpoint ${i + 1} error:`, error.message)
        continue // Thử endpoint tiếp theo
      }
    }
    
    // Nếu không tìm thấy endpoint nào hoạt động
    if (!customerData) {
      console.log('⚠️ No working customer endpoint found, creating basic data')
      
      // Kiểm tra nếu là Google OAuth2 user để tạo dữ liệu phù hợp
      const isGoogleUser = username.includes('@gmail.com') || username.includes('@fpt.edu.vn')
      
      if (isGoogleUser) {
        console.log('🔍 Fallback: Creating OAuth2 user data structure')
        
        // Thử gọi API /api/nguoidung một lần nữa trong fallback
        try {
          console.log('🔄 Fallback: Thử gọi /api/nguoidung một lần nữa...')
          const fallbackResponse = await fetch(`${API_CONFIG.BASE_URL}/api/nguoidung/${maNguoiDung}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (fallbackResponse.ok) {
            const fallbackInfo = await fallbackResponse.json()
            console.log('✅ Fallback: Customer info từ /api/nguoidung')
            
            // Xử lý dữ liệu tương tự như trên
            let phoneData = fallbackInfo.soDienThoai || fallbackInfo.sdt || fallbackInfo.phone || fallbackInfo.dienThoai || ''
            let addressData = fallbackInfo.diaChi || fallbackInfo.address || fallbackInfo.diaChiChiTiet || ''
            
            customerData = {
              hoTen: fallbackInfo.tenNguoiDung || fallbackInfo.hoTen || username.split('@')[0],
              soDienThoai: phoneData,
              ngaySinh: fallbackInfo.ngaySinh || null,
              diaChi: addressData,
              ngayTao: fallbackInfo.ngayTao || fallbackInfo.ngayDangKy || new Date().toISOString().split('T')[0],
              tongDonHang: 0,
              tongChiTieu: 0,
              // Thông tin cho Google OAuth2 user
              maKH: fallbackInfo.maNguoiDung || fallbackInfo.maKH || maNguoiDung,
              diemTichLuy: 0,
              loaiKhachHang: 'OAuth2 User',
              sdt: phoneData
            }
          } else {
            console.log('❌ Fallback: Không thể lấy customer info từ /api/nguoidung')
            // Tạo dữ liệu cơ bản
            customerData = {
              hoTen: username.split('@')[0],
              soDienThoai: '',
              ngayTao: new Date().toISOString().split('T')[0],
              tongDonHang: 0,
              tongChiTieu: 0,
              diaChi: '',
              // Thông tin cho Google OAuth2 user
              maKH: maNguoiDung,
              diemTichLuy: 0,
              loaiKhachHang: 'OAuth2 User',
              sdt: ''
            }
          }
        } catch (fallbackError) {
          console.log('❌ Fallback: Lỗi khi gọi /api/nguoidung:', fallbackError.message)
          // Tạo dữ liệu cơ bản
          customerData = {
            hoTen: username.split('@')[0],
            soDienThoai: '',
            ngayTao: new Date().toISOString().split('T')[0],
            tongDonHang: 0,
            tongChiTieu: 0,
            diaChi: '',
            // Thông tin cho Google OAuth2 user
            maKH: maNguoiDung,
            diemTichLuy: 0,
            loaiKhachHang: 'OAuth2 User',
            sdt: ''
          }
        }
      } else {
        customerData = {
          hoTen: username.split('@')[0],
          soDienThoai: '',
          ngayTao: new Date().toISOString().split('T')[0],
          tongDonHang: 0,
          tongChiTieu: 0,
          diaChi: ''
        }
      }
    }
    
    console.log('🏪 Final customer data:', customerData)
    
    // Step 4: Cập nhật user state với thông tin đầy đủ
    // Xác định loginMethod dựa trên response format
    const isOAuth2User = customerData.loaiKhachHang === 'OAuth2 User'
    
    const fullUserData = {
      id: maNguoiDung,
      name: customerData.hoTen || username.split('@')[0],
      email: username,
      phone: customerData.soDienThoai || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerData.hoTen || username.split('@')[0])}&background=007bff&color=fff`,
      joinDate: customerData.ngayTao || new Date().toISOString().split('T')[0],
      totalOrders: customerData.tongDonHang || 0,
      totalSpent: customerData.tongChiTieu || 0,
      role: vaiTro === 3 ? 'CUSTOMER' : 'USER',
      loginMethod: isOAuth2User ? 'google' : 'traditional',
      // Additional customer data
      customerInfo: customerData,
      userRole: vaiTro,
      userCode: maNguoiDung
    }
    
    // Update user state
    user.value = fullUserData
    // Save user without triggering event to avoid infinite loop
    saveUser({ ...fullUserData, triggerEvent: false })
    
    console.log('✅ Profile validation completed successfully')
    return { success: true, user: fullUserData }
    
  } catch (error) {
    console.error('❌ Profile validation failed:', error)
    
    // Clear invalid data
    if (error.message.includes('Token không hợp lệ') || error.message.includes('Không có token')) {
      logout()
    }
    
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 🔄 PROFILE UPDATE FUNCTIONS
// ============================================================================
// Update customer profile
const updateCustomerProfile = async (updateData) => {
  try {
    const token = getStorageItem('easymart-token')
    if (!token) {
      throw new Error('Không có token xác thực')
    }
    
    // First validate profile access to get current data
    const validation = await validateProfileAccess()
    if (!validation.success) {
      throw new Error(validation.error)
    }
    
    const { userCode } = user.value
    
    // Update customer profile sử dụng endpoint chính xác
    const updateEndpoint = `${API_CONFIG.BASE_URL}/api/khachhang/by-nguoidung/${userCode}`
    console.log('🔗 Update customer endpoint:', updateEndpoint)
    console.log('📤 Update data being sent:', updateData)
    
    const updateResponse = await fetch(updateEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    })
    
    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`)
    }
    
    const updateResult = await updateResponse.json()
    console.log('📥 Update response:', updateResult)
    
    // Kiểm tra response format khác nhau
    if (updateResult?.success || updateResult?.result?.success || updateResult?.message?.includes('thành công')) {
      console.log('✅ Update successful, refreshing user data...')
      // Refresh user data
      await validateProfileAccess()
      return { success: true, message: 'Cập nhật profile thành công!' }
    } else {
      console.log('⚠️ Update response format unexpected:', updateResult)
      // Nếu response không có success flag nhưng status 200, coi như thành công
      if (updateResponse.ok) {
        console.log('✅ Update successful (status 200), refreshing user data...')
        await validateProfileAccess()
        return { success: true, message: 'Cập nhật profile thành công!' }
      } else {
        throw new Error(updateResult?.message || updateResult?.error || 'Cập nhật profile thất bại')
      }
    }
    
  } catch (error) {
    console.error('❌ Update profile failed:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 🧪 TESTING & DEBUG FUNCTIONS
// ============================================================================
// Test API endpoints để debug
const testProfileAPIs = async () => {
  try {
    const token = getStorageItem('easymart-token')
    if (!token) {
      console.error('❌ No token available')
      return { success: false, error: 'No token' }
    }

    console.log('🧪 Testing Profile APIs...')
    console.log('🔑 Token available:', token.substring(0, 20) + '...')
    
    // Test 1: Validate token
    console.log('🔍 Test 1: Validate token')
    try {
      const validateResponse = await apiCall(API_CONFIG.AUTH.VALIDATE_TOKEN, {
        method: 'POST',
        body: JSON.stringify({ token: token })
      })
      console.log('✅ Validate token success:', validateResponse)
      
      // Get username from response
      const username = validateResponse?.result?.username
      if (username) {
        console.log('👤 Username from token:', username)
        
        // Test 2: Get user by email
        console.log('🔍 Test 2: Get user by email')
        try {
          const emailEndpoint = API_CONFIG.USER.GET_BY_EMAIL.replace('{email}', username)
          console.log('🔗 Testing endpoint:', emailEndpoint)
          
          const userResponse = await apiCall(emailEndpoint, { method: 'GET' })
          console.log('✅ Get user by email success:', userResponse)
          
          // Test 3: Test customer endpoint chính xác
          if (userResponse?.maNguoiDung) {
            const maNguoiDung = userResponse.maNguoiDung
            console.log('🔍 Test 3: Testing customer endpoint with maNguoiDung:', maNguoiDung)
            
            // Test multiple customer endpoints
            const testEndpoints = [
              `/api/khachhang/by-nguoidung/${maNguoiDung}`,
              `/api/khachhang/${maNguoiDung}`,
              `/api/nguoidung/${maNguoiDung}`,
              `/api/khachhang/profile/${maNguoiDung}`,
              `/api/user/profile/${maNguoiDung}`
            ]
            
            for (let i = 0; i < testEndpoints.length; i++) {
              const endpoint = testEndpoints[i]
              console.log(`🔍 Testing endpoint ${i + 1}: ${endpoint}`)
              
              try {
                const fullEndpoint = `${API_CONFIG.BASE_URL}${endpoint}`
                console.log(`🔗 Full URL: ${fullEndpoint}`)
                console.log('🔑 Using Authorization header with token')
                
                const customerResponse = await fetch(fullEndpoint, { 
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                })
                
                console.log(`📡 Endpoint ${i + 1} status:`, customerResponse.status)
                const contentType = customerResponse.headers.get('content-type')
                console.log(`📡 Endpoint ${i + 1} Content-Type:`, contentType)
                
                if (customerResponse.ok && contentType && contentType.includes('application/json')) {
                  const customerData = await customerResponse.json()
                  console.log(`✅ Endpoint ${i + 1} success:`, customerData)
                  
                  // Test response structure
                  if (customerData?.result) {
                    console.log('📊 Response structure: result object found')
                    console.log('👤 Customer name:', customerData.result.hoTen)
                    console.log('📱 Phone (sdt):', customerData.result.sdt)
                    console.log('📱 Phone (soDienThoai):', customerData.result.soDienThoai)
                    console.log('📅 Created:', customerData.result.ngayTao)
                  } else if (customerData?.hoTen) {
                    console.log('📊 Response structure: direct customer data')
                    console.log('👤 Customer name:', customerData.hoTen)
                    console.log('📱 Phone (sdt):', customerData.sdt)
                    console.log('📱 Phone (soDienThoai):', customerData.soDienThoai)
                    console.log('📅 Created:', customerData.ngayTao)
                  } else {
                    console.log('⚠️ Unexpected response structure:', customerData)
                  }
                  
                  console.log(`✅ Found working endpoint: ${endpoint}`)
                  break // Thoát vòng lặp nếu tìm thấy endpoint hoạt động
                  
                } else {
                  const responseText = await customerResponse.text()
                  console.log(`⚠️ Endpoint ${i + 1} returned non-JSON:`, responseText.substring(0, 200))
                }
                
              } catch (error) {
                console.log(`❌ Endpoint ${i + 1} failed:`, error.message)
              }
            }
          }
          
        } catch (error) {
          console.error('❌ Get user by email failed:', error)
        }
      }
      
    } catch (error) {
      console.error('❌ Validate token failed:', error)
    }
    
    return { success: true, message: 'API tests completed - check console for details' }
    
  } catch (error) {
    console.error('❌ API tests failed:', error)
    return { success: false, error: error.message }
  }
}

// Test customer endpoint trực tiếp
const testCustomerEndpoint = async (maNguoiDung) => {
  try {
    const token = getStorageItem('easymart-token')
    if (!token) {
      return { success: false, error: 'No token available' }
    }

    console.log('🧪 Testing customer endpoint directly...')
    console.log('🔑 maNguoiDung:', maNguoiDung)
    
    const endpoint = `${API_CONFIG.BASE_URL}/api/khachhang/by-nguoidung/${maNguoiDung}`
    console.log('🔗 Endpoint:', endpoint)
    
    // Test 1: GET request
    console.log('🔍 Test 1: GET request')
    try {
      const response1 = await fetch(endpoint, { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('📡 GET Response status:', response1.status)
      const data1 = await response1.json()
      console.log('📡 GET Response data:', data1)
    } catch (error) {
      console.log('❌ GET Test failed:', error.message)
    }
    
    // Test 2: PUT request (test update)
    console.log('🔍 Test 2: PUT request (test update)')
    try {
      const testUpdateData = {
        hoTen: 'Test Update',
        soDienThoai: '0123456789',
        diaChi: 'Test Address'
      }
      
      console.log('📤 Test update data:', testUpdateData)
      
      const response2 = await fetch(endpoint, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUpdateData)
      })
      console.log('📡 PUT Response status:', response2.status)
      const data2 = await response2.json()
      console.log('📡 PUT Response data:', data2)
    } catch (error) {
      console.log('❌ PUT Test failed:', error.message)
    }
    
    return { success: true, message: 'Direct endpoint test completed' }
    
  } catch (error) {
    console.error('❌ Direct endpoint test failed:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// 🌐 API UTILITY FUNCTIONS
// ============================================================================
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

// ============================================================================
// 🔑 AUTHENTICATION FUNCTIONS - LOGIN
// ============================================================================
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
          setStorageItem('easymart-token', result.token)
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

// ============================================================================
// 🔑 AUTHENTICATION FUNCTIONS - OAUTH2
// ============================================================================
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

// ============================================================================
// 📝 REGISTRATION FUNCTIONS
// ============================================================================
// Register function - sử dụng API USER.REGISTER thật
const register = async (name, email, phone = '', password, confirmPassword, address = '') => {
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
    
    // Call USER.REGISTER API (/api/khachhang/register)
    const registerData = {
      email: email,
      matKhau: password,
      hoTen: name,           // Họ tên đầy đủ cho khách hàng
      sdt: phone || '',      // Số điện thoại (có thể để trống)
      diaChi: address || ''  // Địa chỉ (có thể để trống)
    }
    
    console.log('📤 Sending register data:', registerData)
    
    const registerResponse = await apiCall(API_CONFIG.USER.REGISTER, {
      method: 'POST',
      body: JSON.stringify(registerData)
    })
    
    console.log('📥 Received register response:', registerResponse)
    
    // registerResponse from /api/khachhang/register returns {login_info: {email, message}}
    if (registerResponse && registerResponse.login_info && registerResponse.login_info.email) {
      const loginInfo = registerResponse.login_info
      
      // Create user data for frontend (minimal info since user hasn't logged in yet)
      const userData = {
        id: 'CUSTOMER_' + Date.now(), // Will be updated when user logs in
        name: name,
        email: loginInfo.email,
        phone: phone || '',
        address: address || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=28a745&color=fff`,
        joinDate: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent: 0,
        role: 'USER',
        loginMethod: 'traditional'
      }
      
      // Note: Don't auto-login, let user login manually for security
      return { 
        success: true, 
        user: userData, 
        message: loginInfo.message || 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.'
      }
    } else {
      return { success: false, error: 'Đăng ký thất bại - Không nhận được thông tin xác nhận từ server' }
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

// ============================================================================
// 🔑 OAUTH2 & JWT FUNCTIONS
// ============================================================================
// Get JWT token from backend
const getJWTToken = async () => {
  try {
    const response = await apiCall(API_CONFIG.OAUTH2.GET_JWT_TOKEN)
    if (response.success) {
      setStorageItem('easymart-token', response.result.jwt_token)
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
    const token = getStorageItem('easymart-token')
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

// ============================================================================
// 🎭 ROLE & UTILITY FUNCTIONS
// ============================================================================
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
    const token = getStorageItem('easymart-token')
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
    const token = getStorageItem('easymart-token')
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
            setStorageItem('easymart-token', tokenInfo.jwt_token)
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

// ============================================================================
// 🚪 LOGOUT & CLEANUP FUNCTIONS
// ============================================================================
// Logout function - sử dụng API AUTH.LOGOUT mới
const logout = async () => {
  try {
    const token = getStorageItem('easymart-token')
    
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
    removeStorageItem('easymart-token')
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

// ============================================================================
// 🚀 INITIALIZATION & EXPORT
// ============================================================================
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
    handleOAuth2Callback,
    fetchFullUserData,
    validateProfileAccess,
    updateCustomerProfile,
    testProfileAPIs,
    testCustomerEndpoint,
    // Token utilities
    decodeToken,
    isTokenValid,
    initUserFromToken,
    debugCurrentToken,
    checkTokenValidity,
    autoLogoutIfInvalid,
    performAutoLogout,
    updateUserFromValidation,
    ensureUserComplete
  }
}