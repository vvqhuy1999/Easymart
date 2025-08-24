<template>
  <!-- Header Container với scroll animation -->
  <header 
    class="header-container fixed-top"
    :class="{
      'header-scrolled': isScrolled,
      'header-visible': isHeaderVisible,
      'header-hidden': !isHeaderVisible
    }"
  >
    <!-- Top Bar -->
    <div class="top-bar py-2 border-bottom" :class="{ 'top-bar-hidden': !isHeaderVisible }">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <small class="text-muted">
              <i class="fas fa-phone-alt text-primary me-2"></i>Hotline: 1900 1234 |
              <i class="fas fa-envelope text-primary ms-3 me-2"></i>cskh@easymart.vn
            </small>
          </div>
          <div class="col-md-6 text-end">
            <small class="text-muted">
              <i class="fas fa-truck text-primary me-2"></i>Miễn phí vận chuyển đơn hàng từ 200k
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light main-nav shadow-sm py-3">
    <div class="container">
      <router-link to="/" class="navbar-brand fw-bold text-primary fs-4">
        <i class="fas fa-shopping-cart me-2"></i>EasyMart
      </router-link>
      
      <!-- Enhanced Search Container -->
      <div class="flex-grow-1 mx-4">
        <SearchDropdown 
          :searchQuery="searchQuery"
          @update-search="$emit('update-search', $event)"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </div>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- Category Dropdown -->
          <li class="nav-item dropdown me-3" style="position: static;" @mouseenter="showCategoryDropdownOnHover" @mouseleave="hideCategoryDropdownOnLeave">
            <router-link 
              to="/categories"
              class="nav-link dropdown-toggle px-3 py-2 rounded-pill" 
              role="button" 
              :aria-expanded="showCategoryDropdown"
              id="category-trigger"
            >
              <i class="fas fa-th-large me-2"></i>Danh mục
            </router-link>
          </li>
          
          <!-- Account Dropdown -->
          <li class="nav-item dropdown me-3" style="position: static;" @mouseenter="showAccountDropdownOnHover" @mouseleave="hideAccountDropdownOnLeave">
            <a 
              class="nav-link dropdown-toggle px-3 py-2 rounded-pill" 
              href="#" 
              role="button" 
              :aria-expanded="showAccountDropdown"
              id="account-trigger"
            >
              <i class="fas fa-user me-2"></i>Tài khoản
            </a>
          </li>
          
          <!-- Cart Dropdown -->
          <li class="nav-item">
            <CartDropdown />
          </li>
         
        </ul>
      </div>
    </div>
    </nav>
  </header>

  <!-- Teleport Dropdowns ra ngoài header để tránh bị giới hạn -->
  <Teleport to="body">
    <!-- Category Dropdown -->
    <ul 
      class="dropdown-menu dropdown-menu-end category-dropdown" 
      :class="{ show: showCategoryDropdown }" 
      style="position: fixed !important; z-index: 2147483647 !important;"
      v-if="showCategoryDropdown"
      @mouseenter="keepCategoryDropdownOpen"
      @mouseleave="hideCategoryDropdownOnLeave"
    >
      <li v-for="category in categories" :key="category.id">
        <router-link 
          :to="{ name: 'Category', params: { id: category.id } }"
          class="dropdown-item rounded-2 mx-2 my-1"
          @click="showCategoryDropdown = false"
        >
          <i :class="`${category.icon} text-${category.color} me-3`"></i>{{ category.name }}
        </router-link>
      </li>
    </ul>

    <!-- Account Dropdown -->
    <ul 
      class="dropdown-menu dropdown-menu-end account-dropdown" 
      :class="{ show: showAccountDropdown }" 
      style="position: fixed !important; z-index: 2147483647 !important;"
      v-if="showAccountDropdown"
      @mouseenter="keepAccountDropdownOpen"
      @mouseleave="hideAccountDropdownOnLeave"
    >
      <template v-if="isLoggedIn">
        <li class="dropdown-item-text text-center mb-2">
          <i class="fas fa-user-circle fa-2x text-primary mb-2"></i>
          <div class="fw-bold">{{ user?.name || 'Tài khoản của bạn' }}</div>
          <div class="small text-muted">{{ user?.email }}</div>
        </li>
        <li><router-link to="/profile" class="dropdown-item rounded-2 mx-2 my-1"><i class="fas fa-user me-3 text-primary"></i>Thông tin tài khoản</router-link></li>
        <li><router-link to="/orders" class="dropdown-item rounded-2 mx-2 my-1" @click="showAccountDropdown = false"><i class="fas fa-box me-3 text-success"></i>Đơn hàng của tôi</router-link></li>
        <li><router-link to="/wishlist" class="dropdown-item rounded-2 mx-2 my-1"><i class="fas fa-heart me-3 text-danger"></i>Sản phẩm yêu thích</router-link></li>
        <li><hr class="dropdown-divider"></li>
        <li><a href="#" class="dropdown-item rounded-2 mx-2 my-1 text-danger" @click.prevent="handleLogout"><i class="fas fa-sign-out-alt me-3"></i>Đăng xuất</a></li>
      </template>
      <template v-else>
        <li><router-link to="/login" class="dropdown-item rounded-2 mx-2 my-1"><i class="fas fa-sign-in-alt text-primary me-3"></i>Đăng nhập</router-link></li>
        <li><router-link to="/register" class="dropdown-item rounded-2 mx-2 my-1"><i class="fas fa-user-plus text-primary me-3"></i>Đăng ký</router-link></li>
      </template>
    </ul>
  </Teleport>
</template>

<script setup>
/* 
 * Header.vue - Header chính của ứng dụng với CartDropdown tích hợp
 * 
 * Component header với navigation, search, cart dropdown và dropdowns
 * 
 * Tính năng:
 * - Top bar với thông tin liên hệ và khuyến mãi
 * - Logo và brand name
 * - Search bar tích hợp SearchDropdown component
 * - Category dropdown với scroll to section
 * - Account dropdown (đăng nhập/đăng ký)
 * - Cart dropdown với thông tin chi tiết sản phẩm
 * - Mobile responsive với navbar collapse
 * - Click outside để đóng dropdowns
 */

// ==================== IMPORTS ====================
// Vue Composition API
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Child Components
import SearchDropdown from './SearchDropdown.vue'
import CartDropdown from './CartDropdown.vue'

// Composables
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

// ==================== PROPS & EMITS ====================
// Props nhận từ parent component (App.vue)
const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  }
})

// Events emit về parent component
const emit = defineEmits(['update-search', 'add-to-cart'])

// Composables
const { user, isLoggedIn, logout, forceReloadUser } = useAuth()
const router = useRouter()

// ==================== REACTIVE STATE ====================
// Trạng thái hiển thị dropdown danh mục
const showCategoryDropdown = ref(false)

// Trạng thái hiển thị dropdown tài khoản
const showAccountDropdown = ref(false)

// Trạng thái scroll cho header animation
const isScrolled = ref(false)
const isHeaderVisible = ref(true)
const lastScrollY = ref(0)
const scrollDirection = ref('up')

// Hover timers cho smooth dropdown experience
const categoryHoverTimer = ref(null)
const accountHoverTimer = ref(null)

// ==================== METHODS ====================
/**
 * Hiển thị category dropdown khi hover
 */
const showCategoryDropdownOnHover = () => {
  // Clear any existing timer
  if (categoryHoverTimer.value) {
    clearTimeout(categoryHoverTimer.value)
    categoryHoverTimer.value = null
  }
  
  showCategoryDropdown.value = true
  showAccountDropdown.value = false
  
  nextTick(() => {
    const trigger = document.getElementById('category-trigger')
    const dropdown = document.querySelector('.category-dropdown')
    if (trigger && dropdown) {
      const rect = trigger.getBoundingClientRect()
      dropdown.style.top = `${rect.bottom + 8}px`
      dropdown.style.left = `${rect.left}px`
      dropdown.style.right = 'auto'
    }
  })
}

/**
 * Ẩn category dropdown khi leave
 */
const hideCategoryDropdownOnLeave = () => {
  categoryHoverTimer.value = setTimeout(() => {
    showCategoryDropdown.value = false
  }, 200) // Delay 200ms để cho phép di chuyển mouse
}

/**
 * Giữ category dropdown mở khi hover vào dropdown
 */
const keepCategoryDropdownOpen = () => {
  if (categoryHoverTimer.value) {
    clearTimeout(categoryHoverTimer.value)
    categoryHoverTimer.value = null
  }
}

/**
 * Hiển thị account dropdown khi hover
 */
const showAccountDropdownOnHover = () => {
  // Clear any existing timer
  if (accountHoverTimer.value) {
    clearTimeout(accountHoverTimer.value)
    accountHoverTimer.value = null
  }
  
  showAccountDropdown.value = true
  showCategoryDropdown.value = false
  
  nextTick(() => {
    const trigger = document.getElementById('account-trigger')
    const dropdown = document.querySelector('.account-dropdown')
    if (trigger && dropdown) {
      const rect = trigger.getBoundingClientRect()
      dropdown.style.top = `${rect.bottom + 8}px`
      dropdown.style.left = `${rect.left}px`
      dropdown.style.right = 'auto'
    }
  })
}

/**
 * Ẩn account dropdown khi leave
 */
const hideAccountDropdownOnLeave = () => {
  accountHoverTimer.value = setTimeout(() => {
    showAccountDropdown.value = false
  }, 200) // Delay 200ms để cho phép di chuyển mouse
}

/**
 * Giữ account dropdown mở khi hover vào dropdown
 */
const keepAccountDropdownOpen = () => {
  if (accountHoverTimer.value) {
    clearTimeout(accountHoverTimer.value)
    accountHoverTimer.value = null
  }
}

/**
 * Toggle dropdown danh mục và đóng dropdown khác
 */
const toggleCategoryDropdown = (event) => {
  // Don't prevent default for router-link navigation
  showCategoryDropdown.value = !showCategoryDropdown.value
  showAccountDropdown.value = false
  
  if (showCategoryDropdown.value) {
    nextTick(() => {
      const trigger = document.getElementById('category-trigger')
      const dropdown = document.querySelector('.category-dropdown')
      if (trigger && dropdown) {
        const rect = trigger.getBoundingClientRect()
        dropdown.style.top = `${rect.bottom + 8}px`
        dropdown.style.left = `${rect.left}px`
        dropdown.style.right = 'auto'
      }
    })
  }
}

/**
 * Toggle dropdown tài khoản và đóng dropdown khác
 */
const toggleAccountDropdown = (event) => {
  event.preventDefault()
  showAccountDropdown.value = !showAccountDropdown.value
  showCategoryDropdown.value = false
  
  if (showAccountDropdown.value) {
    nextTick(() => {
      const trigger = document.getElementById('account-trigger')
      const dropdown = document.querySelector('.account-dropdown')
      if (trigger && dropdown) {
        const rect = trigger.getBoundingClientRect()
        dropdown.style.top = `${rect.bottom + 8}px`
        dropdown.style.left = `${rect.left}px`
        dropdown.style.right = 'auto'
      }
    })
  }
}

/**
 * Scroll smooth đến section danh mục khi click
 */
const scrollToCategory = (categoryId) => {
  showCategoryDropdown.value = false
  
  nextTick(() => {
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
}

/**
 * Xử lý click bên ngoài để đóng dropdowns
 */
const handleOutsideClick = (event) => {
  if (!event.target.closest('.dropdown') && !event.target.closest('.cart-dropdown')) {
    showCategoryDropdown.value = false
    showAccountDropdown.value = false
  }
}

/**
 * Xử lý scroll event cho header animation
 */
const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  isScrolled.value = currentScrollY > 50
  
  if (currentScrollY > lastScrollY.value) {
    scrollDirection.value = 'down'
  } else {
    scrollDirection.value = 'up'  
  }
  
  if (currentScrollY < 10) {
    isHeaderVisible.value = true
  } else if (scrollDirection.value === 'down' && currentScrollY > 100) {
    isHeaderVisible.value = false
    showCategoryDropdown.value = false
    showAccountDropdown.value = false
  } else if (scrollDirection.value === 'up') {
    isHeaderVisible.value = true
  }
  
  updateDropdownPositions()
  lastScrollY.value = currentScrollY
}

/**
 * Cập nhật vị trí dropdown khi scroll hoặc resize
 */
const updateDropdownPositions = () => {
  if (showCategoryDropdown.value) {
    const categoryTrigger = document.getElementById('category-trigger')
    const categoryDropdown = document.querySelector('.category-dropdown')
    if (categoryTrigger && categoryDropdown) {
      const rect = categoryTrigger.getBoundingClientRect()
      categoryDropdown.style.top = `${rect.bottom + 8}px`
      categoryDropdown.style.left = `${rect.left}px`
      categoryDropdown.style.right = 'auto'
    }
  }
  
  if (showAccountDropdown.value) {
    const accountTrigger = document.getElementById('account-trigger')
    const accountDropdown = document.querySelector('.account-dropdown')
    if (accountTrigger && accountDropdown) {
      const rect = accountTrigger.getBoundingClientRect()
      accountDropdown.style.top = `${rect.bottom + 8}px`
      accountDropdown.style.left = `${rect.left}px`
      accountDropdown.style.right = 'auto'
    }
  }
}

/**
 * Handle window resize để cập nhật vị trí dropdown
 */
const handleResize = () => {
  updateDropdownPositions()
}

/**
 * Throttle function để optimize scroll performance
 */
let scrollTimer = null
const throttledHandleScroll = () => {
  if (scrollTimer === null) {
    scrollTimer = setTimeout(() => {
      handleScroll()
      scrollTimer = null
    }, 10)
  }
}

/**
 * Xử lý logout - sử dụng logout async function mới
 */
const handleLogout = async () => {
  try {
    const result = await logout()
    showAccountDropdown.value = false
    
    if (result.success) {
      router.push('/')
    } else {
      console.warn('Logout warning:', result.error)
      // Vẫn redirect về home vì local data đã được xóa
      router.push('/')
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Force redirect về home
    router.push('/')
  }
}

// ==================== LIFECYCLE HOOKS ====================
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('scroll', throttledHandleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  
  // Listen for user updates from OAuth flow
  const handleUserUpdated = () => {}
  
  window.addEventListener('user-updated', handleUserUpdated)
  
  handleScroll()
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('scroll', throttledHandleScroll)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('user-updated', handleUserUpdated)
  
  // Clear timers
  if (categoryHoverTimer.value) {
    clearTimeout(categoryHoverTimer.value)
  }
  if (accountHoverTimer.value) {
    clearTimeout(accountHoverTimer.value)
  }
  
  if (scrollTimer !== null) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }
})
</script>

<style scoped>
/* ==================== HEADER CONTAINER & SCROLL ANIMATION ==================== */
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483646;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);
  overflow: visible !important;
}

.header-container.header-scrolled {
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
}

.header-container.header-hidden {
  transform: translateY(-100%);
}

.header-container.header-visible {
  transform: translateY(0);
}

/* Top bar scroll animation */
.top-bar {
  transition: all 0.3s ease;
  max-height: 50px;
  overflow: hidden;
}

.top-bar-hidden {
  max-height: 0;
  padding: 0;
  opacity: 0;
}

/* Header với dark theme */
.main-nav {
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460) !important;
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: visible !important;
  transition: all 0.3s ease;
}

.header-scrolled .main-nav {
  background: rgba(26, 26, 46, 0.98) !important;
  backdrop-filter: blur(25px);
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

/* Pattern effect */
.main-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(22, 160, 133, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.3;
  pointer-events: none;
}

/* Navbar brand styling */
.navbar-brand {
  color: #fff !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  color: #16a085 !important;
  transform: scale(1.05);
}

/* Navigation links */
.navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 25px;
  position: relative;
  overflow: hidden;
}

.navbar-nav .nav-link:hover {
  color: #16a085 !important;
  background-color: rgba(22, 160, 133, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(22, 160, 133, 0.2);
}

.navbar-nav .nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.navbar-nav .nav-link:hover::before {
  left: 100%;
}

/* Dropdown styling */
.dropdown-menu {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  margin-top: 0.5rem;
}

.dropdown-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 0.25rem;
}

.dropdown-item:hover {
  background-color: rgba(22, 160, 133, 0.1);
  color: #16a085;
  transform: translateX(5px);
}

/* Mobile responsive */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background: rgba(26, 26, 46, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 15px;
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .navbar-nav .nav-link {
    text-align: center;
    margin: 0.25rem 0;
  }
}

/* Search container */
.flex-grow-1 {
  max-width: 600px;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-menu.show {
  animation: fadeInDown 0.3s ease-out;
}

/* Cart specific styles */
.cart-count {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>