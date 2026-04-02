import { pool } from '../config/database';

export interface Campaign {
  id: string;
  name: string;
  account_manager_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  start_date: string;
  end_date: string | null;
  target_audience: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithMetrics extends Campaign {
  ctr: number | null;
  budget_utilization: number;
  account_manager_name?: string;
}

export interface CampaignFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class CampaignModel {
  /**
   * Get all campaigns with optional filtering
   */
  static async findAll(filters: CampaignFilters = {}): Promise<{
    campaigns: CampaignWithMetrics[];
    total: number;
  }> {
    const {
      start_date,
      end_date,
      status,
      page = 1,
      limit = 20,
    } = filters;

    const offset = (page - 1) * limit;

    // Build dynamic query
    let whereClause = 'WHERE c.is_active = TRUE';
    const values: any[] = [];
    let paramIndex = 1;

    if (start_date) {
      values.push(start_date);
      whereClause += ` AND c.start_date >= $${paramIndex++}`;
    }

    if (end_date) {
      values.push(end_date);
      whereClause += ` AND c.end_date <= $${paramIndex++}`;
    }

    if (status) {
      values.push(status);
      whereClause += ` AND c.status = $${paramIndex++}`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM campaigns c
      ${whereClause}
    `;
    const countResult = await pool.query<{ total: string }>(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get campaigns
    const query = `
      SELECT
        c.*,
        CASE
          WHEN c.impressions > 0 THEN (c.clicks::DECIMAL / c.impressions::DECIMAL) * 100
          ELSE NULL
        END as ctr,
        CASE
          WHEN c.budget > 0 THEN (c.spent / c.budget) * 100
          ELSE 0
        END as budget_utilization,
        u.email as account_manager_name
      FROM campaigns c
      LEFT JOIN users u ON c.account_manager_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);
    const { rows } = await pool.query<CampaignWithMetrics>(query, values);

    return {
      campaigns: rows,
      total,
    };
  }

  /**
   * Get campaign by ID
   */
  static async findById(id: string): Promise<CampaignWithMetrics | null> {
    const query = `
      SELECT
        c.*,
        CASE
          WHEN c.impressions > 0 THEN (c.clicks::DECIMAL / c.impressions::DECIMAL) * 100
          ELSE NULL
        END as ctr,
        CASE
          WHEN c.budget > 0 THEN (c.spent / c.budget) * 100
          ELSE 0
        END as budget_utilization,
        u.email as account_manager_name
      FROM campaigns c
      LEFT JOIN users u ON c.account_manager_id = u.id
      WHERE c.id = $1 AND c.is_active = TRUE
    `;
    const { rows } = await pool.query<CampaignWithMetrics>(query, [id]);
    return rows[0] || null;
  }

  /**
   * Create new campaign
   */
  static async create(data: {
    name: string;
    account_manager_id: string;
    status?: string;
    budget: number;
    spent?: number;
    start_date: string;
    end_date?: string | null;
    target_audience?: string | null;
  }): Promise<Campaign> {
    const query = `
      INSERT INTO campaigns (
        name, account_manager_id, status, budget, spent,
        start_date, end_date, target_audience
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const { rows } = await pool.query<Campaign>(query, [
      data.name,
      data.account_manager_id,
      data.status || 'draft',
      data.budget,
      data.spent || 0,
      data.start_date,
      data.end_date || null,
      data.target_audience || null,
    ]);
    return rows[0];
  }

  /**
   * Update campaign
   */
  static async update(
    id: string,
    data: Partial<{
      name: string;
      status: string;
      budget: number;
      spent: number;
      start_date: string;
      end_date: string | null;
      target_audience: string | null;
      impressions: number;
      clicks: number;
      conversions: number;
    }>
  ): Promise<Campaign | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(value);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE campaigns
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND is_active = TRUE
      RETURNING *
    `;
    const { rows } = await pool.query<Campaign>(query, values);
    return rows[0] || null;
  }

  /**
   * Soft delete campaign
   */
  static async softDelete(id: string): Promise<void> {
    const query = `
      UPDATE campaigns
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }

  /**
   * Update campaign metrics
   */
  static async updateMetrics(
    id: string,
    metrics: {
      impressions?: number;
      clicks?: number;
      conversions?: number;
      spent?: number;
    }
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(metrics)) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(value);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE campaigns
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
    `;
    await pool.query(query, values);
  }
}

export default CampaignModel;
