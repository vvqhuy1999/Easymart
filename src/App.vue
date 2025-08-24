<template>
  <div id="app" class="bg-white">
    <!-- Notification Global -->
    <Notification 
      v-if="notification"
      :message="notification.message"
      :type="notification.type"
    />

    <Header 
      :categories="categories"
      :searchQuery="searchQuery"
      @update-search="searchQuery = $event"
      @add-to-cart="addToCart"
    />
    <!-- Router View - Hiển thị các view components theo route -->
    <div class="router-view-container">
      <router-view />
    </div>

    <Footer />
  </div>
</template>

<script setup>
/**
 * App.vue - Main Application Component
 *
 * Component chính của ứng dụng, chứa các thành phần toàn cục như
 * Header, Footer, và Notification. Nó cũng quản lý state và logic
 * chung cho các thành phần này.
 */

// ==================== IMPORTS ====================
import { useRouter } from 'vue-router'

// Composables
import { useEasyMart } from './composables/useEasyMart'

// Components
import Notification from './components/Notification.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

// ==================== COMPOSABLE LOGIC ====================
// Lấy các state và hàm cần thiết từ composable trung tâm
const {
  notification,
  categories,
  searchQuery,
  addToCart,
} = useEasyMart()

// ==================== ROUTER ====================
const router = useRouter()

/**
 * Điều hướng đến trang chi tiết sản phẩm.
 * Hàm này được truyền xuống cho Header để xử lý sự kiện click vào một sản phẩm.
 * @param {string|number} productId - ID của sản phẩm cần xem.
 */
const viewProduct = (productId) => {
  // Sử dụng router để chuyển trang theo tên route và tham số
          router.push({ name: 'ProductDetail', params: { id: productId } })
}

</script>