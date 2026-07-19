import mysql from 'mysql2/promise';

// Koneksi ke MySQL XAMPP
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: 'alfashop', // Pastikan nama database di PHPMyAdmin adalah alfashop
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql: string, values?: any[]) {
  const [results] = await pool.execute(sql, values);
  return results;
}