import { ref, computed } from 'vue'

// Global cart state - singleton pattern
const cart = ref([])

// Load cart from localStorage on init
const loadCart = () => {
  const savedCart = localStorage.getItem('easymart-cart')
  if (savedCart) {
    cart.value = JSON.parse(savedCart)
  }
}

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem('easymart-cart', JSON.stringify(cart.value))
}

// Computed properties
const cartCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantity, 0)
})

const cartTotal = computed(() => {
  // This will be calculated when products are available
  return 0
})

// Cart functions
const addToCart = (productId, quantity = 1, productData = null) => {
  const existingItem = cart.value.find(item => item.productId === productId)
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.value.push({ 
      productId, 
      quantity,
      // Store product data for immediate display
      product: productData
    })
  }
  saveCart()
}

const removeFromCart = (productId) => {
  const index = cart.value.findIndex(item => item.productId === productId)
  if (index !== -1) {
    cart.value.splice(index, 1)
    saveCart()
  }
}

const updateCartQuantity = (productId, quantity) => {
  const existingItem = cart.value.find(item => item.productId === productId)
  if (existingItem) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      existingItem.quantity = quantity
      saveCart()
    }
  }
}

const clearCart = () => {
  cart.value = []
  saveCart()
}

const getCartItemsWithProducts = (products) => {
  return cart.value.map(item => {
    const product = products.find(p => p.id === item.productId)
    return {
      ...item,
      product: product || item.product // Use stored product data as fallback
    }
  }).filter(item => item.product) // Filter out items without product data
}

const getCartTotal = (products) => {
  return cart.value.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId)
    return total + (product ? product.price * item.quantity : 0)
  }, 0)
}

// Initialize cart on first load
loadCart()

export function useCart() {
  return {
    // State
    cart,
    
    // Computed
    cartCount,
    cartTotal,
    
    // Functions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartItemsWithProducts,
    getCartTotal,
    loadCart,
    saveCart
  }
}