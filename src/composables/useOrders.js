import { ref, computed } from 'vue'
import OrderService from '../utils/orderService.js'

export function useOrders() {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Tạo đơn hàng từ giỏ hàng
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise<Object>} - Kết quả tạo đơn hàng
   */
  const createOrderFromCart = async (orderData) => {
    try {
      console.log('🎯 useOrders.createOrderFromCart - Starting...')
      console.log('📋 Order data:', JSON.stringify(orderData, null, 2))
      
      loading.value = true
      error.value = null
      
      console.log('📞 Calling OrderService.createOrderFromCart...')
      const result = await OrderService.createOrderFromCart(orderData)
      console.log('📦 Service result received:', JSON.stringify(result, null, 2))
      
      // Thêm hóa đơn mới vào danh sách
      if (result.success && result.result) {
        console.log('✅ Invoice created successfully, updating local state...')
        console.log(`   - Invoice ID: ${result.result.maHD || result.result.id}`)
        console.log(`   - Customer: ${result.result.maKH}`)
        console.log(`   - Status: ${result.result.trangThai}`)
        
        orders.value.unshift(result.result)
        currentOrder.value = result.result
        
        console.log('📊 Local state updated:')
        console.log(`   - Total invoices: ${orders.value.length}`)
        console.log(`   - Current invoice set: ${currentOrder.value ? 'Yes' : 'No'}`)
      } else {
        console.log('⚠️ Invoice creation result missing success or result data')
        console.log('   - success:', result.success)
        console.log('   - result:', result.result ? 'Present' : 'Missing')
      }
      
      return result
    } catch (err) {
      console.error('💥 Error in useOrders.createOrderFromCart:', err)
      error.value = err.message
      console.error('Error creating order from cart:', err)
      throw err
    } finally {
      loading.value = false
      console.log('🏁 createOrderFromCart completed, loading set to false')
    }
  }

  /**
   * Lấy danh sách hóa đơn của khách hàng (tối ưu với full-details API)
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Array>} - Danh sách hóa đơn với chi tiết đầy đủ
   */
  const loadCustomerOrders = async (maKH) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔄 Loading orders with full details for customer:', maKH)
      
      // 🚀 Thử sử dụng API full-details trước (tối ưu nhất)
      let response
      let useFullDetailsAPI = true
      
      try {
        response = await OrderService.getOrdersByCustomerFullDetails(maKH)
        console.log('✅ Successfully used full-details API')
      } catch (fullDetailsError) {
        console.warn('⚠️ Full-details API failed, falling back to basic API:', fullDetailsError.message)
        useFullDetailsAPI = false
        response = await OrderService.getOrdersByCustomer(maKH)
      }
      
      // Xử lý response format từ API
      let customerInvoices = []
      if (response && response.success && Array.isArray(response.result)) {
        // API trả về {success: true, result: Array, message: ...}
        customerInvoices = response.result
        console.log(`✅ Got customer invoices from response.result: ${customerInvoices.length} orders`)
      } else if (Array.isArray(response)) {
        // API trả về array trực tiếp
        customerInvoices = response
        console.log(`✅ Got customer invoices from direct array: ${customerInvoices.length} orders`)
      } else {
        console.warn('⚠️ Unexpected response format:', response)
        customerInvoices = []
      }
      
      // Debug: Kiểm tra cấu trúc của invoice đầu tiên
      if (customerInvoices.length > 0) {
        const firstInvoice = customerInvoices[0]
        console.log('🔍 First invoice structure:')
        console.log('   - Keys:', Object.keys(firstInvoice))
        console.log('   - Has chiTietHoaDon:', !!firstInvoice.chiTietHoaDon)
        console.log('   - Has chiTietList:', !!firstInvoice.chiTietList)
        console.log('   - ChiTietHoaDon length:', firstInvoice.chiTietHoaDon?.length)
        console.log('   - ChiTietList length:', firstInvoice.chiTietList?.length)
        
        if (firstInvoice.chiTietHoaDon && firstInvoice.chiTietHoaDon.length > 0) {
          console.log('📦 First item in chiTietHoaDon:', firstInvoice.chiTietHoaDon[0])
        } else if (firstInvoice.chiTietList && firstInvoice.chiTietList.length > 0) {
          console.log('📦 First item in chiTietList:', firstInvoice.chiTietList[0])
        }
      }
      
      let ordersWithDetails = []
      
      if (useFullDetailsAPI) {
        // 🚀 Nếu dùng full-details API, không cần load thêm chi tiết
        console.log('✅ Using full-details API - orders already have complete details')
        
        // 🔧 Normalize data structure: chuyển chiTietList thành chiTietHoaDon
        ordersWithDetails = customerInvoices.map(order => {
          const normalizedOrder = { ...order }
          
          // Nếu có chiTietList nhưng không có chiTietHoaDon, chuyển đổi
          if (order.chiTietList && !order.chiTietHoaDon) {
            console.log(`🔧 Normalizing order ${order.maHD}: chiTietList → chiTietHoaDon`)
            normalizedOrder.chiTietHoaDon = order.chiTietList
            console.log(`   - Converted ${order.chiTietList.length} items`)
          }
          
          return normalizedOrder
        })
      } else {
        // 📋 Nếu dùng API cơ bản, cần load chi tiết riêng
        console.log(`🔄 Using basic API - loading details for ${customerInvoices.length} orders...`)
        
        // Load chi tiết cho từng hóa đơn song song với batch size để tránh quá tải
        const batchSize = 3 // Load tối đa 3 orders cùng lúc
        
        for (let i = 0; i < customerInvoices.length; i += batchSize) {
          const batch = customerInvoices.slice(i, i + batchSize)
          
          const batchResults = await Promise.all(
            batch.map(async (order) => {
              try {
                console.log(`🔍 Loading details for order ${order.maHD}`)
                
                // Kiểm tra nếu order đã có chiTietHoaDon hoặc chiTietList với dữ liệu thực sự
                if (order.chiTietHoaDon && Array.isArray(order.chiTietHoaDon) && order.chiTietHoaDon.length > 0) {
                  console.log(`✅ Order ${order.maHD} already has ${order.chiTietHoaDon.length} items in chiTietHoaDon`)
                  return order
                } else if (order.chiTietList && Array.isArray(order.chiTietList) && order.chiTietList.length > 0) {
                  console.log(`✅ Order ${order.maHD} has ${order.chiTietList.length} items in chiTietList, normalizing...`)
                  return {
                    ...order,
                    chiTietHoaDon: order.chiTietList
                  }
                }
                
                // Load từ API riêng
                const detailsResponse = await OrderService.getOrderDetails(order.maHD)
                
                // Xử lý response chi tiết
                let orderDetails = []
                if (detailsResponse && detailsResponse.success && Array.isArray(detailsResponse.result)) {
                  orderDetails = detailsResponse.result
                } else if (Array.isArray(detailsResponse)) {
                  orderDetails = detailsResponse
                } else if (detailsResponse && detailsResponse.result) {
                  // Thử xem result có phải là object chứa items không
                  const resultObj = detailsResponse.result
                  if (resultObj.items && Array.isArray(resultObj.items)) {
                    orderDetails = resultObj.items
                  } else if (resultObj.chiTietHoaDon && Array.isArray(resultObj.chiTietHoaDon)) {
                    orderDetails = resultObj.chiTietHoaDon
                  } else {
                    console.warn(`⚠️ Unexpected details format for order ${order.maHD}:`, detailsResponse)
                    orderDetails = []
                  }
                } else {
                  console.warn(`⚠️ Unexpected details format for order ${order.maHD}:`, detailsResponse)
                  orderDetails = []
                }
                
                console.log(`✅ Loaded ${orderDetails.length} items for order ${order.maHD}`)
                
                // Thêm chi tiết vào hóa đơn
                return {
                  ...order,
                  chiTietHoaDon: orderDetails
                }
              } catch (err) {
                console.error(`❌ Error loading details for order ${order.maHD}:`, err)
                // Trả về hóa đơn gốc nếu không load được chi tiết
                return {
                  ...order,
                  chiTietHoaDon: order.chiTietHoaDon || []
                }
              }
            })
          )
          
          ordersWithDetails.push(...batchResults)
          console.log(`📦 Batch ${Math.floor(i/batchSize) + 1} completed: ${batchResults.length} orders`)
        }
      }
      
      orders.value = ordersWithDetails
      console.log('✅ All orders processed, final count:', orders.value.length)
      
      // Final debug: Kiểm tra kết quả cuối cùng
      if (orders.value.length > 0) {
        const totalItems = orders.value.reduce((sum, order) => {
          const itemCount = order.chiTietHoaDon?.length || order.chiTietList?.length || 0
          return sum + itemCount
        }, 0)
        console.log(`📊 Final summary: ${orders.value.length} orders with ${totalItems} total items`)
        
              // Debug từng order với trạng thái
      orders.value.forEach(order => {
        const itemCount = order.chiTietHoaDon?.length || order.chiTietList?.length || 0
        console.log(`   - Order ${order.maHD}: ${itemCount} items, Status: ${order.trangThai} (${typeof order.trangThai})`)
      })
      }
      
      return ordersWithDetails
    } catch (err) {
      error.value = err.message
      console.error('Error loading customer invoices:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy thông tin hóa đơn theo ID
   * @param {string} orderId - ID hóa đơn
   * @returns {Promise<Object>} - Thông tin hóa đơn
   */
  const loadOrderById = async (orderId) => {
    try {
      loading.value = true
      error.value = null
      
      const invoice = await OrderService.getOrderById(orderId)
      currentOrder.value = invoice
      
      return invoice
    } catch (err) {
      error.value = err.message
      console.error('Error loading invoice by ID:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật trạng thái hóa đơn
   * @param {string} orderId - ID hóa đơn
   * @param {string} newStatus - Trạng thái mới
   * @returns {Promise<Object>} - Kết quả cập nhật
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      loading.value = true
      error.value = null
      
      const result = await OrderService.updateOrderStatus(orderId, newStatus)
      
      // Cập nhật trạng thái trong danh sách
      const invoiceIndex = orders.value.findIndex(o => o.id === orderId || o.maHD === orderId)
      if (invoiceIndex !== -1) {
        orders.value[invoiceIndex].trangThai = newStatus
      }
      
      // Cập nhật currentOrder nếu đang xem hóa đơn này
      if (currentOrder.value && (currentOrder.value.id === orderId || currentOrder.value.maHD === orderId)) {
        currentOrder.value.trangThai = newStatus
      }
      
      return result
    } catch (err) {
      error.value = err.message
      console.error('Error updating invoice status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa hóa đơn khỏi danh sách (local)
   * @param {string} orderId - ID hóa đơn
   */
  const removeOrderFromList = (orderId) => {
    orders.value = orders.value.filter(o => o.id !== orderId && o.maHD !== orderId)
    if (currentOrder.value && (currentOrder.value.id === orderId || currentOrder.value.maHD === orderId)) {
      currentOrder.value = null
    }
  }

  /**
   * Xóa tất cả hóa đơn (local)
   */
  const clearOrders = () => {
    orders.value = []
    currentOrder.value = null
  }

  /**
   * Tìm hóa đơn theo ID trong danh sách local
   * @param {string} orderId - ID hóa đơn
   * @returns {Object|null} - Hóa đơn hoặc null
   */
  const findOrderById = (orderId) => {
    return orders.value.find(o => o.id === orderId || o.maHD === orderId) || null
  }

  /**
   * Lọc hóa đơn theo trạng thái
   * @param {string} status - Trạng thái cần lọc
   * @returns {Array} - Danh sách hóa đơn đã lọc
   */
  const filterOrdersByStatus = (status) => {
    return orders.value.filter(invoice => invoice.trangThai === status)
  }

  /**
   * Lấy chi tiết hóa đơn
   * @param {string} maHD - Mã hóa đơn
   * @returns {Promise<Object>} - Chi tiết hóa đơn
   */
  const loadOrderDetails = async (maHD) => {
    try {
      loading.value = true
      error.value = null
      
      const details = await OrderService.getOrderDetails(maHD)
      
      return details
    } catch (err) {
      error.value = err.message
      console.error('Error loading order details:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Tính tổng giá trị hóa đơn
   * @param {Object} order - Hóa đơn
   * @returns {number} - Tổng giá trị
   */
  const calculateOrderTotal = (order) => {
    if (!order || !order.items) return 0
    
    return order.items.reduce((total, item) => {
      const price = item.donGia || item.giaBan || item.gia || 0
      const quantity = item.soLuong || 0
      return total + (price * quantity)
    }, 0)
  }

  /**
   * Hủy hóa đơn
   * @param {string} orderId - ID hóa đơn
   * @param {string} lyDoHuy - Lý do hủy
   * @returns {Promise<Object>} - Kết quả hủy đơn
   */
  const cancelOrder = async (orderId, lyDoHuy) => {
    try {
      loading.value = true
      error.value = null
      
      const result = await OrderService.cancelOrder(orderId, lyDoHuy)
      
      // Cập nhật trạng thái trong danh sách local (trạng thái 3 = đã hủy)
      const orderIndex = orders.value.findIndex(o => o.id === orderId || o.maHD === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].trangThai = 3
      }
      
      // Cập nhật currentOrder nếu đang xem hóa đơn này
      if (currentOrder.value && (currentOrder.value.id === orderId || currentOrder.value.maHD === orderId)) {
        currentOrder.value.trangThai = 3
      }
      
      return result
    } catch (err) {
      error.value = err.message
      console.error('Error cancelling order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy thống kê hóa đơn của khách hàng
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Object>} - Thống kê hóa đơn
   */
  const loadCustomerStatistics = async (maKH) => {
    try {
      loading.value = true
      error.value = null
      
      const statistics = await OrderService.getCustomerStatistics(maKH)
      
      return statistics
    } catch (err) {
      error.value = err.message
      console.error('Error loading customer statistics:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy số lượng hóa đơn theo trạng thái của khách hàng
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Object>} - Số lượng theo từng trạng thái
   */
  const loadCustomerStatusCounts = async (maKH) => {
    try {
      loading.value = true
      error.value = null
      
      const statusCounts = await OrderService.getCustomerStatusCounts(maKH)
      
      return statusCounts
    } catch (err) {
      error.value = err.message
      console.error('Error loading customer status counts:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy hóa đơn theo trạng thái của khách hàng
   * @param {string} maKH - Mã khách hàng
   * @param {number} status - Trạng thái hóa đơn
   * @returns {Promise<Array>} - Danh sách hóa đơn theo trạng thái
   */
  const loadOrdersByStatus = async (maKH, status) => {
    try {
      loading.value = true
      error.value = null
      
      const ordersData = await OrderService.getOrdersByCustomerAndStatus(maKH, status)
      
      // Xử lý response format từ API
      let filteredOrders = []
      if (ordersData && ordersData.success && Array.isArray(ordersData.result)) {
        filteredOrders = ordersData.result
      } else if (Array.isArray(ordersData)) {
        filteredOrders = ordersData
      } else {
        console.warn('⚠️ Unexpected response format:', ordersData)
        filteredOrders = []
      }
      
      return filteredOrders
    } catch (err) {
      error.value = err.message
      console.error('Error loading orders by status:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    orders: computed(() => orders.value),
    currentOrder: computed(() => currentOrder.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Methods - Existing
    createOrderFromCart,
    loadCustomerOrders,
    loadOrderById,
    loadOrderDetails,
    updateOrderStatus,
    removeOrderFromList,
    clearOrders,
    findOrderById,
    filterOrdersByStatus,
    calculateOrderTotal,
    
    // Methods - New APIs
    cancelOrder,
    loadCustomerStatistics,
    loadCustomerStatusCounts,
    loadOrdersByStatus
  }
}
