import { pool } from '../config/database';

async function seedAlerts() {
  console.log('🌱 Seeding sample alerts...\n');

  try {
    // Get admin user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@example.com']
    );
    const userId = userResult.rows[0]?.id;

    if (!userId) {
      console.log('❌ Admin user not found. Run seed.ts first.');
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${userId}`);

    // Get active campaigns
    const campaignsResult = await pool.query(
      `SELECT id, name, budget, spent, impressions, clicks,
        CASE WHEN impressions > 0 THEN (clicks::DECIMAL / impressions::DECIMAL) * 100 ELSE 0 END as ctr
       FROM campaigns WHERE is_active = TRUE AND status = 'active' LIMIT 5`
    );
    const campaigns = campaignsResult.rows;

    if (campaigns.length === 0) {
      console.log('❌ No active campaigns found.');
      process.exit(1);
    }

    console.log(`✅ Found ${campaigns.length} active campaigns\n`);

    // Create sample alerts
    const alertsToCreate = [];

    for (const campaign of campaigns) {
      // Budget threshold alert (if budget utilization > 80%)
      const budgetUtilization = (Number(campaign.spent) / Number(campaign.budget)) * 100;
      if (budgetUtilization >= 60) {
        alertsToCreate.push({
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          user_id: userId,
          type: 'budget_threshold',
          threshold_value: 80,
          current_value: budgetUtilization,
          message: `Campaign "${campaign.name}" has reached ${budgetUtilization.toFixed(1)}% of budget`,
        });
      }

      // CTR threshold alert (if CTR < 1%)
      const ctr = Number(campaign.ctr);
      if (ctr > 0 && ctr < 3) {
        alertsToCreate.push({
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          user_id: userId,
          type: 'ctr_threshold',
          threshold_value: 1.0,
          current_value: ctr,
          message: `Campaign "${campaign.name}" CTR has dropped to ${ctr.toFixed(2)}%`,
        });
      }
    }

    // Add some additional sample alerts
    const additionalAlerts = [
      {
        campaign_id: campaigns[0]?.id,
        campaign_name: campaigns[0]?.name,
        user_id: userId,
        type: 'performance_drop' as const,
        threshold_value: 20,
        current_value: 15,
        message: `Campaign "${campaigns[0]?.name}" impressions dropped by 15% this week`,
      },
    ];

    alertsToCreate.push(...additionalAlerts);

    // Insert alerts
    for (const alert of alertsToCreate) {
      // Check if similar alert already exists
      const existing = await pool.query(
        'SELECT id FROM alerts WHERE campaign_id = $1 AND type = $2 AND user_id = $3 ORDER BY created_at DESC LIMIT 1',
        [alert.campaign_id, alert.type, alert.user_id]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Alert exists for "${alert.campaign_name}" (${alert.type}), skipping...`);
        continue;
      }

      await pool.query(
        `INSERT INTO alerts (
          campaign_id, user_id, type, threshold_value,
          current_value, message, is_read, is_dismissed
        ) VALUES ($1, $2, $3, $4, $5, $6, FALSE, FALSE)`,
        [
          alert.campaign_id,
          alert.user_id,
          alert.type,
          alert.threshold_value,
          alert.current_value,
          alert.message,
        ]
      );

      console.log(`✅ Created alert: ${alert.message}`);
    }

    // Get total alert count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM alerts WHERE user_id = $1',
      [userId]
    );
    const totalAlerts = countResult.rows[0].total;

    console.log(`\n✅ Alert seeding completed!`);
    console.log(`📊 Total alerts for admin: ${totalAlerts}`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Alert seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedAlerts();
