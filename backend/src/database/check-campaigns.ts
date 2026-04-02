import { pool } from '../config/database';

async function checkCampaigns() {
  try {
    console.log('Checking campaigns in database...\n');
    
    // Check all campaigns including inactive ones
    const allCampaigns = await pool.query(
      'SELECT id, name, status, is_active FROM campaigns ORDER BY created_at DESC'
    );
    
    console.log(`Total campaigns in DB: ${allCampaigns.rows.length}`);
    allCampaigns.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.name} - Status: ${row.status}, is_active: ${row.is_active}`);
    });
    
    // Check active campaigns only
    const activeCampaigns = await pool.query(
      'SELECT id, name, status FROM campaigns WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    
    console.log(`\nActive campaigns: ${activeCampaigns.rows.length}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCampaigns();
