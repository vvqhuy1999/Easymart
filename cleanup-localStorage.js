/**
 * 🧹 LocalStorage Cleanup Script for EasyMart
 * Chạy script này trong browser console để dọn dẹp localStorage
 */

console.log('🧹 Starting LocalStorage cleanup...')

// Danh sách các keys cần thiết
const ESSENTIAL_KEYS = [
  'easymart-token',
  'easymart-user', 
  'easymart-selected-items',
  'easymart-redirect-after-login',
  'easymart-invoice',
  'easymart-last-order'
]

// Danh sách các keys cũ không còn sử dụng
const DEPRECATED_KEYS = [
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

// Lấy tất cả keys hiện tại
const allKeys = Object.keys(localStorage)
console.log('📋 Current localStorage keys:', allKeys)

// Tìm các keys deprecated
const foundDeprecated = allKeys.filter(key => DEPRECATED_KEYS.includes(key))
console.log('❌ Found deprecated keys:', foundDeprecated)

// Tìm các keys không rõ mục đích
const unknownKeys = allKeys.filter(key => 
  !key.startsWith('easymart-') && 
  !key.startsWith('oauth2-') && 
  !key.startsWith('google-') && 
  !key.startsWith('facebook-')
)
console.log('❓ Unknown keys:', unknownKeys)

// Dọn dẹp các keys deprecated
if (foundDeprecated.length > 0) {
  console.log('🧹 Removing deprecated keys...')
  foundDeprecated.forEach(key => {
    localStorage.removeItem(key)
    console.log(`   - Removed: ${key}`)
  })
  console.log('✅ Deprecated keys removed')
} else {
  console.log('✅ No deprecated keys found')
}

// Kiểm tra sau khi dọn dẹp
const remainingKeys = Object.keys(localStorage)
console.log('📋 Remaining localStorage keys:', remainingKeys)

// Thống kê
const essentialCount = remainingKeys.filter(key => ESSENTIAL_KEYS.includes(key)).length
const otherCount = remainingKeys.length - essentialCount

console.log('📊 Storage Summary:')
console.log(`   - Essential keys: ${essentialCount}`)
console.log(`   - Other keys: ${otherCount}`)
console.log(`   - Total: ${remainingKeys.length}`)

if (otherCount > 0) {
  console.log('⚠️ Other keys found:', remainingKeys.filter(key => !ESSENTIAL_KEYS.includes(key)))
}

console.log('🎉 LocalStorage cleanup completed!')
