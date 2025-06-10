import express, { Request, Response, NextFunction, Express } from 'express';
import { userRoutes } from './routes/userRoutes';
import { bookRoutes } from './routes/bookRoutes';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './config/database';
import { UserModel } from './models/User';
import { BookModel } from './models/Book';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '欢迎使用TypeScript Express服务器！',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);

// 404处理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: '路由未找到',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);

  // 测试数据库连接
  const connected = await testConnection();
  if (connected) {
    // 初始化数据库表
    try {
      await UserModel.createTable();
      await BookModel.createTable();
      console.log('数据库表初始化成功');
    } catch (error) {
      console.error('数据库表初始化失败:', error);
    }
  }
});

export default app; 