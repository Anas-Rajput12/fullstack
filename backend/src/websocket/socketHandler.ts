import { Server, Socket } from 'socket.io';
import http from 'http';
import env from '../config/env';

interface AlertData {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  type: string;
  threshold_value: number;
  current_value: number;
  message: string;
  created_at: string;
}

let io: Server;

export function initializeWebSocket(server: http.Server): void {
  io = new Server(server, {
    cors: {
      origin: env.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    console.log('✅ WebSocket client connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId: string) => {
      const roomName = `user:${userId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
    });

    // Handle alert acknowledgment
    socket.on('alert:ack', (data: { alertId: string; userId: string }) => {
      console.log(`Alert ${data.alertId} acknowledged by user ${data.userId}`);
      // Could update database here if needed
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ WebSocket client disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('✅ WebSocket server initialized');
}

/**
 * Send alert to specific user
 * @param userId - User ID to send alert to
 * @param alert - Alert data
 */
export function sendAlertToUser(userId: string, alert: AlertData): void {
  if (!io) {
    console.warn('WebSocket not initialized, skipping alert send');
    return;
  }

  const roomName = `user:${userId}`;
  
  io.to(roomName).emit('alert:new', {
    type: 'alert:new',
    data: alert,
  });

  console.log(`Alert sent to room ${roomName}:`, alert.type);
}

/**
 * Broadcast notification to multiple users
 * @param userIds - Array of user IDs
 * @param alert - Alert data
 */
export function broadcastAlertToUsers(userIds: string[], alert: AlertData): void {
  if (!io) {
    console.warn('WebSocket not initialized, skipping alert broadcast');
    return;
  }

  userIds.forEach((userId) => {
    sendAlertToUser(userId, alert);
  });
}

/**
 * Get WebSocket IO instance
 * @returns Socket.IO server instance
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket not initialized. Call initializeWebSocket first.');
  }
  return io;
}
