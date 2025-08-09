<template>
  <div class="auth-tester">
    <div class="card">
      <div class="card-header">
        <h5><i class="fas fa-flask me-2"></i>Auth API Tester</h5>
      </div>
      <div class="card-body">
        <!-- Test Registration -->
        <div class="row mb-4">
          <div class="col-12">
            <h6><i class="fas fa-user-plus text-success me-2"></i>Test Registration</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <input v-model="testData.name" type="text" class="form-control" placeholder="Tên">
              </div>
              <div class="col-md-6">
                <input v-model="testData.email" type="email" class="form-control" placeholder="Email">
              </div>
              <div class="col-md-6">
                <input v-model="testData.phone" type="text" class="form-control" placeholder="Số điện thoại (tùy chọn)">
              </div>
              <div class="col-md-6">
                <input v-model="testData.password" type="password" class="form-control" placeholder="Mật khẩu">
              </div>
              <div class="col-12">
                <button @click="testRegistration" :disabled="loading" class="btn btn-success me-2">
                  <i class="fas fa-user-plus me-2"></i>Test Register
                </button>
                <button @click="testEmailCheck" :disabled="loading" class="btn btn-outline-info">
                  <i class="fas fa-envelope-check me-2"></i>Check Email
                </button>
              </div>
            </div>
          </div>
        </div>

        <hr>

        <!-- Test Login -->
        <div class="row mb-4">
          <div class="col-12">
            <h6><i class="fas fa-sign-in-alt text-primary me-2"></i>Test Login</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <input v-model="loginData.email" type="email" class="form-control" placeholder="Email">
              </div>
              <div class="col-md-6">
                <input v-model="loginData.password" type="password" class="form-control" placeholder="Mật khẩu">
              </div>
              <div class="col-12">
                <button @click="testLogin" :disabled="loading" class="btn btn-primary me-2">
                  <i class="fas fa-sign-in-alt me-2"></i>Test Login
                </button>
                <button @click="testAuthStatus" :disabled="loading" class="btn btn-outline-primary">
                  <i class="fas fa-shield-alt me-2"></i>Check Auth Status
                </button>
              </div>
            </div>
          </div>
        </div>

        <hr>

        <!-- Test User APIs -->
        <div class="row mb-4">
          <div class="col-12">
            <h6><i class="fas fa-user text-info me-2"></i>Test User APIs</h6>
            <div class="row g-3">
              <div class="col-md-8">
                <input v-model="userTestEmail" type="email" class="form-control" placeholder="Email để test">
              </div>
              <div class="col-md-4">
                <button @click="testGetUserByEmail" :disabled="loading" class="btn btn-info">
                  <i class="fas fa-search me-2"></i>Get User
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="text-center mb-3">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Testing...</span>
          </div>
        </div>

        <!-- Results -->
        <div v-if="results.length > 0" class="mt-4">
          <h6><i class="fas fa-clipboard-list me-2"></i>Test Results</h6>
          <div class="results-container" style="max-height: 400px; overflow-y: auto;">
            <div v-for="(result, index) in results" :key="index" 
                 class="alert" 
                 :class="result.success ? 'alert-success' : 'alert-danger'">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{{ result.action }}</strong><br>
                  <small class="text-muted">{{ result.timestamp }}</small>
                </div>
                <span class="badge" :class="result.success ? 'bg-success' : 'bg-danger'">
                  {{ result.success ? 'SUCCESS' : 'ERROR' }}
                </span>
              </div>
              <pre class="mt-2 mb-0"><code>{{ JSON.stringify(result.data, null, 2) }}</code></pre>
            </div>
          </div>
          <button @click="clearResults" class="btn btn-outline-secondary btn-sm mt-2">
            <i class="fas fa-trash me-2"></i>Clear Results
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

// Composables
const { 
  register, 
  login, 
  checkUserEmailExists, 
  getUserByEmail, 
  checkAuthStatus 
} = useAuth()

// Local state
const loading = ref(false)
const results = ref([])

// Test data
const testData = ref({
  name: 'Test User',
  email: 'test@example.com',
  phone: '', // Optional now
  password: 'password123'
})

const loginData = ref({
  email: 'demo@easymart.vn',
  password: 'demo123'
})

const userTestEmail = ref('demo@easymart.vn')

// Helper function to add result
const addResult = (action, success, data) => {
  results.value.unshift({
    action,
    success,
    data,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // Keep only last 10 results
  if (results.value.length > 10) {
    results.value = results.value.slice(0, 10)
  }
}

// Test functions
const testRegistration = async () => {
  loading.value = true
  try {
    const result = await register(
      testData.value.name,
      testData.value.email,
      testData.value.phone,
      testData.value.password,
      testData.value.password
    )
    addResult('Register', result.success, result)
  } catch (error) {
    addResult('Register', false, { error: error.message })
  } finally {
    loading.value = false
  }
}

const testLogin = async () => {
  loading.value = true
  try {
    const result = await login(loginData.value.email, loginData.value.password)
    addResult('Login', result.success, result)
  } catch (error) {
    addResult('Login', false, { error: error.message })
  } finally {
    loading.value = false
  }
}

const testEmailCheck = async () => {
  loading.value = true
  try {
    const result = await checkUserEmailExists(testData.value.email)
    addResult('Check Email Exists', result.success, result)
  } catch (error) {
    addResult('Check Email Exists', false, { error: error.message })
  } finally {
    loading.value = false
  }
}

const testGetUserByEmail = async () => {
  loading.value = true
  try {
    const result = await getUserByEmail(userTestEmail.value)
    addResult('Get User by Email', result.success, result)
  } catch (error) {
    addResult('Get User by Email', false, { error: error.message })
  } finally {
    loading.value = false
  }
}

const testAuthStatus = async () => {
  loading.value = true
  try {
    const result = await checkAuthStatus()
    addResult('Check Auth Status', result.success, result)
  } catch (error) {
    addResult('Check Auth Status', false, { error: error.message })
  } finally {
    loading.value = false
  }
}

const clearResults = () => {
  results.value = []
}
</script>

<style scoped>
.auth-tester {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.card-header {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-radius: 10px 10px 0 0;
}

pre {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 0.5rem;
  font-size: 0.8rem;
  max-height: 200px;
  overflow-y: auto;
}

.results-container {
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.7rem;
}
</style>
