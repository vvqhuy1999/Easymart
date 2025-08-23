import { ref, computed, watch, watchEffect } from 'vue'
import { API_CONFIG, API_ENDPOINTS } from '../config/api'
import { getToken } from '../utils/tokenStorage'
import { useAuth } from './useAuth'

// Global cart state - singleton pattern
// Each item shape: { productId, quantity, product?, maCTGH? }
const cart = ref([])

// Backend cart info (used only for login merge / logout persist)
const backendCartId = ref(null) // MaGH
const backendReady = ref(false)

// Load cart - local only (no localStorage). Always start empty.
const loadCart = () => {
  cart.value = []
}

// Save cart - no-op (no localStorage touch)
const saveCart = () => {
  // intentionally empty
}

// Helpers
const getAuthHeaders = () => {
  const token = getToken()
  return token
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

const findCartItemByProduct = (productId) => cart.value.find(i => i.productId === productId)

// Computed properties
const cartCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantity, 0)
})

const cartTotal = computed(() => {
  // Will be computed in views with product data
  return cart.value.reduce((t, i) => t + (i.product?.price || 0) * i.quantity, 0)
})

// ========================= BACKEND SYNC (GioHang / ChiTietGioHang) =========================
const { user, ensureUserComplete, validateProfileAccess } = useAuth()

const resolveCustomerId = async () => {
  try {
    // Sử dụng endpoint mới để lấy thông tin user hiện tại
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.CURRENT_USER}`, { headers: getAuthHeaders() })
    if (res.ok) {
      const info = await res.json().catch(() => null)
      const maKH = info?.maKH || null
      try { console.log('[CART][RESOLVE_KH] source=current-user maKH=', maKH) } catch {}
      if (maKH) return maKH
    }
  } catch {}
  
  if (!user.value) return null
  
  if (user.value?.customerInfo?.maKH) {
    try { console.log('[CART][RESOLVE_KH] source=customerInfo maKH=', user.value.customerInfo.maKH) } catch {}
    return user.value.customerInfo.maKH
  }
  
  // Thử lấy thông tin user đầy đủ
  const completeUser = await ensureUserComplete().catch(() => user.value)
  if (!completeUser?.customerInfo?.maKH) {
    try { 
      console.log('[CART][RESOLVE_KH] Trying to validate profile access...')
      await validateProfileAccess() 
    } catch (err) {
      console.warn('[CART][RESOLVE_KH] Profile validation failed:', err.message)
    }
  }
  
  let maKH = user.value?.customerInfo?.maKH || null
  
  // Nếu vẫn không có maKH, thử tạo thông tin khách hàng mới
  if (!maKH && user.value?.email) {
    try {
      console.log('[CART][RESOLVE_KH] No maKH found, attempting to create customer info...')
      maKH = await createCustomerInfoForUser()
      if (maKH) {
        console.log('[CART][RESOLVE_KH] Successfully created customer info with maKH:', maKH)
        return maKH
      }
    } catch (err) {
      console.error('[CART][RESOLVE_KH] Failed to create customer info:', err.message)
    }
  }
  
  try { console.log('[CART][RESOLVE_KH] userId=', completeUser?.id, 'maKH=', maKH) } catch {}
  return maKH
}

const fetchOrCreateBackendCart = async () => {
  try {
    const maKH = await resolveCustomerId()
    if (!maKH) return null
    // 1) Try to get active cart by customer - sử dụng endpoint mới
    const byCustomerUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.BY_CUSTOMER(maKH)}`
    try { console.log('[CART][GET_CART_BY_KH][REQ]', byCustomerUrl) } catch {}
    const res = await fetch(byCustomerUrl, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      // API mới trả về trực tiếp cart info với maKH, trangThai, etc.
      if (data?.maKH) {
        try { console.log('[CART][GET_CART_BY_KH][OK] maKH=', maKH, 'trangThai=', data.trangThai) } catch {}
        return { maGH: data.maKH, ...data } // Sử dụng maKH làm identifier
      }
    } else {
      // If redirected or unauthorized, don't create new cart
      try { console.warn('[CART][GET_CART_BY_KH][FAIL] status=', res.status) } catch {}
      return null
    }
    // 2) Nếu chưa có giỏ hàng, backend sẽ tự tạo khi gọi các endpoint khác
    // Trả về thông tin customer để các function khác có thể sử dụng
    return { maGH: maKH, maKH: maKH, trangThai: 0 }
  } catch (_e) {
    return null
  }
}

const pullBackendItems = async (maKH) => {
  try {
    // Kiểm tra token trước khi gọi API
    const token = getToken()
    if (!token) {
      console.warn('[CART][PULL_ITEMS] No token available')
      return []
    }
    
    // Sử dụng endpoint mới để lấy giỏ hàng với items
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.BY_CUSTOMER_WITH_ITEMS(maKH)}`
    console.log('[CART][PULL_ITEMS][REQ]', url, 'with token:', token.substring(0, 20) + '...')
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!res.ok) {
      console.error('[CART][PULL_ITEMS][FAIL] status=', res.status, 'statusText=', res.statusText)
      
      // Log response body for debugging
      const responseText = await res.text().catch(() => 'Unable to read response')
      console.error('[CART][PULL_ITEMS][RESPONSE_BODY]', responseText)
      
      // Handle specific error cases
      if (res.status === 401) {
        console.error('[CART][PULL_ITEMS] Unauthorized - token may be invalid')
        return []
      } else if (res.status === 404) {
        console.error('[CART][PULL_ITEMS] With-items endpoint not found, trying basic cart endpoint...')
        
        // Fallback: try basic cart endpoint
        const basicUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.BY_CUSTOMER(maKH)}`
        console.log('[CART][PULL_ITEMS][FALLBACK] Trying basic endpoint:', basicUrl)
        
        const basicRes = await fetch(basicUrl, { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (basicRes.ok) {
          const basicData = await basicRes.json().catch(() => ({}))
          console.log('[CART][PULL_ITEMS][FALLBACK] Basic cart data:', basicData)
          
          // Kiểm tra response format
          if (Array.isArray(basicData)) {
            console.warn('[CART][PULL_ITEMS][FALLBACK] Basic endpoint returned empty array - endpoint may be incorrect')
            return []
          } else if (basicData && typeof basicData === 'object') {
            console.log('[CART][PULL_ITEMS][FALLBACK] Basic endpoint returned cart info:', basicData)
            return []
          } else {
            console.warn('[CART][PULL_ITEMS][FALLBACK] Basic endpoint returned unexpected format:', basicData)
            return []
          }
        } else {
          console.error('[CART][PULL_ITEMS][FALLBACK] Basic endpoint also failed:', basicRes.status)
          
          // Final fallback: try to create a new cart by calling add endpoint
          console.log('[CART][PULL_ITEMS][FINAL_FALLBACK] Both endpoints failed, attempting to create cart via add endpoint...')
          
          try {
            const dummyAddUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.ADD}`
            const dummyAddRes = await fetch(dummyAddUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                maSP: 'DUMMY_SP',
                soLuong: 1,
                donGiaHienTai: 0
              })
            })
            
            if (dummyAddRes.ok) {
              console.log('[CART][PULL_ITEMS][FINAL_FALLBACK] Successfully created cart via add endpoint')
              // Xóa item dummy ngay lập tức
              const dummyData = await dummyAddRes.json().catch(() => ({}))
              if (dummyData.itemId) {
                await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.REMOVE(dummyData.itemId)}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }).catch(() => {}) // Ignore cleanup errors
              }
              return []
            } else {
              console.warn('[CART][PULL_ITEMS][FINAL_FALLBACK] Failed to create cart via add endpoint:', dummyAddRes.status)
              return []
            }
          } catch (fallbackError) {
            console.error('[CART][PULL_ITEMS][FINAL_FALLBACK] Error in final fallback:', fallbackError)
            return []
          }
        }
      } else {
        // Other error statuses
        console.error('[CART][PULL_ITEMS] Other error status:', res.status)
        return []
      }
    }
    
    // If we reach here, the request was successful
    const data = await res.json().catch(() => ({}))
    const items = data?.items || []
    console.log('[CART][PULL_ITEMS][OK] maKH=', maKH, 'count=', items.length, 'tongTien=', data.tongTien)
    
    // API mới không có isDeleted, items đã được lọc sẵn
    // Map với đầy đủ thông tin để có thể xóa/cập nhật sau này
    // Quan trọng: Giữ nguyên ID gốc từ backend để tạo hóa đơn
    return items.map(it => ({
      productId: (it.sanPham?.maSP) || it.maSP || it.productId,
      quantity: it.soLuong || it.quantity || 1,
      itemId: it.maGHCT || it.maGioHangChiTiet || it.maCTGH || it.id || it.itemId, // Giữ nguyên ID gốc từ backend
      price: it.donGiaHienTai || 0,
      product: it.sanPham || it.product || null, // Lưu product data nếu có
      // Giữ nguyên dữ liệu gốc để debug
      originalData: it
    }))
  } catch (error) {
    console.error('[CART][PULL_ITEMS][EXCEPTION]', error)
    return []
  }
}

// Note: We DO NOT push changes to backend while logged in.
// Only merge on login and persist on logout, per requirement.

const buildMergedItems = (a, b) => {
  const map = new Map()
  const addAll = (list) => {
    for (const it of list) {
      const key = String(it.productId)
      const existing = map.get(key)
      const qty = (existing?.quantity || 0) + (it.quantity || 1)
      map.set(key, { productId: it.productId, quantity: qty })
    }
  }
  addAll(a || [])
  addAll(b || [])
  return Array.from(map.values())
}

const mergeWithBackendOnLogin = async () => {
  const token = getToken()
  if (!token) return
  
  const maKH = await resolveCustomerId()
  if (!maKH) return
  
  backendCartId.value = maKH
  
  // Thử sync trước
  const syncResult = await syncLocalCartToDBViaEndpoint();
  if (syncResult && syncResult.maKH) {
    console.log('[CART][MERGE] Sync successful');
    // Reload từ backend để có dữ liệu mới nhất
    await reloadCartFromBackend();
  } else {
    // Fallback: chỉ lấy từ backend (không dùng localStorage)
    const serverItems = await pullBackendItems(maKH)
    cart.value = serverItems
    saveCart()
  }
  
  backendReady.value = true
}

// Utility to manually trigger persist on explicit logout call from anywhere
export const persistCartOnLogout = async () => {
  await persistLocalToBackendAndClear()
}

// Force reload cart from backend and REPLACE local (no merge)
const reloadCartFromBackend = async () => {
  const token = getToken()
  if (!token) {
    try { console.warn('[CART][RELOAD] No token available') } catch {}
    return false
  }
  
  const maKH = await resolveCustomerId()
  if (!maKH) {
    try { console.warn('[CART][RELOAD] Could not resolve customer ID') } catch {}
    return false
  }
  
  backendCartId.value = maKH
  
  // Sử dụng endpoint mới để lấy giỏ hàng với items
  const serverItems = await pullBackendItems(maKH)
  
  // Luôn cập nhật cart.value, ngay cả khi rỗng
  cart.value = Array.isArray(serverItems) ? serverItems : []
  saveCart()
  backendReady.value = true
  
  try { 
    console.log('[CART][RELOAD] maKH=', maKH, 'itemsCount=', cart.value.length) 
    
    // Nếu cart rỗng, có thể là do endpoints chưa hoạt động
    if (cart.value.length === 0) {
      console.log('[CART][RELOAD] Cart is empty - this may be normal if backend endpoints are not fully implemented yet')
    }
  } catch {}
  
  return true
}

const persistLocalToBackendAndClear = async () => {
  const token = getToken()
  if (!token) return
  
  // Không còn lưu local, chỉ clear state
  try { console.log('[GIOHANG][PERSIST_LOGOUT] local cart disabled, clearing state') } catch {}
  
  // Sử dụng sync endpoint mới
  try {
    const syncResult = await syncLocalCartToDBViaEndpoint();
    
    if (syncResult && syncResult.maKH) {
      console.log('[GIOHANG][PERSIST_LOGOUT] Sync successful, using maKH:', syncResult.maKH);
      
      // Sử dụng maKH từ sync response
      backendCartId.value = syncResult.maKH;
      
      // Clear local state
      cart.value = [];
      saveCart();
      return;
    }
  } catch (error) {
    console.error('[GIOHANG][PERSIST_LOGOUT] Sync error:', error);
  }
  
  // Clear local state (no local storage cart)
  cart.value = []
  saveCart()
}

// Persist local cart to backend WITHOUT clearing local
const persistLocalToBackend = async () => {
  const token = getToken()
  if (!token) return false
  const gh = await fetchOrCreateBackendCart()
  if (!gh?.maGH) return false
  const maGH = gh.maGH
  try { console.log('[GIOHANG][PERSIST] local cart disabled') } catch {}
  const serverItems = await pullBackendItems(maGH)
  const serverMap = new Map(serverItems.map(si => [String(si.productId), si]))

  // No local items to push anymore
  for (const it of []) {
    try {
      const existing = serverMap.get(String(it.productId))
      if (existing && existing.maCTGH) {
        const newQty = (existing.quantity || existing.soLuong || 0) + (it.quantity || 1)
        await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.UPDATE_QTY(existing.maCTGH)}?value=${encodeURIComponent(newQty)}`, {
          method: 'PUT',
          headers: getAuthHeaders()
        })
      } else {
        const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.ADD}`
        const headers = getAuthHeaders()
        let price = 0
        try {
          const priceRes = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_ID(it.productId)}`)
          if (priceRes.ok) {
            const p = await priceRes.json()
            price = p.giaHienTai || p.giaBan || p.price || 0
          }
        } catch {}
        const nowIso = new Date().toISOString()
        let res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ maGH, maSP: it.productId, soLuong: it.quantity, donGiaHienTai: price, thanhTien: price * (it.quantity || 1), ngayThem: nowIso }) })
        if (!res.ok) {
          res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ gioHang: { maGH }, sanPham: { maSP: it.productId }, soLuong: it.quantity, donGiaHienTai: price, thanhTien: price * (it.quantity || 1), ngayThem: nowIso }) })
        }
        if (!res.ok) {
          const body = { gioHang: { maGH }, sanPham: { maSP: it.productId }, soLuong: it.quantity, donGiaHienTai: price, thanhTien: price * (it.quantity || 1), ngayThem: nowIso }
          await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
        }
      }
    } catch (e) {
      // ignore per-item failures
    }
  }
  return true
}

// Sync local cart to backend via /api/giohang/sync endpoint - Updated theo API mới
const syncLocalCartToDBViaEndpoint = async () => {
  try {
    const localItems = cart.value.filter(item => !item.inactive); // Lọc các item không active
    
    if (localItems.length === 0) {
      console.log('[CART][SYNC] No active items to sync');
      return null;
    }
    
    const syncData = {
      items: localItems.map(item => ({
        maSP: item.productId,
        soLuong: item.quantity
      }))
    };
    
    console.log('[CART][SYNC] Syncing items:', syncData);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.SYNC}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(syncData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('[CART][SYNC][SUCCESS]', result);
      
      // API mới trả về thông tin giỏ hàng với maKH
      return {
        maKH: result.maKH,
        items: result.items || [],
        tongTien: result.tongTien || 0
      };
    } else {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('[CART][SYNC][ERROR]', response.status, error);
      throw new Error(`Sync failed: ${error.message}`);
    }
  } catch (error) {
    console.error('[CART][SYNC][EXCEPTION]', error);
    return null;
  }
};

// ========================= DEBUG & TEST FUNCTIONS =========================

// Test API connection và debug authentication
const testCartAPIConnection = async () => {
  try {
    console.log('🧪 [CART][TEST] Testing cart API connection...')
    
    const token = getToken()
    if (!token) {
      console.error('❌ [CART][TEST] No token found')
      return { success: false, error: 'No authentication token' }
    }
    
    console.log('🔑 [CART][TEST] Token found:', token.substring(0, 20) + '...')
    
    // Test 1: Resolve customer ID
    const maKH = await resolveCustomerId()
    if (!maKH) {
      console.error('❌ [CART][TEST] Could not resolve customer ID')
      return { success: false, error: 'Could not resolve customer ID' }
    }
    
    console.log('✅ [CART][TEST] Customer ID resolved:', maKH)
    
    // Test 2: Test current-user endpoint
    try {
      const currentUserUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.CURRENT_USER}`
      console.log('🧪 [CART][TEST] Testing current-user endpoint:', currentUserUrl)
      
      const currentUserRes = await fetch(currentUserUrl, { headers: getAuthHeaders() })
      console.log('📊 [CART][TEST] Current-user response status:', currentUserRes.status)
      
      if (currentUserRes.ok) {
        const currentUserData = await currentUserRes.json()
        console.log('✅ [CART][TEST] Current-user data:', currentUserData)
      } else {
        const errorText = await currentUserRes.text().catch(() => 'Unable to read')
        console.error('❌ [CART][TEST] Current-user error:', errorText)
      }
    } catch (error) {
      console.error('❌ [CART][TEST] Current-user exception:', error)
    }
    
    // Test 3: Test basic cart endpoint (without with-items)
    try {
      const basicCartUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.BY_CUSTOMER(maKH)}`
      console.log('🧪 [CART][TEST] Testing basic cart endpoint:', basicCartUrl)
      
      const basicCartRes = await fetch(basicCartUrl, { headers: getAuthHeaders() })
      console.log('📊 [CART][TEST] Basic cart response status:', basicCartRes.status)
      
      if (basicCartRes.ok) {
        const basicCartData = await basicCartRes.json()
        console.log('✅ [CART][TEST] Basic cart data:', basicCartData)
      } else {
        const errorText = await basicCartRes.text().catch(() => 'Unable to read')
        console.error('❌ [CART][TEST] Basic cart error:', errorText)
      }
    } catch (error) {
      console.error('❌ [CART][TEST] Basic cart exception:', error)
    }
    
    // Test 4: Test with-items endpoint
    try {
      const withItemsUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.BY_CUSTOMER_WITH_ITEMS(maKH)}`
      console.log('🧪 [CART][TEST] Testing with-items endpoint:', withItemsUrl)
      
      const withItemsRes = await fetch(withItemsUrl, { headers: getAuthHeaders() })
      console.log('📊 [CART][TEST] With-items response status:', withItemsRes.status)
      
      if (withItemsRes.ok) {
        const withItemsData = await withItemsRes.json()
        console.log('✅ [CART][TEST] With-items data:', withItemsData)
        return { success: true, maKH, data: withItemsData }
      } else {
        const errorText = await withItemsRes.text().catch(() => 'Unable to read')
        console.error('❌ [CART][TEST] With-items error:', errorText)
        return { success: false, error: `API returned ${withItemsRes.status}: ${errorText}` }
      }
    } catch (error) {
      console.error('❌ [CART][TEST] With-items exception:', error)
      return { success: false, error: error.message }
    }
    
  } catch (error) {
    console.error('❌ [CART][TEST] General exception:', error)
    return { success: false, error: error.message }
  }
}

// ========================= CUSTOMER CREATION =========================

// Tự động tạo thông tin khách hàng cho user mới
const createCustomerInfoForUser = async () => {
  try {
    if (!user.value?.email) {
      console.log('[CART][CREATE_CUSTOMER] No email available for user')
      return null
    }
    
    console.log('[CART][CREATE_CUSTOMER] Creating customer info for:', user.value.email)
    
    // Bước 1: Lấy maNguoiDung từ email
    const token = getToken()
    const userResponse = await fetch(`${API_CONFIG.BASE_URL}/api/nguoidung/email/${encodeURIComponent(user.value.email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!userResponse.ok) {
      console.error('[CART][CREATE_CUSTOMER] Failed to get user info:', userResponse.status)
      return null
    }
    
    const userInfo = await userResponse.json()
    const maNguoiDung = userInfo.maNguoiDung
    
    if (!maNguoiDung) {
      console.error('[CART][CREATE_CUSTOMER] No maNguoiDung found in user info')
      return null
    }
    
    console.log('[CART][CREATE_CUSTOMER] Got maNguoiDung:', maNguoiDung)
    
    // Bước 2: Tạo thông tin khách hàng mới
    const customerData = {
      nguoiDung: { maNguoiDung: maNguoiDung },
      hoTen: user.value.name || user.value.email.split('@')[0],
      soDienThoai: user.value.phone || '',
      diaChi: user.value.address || '',
      ngaySinh: user.value.birthDate || null,
      ngayTao: new Date().toISOString()
    }
    
    console.log('[CART][CREATE_CUSTOMER] Creating customer with data:', customerData)
    
    const customerResponse = await fetch(`${API_CONFIG.BASE_URL}/api/khachhang`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    })
    
    if (!customerResponse.ok) {
      const errorData = await customerResponse.json().catch(() => ({}))
      console.error('[CART][CREATE_CUSTOMER] Failed to create customer:', customerResponse.status, errorData)
      return null
    }
    
    const newCustomer = await customerResponse.json()
    const maKH = newCustomer.maKH || newCustomer.maKH
    
    if (maKH) {
      console.log('[CART][CREATE_CUSTOMER] Successfully created customer with maKH:', maKH)
      
      // Cập nhật user state với thông tin mới
      if (user.value) {
        user.value.customerInfo = { ...user.value.customerInfo, maKH }
        user.value.maKH = maKH
      }
      
      return maKH
    } else {
      console.error('[CART][CREATE_CUSTOMER] No maKH in response:', newCustomer)
      return null
    }
    
  } catch (error) {
    console.error('[CART][CREATE_CUSTOMER] Exception:', error)
    return null
  }
}

// ========================= NEW API CART OPERATIONS =========================

// Thêm/Cộng dồn item vào giỏ - sử dụng API mới
const addItemToBackendCart = async (productId, quantity = 1, price = null) => {
  try {
    const payload = {
      maSP: productId,
      soLuong: quantity
    };
    
    // Thêm giá nếu có
    if (price !== null && price > 0) {
      payload.donGiaHienTai = price;
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.ADD}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('[CART][ADD_BACKEND] Success:', result);
      return result;
    } else {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('[CART][ADD_BACKEND] Error:', response.status, error);
      return null;
    }
  } catch (error) {
    console.error('[CART][ADD_BACKEND] Exception:', error);
    return null;
  }
};

// Cập nhật số lượng item - sử dụng API mới
const updateItemQuantityInBackend = async (itemId, quantity) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.UPDATE_QTY(itemId)}?value=${quantity}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      console.log('[CART][UPDATE_QTY] Success for itemId:', itemId);
      return true;
    } else {
      console.error('[CART][UPDATE_QTY] Error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[CART][UPDATE_QTY] Exception:', error);
    return false;
  }
};

// Xóa item khỏi giỏ - sử dụng API mới
const removeItemFromBackend = async (itemId) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.REMOVE(itemId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      console.log('[CART][REMOVE_ITEM] Success for itemId:', itemId);
      return true;
    } else {
      console.error('[CART][REMOVE_ITEM] Error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[CART][REMOVE_ITEM] Exception:', error);
    return false;
  }
};

// Xóa toàn bộ items trong giỏ - sử dụng API mới
const clearBackendCart = async () => {
  try {
    const maKH = await resolveCustomerId();
    if (!maKH) return false;
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.CLEAR_ITEMS(maKH)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      console.log('[CART][CLEAR_ALL] Success for maKH:', maKH);
      return true;
    } else {
      console.error('[CART][CLEAR_ALL] Error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[CART][CLEAR_ALL] Exception:', error);
    return false;
  }
};

// Cập nhật trạng thái giỏ hàng - sử dụng API mới
const updateCartStatus = async (status) => {
  try {
    const maKH = await resolveCustomerId();
    if (!maKH) return false;
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.UPDATE_STATUS(maKH)}?value=${status}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      console.log('[CART][UPDATE_STATUS] Success:', status);
      return true;
    } else {
      console.error('[CART][UPDATE_STATUS] Error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[CART][UPDATE_STATUS] Exception:', error);
    return false;
  }
};

// ========================= HELPER FUNCTIONS =========================

// Đồng bộ itemId từ backend cho các items local
const syncItemIdsFromBackend = async () => {
  const token = getToken()
  if (!token) {
    console.log('[CART][SYNC_IDS] No token available')
    return false
  }
  
  const maKH = await resolveCustomerId()
  if (!maKH) {
    console.log('[CART][SYNC_IDS] No customer ID available')
    return false
  }
  
  try {
    console.log('[CART][SYNC_IDS] Syncing itemIds from backend...')
    const backendItems = await pullBackendItems(maKH)
    
    if (!backendItems || backendItems.length === 0) {
      console.log('[CART][SYNC_IDS] No backend items found')
      return false
    }
    
    let syncCount = 0
    
    // Cập nhật itemId cho các items trong local cart
    cart.value.forEach(localItem => {
      const backendItem = backendItems.find(bi => bi.productId === localItem.productId)
      if (backendItem && backendItem.itemId) {
        if (!localItem.itemId || localItem.itemId !== backendItem.itemId) {
          localItem.itemId = backendItem.itemId
          syncCount++
          console.log('[CART][SYNC_IDS] Updated itemId for', localItem.productId, ':', backendItem.itemId)
        }
      } else {
        console.warn('[CART][SYNC_IDS] No backend item found for', localItem.productId)
      }
    })
    
    if (syncCount > 0) {
      saveCart()
      console.log('[CART][SYNC_IDS] Synced', syncCount, 'itemIds')
    } else {
      console.log('[CART][SYNC_IDS] No itemIds needed syncing')
    }
    
    return syncCount > 0
  } catch (error) {
    console.error('[CART][SYNC_IDS] Error syncing itemIds:', error)
    return false
  }
}

// Thanh toán và cập nhật trạng thái giỏ hàng
const checkoutCart = async () => {
  const token = getToken()
  if (!token) {
    throw new Error('Cần đăng nhập để thanh toán')
  }
  
  try {
    console.log('[CART][CHECKOUT] Processing checkout...')
    
    // Cập nhật trạng thái giỏ thành "Paid" (1)
    const success = await updateCartStatus(1)
    
    if (success) {
      console.log('[CART][CHECKOUT] Successfully updated cart status to Paid')
      
      // Clear local cart sau khi thanh toán thành công
      cart.value = []
      saveCart()
      backendReady.value = false
      
      return { success: true, message: 'Thanh toán thành công' }
    } else {
      throw new Error('Không thể cập nhật trạng thái giỏ hàng')
    }
  } catch (error) {
    console.error('[CART][CHECKOUT] Error:', error)
    return { success: false, error: error.message }
  }
}

// Hủy giỏ hàng
const cancelCart = async () => {
  const token = getToken()
  if (!token) {
    throw new Error('Cần đăng nhập để hủy giỏ hàng')
  }
  
  try {
    console.log('[CART][CANCEL] Cancelling cart...')
    
    // Cập nhật trạng thái giỏ thành "Canceled" (2)
    const success = await updateCartStatus(2)
    
    if (success) {
      console.log('[CART][CANCEL] Successfully cancelled cart')
      
      // Clear local cart sau khi hủy
      cart.value = []
      saveCart()
      backendReady.value = false
      
      return { success: true, message: 'Đã hủy giỏ hàng' }
    } else {
      throw new Error('Không thể hủy giỏ hàng')
    }
  } catch (error) {
    console.error('[CART][CANCEL] Error:', error)
    return { success: false, error: error.message }
  }
}

// ========================= LOCAL CART FUNCTIONS =========================

// Cart functions
const addToCart = async (productId, quantity = 1, productData = null) => {
  try { console.log('[CART][ADD] productId=', productId, 'quantity=', quantity) } catch {}
  
  // YÊU CẦU ĐĂNG NHẬP: nếu chưa có token → chuyển hướng tới /login và ghi nhớ ý định mua
  const token = getToken()
  if (!token) {
    try {
      sessionStorage.setItem('pending-cart-add', JSON.stringify({ productId, quantity }))
      // Lưu trang hiện tại để quay lại sau đăng nhập
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('easymart-redirect-after-login', window.location.pathname || '/')
        window.location.href = '/login'
      }
    } catch {}
    return { success: false, needsLogin: true }
  }
  
  // Kiểm tra sản phẩm có active không (để tránh thêm sản phẩm ngừng bán)
  let isActiveProduct = true
  let finalProductData = productData
  let productStatus = null
  
  try {
    if (productData) {
      if (typeof productData.trangThai !== 'undefined') {
        isActiveProduct = (productData.trangThai === 1)  // ← Sửa: 1 = còn bán, 0 = ngừng bán
        productStatus = productData.trangThai
      } else if (typeof productData.isActive !== 'undefined') {
        isActiveProduct = !!productData.isActive
        productStatus = productData.isActive ? 'active' : 'inactive'
      } else {
        isActiveProduct = true
        productStatus = 'unknown'
      }
    } else {
      // Fetch product data để có giá và thông tin
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_ID(productId)}`)
      if (res.ok) {
        const d = await res.json()
        finalProductData = d
        if (typeof d.trangThai !== 'undefined') {
          isActiveProduct = (d.trangThai === 1)  // ← Sửa: 1 = còn bán, 0 = ngừng bán
          productStatus = d.trangThai
        } else if (typeof d.isActive !== 'undefined') {
          isActiveProduct = !!d.isActive
          productStatus = d.isActive ? 'active' : 'inactive'
        }
      }
    }
  } catch (error) {
    console.warn('[CART][ADD] Could not check product status:', error)
    // Nếu không thể kiểm tra, cho phép thêm (an toàn hơn)
    isActiveProduct = true
    productStatus = 'unknown'
  }
  
  if (!isActiveProduct) {
    console.warn('[CART][ADD] Product is inactive, skip add:', productId, 'status:', productStatus)
    
    // Hiển thị thông báo lỗi cho user
    if (typeof window !== 'undefined') {
      alert(`⚠️ Sản phẩm ${productId} hiện không khả dụng!\n\nTrạng thái: ${productStatus === 0 ? 'Ngừng bán' : 'Không khả dụng'}\n\nVui lòng chọn sản phẩm khác hoặc liên hệ admin để kích hoạt sản phẩm.`)
    }
    
    return { 
      success: false, 
      inactive: true, 
      message: `Sản phẩm ${productId} hiện không khả dụng (trạng thái: ${productStatus})` 
    }
  }
  
  // Thêm trực tiếp vào backend (không còn local cart)
  try {
    console.log('[CART][ADD] Adding to backend:', productId, 'quantity:', quantity)
    const price = finalProductData?.giaHienTai || finalProductData?.price || 0
    const result = await addItemToBackendCart(productId, quantity, price)
    if (result) {
      await reloadCartFromBackend()
      return { success: true, message: `Đã thêm ${quantity} sản phẩm vào giỏ hàng` }
    }
  } catch (error) {
    console.error('[CART][ADD] Backend add error:', error)
    
    // Hiển thị thông báo lỗi cho user
    if (typeof window !== 'undefined') {
      alert(`❌ Không thể thêm sản phẩm vào giỏ hàng!\n\nLỗi: ${error.message || 'Lỗi không xác định'}\n\nVui lòng thử lại sau hoặc liên hệ admin.`)
    }
    
    return { success: false, error: error.message || 'Không thể thêm vào giỏ hàng' }
  }
  return { success: false, error: 'Không thể thêm vào giỏ hàng' }
}

const removeFromCart = async (productId) => {
  const index = cart.value.findIndex(item => item.productId === productId)
  if (index !== -1) {
    const item = cart.value[index]
    
    // Nếu đã đăng nhập, tìm và xóa từ backend trước
    const token = getToken()
    if (token) {
      try {
        // Nếu item chưa có itemId, sync trước
        if (!item.itemId) {
          console.log('[CART][REMOVE] Item missing itemId, syncing from backend...')
          await syncItemIdsFromBackend()
          // Refresh item reference sau khi sync
          const updatedItem = cart.value.find(i => i.productId === productId)
          if (updatedItem?.itemId) {
            item.itemId = updatedItem.itemId
          }
        }
        
        if (item.itemId) {
          console.log('[CART][REMOVE] Removing from backend:', item.itemId)
          const success = await removeItemFromBackend(item.itemId)
          if (success) {
            console.log('[CART][REMOVE] Successfully removed from backend')
          } else {
            console.warn('[CART][REMOVE] Failed to remove from backend, continuing with local removal')
          }
        } else {
          // Fallback: xóa bằng cách clear và re-add các items khác
          console.log('[CART][REMOVE] No itemId found, using fallback method')
          const otherItems = cart.value.filter(i => i.productId !== productId)
          await clearBackendCart()
          
          // Re-add các items khác
          for (const otherItem of otherItems) {
            if (!otherItem.inactive) {
              await addItemToBackendCart(
                otherItem.productId, 
                otherItem.quantity, 
                otherItem.product?.giaHienTai || otherItem.price || 0
              )
            }
          }
        }
      } catch (error) {
        console.error('[CART][REMOVE] Backend removal error:', error)
      }
    }
    
    // Xóa từ local cart
    cart.value.splice(index, 1)
    saveCart()
    
    console.log('[CART][REMOVE] Removed from local cart:', productId)
  }
}

const updateCartQuantity = async (productId, quantity) => {
  const existingItem = findCartItemByProduct(productId)
  if (existingItem) {
    if (quantity <= 0) {
      await removeFromCart(productId)
    } else {
      // Nếu đã đăng nhập, cập nhật backend trước
      const token = getToken()
      if (token) {
        try {
          // Nếu item chưa có itemId, sync trước
          if (!existingItem.itemId) {
            console.log('[CART][UPDATE_QTY] Item missing itemId, syncing from backend...')
            await syncItemIdsFromBackend()
            // Refresh item reference sau khi sync
            const updatedItem = cart.value.find(i => i.productId === productId)
            if (updatedItem?.itemId) {
              existingItem.itemId = updatedItem.itemId
            }
          }
          
          if (existingItem.itemId) {
            console.log('[CART][UPDATE_QTY] Updating backend quantity:', existingItem.itemId, 'to', quantity)
            const success = await updateItemQuantityInBackend(existingItem.itemId, quantity)
            if (success) {
              console.log('[CART][UPDATE_QTY] Successfully updated backend')
            } else {
              console.warn('[CART][UPDATE_QTY] Failed to update backend, continuing with local update')
            }
          } else {
            // Fallback: xóa item hiện tại và thêm lại với số lượng mới
            console.log('[CART][UPDATE_QTY] No itemId found, using fallback method')
            await removeFromCart(productId)
            await addToCart(productId, quantity, existingItem.product)
            return // Exit early vì đã handle xong
          }
        } catch (error) {
          console.error('[CART][UPDATE_QTY] Backend update error:', error)
        }
      }
      
      // Cập nhật local cart
      existingItem.quantity = quantity
      saveCart()
      
      console.log('[CART][UPDATE_QTY] Updated local quantity:', productId, 'to', quantity)
    }
  }
}

const clearCart = async () => {
  // Nếu đã đăng nhập, xóa toàn bộ items từ backend trước
  const token = getToken()
  if (token) {
    try {
      console.log('[CART][CLEAR] Clearing backend cart...')
      const success = await clearBackendCart()
      if (success) {
        console.log('[CART][CLEAR] Successfully cleared backend cart')
      } else {
        console.warn('[CART][CLEAR] Failed to clear backend cart, continuing with local clear')
      }
    } catch (error) {
      console.error('[CART][CLEAR] Backend clear error:', error)
    }
  }
  
  // Xóa local cart
  cart.value = []
  saveCart()
  
  console.log('[CART][CLEAR] Cleared local cart')
}

const getCartItemsWithProducts = (products) => {
  return cart.value.map(item => {
    const product = products.find(p => p.id === item.productId)
    return {
      ...item,
      product: product || item.product // Use stored product data as fallback
    }
  }).filter(item => item.product) // Filter out items without product data
}

const getCartTotal = (products) => {
  return cart.value.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId)
    return total + (product ? product.price * item.quantity : 0)
  }, 0)
}

// Initialize cart on first load
loadCart()

// Detect login/logout via reactive user ref from useAuth
watch(user, async (newUser, oldUser) => {
  const token = getToken()
  if (newUser && !oldUser && token) {
    try { console.log('[GIOHANG][AUTH_WATCH] login detected') } catch {}
    
    // Nếu có ý định thêm vào giỏ trước khi login → thực hiện ngay
    try {
      const pending = sessionStorage.getItem('pending-cart-add')
      if (pending) {
        const { productId, quantity } = JSON.parse(pending)
        sessionStorage.removeItem('pending-cart-add')
        console.log('[GIOHANG][AUTH_WATCH] Processing pending cart add:', productId, quantity)
        const result = await addToCart(productId, quantity)
        if (result.success) {
          console.log('[GIOHANG][AUTH_WATCH] Successfully added pending item:', result.message)
        } else {
          console.warn('[GIOHANG][AUTH_WATCH] Failed to add pending item:', result.error || result.message)
        }
      }
    } catch (error) {
      console.error('[GIOHANG][AUTH_WATCH] Error processing pending cart add:', error)
    }
    
    // Luôn reload cart từ backend sau khi đăng nhập
    console.log('[GIOHANG][AUTH_WATCH] Reloading cart from backend...')
    const reloadResult = await reloadCartFromBackend()
    if (reloadResult) {
      console.log('[GIOHANG][AUTH_WATCH] Cart reload successful, items count:', cart.value.length)
    } else {
      console.warn('[GIOHANG][AUTH_WATCH] Cart reload failed, but continuing...')
    }
  }
})

// Thêm hàm fallback để thêm từng item - Updated cho API mới
const fallbackPersistItems = async (maKH) => {
  try {
    console.log('[GIOHANG][FALLBACK] Adding items to cart for maKH:', maKH);
    
    for (const item of cart.value) {
      if (!item.inactive) { // Chỉ thêm items không bị đánh dấu inactive
        try {
          const result = await addItemToBackendCart(
            item.productId, 
            item.quantity, 
            item.product?.giaHienTai || item.product?.price || null
          );
          
          if (result) {
            console.log('[GIOHANG][FALLBACK] Item added successfully:', item.productId);
          } else {
            console.error('[GIOHANG][FALLBACK] Failed to add item:', item.productId);
          }
        } catch (itemError) {
          console.error('[GIOHANG][FALLBACK] Exception adding item:', itemError);
        }
      } else {
        console.log('[GIOHANG][FALLBACK] Skipping inactive item:', item.productId);
      }
    }
  } catch (error) {
    console.error('[GIOHANG][FALLBACK] Error in fallback persist:', error);
  }
};

// Initial check on module load (in case page reloads while logged in)
;(async () => {
  const token = getToken()
  if (token) {
    try { console.log('[GIOHANG][INIT] token present, syncing cart...') } catch {}
    
    if (cart.value.length === 0) {
      console.log('[GIOHANG][INIT] Local cart empty, just reloading backend');
      await reloadCartFromBackend();
      return;
    }

    // Bước 1: Thử sync
    const syncResult = await syncLocalCartToDBViaEndpoint();
    
    if (syncResult && syncResult.maKH) {
      console.log('[GIOHANG][INIT] Sync successful, using maKH:', syncResult.maKH);
      
      // Sử dụng maKH từ sync response
      backendCartId.value = syncResult.maKH;
      
      // Kiểm tra nếu items vẫn rỗng, thử fallback
      if (!syncResult.items || syncResult.items.length === 0) {
        console.warn('[GIOHANG][INIT] Sync returned empty items, trying fallback...');
        await fallbackPersistItems(syncResult.maKH);
      }
      
      // Reload cart từ backend
      await reloadCartFromBackend();
    } else {
      console.log('[GIOHANG][INIT] Sync failed, using fallback strategy');
      
      // Fallback: Sử dụng sync endpoint hoặc thêm từng item
      await mergeWithBackendOnLogin();
    }
  }
})()

export function useCart() {
  return {
    // State
    cart,
    backendCartId,
    backendReady,
    
    // Computed
    cartCount,
    cartTotal,
    
    // Local Cart Functions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartItemsWithProducts,
    getCartTotal,
    loadCart,
    saveCart,
    
    // Backend API Functions - New
    addItemToBackendCart,
    updateItemQuantityInBackend,
    removeItemFromBackend,
    clearBackendCart,
    updateCartStatus,
    
    // Helper Functions
    syncItemIdsFromBackend,
    checkoutCart,
    cancelCart,
    createCustomerInfoForUser,
    
    // Sync helpers
    mergeWithBackendOnLogin,
    persistLocalToBackendAndClear,
    reloadCartFromBackend,
    syncLocalCartToDBViaEndpoint,
    
    // Debug & Test Functions
    testCartAPIConnection,
    debugCartState: () => {
      console.log('=== CART DEBUG STATE ===')
      console.log('Local cart items:', cart.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        itemId: item.itemId,
        hasItemId: !!item.itemId,
        inactive: item.inactive
      })))
      console.log('Backend cart ID:', backendCartId.value)
      console.log('Backend ready:', backendReady.value)
      console.log('Token available:', !!getToken())
      return cart.value
    },
    // Debug helpers - Updated cho API mới
    getLocalCartSnapshot: () => ({ count: cart.value.length, items: cart.value.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
    getBackendCartSnapshot: async () => {
      const token = getToken()
      if (!token) return { maKH: null, items: [] }
      const maKH = await resolveCustomerId()
      if (!maKH) return { maKH: null, items: [] }
      const items = await pullBackendItems(maKH)
      return { maKH, items }
    },
    compareLocalAndBackend: async () => {
      const local = { count: cart.value.length, items: cart.value.map(i => ({ productId: i.productId, quantity: i.quantity })) }
      const token = getToken()
      let backend = { maKH: null, items: [] }
      if (token) {
        const maKH = await resolveCustomerId()
        if (maKH) {
          const items = await pullBackendItems(maKH)
          backend = { maKH, items }
        }
      }
      const mapQty = (items) => {
        const m = new Map()
        for (const it of items) {
          const k = String(it.productId)
          m.set(k, (m.get(k) || 0) + (it.quantity || 0))
        }
        return m
      }
      const lm = mapQty(local.items)
      const bm = mapQty(backend.items)
      const keys = new Set([...lm.keys(), ...bm.keys()])
      const diff = []
      for (const k of keys) {
        const lq = lm.get(k) || 0
        const bq = bm.get(k) || 0
        diff.push({ productId: k, localQty: lq, backendQty: bq, equal: lq === bq })
      }
      return { local, backend, diff }
    }
  }
}
