/**
 * userHelpers.js - Helper functions for user operations that require complete user info
 * 
 * These functions ensure user has complete info (including ID) before performing operations
 */

import { useAuth } from '../composables/useAuth'

// Get current user with complete info (including ID)
export const getCurrentUserComplete = async () => {
  const { ensureUserComplete } = useAuth()
  return await ensureUserComplete()
}

// Helper for cart operations - ensures user has ID
export const addToCartWithUser = async (productId, quantity = 1) => {
  const user = await getCurrentUserComplete()
  
  if (!user || !user.id) {
    throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
  }
  
  console.log('🛒 Adding to cart for user ID:', user.id)
  
  // Call your cart API with user ID
  // Example: return apiCall('/api/cart/add', 'POST', { userId: user.id, productId, quantity })
  
  return {
    success: true,
    userId: user.id,
    productId,
    quantity,
    message: 'Đã thêm vào giỏ hàng'
  }
}

// Helper for order operations - ensures user has ID
export const createOrderWithUser = async (orderData) => {
  const user = await getCurrentUserComplete()
  
  if (!user || !user.id) {
    throw new Error('Vui lòng đăng nhập để tạo đơn hàng')
  }
  
  console.log('📦 Creating order for user ID:', user.id)
  
  const orderPayload = {
    ...orderData,
    customerId: user.id,
    customerEmail: user.email,
    customerName: user.name,
    customerPhone: user.phone,
    customerAddress: user.address
  }
  
  // Call your order API with complete user info
  // Example: return apiCall('/api/orders/create', 'POST', orderPayload)
  
  return {
    success: true,
    orderId: 'ORDER_' + Date.now(),
    customerId: user.id,
    ...orderPayload
  }
}

// Helper for profile update operations - ensures user has ID
export const updateProfileWithUser = async (profileData) => {
  const user = await getCurrentUserComplete()
  
  if (!user || !user.id) {
    throw new Error('Vui lòng đăng nhập để cập nhật thông tin')
  }
  
  console.log('👤 Updating profile for user ID:', user.id)
  
  // Call your profile update API with user ID
  // Example: return apiCall(`/api/users/${user.id}`, 'PUT', profileData)
  
  return {
    success: true,
    userId: user.id,
    updatedData: profileData,
    message: 'Cập nhật thông tin thành công'
  }
}

// Helper for review operations - ensures user has ID
export const submitReviewWithUser = async (productId, reviewData) => {
  const user = await getCurrentUserComplete()
  
  if (!user || !user.id) {
    throw new Error('Vui lòng đăng nhập để viết đánh giá')
  }
  
  console.log('⭐ Submitting review for user ID:', user.id)
  
  const reviewPayload = {
    ...reviewData,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    productId
  }
  
  // Call your review API with user info
  // Example: return apiCall('/api/reviews/create', 'POST', reviewPayload)
  
  return {
    success: true,
    reviewId: 'REVIEW_' + Date.now(),
    userId: user.id,
    productId,
    ...reviewPayload
  }
}

// Helper to check if user is ready for operations
export const isUserReadyForOperations = async () => {
  try {
    const user = await getCurrentUserComplete()
    return !!(user && user.id && user.email)
  } catch (error) {
    console.error('Error checking user readiness:', error)
    return false
  }
}

// Helper to get user ID safely
export const getUserId = async () => {
  try {
    const user = await getCurrentUserComplete()
    return user?.id || null
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}
