import { API_CONFIG, API_ENDPOINTS } from '../config/api.js'

/**
 * Service để xử lý API tồn kho
 */
export class InventoryService {
  /**
   * Lấy tất cả sản phẩm kèm số lượng tồn kho (không cần đăng nhập)
   * Hỗ trợ lọc theo kho qua query maKho (tuỳ chọn)
   */
  static async getAllProductsWithStock(maKho) {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS.WITH_STOCK_LIST}`
      if (maKho) url += `?maKho=${encodeURIComponent(maKho)}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching products with stock:', error)
      throw error
    }
  }

  /**
   * Lấy 1 sản phẩm kèm số lượng tồn kho (không cần đăng nhập)
   * Hỗ trợ lọc theo kho qua query maKho (tuỳ chọn)
   */
  static async getProductWithStock(productId, maKho) {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_ID_WITH_STOCK(productId)}`
      if (maKho) url += `?maKho=${encodeURIComponent(maKho)}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error(`Error fetching product ${productId} with stock:`, error)
      throw error
    }
  }

  /**
   * Gọi API so sánh maSP giữa SanPham và TonKhoChiTiet (active)
   * GET /api/tonkhochitiet/compare-masp
   * @param {string} type - Loại so sánh: 'sanpham-only', 'tonkho-only', 'both', hoặc undefined để lấy tất cả
   * Trả về: { sanPhamOnly: string[], tonKhoOnly: string[], both: string[] }
   */
  static async compareMaSP(type = undefined) {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.INVENTORY.COMPARE_MASP}`
      if (type) {
        url += `?type=${encodeURIComponent(type)}`
      }
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error comparing maSP:', error)
      throw error
    }
  }

  static async getSanPhamOnlyMaSP() {
    return await this.compareMaSP('sanpham-only')
  }

  static async getTonKhoOnlyMaSP() {
    return await this.compareMaSP('tonkho-only')
  }

  static async getBothMaSP() {
    return await this.compareMaSP('both')
  }
}

export default InventoryService
