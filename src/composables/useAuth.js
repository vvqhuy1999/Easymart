import { ref, computed } from 'vue'

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

// Login function
const login = async (email, password) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock user data - in real app this would come from API
    const userData = {
      id: 1,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=007bff&color=fff`,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: Math.floor(Math.random() * 20) + 1,
      totalSpent: Math.floor(Math.random() * 5000000) + 500000
    }
    
    saveUser(userData)
    return { success: true, user: userData }
  } catch (error) {
    return { success: false, error: 'Đăng nhập thất bại' }
  }
}

// Login with Google function
const loginWithGoogle = async (credential) => {
  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(credential.split('.')[1]))
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create user data from Google profile
    const userData = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      avatar: payload.picture || `https://ui-avatars.com/api/?name=${payload.name}&background=007bff&color=fff`,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: Math.floor(Math.random() * 20) + 1,
      totalSpent: Math.floor(Math.random() * 5000000) + 500000,
      loginMethod: 'google'
    }
    
    saveUser(userData)
    return { success: true, user: userData }
  } catch (error) {
    console.error('Google login error:', error)
    return { success: false, error: 'Đăng nhập với Google thất bại' }
  }
}

// Register function
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock registration - in real app this would create user in database
    const userData = {
      id: Date.now(), // Mock ID
      name: name,
      email: email,
      phone: phone,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=28a745&color=fff`,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0
    }
    
    saveUser(userData)
    return { success: true, user: userData }
  } catch (error) {
    return { success: false, error: 'Đăng ký thất bại' }
  }
}

// Register with Google function
const registerWithGoogle = async (credential) => {
  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(credential.split('.')[1]))
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create user data from Google profile for registration
    const userData = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      phone: '', // Google doesn't provide phone number, user can update later
      avatar: payload.picture || `https://ui-avatars.com/api/?name=${payload.name}&background=28a745&color=fff`,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      loginMethod: 'google'
    }
    
    saveUser(userData)
    return { success: true, user: userData }
  } catch (error) {
    console.error('Google register error:', error)
    return { success: false, error: 'Đăng ký với Google thất bại' }
  }
}

// Logout function
const logout = () => {
  localStorage.removeItem('easymart-user')
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
    register,
    registerWithGoogle,
    logout,
    loadUser
  }
}