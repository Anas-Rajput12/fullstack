import { pool } from '../config/database';

async function testQuery() {
  try {
    console.log('Testing CampaignModel findAll query...\n');
    
    // Simulate what the model does
    const query = `
      SELECT
        c.*,
        CASE
          WHEN c.impressions > 0 THEN (c.clicks::DECIMAL / c.impressions::DECIMAL) * 100
          ELSE NULL
        END as ctr,
        CASE
          WHEN c.budget > 0 THEN (c.spent / c.budget) * 100
          ELSE 0
        END as budget_utilization,
        u.email as account_manager_name
      FROM campaigns c
      LEFT JOIN users u ON c.account_manager_id = u.id
      WHERE c.is_active = TRUE
      ORDER BY c.created_at DESC
      LIMIT 20 OFFSET 0
    `;
    
    const { rows } = await pool.query(query);
    
    console.log(`Found ${rows.length} campaigns\n`);
    
    rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.name}`);
      console.log(`   Status: ${row.status}, Budget: $${row.budget}, Spent: $${row.spent}`);
      console.log(`   CTR: ${row.ctr}, Impressions: ${row.impressions}, Clicks: ${row.clicks}`);
      console.log(`   Start: ${row.start_date}, End: ${row.end_date}\n`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testQuery();
