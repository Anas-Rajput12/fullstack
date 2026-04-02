import { pool } from '../config/database';

export interface Alert {
  id: string;
  campaign_id: string;
  user_id: string;
  type: 'ctr_threshold' | 'budget_threshold' | 'performance_drop';
  threshold_value: number;
  current_value: number;
  message: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  read_at: string | null;
  campaign_name?: string;
}

export class AlertModel {
  /**
   * Get all alerts for a user
   */
  static async findAllByUser(
    userId: string,
    filters: { is_read?: boolean; limit?: number; before?: string },
    limit: number = 50
  ): Promise<Alert[]> {
    let query = `
      SELECT
        a.*,
        c.name as campaign_name
      FROM alerts a
      LEFT JOIN campaigns c ON a.campaign_id = c.id
      WHERE a.user_id = $1
    `;
    
    const values: any[] = [userId];
    let paramIndex = 2;

    if (filters.is_read !== undefined) {
      values.push(filters.is_read);
      query += ` AND a.is_read = $${paramIndex++}`;
    }

    if (filters.before) {
      values.push(filters.before);
      query += ` AND a.created_at < $${paramIndex++}`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex++}`;
    values.push(limit);

    const { rows } = await pool.query<Alert>(query, values);
    return rows;
  }

  /**
   * Get unread alert count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM alerts
      WHERE user_id = $1 AND is_read = FALSE
    `;
    const { rows } = await pool.query<{ count: string }>(query, [userId]);
    return parseInt(rows[0].count, 10);
  }

  /**
   * Mark alert as read
   */
  static async markAsRead(id: string, userId: string): Promise<Alert | null> {
    const query = `
      UPDATE alerts
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query<Alert>(query, [id, userId]);
    return rows[0] || null;
  }

  /**
   * Mark all alerts as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const query = `
      UPDATE alerts
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = FALSE
    `;
    await pool.query(query, [userId]);
  }

  /**
   * Create new alert
   */
  static async create(data: {
    campaign_id: string;
    user_id: string;
    type: string;
    threshold_value: number;
    current_value: number;
    message: string;
  }): Promise<Alert> {
    const query = `
      INSERT INTO alerts (
        campaign_id, user_id, type, threshold_value,
        current_value, message, is_read, is_dismissed
      )
      VALUES ($1, $2, $3, $4, $5, $6, FALSE, FALSE)
      RETURNING *
    `;
    const { rows } = await pool.query<Alert>(query, [
      data.campaign_id,
      data.user_id,
      data.type,
      data.threshold_value,
      data.current_value,
      data.message,
    ]);
    return rows[0];
  }

  /**
   * Delete alert
   */
  static async delete(id: string, userId: string): Promise<void> {
    const query = `
      DELETE FROM alerts
      WHERE id = $1 AND user_id = $2
    `;
    await pool.query(query, [id, userId]);
  }

  /**
   * Get alerts by campaign
   */
  static async findByCampaign(campaignId: string, limit: number = 100): Promise<Alert[]> {
    const query = `
      SELECT * FROM alerts
      WHERE campaign_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query<Alert>(query, [campaignId, limit]);
    return rows;
  }
}

export default AlertModel;
