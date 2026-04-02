import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env';
import { generalLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaigns';
import alertRoutes from './routes/alerts';
import briefRoutes from './routes/briefs';

// Import WebSocket handler
import { initializeWebSocket } from './websocket/socketHandler';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/briefs', briefRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
    path: _req.path,
    method: _req.method,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.nodeEnv === 'development' ? err.message : 'Internal server error',
    },
  });
});

// Server setup
const PORT = env.port;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  Campaign Dashboard Backend API                ║
╠════════════════════════════════════════════════╣
║  Environment: ${env.nodeEnv.padEnd(30)}║
║  Port: ${String(PORT).padEnd(34)}║
║  API Version: v1                               ║
╚════════════════════════════════════════════════╝
  `);
});

// Initialize WebSocket
initializeWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
