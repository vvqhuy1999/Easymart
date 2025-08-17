<template>
  <Teleport to="body">
    <Transition
      name="notification"
      enter-active-class="animate__animated animate__slideInRight animate__faster"
      leave-active-class="animate__animated animate__slideOutRight animate__faster"
    >
      <div 
        class="position-fixed top-0 end-0 m-3 shadow-lg rounded-3 border-0 notification-alert d-flex align-items-center"
        :class="`alert-${type}`"
        style="z-index: 9999; min-width: 350px; max-width: 450px; backdrop-filter: blur(10px);"
        role="alert"
      >
        <div class="d-flex align-items-center justify-content-center rounded-circle me-3 bg-white bg-opacity-20" style="width: 40px; height: 40px;">
          <i :class="`${getIcon} fs-5`"></i>
        </div>
        <div class="flex-grow-1">
          <div class="fw-medium lh-sm">{{ message }}</div>
          <div v-if="showProgress" class="mt-2 rounded-pill overflow-hidden bg-white bg-opacity-30" style="height: 3px;">
            <div 
              class="h-100 bg-white bg-opacity-80 rounded-pill"
              style="transition: width 0.05s linear;"
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
        </div>
        <button 
          type="button" 
          class="btn-close ms-3 opacity-75 hover-scale" 
          @click="handleClose"
          aria-label="Đóng"
        ></button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

// Props
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'warning', 'danger', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 4000
  },
  showProgress: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['close'])

// Reactive data
const progressWidth = ref(100)
let progressTimer = null
let closeTimer = null

// Computed
const getIcon = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-times-circle',
    info: 'fas fa-info-circle'
  }
  return icons[props.type] || icons.success
})

// Methods
const handleClose = () => {
  clearTimers()
  emit('close')
}

const clearTimers = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const startProgress = () => {
  if (!props.showProgress) return
  
  const step = 100 / (props.duration / 50)
  progressTimer = setInterval(() => {
    progressWidth.value = Math.max(0, progressWidth.value - step)
  }, 50)
}

// Lifecycle
onMounted(() => {
  startProgress()
  
  closeTimer = setTimeout(() => {
    handleClose()
  }, props.duration)
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
/* Minimal custom CSS - chỉ giữ những gì Bootstrap không thể thay thế */
.notification-alert {
  transition: all 0.3s ease;
}

.notification-alert:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
}

.hover-scale {
  transition: all 0.2s ease;
}

.hover-scale:hover {
  opacity: 1 !important;
  transform: scale(1.1);
}

/* Type-specific gradient backgrounds - chỉ áp dụng cho notification component */
.notification-alert.alert-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.notification-alert.alert-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.notification-alert.alert-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.notification-alert.alert-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-alert {
    top: 10px !important;
    right: 10px !important;
    left: 10px !important;
    min-width: unset !important;
    max-width: unset !important;
    margin: 0 !important;
  }
}
</style>