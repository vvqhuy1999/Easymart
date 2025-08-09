<template>
  <div>
    <!-- Hero Carousel -->
    <HeroCarousel />

    <!-- Daily Deals Section -->
    <DailyDeals 
      :products="flashSaleProducts"
      :countdown="countdown"
      :formatPrice="formatPrice"
      @add-to-cart="addToCart"
    />

    <!-- Product Categories -->
    <div id="productCategories">
      <CategorySection
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :products="getProductsByCategory(category.id)"
        :formatPrice="formatPrice"
        @add-to-cart="addToCart"
        @view-product="viewProduct"
      />
    </div>

    <!-- Coupon Button Widget -->
    <CouponButtonWidget 
      :show-on-scroll="true"
      :scroll-threshold="300"
      @coupon-copied="handleCouponCopied"
    />

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
 * - Daily Deals (khuyến mãi trong ngày) 
 * - Product Categories (danh mục sản phẩm)
 * - Footer
 */

// Vue Router
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

// Composables
import { useEasyMart } from '../composables/useEasyMart'

// Components
import HeroCarousel from '../components/HeroCarousel.vue'
import DailyDeals from '../components/DailyDeals.vue'
import CategorySection from '../components/CategorySection.vue'
import CouponButtonWidget from '../components/CouponButtonWidget.vue'


// Router instance
const router = useRouter()

// Reactive data for promotion button
const showPromotionButton = ref(false)

// Lấy data từ composable
const {
  categories,
  countdown,
  flashSaleProducts,
  searchResults,
  cartCount,
  getProductsByCategory,
  formatPrice,
  addToCart
} = useEasyMart()

// Navigation method
const viewProduct = (productId) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}

// Go to promotions page
const goToPromotions = () => {
  router.push({ name: 'Promotions' })
}

// Handle coupon copied
const handleCouponCopied = (couponCode) => {
  // You can add notification here if needed
  console.log(`Coupon copied: ${couponCode}`)
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