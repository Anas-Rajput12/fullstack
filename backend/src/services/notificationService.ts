import { sendAlertToUser } from '../websocket/socketHandler';
import AlertModel from '../models/Alert';
import CampaignModel from '../models/Campaign';

export interface AlertThreshold {
  type: 'ctr_threshold' | 'budget_threshold' | 'performance_drop';
  threshold_value: number;
  enabled: boolean;
}

export interface UserAlertPreferences {
  thresholds: {
    ctr: AlertThreshold;
    budget: AlertThreshold;
    performance: AlertThreshold;
  };
  email_notifications: boolean;
  push_notifications: boolean;
}

/**
 * Check campaign metrics against thresholds and trigger alerts
 */
export async function checkCampaignThresholds(
  campaignId: string,
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spent: number;
    budget: number;
  }
): Promise<void> {
  try {
    // Calculate metrics
    const ctr = metrics.impressions > 0 
      ? (metrics.clicks / metrics.impressions) * 100 
      : 0;
    
    const budgetUtilization = metrics.budget > 0 
      ? (metrics.spent / metrics.budget) * 100 
      : 0;

    // Get campaign to find account manager
    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      console.warn(`Campaign ${campaignId} not found for threshold check`);
      return;
    }

    const userId = campaign.account_manager_id;

    // Check CTR threshold (< 1.0%)
    if (ctr < 1.0 && metrics.impressions > 0) {
      await createAndSendAlert({
        campaign_id: campaignId,
        user_id: userId,
        type: 'ctr_threshold',
        threshold_value: 1.0,
        current_value: ctr,
        message: `Campaign "${campaign.name}" CTR has dropped to ${ctr.toFixed(2)}% (threshold: 1.0%)`,
      });
    }

    // Check budget threshold (> 80%)
    if (budgetUtilization >= 80) {
      await createAndSendAlert({
        campaign_id: campaignId,
        user_id: userId,
        type: 'budget_threshold',
        threshold_value: 80,
        current_value: budgetUtilization,
        message: `Campaign "${campaign.name}" has reached ${budgetUtilization.toFixed(1)}% of budget (threshold: 80%)`,
      });
    }

    // Check performance drop (impressions dropped > 50% vs previous period)
    // This would require historical data comparison in production
    // For now, we'll skip this check or implement with mock data
  } catch (error) {
    console.error('Error checking campaign thresholds:', error);
  }
}

/**
 * Create alert in database and send via WebSocket
 */
async function createAndSendAlert(data: {
  campaign_id: string;
  user_id: string;
  type: string;
  threshold_value: number;
  current_value: number;
  message: string;
}): Promise<void> {
  try {
    // Create alert in database
    const alert = await AlertModel.create(data);

    // Send via WebSocket
    sendAlertToUser(data.user_id, {
      id: alert.id,
      campaign_id: alert.campaign_id,
      campaign_name: undefined, // Will be populated by frontend
      type: alert.type as any,
      threshold_value: alert.threshold_value,
      current_value: alert.current_value,
      message: alert.message,
      created_at: alert.created_at,
    });

    console.log(`Alert created and sent to user ${data.user_id}: ${alert.id}`);
  } catch (error) {
    console.error('Error creating and sending alert:', error);
    throw error;
  }
}

/**
 * Schedule periodic threshold checks
 * In production, use a proper job scheduler like node-cron
 */
export function startThresholdMonitoring(): void {
  console.log('Starting threshold monitoring service...');
  
  // Check all active campaigns every 5 minutes
  const checkInterval = 5 * 60 * 1000; // 5 minutes
  
  setInterval(async () => {
    try {
      // In production, fetch all active campaigns and check their metrics
      // For now, this is a placeholder for the monitoring logic
      console.log('Threshold monitoring check completed');
    } catch (error) {
      console.error('Error in threshold monitoring:', error);
    }
  }, checkInterval);
}

/**
 * Get default alert preferences for a user
 */
export function getDefaultAlertPreferences(): UserAlertPreferences {
  return {
    thresholds: {
      ctr: {
        type: 'ctr_threshold',
        threshold_value: 1.0,
        enabled: true,
      },
      budget: {
        type: 'budget_threshold',
        threshold_value: 80,
        enabled: true,
      },
      performance: {
        type: 'performance_drop',
        threshold_value: 50,
        enabled: true,
      },
    },
    email_notifications: true,
    push_notifications: true,
  };
}
