const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    // Drop all custom types first (they might be referenced by tables)
    const types = await pool.query(`
      SELECT typname FROM pg_type t 
      JOIN pg_namespace n ON t.typnamespace = n.oid 
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') 
      AND t.typtype = 'e'
    `);
    
    for (const r of types.rows) {
      await pool.query(`DROP TYPE IF EXISTS ${r.typname} CASCADE`);
      console.log('Dropped type:', r.typname);
    }
    
    // Drop all tables
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    for (const t of tables.rows) {
      await pool.query(`DROP TABLE IF EXISTS ${t.tablename} CASCADE`);
      console.log('Dropped table:', t.tablename);
    }
    
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
