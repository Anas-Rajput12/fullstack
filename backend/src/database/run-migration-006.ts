import { pool } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  const migrationFile = path.join(__dirname, 'migrations', '006_add_is_active_to_campaigns.sql');
  
  try {
    console.log('Running migration: 006_add_is_active_to_campaigns.sql');
    
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Added is_active column to campaigns table');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
