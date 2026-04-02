import { pool } from '../config/database';

export interface CreativeBrief {
  id: string;
  campaign_id: string | null;
  user_id: string;
  title: string;
  objectives: string;
  target_audience: string;
  key_messages: any[];
  brand_voice: 'professional' | 'casual' | 'urgent' | 'friendly';
  ai_generated_copy: any | null;
  social_posts: any | null;
  hashtags: any | null;
  status: 'draft' | 'in_progress' | 'completed' | 'exported';
  exported_pdf_url: string | null;
  word_count: number | null;
  created_at: string;
  updated_at: string;
}

export class CreativeBriefModel {
  /**
   * Get all briefs for a user
   */
  static async findAllByUser(
    userId: string,
    filters: { status?: string; campaign_id?: string },
    limit: number = 20,
    offset: number = 0
  ): Promise<{ briefs: CreativeBrief[]; total: number }> {
    let whereClause = 'WHERE user_id = $1';
    const values: any[] = [userId];
    let paramIndex = 2;

    if (filters.status) {
      values.push(filters.status);
      whereClause += ` AND status = $${paramIndex++}`;
    }

    if (filters.campaign_id) {
      values.push(filters.campaign_id);
      whereClause += ` AND campaign_id = $${paramIndex++}`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM creative_briefs
      ${whereClause}
    `;
    const countResult = await pool.query<{ total: string }>(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get briefs
    const query = `
      SELECT * FROM creative_briefs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(limit, offset);

    const { rows } = await pool.query<CreativeBrief>(query, values);

    return {
      briefs: rows,
      total,
    };
  }

  /**
   * Get brief by ID
   */
  static async findById(id: string, userId?: string): Promise<CreativeBrief | null> {
    let query = `
      SELECT * FROM creative_briefs
      WHERE id = $1
    `;
    const values: any[] = [id];

    if (userId) {
      query += ` AND user_id = $2`;
      values.push(userId);
    }

    const { rows } = await pool.query<CreativeBrief>(query, values);
    return rows[0] || null;
  }

  /**
   * Create new brief
   */
  static async create(data: {
    user_id: string;
    campaign_id?: string | null;
    title: string;
    objectives: string;
    target_audience: string;
    key_messages?: any[];
    brand_voice?: string;
    ai_generated_copy?: any | null;
    social_posts?: any | null;
    hashtags?: any | null;
    status?: string;
    word_count?: number | null;
  }): Promise<CreativeBrief> {
    const query = `
      INSERT INTO creative_briefs (
        user_id, campaign_id, title, objectives, target_audience,
        key_messages, brand_voice, ai_generated_copy, social_posts,
        hashtags, status, word_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const { rows } = await pool.query<CreativeBrief>(query, [
      data.user_id,
      data.campaign_id || null,
      data.title,
      data.objectives,
      data.target_audience,
      JSON.stringify(data.key_messages || []),
      data.brand_voice || 'professional',
      data.ai_generated_copy ? JSON.stringify(data.ai_generated_copy) : null,
      data.social_posts ? JSON.stringify(data.social_posts) : null,
      data.hashtags ? JSON.stringify(data.hashtags) : null,
      data.status || 'draft',
      data.word_count || null,
    ]);

    return rows[0];
  }

  /**
   * Update brief
   */
  static async update(
    id: string,
    data: Partial<{
      title: string;
      objectives: string;
      target_audience: string;
      key_messages: any[];
      brand_voice: string;
      ai_generated_copy: any;
      social_posts: any;
      hashtags: any;
      status: string;
      word_count: number | null;
      exported_pdf_url: string | null;
    }>,
    userId: string
  ): Promise<CreativeBrief | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (key === 'key_messages' || key === 'ai_generated_copy' || key === 'social_posts' || key === 'hashtags') {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value ? JSON.stringify(value) : null);
      } else {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    values.push(userId);

    const query = `
      UPDATE creative_briefs
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const { rows } = await pool.query<CreativeBrief>(query, values);
    return rows[0] || null;
  }

  /**
   * Delete brief
   */
  static async delete(id: string, userId: string): Promise<void> {
    const query = `
      DELETE FROM creative_briefs
      WHERE id = $1 AND user_id = $2
    `;
    await pool.query(query, [id, userId]);
  }
}

export default CreativeBriefModel;
