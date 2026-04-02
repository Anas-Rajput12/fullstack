/**
 * Database Seed Script
 * Creates demo users for testing
 */

import bcrypt from 'bcrypt';
import { pool } from '../config/database';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create demo users
    const users = [
      {
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
      },
      {
        email: 'manager@example.com',
        password: 'Manager123!',
        role: 'account_manager',
      },
      {
        email: 'creative@example.com',
        password: 'Creative123!',
        role: 'creative_team',
      },
      {
        email: 'analyst@example.com',
        password: 'Analyst123!',
        role: 'marketing_analyst',
      },
    ];

    for (const userData of users) {
      // Check if user already exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user
      await pool.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (email) DO NOTHING`,
        [userData.email.toLowerCase(), passwordHash, userData.role]
      );

      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    // Create sample campaigns
    const sampleCampaigns = [
      {
        name: 'Summer Product Launch 2024',
        status: 'active',
        budget: 50000,
        spent: 32500,
        impressions: 1250000,
        clicks: 45000,
        conversions: 3200,
        start_date: '2024-06-01',
        end_date: '2024-08-31',
      },
      {
        name: 'Brand Awareness Q3',
        status: 'active',
        budget: 75000,
        spent: 48000,
        impressions: 2100000,
        clicks: 62000,
        conversions: 4100,
        start_date: '2024-07-01',
        end_date: '2024-09-30',
      },
      {
        name: 'Holiday Season Promo',
        status: 'draft',
        budget: 100000,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        start_date: '2024-11-15',
        end_date: '2024-12-31',
      },
      {
        name: 'Black Friday Special',
        status: 'paused',
        budget: 60000,
        spent: 15000,
        impressions: 450000,
        clicks: 18000,
        conversions: 950,
        start_date: '2024-11-01',
        end_date: '2024-11-30',
      },
      {
        name: 'Spring Collection 2024',
        status: 'completed',
        budget: 40000,
        spent: 38500,
        impressions: 980000,
        clicks: 35000,
        conversions: 2800,
        start_date: '2024-03-01',
        end_date: '2024-05-31',
      },
    ];

    // Get admin user ID for campaign ownership
    const adminResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@example.com']
    );
    const accountManagerId = adminResult.rows[0]?.id;

    if (accountManagerId) {
      for (const campaign of sampleCampaigns) {
        // Check if campaign already exists
        const existing = await pool.query(
          'SELECT id FROM campaigns WHERE name = $1',
          [campaign.name]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  Campaign "${campaign.name}" already exists, skipping...`);
          continue;
        }

        await pool.query(
          `INSERT INTO campaigns (
            name, status, budget, spent, impressions, clicks, conversions,
            start_date, end_date, account_manager_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            campaign.name,
            campaign.status,
            campaign.budget,
            campaign.spent,
            campaign.impressions,
            campaign.clicks,
            campaign.conversions,
            campaign.start_date,
            campaign.end_date,
            accountManagerId,
          ]
        );

        console.log(`✅ Created campaign: ${campaign.name}`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin123!');
    console.log('\n   Email: manager@example.com');
    console.log('   Password: Manager123!');
    console.log('\n   Email: creative@example.com');
    console.log('   Password: Creative123!');
    console.log('\n   Email: analyst@example.com');
    console.log('   Password: Analyst123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
