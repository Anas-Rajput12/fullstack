import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  onRangeChange: (range: DateRange) => void;
  initialRange?: DateRange;
}

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onRangeChange,
  initialRange,
}) => {
  const [startDate, setStartDate] = useState(
    format(initialRange?.start || subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(initialRange?.end || new Date(), 'yyyy-MM-dd')
  );

  const handlePresetClick = (days: number) => {
    const start = startOfDay(subDays(new Date(), days));
    const end = endOfDay(new Date());
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    onRangeChange({ start, end });
  };

  const handleApply = () => {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    onRangeChange({ start, end });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Presets */}
        <div className="flex items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.days}
              onClick={() => handlePresetClick(preset.days)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Custom Range */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            From:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />

          <label className="text-sm text-gray-600 dark:text-gray-400">
            To:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />

          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Selected Range Display */}
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Selected:{' '}
        <span className="font-medium text-gray-900 dark:text-white">
          {format(new Date(startDate), 'MMM d, yyyy')} -{' '}
          {format(new Date(endDate), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
};

export default DateRangePicker;
