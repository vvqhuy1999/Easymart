// Test script cho Cart Operations
// Chạy trong browser console sau khi đăng nhập

console.log('🧪 Cart Operations Test Script loaded')

// Helper function để wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Test comprehensive cart operations
const testCartOperations = async () => {
  console.log('🚀 Starting comprehensive cart operations test...')
  
  // Import useCart (adjust path as needed)
  const cart = window.useCart ? window.useCart() : null
  if (!cart) {
    console.error('❌ useCart not available. Make sure you are on a page that loads the cart composable')
    return
  }
  
  const { 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    debugCartState,
    syncItemIdsFromBackend,
    testCartAPIConnection,
    reloadCartFromBackend
  } = cart
  
  try {
    // Step 1: Clear cart to start fresh
    console.log('📋 Step 1: Clearing cart...')
    await clearCart()
    await wait(1000)
    
    // Step 2: Debug initial state
    console.log('📋 Step 2: Initial cart state')
    debugCartState()
    
    // Step 3: Test API connection
    console.log('📋 Step 3: Testing API connection...')
    const apiTest = await testCartAPIConnection()
    console.log('API Test Result:', apiTest)
    
    if (!apiTest.success) {
      console.error('❌ API connection failed, stopping test')
      return
    }
    
    // Step 4: Add some products
    console.log('📋 Step 4: Adding products to cart...')
    await addToCart('SP001', 2, { giaHienTai: 100000, tenSP: 'Test Product 1' })
    await wait(1000)
    
    await addToCart('SP002', 1, { giaHienTai: 200000, tenSP: 'Test Product 2' })
    await wait(1000)
    
    // Add same product again (should accumulate)
    await addToCart('SP001', 1, { giaHienTai: 100000, tenSP: 'Test Product 1' })
    await wait(1000)
    
    // Step 5: Debug cart state after adding
    console.log('📋 Step 5: Cart state after adding products')
    debugCartState()
    
    // Step 6: Sync itemIds if needed
    console.log('📋 Step 6: Syncing itemIds...')
    const syncResult = await syncItemIdsFromBackend()
    console.log('Sync result:', syncResult)
    
    // Step 7: Debug cart state after sync
    console.log('📋 Step 7: Cart state after sync')
    debugCartState()
    
    // Step 8: Test quantity update
    console.log('📋 Step 8: Testing quantity update...')
    await updateCartQuantity('SP001', 5)
    await wait(1000)
    
    // Step 9: Debug after update
    console.log('📋 Step 9: Cart state after quantity update')
    debugCartState()
    
    // Step 10: Test remove item
    console.log('📋 Step 10: Testing remove item...')
    await removeFromCart('SP002')
    await wait(1000)
    
    // Step 11: Final cart state
    console.log('📋 Step 11: Final cart state')
    debugCartState()
    
    // Step 12: Reload from backend to verify
    console.log('📋 Step 12: Reloading from backend to verify...')
    await reloadCartFromBackend()
    debugCartState()
    
    console.log('✅ Cart operations test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Test individual operations
const testAddOperation = async (productId = 'SP001', quantity = 1) => {
  console.log(`🧪 Testing add operation: ${productId} x${quantity}`)
  
  const cart = window.useCart ? window.useCart() : null
  if (!cart) {
    console.error('❌ useCart not available')
    return
  }
  
  const { addToCart, debugCartState, syncItemIdsFromBackend } = cart
  
  console.log('Before add:')
  debugCartState()
  
  await addToCart(productId, quantity, { giaHienTai: 100000, tenSP: `Test Product ${productId}` })
  await wait(500)
  
  console.log('After add:')
  debugCartState()
  
  console.log('Syncing itemIds...')
  await syncItemIdsFromBackend()
  
  console.log('After sync:')
  debugCartState()
}

const testRemoveOperation = async (productId = 'SP001') => {
  console.log(`🧪 Testing remove operation: ${productId}`)
  
  const cart = window.useCart ? window.useCart() : null
  if (!cart) {
    console.error('❌ useCart not available')
    return
  }
  
  const { removeFromCart, debugCartState } = cart
  
  console.log('Before remove:')
  debugCartState()
  
  await removeFromCart(productId)
  await wait(500)
  
  console.log('After remove:')
  debugCartState()
}

const testUpdateOperation = async (productId = 'SP001', quantity = 5) => {
  console.log(`🧪 Testing update operation: ${productId} to ${quantity}`)
  
  const cart = window.useCart ? window.useCart() : null
  if (!cart) {
    console.error('❌ useCart not available')
    return
  }
  
  const { updateCartQuantity, debugCartState } = cart
  
  console.log('Before update:')
  debugCartState()
  
  await updateCartQuantity(productId, quantity)
  await wait(500)
  
  console.log('After update:')
  debugCartState()
}

// Export functions to global scope
window.testCartOperations = testCartOperations
window.testAddOperation = testAddOperation
window.testRemoveOperation = testRemoveOperation
window.testUpdateOperation = testUpdateOperation

console.log('✅ Test functions loaded:')
console.log('- testCartOperations() - Comprehensive test')
console.log('- testAddOperation(productId, quantity) - Test add')
console.log('- testRemoveOperation(productId) - Test remove')
console.log('- testUpdateOperation(productId, quantity) - Test update')
console.log('')
console.log('💡 Example usage:')
console.log('testCartOperations()')
console.log('testAddOperation("SP001", 2)')
console.log('testRemoveOperation("SP001")')
console.log('testUpdateOperation("SP001", 5)')
