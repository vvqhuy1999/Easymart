// Test script đơn giản để debug cart endpoints
// Copy và paste vào browser console

const testCartDebug = async () => {
  console.log('🧪 [DEBUG] Starting cart debug test...')
  
  // Lấy token
  const token = localStorage.getItem('easymart-token')
  if (!token) {
    console.error('❌ [DEBUG] No token found! Please login first.')
    return
  }
  
  console.log('✅ [DEBUG] Token found:', token.substring(0, 20) + '...')
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  // Test 1: Current user
  console.log('\n🧪 [DEBUG] 1. Testing current-user...')
  try {
    const res1 = await fetch('http://localhost:8080/api/giohang/current-user', { headers })
    console.log(`📊 Status: ${res1.status}`)
    
    if (res1.ok) {
      const data1 = await res1.json()
      console.log('✅ Data:', data1)
      
      if (data1.maKH) {
        const maKH = data1.maKH
        console.log(`\n🏪 [DEBUG] Found maKH: ${maKH}`)
        
        // Test 2: Basic cart
        console.log('\n🧪 [DEBUG] 2. Testing basic cart...')
        const res2 = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}`, { headers })
        console.log(`📊 Status: ${res2.status}`)
        
        if (res2.ok) {
          const data2 = await res2.json()
          console.log('✅ Data:', data2)
        } else {
          const error2 = await res2.text()
          console.error('❌ Error:', error2)
        }
        
        // Test 3: With-items
        console.log('\n🧪 [DEBUG] 3. Testing with-items...')
        const res3 = await fetch(`http://localhost:8080/api/giohang/by-khachhang/${maKH}/with-items`, { headers })
        console.log(`📊 Status: ${res3.status}`)
        
        if (res3.ok) {
          const data3 = await res3.json()
          console.log('✅ Data:', data3)
        } else {
          const error3 = await res3.text()
          console.error('❌ Error:', error3)
        }
      }
    } else {
      const error1 = await res1.text()
      console.error('❌ Error:', error1)
    }
  } catch (e) {
    console.error('❌ Exception:', e.message)
  }
  
  console.log('\n🏁 [DEBUG] Test completed!')
}

// Chạy test
testCartDebug()
