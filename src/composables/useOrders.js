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
   * Lấy danh sách hóa đơn của khách hàng
   * @param {string} maKH - Mã khách hàng
   * @returns {Promise<Array>} - Danh sách hóa đơn
   */
  const loadCustomerOrders = async (maKH) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔄 Loading orders for customer:', maKH)
      const response = await OrderService.getOrdersByCustomer(maKH)
      
      // Xử lý response format từ API
      let customerInvoices = []
      if (response && response.success && Array.isArray(response.result)) {
        // API trả về {success: true, result: Array, message: ...}
        customerInvoices = response.result
      } else if (Array.isArray(response)) {
        // API trả về array trực tiếp
        customerInvoices = response
      } else {
        console.warn('⚠️ Unexpected response format:', response)
        customerInvoices = []
      }
      
      console.log(`🔄 Loading details for ${customerInvoices.length} orders...`)
      
      // Load chi tiết cho từng hóa đơn
      const ordersWithDetails = await Promise.all(
        customerInvoices.map(async (order) => {
          try {
            console.log(`🔍 Loading details for order ${order.maHD}`)
            const detailsResponse = await OrderService.getOrderDetails(order.maHD)
            
            // Xử lý response chi tiết
            let orderDetails = []
            if (detailsResponse && detailsResponse.success && Array.isArray(detailsResponse.result)) {
              orderDetails = detailsResponse.result
            } else if (Array.isArray(detailsResponse)) {
              orderDetails = detailsResponse
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
              chiTietHoaDon: []
            }
          }
        })
      )
      
      orders.value = ordersWithDetails
      console.log('✅ Orders with details loaded, count:', orders.value.length)
      
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

  return {
    // State
    orders: computed(() => orders.value),
    currentOrder: computed(() => currentOrder.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Methods
    createOrderFromCart,
    loadCustomerOrders,
    loadOrderById,
    loadOrderDetails,
    updateOrderStatus,
    removeOrderFromList,
    clearOrders,
    findOrderById,
    filterOrdersByStatus,
    calculateOrderTotal
  }
}
