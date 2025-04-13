import { formatCurrency } from '@/utils/dateUtils';

interface ClientInsight {
  name: string;
  latePayments?: number;
  invoiceCount?: number;
  lateRate?: number;
  avgPaymentTime?: number;
  consecutiveLatePayments?: number;
  isActive?: boolean;
  totalSpent?: number;
  riskScore?: number;
  hasUnpaidInvoices?: boolean;
  hasConsecutiveLatePayments?: boolean;
  hasSlowPayments?: boolean;
}

interface ClientInsightsListProps {
  title: string;
  insights: ClientInsight[];
  type: 'latePayments' | 'churnRisk' | 'mostValuable';
  emptyMessage: string;
}

export default function ClientInsightsList({
  title,
  insights,
  type,
  emptyMessage
}: ClientInsightsListProps) {
  // Limit to top 3 for display
  const visibleInsights = insights.slice(0, 3);
  
  return (
    <div className={`
      ${type === 'latePayments' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
      ${type === 'churnRisk' ? 'bg-red-50 dark:bg-red-900/20' : ''}
      ${type === 'mostValuable' ? 'bg-green-50 dark:bg-green-900/20' : ''}
      p-4 rounded-lg
    `}>
      <h3 
        className={`
          text-md font-medium mb-3
          ${type === 'latePayments' ? 'text-yellow-700 dark:text-yellow-300' : ''}
          ${type === 'churnRisk' ? 'text-red-700 dark:text-red-300' : ''}
          ${type === 'mostValuable' ? 'text-green-700 dark:text-green-300' : ''}
        `}
      >
        {title}
      </h3>
      
      {insights.length > 0 ? (
        <div className="space-y-3">
          {visibleInsights.map((client) => (
            <div key={client.name} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{client.name}</p>
                
                {type === 'latePayments' && client.lateRate !== undefined && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                    {client.lateRate.toFixed(0)}% late
                  </span>
                )}
                
                {type === 'churnRisk' && client.riskScore !== undefined && (
                  <div className="flex items-center">
                    {client.riskScore > 70 ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                    ) : client.riskScore > 40 ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                    ) : (
                      <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
                    )}
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Risk: {client.riskScore}%
                    </span>
                  </div>
                )}
                
                {type === 'mostValuable' && client.totalSpent !== undefined && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {formatCurrency(client.totalSpent)}
                  </span>
                )}
              </div>
              
              {type === 'churnRisk' && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {client.hasUnpaidInvoices && (
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Has unpaid or overdue invoices
                    </p>
                  )}
                  {client.hasConsecutiveLatePayments && (
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      Multiple consecutive late payments
                    </p>
                  )}
                  {client.hasSlowPayments && (
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Slow payment history
                    </p>
                  )}
                </div>
              )}
              
              {type === 'latePayments' && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {client.latePayments} late out of {client.invoiceCount} invoices 
                  {client.avgPaymentTime !== undefined && ` • Avg. ${client.avgPaymentTime.toFixed(1)} days to payment`}
                </div>
              )}
              
              {type === 'mostValuable' && client.invoiceCount !== undefined && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {client.invoiceCount} invoices 
                  {client.isActive ? ' • Recently active' : ''}
                </div>
              )}
            </div>
          ))}
          
          {insights.length > 3 && (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +{insights.length - 3} more clients
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div 
              className={`
                p-2 rounded-full mr-3
                ${type === 'latePayments' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                ${type === 'churnRisk' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                ${type === 'mostValuable' ? 'bg-gray-100 dark:bg-gray-900/30' : ''}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" 
                className={`
                  h-5 w-5
                  ${type === 'latePayments' ? 'text-green-600 dark:text-green-400' : ''}
                  ${type === 'churnRisk' ? 'text-green-600 dark:text-green-400' : ''}
                  ${type === 'mostValuable' ? 'text-gray-600 dark:text-gray-400' : ''}
                `}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {emptyMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 