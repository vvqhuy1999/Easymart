<template>
  <div class="write-review-section">
    <!-- Write Review Button (show when not logged in or not writing) -->
    <div v-if="!isLoggedIn && !showReviewForm" class="text-center mb-4">
      <div class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        <strong>Bạn cần đăng nhập để viết đánh giá</strong>
      </div>
      <router-link to="/login" class="btn btn-primary">
        <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập ngay
      </router-link>
    </div>
    
    <!-- Write Review Button (show when logged in but not writing) -->
    <div v-else-if="isLoggedIn && !showReviewForm" class="text-center mb-4">
      <button class="btn btn-success btn-lg" @click="showReviewForm = true">
        <i class="fas fa-pen me-2"></i>Viết đánh giá
      </button>
    </div>
    
    <!-- Review Form (show when writing) -->
    <div v-if="showReviewForm && isLoggedIn" class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-star me-2"></i>Viết đánh giá cho sản phẩm này
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitReview">
          <!-- User info display -->
          <div class="d-flex align-items-center mb-3 p-3 bg-light rounded">
            <img :src="user.avatar" class="rounded-circle me-3" width="50" height="50" :alt="user.name">
            <div>
              <h6 class="mb-0">{{ user.name }}</h6>
              <small class="text-muted">{{ user.email }}</small>
            </div>
          </div>
          
          <!-- Rating Selection -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Đánh giá của bạn *</label>
            <div class="rating-input d-flex align-items-center gap-3">
              <div class="star-rating">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  :class="[
                    'fas fa-star star-clickable',
                    star <= selectedRating ? 'text-warning' : 'text-muted'
                  ]"
                  @click="selectedRating = star"
                  @mouseover="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                  style="cursor: pointer; font-size: 1.5rem; margin-right: 0.25rem;"
                ></i>
              </div>
              <span class="text-muted">
                {{ ratingText }}
              </span>
            </div>
          </div>
          
          <!-- Review Content -->
          <div class="mb-3">
            <label for="reviewContent" class="form-label fw-semibold">Nội dung đánh giá *</label>
            <textarea 
              v-model="reviewContent" 
              class="form-control" 
              id="reviewContent" 
              rows="4" 
              required
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              maxlength="500"
            ></textarea>
            <div class="form-text">{{ reviewContent.length }}/500 ký tự</div>
          </div>
          
          <!-- Review Title (optional) -->
          <div class="mb-3">
            <label for="reviewTitle" class="form-label fw-semibold">Tiêu đề đánh giá (tùy chọn)</label>
            <input 
              v-model="reviewTitle" 
              type="text" 
              class="form-control" 
              id="reviewTitle"
              placeholder="Ví dụ: Sản phẩm tuyệt vời!"
              maxlength="100"
            >
          </div>
          
          <!-- Recommend checkbox -->
          <div class="mb-4">
            <div class="form-check">
              <input 
                v-model="wouldRecommend" 
                class="form-check-input" 
                type="checkbox" 
                id="wouldRecommend"
              >
              <label class="form-check-label" for="wouldRecommend">
                <i class="fas fa-thumbs-up me-2"></i>Tôi sẽ giới thiệu sản phẩm này cho bạn bè
              </label>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="d-flex gap-2">
            <button 
              type="submit" 
              class="btn btn-success" 
              :disabled="isSubmitting || selectedRating === 0 || reviewContent.trim().length < 10"
            >
              <i v-if="!isSubmitting" class="fas fa-paper-plane me-2"></i>
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá' }}
            </button>
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="cancelReview"
              :disabled="isSubmitting"
            >
              <i class="fas fa-times me-2"></i>Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Success message -->
    <div v-if="showSuccessMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="fas fa-check-circle me-2"></i>
      <strong>Cảm ơn bạn!</strong> Đánh giá của bạn đã được gửi thành công.
      <button type="button" class="btn-close" @click="showSuccessMessage = false"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['review-submitted'])

// Composables
const { user, isLoggedIn } = useAuth()

// Form state
const showReviewForm = ref(false)
const selectedRating = ref(0)
const hoverRating = ref(0)
const reviewContent = ref('')
const reviewTitle = ref('')
const wouldRecommend = ref(false)
const isSubmitting = ref(false)
const showSuccessMessage = ref(false)

// Computed
const ratingText = computed(() => {
  const rating = hoverRating.value || selectedRating.value
  switch (rating) {
    case 1: return 'Rất tệ'
    case 2: return 'Tệ'
    case 3: return 'Bình thường'
    case 4: return 'Tốt'
    case 5: return 'Tuyệt vời'
    default: return 'Chọn số sao'
  }
})

// Methods
const submitReview = async () => {
  if (selectedRating.value === 0 || reviewContent.value.trim().length < 10) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create new review object
    const newReview = {
      id: Date.now(),
      name: user.value.name,
      email: user.value.email,
      avatar: user.value.avatar,
      rating: selectedRating.value,
      title: reviewTitle.value.trim() || null,
      content: reviewContent.value.trim(),
      wouldRecommend: wouldRecommend.value,
      date: new Date().toISOString().split('T')[0],
      isVerifiedPurchase: true // Mock verified purchase
    }
    
    // Emit event to parent
    emit('review-submitted', newReview)
    
    // Show success and reset form
    showSuccessMessage.value = true
    resetForm()
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)
    
  } catch (error) {
    console.error('Error submitting review:', error)
  } finally {
    isSubmitting.value = false
  }
}

const cancelReview = () => {
  resetForm()
}

const resetForm = () => {
  showReviewForm.value = false
  selectedRating.value = 0
  hoverRating.value = 0
  reviewContent.value = ''
  reviewTitle.value = ''
  wouldRecommend.value = false
}
</script>

<style scoped>
.write-review-section {
  margin-bottom: 2rem;
}

.star-clickable {
  transition: all 0.2s ease;
}

.star-clickable:hover {
  transform: scale(1.1);
}

.rating-input {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.card-header {
  border-bottom: none;
}

.form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.alert-success {
  border-left: 4px solid #28a745;
}
</style>