import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import UserModel from '../models/User';
import env from '../config/env';

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);

    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret as Secret,
      { expiresIn: env.jwtAccessExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.jwtRefreshSecret as Secret,
      { expiresIn: env.jwtRefreshExpiry } as jwt.SignOptions
    );

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Return user data (without password hash)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login,
    };

    res.status(200).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userData,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Refresh token is required',
        },
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, env.jwtRefreshSecret) as {
      id: string;
    };

    // Get user from database
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        },
      });
      return;
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret as Secret,
      { expiresIn: env.jwtAccessExpiry } as jwt.SignOptions
    );

    res.status(200).json({
      access_token: accessToken,
    });
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Refresh token has expired',
        },
      });
      return;
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Token refresh failed',
      },
    });
  }
}

/**
 * Logout user (client-side should clear tokens)
 * POST /api/v1/auth/logout
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  // In a real app, you might invalidate the refresh token here
  // by adding it to a blacklist in Redis
  res.status(200).json({
    message: 'Logout successful',
  });
}
