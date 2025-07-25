<template>
  <div class="product-reviews">
    <div class="row">
      <div class="col-lg-10 mx-auto">
        <div class="mb-4 text-center">
          <h5 class="text-primary mb-3">Đánh giá từ khách hàng</h5>
          <div class="d-flex justify-content-center align-items-center mb-3">
            <div class="text-warning fs-3 me-3">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star-half-alt"></i>
            </div>
            <div>
              <div class="fs-4 fw-bold text-primary">4.5/5</div>
              <small class="text-muted">({{ displayReviews.length }} đánh giá)</small>
            </div>
          </div>
        </div>

        <!-- Always show this section for testing -->
        <div class="row g-4">
          <div class="col-12" v-for="review in displayReviews" :key="review.id">
            <div class="card mb-3 border-primary">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-title mb-0 text-primary">{{ review.name }}</h6>
                  <small class="text-muted">{{ review.date }}</small>
                </div>
                <div class="text-warning mb-2">
                  <i v-for="n in review.rating" :key="n" class="fas fa-star"></i>
                  <i v-for="n in (5 - review.rating)" :key="n + review.rating" class="far fa-star"></i>
                </div>
                <p class="card-text">{{ review.content }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Fallback message -->
        <div v-if="displayReviews.length === 0" class="text-center text-muted py-5">
          <i class="fas fa-info-circle fa-2x mb-3"></i>
          <div>Chưa có đánh giá nào cho sản phẩm này.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  reviews: {
    type: Array,
    required: false
  }
});

const displayReviews = computed(() => {
  console.log('🔍 ProductReviews - Props reviews:', props.reviews)
  console.log('🔍 ProductReviews - Reviews length:', props.reviews?.length || 0)
  return props.reviews || []
});
</script>

<style scoped>
.product-reviews {
  padding: 2rem 0;
}

.review-card {
  background-color: #f8f9fa;
  border-radius: 15px;
  border: 1px solid #e9ecef;
  transition: box-shadow 0.3s;
}

.review-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
}
</style>
