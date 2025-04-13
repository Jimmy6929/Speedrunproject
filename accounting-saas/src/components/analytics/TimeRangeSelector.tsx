interface TimeRangeSelectorProps {
  timeRange: 'all' | '6m' | '1y';
  onChange: (range: 'all' | '6m' | '1y') => void;
}

export default function TimeRangeSelector({ timeRange, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="mb-6 flex items-center justify-end">
      <div className="inline-flex items-center rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => onChange('all')}
          className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
            timeRange === 'all'
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Time
        </button>
        <button
          type="button"
          onClick={() => onChange('1y')}
          className={`px-4 py-2 text-sm font-medium border-t border-b ${
            timeRange === '1y'
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Last Year
        </button>
        <button
          type="button"
          onClick={() => onChange('6m')}
          className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
            timeRange === '6m'
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Last 6 Months
        </button>
      </div>
    </div>
  );
} 