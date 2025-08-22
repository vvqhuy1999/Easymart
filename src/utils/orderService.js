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
   * Lấy danh sách hóa đơn của khách hàng (cơ bản)
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

      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime()
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.BY_CUSTOMER(maKH)}?_t=${timestamp}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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
   * 🆕 Lấy danh sách hóa đơn của khách hàng với chi tiết đầy đủ (RECOMMENDED)
   * GET /api/hoadon/by-khachhang/{maKH}/full-details
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Array>} - Danh sách hóa đơn với chi tiết đầy đủ
   */
  static async getOrdersByCustomerFullDetails(maKH) {
    try {
      console.log('🚀 Getting orders with full details for customer:', maKH)
      
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime()
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.BY_CUSTOMER_FULL(maKH)}?_t=${timestamp}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      console.log('📡 Full details API response status:', response.status)

      if (!response.ok) {
        throw new Error(`Lấy hóa đơn chi tiết thất bại: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Orders with full details received:', result)
      console.log('🔍 Result structure:')
      console.log('   - success:', result.success)
      console.log('   - result is array:', Array.isArray(result.result))
      console.log('   - result length:', result.result?.length)
      
      if (result.result && Array.isArray(result.result) && result.result.length > 0) {
        const firstOrder = result.result[0]
        console.log('📦 First order structure:')
        console.log('   - Keys:', Object.keys(firstOrder))
        console.log('   - Has chiTietHoaDon:', !!firstOrder.chiTietHoaDon)
        console.log('   - ChiTietHoaDon length:', firstOrder.chiTietHoaDon?.length)
      }

      return result
    } catch (error) {
      console.error(`Error getting full details for customer ${maKH}:`, error)
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
   * 🆕 Lấy chi tiết hóa đơn theo mã hóa đơn (sử dụng API mới)
   * GET /api/chitiethoadon/hoadon/{maHD}
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

      // Sử dụng API endpoint mới
      let response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHITIETHOADON.BY_HOADON(maHD)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Order details API response status:', response.status)

      // Nếu API mới không hoạt động, thử fallback
      if (!response.ok) {
        console.log('⚠️ New API failed, trying fallback methods...')
        
        // Fallback 1: Thử API hóa đơn với full details
        try {
          response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.BY_ID_FULL(maHD)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          console.log('📡 Full details fallback API response status:', response.status)
          
          if (response.ok) {
            const invoiceResult = await response.json()
            console.log('✅ Full invoice data received:', invoiceResult)
            
            if (invoiceResult && invoiceResult.success && invoiceResult.result) {
              const invoice = invoiceResult.result
              if (invoice.chiTietHoaDon && Array.isArray(invoice.chiTietHoaDon)) {
                console.log(`📦 Found ${invoice.chiTietHoaDon.length} items in full invoice`)
                return {
                  success: true,
                  result: invoice.chiTietHoaDon,
                  message: 'Chi tiết từ hóa đơn full details'
                }
              }
            }
          }
        } catch (fallbackError) {
          console.warn('⚠️ Fallback API also failed:', fallbackError.message)
        }
        
        // Fallback 2: API cũ
        try {
          response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHITIETHOADON.BY_HOADON_OLD(maHD)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          console.log('📡 Old API fallback response status:', response.status)
          
          if (!response.ok) {
            throw new Error(`Tất cả API endpoints đều thất bại: ${response.statusText}`)
          }
        } catch (oldApiError) {
          throw new Error(`Không thể lấy chi tiết hóa đơn: ${oldApiError.message}`)
        }
      }

      const result = await response.json()
      console.log('✅ Order details received:', result)
      console.log('🔍 Result structure:')
      console.log('   - success:', result.success)
      console.log('   - result:', result.result)
      console.log('   - result is array:', Array.isArray(result.result))
      console.log('   - result length:', result.result?.length)
      
      if (result.result && Array.isArray(result.result) && result.result.length > 0) {
        console.log('📦 First item in result:', result.result[0])
      }
      
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

  /**
   * Hủy hóa đơn với lý do
   * PATCH /api/hoadon/{maHD}/cancel
   * @param {string} orderId - ID hóa đơn
   * @param {string} lyDoHuy - Lý do hủy (tuỳ chọn)
   * @returns {Promise<Object>} - Kết quả hủy đơn
   */
  static async cancelOrder(orderId, lyDoHuy = 'Khách hàng yêu cầu hủy') {
    try {
      console.log('❌ Cancelling order:', orderId, 'with reason:', lyDoHuy)
      
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.CANCEL(orderId)}?lyDoHuy=${encodeURIComponent(lyDoHuy)}`
      console.log('🌐 Cancel API URL:', url)

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Cancel API response status:', response.status)

      if (!response.ok) {
        let errorMessage = response.statusText || 'Unknown error'
        
        try {
          const errorData = await response.json()
          console.log('📋 Error response data:', errorData)
          
          // Thử nhiều cách để lấy error message
          if (errorData?.message) {
            errorMessage = errorData.message
          } else if (errorData?.error) {
            errorMessage = errorData.error
          } else if (errorData?.details) {
            errorMessage = errorData.details
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          } else {
            errorMessage = JSON.stringify(errorData)
          }
        } catch (parseError) {
          console.warn('⚠️ Could not parse error response as JSON:', parseError)
          
          // Thử lấy response text thay vì JSON
          try {
            const errorText = await response.text()
            console.log('📋 Error response text:', errorText)
            if (errorText) {
              errorMessage = errorText
            }
          } catch (textError) {
            console.warn('⚠️ Could not get error response text:', textError)
          }
        }
        
        console.log('❌ Final error message:', errorMessage)
        throw new Error(`Hủy hóa đơn thất bại: ${errorMessage}`)
      }

      const result = await response.json()
      console.log('✅ Order cancelled successfully:', result)
      
      return result
    } catch (error) {
      console.error(`Error cancelling invoice ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Lấy thống kê hóa đơn của khách hàng
   * GET /api/hoadon/by-khachhang/{maKH}/statistics
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Object>} - Thống kê hóa đơn
   */
  static async getCustomerStatistics(maKH) {
    try {
      console.log('📈 Getting customer statistics for:', maKH)
      
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.STATISTICS(maKH)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Statistics API response status:', response.status)

      if (!response.ok) {
        throw new Error(`Lấy thống kê thất bại: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Customer statistics received:', result)
      
      return result
    } catch (error) {
      console.error(`Error getting customer statistics for ${maKH}:`, error)
      throw error
    }
  }

  /**
   * Lấy số lượng hóa đơn theo trạng thái của khách hàng
   * GET /api/hoadon/by-khachhang/{maKH}/count-by-status
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Object>} - Số lượng theo từng trạng thái
   */
  static async getCustomerStatusCounts(maKH) {
    try {
      console.log('📊 Getting status counts for customer:', maKH)
      
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.COUNT_BY_STATUS_CUSTOMER(maKH)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Status counts API response status:', response.status)

      if (!response.ok) {
        throw new Error(`Lấy thống kê trạng thái thất bại: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Status counts received:', result)
      
      return result
    } catch (error) {
      console.error(`Error getting status counts for ${maKH}:`, error)
      throw error
    }
  }

  /**
   * Lấy hóa đơn theo trạng thái của khách hàng
   * GET /api/hoadon/by-khachhang/{maKH}/status/{status}
   * @param {string} maKH - Mã khách hàng
   * @param {number} status - Trạng thái hóa đơn (0: chờ, 1: đã thanh toán, 2: đang xử lý, 3: đã hủy, 4: hoàn trả)
   * @returns {Promise<Array>} - Danh sách hóa đơn theo trạng thái
   */
  static async getOrdersByCustomerAndStatus(maKH, status) {
    try {
      console.log('🔍 Getting orders by customer and status:', maKH, status)
      
      const token = getToken()
      if (!token) {
        throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.HOADON.BY_CUSTOMER_AND_STATUS(maKH, status)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Orders by status API response status:', response.status)

      if (!response.ok) {
        throw new Error(`Lấy hóa đơn theo trạng thái thất bại: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Orders by status received:', result)
      
      return result
    } catch (error) {
      console.error(`Error getting orders by customer ${maKH} and status ${status}:`, error)
      throw error
    }
  }
}

export default OrderService
