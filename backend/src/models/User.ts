import { pool } from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'account_manager' | 'creative_team' | 'marketing_analyst' | 'admin';
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

export interface UserPublic {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string | null;
}

export class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = TRUE';
    const { rows } = await pool.query<User>(query, [email.toLowerCase()]);
    return rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserPublic | null> {
    const query = `
      SELECT id, email, role, created_at, last_login
      FROM users
      WHERE id = $1 AND is_active = TRUE
    `;
    const { rows } = await pool.query<UserPublic>(query, [id]);
    return rows[0] || null;
  }

  /**
   * Create new user
   */
  static async create(data: {
    email: string;
    password_hash: string;
    role?: string;
  }): Promise<UserPublic> {
    const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at, last_login
    `;
    const { rows } = await pool.query<UserPublic>(query, [
      data.email.toLowerCase(),
      data.password_hash,
      data.role || 'account_manager',
    ]);
    return rows[0];
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Get all users (admin only)
   */
  static async findAll(limit: number = 100, offset: number = 0): Promise<UserPublic[]> {
    const query = `
      SELECT id, email, role, created_at, last_login
      FROM users
      WHERE is_active = TRUE
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query<UserPublic>(query, [limit, offset]);
    return rows;
  }

  /**
   * Soft delete user
   */
  static async softDelete(id: string): Promise<void> {
    const query = 'UPDATE users SET is_active = FALSE WHERE id = $1';
    await pool.query(query, [id]);
  }
}

export default UserModel;
