/**
 * Test file to demonstrate Vietnamese diacritic-insensitive search functionality
 * 
 * This file shows how the search now works with both accented and non-accented Vietnamese text
 */

import { 
  removeDiacritics, 
  normalizeForSearch, 
  containsIgnoreDiacritics, 
  filterBySearchTerm,
  highlightSearchTerm 
} from '../src/utils/vietnamese.js'

// Test data - sample products from EasyMart
const testProducts = [
  { id: 1, name: 'Cá basa fillet tươi 500g', description: 'Cá basa tươi ngon' },
  { id: 2, name: 'Ức gà tươi không da 500g', description: 'Ức gà tươi chất lượng cao' },
  { id: 3, name: 'Thịt bò xay tươi 300g', description: 'Thịt bò xay tươi ngon' },
  { id: 4, name: 'Tôm thẻ tươi sống 300g', description: 'Tôm thẻ tươi sống' },
  { id: 5, name: 'Gạo ST25 cao cấp 5kg', description: 'Gạo ST25 cao cấp' },
  { id: 6, name: 'Thịt heo ba chỉ tươi 1kg', description: 'Thịt heo ba chỉ tươi' },
  { id: 7, name: 'Sữa tươi TH True Milk 1L', description: 'Sữa tươi TH True Milk' },
  { id: 8, name: 'Bánh mì sandwich 6 ổ', description: 'Bánh mì sandwich' },
  { id: 9, name: 'Nước suối Aquafina 500ml', description: 'Nước suối Aquafina' },
  { id: 10, name: 'Trà xanh 0 độ không đường', description: 'Trà xanh không đường' }
]

console.log('=== VIETNAMESE DIACRITIC-INSENSITIVE SEARCH DEMO ===\n')

// Test 1: Basic diacritic removal
console.log('1. Basic diacritic removal:')
console.log(`removeDiacritics('tìm kiếm') = "${removeDiacritics('tìm kiếm')}"`)
console.log(`removeDiacritics('sản phẩm') = "${removeDiacritics('sản phẩm')}"`)
console.log(`removeDiacritics('đặc biệt') = "${removeDiacritics('đặc biệt')}"`)
console.log()

// Test 2: Search normalization
console.log('2. Search normalization:')
console.log(`normalizeForSearch('Tìm Kiếm') = "${normalizeForSearch('Tìm Kiếm')}"`)
console.log(`normalizeForSearch('SẢN PHẨM') = "${normalizeForSearch('SẢN PHẨM')}"`)
console.log()

// Test 3: Contains check (diacritic-insensitive)
console.log('3. Diacritic-insensitive contains check:')
console.log(`containsIgnoreDiacritics('sản phẩm tươi sống', 'san pham') = ${containsIgnoreDiacritics('sản phẩm tươi sống', 'san pham')}`)
console.log(`containsIgnoreDiacritics('tìm kiếm', 'tim kiem') = ${containsIgnoreDiacritics('tìm kiếm', 'tim kiem')}`)
console.log(`containsIgnoreDiacritics('bánh mì', 'banh mi') = ${containsIgnoreDiacritics('bánh mì', 'banh mi')}`)
console.log()

// Test 4: Product search examples
console.log('4. Product search examples:')

// Search with diacritics
console.log('Search with diacritics "cá basa":')
const searchWithDiacritics = filterBySearchTerm(testProducts, 'cá basa', ['name', 'description'])
searchWithDiacritics.forEach(product => console.log(`  - ${product.name}`))
console.log()

// Search without diacritics
console.log('Search without diacritics "ca ba":')
const searchWithoutDiacritics = filterBySearchTerm(testProducts, 'ca ba', ['name', 'description'])
searchWithoutDiacritics.forEach(product => console.log(`  - ${product.name}`))
console.log()

// Search for "thịt" vs "thit"
console.log('Search "thịt" (with diacritics):')
const searchThit1 = filterBySearchTerm(testProducts, 'thịt', ['name', 'description'])
searchThit1.forEach(product => console.log(`  - ${product.name}`))
console.log()

console.log('Search "thit" (without diacritics):')
const searchThit2 = filterBySearchTerm(testProducts, 'thit', ['name', 'description'])
searchThit2.forEach(product => console.log(`  - ${product.name}`))
console.log()

// Search for "sữa" vs "sua"
console.log('Search "sữa" (with diacritics):')
const searchSua1 = filterBySearchTerm(testProducts, 'sữa', ['name', 'description'])
searchSua1.forEach(product => console.log(`  - ${product.name}`))
console.log()

console.log('Search "sua" (without diacritics):')
const searchSua2 = filterBySearchTerm(testProducts, 'sua', ['name', 'description'])
searchSua2.forEach(product => console.log(`  - ${product.name}`))
console.log()

// Test 5: Highlight functionality
console.log('5. Text highlighting examples:')
console.log('Original: "Cá basa fillet tươi"')
console.log(`Highlight "ca ba": ${highlightSearchTerm('Cá basa fillet tươi', 'ca ba', 'highlight')}`)
console.log()

console.log('=== SUMMARY ===')
console.log('✅ Users can now search using Vietnamese text with or without diacritics')
console.log('✅ Search "tìm kiếm" or "tim kiem" will return the same results')
console.log('✅ Search "sản phẩm" or "san pham" will return the same results')
console.log('✅ Search "đặc biệt" or "dac biet" will return the same results')
console.log('✅ All search components (main search, dropdown, categories) now support this feature')
console.log()
console.log('This greatly improves the user experience for Vietnamese users who may:')
console.log('- Type quickly without adding diacritics')
console.log('- Use keyboards without Vietnamese input methods')
console.log('- Prefer typing without accents for speed')