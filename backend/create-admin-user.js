const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    // Create admin user
    const email = 'admin@example.com';
    const password = 'Admin123!';
    const passwordHash = await bcrypt.hash(password, 12);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, [email, passwordHash, 'admin', true]);
    
    console.log('Admin user created:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  Role: admin');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
