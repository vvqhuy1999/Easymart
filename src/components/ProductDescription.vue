<template>
  <div class="product-description">
    <div class="row">
      <div class="col-lg-8 mx-auto">
        <div class="description-card">
          <div class="card-body p-4">
            <!-- Header -->
            <div class="description-header text-center mb-4">
              <div class="description-icon">
                <i class="fas fa-info-circle fs-2"></i>
              </div>
              <h5 class="description-title mb-2">Về sản phẩm {{ product.name }}</h5>
              <div class="description-meta">
                <span class="badge badge-primary">{{ getCategoryName() }}</span>
                <span class="badge badge-success">Tươi ngon</span>
                <span class="badge badge-info">Chất lượng cao</span>
              </div>
            </div>

            <!-- Main Description -->
            <div class="description-content mb-4">
              <div class="content-section">
                <h6 class="content-title">
                  <i class="fas fa-file-alt me-2"></i>Mô tả chung
                </h6>
                <p class="lead description-text">{{ productDescription }}</p>
              </div>

              <!-- Feature Highlight -->
              <div class="feature-showcase">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="feature-card feature-card-advantages">
                      <div class="feature-header">
                        <div class="feature-icon">
                          <i class="fas fa-star"></i>
                        </div>
                        <h6 class="feature-title">Ưu điểm nổi bật</h6>
                      </div>
                      <ul class="feature-list">
                        <li v-for="(advantage, index) in advantages" :key="index" class="feature-item">
                          <div class="feature-bullet">
                            <i class="fas fa-check"></i>
                          </div>
                          <span>{{ advantage }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="feature-card feature-card-info">
                      <div class="feature-header">
                        <div class="feature-icon">
                          <i class="fas fa-info-circle"></i>
                        </div>
                        <h6 class="feature-title">Thông tin sản phẩm</h6>
                      </div>
                      <div class="info-grid">
                        <div class="info-item">
                          <i class="fas fa-map-marker-alt text-primary"></i>
                          <div class="info-content">
                            <strong>Xuất xứ:</strong>
                            <span>{{ productOrigin }}</span>
                          </div>
                        </div>
                        <div class="info-item">
                          <i class="fas fa-weight-hanging text-success"></i>
                          <div class="info-content">
                            <strong>Trọng lượng:</strong>
                            <span>{{ productWeight }}</span>
                          </div>
                        </div>
                        <div class="info-item">
                          <i class="fas fa-calendar-alt text-info"></i>
                          <div class="info-content">
                            <strong>Hạn sử dụng:</strong>
                            <span>{{ productExpiry }}</span>
                          </div>
                        </div>
                        <div class="info-item">
                          <i class="fas fa-certificate text-warning"></i>
                          <div class="info-content">
                            <strong>Chứng nhận:</strong>
                            <span>{{ productCertification }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Storage Instructions -->
              <div class="storage-section">
                <div class="storage-card">
                  <div class="storage-header">
                    <div class="storage-icon">
                      <i class="fas fa-snowflake"></i>
                    </div>
                    <h6 class="storage-title">Hướng dẫn bảo quản</h6>
                  </div>
                  <div class="storage-content">
                    <p>{{ storageInstructions }}</p>
                    <div class="storage-tips">
                      <div class="storage-tip">
                        <i class="fas fa-thermometer-half text-info"></i>
                        <span>Nhiệt độ: {{ storageTemp }}</span>
                      </div>
                      <div class="storage-tip">
                        <i class="fas fa-clock text-warning"></i>
                        <span>Thời gian: {{ storageTime }}</span>
                      </div>
                      <div class="storage-tip">
                        <i class="fas fa-eye text-danger"></i>
                        <span>Lưu ý: {{ storageNote }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quality Guarantee -->
              <div class="guarantee-section">
                <div class="guarantee-card">
                  <div class="guarantee-header">
                    <div class="guarantee-icon">
                      <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="guarantee-content">
                      <h6 class="guarantee-title">Cam kết chất lượng EasyMart</h6>
                      <p class="guarantee-description">
                        Chúng tôi cam kết 100% sản phẩm tươi ngon, an toàn. 
                        Nếu không hài lòng, hoàn tiền trong 24h.
                      </p>
                    </div>
                  </div>
                  <div class="guarantee-features">
                    <div class="guarantee-feature">
                      <i class="fas fa-check-double text-success"></i>
                      <span>Kiểm định chất lượng</span>
                    </div>
                    <div class="guarantee-feature">
                      <i class="fas fa-clock text-info"></i>
                      <span>Giao hàng đúng hẹn</span>
                    </div>
                    <div class="guarantee-feature">
                      <i class="fas fa-undo-alt text-warning"></i>
                      <span>Đổi trả dễ dàng</span>
                    </div>
                    <div class="guarantee-feature">
                      <i class="fas fa-headset text-primary"></i>
                      <span>Hỗ trợ 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Usage Instructions -->
              <div class="usage-section">
                <div class="usage-card">
                  <h6 class="usage-title">
                    <i class="fas fa-utensils me-2"></i>Cách sử dụng
                  </h6>
                  <div class="usage-steps">
                    <div 
                      v-for="(step, index) in usageSteps" 
                      :key="index"
                      class="usage-step"
                      :style="{ animationDelay: `${index * 0.2}s` }"
                    >
                      <div class="step-number">{{ index + 1 }}</div>
                      <div class="step-content">
                        <h6 class="step-title">{{ step.title }}</h6>
                        <p class="step-description">{{ step.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  details: {
    type: Object,
    required: true
  }
})

// Computed properties
const productDescription = computed(() => {
  return props.details.description || `${props.product.name} là sản phẩm chất lượng cao, được chọn lọc kỹ càng để đảm bảo tươi ngon và an toàn cho sức khỏe. Được nuôi trồng theo quy trình khép kín, đảm bảo vệ sinh an toàn thực phẩm.`
})

const productOrigin = computed(() => {
  return props.details.origin || 'Việt Nam'
})

const productWeight = computed(() => {
  return props.details.weight || '500g'
})

const productExpiry = computed(() => {
  return props.details.expiry || '3-5 ngày'
})

const productCertification = computed(() => {
  return props.details.certification || 'VietGAP, ISO 22000'
})

const storageInstructions = computed(() => {
  return props.details.storage || 'Bảo quản trong ngăn mát tủ lạnh ở nhiệt độ 2-8°C. Tránh để ở nơi có ánh sáng trực tiếp và nhiệt độ cao.'
})

const storageTemp = computed(() => '2-8°C')
const storageTime = computed(() => '3-5 ngày')
const storageNote = computed(() => 'Tránh ánh nắng trực tiếp')

// Reactive data
const advantages = reactive([
  'Chất lượng cao, được kiểm định nghiêm ngặt',
  'Tươi ngon, thu hoạch trong ngày',
  'An toàn thực phẩm, không hóa chất',
  'Giá cả hợp lý, cạnh tranh',
  'Giao hàng nhanh chóng, đúng hẹn',
  'Đóng gói cẩn thận, bảo quản tốt'
])

const usageSteps = reactive([
  {
    title: 'Chuẩn bị',
    description: 'Rửa sạch sản phẩm dưới nước chảy, để ráo nước.'
  },
  {
    title: 'Sơ chế',
    description: 'Cắt bỏ những phần không cần thiết, thái theo ý muốn.'
  },
  {
    title: 'Chế biến',
    description: 'Có thể ăn tươi hoặc chế biến theo nhiều cách khác nhau.'
  },
  {
    title: 'Thưởng thức',
    description: 'Sản phẩm sẵn sàng để thưởng thức, đảm bảo dinh dưỡng.'
  }
])

// Methods
const getCategoryName = () => {
  // Logic to get category name from product
  return props.product.category || 'Thực phẩm tươi sống'
}
</script>

<style scoped>
.product-description {
  padding: 1rem 0;
}

.description-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Header Styles */
.description-header {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  padding: 2rem;
  border-radius: 20px 20px 0 0;
  margin: -1rem -1rem 2rem;
}

.description-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--bs-primary), #0d6efd);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
}

.description-title {
  color: var(--bs-primary);
  font-weight: 700;
  margin-bottom: 1rem;
}

.description-meta {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-primary {
  background: linear-gradient(135deg, var(--bs-primary), #0d6efd);
  color: white;
}

.badge-success {
  background: linear-gradient(135deg, var(--bs-success), #20c997);
  color: white;
}

.badge-info {
  background: linear-gradient(135deg, var(--bs-info), #17a2b8);
  color: white;
}

/* Content Sections */
.content-section {
  margin-bottom: 2rem;
}

.content-title {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.description-text {
  color: #4a5568;
  line-height: 1.7;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* Feature Showcase */
.feature-showcase {
  margin: 2rem 0;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card-advantages {
  border-left: 4px solid var(--bs-success);
}

.feature-card-info {
  border-left: 4px solid var(--bs-info);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.feature-card-advantages .feature-icon {
  background: linear-gradient(135deg, var(--bs-success), #20c997);
}

.feature-card-info .feature-icon {
  background: linear-gradient(135deg, var(--bs-info), #17a2b8);
}

.feature-title {
  color: #2d3748;
  font-weight: 600;
  margin: 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.feature-bullet {
  width: 24px;
  height: 24px;
  background: var(--bs-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-content strong {
  color: #2d3748;
  font-weight: 600;
}

.info-content span {
  color: #6c757d;
}

/* Storage Section */
.storage-section {
  margin: 2rem 0;
}

.storage-card {
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 123, 255, 0.1);
}

.storage-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.storage-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.storage-title {
  color: #2d3748;
  font-weight: 600;
  margin: 0;
}

.storage-content p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.storage-tips {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.storage-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

/* Guarantee Section */
.guarantee-section {
  margin: 2rem 0;
}

.guarantee-card {
  background: linear-gradient(135deg, #f0fff4, #e6fffa);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.guarantee-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.guarantee-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--bs-success), #20c997);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.guarantee-title {
  color: #2d3748;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.guarantee-description {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.guarantee-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.guarantee-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  font-weight: 500;
  color: #2d3748;
  transition: transform 0.2s ease;
}

.guarantee-feature:hover {
  transform: translateY(-2px);
}

/* Usage Section */
.usage-section {
  margin: 2rem 0;
}

.usage-card {
  background: linear-gradient(135deg, #fffbf0, #fff8e6);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 193, 7, 0.1);
}

.usage-title {
  color: #2d3748;
  font-weight: 700;
  margin-bottom: 2rem;
}

.usage-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.usage-step {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  animation: fadeInLeft 0.8s ease forwards;
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes fadeInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bs-warning), #ffc107);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  padding-top: 0.5rem;
}

.step-title {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .description-header {
    padding: 1.5rem;
  }
  
  .description-meta {
    flex-direction: column;
    align-items: center;
  }
  
  .storage-tips {
    flex-direction: column;
    gap: 1rem;
  }
  
  .guarantee-features {
    grid-template-columns: 1fr;
  }
  
  .usage-step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    margin: 0 auto;
  }
}

@media (max-width: 576px) {
  .feature-card {
    padding: 1.5rem;
  }
  
  .feature-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>