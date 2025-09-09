// 用户认证模块

// 模拟的用户数据库
let users = JSON.parse(localStorage.getItem('users')) || [
  // 默认用户，方便测试
  { 
    id: 1, 
    username: 'admin', 
    password: 'admin123', 
    email: 'admin@example.com',
    documents: [
      { id: 1, title: '协作文档示例', content: '欢迎使用实时协作文档平台！\n在这里，你可以与团队成员实时编辑同一个文档。' },
      { id: 2, title: '项目计划', content: '## 项目计划\n- 需求分析\n- 设计阶段\n- 开发实现\n- 测试部署' }
    ]
  }
]

// 当前登录的用户
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null

// 保存用户数据到本地存储
function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users))
}

// 保存当前用户到本地存储
function saveCurrentUser() {
  localStorage.setItem('currentUser', JSON.stringify(currentUser))
}

// 注册新用户
export function register(username, password, email) {
  // 检查用户名是否已存在
  const existingUser = users.find(user => user.username === username)
  if (existingUser) {
    throw new Error('用户名已存在')
  }
  
  // 创建新用户，包含空的文档数组
  const newUser = {
    id: Date.now(),
    username,
    password, // 注意：在实际应用中应该对密码进行加密
    email,
    documents: []
  }
  
  // 添加到用户列表
  users.push(newUser)
  saveUsers()
  
  return newUser
}

// 用户登录
export function login(username, password) {
  // 查找用户
  const user = users.find(user => 
    user.username === username && user.password === password
  )
  
  if (!user) {
    throw new Error('用户名或密码错误')
  }
  
  // 设置当前用户
  currentUser = {
    id: user.id,
    username: user.username,
    email: user.email
  }
  saveCurrentUser()
  
  return currentUser
}

// 用户登出
export function logout() {
  currentUser = null
  saveCurrentUser()
}

// 获取当前登录的用户
export function getCurrentUser() {
  return currentUser
}

// 检查用户是否已登录
export function isAuthenticated() {
  return currentUser !== null
}

// 获取用户的文档
export function getUserDocuments(userId) {
  const user = users.find(user => user.id === userId)
  if (user && user.documents) {
    return user.documents
  }
  return []
}

// 保存用户的文档
export function saveUserDocuments(userId, documents) {
  const user = users.find(user => user.id === userId)
  if (user) {
    user.documents = documents
    saveUsers()
    return true
  }
  return false
}

// 创建新文档
export function createUserDocument(userId, title, content = '') {
  const user = users.find(user => user.id === userId)
  if (user) {
    const newDoc = {
      id: Date.now(),
      title,
      content
    }
    if (!user.documents) {
      user.documents = []
    }
    user.documents.push(newDoc)
    saveUsers()
    return newDoc
  }
  return null
}

// 更新用户的文档
export function updateUserDocument(userId, docId, updates) {
  const user = users.find(user => user.id === userId)
  if (user && user.documents) {
    const docIndex = user.documents.findIndex(doc => doc.id === docId)
    if (docIndex !== -1) {
      user.documents[docIndex] = { ...user.documents[docIndex], ...updates }
      saveUsers()
      return user.documents[docIndex]
    }
  }
  return null
}

// 删除用户的文档
export function deleteUserDocument(userId, docId) {
  const user = users.find(user => user.id === userId)
  if (user && user.documents) {
    const initialLength = user.documents.length
    user.documents = user.documents.filter(doc => doc.id !== docId)
    
    if (user.documents.length !== initialLength) {
      saveUsers()
      return true
    }
  }
  return false
}

// 清除所有用户数据（用于测试）
export function clearAllData() {
  users = []
  currentUser = null
  localStorage.removeItem('users')
  localStorage.removeItem('currentUser')
}