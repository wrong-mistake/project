<script setup>
import { ref } from 'vue'
import { register } from './auth.js'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const error = ref('')
const isLoading = ref(false)

const emit = defineEmits(['register-success', 'cancel'])

function handleRegister() {
  // 重置错误信息
  error.value = ''
  
  // 简单的表单验证
  if (!username.value.trim()) {
    error.value = '请输入用户名'
    return
  }
  
  if (!password.value.trim()) {
    error.value = '请输入密码'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  if (!email.value.trim()) {
    error.value = '请输入邮箱'
    return
  }
  
  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = '请输入有效的邮箱地址'
  }
  
  isLoading.value = true
  
  try {
    // 调用注册函数
    const user = register(username.value, password.value, email.value)
    
    // 注册成功，通知父组件
    emit('register-success', user)
    
    // 重置表单
    username.value = ''
    password.value = ''
    confirmPassword.value = ''
    email.value = ''
  } catch (err) {
    // 显示错误信息
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">用户注册</h2>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="register-username" class="form-label">用户名</label>
          <input
            id="register-username"
            v-model="username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="register-email" class="form-label">邮箱</label>
          <input
            id="register-email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="请输入邮箱"
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="register-password" class="form-label">密码</label>
          <input
            id="register-password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="register-confirm-password" class="form-label">确认密码</label>
          <input
            id="register-confirm-password"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入密码"
            :disabled="isLoading"
          />
        </div>
        
        <!-- 错误信息 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            class="cancel-button"
            @click="handleCancel"
            :disabled="isLoading"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="auth-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading">注册中...</span>
            <span v-else>注册</span>
          </button>
        </div>
      </form>
    </div>
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.auth-button {
  flex: 1;
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

.cancel-button {
  flex: 1;
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.cancel-button:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>