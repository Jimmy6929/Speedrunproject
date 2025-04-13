import RevenueInsights from './RevenueInsights';
import { RevenueMonth, RevenueChange } from '@/hooks/useInvoiceAnalytics';

interface InsightsPanelProps {
  topMonths: RevenueMonth[];
  biggestRevenueSwing: RevenueChange | null;
  formatCurrency: (amount: number) => string;
}

export default function InsightsPanel({
  topMonths,
  biggestRevenueSwing,
  formatCurrency
}: InsightsPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Key Insights & Recommendations
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Insights */}
        <RevenueInsights 
          topMonths={topMonths}
          biggestRevenueSwing={biggestRevenueSwing}
          formatCurrency={formatCurrency}
        />
        
        {/* Recommended Actions */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-md font-medium text-purple-700 dark:text-purple-300 mb-3">Recommended Actions</h3>
          
          <div className="space-y-3">
            {topMonths.length > 0 && (
              <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Analyze what worked well in {topMonths[0].month}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Review marketing campaigns, client outreach, or services that performed well
                  </p>
                </div>
              </div>
            )}
            
            {biggestRevenueSwing && biggestRevenueSwing.percentChange < 0 && (
              <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Investigate revenue drop in {biggestRevenueSwing.month}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Check for seasonal factors, client churn, or market changes
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Review pricing strategy
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Consider adjusting rates based on client value and market conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}