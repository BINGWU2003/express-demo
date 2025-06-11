import { query } from '../config/database';

export interface User {
  id?: number;
  name: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

export class UserModel {
  // 创建用户表
  static async createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await query(sql);
  }

  // 获取所有用户（支持分页）
  static async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;

    // 确保参数是安全的整数
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit.toString())));
    const safeOffset = Math.max(0, parseInt(offset.toString()));

    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM users';
    const countResult = await query(countSql);
    const total = countResult[0].total;

    // 获取分页数据 - 使用字符串拼接避免参数化问题
    const sql = `SELECT * FROM users ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    const users = await query(sql);

    return { users, total };
  }

  // 根据ID获取用户
  static async findById(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const users = await query(sql, [id]);
    return users.length > 0 ? users[0] : null;
  }

  // 根据邮箱获取用户
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await query(sql, [email]);
    return users.length > 0 ? users[0] : null;
  }

  // 搜索用户
  static async search(keyword: string, page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${keyword}%`;

    // 确保参数是安全的整数
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit.toString())));
    const safeOffset = Math.max(0, parseInt(offset.toString()));

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total FROM users 
      WHERE name LIKE ? OR email LIKE ?
    `;
    const countResult = await query(countSql, [searchPattern, searchPattern]);
    const total = countResult[0].total;

    // 获取搜索结果 - 使用字符串拼接避免参数化问题
    const sql = `
      SELECT * FROM users 
      WHERE name LIKE ? OR email LIKE ?
      ORDER BY created_at DESC 
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;
    const users = await query(sql, [searchPattern, searchPattern]);

    return { users, total };
  }

  // 创建用户
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    const result: any = await query(sql, [userData.name, userData.email]);

    // 返回创建的用户
    const newUser = await this.findById(result.insertId);
    if (!newUser) {
      throw new Error('创建用户失败');
    }
    return newUser;
  }

  // 更新用户
  static async update(id: number, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    const fields = [];
    const values = [];

    if (userData.name) {
      fields.push('name = ?');
      values.push(userData.name);
    }

    if (userData.email) {
      fields.push('email = ?');
      values.push(userData.email);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return this.findById(id);
  }

  // 删除用户
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result: any = await query(sql, [id]);
    return result.affectedRows > 0;
  }
} 