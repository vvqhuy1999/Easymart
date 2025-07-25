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

    <!-- Coupons Section -->
    <CouponsSection 
      :coupons="coupons"
      @save-coupon="saveCoupon"
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
 * - Coupons Section (mã giảm giá)
 * - Product Categories (danh mục sản phẩm)
 * - Footer
 */

// Vue Router
import { useRouter } from 'vue-router'

// Composables
import { useEasyMart } from '../composables/useEasyMart'

// Components
import HeroCarousel from '../components/HeroCarousel.vue'
import CouponsSection from '../components/CouponsSection.vue'
import DailyDeals from '../components/DailyDeals.vue'
import CategorySection from '../components/CategorySection.vue'

// Router instance
const router = useRouter()

// Lấy data từ composable
const {
  categories,
  coupons,
  searchQuery,
  countdown,
  flashSaleProducts,
  searchResults,
  cartCount,
  getProductsByCategory,
  formatPrice,
  addToCart,
  saveCoupon
} = useEasyMart()

// Navigation method
const viewProduct = (productId) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}
</script>

<style scoped>
/* Styles cho trang chủ */
</style> 