import { ref, computed, onMounted } from 'vue'
import { useCart } from './useCart'
import { filterBySearchTerm } from '../utils/vietnamese'

export function useEasyMart() {
  // Reactive state
  const products = ref([])
  const categories = ref([])
  const coupons = ref([])
  const searchQuery = ref('')
  const notification = ref(null)
  const countdown = ref({ hours: 0, minutes: 0, seconds: 0 })

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

  const defaultProducts = [
    {
      id: 1,
      name: 'Cá basa fillet tươi 500g',
      price: 52000,
      originalPrice: null,
      categoryId: 1,
      image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description: 'Cá basa tươi ngon',
      isFlashSale: false,
      reviews: [
        { id: 1, name: 'Nguyễn Văn A', rating: 5, date: '2025-07-20', content: 'Sản phẩm tuyệt vời, giao hàng nhanh chóng. Rất hài lòng!' },
        { id: 2, name: 'Trần Thị B', rating: 4, date: '2025-07-18', content: 'Chất lượng tốt, đóng gói cẩn thận. Sẽ ủng hộ shop lần sau.' }
      ]
    },
    {
      id: 2,
      name: 'Ức gà tươi không da 500g',
      price: 47000,
      originalPrice: null,
      categoryId: 1,
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description: 'Ức gà tươi chất lượng cao',
      isFlashSale: false,
      reviews: [
        { id: 1, name: 'Lê Văn C', rating: 5, date: '2025-07-15', content: 'Giá cả hợp lý, sản phẩm tươi ngon. Cho shop 5 sao!' }
      ]
    },
    {
      id: 3,
      name: 'Thịt bò xay tươi 300g',
      price: 69000,
      originalPrice: null,
      categoryId: 1,
      image: 'https://images.unsplash.com/photo-1588347818017-0ef6798ab88c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description: 'Thịt bò xay tươi ngon',
      isFlashSale: false,
      reviews: [
        { id: 1, name: 'Phạm Thị D', rating: 4, date: '2025-07-10', content: 'Thịt bò tươi, giao hàng nhanh.' }
      ]
    },
    { id: 4, name: 'Tôm thẻ tươi sống 300g', price: 78000, originalPrice: null, categoryId: 1, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', description: 'Tôm thẻ tươi sống', isFlashSale: false, reviews: [
      { id: 1, name: 'Hoàng Văn E', rating: 5, date: '2025-07-08', content: 'Tôm rất tươi, kích cỡ lớn. Rất hài lòng với chất lượng!' },
      { id: 2, name: 'Nguyễn Thị F', rating: 4, date: '2025-07-05', content: 'Tôm ngon, đóng gói cẩn thận. Sẽ đặt lại lần sau.' }
    ] },
    { id: 5, name: 'Gạo ST25 cao cấp 5kg', price: 100000, originalPrice: 200000, categoryId: 1, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', description: 'Gạo ST25 cao cấp', isFlashSale: true, reviews: [
      { id: 1, name: 'Trần Văn G', rating: 5, date: '2025-07-03', content: 'Gạo ST25 thật sự ngon, hạt dẻo thơm. Giá flash sale rất tốt!' },
      { id: 2, name: 'Lê Thị H', rating: 5, date: '2025-07-01', content: 'Chất lượng tuyệt vời, gạo thơm ngon. Gia đình rất thích!' }
    ] },
    { id: 6, name: 'Thịt heo ba chỉ tươi 1kg', price: 108000, originalPrice: 180000, categoryId: 1, image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', description: 'Thịt heo ba chỉ tươi', isFlashSale: true, reviews: [
      { id: 1, name: 'Vũ Thị I', rating: 4, date: '2025-06-28', content: 'Thịt heo ba chỉ tươi ngon, giá flash sale rất hấp dẫn!' }
    ] },
    { id: 7, name: 'Sữa tươi TH True Milk 1L', price: 18200, originalPrice: 28000, categoryId: 4, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', description: 'Sữa tươi TH True Milk', isFlashSale: true, reviews: [
      { id: 1, name: 'Đỗ Văn J', rating: 5, date: '2025-06-25', content: 'Sữa tươi TH rất ngon, giá flash sale quá tốt!' },
      { id: 2, name: 'Phạm Thị K', rating: 4, date: '2025-06-22', content: 'Sữa tươi ngon, con em rất thích uống.' }
    ] },
    { id: 8, name: 'Bánh mì sandwich 6 ổ', price: 33000, originalPrice: 60000, categoryId: 3, image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', description: 'Bánh mì sandwich', isFlashSale: true, reviews: [
      { id: 1, name: 'Bùi Văn L', rating: 4, date: '2025-06-20', content: 'Bánh mì sandwich ngon, giá flash sale rất tốt!' }
    ] },
    { id: 9, name: 'Nước suối Aquafina 500ml', price: 5000, originalPrice: null, categoryId: 4, image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', description: 'Nước suối Aquafina', isFlashSale: false, reviews: [
      { id: 1, name: 'Cao Thị M', rating: 5, date: '2025-06-18', content: 'Nước suối Aquafina sạch, giá cả phải chăng!' }
    ] },
    { id: 10, name: 'Trà xanh 0 độ không đường', price: 7000, originalPrice: null, categoryId: 4, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', description: 'Trà xanh không đường', isFlashSale: false, reviews: [
      { id: 1, name: 'Ngô Văn N', rating: 4, date: '2025-06-15', content: 'Trà xanh không đường vị ngon, tốt cho sức khỏe!' },
      { id: 2, name: 'Đinh Thị O', rating: 5, date: '2025-06-12', content: 'Trà xanh 0 độ rất thơm, uống rất sảng khoái!' }
    ] }
  ]

  const defaultCoupons = [
    { id: 1, title: 'OMO Giảm 20%', description: 'Áp dụng cho tất cả sản phẩm OMO', code: 'OMO20' },
    { id: 2, title: 'Nước giặt Ariel -15%', description: 'Đơn hàng từ 150k', code: 'ARIEL15' },
    { id: 3, title: 'Snack Combo - Giảm 10%', description: 'Mua 2 tặng 1', code: 'SNACK10' },
    { id: 4, title: 'Giảm 25k cho đơn hàng > 300k', description: 'Áp dụng tất cả sản phẩm', code: 'SAVE25K' }
  ]

  // Computed properties
  const flashSaleProducts = computed(() => {
    return products.value.filter(product => product.isFlashSale)
  })

  const searchResults = computed(() => {
    if (searchQuery.value.trim().length < 2) return []
    
    // Use Vietnamese diacritic-insensitive search
    return filterBySearchTerm(
      products.value, 
      searchQuery.value, 
      ['name', 'description']
    ).slice(0, 5)
  })

  const getProductsByCategory = (categoryId) => {
    return products.value.filter(product => product.categoryId === categoryId)
  }

  const getCategoryById = (id) => {
    return categories.value.find(category => category.id === id)
  }

  // Utility functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
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
  const initializeData = () => {
    products.value = defaultProducts
    categories.value = defaultCategories
    coupons.value = defaultCoupons
    startCountdown()
  }

  // Initialize on mount
  onMounted(() => {
    initializeData()
  })

  return {
    // State
    products,
    categories,
    coupons,
    searchQuery,
    notification,
    countdown,
    
    // Computed
    flashSaleProducts,
    searchResults,
    
    // Functions
    getProductsByCategory,
    getCategoryById,
    formatPrice,
    showNotification,
    addToCart,
    saveCoupon,
    initializeData
  }
}