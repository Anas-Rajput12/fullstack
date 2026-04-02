import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Connect to WebSocket server
   * @param userId - User ID for room joining
   */
  connect(userId?: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: this.maxReconnectAttempts,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Join user-specific room if userId provided
      if (userId) {
        this.socket?.emit('join', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected by client');
    }
  }

  /**
   * Join user room
   * @param userId - User ID
   */
  joinUserRoom(userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join', userId);
      console.log('Joined user room:', userId);
    }
  }

  /**
   * Listen for new alerts
   * @param callback - Alert handler
   */
  onAlert(callback: (alert: any) => void): void {
    if (this.socket) {
      this.socket.on('alert:new', callback);
    }
  }

  /**
   * Acknowledge alert receipt
   * @param alertId - Alert ID
   * @param userId - User ID
   */
  acknowledgeAlert(alertId: string, userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('alert:ack', { alertId, userId });
    }
  }

  /**
   * Remove alert listener
   * @param event - Event name
   */
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
export default wsService;
