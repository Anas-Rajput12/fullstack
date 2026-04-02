import { Router } from 'express';
import {
  listAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  getUnreadCount,
} from '../controllers/alertController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All alert routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/alerts
 * @desc Get user's alerts with optional filtering
 * @access Private
 */
router.get('/', listAlerts);

/**
 * @route GET /api/v1/alerts/unread-count
 * @desc Get count of unread alerts
 * @access Private
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route POST /api/v1/alerts/:id/read
 * @desc Mark a specific alert as read
 * @access Private
 */
router.post('/:id/read', markAlertAsRead);

/**
 * @route POST /api/v1/alerts/read-all
 * @desc Mark all alerts as read
 * @access Private
 */
router.post('/read-all', markAllAlertsAsRead);

/**
 * @route DELETE /api/v1/alerts/:id
 * @desc Delete an alert
 * @access Private
 */
router.delete('/:id', deleteAlert);

export default router;
