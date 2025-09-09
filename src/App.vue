<script setup>
import { ref, onMounted } from 'vue'
import Editor from './components/Editor.vue'
import DocumentList from './components/DocumentList.vue'
import Login from './components/auth/Login.vue'
import { 
  isAuthenticated, 
  getCurrentUser, 
  logout,
  getUserDocuments,
  saveUserDocuments,
  createUserDocument,
  updateUserDocument,
  deleteUserDocument
} from './components/auth/auth.js'

// 用户状态
const currentUser = ref(null)
const showLogin = ref(true)

// 文档数据
const documents = ref([])
const activeDocument = ref(null)

// 初始化时检查用户登录状态
onMounted(() => {
  checkAuthStatus()
})

// 检查用户认证状态
function checkAuthStatus() {
  if (isAuthenticated()) {
    currentUser.value = getCurrentUser()
    showLogin.value = false
    // 加载当前用户的文档
    loadUserDocuments()
  } else {
    currentUser.value = null
    showLogin.value = true
    documents.value = []
    activeDocument.value = null
  }
}

// 处理登录成功
function handleLoginSuccess(user) {
  currentUser.value = user
  showLogin.value = false
  // 加载当前用户的文档
  loadUserDocuments()
}

// 用户登出
function handleLogout() {
  logout()
  currentUser.value = null
  showLogin.value = true
  documents.value = []
  activeDocument.value = null
}

// 加载用户的文档
function loadUserDocuments() {
  if (currentUser.value) {
    documents.value = getUserDocuments(currentUser.value.id)
    // 初始化时自动选择第一个文档
    if (documents.value.length > 0) {
      activeDocument.value = documents.value[0]
    } else {
      activeDocument.value = null
    }
  }
}

// 创建新文档
function createDocument() {
  if (currentUser.value) {
    const newDoc = createUserDocument(currentUser.value.id, '未命名文档', '')
    if (newDoc) {
      // 重新加载用户文档，确保数据同步
      loadUserDocuments()
      // 选择新创建的文档
      activeDocument.value = documents.value.find(d => d.id === newDoc.id)
    }
  }
}

// 选择文档
function selectDocument(doc) {
  activeDocument.value = doc
}

// 更新文档内容
function updateDocumentContent(docId, newContent) {
  if (currentUser.value) {
    const updatedDoc = updateUserDocument(currentUser.value.id, docId, { content: newContent })
    if (updatedDoc) {
      // 重新加载用户文档，确保数据同步
      loadUserDocuments()
      // 保持当前活动文档选择
      activeDocument.value = documents.value.find(d => d.id === docId)
    }
  }
}

// 重命名文档
function renameDocument(docId, newTitle) {
  if (currentUser.value) {
    const updatedDoc = updateUserDocument(currentUser.value.id, docId, { title: newTitle })
    if (updatedDoc) {
      // 重新加载用户文档，确保数据同步
      loadUserDocuments()
      // 保持当前活动文档选择
      activeDocument.value = documents.value.find(d => d.id === docId)
      console.log(`文档 ${docId} 已重命名为: ${newTitle}`)
    }
  }
}

// 删除文档
function deleteDocument(docId) {
  if (currentUser.value) {
    const success = deleteUserDocument(currentUser.value.id, docId)
    if (success) {
      // 重新加载用户文档，确保数据同步
      loadUserDocuments()
      console.log(`文档 ${docId} 已删除`)
    }
  }
}
</script>

<template>
  <div class="app">
    <!-- 用户登录界面 -->
    <Login 
      v-if="showLogin" 
      @login-success="handleLoginSuccess"
    />
    
    <!-- 文档管理界面 -->
    <div v-else class="main-container">
      <!-- 应用头部 -->
      <header class="app-header">
        <div class="header-left">
          <h1>实时协作文档平台</h1>
        </div>
        <div class="header-right">
          <span class="user-info">欢迎，{{ currentUser?.username }}</span>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </header>
      
      <!-- 主内容区域 -->
      <div class="app-container">
        <aside class="sidebar">
          <div class="sidebar-header">
            <button @click="createDocument" class="create-btn">
              <i class="fa fa-plus"></i> 新建文档
            </button>
          </div>
          <DocumentList 
            :documents="documents" 
            :activeDocument="activeDocument"
            @select="selectDocument"
            @rename="renameDocument"
            @delete="deleteDocument"
          />
        </aside>
        
        <main class="editor-container">
          <Editor 
            v-if="activeDocument"
            :document="activeDocument"
            @update="updateDocumentContent"
          />
          <div v-else class="empty-state">
            <p>请选择或创建一个文档开始编辑</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8fafc;
}

.main-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #1e40af;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.875rem;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #dc2626;
}

.app-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.create-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #2563eb;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  font-size: 1rem;
}
</style>