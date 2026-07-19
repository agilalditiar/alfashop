import { query } from '../lib/mysql';
import bcrypt from 'bcryptjs';

async function migrate() {
  try {
    const users: any = await query('SELECT id, password FROM users');
    for (const user of users) {
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const hash = bcrypt.hashSync(user.password, 10);
        await query('UPDATE users SET password = ? WHERE id = ?', [hash, user.id]);
        console.log(`User ${user.id} password hashed.`);
      }
    }
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
