<script setup>
import { ref } from 'vue'

const props = defineProps({
  documents: {
    type: Array,
    required: true
  },
  activeDocument: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select', 'rename', 'delete'])
const renamingDocId = ref(null)
const newTitle = ref('')
const contextMenu = ref({ show: false, x: 0, y: 0, docId: null })

function handleSelect(doc) {
  // 如果正在重命名模式，不触发选择
  if (renamingDocId.value !== null) {
    return
  }
  emit('select', doc)
}

function startRenaming(doc, event) {
  // 阻止事件冒泡，避免触发选择
  event.stopPropagation()
  // 设置当前重命名的文档ID和初始标题
  renamingDocId.value = doc.id
  newTitle.value = doc.title
  
  // 使用Vue的nextTick确保在DOM更新后再执行聚焦操作
  // 由于我们在组合式API中，手动创建一个简单的nextTick实现
  const nextTick = (callback) => {
    setTimeout(callback, 50); // 增加延迟时间确保DOM已更新
  }
  
  nextTick(() => {
    // 找到对应的重命名输入框
    const items = document.querySelectorAll('.document-item');
    let input = null;
    
    // 遍历所有文档项，找到当前正在重命名的项
    items.forEach(item => {
      const renameInput = item.querySelector('.rename-input');
      if (renameInput && renamingDocId.value === doc.id) {
        input = renameInput;
      }
    });
    
    // 如果找到输入框，执行聚焦和选择操作
    if (input) {
      input.focus();
      input.select(); // 选中所有文本
    }
  });
}

function cancelRenaming() {
  renamingDocId.value = null
  newTitle.value = ''
}

function confirmRenaming(docId) {
  const trimmedTitle = newTitle.value.trim()
  if (trimmedTitle && trimmedTitle !== '') {
    emit('rename', docId, trimmedTitle)
  }
  renamingDocId.value = null
  newTitle.value = ''
}

function handleRenameKeyDown(event, docId) {
  if (event.key === 'Enter') {
    confirmRenaming(docId)
  } else if (event.key === 'Escape') {
    cancelRenaming()
  }
}

function showContextMenu(event, doc) {
  event.preventDefault()
  event.stopPropagation()
  
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    docId: doc.id
  }
}

function hideContextMenu() {
  contextMenu.value = { show: false, x: 0, y: 0, docId: null }
}

// 点击页面其他地方关闭右键菜单
setTimeout(() => {
  document.addEventListener('click', hideContextMenu)
}, 0)

// 组件卸载时移除事件监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})

// 将getPreview和startContextMenuRename函数移到组合式API中
function getPreview(content) {
  // 移除markdown格式并获取前30个字符作为预览
  const plainText = content.replace(/[#*_\[\]()~`>]/g, '').trim()
  return plainText.length > 30 ? plainText.substring(0, 30) + '...' : plainText
}

function startContextMenuRename() {
  const doc = props.documents.find(d => d.id === contextMenu.value.docId)
  if (doc) {
    // 创建一个模拟事件对象
    const mockEvent = {
      currentTarget: {
        querySelector: () => null
      },
      stopPropagation: () => {}
    }
    startRenaming(doc, mockEvent)
    hideContextMenu()
  }
}

function startDeleteDocument() {
  const doc = props.documents.find(d => d.id === contextMenu.value.docId)
  if (doc) {
    // 显示确认对话框
    if (confirm(`确定要删除文档 "${doc.title}" 吗？此操作无法撤销。`)) {
      // 发出删除事件
      emit('delete', doc.id)
    }
    hideContextMenu()
  }
}
</script>

<template>
  <div class="document-list">
    <h3 class="list-title">我的文档</h3>
    <ul class="documents">
      <li 
        v-for="doc in documents" 
        :key="doc.id"
        :class="{ 'active': activeDocument && doc.id === activeDocument.id }"
        @click="handleSelect(doc)"
        @dblclick="startRenaming(doc, $event)"
        @contextmenu="showContextMenu($event, doc)"
        class="document-item"
      >
        <div v-if="renamingDocId !== doc.id" class="document-title">
          {{ doc.title }}
        </div>
        <div v-else class="rename-container">
          <input
            type="text"
            v-model="newTitle"
            class="rename-input"
            @blur="confirmRenaming(doc.id)"
            @keydown="handleRenameKeyDown($event, doc.id)"
          />
        </div>
        <div class="document-preview">{{ getPreview(doc.content) }}</div>
      </li>
    </ul>
    
    <!-- 右键菜单 -->
    <div 
      v-if="contextMenu.show" 
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="menu-item" @click="startContextMenuRename">
        <i class="fa fa-pencil"></i> 重命名
      </div>
      <!-- 分隔线 -->
      <div class="menu-separator"></div>
      <!-- 删除选项 -->
      <div class="menu-item delete-item" @click="startDeleteDocument">
        <i class="fa fa-trash"></i> 删除
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.document-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.list-title {
  padding: 1rem;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.documents {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.document-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
}

.document-item:hover {
  background-color: #f1f5f9;
}

.document-item.active {
  background-color: #dbeafe;
  border-left: 3px solid #3b82f6;
}

.document-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #1e293b;
}

.document-preview {
  font-size: 0.75rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 重命名相关样式 */
.rename-container {
  margin-bottom: 0.25rem;
}

.rename-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #3b82f6;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  background-color: white;
}

.rename-input:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  min-width: 120px;
}

.menu-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #1e293b;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-item:hover {
  background-color: #f8fafc;
}

/* 分隔线样式 */
.menu-separator {
  height: 1px;
  background-color: #e2e8f0;
  margin: 0.25rem 0;
}

/* 删除菜单项样式 */
.menu-item.delete-item {
  color: #ef4444;
}

.menu-item.delete-item:hover {
  background-color: #fef2f2;
}

.menu-item i {
  width: 16px;
  text-align: center;
}
</style>