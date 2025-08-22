import { ref, computed, onMounted } from 'vue'
import { useEasyMart } from './useEasyMart'

export function useProductDetail(productId, router = null) {
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
  const isLoading = ref(false)

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
    
    // Use product images from API if available
    if (currentProduct.value?.images && currentProduct.value.images.length > 0) {
      return currentProduct.value.images.map((url, index) => ({
        id: index + 1,
        url: url,
        alt: index === 0 ? 'Hình chính' : `Góc nhìn ${index + 1}`,
        isMain: index === 0
      }))
    }
    
    // Fallback to single image
    const mainImage = currentProduct.value?.image || 'https://via.placeholder.com/800x600?text=No+Image'
    
    return productImages.value[currentProduct.value.id] || [
      { id: 1, url: mainImage, alt: 'Hình chính', isMain: true },
      { id: 2, url: mainImage, alt: 'Góc nhìn 2', isMain: false },
      { id: 3, url: mainImage, alt: 'Góc nhìn 3', isMain: false }
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
      (p.maSP || p.id) !== (currentProduct.value.maSP || currentProduct.value.id)
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
  const loadProduct = async (id) => {
    console.log('🚀 loadProduct called with ID:', id)
    console.log('🚀 Current products.value:', products.value)
    isLoading.value = true
    
    try {
      // Try to get product from API first
      const apiUrl = `http://localhost:8080/api/sanpham/${id}`
      console.log('🌐 Calling API:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log('📡 API Response status:', response.status)
      console.log('📡 API Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const apiProduct = await response.json()
      console.log('📦 API Response data:', apiProduct)
      
      // Map API product to frontend format
      const mappedProduct = {
        id: apiProduct.maSP || apiProduct.id,
        name: apiProduct.tenSP || apiProduct.name,
        price: apiProduct.giaHienTai || apiProduct.giaBan || apiProduct.price,
        originalPrice: apiProduct.giaGoc || apiProduct.originalPrice,
        categoryId: apiProduct.loaiSanPham?.maLoaiSP || apiProduct.categoryId,
        categoryName: apiProduct.loaiSanPham?.tenLoai || apiProduct.categoryName,
        image: `http://localhost:8080/api/upload/serve-image/${apiProduct.maSP}_main.jfif`,
        images: [
          `http://localhost:8080/api/upload/serve-image/${apiProduct.maSP}_main.jfif`,
          `http://localhost:8080/api/upload/serve-image/${apiProduct.maSP}_main1.jfif`,
          `http://localhost:8080/api/upload/serve-image/${apiProduct.maSP}_main2.jfif`
        ],
        description: apiProduct.moTa || apiProduct.description,
        isFlashSale: apiProduct.isFlashSale || false,
        isActive: apiProduct.isActive !== false,
        stock: apiProduct.trongLuong || apiProduct.stock || 0,
        unit: apiProduct.donViTinh || apiProduct.unit || 'cái',
        rating: apiProduct.danhGia || apiProduct.rating || 4.5,
        reviews: apiProduct.danhGia || apiProduct.reviews || [],
        // New fields from backend
        weight: apiProduct.trongLuong || null,
        weightUnit: apiProduct.donViTinh || null,
        shelfLifeDays: apiProduct.hanSuDung || null
      }
      
      currentProduct.value = mappedProduct
      selectedImageIndex.value = 0
      quantity.value = 1
      
    } catch (error) {
      console.error(`❌ Failed to load product ${id} from API:`, error)
      
      // Fallback: try to find in local products
      const product = products.value.find(p => 
        p.id === id || p.id === String(id) || p.id === parseInt(id) ||
        p.maSP === id || p.maSP === String(id)
      )
      
      if (product) {
        currentProduct.value = product
        selectedImageIndex.value = 0
        quantity.value = 1
      } else {
        console.error('❌ Product not found in local data either')
        currentProduct.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  const changeQuantity = (change, maxStock = 10) => {
    const newValue = Math.max(1, Math.min(maxStock, quantity.value + change))
    quantity.value = newValue
  }

  const changeMainImage = (index) => {
    selectedImageIndex.value = index
  }

  const addToCartWithQuantity = () => {
    if (currentProduct.value) {
      addToCart(currentProduct.value.maSP || currentProduct.value.id, quantity.value)
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
      // Save selected items and redirect path for after login
      localStorage.setItem('easymart-selected-items', JSON.stringify([currentProduct.value.maSP || currentProduct.value.id]))
      localStorage.setItem('easymart-redirect-after-login', '/checkout')
      
      showNotification('Vui lòng đăng nhập để tiến hành thanh toán!', 'warning')
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login'
      }, 800)
      return
    }

    // User is logged in - proceed to checkout
    // Add product to cart first
    addToCartWithQuantity()
    
    // Save selected items to localStorage for checkout
    localStorage.setItem('easymart-selected-items', JSON.stringify([currentProduct.value.maSP || currentProduct.value.id]))
    
    // Save product info for single product checkout to invoice
    localStorage.setItem('easymart-invoice', JSON.stringify({
      items: [{
        maSP: currentProduct.value.maSP || currentProduct.value.id,
        tenSP: currentProduct.value.name,
        donGia: currentProduct.value.price,
        soLuong: quantity.value
      }],
      orderId: 'NEW',
      timestamp: new Date().toISOString()
    }))
    
    // Show notification and redirect
    showNotification('Chuyển đến trang thanh toán...', 'info')
    
    // Use setTimeout to allow notification to show
    setTimeout(() => {
      // Navigate to checkout page using router if available, otherwise fallback to window.location
      if (router) {
        router.push('/checkout')
      } else {
        window.location.href = '/checkout'
      }
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
    isLoading,
    
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