import { ref, computed, onMounted } from 'vue'
import { useEasyMart } from './useEasyMart'

export function useProductDetail(productId) {
  // Use the main composable
  const { products, categories, addToCart, formatPrice, showNotification } = useEasyMart()
  
  // Product detail specific state
  const currentProduct = ref(null)
  const productDetails = ref({})
  const productReviews = ref([])
  const productImages = ref([])
  const quantity = ref(1)
  const selectedImageIndex = ref(0)
  const activeTab = ref('description')

  // Computed properties
  const currentProductDetail = computed(() => {
    if (!currentProduct.value) return null
    
    return productDetails.value[currentProduct.value.id] || {
      description: 'Sản phẩm chất lượng cao, được chọn lọc kỹ càng để đảm bảo tươi ngon và an toàn cho sức khỏe. Được nuôi trồng theo quy trình khép kín, đảm bảo vệ sinh an toàn thực phẩm.',
      nutrition: 'Giàu protein, ít chất béo, cung cấp các vitamin và khoáng chất thiết yếu cho cơ thể. Đặc biệt tốt cho việc phát triển cơ bắp và duy trì sức khỏe tổng thể.',
      storage: 'Bảo quản trong tủ lạnh từ 0-4°C, sử dụng trong vòng 2-3 ngày sau khi mở gói',
      origin: 'Việt Nam - Đồng bằng sông Cửu Long'
    }
  })

  const currentReviews = computed(() => {
    if (!currentProduct.value) return []
    
    // Trả về reviews từ product hoặc default reviews
    return currentProduct.value.reviews || productReviews.value[currentProduct.value.id] || [
      { id: 1, name: 'Nguyễn Văn A', rating: 5, content: 'Sản phẩm rất tốt, tươi ngon! Chất lượng vượt mong đợi, sẽ tiếp tục ủng hộ.', date: '2025-01-01' },
      { id: 2, name: 'Trần Thị B', rating: 4, content: 'Chất lượng ổn, sẽ mua lại. Giá cả hợp lý, giao hàng nhanh.', date: '2025-01-02' },
      { id: 3, name: 'Lê Văn C', rating: 5, content: 'Tuyệt vời! Gia đình tôi rất hài lòng với sản phẩm này.', date: '2025-01-03' }
    ]
  })

  const currentImages = computed(() => {
    if (!currentProduct.value) return []
    
    return productImages.value[currentProduct.value.id] || [
      { id: 1, url: currentProduct.value?.image || 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Hình chính', isMain: true },
      { id: 2, url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Góc nhìn 2', isMain: false },
      { id: 3, url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Góc nhìn 3', isMain: false },
      { id: 4, url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Góc nhìn 4', isMain: false }
    ]
  })

  const averageRating = computed(() => {
    if (currentReviews.value.length === 0) return 0
    return currentReviews.value.reduce((sum, review) => sum + review.rating, 0) / currentReviews.value.length
  })

  const discountPercentage = computed(() => {
    if (!currentProduct.value || !currentProduct.value.originalPrice) return 0
    return Math.round((1 - currentProduct.value.price / currentProduct.value.originalPrice) * 100)
  })

  const relatedProducts = computed(() => {
    if (!currentProduct.value) return []
    return products.value.filter(p => 
      p.categoryId === currentProduct.value.categoryId && 
      p.id !== currentProduct.value.id
    ).slice(0, 4)
  })

  const currentCategory = computed(() => {
    if (!currentProduct.value) return null
    return categories.value.find(cat => cat.id === currentProduct.value.categoryId)
  })

  const breadcrumbs = computed(() => {
    const items = [
      { name: 'Trang chủ', href: '#', icon: 'fas fa-home' }
    ]
    
    if (currentCategory.value) {
      items.push({
        name: currentCategory.value.name,
        href: `#category-${currentCategory.value.id}`
      })
    }
    
    if (currentProduct.value) {
      items.push({
        name: currentProduct.value.name,
        active: true
      })
    }
    
    return items
  })

  // Methods
  const loadProduct = (id) => {
    const product = products.value.find(p => p.id === parseInt(id))
    if (product) {
      currentProduct.value = product
      selectedImageIndex.value = 0
      quantity.value = 1
    }
  }

  const changeQuantity = (change) => {
    const newValue = Math.max(1, Math.min(10, quantity.value + change))
    quantity.value = newValue
  }

  const changeMainImage = (index) => {
    selectedImageIndex.value = index
  }

  const addToCartWithQuantity = () => {
    if (currentProduct.value) {
      addToCart(currentProduct.value.id, quantity.value)
    }
  }

  const buyNow = () => {
    if (!currentProduct.value) {
      showNotification('Không tìm thấy sản phẩm!', 'error')
      return
    }

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('easymart-user') || 'null')
    if (!user) {
      // Add product to cart first
      addToCartWithQuantity()
      
      // Save selected items and redirect path
      localStorage.setItem('easymart-selected-items', JSON.stringify([currentProduct.value.id]))
      localStorage.setItem('easymart-redirect-after-login', '/checkout')
      
      showNotification('Vui lòng đăng nhập để tiến hành thanh toán!', 'warning')
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login'
      }, 800)
      return
    }

    // Add product to cart first
    addToCartWithQuantity()
    
    // Save selected items to localStorage for checkout
    localStorage.setItem('easymart-selected-items', JSON.stringify([currentProduct.value.id]))
    
    // Show notification and redirect
    showNotification('Chuyển đến trang thanh toán...', 'info')
    
    // Use setTimeout to allow notification to show
    setTimeout(() => {
      // Navigate to checkout page
      window.location.href = '/checkout'
    }, 800)
  }

  const addToWishlist = () => {
    showNotification('Đã thêm vào danh sách yêu thích!', 'success')
  }

  const shareProduct = () => {
    if (navigator.share && currentProduct.value) {
      navigator.share({
        title: currentProduct.value.name,
        text: `Xem sản phẩm tuyệt vời này tại EasyMart: ${currentProduct.value.name}`,
        url: window.location.href
      }).catch(() => {
        copyToClipboard()
      })
    } else {
      copyToClipboard()
    }
    
    function copyToClipboard() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('Đã copy link sản phẩm!', 'info')
      })
    }
  }

  const compareProduct = () => {
    showNotification('Tính năng so sánh sẽ có trong phiên bản tiếp theo!', 'info')
  }

  const setActiveTab = (tab) => {
    activeTab.value = tab
  }

  // Initialize
  onMounted(() => {
    if (productId) {
      loadProduct(productId)
    }
  })

  return {
    // State
    currentProduct,
    quantity,
    selectedImageIndex,
    activeTab,
    
    // Computed
    currentProductDetail,
    currentReviews,
    currentImages,
    averageRating,
    discountPercentage,
    relatedProducts,
    currentCategory,
    breadcrumbs,
    
    // Methods
    loadProduct,
    changeQuantity,
    changeMainImage,
    addToCartWithQuantity,
    buyNow,
    addToWishlist,
    shareProduct,
    compareProduct,
    setActiveTab,
    formatPrice,
    addToCart
  }
}