<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fab fa-google text-danger me-2" v-if="provider === 'google'"></i>
            <i class="fab fa-facebook text-primary me-2" v-if="provider === 'facebook'"></i>
            Xác nhận {{ isNewUser ? 'đăng ký' : 'đăng nhập' }}
          </h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          <div class="text-center mb-4">
            <img :src="userInfo.avatar" class="rounded-circle" width="80" height="80" alt="Avatar">
          </div>
          
          <div class="alert" :class="isNewUser ? 'alert-warning' : 'alert-info'">
            <i :class="isNewUser ? 'fas fa-user-plus' : 'fas fa-sign-in-alt'" class="me-2"></i>
            <strong>{{ isNewUser ? 'Đăng ký tài khoản mới' : 'Đăng nhập vào tài khoản hiện có' }}</strong>
          </div>
          
          <div class="row mb-3">
            <div class="col-4 text-muted">Tên:</div>
            <div class="col-8">{{ userInfo.name }}</div>
          </div>
          <div class="row mb-3">
            <div class="col-4 text-muted">Email:</div>
            <div class="col-8">{{ userInfo.email }}</div>
          </div>
          
          <div v-if="isNewUser" class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            Bằng cách tiếp tục, bạn đồng ý với <a href="#" class="alert-link">điều khoản sử dụng</a> của EasyMart.
          </div>
          
          <div v-else class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            Tài khoản đã tồn tại. Bạn sẽ được đăng nhập ngay.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            Hủy
          </button>
          <button type="button" class="btn btn-primary" @click="handleConfirm" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'Đang xử lý...' : (isNewUser ? 'Xác nhận đăng ký' : 'Xác nhận đăng nhập') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    default: () => ({})
  },
  provider: {
    type: String,
    default: 'google'
  },
  isNewUser: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const isLoading = ref(false)

const handleConfirm = () => {
  isLoading.value = true
  emit('confirm', {
    userInfo: props.userInfo,
    isNewUser: props.isNewUser,
    provider: props.provider
  })
}

const handleCancel = () => {
  emit('cancel')
}

// Reset loading when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    isLoading.value = false
  }
})
</script>

<style scoped>
.modal.show {
  display: block !important;
}

.modal-dialog {
  max-width: 500px;
}
</style>
