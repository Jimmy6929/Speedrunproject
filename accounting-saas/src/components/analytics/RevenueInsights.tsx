interface RevenueMonth {
  month: string;
  total: number;
  date: Date;
}

interface RevenueChange {
  month: string;
  prevMonth: string;
  percentChange: number;
  revenue: number;
  prevRevenue: number;
  isSignificant: boolean;
}

interface RevenueInsightsProps {
  topMonths: RevenueMonth[];
  biggestRevenueSwing: RevenueChange | null;
  formatCurrency: (amount: number) => string;
}

export default function RevenueInsights({
  topMonths,
  biggestRevenueSwing,
  formatCurrency
}: RevenueInsightsProps) {
  // Get highest revenue month
  const highestRevenueMonth = topMonths.length > 0 ? topMonths[0] : null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
      <h3 className="text-md font-medium text-blue-700 dark:text-blue-300 mb-3">Revenue Performance</h3>
      
      {highestRevenueMonth && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Your highest revenue month was {highestRevenueMonth.month} ({formatCurrency(highestRevenueMonth.total)})
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {topMonths.length > 1 ? `Followed by ${topMonths[1].month} (${formatCurrency(topMonths[1].total)})` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {biggestRevenueSwing && (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className={`p-2 rounded-full mr-3 ${
              biggestRevenueSwing.percentChange > 0 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                biggestRevenueSwing.percentChange > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} viewBox="0 0 20 20" fill="currentColor">
                {biggestRevenueSwing.percentChange > 0 
                  ? <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                }
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Revenue {biggestRevenueSwing.percentChange > 0 ? 'increased' : 'decreased'} by {Math.abs(biggestRevenueSwing.percentChange).toFixed(1)}% in {biggestRevenueSwing.month}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(biggestRevenueSwing.prevRevenue)} → {formatCurrency(biggestRevenueSwing.revenue)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 