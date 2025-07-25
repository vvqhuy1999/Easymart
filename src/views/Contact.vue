<template>
  <div class="contact-page">
    <!-- Header -->
    <!-- Đã xóa Header -->

    <!-- Page Content -->
    <div class="container py-5 mt-5">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="fas fa-home"></i> Trang chủ
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="fas fa-envelope"></i> Liên hệ
          </li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="text-center mb-5">
        <h1 class="display-4 text-primary mb-3">
          <i class="fas fa-headset me-3"></i>
          Liên hệ với chúng tôi
        </h1>
        <p class="lead text-muted">
          Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến của bạn
        </p>
      </div>

      <div class="row g-5">
        <!-- Contact Information -->
        <div class="col-lg-4">
          <div class="contact-info">
            <h3 class="h4 mb-4">
              <i class="fas fa-info-circle text-primary me-2"></i>
              Thông tin liên hệ
            </h3>

            <!-- Address -->
            <div class="contact-item mb-4">
              <div class="contact-icon">
                <i class="fas fa-map-marker-alt text-danger"></i>
              </div>
              <div class="contact-details">
                <h5 class="mb-2">Địa chỉ</h5>
                <p class="text-muted mb-0">
                  123 Đường ABC, Quận 1<br>
                  TP. Hồ Chí Minh, Việt Nam
                </p>
              </div>
            </div>

            <!-- Phone -->
            <div class="contact-item mb-4">
              <div class="contact-icon">
                <i class="fas fa-phone text-success"></i>
              </div>
              <div class="contact-details">
                <h5 class="mb-2">Điện thoại</h5>
                <p class="text-muted mb-0">
                  Hotline: <a href="tel:19001234" class="text-decoration-none">1900 1234</a><br>
                  Mobile: <a href="tel:+84987654321" class="text-decoration-none">0987 654 321</a>
                </p>
              </div>
            </div>

            <!-- Email -->
            <div class="contact-item mb-4">
              <div class="contact-icon">
                <i class="fas fa-envelope text-primary"></i>
              </div>
              <div class="contact-details">
                <h5 class="mb-2">Email</h5>
                <p class="text-muted mb-0">
                  Hỗ trợ: <a href="mailto:cskh@easymart.vn" class="text-decoration-none">cskh@easymart.vn</a><br>
                  Tổng đài: <a href="mailto:info@easymart.vn" class="text-decoration-none">info@easymart.vn</a>
                </p>
              </div>
            </div>

            <!-- Working Hours -->
            <div class="contact-item mb-4">
              <div class="contact-icon">
                <i class="fas fa-clock text-warning"></i>
              </div>
              <div class="contact-details">
                <h5 class="mb-2">Giờ làm việc</h5>
                <p class="text-muted mb-0">
                  Thứ 2 - Thứ 6: 8:00 - 18:00<br>
                  Thứ 7 - Chủ nhật: 9:00 - 17:00
                </p>
              </div>
            </div>

            <!-- Social Media -->
            <div class="social-links mt-4">
              <h5 class="mb-3">Kết nối với chúng tôi</h5>
              <div class="d-flex gap-3">
                <a href="#" class="social-link facebook">
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="social-link instagram">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="social-link youtube">
                  <i class="fab fa-youtube"></i>
                </a>
                <a href="#" class="social-link zalo">
                  <i class="fab fa-telegram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="col-lg-8">
          <div class="contact-form">
            <h3 class="h4 mb-4">
              <i class="fas fa-paper-plane text-primary me-2"></i>
              Gửi tin nhắn cho chúng tôi
            </h3>
            
            <form @submit.prevent="submitForm" class="needs-validation" novalidate>
              <div class="row g-3">
                <!-- Name -->
                <div class="col-md-6">
                  <label for="name" class="form-label">Họ tên *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name"
                    v-model="form.name"
                    :class="{ 'is-invalid': errors.name }"
                    required
                  >
                  <div v-if="errors.name" class="invalid-feedback">
                    {{ errors.name }}
                  </div>
                </div>

                <!-- Email -->
                <div class="col-md-6">
                  <label for="email" class="form-label">Email *</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email"
                    v-model="form.email"
                    :class="{ 'is-invalid': errors.email }"
                    required
                  >
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>

                <!-- Phone -->
                <div class="col-md-6">
                  <label for="phone" class="form-label">Số điện thoại</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="phone"
                    v-model="form.phone"
                  >
                </div>

                <!-- Subject -->
                <div class="col-md-6">
                  <label for="subject" class="form-label">Chủ đề *</label>
                  <select 
                    class="form-select" 
                    id="subject"
                    v-model="form.subject"
                    :class="{ 'is-invalid': errors.subject }"
                    required
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="support">Hỗ trợ kỹ thuật</option>
                    <option value="order">Đơn hàng</option>
                    <option value="product">Sản phẩm</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="suggestion">Góp ý</option>
                    <option value="other">Khác</option>
                  </select>
                  <div v-if="errors.subject" class="invalid-feedback">
                    {{ errors.subject }}
                  </div>
                </div>

                <!-- Message -->
                <div class="col-12">
                  <label for="message" class="form-label">Nội dung tin nhắn *</label>
                  <textarea 
                    class="form-control" 
                    id="message" 
                    rows="6"
                    v-model="form.message"
                    :class="{ 'is-invalid': errors.message }"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    required
                  ></textarea>
                  <div v-if="errors.message" class="invalid-feedback">
                    {{ errors.message }}
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="col-12">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <i v-else class="fas fa-paper-plane me-2"></i>
                    {{ isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <!-- Đã xóa Footer -->
  </div>
</template>

<script setup>
/**
 * Contact.vue - Trang liên hệ
 * 
 * Hiển thị thông tin liên hệ và form gửi tin nhắn
 */

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'

// Components
// Đã xóa import Header và Footer

// Router
const router = useRouter()

// Composable
const {
  categories,
  searchQuery,
  searchResults,
  cartCount,
  addToCart,
  showNotification
} = useEasyMart()

// Form state
const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const errors = ref({})
const isSubmitting = ref(false)

// Methods
const viewProduct = (productId) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.name.trim()) {
    errors.value.name = 'Vui lòng nhập họ tên'
  }
  
  if (!form.email.trim()) {
    errors.value.email = 'Vui lòng nhập email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Email không hợp lệ'
  }
  
  if (!form.subject) {
    errors.value.subject = 'Vui lòng chọn chủ đề'
  }
  
  if (!form.message.trim()) {
    errors.value.message = 'Vui lòng nhập nội dung tin nhắn'
  } else if (form.message.trim().length < 10) {
    errors.value.message = 'Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự)'
  }
  
  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
    
    showNotification('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.', 'success')
  } catch (error) {
    showNotification('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.contact-info,
.contact-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  height: fit-content;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-icon i {
  font-size: 1.2rem;
}

.contact-details h5 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.social-link {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-2px);
  color: white;
}

.social-link.facebook {
  background: #1877f2;
}

.social-link.instagram {
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
}

.social-link.youtube {
  background: #ff0000;
}

.social-link.zalo {
  background: #0084ff;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  padding: 0.75rem 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.breadcrumb-item a:hover {
  color: #0d6efd !important;
}

@media (max-width: 768px) {
  .contact-info,
  .contact-form {
    padding: 1.5rem;
  }
  
  .display-4 {
    font-size: 2rem;
  }
  
  .social-link {
    width: 40px;
    height: 40px;
  }
}
</style> 