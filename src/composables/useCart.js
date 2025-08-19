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

// Load cart from localStorage on init
const loadCart = () => {
  const savedCart = localStorage.getItem('easymart-cart')
  if (savedCart) {
    cart.value = JSON.parse(savedCart)
  } else {
    // Ensure key exists for tooling that expects it
    cart.value = []
    saveCart()
  }
}

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem('easymart-cart', JSON.stringify(cart.value))
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
    // Prefer server-provided info to avoid inconsistencies
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/giohang/current-user`, { headers: getAuthHeaders() })
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
  const completeUser = await ensureUserComplete().catch(() => user.value)
  if (!completeUser?.customerInfo?.maKH) {
    try { await validateProfileAccess() } catch {}
  }
  const maKH = user.value?.customerInfo?.maKH || null
  try { console.log('[CART][RESOLVE_KH] userId=', completeUser?.id, 'maKH=', maKH) } catch {}
  return maKH
}

const fetchOrCreateBackendCart = async () => {
  try {
    const maKH = await resolveCustomerId()
    if (!maKH) return null
    // 1) Try to get active cart by customer
    const byCustomerUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.BY_CUSTOMER(maKH)}`
    try { console.log('[CART][GET_CART_BY_KH][REQ]', byCustomerUrl) } catch {}
    const res = await fetch(byCustomerUrl, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      // Accept common shapes
      const gh = data?.result || data?.data || data
      if (gh?.maGH) {
        try { console.log('[CART][GET_CART_BY_KH][OK] maKH=', maKH, 'maGH=', gh.maGH) } catch {}
        return gh
      }
    } else {
      // If redirected or unauthorized, don't create new cart
      try { console.warn('[CART][GET_CART_BY_KH][FAIL] status=', res.status) } catch {}
      return null
    }
    // Skip GET all carts fallback; rely on BY_CUSTOMER or CREATE
    // 2) Create new cart (only if authenticated and no active cart)
    // Try empty body first so backend binds cart to current JWT user
    const createUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.CREATE}`
    try { console.log('[CART][CREATE_CART][REQ#1]', createUrl) } catch {}
    let createRes = await fetch(createUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({})
    })
    if (!createRes.ok) {
      // Fallback to flat body
      try { console.warn('[CART][CREATE_CART][FALLBACK#2] status=', createRes.status) } catch {}
      createRes = await fetch(createUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ khachHang: { maKH }, trangThai: 0, ghiChu: 'Đang chọn hàng' })
      })
    }
    if (!createRes.ok) {
      try { console.error('[CART][CREATE_CART][FAIL] status=', createRes.status) } catch {}
      return null
    }
    const created = await createRes.json().catch(() => null)
    try { console.log('[CART][CREATE_CART][OK] maGH=', created?.maGH || created?.result?.maGH) } catch {}
    return created?.result || created?.data || created
  } catch (_e) {
    return null
  }
}

const pullBackendItems = async (maGH) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.BY_CART(maGH)}`
    try { console.log('[CART][PULL_ITEMS][REQ]', url) } catch {}
    const res = await fetch(url, {
      headers: getAuthHeaders()
    })
    if (!res.ok) {
      try { console.error('[CART][PULL_ITEMS][FAIL] status=', res.status) } catch {}
      return []
    }
    const data = await res.json().catch(() => [])
    const items = (data?.result || data?.data || data || [])
    try { console.log('[CART][PULL_ITEMS][OK] maGH=', maGH, 'count=', (items || []).length) } catch {}
    return items
      .filter(it => !it.isDeleted)
      .map(it => ({
        productId: (it.sanPham?.maSP) || it.maSP || it.productId,
        quantity: it.soLuong || it.quantity || 1,
        maCTGH: it.maCTGH
      }))
  } catch (_e) {
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
  const gh = await fetchOrCreateBackendCart()
  if (!gh?.maGH) return
  backendCartId.value = gh.maGH
  const serverItems = await pullBackendItems(gh.maGH)
  const localItems = JSON.parse(localStorage.getItem('easymart-cart') || '[]')
  const merged = buildMergedItems(localItems, serverItems)
  cart.value = merged
  saveCart()
  backendReady.value = true
}

// Utility to manually trigger persist on explicit logout call from anywhere
export const persistCartOnLogout = async () => {
  await persistLocalToBackendAndClear()
}

// Force reload cart from backend and REPLACE local (no merge)
const reloadCartFromBackend = async () => {
  const token = getToken()
  if (!token) return false
  // Prefer with-items endpoint for a single call
  let gh = await fetchOrCreateBackendCart()
  if (!gh?.maGH) return false
  backendCartId.value = gh.maGH
  let serverItems = []
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART.WITH_ITEMS_BY_ID(gh.maGH)}`
    try { console.log('[CART][WITH_ITEMS][REQ]', url) } catch {}
    const res = await fetch(url, { headers: getAuthHeaders() })
    if (res.ok) {
      const data = await res.json()
      const items = data?.items || data?.chiTietGioHang || []
      try { console.log('[GIOHANG][WITH_ITEMS] maGH=', gh.maGH, 'itemsCount=', items.length) } catch {}
      serverItems = (items || []).map(it => ({
        productId: (it.sanPham?.maSP) || it.maSP || it.productId,
        quantity: it.soLuong || it.quantity || 1,
        maCTGH: it.maCTGH
      }))
    } else {
      try { console.warn('[CART][WITH_ITEMS][FAIL] status=', res.status) } catch {}
    }
  } catch {}
  if (!serverItems.length) {
    serverItems = await pullBackendItems(gh.maGH)
  }
  if (Array.isArray(serverItems)) {
    cart.value = serverItems
    saveCart()
    backendReady.value = true
    return true
  }
  return false
}

const persistLocalToBackendAndClear = async () => {
  const token = getToken()
  if (!token) return
  // Read local items early; if none, skip
  const localItems = JSON.parse(localStorage.getItem('easymart-cart') || '[]')
  if (!Array.isArray(localItems) || localItems.length === 0) {
    try { console.log('[GIOHANG][PERSIST_LOGOUT] skip: no local items') } catch {}
    cart.value = []
    saveCart()
    return
  }
  const gh = await fetchOrCreateBackendCart()
  if (!gh?.maGH) return
  const maGH = gh.maGH
  try { console.log('[GIOHANG][PERSIST_LOGOUT] maGH=', maGH, 'itemsCount=', localItems.length) } catch {}
  // Bước 1: Thử sync trước
  try {
    const syncResult = await syncLocalCartToDBViaEndpoint();
    
    if (syncResult && syncResult.maGH) {
      console.log('[GIOHANG][PERSIST_LOGOUT] Sync successful, using maGH:', syncResult.maGH);
      
      // Sử dụng maGH từ sync response
      backendCartId.value = syncResult.maGH;
      
      // Kiểm tra nếu items vẫn rỗng, thử fallback
      if (!syncResult.items || syncResult.items.length === 0) {
        console.warn('[GIOHANG][PERSIST_LOGOUT] Sync returned empty items, trying fallback...');
        await fallbackPersistItems(syncResult.maGH);
      }
      
      // Clear local cart sau khi sync thành công
      cart.value = [];
      saveCart();
      return;
    }
  } catch (error) {
    console.error('[GIOHANG][PERSIST_LOGOUT] Sync error:', error);
    // Fallthrough to per-item strategy
  }
  // Upsert strategy: update existing items; add if missing. Tránh clear để không mất dữ liệu nếu ADD lỗi
  const serverItems = await pullBackendItems(maGH)
  const serverMap = new Map(serverItems.map(si => [String(si.productId), si]))

  for (const it of localItems) {
    try {
      const existing = serverMap.get(String(it.productId))
      if (existing && existing.maCTGH) {
        // Update quantity = existing + local
        const newQty = (existing.quantity || existing.soLuong || 0) + (it.quantity || 1)
        await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.UPDATE_QTY(existing.maCTGH)}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ soLuong: newQty })
        })
      } else {
        // Try ADD with robust body fallbacks
        const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.ADD}`
        const headers = getAuthHeaders()
        // Ensure price from detail
        let price = 0
        try {
          const priceRes = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_ID(it.productId)}`)
          if (priceRes.ok) {
            const p = await priceRes.json()
            price = p.giaHienTai || p.giaBan || p.price || 0
          }
        } catch {}
        const nowIso = new Date().toISOString()
        // Try minimal payloads first (backend may auto-calc). Omit donGiaHienTai if 0
        const nestedPayload = { gioHang: { maGH }, sanPham: { maSP: it.productId }, soLuong: it.quantity }
        if (price > 0) nestedPayload.donGiaHienTai = price
        // Attempt 1: nested minimal
        let res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(nestedPayload) })
        if (!res.ok) {
          // Attempt 2: flat minimal
          const flatPayload = { maGH, maSP: it.productId, soLuong: it.quantity }
          if (price > 0) flatPayload.donGiaHienTai = price
          res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(flatPayload) })
        }
        if (!res.ok) {
          // Attempt 3: log error body then give up on this item
          try {
            const text = await res.text()
            console.error('[GIOHANG][ADD_ITEM][500]', res.status, text)
          } catch {}
        }
      }
    } catch (e) {
      // swallow to ensure logout flow continues
      // console.warn('Add cart item failed', e)
    }
  }
  // Clear local cart after persisting
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
  const localItems = JSON.parse(localStorage.getItem('easymart-cart') || '[]')
  try { console.log('[GIOHANG][PERSIST] maGH=', maGH, 'itemsCount=', localItems.length) } catch {}
  const serverItems = await pullBackendItems(maGH)
  const serverMap = new Map(serverItems.map(si => [String(si.productId), si]))

  for (const it of localItems) {
    try {
      const existing = serverMap.get(String(it.productId))
      if (existing && existing.maCTGH) {
        const newQty = (existing.quantity || existing.soLuong || 0) + (it.quantity || 1)
        await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.UPDATE_QTY(existing.maCTGH)}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ soLuong: newQty })
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

// Sync local cart to backend via /api/giohang/sync endpoint
const syncLocalCartToDBViaEndpoint = async () => {
  try {
    const localItems = cart.value.filter(item => item.product && item.product.trangThai === 0);
    
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
      
      // Trả về maGH từ sync response
      return {
        maGH: result.maGH,
        items: result.items || []
      };
    } else {
      const error = await response.json();
      console.error('[CART][SYNC][ERROR]', response.status, error);
      throw new Error(`Sync failed: ${error.message}`);
    }
  } catch (error) {
    console.error('[CART][SYNC][EXCEPTION]', error);
    return null;
  }
};

// Cart functions
const addToCart = async (productId, quantity = 1, productData = null) => {
  try { console.log('[CART][ADD_LOCAL] productId=', productId, 'quantity=', quantity) } catch {}
  // Respect backend rule when we KNOW trạng thái; otherwise, allow add and let backend filter on persist
  let isActiveProduct = true
  try {
    if (productData) {
      if (typeof productData.trangThai !== 'undefined') {
        isActiveProduct = (productData.trangThai === 0)
      } else if (typeof productData.isActive !== 'undefined') {
        isActiveProduct = !!productData.isActive
      } else {
        isActiveProduct = true
      }
    } else {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS.BY_ID(productId)}`)
      if (res.ok) {
        const d = await res.json()
        if (typeof d.trangThai !== 'undefined') {
          isActiveProduct = (d.trangThai === 0)
        } else if (typeof d.isActive !== 'undefined') {
          isActiveProduct = !!d.isActive
        }
      }
    }
  } catch {}
  // If product is not active, still allow adding to local cart (for visibility),
  // backend will filter on persist; mark item as inactive for potential UI use.
  const markInactive = !isActiveProduct

  const existingItem = findCartItemByProduct(productId)
  if (existingItem) {
    existingItem.quantity += quantity
    if (markInactive) existingItem.inactive = true
  } else {
    cart.value.push({ productId, quantity, product: productData, inactive: markInactive })
  }
  saveCart()
  return true
}

const removeFromCart = async (productId) => {
  const index = cart.value.findIndex(item => item.productId === productId)
  if (index !== -1) {
    cart.value.splice(index, 1)
    saveCart()
  }
}

const updateCartQuantity = async (productId, quantity) => {
  const existingItem = findCartItemByProduct(productId)
  if (existingItem) {
    if (quantity <= 0) {
      await removeFromCart(productId)
    } else {
      existingItem.quantity = quantity
      saveCart()
    }
  }
}

const clearCart = async () => {
  cart.value = []
  saveCart()
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
    try { console.log('[GIOHANG][AUTH_WATCH] login detected, syncing cart...') } catch {}
    
    if (cart.value.length === 0) {
      console.log('[GIOHANG][AUTH_WATCH] Local cart empty, just reloading backend');
      await reloadCartFromBackend();
      return;
    }

    // Bước 1: Thử sync
    const syncResult = await syncLocalCartToDBViaEndpoint();
    
    if (syncResult && syncResult.maGH) {
      console.log('[GIOHANG][AUTH_WATCH] Sync successful, using maGH:', syncResult.maGH);
      
      // Sử dụng maGH từ sync response
      backendCartId.value = syncResult.maGH;
      
      // Kiểm tra nếu items vẫn rỗng, thử fallback
      if (!syncResult.items || syncResult.items.length === 0) {
        console.warn('[GIOHANG][AUTH_WATCH] Sync returned empty items, trying fallback...');
        await fallbackPersistItems(syncResult.maGH);
      }
      
      // Reload cart từ backend
      await reloadCartFromBackend();
    } else {
      console.log('[GIOHANG][AUTH_WATCH] Sync failed, using fallback strategy');
      
      // Fallback: Tạo giỏ hàng mới và thêm từng item
      const maGH = await fetchOrCreateBackendCart();
      if (maGH) {
        await fallbackPersistItems(maGH);
        await reloadCartFromBackend();
      }
    }
  }
})

// Thêm hàm fallback để thêm từng item
const fallbackPersistItems = async (maGH) => {
  try {
    console.log('[GIOHANG][FALLBACK] Adding items to cart:', maGH);
    
    for (const item of cart.value) {
      if (item.product && item.product.trangThai === 0) {
        try {
          const payload = {
            gioHang: { maGH: maGH },
            sanPham: { maSP: item.productId },
            soLuong: item.quantity,
            donGiaHienTai: item.product.giaHienTai || 0
          };
          
          console.log('[GIOHANG][FALLBACK] Adding item:', payload);
          
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CART_ITEMS.ADD}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          });
          
          if (response.ok) {
            console.log('[GIOHANG][FALLBACK] Item added successfully');
          } else {
            const error = await response.json();
            console.error('[GIOHANG][FALLBACK] Failed to add item:', response.status, error);
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
    
    if (syncResult && syncResult.maGH) {
      console.log('[GIOHANG][INIT] Sync successful, using maGH:', syncResult.maGH);
      
      // Sử dụng maGH từ sync response
      backendCartId.value = syncResult.maGH;
      
      // Kiểm tra nếu items vẫn rỗng, thử fallback
      if (!syncResult.items || syncResult.items.length === 0) {
        console.warn('[GIOHANG][INIT] Sync returned empty items, trying fallback...');
        await fallbackPersistItems(syncResult.maGH);
      }
      
      // Reload cart từ backend
      await reloadCartFromBackend();
    } else {
      console.log('[GIOHANG][INIT] Sync failed, using fallback strategy');
      
      // Fallback: Tạo giỏ hàng mới và thêm từng item
      const maGH = await fetchOrCreateBackendCart();
      if (maGH) {
        await fallbackPersistItems(maGH);
        await reloadCartFromBackend();
      }
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
    
    // Functions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartItemsWithProducts,
    getCartTotal,
    loadCart,
    saveCart,
    // Sync helpers
    mergeWithBackendOnLogin,
    persistLocalToBackendAndClear,
    reloadCartFromBackend,
    // Debug helpers
    getLocalCartSnapshot: () => ({ count: cart.value.length, items: cart.value.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
    getBackendCartSnapshot: async () => {
      const token = getToken()
      if (!token) return { maGH: null, items: [] }
      const gh = await fetchOrCreateBackendCart()
      if (!gh?.maGH) return { maGH: null, items: [] }
      const items = await pullBackendItems(gh.maGH)
      return { maGH: gh.maGH, items }
    },
    compareLocalAndBackend: async () => {
      const local = { count: cart.value.length, items: cart.value.map(i => ({ productId: i.productId, quantity: i.quantity })) }
      const token = getToken()
      let backend = { maGH: null, items: [] }
      if (token) {
        const gh = await fetchOrCreateBackendCart()
        if (gh?.maGH) {
          const items = await pullBackendItems(gh.maGH)
          backend = { maGH: gh.maGH, items }
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