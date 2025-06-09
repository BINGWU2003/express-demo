import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: 'sh-cynosdbmysql-grp-dak355dq.sql.tencentcdb.com',
  port: 28365,
  user: 'root',
  password: 'HUJIACHENG520hjc',
  database: 'express_demo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功！');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

// 执行查询
export const query = async (sql: string, params?: any[]): Promise<any> => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
};

export default pool; 