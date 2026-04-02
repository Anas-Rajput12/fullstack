import { Router } from 'express';
import { login } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { loginSchema } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and return JWT tokens
 * @access Public
 */
router.post('/login', authLimiter, validateRequest(loginSchema), login);

export default router;
