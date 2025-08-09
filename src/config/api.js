// API Configuration based on the provided HTML test file
export const API_CONFIG = {
  // Base URL - adjust this to match your backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // OAuth2 Endpoints (từ file HTML test)
  OAUTH2: {
    // Configuration APIs
    TEST_CONFIG: '/api/oauth2/test-config',
    USER_INFO: '/api/oauth2/user-info',
    ANALYZE: '/api/oauth2/analyze',
    CHECK_EMAIL: '/api/oauth2/check-email',
    CHECK_SUB: '/api/oauth2/check-sub',
    GET_TOKEN: '/api/oauth2/get-token',
    
    // OAuth2 Callbacks (chỉ support GET theo HTML)
    GOOGLE_CALLBACK: '/api/oauth2/callback/google',
    FACEBOOK_CALLBACK: '/api/oauth2/callback/facebook',
    SUCCESS: '/api/oauth2/success',
    FAILURE: '/api/oauth2/failure',
    
    // Debug APIs
    DEBUG_FACEBOOK: '/api/oauth2/debug/facebook'
  },
  
  // OAuth2 Authorization URLs (từ HTML)
  AUTHORIZATION: {
    GOOGLE: '/oauth2/authorization/google',
    FACEBOOK: '/oauth2/authorization/facebook'
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get authorization URL
export const getAuthUrl = (provider) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.AUTHORIZATION[provider.toUpperCase()]}`
}
