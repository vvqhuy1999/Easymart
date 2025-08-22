import { API_CONFIG, API_ENDPOINTS } from '../config/api.js'
import { getToken } from './tokenStorage.js'

/**
 * Service để xử lý API hóa đơn (thay thế đơn hàng)
 */
export class OrderService {
  /**
   * Tạo hóa đơn từ giỏ hàng
   * POST /api/hoadon/from-cart
   * @param {Object} orderData - Dữ liệu hóa đơn
   * @param {string} orderData.maKH - Mã khách hàng
   * @param {string} orderData.maNV - Mã nhân viên (tuỳ chọn)
   * @param {string} orderData.diaChiGiaoHang - Địa chỉ giao hàng
   * @param {string[]} orderData.selectedCartItemIds - Danh sách ID item trong giỏ hàng
   * @returns {Promise<Object>} - Kết quả tạo hóa đơn
   */
  static async createOrderFromCart(orderData) {
    try {
      console.log('🚀 OrderService.createOrderFromCart - Starting invoice creation...')
      console.log('📋 Order data received:', JSON.stringify(orderData, null, 2))
      
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }
      console.log('🔑 JWT token found:', token.substring(0, 20) + '...')

      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.CREATE_FROM_CART}`
      console.log('🌐 Calling API:', url)
             console.log('📤 Request payload:')
       console.log('   - maKH:', orderData.maKH)
       console.log('   - maNV:', orderData.maNV || 'N/A')
       console.log('   - ghiChu:', orderData.ghiChu || 'N/A')
       console.log('   - selectedCartItemIds:', orderData.selectedCartItemIds)
       console.log('   - trangThai:', orderData.trangThai || 0)
      
                    // Kiểm tra dữ liệu đầu vào
       if (!orderData.selectedCartItemIds || orderData.selectedCartItemIds.length === 0) {
         throw new Error('Phải chọn ít nhất một item từ giỏ hàng để tạo hóa đơn')
       }
       
       // Tạo hóa đơn với selectedCartItemIds (theo flow chuẩn)
       console.log('📤 Creating invoice with selectedCartItemIds:')
       console.log('   - selectedCartItemIds:', orderData.selectedCartItemIds)
       console.log('   - selectedCartItemIds count:', orderData.selectedCartItemIds?.length || 0)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      console.log('📡 API Response status:', response.status)
      console.log('📡 API Response ok:', response.ok)
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

             if (!response.ok) {
         const errorData = await response.json().catch(() => null)
         console.error('❌ API Error response:', errorData)
         
         // Xử lý lỗi chi tiết hơn
         let errorMessage = 'Tạo hóa đơn thất bại'
         if (errorData?.message) {
           errorMessage = errorData.message
         } else if (errorData?.error) {
           errorMessage = errorData.error
         } else if (response.statusText) {
           errorMessage += `: ${response.statusText}`
         }
         
         throw new Error(errorMessage)
       }

             const result = await response.json()
       console.log('✅ Invoice creation successful!')
       console.log('📦 Full API Response data:', JSON.stringify(result, null, 2))
       
       // Kiểm tra response success
       if (!result.success) {
         console.warn('⚠️ Response success = false, but HTTP status is OK')
         console.warn('   - Message:', result.message || 'N/A')
         console.warn('   - Error:', result.error || 'N/A')
       }
      
             // Kiểm tra cấu trúc dữ liệu trả về - Hóa đơn chính
       console.log('\n📋 === INVOICE DETAILS (HOADON) ===')
       if (result.result) {
         console.log('✅ Invoice result object found in response')
         console.log(`   - Mã hóa đơn: ${result.result.maHD || 'N/A'}`)
         console.log(`   - Mã khách hàng: ${result.result.maKH || 'N/A'}`)
         console.log(`   - Mã nhân viên: ${result.result.maNV || 'N/A'}`)
         console.log(`   - Mã khuyến mãi: ${result.result.maKM || 'N/A'}`)
         console.log(`   - Ngày lập: ${result.result.ngayLap || 'N/A'}`)
         console.log(`   - Tổng tiền hàng: ${result.result.tongTienHang || 'N/A'}`)
         console.log(`   - Tiền giảm giá: ${result.result.tienGiamGia || 'N/A'}`)
         console.log(`   - Tổng tiền: ${result.result.tongTien || 'N/A'}`)
         console.log(`   - Trạng thái: ${result.result.trangThai || 'N/A'}`)
         console.log(`   - Điểm tích lũy: ${result.result.diemTichLuy || 'N/A'}`)
         console.log(`   - Ghi chú: ${result.result.ghiChu || 'N/A'}`)
       } else {
         console.log('❌ Invoice result object missing from response')
       }
      
             // Kiểm tra chi tiết hóa đơn
       console.log('\n📦 === INVOICE ITEMS (CHITIETHOADON) ===')
       if (result.result && result.result.items) {
         console.log(`✅ Chi tiết hóa đơn found: ${result.result.items.length} items`)
         
         result.result.items.forEach((item, index) => {
           console.log(`\n   📋 Item ${index + 1}:`)
           console.log(`      - Mã sản phẩm: ${item.maSP || 'N/A'}`)
           console.log(`      - Tên sản phẩm: ${item.tenSP || 'N/A'}`)
           console.log(`      - Số lượng: ${item.soLuong || 'N/A'}`)
           console.log(`      - Đơn giá bán: ${item.donGiaBan || item.donGia || 'N/A'}`)
           console.log(`      - Thành tiền: ${item.thanhTien || 'N/A'}`)
           console.log(`      - Giảm giá: ${item.giamGia || 'N/A'}`)
           console.log(`      - Thành tiền sau giảm: ${item.thanhTienSauGiam || 'N/A'}`)
         })
         
         // Tính tổng kiểm tra
         const totalItems = result.result.items.length
         const totalQuantity = result.result.items.reduce((sum, item) => sum + (item.soLuong || 0), 0)
         const totalAmount = result.result.items.reduce((sum, item) => sum + (item.thanhTien || 0), 0)
         
         console.log(`\n📊 === SUMMARY ===`)
         console.log(`   - Tổng số sản phẩm: ${totalItems}`)
         console.log(`   - Tổng số lượng: ${totalQuantity}`)
         console.log(`   - Tổng thành tiền: ${totalAmount}`)
         console.log(`   - Tổng tiền hóa đơn: ${result.result.tongTien || 'N/A'}`)
         
       } else {
         console.log('❌ Chi tiết hóa đơn missing or empty')
         if (result.result) {
           console.log('   - Invoice result exists but no items')
           console.log('   - Result keys:', Object.keys(result.result))
         }
       }
      
             // Kiểm tra response structure
       console.log('\n🔍 === RESPONSE STRUCTURE ===')
       console.log('   - Response keys:', Object.keys(result))
       console.log('   - success:', result.success)
       console.log('   - message:', result.message || 'N/A')
       console.log('   - error:', result.error || 'N/A')
       console.log('   - result exists:', !!result.result)
       console.log('   - items exists:', !!(result.result && result.result.items))
      
      return result
    } catch (error) {
      console.error('💥 Error creating invoice from cart:', error)
      console.error('   - Error name:', error.name)
      console.error('   - Error message:', error.message)
      console.error('   - Error stack:', error.stack)
      throw error
    }
  }

  /**
   * Lấy danh sách hóa đơn của khách hàng
   * GET /api/hoadon/by-khachhang/{maKH}
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Array>} - Danh sách hóa đơn
   */
  static async getOrdersByCustomer(maKH) {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.BY_CUSTOMER(maKH)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Lấy hóa đơn thất bại: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error getting invoices for customer ${maKH}:`, error)
      throw error
    }
  }

  /**
   * Lấy thông tin hóa đơn theo ID
   * GET /api/hoadon/{maHD}
   * @param {string} orderId - ID hóa đơn
   * @returns {Promise<Object>} - Thông tin hóa đơn
   */
  static async getOrderById(orderId) {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.BY_ID(orderId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Lấy hóa đơn thất bại: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error getting invoice ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Lấy chi tiết hóa đơn theo mã hóa đơn
   * GET /api/chitiethoadon/{maHD}
   * @param {string} maHD - Mã hóa đơn
   * @returns {Promise<Object>} - Chi tiết hóa đơn với thông tin sản phẩm
   */
  static async getOrderDetails(maHD) {
    try {
      console.log('🔍 Getting order details for maHD:', maHD)
      
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/chitiethoadon/${maHD}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Order details API response status:', response.status)

      if (!response.ok) {
        throw new Error(`Lấy chi tiết hóa đơn thất bại: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Order details received:', result)
      
      return result
    } catch (error) {
      console.error(`Error getting order details for ${maHD}:`, error)
      throw error
    }
  }

  /**
   * Cập nhật trạng thái hóa đơn
   * PATCH /api/hoadon/{maHD}/trangthai
   * @param {string} orderId - ID hóa đơn
   * @param {string} newStatus - Trạng thái mới
   * @returns {Promise<Object>} - Kết quả cập nhật
   */
  static async updateOrderStatus(orderId, newStatus) {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.UPDATE_STATUS(orderId)}?trangThaiMoi=${encodeURIComponent(newStatus)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Cập nhật trạng thái hóa đơn thất bại: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error updating invoice ${orderId} status:`, error)
      throw error
    }
  }
}

export default OrderService
