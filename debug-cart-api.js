// Debug script để test Cart API
// Chạy trong browser console sau khi đăng nhập

console.log('🚀 Cart API Debug Script loaded')

// Import useCart (nếu có thể)
// const { testCartAPIConnection } = useCart()

// Debug function để test từng bước
const debugCartAPI = async () => {
  console.log('🧪 Starting Cart API Debug...')
  
  // 1. Kiểm tra token
  const token = localStorage.getItem('easymart-token')
  if (!token) {
    console.error('❌ No token found in localStorage')
    return
  }
  console.log('✅ Token found:', token.substring(0, 20) + '...')
  
  // 2. Kiểm tra token validity
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp < now
    console.log('📋 Token payload:', payload)
    console.log('⏰ Token expiry:', new Date(payload.exp * 1000))
    console.log('🕐 Current time:', new Date())
    console.log(isExpired ? '❌ Token is EXPIRED' : '✅ Token is valid')
    
    if (isExpired) {
      console.error('❌ Token expired, please login again')
      return
    }
  } catch (e) {
    console.error('❌ Invalid token format:', e)
    return
  }
  
  // 3. Test current-user endpoint
  console.log('🧪 Testing current-user endpoint...')
  try {
    const currentUserRes = await fetch('http://localhost:8080/api/giohang/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 Current-user status:', currentUserRes.status)
    
    if (currentUserRes.ok) {
      const userData = await currentUserRes.json()
      console.log('✅ Current-user data:', userData)
      
      // 4. Test cart endpoints with resolved maKH
      const maKH = userData.maKH
      if (maKH) {
        await testCartEndpoints(maKH, token)
      } else {
        console.error('❌ No maKH in current-user response')
      }
    } else {
      const errorText = await currentUserRes.text()
      console.error('❌ Current-user error:', errorText)
    }
  } catch (error) {
    console.error('❌ Current-user exception:', error)
  }
}

// Test các cart endpoints
const testCartEndpoints = async (maKH, token) => {
  console.log('🧪 Testing cart endpoints with maKH:', maKH)
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  // Test 1: Basic cart endpoint
  console.log('🧪 Testing basic cart endpoint...')
  try {
    const basicRes = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}`, { headers })
    console.log('📊 Basic cart status:', basicRes.status)
    
    if (basicRes.ok) {
      const basicData = await basicRes.json()
      console.log('✅ Basic cart data:', basicData)
    } else {
      const errorText = await basicRes.text()
      console.error('❌ Basic cart error:', errorText)
    }
  } catch (error) {
    console.error('❌ Basic cart exception:', error)
  }
  
  // Test 2: With-items endpoint
  console.log('🧪 Testing with-items endpoint...')
  try {
    const withItemsRes = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}/with-items`, { headers })
    console.log('📊 With-items status:', withItemsRes.status)
    
    if (withItemsRes.ok) {
      const withItemsData = await withItemsRes.json()
      console.log('✅ With-items data:', withItemsData)
    } else {
      const errorText = await withItemsRes.text()
      console.error('❌ With-items error:', errorText)
      
      // Nếu 404, có thể endpoint chưa được implement
      if (withItemsRes.status === 404) {
        console.error('💡 Suggestion: Check if backend has implemented /api/giohang/by-khachhang/{maKH}/with-items endpoint')
      }
    }
  } catch (error) {
    console.error('❌ With-items exception:', error)
  }
  
  // Test 3: Sync endpoint
  console.log('🧪 Testing sync endpoint...')
  try {
    const syncRes = await fetch('http://localhost:8080/api/giohang/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items: [
          { maSP: 'TEST001', soLuong: 1 }
        ]
      })
    })
    
    console.log('📊 Sync status:', syncRes.status)
    
    if (syncRes.ok) {
      const syncData = await syncRes.json()
      console.log('✅ Sync data:', syncData)
    } else {
      const errorText = await syncRes.text()
      console.error('❌ Sync error:', errorText)
    }
  } catch (error) {
    console.error('❌ Sync exception:', error)
  }
}

// Export function để có thể gọi từ console
window.debugCartAPI = debugCartAPI

console.log('✅ Debug functions loaded. Run: debugCartAPI()')
