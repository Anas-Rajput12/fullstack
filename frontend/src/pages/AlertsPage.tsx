import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import ThemeToggle from '../components/common/ThemeToggle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTheme } from '../hooks/useTheme';
import { useAlerts, Alert } from '../hooks/useAlerts';
import { format } from 'date-fns';

const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { alerts, unreadCount, isLoading, fetchAlerts, markAsRead, markAllAsRead, deleteAlert } = useAlerts();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !alert.is_read) ||
      (filter === 'read' && alert.is_read);
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    return matchesFilter && matchesType;
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert(id);
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'ctr_threshold':
        return '📉';
      case 'budget_threshold':
        return '💰';
      case 'performance_drop':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'ctr_threshold':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'budget_threshold':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'performance_drop':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const stats = {
    total: alerts.length,
    unread: alerts.filter((a) => !a.is_read).length,
    read: alerts.filter((a) => a.is_read).length,
    ctr: alerts.filter((a) => a.type === 'ctr_threshold').length,
    budget: alerts.filter((a) => a.type === 'budget_threshold').length,
    performance: alerts.filter((a) => a.type === 'performance_drop').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-20'}`}>
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
              aria-label="Toggle sidebar"
            >
              <span className="text-xl sm:text-2xl">☰</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              Alerts
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
                Mark all read
              </button>
            )}
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Alerts</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                </div>
                <span className="text-3xl sm:text-4xl">🔔</span>
              </div>
            </div>
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Unread</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{stats.unread}</p>
                </div>
                <span className="text-3xl sm:text-4xl">📬</span>
              </div>
            </div>
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Budget Alerts</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">{stats.budget}</p>
                </div>
                <span className="text-3xl sm:text-4xl">💰</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Unread ({stats.unread})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    filter === 'read'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Read ({stats.read})
                </button>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input text-xs sm:text-sm sm:w-48"
              >
                <option value="all">All Types</option>
                <option value="ctr_threshold">CTR Threshold</option>
                <option value="budget_threshold">Budget Threshold</option>
                <option value="performance_drop">Performance Drop</option>
              </select>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="card p-8 sm:p-12 text-center">
                <span className="text-5xl sm:text-6xl block mb-4">🎉</span>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No alerts found
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  {filter === 'unread'
                    ? 'All caught up! No unread alerts.'
                    : 'No alerts match your current filters.'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`card p-4 sm:p-6 border-l-4 transition-all duration-200 hover:-translate-y-0.5 ${
                    alert.is_read
                      ? 'border-gray-300 dark:border-gray-600 opacity-75'
                      : 'border-blue-500 dark:border-blue-400'
                  } ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{getAlertIcon(alert.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {alert.campaign_name || 'Campaign Alert'}
                          </h3>
                          {!alert.is_read && (
                            <span className="badge badge-primary flex-shrink-0">
                              New
                            </span>
                          )}
                          <span className="badge badge-gray text-xs flex-shrink-0">
                            {alert.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 break-words">
                          {alert.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span className="whitespace-nowrap">
                            📅 {format(new Date(alert.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                          <span className="whitespace-nowrap">
                            📊 Threshold: {alert.threshold_value} | Current: {Number(alert.current_value).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                      {!alert.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Delete alert"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlertsPage;
