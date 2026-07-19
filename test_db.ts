import { query } from './lib/mysql';

async function test() {
  try {
    // Buat tabel pelanggan jika belum ada
    await query(`
      CREATE TABLE IF NOT EXISTS pelanggan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pelanggan VARCHAR(255) NOT NULL,
        no_wa VARCHAR(50) NOT NULL,
        alamat TEXT
      )
    `);
    
    // Cek apakah user dengan id=1 sudah ada
    const existing: any = await query('SELECT * FROM pelanggan WHERE id = 1');
    if (existing.length === 0) {
      await query(`
        INSERT INTO pelanggan (id, nama_pelanggan, no_wa, alamat) 
        VALUES (1, 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 45, Jakarta')
      `);
      console.log("Berhasil menambahkan data pelanggan (id=1)");
    } else {
      console.log("Data pelanggan id=1 sudah ada.");
    }
    
    const res = await query('SELECT * FROM pelanggan');
    console.log("Data tabel pelanggan:", res);
  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit(0);
}
test();
