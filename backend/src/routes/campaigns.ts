import { Router } from 'express';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createCampaignSchema, updateCampaignSchema } from '../middleware/validation';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/campaigns
 * @desc Get all campaigns with optional filtering
 * @access Private
 */
router.get('/', listCampaigns);

/**
 * @route POST /api/v1/campaigns
 * @desc Create a new campaign
 * @access Private
 */
router.post('/', validateRequest(createCampaignSchema), createCampaign);

/**
 * @route GET /api/v1/campaigns/:id
 * @desc Get a specific campaign by ID
 * @access Private
 */
router.get('/:id', getCampaign);

/**
 * @route PUT /api/v1/campaigns/:id
 * @desc Update a campaign
 * @access Private
 */
router.put('/:id', validateRequest(updateCampaignSchema), updateCampaign);

/**
 * @route DELETE /api/v1/campaigns/:id
 * @desc Delete a campaign
 * @access Private
 */
router.delete('/:id', deleteCampaign);

export default router;
