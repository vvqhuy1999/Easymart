<template>
  <footer class="main-footer">
    <div class="footer-content">
      <div class="container">
        <!-- Newsletter Section -->
        <div class="newsletter-section">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <div class="newsletter-content">
                <h4 class="newsletter-title">Đăng ký nhận tin khuyến mãi</h4>
                <p class="newsletter-subtitle">
                  Nhận ngay thông tin về các chương trình ưu đãi mới nhất từ EasyMart
                </p>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="newsletter-form">
                <div class="input-group">
                  <input 
                    type="email" 
                    class="form-control newsletter-input" 
                    placeholder="Nhập email của bạn..."
                    v-model="newsletterEmail"
                    @keyup.enter="subscribeNewsletter"
                  >
                  <button 
                    class="btn btn-primary newsletter-btn" 
                    @click="subscribeNewsletter"
                    :disabled="isSubscribing || !isValidEmail"
                  >
                    <i v-if="!isSubscribing" class="fas fa-paper-plane"></i>
                    <div v-else class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    {{ isSubscribing ? 'Đang đăng ký...' : 'Đăng ký' }}
                  </button>
                </div>
                <div v-if="subscriptionMessage" class="subscription-message" :class="subscriptionStatus">
                  <i :class="subscriptionIcon"></i>
                  {{ subscriptionMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Footer Content -->
        <div class="footer-main">
          <div class="row g-4">
            <!-- Company Info -->
            <div class="col-lg-3 col-md-6">
              <div class="footer-section">
                <div class="company-info">
                  <div class="footer-logo">
                    <i class="fas fa-shopping-cart logo-icon"></i>
                    <span class="logo-text">EasyMart</span>
                  </div>
                  <p class="company-description">
                    Công Ty Cổ Phần Dịch Vụ Thương Mại Tổng Hợp EasyMart - 
                    Mang đến những sản phẩm chất lượng, dịch vụ tận tâm.
                  </p>
                  <div class="company-certifications">
                    <div class="cert-item">
                      <i class="fas fa-certificate text-warning"></i>
                      <span>Chứng nhận ISO 9001</span>
                    </div>
                    <div class="cert-item">
                      <i class="fas fa-shield-alt text-success"></i>
                      <span>An toàn thực phẩm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- About Links -->
            <div class="col-lg-2 col-md-6">
              <div class="footer-section">
                <h6 class="footer-title">Về Chúng Tôi</h6>
                <ul class="footer-links">
                  <li v-for="link in aboutLinks" :key="link.name" class="footer-link-item">
                    <a 
                      :href="link.url" 
                      class="footer-link"
                      @click.prevent="handleLinkClick(link)"
                    >
                      <i :class="`${link.icon} me-2`"></i>{{ link.name }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Support Links -->
            <div class="col-lg-2 col-md-6">
              <div class="footer-section">
                <h6 class="footer-title">Hỗ Trợ Khách Hàng</h6>
                <ul class="footer-links">
                  <li v-for="link in supportLinks" :key="link.name" class="footer-link-item">
                    <a 
                      :href="link.url" 
                      class="footer-link"
                      @click.prevent="handleLinkClick(link)"
                    >
                      <i :class="`${link.icon} me-2`"></i>{{ link.name }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="col-lg-2 col-md-6">
              <div class="footer-section">
                <h6 class="footer-title">Liên Hệ</h6>
                <div class="contact-info">
                  <div class="contact-item">
                    <i class="fas fa-map-marker-alt text-primary"></i>
                    <div class="contact-details">
                      <strong>Địa chỉ:</strong>
                      <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
                    </div>
                  </div>
                  <div class="contact-item">
                    <i class="fas fa-phone-alt text-success"></i>
                    <div class="contact-details">
                      <strong>Hotline:</strong>
                      <a href="tel:19001234">1900 1234</a>
                    </div>
                  </div>
                  <div class="contact-item">
                    <i class="fas fa-envelope text-info"></i>
                    <div class="contact-details">
                      <strong>Email:</strong>
                      <a href="mailto:cskh@easymart.vn">cskh@easymart.vn</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div class="col-lg-3 col-md-12">
              <div class="footer-section">
                <h6 class="footer-title">Kết Nối Với Chúng Tôi</h6>
                <div class="social-links">
                  <a 
                    v-for="social in socialLinks" 
                    :key="social.name"
                    :href="social.url" 
                    class="social-link"
                    :title="social.name"
                    @click.prevent="handleSocialClick(social)"
                  >
                    <i :class="social.icon"></i>
                  </a>
                </div>
                
                <!-- App Download -->
                <div class="app-download">
                  <h6 class="download-title">Tải Ứng Dụng</h6>
                  <div class="download-buttons">
                    <a href="#" class="download-btn" @click.prevent="downloadApp('ios')">
                      <i class="fab fa-apple"></i>
                      <div class="download-text">
                        <small>Download on the</small>
                        <strong>App Store</strong>
                      </div>
                    </a>
                    <a href="#" class="download-btn" @click.prevent="downloadApp('android')">
                      <i class="fab fa-google-play"></i>
                      <div class="download-text">
                        <small>Get it on</small>
                        <strong>Google Play</strong>
                      </div>
                    </a>
                  </div>
                </div>

                <!-- Payment Methods -->
                <div class="payment-methods">
                  <h6 class="payment-title">Phương Thức Thanh Toán</h6>
                  <div class="payment-icons">
                    <i class="fab fa-cc-visa payment-icon" title="Visa"></i>
                    <i class="fab fa-cc-mastercard payment-icon" title="Mastercard"></i>
                    <i class="fas fa-money-bill-wave payment-icon" title="Tiền mặt"></i>
                    <i class="fas fa-mobile-alt payment-icon" title="Mobile Banking"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
          <div class="row align-items-center">
            <div class="col-md-6">
              <div class="copyright">
                <p class="copyright-text">
                  © {{ currentYear }} EasyMart. Tất cả các quyền được bảo lưu.
                </p>
                <div class="legal-links">
                  <a href="#" @click.prevent="showPrivacy">Chính sách bảo mật</a>
                  <span class="separator">|</span>
                  <a href="#" @click.prevent="showTerms">Điều khoản sử dụng</a>
                  <span class="separator">|</span>
                  <a href="#" @click.prevent="showCookies">Chính sách Cookie</a>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="footer-stats">
                <div class="stat-item">
                  <i class="fas fa-users text-primary"></i>
                  <span>{{ formatNumber(totalUsers) }}+ khách hàng</span>
                </div>
                <div class="stat-item">
                  <i class="fas fa-shopping-bag text-success"></i>
                  <span>{{ formatNumber(totalOrders) }}+ đơn hàng</span>
                </div>
                <div class="stat-item">
                  <i class="fas fa-star text-warning"></i>
                  <span>{{ averageRating }}/5 sao</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Top Button -->
    <Transition name="fade">
      <button 
        v-if="showBackToTop"
        class="back-to-top-btn"
        @click="scrollToTop"
        title="Lên đầu trang"
      >
        <i class="fas fa-arrow-up"></i>
      </button>
    </Transition>
  </footer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

// Reactive data
const newsletterEmail = ref('')
const isSubscribing = ref(false)
const subscriptionMessage = ref('')
const subscriptionStatus = ref('')
const showBackToTop = ref(false)

// Computed
const currentYear = computed(() => new Date().getFullYear())

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(newsletterEmail.value)
})

const subscriptionIcon = computed(() => {
  return subscriptionStatus.value === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
})

// Static data
const aboutLinks = reactive([
  { name: 'Giới thiệu EasyMart', url: '/about', icon: 'fas fa-info-circle' },
  { name: 'Danh sách cửa hàng', url: '/stores', icon: 'fas fa-store' },
  { name: 'Tin tức & Sự kiện', url: '/news', icon: 'fas fa-newspaper' },
  { name: 'Tuyển dụng', url: '/careers', icon: 'fas fa-briefcase' },
  { name: 'Nhà đầu tư', url: '/investors', icon: 'fas fa-chart-line' }
])

const supportLinks = reactive([
  { name: 'Trung tâm trợ giúp', url: '/help', icon: 'fas fa-question-circle' },
  { name: 'Chính sách đổi trả', url: '/return-policy', icon: 'fas fa-undo-alt' },
  { name: 'Phương thức thanh toán', url: '/payment', icon: 'fas fa-credit-card' },
  { name: 'Vận chuyển & Giao hàng', url: '/shipping', icon: 'fas fa-shipping-fast' },
  { name: 'Khiếu nại & Góp ý', url: '/feedback', icon: 'fas fa-comment-dots' }
])

const socialLinks = reactive([
  { name: 'Facebook', url: 'https://facebook.com/easymart', icon: 'fab fa-facebook' },
  { name: 'Instagram', url: 'https://instagram.com/easymart', icon: 'fab fa-instagram' },
  { name: 'YouTube', url: 'https://youtube.com/easymart', icon: 'fab fa-youtube' },
  { name: 'TikTok', url: 'https://tiktok.com/@easymart', icon: 'fab fa-tiktok' },
  { name: 'Zalo', url: 'https://zalo.me/easymart', icon: 'fas fa-comments' }
])

// Stats data
const totalUsers = ref(125000)
const totalOrders = ref(350000)
const averageRating = ref(4.8)

// Methods
const subscribeNewsletter = async () => {
  if (!isValidEmail.value || isSubscribing.value) return

  isSubscribing.value = true
  subscriptionMessage.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    subscriptionStatus.value = 'success'
    subscriptionMessage.value = 'Đăng ký thành công! Kiểm tra email để xác nhận.'
    newsletterEmail.value = ''
    
    setTimeout(() => {
      subscriptionMessage.value = ''
    }, 5000)
  } catch (error) {
    subscriptionStatus.value = 'error'
    subscriptionMessage.value = 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    
    setTimeout(() => {
      subscriptionMessage.value = ''
    }, 3000)
  } finally {
    isSubscribing.value = false
  }
}

const handleLinkClick = (link) => {
  console.log(`Navigating to: ${link.name}`)
  // Implement navigation logic
}

const handleSocialClick = (social) => {
  console.log(`Opening ${social.name}`)
  window.open(social.url, '_blank')
}

const downloadApp = (platform) => {
  console.log(`Downloading ${platform} app`)
  // Implement app download logic
}

const showPrivacy = () => {
  console.log('Show privacy policy')
}

const showTerms = () => {
  console.log('Show terms of service')
}

const showCookies = () => {
  console.log('Show cookie policy')
}

const formatNumber = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number)
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.main-footer {
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  color: white;
  position: relative;
  overflow: hidden;
}

.main-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(22, 160, 133, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
}

.footer-content {
  position: relative;
  z-index: 1;
}

/* Newsletter Section */
.newsletter-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  margin-bottom: 4rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.newsletter-title {
  color: white;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.newsletter-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0;
}

.newsletter-form {
  margin-top: 1rem;
}

.newsletter-input {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 12px 0 0 12px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
}

.newsletter-input:focus {
  background: white;
  box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.3);
}

.newsletter-btn {
  border-radius: 0 12px 12px 0;
  padding: 1rem 2rem;
  font-weight: 600;
  white-space: nowrap;
}

.subscription-message {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subscription-message.success {
  background: rgba(34, 197, 94, 0.2);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.subscription-message.error {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Main Footer */
.footer-main {
  padding: 2rem 0;
}

.footer-section {
  height: 100%;
}

.footer-title {
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, var(--bs-primary), var(--bs-success));
  border-radius: 2px;
}

/* Company Info */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 2rem;
  color: var(--bs-primary);
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-success));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.company-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.company-certifications {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cert-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

/* Footer Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-link-item {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-radius: 8px;
  padding-left: 0.5rem;
}

.footer-link:hover {
  color: var(--bs-primary);
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-item i {
  margin-top: 0.25rem;
  font-size: 1.1rem;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-details strong {
  color: white;
  font-size: 0.9rem;
}

.contact-details span,
.contact-details a {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-decoration: none;
}

.contact-details a:hover {
  color: var(--bs-primary);
}

/* Social Links */
.social-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-link {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.social-link:hover {
  background: var(--bs-primary);
  color: white;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(22, 160, 133, 0.3);
}

/* App Download */
.app-download {
  margin-bottom: 2rem;
}

.download-title {
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.download-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.download-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.download-btn i {
  font-size: 1.5rem;
}

.download-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.download-text small {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* Payment Methods */
.payment-title {
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.payment-icons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.payment-icon {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease;
  cursor: pointer;
}

.payment-icon:hover {
  color: var(--bs-primary);
}

/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0 1rem;
  margin-top: 2rem;
}

.copyright-text {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.legal-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.legal-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.legal-links a:hover {
  color: var(--bs-primary);
}

.separator {
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0.5rem;
}

.footer-stats {
  display: flex;
  gap: 2rem;
  justify-content: flex-end;
  align-items: center;
}

.footer-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Back to Top Button */
.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: var(--bs-primary);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(22, 160, 133, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-to-top-btn:hover {
  background: var(--bs-success);
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(22, 160, 133, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .newsletter-section {
    padding: 2rem 1rem;
    text-align: center;
  }
  
  .newsletter-form .input-group {
    flex-direction: column;
  }
  
  .newsletter-input,
  .newsletter-btn {
    border-radius: 12px;
  }
  
  .newsletter-btn {
    margin-top: 1rem;
  }
  
  .footer-stats {
    justify-content: center;
    margin-top: 1rem;
  }
  
  .footer-stats .stat-item {
    font-size: 0.8rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .download-buttons {
    max-width: 200px;
    margin: 0 auto;
  }
  
  .payment-icons {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .footer-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .legal-links {
    justify-content: center;
    text-align: center;
  }
  
  .back-to-top-btn {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
    bottom: 1rem;
    right: 1rem;
  }
}
</style>