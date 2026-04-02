import { Router } from 'express';
import {
  listBriefs,
  getBrief,
  saveBrief,
  updateBrief,
  deleteBrief,
  generateBrief,
  exportBrief,
} from '../controllers/briefController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createBriefSchema, generateBriefRequestSchema } from '../middleware/validation';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All brief routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/briefs
 * @desc Get user's creative briefs with pagination
 * @access Private
 */
router.get('/', listBriefs);

/**
 * @route POST /api/v1/briefs
 * @desc Save or update a creative brief
 * @access Private
 */
router.post('/', validateRequest(createBriefSchema), saveBrief);

/**
 * @route GET /api/v1/briefs/:id
 * @desc Get a specific brief by ID
 * @access Private
 */
router.get('/:id', getBrief);

/**
 * @route PUT /api/v1/briefs/:id
 * @desc Update an existing brief
 * @access Private
 */
router.put('/:id', updateBrief);

/**
 * @route DELETE /api/v1/briefs/:id
 * @desc Delete a brief
 * @access Private
 */
router.delete('/:id', deleteBrief);

/**
 * @route POST /api/v1/briefs/generate
 * @desc Generate AI creative brief (SSE stream)
 * @access Private
 */
router.post('/generate', aiLimiter, validateRequest(generateBriefRequestSchema), generateBrief);

/**
 * @route POST /api/v1/briefs/:id/export
 * @desc Export brief as PDF
 * @access Private
 */
router.post('/:id/export', exportBrief);

export default router;
