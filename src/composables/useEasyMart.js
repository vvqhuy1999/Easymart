import { ref, computed, onMounted } from 'vue'
import { useCart } from './useCart'
import CategoryService from '../utils/categoryService.js'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'
import { quickSearch, basicSearch, advancedSearch } from '../utils/searchService'

export function useEasyMart() {
  // Reactive state
  const products = ref([])
  const categories = ref([])
  const searchQuery = ref('')
  const notification = ref(null)
  const countdown = ref({ hours: 0, minutes: 0, seconds: 0 })
  const isLoadingCategories = ref(false)

  // Get cart functionality from singleton
  const { addToCart } = useCart()

  // Default data
  const defaultCategories = [
    { id: 1, name: 'Tươi Sống', icon: 'fas fa-leaf', color: 'success' },
    { id: 2, name: 'Đông lạnh', icon: 'fas fa-snowflake', color: 'info' },
    { id: 3, name: 'Đồ đóng hộp', icon: 'fas fa-can-food', color: 'warning' },
    { id: 4, name: 'Đồ Uống', icon: 'fas fa-tint', color: 'primary' },
    { id: 5, name: 'Sữa & Em bé', icon: 'fas fa-baby', color: 'info' },
    { id: 6, name: 'Gia Vị & Dầu Ăn', icon: 'fas fa-pepper-hot', color: 'danger' },
    { id: 7, name: 'Hóa Phẩm & Tẩy Rửa', icon: 'fas fa-soap', color: 'success' }
  ]

  // Computed properties
  const flashSaleProducts = computed(() => {
    return products.value.filter(product => product.isFlashSale)
  })

  const getProductsByCategory = async (categoryId) => {
    try {
      // Try to get products from API first
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_CATEGORY_ACTIVE(categoryId)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const apiProducts = await response.json()
      
      // Map API products to frontend format
      const mappedProducts = apiProducts.map(product => {
        const mappedProduct = {
          id: product.maSP || product.id,
          name: product.tenSP || product.name,
          price: product.giaHienTai || product.giaBan || product.price,
          originalPrice: product.giaGoc || product.originalPrice,
          categoryId: product.loaiSanPham?.maLoaiSP || product.categoryId,
          categoryName: product.loaiSanPham?.tenLoai || product.categoryName,
          image: `${API_BASE_URL}${API_ENDPOINTS.IMAGES.SERVE_IMAGE(product.maSP + '_main.jfif')}`,
          images: API_ENDPOINTS.IMAGES.PRODUCT_IMAGES(product.maSP).map(img => `${API_BASE_URL}${img}`),
          description: product.moTa || product.description,
          isFlashSale: product.isFlashSale || false,
          isActive: product.isActive !== false,
          stock: product.trongLuong || product.stock || 0,
          unit: product.donViTinh || product.unit || 'cái',
          rating: product.danhGia || product.rating || 4.5,
          reviews: product.danhGia || product.reviews || []
        }
        
        return mappedProduct
      })
      // Ensure prices if missing from category endpoint
      const ensured = await ensurePrices(mappedProducts)
      return ensured
    } catch (error) {
      console.error(`Failed to get products for category ${categoryId} from API:`, error)
      // Không có fallback data, trả về array rỗng
      return []
    }
  }

  const getCategoryById = (id) => {
    return categories.value.find(category => category.id === id)
  }

  // Utility functions
  const formatPrice = (price) => {
    const numeric = Number(price)
    const value = Number.isFinite(numeric) ? numeric : 0
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const showNotification = (message, type = 'success') => {
    notification.value = { message, type }
    setTimeout(() => {
      notification.value = null
    }, 3000)
  }

  const saveCoupon = (code) => {
    showNotification(`Đã lưu mã khuyến mãi: ${code}`, 'success')
  }

  // Countdown timer
  const updateCountdown = () => {
    const now = new Date().getTime()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const distance = midnight.getTime() - now

    countdown.value = {
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    }
  }

  const startCountdown = () => {
    updateCountdown()
    setInterval(updateCountdown, 1000)
  }

  // Initialize data
  const initializeData = async () => {
    startCountdown()
    
    // Load categories and products from API
    await Promise.all([
      loadCategories(),
      loadProducts()
    ])
  }

  // Load categories from API
  const loadCategories = async () => {
    try {
      isLoadingCategories.value = true
      const apiCategories = await CategoryService.getAllCategories()
      categories.value = apiCategories
    } catch (error) {
      console.error('Failed to load categories from API, using defaults:', error)
      categories.value = defaultCategories
    } finally {
      isLoadingCategories.value = false
    }
  }

  // Load products from API
  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const apiProducts = await response.json()
      
      // Map API products to frontend format
      const mappedProducts = apiProducts.map(product => {
        const mappedProduct = {
          id: product.maSP || product.id,
          name: product.tenSP || product.name,
          price: product.giaHienTai || product.giaBan || product.price,
          originalPrice: product.giaGoc || product.originalPrice,
          categoryId: product.loaiSanPham?.maLoaiSP || product.categoryId,
          categoryName: product.loaiSanPham?.tenLoai || product.categoryName,
          image: `${API_BASE_URL}${API_ENDPOINTS.IMAGES.SERVE_IMAGE(product.maSP + '_main.jfif')}`,
          images: API_ENDPOINTS.IMAGES.PRODUCT_IMAGES(product.maSP).map(img => `${API_BASE_URL}${img}`),
          description: product.moTa || product.description,
          isFlashSale: product.isFlashSale || false,
          isActive: product.isActive !== false,
          stock: product.trongLuong || product.stock || 0,
          unit: product.donViTinh || product.unit || 'cái',
          rating: product.danhGia || product.rating || 4.5,
          reviews: product.danhGia || product.reviews || []
        }
        
        return mappedProduct
      })
      // Ensure prices (should already have giaHienTai on this endpoint, but keep safe)
      products.value = await ensurePrices(mappedProducts)
    } catch (error) {
      console.error('Failed to load products from API:', error)
      // Không có fallback data, products sẽ là array rỗng
      products.value = []
    }
  }

  // Ensure price for products missing price by fetching detail
  const ensurePrices = async (list) => {
    const result = await Promise.all(list.map(async (p) => {
      const numeric = Number(p.price)
      if (Number.isFinite(numeric) && numeric > 0) return p
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_ID(p.id)}`)
        if (res.ok) {
          const d = await res.json()
          const fixed = d.giaHienTai || d.giaBan || d.price || 0
          return { ...p, price: fixed }
        }
      } catch {}
      return p
    }))
    return result
  }

  // Initialize on mount
  onMounted(() => {
    initializeData()
  })

  return {
    // State
    products,
    categories,
    searchQuery,
    notification,
    countdown,
    isLoadingCategories,
    
    // Computed
    flashSaleProducts,
    
    // Functions
    getProductsByCategory,
    getCategoryById,
    formatPrice,
    showNotification,
    addToCart,
    saveCoupon,
    initializeData,
    loadCategories,
    loadProducts,
    
    // Search functions
    quickSearch,
    basicSearch,
    advancedSearch
  }
}