import { Line } from 'react-chartjs-2';
import { formatCurrency } from '@/utils/dateUtils';
import ChartContainer from './ChartContainer';

interface ForecastDataPoint {
  month: string;
  revenue: number;
}

interface RevenueForecastProps {
  forecastData: {
    hasForecast: boolean;
    forecasts: ForecastDataPoint[];
    historicalData: ForecastDataPoint[];
    avgRevenue: number;
    avgExpense: number;
  };
  chartData: any; // Chart.js data format
}

export default function RevenueForecast({ forecastData, chartData }: RevenueForecastProps) {
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  return (
    <ChartContainer title="Revenue Forecast" icon={icon} className="lg:col-span-2">
      {forecastData.hasForecast ? (
        <>
          <div className="h-64 mb-4">
            <Line 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">NEXT MONTH FORECAST</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                {forecastData.forecasts.length > 0 ? formatCurrency(forecastData.forecasts[0].revenue) : 'N/A'}
              </p>
              {forecastData.forecasts.length > 0 && forecastData.historicalData.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {forecastData.forecasts[0].revenue > forecastData.historicalData[forecastData.historicalData.length - 1].revenue ? '↑' : '↓'} {Math.abs(((forecastData.forecasts[0].revenue - forecastData.historicalData[forecastData.historicalData.length - 1].revenue) / forecastData.historicalData[forecastData.historicalData.length - 1].revenue) * 100).toFixed(1)}% from current
                </p>
              )}
            </div>
            
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">EXPECTED MONTHLY EXPENSES</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                {formatCurrency(forecastData.avgExpense)}
              </p>
              {forecastData.avgRevenue > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {((forecastData.avgExpense / forecastData.avgRevenue) * 100).toFixed(1)}% of average revenue
                </p>
              )}
            </div>
            
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">CASH FLOW PROJECTION</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                {forecastData.forecasts.length > 0 
                  ? formatCurrency(forecastData.forecasts[0].revenue - forecastData.avgExpense) 
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Net projected for next month
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm text-gray-500 dark:text-gray-400">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Forecast based on last {forecastData.historicalData.length} months of data. Months marked with * are projections.
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
            Insufficient data for forecasting. We need at least 3 months of historical data.
          </p>
        </div>
      )}
    </ChartContainer>
  );
} 