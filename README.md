# 实时协作文档平台

这是一个基于Vue.js的实时协作文档平台，支持多人同时编辑同一个文档。

## 项目特性

- 📝 富文本编辑器，支持格式化、列表、链接等功能
- 📚 文档列表管理，支持创建、选择和预览文档
- 🔄 模拟实时协作功能（在真实环境中可接入WebSocket实现）
- 🎨 现代化UI设计，响应式布局

## 技术栈

- Vue.js 3
- Vite 5
- Quill富文本编辑器
- Socket.io-client（用于未来的实时协作功能）

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
├── src/
│   ├── assets/        # 静态资源文件
│   ├── components/    # Vue组件
│   ├── App.vue        # 主应用组件
│   └── main.js        # 应用入口
├── index.html         # HTML入口
├── package.json       # 项目配置和依赖
├── vite.config.js     # Vite配置
└── README.md          # 项目说明
```

## 实现说明

- 该项目使用Vue 3的组合式API开发
- 文档编辑器基于Quill实现，支持丰富的文本格式化功能
- 文档数据目前存储在前端，在真实环境中应集成后端API和数据库
- 实时协作功能当前为模拟实现，在实际部署时需要接入WebSocket服务

## 未来扩展

1. 集成后端服务，实现持久化存储
2. 完善WebSocket实时协作功能
3. 添加用户认证和权限管理
4. 实现文档版本控制
5. 支持更多文档格式和导出功能

## 注意事项

- 项目需要Node.js 18+环境
- 由于系统执行策略限制，可能需要调整PowerShell执行策略才能正常使用npm命令