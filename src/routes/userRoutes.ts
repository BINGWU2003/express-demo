import { Router, Request, Response } from 'express';
import { UserModel, User } from '../models/User';

const router: Router = Router();

// 获取所有用户（支持分页）
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '无效的分页参数，页码和每页数量必须大于0，每页数量不能超过100'
      });
    }

    const result = await UserModel.findAll(page, limit);

    res.json({
      code: 200,
      success: true,
      data: {
        list: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      },
      message: '获取用户列表成功'
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 搜索用户
router.get('/search', async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!keyword) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '无效的分页参数，页码和每页数量必须大于0，每页数量不能超过100'
      });
    }

    const result = await UserModel.search(keyword, page, limit);

    res.json({
      code: 200,
      success: true,
      data: {
        list: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        keyword
      },
      message: '搜索用户成功'
    });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '搜索用户失败'
    });
  }
});

// 根据ID获取用户
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '无效的用户ID'
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '用户未找到'
      });
    }

    res.json({
      code: 200,
      success: true,
      data: user,
      message: '获取用户成功'
    });
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '获取用户失败'
    });
  }
});

// 创建新用户
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '姓名和邮箱为必填项'
      });
    }

    // 检查邮箱是否已存在
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '该邮箱已被注册'
      });
    }

    const newUser = await UserModel.create({ name, email });

    res.status(201).json({
      code: 201,
      success: true,
      data: newUser,
      message: '用户创建成功'
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '创建用户失败'
    });
  }
});

// 更新用户
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '无效的用户ID'
      });
    }

    const { name, email } = req.body;

    // 检查用户是否存在
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '用户未找到'
      });
    }

    // 如果更新邮箱，检查是否与其他用户冲突
    if (email && email !== existingUser.email) {
      const emailUser = await UserModel.findByEmail(email);
      if (emailUser && emailUser.id !== id) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: '该邮箱已被其他用户使用'
        });
      }
    }

    const updatedUser = await UserModel.update(id, { name, email });

    res.json({
      code: 200,
      success: true,
      data: updatedUser,
      message: '用户更新成功'
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '更新用户失败'
    });
  }
});

// 删除用户
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '无效的用户ID'
      });
    }

    // 检查用户是否存在
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '用户未找到'
      });
    }

    const deleted = await UserModel.delete(id);
    if (!deleted) {
      return res.status(500).json({
        code: 500,
        success: false,
        message: '删除用户失败'
      });
    }

    res.json({
      code: 200,
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '删除用户失败'
    });
  }
});

export { router as userRoutes }; 