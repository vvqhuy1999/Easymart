/**
 * Vietnamese Diacritic Normalization Utility
 * 
 * Provides functions to normalize Vietnamese text by removing diacritics (accents)
 * This enables search functionality that works with both accented and non-accented text
 */

/**
 * Mapping of Vietnamese characters with diacritics to their base characters
 */
const VIETNAMESE_MAP = {
  // Vowel 'a' variants
  'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
  
  // Vowel 'e' variants
  'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
  
  // Vowel 'i' variants
  'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
  
  // Vowel 'o' variants
  'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
  
  // Vowel 'u' variants
  'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
  
  // Vowel 'y' variants
  'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
  
  // Consonant 'd' variants
  'đ': 'd',
  
  // Uppercase variants
  'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
  
  'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
  
  'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
  
  'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
  
  'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
  
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
  
  'Đ': 'D'
}

/**
 * Removes Vietnamese diacritics from a string
 * @param {string} str - The input string with Vietnamese diacritics
 * @returns {string} - The normalized string without diacritics
 * 
 * @example
 * removeDiacritics('tìm kiếm') // returns 'tim kiem'
 * removeDiacritics('sản phẩm') // returns 'san pham'
 * removeDiacritics('đặc biệt') // returns 'dac biet'
 */
export function removeDiacritics(str) {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .split('')
    .map(char => VIETNAMESE_MAP[char] || char)
    .join('')
}

/**
 * Normalizes Vietnamese text for search comparison
 * Removes diacritics and converts to lowercase
 * @param {string} str - The input string
 * @returns {string} - The normalized string for search
 * 
 * @example
 * normalizeForSearch('Tìm Kiếm') // returns 'tim kiem'
 * normalizeForSearch('SẢN PHẨM') // returns 'san pham'
 */
export function normalizeForSearch(str) {
  if (!str || typeof str !== 'string') return ''
  
  return removeDiacritics(str.toLowerCase().trim())
}

/**
 * Checks if a text contains a search term (diacritic-insensitive)
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The search term
 * @returns {boolean} - True if the text contains the search term
 * 
 * @example
 * containsIgnoreDiacritics('sản phẩm tươi sống', 'san pham') // returns true
 * containsIgnoreDiacritics('tìm kiếm', 'tim kiem') // returns true
 * containsIgnoreDiacritics('bánh mì', 'banh mi') // returns true
 */
export function containsIgnoreDiacritics(text, searchTerm) {
  if (!text || !searchTerm) return false
  
  const normalizedText = normalizeForSearch(text)
  const normalizedSearchTerm = normalizeForSearch(searchTerm)
  
  return normalizedText.includes(normalizedSearchTerm)
}

/**
 * Filters an array of objects by a search term (diacritic-insensitive)
 * @param {Array} items - Array of objects to filter
 * @param {string} searchTerm - The search term
 * @param {Array<string>} searchFields - Array of field names to search in
 * @returns {Array} - Filtered array
 * 
 * @example
 * const products = [
 *   { name: 'Cá basa fillet', description: 'Cá tươi ngon' },
 *   { name: 'Thịt bò xay', description: 'Thịt bò tươi' }
 * ]
 * filterBySearchTerm(products, 'ca ba', ['name', 'description']) 
 * // returns [{ name: 'Cá basa fillet', description: 'Cá tươi ngon' }]
 */
export function filterBySearchTerm(items, searchTerm, searchFields) {
  if (!items || !Array.isArray(items) || !searchTerm || !searchFields || !Array.isArray(searchFields)) {
    return items || []
  }
  
  const normalizedSearchTerm = normalizeForSearch(searchTerm)
  if (!normalizedSearchTerm) return items
  
  return items.filter(item => {
    return searchFields.some(field => {
      const fieldValue = item[field]
      if (!fieldValue) return false
      
      return containsIgnoreDiacritics(fieldValue, searchTerm)
    })
  })
}

/**
 * Highlights search terms in text (diacritic-insensitive)
 * @param {string} text - The text to highlight
 * @param {string} searchTerm - The search term to highlight
 * @param {string} highlightClass - CSS class for highlighting (default: 'highlight')
 * @returns {string} - HTML string with highlighted terms
 * 
 * @example
 * highlightSearchTerm('Cá basa fillet tươi', 'ca ba', 'search-highlight')
 * // returns 'Cá basa fillet tươi' with 'Cá ba' wrapped in highlight spans
 */
export function highlightSearchTerm(text, searchTerm, highlightClass = 'highlight') {
  if (!text || !searchTerm) return text
  
  const normalizedSearchTerm = normalizeForSearch(searchTerm)
  if (!normalizedSearchTerm) return text
  
  // Create a regex that matches the search term ignoring diacritics
  const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0)
  
  let highlightedText = text
  
  searchWords.forEach(word => {
    // Create a pattern that matches the word with any diacritic variations
    const pattern = word
      .split('')
      .map(char => {
        // Find all Vietnamese characters that normalize to this base character
        const variants = Object.keys(VIETNAMESE_MAP).filter(key => 
          VIETNAMESE_MAP[key].toLowerCase() === char.toLowerCase()
        )
        variants.push(char.toLowerCase(), char.toUpperCase())
        
        // Create character class with all variants
        if (variants.length > 1) {
          return `[${variants.join('')}]`
        }
        return char
      })
      .join('')
    
    const regex = new RegExp(`(${pattern})`, 'gi')
    highlightedText = highlightedText.replace(regex, `<span class="${highlightClass}">$1</span>`)
  })
  
  return highlightedText
}

// Export default object for convenience
export default {
  removeDiacritics,
  normalizeForSearch,
  containsIgnoreDiacritics,
  filterBySearchTerm,
  highlightSearchTerm
}