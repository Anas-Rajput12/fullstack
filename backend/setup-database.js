const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('   ✅ Database connected:', testResult.rows[0].now, '\n');

    // Create admin user
    console.log('2️⃣ Creating admin user...');
    const email = 'admin@example.com';
    const password = 'Admin123!';
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(`
      INSERT INTO users (email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $2, role = $3, is_active = TRUE
    `, [email, passwordHash, 'admin', true]);

    console.log('   ✅ Admin user created:');
    console.log('      Email:', email);
    console.log('      Password:', password, '\n');

    // Create test user
    console.log('3️⃣ Creating test user...');
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    const testPasswordHash = await bcrypt.hash(testPassword, 12);

    await pool.query(`
      INSERT INTO users (email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $2, role = $3, is_active = TRUE
    `, [testEmail, testPasswordHash, 'account_manager', true]);

    console.log('   ✅ Test user created:');
    console.log('      Email:', testEmail);
    console.log('      Password:', testPassword, '\n');

    // Get admin user ID for account_manager_id
    console.log('4️⃣ Creating sample campaigns...');
    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    const adminId = adminResult.rows[0].id;

    const campaigns = [
      {
        id: 'a1b2c3d4-e001-4000-8000-000000000001',
        name: 'Lumiere Summer Launch',
        status: 'active',
        budget: 50000,
        spent: 32450,
        impressions: 2400000,
        clicks: 48000,
        conversions: 1200,
        start_date: '2026-03-01',
        end_date: '2026-05-31'
      },
      {
        id: 'a1b2c3d4-e002-4000-8000-000000000002',
        name: 'TechCorp Q2 Awareness',
        status: 'active',
        budget: 75000,
        spent: 45000,
        impressions: 3500000,
        clicks: 70000,
        conversions: 2100,
        start_date: '2026-04-01',
        end_date: '2026-06-30'
      },
      {
        id: 'a1b2c3d4-e003-4000-8000-000000000003',
        name: 'GreenLife Eco Campaign',
        status: 'active',
        budget: 30000,
        spent: 18500,
        impressions: 1200000,
        clicks: 36000,
        conversions: 900,
        start_date: '2026-03-15',
        end_date: '2026-04-30'
      },
      {
        id: 'a1b2c3d4-e004-4000-8000-000000000004',
        name: 'FitPro Athletic Wear',
        status: 'paused',
        budget: 40000,
        spent: 22000,
        impressions: 1800000,
        clicks: 45000,
        conversions: 1350,
        start_date: '2026-02-01',
        end_date: '2026-04-30'
      },
      {
        id: 'a1b2c3d4-e005-4000-8000-000000000005',
        name: 'Foodie Delights',
        status: 'active',
        budget: 25000,
        spent: 21000,
        impressions: 900000,
        clicks: 27000,
        conversions: 810,
        start_date: '2026-03-01',
        end_date: '2026-03-31'
      }
    ];

    for (const campaign of campaigns) {
      await pool.query(`
        INSERT INTO campaigns (
          id, name, account_manager_id, status, budget, spent,
          impressions, clicks, conversions,
          start_date, end_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          name = $2, account_manager_id = $3, status = $4, budget = $5, spent = $6,
          impressions = $7, clicks = $8, conversions = $9,
          start_date = $10, end_date = $11
      `, [
        campaign.id, campaign.name, adminId, campaign.status,
        campaign.budget, campaign.spent, campaign.impressions,
        campaign.clicks, campaign.conversions,
        campaign.start_date, campaign.end_date
      ]);
      
      console.log(`   ✅ Campaign created: ${campaign.name}`);
    }

    console.log('\n   ✅ Sample campaigns created: 5\n');

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║              Database Setup Complete! ✅                 ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  Users Created:                                          ║');
    console.log('║  • admin@example.com / Admin123! (Admin)                ║');
    console.log('║  • test@example.com / test123 (Account Manager)         ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  Campaigns Created: 5 sample campaigns                   ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase();
