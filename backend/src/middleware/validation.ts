import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['account_manager', 'creative_team', 'marketing_analyst', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Campaign schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  account_manager_id: z.string().uuid('Invalid account manager ID').optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  budget: z.number().positive('Budget must be positive'),
  spent: z.number().nonnegative('Spent must be non-negative').optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').nullable().optional(),
  target_audience: z.string().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

// Alert schemas
export const createAlertSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  user_id: z.string().uuid('Invalid user ID'),
  type: z.enum(['ctr_threshold', 'budget_threshold', 'performance_drop']),
  threshold_value: z.number(),
  current_value: z.number(),
  message: z.string().max(1000, 'Message must be less than 1000 characters'),
});

// Creative Brief schemas
export const briefMessageSchema = z.object({
  message: z.string(),
  priority: z.enum(['primary', 'secondary', 'tertiary']),
  supporting_points: z.array(z.string()).optional(),
});

export const createBriefSchema = z.object({
  campaign_id: z.string().uuid().nullable().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  objectives: z.string().min(50, 'Objectives must be at least 50 characters'),
  target_audience: z.string().min(50, 'Target audience must be at least 50 characters'),
  key_messages: z.array(briefMessageSchema).optional(),
  brand_voice: z.enum(['professional', 'casual', 'urgent', 'friendly']).optional(),
  ai_generated_copy: z.any().optional(),
  social_posts: z.any().optional(),
  hashtags: z.any().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'exported']).optional(),
});

export const generateBriefRequestSchema = z.object({
  campaign_id: z.string().uuid().nullable().optional(),
  objectives: z.string().min(50),
  target_audience: z.string().min(50),
  brand_voice: z.enum(['professional', 'casual', 'urgent', 'friendly']).optional(),
  key_messages: z.array(z.string()).optional(),
});

// Export validation helpers
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateBriefInput = z.infer<typeof createBriefSchema>;

// Validation middleware functions
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors,
          },
        });
        return;
      }

      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query as any);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: errors,
          },
        });
        return;
      }

      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid URL parameters',
            details: errors,
          },
        });
        return;
      }

      next(error);
    }
  };
}
