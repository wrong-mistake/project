// 模拟WebSocket服务，用于演示实时协作功能

class MockWebSocketServer {
  constructor() {
    this.clients = new Map()
    this.documents = new Map()
    this.nextClientId = 1
  }

  // 模拟客户端连接
  connect() {
    const clientId = this.nextClientId++
    const color = this.getRandomColor()
    const username = `用户${clientId}`
    
    this.clients.set(clientId, {
      id: clientId,
      username,
      color,
      connected: true
    })
    
    console.log(`用户 ${username} (ID: ${clientId}) 已连接`)
    
    // 返回模拟的WebSocket对象
    return {
      id: clientId,
      username,
      color,
      on: (event, callback) => this.handleEvent(clientId, event, callback),
      send: (data) => this.handleSend(clientId, data),
      close: () => this.disconnect(clientId)
    }
  }

  // 处理客户端事件
  handleEvent(clientId, event, callback) {
    if (event === 'message') {
      // 模拟消息接收
      this.clients.get(clientId).messageCallback = callback
    }
  }

  // 处理客户端发送消息
  handleSend(clientId, data) {
    const message = JSON.parse(data)
    const client = this.clients.get(clientId)
    
    switch (message.type) {
      case 'join-document':
        this.handleJoinDocument(clientId, message.documentId)
        break
      case 'document-update':
        this.handleDocumentUpdate(clientId, message.documentId, message.content)
        break
      default:
        console.log(`未知消息类型: ${message.type}`)
    }
  }

  // 处理加入文档
  handleJoinDocument(clientId, documentId) {
    const client = this.clients.get(clientId)
    
    // 如果文档不存在，创建一个空文档
    if (!this.documents.has(documentId)) {
      this.documents.set(documentId, {
        id: documentId,
        content: '',
        users: new Set()
      })
    }
    
    const document = this.documents.get(documentId)
    document.users.add(clientId)
    
    console.log(`用户 ${client.username} 加入文档 ${documentId}`)
    
    // 向客户端发送当前文档内容和用户列表
    if (client.messageCallback) {
      client.messageCallback({
        data: JSON.stringify({
          type: 'document-content',
          content: document.content,
          users: Array.from(document.users).map(id => this.clients.get(id))
        })
      })
    }
    
    // 通知其他用户有新用户加入
    this.notifyUsersInDocument(documentId, clientId, {
      type: 'user-joined',
      user: {
        id: client.id,
        username: client.username,
        color: client.color
      }
    })
  }

  // 处理文档更新
  handleDocumentUpdate(clientId, documentId, content) {
    const document = this.documents.get(documentId)
    if (!document) return
    
    // 更新文档内容
    document.content = content
    
    // 向其他用户广播更新
    this.notifyUsersInDocument(documentId, clientId, {
      type: 'document-update',
      content: content,
      updatedBy: this.clients.get(clientId).username
    })
  }

  // 通知文档中的其他用户
  notifyUsersInDocument(documentId, excludeClientId, message) {
    const document = this.documents.get(documentId)
    if (!document) return
    
    document.users.forEach(clientId => {
      if (clientId !== excludeClientId) {
        const client = this.clients.get(clientId)
        if (client && client.connected && client.messageCallback) {
          client.messageCallback({
            data: JSON.stringify(message)
          })
        }
      }
    })
  }

  // 处理客户端断开连接
  disconnect(clientId) {
    const client = this.clients.get(clientId)
    if (!client) return
    
    console.log(`用户 ${client.username} (ID: ${clientId}) 已断开连接`)
    
    // 移除用户所有文档中的连接
    this.documents.forEach(document => {
      if (document.users.has(clientId)) {
        document.users.delete(clientId)
        // 通知其他用户该用户已离开
        this.notifyUsersInDocument(document.id, clientId, {
          type: 'user-left',
          userId: clientId
        })
      }
    })
    
    client.connected = false
  }

  // 生成随机用户颜色
  getRandomColor() {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

// 创建全局模拟WebSocket服务器实例
if (typeof window !== 'undefined') {
  window.MockWebSocketServer = new MockWebSocketServer()
} else {
  // Node.js环境
  module.exports = new MockWebSocketServer()
}