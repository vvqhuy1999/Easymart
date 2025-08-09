// API Test Utilities
import { useAuth } from '../composables/useAuth'

/**
 * Test all OAuth2 APIs
 */
export const testAllOAuth2APIs = async () => {
  const { 
    testOAuth2Config, 
    checkEmailDuplicate, 
    checkUserEmailExists,
    getUserByEmail,
    checkOAuth2Sub, 
    getJWTToken, 
    getUserInfo,
    checkAuthStatus,
    validateToken
  } = useAuth()
  
  const results = {
    config: null,
    emailCheck: null,
    userEmailCheck: null,
    userByEmail: null,
    subCheck: null,
    token: null,
    userInfo: null,
    authStatus: null,
    tokenValidation: null
  }
  
  try {
    console.log('🧪 Testing OAuth2 Configuration...')
    results.config = await testOAuth2Config()
    console.log('✅ OAuth2 Config Test:', results.config)
  } catch (error) {
    console.error('❌ OAuth2 Config Test Failed:', error)
    results.config = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing Email Duplicate Check...')
    results.emailCheck = await checkEmailDuplicate('test@example.com')
    console.log('✅ Email Check Test:', results.emailCheck)
  } catch (error) {
    console.error('❌ Email Check Test Failed:', error)
    results.emailCheck = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing User Email Exists Check...')
    results.userEmailCheck = await checkUserEmailExists('test@example.com')
    console.log('✅ User Email Check Test:', results.userEmailCheck)
  } catch (error) {
    console.error('❌ User Email Check Test Failed:', error)
    results.userEmailCheck = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing Get User by Email...')
    results.userByEmail = await getUserByEmail('demo@easymart.vn')
    console.log('✅ Get User by Email Test:', results.userByEmail)
  } catch (error) {
    console.error('❌ Get User by Email Test Failed:', error)
    results.userByEmail = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing OAuth2 Sub Check...')
    results.subCheck = await checkOAuth2Sub('test_sub_id')
    console.log('✅ Sub Check Test:', results.subCheck)
  } catch (error) {
    console.error('❌ Sub Check Test Failed:', error)
    results.subCheck = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing JWT Token...')
    results.token = await getJWTToken()
    console.log('✅ JWT Token Test:', results.token)
  } catch (error) {
    console.error('❌ JWT Token Test Failed:', error)
    results.token = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing User Info...')
    results.userInfo = await getUserInfo()
    console.log('✅ User Info Test:', results.userInfo)
  } catch (error) {
    console.error('❌ User Info Test Failed:', error)
    results.userInfo = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing Auth Status...')
    results.authStatus = await checkAuthStatus()
    console.log('✅ Auth Status Test:', results.authStatus)
  } catch (error) {
    console.error('❌ Auth Status Test Failed:', error)
    results.authStatus = { error: error.message }
  }
  
  try {
    console.log('🧪 Testing Token Validation...')
    const token = localStorage.getItem('easymart-token')
    if (token) {
      results.tokenValidation = await validateToken(token)
      console.log('✅ Token Validation Test:', results.tokenValidation)
    } else {
      results.tokenValidation = { error: 'No token to validate' }
    }
  } catch (error) {
    console.error('❌ Token Validation Test Failed:', error)
    results.tokenValidation = { error: error.message }
  }
  
  return results
}

/**
 * Test authentication flow
 */
export const testAuthFlow = async () => {
  const { login, loginWithGoogle, register, registerWithGoogle } = useAuth()
  
  console.log('🧪 Testing Authentication Flow...')
  
  // Test traditional login (mock)
  try {
    console.log('Testing traditional login...')
    const loginResult = await login('test@example.com', 'password')
    console.log('Login Result:', loginResult)
  } catch (error) {
    console.error('Login Test Failed:', error)
  }
  
  // Test traditional register (mock)
  try {
    console.log('Testing traditional register...')
    const registerResult = await register('Test User', 'test@example.com', '0123456789', 'password', 'password')
    console.log('Register Result:', registerResult)
  } catch (error) {
    console.error('Register Test Failed:', error)
  }
}

/**
 * Test Google OAuth2 flow
 */
export const testGoogleOAuth2Flow = async (credential) => {
  const { loginWithGoogle, registerWithGoogle } = useAuth()
  
  console.log('🧪 Testing Google OAuth2 Flow...')
  
  try {
    console.log('Testing Google login...')
    const loginResult = await loginWithGoogle(credential)
    console.log('Google Login Result:', loginResult)
    return loginResult
  } catch (error) {
    console.error('Google Login Test Failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Test API connectivity
 */
export const testAPIConnectivity = async () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  
  console.log('🧪 Testing API Connectivity...')
  
  try {
    const response = await fetch(`${API_BASE}/api/oauth2/test-config`)
    const data = await response.json()
    console.log('✅ API Connectivity Test:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ API Connectivity Test Failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Validate Google OAuth2 response
 */
export const validateGoogleResponse = (response) => {
  console.log('🧪 Validating Google Response...')
  
  if (!response || !response.credential) {
    console.error('❌ Invalid Google response: missing credential')
    return { valid: false, error: 'Missing credential' }
  }
  
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]))
    
    if (!payload.email || !payload.sub) {
      console.error('❌ Invalid Google response: missing required fields')
      return { valid: false, error: 'Missing required fields' }
    }
    
    console.log('✅ Google Response Valid:', payload)
    return { valid: true, payload }
  } catch (error) {
    console.error('❌ Invalid Google response: cannot decode JWT')
    return { valid: false, error: 'Cannot decode JWT' }
  }
}

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Starting API Tests...')
  
  const results = {
    connectivity: await testAPIConnectivity(),
    oauth2: await testAllOAuth2APIs(),
    auth: await testAuthFlow()
  }
  
  console.log('📊 Test Results:', results)
  return results
}

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Uncomment to auto-run tests
  // runAllTests()
}
