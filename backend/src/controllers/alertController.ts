import { Request, Response } from 'express';
import AlertModel from '../models/Alert';

/**
 * List user's alerts
 * GET /api/v1/alerts
 */
export async function listAlerts(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const { is_read, limit, before } = req.query;

    const alerts = await AlertModel.findAllByUser(
      userId,
      {
        is_read: is_read !== undefined ? is_read === 'true' : undefined,
        before: before as string,
      },
      limit ? parseInt(limit as string, 10) : 50
    );

    const unreadCount = await AlertModel.getUnreadCount(userId);

    res.status(200).json({
      data: alerts,
      meta: {
        unread_count: unreadCount,
      },
    });
  } catch (error: any) {
    console.error('List alerts error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve alerts',
      },
    });
  }
}

/**
 * Mark alert as read
 * POST /api/v1/alerts/:id/read
 */
export async function markAlertAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const alert = await AlertModel.markAsRead(id, userId);

    if (!alert) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Alert not found',
        },
      });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Mark alert read error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark alert as read',
      },
    });
  }
}

/**
 * Mark all alerts as read
 * POST /api/v1/alerts/read-all
 */
export async function markAllAlertsAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;

    await AlertModel.markAllAsRead(userId);

    res.status(204).send();
  } catch (error: any) {
    console.error('Mark all alerts read error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark all alerts as read',
      },
    });
  }
}

/**
 * Delete alert
 * DELETE /api/v1/alerts/:id
 */
export async function deleteAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    await AlertModel.delete(id, userId);

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete alert',
      },
    });
  }
}

/**
 * Get unread alert count
 * GET /api/v1/alerts/unread-count
 */
export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const count = await AlertModel.getUnreadCount(userId);

    res.status(200).json({
      count,
    });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get unread count',
      },
    });
  }
}
