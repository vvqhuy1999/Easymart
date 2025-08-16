<template>
  <div>
    <ProductDetailComponent
      :productId="productId"
      @go-home="goHome"
      @view-product="viewProduct"
    />
  </div>
</template>

<script setup>
/**
 * ProductDetail.vue - View trang chi tiết sản phẩm
 * 
 * Xử lý:
 * - Nhận productId từ route params
 * - Điều hướng về trang chủ
 * - Điều hướng đến sản phẩm khác
 */

// Vue Router
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

// Components
import ProductDetailComponent from '../components/ProductDetail.vue'

// Router setup
const router = useRouter()
const route = useRoute()

// Lấy productId từ route params
const productId = computed(() => {
  return route.params.id
})

// Navigation methods
const goHome = () => {
  router.push({ name: 'Home' })
}

const viewProduct = (newProductId) => {
  router.push({ name: 'ProductDetail', params: { id: newProductId } })
}
</script>

<style scoped>
/* Styles cho trang chi tiết sản phẩm */
</style> 