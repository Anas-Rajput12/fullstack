import { Request, Response } from 'express';
import CampaignModel from '../models/Campaign';
import { checkCampaignThresholds } from '../services/notificationService';

/**
 * Update campaign metrics and check thresholds
 * POST /api/v1/campaigns/:id/metrics
 */
export async function updateCampaignMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { impressions, clicks, conversions, spent } = req.body;

    // Get campaign to get budget
    const campaign = await CampaignModel.findById(id);
    
    if (!campaign) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        },
      });
      return;
    }

    // Update metrics
    await CampaignModel.updateMetrics(id, {
      impressions,
      clicks,
      conversions,
      spent,
    });

    // Check thresholds and trigger alerts
    await checkCampaignThresholds(id, {
      impressions,
      clicks,
      conversions,
      spent,
      budget: campaign.budget,
    });

    res.status(200).json({
      message: 'Metrics updated successfully',
      alerts_triggered: true,
    });
  } catch (error: any) {
    console.error('Update metrics error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update metrics',
      },
    });
  }
}
