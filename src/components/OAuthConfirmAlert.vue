<template>
  <div v-if="show" class="alert alert-info alert-dismissible fade show" role="alert">
    <div class="d-flex align-items-center">
      <i class="fab fa-google text-danger me-3" v-if="provider === 'google'" style="font-size: 1.5rem;"></i>
      <i class="fab fa-facebook text-primary me-3" v-if="provider === 'facebook'" style="font-size: 1.5rem;"></i>
      <div class="flex-grow-1">
        <h6 class="alert-heading mb-1">Xác nhận đăng ký tài khoản</h6>
        <p class="mb-2">
          Bạn đang đăng ký tài khoản mới với <strong>{{ userInfo.email }}</strong>.
          Bằng cách tiếp tục, bạn đồng ý với điều khoản sử dụng của EasyMart.
        </p>
        <div class="d-flex gap-2">
          <button @click="handleConfirm" class="btn btn-primary btn-sm" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận đăng ký' }}
          </button>
          <button @click="handleCancel" class="btn btn-outline-secondary btn-sm" :disabled="isLoading">
            Hủy
          </button>
        </div>
      </div>
    </div>
    <button type="button" class="btn-close" @click="handleCancel" :disabled="isLoading"></button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const isLoading = ref(false)

const handleConfirm = () => {
  isLoading.value = true
  emit('confirm', props.userInfo)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.alert {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.alert-heading {
  font-weight: 600;
}
</style>
