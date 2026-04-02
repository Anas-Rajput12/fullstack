const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const email = 'test@example.com';
    const password = 'test123';
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email.toLowerCase()]
    );
    
    console.log('Query result:', result.rows.length, 'rows');
    
    if (result.rows.length === 0) {
      console.log('No user found');
    } else {
      const user = result.rows[0];
      console.log('User found:', user.email, user.role);
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isValid);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
})();
