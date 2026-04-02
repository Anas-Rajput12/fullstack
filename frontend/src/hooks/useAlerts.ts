import { useState, useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { api } from '../services/api';
import authService from '../services/auth';

export interface Alert {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  type: 'ctr_threshold' | 'budget_threshold' | 'performance_drop';
  threshold_value: number | string;
  current_value: number | string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UseAlertsResult {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.alerts.list({ limit: 50 });
      setAlerts(response.data.data || []);
      setUnreadCount(response.data.meta?.unread_count || 0);
    } catch (err: any) {
      console.error('Failed to fetch alerts:', err);
      setError(err.response?.data?.error?.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.alerts.markAsRead(id);
      
      // Update local state
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, is_read: true } : alert
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Acknowledge via WebSocket
      const user = authService.getCurrentUser();
      if (user) {
        wsService.acknowledgeAlert(id, user.id);
      }
    } catch (err: any) {
      console.error('Failed to mark alert as read:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to mark alert as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.alerts.markAllAsRead();
      setAlerts((prev) => prev.map((alert) => ({ ...alert, is_read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all alerts as read:', err);
    }
  }, []);

  const deleteAlert = useCallback(async (id: string) => {
    try {
      await api.alerts.delete(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    } catch (err: any) {
      console.error('Failed to delete alert:', err);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    // Connect to WebSocket
    wsService.connect(user.id);

    // Listen for new alerts
    wsService.onAlert((alert: Alert) => {
      // Add new alert to the top of the list
      setAlerts((prev) => [alert, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Campaign Alert', {
          body: alert.message,
          icon: '/favicon.ico',
          tag: alert.id,
        });
      }
    });

    setIsConnected(true);
  }, []);

  const disconnectWebSocket = useCallback(() => {
    wsService.off('alert:new');
    wsService.disconnect();
    setIsConnected(false);
  }, []);

  // Auto-connect on mount if user is authenticated
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      connectWebSocket();
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  return {
    alerts,
    unreadCount,
    isLoading,
    error,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    connectWebSocket,
    disconnectWebSocket,
  };
}

export default useAlerts;
