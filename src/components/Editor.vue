<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])
const editor = ref(null)
const quillInstance = ref(null)
const collaborativeUsers = ref([])
let contentUpdateTimeout = null
let ws = null
let isUpdatingFromCollaboration = false

onMounted(() => {
  // 初始化Quill编辑器
  quillInstance.value = new Quill(editor.value, {
    theme: 'snow',
    placeholder: '开始编辑您的文档...',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    }
  })
  
  // 设置初始内容
    const htmlContent = props.document.content ? props.document.content.replace(/\n/g, '<br>') : '';
    quillInstance.value.root.innerHTML = htmlContent;
  
  // 监听内容变化
  quillInstance.value.on('text-change', handleTextChange)
  
  // 初始化模拟的WebSocket连接
  initWebSocketConnection()
})

onBeforeUnmount(() => {
  if (quillInstance.value) {
    quillInstance.value.off('text-change', handleTextChange)
    quillInstance.value = null
  }
  if (contentUpdateTimeout) {
    clearTimeout(contentUpdateTimeout)
  }
  if (ws) {
    ws.close()
    ws = null
  }
})

// 监听文档ID变化，更新编辑器内容
watch(() => props.document.id, () => {
  if (quillInstance.value && props.document) {
    // 无论content是否为空，都要更新编辑器内容
    const htmlContent = props.document.content ? props.document.content.replace(/\n/g, '<br>') : '';
    quillInstance.value.root.innerHTML = htmlContent;
    collaborativeUsers.value = [];
  }
})

function initWebSocketConnection() {
  try {
    // 模拟WebSocket连接
    if (typeof window !== 'undefined') {
      // 创建模拟的WebSocket对象
      ws = {
        id: Date.now(),
        username: '当前用户',
        color: '#3b82f6',
        on: (event, callback) => {},
        send: (data) => {},
        close: () => {}
      }
    }
  } catch (error) {
    console.error('初始化WebSocket连接失败:', error)
  }
}

function handleTextChange() {
  // 使用防抖处理内容更新
  if (contentUpdateTimeout) {
    clearTimeout(contentUpdateTimeout)
  }
  
  contentUpdateTimeout = setTimeout(() => {
    const content = quillInstance.value.root.innerHTML
    
    // 将HTML转回带换行符的纯文本
    const plainText = content.replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    emit('update', props.document.id, plainText)
  }, 300)
}
</script>

<template>
  <div class="editor">
    <div class="editor-header">
      <input 
        type="text" 
        v-model="document.title" 
        class="document-title-input"
        placeholder="文档标题"
      />
      
      <!-- 协作用户列表 -->
      <div class="collaborators">
        <div class="collaborator-item self">
          <span class="collaborator-avatar">我</span>
          <span class="collaborator-name">我</span>
        </div>
      </div>
    </div>
    <div class="editor-content">
      <div ref="editor" class="quill-editor"></div>
    </div>
  </div>
</template>

<style scoped>
.editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.editor-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.document-title-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  margin-right: 1rem;
}

/* 协作用户列表样式 */
.collaborators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.collaborator-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.collaborator-item:hover {
  background-color: #e2e8f0;
}

.collaborator-item.self {
  background-color: #dbeafe;
}

.collaborator-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.collaborator-name {
  color: #475569;
  font-size: 0.75rem;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  padding: 1rem 2rem;
}

.quill-editor {
  height: 100%;
}

/* 适配Quill编辑器的样式 */
:deep(.ql-container) {
  height: calc(100% - 42px) !important;
}

:deep(.ql-editor) {
  font-size: 1rem;
  line-height: 1.6;
  min-height: 100%;
}

:deep(.ql-editor.ql-blank::before) {
  color: #94a3b8;
}
</style>