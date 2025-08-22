/**
 * 🗂️ LocalStorage Manager for EasyMart
 * Quản lý tập trung tất cả localStorage keys để tránh trùng lặp và dễ bảo trì
 */

// ============================================================================
// 📋 ESSENTIAL LOCALSTORAGE KEYS (CẦN THIẾT)
// ============================================================================
export const STORAGE_KEYS = {
  // 🔐 Authentication
  USER: 'easymart-user',
  TOKEN: 'easymart-token',
  
  // 🛒 Shopping
  SELECTED_ITEMS: 'easymart-selected-items',
  INVOICE: 'easymart-invoice',
  LAST_ORDER: 'easymart-last-order',
  
  // 🔄 Navigation
  REDIRECT_AFTER_LOGIN: 'easymart-redirect-after-login'
}

// ============================================================================
// 🧹 CLEANUP FUNCTIONS
// ============================================================================
export const clearNonEssentialStorage = () => {
  // Danh sách các keys cũ không còn sử dụng
  const deprecatedKeys = [
    'easymart-user-email',
    'easymart-user-role', 
    'easymart-user-id',
    'easymart-user-maKH',
    'easymart-orders',
    'easymart-cart',
    'easymart-auth',
    'checkout-order',
    'single-product-checkout'
  ]
  
  deprecatedKeys.forEach(key => {
    try {
      localStorage.removeItem(key)
      console.log(`🧹 Removed deprecated localStorage key: ${key}`)
    } catch (error) {
      console.warn(`Failed to remove ${key}:`, error)
    }
  })
}

export const clearAllStorage = () => {
  try {
    localStorage.clear()
    console.log('🧹 All localStorage cleared')
  } catch (error) {
    console.warn('Failed to clear localStorage:', error)
  }
}

export const clearShoppingStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ITEMS)
    localStorage.removeItem(STORAGE_KEYS.INVOICE)
    localStorage.removeItem(STORAGE_KEYS.LAST_ORDER)
    console.log('🧹 Shopping localStorage cleared')
  } catch (error) {
    console.warn('Failed to clear shopping localStorage:', error)
  }
}

// ============================================================================
// 🔍 STORAGE HEALTH CHECK
// ============================================================================
export const checkStorageHealth = () => {
  const essentialKeys = Object.values(STORAGE_KEYS)
  const allKeys = Object.keys(localStorage)
  
  const deprecatedKeys = allKeys.filter(key => 
    key.startsWith('easymart-') && !essentialKeys.includes(key)
  )
  
  const unknownKeys = allKeys.filter(key => 
    !key.startsWith('easymart-') && 
    !key.startsWith('oauth2-') && 
    !key.startsWith('google-') && 
    !key.startsWith('facebook-')
  )
  
  console.log('📊 LocalStorage Health Check:')
  console.log(`   - Essential keys: ${essentialKeys.length}`)
  console.log(`   - Deprecated keys: ${deprecatedKeys.length}`)
  console.log(`   - Unknown keys: ${unknownKeys.length}`)
  
  if (deprecatedKeys.length > 0) {
    console.warn('⚠️ Deprecated keys found:', deprecatedKeys)
  }
  
  if (unknownKeys.length > 0) {
    console.warn('⚠️ Unknown keys found:', unknownKeys)
  }
  
  return {
    essential: essentialKeys.length,
    deprecated: deprecatedKeys.length,
    unknown: unknownKeys.length,
    deprecatedKeys,
    unknownKeys
  }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================
export const initializeStorageManager = () => {
  // Clean up deprecated keys on startup
  clearNonEssentialStorage()
  
  // Check storage health
  checkStorageHealth()
  
  console.log('✅ LocalStorage Manager initialized')
}

// Auto-initialize when module is imported
initializeStorageManager()
