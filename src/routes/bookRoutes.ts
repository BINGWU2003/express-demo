import { Router, Request, Response } from 'express';
import { BookModel, Book } from '../models/Book';

const router: Router = Router();

// 获取所有图书（支持分页和分类筛选）
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;

    const result = await BookModel.findAll(page, limit, category);

    res.json({
      success: true,
      data: {
        books: result.books,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      },
      message: '获取图书列表成功'
    });
  } catch (error) {
    console.error('获取图书列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取图书列表失败'
    });
  }
});

// 搜索图书
router.get('/search', async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    const result = await BookModel.search(keyword, page, limit);

    res.json({
      success: true,
      data: {
        books: result.books,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        keyword
      },
      message: '搜索图书成功'
    });
  } catch (error) {
    console.error('搜索图书失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索图书失败'
    });
  }
});

// 获取所有分类
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await BookModel.getCategories();

    res.json({
      success: true,
      data: categories,
      message: '获取分类列表成功'
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
});

// 根据ID获取图书
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的图书ID'
      });
    }

    const book = await BookModel.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '图书未找到'
      });
    }

    res.json({
      success: true,
      data: book,
      message: '获取图书成功'
    });
  } catch (error) {
    console.error('获取图书失败:', error);
    res.status(500).json({
      success: false,
      message: '获取图书失败'
    });
  }
});

// 创建新图书
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      isbn,
      description,
      price,
      image_url,
      category,
      publish_date,
      stock_quantity
    } = req.body;

    // 验证必填字段
    if (!title || !author || price === undefined) {
      return res.status(400).json({
        success: false,
        message: '标题、作者和价格为必填项'
      });
    }

    // 验证价格
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: '价格必须是有效的数字且不能为负数'
      });
    }

    // 检查ISBN是否已存在
    if (isbn) {
      const existingBook = await BookModel.findByISBN(isbn);
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: '该ISBN已存在'
        });
      }
    }

    // 验证图片URL格式
    if (image_url && !isValidUrl(image_url)) {
      return res.status(400).json({
        success: false,
        message: '无效的图片URL格式'
      });
    }

    const newBook = await BookModel.create({
      title,
      author,
      isbn,
      description,
      price: parseFloat(price),
      image_url,
      category,
      publish_date: publish_date ? new Date(publish_date) : undefined,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0
    });

    res.status(201).json({
      success: true,
      data: newBook,
      message: '图书创建成功'
    });
  } catch (error) {
    console.error('创建图书失败:', error);
    res.status(500).json({
      success: false,
      message: '创建图书失败'
    });
  }
});

// 更新图书
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的图书ID'
      });
    }

    // 检查图书是否存在
    const existingBook = await BookModel.findById(id);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: '图书未找到'
      });
    }

    const {
      title,
      author,
      isbn,
      description,
      price,
      image_url,
      category,
      publish_date,
      stock_quantity
    } = req.body;

    // 验证价格
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: '价格必须是有效的数字且不能为负数'
      });
    }

    // 检查ISBN是否与其他图书冲突
    if (isbn && isbn !== existingBook.isbn) {
      const isbnBook = await BookModel.findByISBN(isbn);
      if (isbnBook && isbnBook.id !== id) {
        return res.status(400).json({
          success: false,
          message: '该ISBN已被其他图书使用'
        });
      }
    }

    // 验证图片URL格式
    if (image_url && !isValidUrl(image_url)) {
      return res.status(400).json({
        success: false,
        message: '无效的图片URL格式'
      });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (image_url !== undefined) updateData.image_url = image_url;
    if (category !== undefined) updateData.category = category;
    if (publish_date !== undefined) updateData.publish_date = new Date(publish_date);
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);

    const updatedBook = await BookModel.update(id, updateData);

    res.json({
      success: true,
      data: updatedBook,
      message: '图书更新成功'
    });
  } catch (error) {
    console.error('更新图书失败:', error);
    res.status(500).json({
      success: false,
      message: '更新图书失败'
    });
  }
});

// 更新库存
router.patch('/:id/stock', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { stock_quantity } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的图书ID'
      });
    }

    if (stock_quantity === undefined || isNaN(stock_quantity) || stock_quantity < 0) {
      return res.status(400).json({
        success: false,
        message: '库存数量必须是有效的非负数'
      });
    }

    // 检查图书是否存在
    const existingBook = await BookModel.findById(id);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: '图书未找到'
      });
    }

    const updatedBook = await BookModel.updateStock(id, parseInt(stock_quantity));

    res.json({
      success: true,
      data: updatedBook,
      message: '库存更新成功'
    });
  } catch (error) {
    console.error('更新库存失败:', error);
    res.status(500).json({
      success: false,
      message: '更新库存失败'
    });
  }
});

// 删除图书
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的图书ID'
      });
    }

    // 检查图书是否存在
    const existingBook = await BookModel.findById(id);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: '图书未找到'
      });
    }

    const deleted = await BookModel.delete(id);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: '删除图书失败'
      });
    }

    res.json({
      success: true,
      message: '图书删除成功'
    });
  } catch (error) {
    console.error('删除图书失败:', error);
    res.status(500).json({
      success: false,
      message: '删除图书失败'
    });
  }
});

// URL验证辅助函数
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export { router as bookRoutes }; 