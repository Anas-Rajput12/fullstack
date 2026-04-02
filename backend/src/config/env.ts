import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  aiServiceUrl: string;
  aiServiceApiKey: string;
  redisUrl: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  frontendUrl: string;
  logLevel: string;
}

export const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3003', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  aiServiceApiKey: process.env.AI_SERVICE_API_KEY || 'internal-api-key',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'debug',
};

// Validate required environment variables
const required = ['databaseUrl', 'jwtSecret', 'jwtRefreshSecret'];
const missing = required.filter((key) => !env[key as keyof EnvConfig]);

if (missing.length > 0 && env.nodeEnv !== 'development') {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

export default env;
