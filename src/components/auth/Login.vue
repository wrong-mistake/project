<script setup>
import { ref } from 'vue'
import { login } from './auth.js'
import Register from './Register.vue'

const showRegister = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const emit = defineEmits(['login-success'])

function handleLogin() {
  // 重置错误信息
  error.value = ''
  
  // 简单的表单验证
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请输入用户名和密码'
    return
  }
  
  isLoading.value = true
  
  try {
    // 调用登录函数
    const user = login(username.value, password.value)
    
    // 登录成功，通知父组件
    emit('login-success', user)
    
    // 重置表单
    username.value = ''
    password.value = ''
  } catch (err) {
    // 显示错误信息
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

function toggleRegister() {
  showRegister.value = !showRegister.value
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">用户登录</h2>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            :disabled="isLoading"
          />
        </div>
        
        <!-- 错误信息 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button 
          type="submit" 
          class="auth-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <p>还没有账号？
          <button 
            type="button" 
            class="link-button"
            @click="toggleRegister"
            :disabled="isLoading"
          >
            立即注册
          </button>
        </p>
      </div>
    </div>
    
    <!-- 注册组件 -->
    <Register 
      v-if="showRegister" 
      @register-success="toggleRegister"
      @cancel="toggleRegister"
    />
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1rem;
}

.auth-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.auth-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.auth-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.link-button {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  text-decoration: underline;
}

.link-button:hover:not(:disabled) {
  color: #2563eb;
}

.link-button:disabled {
  color: #94a3b8;
  cursor: not-allowed;
  text-decoration: none;
}
</style>