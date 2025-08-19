// Test script toàn diện để kiểm tra cart endpoints
// Copy và paste vào browser console

const testCartEndpoints = async () => {
  console.log('🧪 [TEST] Starting comprehensive cart endpoint test...')
  
  // Lấy token từ cookie
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
  
  const token = getCookie('easymart-token')
  if (!token) {
    console.error('❌ [TEST] No token found in cookies! Please login first.')
    return
  }
  
  console.log('✅ [TEST] Token found:', token.substring(0, 20) + '...')
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  // Test 1: Current user endpoint
  console.log('\n🧪 [TEST] 1. Testing /api/giohang/current-user...')
  try {
    const res1 = await fetch('http://localhost:8080/api/giohang/current-user', { headers })
    console.log(`📊 Status: ${res1.status}`)
    
    if (res1.ok) {
      const data1 = await res1.json()
      console.log('✅ Data:', data1)
      
      if (data1.maKH) {
        const maKH = data1.maKH
        console.log(`\n🏪 [TEST] Found maKH: ${maKH}, testing cart endpoints...`)
        
        // Test 2: Basic cart endpoint
        console.log('\n🧪 [TEST] 2. Testing /api/giohang/by-khachhang/{maKH}...')
        try {
          const res2 = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}`, { headers })
          console.log(`📊 Status: ${res2.status}`)
          
          if (res2.ok) {
            const data2 = await res2.json()
            console.log('✅ Data:', data2)
            console.log('📋 Type:', typeof data2, Array.isArray(data2) ? 'Array' : 'Object')
            
            // Kiểm tra response format
            if (Array.isArray(data2)) {
              if (data2.length === 0) {
                console.warn('⚠️ Endpoint returned empty array - this suggests the endpoint exists but returns no data')
              } else {
                console.log('✅ Endpoint returned array with data')
              }
            } else if (data2 && typeof data2 === 'object') {
              console.log('✅ Endpoint returned object - this looks correct')
            }
          } else {
            const error2 = await res2.text()
            console.error('❌ Error:', error2)
          }
        } catch (e2) {
          console.error('❌ Exception:', e2.message)
        }
        
        // Test 3: With-items endpoint
        console.log('\n🧪 [TEST] 3. Testing /api/giohang/by-khachhang/{maKH}/with-items...')
        try {
          const res3 = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}/with-items`, { headers })
          console.log(`📊 Status: ${res3.status}`)
          
          if (res3.ok) {
            const data3 = await res3.json()
            console.log('✅ Data:', data3)
          } else {
            const error3 = await res3.text()
            console.error('❌ Error:', error3)
            
            // Kiểm tra redirect
            if (res3.redirected) {
              console.warn('⚠️ Response was redirected!')
            }
            
            // Nếu 404, có thể endpoint chưa được implement
            if (res3.status === 404) {
              console.error('💡 Suggestion: Backend endpoint /api/giohang/by-khachhang/{maKH}/with-items is not implemented')
            }
          }
        } catch (e3) {
          console.error('❌ Exception:', e3.message)
        }
        
        // Test 4: Add item endpoint
        console.log('\n🧪 [TEST] 4. Testing /api/giohang/items (POST)...')
        try {
          const res4 = await fetch('http://localhost:8080/api/giohang/items', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              maSP: 'TEST_SP',
              soLuong: 1,
              donGiaHienTai: 10000
            })
          })
          console.log(`📊 Status: ${res4.status}`)
          
          if (res4.ok) {
            const data4 = await res4.json()
            console.log('✅ Data:', data4)
            
            // Cleanup: xóa item test
            if (data4.itemId) {
              console.log('🧹 Cleaning up test item...')
              const deleteRes = await fetch(`http://localhost:8080/api/giohang/items/${data4.itemId}`, {
                method: 'DELETE',
                headers
              })
              console.log('🧹 Cleanup status:', deleteRes.status)
            }
          } else {
            const error4 = await res4.text()
            console.error('❌ Error:', error4)
          }
        } catch (e4) {
          console.error('❌ Exception:', e4.message)
        }
        
      } else {
        console.error('❌ [TEST] No maKH found in current-user response')
      }
    } else {
      const error1 = await res1.text()
      console.error('❌ Error:', error1)
    }
  } catch (e1) {
    console.error('❌ Exception:', e1.message)
  }
  
  // Test 5: Product endpoints để kiểm tra trạng thái
  console.log('\n🧪 [TEST] 5. Testing product endpoints...')
  const testProducts = ['SP001', 'SP002', 'SP003']
  for (const productId of testProducts) {
    try {
      const res = await fetch(`http://localhost:8080/api/sanpham/${productId}`)
      console.log(`📊 Product ${productId}: ${res.status}`)
      
      if (res.ok) {
        const data = await res.json()
        console.log(`✅ ${productId}:`, {
          trangThai: data.trangThai,
          giaHienTai: data.giaHienTai,
          tenSP: data.tenSP
        })
        
        // Kiểm tra trạng thái sản phẩm
        if (data.trangThai === 1) {
          console.warn(`⚠️ Product ${productId} is INACTIVE (status: 1) - cannot be added to cart`)
        } else if (data.trangThai === 0) {
          console.log(`✅ Product ${productId} is ACTIVE (status: 0) - can be added to cart`)
        }
      } else {
        const errorText = await res.text().catch(() => 'Unable to read')
        console.error(`❌ Product ${productId} error:`, errorText)
      }
    } catch (e) {
      console.error(`❌ Product ${productId} exception:`, e.message)
    }
  }
  
  // Test 6: Kiểm tra backend health
  console.log('\n🧪 [TEST] 6. Testing backend health...')
  try {
    const healthRes = await fetch('http://localhost:8080/')
    console.log(`📊 Backend health status: ${healthRes.status}`)
    
    if (healthRes.ok) {
      console.log('✅ Backend is running')
    } else {
      console.warn('⚠️ Backend may have issues')
    }
  } catch (e) {
    console.error('❌ Backend health check failed:', e.message)
  }
  
  console.log('\n🏁 [TEST] All tests completed!')
  console.log('\n📋 Summary:')
  console.log('- If endpoints return 404: Backend has not implemented these endpoints yet')
  console.log('- If endpoints return empty arrays: Endpoints exist but return no data')
  console.log('- If products show status 1: Products are inactive and cannot be added to cart')
}

// Chạy test
testCartEndpoints()
