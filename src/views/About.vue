<template>
  <div class="about-page">
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
            <i class="fas fa-info-circle"></i> Giới thiệu
          </li>
        </ol>
      </nav>

      <!-- About Content -->
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="about-content">
            <!-- Header -->
            <div class="text-center mb-5">
              <h1 class="display-4 text-primary mb-3">
                <i class="fas fa-store me-3"></i>
                Về EasyMart
              </h1>
              <p class="lead text-muted">
                Siêu thị thực phẩm online uy tín, chất lượng và tiện lợi
              </p>
            </div>

            <!-- Company Story -->
            <div class="story-section mb-5">
              <h2 class="h3 mb-4">
                <i class="fas fa-heart text-danger me-2"></i>
                Câu chuyện của chúng tôi
              </h2>
              <p class="mb-4">
                EasyMart được thành lập với sứ mệnh mang đến cho người tiêu dùng Việt Nam một trải nghiệm mua sắm 
                thực phẩm trực tuyến tuyệt vời nhất. Chúng tôi hiểu rằng thực phẩm không chỉ đơn thuần là hàng hóa, 
                mà còn là nền tảng cho sức khỏe và hạnh phúc của mọi gia đình.
              </p>
              <p class="mb-4">
                Từ những ngày đầu khởi nghiệp với mong muốn đơn giản là cung cấp thực phẩm tươi sống chất lượng cao 
                đến tận nhà của khách hàng, EasyMart đã không ngừng phát triển và hoàn thiện dịch vụ của mình.
              </p>
            </div>

            <!-- Values -->
            <div class="values-section mb-5">
              <h2 class="h3 mb-4">
                <i class="fas fa-star text-warning me-2"></i>
                Giá trị cốt lõi
              </h2>
              <div class="row g-4">
                <div class="col-md-4">
                  <div class="value-card text-center p-4">
                    <div class="value-icon mb-3">
                      <i class="fas fa-leaf fa-3x text-success"></i>
                    </div>
                    <h4 class="h5 mb-3">Chất lượng</h4>
                    <p class="text-muted">
                      Cam kết cung cấp thực phẩm tươi sống, an toàn và chất lượng cao nhất.
                    </p>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="value-card text-center p-4">
                    <div class="value-icon mb-3">
                      <i class="fas fa-shipping-fast fa-3x text-primary"></i>
                    </div>
                    <h4 class="h5 mb-3">Tiện lợi</h4>
                    <p class="text-muted">
                      Giao hàng nhanh chóng, đúng giờ và đảm bảo độ tươi ngon của sản phẩm.
                    </p>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="value-card text-center p-4">
                    <div class="value-icon mb-3">
                      <i class="fas fa-handshake fa-3x text-warning"></i>
                    </div>
                    <h4 class="h5 mb-3">Uy tín</h4>
                    <p class="text-muted">
                      Xây dựng lòng tin với khách hàng thông qua sự minh bạch và trách nhiệm.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="stats-section mb-5 text-center">
              <h2 class="h3 mb-4">
                <i class="fas fa-chart-line text-info me-2"></i>
                Thành tựu của chúng tôi
              </h2>
              <div class="row g-4">
                <div class="col-md-3 col-6">
                  <div class="stat-item">
                    <div class="stat-number">10K+</div>
                    <div class="stat-label">Khách hàng</div>
                  </div>
                </div>
                <div class="col-md-3 col-6">
                  <div class="stat-item">
                    <div class="stat-number">5K+</div>
                    <div class="stat-label">Sản phẩm</div>
                  </div>
                </div>
                <div class="col-md-3 col-6">
                  <div class="stat-item">
                    <div class="stat-number">50+</div>
                    <div class="stat-label">Nhà cung cấp</div>
                  </div>
                </div>
                <div class="col-md-3 col-6">
                  <div class="stat-item">
                    <div class="stat-number">99%</div>
                    <div class="stat-label">Hài lòng</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Call to Action -->
            <div class="cta-section text-center">
              <h2 class="h3 mb-4">Bắt đầu mua sắm ngay hôm nay!</h2>
              <p class="mb-4 text-muted">
                Khám phá hàng ngàn sản phẩm chất lượng với giá cả hợp lý tại EasyMart.
              </p>
              <router-link to="/" class="btn btn-primary btn-lg">
                <i class="fas fa-shopping-cart me-2"></i>
                Mua sắm ngay
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <!-- Đã xóa Footer -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useEasyMart } from '../composables/useEasyMart'
// Đã xóa import Header và Footer

// Router
const router = useRouter()

// Composable
const {
  categories,
  searchQuery,
  searchResults,
  cartCount,
  addToCart
} = useEasyMart()

// Methods
const viewProduct = (productId) => {
          router.push({ name: 'ProductDetail', params: { id: productId } })
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.about-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.value-card {
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
}

.stat-item {
  padding: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #0d6efd;
  line-height: 1;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.breadcrumb-item a:hover {
  color: #0d6efd !important;
}

@media (max-width: 768px) {
  .about-content {
    padding: 2rem 1.5rem;
  }
  
  .display-4 {
    font-size: 2rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style> 