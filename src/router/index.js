import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'EasyMart - Siêu thị thực phẩm online',
      description: 'Mua sắm thực phẩm tươi sống, hàng hóa chất lượng cao với giá tốt nhất'
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true, // Cho phép truyền route params như props
    meta: {
      title: 'Chi tiết sản phẩm - EasyMart',
      description: 'Xem chi tiết sản phẩm với thông tin đầy đủ, hình ảnh chất lượng cao'
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: {
      title: 'Giỏ hàng - EasyMart',
      description: 'Xem và quản lý sản phẩm trong giỏ hàng của bạn'
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: {
      title: 'Thanh toán - EasyMart',
      description: 'Tiến hành thanh toán đơn hàng'
    }
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccess.vue'),
    meta: {
      title: 'Thanh toán thành công - EasyMart',
      description: 'Xác nhận đơn hàng đã được thanh toán thành công'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    meta: {
      title: 'Tìm kiếm sản phẩm - EasyMart',
      description: 'Tìm kiếm và khám phá hàng nghìn sản phẩm chất lượng tại EasyMart'
    }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Categories.vue'),
    meta: {
      title: 'Danh mục sản phẩm - EasyMart',
      description: 'Khám phá tất cả danh mục sản phẩm tại EasyMart'
    }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('../views/Category.vue'),
    props: true,
    meta: {
      title: 'Danh mục sản phẩm - EasyMart',
      description: 'Xem tất cả sản phẩm trong danh mục'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: 'Giới thiệu - EasyMart',
      description: 'Thông tin về EasyMart - Siêu thị thực phẩm online uy tín'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: {
      title: 'Liên hệ - EasyMart',
      description: 'Thông tin liên hệ và hỗ trợ khách hàng'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: 'Đăng nhập - EasyMart',
      description: 'Đăng nhập vào tài khoản EasyMart của bạn'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: 'Đăng ký - EasyMart',
      description: 'Tạo tài khoản mới tại EasyMart'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      title: 'Hồ sơ cá nhân - EasyMart',
      description: 'Quản lý thông tin cá nhân và tài khoản EasyMart'
    }
  },
  {
    // Redirect các route không tồn tại về trang chủ
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll behavior - cuộn lên đầu trang khi chuyển route
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  // Cập nhật document title từ route meta
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Cập nhật meta description
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description)
    }
  }
  
  // Check authentication for protected routes
  const protectedRoutes = ['Checkout', 'PaymentSuccess']
  if (protectedRoutes.includes(to.name)) {
    const user = JSON.parse(localStorage.getItem('easymart-user') || 'null')
    if (!user) {
      // Save intended route to redirect after login
      localStorage.setItem('easymart-redirect-after-login', to.fullPath)
      next({ name: 'Login' })
      return
    }
  }
  
  // Loading indicator (có thể thêm sau)
  // NProgress.start()
  
  next()
})

router.afterEach(() => {
  // Kết thúc loading indicator
  // NProgress.done()
})

export default router