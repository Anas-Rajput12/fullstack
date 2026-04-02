import React, { useState, useRef, useEffect } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import AlertItem from './AlertItem';
import LoadingSpinner from '../common/LoadingSpinner';

interface NotificationCenterProps {
  position?: 'top-right' | 'bottom-right';
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  position = 'top-right',
}) => {
  const { alerts, unreadCount, isLoading, markAsRead, markAllAsRead, deleteAlert, fetchAlerts } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const positionClasses = {
    'top-right': 'top-16 right-6',
    'bottom-right': 'bottom-6 right-6',
  };

  return (
    <div className={`relative ${positionClasses[position]}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-2">🎉</span>
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {alerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={() => markAsRead(alert.id)}
                    onDelete={() => deleteAlert(alert.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
