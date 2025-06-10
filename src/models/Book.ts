import { query } from '../config/database';

export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  publish_date?: Date;
  stock_quantity?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class BookModel {
  // 创建图书表
  static async createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        author VARCHAR(100) NOT NULL,
        isbn VARCHAR(20) UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        category VARCHAR(50),
        publish_date DATE,
        stock_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await query(sql);
  }

  // 获取所有图书
  static async findAll(page: number = 1, limit: number = 10, category?: string): Promise<{ books: Book[], total: number }> {
    const offset = (page - 1) * limit;

    let wherClause = '';
    let params: any[] = [];

    if (category) {
      wherClause = 'WHERE category = ?';
      params.push(category);
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM books ${wherClause}`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // 获取分页数据
    const sql = `SELECT * FROM books ${wherClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const books = await query(sql, params);

    return { books, total };
  }

  // 根据ID获取图书
  static async findById(id: number): Promise<Book | null> {
    const sql = 'SELECT * FROM books WHERE id = ?';
    const books = await query(sql, [id]);
    return books.length > 0 ? books[0] : null;
  }

  // 根据ISBN获取图书
  static async findByISBN(isbn: string): Promise<Book | null> {
    const sql = 'SELECT * FROM books WHERE isbn = ?';
    const books = await query(sql, [isbn]);
    return books.length > 0 ? books[0] : null;
  }

  // 根据关键词搜索图书
  static async search(keyword: string, page: number = 1, limit: number = 10): Promise<{ books: Book[], total: number }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${keyword}%`;

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total FROM books 
      WHERE title LIKE ? OR author LIKE ? OR description LIKE ?
    `;
    const countResult = await query(countSql, [searchPattern, searchPattern, searchPattern]);
    const total = countResult[0].total;

    // 获取搜索结果
    const sql = `
      SELECT * FROM books 
      WHERE title LIKE ? OR author LIKE ? OR description LIKE ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const books = await query(sql, [searchPattern, searchPattern, searchPattern, limit, offset]);

    return { books, total };
  }

  // 创建图书
  static async create(bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
    const sql = `
      INSERT INTO books (title, author, isbn, description, price, image_url, category, publish_date, stock_quantity) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result: any = await query(sql, [
      bookData.title,
      bookData.author,
      bookData.isbn || null,
      bookData.description || null,
      bookData.price,
      bookData.image_url || null,
      bookData.category || null,
      bookData.publish_date || null,
      bookData.stock_quantity || 0
    ]);

    // 返回创建的图书
    const newBook = await this.findById(result.insertId);
    if (!newBook) {
      throw new Error('创建图书失败');
    }
    return newBook;
  }

  // 更新图书
  static async update(id: number, bookData: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>): Promise<Book | null> {
    const fields = [];
    const values = [];

    if (bookData.title !== undefined) {
      fields.push('title = ?');
      values.push(bookData.title);
    }

    if (bookData.author !== undefined) {
      fields.push('author = ?');
      values.push(bookData.author);
    }

    if (bookData.isbn !== undefined) {
      fields.push('isbn = ?');
      values.push(bookData.isbn);
    }

    if (bookData.description !== undefined) {
      fields.push('description = ?');
      values.push(bookData.description);
    }

    if (bookData.price !== undefined) {
      fields.push('price = ?');
      values.push(bookData.price);
    }

    if (bookData.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(bookData.image_url);
    }

    if (bookData.category !== undefined) {
      fields.push('category = ?');
      values.push(bookData.category);
    }

    if (bookData.publish_date !== undefined) {
      fields.push('publish_date = ?');
      values.push(bookData.publish_date);
    }

    if (bookData.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(bookData.stock_quantity);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return this.findById(id);
  }

  // 删除图书
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM books WHERE id = ?';
    const result: any = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 获取所有分类
  static async getCategories(): Promise<string[]> {
    const sql = 'SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category';
    const result = await query(sql);
    return result.map((row: any) => row.category);
  }

  // 更新库存
  static async updateStock(id: number, quantity: number): Promise<Book | null> {
    const sql = 'UPDATE books SET stock_quantity = ? WHERE id = ?';
    await query(sql, [quantity, id]);
    return this.findById(id);
  }
} 