import { ref, computed } from 'vue'
import InventoryService from '../utils/inventoryService.js'

export function useInventory() {
  const inventoryData = ref({})
  const loading = ref(false)
  const error = ref(null)

  /**
   * Lấy số lượng tồn của sản phẩm theo maKho (tuỳ chọn)
   * Sử dụng API /api/sanpham/{id}/with-tonkho
   */
  const getProductStock = async (productId, maKho) => {
    if (!productId) return 0
    try {
      loading.value = true
      error.value = null
      const product = await InventoryService.getProductWithStock(productId, maKho)
      const stock = product?.soLuongTon ?? product?.stock ?? 0
      // Cache theo key có maKho để tránh đè lẫn nhau
      const cacheKey = maKho ? `${productId}@${maKho}` : `${productId}`
      inventoryData.value[cacheKey] = stock
      return stock
    } catch (err) {
      error.value = err.message
      return 0
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy tất cả sản phẩm kèm tồn kho theo maKho (tuỳ chọn)
   */
  const getAllProductsWithStock = async (maKho) => {
    try {
      loading.value = true
      error.value = null
      return await InventoryService.getAllProductsWithStock(maKho)
    } catch (err) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Helpers trạng thái dựa trên cache
   */
  const isProductInStock = computed(() => (cacheKey) => {
    const stock = inventoryData.value[cacheKey]
    return typeof stock === 'number' ? stock > 0 : false
  })

  const getStockStatus = computed(() => (cacheKey) => {
    const stock = inventoryData.value[cacheKey]
    if (typeof stock !== 'number') return 'Không xác định'
    if (stock === 0) return 'Hết hàng'
    if (stock <= 10) return 'Sắp hết hàng'
    return 'Còn hàng'
  })

  const getStockStatusClass = computed(() => (cacheKey) => {
    const stock = inventoryData.value[cacheKey]
    if (typeof stock !== 'number') return 'text-muted'
    if (stock === 0) return 'text-danger'
    if (stock <= 10) return 'text-warning'
    return 'text-success'
  })

  const getStockStatusIcon = computed(() => (cacheKey) => {
    const stock = inventoryData.value[cacheKey]
    if (typeof stock !== 'number') return 'fas fa-question-circle'
    if (stock === 0) return 'fas fa-times-circle'
    if (stock <= 10) return 'fas fa-exclamation-triangle'
    return 'fas fa-check-circle'
  })

  const getCurrentStock = (productId, maKho) => {
    const cacheKey = maKho ? `${productId}@${maKho}` : `${productId}`
    const stock = inventoryData.value[cacheKey]
    return typeof stock === 'number' ? stock : null
  }

  const updateStock = (productId, quantity, maKho) => {
    const cacheKey = maKho ? `${productId}@${maKho}` : `${productId}`
    const currentStock = getCurrentStock(productId, maKho)
    if (currentStock !== null) {
      inventoryData.value[cacheKey] = Math.max(0, currentStock - quantity)
    }
  }

  const clearProductStock = (productId, maKho) => {
    const cacheKey = maKho ? `${productId}@${maKho}` : `${productId}`
    delete inventoryData.value[cacheKey]
  }

  const clearAllStock = () => {
    inventoryData.value = {}
  }

  /**
   * So sánh maSP (giữ lại tiện ích debug/quản trị nếu cần)
   */
  const compareMaSP = async (type) => {
    try {
      loading.value = true
      error.value = null
      return await InventoryService.compareMaSP(type)
    } catch (err) {
      error.value = err.message
      return type ? [] : { sanPhamOnly: [], tonKhoOnly: [], both: [] }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    inventoryData: computed(() => inventoryData.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Methods
    getProductStock,
    getAllProductsWithStock,
    isProductInStock,
    getStockStatus,
    getStockStatusClass,
    getStockStatusIcon,
    getCurrentStock,
    updateStock,
    clearProductStock,
    clearAllStock,
    compareMaSP
  }
}
