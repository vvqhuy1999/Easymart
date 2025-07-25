    <!-- Account Dropdown -->
    <ul 
      class="dropdown-menu dropdown-menu-end account-dropdown" 
      :class="{ show: showAccountDropdown }" 
      style="position: fixed !important; z-index: 2147483647 !important;"
      v-if="showAccountDropdown"
    >
      <!-- Show user info if logged in -->
      <li v-if="isLoggedIn" class="px-3 py-2 border-bottom">
        <div class="d-flex align-items-center">
          <img :src="user.avatar" class="rounded-circle me-2" width="32" height="32" :alt="user.name">
          <div>
            <div class="fw-semibold">{{ user.name }}</div>
            <small class="text-muted">{{ user.email }}</small>
          </div>
        </div>
      </li>
      
      <!-- User menu items when logged in -->
      <template v-if="isLoggedIn">
        <li><router-link to="/profile" class="dropdown-item rounded-2 mx-2 my-1" @click="showAccountDropdown = false"><i class="fas fa-user text-primary me-3"></i>Thông tin cá nhân</router-link></li>
        <li><a class="dropdown-item rounded-2 mx-2 my-1" href="#"><i class="fas fa-shopping-bag text-primary me-3"></i>Đơn hàng của tôi</a></li>
        <li><a class="dropdown-item rounded-2 mx-2 my-1" href="#"><i class="fas fa-heart text-primary me-3"></i>Sản phẩm yêu thích</a></li>
        <li><hr class="dropdown-divider mx-2"></li>
        <li><a class="dropdown-item rounded-2 mx-2 my-1" href="#" @click="handleLogout"><i class="fas fa-sign-out-alt text-danger me-3"></i>Đăng xuất</a></li>
      </template>
      
      <!-- Login/Register when not logged in -->
      <template v-else>
        <li><router-link to="/login" class="dropdown-item rounded-2 mx-2 my-1" @click="showAccountDropdown = false"><i class="fas fa-sign-in-alt text-primary me-3"></i>Đăng nhập</router-link></li>
        <li><router-link to="/register" class="dropdown-item rounded-2 mx-2 my-1" @click="showAccountDropdown = false"><i class="fas fa-user-plus text-primary me-3"></i>Đăng ký</router-link></li>
      </template>
    </ul>