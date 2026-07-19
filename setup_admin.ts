import { query } from './lib/mysql';

async function setupAdmin() {
  try {
    const existingAdmin: any = await query('SELECT * FROM users WHERE role = "admin"');
    
    if (existingAdmin.length === 0) {
      await query(`
        INSERT INTO users (name, email, whatsapp, password, role) 
        VALUES ('Admin Super', 'admin@alfashop.com', '08111111111', 'admin123', 'admin')
      `);
      console.log("Berhasil membuat akun Admin!");
      console.log("Email: admin@alfashop.com");
      console.log("Password: admin123");
    } else {
      console.log("Akun Admin sudah ada!");
      console.log("Email Admin:", existingAdmin[0].email);
      console.log("Password:", existingAdmin[0].password);
    }
    
  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit(0);
}

setupAdmin();
