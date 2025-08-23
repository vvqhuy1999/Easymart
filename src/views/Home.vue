<template>
  <div>
    <!-- Hero Carousel -->
    <HeroCarousel />



    <!-- Product Categories -->
    <div id="productCategories">
      <!-- Loading state for categories -->
      <div v-if="isLoadingCategories" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải danh mục...</span>
        </div>
        <p class="text-muted mt-3">Đang tải danh mục sản phẩm...</p>
      </div>
      
      <!-- Categories when loaded -->
      <CategorySection
        v-else
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :products="categoryProducts[category.id] || []"
        :isLoadingProducts="isLoadingCategoryProducts[category.id]"
        :formatPrice="formatPrice"
        @add-to-cart="addToCart"
        @view-product="viewProduct"
        @load-products="loadCategoryProducts"
      />
    </div>

    <!-- Promotion Button -->
    <Transition name="fade">
      <button 
        v-if="showPromotionButton"
        class="promotion-btn"
        @click="goToPromotions"
        title="Xem khuyến mãi"
      >
        <i class="fas fa-gift"></i>
      </button>
    </Transition>


  </div>
</template>

<script setup>
/**
 * Home.vue - Trang chủ EasyMart
 * 
 * Hiển thị:
 * - Header với tìm kiếm và giỏ hàng
 * - Hero Carousel (banner)
 * - Product Categories (danh mục sản phẩm)
 * - Footer
 */

// Vue Router
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Composables
import { useEasyMart } from '../composables/useEasyMart'

// Components
import HeroCarousel from '../components/HeroCarousel.vue'

import CategorySection from '../components/CategorySection.vue'


// Router instance
const router = useRouter()

// Reactive data for promotion button
const showPromotionButton = ref(false)

// Lấy data từ composable
const {
  categories,
  searchResults,
  cartCount,
  getProductsByCategory,
  formatPrice,
  addToCart,
  isLoadingCategories
} = useEasyMart()

// Reactive data for category products
const categoryProducts = ref({})
const isLoadingCategoryProducts = ref({})

// Navigation method
const viewProduct = (productId) => {
          router.push({ name: 'ProductDetail', params: { id: productId } })
}

// Load products for a specific category
const loadCategoryProducts = async (categoryId) => {
  if (categoryProducts.value[categoryId]) {
    return categoryProducts.value[categoryId]
  }
  
  try {
    isLoadingCategoryProducts.value[categoryId] = true
    const products = await getProductsByCategory(categoryId)
    categoryProducts.value[categoryId] = products
    return products
  } catch (error) {
    console.error(`Failed to load products for category ${categoryId}:`, error)
    return []
  } finally {
    isLoadingCategoryProducts.value[categoryId] = false
  }
}

// Go to promotions page
const goToPromotions = () => {
  router.push({ name: 'Promotions' })
}



// Handle scroll for promotion button visibility
const handleScroll = () => {
  const scrollY = window.scrollY
  // Show button after scrolling 300px
  showPromotionButton.value = scrollY > 300
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Check initial state
  
  // Auto-load products for categories when they're loaded
  watch(categories, async (newCategories) => {
    if (newCategories.length > 0) {
      // Load products for first few categories
      const categoriesToLoad = newCategories.slice(0, 3)
      for (const category of categoriesToLoad) {
        await loadCategoryProducts(category.id)
      }
    }
  }, { immediate: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Styles cho trang chủ */

/* Promotion Button */
.promotion-btn {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.promotion-btn:hover {
  background: linear-gradient(135deg, #ee5a24, #ff6b6b);
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.4);
}

.promotion-btn:active {
  transform: translateY(-2px) scale(1.05);
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .promotion-btn {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    bottom: 1rem;
    left: 1rem;
  }
}
</style>