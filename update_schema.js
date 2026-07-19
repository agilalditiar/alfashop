const mysql = require('mysql2/promise');
async function run() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'alfashop' });
  await pool.execute("ALTER TABLE pesanan MODIFY COLUMN status enum('Menunggu','Proses','Selesai','Batal','Dibatalkan') DEFAULT 'Menunggu'");
  await pool.execute("UPDATE pesanan SET status = 'Menunggu' WHERE status = ''");
  console.log('Schema updated');
  process.exit(0);
}
run();
