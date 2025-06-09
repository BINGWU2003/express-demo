# Express TypeScript 项目

一个简单的使用TypeScript构建的Express.js项目。

## 功能特性

- ✅ TypeScript支持
- ✅ Express.js框架
- ✅ RESTful API设计
- ✅ 错误处理中间件
- ✅ 用户CRUD操作
- ✅ 热重载开发环境

## 项目结构

```
express-ts-demo/
├── src/
│   ├── app.ts              # 主应用文件
│   ├── routes/
│   │   └── userRoutes.ts   # 用户路由
│   └── middleware/
│       └── errorHandler.ts # 错误处理中间件
├── dist/                   # 编译输出目录
├── package.json
├── tsconfig.json
└── README.md
```

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式运行
```bash
 
```

### 3. 编译项目
```bash
npm run build
```

### 4. 生产模式运行
```bash
npm start
```

## API接口

### 基础接口
- `GET /` - 欢迎页面

### 用户管理接口
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 根据ID获取用户
- `POST /api/users` - 创建新用户
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

### 示例请求

创建用户：
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "测试用户", "email": "test@example.com"}'
```

获取所有用户：
```bash
curl http://localhost:3000/api/users
```

## 开发脚本

- `npm run dev` - 启动开发服务器（支持热重载）
- `npm run build` - 编译TypeScript到JavaScript
- `npm run start` - 运行编译后的应用
- `npm run clean` - 清理编译输出目录

## 技术栈

- Node.js
- Express.js
- TypeScript
- ts-node-dev（开发环境热重载） 