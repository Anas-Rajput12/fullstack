import { Request, Response } from 'express';
import CampaignModel from '../models/Campaign';
import { sendAlertToUser } from '../websocket/socketHandler';

/**
 * List all campaigns
 * GET /api/v1/campaigns
 */
export async function listCampaigns(req: Request, res: Response): Promise<void> {
  try {
    const { start_date, end_date, status, page, limit } = req.query;

    const filters = {
      start_date: start_date as string,
      end_date: end_date as string,
      status: status as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    };

    const result = await CampaignModel.findAll(filters);

    res.status(200).json({
      data: result.campaigns,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        has_more: filters.page * filters.limit < result.total,
      },
    });
  } catch (error: any) {
    console.error('List campaigns error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve campaigns',
      },
    });
  }
}

/**
 * Get campaign by ID
 * GET /api/v1/campaigns/:id
 */
export async function getCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

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

    res.status(200).json({
      data: campaign,
    });
  } catch (error: any) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve campaign',
      },
    });
  }
}

/**
 * Create new campaign
 * POST /api/v1/campaigns
 */
export async function createCampaign(req: Request, res: Response): Promise<void> {
  try {
    const campaignData = req.body;

    // Get account manager ID from authenticated user
    const account_manager_id = (req as any).user?.id || campaignData.account_manager_id;

    const campaign = await CampaignModel.create({
      ...campaignData,
      account_manager_id,
    });

    res.status(201).json({
      data: campaign,
    });
  } catch (error: any) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create campaign',
      },
    });
  }
}

/**
 * Update campaign
 * PUT /api/v1/campaigns/:id
 */
export async function updateCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const campaign = await CampaignModel.update(id, updateData);

    if (!campaign) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        },
      });
      return;
    }

    res.status(200).json({
      data: campaign,
    });
  } catch (error: any) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update campaign',
      },
    });
  }
}

/**
 * Delete campaign
 * DELETE /api/v1/campaigns/:id
 */
export async function deleteCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await CampaignModel.softDelete(id);

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete campaign',
      },
    });
  }
}

/**
 * Update campaign metrics (internal use, called by analytics service)
 * POST /api/v1/campaigns/:id/metrics
 */
export async function updateCampaignMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { impressions, clicks, conversions, spent } = req.body;

    await CampaignModel.updateMetrics(id, {
      impressions,
      clicks,
      conversions,
      spent,
    });

    // Check if any thresholds are crossed
    const campaign = await CampaignModel.findById(id);
    if (campaign) {
      // Budget threshold check (80%)
      if (campaign.budget_utilization >= 80) {
        sendAlertToUser(campaign.account_manager_id, {
          id: `alert_${Date.now()}`,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          type: 'budget_threshold',
          threshold_value: 80,
          current_value: campaign.budget_utilization,
          message: `Campaign "${campaign.name}" has reached ${campaign.budget_utilization.toFixed(1)}% of budget`,
          created_at: new Date().toISOString(),
        });
      }

      // CTR threshold check (< 1%)
      if (campaign.ctr !== null && campaign.ctr < 1.0) {
        sendAlertToUser(campaign.account_manager_id, {
          id: `alert_${Date.now()}`,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          type: 'ctr_threshold',
          threshold_value: 1.0,
          current_value: campaign.ctr,
          message: `Campaign "${campaign.name}" CTR has dropped to ${campaign.ctr.toFixed(2)}%`,
          created_at: new Date().toISOString(),
        });
      }
    }

    res.status(200).json({
      message: 'Metrics updated successfully',
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
