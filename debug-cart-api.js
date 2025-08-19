// Debug script để test cart API endpoints
// Copy và paste vào browser console để chạy

const debugCartAPI = async () => {
  console.log('🧪 [CART][DEBUG] Starting comprehensive cart API test...')
  
  // 1. Kiểm tra token
  const token = localStorage.getItem('easymart-token') || document.cookie.split(';').find(c => c.trim().startsWith('easymart-token='))?.split('=')[1]
  console.log('🔑 [CART][DEBUG] Token found:', !!token)
  if (token) {
    console.log('🔑 [CART][DEBUG] Token preview:', token.substring(0, 20) + '...')
    
    // Decode JWT để kiểm tra
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('🔍 [CART][DEBUG] Token payload:', payload)
      console.log('⏰ [CART][DEBUG] Token expires:', new Date(payload.exp * 1000))
      console.log('✅ [CART][DEBUG] Token valid:', payload.exp > Date.now() / 1000)
    } catch (e) {
      console.error('❌ [CART][DEBUG] Token decode failed:', e)
    }
  }
  
  // 2. Kiểm tra user info
  const user = JSON.parse(localStorage.getItem('easymart-user') || 'null')
  console.log('👤 [CART][DEBUG] User info:', user)
  
  // 3. Test current-user endpoint
  console.log('🧪 [CART][DEBUG] Testing current-user endpoint...')
  try {
    const currentUserRes = await fetch('http://localhost:8080/api/giohang/current-user', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log('📊 [CART][DEBUG] Current-user status:', currentUserRes.status)
    
    if (currentUserRes.ok) {
      const currentUserData = await currentUserRes.json()
      console.log('✅ [CART][DEBUG] Current-user data:', currentUserData)
      
      // 4. Test cart endpoints với maKH từ current-user
      const maKH = currentUserData.maKH
      if (maKH) {
        console.log('🏪 [CART][DEBUG] Testing cart endpoints with maKH:', maKH)
        
        // Test basic cart endpoint
        console.log('🧪 [CART][DEBUG] Testing basic cart endpoint...')
        const basicCartRes = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        console.log('📊 [CART][DEBUG] Basic cart status:', basicCartRes.status)
        
        if (basicCartRes.ok) {
          const basicCartData = await basicCartRes.json()
          console.log('✅ [CART][DEBUG] Basic cart data:', basicCartData)
          
          // Kiểm tra response format
          if (Array.isArray(basicCartData)) {
            console.log('⚠️ [CART][DEBUG] Basic endpoint returned array - this may be incorrect')
          } else if (basicCartData && typeof basicCartData === 'object') {
            console.log('✅ [CART][DEBUG] Basic endpoint returned object - this looks correct')
          }
        } else {
          const errorText = await basicCartRes.text().catch(() => 'Unable to read')
          console.error('❌ [CART][DEBUG] Basic cart error:', errorText)
        }
        
        // Test with-items endpoint
        console.log('🧪 [CART][DEBUG] Testing with-items endpoint...')
        const withItemsRes = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}/with-items`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        console.log('📊 [CART][DEBUG] With-items status:', withItemsRes.status)
        
        if (withItemsRes.ok) {
          const withItemsData = await withItemsRes.json()
          console.log('✅ [CART][DEBUG] With-items data:', withItemsData)
        } else {
          const errorText = await withItemsRes.text().catch(() => 'Unable to read')
          console.error('❌ [CART][DEBUG] With-items error:', errorText)
        }
        
        // Test add item endpoint
        console.log('🧪 [CART][DEBUG] Testing add item endpoint...')
        const addItemRes = await fetch('http://localhost:8080/api/giohang/items', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            maSP: 'TEST_SP',
            soLuong: 1,
            donGiaHienTai: 10000
          })
        })
        console.log('📊 [CART][DEBUG] Add item status:', addItemRes.status)
        
        if (addItemRes.ok) {
          const addItemData = await addItemRes.json()
          console.log('✅ [CART][DEBUG] Add item success:', addItemData)
          
          // Cleanup: xóa item test
          if (addItemData.itemId) {
            console.log('🧹 [CART][DEBUG] Cleaning up test item...')
            const deleteRes = await fetch(`http://localhost:8080/api/giohang/items/${addItemData.itemId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            })
            console.log('🧹 [CART][DEBUG] Cleanup status:', deleteRes.status)
          }
        } else {
          const errorText = await addItemRes.text().catch(() => 'Unable to read')
          console.error('❌ [CART][DEBUG] Add item error:', errorText)
        }
        
      } else {
        console.error('❌ [CART][DEBUG] No maKH found in current-user response')
      }
    } else {
      const errorText = await currentUserRes.text().catch(() => 'Unable to read')
      console.error('❌ [CART][DEBUG] Current-user error:', errorText)
    }
  } catch (error) {
    console.error('❌ [CART][DEBUG] Test failed:', error)
  }
  
  // 5. Test product endpoints để kiểm tra trạng thái
  console.log('🧪 [CART][DEBUG] Testing product endpoints...')
  try {
    const testProducts = ['SP001', 'SP002', 'SP003']
    for (const productId of testProducts) {
      const productRes = await fetch(`http://localhost:8080/api/sanpham/${productId}`)
      console.log(`📊 [CART][DEBUG] Product ${productId} status:`, productRes.status)
      
      if (productRes.ok) {
        const productData = await productRes.json()
        console.log(`✅ [CART][DEBUG] Product ${productId} data:`, {
          maSP: productData.maSP,
          tenSP: productData.tenSP,
          trangThai: productData.trangThai,
          giaHienTai: productData.giaHienTai
        })
      } else {
        const errorText = await productRes.text().catch(() => 'Unable to read')
        console.error(`❌ [CART][DEBUG] Product ${productId} error:`, errorText)
      }
    }
  } catch (error) {
    console.error('❌ [CART][DEBUG] Product test failed:', error)
  }
  
  console.log('🏁 [CART][DEBUG] Test completed!')
}

// Chạy test
debugCartAPI()
