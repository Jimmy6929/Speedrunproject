import { formatCurrency } from '@/utils/dateUtils';
import ChartContainer from './ChartContainer';

interface MetricAlert {
  type: 'positive' | 'warning' | 'negative';
  title: string;
  message: string;
}

interface SubscriptionMetrics {
  monthlyRecurringRevenue: number;
  yearlyGrowthRate: number;
  churnRate: number;
  netRevenueRetention: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  alerts: MetricAlert[];
}

interface SubscriptionAnalysisProps {
  metrics: SubscriptionMetrics;
}

export default function SubscriptionAnalysis({ metrics }: SubscriptionAnalysisProps) {
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );

  // Helper to render alert icon based on type
  const renderAlertIcon = (type: 'positive' | 'warning' | 'negative') => {
    switch (type) {
      case 'positive':
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'negative':
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <ChartContainer title="Subscription Metrics" icon={icon}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">MRR</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {formatCurrency(metrics.monthlyRecurringRevenue)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {metrics.yearlyGrowthRate >= 0 ? '+' : ''}{metrics.yearlyGrowthRate.toFixed(1)}% YoY
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">CHURN RATE</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {metrics.churnRate.toFixed(1)}%
          </p>
          <p className={`text-xs ${metrics.churnRate <= 5 ? 'text-green-500' : metrics.churnRate <= 10 ? 'text-yellow-500' : 'text-red-500'} mt-1`}>
            {metrics.churnRate <= 5 ? 'Good' : metrics.churnRate <= 10 ? 'Average' : 'High'}
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">NET RETENTION</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {metrics.netRevenueRetention.toFixed(1)}%
          </p>
          <p className={`text-xs ${metrics.netRevenueRetention >= 100 ? 'text-green-500' : 'text-red-500'} mt-1`}>
            {metrics.netRevenueRetention >= 100 ? 'Growing' : 'Shrinking'}
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">LTV</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {formatCurrency(metrics.customerLifetimeValue)}
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">CAC</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {formatCurrency(metrics.customerAcquisitionCost)}
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">LTV:CAC RATIO</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">
            {(metrics.customerLifetimeValue / metrics.customerAcquisitionCost).toFixed(1)}x
          </p>
          <p className={`text-xs ${(metrics.customerLifetimeValue / metrics.customerAcquisitionCost) >= 3 ? 'text-green-500' : (metrics.customerLifetimeValue / metrics.customerAcquisitionCost) >= 1 ? 'text-yellow-500' : 'text-red-500'} mt-1`}>
            {(metrics.customerLifetimeValue / metrics.customerAcquisitionCost) >= 3 ? 'Excellent' : (metrics.customerLifetimeValue / metrics.customerAcquisitionCost) >= 1 ? 'Sustainable' : 'Unsustainable'}
          </p>
        </div>
      </div>
      
      {metrics.alerts.length > 0 && (
        <div className="space-y-3 mt-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Alerts</h3>
          {metrics.alerts.map((alert, index) => (
            <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {renderAlertIcon(alert.type)}
              <div className="ml-3">
                <h4 className={`text-sm font-semibold ${
                  alert.type === 'positive' ? 'text-green-700 dark:text-green-400' : 
                  alert.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400' : 
                  'text-red-700 dark:text-red-400'
                }`}>{alert.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartContainer>
  );
} 