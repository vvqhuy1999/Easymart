# 🛒 EasyMart - Ứng dụng Siêu thị Thực phẩm Online

Ứng dụng siêu thị thực phẩm trực tuyến được xây dựng bằng Vue.js 3 với Composition API, tập trung vào việc bán thực phẩm tươi sống và hàng tiêu dùng thiết yếu.

## ✨ Tính năng chính

### 🛍️ Mua sắm thực phẩm
- **🥬 Thực phẩm tươi sống**: Cá, thịt, tôm, gạo và các sản phẩm tươi ngon
- **🔍 Tìm kiếm thông minh**: Hỗ trợ tìm kiếm tiếng Việt có dấu với thuật toán tối ưu
- **🗂️ Phân loại sản phẩm**: 7 danh mục chính từ tươi sống đến hóa phẩm
- **⚡ Flash Sale**: Khuyến mãi đặc biệt với đồng hồ đếm ngược thời gian thực
- **🛒 Giỏ hàng**: Quản lý sản phẩm với lưu trữ tự động qua localStorage

### 🎯 Trải nghiệm người dùng
- **📱 Responsive**: Tương thích hoàn hảo trên mobile và desktop
- **🔔 Thông báo**: Feedback tức thì cho mọi thao tác của người dùng
- **💳 Đa dạng thanh toán**: COD, chuyển khoản, QR code, MoMo, VNPay, ZaloPay
- **⭐ Đánh giá sản phẩm**: Hệ thống review chi tiết từ khách hàng
- **🔐 Đăng nhập Google**: Đăng nhập nhanh chóng với tài khoản Google

## 🚀 Cài đặt và khởi chạy

### Yêu cầu hệ thống
- **Node.js**: >= 16.x
- **npm**: >= 8.x

### Google OAuth Setup (Tùy chọn)
Để sử dụng tính năng đăng nhập với Google, xem hướng dẫn chi tiết trong file [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd EasyMart

# Cài đặt dependencies
npm install

# Khởi chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build production
```bash
npm run build
npm run preview
```

## 📁 Cấu trúc dự án

```
EasyMart/
├── public/                   # Static assets
├── src/
│   ├── components/           # Vue components
│   │   ├── AccountDropdown.vue      # Dropdown tài khoản người dùng
│   │   ├── CartDropdown.vue         # Dropdown giỏ hàng
│   │   ├── CategorySection.vue      # Section hiển thị danh mục
│   │   ├── CouponsSection.vue       # Section mã giảm giá
│   │   ├── DailyDeals.vue          # Deals hàng ngày
│   │   ├── Footer.vue              # Footer trang web
│   │   ├── Header.vue              # Header với navigation
│   │   ├── HeroCarousel.vue        # Carousel banner chính
│   │   ├── Notification.vue        # Component thông báo
│   │   ├── ProductCard.vue         # Card hiển thị sản phẩm
│   │   ├── ProductDetail.vue       # Chi tiết sản phẩm
│   │   ├── ProductDescription.vue  # Mô tả sản phẩm
│   │   ├── ProductNutrition.vue    # Thông tin dinh dưỡng
│   │   ├── ProductReviews.vue      # Đánh giá sản phẩm
│   │   ├── SearchDropdown.vue      # Dropdown kết quả tìm kiếm
│   │   ├── SimpleCarousel.vue      # Carousel đơn giản
│   │   └── WriteReview.vue         # Form viết đánh giá
│   ├── views/                # Page components
│   │   ├── About.vue               # Trang giới thiệu
│   │   ├── Cart.vue                # Trang giỏ hàng
│   │   ├── Categories.vue          # Trang danh mục
│   │   ├── Category.vue            # Trang sản phẩm theo danh mục
│   │   ├── Checkout.vue            # Trang thanh toán
│   │   ├── Contact.vue             # Trang liên hệ
│   │   ├── Home.vue                # Trang chủ
│   │   ├── Login.vue               # Trang đăng nhập
│   │   ├── PaymentSuccess.vue      # Trang thanh toán thành công
│   │   ├── ProductDetail.vue       # Trang chi tiết sản phẩm
│   │   ├── Profile.vue             # Trang hồ sơ cá nhân
│   │   ├── Register.vue            # Trang đăng ký
│   │   └── Search.vue              # Trang kết quả tìm kiếm
│   ├── composables/          # Vue composables (state management)
│   │   ├── useAuth.js              # Logic xác thực người dùng
│   │   ├── useCart.js              # Logic quản lý giỏ hàng
│   │   ├── useEasyMart.js          # Logic chính của ứng dụng
│   │   └── useProductDetail.js     # Logic chi tiết sản phẩm
│   ├── router/               # Vue Router configuration
│   │   └── index.js                # Cấu hình routing và navigation guards
│   ├── utils/                # Utility functions
│   │   └── vietnamese.js           # Xử lý tìm kiếm tiếng Việt
│   ├── assets/               # Assets và styles
│   │   └── styles.css              # CSS tùy chỉnh
│   ├── App.vue               # Root component
│   ├── main.js               # Entry point
│   └── style.css             # Global styles
├── index.html                # HTML template
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies và scripts
└── README.md                # Documentation này
```

## 🏗️ Kiến trúc ứng dụng

### 🎯 Composition API Pattern
Ứng dụng sử dụng Vue 3 Composition API với pattern composables để quản lý state:

- **useEasyMart.js**: Composable chính quản lý sản phẩm, danh mục, tìm kiếm
- **useCart.js**: Quản lý giỏ hàng với singleton pattern
- **useAuth.js**: Xử lý xác thực và quản lý người dùng
- **useProductDetail.js**: Logic cho trang chi tiết sản phẩm

### 🔄 State Management
- **Reactive State**: Sử dụng `ref()` và `computed()` của Vue 3
- **Persistent Storage**: Tự động lưu giỏ hàng và thông tin người dùng vào localStorage
- **Global State**: Chia sẻ state giữa components thông qua composables

### 🛣️ Routing
- **Vue Router 4**: Routing với lazy loading cho performance tối ưu
- **Navigation Guards**: Bảo vệ các route yêu cầu xác thực
- **Meta Tags**: SEO-friendly với title và description động

## 🛍️ Danh mục sản phẩm

### 📋 7 Danh mục chính
1. **🥬 Tươi Sống** - Cá, thịt, tôm, gạo tươi
2. **❄️ Đông lạnh** - Thực phẩm đông lạnh
3. **🥫 Đồ đóng hộp** - Thực phẩm chế biến sẵn
4. **🥤 Đồ Uống** - Nước, sữa, trà, nước ngọt
5. **🍼 Sữa & Em bé** - Sản phẩm cho trẻ em
6. **🌶️ Gia Vị & Dầu Ăn** - Gia vị, dầu ăn
7. **🧽 Hóa Phẩm & Tẩy Rửa** - Chất tẩy rửa, vệ sinh

### 💰 Flash Sale Products
- **Gạo ST25 cao cấp 5kg**: ~~200,000₫~~ **100,000₫**
- **Thịt heo ba chỉ tươi 1kg**: ~~180,000₫~~ **108,000₫**
- **Sữa tươi TH True Milk 1L**: ~~28,000₫~~ **18,200₫**
- **Bánh mì sandwich 6 ổ**: ~~60,000₫~~ **33,000₫**

## 🔍 Tính năng tìm kiếm

### 🇻🇳 Hỗ trợ tiếng Việt
- **Tìm kiếm không dấu**: Nhập "ca basa" tìm được "Cá basa"
- **Tìm kiếm có dấu**: Nhập "cá basa" tìm được chính xác
- **Tìm kiếm mờ**: Nhập "ca ba" vẫn tìm được "Cá basa"
- **Kết quả tức thì**: Hiển thị kết quả ngay khi nhập >= 2 ký tự

### 🎯 Thuật toán tìm kiếm
File `src/utils/vietnamese.js` chứa logic:
- Chuẩn hóa chuỗi tiếng Việt (bỏ dấu)
- So sánh chuỗi không phân biệt dấu
- Tìm kiếm trong nhiều trường (tên, mô tả)

## 🛒 Quản lý giỏ hàng

### 💾 Lưu trữ tự động
- **localStorage**: Giỏ hàng được lưu tự động và khôi phục khi reload
- **Singleton Pattern**: Một instance duy nhất cho toàn ứng dụng
- **Real-time Update**: Cập nhật số lượng và tổng tiền tức thì

### 🔢 Tính năng giỏ hàng
- **Thêm sản phẩm**: Từ ProductCard hoặc ProductDetail
- **Cập nhật số lượng**: Tăng/giảm số lượng trực tiếp
- **Xóa sản phẩm**: Xóa từng item hoặc clear toàn bộ
- **Tính tổng tiền**: Tự động tính toán tổng giá trị đơn hàng

## 💳 Hệ thống thanh toán

### 6 Phương thức thanh toán
1. **🚚 COD** - Thanh toán khi nhận hàng
2. **🏦 Chuyển khoản** - Chuyển khoản ngân hàng
3. **📱 QR Code** - Quét mã QR thanh toán
4. **🔴 MoMo** - Ví điện tử MoMo
5. **💳 VNPay** - Cổng thanh toán VNPay
6. **🟡 ZaloPay** - Ví điện tử ZaloPay

### 🔐 Bảo mật thanh toán
- **Xác thực bắt buộc**: Phải đăng nhập trước khi thanh toán
- **Validation form**: Kiểm tra đầy đủ thông tin giao hàng
- **Protected routes**: Navigation guards bảo vệ checkout

## ⭐ Hệ thống đánh giá

### 📝 Product Reviews
- **Rating 1-5 sao**: Đánh giá chất lượng sản phẩm
- **Nhận xét chi tiết**: Feedback từ khách hàng thực tế
- **Thông tin reviewer**: Tên và ngày đánh giá
- **Hiển thị trang chi tiết**: Reviews được hiển thị đầy đủ

### 🏆 Ví dụ reviews có sẵn
- **Cá basa fillet**: 5⭐ "Sản phẩm tuyệt vời, giao hàng nhanh chóng"
- **Gạo ST25**: 5⭐ "Gạo ST25 thật sự ngon, hạt dẻo thơm"
- **Tôm thẻ tươi**: 5⭐ "Tôm rất tươi, kích cỡ lớn"

## 🛠️ Công nghệ sử dụng

### 🎨 Frontend
- **Vue.js 3.3.0**: Progressive framework với Composition API
- **Vue Router 4.5.1**: Official router với lazy loading
- **Bootstrap 5.3.0**: CSS framework responsive
- **FontAwesome 6.0.0**: Icon library với 7000+ icons
- **vue3-google-login**: Google OAuth integration cho Vue 3

### ⚡ Build Tools
- **Vite 7.0.4**: Next-gen build tool cực nhanh
- **@vitejs/plugin-vue 6.0.0**: Official Vue plugin cho Vite

### 🎯 Key Features
- **Composition API**: Modern Vue 3 development pattern
- **Composables**: Reusable logic với reactive state
- **localStorage**: Client-side persistence
- **Responsive Design**: Mobile-first approach
- **Vietnamese Search**: Diacritic-insensitive search

## 🎨 Design System

### 🎨 Color Palette
```css
/* Màu chủ đạo */
--bs-primary: #0d6efd;    /* Xanh dương chính */
--bs-success: #198754;    /* Xanh lá thành công */
--bs-danger: #dc3545;     /* Đỏ cảnh báo */
--bs-warning: #ffc107;    /* Vàng cảnh báo */
--bs-info: #0dcaf0;       /* Xanh nhạt thông tin */

/* Background gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 📱 Responsive Breakpoints
- **Mobile**: < 576px
- **Tablet**: 576px - 992px  
- **Desktop**: > 992px

### 🎭 Component Styling
- **Border radius**: 8px cho các card và button
- **Box shadow**: Subtle shadows cho depth
- **Transitions**: 0.3s ease cho smooth animations
- **Hover effects**: Transform và color changes

## 🚀 Performance

### ⚡ Optimization Features
- **Lazy Loading**: Route-based code splitting
- **Component Lazy Loading**: Import components khi cần
- **Image Optimization**: Responsive images từ Unsplash
- **Bundle Splitting**: Vite tự động tối ưu bundle size

### 📊 Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

## 🧪 Testing & Development

### 🔧 Development Tools
```bash
# Hot reload development
npm run dev

# Build và preview
npm run build
npm run preview

# Lint code (nếu có ESLint)
npm run lint
```

### 🐛 Debug Tips
- **Vue DevTools**: Cài extension cho browser
- **Console Logs**: Check browser console cho errors
- **Network Tab**: Debug API calls và asset loading
- **Vue DevTools Composables**: Monitor reactive state

## 📱 Mobile Experience

### 📲 Mobile-First Design
- **Touch-friendly**: Buttons và interactive elements đủ lớn
- **Swipe Support**: Carousel hỗ trợ swipe gestures
- **Fast Loading**: Optimized cho mobile network
- **Responsive Images**: Tự động scale theo screen size

### 🔔 Progressive Web App Ready
- **Service Worker**: Sẵn sàng cho offline caching
- **Manifest**: Web app manifest cho install prompt
- **Icon Sets**: Multiple icon sizes cho different devices

## 🔒 Security & Privacy

### 🛡️ Security Features
- **XSS Protection**: Vue template escaping tự động
- **Input Validation**: Client-side validation cho forms
- **Safe Storage**: Không lưu thông tin nhạy cảm
- **HTTPS Ready**: Sẵn sàng deploy với SSL

### 🔐 Data Privacy
- **Local Storage Only**: Không gửi data lên server
- **No Tracking**: Không có analytics hay tracking
- **User Control**: User có thể clear data bất kỳ lúc nào

## 🚀 Deployment

### 🌐 Deploy to Netlify
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables (nếu cần)
NODE_VERSION=18
```

### ⚡ Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 📦 Deploy to GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add script to package.json
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

## 🔧 Customization

### 🎨 Thay đổi theme
Chỉnh sửa `src/assets/styles.css`:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### 📦 Thêm sản phẩm mới
Chỉnh sửa `src/composables/useEasyMart.js`:
```javascript
const defaultProducts = [
  {
    id: 11,
    name: 'Sản phẩm mới',
    price: 50000,
    categoryId: 1,
    image: 'https://your-image-url',
    description: 'Mô tả sản phẩm',
    isFlashSale: false,
    reviews: []
  },
  // ... existing products
]
```

### 🗂️ Thêm danh mục mới
```javascript
const defaultCategories = [
  {
    id: 8,
    name: 'Danh mục mới',
    icon: 'fas fa-your-icon',
    color: 'primary'
  },
  // ... existing categories
]
```

## 🐛 Troubleshooting

### ❗ Lỗi thường gặp

#### 1. Vite dev server không start
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 2. Build production failed
```bash
# Check Node version
node --version  # Should be >= 16

# Update dependencies
npm update
```

#### 3. LocalStorage issues
- Check browser support: `typeof(Storage) !== "undefined"`
- Clear browser data: Settings > Clear browsing data
- Check storage quota: `navigator.storage.estimate()`

#### 4. Search không hoạt động
- Check `src/utils/vietnamese.js` file exists
- Verify import trong `useEasyMart.js`
- Test với console: `filterBySearchTerm(products, 'test', ['name'])`

## 📈 Roadmap

### 🎯 Version 1.1 (Sắp tới)
- [ ] **Admin Panel**: Quản lý sản phẩm và đơn hàng
- [ ] **User Profiles**: Thông tin cá nhân chi tiết
- [ ] **Order History**: Lịch sử mua hàng
- [ ] **Wishlist**: Danh sách yêu thích

### 🚀 Version 1.2 (Q4 2024)
- [ ] **Real Payment**: Tích hợp thanh toán thực tế
- [ ] **Push Notifications**: Thông báo đẩy
- [ ] **Offline Support**: PWA với offline mode
- [ ] **Multi-language**: Hỗ trợ tiếng Anh

### 🌟 Version 2.0 (2025)
- [ ] **Backend API**: Node.js/Express backend
- [ ] **Database**: MongoDB/PostgreSQL
- [ ] **Real-time**: WebSocket cho live updates
- [ ] **Mobile App**: React Native/Flutter

## 🤝 Contributing

### 📋 Quy tắc đóng góp
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### 📝 Code Style
- Sử dụng Composition API cho Vue 3
- Đặt tên component theo PascalCase
- Đặt tên file theo kebab-case
- Comment code bằng tiếng Việt cho dễ hiểu

## 📞 Hỗ trợ

### 🆘 Cần giúp đỡ?
- **GitHub Issues**: [Tạo issue mới](https://github.com/your-repo/issues)
- **Email**: support@easymart.vn
- **Documentation**: Đọc README này kỹ trước khi hỏi

### 🐛 Báo lỗi
Khi báo lỗi, vui lòng cung cấp:
- **Browser**: Chrome/Firefox/Safari version
- **Device**: Desktop/Mobile/Tablet
- **Steps to reproduce**: Các bước tái hiện lỗi
- **Expected vs Actual**: Kết quả mong đợi vs thực tế
- **Screenshots**: Ảnh chụp màn hình nếu có thể

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết chi tiết.

## 🙏 Credits

### 🎉 Acknowledgments
- **Vue.js Team**: Framework tuyệt vời
- **Bootstrap Team**: CSS framework mạnh mẽ
- **FontAwesome**: Icon library phong phú
- **Unsplash**: High-quality product images
- **Vite Team**: Lightning fast build tool

### 📸 Image Credits
Tất cả hình ảnh sản phẩm được lấy từ [Unsplash](https://unsplash.com) với license miễn phí.

---

<div align="center">

**🛒 EasyMart - Siêu thị thực phẩm online uy tín! 🥬**

*Tươi ngon - Chất lượng - Giao hàng nhanh*

Made with ❤️ và Vue.js 3

[🏠 Trang chủ](/) | [🛒 Mua sắm](/categories) | [📞 Liên hệ](/contact)

</div>