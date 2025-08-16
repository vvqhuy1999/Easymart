import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

/**
 * Service để quản lý danh mục sản phẩm từ API
 */
export class CategoryService {
  /**
   * Lấy danh sách tất cả danh mục sản phẩm
   * @returns {Promise<Array>} Danh sách danh mục
   */
  static async getAllCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES.LIST}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const categories = await response.json()
      
      // Chuyển đổi từ API response sang format frontend
      return categories.map(category => ({
        id: category.maLoaiSP,
        name: category.tenLoai,
        description: category.moTa,
        parentId: category.loaiCha,
        displayOrder: category.thuTuHienThi,
        isDeleted: category.isDeleted,
        // Tự động map icon và color dựa trên tên danh mục
        icon: CategoryService.getCategoryIcon(category.tenLoai),
        color: CategoryService.getCategoryColor(category.tenLoai)
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback về default categories nếu API fail
      return CategoryService.getDefaultCategories()
    }
  }

  /**
   * Lấy danh mục theo ID
   * @param {string} categoryId - ID danh mục
   * @returns {Promise<Object|null>} Thông tin danh mục
   */
  static async getCategoryById(categoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES.BY_ID(categoryId)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const category = await response.json()
      
      return {
        id: category.maLoaiSP,
        name: category.tenLoai,
        description: category.moTa,
        parentId: category.loaiCha,
        displayOrder: category.thuTuHienThi,
        isDeleted: category.isDeleted,
        icon: CategoryService.getCategoryIcon(category.tenLoai),
        color: CategoryService.getCategoryColor(category.tenLoai)
      }
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error)
      return null
    }
  }

  /**
   * Lấy icon phù hợp cho danh mục dựa trên tên
   * @param {string} categoryName - Tên danh mục
   * @returns {string} Class icon FontAwesome
   */
  static getCategoryIcon(categoryName) {
    if (!categoryName) return 'fas fa-tags'
    
    const iconMap = {
      // Tươi sống
      'tươi sống': 'fas fa-leaf',
      'rau củ': 'fas fa-carrot',
      'thịt': 'fas fa-drumstick-bite',
      'cá': 'fas fa-fish',
      'trái cây': 'fas fa-apple-alt',
      
      // Đông lạnh
      'đông lạnh': 'fas fa-snowflake',
      'kem': 'fas fa-ice-cream',
      
      // Đồ đóng hộp
      'đóng hộp': 'fas fa-box',
      'hộp': 'fas fa-box',
      'lon': 'fas fa-cube',
      
      // Đồ uống
      'đồ uống': 'fas fa-tint',
      'nước': 'fas fa-tint',
      'sữa': 'fas fa-wine-bottle',
      'trà': 'fas fa-mug-hot',
      'cà phê': 'fas fa-coffee',
      
      // Sữa & em bé
      'sữa': 'fas fa-baby',
      'em bé': 'fas fa-baby',
      'trẻ em': 'fas fa-child',
      
      // Gia vị & Dầu ăn
      'gia vị': 'fas fa-pepper-hot',
      'dầu ăn': 'fas fa-oil-can',
      'nước mắm': 'fas fa-flask',
      'muối': 'fas fa-cube',
      
      // Hóa phẩm & Tẩy rửa
      'hóa phẩm': 'fas fa-soap',
      'tẩy rửa': 'fas fa-broom',
      'giặt': 'fas fa-tshirt',
      'vệ sinh': 'fas fa-spray-can'
    }
    
    const normalizedName = categoryName.toLowerCase().trim()
    
    // Tìm icon phù hợp nhất
    for (const [key, icon] of Object.entries(iconMap)) {
      if (normalizedName.includes(key)) {
        return icon
      }
    }
    
    // Fallback dựa trên từ khóa chung
    if (normalizedName.includes('ăn') || normalizedName.includes('thực phẩm')) {
      return 'fas fa-utensils'
    }
    if (normalizedName.includes('đồ')) {
      return 'fas fa-shopping-basket'
    }
    
    // Default icon
    return 'fas fa-tags'
  }

  /**
   * Lấy màu sắc phù hợp cho danh mục
   * @param {string} categoryName - Tên danh mục
   * @returns {string} Tên màu Bootstrap
   */
  static getCategoryColor(categoryName) {
    if (!categoryName) return 'primary'
    
    const colorMap = {
      // Tươi sống - màu xanh lá
      'tươi sống': 'success',
      'rau củ': 'success',
      'thịt': 'danger',
      'cá': 'info',
      'trái cây': 'success',
      
      // Đông lạnh - màu xanh dương
      'đông lạnh': 'info',
      'kem': 'info',
      
      // Đồ đóng hộp - màu vàng
      'đóng hộp': 'warning',
      'hộp': 'warning',
      'lon': 'warning',
      
      // Đồ uống - màu xanh dương đậm
      'đồ uống': 'primary',
      'nước': 'primary',
      'sữa': 'info',
      'trà': 'success',
      'cà phê': 'dark',
      
      // Sữa & em bé - màu xanh dương nhạt
      'sữa': 'info',
      'em bé': 'info',
      'trẻ em': 'info',
      
      // Gia vị & Dầu ăn - màu đỏ
      'gia vị': 'danger',
      'dầu ăn': 'warning',
      'nước mắm': 'danger',
      'muối': 'light',
      
      // Hóa phẩm & Tẩy rửa - màu xanh lá
      'hóa phẩm': 'success',
      'tẩy rửa': 'success',
      'giặt': 'info',
      'vệ sinh': 'success'
    }
    
    const normalizedName = categoryName.toLowerCase().trim()
    
    // Tìm màu phù hợp nhất
    for (const [key, color] of Object.entries(colorMap)) {
      if (normalizedName.includes(key)) {
        return color
      }
    }
    
    // Fallback dựa trên từ khóa chung
    if (normalizedName.includes('ăn') || normalizedName.includes('thực phẩm')) {
      return 'success'
    }
    if (normalizedName.includes('đồ')) {
      return 'primary'
    }
    
    // Default color
    return 'primary'
  }

  /**
   * Lấy danh mục mặc định khi API không khả dụng
   * @returns {Array} Danh sách danh mục mặc định
   */
  static getDefaultCategories() {
    return [
      { id: 'LSP001', name: 'Tươi sống', icon: 'fas fa-leaf', color: 'success', description: 'Các loại rau củ quả tươi' },
      { id: 'LSP002', name: 'Đông lạnh', icon: 'fas fa-snowflake', color: 'info', description: 'Thực phẩm đông lạnh' },
      { id: 'LSP003', name: 'Đồ đóng hộp', icon: 'fas fa-box', color: 'warning', description: 'Thực phẩm đóng hộp' },
      { id: 'LSP004', name: 'Đồ uống', icon: 'fas fa-tint', color: 'primary', description: 'Các loại nước giải khát' },
      { id: 'LSP005', name: 'Sữa & em bé', icon: 'fas fa-baby', color: 'info', description: 'Sản phẩm cho trẻ em' },
      { id: 'LSP006', name: 'Gia vị & Dầu ăn', icon: 'fas fa-pepper-hot', color: 'danger', description: 'Gia vị và dầu ăn' },
      { id: 'LSP007', name: 'Hóa phẩm & Tẩy rửa', icon: 'fas fa-soap', color: 'success', description: 'Sản phẩm vệ sinh' }
    ]
  }
}

export default CategoryService
