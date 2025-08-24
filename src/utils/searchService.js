/**
 * Search Service - Xử lý tìm kiếm sản phẩm với 2 API endpoints
 * 
 * API Endpoints:
 * - GET /api/sanpham/search - Tìm kiếm cơ bản
 * - GET /api/sanpham/search/advanced - Tìm kiếm nâng cao
 */

import { API_BASE_URL } from '../config/api'

const SEARCH_ENDPOINTS = {
  BASIC: '/api/sanpham/search',
  ADVANCED: '/api/sanpham/search/advanced'
}

/**
 * Tìm kiếm cơ bản sản phẩm
 * @param {Object} params - Tham số tìm kiếm
 * @param {string} [params.keyword] - Từ khóa tìm kiếm chung
 * @param {string} [params.tensp] - Tên sản phẩm cụ thể
 * @param {string} [params.mota] - Mô tả sản phẩm
 * @param {boolean} [params.activeOnly=true] - Chỉ tìm sản phẩm đang hoạt động
 * @param {number} [params.page=1] - Trang kết quả
 * @param {number} [params.size=10] - Số lượng kết quả mỗi trang
 * @returns {Promise<Object>} Kết quả tìm kiếm
 */
export const basicSearch = async (params = {}) => {
  try {
    const searchParams = new URLSearchParams()
    
    // Thêm các tham số tìm kiếm
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.tensp) searchParams.append('tensp', params.tensp)
    if (params.mota) searchParams.append('mota', params.mota)
    if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)
    
    const url = `${API_BASE_URL}${SEARCH_ENDPOINTS.BASIC}?${searchParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return {
      success: true,
      data: data,
      total: data.totalElements || data.length || 0,
      page: data.number || 1,
      size: data.size || 10
    }
  } catch (error) {
    console.error('Basic search error:', error)
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0,
      page: 1,
      size: 10
    }
  }
}

/**
 * Tìm kiếm nâng cao sản phẩm
 * @param {Object} params - Tham số tìm kiếm nâng cao
 * @param {string} [params.keyword] - Từ khóa tìm kiếm chung
 * @param {string} [params.maLoaiSP] - Mã loại sản phẩm
 * @param {string} [params.tensp] - Tên sản phẩm
 * @param {string} [params.mota] - Mô tả sản phẩm
 * @param {number} [params.minPrice] - Giá tối thiểu
 * @param {number} [params.maxPrice] - Giá tối đa
 * @param {boolean} [params.activeOnly=true] - Chỉ tìm sản phẩm đang hoạt động
 * @param {boolean} [params.inStock=false] - Chỉ tìm sản phẩm còn hàng
 * @param {string} [params.sortBy] - Sắp xếp theo (price, name, rating)
 * @param {string} [params.sortOrder] - Thứ tự sắp xếp (asc, desc)
 * @param {number} [params.page=1] - Trang kết quả
 * @param {number} [params.size=10] - Số lượng kết quả mỗi trang
 * @returns {Promise<Object>} Kết quả tìm kiếm nâng cao
 */
export const advancedSearch = async (params = {}) => {
  try {
    const searchParams = new URLSearchParams()
    
    // Thêm các tham số tìm kiếm nâng cao
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.maLoaiSP) searchParams.append('maLoaiSP', params.maLoaiSP)
    if (params.tensp) searchParams.append('tensp', params.tensp)
    if (params.mota) searchParams.append('mota', params.mota)
    if (params.minPrice) searchParams.append('minPrice', params.minPrice)
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice)
    if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly)
    if (params.inStock !== undefined) searchParams.append('inStock', params.inStock)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)
    
    const url = `${API_BASE_URL}${SEARCH_ENDPOINTS.ADVANCED}?${searchParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return {
      success: true,
      data: data,
      total: data.totalElements || data.length || 0,
      page: data.number || 1,
      size: data.size || 10
    }
  } catch (error) {
    console.error('Advanced search error:', error)
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0,
      page: 1,
      size: 10
    }
  }
}

/**
 * Tìm kiếm thông minh - Tự động chọn API phù hợp
 * @param {Object} params - Tham số tìm kiếm
 * @returns {Promise<Object>} Kết quả tìm kiếm
 */
export const smartSearch = async (params = {}) => {
  // Nếu có tham số nâng cao, sử dụng advanced search
  if (params.maLoaiSP || params.minPrice || params.maxPrice || params.inStock || params.sortBy) {
    return await advancedSearch(params)
  }
  
  // Ngược lại sử dụng basic search
  return await basicSearch(params)
}

/**
 * Tìm kiếm nhanh cho dropdown - Sử dụng basic search với giới hạn kết quả
 * @param {string} query - Từ khóa tìm kiếm
 * @param {number} limit - Giới hạn số kết quả
 * @returns {Promise<Array>} Danh sách sản phẩm
 */
export const quickSearch = async (query, limit = 5) => {
  if (!query || query.trim().length < 2) {
    return []
  }
  
  try {
    const result = await basicSearch({
      keyword: query.trim(),
      activeOnly: true,
      size: limit
    })
    
    if (result.success) {
      return result.data
    }
    
    return []
  } catch (error) {
    console.error('Quick search error:', error)
    return []
  }
}

/**
 * Tìm kiếm theo loại sản phẩm
 * @param {string} categoryId - Mã loại sản phẩm
 * @param {string} query - Từ khóa tìm kiếm (optional)
 * @param {Object} options - Tùy chọn tìm kiếm
 * @returns {Promise<Object>} Kết quả tìm kiếm
 */
export const searchByCategory = async (categoryId, query = '', options = {}) => {
  return await advancedSearch({
    maLoaiSP: categoryId,
    keyword: query,
    activeOnly: true,
    ...options
  })
}

/**
 * Tìm kiếm theo giá
 * @param {number} minPrice - Giá tối thiểu
 * @param {number} maxPrice - Giá tối đa
 * @param {Object} options - Tùy chọn tìm kiếm khác
 * @returns {Promise<Object>} Kết quả tìm kiếm
 */
export const searchByPrice = async (minPrice, maxPrice, options = {}) => {
  return await advancedSearch({
    minPrice,
    maxPrice,
    activeOnly: true,
    ...options
  })
}

export default {
  basicSearch,
  advancedSearch,
  smartSearch,
  quickSearch,
  searchByCategory,
  searchByPrice
}
