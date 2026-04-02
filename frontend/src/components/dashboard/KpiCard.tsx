import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  isLoading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  icon = '📊',
  color = 'blue',
  isLoading = false,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30',
    yellow: 'from-yellow-500 to-yellow-600 shadow-yellow-500/30',
    red: 'from-red-500 to-red-600 shadow-red-500/30',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(0) + 'K';
      }
      if (val % 1 === 0) {
        return val.toLocaleString();
      }
      return val.toFixed(2);
    }
    return val;
  };

  const formatChange = (val?: number) => {
    if (val === undefined || val === null) return null;
    const isPositive = val > 0;
    const isNeutral = val === 0;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          isNeutral
            ? 'text-gray-500 dark:text-gray-400'
            : isPositive
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {isPositive ? '↑' : isNeutral ? '→' : '↓'} 
        {Math.abs(val).toFixed(1)}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="card p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6 group hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} 
                      flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:shadow-xl 
                      transition-all duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
        {formatChange(change)}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 
                    dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        {formatValue(value)}
      </p>
    </div>
  );
};

export default KpiCard;
