import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export interface Alert {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  type: 'ctr_threshold' | 'budget_threshold' | 'performance_drop';
  threshold_value: number;
  current_value: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface AlertItemProps {
  alert: Alert;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({
  alert,
  onMarkAsRead,
  onDelete,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ctr_threshold':
        return '🎯';
      case 'budget_threshold':
        return '💰';
      case 'performance_drop':
        return '📉';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ctr_threshold':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'budget_threshold':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'performance_drop':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleAlertClick = () => {
    if (!alert.is_read) {
      onMarkAsRead();
    }
    // In a real app, navigate to campaign details
    console.log('Navigate to campaign:', alert.campaign_id);
  };

  return (
    <div
      onClick={handleAlertClick}
      className={`p-4 border-l-4 cursor-pointer transition-colors ${getTypeColor(
        alert.type
      )} ${
        alert.is_read
          ? 'opacity-60'
          : 'bg-white dark:bg-gray-800'
      } hover:bg-gray-50 dark:hover:bg-gray-700`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {getTypeIcon(alert.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <p className={`text-sm ${
            alert.is_read
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-gray-900 dark:text-white font-medium'
          }`}>
            {alert.message}
          </p>

          {/* Details */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {alert.campaign_name || `Campaign: ${alert.campaign_id.slice(0, 8)}...`}
            </span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Metrics */}
          <div className="mt-2 flex items-center gap-4 text-xs">
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">Threshold: </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {alert.threshold_value}
                {alert.type === 'ctr_threshold' ? '%' : alert.type === 'budget_threshold' ? '%' : ''}
              </span>
            </div>
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">Current: </span>
              <span className={`font-medium ${
                alert.type === 'ctr_threshold' && alert.current_value < alert.threshold_value
                  ? 'text-red-600'
                  : alert.type === 'budget_threshold' && alert.current_value >= alert.threshold_value
                  ? 'text-red-600'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {typeof alert.current_value === 'number' 
                  ? alert.current_value.toFixed(2) 
                  : alert.current_value}
                {alert.type === 'ctr_threshold' ? '%' : alert.type === 'budget_threshold' ? '%' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!alert.is_read && (
            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete alert"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;
