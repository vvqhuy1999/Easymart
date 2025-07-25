<template>
  <div class="product-nutrition">
    <div class="row">
      <div class="col-lg-8 mx-auto">
        <div class="nutrition-card">
          <div class="card-body p-4">
            <!-- Header -->
            <div class="nutrition-header text-center mb-4">
              <div class="nutrition-icon">
                <i class="fas fa-chart-bar fs-2"></i>
              </div>
              <h5 class="nutrition-title mb-2">Thông tin dinh dưỡng</h5>
              <p class="nutrition-subtitle">{{ nutritionDescription }}</p>
            </div>

            <!-- Nutrition Overview -->
            <div class="nutrition-overview mb-4">
              <div class="row g-4">
                <div 
                  v-for="(nutrient, index) in mainNutrients" 
                  :key="nutrient.name"
                  class="col-6 col-md-3"
                >
                  <div 
                    class="nutrition-item"
                    :class="`nutrition-item-${nutrient.color}`"
                    :style="{ animationDelay: `${index * 0.1}s` }"
                    @click="selectNutrient(nutrient)"
                  >
                    <div class="nutrition-icon-wrapper">
                      <i :class="`${nutrient.icon} nutrition-icon`"></i>
                    </div>
                    <div class="nutrition-value">{{ nutrient.value }}</div>
                    <div class="nutrition-unit">{{ nutrient.unit }}</div>
                    <div class="nutrition-name">{{ nutrient.name }}</div>
                    
                    <!-- Progress Ring -->
                    <div class="progress-ring">
                      <svg class="progress-ring-svg" width="60" height="60">
                        <circle
                          class="progress-ring-bg"
                          cx="30" cy="30" r="25"
                          fill="transparent"
                          stroke="currentColor"
                          stroke-width="3"
                          opacity="0.1"
                        />
                        <circle
                          class="progress-ring-fill"
                          cx="30" cy="30" r="25"
                          fill="transparent"
                          stroke="currentColor"
                          stroke-width="3"
                          :stroke-dasharray="progressCircumference"
                          :stroke-dashoffset="getStrokeDashoffset(nutrient.dailyValue)"
                          transform="rotate(-90 30 30)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Nutrition Table -->
            <div class="nutrition-details mb-4">
              <h6 class="section-title">
                <i class="fas fa-table me-2"></i>
                Bảng dinh dưỡng chi tiết
              </h6>
              <div class="nutrition-table-wrapper">
                <table class="table nutrition-table">
                  <thead>
                    <tr>
                      <th>Thành phần</th>
                      <th>Lượng</th>
                      <th>% Nhu cầu hàng ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="nutrient in allNutrients" 
                      :key="nutrient.name"
                      class="nutrition-row"
                      @click="highlightNutrient(nutrient)"
                    >
                      <td class="nutrient-name">
                        <i :class="`${nutrient.icon} text-${nutrient.color} me-2`"></i>
                        {{ nutrient.name }}
                      </td>
                      <td class="nutrient-value">
                        <strong>{{ nutrient.value }}{{ nutrient.unit }}</strong>
                      </td>
                      <td class="nutrient-daily-value">
                        <div class="daily-value-bar">
                          <div 
                            class="daily-value-fill"
                            :class="`bg-${nutrient.color}`"
                            :style="{ width: `${Math.min(nutrient.dailyValue, 100)}%` }"
                          ></div>
                        </div>
                        <span class="daily-value-text">{{ nutrient.dailyValue }}%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Health Benefits -->
            <div class="health-benefits">
              <h6 class="section-title">
                <i class="fas fa-heart text-danger me-2"></i>
                Lợi ích sức khỏe
              </h6>
              <div class="benefits-grid">
                <div 
                  v-for="(benefit, index) in healthBenefits" 
                  :key="benefit.title"
                  class="benefit-item"
                  :style="{ animationDelay: `${index * 0.15}s` }"
                >
                  <div class="benefit-icon">
                    <i :class="`${benefit.icon} text-${benefit.color}`"></i>
                  </div>
                  <div class="benefit-content">
                    <h6 class="benefit-title">{{ benefit.title }}</h6>
                    <p class="benefit-description">{{ benefit.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dietary Information -->
            <div class="dietary-info">
              <h6 class="section-title">
                <i class="fas fa-info-circle text-info me-2"></i>
                Thông tin bổ sung
              </h6>
              <div class="dietary-tags">
                <span 
                  v-for="tag in dietaryTags" 
                  :key="tag.name"
                  class="dietary-tag"
                  :class="`dietary-tag-${tag.type}`"
                >
                  <i :class="`${tag.icon} me-1`"></i>
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

// Props
const props = defineProps({
  details: {
    type: Object,
    required: true
  }
})

// Reactive data
const selectedNutrient = ref(null)
const highlightedNutrient = ref(null)

// Computed
const progressCircumference = computed(() => 2 * Math.PI * 25)

const nutritionDescription = computed(() => {
  return props.details.nutrition || 'Giàu protein, ít chất béo, cung cấp các vitamin và khoáng chất thiết yếu cho cơ thể.'
})

const mainNutrients = reactive([
  {
    name: 'Calories',
    value: 90,
    unit: 'kcal',
    icon: 'fas fa-fire',
    color: 'danger',
    dailyValue: 4.5
  },
  {
    name: 'Protein',
    value: 20,
    unit: 'g',
    icon: 'fas fa-dumbbell',
    color: 'success',
    dailyValue: 40
  },
  {
    name: 'Chất béo',
    value: 1.5,
    unit: 'g',
    icon: 'fas fa-tint',
    color: 'info',
    dailyValue: 2.3
  },
  {
    name: 'Carbs',
    value: 0,
    unit: 'g',
    icon: 'fas fa-seedling',
    color: 'warning',
    dailyValue: 0
  }
])

const allNutrients = reactive([
  ...mainNutrients,
  {
    name: 'Chất xơ',
    value: 2.5,
    unit: 'g',
    icon: 'fas fa-leaf',
    color: 'success',
    dailyValue: 10
  },
  {
    name: 'Đường',
    value: 0.2,
    unit: 'g',
    icon: 'fas fa-cube',
    color: 'warning',
    dailyValue: 0.4
  },
  {
    name: 'Sodium',
    value: 150,
    unit: 'mg',
    icon: 'fas fa-flask',
    color: 'danger',
    dailyValue: 6.5
  },
  {
    name: 'Vitamin C',
    value: 12,
    unit: 'mg',
    icon: 'fas fa-lemon',
    color: 'warning',
    dailyValue: 13.3
  },
  {
    name: 'Canxi',
    value: 80,
    unit: 'mg',
    icon: 'fas fa-bone',
    color: 'info',
    dailyValue: 8
  },
  {
    name: 'Sắt',
    value: 2.1,
    unit: 'mg',
    icon: 'fas fa-magnet',
    color: 'secondary',
    dailyValue: 11.7
  }
])

const healthBenefits = reactive([
  {
    title: 'Tăng cường sức đề kháng',
    description: 'Giúp cơ thể chống lại các bệnh tật và nhiễm trùng',
    icon: 'fas fa-shield-alt',
    color: 'primary'
  },
  {
    title: 'Hỗ trợ phát triển cơ bắp',
    description: 'Protein chất lượng cao giúp xây dựng và phục hồi cơ bắp',
    icon: 'fas fa-user-ninja',
    color: 'success'
  },
  {
    title: 'Cung cấp năng lượng',
    description: 'Nguồn năng lượng bền vững cho hoạt động hàng ngày',
    icon: 'fas fa-battery-full',
    color: 'warning'
  },
  {
    title: 'Tốt cho tim mạch',
    description: 'Ít cholesterol và chất béo bão hòa, tốt cho tim mạch',
    icon: 'fas fa-heartbeat',
    color: 'danger'
  }
])

const dietaryTags = reactive([
  { name: 'Ít chất béo', icon: 'fas fa-check-circle', type: 'success' },
  { name: 'Giàu protein', icon: 'fas fa-dumbbell', type: 'primary' },
  { name: 'Không gluten', icon: 'fas fa-ban', type: 'info' },
  { name: 'Tự nhiên', icon: 'fas fa-leaf', type: 'success' },
  { name: 'Không phẩm màu', icon: 'fas fa-palette', type: 'secondary' }
])

// Methods
const getStrokeDashoffset = (percentage) => {
  return progressCircumference.value - (progressCircumference.value * percentage / 100)
}

const selectNutrient = (nutrient) => {
  selectedNutrient.value = selectedNutrient.value?.name === nutrient.name ? null : nutrient
}

const highlightNutrient = (nutrient) => {
  highlightedNutrient.value = nutrient
  setTimeout(() => {
    highlightedNutrient.value = null
  }, 2000)
}
</script>

<style scoped>
.product-nutrition {
  padding: 1rem 0;
}

.nutrition-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Header Styles */
.nutrition-header .nutrition-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--bs-success), #20c997);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
}

.nutrition-title {
  color: var(--bs-success);
  font-weight: 700;
}

.nutrition-subtitle {
  color: #6c757d;
  line-height: 1.6;
}

/* Nutrition Overview */
.nutrition-overview {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.nutrition-item {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nutrition-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nutrition-item-danger:hover {
  border-color: var(--bs-danger);
}

.nutrition-item-success:hover {
  border-color: var(--bs-success);
}

.nutrition-item-info:hover {
  border-color: var(--bs-info);
}

.nutrition-item-warning:hover {
  border-color: var(--bs-warning);
}

.nutrition-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.nutrition-item-danger .nutrition-icon-wrapper {
  background: linear-gradient(135deg, var(--bs-danger), #dc3545);
  color: white;
}

.nutrition-item-success .nutrition-icon-wrapper {
  background: linear-gradient(135deg, var(--bs-success), #20c997);
  color: white;
}

.nutrition-item-info .nutrition-icon-wrapper {
  background: linear-gradient(135deg, var(--bs-info), #17a2b8);
  color: white;
}

.nutrition-item-warning .nutrition-icon-wrapper {
  background: linear-gradient(135deg, var(--bs-warning), #ffc107);
  color: white;
}

.nutrition-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.nutrition-unit {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.nutrition-name {
  font-weight: 600;
  color: #4a5568;
}

.progress-ring {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 60px;
  height: 60px;
}

.progress-ring-svg {
  width: 100%;
  height: 100%;
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.8s ease;
}

/* Nutrition Table */
.section-title {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.nutrition-table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nutrition-table {
  margin: 0;
}

.nutrition-table thead th {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  font-weight: 600;
  color: #4a5568;
  border: none;
  padding: 1rem;
}

.nutrition-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.nutrition-row:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.nutrient-name {
  font-weight: 500;
  color: #2d3748;
}

.nutrient-value {
  color: #4a5568;
}

.daily-value-bar {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.daily-value-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.daily-value-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

/* Health Benefits */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  animation: slideInLeft 0.6s ease forwards;
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.benefit-item:hover {
  transform: translateY(-5px);
}

.benefit-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(var(--bs-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.benefit-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.benefit-description {
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

/* Dietary Tags */
.dietary-info {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
}

.dietary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.dietary-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.dietary-tag:hover {
  transform: translateY(-2px);
}

.dietary-tag-success {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #16a34a;
  border: 1px solid #86efac;
}

.dietary-tag-primary {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #2563eb;
  border: 1px solid #93c5fd;
}

.dietary-tag-info {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  color: #0891b2;
  border: 1px solid #7dd3fc;
}

.dietary-tag-secondary {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: #64748b;
  border: 1px solid #cbd5e1;
}

/* Responsive */
@media (max-width: 768px) {
  .nutrition-overview {
    padding: 1.5rem;
  }
  
  .nutrition-item {
    padding: 1rem 0.75rem;
  }
  
  .progress-ring {
    display: none;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .dietary-tags {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .nutrition-table-wrapper {
    overflow-x: auto;
  }
  
  .nutrition-table {
    min-width: 500px;
  }
}
</style>