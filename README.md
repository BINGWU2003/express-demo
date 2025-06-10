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
npm run dev
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

### 图书管理接口
- `GET /api/books` - 获取图书列表（支持分页和分类筛选）
- `GET /api/books/search` - 搜索图书
- `GET /api/books/categories` - 获取所有分类
- `GET /api/books/:id` - 根据ID获取图书详情
- `POST /api/books` - 创建新图书
- `PUT /api/books/:id` - 更新图书信息
- `PATCH /api/books/:id/stock` - 更新图书库存
- `DELETE /api/books/:id` - 删除图书

### 示例请求

#### 用户接口示例

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

#### 图书接口示例

创建图书：
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript高级程序设计",
    "author": "Nicholas C. Zakas",
    "isbn": "9787115275790",
    "description": "前端开发经典教程",
    "price": 99.00,
    "image_url": "https://example.com/book-cover.jpg",
    "category": "编程",
    "stock_quantity": 50
  }'
```

获取图书列表（分页）：
```bash
curl "http://localhost:3000/api/books?page=1&limit=10&category=编程"
```

搜索图书：
```bash
curl "http://localhost:3000/api/books/search?keyword=JavaScript&page=1&limit=5"
```

更新图书库存：
```bash
curl -X PATCH http://localhost:3000/api/books/1/stock \
  -H "Content-Type: application/json" \
  -d '{"stock_quantity": 100}'
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