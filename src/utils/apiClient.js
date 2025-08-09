// API Client utility với JWT token authentication
import { API_CONFIG } from '../config/api'
import { getToken, setToken, removeToken } from './tokenStorage'

/**
 * Make authenticated API calls với JWT token
 * @param {string} endpoint - API endpoint (e.g., '/api/user/profile')
 * @param {object} options - Fetch options
 * @returns {Promise} - API response
 */
export async function apiCall(endpoint, options = {}) {
  const token = getToken()
  
  if (!token) {
    throw new Error('No JWT token found. Please login again.')
  }
  
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  }
  
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      ...defaultOptions,
      headers: { ...defaultOptions.headers, ...options.headers }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        console.warn('JWT token expired or invalid')
        removeToken()
        localStorage.removeItem('easymart-user')
        window.location.href = '/login'
        return
      }
      
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `API call failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

/**
 * Check if JWT token is valid (not expired)
 * @returns {boolean} - True if token is valid
 */
export function isTokenValid() {
  const token = getToken()
  if (!token) return false
  
  try {
    // Decode JWT payload (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // Check if token is expired
    return payload.exp > now
  } catch (error) {
    console.error('Error validating token:', error)
    return false
  }
}

/**
 * Get token expiration time
 * @returns {number|null} - Expiration timestamp or null if invalid
 */
export function getTokenExpiration() {
  const token = getToken()
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp
  } catch (error) {
    return null
  }
}

/**
 * Auto-refresh token when near expiration
 */
export async function autoRefreshToken() {
  const token = getToken()
  if (!token) return
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = payload.exp - now
    
    // Refresh if expires in less than 5 minutes (300 seconds)
    if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
      console.log('Token expiring soon, attempting refresh...')
      
      const response = await apiCall('/api/oauth2/get-jwt-token')
      if (response.success && response.result.jwt_token) {
        setToken(response.result.jwt_token)
        console.log('✅ Token refreshed successfully')
      }
    }
  } catch (error) {
    console.error('Auto-refresh failed:', error)
  }
}

/**
 * Start auto-refresh timer
 * Checks every minute for token expiration
 */
export function startTokenAutoRefresh() {
  // Run immediately
  autoRefreshToken()
  
  // Then run every minute
  return setInterval(autoRefreshToken, 60000)
}

/**
 * Logout user và clean up tokens
 */
export function logout() {
  removeToken()
  localStorage.removeItem('easymart-user')
  localStorage.removeItem('easymart-user-email')
  localStorage.removeItem('easymart-user-role')
  localStorage.removeItem('easymart-user-id')
  window.location.href = '/login'
}

// Export default object với tất cả functions
export default {
  apiCall,
  isTokenValid,
  getTokenExpiration,
  autoRefreshToken,
  startTokenAutoRefresh,
  logout
}
