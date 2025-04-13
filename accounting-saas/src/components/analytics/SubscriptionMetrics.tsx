import { ForecastData } from '@/hooks/useRevenueForecast';
import { ChurnRiskClient } from '@/hooks/useClientAnalytics';

interface SubscriptionMetricsProps {
  forecastData: ForecastData;
  churnRiskClients: ChurnRiskClient[];
  clientBehaviorCount: number;
  formatCurrency: (amount: number) => string;
}

export default function SubscriptionMetrics({
  forecastData, 
  churnRiskClients,
  clientBehaviorCount,
  formatCurrency
}: SubscriptionMetricsProps) {
  // Determine if we have enough data for subscription analysis
  const hasData = forecastData.hasForecast;
  
  // Calculate subscription metrics
  const subscriptionMetrics = {
    hasData,
    recurringClientsCount: forecastData.recurringClientsCount,
    estimatedMRR: forecastData.recurringRevenue,
    estimatedARR: forecastData.recurringRevenue * 12,
    revenueTrend: forecastData.revenueTrend,
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
        Subscription Analysis
      </h2>
      
      {subscriptionMetrics.hasData ? (
        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">RECURRING REVENUE</p>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(subscriptionMetrics.estimatedMRR)}
              </p>
              <p className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                per month
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Annual Value: {formatCurrency(subscriptionMetrics.estimatedARR)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurring Clients
              </p>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {subscriptionMetrics.recurringClientsCount}
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (subscriptionMetrics.recurringClientsCount / Math.max(1, clientBehaviorCount)) * 100)}%` }}>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {((subscriptionMetrics.recurringClientsCount / Math.max(1, clientBehaviorCount)) * 100).toFixed(1)}% of your client base
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Revenue Trend
              </p>
              <span className={`text-sm font-bold ${
                subscriptionMetrics.revenueTrend > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : subscriptionMetrics.revenueTrend < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
              }`}>
                {subscriptionMetrics.revenueTrend > 0 ? '+' : ''}
                {subscriptionMetrics.revenueTrend.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Last 6 months</span>
                <span className={subscriptionMetrics.revenueTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                  {subscriptionMetrics.revenueTrend > 0 ? '↗' : '↘'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Alerts section */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Alerts & Opportunities
            </h3>
            
            <div className="space-y-2">
              {subscriptionMetrics.revenueTrend > 10 && (
                <div className="flex items-start text-xs">
                  <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full mr-2">
                    ✓
                  </span>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Strong growth:</span> You're on track to surpass last quarter's revenue
                  </p>
                </div>
              )}
              
              {subscriptionMetrics.revenueTrend < -5 && (
                <div className="flex items-start text-xs">
                  <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full mr-2">
                    !
                  </span>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Revenue decline:</span> Consider reaching out to dormant clients
                  </p>
                </div>
              )}
              
              {forecastData.forecasts && forecastData.forecasts.length > 0 && forecastData.forecasts[0].revenue > forecastData.avgRevenue * 1.1 && (
                <div className="flex items-start text-xs">
                  <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full mr-2">
                    ↗
                  </span>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Growth opportunity:</span> Your revenue is forecast to increase next month
                  </p>
                </div>
              )}
              
              {churnRiskClients.length > 0 && (
                <div className="flex items-start text-xs">
                  <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full mr-2">
                    ↘
                  </span>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Churn risk:</span> {churnRiskClients.length} clients showing signs of churn
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
            Insufficient recurring client data for subscription analysis. Add more frequent invoices with the same clients.
          </p>
        </div>
      )}
    </div>
  );
} 