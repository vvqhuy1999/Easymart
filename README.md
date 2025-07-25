# 🛒 EasyMart - Ứng dụng Thương mại Điện tử Vue.js

Ứng dụng bán hàng trực tuyến hiện đại được xây dựng bằng Vue.js 3, Vue Router và Bootstrap 5 với giao diện responsive và trải nghiệm người dùng tối ưu.

## ✨ Tính năng nổi bật

### 🎯 Tính năng cốt lõi
- **🛍️ Quản lý sản phẩm**: Hiển thị, tìm kiếm và phân loại sản phẩm
- **🗂️ Danh mục sản phẩm**: Hệ thống phân loại với icon và màu sắc tùy chỉnh
- **⚡ Flash Sale**: Khuyến mãi có thời hạn với đếm ngược thời gian real-time
- **🔍 Tìm kiếm thông minh**: Tìm kiếm sản phẩm theo tên với kết quả tức thì
- **🛒 Giỏ hàng**: Quản lý sản phẩm trong giỏ với cập nhật số lượng và tổng tiền
- **📱 Responsive Design**: Tương thích hoàn hảo trên mọi thiết bị

### 🎫 Hệ thống mã giảm giá nâng cao
- **💳 Đa dạng loại coupon**: Hỗ trợ cả giảm giá theo phần trăm và số tiền cố định
- **✅ Validation thông minh**: Kiểm tra tính hợp lệ của mã coupon real-time
- **🎨 Giao diện trực quan**: Hiển thị trạng thái áp dụng với feedback rõ ràng
- **💰 Tính toán tự động**: Cập nhật tổng tiền ngay lập tức khi áp dụng coupon
- **📋 Quản lý coupon**: Thêm, xóa và quản lý mã giảm giá từ admin panel

**Mã giảm giá có sẵn:**
```
Giảm theo phần trăm:
- SAVE10, WELCOME10, FIRST10 (10% off)
- SAVE15, VIP15 (15% off)  
- SAVE20, PREMIUM20 (20% off)

Giảm số tiền cố định:
- SAVE5, NEWBIE5 ($5 off)
- SAVE10FIXED, LOYAL10 ($10 off)
- SAVE15FIXED, PREMIUM15 ($15 off)
```

### 💳 Hệ thống thanh toán đa dạng
- **🚚 COD**: Thanh toán khi nhận hàng
- **🏦 Chuyển khoản ngân hàng**: Với thông tin tài khoản chi tiết
- **📱 QR Code**: Quét mã QR để thanh toán nhanh chóng
- **🔴 MoMo**: Tích hợp ví điện tử MoMo
- **💳 VNPay**: Cổng thanh toán VNPay
- **🟡 ZaloPay**: Ví điện tử ZaloPay

### 🔐 Xác thực và bảo mật
- **🔑 Đăng nhập bắt buộc**: Yêu cầu xác thực trước khi thanh toán
- **📝 Validation form**: Kiểm tra thông tin khách hàng đầy đủ
- **🛡️ Bảo vệ dữ liệu**: Lưu trữ an toàn với localStorage
- **✅ Demo account**: Email: `demo@easymart.vn`, Password: bất kỳ

### 🎛️ Panel quản trị
- **📦 Quản lý sản phẩm**: Thêm, sửa, xóa sản phẩm với upload hình ảnh
- **🗂️ Quản lý danh mục**: Tạo danh mục với icon FontAwesome và màu sắc
- **🎫 Quản lý coupon**: Tạo và quản lý mã giảm giá đa dạng
- **⚙️ Giao diện admin**: Panel quản trị trực quan và dễ sử dụng

## 🚀 Cài đặt và khởi chạy

### Yêu cầu hệ thống
- **Node.js**: >= 16.x
- **npm**: >= 8.x hoặc **yarn**: >= 1.x

### Bước 1: Clone và cài đặt
```bash
# Clone repository
git clone <repository-url>
cd EasyMart

# Cài đặt dependencies
npm install
```

### Bước 2: Khởi chạy development server
```bash
npm run dev
```
Ứng dụng sẽ chạy tại `http://localhost:5173`

### Bước 3: Build cho production
```bash
npm run build
```

### Bước 4: Preview production build
```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
EasyMart/
├── public/                   # Static assets
│   └── favicon.ico
├── src/
│   ├── components/           # Vue components
│   │   ├── common/          # Shared components
│   │   │   ├── NavBar.vue
│   │   │   ├── TopBar.vue
│   │   │   ├── Footer.vue
│   │   │   ├── SearchBox.vue
│   │   │   └── Notification.vue
│   │   ├── product/         # Product components
│   │   │   ├── ProductCard.vue
│   │   │   ├── ProductGrid.vue
│   │   │   ├── FlashSaleCard.vue
│   │   │   └── CategorySection.vue
│   │   ├── coupon/          # Coupon components
│   │   │   └── CouponCard.vue
│   │   ├── carousel/        # Carousel components
│   │   │   └── HeroCarousel.vue
│   │   └── admin/           # Admin components
│   │       ├── AdminPanel.vue
│   │       ├── ProductForm.vue
│   │       ├── CategoryForm.vue
│   │       └── CouponForm.vue
│   ├── views/               # Page components
│   │   ├── Home.vue
│   │   ├── Cart.vue
│   │   ├── Checkout.vue
│   │   ├── Login.vue
│   │   └── PaymentSuccess.vue
│   ├── router/              # Vue Router configuration
│   │   └── index.js
│   ├── store/               # State management
│   │   ├── index.js
│   │   └── modules/
│   │       ├── products.js
│   │       ├── categories.js
│   │       ├── coupons.js
│   │       ├── cart.js
│   │       ├── auth.js
│   │       └── notifications.js
│   ├── utils/               # Utility functions
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── styles/              # Global styles
│   │   └── main.css
│   ├── App.vue              # Root component
│   └── main.js              # Application entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies và scripts
└── README.md                # Documentation
```

## 🎯 Hướng dẫn sử dụng chi tiết

### 👤 Dành cho khách hàng

#### 1. Duyệt sản phẩm
- **Trang chủ**: Xem carousel khuyến mãi, flash sale và danh mục sản phẩm
- **Tìm kiếm**: Nhập từ khóa vào ô tìm kiếm để tìm sản phẩm nhanh chóng
- **Danh mục**: Click vào các danh mục để lọc sản phẩm theo loại

#### 2. Mua sắm
- **Thêm vào giỏ**: Click "Thêm vào giỏ" trên product card
- **Mua ngay**: Click "Mua ngay" để chuyển thẳng đến trang thanh toán
- **Xem giỏ hàng**: Click icon giỏ hàng (🛒) trên navigation bar

#### 3. Áp dụng mã giảm giá
- **Tại trang checkout**: Nhập mã coupon vào ô "Mã giảm giá"
- **Validation**: Hệ thống sẽ kiểm tra và hiển thị kết quả ngay lập tức
- **Áp dụng**: Click "Áp dụng" để sử dụng mã giảm giá
- **Xóa coupon**: Click "Xóa" để hủy áp dụng mã giảm giá

#### 4. Quy trình thanh toán
1. **Đăng nhập**: Bắt buộc đăng nhập trước khi thanh toán
2. **Thông tin giao hàng**: Điền đầy đủ họ tên, SĐT, địa chỉ
3. **Chọn phương thức**: Lựa chọn 1 trong 6 phương thức thanh toán
4. **Xác nhận**: Kiểm tra thông tin và đặt hàng
5. **Thành công**: Nhận mã đơn hàng và thông tin chi tiết

### 👨‍💼 Dành cho quản trị viên

#### 1. Mở Admin Panel
- Click biểu tượng cài đặt (⚙️) ở góc dưới bên trái màn hình
- Panel sẽ mở ra với 3 tab chính

#### 2. Quản lý sản phẩm
- **Tab "Sản Phẩm"**: Xem danh sách và thêm sản phẩm mới
- **Thêm sản phẩm**: Điền tên, giá, chọn danh mục, upload hình ảnh
- **Flash Sale**: Đánh dấu checkbox để thêm vào flash sale
- **Xóa sản phẩm**: Click nút "Xóa" bên cạnh sản phẩm

#### 3. Quản lý danh mục
- **Tab "Danh Mục"**: Xem và quản lý các danh mục
- **Thêm danh mục**: Nhập tên, chọn icon FontAwesome, chọn màu
- **Xóa danh mục**: Click nút "Xóa" (lưu ý: sẽ ảnh hưởng đến sản phẩm)

#### 4. Quản lý mã giảm giá
- **Tab "Khuyến Mãi"**: Xem danh sách coupon hiện có
- **Thêm coupon**: Nhập mã, mô tả, chọn loại (% hoặc $), nhập giá trị
- **Xóa coupon**: Click nút "Xóa" để gỡ bỏ mã giảm giá

## 🛠️ Công nghệ sử dụng

### Frontend Framework
- **Vue.js 3**: Progressive JavaScript framework với Composition API
- **Vue Router 4**: Official router cho Vue.js applications
- **Bootstrap 5**: CSS framework cho responsive design
- **FontAwesome**: Icon library với hơn 7000+ icons

### Build Tools
- **Vite**: Next generation frontend tooling
- **@vitejs/plugin-vue**: Official Vue plugin cho Vite

### Development Tools
- **ES6+**: Modern JavaScript features
- **CSS3**: Advanced styling với custom properties
- **LocalStorage**: Client-side data persistence
- **Responsive Design**: Mobile-first approach

## 🎨 Thiết kế và UX/UI

### Color Palette
```css
Primary Colors:
- Primary: #16a085 (Teal)
- Success: #27ae60 (Green)
- Danger: #e74c3c (Red)
- Warning: #f39c12 (Orange)
- Info: #3498db (Blue)

Background:
- Gradient: #FDFFFE → #ECFAE4
- Card Background: rgba(255, 255, 255, 0.9)
- Overlay: rgba(0, 0, 0, 0.5)
```

### Typography
- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Font Sizes**: Responsive scaling từ 0.875rem đến 2.5rem
- **Font Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

### Component Design
- **Border Radius**: 8px - 25px tùy theo component
- **Shadows**: Soft shadows với multiple layers
- **Transitions**: 0.3s ease-out cho smooth animations
- **Hover Effects**: Transform translateY(-2px) và scale(1.02)

### Responsive Breakpoints
- **Mobile**: < 576px
- **Tablet**: 576px - 768px  
- **Desktop**: 768px - 992px
- **Large Desktop**: > 992px

## 📊 Tính năng nâng cao

### 🔄 State Management
- **Centralized Store**: Quản lý state toàn ứng dụng
- **Modular Architecture**: Chia store thành các modules riêng biệt
- **Persistent Data**: Tự động lưu và khôi phục dữ liệu từ localStorage
- **Reactive Updates**: Cập nhật UI tự động khi state thay đổi

### ⚡ Performance Optimization
- **Lazy Loading**: Load components khi cần thiết
- **Image Optimization**: Responsive images với lazy loading
- **Bundle Splitting**: Chia code thành chunks nhỏ
- **CSS Optimization**: Minimize và optimize CSS output

### 🔒 Security Features
- **XSS Protection**: Vue.js built-in template escaping
- **Input Validation**: Client-side validation cho tất cả forms
- **Safe Data Handling**: Không lưu thông tin nhạy cảm
- **HTTPS Ready**: Sẵn sàng deploy với HTTPS

## 🚀 Deployment

### Build Production
```bash
# Build optimized production bundle
npm run build

# Output sẽ được tạo trong thư mục dist/
```

### Deploy to Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on git push

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### Deploy to GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

## 🧪 Testing và Quality Assurance

### Recommended Testing Setup
```bash
# Unit Testing với Vitest
npm install --save-dev vitest @vue/test-utils

# E2E Testing với Cypress
npm install --save-dev cypress

# Code Coverage
npm install --save-dev @vitest/coverage-c8
```

### Code Quality Tools
```bash
# ESLint cho code linting
npm install --save-dev eslint @vue/eslint-config-recommended

# Prettier cho code formatting
npm install --save-dev prettier @vue/eslint-config-prettier
```

## 🔧 Customization

### Thay đổi theme colors
Chỉnh sửa CSS custom properties trong `src/styles/main.css`:
```css
:root {
  --primary-color: #your-primary-color;
  --success-color: #your-success-color;
  /* ... other colors */
}
```

### Thêm sản phẩm mặc định
Chỉnh sửa `src/utils/constants.js`:
```javascript
export const getDefaultProducts = () => [
  {
    id: Date.now(),
    name: 'Sản phẩm mới',
    price: 100000,
    category: 'electronics',
    image: 'path/to/image.jpg',
    isFlashSale: false
  }
  // ... existing products
]
```

### Thêm coupon mới
```javascript
export const getDefaultCoupons = () => [
  {
    id: Date.now(),
    code: 'NEWCODE',
    description: 'Mô tả coupon mới',
    discountType: 'percentage', // hoặc 'fixed'
    discountValue: 25
  }
  // ... existing coupons
]
```

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. Vite server không khởi động
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 2. Build production lỗi
```bash
# Kiểm tra Node.js version
node --version  # Should be >= 16

# Update dependencies
npm update
```

#### 3. LocalStorage không hoạt động
- Kiểm tra browser có hỗ trợ localStorage
- Clear browser cache và cookies
- Kiểm tra storage quota: `navigator.storage.estimate()`

#### 4. CSS không load đúng
- Kiểm tra import order trong `main.js`
- Clear browser cache
- Kiểm tra console có lỗi CSS không

### Debug Tips
- Sử dụng Vue DevTools browser extension
- Check console logs cho errors
- Sử dụng Network tab để debug API calls
- Test trên multiple browsers và devices

## 📈 Roadmap

### Version 1.1 (Sắp tới)
- [ ] **User Profiles**: Quản lý thông tin cá nhân
- [ ] **Order History**: Lịch sử đơn hàng chi tiết
- [ ] **Wishlist**: Danh sách yêu thích
- [ ] **Product Reviews**: Đánh giá và nhận xét sản phẩm

### Version 1.2 (Q2 2024)
- [ ] **Real Payment Integration**: Tích hợp thanh toán thật
- [ ] **Email Notifications**: Thông báo qua email
- [ ] **Advanced Search**: Tìm kiếm nâng cao với filters
- [ ] **Multi-language**: Hỗ trợ đa ngôn ngữ

### Version 2.0 (Q3 2024)
- [ ] **PWA Support**: Progressive Web App
- [ ] **Offline Mode**: Hoạt động offline
- [ ] **Push Notifications**: Thông báo đẩy
- [ ] **Admin Dashboard**: Dashboard quản trị nâng cao

## 🤝 Contributing

### Quy tắc đóng góp
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### Code Style Guidelines
- Sử dụng ESLint configuration
- Follow Vue.js Style Guide
- Write descriptive commit messages
- Add comments cho complex logic

## 📞 Hỗ trợ

### Liên hệ
- **Email**: support@easymart.vn
- **Hotline**: 1900 1234
- **Website**: [www.easymart.vn](https://www.easymart.vn)

### Báo lỗi
- **GitHub Issues**: [Create Issue](https://github.com/easymart/issues)
- **Bug Report Template**: Sử dụng template có sẵn
- **Feature Request**: Đề xuất tính năng mới

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🙏 Acknowledgments

- **Vue.js Team**: Cho framework tuyệt vời
- **Bootstrap Team**: Cho CSS framework
- **FontAwesome**: Cho icon library
- **Community**: Cho feedback và contributions

---

<div align="center">

**🛒 EasyMart - Mua sắm dễ dàng, trải nghiệm tuyệt vời! ✨**

Made with ❤️ by EasyMart Team

</div>"# Easymart" 
